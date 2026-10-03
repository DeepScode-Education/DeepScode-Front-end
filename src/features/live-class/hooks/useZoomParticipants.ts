/**
 * src/features/live-class/hooks/useZoomParticipants.ts
 *
 * Single source of truth for "who is in the meeting right now".
 * Never hand-write participant data — everything here comes from the
 * Zoom Embedded SDK client passed in (via ZoomMeetingRoom's _clientRef).
 *
 * FIX (verified against the installed @zoom/meetingsdk embedded.d.ts,
 * v6.2.0): the EmbeddedClient namespace does NOT expose
 * `getCurrentUserInfo()` — that method does not exist on this SDK build.
 * The real, documented method is `getCurrentUser(): Participant | null`.
 * Using the wrong name meant `selfIdRef` was never set, so `isSelf` was
 * always false and the local user was never correctly flagged as "You".
 *
 * Also switched to the SDK's current (non-deprecated) Participant fields
 * — `userName`/`video` — falling back to the deprecated `displayName`/
 * `bVideoOn` only if the current ones are absent, since some server
 * responses may still be on an older shape.
 *
 * FIX #2 (this pass): `user-added` / `user-removed` / `user-updated` /
 * `active-speaker` do NOT fire just because someone starts/stops their
 * camera or joins/mutes audio — those are signalled via their own
 * dedicated SDK events (`active-video-change`, `current-audio-change`,
 * `user-audio-status-change`). Without listening to them here,
 * `participants[].videoOn` / `.muted` went stale the instant anyone
 * toggled video or audio, which is why MainStage (which derives
 * `activePresenter` from `host?.videoOn`) kept showing the "waiting on
 * teacher" placeholder even after `client.startVideo()` had already
 * succeeded on the SDK side. Now we also refresh() on those events.
 *
 * Usage:
 *   const { participants, activeSpeakerId } = useZoomParticipants(clientRef);
 */
import { useCallback, useEffect, useRef, useState } from "react";

export interface ZoomParticipant {
  userId: number;
  displayName: string;
  isHost: boolean;
  isCoHost: boolean;
  muted: boolean;
  videoOn: boolean;
  handRaised: boolean;
  isSelf: boolean;
}

// The Embedded SDK's attendee shape (Participant, per embedded.d.ts) —
// isolate the loosely-typed bits here rather than letting `any` leak
// into the rest of the app.
type RawZoomAttendee = {
  userId: number;
  userName?: string;
  /** @deprecated in SDK v4.0.0, use `userName` — kept as fallback only. */
  displayName?: string;
  isHost?: boolean;
  isCoHost?: boolean;
  muted?: boolean;
  video?: boolean;
  /** @deprecated in SDK v4.0.0, use `video` — kept as fallback only. */
  bVideoOn?: boolean;
  bRaiseHand?: boolean;
};

const normalize = (raw: RawZoomAttendee, selfId: number | null): ZoomParticipant => ({
  userId: raw.userId,
  displayName: raw.userName || raw.displayName || `Participant ${raw.userId}`,
  isHost: !!raw.isHost,
  isCoHost: !!raw.isCoHost,
  muted: !!raw.muted,
  videoOn: raw.video ?? raw.bVideoOn ?? false,
  handRaised: !!raw.bRaiseHand,
  isSelf: selfId != null && raw.userId === selfId,
});

export function useZoomParticipants(clientRef: React.MutableRefObject<any>) {
  const [participants, setParticipants] = useState<ZoomParticipant[]>([]);
  const [activeSpeakerId, setActiveSpeakerId] = useState<number | null>(null);
  const selfIdRef = useRef<number | null>(null);

  const refresh = useCallback(() => {
    const client = clientRef.current;
    if (!client) return;
    try {
      // getCurrentUser() is synchronous and returns Participant | null —
      // NOT getCurrentUserInfo(), which does not exist on this client.
      const me = client.getCurrentUser?.();
      if (me?.userId != null) selfIdRef.current = me.userId;
      const list: RawZoomAttendee[] = client.getAttendeeslist?.() ?? [];
      setParticipants(list.map((a) => normalize(a, selfIdRef.current)));
    } catch {
      // Client not ready yet — next event will retry.
    }
  }, [clientRef]);

  useEffect(() => {
    const client = clientRef.current;
    if (!client) return;

    refresh();

    const onUserChange = () => refresh();
    const onActiveSpeaker = (payload: Array<{ userId: number }> | { userId: number }) => {
      const first = Array.isArray(payload) ? payload[0] : payload;
      setActiveSpeakerId(first?.userId ?? null);
    };

    // NEW — see FIX #2 in the file header comment. Camera and audio
    // toggles need their own listeners; they are not covered by
    // user-added/removed/updated or active-speaker.
    const onVideoChange = () => refresh();
    const onAudioChange = () => refresh();

    client.on("user-added", onUserChange);
    client.on("user-removed", onUserChange);
    client.on("user-updated", onUserChange);
    client.on("active-speaker", onActiveSpeaker);
    client.on("active-video-change", onVideoChange);
    client.on("current-audio-change", onAudioChange);
    client.on("user-audio-status-change", onAudioChange);

    return () => {
      client.off?.("user-added", onUserChange);
      client.off?.("user-removed", onUserChange);
      client.off?.("user-updated", onUserChange);
      client.off?.("active-speaker", onActiveSpeaker);
      client.off?.("active-video-change", onVideoChange);
      client.off?.("current-audio-change", onAudioChange);
      client.off?.("user-audio-status-change", onAudioChange);
    };
    // Re-run when the underlying client instance changes (join/rejoin).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientRef.current]);

  return { participants, activeSpeakerId, refresh };
}