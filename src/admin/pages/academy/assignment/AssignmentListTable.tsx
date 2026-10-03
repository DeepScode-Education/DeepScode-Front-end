import AssignmentStatusBadge from "./AssignmentStatusBadge";
import type { AssignmentRecord } from "@/types/assignment";

interface Props {
  assignments: AssignmentRecord[];
  onSelect: (assignment: AssignmentRecord) => void;
}

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const AssignmentListTable = ({ assignments, onSelect }: Props) => {
  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        No assignments match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Submitted</th>
            <th className="px-4 py-3 font-medium">Grade</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {assignments.map((a) => (
            <tr
              key={a._id}
              onClick={() => onSelect(a)}
              className="cursor-pointer transition-colors hover:bg-muted/40"
            >
              <td className="px-4 py-3 font-medium">{a.title}</td>
              <td className="px-4 py-3 text-muted-foreground">{a.category || "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(a.submittedDate)}</td>
              <td className="px-4 py-3 text-muted-foreground">{a.grade || "—"}</td>
              <td className="px-4 py-3">
                <AssignmentStatusBadge status={a.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignmentListTable;