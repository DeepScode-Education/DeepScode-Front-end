
import { useEffect, useState, useCallback } from "react";
import StudentLayout from "../components/StudentLayout";
import VideoPlayerPanel from "@/components/VideoPlayerPanel";
import { studentVideoApi, type BatchVideoRecord } from "@/integrations/client";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { Play, Video as VideoIcon } from "lucide-react";

const StudentVideos = () => {
  const [videos, setVideos] = useState<BatchVideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { activeVideo, videoUrl, isLoading, playbackError, openVideo, closeVideo } = useVideoPlayer();

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentVideoApi.getMine();
      if (res.success) setVideos(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load videos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return (
    <StudentLayout title="Course Videos" subtitle="Recorded sessions for your batch">
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
            No videos have been uploaded for your batch yet.
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
                    {new Date(v.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    {v.uploadedBy ? ` · ${v.uploadedBy}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => openVideo(v)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  <Play size={13} />
                  Play
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentVideos;