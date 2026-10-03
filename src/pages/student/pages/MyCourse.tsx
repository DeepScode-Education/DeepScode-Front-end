
import { useEffect } from "react";
import {
  Download, PlayCircle, CheckCircle2, Circle, Lock, Clock, Star, Users, Video, CalendarDays, ChevronRight, Maximize2,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import StudentLayout from "../components/StudentLayout";
import { cn } from "@/lib/utils";
import { liveClassApi } from "@/integrations/client";
import { extractJoinClassData } from "@/features/live-class/api/liveClass.api";
import { useLiveClass } from "@/contexts/LiveClassContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCourse, getModuleStatusLabel, formatDate, formatLiveClassDate, formatLiveClassTime,
  type CourseModule, type ModuleStatus,
} from "../../../hooks/useCourse";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Small presentational helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_BADGE_STYLES: Record<ModuleStatus, string> = {
  completed: "bg-emerald-50 text-emerald-600",
  "in-progress": "bg-blue-50 text-[#0037FF]",
  locked: "bg-secondary text-muted-foreground",
};

const StatusBadge = ({ status }: { status: ModuleStatus }) => (
  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", STATUS_BADGE_STYLES[status])}>
    {getModuleStatusLabel(status)}
  </span>
);

const StatusIcon = ({ status }: { status: ModuleStatus }) => {
  if (status === "completed") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 size={16} />
      </div>
    );
  }
  if (status === "in-progress") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0037FF]">
        <Circle size={16} />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
      <Lock size={14} />
    </div>
  );
};

