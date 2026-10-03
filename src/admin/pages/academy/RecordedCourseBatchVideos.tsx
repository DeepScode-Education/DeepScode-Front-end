import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Trash2, PlayCircle, Loader2 } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  adminRecordedCourseApi,
  type BatchVideoRecord,
} from "@/integrations/client";
import VideoPlayerPanel from "@/components/VideoPlayerPanel";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";

const formatSize = (bytes: number) => {
  if (!bytes) return "0 MB";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const RecordedCourseBatchVideos = () => {
  const { courseId, batchId } = useParams<{ courseId: string; batchId: string }>();
  const navigate = useNavigate();

  const [videos, setVideos] = useState<BatchVideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Player state — comes entirely from the hook now ──────────────────────
  const { activeVideo, videoUrl, isLoading, playbackError, openVideo, closeVideo } = useVideoPlayer();

  const loadVideos = async () => {
    if (!courseId || !batchId) return;
    try {
      setLoading(true);
      const res = await adminRecordedCourseApi.getBatchVideos(courseId, batchId);
      setVideos((res.data ?? []) as BatchVideoRecord[]);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, batchId]);

  const handleUpload = async () => {
    if (!courseId || !batchId) return;
    const file = fileRef.current?.files?.[0];
    if (!file) return alert("Please select a video file");
    if (!uploadTitle.trim()) return alert("Please enter a title");

    try {
      setUploading(true);
      await adminRecordedCourseApi.uploadVideo(courseId, batchId, {
        title: uploadTitle.trim(),
        description: uploadDesc.trim(),
        video: file,
      });
      setUploadTitle("");
      setUploadDesc("");
      if (fileRef.current) fileRef.current.value = "";
      setShowUpload(false);
      await loadVideos();
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm("Delete this video permanently? This cannot be undone.")) return;
    try {
      setDeletingId(videoId);
      await adminRecordedCourseApi.deleteVideo(videoId);
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      if (activeVideo?.id === videoId) closeVideo();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout
      title="Batch Videos"
      subtitle="Upload, watch, or delete recorded videos for this batch."
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/academy/recorded/${courseId}`)}
            className="gap-1"
          >
            <ArrowLeft size={14} /> Back to Batches
          </Button>
          <Button size="sm" onClick={() => setShowUpload((v) => !v)} className="gap-1 text-white">
            <Upload size={14} /> Upload Video
          </Button>
        </div>
      }
    >
      {showUpload && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Upload New Video</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              placeholder="Video title"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              ref={fileRef}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Description (optional)"
              value={uploadDesc}
              onChange={(e) => setUploadDesc(e.target.value)}
              className="md:col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              rows={2}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleUpload} disabled={uploading} className="gap-1 text-white">
              {uploading && <Loader2 size={14} className="animate-spin" />}
              {uploading ? "Uploading…" : "Upload"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowUpload(false)} disabled={uploading}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ── Video player ─────────────────────────────────────────────────── */}
      {activeVideo && (
        <VideoPlayerPanel
          video={activeVideo}
          videoUrl={videoUrl}
          isLoading={isLoading}
          error={playbackError}
          onClose={closeVideo}
        />
      )}

      {loading && <div className="py-16 text-center text-sm text-muted-foreground">Loading videos…</div>}
      {error && <div className="py-16 text-center text-sm text-destructive">{error}</div>}

      {!loading && !error && (
        <div className="space-y-3">
          {videos.map((v) => (
            <div key={v.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-semibold">{v.title}</h4>
                  {v.description && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{v.description}</p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                    <span>{formatSize(v.fileSize)}</span>
                    <span>Uploaded by {v.uploadedBy ?? "Unknown"}</span>
                    <span>{new Date(v.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => (activeVideo?.id === v.id ? closeVideo() : openVideo(v))}
                  >
                    <PlayCircle size={14} />
                    {activeVideo?.id === v.id ? "Playing" : "Watch"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                    onClick={() => handleDelete(v.id)}
                    disabled={deletingId === v.id}
                  >
                    {deletingId === v.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {videos.length === 0 && (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No videos uploaded yet for this batch. Click "Upload Video" to add one.
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default RecordedCourseBatchVideos;