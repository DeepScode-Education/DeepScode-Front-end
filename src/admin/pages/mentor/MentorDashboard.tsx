import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MentorLayout from "../../components/MentorLayout";
import { Badge } from "@/components/ui/badge";
import {
  mentorDashboardApi,
  MentorDashboardStats,
  MentorAssignmentRow,
  MentorStudentRow,
  MentorClassRow,
  MentorBatchRow ,
} from "@/integrations/client";
import {
  Users,
  FileBadge,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  Clock,
  CalendarDays,
   Layers
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  Submitted: "bg-blue-500/10 text-blue-600",
  "Under Review": "bg-amber-500/10 text-amber-600",
  Approved: "bg-emerald-500/10 text-emerald-600",
  Rejected: "bg-red-500/10 text-red-600",
};

const MentorDashboard = () => {
  const [stats, setStats] = useState<MentorDashboardStats | null>(null);
  const [assignments, setAssignments] = useState<MentorAssignmentRow[]>([]);
  const [students, setStudents] = useState<MentorStudentRow[]>([]);
  const [classes, setClasses] = useState<MentorClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [batches, setBatches] = useState<MentorBatchRow[]>([]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await mentorDashboardApi.getDashboard();
       //  if (res.success) {
       //    setStats(res.data.stats);
       //    setAssignments(res.data.recentAssignments);
       //    setStudents(res.data.students);
       //    setClasses(res.data.upcomingClasses);
       //  }

// 	if (res.success) {
//   setStats(res.data.stats);
//   setAssignments(res.data.recentAssignments);
//   setStudents(res.data.students);
//   setClasses(res.data.upcomingClasses);
//   setBatches(res.data.batches ?? []);
// }

if (res.success) {
  setStats(res.data?.stats ?? null);
  setAssignments(res.data?.recentAssignments ?? []);
  setStudents(res.data?.students ?? []);
  setClasses(res.data?.upcomingClasses ?? []);
  setBatches(res.data?.batches ?? []);
}
      } catch (err) {
        console.error(err);
        setError("Couldn't load your dashboard right now. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();

    
  }, []);


  

//   const kpis = [
//     { label: "Assigned Students", value: stats?.assignedStudents ?? "…", icon: Users, color: "text-blue-500" },
//     { label: "Pending Assignments", value: stats?.pendingAssignments ?? "…", icon: FileBadge, color: "text-amber-500" },
//     { label: "Completed Reviews", value: stats?.completedReviews ?? "…", icon: CheckCircle2, color: "text-emerald-500" },
//     { label: "Active Courses", value: stats?.activeCourses ?? "…", icon: BookOpen, color: "text-purple-500" },
//   ];

const kpis = [
  { label: "Total Students", value: stats?.totalStudents ?? "…", icon: Users, color: "text-blue-500" },
  { label: "Total Batches", value: stats?.totalBatches ?? "…", icon: Layers, color: "text-purple-500" },
  { label: "Active Courses", value: stats?.activeCourses ?? "…", icon: BookOpen, color: "text-emerald-500" },
  { label: "Pending Assignments", value: stats?.pendingAssignments ?? "…", icon: FileBadge, color: "text-amber-500" },
];

  return (
    <MentorLayout title={`${greeting} 👋`} subtitle={`Here's your mentoring overview · ${today}`}>
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase text-muted-foreground">{k.label}</div>
                <Icon size={14} className={k.color} />
              </div>
              <div className={`mt-2 text-2xl font-bold tracking-tight ${k.color}`}>
                {loading ? "…" : k.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-12 gap-6">
        {/* Recent Assignments */}
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <FileBadge size={16} className="text-[#0037FF]" />
                <h3 className="text-sm font-bold">Recent Assignments</h3>
              </div>
              <Link
                to="/mentor/assignments"
                className="flex items-center gap-1 text-xs font-semibold text-[#0037FF] hover:underline"
              >
                View all <ChevronRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
            ) : assignments.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No assignments to review yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
                      <th className="p-3 font-semibold">Student</th>
                      <th className="p-3 font-semibold">Assignment</th>
                      <th className="p-3 font-semibold">Course</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {assignments.map((a) => (
                      <tr key={a._id}>
                        <td className="p-3 font-medium">{a.studentName}</td>
                        <td className="p-3 text-muted-foreground">{a.title}</td>
                        <td className="p-3 text-muted-foreground">{a.course ?? "—"}</td>
                        <td className="p-3">
                          <Badge className={`border-0 text-[11px] ${STATUS_STYLES[a.status] ?? "bg-secondary"}`}>
                            {a.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            to="/mentor/assignments"
                            className="text-xs font-semibold text-[#0037FF] hover:underline"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

	   {/* My Batches */}
<div className="mt-6 rounded-xl border border-border bg-card">
  <div className="flex items-center justify-between border-b border-border p-4">
    <div className="flex items-center gap-2">
      <Layers size={16} className="text-[#0037FF]" />
      <h3 className="text-sm font-bold">My Batches</h3>
    </div>
    <Link to="/mentor/batches" className="flex items-center gap-1 text-xs font-semibold text-[#0037FF] hover:underline">
      View all <ChevronRight size={12} />
    </Link>
  </div>

  {loading ? (
    <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
  ) : batches.length === 0 ? (
    <div className="p-6 text-center text-sm text-muted-foreground">No batches assigned yet.</div>
  ) : (
    <ul className="divide-y divide-border">
      {batches.slice(0, 4).map((b) => (
        <li key={b.id} className="flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{b.course}</div>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{b.batchDays ?? "Unscheduled"}</span>
              <span className="flex items-center gap-1">
                <Clock size={11} /> {b.batchTime ?? "—"}
              </span>
              <span>{b.totalStudents} students</span>
            </div>
          </div>
          <Link
            to={`/mentor/batches/${encodeURIComponent(b.id)}`}
            className="text-xs font-semibold text-[#0037FF] hover:underline"
          >
            View
          </Link>
        </li>
      ))}
    </ul>
  )}
</div>

          {/* My Students */}
          <div className="mt-6 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#0037FF]" />
                <h3 className="text-sm font-bold">My Students</h3>
              </div>
              <Link
                to="/mentor/students"
                className="flex items-center gap-1 text-xs font-semibold text-[#0037FF] hover:underline"
              >
                View all <ChevronRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
            ) : students.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No students assigned yet.</div>
            ) : (
              <ul className="divide-y divide-border">
                {students.slice(0, 5).map((s) => (
                  <li key={s._id} className="flex items-center gap-3 p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0037FF]/10 text-xs font-bold text-[#0037FF]">
                      {s.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{s.fullName}</div>
                      <div className="truncate text-xs text-muted-foreground">{s.course ?? "No course"}</div>
                    </div>
                    <div className="w-28">
                      <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                        <span>Progress</span>
                        <span className="font-semibold text-foreground">{s.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-[#0037FF]"
                          style={{ width: `${Math.min(s.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-[#0037FF]" />
              <h3 className="text-sm font-bold">Upcoming Classes</h3>
            </div>

            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Loading…</div>
            ) : classes.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No classes scheduled.</div>
            ) : (
              <ul className="mt-3 space-y-2">
                {classes.map((c) => (
                  <li key={c._id} className="rounded-lg border border-border p-3">
                    <div className="text-sm font-semibold">{c.title}</div>
                    {c.course && <div className="text-[11px] text-muted-foreground">{c.course}</div>}
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={12} /> {c.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {c.time}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </MentorLayout>
  );
};

export default MentorDashboard;