const ProgressBar = ({ value, tone = "default" }: { value: number; tone?: "default" | "muted" }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
    <div
      className={cn(
        "h-full rounded-full transition-[width] duration-700 ease-out",
        tone === "muted" ? "bg-muted-foreground/40" : "bg-gradient-to-r from-[#0037FF] to-[#7C3AED]",
      )}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const ModuleRow = ({ courseModule }: { courseModule: CourseModule }) => {
  const isLocked = courseModule.status === "locked";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-transparent px-3 py-4 transition-colors hover:border-border hover:bg-secondary/40 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-center gap-3 sm:w-10">
        <span className="text-xs font-semibold text-muted-foreground sm:hidden">
          {String(courseModule.order).padStart(2, "0")}
        </span>
        <StatusIcon status={courseModule.status} />
      </div>

      <div className="hidden text-xs font-semibold text-muted-foreground sm:block sm:w-6">
        {String(courseModule.order).padStart(2, "0")}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{courseModule.title}</p>
          <div className="flex items-center gap-3">
            <StatusBadge status={courseModule.status} />
            <span className="w-9 shrink-0 text-right text-xs font-medium text-muted-foreground">
              {courseModule.progress}%
            </span>
          </div>
        </div>

        <div className="mt-2">
          <ProgressBar value={courseModule.progress} tone={isLocked ? "muted" : "default"} />
        </div>

        <p className="mt-2 truncate text-xs text-muted-foreground">
          {courseModule.lastAccess
            ? `Last access ${formatDate(courseModule.lastAccess)} · Feedback: ${courseModule.feedback}`
            : "Not started yet"}
        </p>
      </div>

      <div className="sm:pl-2">
        {courseModule.status === "completed" && (
          <button className="w-full rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary sm:w-auto">
            Review
          </button>
        )}
        {courseModule.status === "in-progress" && (
          <button className="w-full rounded-lg bg-[#0037FF] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0037FF]/90 sm:w-auto">
            Continue
          </button>
        )}
        {isLocked && (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground/60 sm:w-auto"
          >
            Locked
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

const MyCourse = () => {
  const { user } = useAuth();
  const liveClassSession = useLiveClass();
  const { overview, modules, overallProgress, progressHistory, liveClass, realLiveClass, isLoading, error } =
    useCourse();

    const navigate = useNavigate();

  // ── Live class join state ──
  const isInMeeting = liveClassSession.session?.role === "student";
  const studentName = [user?.fullName, user?.displayName, user?.name]
    .find((name): name is string => typeof name === "string" && name.trim().length > 0)
    ?.trim();

  // ✅ ✅ CRITICAL: Yehi function Zoom Meeting SDK ka full UI trigger karta hai
  const handleJoinLive = async () => {
    if (!realLiveClass) return;
    if (!studentName) {
      alert("Your profile name is unavailable. Please refresh and try again.");
      return;
    }
    try {
      const res = await liveClassApi.joinClass(realLiveClass._id);
      const joinData = extractJoinClassData(res);
      // Is call se Zoom SDK ka official UI render hota hai (Mobile/Tablet/Desktop sab supported)
      liveClassSession.startSession({
        joinInfo: joinData,
        liveClassId: realLiveClass._id,
        role: "student",
        userName: studentName,
        title: realLiveClass.title,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not join the class.");
    }
  };

  // ── Attendance heartbeat — pings every 30s while inside meeting ──
  useEffect(() => {
    const liveClassId = liveClassSession.session?.liveClassId;
    if (!isInMeeting || !liveClassId) return;

    const ping = () => liveClassApi.attendanceHeartbeat(liveClassId).catch(() => {});
    ping();
    const interval = setInterval(ping, 30_000);

    return () => clearInterval(interval);
  }, [isInMeeting, liveClassSession.session?.liveClassId]);

  if (isLoading) {
    return (
      <StudentLayout title="My Course" subtitle="Loading...">
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Fetching your course details…
        </div>
      </StudentLayout>
    );
  }

  if (error || !overview || !liveClass) {
    return (
      <StudentLayout title="My Course" subtitle="">
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <p>{error || "No course has been assigned to you yet."}</p>
        </div>
      </StudentLayout>
    );
  }

  const headerActions = (
    <>
      <button className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary">
        <Download size={15} />
        Syllabus
      </button>
      <button
      onClick={() => navigate("/student/videos")}
      className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
    >
      <Video size={15} />
      Videos
    </button>
      <button className="flex items-center gap-2 rounded-lg bg-[#0037FF] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0037FF]/90">
        <PlayCircle size={15} />
        Resume lesson
      </button>

    </>
  );

  return (
    <StudentLayout
      title={overview.title}
      subtitle={`${overview.batchCode} · ${overview.scheduleLabel} · Mentor: ${overview.mentor.name}`}
      actions={headerActions}
    >
      <div className="flex flex-col gap-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">Overall progress</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{overallProgress}%</p>
            <div className="mt-4">
              <ProgressBar value={overallProgress} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">Hours invested</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{overview.hoursInvested}h</p>
            <p className="mt-4 text-xs text-muted-foreground">~{overview.hoursPerWeekAvg}h / week avg</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">Mentor rating</p>
            <p className="mt-2 flex items-center gap-1.5 text-3xl font-bold tracking-tight text-foreground">
              {overview.mentor.rating.toFixed(1)}
              <span className="text-base font-medium text-muted-foreground">/ 5</span>
            </p>
            <p className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              Across {overview.mentor.reviewsCount} reviews
            </p>
          </div>
        </div>

        {/* Progress graph + Live class */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Progress over time</p>
              <span className="text-xs text-muted-foreground">Last 9 weeks</span>
            </div>
            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressHistory} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="courseProgressFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0037FF" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#0037FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="week"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={32}
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Progress"]}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid hsl(var(--border))",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="progress"
                    stroke="#0037FF"
                    strokeWidth={2.5}
                    fill="url(#courseProgressFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live class card */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-gradient-to-br from-[#0037FF] to-[#1E1B8F] p-5 text-white">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-white/70">Live Class</p>
                {realLiveClass ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    Live now
                  </span>
                ) : liveClass.status === "upcoming" ? (
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">Upcoming</span>
                ) : (
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">Completed</span>
                )}
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users size={15} className="text-white/70" />
                  <span>
                    {overview.batchCode} · {liveClass.batchDayPattern}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={15} className="text-white/70" />
                  <span>{liveClass.timeLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Video size={15} className="text-white/70" />
                  <span>Mentor: {liveClass.mentorName}</span>
                </div>

                {!realLiveClass && liveClass.status !== "live" && (
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays size={15} className="text-white/70" />
                    <span>
                      {liveClass.status === "upcoming" ? "Next class" : "Last class"}:{" "}
                      {formatLiveClassDate(liveClass.nextClassDate)}
                      {liveClass.status === "upcoming" && liveClass.nextClassDate
                        ? ` · ${formatLiveClassTime(liveClass.nextClassDate)}`
                        : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              {realLiveClass ? (
                <button
                  onClick={isInMeeting ? liveClassSession.restoreClassroom : handleJoinLive}
                  disabled={liveClassSession.isJoining}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#0037FF] transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  {isInMeeting && liveClassSession.minimized ? <Maximize2 size={16} /> : <Video size={16} />}
                  {liveClassSession.isJoining
                    ? "Connecting..."
                    : isInMeeting
                    ? liveClassSession.minimized
                      ? "Return to Classroom"
                      : "In Live Class"
                    : "Join Live Class"}
                </button>
              ) : (
                <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20">
                  View schedule
                  <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Module roadmap */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground">Module roadmap</p>
          <div className="mt-3 flex flex-col divide-y divide-border">
            {modules.map((courseModule) => (
              <ModuleRow key={courseModule.id} courseModule={courseModule} />
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default MyCourse;