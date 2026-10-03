import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { ConnectionState, DisconnectReason, Room, RoomEvent } from "livekit-client";
import { LiveClassShell } from "@/features/live-class/components/LiveClassShell";
import { useAttendanceHeartbeat, useMentorHeartbeat } from "@/features/live-class/hooks/useAttendanceHeartbeat";
import { useLiveClassSocket } from "@/features/live-class/hooks/useLiveClassSocket";
import { liveClassApi } from "@/features/live-class/api/liveClass.api";
import type { JoinClassPayload } from "@/features/live-class/types/liveClass.types";

export type LiveRole = "mentor" | "student";

export interface ActiveSession {
  joinInfo: JoinClassPayload;
  liveClassId: string;
  role: LiveRole;
  userName: string;
  title?: string;
}

interface LiveClassContextValue {
  session: ActiveSession | null;
  minimized: boolean;
  isJoining: boolean;
  joinError: string | null;
  connectionState: ConnectionState;
  roomRef: MutableRefObject<Room | null>;
  startSession: (session: ActiveSession) => void;
  endSession: () => Promise<void>;
  restoreClassroom: () => void;
}

const LiveClassContext = createContext<LiveClassContextValue | null>(null);

export const LiveClassProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);

  // ONE Room per active session. It is created in startSession and destroyed
  // only in teardownRoom (Leave / End Class / permanent disconnect / join failure).
  const roomRef = useRef<Room | null>(null);
  const sessionRef = useRef<ActiveSession | null>(null);
  const endingRef = useRef(false);

  const ensureRoom = useCallback(() => {
    if (!roomRef.current) {
      roomRef.current = new Room({ adaptiveStream: true, dynacast: true });
    }
    return roomRef.current;
  }, []);

  // Detaches the ref synchronously (so a new session can never reuse a dying
  // room), removes listeners, then disconnects and stops all local tracks.
  const teardownRoom = useCallback(async () => {
    const room = roomRef.current;
    roomRef.current = null;
    if (!room) return;
    room.removeAllListeners();
    try {
      await room.disconnect(true);
    } catch (error) {
      console.warn("LiveKit disconnect failed:", error);
    }
  }, []);

  const endSession = useCallback(async () => {
    if (endingRef.current) return;
    if (!sessionRef.current && !roomRef.current) return; // already cleaned up
    endingRef.current = true;

    try {
      await teardownRoom();
    } finally {
      sessionRef.current = null;
      setSession(null);
      setMinimized(false);
      setIsJoining(false);
      setJoinError(null);
      setConnectionState(ConnectionState.Disconnected);
      window.dispatchEvent(new Event("slate-live-class-ended"));
      endingRef.current = false;
    }
  }, [teardownRoom]);

  const activeLiveClassId = session?.liveClassId ?? null;
  useAttendanceHeartbeat(activeLiveClassId, session?.role === "student");
  useMentorHeartbeat(activeLiveClassId, session?.role === "mentor");
  useLiveClassSocket(activeLiveClassId, {
    onMeetingEnded: (data) => {
      if (String(data.liveClassId) === sessionRef.current?.liveClassId) {
        void endSession();
      }
    },
  });

  // ── LiveKit connection lifecycle ───────────────────────────────────────────
  // Connecting → Connected → (SignalReconnecting | Reconnecting → Reconnected)* → Disconnected.
  // Reconnecting is TEMPORARY: it only updates connectionState. The session is
  // cleared only on a real, permanent Disconnected event.
  useEffect(() => {
    if (!activeLiveClassId) return;
    const room = roomRef.current;
    if (!room) return;

    const onStateChanged = (state: ConnectionState) => setConnectionState(state);

    const onConnected = () => {
      setIsJoining(false);
      setJoinError(null);
      room.startAudio().catch(() => {});
    };

    const onReconnected = () => {
      setConnectionState(ConnectionState.Connected);
      room.startAudio().catch(() => {});
    };

    const onDisconnected = (reason?: DisconnectReason) => {
      console.warn(
        "[live-class] LiveKit disconnected:",
        reason !== undefined ? DisconnectReason[reason] : "unknown",
      );
      // Our own teardown removes listeners first, so this only fires for
      // server-side / permanent disconnects (room deleted, removed, reconnect
      // attempts exhausted, duplicate identity, ...).
      if (endingRef.current || roomRef.current !== room) return;
      const classEnded = reason === DisconnectReason.ROOM_DELETED;
      void endSession().then(() => {
        if (!classEnded) setJoinError("You were disconnected from the live class.");
      });
    };

    room.on(RoomEvent.ConnectionStateChanged, onStateChanged);
    room.on(RoomEvent.Connected, onConnected);
    room.on(RoomEvent.Reconnected, onReconnected);
    room.on(RoomEvent.Disconnected, onDisconnected);

    setConnectionState(room.state);
    if (room.state === ConnectionState.Connected) setIsJoining(false);

    return () => {
      room.off(RoomEvent.ConnectionStateChanged, onStateChanged);
      room.off(RoomEvent.Connected, onConnected);
      room.off(RoomEvent.Reconnected, onReconnected);
      room.off(RoomEvent.Disconnected, onDisconnected);
    };
  }, [activeLiveClassId, endSession]);

  const startSession = useCallback(
    (next: ActiveSession) => {
      const current = sessionRef.current;
      if (current) {
        if (current.liveClassId === next.liveClassId) return;
        void teardownRoom(); // switching classes — drop the old room first
      }
      ensureRoom();
      sessionRef.current = next;
      setSession(next);
      setMinimized(false);
      setJoinError(null);
      setIsJoining(true);
      setConnectionState(ConnectionState.Connecting);
    },
    [ensureRoom, teardownRoom],
  );

  const restoreClassroom = useCallback(() => setMinimized(false), []);
  const minimizeClassroom = useCallback(() => setMinimized(true), []);

  // Student: Leave only disconnects locally — it never ends the class.
  // Mentor: End Class → backend marks "ended" (+ closes the LiveKit room and
  // broadcasts meeting-ended) → then disconnect locally.
  const leaveOrEndSession = useCallback(async () => {
    const active = sessionRef.current;
    if (!active) return;

    if (active.role === "mentor") {
      try {
        const response = await liveClassApi.endClass(active.liveClassId);
        if (!response.success) throw new Error(response.message || "Failed to end class");
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        // Already ended (e.g. by the auto-end job) — just leave locally.
        if (!/not currently live|not found/i.test(message)) throw error;
      }
    }

    await endSession();
  }, [endSession]);

  // Join failure: fully release the room (mic/camera/socket) before clearing.
  const handleJoinError = useCallback(
    (message: string) => {
      void (async () => {
        await teardownRoom();
        sessionRef.current = null;
        setSession(null);
        setMinimized(false);
        setIsJoining(false);
        setConnectionState(ConnectionState.Disconnected);
        setJoinError(message);
      })();
    },
    [teardownRoom],
  );

  return (
    <LiveClassContext.Provider
      value={{
        session,
        minimized,
        isJoining,
        joinError,
        connectionState,
        roomRef,
        startSession,
        endSession,
        restoreClassroom,
      }}
    >
      {children}

      {session && (
        <LiveClassShell
          key={session.liveClassId}
          role={session.role}
          title={session.title || "Live Class"}
          onLeaveOrEnd={leaveOrEndSession}
          minimizedToDashboard={minimized}
          onMinimizeToDashboard={minimizeClassroom}
          onRestoreFromDashboard={restoreClassroom}
          session={session}
          onError={handleJoinError}
        />
      )}

      {/* Join/disconnect failures used to be silent; surface the exact reason. */}
      {!session && joinError && (
        <div
          role="alert"
          className="fixed bottom-4 right-4 z-[10050] flex max-w-md items-start gap-3 rounded-lg bg-red-600 px-4 py-3 text-sm text-white shadow-lg"
        >
          <span className="flex-1 break-words">{joinError}</span>
          <button type="button" onClick={() => setJoinError(null)} className="font-semibold">
            ✕
          </button>
        </div>
      )}

      {/* Minimize only hides the UI; the Room, mic, camera and share keep running. */}
      {session && minimized && (
        <button
          type="button"
          onClick={restoreClassroom}
          className="fixed bottom-4 right-4 z-[10050] flex items-center gap-2 rounded-full bg-[#0037FF] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/30 transition-transform hover:scale-[1.03] active:scale-95"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" aria-hidden />
          Live class in progress — Return to Classroom
        </button>
      )}
    </LiveClassContext.Provider>
  );
};

export const useLiveClass = (): LiveClassContextValue => {
  const ctx = useContext(LiveClassContext);
  if (!ctx) {
    throw new Error("useLiveClass must be used inside <LiveClassProvider>");
  }
  return ctx;
};