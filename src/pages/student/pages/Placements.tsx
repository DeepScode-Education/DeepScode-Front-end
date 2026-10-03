// pages/student/Placements.tsx
import { useMemo } from "react";
import {
  FileText,
  FolderKanban,
  Video,
  Briefcase,
  CheckCircle2,
  Circle,
  Building2,
} from "lucide-react";
import StudentLayout from "../components/StudentLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../../contexts/AuthContext";



type BadgeTone = "warning" | "success" | "info" | "neutral" | "danger";

const TONE_CLASSES: Record<BadgeTone, string> = {
  warning: "bg-amber-50 text-amber-600",
  success: "bg-emerald-50 text-emerald-600",
  info: "bg-blue-50 text-[#0037FF]",
  neutral: "bg-secondary text-muted-foreground",
  danger: "bg-red-50 text-red-600",
};

const Badge = ({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]}`}>
    {children}
  </span>
);

const overviewCards = [
  {
    label: "Resume status",
    icon: FileText,
    render: () => <Badge tone="warning">Under Review</Badge>,
  },
  {
    label: "Portfolio status",
    icon: FolderKanban,
    render: () => <Badge tone="success">Approved</Badge>,
  },
  {
    label: "Mock interview",
    icon: Video,
    render: () => <span className="text-2xl font-bold tracking-tight">82/100</span>,
  },
  {
    label: "Applications",
    icon: Briefcase,
    render: () => (
      <div>
        <span className="text-2xl font-bold tracking-tight">14</span>
        <p className="mt-1 text-[11px] text-muted-foreground">3 interviews scheduled</p>
      </div>
    ),
  },
];

type PipelineStep = { label: string; state: "done" | "pending"; count?: number };

const pipeline: PipelineStep[] = [
  { label: "Resume Building", state: "done" },
  { label: "Portfolio Completion", state: "done" },
  { label: "Mock Interview", state: "pending" , count:3 },
  { label: "Job Applications", state: "pending" , count:4},
  { label: "Interview Round", state: "pending", count: 5 },
  { label: "Selected", state: "pending", count: 6 },
];

const readiness = 78;

type ApplicationStatus = "Applied" | "Interview" | "Offer" | "Rejected" | "Shortlisted";

const STATUS_TONE: Record<ApplicationStatus, BadgeTone> = {
  Applied: "warning",
  Interview: "info",
  Offer: "success",
  Rejected: "danger",
  Shortlisted: "success",
};

const applications: { company: string; role: string; status: ApplicationStatus }[] = [
  { company: "Razorpay", role: "Product Designer", status: "Applied" },
  { company: "Zomato", role: "UI Designer", status: "Interview" },
  { company: "CRED", role: "Product Designer", status: "Offer" },
  { company: "Swiggy", role: "Visual Designer", status: "Rejected" },
  { company: "Freshworks", role: "Product Designer", status: "Shortlisted" },
];

// ─────────────────────────────────────────────────────────────────────────────

const StudentPlacements = () => {
  const { user } = useAuth();
  const firstName = useMemo(() => (user?.fullName || "Student").split(" ")[0], [user]);

  return (
    <StudentLayout
      title="Placements"
      subtitle="Your roadmap from prep to offer."
      actions={
        <Button size="sm" className="text-white">
          Apply to new role
        </Button>
      }
    >
      {/* ── Overview cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {overviewCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <Icon className="text-white" size={15} />
                </div>
              </div>
              <div className="mt-3">{c.render()}</div>
            </div>
          );
        })}
      </div>

      {/* ── Hiring pipeline ── */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Hiring pipeline</h3>
          <span className="text-sm font-semibold text-emerald-600">{readiness}% ready</span>
        </div>
 
        <div className="mt-6 overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-[560px] items-start justify-between px-1 lg:min-w-0">
            {pipeline.map((step, i) => (
              <div key={step.label} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <div
                    className={`h-px flex-1 ${i === 0 ? "opacity-0" : step.state === "done" ? "bg-[#0037FF]" : "bg-border"}`}
                  />
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      step.state === "done"
                        ? "bg-[#0037FF] text-white"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {step.state === "done" ? <CheckCircle2 size={16} /> : step.count}
                  </div>
                  <div
                    className={`h-px flex-1 ${
                      i === pipeline.length - 1 ? "opacity-0" : pipeline[i + 1].state === "done" ? "bg-[#0037FF]" : "bg-border"
                    }`}
                  />
                </div>
                <span className="mt-2 max-w-[90px] text-[11px] font-medium leading-tight text-muted-foreground">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
 

      {/* ── Applications ── */}
      <div className="mt-6 rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold">Applications</h3>
        </div>
        <ul className="divide-y divide-border">
          {applications.map((a) => (
            <li key={a.company} className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <Building2 size={16} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.company}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.role}</p>
                </div>
              </div>
              <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </StudentLayout>
  );
};

export default StudentPlacements;