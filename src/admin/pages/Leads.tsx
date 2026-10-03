
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Search, Eye, Plus, Trash2, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "../components/AdminLayout";
import DataTable, { StatusBadge } from "../components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useLeads,
  useLeadDashboard,
  useCounsellors,
  bulkDeleteLeads,
  bulkAssignLeads,
} from "../hooks/useLeads";
import { useCourses } from "../hooks/useCourses";
import { getCourseLabel } from "../../utils/lead";

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  new: "neutral",
  contacted: "warning",
  interested: "success",
  "follow-up": "warning",
  converted: "success",
  lost: "danger",
};

const LEAD_HEALTH_OPTIONS = [
  "Untouched", "Hot", "Warm", "Cold", "Dead", "Fake", "Not picked", "Not reachable", "Collaboration",
] as const;

const HEALTH_EMOJI: Record<string, string> = {
  Untouched: "⚪", Hot: "🟢", Warm: "🟠", Cold: "🔵", Dead: "⚫",
  Fake: "🟣", "Not picked": "🟡", "Not reachable": "🔴", Collaboration: "🔷",
};

const formatFollowUpDate = (value: string | number | null | undefined) => {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const formatDate = (value: string | number | null | undefined) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "—";

const Leads = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [exporting, setExporting] = useState(false);

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const course = searchParams.get("course") || "";
  const leadHealth = searchParams.get("leadHealth") || "";
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;

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

  const { leads, pagination, loading, refetch } = useLeads({ page, search, status, course, leadHealth });
  const { stats } = useLeadDashboard({ search, status, course, leadHealth });
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const isAdminOrSuper = user?.role === "admin" || user?.role === "super_admin";

  // ── Bulk selection state ──────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { counsellors } = useCounsellors();
  const [assignTargetId, setAssignTargetId] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);

  // Clear stale selections whenever the visible list changes (filters/page change)
  useEffect(() => {
    setSelectedIds(new Set());
    setAssignTargetId("");
  }, [page, search, status, course, leadHealth]);

  const allSelected = leads.length > 0 && leads.every((l) => selectedIds.has(l._id));
  const someSelected = leads.some((l) => selectedIds.has(l._id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (allSelected) return new Set();
      const next = new Set(prev);
      leads.forEach((l) => next.add(l._id));
      return next;
    });
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} selected lead(s)? This cannot be undone.`)) return;

    setBulkBusy(true);
    try {
      const json = await bulkDeleteLeads(ids);
      if (json.success) {
        clearSelection();
        refetch();
      } else {
        alert(json.message || "Failed to delete selected leads");
      }
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkAssign = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!assignTargetId) {
      alert("Select a counsellor to assign to");
      return;
    }

    setBulkBusy(true);
    try {
      const json = await bulkAssignLeads(ids, assignTargetId);
      if (json.success) {
        clearSelection();
        setAssignTargetId("");
        refetch();
      } else {
        alert(json.message || "Failed to assign selected leads");
      }
    } finally {
      setBulkBusy(false);
    }
  };

  // Snap to nearest valid page if filtering/deleting made the current one invalid
  useEffect(() => {
    if (pagination && pagination.totalPages > 0 && page > pagination.totalPages) {
      updateParams({ page: String(pagination.totalPages) }, false);
    }
  }, [pagination]);



const handleExportLeads = async () => {
  if (exporting) return;

  setExporting(true);

  try {
    const token = localStorage.getItem("token");

    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (course) params.set("course", course);
    if (leadHealth) params.set("leadHealth", leadHealth);

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE}/api/leads/export?${params.toString()}`,
      {
        method: "GET",
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      }
    );

    if (!res.ok) {
      let message = "Failed to export leads";

      try {
        const json = await res.json();
        message = json.message || message;
      } catch {
        // Response was not JSON
      }

      throw new Error(message);
    }

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export leads error:", error);
    alert(error.message || "Failed to export leads");
  } finally {
    setExporting(false);
  }
};


  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete lead "${name}"? This cannot be undone.`)) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/leads/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const json = await res.json();
    if (json.success) {
      refetch();
    } else {
      alert(json.message || "Failed to delete lead");
    }
  };

  const goToDetail = (id: string) => {
    navigate(`/admin/leads/${id}`, { state: { from: `${location.pathname}${location.search}` } });
  };

  const total = pagination?.total ?? 0;
  const limit = pagination?.limit ?? 50;
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  return (
    <AdminLayout
      title="Leads"
      subtitle="All inquiries and CRM leads in one place."
      actions={
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-items-center">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") updateParams({ search: searchInput }); }}
              onBlur={() => updateParams({ search: searchInput })}
              className="pl-8 h-8 w-56 text-sm"
            />
          </div>

          <select
            value={status}
            onChange={(e) => updateParams({ status: e.target.value })}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
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
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">All Health</option>
            {LEAD_HEALTH_OPTIONS.map((h) => (
              <option key={h} value={h}>{HEALTH_EMOJI[h]} {h}</option>
            ))}
          </select>

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
  variant="outline"
  className="h-8 gap-1.5"
  onClick={handleExportLeads}
  disabled={exporting || loading}
>
  <Download size={14} />
  {exporting ? "Exporting..." : "Export Leads"}
</Button>

          <Button size="sm" className="h-8 gap-1.5 text-white" onClick={() => navigate("/admin/leads/new")}>
            <Plus size={14} /> Add Lead
          </Button>
        </div>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
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

      {/* ── Bulk actions bar — only visible to admin/super_admin, shown when something is selected ── */}
      {isAdminOrSuper && someSelected && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
          <span className="text-sm font-medium">
            {selectedIds.size} lead{selectedIds.size !== 1 ? "s" : ""} selected
          </span>

          <select
            value={assignTargetId}
            onChange={(e) => setAssignTargetId(e.target.value)}
            disabled={bulkBusy}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">Select counsellor...</option>
            {counsellors.map((c) => (
              <option key={c._id} value={c._id}>{c.fullName}</option>
            ))}
          </select>

          <Button
            size="sm"
            variant="outline"
            className="h-8"
            disabled={bulkBusy || !assignTargetId}
            onClick={handleBulkAssign}
          >
            Assign Counsellor
          </Button>

          {isSuperAdmin && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-destructive hover:text-destructive"
              disabled={bulkBusy}
              onClick={handleBulkDelete}
            >
              <Trash2 size={14} className="mr-1.5" /> Delete Selected
            </Button>
          )}

          <Button size="sm" variant="ghost" className="h-8" onClick={clearSelection} disabled={bulkBusy}>
            Clear selection
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Loading leads...</div>
      ) : (
        <DataTable
          rows={leads}
          onRowClick={(r) => goToDetail(r._id)}
          columns={[
            {
              key: "select",
              label: (
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Select all leads"
                />
              ) as any,
              render: (r) => (
                <input
                  type="checkbox"
                  checked={selectedIds.has(r._id)}
                  onChange={() => toggleSelectOne(r._id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select ${r.fullName}`}
                />
              ),
            },
            { key: "fullName", label: "Name", render: (r) => <span className="font-medium">{r.fullName}</span> },
            {
              key: "mobileNumber", label: "Phone",
              render: (r) => (
                <>
                  <span className="hidden sm:inline">{r.mobileNumber}</span>
                  <a href={`tel:${r.mobileNumber}`} onClick={(e) => e.stopPropagation()} className="sm:hidden text-primary underline">
                    {r.mobileNumber}
                  </a>
                </>
              ),
            },
            { key: "email", label: "Email" },
            {
              key: "course",
              label: "Course",
              render: (r: any) => getCourseLabel(r.course),
            },
            {
              key: "leadStatus", label: "Status",
              render: (r) => <StatusBadge tone={STATUS_TONE[r.leadStatus] ?? "neutral"}>{r.leadStatus}</StatusBadge>,
            },
            {
              key: "leadHealth", label: "Health",
              render: (r: any) => <span className="text-sm">{HEALTH_EMOJI[r.leadHealth || "Untouched"]} {r.leadHealth || "Untouched"}</span>,
            },
            {
              key: "nextFollowUpDate", label: "Next Follow Up",
              render: (r) => r.nextFollowUpDate ? formatFollowUpDate(r.nextFollowUpDate) : <span className="text-muted-foreground">—</span>,
            },
            { key: "createdAt", label: "Created", render: (r) => formatDate(r.createdAt) },
            {
              key: "actions", label: "",
              render: (r) => (
                <div style={{ display: "flex", gap: 4 }}>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); goToDetail(r._id); }}>
                    <Eye size={14} />
                  </Button>
                  {isSuperAdmin && (
                    <Button
                      variant="ghost" size="sm" className="text-destructive hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleDelete(r._id, r.fullName); }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>{total === 0 ? "Showing 0 of 0" : `Showing ${rangeStart}–${rangeEnd} of ${total}`}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) }, false)}>
            Previous
          </Button>
          <Button
            variant="outline" size="sm"
            disabled={!pagination || page >= pagination.totalPages}
            onClick={() => updateParams({ page: String(page + 1) }, false)}
          >
            Next
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Leads;