// import { Download } from "lucide-react";
// import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
// import AdminLayout from "../../components/AdminLayout";
// import StatCard from "../../components/StatCard";
// import { Button } from "@/components/ui/button";
// import { revenueSeries, coursePerformance, coupons } from "../../data/mock";

// const RevenueReports = () => (
//   <AdminLayout
//     title="Revenue Reports"
//     subtitle="Revenue trends, course breakdowns, and coupon impact."
//     actions={<Button variant="outline" size="sm"><Download size={14} /> Export</Button>}
//   >
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//       <StatCard label="Revenue (YTD)" value="₹4.2 Cr" delta="+24%" trend="up" />
//       <StatCard label="MRR" value="₹48.2L" delta="+12%" trend="up" />
//       <StatCard label="ARPU" value="₹32,800" delta="+8%" trend="up" />
//       {/* <StatCard label="Refunds" value="₹2.1L" delta="-18%" trend="up" /> */}
//     </div>

//     <div className="mt-6 rounded-xl border border-border bg-card p-5">
//       <h3 className="text-sm font-semibold">Revenue Trend</h3>
//       <p className="text-xs text-muted-foreground">Last 12 months</p>
//       <div className="mt-4 h-72">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={revenueSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
//             <defs>
//               <linearGradient id="revR" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
//                 <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
//             <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
//             <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
//             <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
//             <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revR)" strokeWidth={2} />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </div>

//     <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
//       <div className="rounded-xl border border-border bg-card p-5">
//         <h3 className="text-sm font-semibold">Revenue by Course</h3>
//         <div className="mt-4 h-64">
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={coursePerformance.map((c) => ({ name: c.course, value: c.students * 25 }))} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
//               <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
//               <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
//               <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
//               <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
//               <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//       <div className="rounded-xl border border-border bg-card p-5">
//         <h3 className="text-sm font-semibold">Coupon Usage</h3>
//         <ul className="mt-4 divide-y divide-border">
//           {coupons.map((c) => (
//             <li key={c.id} className="flex items-center justify-between py-2.5">
//               <code className="rounded bg-secondary px-2 py-0.5 font-mono text-xs">{c.code}</code>
//               <div className="flex items-center gap-3 text-xs text-muted-foreground">
//                 <span>{c.uses} uses</span>
//                 <span className="font-semibold text-foreground">{c.discount}</span>
//               </div>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   </AdminLayout>
// );

// export default RevenueReports;


import { useCallback, useEffect, useState } from "react";
import { Download, RefreshCw, TrendingUp, TrendingDown, IndianRupee, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import AdminLayout from "../../components/AdminLayout";
import StatCard from "../../components/StatCard";
import { Button } from "@/components/ui/button";
import {
  feeReportsApi,
  type FeeCollectionReports,
} from "@/integrations/feeCollectionApi";

const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const INSTALLMENT_META: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  paid: { label: "Paid", bg: "bg-emerald-50", text: "text-emerald-700", icon: <CheckCircle2 size={14} /> },
  partial: { label: "Partial", bg: "bg-blue-50", text: "text-blue-700", icon: <TrendingUp size={14} /> },
  pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", icon: <Clock size={14} /> },
  overdue: { label: "Overdue", bg: "bg-red-50", text: "text-red-700", icon: <AlertCircle size={14} /> },
};

