
import axios from "axios";
import type { SsrDataBag } from "./SsrDataContext";

// const API_BASE =
//   (
//     (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
//     process.env.VITE_API_BASE ||
//     "https://slateserver1.onrender.com"
//   ) + "/api";

const API_BASE =
  (import.meta.env.VITE_API_BASE ?? "https://slateserver1.onrender.com") + "/api";


// Same server-only shared secret as src/ssr/fetchSeo.ts — see the comment
// there. Needed here because fetchCourseData/fetchBlogData hit the same
// publicApiProtection-guarded /api/courses/:slug and /api/blogs/:slug
// endpoints (fetchHeroSlides hits /api/hero, which isn't protected, so it
// doesn't need this).
const SSR_INTERNAL_SECRET =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SSR_INTERNAL_SECRET) ||
  process.env.VITE_SSR_INTERNAL_SECRET ||
  "";
const ssrAuthHeaders = SSR_INTERNAL_SECRET ? { "x-ssr-secret": SSR_INTERNAL_SECRET } : undefined;
  
const NON_COURSE_SLUGS = new Set([
  "courses", "login", "signup", "about", "careers", "blog", "privacy",
  "mentors", "contact", "support", "portfolio", "dashboard", "onboarding",
  "ai-chat", "complete-profile", "knowledgehub", "placements", "admin",
  "counsellor",
]);

export async function fetchPageData(url: string): Promise<SsrDataBag> {
  const clean = url.split("?")[0].split("#")[0];
  const bag: SsrDataBag = {};

  // Homepage — hero slides
  if (clean === "/" || clean === "") {
    bag.heroSlides = await fetchHeroSlides();
    return bag;
  }

  // Course detail page — prefetch course data
  const topLevel = clean.match(/^\/([a-z0-9-]+)\/?$/i);
  if (topLevel && !NON_COURSE_SLUGS.has(topLevel[1].toLowerCase())) {
    bag.courseData = await fetchCourseData(topLevel[1]);
    return bag;
  }

  const explicitCourse = clean.match(/^\/courses\/([a-z0-9-]+)\/?$/i);
  if (explicitCourse) {
    bag.courseData = await fetchCourseData(explicitCourse[1]);
    return bag;
  }

  const blogMatch = clean.match(/^\/blog\/([a-z0-9-]+)\/?$/i);
  if (blogMatch) {
    bag.blogData = await fetchBlogData(blogMatch[1]);
    return bag;
  }

  return bag;
}

async function fetchHeroSlides() {
  try {
    const { data } = await axios.get(`${API_BASE}/hero`, { timeout: 4000 });
    return Array.isArray(data?.data) ? data.data : [];
  } catch (err) {
    console.error("[fetchPageData] hero slides failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

async function fetchCourseData(slug: string) {
  try {
    const { data } = await axios.get(`${API_BASE}/courses/${slug}`, { timeout: 4000, headers: ssrAuthHeaders });
    return data?.data ?? data ?? null;
  } catch (err) {
    console.error("[fetchPageData] course failed:", slug, err instanceof Error ? err.message : err);
    return null;
  }
}

async function fetchBlogData(slug: string) {
  try {
    const { data } = await axios.get(`${API_BASE}/blogs/${slug}`, { timeout: 4000, headers: ssrAuthHeaders });
    return data?.data ?? data ?? null;
  } catch (err) {
    console.error("[fetchPageData] blog failed:", slug, err instanceof Error ? err.message : err);
    return null;
  }
}