import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Search, Eye, Plus } from "lucide-react";
import CounsellorLayout from "../../components/CounsellorLayout";
import DataTable, { StatusBadge } from "../../components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLeads, useLeadDashboard } from "../../hooks/useLeads";
import { useCourses } from "@/admin/hooks/useCourses";
import { getCourseLabel } from "../../../utils/lead";

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  new:         "neutral",
  contacted:   "warning",
  interested:  "success",
  "follow-up": "warning",
  converted:   "success",
  lost:        "danger",
};

// ── Lead Health options (same set used in Lead Detail) ─────────────────────
const LEAD_HEALTH_OPTIONS = [
  "Untouched",
  "Hot",
  "Warm",
  "Cold",
  "Dead",
  "Fake",
  "Not picked",
  "Not reachable",
  "Collaboration",
] as const;

const HEALTH_EMOJI: Record<string, string> = {
  Untouched: "⚪",
  Hot: "🟢",
  Warm: "🟠",
  Cold: "🔵",
  Dead: "⚫",
  Fake: "🟣",
  "Not picked": "🟡",
  "Not reachable": "🔴",
  Collaboration: "🔷",
};

const formatFollowUpDate = (value: string | number | null | undefined) => {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (value: string | number | null | undefined) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "—";

const CounsellorLeads = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Filters live in the URL — this is what makes them survive a
  // navigate-to-detail-and-back round trip, and what the "Back" button on
  // the detail page relies on (it does history.back()). ──────────────────
  const search     = searchParams.get("search") || "";
  const status     = searchParams.get("status") || "";
  const course     = searchParams.get("course") || "";
  const leadHealth = searchParams.get("leadHealth") || "";
  const page       = parseInt(searchParams.get("page") || "1", 10) || 1;

  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => { setSearchInput(search); }, [search]);

  const { courses } = useCourses();

  const updateParams = (updates: Record<string, string>, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v); else next.delete(k);
    });
    if (resetPage) next.set("page", "1");
    setSearchParams(next);
  };

  const { leads, pagination, loading } = useLeads({ page, search, status, course, leadHealth });
  const { stats } = useLeadDashboard({ search, status, course, leadHealth });

  const goToDetail = (id: string) => {
    navigate(`/counsellor/leads/${id}`, { state: { from: `${location.pathname}${location.search}` } });
  };

  const total = pagination?.total ?? 0;
  const limit = pagination?.limit ?? 50;
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);


  return (
    <CounsellorLayout
      title="My Leads"
      subtitle="Leads assigned to you."
      actions={
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, phone…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") updateParams({ search: searchInput }); }}
              onBlur={() => updateParams({ search: searchInput })}
              className="h-8 w-full md:w-56 pl-8 text-sm"
            />
          </div>

          <select
            value={status}
            onChange={(e) => updateParams({ status: e.target.value })}
            className="h-8 w-full md:w-40 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="today">Today</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="follow-up">Follow-up</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>

          <select
            value={leadHealth}
            onChange={(e) => updateParams({ leadHealth: e.target.value })}
            className="h-8 w-full md:w-44 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">All Health</option>
            {LEAD_HEALTH_OPTIONS.map((h) => (
              <option key={h} value={h}>
                {HEALTH_EMOJI[h]} {h}
              </option>
            ))}
          </select>

          {/* <select
            value={course}
            onChange={(e) => updateParams({ course: e.target.value })}
            className="h-8 w-full md:w-40 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">All Courses</option>
            <option value="UiUX">UI/UX</option>
            <option value="GraphicDesign">Graphic Design</option>
            <option value="MotionVFX">Motion VFX</option>
            <option value="3D">3D</option>
            <option value="Marketing">Marketing</option>
            <option value="Data">Data</option>
          </select> */}
<select
  value={course}
  onChange={(e) => updateParams({ course: e.target.value })}
  className="h-8 rounded-md border border-input bg-background px-2 text-sm"
>
  <option value="">All Courses</option>
  {courses.map((c) => (
    <option key={c._id} value={c._id}>{c.title}</option>
  ))}
</select>
          <Button
            size="sm"
            className="h-8 w-full md:w-auto gap-1.5 text-white"
            onClick={() => navigate("/counsellor/leads/new")}
          >
            <Plus size={14} />
            Add Lead
          </Button>
        </div>
      }
    >
      {/* Stats row */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Total",     value: stats?.totalLeads       ?? "…" },
          { label: "New",       value: stats?.newLeads         ?? "…" },
          { label: "Contacted", value: stats?.contactedLeads   ?? "…" },
          { label: "Follow-up", value: stats?.followUpsPending ?? "…" },
          { label: "Converted", value: stats?.convertedLeads   ?? "…" },
          { label: "Lost",      value: stats?.lostLeads        ?? "…" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          Loading leads…
        </div>
      ) : (
        <DataTable
          rows={leads}
          onRowClick={(r) => goToDetail(r._id)}
          columns={[
            {
              key: "fullName",
              label: "Name",
              render: (r) => <span className="font-medium">{r.fullName}</span>,
            },
            {
              key: "mobileNumber",
              label: "Phone",
              render: (r: { mobileNumber: string | number }) => (
                <>
                  <span className="hidden sm:inline">{r.mobileNumber}</span>
                  <a
                    href={`tel:${r.mobileNumber}`}
                    onClick={(e: { stopPropagation: () => any; }) => e.stopPropagation()}
                    className="sm:hidden text-primary underline"
                  >
                    {r.mobileNumber}
                  </a>
                </>
              ),
            },
            { key: "email",  label: "Email" },
            {
  key: "course",
  label: "Course",
  render: (r: any) => getCourseLabel(r.course),
},
            {
              key: "leadStatus",
              label: "Status",
              render: (r: { leadStatus: string }) => (
                <StatusBadge tone={STATUS_TONE[r.leadStatus] ?? "neutral"}>
                  {r.leadStatus}
                </StatusBadge>
              ),
            },
            {
              key: "leadHealth",
              label: "Health",
              render: (r: any) => (
                <span className="text-sm">
                  {HEALTH_EMOJI[r.leadHealth || "Untouched"]} {r.leadHealth || "Untouched"}
                </span>
              ),
            },
            {
              key: "nextFollowUpDate",
              label: "Next Follow Up",
              render: (r: { nextFollowUpDate: string | number; }) =>
                r.nextFollowUpDate
                  ? formatFollowUpDate(r.nextFollowUpDate)
                  : <span className="text-muted-foreground">—</span>,
            },
            { key: "createdAt", label: "Created", render: (r: { createdAt: string | number; }) => formatDate(r.createdAt) },
            {
              key: "actions",
              label: "",
              render: (r: { _id: any; }) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToDetail(r._id);
                  }}
                >
                  <Eye size={14} />
                </Button>
              ),
            },
          ]}
        />
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>{total === 0 ? "Showing 0 of 0" : `Showing ${rangeStart}–${rangeEnd} of ${total}`}</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(page - 1) }, false)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination || page >= pagination.totalPages}
            onClick={() => updateParams({ page: String(page + 1) }, false)}
          >
            Next
          </Button>
        </div>
      </div>
    </CounsellorLayout>
  );
};

export default CounsellorLeads;
