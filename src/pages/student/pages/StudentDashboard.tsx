// // pages/student/Dashboard.tsx
// import { useMemo } from "react";
// import {
//   Award,
//   Upload,
//   Receipt,
//   Video,
//   BookOpen,
//   CalendarCheck,
//   Trophy,
//   Briefcase,
//   Wallet,
//   Clock,
//   Flame,
//   Sparkles,
//   CheckCircle2,
//   ArrowRight,
// } from "lucide-react";
// import {
//   Area,
//   AreaChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import StudentLayout from "../components/StudentLayout";
// import StatusBadge from "../components/StatusBadge";
// import { Button } from "@/components/ui/button";
// import { useAuth } from "../../../contexts/AuthContext";

// // ─────────────────────────────────────────────────────────────────────────────
// // Mock data — swap these for the live student APIs (studentDashboardApi.getMine(),
// // fee/attendance/portfolio endpoints) once the layout is signed off.
// // ─────────────────────────────────────────────────────────────────────────────

// const statCards = [
//   { label: "Course Progress", value: "65%", note: "7 of 11 modules", icon: BookOpen, tone: "blue" as const },
//   { label: "Attendance", value: "92%", note: "Min required 75%", icon: CalendarCheck, tone: "green" as const },
//   { label: "Portfolio Projects", value: "7/10", note: "3 in progress", icon: Trophy, tone: "purple" as const },
//   { label: "Placement Readiness", value: "78%", note: "3 interviews lined up", icon: Briefcase, tone: "blue" as const },
//   { label: "Fees Pending", value: "₹10,000", note: "Due 10 Jul", icon: Wallet, tone: "gray" as const },
//   { label: "Next Class", value: "Mon 7 PM", note: "Design Systems", icon: Clock, tone: "green" as const },
// ];

// const TONE_CLASSES: Record<string, string> = {
//   blue: "bg-blue-50 text-[#0037FF]",
//   green: "bg-emerald-50 text-emerald-600",
//   purple: "bg-violet-50 text-violet-600",
//   gray: "bg-secondary text-muted-foreground",
// };

// const snapshotStats = [
//   { label: "Course", value: 65, color: "#0037FF" },
//   { label: "Attendance", value: 92, color: "#10b981" },
//   { label: "Placement", value: 78, color: "#8b5cf6" },
//   { label: "Portfolio", value: 70, color: "#f59e0b" },
// ];

// const streakDays = Array.from({ length: 14 }, (_, i) => i < 12);

// const roadmap = [
//   {
//     id: 1,
//     title: "Introduction to Design",
//     status: "Completed" as const,
//     note: "Last access 12 Apr · Excellent grasp of fundamentals.",
//     completion: 100,
//   },
//   {
//     id: 2,
//     title: "UI Design Fundamentals",
//     status: "Completed" as const,
//     note: "Last access 28 Apr · Strong visual hierarchy.",
//     completion: 100,
//   },
//   {
//     id: 3,
//     title: "Typography & Layout Systems",
//     status: "In Progress" as const,
//     note: "Last access 6 Jul · Keep going, halfway there.",
//     completion: 45,
//   },
//   {
//     id: 4,
//     title: "Design Systems Deep Dive",
//     status: "Not Started" as const,
//     note: "Starts Monday.",
//     completion: 0,
//   },
// ];

// const attendanceTrend = [
//   { month: "Jan", attendance: 84 },
//   { month: "Feb", attendance: 88 },
//   { month: "Mar", attendance: 95 },
//   { month: "Apr", attendance: 90 },
//   { month: "May", attendance: 86 },
//   { month: "Jun", attendance: 92 },
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // Small building blocks
// // ─────────────────────────────────────────────────────────────────────────────

// const RadialStat = ({ value, label, color }: { value: number; label: string; color: string }) => {
//   const radius = 40;
//   const circumference = 2 * Math.PI * radius;
//   const offset = circumference - (value / 100) * circumference;

