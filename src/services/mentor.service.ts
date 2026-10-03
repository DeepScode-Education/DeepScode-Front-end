import axios, { AxiosError } from "axios";
import type { MentorDetail, MentorDetailResponse } from "@/types/mentor";
import type { MentorListItem } from "@/data/mentors";

const API_BASE = import.meta.env.VITE_API_BASE;

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Sub-documents from Mongo (testimonials/courses/faqs) have no `id`.
 *  Hydrate one so the existing UI components (which key/reference by id)
 *  keep working unchanged. */
const hydrateIds = <T extends object>(items: T[] | undefined): (T & { id: number })[] =>
  (items ?? []).map((item, index) => ({ ...item, id: index + 1 }));

const normalizeMentor = (raw: MentorDetailResponse): MentorDetail => ({
  ...raw,
  testimonials: hydrateIds(raw.testimonials),
  courses: hydrateIds(raw.courses),
  faqs: hydrateIds(raw.faqs),
});

/**
 * Fetches the public mentor detail page data.
 * Returns `null` when the mentor doesn't exist or has no published profile
 * (backend responds 404 in that case).
 */
export const getMentorBySlug = async (slug: string): Promise<MentorDetail | null> => {
  try {
    const res = await axios.get<ApiEnvelope<MentorDetailResponse>>(
      `${API_BASE}/api/mentors/profile/${slug}`
    );

    if (!res.data?.data) return null;
    return normalizeMentor(res.data.data);
  } catch (err) {
    const error = err as AxiosError;
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};



interface MentorsListEnvelope {
  success: boolean;
  message: string;
  data: MentorListItem[];
  count?: number;
}

/** Fetches the public mentor list (used by Navbar dropdown + Mentors page) */
export const getMentors = async (): Promise<MentorListItem[]> => {
  const res = await axios.get<MentorsListEnvelope>(`${API_BASE}/api/mentors`);
  return res.data?.data ?? [];
};