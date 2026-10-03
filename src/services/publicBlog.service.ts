// import axios from "axios";
// import { BASE_URL } from "@/integrations/client";
// import type { Blog } from "@/types/blog";

// // Public blog endpoints don't need an auth token — separate axios instance
// // from the admin blog.service.ts, kept simple on purpose.
// const publicApi = axios.create({
//   baseURL: BASE_URL,
// });

// export interface PublicBlogQuery {
//   category?: string;
//   search?: string;
// }

// export interface PublicBlogListResponse {
//   success: boolean;
//   count: number;
//   data: Blog[];
// }

// export interface PublicBlogResponse {
//   success: boolean;
//   data: Blog;
// }

// export const publicBlogApi = {
//   // GET /api/blogs?category=..&search=..
//   getAll: (query?: PublicBlogQuery) => {
//     const params: Record<string, string> = {};

//     if (query?.category && query.category !== "All") {
//       params.category = query.category;
//     }

//     if (query?.search) {
//       params.search = query.search;
//     }

//     return publicApi.get<PublicBlogListResponse>("/api/blogs", { params });
//   },

//   // GET /api/blogs/featured
//   getFeatured: () => publicApi.get<PublicBlogListResponse>("/api/blogs/featured"),

//   // GET /api/blogs/:slug  (also bumps the view counter server-side)
//   getBySlug: (slug: string) =>
//     publicApi.get<PublicBlogResponse>(`/api/blogs/${slug}`),
// };



// export default publicBlogApi;



import axios from "axios";
import { BASE_URL } from "@/integrations/client";
import type { Blog } from "@/types/blog";

// Public blog endpoints don't need an auth token — separate axios instance
// from the admin blog.service.ts, kept simple on purpose.
const publicApi = axios.create({
  baseURL: BASE_URL,
});

export interface PublicBlogQuery {
  course?: string;   // NEW — Course _id, preferred filter going forward
  category?: string; // LEGACY — kept as fallback for old data/links
  search?: string;
}

export interface PublicBlogListResponse {
  success: boolean;
  count: number;
  data: Blog[];
}

export interface PublicBlogResponse {
  success: boolean;
  data: Blog;
}

export const publicBlogApi = {
  // GET /api/blogs?course=..&search=..   (or ?category=.. for legacy callers)
  getAll: (query?: PublicBlogQuery) => {
    const params: Record<string, string> = {};

    if (query?.course) {
      params.course = query.course;
    } else if (query?.category && query.category !== "All") {
      params.category = query.category;
    }

    if (query?.search) {
      params.search = query.search;
    }

    return publicApi.get<PublicBlogListResponse>("/api/blogs", { params });
  },

  // GET /api/blogs/featured
  getFeatured: () => publicApi.get<PublicBlogListResponse>("/api/blogs/featured"),

  // GET /api/blogs/:slug  (also bumps the view counter server-side)
  getBySlug: (slug: string) =>
    publicApi.get<PublicBlogResponse>(`/api/blogs/${slug}`),
};

export default publicBlogApi;