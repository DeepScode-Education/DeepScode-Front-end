import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { careerApplicationApi } from "@/services/careerApplication.service";
import type { CareerApplication, ApplicationStatus } from "@/types/careerApplication";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  Linkedin,
  Github,
  Globe,
  FileText,
  Download,
  Calendar,
  Clock,
  Save,
  CheckCircle2,
  User,
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
  Applied:              { label: "Applied",            className: "bg-blue-50 text-blue-700 border-blue-200",      dot: "bg-blue-500"    },
  Shortlisted:          { label: "Shortlisted",         className: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500"  },
  "Interview Scheduled":{ label: "Interview Scheduled", className: "bg-amber-50 text-amber-700 border-amber-200",    dot: "bg-amber-500"   },
  Interviewed:          { label: "Interviewed",         className: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500"  },
  Selected:             { label: "Selected",            className: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  Rejected:             { label: "Rejected",            className: "bg-red-50 text-red-600 border-red-200",          dot: "bg-red-500"     },
};

/* ─────────────────────── helpers ── */

const InfoRow = ({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value?: string | number;
  href?: string;
}) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        <Icon size={13} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
          {label}
        </p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#0037FF] hover:underline break-all"
          >
            {String(value)}
          </a>
        ) : (
          <p className="text-sm text-gray-800 break-all">{String(value)}</p>
        )}
      </div>
    </div>
  );
};

const Card = ({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) => (
  <div className={cn("rounded-xl border border-border bg-card px-5 py-5", className)}>
    {title && (
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
    )}
    {children}
  </div>
);

/* ─────────────────────── page ── */

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [app, setApp]           = useState<CareerApplication | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [status, setStatus]     = useState<ApplicationStatus>("Applied");
  const [remarks, setRemarks]   = useState("");
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await careerApplicationApi.getById(id);
        setApp(res.data);
        setStatus(res.data.status);
        setRemarks(res.data.adminRemarks ?? "");
      } catch (err: any) {
        setError(err.message || "Failed to load application");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await careerApplicationApi.updateStatus(id, status, remarks);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Application">
        <div className="flex h-40 items-center justify-center">
          <Loader2 size={22} className="animate-spin text-[#0037FF]" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !app) {
    return (
      <AdminLayout title="Application">
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-12 text-center">
          <AlertCircle size={28} className="text-red-400 mb-2" />
          <p className="font-medium text-red-600">{error || "Application not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 text-sm text-red-500 underline"
          >
            Go back
          </button>
        </div>
      </AdminLayout>
    );
  }

  const name = [app.firstName, app.lastName].filter(Boolean).join(" ");
  const cfg  = STATUS_CONFIG[app.status];
  const appliedDate = new Date(app.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  const appliedTime = new Date(app.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <AdminLayout
      title="Application Detail"
      subtitle={`Reviewing application from ${name}`}
      actions={
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => navigate("/admin/career-applications")}
        >
          <ChevronLeft size={15} />
          All Applications
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* ── left: candidate info ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* header card */}
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* avatar */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0037FF]/10 text-2xl font-bold text-[#0037FF]">
                {name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900">{name}</h1>
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", cfg.className)}>
                    <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", cfg.dot)} />
                    {cfg.label}
                  </span>
                </div>
                {app.career?.title && (
                  <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
                    <Briefcase size={13} />
                    Applied for <strong className="text-gray-700">{app.career.title}</strong>
                    {app.career.location && (
                      <>
                        <span className="text-gray-300">·</span>
                        <MapPin size={11} />{app.career.location}
                      </>
                    )}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />{appliedDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />{appliedTime}
                  </span>
                </p>
              </div>
            </div>
          </Card>

          {/* contact & personal */}
          <Card title="Contact Information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow icon={Mail}      label="Email"           value={app.email}          href={`mailto:${app.email}`} />
              <InfoRow icon={Phone}     label="Phone"           value={app.phone}          href={`tel:${app.phone}`} />
              <InfoRow icon={Building2} label="Current Company" value={app.currentCompany} />
              <InfoRow icon={Briefcase} label="Experience"      value={app.experience ? `${app.experience} year${app.experience !== 1 ? "s" : ""}` : undefined} />
            </div>
          </Card>

          {/* links */}
          {(app.linkedIn || app.github || app.portfolio) && (
            <Card title="Online Presence">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoRow icon={Linkedin} label="LinkedIn"  value={app.linkedIn}  href={app.linkedIn} />
                <InfoRow icon={Github}   label="GitHub"    value={app.github}    href={app.github} />
                <InfoRow icon={Globe}    label="Portfolio" value={app.portfolio} href={app.portfolio} />
              </div>
            </Card>
          )}

          {/* cover letter */}
          {app.coverLetter && (
            <Card title="Cover Letter">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {app.coverLetter}
              </p>
            </Card>
          )}

          {/* resume */}
          {app.resume?.url && (
            <Card title="Resume">
              <div className="flex items-center gap-4 rounded-lg border border-dashed border-gray-200 bg-secondary/40 px-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0037FF]/10">
                  <FileText size={18} className="text-[#0037FF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {app.resume.originalName || "Resume"}
                  </p>
                  {app.resume.size > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {(app.resume.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
                <a
                  href={app.resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-[#0037FF]/30 bg-[#0037FF]/5 px-3 py-1.5 text-xs font-medium text-[#0037FF] hover:bg-[#0037FF]/10 transition-colors"
                >
                  <Download size={12} />
                  Download
                </a>
              </div>
            </Card>
          )}
        </div>

        {/* ── right: status management ── */}
        <div className="flex flex-col gap-4">

          <Card title="Update Status">
            <div className="flex flex-col gap-3">
              <Select value={status} onValueChange={v => setStatus(v as ApplicationStatus)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s} value={s}>
                      <span className="flex items-center gap-2">
                        <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_CONFIG[s].dot)} />
                        {s}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Admin Remarks (optional)
                </label>
                <Textarea
                  rows={4}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Add internal notes about this candidate…"
                  className="resize-none text-sm"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#0037FF] hover:bg-[#0030e0] text-white gap-2"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : saved ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <Save size={14} />
                )}
                {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
              </Button>
            </div>
          </Card>

          {/* quick meta */}
          <Card title="Application Info">
            <div className="flex flex-col gap-3 text-sm">
              {app.career?.title && (
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
                    Position
                  </p>
                  <p className="text-gray-800">{app.career.title}</p>
                </div>
              )}
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
                  Applied On
                </p>
                <p className="text-gray-800">{appliedDate}</p>
              </div>
              {app.experience > 0 && (
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
                    Experience
                  </p>
                  <p className="text-gray-800">
                    {app.experience} year{app.experience !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
              {app.currentCompany && (
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
                    Current Company
                  </p>
                  <p className="text-gray-800">{app.currentCompany}</p>
                </div>
              )}
            </div>
          </Card>

          {/* quick actions */}
          <Card title="Quick Actions">
            <div className="flex flex-col gap-2">
              <a
                href={`mailto:${app.email}`}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-secondary transition-colors"
              >
                <Mail size={14} className="text-[#0037FF]" />
                Send Email
              </a>
              <a
                href={`tel:${app.phone}`}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-secondary transition-colors"
              >
                <Phone size={14} className="text-[#0037FF]" />
                Call Candidate
              </a>
              {app.resume?.url && (
                <a
                  href={app.resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-secondary transition-colors"
                >
                  <Download size={14} className="text-[#0037FF]" />
                  Download Resume
                </a>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}