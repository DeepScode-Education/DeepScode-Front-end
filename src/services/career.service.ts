import { BASE_URL, getAdminToken, getToken } from "@/integrations/client";
import type {
  Career,
  CareerPayload,
  CareerListResponse,
  CareerResponse,
} from "@/types/career";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // ✅ Same pattern as every other admin API in client.ts
  const token = getAdminToken() ?? getToken();

  if (!token) {
    throw new Error("No token provided. Please log in.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const careerApi = {
  getAll: () => request<CareerListResponse>("/api/admin/careers"),

  getById: (id: string) => request<CareerResponse>(`/api/admin/careers/${id}`),

  create: (payload: CareerPayload) =>
    request<CareerResponse>("/api/admin/careers", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: CareerPayload) =>
    request<CareerResponse>(`/api/admin/careers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/careers/${id}`, {
      method: "DELETE",
    }),

  updateStatus: (id: string, status: Career["status"]) =>
    request<CareerResponse>(`/api/admin/careers/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};