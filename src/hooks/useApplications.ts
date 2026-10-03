import { useCallback, useEffect, useState } from "react";
import { careerApplicationApi } from "@/services/careerApplication.service";
import type { CareerApplication, ApplicationStatus } from "@/types/careerApplication";

interface UseApplicationsOptions {
  autoFetch?: boolean;
  initialStatus?: string;
  initialSearch?: string;
}

export const useApplications = (opts: UseApplicationsOptions = {}) => {
  const { autoFetch = true } = opts;

  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  const fetchApplications = useCallback(
    async (params?: { page?: number; status?: string; search?: string }) => {
      try {
        setLoading(true);
        setError("");
        const res = await careerApplicationApi.getAll({ limit: 15, ...params });
        setApplications(res.data ?? []);
        setTotal(res.total ?? 0);
        setPage(res.page ?? 1);
        setTotalPages(res.totalPages ?? 1);
      } catch (err: any) {
        setError(err.message || "Failed to fetch applications");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getApplication = async (id: string) => {
    const res = await careerApplicationApi.getById(id);
    return res.data;
  };

  const updateStatus = async (
    id: string,
    status: ApplicationStatus,
    remarks?: string
  ) => {
    await careerApplicationApi.updateStatus(id, status, remarks);
    await fetchApplications({ page });
  };

  const deleteApplication = async (id: string) => {
    await careerApplicationApi.delete(id);
    await fetchApplications({ page });
  };

  useEffect(() => {
    if (autoFetch) fetchApplications();
  }, [autoFetch, fetchApplications]);

  return {
    applications,
    total,
    page,
    totalPages,
    loading,
    error,
    fetchApplications,
    getApplication,
    updateStatus,
    deleteApplication,
  };
};