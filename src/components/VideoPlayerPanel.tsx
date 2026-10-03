

import { AlertTriangle, Loader2, Maximize, Minimize, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BatchVideoRecord } from "@/integrations/client";
import { getToken } from "@/integrations/client";

interface VideoPlayerPanelProps {
  video: BatchVideoRecord | null;
  videoUrl: string | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  viewerLabel?: string;
}


function decodeViewerLabel(): string {
  try {
    const token = getToken();
    if (!token) return "";
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return "";
    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    const payload = JSON.parse(json);
    return payload.email || payload.fullName || payload.name || payload.id || "";
  } catch {
    return "";
  }
}

// A handful of preset positions the watermark cycles through so it can't
// simply be cropped out of frame.
const WATERMARK_POSITIONS = [
  "top-4 left-4",
  "top-4 right-4",
  "bottom-16 left-4",
  "bottom-16 right-4",
  "top-1/2 left-4 -translate-y-1/2",
  "top-1/2 right-4 -translate-y-1/2",
];

// Cross-browser helpers so the wrapper (not the <video> element) owns
// fullscreen. Keeping fullscreen on the wrapper means the watermark
// overlay — a sibling of <video> inside that wrapper — stays on top and
// visible the whole time, instead of being left behind on the page when
// only the video element goes fullscreen.
type FullscreenableElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};
type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

function requestFullscreen(el: FullscreenableElement) {
  if (el.requestFullscreen) return el.requestFullscreen();
  if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
}

function exitFullscreen() {
  const doc = document as FullscreenDocument;
  if (document.exitFullscreen) return document.exitFullscreen();
  if (doc.webkitExitFullscreen) return doc.webkitExitFullscreen();
}

function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return document.fullscreenElement || doc.webkitFullscreenElement || null;
}


const VideoPlayerPanel = ({
  video,
  videoUrl,
  isLoading,
  error,
  onClose,
  viewerLabel,
}: VideoPlayerPanelProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => new Date());
  const [positionIndex, setPositionIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const resolvedLabel = useMemo(
    () => (viewerLabel && viewerLabel.trim()) || decodeViewerLabel(),
    [viewerLabel]
  );

  // Tick the watermark's timestamp every second while a video is open.
  useEffect(() => {
    if (!video) return;
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [video]);

  // Periodically move the watermark so it can't be cropped/blurred out
  // of a fixed spot in a recording.
  useEffect(() => {
    if (!video) return;
    const mover = window.setInterval(() => {
      setPositionIndex((i) => (i + 1) % WATERMARK_POSITIONS.length);
    }, 7000);
    return () => window.clearInterval(mover);
  }, [video]);

  // Block Ctrl+S / Cmd+S while the player is open, so "save page" can't
  // be used to grab the video. Scoped to this player's lifetime only.
  useEffect(() => {
    if (!video) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === "s") {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true } as any);
  }, [video]);

  // Keep isFullscreen in sync with the real fullscreen state (handles
  // the browser's own Esc-to-exit as well as our button).
  useEffect(() => {
    if (!video) return;
    const handleChange = () => {
      setIsFullscreen(getFullscreenElement() === wrapperRef.current);
    };
    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
    };
  }, [video]);

  const toggleFullscreen = () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (getFullscreenElement() === wrapper) {
      exitFullscreen();
    } else {
      requestFullscreen(wrapper);
    }
  };

  if (!video) return null;

  return (
    <div
      ref={wrapperRef}
      className={`overflow-hidden border-border bg-black shadow-sm ${
        isFullscreen ? "flex h-screen w-screen flex-col" : "mb-6 rounded-xl border"
      }`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-black/90 px-3 py-2 sm:px-4">
        <p className="min-w-0 truncate text-sm font-medium text-white">{video.title}</p>
        <div className="flex shrink-0 items-center gap-2">
          {!isLoading && !error && videoUrl && (
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className="rounded-lg bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Close video"
            className="rounded-lg bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/*
        16:9 responsive container in the normal state; grows to fill the
        remaining space when the outer container above is fullscreened.
        The <video> element itself never goes fullscreen — that's what
        keeps the watermark overlay (its sibling below) visible and
        correctly positioned no matter the fullscreen state.
      */}
      <div
        className={`relative w-full bg-black ${isFullscreen ? "min-h-0 flex-1" : ""}`}
        style={isFullscreen ? undefined : { paddingTop: "56.25%" }}
      >
        <div className={isFullscreen ? "relative flex h-full w-full items-center justify-center" : "absolute inset-0 flex items-center justify-center"}>
          {isLoading && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-white/80">
              <Loader2 size={24} className="animate-spin" />
              <p className="text-xs">Loading video…</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-white/80">
              <AlertTriangle size={22} className="text-destructive" />
              <p className="text-xs">{error}</p>
            </div>
          )}

          {!isLoading && !error && videoUrl && (
            <>
              <video
                key={videoUrl}
                ref={videoRef}
                src={videoUrl}
                controls
                autoPlay
                draggable={false}
                disablePictureInPicture
                disableRemotePlayback
                // controlsList is a real, widely-supported attribute that
                // TS's DOM lib doesn't type on <video> — cast is safe.
                {...({ controlsList: "nodownload noremoteplayback noplaybackrate nofullscreen" } as any)}
                onDragStart={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                className={`block select-none object-contain [-webkit-user-drag:none] [&::-webkit-media-controls-enclosure]:overflow-hidden [&::-webkit-media-controls-fullscreen-button]:hidden ${
                  isFullscreen ? "h-full w-full" : "h-full w-full max-h-[70vh]"
                }`}
                style={{ WebkitUserSelect: "none" }}
              />

              {/* Watermark overlay — click-through so it never blocks controls */}
              <div
                className={`pointer-events-none absolute ${WATERMARK_POSITIONS[positionIndex]} select-none rounded-md bg-black/40 px-2.5 py-1 text-[11px] font-medium leading-tight text-white/80 backdrop-blur-sm transition-all duration-700`}
              >
                {resolvedLabel && <div className="max-w-[220px] truncate">{resolvedLabel}</div>}
                {/* <div className="tabular-nums text-white/70">
                  {now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}{" "}
                  {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div> */}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPanel;