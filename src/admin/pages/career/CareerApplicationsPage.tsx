import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useApplications } from "../../../hooks/useApplications";
import { careerApplicationApi } from "../../../services/careerApplication.service";
import type { CareerApplication, ApplicationStatus } from "../../../types/careerApplication";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  RefreshCw,
  Trash2,
  Eye,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Star,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────── constants ── */

const STATUS_OPTIONS: ApplicationStatus[] = [
  "Applied",
  "Shortlisted",
  "Interview Scheduled",
  "Interviewed",
  "Selected",
  "Rejected",
];

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string; dot: string }> = {
  Applied:              { label: "Applied",            className: "bg-blue-50 text-blue-700 border-blue-200",     dot: "bg-blue-500"   },
  Shortlisted:          { label: "Shortlisted",         className: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  "Interview Scheduled":{ label: "Interview Scheduled", className: "bg-amber-50 text-amber-700 border-amber-200",   dot: "bg-amber-500"  },
  Interviewed:          { label: "Interviewed",         className: "bg-indigo-50 text-indigo-700 border-indigo-200",dot: "bg-indigo-500" },
  Selected:             { label: "Selected",            className: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  Rejected:             { label: "Rejected",            className: "bg-red-50 text-red-600 border-red-200",         dot: "bg-red-500"    },
};

/* ─────────────────────── stat card ── */

const StatCard = ({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  accent: string;
}) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className={cn("rounded-lg p-2", accent)}>
        <Icon size={14} className="opacity-80" />
      </div>
    </div>
    <p className="mt-3 text-2xl font-bold tracking-tight text-gray-800">{value}</p>
  </div>
);

/* ─────────────────────── application row ── */

const ApplicationRow = ({
  app,
  onView,
  onDelete,
}: {
  app: CareerApplication;
  onView: () => void;
  onDelete: () => void;
}) => {
  const cfg = STATUS_CONFIG[app.status];
  const name = [app.firstName, app.lastName].filter(Boolean).join(" ");
  const appliedDate = new Date(app.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-border bg-card px-5 py-4 transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:gap-4">
      {/* avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0037FF]/10 text-sm font-bold text-[#0037FF]">
        {name.charAt(0).toUpperCase()}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-gray-800 text-sm truncate">{name}</p>
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", cfg.className)}>
            <span className={cn("mr-1 inline-block h-1.5 w-1.5 rounded-full", cfg.dot)} />
            {cfg.label}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{app.email}</span>
          {app.career?.title && (
            <span className="flex items-center gap-1">
              <Briefcase size={10} />
              {app.career.title}
            </span>
          )}
          {app.currentCompany && (
            <span className="flex items-center gap-1">
              <Building2 size={10} />
              {app.currentCompany}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {appliedDate}
          </span>
        </div>
      </div>

      {/* experience */}
      {app.experience > 0 && (
        <div className="hidden md:block text-xs text-muted-foreground whitespace-nowrap">
          {app.experience} yr{app.experience !== 1 ? "s" : ""}
        </div>
      )}

      {/* actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-xs"
          onClick={onView}
        >
          <Eye size={12} />
          View
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
          onClick={onDelete}
        >
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  );
};

/* ─────────────────────── main page ── */

export default function CareerApplicationsPage() {
  const navigate = useNavigate();
  const { applications, total, page, totalPages, loading, error, fetchApplications, deleteApplication } =
    useApplications();

  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<CareerApplication | null>(null);
  const [stats, setStats]           = useState({ total: 0, applied: 0, shortlisted: 0, interviewed: 0, selected: 0, rejected: 0 });

  /* load stats */
  useEffect(() => {
    careerApplicationApi.getDashboardStats()
      .then(res => setStats(res.data))
      .catch(() => {});
  }, [applications]);

  /* search + filter triggers re-fetch */
  const handleSearch = () => {
    fetchApplications({ page: 1, status: filterStatus === "all" ? undefined : filterStatus, search: search || undefined });
  };

  const handleStatusFilter = (val: string) => {
    setFilterStatus(val);
    fetchApplications({ page: 1, status: val === "all" ? undefined : val, search: search || undefined });
  };

  const handlePageChange = (p: number) => {
    fetchApplications({ page: p, status: filterStatus === "all" ? undefined : filterStatus, search: search || undefined });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteApplication(deleteTarget._id);
    setDeleteTarget(null);
  };

  return (
    <AdminLayout
      title="Applications"
      subtitle="Review and manage all job applications"
      actions={
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => navigate("/admin/careers")}
        >
          <ChevronLeft size={15} />
          Back to Careers
        </Button>
      }
    >
      {/* stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 mb-6">
        <StatCard label="Total"       value={stats.total}       icon={Users}        accent="bg-blue-50 text-blue-600" />
        <StatCard label="Applied"     value={stats.applied}     icon={Clock}        accent="bg-slate-100 text-slate-600" />
        <StatCard label="Shortlisted" value={stats.shortlisted} icon={Star}         accent="bg-purple-50 text-purple-600" />
        <StatCard label="Interviewed" value={stats.interviewed} icon={BarChart3}    accent="bg-indigo-50 text-indigo-600" />
        <StatCard label="Selected"    value={stats.selected}    icon={CheckCircle2} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Rejected"    value={stats.rejected}    icon={XCircle}      accent="bg-red-50 text-red-500" />
      </div>

      {/* filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="h-9 pl-9 bg-secondary/60 border-transparent focus-visible:bg-background text-sm"
          />
        </div>
        <Select value={filterStatus} onValueChange={handleStatusFilter}>
          <SelectTrigger className="h-9 w-[180px] text-sm bg-secondary/60 border-transparent">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => fetchApplications({ page: 1 })}
          title="Refresh"
        >
          <RefreshCw size={14} />
        </Button>
      </div>

      {/* list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[72px] rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
          {error} —{" "}
          <button className="underline font-medium" onClick={() => fetchApplications()}>
            retry
          </button>
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 py-16 text-center">
          <Users size={36} className="text-muted-foreground mb-3 opacity-40" />
          <p className="font-medium text-gray-700">No applications found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filterStatus !== "all" || search ? "Try adjusting your filters" : "Applications will appear here once candidates apply"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {applications.map(app => (
            <ApplicationRow
              key={app._id}
              app={app}
              onView={() => navigate(`/admin/career-applications/${app._id}`)}
              onDelete={() => setDeleteTarget(app)}
            />
          ))}

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3">
              <p className="text-xs text-muted-foreground">
                Showing {applications.length} of {total} applications
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  <ChevronLeft size={14} />
                </Button>
                <span className="px-3 text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete application?</AlertDialogTitle>
            <AlertDialogDescription>
              The application from{" "}
              <strong>
                {deleteTarget?.firstName} {deleteTarget?.lastName}
              </strong>{" "}
              will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}