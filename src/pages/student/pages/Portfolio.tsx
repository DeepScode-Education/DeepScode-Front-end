// src/pages/student/pages/Portfolio.tsx
//
// Student Portfolio Dashboard.
// Route: /student/portfolio  (list)
// Uses StudentLayout the same way Dashboard/StudentProfile do.

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Send,
  Github,
  ExternalLink,
  Figma,
  Video,
  FolderOpen,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Rocket,
  Archive,
  Star,
} from "lucide-react";
import StudentLayout from "../components/StudentLayout"; // adjust path if StudentLayout lives elsewhere
import { Button } from "@/components/ui/button";
import { Portfolio, PortfolioStatus, portfolioApi } from "@/integrations/client";

// const STATUS_META: Record<
//   PortfolioStatus,
//   { label: string; className: string; icon: typeof Clock }
// > = {
//   draft: { label: "Draft", className: "bg-gray-100 text-gray-700", icon: FolderOpen },
//   pending: { label: "Pending Review", className: "bg-amber-100 text-amber-700", icon: Clock },
//   approved: { label: "Approved", className: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
//   rejected: { label: "Rejected", className: "bg-red-100 text-red-700", icon: XCircle },
//   needs_changes: { label: "Needs Changes", className: "bg-orange-100 text-orange-700", icon: AlertCircle },
//   published: { label: "Published", className: "bg-[#0037FF]/10 text-[#0037FF]", icon: Rocket },
//   archived: { label: "Archived", className: "bg-gray-100 text-gray-500", icon: Archive },
// };

const STATUS_META: Record<PortfolioStatus, { label: string; className: string; icon: typeof Clock }> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700", icon: FolderOpen },
  pending: { label: "Pending Review", className: "bg-amber-100 text-amber-700", icon: Clock },
  approved: { label: "Approved", className: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700", icon: XCircle },
  published: { label: "Published", className: "bg-[#0037FF]/10 text-[#0037FF]", icon: Rocket },
  archived: { label: "Archived", className: "bg-gray-100 text-gray-500", icon: Archive },
};

const StatusBadge = ({ status }: { status: PortfolioStatus }) => {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}
    >
      <Icon size={12} />
      {meta.label}
    </span>
  );
};

const StudentPortfolioDashboard = () => {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await portfolioApi.getMine();
      setPortfolios(res.data);
    } catch (err: any) {
      setError(err?.message || "Could not load your portfolio projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this project permanently? This can't be undone.")) return;
    setBusyId(id);
    try {
      await portfolioApi.remove(id);
      setPortfolios((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      alert(err?.message || "Could not delete this project.");
    } finally {
      setBusyId(null);
    }
  };

  const handleSubmit = async (id: string) => {
    if (!window.confirm("Submit this project for admin review?")) return;
    setBusyId(id);
    try {
      const res = await portfolioApi.submit(id);
      setPortfolios((prev) => prev.map((p) => (p._id === id ? res.data : p)));
    } catch (err: any) {
      alert(err?.message || "Could not submit for review.");
    } finally {
      setBusyId(null);
    }
  };

  // const canEdit = (status: PortfolioStatus) => status === "draft" || status === "needs_changes";
  // const canDelete = (status: PortfolioStatus) => status !== "published";
  // const canSubmit = (status: PortfolioStatus) => status === "draft" || status === "needs_changes";
const canEdit = (status: PortfolioStatus) => status === "draft";
const canDelete = (status: PortfolioStatus) => status !== "published";
const canSubmit = (status: PortfolioStatus) => status === "draft";

  return (
    <StudentLayout
      title="My Portfolio"
      subtitle="Showcase your project work and track its review status."
      actions={
        <Button
          onClick={() => navigate("/student/portfolio/new")}
          className="gap-2 text-white bg-[#0037FF] hover:bg-[#0037FF]/90"
        >
          <Plus size={16} />
          New Project
        </Button>
      }
    >
      {loading && (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0037FF] border-t-transparent" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <Button variant="outline" className="mt-3" onClick={load}>
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && portfolios.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <FolderOpen className="mb-3 text-muted-foreground" size={32} />
          <p className="text-sm font-medium text-foreground">No projects yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add your first project to start building your portfolio.
          </p>
          <Button
            className="mt-4 text-white gap-2 bg-[#0037FF] hover:bg-[#0037FF]/90"
            onClick={() => navigate("/student/portfolio/new")}
          >
            <Plus size={16} />
            New Project
          </Button>
        </div>
      )}

      {!loading && !error && portfolios.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((p) => (
            <div
              key={p._id}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative aspect-video w-full bg-secondary">
                {p.thumbnail?.url ? (
                  <img
                    src={p.thumbnail.url}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <FolderOpen size={28} />
                  </div>
                )}
                {p.featured && (
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-amber-400/90 px-2 py-0.5 text-[10px] font-semibold text-amber-950">
                    <Star size={10} fill="currentColor" />
                    Featured
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
                    {p.title}
                  </h3>
                  <StatusBadge status={p.status} />
                </div>

                <p className="line-clamp-2 text-xs text-muted-foreground">{p.description}</p>

                <div className="mt-1 flex flex-wrap gap-1">
                  {p.technologies.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                  {p.technologies.length > 4 && (
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                      +{p.technologies.length - 4}
                    </span>
                  )}
                </div>

                {/* {p.status === "needs_changes" && p.adminRemarks && (
                  <div className="mt-1 rounded-md bg-orange-50 p-2 text-[11px] text-orange-700">
                    <span className="font-semibold">Admin note: </span>
                    {p.adminRemarks}
                  </div>
                )} */}
                {p.status === "rejected" && p.adminRemarks && (
                  <div className="mt-1 rounded-md bg-red-50 p-2 text-[11px] text-red-700">
                    <span className="font-semibold">Reason: </span>
                    {p.adminRemarks}
                  </div>
                )}

                <div className="mt-1 flex items-center gap-3 text-muted-foreground">
                  {p.githubUrl && <Github size={14} />}
                  {p.liveUrl && <ExternalLink size={14} />}
                  {p.figmaUrl && <Figma size={14} />}
                  {p.videoUrl && <Video size={14} />}
                </div>

                <div className="mt-auto flex items-center gap-2 pt-2">
                  {canEdit(p.status) && (
                    <Link to={`/student/portfolio/${p._id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1.5">
                        <Pencil size={13} />
                        Edit
                      </Button>
                    </Link>
                  )}
                  {canSubmit(p.status) && (
                    <Button
                      size="sm"
                      disabled={busyId === p._id}
                      onClick={() => handleSubmit(p._id)}
                      className="flex-1 gap-1.5 bg-[#0037FF] hover:bg-[#0037FF]/90"
                    >
                      <Send size={13} />
                      Submit
                    </Button>
                  )}
                  {canDelete(p.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyId === p._id}
                      onClick={() => handleDelete(p._id)}
                      className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 size={13} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentPortfolioDashboard;