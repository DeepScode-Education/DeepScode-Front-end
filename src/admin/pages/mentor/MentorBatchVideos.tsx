import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MentorLayout from "../../components/MentorLayout";
import VideoPlayerPanel from "@/components/VideoPlayerPanel";
import { Button } from "@/components/ui/button";
import {
  mentorVideoApi,
  type BatchVideoRecord,
} from "@/integrations/client";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { ArrowLeft, Upload, Play, Trash2, Video as VideoIcon } from "lucide-react";

const MentorBatchVideos = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [videos, setVideos] = useState<BatchVideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { activeVideo, videoUrl, isLoading, playbackError, openVideo, closeVideo } = useVideoPlayer();

  const fetchVideos = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await mentorVideoApi.getForBatch(id);
      if (res.success) setVideos(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load videos.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleUpload = async () => {
    if (!id) return;
    if (!title.trim()) {
      setUploadError("Title is required.");
      return;
    }
    if (!file) {
      setUploadError("Please select a video file.");
      return;
    }
    try {
      setUploading(true);
      setUploadError(null);
      await mentorVideoApi.upload(id, { title: title.trim(), description: description.trim(), video: file });
      setTitle("");
      setDescription("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchVideos();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm("Delete this video permanently? This cannot be undone.")) return;
    try {
      setDeletingId(videoId);
      await mentorVideoApi.remove(videoId);
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      if (activeVideo?.id === videoId) closeVideo();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not delete video.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <MentorLayout
      title="Batch Videos"
      subtitle="Upload and manage recorded sessions for this batch"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/mentor/batches/${id}`)}
          className="h-8 px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm"
        >
          <ArrowLeft size={13} className="mr-1 shrink-0 sm:mr-1.5" />
          Back to Batch
        </Button>
      }
    >
      {/* Upload form */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4 sm:p-5">
        <p className="mb-3 text-sm font-semibold">Upload a new video</p>

        {uploadError && (
          <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
            {uploadError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="flex-1 text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold"
          />
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-[#0037FF] text-white hover:bg-[#0037FF]/90 sm:w-auto"
          >
            <Upload size={14} className="mr-1.5" />
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </div>

      {/* Player */}
      <VideoPlayerPanel
        video={activeVideo}
        videoUrl={videoUrl}
        isLoading={isLoading}
        error={playbackError}
        onClose={closeVideo}
      />

      {/* List */}
      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading videos…</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-destructive">{error}</div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
            <VideoIcon size={28} className="text-muted-foreground/50" />
            No videos uploaded yet for this batch.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {videos.map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{v.title}</p>
                  {v.description && (
                    <p className="truncate text-xs text-muted-foreground">{v.description}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(v.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    {v.uploadedBy ? ` · ${v.uploadedBy}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openVideo(v)}
                  >
                    <Play size={13} className="mr-1" />
                    Play
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(v.id)}
                    disabled={deletingId === v.id}
                  >
                    <Trash2 size={13} className="mr-1" />
                    {deletingId === v.id ? "…" : "Delete"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MentorLayout>
  );
};

export default MentorBatchVideos;