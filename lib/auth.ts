// Client-side auth helpers.
//
// - Token lives in localStorage under AUTH_TOKEN_KEY. Cookies are not used
//   because the FastAPI backend sets no Set-Cookie headers — JWT is the
//   Authorization header only.
// - `getCurrentUser()` returns null on 401 so callers can decide whether
//   to redirect. The /sites, /editor/*, and root pages route through
//   <AuthGuard /> for the actual redirect.

import { apiGet, apiPost } from "@/lib/api";

export const AUTH_TOKEN_KEY = "auth_token";

export type AuthUser = {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  is_admin: boolean;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setToken(token: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearToken(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// --- Auth API --------------------------------------------------------------

/**
 * POST /auth/register. Returns the user payload (NOT a token — the user must
 * verify their email via OTP before they can log in).
 */
export async function register(input: {
  email: string;
  password: string;
  full_name?: string;
}): Promise<AuthUser> {
  return apiPost<AuthUser>("/auth/register", input, { auth: false });
}

/**
 * POST /auth/token. OAuth2 form-encoded (per FastAPI's OAuth2PasswordRequestForm).
 * The endpoint returns `{ access_token, token_type }` directly (no envelope),
 * so we set `unwrapped: true`.
 */
export async function login(input: {
  email: string;
  password: string;
}): Promise<TokenResponse> {
  const form = new URLSearchParams();
  form.set("username", input.email);
  form.set("password", input.password);
  return apiPost<TokenResponse>("/auth/token", form, {
    auth: false,
    unwrapped: true,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

/**
 * POST /auth/verify-otp. On success, the backend returns the wrapped envelope
 * with `{ access_token, token_type }` inside `data`. The caller is responsible
 * for calling `setToken()` with the returned access token.
 */
export async function verifyOtp(input: {
  email: string;
  code: string;
}): Promise<TokenResponse> {
  return apiPost<TokenResponse>("/auth/verify-otp", input, { auth: false });
}

export async function resendOtp(input: { email: string }): Promise<void> {
  await apiPost<unknown>("/auth/resend-otp", input, { auth: false });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    return await apiGet<AuthUser>("/auth/me");
  } catch (err) {
    // 401 just means the token is bad/expired; treat as anonymous.
    if (err instanceof Error && "status" in err && (err as { status: number }).status === 401) {
      return null;
    }
    throw err;
  }
}

export function logout(): void {
  clearToken();
}
