import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Search, Eye } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import DataTable from "../../components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupportTickets, useSupportTicketStats } from "../../hooks/useSupportTickets";

const ISSUE_TYPES = ["Payment", "Course", "Account", "Technical", "Live Class", "Other"];

const formatDate = (value: string | number | null | undefined) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "—";

const AdminSupportTickets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const priority = searchParams.get("priority") || "";
  const issueType = searchParams.get("issueType") || "";
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;

  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => { setSearchInput(search); }, [search]);

  const updateParams = (updates: Record<string, string>, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v); else next.delete(k);
    });
    if (resetPage) next.set("page", "1");
    setSearchParams(next);
  };

  const { tickets, pagination, loading } = useSupportTickets({ page, search, status, priority, issueType });
  const { stats } = useSupportTicketStats({ search, priority, issueType });

  // Snap to nearest valid page if filtering made the current one invalid
  useEffect(() => {
    if (pagination && pagination.totalPages > 0 && page > pagination.totalPages) {
      updateParams({ page: String(pagination.totalPages) }, false);
    }
  }, [pagination]);

  const goToDetail = (id: string) => {
    navigate(`/admin/support-tickets/${id}`, { state: { from: `${location.pathname}${location.search}` } });
  };

  const total = pagination?.total ?? 0;
  const limit = pagination?.limit ?? 50;
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  return (
    <AdminLayout
      title="Support Tickets"
      subtitle="All support tickets submitted by students and guests."
      actions={
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-items-center">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search ticket #, name, email, phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") updateParams({ search: searchInput }); }}
              onBlur={() => updateParams({ search: searchInput })}
              className="pl-8 h-8 w-64 text-sm"
            />
          </div>

          <select
            value={status}
            onChange={(e) => updateParams({ status: e.target.value })}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={priority}
            onChange={(e) => updateParams({ priority: e.target.value })}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={issueType}
            onChange={(e) => updateParams({ issueType: e.target.value })}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">All Issue Types</option>
            {ISSUE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: "Total",       value: stats?.total      ?? "…" },
          { label: "Open",        value: stats?.open       ?? "…" },
          { label: "In Progress", value: stats?.inProgress ?? "…" },
          { label: "Resolved",    value: stats?.resolved   ?? "…" },
          { label: "Closed",      value: stats?.closed     ?? "…" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Loading tickets...</div>
      ) : (
        <DataTable
          rows={tickets}
          onRowClick={(r) => goToDetail(r._id)}
          columns={[
            {
              key: "ticketNumber", label: "Ticket #",
              render: (r) => <span className="font-mono font-medium">{r.ticketNumber}</span>,
            },
            { key: "fullName", label: "Student Name", render: (r) => <span className="font-medium">{r.fullName}</span> },
            { key: "email", label: "Email" },
            {
              key: "phone", label: "Phone",
              render: (r) =>
                r.phone ? (
                  <>
                    <span className="hidden sm:inline">{r.phone}</span>
                    <a
                      href={`tel:${r.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="sm:hidden text-primary underline"
                    >
                      {r.phone}
                    </a>
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                ),
            },
            { key: "issueType", label: "Issue Type" },
            {
              key: "studentId", label: "Student ID",
              render: (r) => r.studentId || <span className="text-muted-foreground">—</span>,
            },
            { key: "createdAt", label: "Created", render: (r) => formatDate(r.createdAt) },
            {
              key: "actions", label: "",
              render: (r) => (
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); goToDetail(r._id); }}>
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

export default AdminSupportTickets;