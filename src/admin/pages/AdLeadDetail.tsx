import { useEffect, useState } from "react";
import { ArrowLeft, Check, LoaderCircle, RotateCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AdLead = Record<string, unknown>;

const STATUS_OPTIONS = ["new", "contacted", "interested", "follow-up", "converted", "lost"];

const FIELDS = [
  { label: "Full name", keys: ["fullName", "full_name", "name", "leadName", "lead_name"] },
  { label: "Phone", keys: ["phone", "phoneNumber", "phone_number", "mobile", "contact"] },
  { label: "Email", keys: ["email", "emailAddress", "email_address"] },
  { label: "City", keys: ["city", "location", "town"] },
  { label: "Profile", keys: ["profile", "profileName", "profile_name"] },
  { label: "Course", keys: ["course", "courseName", "course_name", "courseTitle", "course_title"] },
  { label: "Source", keys: ["source", "leadSource", "lead_source"] },
  { label: "Form type", keys: ["formType", "form_type", "formName", "form_name", "form"] },
  { label: "Landing page", keys: ["landingPage", "landing_page", "landingUrl", "landing_url", "pageUrl", "page_url"] },
  { label: "Campaign", keys: ["campaign", "campaignName", "campaign_name"] },
  { label: "UTM source", keys: ["utmSource", "utm_source"] },
  { label: "UTM medium", keys: ["utmMedium", "utm_medium"] },
  { label: "UTM campaign", keys: ["utmCampaign", "utm_campaign"] },
  { label: "Status", keys: ["status", "leadStatus", "lead_status"] },
  { label: "Created date", keys: ["createdAt", "created_at", "submittedAt", "submitted_at"] },
  { label: "Updated date", keys: ["updatedAt", "updated_at", "modifiedAt", "modified_at"] },
] as const;

const asDisplayValue = (value: unknown): string => {
  if (value == null || value === "") return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(asDisplayValue).filter(Boolean).join(", ");
  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    for (const key of ["name", "title", "label", "value"]) {
      const display = asDisplayValue(object[key]);
      if (display) return display;
    }
    return JSON.stringify(value, null, 2);
  }
  return "";
};

const readValue = (lead: AdLead, keys: readonly string[]) => {
  for (const key of keys) {
    const value = asDisplayValue(lead[key]);
    if (value) return value;
  }
  return "";
};

const formatDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const getLeadName = (lead: AdLead) => {
  const fullName = readValue(lead, FIELDS[0].keys);
  return fullName || [asDisplayValue(lead.firstName ?? lead.first_name), asDisplayValue(lead.lastName ?? lead.last_name)].filter(Boolean).join(" ");
};

const normalizeLead = (payload: unknown): AdLead | null => {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as Record<string, unknown>;
  const data = body.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const nested = data as Record<string, unknown>;
    if (nested.lead && typeof nested.lead === "object") return nested.lead as AdLead;
    return nested as AdLead;
  }
  if (body.lead && typeof body.lead === "object") return body.lead as AdLead;
  return body as AdLead;
};

const getErrorMessage = async (response: Response, fallback: string) => {
  try {
    const body = await response.json();
    if (typeof body?.message === "string") return body.message;
  } catch {
    // Use the fallback for non-JSON error responses.
  }
  return fallback;
};

const formatLabel = (key: string) => key
  .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  .replace(/[_-]+/g, " ")
  .replace(/\b\w/g, (character) => character.toUpperCase());

