import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Search, RotateCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdLead = Record<string, unknown> & { _id?: string; id?: string };

const PAGE_SIZE = 20;

const FIELD_ALIASES = {
  name: ["name", "fullName", "full_name", "leadName", "lead_name"],
  phone: ["phone", "phoneNumber", "phone_number", "mobile", "contact"],
  email: ["email", "emailAddress", "email_address"],
  city: ["city", "location", "town"],
  course: ["course", "courseName", "course_name", "courseTitle", "course_title"],
  formType: ["formType", "form_type", "formName", "form_name", "form"],
  status: ["status", "leadStatus", "lead_status"],
  campaign: ["campaign", "campaignName", "campaign_name"],
  landingPage: ["landingPage", "landing_page", "landingUrl", "landing_url", "pageUrl", "page_url"],
  createdAt: ["createdAt", "created_at", "submittedAt", "submitted_at", "timestamp"],
} as const;

const asText = (value: unknown): string => {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(", ");
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    for (const key of ["name", "title", "label", "value"]) {
      const text = asText(object[key]);
      if (text) return text;
    }
  }
  return "";
};

const readField = (lead: AdLead, aliases: readonly string[]) => {
  for (const key of aliases) {
    const value = asText(lead[key]);
    if (value) return value;
  }
  return "";
};

const getLeadName = (lead: AdLead) => {
  const name = readField(lead, FIELD_ALIASES.name);
  if (name) return name;
  return [asText(lead.firstName ?? lead.first_name), asText(lead.lastName ?? lead.last_name)]
    .filter(Boolean)
    .join(" ");
};

const getLeadId = (lead: AdLead, index: number) =>
  asText(lead._id ?? lead.id) || `ad-lead-${index}`;

