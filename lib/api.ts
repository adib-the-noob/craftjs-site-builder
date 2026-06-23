// Client-side typed fetch wrapper for the FastAPI backend.
//
// The backend wraps every successful response in
//   { success: true, message, data, status_code }
// (see app/schemas/response.py). We unwrap it here so the rest of the
// app can work with the inner payload. The auth router's
// POST /auth/token breaks the pattern and returns
//   { access_token, token_type }
// directly — `unwrapped: true` opts out of envelope parsing for that case.

import { getToken } from "@/lib/auth";

const DEFAULT_BASE_URL = "http://localhost:8000";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ||
  DEFAULT_BASE_URL;

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type RequestInitWithJson = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Return the raw response body instead of unwrapping the APIResponse envelope. */
  unwrapped?: boolean;
  /** Send the Bearer token explicitly. Defaults to true. */
  auth?: boolean;
};

function isApiEnvelope(value: unknown): value is {
  success: boolean;
  message: string;
  data: unknown;
  status_code?: number;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    typeof (value as { success: unknown }).success === "boolean"
  );
}

export async function request<T = unknown>(
  path: string,
  init: RequestInitWithJson = {}
): Promise<T> {
  const {
    body,
    unwrapped = false,
    auth = true,
    headers,
    ...rest
  } = init;

  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  // Only set JSON Content-Type for plain objects/arrays. FormData and
  // URLSearchParams must keep their own Content-Type — fetch sets the
  // boundary-based Content-Type for FormData, and URLSearchParams needs
  // `application/x-www-form-urlencoded` (which the caller should supply
  // via the `headers` option, since `URLSearchParams` is not auto-detected).
  if (
    body !== undefined &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams)
  ) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : body instanceof URLSearchParams
            ? body
            : JSON.stringify(body),
    // The backend uses CORS allow_origins=['*']; we never send cookies, so
    // "omit" is correct and works regardless of credentials mode.
    credentials: "omit",
    cache: "no-store",
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload !== null && "detail" in payload
        ? String((payload as { detail: unknown }).detail)
        : `Request failed with status ${response.status}`;
    throw new ApiError(detail, response.status, payload);
  }

  if (unwrapped) return payload as T;

  if (isApiEnvelope(payload)) {
    if (!payload.success) {
      throw new ApiError(
        payload.message || "Request failed",
        response.status,
        payload
      );
    }
    return payload.data as T;
  }

  // Endpoint didn't return an envelope (e.g. POST /auth/token).
  return payload as T;
}

export const apiGet = <T>(path: string, init?: RequestInitWithJson) =>
  request<T>(path, { ...init, method: "GET" });

export const apiPost = <T>(path: string, body?: unknown, init?: RequestInitWithJson) =>
  request<T>(path, { ...init, method: "POST", body });

export const apiPut = <T>(path: string, body?: unknown, init?: RequestInitWithJson) =>
  request<T>(path, { ...init, method: "PUT", body });

export const apiDelete = <T>(path: string, init?: RequestInitWithJson) =>
  request<T>(path, { ...init, method: "DELETE" });
