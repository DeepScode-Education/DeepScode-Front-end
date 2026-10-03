import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AssignmentRecord, AssignmentStatus } from "@/types/assignment";

const REVIEW_STATUSES: AssignmentStatus[] = ["Under Review", "Approved", "Rejected"];

interface Props {
  assignment: AssignmentRecord;
  onSubmit: (payload: {
    status?: AssignmentStatus;
    grade?: string;
    feedback?: string;
  }) => Promise<void>;
}

const AssignmentReviewForm = ({ assignment, onSubmit }: Props) => {
  const [status, setStatus] = useState<AssignmentStatus>(
    assignment.status === "Submitted" ? "Under Review" : assignment.status
  );
  const [grade, setGrade] = useState(assignment.grade === "-" ? "" : assignment.grade);
  const [feedback, setFeedback] = useState(assignment.feedback ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await onSubmit({ status, grade, feedback });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="text-sm font-semibold">Review &amp; Grading</h3>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AssignmentStatus)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          {REVIEW_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Grade</label>
        <Input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. A, 8/10" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Feedback</label>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          placeholder="Share feedback for the student..."
        />
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}
      {saved && !error && <p className="text-xs text-emerald-600">Review saved.</p>}

      <Button size="sm" onClick={handleSubmit} disabled={saving} className="w-full">
        {saving ? "Saving..." : "Save Review"}
      </Button>
    </div>
  );
};

export default AssignmentReviewForm;