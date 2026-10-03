import { useEffect, useRef } from "react";
import { liveClassApi } from "../api/liveClass.api";

const HEARTBEAT_INTERVAL_MS = 30_000;

/**
 * Student-side: pings attendance every 30s while inside a live class.
 * Handles reconnects naturally — a gap in heartbeats is detected server-side
 * (attendance.service.js reconnectCount logic).
 */
export function useAttendanceHeartbeat(liveClassId: string | null, isActive: boolean) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!liveClassId || !isActive) return;

    const ping = () => liveClassApi.attendanceHeartbeat(liveClassId).catch(() => {});
    ping();
    intervalRef.current = setInterval(ping, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [liveClassId, isActive]);
}

/**
 * Mentor-side: pings host-heartbeat every 60s while hosting, so the
 * backend auto-end job never mistakes an active session for a stale one.
 */
export function useMentorHeartbeat(liveClassId: string | null, isHosting: boolean) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!liveClassId || !isHosting) return;

    const ping = () => liveClassApi.hostHeartbeat(liveClassId).catch(() => {});
    ping();
    intervalRef.current = setInterval(ping, 60_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [liveClassId, isHosting]);
}