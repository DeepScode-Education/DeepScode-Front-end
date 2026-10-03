import { useCallback, useEffect, useState } from "react";
import { studentCoursesService, type Course } from "@/services/student.service";

const useStudentCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await studentCoursesService.getCourses();
      setCourses(data ?? []);
      return data;
    } catch (err: any) {
      setError(err?.message || "Failed to load course list.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    loading,
    error,
    refreshCourses: fetchCourses,
  };
};

export default useStudentCourses;
