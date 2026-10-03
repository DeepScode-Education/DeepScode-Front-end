import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE + "/api/hero";

export const useHeroSlides = () => {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GET ALL
  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setSlides(res.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // CREATE / UPDATE
  const saveSlide = async (formData: FormData, editId?: string | null) => {
    if (editId) {
      await axios.put(`${API}/${editId}`, formData);
    } else {
      await axios.post(API, formData);
    }

    await fetchSlides();
  };

  // DELETE
  const deleteSlide = async (id: string) => {
    await axios.delete(`${API}/${id}`);
    await fetchSlides();
  };

  // TOGGLE PUBLISH STATUS
  const toggleActive = async (id: string, isActive: boolean) => {
    await axios.patch(`${API}/${id}`, { isActive });
    await fetchSlides();
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  return {
    slides,
    loading,
    error,
    fetchSlides,
    saveSlide,
    deleteSlide,
    toggleActive,
  };
};