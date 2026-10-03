import { useCallback, useEffect, useState } from "react";
import { studentDashboardService, type StudentDashboardData } from "@/services/student.service";

const useStudentDashboard = () => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await studentDashboardService.getDashboard();
      setData(response);
      return response;
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard data.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    student: data?.student ?? null,
    profile: data?.profile ?? null,
    assignment: data?.assignment ?? null,
    fee: data?.fee ?? null,
    feePayments: data?.feePayments ?? [],
    loading,
    error,
    refresh: fetchDashboard,
  };
};

export default useStudentDashboard;