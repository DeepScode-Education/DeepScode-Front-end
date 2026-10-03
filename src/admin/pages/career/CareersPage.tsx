import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useCareers } from "@/hooks/useCareers";
import type { Career, CareerStatus } from "@/types/career";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  Radio,
  Archive,
  FileText,
  Briefcase,
  MapPin,
  Clock,
  Users,
  Star,
  StarOff,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────── helpers ── */

const STATUS_CONFIG: Record<
  CareerStatus,
  { label: string; className: string }
> = {
  Draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  },
  Published: {
    label: "Published",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  Closed: {
    label: "Closed",
    className: "bg-red-50 text-red-600 border border-red-200",
  },
};

const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "HR",
  "Operations",
  "Finance",
  "Support",
  "Other",
];

const WORK_MODE_COLORS: Record<string, string> = {
  Remote: "bg-blue-50 text-blue-700",
  Hybrid: "bg-purple-50 text-purple-700",
  Onsite: "bg-amber-50 text-amber-700",
};

/* ─────────────────────────────────────────── stat card ── */

const StatCard = ({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: typeof Briefcase;
  accent: string;
}) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <div className={cn("rounded-lg p-2", accent)}>
        <Icon size={14} className="opacity-80" />
      </div>
    </div>
    <p className="mt-3 text-2xl font-bold tracking-tight text-gray-800">
      {value}
    </p>
  </div>
);

/* ─────────────────────────────────────────── career row ── */

