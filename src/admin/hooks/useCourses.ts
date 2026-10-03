import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE;

export interface CourseOption {
  _id: string;
  title: string;
  slug?: string;
  category?: string;
}

export const useCourses = () => {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`${API_BASE}/api/courses?limit=100&sort=title`)
      .then((r) => r.json())
      .then((json) => {
        if (!active) return;
        if (json.success) setCourses(json.data || []);
        else setError(json.message || "Failed to fetch courses");
      })
      .catch(() => active && setError("Failed to fetch courses"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return { courses, loading, error };
};