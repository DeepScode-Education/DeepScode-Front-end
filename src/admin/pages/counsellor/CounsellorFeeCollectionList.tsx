import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search, Eye, RefreshCw, AlertCircle,
  Clock, CheckCircle2, Circle, LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  feeCollectionApi,
  type FeeListItem,
  type Pagination,
  type FeeStatus,
} from "@/integrations/feeCollectionApi";
import CounsellorLayout from "@/admin/components/CounsellorLayout";

const fmt = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const statusConfig: Record<FeeStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  paid:     { label: "Paid",     bg: "bg-emerald-50", text: "text-emerald-700", icon: <CheckCircle2 size={12} /> },
  partial:  { label: "Partial",  bg: "bg-blue-50",    text: "text-blue-700",    icon: <Circle size={12} /> },
  pending:  { label: "Pending",  bg: "bg-amber-50",   text: "text-amber-700",   icon: <Clock size={12} /> },
  overdue:  { label: "Overdue",  bg: "bg-red-50",     text: "text-red-700",     icon: <AlertCircle size={12} /> },
  "no-plan":{ label: "No Plan",  bg: "bg-gray-50",    text: "text-gray-500",    icon: <Circle size={12} /> },
};

const StatusBadge = ({ status }: { status: FeeStatus }) => {
  const cfg = statusConfig[status] ?? statusConfig["pending"];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
};

const CollectionBar = ({ paid, total }: { paid: number; total: number }) => {
  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  const color = pct === 100 ? "bg-emerald-500" : pct > 50 ? "bg-blue-500" : pct > 0 ? "bg-amber-400" : "bg-gray-300";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 rounded-full bg-secondary overflow-hidden flex-shrink-0">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-muted-foreground">{pct}%</span>
    </div>
  );
};

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
];

const CounsellorFeeCollectionList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<FeeListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
	console.log("load callled");
    setLoading(true);
    setError(null);
    try {
      const res = await feeCollectionApi.getList({ page, limit: 20, search, status: statusFilter });
  console.log("API Response:", res);
console.log("Items:", res.data);
      setItems(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message || "Failed to load fee collection");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => load(), search ? 400 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

   const handleSearchChange = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
	<CounsellorLayout title="Fee Collection"
      subtitle="Manage student fee payments and follow-ups."
      >
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Fee Collection</h1>
            <p className="text-sm text-muted-foreground">Manage student fee payments and follow-ups.</p>
          </div>
          <div className="flex gap-2">
            {/* <Button variant="outline" size="sm" onClick={() => navigate("/counsellor/fee-collection/dashboard")}>
              <LayoutDashboard size={14} className="mr-1" /> Dashboard
            </Button> */}
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID or email…"
              className="pl-9 h-9 bg-secondary/60 border-transparent"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setStatusFilter(f.value); setPage(1); }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-[#0037FF] text-white"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="ml-auto text-xs text-muted-foreground">
            {loading ? "Loading…" : `${pagination.total} students`}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b border-border bg-secondary/30">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Student</th>
                  <th className="px-5 py-3 text-left font-medium">Course</th>
                  <th className="px-5 py-3 text-left font-medium">Total Fee</th>
                  <th className="px-5 py-3 text-left font-medium">Paid</th>
                  <th className="px-5 py-3 text-left font-medium">Remaining</th>
                  <th className="px-5 py-3 text-left font-medium">Collection</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Due Date</th>
                  <th className="px-5 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-muted-foreground">Loading…</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-muted-foreground">No fee records found</td></tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item._id}
                      className={`border-b border-border last:border-0 hover:bg-secondary/40 cursor-pointer transition-colors ${
                        item.feeStatus === "overdue" ? "bg-red-50/30" : item.feeStatus === "paid" ? "bg-emerald-50/20" : ""
                      }`}
                      onClick={() => navigate(`/counsellor/fee-collection/${item.studentData._id}`)}
                    >
                      <td className="px-5 py-3">
                        <div className="font-medium">{item.studentData?.fullName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">#{item.studentData?.studentId || "—"}</div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">{item.courseData?.title || "—"}</td>
                      <td className="px-5 py-3 font-medium">{fmt(item.finalFee || item.totalFees)}</td>
                      <td className="px-5 py-3 text-emerald-700 font-medium">{fmt(item.totalPaid)}</td>
                      <td className="px-5 py-3 text-red-600 font-medium">{fmt(item.remainingAmount)}</td>
                      <td className="px-5 py-3"><CollectionBar paid={item.totalPaid} total={item.finalFee || item.totalFees} /></td>
                      <td className="px-5 py-3"><StatusBadge status={item.feeStatus} /></td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {item.nextDueDate ? new Date(item.nextDueDate).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <Button
                          variant="ghost" size="sm" className="h-7 px-2 text-xs"
                          onClick={(e) => { e.stopPropagation(); navigate(`/counsellor/fee-collection/${item.studentData._id}`); }}
                        >
                          <Eye size={13} /> View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-5 py-3 bg-secondary/20">
              <span className="text-xs text-muted-foreground">Page {pagination.page} of {pagination.totalPages} · {pagination.total} records</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </CounsellorLayout>
  );
};

export default CounsellorFeeCollectionList;