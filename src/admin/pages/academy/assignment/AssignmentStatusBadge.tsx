import type { AssignmentStatus } from "@/types/assignment";

const STYLES: Record<AssignmentStatus, string> = {
  Submitted: "bg-slate-100 text-slate-700 border-slate-200",
  "Under Review": "bg-amber-100 text-amber-700 border-amber-200",
  Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-100 text-rose-700 border-rose-200",
};

const AssignmentStatusBadge = ({ status }: { status: AssignmentStatus }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
  >
    {status}
  </span>
);

export default AssignmentStatusBadge;