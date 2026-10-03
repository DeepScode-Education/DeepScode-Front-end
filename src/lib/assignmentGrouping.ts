import type { AssignmentRecord } from "../integrations/client";
import type { StudentAssignmentSummary } from "@/types/assignment";

const PENDING_STATUSES = new Set(["Submitted", "Under Review"]);

/**
 * Groups a flat list of assignment submissions (as returned by
 * assignmentSubmissionApi.getAll, which populates `student`) into
 * one summary row per student, sorted by most recent submission first.
 */
export function groupAssignmentsByStudent(
  assignments: AssignmentRecord[]
): StudentAssignmentSummary[] {
  const map = new Map<string, StudentAssignmentSummary>();

  for (const a of assignments) {
    const student = typeof a.student === "string" ? null : a.student;
    const studentId = typeof a.student === "string" ? a.student : a.student._id;
    if (!studentId) continue;

    let entry = map.get(studentId);
    if (!entry) {
      entry = {
        studentId,
        fullName: student?.fullName ?? "Unknown student",
        email: student?.email ?? "",
        studentCode: student?.studentId ?? null,
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        latestSubmittedAt: null,
        latestStatus: null,
      };
      map.set(studentId, entry);
    }

    entry.total += 1;
    if (PENDING_STATUSES.has(a.status)) entry.pending += 1;
    if (a.status === "Approved") entry.approved += 1;
    if (a.status === "Rejected") entry.rejected += 1;

    const submitted = a.submittedDate ?? a.createdAt;
    if (
      submitted &&
      (!entry.latestSubmittedAt || new Date(submitted) > new Date(entry.latestSubmittedAt))
    ) {
      entry.latestSubmittedAt = submitted;
      entry.latestStatus = a.status;
    }
  }

  return Array.from(map.values()).sort((x, y) => {
    const xd = x.latestSubmittedAt ? new Date(x.latestSubmittedAt).getTime() : 0;
    const yd = y.latestSubmittedAt ? new Date(y.latestSubmittedAt).getTime() : 0;
    return yd - xd;
  });
}