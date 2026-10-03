import StudentLayout from "@/pages/student/components/StudentLayout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../components/LiveClassBadges";
import {
  useCurrentLiveClass,
  useUpcomingLiveClasses,
  useLiveClassHistory,
} from "../hooks/useLiveClass";
import { extractJoinClassData, liveClassApi } from "../api/liveClass.api";
import { BATCH_DAY_LABELS, BATCH_TIME_LABELS } from "../utils/liveClassLabels";
import { useLiveClass } from "@/contexts/LiveClassContext";
import { useAuth } from "@/contexts/AuthContext";
import { Video, History, PhoneOff, Maximize2 } from "lucide-react";

// ─── Component ────────────────────────────────────────────────────────────────

const StudentLiveClassPage = () => {
  const { user } = useAuth();
  const { current, loading: loadingCurrent, refresh: refreshCurrent } =
    useCurrentLiveClass();
  const { upcoming, loading: loadingUpcoming } = useUpcomingLiveClasses();
  const { history, loading: loadingHistory } = useLiveClassHistory();

  // Global live class context
  const liveClass = useLiveClass();
  const isInMeeting =
    liveClass.session !== null && liveClass.session.role === "student";

  // ── Join ────────────────────────────────────────────────────────────────────

  const handleJoin = async () => {
    if (!current) return;
    const studentName = [user?.fullName, user?.displayName, user?.name]
      .find((name): name is string => typeof name === "string" && name.trim().length > 0)
      ?.trim();

    // This value is the name Zoom publishes to every attendee. Do not send
    // a role label, or mentors would see multiple generic "Student" entries.
    if (!studentName) {
      alert("Your profile name is unavailable. Please refresh and try again.");
      return;
    }
    try {
      const res = await liveClassApi.joinClass(current._id);
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
        liveClassId: current._id,
        role: "student",
        userName: studentName,
        title: current.title,
      });
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Could not join the class."
      );
    }
  };

  // ── Leave ───────────────────────────────────────────────────────────────────
  // endSession() in LiveClassContext calls leaveMeeting() and clears state.

  const handleLeave = async () => {
    await liveClass.endSession();
    refreshCurrent();
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <StudentLayout title="Live Classroom" subtitle="Join your scheduled sessions">
      {/* Active session banner — visible on any page while in a meeting */}
      {isInMeeting && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            You are in a live class. The session continues while you browse.
          </div>
          <div className="flex items-center gap-2">
            {liveClass.minimized && (
              <Button variant="outline" size="sm" onClick={liveClass.restoreClassroom}>
                <Maximize2 size={14} className="mr-1.5" />
                Return to Classroom
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeave}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
            >
              <PhoneOff size={14} className="mr-1.5" />
              Leave
            </Button>
          </div>
        </div>
      )}

      {/* Right-now card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Right now</h3>
          {current && <StatusBadge status={current.status} />}
        </div>

        {loadingCurrent ? (
          <p className="mt-4 text-sm text-muted-foreground">Checking…</p>
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
              <Button
                onClick={handleLeave}
                variant="destructive"
                size="sm"
              >
                <PhoneOff size={14} className="mr-1.5" /> Leave
              </Button>
            ) : (
              <Button
                onClick={handleJoin}
                disabled={liveClass.isJoining}
                className="bg-[#0037FF] hover:bg-[#0037FF]/90"
              >
                <Video size={14} className="mr-1.5" />
                {liveClass.isJoining ? "Connecting…" : "Join Now"}
              </Button>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No class is live right now.
          </p>
        )}
      </div>

      {/* Upcoming + History */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Upcoming */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Upcoming</h3>
          {loadingUpcoming ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
          ) : upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Nothing scheduled yet.
            </p>
          ) : (
            <div className="mt-3 divide-y divide-border">
              {upcoming.map((lc) => (
                <div key={lc._id} className="py-2.5 text-sm">
                  <p className="font-medium">{lc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {BATCH_DAY_LABELS[lc.batch.days]} ·{" "}
                    {BATCH_TIME_LABELS[lc.batch.time]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past classes */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <History size={14} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold">Past Classes</h3>
          </div>
          {loadingHistory ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
          ) : history.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No completed classes yet.
            </p>
          ) : (
            <div className="mt-3 divide-y divide-border">
              {history.map((lc) => (
                <div key={lc._id} className="py-2.5 text-sm">
                  <p className="font-medium">{lc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Ended{" "}
                    {lc.endedAt
                      ? new Date(lc.endedAt).toLocaleString("en-IN")
                      : "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentLiveClassPage;