const formatDate = (value: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const getLeadFields = (lead: AdLead) => [
  ["Name", getLeadName(lead)],
  ["Phone", readField(lead, FIELD_ALIASES.phone)],
  ["Email", readField(lead, FIELD_ALIASES.email)],
  ["City", readField(lead, FIELD_ALIASES.city)],
  ["Course", readField(lead, FIELD_ALIASES.course)],
  ["Form type", readField(lead, FIELD_ALIASES.formType)],
  ["Status", readField(lead, FIELD_ALIASES.status)],
  ["Campaign", readField(lead, FIELD_ALIASES.campaign)],
  ["Landing page", readField(lead, FIELD_ALIASES.landingPage)],
  ["Created", formatDate(readField(lead, FIELD_ALIASES.createdAt))],
];

const getStatusClass = (status: string) => {
  const value = status.toLowerCase();
  if (["converted", "qualified", "won"].includes(value)) return "bg-emerald-50 text-emerald-700";
  if (["new", "open", "pending"].includes(value)) return "bg-blue-50 text-blue-700";
  if (["lost", "closed", "invalid"].includes(value)) return "bg-rose-50 text-rose-700";
  return "bg-secondary text-muted-foreground";
};

const getResponseLeads = (response: unknown): AdLead[] => {
  if (Array.isArray(response)) return response as AdLead[];
  if (!response || typeof response !== "object") return [];

  const body = response as Record<string, unknown>;
  const data = body.data;
  if (Array.isArray(data)) return data as AdLead[];
  if (data && typeof data === "object") {
    const nested = data as Record<string, unknown>;
    for (const key of ["leads", "items", "results", "records"]) {
      if (Array.isArray(nested[key])) return nested[key] as AdLead[];
    }
  }
  for (const key of ["leads", "items", "results", "records"]) {
    if (Array.isArray(body[key])) return body[key] as AdLead[];
  }
  return [];
};

const AdLeads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<AdLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [formFilter, setFormFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const loadLeads = async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const apiBase = import.meta.env.VITE_API_BASE || "";
      const response = await fetch(`${apiBase}/api/ad-leads`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal,
      });
      if (!response.ok) {
        let message = "Unable to load ad leads.";
        try {
          const body = await response.json();
          if (typeof body?.message === "string") message = body.message;
        } catch {
          // Keep the default message when the API response is not JSON.
        }
        throw new Error(message);
      }
      setLeads(getResponseLeads(await response.json()));
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setError(cause instanceof Error ? cause.message : "Unable to load ad leads.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void loadLeads(controller.signal);
    return () => controller.abort();
  }, []);

  const options = useMemo(() => {
    const distinct = (field: keyof typeof FIELD_ALIASES) =>
      Array.from(new Set(leads.map((lead) => readField(lead, FIELD_ALIASES[field])).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b));
    return { courses: distinct("course"), forms: distinct("formType"), statuses: distinct("status") };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (courseFilter && readField(lead, FIELD_ALIASES.course) !== courseFilter) return false;
      if (formFilter && readField(lead, FIELD_ALIASES.formType) !== formFilter) return false;
      if (statusFilter && readField(lead, FIELD_ALIASES.status) !== statusFilter) return false;
      if (!query) return true;
      return getLeadFields(lead).some(([, value]) => String(value).toLowerCase().includes(query));
    });
  }, [leads, search, courseFilter, formFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
  const visibleLeads = filteredLeads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const updateFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };
  const rangeStart = filteredLeads.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = Math.min(page * PAGE_SIZE, filteredLeads.length);

  const renderStatus = (status: string) => status ? (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(status)}`}>
      {status}
    </span>
  ) : <span className="text-muted-foreground">—</span>;

  return (
    <AdminLayout title="Ad Leads" subtitle="Google Ads leads and campaign attribution.">
      <div className="space-y-5">
        <section className="rounded-lg border border-border bg-card p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => updateFilter(setSearch)(event.target.value)}
                placeholder="Search leads..."
                aria-label="Search ad leads"
                className="h-10 pl-9"
              />
            </div>
            <select aria-label="Filter by course" value={courseFilter} onChange={(event) => updateFilter(setCourseFilter)(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All courses</option>
              {options.courses.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <select aria-label="Filter by form type" value={formFilter} onChange={(event) => updateFilter(setFormFilter)(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All form types</option>
              {options.forms.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <select aria-label="Filter by status" value={statusFilter} onChange={(event) => updateFilter(setStatusFilter)(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All statuses</option>
              {options.statuses.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>{filteredLeads.length.toLocaleString()} leads</span>
            <Button variant="outline" size="sm" onClick={() => void loadLeads()} disabled={loading}>
              <RotateCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>
        </section>

        {error && (
          <div role="alert" className="flex flex-col items-start justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void loadLeads()}>Try again</Button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3" aria-label="Loading ad leads">
            {[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-lg border border-border bg-card" />)}
          </div>
        ) : !error && filteredLeads.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card px-5 py-14 text-center">
            <h2 className="text-base font-semibold">{leads.length ? "No matching ad leads" : "No ad leads yet"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{leads.length ? "Try changing or clearing your search and filters." : "Google Ads leads will appear here when they are received."}</p>
            {leads.length > 0 && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearch(""); setCourseFilter(""); setFormFilter(""); setStatusFilter(""); setPage(1); }}>
                Clear filters
              </Button>
            )}
          </div>
        ) : !error && (
          <>
            <div className="hidden overflow-hidden rounded-lg border border-border bg-card lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1180px] text-left text-sm">
                  <thead className="border-b border-border bg-secondary/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      {["Name", "Phone", "Email", "City", "Course", "Form type", "Status", "Campaign", "Landing page", "Created", ""].map((label) => <th key={label || "actions"} className="px-3 py-3 font-semibold">{label}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {visibleLeads.map((lead, index) => {
                      const fields = getLeadFields(lead);
                      const byName = Object.fromEntries(fields);
                      return (
                        <tr key={getLeadId(lead, index)} className="align-top hover:bg-secondary/30">
                          <td className="max-w-40 px-3 py-3">
                            <button
                              type="button"
                              className="text-left font-medium hover:text-[#0037FF]"
                              onClick={() => navigate(`/admin/ad-leads/${encodeURIComponent(getLeadId(lead, index))}`)}
                            >
                              {byName.Name || "—"}
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3">{byName.Phone || "—"}</td>
                          <td className="max-w-48 break-all px-3 py-3">{byName.Email || "—"}</td>
                          <td className="px-3 py-3">{byName.City || "—"}</td>
                          <td className="max-w-36 px-3 py-3">{byName.Course || "—"}</td>
                          <td className="max-w-36 px-3 py-3">{byName["Form type"] || "—"}</td>
                          <td className="px-3 py-3">{renderStatus(byName.Status)}</td>
                          <td className="max-w-40 px-3 py-3">{byName.Campaign || "—"}</td>
                          <td className="max-w-48 break-all px-3 py-3">{byName["Landing page"] || "—"}</td>
                          <td className="whitespace-nowrap px-3 py-3">{byName.Created}</td>
                          <td className="px-3 py-3">
                            <Button variant="ghost" size="icon" aria-label={`View ${byName.Name || "lead"} details`} onClick={() => navigate(`/admin/ad-leads/${encodeURIComponent(getLeadId(lead, index))}`)}>
                              <Eye size={16} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
              {visibleLeads.map((lead, index) => {
                const fields = getLeadFields(lead);
                const byName = Object.fromEntries(fields);
                return (
                  <article key={getLeadId(lead, index)} className="min-w-0 rounded-lg border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <button
                          type="button"
                          className="block max-w-full truncate text-left font-semibold hover:text-[#0037FF]"
                          onClick={() => navigate(`/admin/ad-leads/${encodeURIComponent(getLeadId(lead, index))}`)}
                        >
                          {byName.Name || "Unnamed lead"}
                        </button>
                        <p className="mt-1 break-all text-sm text-muted-foreground">{byName.Phone || "—"}</p>
                        <p className="break-all text-sm text-muted-foreground">{byName.Email || "—"}</p>
                      </div>
                      {renderStatus(byName.Status)}
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                      {fields.slice(3, 6).map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="break-words font-medium">{value || "—"}</dd></div>)}
                      {fields.slice(7).map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="break-words font-medium">{value || "—"}</dd></div>)}
                    </dl>
                    <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => navigate(`/admin/ad-leads/${encodeURIComponent(getLeadId(lead, index))}`)}>
                      <Eye size={14} /> View details
                    </Button>
                  </article>
                );
              })}
            </div>

            {pageCount > 1 && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">Showing {rangeStart}–{rangeEnd} of {filteredLeads.length}</p>
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} aria-label="Previous page"><ChevronLeft size={16} />Previous</Button>
                  <span className="min-w-20 text-center text-sm text-muted-foreground">Page {page} of {pageCount}</span>
                  <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount} aria-label="Next page">Next<ChevronRight size={16} /></Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </AdminLayout>
  );
};

export default AdLeads;