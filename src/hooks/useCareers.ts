import { useCallback, useEffect, useState } from "react";
import { careerApi } from "@/services/career.service";
import type { Career, CareerPayload } from "@/types/career";

export const useCareers = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCareers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await careerApi.getAll();
      setCareers(res.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch careers");
    } finally {
      setLoading(false);
    }
  }, []);

  const getCareer = async (id: string) => {
    const res = await careerApi.getById(id);
    return res.data;
  };

  const createCareer = async (payload: CareerPayload) => {
    try {
      setSaving(true);
      const res = await careerApi.create(payload);
      await fetchCareers();
      return res;
    } finally {
      setSaving(false);
    }
  };

  const updateCareer = async (id: string, payload: CareerPayload) => {
    try {
      setSaving(true);
      const res = await careerApi.update(id, payload);
      await fetchCareers();
      return res;
    } finally {
      setSaving(false);
    }
  };

  const deleteCareer = async (id: string) => {
    await careerApi.delete(id);
    await fetchCareers();
  };

  const updateStatus = async (id: string, status: Career["status"]) => {
    await careerApi.updateStatus(id, status);
    await fetchCareers();
  };

  useEffect(() => {
    fetchCareers();
  }, [fetchCareers]);

  return {
    careers,
    loading,
    saving,
    error,
    fetchCareers,
    getCareer,
    createCareer,
    updateCareer,
    deleteCareer,
    updateStatus,
  };
};