//   return (
//     <div className="flex flex-col items-center gap-2">
//       <div className="relative h-24 w-24">
//         <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
//           <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
//           <circle
//             cx="50"
//             cy="50"
//             r={radius}
//             fill="none"
//             stroke={color}
//             strokeWidth="8"
//             strokeLinecap="round"
//             strokeDasharray={circumference}
//             strokeDashoffset={offset}
//           />
//         </svg>
//         <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">{value}%</div>
//       </div>
//       <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
//     </div>
//   );
// };

// const roadmapTone = (status: (typeof roadmap)[number]["status"]) =>
//   status === "Completed" ? "success" : status === "In Progress" ? "warning" : "neutral";

// // ─────────────────────────────────────────────────────────────────────────────

// const StudentPortalDashboard = () => {
//   const { user } = useAuth();
//   const firstName = useMemo(() => (user?.fullName || "Student").split(" ")[0], [user]);

//   return (
//     <StudentLayout
//       title={`Welcome back, ${firstName} 👋`}
//       subtitle="Pick up where you left off — Design Systems Deep Dive starts Monday."
//       actions={
//         <>
//           <Button variant="outline" size="sm">
//             <Award size={14} /> Certificate
//           </Button>
//           <Button variant="outline" size="sm" className="bg-violet-600 text-white hover:bg-violet-700 border-transparent">
//             <Upload size={14} /> Upload
//           </Button>
//           <Button variant="outline" size="sm">
//             <Receipt size={14} /> Receipt
//           </Button>
//           <Button size="sm" className="text-white">
//             <Video size={14} /> Book Mentor
//           </Button>
//         </>
//       }
//     >
//       {/* ── Stat cards ── */}
//       <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
//         {statCards.map((s) => {
//           const Icon = s.icon;
//           return (
//             <div key={s.label} className="rounded-xl border border-border bg-card p-5">
//               <div className="flex items-center justify-between">
//                 <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
//                 <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${TONE_CLASSES[s.tone]}`}>
//                   <Icon size={15} />
//                 </div>
//               </div>
//               <div className="mt-3 text-2xl font-bold tracking-tight">{s.value}</div>
//               <div className="mt-1 text-[11px] text-muted-foreground">{s.note}</div>
//             </div>
//           );
//         })}
//       </div>

//       {/* ── Learning snapshot + Streak ── */}
//       <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
//         <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-sm font-semibold">Your learning snapshot</h3>
//               <p className="text-xs text-muted-foreground">Live progress across the program</p>
//             </div>
//             <button className="flex items-center gap-1 text-xs font-medium text-[#0037FF] hover:underline">
//               View roadmap <ArrowRight size={12} />
//             </button>
//           </div>
//           <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
//             {snapshotStats.map((s) => (
//               <RadialStat key={s.label} value={s.value} label={s.label} color={s.color} />
//             ))}
//           </div>
//         </div>

//         <div className="rounded-xl border border-border bg-card p-5">
//           <div className="flex items-center gap-3">
//             <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
//               <Flame size={18} />
//             </div>
//             <div>
//               <h3 className="text-sm font-semibold">12-day streak</h3>
//               <p className="text-xs text-muted-foreground">Keep it going! 🔥</p>
//             </div>
//           </div>

//           <div className="mt-4 grid grid-cols-7 gap-1.5">
//             {streakDays.map((active, i) => (
//               <div key={i} className={`h-4 rounded-sm ${active ? "bg-[#0037FF]" : "bg-secondary"}`} />
//             ))}
//           </div>

//           <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3">
//             <div className="flex items-center gap-1.5 text-xs font-semibold">
//               <Sparkles size={13} className="text-[#0037FF]" />
//               Slate AI tip
//             </div>
//             <p className="mt-1 text-xs text-muted-foreground">
//               Submit your wireframe by Friday to stay on track for placements.
//             </p>
//           </div>

//           <Button className="mt-4 w-full text-white" size="sm">
//             <Sparkles size={14} /> Resume learning
//           </Button>
//         </div>
//       </div>

