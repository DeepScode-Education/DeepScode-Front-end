// //admin-assignment.tsx
// import { Plus } from "lucide-react";
// import AdminLayout from "../../components/AdminLayout";
// import DataTable, { StatusBadge } from "../../components/DataTable";
// import { Button } from "@/components/ui/button";
// import { assignments } from "../../data/mock";

// const Assignments = () => (
//   <AdminLayout
//     title="Assignments"
//     subtitle="Track submissions and grading across all courses."
//     actions={<Button size="sm"><Plus size={14} /> New Assignment</Button>}
//   >
//     <DataTable
//       rows={assignments}
//       columns={[
//         { key: "title", label: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
//         { key: "course", label: "Course" },
//         { key: "submissions", label: "Submissions" },
//         { key: "due", label: "Due" },
//         { key: "status", label: "Status", render: (r) => <StatusBadge>{r.status}</StatusBadge> },
//       ]}
//     />
//   </AdminLayout>
// );

// export default Assignments;


//admin-assignment.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { assignmentSubmissionApi } from "@/integrations/client"; 
import { groupAssignmentsByStudent } from "@/lib/assignmentGrouping";
import AssignmentStatusBadge from "./assignment/AssignmentStatusBadge";
import type { AssignmentRecord } from "@/types/assignment";

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const Assignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pull a wide page and group client-side; there's no dedicated
      // "group by student" endpoint on the backend yet.
      const res = await assignmentSubmissionApi.getAll({ limit: 200 });
      setAssignments(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const summaries = useMemo(() => groupAssignmentsByStudent(assignments), [assignments]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return summaries;
    return summaries.filter(
      (s) => s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [summaries, search]);

  return (
    <AdminLayout title="Assignments" subtitle="Track submissions and grading, grouped by student.">
      <div className="relative mb-4 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-8"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
          No students have submitted assignments yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Total submitted</th>
                <th className="px-4 py-3 font-medium">Pending review</th>
                <th className="px-4 py-3 font-medium">Approved</th>
                <th className="px-4 py-3 font-medium">Rejected</th>
                <th className="px-4 py-3 font-medium">Latest submission</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((s) => (
                <tr
                  key={s.studentId}
                  onClick={() => navigate(`/admin/academy/assignments/${s.studentId}`)}
                  className="cursor-pointer transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.fullName}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </td>
                  <td className="px-4 py-3">{s.total}</td>
                  <td className="px-4 py-3">
                    {s.pending > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        {s.pending} pending
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{s.approved}</td>
                  <td className="px-4 py-3">{s.rejected}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {formatDate(s.latestSubmittedAt)}
                      </span>
                      {s.latestStatus && <AssignmentStatusBadge status={s.latestStatus} />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default Assignments;
