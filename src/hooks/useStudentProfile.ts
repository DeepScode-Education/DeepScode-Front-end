import { useCallback, useEffect, useState } from "react";
import { studentProfileService, type StudentProfile } from "@/services/student.service";

const useStudentProfile = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await studentProfileService.getMyProfile();
      setProfile(response.data ?? null);
      return response;
    } catch (err: any) {
      setError(err?.message || "Failed to load profile.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProfile = async (formData: FormData) => {
    setSaving(true);
    setError(null);

    try {
      const response = await studentProfileService.createProfile(formData);
      setProfile(response.data ?? null);
      return response;
    } catch (err: any) {
      setError(err?.message || "Failed to save profile.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = async (formData: FormData) => {
    setSaving(true);
    setError(null);

    try {
      const response = await studentProfileService.updateProfile(formData);
      setProfile(response.data ?? null);
      return response;
    } catch (err: any) {
      setError(err?.message || "Failed to update profile.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    saving,
    error,
    fetchProfile,
    createProfile,
    updateProfile,
  };
};

export default useStudentProfile;
