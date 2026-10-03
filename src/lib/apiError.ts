// src/lib/apiError.ts
//
// Drop this file into your frontend (e.g. src/lib/apiError.ts) and use it
// wherever you currently do `fetch(...).then(r => r.json())` against the
// Slate API. It understands the new error shape the backend now returns:
//
//   {
//     success: false,
//     message: "Human readable message",
//     errorCode: "VALIDATION_ERROR",
//     errors?: [{ field: "title", message: "Title is required" }, ...]
//   }
//
// USAGE (replaces the old apiFetch body-parsing logic):
//
//   import { ApiError, parseApiError } from "@/lib/apiError";
//
//   const res  = await fetch(url, init);
//   const json = await res.json().catch(() => ({}));
//   if (!res.ok) throw parseApiError(json, res.status);
//
//   // Later, in a catch block:
//   catch (e) {
//     if (e instanceof ApiError) {
//       setError(e.message);              // top-line message, always safe to show
//       setFieldErrors(e.fieldErrors);     // [{ field, message }] — for form-level display
//     } else {
//       setError("Something went wrong. Please check your connection and try again.");
//     }
//   }

export interface ApiFieldError {
  field?: string;
  message: string;
}

export class ApiError extends Error {
  statusCode: number;
  errorCode: string;
  fieldErrors: ApiFieldError[];

  constructor(message: string, statusCode: number, errorCode = "UNKNOWN_ERROR", fieldErrors: ApiFieldError[] = []) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.fieldErrors = fieldErrors;
  }

  /** True for the common "you're not logged in / your session expired" cases. */
  get isAuthError() {
    return this.statusCode === 401 || this.errorCode === "AUTHENTICATION_ERROR" || this.errorCode === "TOKEN_EXPIRED";
  }

  /** True when the server told us specifically which fields were wrong. */
  get hasFieldErrors() {
    return this.fieldErrors.length > 0;
  }

  /** A single string combining the top-level message with any field errors — handy for a toast. */
  toDisplayString() {
    if (!this.hasFieldErrors) return this.message;
    const details = this.fieldErrors.map((f) => (f.field ? `${f.field}: ${f.message}` : f.message)).join(" · ");
    return `${this.message} (${details})`;
  }
}

/**
 * parseApiError(json, statusCode)
 * Converts a parsed-but-failed JSON response body into an ApiError.
 * Safe to call even if `json` is empty/malformed (e.g. the server crashed
 * before it could send JSON, or a proxy/gateway returned plain text).
 */
export function parseApiError(json: unknown, statusCode: number): ApiError {
  const body = (json ?? {}) as {
    message?: string;
    errorCode?: string;
    errors?: Array<ApiFieldError | string>;
  };

  const fieldErrors: ApiFieldError[] = Array.isArray(body.errors)
    ? body.errors.map((e) => (typeof e === "string" ? { message: e } : e))
    : [];

  const message =
    body.message ||
    (statusCode >= 500
      ? "Something went wrong on the server. Please try again."
      : statusCode === 404
      ? "The requested item could not be found."
      : "The request could not be completed.");

  return new ApiError(message, statusCode, body.errorCode || "UNKNOWN_ERROR", fieldErrors);
}

/**
 * Drop-in replacement for a bare `fetch(...).then(r => r.json())` call.
 * Throws an ApiError on any non-2xx response instead of a generic
 * "HTTP 500" Error, so callers can show `error.message` directly.
 */
export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    // Network failure — server unreachable, CORS block, offline, etc.
    throw new ApiError("Could not reach the server. Check your connection and try again.", 0, "NETWORK_ERROR");
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw parseApiError(json, res.status);
  }

  return json as T;
}