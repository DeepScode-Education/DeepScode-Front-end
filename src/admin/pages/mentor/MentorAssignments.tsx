import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MentorLayout from "../../components/MentorLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  assignmentSubmissionApi,
  AssignmentRecord,
  AssignmentStatus,
} from "@/integrations/client";
import { FileBadge, ExternalLink } from "lucide-react";

const STATUS_OPTIONS: (AssignmentStatus | "All")[] = [
  "All",
  "Submitted",
  "Under Review",
  "Approved",
  "Rejected",
];

const STATUS_STYLES: Record<string, string> = {
  Submitted: "bg-blue-500/10 text-blue-600",
  "Under Review": "bg-amber-500/10 text-amber-600",
  Approved: "bg-emerald-500/10 text-emerald-600",
  Rejected: "bg-red-500/10 text-red-600",
};

const MentorAssignments = () => {
  const [params] = useSearchParams();
  const studentId = params.get("student") ?? undefined;

  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await assignmentSubmissionApi.getAll({
        status: statusFilter === "All" ? undefined : statusFilter,
        studentId,
        limit: 50,
      });
      if (res.success) setAssignments(res.data);
    } catch (err) {
      console.error(err);
      setError("Couldn't load assignments right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, studentId]);

  const handleReview = async (id: string, status: AssignmentStatus) => {
    try {
      setReviewingId(id);
      await assignmentSubmissionApi.review(id, {
        status,
        feedback: feedbackDrafts[id] ?? "",
      });
      await fetchAssignments();
    } catch (err) {
      console.error(err);
      setError("Couldn't update this assignment's status. Please try again.");
    } finally {
      setReviewingId(null);
    }
  };

  const studentName = (a: AssignmentRecord) =>
    typeof a.student === "string" ? "Student" : a.student.fullName;

  return (
    <MentorLayout title="Assignments" subtitle="Review submissions from your assigned students">
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === s
                ? "border-[#0037FF] bg-[#0037FF] text-white"
                : "border-border bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading assignments…
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          <FileBadge size={28} className="text-muted-foreground/50" />
          No assignments found for this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div key={a._id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{a.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {studentName(a)} · {a.category || "General"}
                  </div>
                </div>
                <Badge className={`border-0 text-[11px] ${STATUS_STYLES[a.status] ?? "bg-secondary"}`}>
                  {a.status}
                </Badge>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>

              {(a.githubLink || a.liveLink || a.figmaLink || a.driveLink) && (
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  {a.githubLink && (
                    <a href={a.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#0037FF] hover:underline">
                      <ExternalLink size={12} /> GitHub
                    </a>
                  )}
                  {a.liveLink && (
                    <a href={a.liveLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#0037FF] hover:underline">
                      <ExternalLink size={12} /> Live
                    </a>
                  )}
                  {a.figmaLink && (
                    <a href={a.figmaLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#0037FF] hover:underline">
                      <ExternalLink size={12} /> Figma
                    </a>
                  )}
                  {a.driveLink && (
                    <a href={a.driveLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#0037FF] hover:underline">
                      <ExternalLink size={12} /> Drive
                    </a>
                  )}
                </div>
              )}

              {a.status !== "Approved" && a.status !== "Rejected" && (
                <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    placeholder="Optional feedback for the student…"
                    value={feedbackDrafts[a._id] ?? ""}
                    onChange={(e) =>
                      setFeedbackDrafts((prev) => ({ ...prev, [a._id]: e.target.value }))
                    }
                    className="h-9 flex-1 rounded-lg border border-border bg-secondary/40 px-3 text-xs focus:bg-background focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={reviewingId === a._id}
                      className="bg-[#0037FF] text-white hover:bg-[#0037FF]/90"
                      onClick={() => handleReview(a._id, "Approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={reviewingId === a._id}
                      onClick={() => handleReview(a._id, "Rejected")}
                    >
                      Request Changes
                    </Button>
                  </div>
                </div>
              )}

              {a.feedback && a.status === "Rejected" && (
                <div className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-700">
                  <span className="font-semibold">Your feedback: </span>
                  {a.feedback}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </MentorLayout>
  );
};

export default MentorAssignments;