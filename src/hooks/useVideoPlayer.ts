// import { useCallback, useEffect, useRef, useState } from "react";
// import { BASE_URL, getToken, type BatchVideoRecord } from "@/integrations/client";

// export interface UseVideoPlayerResult {
//   /** The video record currently open in the player (null when the player is closed). */
//   activeVideo: BatchVideoRecord | null;
//   /** Object URL for the fetched video blob, ready to hand to a <video> element. */
//   videoUrl: string | null;
//   /** True while the video stream is being fetched. */
//   isLoading: boolean;
//   /** Human-readable error message if the stream could not be loaded. */
//   playbackError: string | null;
//   /** Convenience flag: is the player panel open at all. */
//   isOpen: boolean;
//   /** Open the player for a given video and start fetching its stream. */
//   openVideo: (video: BatchVideoRecord) => void;
//   /** Close the player and release any in-memory resources. */
//   closeVideo: () => void;
// }

// /**
//  * Reusable hook for playing protected batch/course videos on both the
//  * mentor and student sides of the app.
//  *
//  * The video stream endpoint is authenticated, so a plain
//  * `<video src={streamUrl} />` can't be relied on to carry credentials.
//  * Instead, this hook fetches the stream with the user's bearer token
//  * attached as an `Authorization` header, turns the response into a blob,
//  * and exposes a `blob:` object URL for playback. This keeps the auth
//  * token out of the URL entirely (no `?token=...` query string) and lets
//  * us surface real HTTP errors (401/403/404/etc.) as friendly UI states.
//  *
//  * Does not touch the backend, upload flow, or existing video APIs —
//  * it only changes how the already-issued stream URL is fetched on the
//  * client before being handed to the <video> element.
//  */
// export function useVideoPlayer(): UseVideoPlayerResult {
//   const [activeVideo, setActiveVideo] = useState<BatchVideoRecord | null>(null);
//   const [videoUrl, setVideoUrl] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [playbackError, setPlaybackError] = useState<string | null>(null);

//   const objectUrlRef = useRef<string | null>(null);
//   const requestIdRef = useRef(0);

//   const revokeCurrentUrl = useCallback(() => {
//     if (objectUrlRef.current) {
//       URL.revokeObjectURL(objectUrlRef.current);
//       objectUrlRef.current = null;
//     }
//   }, []);

//   const closeVideo = useCallback(() => {
//     // Invalidate any in-flight fetch so a late response can't reopen the player.
//     requestIdRef.current += 1;
//     revokeCurrentUrl();
//     setVideoUrl(null);
//     setActiveVideo(null);
//     setIsLoading(false);
//     setPlaybackError(null);
//   }, [revokeCurrentUrl]);

//   const openVideo = useCallback(
//     (video: BatchVideoRecord) => {
//       const requestId = ++requestIdRef.current;
//       revokeCurrentUrl();
//       setActiveVideo(video);
//       setVideoUrl(null);
//       setPlaybackError(null);
//       setIsLoading(true);

//       const token = getToken();
//       const streamPath = video.streamUrl.startsWith("http")
//         ? video.streamUrl
//         : `${BASE_URL}${video.streamUrl}`;

//       fetch(streamPath, {
//         headers: token ? { Authorization: `Bearer ${token}` } : undefined,
//       })
//         .then(async (res) => {
//           if (!res.ok) {
//             const message =
//               res.status === 401 || res.status === 403
//                 ? "You're not authorized to view this video."
//                 : "This video couldn't be loaded. Please try again.";
//             throw new Error(message);
//           }
//           return res.blob();
//         })
//         .then((blob) => {
//           if (requestIdRef.current !== requestId) return; // stale response — ignore
//           const objectUrl = URL.createObjectURL(blob);
//           objectUrlRef.current = objectUrl;
//           setVideoUrl(objectUrl);
//           setIsLoading(false);
//         })
//         .catch((err) => {
//           if (requestIdRef.current !== requestId) return; // stale response — ignore
//           setPlaybackError(
//             err instanceof Error ? err.message : "This video couldn't be loaded. Please try again."
//           );
//           setIsLoading(false);
//         });
//     },
//     [revokeCurrentUrl]
//   );

//   // Release the object URL if the component using this hook unmounts
//   // while a video is open.
//   useEffect(() => {
//     return () => {
//       revokeCurrentUrl();
//     };
//   }, [revokeCurrentUrl]);

//   return {
//     activeVideo,
//     videoUrl,
//     isLoading,
//     playbackError,
//     isOpen: activeVideo !== null,
//     openVideo,
//     closeVideo,
//   };
// }







import { useCallback, useEffect, useRef, useState } from "react";
import { BASE_URL, getToken, getAdminToken, type BatchVideoRecord } from "@/integrations/client";

export interface UseVideoPlayerResult {
  /** The video record currently open in the player (null when the player is closed). */
  activeVideo: BatchVideoRecord | null;
  /** Object URL for the fetched video blob, ready to hand to a <video> element. */
  videoUrl: string | null;
  /** True while the video stream is being fetched. */
  isLoading: boolean;
  /** Human-readable error message if the stream could not be loaded. */
  playbackError: string | null;
  /** Convenience flag: is the player panel open at all. */
  isOpen: boolean;
  /** Open the player for a given video and start fetching its stream. */
  openVideo: (video: BatchVideoRecord) => void;
  /** Close the player and release any in-memory resources. */
  closeVideo: () => void;
}

/**
 * Reusable hook for playing protected batch/course videos on the
 * mentor, student, AND admin sides of the app.
 *
 * The video stream endpoint is authenticated, so a plain
 * `<video src={streamUrl} />` can't be relied on to carry credentials.
 * Instead, this hook fetches the stream with the user's bearer token
 * attached as an `Authorization` header, turns the response into a blob,
 * and exposes a `blob:` object URL for playback. This keeps the auth
 * token out of the URL entirely (no `?token=...` query string) and lets
 * us surface real HTTP errors (401/403/404/etc.) as friendly UI states.
 *
 * Does not touch the backend, upload flow, or existing video APIs —
 * it only changes how the already-issued stream URL is fetched on the
 * client before being handed to the <video> element.
 */
export function useVideoPlayer(): UseVideoPlayerResult {
  const [activeVideo, setActiveVideo] = useState<BatchVideoRecord | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const objectUrlRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  const revokeCurrentUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const closeVideo = useCallback(() => {
    // Invalidate any in-flight fetch so a late response can't reopen the player.
    requestIdRef.current += 1;
    revokeCurrentUrl();
    setVideoUrl(null);
    setActiveVideo(null);
    setIsLoading(false);
    setPlaybackError(null);
  }, [revokeCurrentUrl]);

  const openVideo = useCallback(
    (video: BatchVideoRecord) => {
      const requestId = ++requestIdRef.current;
      revokeCurrentUrl();
      setActiveVideo(video);
      setVideoUrl(null);
      setPlaybackError(null);
      setIsLoading(true);

      // FIX: admin accounts store their JWT under a separate "adminToken"
      // localStorage key (see setAdminToken/getAdminToken in client.ts).
      // getToken() alone only resolves the regular student/mentor token,
      // so admin requests went out with NO Authorization header and
      // silently 401'd. Every other admin API call in client.ts already
      // uses this exact fallback order — this brings the hook in line.
      const token = getAdminToken() ?? getToken();

      const streamPath = video.streamUrl.startsWith("http")
        ? video.streamUrl
        : `${BASE_URL}${video.streamUrl}`;

      fetch(streamPath, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
        .then(async (res) => {
          if (!res.ok) {
            const message =
              res.status === 401 || res.status === 403
                ? "You're not authorized to view this video."
                : "This video couldn't be loaded. Please try again.";
            throw new Error(message);
          }
          return res.blob();
        })
        .then((blob) => {
          if (requestIdRef.current !== requestId) return; // stale response — ignore
          const objectUrl = URL.createObjectURL(blob);
          objectUrlRef.current = objectUrl;
          setVideoUrl(objectUrl);
          setIsLoading(false);
        })
        .catch((err) => {
          if (requestIdRef.current !== requestId) return; // stale response — ignore
          setPlaybackError(
            err instanceof Error ? err.message : "This video couldn't be loaded. Please try again."
          );
          setIsLoading(false);
        });
    },
    [revokeCurrentUrl]
  );

  // Release the object URL if the component using this hook unmounts
  // while a video is open.
  useEffect(() => {
    return () => {
      revokeCurrentUrl();
    };
  }, [revokeCurrentUrl]);

  return {
    activeVideo,
    videoUrl,
    isLoading,
    playbackError,
    isOpen: activeVideo !== null,
    openVideo,
    closeVideo,
  };
}