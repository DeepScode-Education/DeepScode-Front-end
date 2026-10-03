import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Search,
  ChevronRight,
  FileText,
  Mail,
  Phone,
} from "lucide-react";
import AdminLayout from "@/admin/components/AdminLayout";
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
  opportunitiesApi,
  opportunityApplicationApi,
  type Opportunity,
  type OpportunityApplication,
  type OpportunityApplicationStatus,
} from "@/integrations/client";

const STATUS_LABELS: Record<OpportunityApplicationStatus, string> = {
  applied: "Applied",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  selected: "Selected",
};

const STATUS_COLORS: Record<OpportunityApplicationStatus, string> = {
  applied: "bg-secondary text-muted-foreground",
  under_review: "bg-amber-500/10 text-amber-600",
  shortlisted: "bg-[#0037FF]/10 text-[#0037FF]",
  rejected: "bg-destructive/10 text-destructive",
  selected: "bg-emerald-500/10 text-emerald-600",
};

const unwrap = (res: any) =>
  res?.data !== undefined && res?.success === undefined ? res.data : res;

type SortOrder = "newest" | "oldest";

const ApplicantsList = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [applicants, setApplicants] = useState<OpportunityApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OpportunityApplicationStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const fetchData = useCallback(async () => {
    if (!opportunityId) return;
    setLoading(true);
    setError(null);
    try {
      const [oppRes, appsRes] = await Promise.all([
        opportunitiesApi.getById(opportunityId),
        opportunityApplicationApi.getForOpportunity(opportunityId),
      ]);
      const opp = unwrap(oppRes);
      const apps = unwrap(appsRes);
      if (!opp?.success) throw new Error(opp?.message || "Failed to load opportunity");
      if (!apps?.success) throw new Error(apps?.message || "Failed to load applicants");
      setOpportunity(opp.data);
      setApplicants(apps.data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load applicants");
    } finally {
      setLoading(false);
    }
  }, [opportunityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    let list = [...applicants];

    if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) => a.fullName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? -diff : diff;
    });

    return list;
  }, [applicants, search, statusFilter, sortOrder]);

  return (
    <AdminLayout
      title="Applicants"
      subtitle={
        opportunity
          ? `${opportunity.jobTitle} · ${opportunity.companyEntity || "—"} · ${
              opportunity.primaryLocation || "—"
            }`
          : "Loading opportunity..."
      }
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/opportunities")}>
          <ArrowLeft size={14} /> Back to Opportunities
        </Button>
      }
    >
      {loading ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading applicants...
        </div>
      ) : error ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchData}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {applicants.length} application{applicants.length === 1 ? "" : "s"} total
              {filtered.length !== applicants.length ? ` · ${filtered.length} shown` : ""}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-56 pl-8 text-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="h-9 w-40 text-sm">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
                <SelectTrigger className="h-9 w-36 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card text-center text-muted-foreground">
              <p className="text-sm">
                {applicants.length === 0 ? "No applications received yet." : "No applicants match your filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Applied</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Resume</th>
                    <th className="w-8 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr
                      key={a._id}
                      onClick={() => navigate(`/admin/opportunities/${opportunityId}/applicants/${a._id}`)}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium">{a.fullName}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Mail size={12} /> {a.email}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {a.phone ? (
                          <span className="flex items-center gap-1.5">
                            <Phone size={12} /> {a.phone}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[a.status]}`}>
                          {STATUS_LABELS[a.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {a.resume?.url ? (
                          <span className="flex items-center gap-1.5 text-[#0037FF]">
                            <FileText size={12} /> Available
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        <ChevronRight size={14} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default ApplicantsList;