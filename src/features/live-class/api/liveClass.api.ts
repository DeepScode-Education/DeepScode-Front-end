import { getToken, getAdminToken } from "@/integrations/client";

const VITE_API_BASE = import.meta.env.VITE_API_BASE as string | undefined;
const BASE_URL = VITE_API_BASE?.trim() || "https://deepscode-backend-end.onrender.com";

import type {
  LiveClass,
  JoinClassPayload,
  StartClassPayload,
  ApiEnvelope,
} from "../types/liveClass.types";

type JoinClassResponse =
  | ApiEnvelope<JoinClassPayload>
  | { data?: ApiEnvelope<JoinClassPayload> | JoinClassPayload };

const extractTokenString = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return undefined;

  const tokenObject = value as Record<string, unknown>;
  for (const key of ["token", "jwt", "accessToken", "value", "data"]) {
    const nestedToken = extractTokenString(tokenObject[key]);
    if (nestedToken) return nestedToken;
  }

  return undefined;
};

export const extractJoinClassData = (response: JoinClassResponse): JoinClassPayload => {
  const responseData = response && typeof response === "object" && "data" in response
    ? response.data
    : response;
  const joinData = responseData && typeof responseData === "object" && "data" in responseData
    ? responseData.data
    : responseData;

  const normalizedJoinData = (joinData ?? {}) as JoinClassPayload & { token?: unknown };

  return {
    ...normalizedJoinData,
    token: extractTokenString(normalizedJoinData.token),
  };
};

// Reuses the same request pattern already established in integrations/client.ts —
// no separate API wrapper introduced, per project convention.
const authToken = () => getToken() ?? getAdminToken();

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = authToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers, cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Live class request failed");
  }
  return res.json() as Promise<T>;
}

export const liveClassApi = {
  startClass: (payload: StartClassPayload) =>
    request<ApiEnvelope<LiveClass>>("/api/live/start", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  endClass: (liveClassId: string) =>
    request<ApiEnvelope<LiveClass>>("/api/live/end", {
      method: "POST",
      body: JSON.stringify({ liveClassId }),
    }),

  joinClass: (liveClassId: string) =>
    request<JoinClassResponse>("/api/live/join", {
      method: "POST",
      body: JSON.stringify({ liveClassId }),
    }),

  getCurrent: () => request<ApiEnvelope<LiveClass | null>>("/api/live/current"),
  getUpcoming: () => request<ApiEnvelope<LiveClass[]>>("/api/live/upcoming"),
  getHistory: () => request<ApiEnvelope<LiveClass[]>>("/api/live/history"),

  attendanceHeartbeat: (liveClassId: string) =>
    request<ApiEnvelope<unknown>>("/api/live/attendance/heartbeat", {
      method: "POST",
      body: JSON.stringify({ liveClassId }),
    }),

  hostHeartbeat: (liveClassId: string) =>
    request<ApiEnvelope<unknown>>("/api/live/host-heartbeat", {
      method: "POST",
      body: JSON.stringify({ liveClassId }),
    }),
};