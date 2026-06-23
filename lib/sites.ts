"use client";

// Sites live in the FastAPI backend. The frontend mirrors the backend's
// response shape as closely as possible so the rest of the app can treat
// a `Site` as both the network payload and the in-memory model.
//
//   id:         integer — required for write endpoints (PUT/DELETE /sites/{id}/...)
//   slug:       string  — used in URLs (/editor/{slug}, /preview/{slug})
//   site_data:  Craft.js serialised state (replaces the old `data` field)
//
// All functions are async. Error semantics:
//   - getSite returns null on 404
//   - everything else throws — callers should `try/catch` and toast

import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import type { SiteTemplate } from "@/lib/constants";

export type Site = {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  template_id: string | null;
  site_data: Record<string, unknown> | null;
  status: "draft" | "published" | string;
  cdn_url: string | null;
  created_at: string;
  updated_at: string;
};

type SiteCreateInput = {
  name: string;
  template_id?: string | null;
};

type SiteUpdateContentInput = {
  site_data: Record<string, unknown>;
};

export async function listSites(): Promise<Site[]> {
  return apiGet<Site[]>("/sites");
}

export async function getSite(slug: string): Promise<Site | null> {
  try {
    return await apiGet<Site>(`/sites/${encodeURIComponent(slug)}`);
  } catch (err) {
    if (
      err instanceof Error &&
      "status" in err &&
      (err as { status: number }).status === 404
    ) {
      return null;
    }
    throw err;
  }
}

/**
 * Public, unauthenticated fetch. Used by the SSR preview page so the public
 * site is reachable without a token.
 */
export async function getPublicSite(slug: string): Promise<Site | null> {
  try {
    return await apiGet<Site>(
      `/sites/${encodeURIComponent(slug)}/public`,
      { auth: false }
    );
  } catch (err) {
    if (
      err instanceof Error &&
      "status" in err &&
      (err as { status: number }).status === 404
    ) {
      return null;
    }
    throw err;
  }
}

export async function createSite(
  name: string,
  templateId?: string | null
): Promise<Site> {
  const body: SiteCreateInput = {
    name: name.trim() || "Untitled site",
  };
  if (templateId) body.template_id = templateId;
  return apiPost<Site>("/sites", body);
}

export async function updateSite(
  id: number,
  patch: { data?: Record<string, unknown> }
): Promise<Site> {
  if (!patch.data) {
    throw new Error("updateSite: only `data` patches are supported");
  }
  const body: SiteUpdateContentInput = { site_data: patch.data };
  return apiPut<Site>(`/sites/${id}/content`, body);
}

export async function deleteSite(id: number): Promise<void> {
  await apiDelete<unknown>(`/sites/${id}`);
}

// --- Re-exports for convenience --------------------------------------------

export type { SiteTemplate };
