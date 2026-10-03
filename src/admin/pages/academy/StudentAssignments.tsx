import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import AssignmentListTable from "./assignment/AssignmentListTable";
import AssignmentDetailDrawer from "./assignment/AssignmentDetailDrawer";
import { assignmentSubmissionApi } from "@/integrations/client"; // ⚠️ check this path matches where client.ts actually lives
import type { AssignmentRecord, AssignmentStatus } from "@/types/assignment";

const STATUS_OPTIONS: (AssignmentStatus | "")[] = [
  "",
  "Submitted",
  "Under Review",
  "Approved",
  "Rejected",
];

const StudentAssignments = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AssignmentStatus | "">("");
  const [selected, setSelected] = useState<AssignmentRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const load = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assignmentSubmissionApi.getAll({
        studentId,
        status: status || undefined,
        search: search || undefined,
        limit: 100,
      });
      setAssignments(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, [studentId, status, search]);

  useEffect(() => {
    load();
  }, [load]);

  const studentHeader =
    assignments.length > 0 && typeof assignments[0].student !== "string"
      ? (assignments[0].student as { fullName: string; email: string })
      : null;

  const handleReviewSubmit = async (
    id: string,
    payload: { status?: AssignmentStatus; grade?: string; feedback?: string }
  ) => {
    const res = await assignmentSubmissionApi.review(id, payload);
    setAssignments((prev) => prev.map((a) => (a._id === id ? res.data : a)));
    setSelected(res.data);
  };

  return (
    <AdminLayout
      title={studentHeader ? studentHeader.fullName : "Student Assignments"}
      subtitle={studentHeader ? studentHeader.email : "All assignments submitted by this student."}
      actions={
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} /> Back to overview
        </button>
      }
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="pl-8"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AssignmentStatus | "")}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s || "all"} value={s}>
              {s || "All statuses"}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <AssignmentListTable
          assignments={assignments}
          onSelect={(a) => {
            setSelected(a);
            setDrawerOpen(true);
          }}
        />
      )}

      <AssignmentDetailDrawer
        assignment={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onReviewSubmit={handleReviewSubmit}
      />
    </AdminLayout>
  );
};

export default StudentAssignments;