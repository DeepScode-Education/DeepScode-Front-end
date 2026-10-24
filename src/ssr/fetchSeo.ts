
import axios from "axios";

const API_BASE =
  (
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
    process.env.VITE_API_BASE ||
    "https://deepscode-backend-end.onrender.com"
  ) + "/api";

// This module only ever runs server-side (Vercel's api/ssr.ts function, or
// the local SSR dev server) — never in the browser bundle. Server-to-server
// requests made here carry no browser Origin/Referer header, so the
// backend's publicApiProtection middleware would otherwise reject them.
// This shared secret authenticates the request instead, without loosening
// protection for real browser traffic. Same env-var-lookup pattern as
// VITE_API_BASE above: import.meta.env works during local `vite dev:ssr`,
// process.env works inside the compiled Vercel serverless function.
const SSR_INTERNAL_SECRET =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SSR_INTERNAL_SECRET) ||
  process.env.VITE_SSR_INTERNAL_SECRET ||
  "";

const NON_COURSE_TOP_LEVEL_SLUGS = new Set([
 "courses",
 "login",
 "signup",
 "about",
 "careers",
 "blog",
 "privacy",
 "mentors",
 "contact",
 "support",
 "portfolio",
 "dashboard",
 "onboarding",
 "ai-chat",
 "complete-profile",
 "knowledge-hub",
 "placements",
 "admin",
 "counsellor",
]);

export interface SeoResult {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
}

const STATIC_SEO: Record<string, SeoResult> = {
  "/": {
    title: "Slate Academy: Best Designing and Marketing Institute in Delhi",
    description: "Join the best institute in Delhi for Graphic Design, UI/UX, Motion Graphics, 3D Design, Digital Marketing and Data Analytics courses with 100% placement support.",
    keywords: ["graphic design course delhi", "ui ux design institute", "digital marketing course", "Slate Academy"],
    canonical: "https://slate-academy.com/",
  },
  "/courses": {
    title: "Slate Academy: Best Designing & Marketing Institute in Delhi",
    description: "Join the best institute in Delhi for Graphic Design, UI/UX, Motion Graphics, 3D Design, Digital Marketing & Data Analytics courses with 100% placement support.",
    canonical: "https://slate-academy.com/courses",
  },
 "/about":{
  title:"About Slate Academy | Best Design Institute in South Delhi",
  description:
    "Learn why Slate Academy is the best graphic design and digital marketing institute in South Delhi, offering industry-focused training, expert mentors, and placement support.",
  canonical:"https://slate-academy.com/about",
},

  "/mentors": {
    title: "Our Mentors — Slate Academy",
    description: "Meet the industry experts and mentors at Slate Academy who guide students toward successful careers in design and marketing.",
    canonical: "https://slate-academy.com/mentors",
  },
  "/placements": {
  title: "Placements | Best Design & Marketing Institute in South Delhi",
  description:
    "Explore Slate Academy placements with student success stories, hiring partners, career guidance, and 100% placement assistance for creative careers.",
  keywords: [
    "Slate Academy placements",
    "design institute placement",
    "graphic design jobs delhi"
  ],
  canonical: "https://slate-academy.com/placements",
},
"/contact":{
  title:"Contact Slate Academy | Design Institute in South Delhi",
  description:
    "Get in touch with Slate Academy for admissions, course details, fees, placements, and free career counselling.",
  canonical:"https://slate-academy.com/contact",
},
  "/blog": {
    title: "Blog — Slate Academy",
    description: "Read the latest articles on design, marketing, and career tips from Slate Academy experts.",
    canonical: "https://slate-academy.com/blog",
  },
  "/knowledge-hub": {
  title: "Knowledge Hub | Design & Digital Marketing Blogs",
  description:
    "Read expert articles on graphic design, digital marketing, UI/UX, motion graphics, career tips, and industry trends from Slate Academy.",
  keywords:[
    "design blogs",
    "digital marketing blogs",
    "ui ux articles"
  ],
  canonical:"https://slate-academy.com/knowledge-hub",
},


  "/support":{
  title:"Support | Contact Slate Academy South Delhi",
  description:
    "Need help? Contact Slate Academy for course information, admissions, placements, technical support, and student assistance.",
  canonical:"https://slate-academy.com/support",
},

  "/portfolio": {
  title:"Student Portfolio | Graphic Design & UI UX Projects",
  description:
    "Discover creative student portfolios featuring graphic design, UI/UX, motion graphics, branding, and digital marketing projects by Slate Academy learners.",
  canonical:"https://slate-academy.com/portfolio",
},

  "/ai-chat": {
    title: "Slate Academy: Best Designing & Marketing Institute in Delhi",
    description: "Join the best institute in Delhi for Graphic Design, UI/UX, Motion Graphics, 3D Design, Digital Marketing & Data Analytics courses with 100% placement support.",
    canonical: "https://slate-academy.com/ai-chat",
  },  

  "/careers":{
  title:"Careers at Slate Academy | Jobs in South Delhi",
  description:
    "Join Slate Academy and explore career opportunities in graphic design, digital marketing, UI/UX, animation, and education.",
  canonical:"https://slate-academy.com/careers",
},

};

export async function fetchSeoForRoute(url: string): Promise<SeoResult> {
  const clean = url.split("?")[0].split("#")[0];

  // Static pages — direct return, no API call
  if (STATIC_SEO[clean]) {
    return STATIC_SEO[clean];
  }

  const explicitCourseMatch = clean.match(/^\/courses\/([a-z0-9-]+)\/?$/i);
  if (explicitCourseMatch) {
    return fetchCourseSeo(explicitCourseMatch[1]);
  }

  const blogMatch = clean.match(/^\/blog\/([a-z0-9-]+)\/?$/i);
  if (blogMatch) {
    return fetchBlogSeo(blogMatch[1]);
  }

  const topLevelMatch = clean.match(/^\/([a-z0-9-]+)\/?$/i);
  if (topLevelMatch && !NON_COURSE_TOP_LEVEL_SLUGS.has(topLevelMatch[1].toLowerCase())) {
    return fetchCourseSeo(topLevelMatch[1]);
  }

  return {};
}

async function fetchCourseSeo(slug: string): Promise<SeoResult> {
  return fetchAndExtract(`/courses/${slug}`);
}

async function fetchBlogSeo(slug: string): Promise<SeoResult> {
  return fetchAndExtract(`/blogs/${slug}`);
}

async function fetchAndExtract(path: string): Promise<SeoResult> {
  try {
    const { data } = await axios.get(`${API_BASE}${path}`, {
      timeout: 4000,
      headers: SSR_INTERNAL_SECRET ? { "x-ssr-secret": SSR_INTERNAL_SECRET } : undefined,
    });
    const doc = data?.data ?? data;
    if (!doc) return {};

    const rawOgImage = doc.seo?.ogImage || doc.thumbnail;
    const ogImage =
      typeof rawOgImage === "string" ? rawOgImage : rawOgImage?.url;

    return {
      title: doc.seo?.title || doc.seoTitle || doc.title,
      description: doc.seo?.description || doc.metaDescription || doc.shortDescription,
      keywords: doc.seo?.keywords,
      canonical: doc.seo?.canonical,
      ogImage,
    };
  } catch (err) {
    console.error("[fetchSeo] failed for", path, err instanceof Error ? err.message : err);
    return {};
  }
}