//       {/* ── Roadmap + Attendance trend ── */}
//       <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
//         <div className="rounded-xl border border-border bg-card lg:col-span-2">
//           <div className="flex items-center justify-between border-b border-border px-5 py-4">
//             <div>
//               <h3 className="text-sm font-semibold">Academic roadmap</h3>
//               <p className="text-xs text-muted-foreground">11 modules · mentor-graded</p>
//             </div>
//             <button className="text-xs font-medium text-[#0037FF] hover:underline">All modules</button>
//           </div>
//           <ul className="divide-y divide-border">
//             {roadmap.map((m) => (
//               <li key={m.id} className="flex items-start gap-3 px-5 py-4">
//                 <div
//                   className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
//                     m.status === "Completed" ? "bg-emerald-100 text-emerald-600" : "bg-secondary text-muted-foreground"
//                   }`}
//                 >
//                   <CheckCircle2 size={14} />
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <div className="flex items-center justify-between gap-3">
//                     <span className="text-sm font-medium">{m.title}</span>
//                     <StatusBadge tone={roadmapTone(m.status)}>{m.status}</StatusBadge>
//                   </div>
//                   <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>
//                   <div className="mt-2 flex items-center gap-3">
//                     <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
//                       <div className="h-full rounded-full bg-[#0037FF]" style={{ width: `${m.completion}%` }} />
//                     </div>
//                     <span className="w-10 text-right text-xs text-muted-foreground">{m.completion}%</span>
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div className="rounded-xl border border-border bg-card p-5">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-sm font-semibold">Attendance trend</h3>
//               <p className="text-xs text-muted-foreground">Last 6 months</p>
//             </div>
//             <span className="text-sm font-semibold text-emerald-600">92%</span>
//           </div>
//           <div className="mt-4 h-56">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={attendanceTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
//                 <defs>
//                   <linearGradient id="att" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
//                     <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
//                 <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
//                 <YAxis
//                   domain={[60, 100]}
//                   stroke="hsl(var(--muted-foreground))"
//                   fontSize={11}
//                   tickLine={false}
//                   axisLine={false}
//                 />
//                 <Tooltip
//                   contentStyle={{
//                     background: "hsl(var(--card))",
//                     border: "1px solid hsl(var(--border))",
//                     borderRadius: 8,
//                     fontSize: 12,
//                   }}
//                   formatter={(value: number) => [`${value}%`, "Attendance"]}
//                 />
//                 <Area type="monotone" dataKey="attendance" stroke="#10b981" fill="url(#att)" strokeWidth={2} />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     </StudentLayout>
//   );
// };

// export default StudentPortalDashboard;



import { useMemo } from "react";
import {
  Award, Upload, Receipt, Video, BookOpen, CalendarCheck, Trophy,
  Briefcase, Wallet, Clock, Flame, Sparkles, CheckCircle2, ArrowRight,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import StudentLayout from "../components/StudentLayout";
import StatusBadge from "../components/StatusBadge";
import { Button } from "@/components/ui/button";
import useStudentDashboard from "@/hooks/useStudentDashboard";

const TONE_CLASSES: Record<string, string> = {
  blue: "bg-blue-50 text-[#0037FF]",
  green: "bg-emerald-50 text-emerald-600",
  purple: "bg-violet-50 text-violet-600",
  gray: "bg-secondary text-muted-foreground",
};

const STAT_ICON_MAP: Record<string, any> = {
  course: BookOpen, attendance: CalendarCheck, portfolio: Trophy,
  placement: Briefcase, fees: Wallet, nextClass: Clock,
};

const STAT_TONE_MAP: Record<string, string> = {
  course: "blue", attendance: "green", portfolio: "purple",
  placement: "blue", fees: "gray", nextClass: "green",
};

const RadialStat = ({ value, label, color }: { value: number; label: string; color: string }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">{value}%</div>
      </div>
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  );
};

const roadmapStatusLabel = (status: string) =>
  status === "completed" ? "Completed" : status === "in-progress" ? "In Progress" : "Not Started";
const roadmapTone = (status: string) =>
  status === "completed" ? "success" : status === "in-progress" ? "warning" : "neutral";

const StudentPortalDashboard = () => {
  const { data, student, loading, error } = useStudentDashboard();
  const firstName = useMemo(() => (student?.fullName || "Student").split(" ")[0], [student]);

  if (loading && !data) {
    return (
      <StudentLayout title={`Welcome back, ${firstName} 👋`} subtitle="Loading your dashboard...">
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Fetching your latest progress…
        </div>
      </StudentLayout>
    );
  }

  if (error || !data) {
    return (
      <StudentLayout title={`Welcome back, ${firstName} 👋`} subtitle="We couldn't load your dashboard.">
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <p>{error || "Something went wrong."}</p>
        </div>
      </StudentLayout>
    );
  }

  const subtitle = data.nextClass
    ? `Pick up where you left off — ${data.nextClass.moduleTitle}${data.nextClass.status === "upcoming" ? " starts soon" : ""}.`
    : "Complete your profile to get your course assigned.";

  return (
    <StudentLayout
      title={`Welcome back, ${firstName} 👋`}
      subtitle={subtitle}
      actions={
        <>
          <Button variant="outline" size="sm"><Award size={14} /> Certificate</Button>
          <Button variant="outline" size="sm" className="bg-violet-600 text-white hover:bg-violet-700 border-transparent">
            <Upload size={14} /> Upload
          </Button>
          <Button variant="outline" size="sm"><Receipt size={14} /> Receipt</Button>
          <Button size="sm" className="text-white"><Video size={14} /> Book Mentor</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {data.statCards.map((s) => {
          const Icon = STAT_ICON_MAP[s.key] || BookOpen;
          const tone = STAT_TONE_MAP[s.key] || "gray";
          return (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${TONE_CLASSES[tone]}`}>
                  <Icon size={15} />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight">{s.value}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{s.note}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Your learning snapshot</h3>
              <p className="text-xs text-muted-foreground">Live progress across the program</p>
            </div>
            <button className="flex items-center gap-1 text-xs font-medium text-[#0037FF] hover:underline">
              View roadmap <ArrowRight size={12} />
            </button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {data.snapshotStats.map((s) => (
              <RadialStat key={s.label} value={s.value} label={s.label} color={s.color} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
              <Flame size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{data.streak.currentStreak}-day streak</h3>
              <p className="text-xs text-muted-foreground">Keep it going! 🔥</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {data.streak.days.map((active, i) => (
              <div key={i} className={`h-4 rounded-sm ${active ? "bg-[#0037FF]" : "bg-secondary"}`} />
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Sparkles size={13} className="text-[#0037FF]" />
              Slate AI tip
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {data.nextClass
                ? `Your next class "${data.nextClass.moduleTitle}" is coming up — stay on track.`
                : "Complete your profile to get assigned to a course."}
            </p>
          </div>

          <Button className="mt-4 w-full text-white" size="sm">
            <Sparkles size={14} /> Resume learning
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold">Academic roadmap</h3>
              <p className="text-xs text-muted-foreground">{data.roadmap.length} module(s) · mentor-graded</p>
            </div>
            <button className="text-xs font-medium text-[#0037FF] hover:underline">All modules</button>
          </div>
          {data.roadmap.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">No modules assigned yet.</div>
          ) : (
            <ul className="divide-y divide-border">
              {data.roadmap.map((m) => (
                <li key={m.id} className="flex items-start gap-3 px-5 py-4">
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    m.status === "completed" ? "bg-emerald-100 text-emerald-600" : "bg-secondary text-muted-foreground"
                  }`}>
                    <CheckCircle2 size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{m.title}</span>
                      <StatusBadge tone={roadmapTone(m.status)}>{roadmapStatusLabel(m.status)}</StatusBadge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {m.lastAccess
                        ? `Last access ${new Date(m.lastAccess).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}${m.feedback ? ` · ${m.feedback}` : ""}`
                        : "Not started yet"}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-[#0037FF]" style={{ width: `${m.progress}%` }} />
                      </div>
                      <span className="w-10 text-right text-xs text-muted-foreground">{m.progress}%</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Attendance trend</h3>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <span className="text-sm font-semibold text-emerald-600">{data.attendancePercent}%</span>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.attendanceTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="att" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number) => [`${value}%`, "Attendance"]}
                />
                <Area type="monotone" dataKey="attendance" stroke="#10b981" fill="url(#att)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentPortalDashboard;