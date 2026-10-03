import type {
  AssignmentRecord,
  AssignmentStatus,
  AssignmentFile,
} from "@/integrations/client";

export type { AssignmentRecord, AssignmentStatus, AssignmentFile };

export interface StudentAssignmentSummary {
  studentId: string;
  fullName: string;
  email: string;
  studentCode?: string | null;
  total: number;
  pending: number; // Submitted + Under Review
  approved: number;
  rejected: number;
  latestSubmittedAt: string | null;
  latestStatus: AssignmentStatus | null;
}