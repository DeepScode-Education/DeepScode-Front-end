import { useRef } from "react";
import MentorLayout from "@/admin/components/MentorLayout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../components/LiveClassBadges";
import {
  useCurrentLiveClass,
  useUpcomingLiveClasses,
  useEndClass,
} from "../hooks/useLiveClass";
import { extractJoinClassData, liveClassApi } from "../api/liveClass.api";
import { BATCH_DAY_LABELS, BATCH_TIME_LABELS } from "../utils/liveClassLabels";
import { useLiveClass } from "@/contexts/LiveClassContext";
import { useAuth } from "@/contexts/AuthContext";
import { Video, Radio, PhoneOff, Maximize2 } from "lucide-react";

// ─── Component ────────────────────────────────────────────────────────────────

const MentorLiveClassPage = () => {
  const { user } = useAuth();
  const { current, loading: loadingCurrent, refresh: refreshCurrent } =
    useCurrentLiveClass();
  const { upcoming, loading: loadingUpcoming, refresh: refreshUpcoming } =
    useUpcomingLiveClasses();
  const { endClass, ending } = useEndClass();

  // ── Global live class context (replaces local joinInfo / inMeeting) ─────────
  const liveClass = useLiveClass();
  const isInMeeting =
    liveClass.session !== null && liveClass.session.role === "mentor";

  // ── Guards against double-firing on fast double-clicks. These protect the
  // single network call in each handler; the context itself also guards
  // startSession() against duplicate session starts as a second layer. ──────
  const joinInFlightRef = useRef(false);
  const endInFlightRef = useRef(false);

  // ── Join / Rejoin ────────────────────────────────────────────────────────────

  const handleStartOrRejoin = async (liveClassId: string) => {
    // Already in this meeting — nothing to do (PersistentZoomRoom is showing)
    if (liveClass.session?.liveClassId === liveClassId) return;

    // Guard against a fast double-click firing this handler twice before
    // liveClass.isJoining has re-rendered the disabled button state.
    if (joinInFlightRef.current || liveClass.isJoining) return;
    joinInFlightRef.current = true;

    try {
      const res = await liveClassApi.joinClass(liveClassId);
      const joinData = extractJoinClassData(res);
      const token = joinData.token;
      const livekitUrl = joinData.livekitUrl || import.meta.env.VITE_LIVEKIT_URL;
      const roomName = joinData.roomName;

      if (!token || typeof token !== "string") {
        throw new Error("Invalid LiveKit token received from backend");
      }
      if (!livekitUrl) {
        throw new Error("LiveKit URL is missing");
      }
      if (!roomName) {
        throw new Error("LiveKit room name is missing");
      }

      liveClass.startSession({
        joinInfo: { ...joinData, token, livekitUrl, roomName },
        liveClassId,
        role: "mentor",
        userName: user?.fullName || "Mentor",
        title: current?.title,
      });
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Could not join the meeting."
      );
    } finally {
      joinInFlightRef.current = false;
    }
  };

  // ── End class ────────────────────────────────────────────────────────────────

  // const handleEnd = async () => {
  //   const liveClassId =
  //     liveClass.session?.liveClassId ?? current?._id;
  //   if (!liveClassId) return;
  //   if (endInFlightRef.current) return;
  //   if (!confirm("End this live class for all students?")) return;

  //   endInFlightRef.current = true;
  //   try {
  //     // 1. Tell backend to mark the class as ended
  //     await endClass(liveClassId);
  //     // 2. Leave Zoom + clear context state. The liveClass context handles
  //     //    any session cleanup internally.
  //     await liveClass.endSession();
  //     refreshCurrent();
  //     refreshUpcoming();
  //   } catch (err) {
  //     alert(
  //       err instanceof Error ? err.message : "Could not end the class."
  //     );
  //   } finally {
  //     endInFlightRef.current = false;
  //   }
  // };


  const handleEnd = async () => {
    const liveClassId = liveClass.session?.liveClassId ?? current?._id;
    if (!liveClassId || endInFlightRef.current) return;
    if (!confirm("End this live class for all students?")) return;

    endInFlightRef.current = true;
    try {
      // End the backend class first so meeting-ended is broadcast to students.
      await endClass(liveClassId);
      await liveClass.endSession();
      await Promise.all([refreshCurrent(), refreshUpcoming()]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not end the class.");
    } finally {
      endInFlightRef.current = false;
    }
  };
  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <MentorLayout
      title="Live Classroom"
      subtitle="Start, rejoin, or review your scheduled sessions"
    >
      {/* Active session banner — visible while a meeting is running */}
      {isInMeeting && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Live class is active — session continues even if you navigate away.
          </div>
          <div className="flex items-center gap-2">
            {liveClass.minimized && (
              <Button variant="outline" size="sm" onClick={liveClass.restoreClassroom}>
                <Maximize2 size={14} className="mr-1.5" />
                Return to Classroom
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={handleEnd} disabled={ending}>
              <PhoneOff size={14} className="mr-1.5" />
              {ending ? "Ending…" : "End Class for Everyone"}
            </Button>
          </div>
        </div>
      )}

      {/* Current session card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Current Session</h3>
          {current && <StatusBadge status={current.status} />}
        </div>

        {loadingCurrent ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Checking for an active session…
          </p>
        ) : current ? (
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{current.title}</p>
              <p className="text-xs text-muted-foreground">
                {BATCH_DAY_LABELS[current.batch.days]} ·{" "}
                {BATCH_TIME_LABELS[current.batch.time]}
              </p>
            </div>

            {isInMeeting ? (
              /* Already joined — show End button inline */
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEnd}
                disabled={ending}
              >
                <PhoneOff size={14} className="mr-1.5" />
                {ending ? "Ending…" : "End Class"}
              </Button>
            ) : (
              /* Not yet joined — show Rejoin */
              <Button
                onClick={() => handleStartOrRejoin(current._id)}
                disabled={liveClass.isJoining}
                className="bg-[#0037FF] hover:bg-[#0037FF]/90"
              >
                <Radio size={14} className="mr-1.5" />
                {liveClass.isJoining ? "Connecting…" : "Rejoin"}
              </Button>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No class is currently live for your batches.
          </p>
        )}
      </div>

      {/* Upcoming classes */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold">Upcoming Classes</h3>
        {loadingUpcoming ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        ) : upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No upcoming sessions scheduled.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {upcoming.map((lc) => (
              <div
                key={lc._id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium">{lc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {BATCH_DAY_LABELS[lc.batch.days]} ·{" "}
                    {BATCH_TIME_LABELS[lc.batch.time]}
                  </p>
                </div>
                <Video size={16} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </div>
    </MentorLayout>
  );
};

export default MentorLiveClassPage;