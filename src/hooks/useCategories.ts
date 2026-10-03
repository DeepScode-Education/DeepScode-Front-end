import { useEffect, useState } from "react";
import { BASE_URL } from "@/integrations/client";

export const useCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${BASE_URL}/api/categories`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load categories");
        }

        if (!cancelled) setCategories(data.data || []);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load categories");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading, error };
};