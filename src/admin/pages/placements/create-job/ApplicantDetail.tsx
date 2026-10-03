import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Copy,
  FileText,
  ExternalLink,
  Calendar,
} from "lucide-react";
import AdminLayout from "@/admin/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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

const ApplicantDetail = () => {
  const { opportunityId, applicationId } = useParams<{
    opportunityId: string;
    applicationId: string;
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [application, setApplication] = useState<OpportunityApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusDraft, setStatusDraft] = useState<OpportunityApplicationStatus>("applied");
  const [remarksDraft, setRemarksDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!opportunityId || !applicationId) return;
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
      if (!apps?.success) throw new Error(apps?.message || "Failed to load applicant");

      const found = (apps.data || []).find((a: OpportunityApplication) => a._id === applicationId);
      if (!found) throw new Error("Applicant not found for this opportunity");

      setOpportunity(opp.data);
      setApplication(found);
      setStatusDraft(found.status);
      setRemarksDraft(found.adminRemarks || "");
    } catch (err: any) {
      setError(err?.message || "Failed to load applicant");
    } finally {
      setLoading(false);
    }
  }, [opportunityId, applicationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const copyToClipboard = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: `${label} copied` });
    } catch {
      toast({ title: `Could not copy ${label.toLowerCase()}`, variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!application) return;
    setSaving(true);
    try {
      const res = unwrap(
        await opportunityApplicationApi.updateStatus(application._id, statusDraft, remarksDraft)
      );
      if (!res?.success) throw new Error(res?.message || "Failed to update applicant");
      setApplication(res.data);
      toast({ title: "Applicant updated", description: `Status set to ${STATUS_LABELS[statusDraft]}.` });
    } catch (err: any) {
      toast({ title: "Failed to update", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    application && (statusDraft !== application.status || remarksDraft !== (application.adminRemarks || ""));

  return (
    <AdminLayout
      title="Applicant Details"
      subtitle={opportunity ? `${opportunity.jobTitle} · ${opportunity.companyEntity || "—"}` : "Loading..."}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/admin/opportunities/${opportunityId}/applicants`)}
        >
          <ArrowLeft size={14} /> Back to Applicants
        </Button>
      }
    >
      {loading ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading applicant...
        </div>
      ) : error || !application ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card text-center">
          <p className="text-sm text-destructive">{error || "Applicant not found"}</p>
          <Button size="sm" variant="outline" onClick={fetchData}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Left: main content */}
          <div className="space-y-4 lg:col-span-2">
            {/* Candidate header */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">{application.fullName}</h2>
                  <div className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
                    <button
                      onClick={() => copyToClipboard(application.email, "Email")}
                      className="flex items-center gap-1.5 hover:text-foreground"
                    >
                      <Mail size={13} /> {application.email} <Copy size={11} />
                    </button>
                    {application.phone && (
                      <button
                        onClick={() => copyToClipboard(application.phone!, "Phone")}
                        className="flex items-center gap-1.5 hover:text-foreground"
                      >
                        <Phone size={13} /> {application.phone} <Copy size={11} />
                      </button>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      Applied {new Date(application.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[application.status]}`}
                >
                  {STATUS_LABELS[application.status]}
                </span>
              </div>
            </div>

            {/* Cover letter */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Cover Letter</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {application.coverLetter?.trim() || "No cover letter submitted."}
              </p>
            </div>

            {/* Resume */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Resume</h3>
              {application.resume?.url ? (
                <a
                  href={application.resume.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-[#0037FF] hover:bg-[#0037FF]/5"
                >
                  <FileText size={14} />
                  {application.resume.originalName || "View Resume"}
                  <ExternalLink size={12} />
                </a>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No resume uploaded.</p>
              )}
            </div>

            {/* Portfolio / external links */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Portfolio &amp; Links</h3>
              {application.links && application.links.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {application.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted/50"
                    >
                      {link.type === "Other" && link.label ? link.label : link.type}
                      <ExternalLink size={11} />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No links provided.</p>
              )}
            </div>
          </div>

          {/* Right: status & remarks */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Application Status</h3>
              <Select value={statusDraft} onValueChange={(v) => setStatusDraft(v as OpportunityApplicationStatus)}>
                <SelectTrigger className="mt-3 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <h3 className="mt-4 text-sm font-semibold">Admin Notes</h3>
              <Textarea
                value={remarksDraft}
                onChange={(e) => setRemarksDraft(e.target.value)}
                placeholder="Internal notes about this candidate..."
                className="mt-2 min-h-[100px] text-sm"
              />

              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="mt-4 w-full text-white"
                size="sm"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ApplicantDetail;