import { useState } from "react";
import {
  AlertTriangle, Calendar, Download, IndianRupee, UserCheck,
  TrendingUp, BellOff, ExternalLink,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import AdminLayout from "../../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { useGlobalReports } from "../../hooks/Usereports";

const SOURCE_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899"];

const HEALTH_COLOR: Record<string, string> = {
  optimal: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
};
const HEALTH_TEXT: Record<string, string> = {
  optimal: "text-emerald-600",
  warning: "text-amber-600",
  critical: "text-red-500",
};

const Reports = () => {
  const [days, setDays] = useState(30);
  const { data, loading } = useGlobalReports(days);

  const kpis = [
    {
      label: "Total Revenue",
      value: data ? `₹${data.totalRevenue.toLocaleString("en-IN")}` : "…",
      icon: <IndianRupee size={18} />,
      color: "text-[#0037FF] bg-blue-50",
    },
    {
      label: "Total Admissions",
      value: data ? data.totalAdmissions.toLocaleString("en-IN") : "…",
      icon: <UserCheck size={18} />,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Overall Conversion",
      value: data ? `${data.overallConversion}%` : "…",
      icon: <TrendingUp size={18} />,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Missed Follow-up Rate",
      value: data ? `${data.missedFollowUpRate}%` : "…",
      icon: <BellOff size={18} />,
      color: "text-red-500 bg-red-50",
    },
  ];

  const funnel = data?.conversionFunnel;

  return (
    <AdminLayout
      title="Global Analytics Dashboard"
      subtitle={`Performance overview across all ${data?.branchAudit.length ?? 0} institutional branches.`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setDays(days === 30 ? 90 : 30)}>
            <Calendar size={14} /> Last {days} Days
          </Button>
          <Button size="sm"><Download size={14} /> Export Report</Button>
        </div>
      }
    >
      {/* ── Priority Alert Banner ── */}
      {data?.priorityAlerts.map((alert, i) => (
        <div
          key={i}
          className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900 dark:bg-red-950/20"
        >
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500 text-white">
              <AlertTriangle size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                PRIORITY ALERT: {alert.title.toUpperCase()}
              </p>
              <p className="mt-0.5 text-sm text-red-600/90 dark:text-red-400/80">{alert.message}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="shrink-0 text-red-600">
            View Audit
          </Button>
        </div>
      ))}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-5">
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${k.color}`}>
              {k.icon}
            </div>
            <div className="text-2xl font-bold">{loading ? "…" : k.value}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{k.label}</div>
          </div>
        ))}
      </div>

      {/* ── Revenue by Branch + Conversion Funnel ── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Revenue by Branch</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.revenueByBranch ?? []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="branch" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Conversion Funnel</h3>
            <span className="text-xs font-medium text-emerald-600">
              {funnel ? `${100 - funnel.demoDropoffPct}% Efficiency` : "…"}
            </span>
          </div>
          <div className="mt-5 space-y-3">
            <FunnelBar label="Leads Generated" value={funnel?.leadsGenerated ?? 0} tone="bg-blue-700" />
            <div className="flex justify-center"><div className="h-3 w-px bg-border" /></div>
            <FunnelBar
              label="Demos Conducted"
              value={funnel?.demosConducted ?? 0}
              tone="bg-blue-500"
              badge={funnel ? `${funnel.demoDropoffPct}% Dropoff` : ""}
              widthPct={funnel?.leadsGenerated ? (funnel.demosConducted / funnel.leadsGenerated) * 100 : 0}
            />
            <div className="flex justify-center"><div className="h-3 w-px bg-border" /></div>
            <FunnelBar
              label="Enrollments"
              value={funnel?.enrollments ?? 0}
              tone="bg-blue-300 text-blue-900"
              badge={funnel ? `${funnel.enrollCRPct}% CR` : ""}
              widthPct={funnel?.leadsGenerated ? (funnel.enrollments / funnel.leadsGenerated) * 100 : 0}
            />
          </div>
        </div>
      </div>

      {/* ── Lead Source Performance + Top Counsellors ── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Lead Source Performance</h3>
          <div className="mt-2 flex items-center gap-6">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.leadSourcePerformance ?? []}
                    dataKey="count"
                    nameKey="source"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {(data?.leadSourcePerformance ?? []).map((_, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2.5">
              {(data?.leadSourcePerformance ?? []).map((s, i) => (
                <div key={s.source} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                  <span className="flex-1">{s.source}</span>
                  <span className="text-muted-foreground text-xs">{s.percent}% ({s.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold">Top Counsellors</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border">
                <th className="text-left px-5 py-2 font-medium">Counsellor</th>
                <th className="text-left py-2 font-medium">Leads</th>
                <th className="text-left py-2 font-medium">Admissions</th>
                <th className="text-right px-5 py-2 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(data?.topCounsellors ?? []).map((c) => (
                <tr key={c.name} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0037FF]/10 text-xs font-semibold text-[#0037FF]">
                        {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3">{c.leads}</td>
                  <td className="py-3">{c.admissions}</td>
                  <td className="px-5 py-3 text-right font-semibold">
                    ₹{c.revenue.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Branch Productivity Audit ── */}
      <div className="mt-6 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold">Branch Productivity Audit</h3>
          <div className="flex items-center gap-4 text-xs">
            <Legend color="bg-emerald-500" label="Optimal" />
            <Legend color="bg-amber-500" label="Warning" />
            <Legend color="bg-red-500" label="Critical" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground border-b border-border">
              <th className="text-left px-5 py-2 font-medium">Branch Location</th>
              <th className="text-left py-2 font-medium">Counsellor Count</th>
              <th className="text-left py-2 font-medium">Active Leads</th>
              <th className="text-left py-2 font-medium">Missed Follow-ups</th>
              <th className="text-left py-2 font-medium">Health Index</th>
              <th className="text-right px-5 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data?.branchAudit ?? []).map((b) => (
              <tr key={b.branchId} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-medium">{b.branch}</td>
                <td className="py-3">{b.counsellorCount}</td>
                <td className="py-3">{b.activeLeads.toLocaleString("en-IN")}</td>
                <td className={`py-3 font-medium ${b.missedFollowUps > 100 ? "text-red-500" : ""}`}>
                  {b.missedFollowUps}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                      <div className={`h-full rounded-full ${HEALTH_COLOR[b.health]}`} style={{ width: `${b.healthIndex}%` }} />
                    </div>
                    <span className={`text-xs font-semibold ${HEALTH_TEXT[b.health]}`}>{b.healthIndex}%</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <ExternalLink size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

const FunnelBar = ({
  label, value, tone, badge, widthPct = 100,
}: { label: string; value: number; tone: string; badge?: string; widthPct?: number }) => (
  <div
    className={`relative mx-auto flex flex-col items-center justify-center rounded-lg py-4 text-white ${tone}`}
    style={{ width: `${Math.max(widthPct, 35)}%` }}
  >
    {badge && (
      <span className="absolute right-3 top-3 rounded bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
        {badge}
      </span>
    )}
    <span className="text-[11px] font-semibold uppercase tracking-wide opacity-90">{label}</span>
    <span className="text-xl font-bold">{value.toLocaleString("en-IN")}</span>
  </div>
);

const Legend = ({ color, label }: { color: string; label: string }) => (
  <span className="flex items-center gap-1.5 text-muted-foreground">
    <span className={`h-2 w-2 rounded-full ${color}`} /> {label}
  </span>
);

export default Reports;