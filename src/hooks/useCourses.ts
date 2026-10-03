import { useEffect, useState } from "react";
import { BASE_URL } from "@/integrations/client";

export interface CourseOption {
  _id: string;
  title: string;
  slug: string;
  category?: string;
}

/**
 * Fetches the list of published courses for use in dropdowns/filters —
 * replaces the old hardcoded Design/Coding/Marketing/Data category list.
 */
export const useCourses = () => {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${BASE_URL}/api/courses?limit=100&sort=title`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load courses");
        }

        if (!cancelled) setCourses(data.data || []);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load courses");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { courses, loading, error };
};