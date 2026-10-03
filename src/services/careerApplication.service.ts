import { BASE_URL, getAdminToken, getToken } from "@/integrations/client";
import type {
  ApplicationListResponse,
  ApplicationResponse,
  ApplicationStatus,
  DashboardStats,
} from "@/types/careerApplication";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken() ?? getToken();
  if (!token) throw new Error("No token provided. Please log in.");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const careerApplicationApi = {
  /** All applications — optionally filtered */
  getAll: (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page)   qs.set("page",   String(params.page));
    if (params?.limit)  qs.set("limit",  String(params.limit));
    if (params?.status) qs.set("status", params.status);
    if (params?.search) qs.set("search", params.search);
    return request<ApplicationListResponse>(`/api/career-applications/admin?${qs}`);
  },

  /** Single application by ID */
  getById: (id: string) =>
    request<ApplicationResponse>(`/api/career-applications/admin/${id}`),

  /** Update application status */
  updateStatus: (id: string, status: ApplicationStatus, adminRemarks?: string) =>
    request<ApplicationResponse>(`/api/career-applications/admin/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, adminRemarks }),
    }),

  /** Soft-delete application */
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(
      `/api/career-applications/admin/${id}`,
      { method: "DELETE" }
    ),

  /** Dashboard stats */
  getDashboardStats: () =>
    request<{ success: boolean; data: DashboardStats }>(
      "/api/career-applications/admin/dashboard"
    ),
};