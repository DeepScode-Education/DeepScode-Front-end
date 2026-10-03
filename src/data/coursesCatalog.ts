import axios from "axios";

export type CourseCategory =
  | "Design"
  | "Marketing"
  | "3D"
  | "Data"
  | "Tech";

export type CourseLevel =
  | "Beginner"
  | "Intermediate"
  | "Advanced";

export type CourseTag =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Quick Skill";

export interface CatalogCourse {
  id: string;
  title: string;
  subtitle: string;
  category: CourseCategory;
  duration: string;
  level: CourseLevel;
  tag: CourseTag;
  price: number;
  slug: string;
}

const API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://localhost:5050";

/**
 * Fetch courses for Navbar / Course Catalog
 */
export const fetchCoursesCatalog = async (): Promise<CatalogCourse[]> => {
  const response = await axios.get(`${API_BASE}/api/courses`);

  // Supports both:
  // { courses: [...] }
  // and direct [...]
  const data = response.data;

  const courses = Array.isArray(data)
    ? data
    : Array.isArray(data?.courses)
      ? data.courses
      : Array.isArray(data?.data)
        ? data.data
        : [];

  return courses.map((course: any) => ({
    id: course._id ?? course.id,
    slug: course.slug,
    title: course.title,
    subtitle:
      course.subtitle ??
      course.shortDescription ??
      course.heroDescription ??
      "",
    category: course.category ?? "Tech",
    duration: course.duration ?? "",
    level: course.level ?? "Beginner",
    tag: course.tag ?? "Beginner",
    price: Number(course.price ?? 0),
  }));
};