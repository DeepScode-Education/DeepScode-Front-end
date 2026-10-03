// src/admin/pages/Portfolio.tsx
//
// Admin Portfolio Management Dashboard.
// Route: /admin/portfolio  (already present in AdminLayout's NAV config)

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, ChevronLeft, ChevronRight, Eye , Plus } from "lucide-react";
import AdminLayout from "../../components/AdminLayout"; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AdminPortfolioListParams,
  Portfolio,
  PortfolioCategory,
  PortfolioStatus,
  adminPortfolioApi,
} from "@/integrations/client";


const STATUS_OPTIONS: { value: PortfolioStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  // { value: "needs_changes", label: "Needs Changes" },
  { value: "rejected", label: "Rejected" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const CATEGORY_OPTIONS: { value: PortfolioCategory | ""; label: string }[] = [
  { value: "", label: "All Categories" },
  { value: "Design", label: "Design" },
  { value: "Marketing", label: "Marketing" },
  { value: "3D", label: "3D" },
  { value: "Data", label: "Data" },
  { value: "Tech", label: "Tech" },
];

const STATUS_DOT: Record<PortfolioStatus, string> = {
  draft: "bg-gray-400",
  pending: "bg-amber-400",
  approved: "bg-emerald-400",
  rejected: "bg-red-400",
  // needs_changes: "bg-orange-400",
  published: "bg-[#0037FF]",
  archived: "bg-gray-300",
};

const AdminPortfolioDashboard = () => {
  const navigate = useNavigate();

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<PortfolioStatus | "">("");
  const [category, setCategory] = useState<PortfolioCategory | "">("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, category]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: AdminPortfolioListParams = {
          page,
          limit: 10,
          search: debouncedSearch || undefined,
          status: status || undefined,
          category: category || undefined,
        };
        const res = await adminPortfolioApi.getAll(params);
        setPortfolios(res.portfolios);
        setPagination({
          total: res.pagination.total,
          pages: res.pagination.pages,
          limit: res.pagination.limit,
        });
      } catch (err: any) {
        setError(err?.message || "Could not load portfolios.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, debouncedSearch, status, category]);

  // const studentName = (p: Portfolio) =>
  //   typeof p.student === "object" ? p.student.fullName : "—";

  const studentName = (p: Portfolio) =>
  p.externalStudent
    ? p.studentName || "—"
    : typeof p.student === "object" && p.student
    ? p.student.fullName
    : "—";

    

  return (
    // <AdminLayout
    //   title="Portfolio Management"
    //   subtitle="Review, approve, and publish student project submissions."
    // >
    <AdminLayout
  title="Portfolio Management"
  subtitle="Review, approve, and publish student project submissions."
  actions={
    <Button
      onClick={() => navigate("/admin/portfolio/external/new")}
      className="gap-2 text-white bg-[#0037FF] hover:bg-[#0037FF]/90"
    >
      <Plus size={16} />
      Add External Student Portfolio
    </Button>
  }
>
      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project or course title…"
            className="pl-9"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as PortfolioStatus | "")}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as PortfolioCategory | "")}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-muted-foreground">
          {pagination.total} project{pagination.total === 1 ? "" : "s"}
        </span>
      </div>

      {loading && (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0037FF] border-t-transparent" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && portfolios.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No projects match these filters.
        </div>
      )}

      {!loading && !error && portfolios.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {portfolios.map((p) => (
                <tr
                  key={p._id}
                  className="cursor-pointer border-t border-border hover:bg-secondary/40"
                  onClick={() => navigate(`/admin/portfolio/${p._id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.featured && <Star size={13} className="shrink-0 text-amber-500" fill="currentColor" />}
                      <span className="line-clamp-1 font-medium text-foreground">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{studentName(p)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[p.status]}`} />
                      <span className="capitalize text-muted-foreground">
                        {p.status.replace("_", " ")}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Eye size={14} />
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && pagination.pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="gap-1"
          >
            <ChevronLeft size={14} />
            Prev
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
            className="gap-1"
          >
            Next
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPortfolioDashboard;