import { useCallback, useEffect, useState } from "react";
import { studentAssignmentService, type StudentAssignment } from "@/services/student.service";

const useStudentAssignment = () => {
  const [assignment, setAssignment] = useState<StudentAssignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignment = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await studentAssignmentService.getMyAssignment();
      setAssignment(response.data ?? null);
      return response;
    } catch (err: any) {
      setError(err?.message || "Failed to load assignment details.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAssignment();
  }, [fetchAssignment]);

  return {
    assignment,
    loading,
    error,
    refreshAssignment: fetchAssignment,
  };
};

export default useStudentAssignment;
