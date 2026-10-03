import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IndianRupee, AlertCircle, CheckCircle2,
  Clock, TrendingDown, Receipt, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  feeCollectionApi,
  type FeeDashboard,
  type PaymentRecord,
} from "@/integrations/feeCollectionApi";
import CounsellorLayout from "@/admin/components/CounsellorLayout";


const fmt = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const pct = (n: number) =>
  `${n.toLocaleString("en-IN", { maximumFractionDigits: 1 })}%`;

const KPICard = ({ label, value, icon, accent, sub }: {
  label: string; value: string; icon: React.ReactNode; accent: string; sub?: string;
}) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
      </div>
      <div className={`rounded-lg p-2.5 ${accent}`}>{icon}</div>
    </div>
  </div>
);

const Bar = ({ label, count, total, color }: {
  label: string; count: number; total: number; color: string;
}) => {
  const pv = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="capitalize text-muted-foreground">{label}</span>
        <span className="font-medium">{count} <span className="text-muted-foreground">({pv}%)</span></span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pv}%` }} />
      </div>
    </div>
  );
};

// ── Main component — NO AdminLayout, apna layout khud ──────────────────────
const CounsellorFeeCollectionDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<FeeDashboard | null>(null);
  const [recentPayments, setRecentPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      setDashboard(await feeCollectionApi.getDashboard());
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadRecentPayments = async () => {
    setPaymentsLoading(true);
    try {
      const { data } = await feeCollectionApi.getRecentPayments(1, 8);
      setRecentPayments(data);
    } catch { /* non-fatal */ }
    finally { setPaymentsLoading(false); }
  };

  useEffect(() => { loadDashboard(); loadRecentPayments(); }, []);

  const sb = dashboard?.statusBreakdown;

  return (
	<CounsellorLayout title="Fee Collection"
      subtitle="Track payments, follow-ups and overdue accounts." >
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Fee Collection</h1>
            <p className="text-sm text-muted-foreground">
              Track payments, follow-ups and overdue accounts.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadDashboard}>
              <RefreshCw size={14} className="mr-1" /> Refresh
            </Button>
            <Button
              size="sm"
              className="bg-[#0037FF] text-white hover:bg-[#0028cc]"
              onClick={() => navigate("/counsellor/fee-collection")}
            >
              View All Students
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <KPICard label="Today's Collection" value={loading ? "…" : fmt(dashboard?.todayCollection ?? 0)} icon={<IndianRupee size={18} className="text-emerald-600" />} accent="bg-emerald-50" />
          <KPICard label="Monthly Collection" value={loading ? "…" : fmt(dashboard?.monthlyCollection ?? 0)} icon={<TrendingDown size={18} className="text-blue-600" />} accent="bg-blue-50" sub="This month" />
          <KPICard label="Total Collected" value={loading ? "…" : fmt(dashboard?.totalCollection ?? 0)} icon={<Receipt size={18} className="text-indigo-600" />} accent="bg-indigo-50" />
          <KPICard label="Pending Collection" value={loading ? "…" : fmt(dashboard?.pendingCollection ?? 0)} icon={<Clock size={18} className="text-amber-600" />} accent="bg-amber-50" />
          <KPICard label="Overdue Amount" value={loading ? "…" : fmt(dashboard?.overdueAmount ?? 0)} icon={<AlertCircle size={18} className="text-red-600" />} accent="bg-red-50" sub={`${dashboard?.overdueStudents ?? 0} students`} />
          <KPICard label="Collection %" value={loading ? "…" : pct(dashboard?.collectionPercent ?? 0)} icon={<CheckCircle2 size={18} className="text-teal-600" />} accent="bg-teal-50" />
        </div>

        {/* Breakdown + Recent Payments */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-4">Fee Status Breakdown</h3>
            {loading ? (
              <p className="text-xs text-muted-foreground">Loading…</p>
            ) : sb ? (
              <div className="space-y-4">
                <Bar label="Paid" count={sb.paid} total={sb.total} color="bg-emerald-500" />
                <Bar label="Partial" count={sb.partial} total={sb.total} color="bg-blue-500" />
                <Bar label="Pending" count={sb.pending} total={sb.total} color="bg-amber-400" />
                <Bar label="Overdue" count={sb.overdue} total={sb.total} color="bg-red-500" />
                <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total students</span>
                  <span className="font-semibold">{sb.total}</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-border bg-card lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-sm font-semibold">Recent Payments</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/counsellor/fee-collection")}>
                View all
              </Button>
            </div>
            {paymentsLoading ? (
              <p className="px-5 py-4 text-xs text-muted-foreground">Loading…</p>
            ) : recentPayments.length === 0 ? (
              <p className="px-5 py-4 text-xs text-muted-foreground">No payments recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-5 py-2 text-left font-medium">Student</th>
                      <th className="px-5 py-2 text-left font-medium">Amount</th>
                      <th className="px-5 py-2 text-left font-medium">Method</th>
                      <th className="px-5 py-2 text-left font-medium">Receipt</th>
                      <th className="px-5 py-2 text-left font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((p) => (
                      <tr
                        key={p._id}
                        className="border-b border-border last:border-0 hover:bg-secondary/40 cursor-pointer"
                        onClick={() => {
                          const sid = typeof p.student === "string" ? p.student : (p.student as any)?._id;
                          if (sid) navigate(`/counsellor/fee-collection/${sid}`);
                        }}
                      >
                        <td className="px-5 py-3">
                          <div className="font-medium">{typeof p.student === "object" ? (p.student as any)?.fullName : "—"}</div>
                          <div className="text-[11px] text-muted-foreground">{typeof p.student === "object" ? (p.student as any)?.studentId : ""}</div>
                        </td>
                        <td className="px-5 py-3 font-semibold text-emerald-700">{fmt(p.amount)}</td>
                        <td className="px-5 py-3 text-muted-foreground text-xs">{p.paymentMethod}</td>
                        <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{p.receiptNumber || "—"}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(p.paidAt).toLocaleDateString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </CounsellorLayout>
  );
};

export default CounsellorFeeCollectionDashboard;