const CareerRow = ({
  career,
  onEdit,
  onDelete,
  onStatusChange,
  onViewApps,
}: {
  career: Career;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: CareerStatus) => void;
  onViewApps: () => void;
}) => {
  const statusCfg = STATUS_CONFIG[career.status];

  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-border bg-card px-5 py-4 transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:gap-4">
      {/* featured dot */}
      <div className="hidden sm:flex items-center">
        {career.featured ? (
          <Star size={14} className="text-amber-400 fill-amber-400" />
        ) : (
          <StarOff size={14} className="text-gray-300" />
        )}
      </div>

      {/* main info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">
            {career.title}
          </h3>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              statusCfg.className
            )}
          >
            {statusCfg.label}
          </span>
          {career.featured && (
            <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700 sm:hidden">
              Featured
            </span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Briefcase size={11} />
            {career.department}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {career.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {career.employmentType}
          </span>
          <span className="flex items-center gap-1">
            <Users size={11} />
            {career.openings} opening{career.openings !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* work mode pill */}
      <span
        className={cn(
          "self-start rounded-full px-2.5 py-0.5 text-[11px] font-medium sm:self-center",
          WORK_MODE_COLORS[career.workMode] ?? "bg-gray-100 text-gray-600"
        )}
      >
        {career.workMode}
      </span>

      {/* experience */}
      <div className="hidden md:block text-xs text-muted-foreground whitespace-nowrap">
        {career.experience.min}–{career.experience.max} yrs
      </div>

      {/* actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* View Applications button */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs hidden sm:flex border-[#0037FF]/30 text-[#0037FF] hover:bg-[#0037FF]/5 hover:text-[#0037FF]"
          onClick={onViewApps}
        >
          <Users size={12} />
          Applications
        </Button>

        {/* Three-dot dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <MoreVertical size={15} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil size={13} className="mr-2" />
              Edit
            </DropdownMenuItem>
            {/* Mobile-only: view applications inside dropdown */}
            <DropdownMenuItem
              onClick={onViewApps}
              className="sm:hidden"
            >
              <Users size={13} className="mr-2" />
              View Applications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {career.status !== "Published" && (
              <DropdownMenuItem onClick={() => onStatusChange("Published")}>
                <Radio size={13} className="mr-2 text-emerald-600" />
                Publish
              </DropdownMenuItem>
            )}
            {career.status !== "Draft" && (
              <DropdownMenuItem onClick={() => onStatusChange("Draft")}>
                <FileText size={13} className="mr-2 text-gray-500" />
                Move to Draft
              </DropdownMenuItem>
            )}
            {career.status !== "Closed" && (
              <DropdownMenuItem onClick={() => onStatusChange("Closed")}>
                <Archive size={13} className="mr-2 text-red-500" />
                Close
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 size={13} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────── main page ── */

export default function CareersPage() {
  const navigate = useNavigate();
  const { careers, loading, error, deleteCareer, updateStatus, fetchCareers } =
    useCareers();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<Career | null>(null);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  /* derived list */
  const filtered = careers.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" || c.status === filterStatus;
    const matchDept =
      filterDept === "all" || c.department === filterDept;
    return matchSearch && matchStatus && matchDept;
  });

  /* stats */
  const stats = {
    total: careers.length,
    published: careers.filter((c) => c.status === "Published").length,
    draft: careers.filter((c) => c.status === "Draft").length,
    closed: careers.filter((c) => c.status === "Closed").length,
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteCareer(deleteTarget._id);
    setDeleteTarget(null);
  };

  const handleStatusChange = async (id: string, status: CareerStatus) => {
    setStatusLoading(id);
    try {
      await updateStatus(id, status);
    } finally {
      setStatusLoading(null);
    }
  };

  return (
    <AdminLayout
      title="Careers"
      subtitle="Manage job openings and track applications"
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-[#0037FF] border-[#0037FF]/30 hover:bg-[#0037FF]/5"
            onClick={() => navigate("/admin/career-applications")}
          >
            <Users size={14} />
            All Applications
          </Button>
          <Button
            size="sm"
            className="bg-[#0037FF] hover:bg-[#0030e0] text-white gap-1.5"
            onClick={() => navigate("/admin/careers/new")}
          >
            <Plus size={15} />
            New Position
          </Button>
        </div>
      }
    >
      {/* stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <StatCard
          label="Total"
          value={stats.total}
          icon={Briefcase}
          accent="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Published"
          value={stats.published}
          icon={Eye}
          accent="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Draft"
          value={stats.draft}
          icon={FileText}
          accent="bg-gray-100 text-gray-600"
        />
        <StatCard
          label="Closed"
          value={stats.closed}
          icon={Archive}
          accent="bg-red-50 text-red-500"
        />
      </div>

      {/* filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by title, department, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 bg-secondary/60 border-transparent focus-visible:bg-background text-sm"
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-9 w-[140px] text-sm bg-secondary/60 border-transparent">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Published">Published</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="h-9 w-[160px] text-sm bg-secondary/60 border-transparent">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={fetchCareers}
          title="Refresh"
        >
          <RefreshCw size={14} />
        </Button>
      </div>

      {/* list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
          {error} —{" "}
          <button className="underline font-medium" onClick={fetchCareers}>
            retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 py-16 text-center">
          <Briefcase size={36} className="text-muted-foreground mb-3 opacity-40" />
          <p className="font-medium text-gray-700">No positions found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search || filterStatus !== "all" || filterDept !== "all"
              ? "Try adjusting your filters"
              : "Create your first job opening to get started"}
          </p>
          {!search && filterStatus === "all" && filterDept === "all" && (
            <Button
              size="sm"
              className="mt-4 bg-[#0037FF] hover:bg-[#0030e0] text-white gap-1.5"
              onClick={() => navigate("/admin/careers/new")}
            >
              <Plus size={14} />
              New Position
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((career) => (
            <CareerRow
              key={career._id}
              career={career}
              onEdit={() => navigate(`/admin/careers/${career._id}/edit`)}
              onDelete={() => setDeleteTarget(career)}
              onStatusChange={(s) => handleStatusChange(career._id, s)}
              onViewApps={() =>
                navigate(`/admin/career-applications?careerId=${career._id}`)
              }
            />
          ))}
          <p className="pt-2 text-right text-xs text-muted-foreground">
            Showing {filtered.length} of {careers.length} positions
          </p>
        </div>
      )}

      {/* delete dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete position?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.title}</strong> will be permanently
              removed. This action cannot be undone.
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