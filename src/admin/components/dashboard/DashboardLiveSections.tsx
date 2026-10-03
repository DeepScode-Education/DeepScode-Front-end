import { useEffect, useState } from "react";
import {
  Plus, BookOpen, CalendarPlus, Users, GraduationCap,
  FileText, Layout, TrendingUp, IndianRupee, Clock, ShieldCheck,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/admin/components/StatusBadge";
import {
  conversionSeries, recentActivity, classes,
} from "@/admin/data/mock";
import {
  dashboardExtApi,
  type DashboardLead,
  type DashboardFollowUp,
  type LeadSourceStat,
  type CoursePerformanceStat,
  type RevenueStat,
  type RecentPaymentRecord,
} from "@/integrations/client";

const SOURCE_COLORS = [
  "hsl(var(--primary))", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899",
];

const formatCurrency = (n: number) =>
  n >= 100_000
    ? `₹${(n / 100_000).toFixed(1)}L`
    : `₹${n.toLocaleString("en-IN")}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

const paymentStatusTone = (
  status: string
): "success" | "danger" | "warning" | undefined => {
  if (status === "success") return "success";
  if (status === "failed") return "danger";
  return "warning";
};

const getCourseTitle = (course: string | { title: string } | null | undefined) =>
  typeof course === "string" ? course : course?.title || "—";

const DashboardLiveSections = () => {
  const [revenueSeries, setRevenueSeries] = useState<RevenueStat[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [recentPayments, setRecentPayments] = useState<RecentPaymentRecord[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [leads, setLeads] = useState<DashboardLead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [followUps, setFollowUps] = useState<DashboardFollowUp[]>([]);
  const [followUpsLoading, setFollowUpsLoading] = useState(true);
  const [leadSources, setLeadSources] = useState<LeadSourceStat[]>([]);
  const [leadSourcesLoading, setLeadSourcesLoading] = useState(true);
  const [coursePerformance, setCoursePerformance] = useState<CoursePerformanceStat[]>([]);
  const [coursePerfLoading, setCoursePerfLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [revenueResult, paymentsResult, leadsResult, followUpsResult, sourcesResult, performanceResult] =
        await Promise.allSettled([
          dashboardExtApi.getRevenueSeries(),
          dashboardExtApi.getRecentPayments(5),
          dashboardExtApi.getRecentLeads(),
          dashboardExtApi.getPendingFollowUps(),
          dashboardExtApi.getLeadSources(),
          dashboardExtApi.getCoursePerformance(),
        ]);

      if (cancelled) return;

      if (revenueResult.status === "fulfilled") setRevenueSeries(revenueResult.value);
      setRevenueLoading(false);

      if (paymentsResult.status === "fulfilled") setRecentPayments(paymentsResult.value);
      setPaymentsLoading(false);

      if (leadsResult.status === "fulfilled") setLeads(leadsResult.value);
      setLeadsLoading(false);

      if (followUpsResult.status === "fulfilled") setFollowUps(followUpsResult.value);
      setFollowUpsLoading(false);

      if (sourcesResult.status === "fulfilled") setLeadSources(sourcesResult.value);
      setLeadSourcesLoading(false);

      if (performanceResult.status === "fulfilled") setCoursePerformance(performanceResult.value);
      setCoursePerfLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const yFormatter = (v: number) =>
    v >= 100_000 ? `₹${(v / 100_000).toFixed(0)}L` : `₹${(v / 1000).toFixed(0)}k`;

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Revenue & Students</h3>
              <p className="text-xs text-muted-foreground">Last 12 months</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />Students
              </span>
            </div>
          </div>

          <div className="mt-4 h-72">
            {revenueLoading ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Loading…
              </div>
            ) : revenueSeries.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No revenue data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueSeries}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="stu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(160 70% 45%)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(160 70% 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="hsl(var(--border))"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="revenue"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={yFormatter}
                  />
                  <YAxis
                    yAxisId="students"
                    orientation="right"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value: number, name: string) => [
                      name === "revenue"
                        ? formatCurrency(value)
                        : `${value} new`,
                      name === "revenue" ? "Revenue" : "Students",
                    ]}
                  />
                  <Area
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fill="url(#rev)"
                    strokeWidth={2}
                  />
                  <Area
                    yAxisId="students"
                    type="monotone"
                    dataKey="students"
                    stroke="hsl(160 70% 45%)"
                    fill="url(#stu)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Conversion Funnel</h3>
          <p className="text-xs text-muted-foreground">Visitor → Paid</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={conversionSeries}
                layout="vertical"
                margin={{ left: 0, right: 10 }}
              >
                <CartesianGrid
                  stroke="hsl(var(--border))"
                  strokeDasharray="3 3"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="stage"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={75}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Lead Source Analytics</h3>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
          <div className="mt-4 h-56">
            {leadSourcesLoading ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Loading…
              </div>
            ) : leadSources.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No lead data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={leadSources}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="hsl(var(--border))"
                    strokeDasharray="2 2"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="source"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.8)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(0,0,0,0.05)",
                      borderRadius: 10,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    }}
                    cursor={false}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} activeBar={{ fillOpacity: 0.8 }}>
                    {leadSources.map((_, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold">Course Performance</h3>
              <p className="text-xs text-muted-foreground">Enrollment & completion</p>
            </div>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
          <ul className="divide-y divide-border">
            {coursePerfLoading ? (
              <li className="px-5 py-4 text-xs text-muted-foreground">Loading…</li>
            ) : coursePerformance.length === 0 ? (
              <li className="px-5 py-4 text-xs text-muted-foreground">No course data yet</li>
            ) : (
              coursePerformance.map((c) => (
                <li key={c.course} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{c.course}</span>
                      <span className="text-xs text-muted-foreground">
                        {c.students} students{c.rating > 0 ? ` · ★ ${c.rating}` : ""}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${c.completion}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs text-muted-foreground">
                        {c.completion}%
                      </span>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold">Upcoming Live Classes</h3>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
          <ul className="divide-y divide-border">
            {classes.slice(0, 4).map((c) => (
              <li key={c.id} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{c.course}</span>
                  <span className="text-[11px] text-muted-foreground">{c.platform}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{c.teacher}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {c.date} · {c.time} · {c.students} students
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold">Pending Follow-ups</h3>
            <Button variant="ghost" size="sm"><Plus size={14} /></Button>
          </div>
          <ul className="divide-y divide-border">
            {followUpsLoading ? (
              <li className="px-5 py-4 text-xs text-muted-foreground">Loading…</li>
            ) : followUps.length === 0 ? (
              <li className="px-5 py-4 text-xs text-muted-foreground">
                No pending follow-ups 🎉
              </li>
            ) : (
              followUps.map((f) => (
                <li key={f._id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{f.fullName}</span>
                    <StatusBadge tone={f.isOverdue ? "danger" : "warning"}>
                      {f.isOverdue ? "Overdue" : "Today"}
                    </StatusBadge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{getCourseTitle(f.course)}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {f.nextFollowUpDate
                      ? new Date(f.nextFollowUpDate).toLocaleString("en-IN", {
                          day: "numeric", month: "short",
                          hour: "2-digit", minute: "2-digit",
                        })
                      : "—"}
                    {f.assignedTo ? ` · ${f.assignedTo}` : ""}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold">Recent Payments</h3>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
          <ul className="divide-y divide-border">
            {paymentsLoading ? (
              <li className="px-5 py-4 text-xs text-muted-foreground">Loading…</li>
            ) : recentPayments.length === 0 ? (
              <li className="px-5 py-4 text-xs text-muted-foreground">No payments yet</li>
            ) : (
              recentPayments.map((p) => {
                const studentName =
                  typeof p.student === "object" && p.student
                    ? p.student.fullName
                    : "—";
                const courseTitle =
                  typeof p.course === "object" && p.course
                    ? p.course.title
                    : "—";
                return (
                  <li
                    key={p._id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{studentName}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {courseTitle} · {formatDate(p.paidAt ?? new Date().toISOString())}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="text-sm font-semibold">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </div>
                      <StatusBadge tone={paymentStatusTone(p.status)}>
                        {p.status}
                      </StatusBadge>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold">Recent Leads</h3>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-5 py-2 text-left font-medium">Name</th>
                  <th className="px-5 py-2 text-left font-medium">Course</th>
                  <th className="px-5 py-2 text-left font-medium">Source</th>
                  <th className="px-5 py-2 text-left font-medium">Stage</th>
                  <th className="px-5 py-2 text-left font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {leadsLoading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-4 text-xs text-muted-foreground">
                      Loading…
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-4 text-xs text-muted-foreground">
                      No leads yet
                    </td>
                  </tr>
                ) : (
                  leads.map((l) => (
                    <tr
                      key={l._id}
                      className="border-b border-border last:border-0 hover:bg-secondary/40"
                    >
                      <td className="px-5 py-3 font-medium">{l.fullName}</td>
                      <td className="px-5 py-3 text-muted-foreground">{getCourseTitle(l.course)}</td>
                      <td className="px-5 py-3 text-muted-foreground">{l.source}</td>
                      <td className="px-5 py-3">
                        <StatusBadge>{l.leadStatus}</StatusBadge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(l.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold">Activity</h3>
            <Button variant="ghost" size="sm"><Plus size={14} /></Button>
          </div>
          <ul className="divide-y divide-border">
            {recentActivity.map((a, i) => (
              <li key={i} className="flex items-start gap-3 px-5 py-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{a.who}</span>{" "}
                    <span className="text-muted-foreground">{a.what}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">{a.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default DashboardLiveSections;
