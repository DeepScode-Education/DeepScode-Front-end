import { useEffect, useRef, useState } from "react";

/**
 * Experimental: best-effort attempt to retrieve per-participant MediaStream
 * objects from whichever Zoom SDK is present at runtime. This supports
 * multiple possible SDK APIs (heuristic checks) and falls back to null
 * when none are available. The installed Meeting Embedded SDK often does
 * NOT expose streams — in that case this hook returns an empty map.
 */
export function useParticipantStreams(clientRef: React.MutableRefObject<any>, participantIds: number[]) {
  const [streams, setStreams] = useState<Record<number, MediaStream | null>>({});
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    const client = clientRef.current;
    if (!client) return () => {
      active.current = false;
    };

    const tryGetStream = async (userId: number): Promise<MediaStream | null> => {
      try {
        // Try several known candidate APIs across different Zoom SDKs.
        if (typeof client.getUserMediaStream === "function") {
          return await client.getUserMediaStream(userId);
        }
        if (typeof client.getRemoteStream === "function") {
          return await client.getRemoteStream(userId);
        }
        if (typeof client.getMediaStream === "function") {
          return await client.getMediaStream(userId);
        }
        // Some SDKs expose a top-level ZoomVideo object
        // @ts-ignore
        if (typeof (window as any).ZoomVideo?.getRemoteStream === "function") {
          // @ts-ignore
          return await (window as any).ZoomVideo.getRemoteStream(userId);
        }
      } catch (err) {
        // ignore and fall through
      }
      return null;
    };

    let cancelled = false;
    const load = async () => {
      const next: Record<number, MediaStream | null> = {};
      for (const id of participantIds) {
        if (cancelled) break;
        const s = await tryGetStream(id);
        next[id] = s;
        if (!cancelled) setStreams((prev) => ({ ...prev, [id]: s }));
      }
    };

    void load();

    return () => {
      cancelled = true;
      active.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientRef.current, JSON.stringify(participantIds)]);

  return streams;
}
