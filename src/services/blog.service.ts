// import { BASE_URL, getAdminToken, getToken } from "@/integrations/client";
// import type {
//   Blog,
//   BlogListResponse,
//   BlogResponse,
//   BlogQuery,
// } from "@/types/blog";

// async function request<T>(
//   path: string,
//   options: RequestInit = {}
// ): Promise<T> {
//   const token = getAdminToken() ?? getToken();

//   if (!token) {
//     throw new Error("No token provided. Please log in.");
//   }

//   const isFormData = options.body instanceof FormData;

//   const headers: Record<string, string> = {
//     Authorization: `Bearer ${token}`,
//     ...(isFormData ? {} : { "Content-Type": "application/json" }),
//     ...(options.headers as Record<string, string>),
//   };

//   const res = await fetch(`${BASE_URL}${path}`, {
//     ...options,
//     headers,
//   });

//   const data = await res.json();

//   if (!res.ok) {
//     throw new Error(data.message || "Request failed");
//   }

//   return data;
// }

// export const blogApi = {
//   getAll: (query?: BlogQuery) => {
//     const params = new URLSearchParams();

//     if (query?.page) params.append("page", String(query.page));
//     if (query?.limit) params.append("limit", String(query.limit));
//     if (query?.search) params.append("search", query.search);
//     if (query?.category) params.append("category", query.category);
//     if (query?.status) params.append("status", query.status);

//     if (query?.featured !== undefined) {
//       params.append("featured", String(query.featured));
//     }

//     return request<BlogListResponse>(
//       `/api/admin/blogs?${params.toString()}`
//     );
//   },

//   getById: (id: string) =>
//     request<BlogResponse>(`/api/admin/blogs/${id}`),

//   create: (payload: FormData) =>
//     request<BlogResponse>("/api/admin/blogs", {
//       method: "POST",
//       body: payload,
//     }),

//   update: (id: string, payload: FormData) =>
//     request<BlogResponse>(`/api/admin/blogs/${id}`, {
//       method: "PUT",
//       body: payload,
//     }),

//   delete: (id: string) =>
//     request<{ success: boolean; message: string }>(
//       `/api/admin/blogs/${id}`,
//       {
//         method: "DELETE",
//       }
//     ),

//   updateStatus: (
//     id: string,
//     status: "Draft" | "Published"
//   ) =>
//     request<BlogResponse>(`/api/admin/blogs/${id}/status`, {
//       method: "PATCH",
//       body: JSON.stringify({ status }),
//     }),
// };








import { BASE_URL, getAdminToken, getToken } from "@/integrations/client";
import type {
  Blog,
  BlogListResponse,
  BlogResponse,
  BlogQuery,
} from "@/types/blog";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAdminToken() ?? getToken();

  if (!token) {
    throw new Error("No token provided. Please log in.");
  }

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const blogApi = {
  getAll: (query?: BlogQuery) => {
    const params = new URLSearchParams();

    if (query?.page) params.append("page", String(query.page));
    if (query?.limit) params.append("limit", String(query.limit));
    if (query?.search) params.append("search", query.search);
    if (query?.course) params.append("course", query.course); // NEW
    else if (query?.category) params.append("category", query.category); // legacy fallback
    if (query?.status) params.append("status", query.status);

    if (query?.featured !== undefined) {
      params.append("featured", String(query.featured));
    }

    return request<BlogListResponse>(
      `/api/admin/blogs?${params.toString()}`
    );
  },

  getById: (id: string) =>
    request<BlogResponse>(`/api/admin/blogs/${id}`),

  create: (payload: FormData) =>
    request<BlogResponse>("/api/admin/blogs", {
      method: "POST",
      body: payload,
    }),

  update: (id: string, payload: FormData) =>
    request<BlogResponse>(`/api/admin/blogs/${id}`, {
      method: "PUT",
      body: payload,
    }),

  delete: (id: string) =>
    request<{ success: boolean; message: string }>(
      `/api/admin/blogs/${id}`,
      {
        method: "DELETE",
      }
    ),

  updateStatus: (
    id: string,
    status: "Draft" | "Published"
  ) =>
    request<BlogResponse>(`/api/admin/blogs/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};