const AdLeadDetail = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<AdLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadLead = async () => {
      setLoading(true);
      setLoadError("");
      try {
        if (!id) throw new Error("Ad lead ID is missing.");
        const token = localStorage.getItem("token");
        const apiBase = import.meta.env.VITE_API_BASE || "";
        const response = await fetch(`${apiBase}/api/ad-leads/${encodeURIComponent(id)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(await getErrorMessage(response, "Unable to load this ad lead."));
        const record = normalizeLead(await response.json());
        if (!record) throw new Error("The API returned an invalid ad lead record.");
        setLead(record);
        setSelectedStatus(readValue(record, FIELDS[13].keys));
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setLoadError(cause instanceof Error ? cause.message : "Unable to load this ad lead.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadLead();
    return () => controller.abort();
  }, [id, reloadKey]);

  const currentStatus = lead ? readValue(lead, FIELDS[13].keys) : "";
  const statusOptions = Array.from(new Set([...STATUS_OPTIONS, currentStatus].filter(Boolean)));
  const knownKeys = new Set(FIELDS.flatMap((field) => field.keys.map((key) => key.toLowerCase())));
  const additionalFields = lead
    ? Object.entries(lead).filter(([key, value]) =>
      !["_id", "id", "__v"].includes(key.toLowerCase()) &&
      !knownKeys.has(key.toLowerCase()) &&
      value != null && value !== ""
    )
    : [];

  const updateStatus = async () => {
    if (!id || !selectedStatus || selectedStatus === currentStatus) return;
    setSavingStatus(true);
    setStatusError("");
    setStatusSuccess("");
    try {
      const token = localStorage.getItem("token");
      const apiBase = import.meta.env.VITE_API_BASE || "";
      const response = await fetch(`${apiBase}/api/ad-leads/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: selectedStatus }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response, "Unable to update lead status."));
      const payload = await response.json().catch(() => null);
      const updatedLead = normalizeLead(payload);
      setLead((existing) => existing
        ? { ...existing, ...(updatedLead ?? {}), status: selectedStatus }
        : existing);
      setStatusSuccess("Status updated successfully.");
    } catch (cause) {
      setStatusError(cause instanceof Error ? cause.message : "Unable to update lead status.");
    } finally {
      setSavingStatus(false);
    }
  };

  const title = lead ? getLeadName(lead) || "Ad Lead" : "Ad Lead";

  return (
    <AdminLayout
      title={title}
      subtitle="Google Ads lead details and attribution."
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/marketing/ad-leads")}>
          <ArrowLeft size={15} /> Back to Ad Leads
        </Button>
      }
    >
      {loading ? (
        <div className="space-y-4" aria-label="Loading ad lead details">
          <div className="h-28 animate-pulse rounded-lg border border-border bg-card" />
          <div className="h-72 animate-pulse rounded-lg border border-border bg-card" />
        </div>
      ) : loadError ? (
        <section role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
          <h2 className="font-semibold text-destructive">Couldn’t load this ad lead</h2>
          <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setReloadKey((key) => key + 1)}>
            <RotateCw size={14} /> Try again
          </Button>
        </section>
      ) : lead && (
        <div className="space-y-5">
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.7fr)]">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Ad lead</p>
                  <h2 className="mt-1 break-words text-xl font-semibold">{getLeadName(lead) || "Name not provided"}</h2>
                  <p className="mt-2 break-all text-sm text-muted-foreground">
                    {readValue(lead, FIELDS[1].keys) || "Phone not provided"}
                    {readValue(lead, FIELDS[2].keys) ? ` · ${readValue(lead, FIELDS[2].keys)}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize text-foreground">
                  {currentStatus || "Status unavailable"}
                </span>
              </div>
            </div>

            <section className="rounded-lg border border-border bg-card p-5" aria-labelledby="status-heading">
              <h2 id="status-heading" className="text-sm font-semibold">Update status</h2>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Select value={selectedStatus} onValueChange={(value) => { setSelectedStatus(value); setStatusError(""); setStatusSuccess(""); }}>
                  <SelectTrigger aria-label="Ad lead status" className="min-w-0 flex-1">
                    <SelectValue placeholder="Choose a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={() => void updateStatus()} disabled={savingStatus || !selectedStatus || selectedStatus === currentStatus}>
                  {savingStatus ? <LoaderCircle size={15} className="animate-spin" /> : <Check size={15} />}
                  {savingStatus ? "Saving..." : "Save status"}
                </Button>
              </div>
              {statusError && <p role="alert" className="mt-2 text-sm text-destructive">{statusError}</p>}
              {statusSuccess && <p role="status" className="mt-2 text-sm text-emerald-700">{statusSuccess}</p>}
            </section>
          </section>

          <section className="rounded-lg border border-border bg-card p-5" aria-labelledby="lead-information-heading">
            <div className="mb-4">
              <h2 id="lead-information-heading" className="font-semibold">Lead information</h2>
              <p className="mt-1 text-sm text-muted-foreground">Contact details, course interest, and source information.</p>
            </div>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
              {FIELDS.filter((field) => !["Status"].includes(field.label)).map((field) => {
                const rawValue = readValue(lead, field.keys);
                const value = field.label.includes("date") ? formatDate(rawValue) : rawValue;
                return (
                  <div key={field.label} className="min-w-0 border-b border-border pb-3">
                    <dt className="text-xs font-medium text-muted-foreground">{field.label}</dt>
                    <dd className="mt-1 break-words text-sm font-medium">{value || "—"}</dd>
                  </div>
                );
              })}
            </dl>
          </section>

          {additionalFields.length > 0 && (
            <section className="rounded-lg border border-border bg-card p-5" aria-labelledby="additional-information-heading">
              <h2 id="additional-information-heading" className="mb-4 font-semibold">Additional information</h2>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                {additionalFields.map(([key, value]) => (
                  <div key={key} className="min-w-0 border-b border-border pb-3">
                    <dt className="text-xs font-medium text-muted-foreground">{formatLabel(key)}</dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words text-sm">{asDisplayValue(value) || "—"}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdLeadDetail;