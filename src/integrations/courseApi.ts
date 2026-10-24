
import axios from "axios";

// .env:  VITE_API_BASE=https://deepscode-backend-end.onrender.com
// We append /api here so every call automatically hits /api/courses, /api/courses/:slug etc.
const BASE = (import.meta.env.VITE_API_BASE ?? "https://deepscode-backend-end.onrender.com") + "/api";

const api = axios.create({ baseURL: BASE });

// ─── Types (mirror the backend schema) ────────────────────────────────────────

// NEW: matches backend statsSchema — denormalised counters shown on cards
export interface CourseStats {
  rating      : number;
  reviewCount : number;
  studentCount: number;
  projectCount: number;
}

// NEW: matches backend placementSchema
export interface CoursePlacement {
  hasPlacementSupport: boolean;
  hasCertificate     : boolean;
  hiringPartners     : string[];
}

export interface CourseCard {
  _id             : string;
  title           : string;
  slug            : string;
  shortDescription: string;
  thumbnail       : string;
  category        : "Design" | "3D" | "Marketing" | "Data" | "Tech"; // NEW
  duration        : string;
  durationWeeks   : number | null;                          // NEW
  level           : "Beginner" | "Intermediate" | "Advanced";
  tag             : string;
  mode            : "Online" | "Offline" | "Hybrid" | null; // NEW
  schedule        : "Weekday" | "Weekend" | "Flexible" | null; // NEW
  toolsCovered        : string[]; // NEW — included in the public list projection
  careerOpportunities : string[]; // NEW — included in the public list projection
  pricing         : { price: number; discountPrice: number; currency: string };
  publishing      : { isFeatured: boolean; displayOrder: number; isPublished: boolean };
  stats           : CourseStats;      // NEW
  placement       : CoursePlacement;  // NEW
}

export interface RoadmapLevel {
  title      : string;
  duration   : string;
  description: string;
  modules    : string[];
  schedule   : string;
  ctaLabel   : string;
  ctaFileUrl : string | null;   // per-level PDF URL (null = not uploaded yet)
}

export interface PortfolioProject {
  title       : string;
  description : string;
  image?      : string;
}

export interface Faq {
  question: string;
  answer  : string;
}

export interface CourseDetail extends CourseCard {
  heroTitle           : string;
  heroDescription     : string;
  bannerImage         : string;
  promoVideo          : string;
  overview            : string;
  highlights          : string[];
  whatsIncluded       : string[];
  learningOutcomes    : string[];
  roadmap             : RoadmapLevel[];
  portfolioProjects   : PortfolioProject[];
  faqs                : Faq[];
  certification       : { provider: string; title: string; description: string; image: string };
  downloads           : { syllabusPdf: string; brochurePdf: string };
  seo                 : { title: string; description: string; keywords: string[]; canonical: string; ogImage: string };
}

export interface Pagination {
  total      : number;
  page       : number;
  limit      : number;
  totalPages : number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Sort options accepted by GET /api/courses
export type CourseSort =
  | "createdAt" | "-createdAt" | "displayOrder" | "title" | "rating" | "popular";

// Duration bucket accepted by GET /api/courses (mapped to durationWeeks ranges server-side)
export type CourseDurationRange = "0-4 weeks" | "5-8 weeks" | "9+ weeks";

export interface CourseListParams {
  category            ?: string;
  level               ?: string;
  featured            ?: boolean;
  search              ?: string;
  page                ?: number;
  limit               ?: number;
  sort                ?: CourseSort;
  // NEW filters — mirror the backend's getCourseListRules
  mode                ?: "Online" | "Offline" | "Hybrid";
  schedule            ?: "Weekday" | "Weekend" | "Flexible";
  durationRange       ?: CourseDurationRange;
  hasCertificate      ?: boolean;
  hasPlacementSupport ?: boolean;
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * GET /api/courses
 * Used by the Courses listing page.
 */
export const fetchCourses = async (
  params: CourseListParams = {}
): Promise<{ courses: CourseCard[]; pagination: Pagination }> => {
  const { data } = await api.get("/courses", { params });
  return { courses: data.data, pagination: data.pagination };
};

/**
 * GET /api/courses/:slug
 * Used by the CourseDetail page.
 */
export const fetchCourseBySlug = async (slug: string): Promise<CourseDetail> => {
  const { data } = await api.get(`/courses/${slug}`);
  return data.data;
};