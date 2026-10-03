// src/lib/publicPortfolioApi.ts

import axios from "axios";
import { BASE_URL } from "@/integrations/client";

// ===============================
// Course Types (for portfolio filter)
// ===============================

export interface PublicCourseItem {
  _id: string;
  title: string;
  slug?: string;
}

interface CoursesApiResponse {
  success: boolean;
  data: PublicCourseItem[];
}

// ===============================
// Portfolio Types
// ===============================

export interface PublicPortfolioImage {
  url: string;
  publicId: string;
}

export interface PublicPortfolioItem {
  _id: string;
  title: string;
  description: string;
  category: "Design" | "Marketing" | "3D" | "Data" | "Tech";
  course: string; // Course _id this portfolio is linked to
  courseTitle: string;

  thumbnail?: PublicPortfolioImage | null;

  gallery: PublicPortfolioImage[];

  technologies: string[];

  tags: string[];

  githubUrl: string;

  liveUrl: string;

  figmaUrl?: string;

  behanceUrl?: string;

  videoUrl?: string;

  driveUrl?: string;

  featured: boolean;

  views: number;

  likes: number;

  // NOTE: Backend ab yeh resolve karke bhejta hai — real student ho ya
  // external, dono cases mein final display-ready naam yahi milega.
  studentName: string;

  studentPhoto?: PublicPortfolioImage | null;

  studentReview?: string;

  createdAt: string;

  publishedAt?: string | null;
}

export interface PublicPortfolioPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PublicPortfolioResponse {
  success: boolean;
  portfolios: PublicPortfolioItem[];
  pagination: PublicPortfolioPagination;
}

export interface FetchPublicPortfoliosParams {
  course?: string; // Course _id — preferred filter
  search?: string;
  page?: number;
  limit?: number;
}

// ===============================
// Testimonial Types
// ===============================

export interface TestimonialItem {
  _id: string;
  name: string;
  role?: string;
  course?: string;
  quote?: string;
  image?: string;
  videoUrl?: string;
  rating?: number;
  createdAt?: string;
}

// ===============================
// Courses API (for filter buttons)
// ===============================

export const fetchPublishedCourses = (): Promise<PublicCourseItem[]> => {
  return axios
    .get<CoursesApiResponse>(`${BASE_URL}/api/courses`, {
      params: { limit: 100, sort: "title" },
    })
    .then((res) => res.data?.data ?? [])
    .catch((err) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Could not load courses.";

      throw new Error(message);
    });
};

// ===============================
// Portfolio API
// ===============================

export const fetchPublicPortfolios = (
  params: FetchPublicPortfoliosParams = {},
): Promise<PublicPortfolioResponse> => {
  return axios
    .get<PublicPortfolioResponse>(`${BASE_URL}/api/portfolio`, {
      params,
    })
    .then((res) => res.data)
    .catch((err) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Could not load portfolio projects.";

      throw new Error(message);
    });
};

// ===============================
// Testimonial API
// ===============================

export const fetchPublicTestimonials = (): Promise<TestimonialItem[]> => {
  return axios
    .get(`${BASE_URL}/api/testimonials`)
    .then((res) => {
      return res.data.testimonials || [];
    })
    .catch((err) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Could not load testimonials.";

      throw new Error(message);
    });
};