const RevenueReports = () => {
  const [data, setData] = useState<FeeCollectionReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await feeReportsApi.getReports();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load fee collection reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = () => {
    if (!data) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Fees Generated", data.overview.totalFeesGenerated],
      ["Total Collected", data.overview.totalCollected],
      ["Total Pending", data.overview.totalPending],
      ["Total Overdue", data.overview.totalOverdue],
      ["Collection Rate (%)", data.overview.collectionRate],
      [],
      ["Course", "Total Fees", "Collected", "Pending", "Students", "Collection %"],
      ...data.courseWise.map((c) => [c.course, c.totalFees, c.collected, c.pending, c.students, c.collectionRate]),
      [],
      ["Counsellor", "Total Fees", "Collected", "Pending", "Students", "Collection %"],
      ...data.counsellorWise.map((c) => [c.counsellor, c.totalFees, c.collected, c.pending, c.students, c.collectionRate]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fee-collection-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout
      title="Fee Collection Reports"
      subtitle="Real-time fee collection analytics across courses and counsellors."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw size={14} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!data}>
            <Download size={14} /> Export
          </Button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="py-20 text-center text-sm text-muted-foreground">Loading reports…</div>
      ) : !data ? null : (
        <>
          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="Total Fees Generated"
              value={fmt(data.overview.totalFeesGenerated)}
              delta={`${data.overview.totalStudentsWithFee} students`}
              trend="up"
            />
            <StatCard
              label="Total Collected"
              value={fmt(data.overview.totalCollected)}
              delta={`${data.overview.collectionRate}% collection rate`}
              trend="up"
            />
            <StatCard
              label="Total Pending"
              value={fmt(data.overview.totalPending)}
              delta="Pending + partial"
              trend="down"
            />
            <StatCard
              label="Total Overdue"
              value={fmt(data.overview.totalOverdue)}
              delta={`${data.overview.overdueStudentCount} overdue students`}
              trend="down"
            />
            <StatCard
              label="Collection Rate"
              value={`${data.overview.collectionRate}%`}
              delta="Collected vs generated"
              trend="up"
            />
          </div>

          {/* ── Monthly Trend ── */}
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Monthly Fee Collection Trend</h3>
            <p className="text-xs text-muted-foreground">Last 12 months — generated vs collected</p>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="generatedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => fmt(v)}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="generated" name="Fee Generated" stroke="#94a3b8" fill="url(#generatedGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="collected" name="Collected" stroke="hsl(var(--primary))" fill="url(#collectedGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Course-wise + Installment summary ── */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Course-wise Collection</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.courseWise} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="course" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => fmt(v)}
                    />
                    <Bar dataKey="collected" name="Collected" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Installment Tracking</h3>
              <p className="text-xs text-muted-foreground">Paid, pending and overdue installments</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {(["paid", "partial", "pending", "overdue"] as const).map((status) => {
                  const bucket = data.installmentSummary[status];
                  const meta = INSTALLMENT_META[status];
                  return (
                    <div key={status} className={`rounded-lg p-3 ${meta.bg}`}>
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${meta.text}`}>
                        {meta.icon}
                        {meta.label}
                      </div>
                      <div className="mt-1 text-lg font-semibold">{bucket.count}</div>
                      <div className="text-[11px] text-muted-foreground">{fmt(bucket.remainingAmount)} remaining</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Course-wise & Counsellor-wise Tables ── */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border px-5 py-3">
                <h3 className="text-sm font-semibold">Course-wise Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-muted-foreground bg-secondary/30">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Course</th>
                      <th className="px-4 py-2 text-left font-medium">Students</th>
                      <th className="px-4 py-2 text-left font-medium">Collected</th>
                      <th className="px-4 py-2 text-left font-medium">Pending</th>
                      <th className="px-4 py-2 text-left font-medium">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.courseWise.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No data</td></tr>
                    ) : (
                      data.courseWise.map((c) => (
                        <tr key={c.courseId || c.course} className="border-t border-border">
                          <td className="px-4 py-2.5 font-medium">{c.course}</td>
                          <td className="px-4 py-2.5">{c.students}</td>
                          <td className="px-4 py-2.5 text-emerald-700">{fmt(c.collected)}</td>
                          <td className="px-4 py-2.5 text-red-600">{fmt(c.pending)}</td>
                          <td className="px-4 py-2.5">{c.collectionRate}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border px-5 py-3">
                <h3 className="text-sm font-semibold">Counsellor-wise Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-muted-foreground bg-secondary/30">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Counsellor</th>
                      <th className="px-4 py-2 text-left font-medium">Students</th>
                      <th className="px-4 py-2 text-left font-medium">Collected</th>
                      <th className="px-4 py-2 text-left font-medium">Pending</th>
                      <th className="px-4 py-2 text-left font-medium">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.counsellorWise.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No data</td></tr>
                    ) : (
                      data.counsellorWise.map((c) => (
                        <tr key={c.counsellorId || c.counsellor} className="border-t border-border">
                          <td className="px-4 py-2.5 font-medium">{c.counsellor}</td>
                          <td className="px-4 py-2.5">{c.students}</td>
                          <td className="px-4 py-2.5 text-emerald-700">{fmt(c.collected)}</td>
                          <td className="px-4 py-2.5 text-red-600">{fmt(c.pending)}</td>
                          <td className="px-4 py-2.5">{c.collectionRate}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Recent Payments ── */}
          <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Recent Payments</h3>
              <IndianRupee size={14} className="text-muted-foreground" />
            </div>
            <ul className="divide-y divide-border">
              {data.recentPayments.length === 0 ? (
                <li className="px-5 py-6 text-center text-xs text-muted-foreground">No payments yet</li>
              ) : (
                data.recentPayments.map((p) => (
                  <li key={p._id} className="flex items-center justify-between px-5 py-3 text-xs">
                    <div>
                      <div className="font-medium">
                        {typeof p.student === "object" && p.student && "fullName" in (p.student as any)
                          ? (p.student as any).fullName
                          : "—"}
                      </div>
                      <div className="text-muted-foreground">
                        {typeof p.course === "object" && p.course && "title" in (p.course as any)
                          ? (p.course as any).title
                          : "—"}{" "}
                        · {p.paymentMethod}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-emerald-700">{fmt(p.amount)}</div>
                      <div className="text-muted-foreground">{new Date(p.paidAt).toLocaleDateString("en-IN")}</div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default RevenueReports;