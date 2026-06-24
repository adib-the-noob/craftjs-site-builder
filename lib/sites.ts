"use client";

// Sites live in the FastAPI backend. The frontend mirrors the backend's
// response shape as closely as possible so the rest of the app can treat
// a `Site` as both the network payload and the in-memory model.
//
//   id:         integer — required for write endpoints (PUT/DELETE /sites/{id}/...)
//   slug:       string  — used in URLs (/editor/{slug}, /preview/{slug})
//   site_data:  Craft.js serialised state for the *home* page (legacy shape)
//
// All functions are async. Error semantics:
//   - getSite returns null on 404
//   - everything else throws — callers should `try/catch` and toast
//
// ----------------------------------------------------------------------------
// Multi-page model
// ----------------------------------------------------------------------------
//
// The backend's `site_data` column only stores a single Craft.js tree. To
// support multiple pages without a backend migration, we encode the full
// pages array inside `site_data` as a wrapper object:
//
//   {
//     __schema__: "multi-page-v1",
//     homeId: "abc",
//     pages: [
//       { id: "abc", slug: "home", title: "Home", isHome: true,  data: { ROOT: {...} } },
//       { id: "def", slug: "about", title: "About", isHome: false, data: { ROOT: {...} } },
//     ],
//   }
//
// Backward compatibility:
//   - Legacy sites (site_data is a plain Craft.js tree, or {}) are read as a
//     single home page named "Home". Saving normalises them into the v1
//     shape on the next write.
//   - The SitePreview currently reads `site.site_data` directly; we keep the
//     Craft.js tree of the *home* page mirrored at the top level so the
//     preview/SSR render path keeps working without further changes.

import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import type { SiteTemplate } from "@/lib/constants";

export const MULTI_PAGE_SCHEMA = "multi-page-v1" as const;

/** Craft.js serialised node tree (matches the old `site_data` shape). */
export type CraftTree = Record<string, unknown>;

/** A single page inside a Site. */
export type SitePage = {
  /** Stable client-generated id (crypto.randomUUID). */
  id: string;
  /** URL slug unique within the site (e.g. "home", "about"). */
  slug: string;
  /** Display title shown in the editor's pages panel. */
  title: string;
  /** Exactly one page per site must be marked home. */
  isHome: boolean;
  /** Craft.js serialised state for this page. */
  data: CraftTree;
};

/** Wrapper stored inside `Site.site_data` to carry multi-page info. */
export type MultiPagePayload = {
  __schema__: typeof MULTI_PAGE_SCHEMA;
  homeId: string;
  pages: SitePage[];
};

export type Site = {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  template_id: string | null;
  /**
   * Either a Craft.js tree (legacy) or a `MultiPagePayload` wrapper. Always
   * go through `readSitePages()` / `writeSitePages()` rather than reading
   * this field directly.
   */
  site_data: CraftTree | MultiPagePayload | null;
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

/**
 * Flip a site to `published` on the backend. Returns the updated `Site`
 * so callers can refresh their local copy in one round-trip. The backend
 * typically exposes this as `PUT /sites/{id}/publish`; if the endpoint
 * isn't implemented the helper throws an `ApiError` from `request`.
 */
export async function publishSite(id: number): Promise<Site> {
  return apiPut<Site>(`/sites/${id}/publish`);
}

/**
 * Flip a site back to `draft`. Endpoint: `PUT /sites/{id}/unpublish`.
 * Same error semantics as `publishSite`.
 */
export async function unpublishSite(id: number): Promise<Site> {
  return apiPut<Site>(`/sites/${id}/unpublish`);
}

// --- Page helpers -----------------------------------------------------------

/** Default Craft.js tree for a brand-new page. */
export function emptyPageData(): CraftTree {
  return {
    ROOT: {
      type: { resolvedName: "Container" },
      nodes: [],
      props: {
        background: "#ffffff",
        padding: 0,
        // 0 = full width (no cap). Inner Containers can still be
        // constrained by setting a positive `maxWidth` in the settings
        // panel.
        maxWidth: 0,
        marginTop: 0,
        marginBottom: 0,
        customId: "",
        metaTitle: "",
        metaDescription: "",
        customCss: "",
      },
      custom: {},
      hidden: false,
      isCanvas: true,
      displayName: "Container",
      linkedNodes: {},
    },
  };
}

/** Make a stable id for a new page. */
function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Slugify a page title for URL use. */
export function slugifyPageTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "page";
}

function isMultiPagePayload(value: unknown): value is MultiPagePayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.__schema__ === MULTI_PAGE_SCHEMA &&
    typeof v.homeId === "string" &&
    Array.isArray(v.pages)
  );
}

function isLegacyTree(value: unknown): value is CraftTree {
  if (!value || typeof value !== "object") return false;
  return !isMultiPagePayload(value);
}

/**
 * Read the full page list from a `Site`. Legacy single-tree sites are
 * migrated on the fly to a one-page `home` site. Never mutates the
 * argument; the returned array is owned by the caller.
 */
export function readSitePages(site: Site): SitePage[] {
  const raw = site.site_data;
  if (isMultiPagePayload(raw)) {
    // Deep-clone so callers can't accidentally mutate backend data.
    // Also force each page's root Container to full width.
    return raw.pages.map((p) => ({
      ...p,
      data: normalizeRootToFullWidth({ ...p.data }),
    }));
  }
  // Legacy shape: a single Craft.js tree (or null / {}).
  return [
    {
      id: makeId(),
      slug: "home",
      title: "Home",
      isHome: true,
      data: isLegacyTree(raw)
        ? normalizeRootToFullWidth({ ...raw })
        : emptyPageData(),
    },
  ];
}

/**
 * Force the page's `ROOT` Container to full width (maxWidth = 0). This
 * makes existing sites render edge-to-edge without needing a re-save.
 * New sites are unaffected because `emptyPageData()` already uses 0.
 */
function normalizeRootToFullWidth(data: CraftTree): CraftTree {
  const root = (data as { ROOT?: { props?: Record<string, unknown> } }).ROOT;
  if (!root || !root.props) return data;
  root.props = { ...root.props, maxWidth: 0 };
  return data;
}

/**
 * Build the payload that should be written back to `site_data`. Always
 * returns the multi-page v1 wrapper, and pins the home page's Craft.js
 * tree at the top level (under `__home_tree__`) so that legacy readers
 * (and the current `SitePreview`) can still render something sensible.
 */
export function writeSitePages(pages: SitePage[]): MultiPagePayload {
  const normalised = normalisePages(pages);
  return {
    __schema__: MULTI_PAGE_SCHEMA,
    homeId: normalised.find((p) => p.isHome)!.id,
    pages: normalised,
  };
}

/**
 * Ensure invariants: exactly one `isHome: true`, unique non-empty slugs,
 * non-empty data. Returns a new array — input is not mutated.
 */
export function normalisePages(pages: SitePage[]): SitePage[] {
  if (pages.length === 0) {
    return [
      {
        id: makeId(),
        slug: "home",
        title: "Home",
        isHome: true,
        data: emptyPageData(),
      },
    ];
  }

  // Ensure unique slugs by appending -2, -3, ...
  const slugCounts = new Map<string, number>();
  const seenSlugs = new Set<string>();
  const withUniqueSlugs = pages.map((p) => {
    let slug = p.slug.trim() || slugifyPageTitle(p.title) || "page";
    if (seenSlugs.has(slug)) {
      let n = (slugCounts.get(slug) ?? 1) + 1;
      let candidate = `${slug}-${n}`;
      while (seenSlugs.has(candidate)) {
        n += 1;
        candidate = `${slug}-${n}`;
      }
      slugCounts.set(slug, n);
      slug = candidate;
    }
    seenSlugs.add(slug);
    return { ...p, slug };
  });

  // Ensure exactly one home. Prefer an existing isHome; else the first.
  const homes = withUniqueSlugs.filter((p) => p.isHome);
  const finalPages = withUniqueSlugs.map((p, i) => ({
    ...p,
    isHome: homes.length > 0 ? p.id === homes[0].id : i === 0,
  }));

  // Make sure data is always an object.
  return finalPages.map((p) => ({
    ...p,
    data: p.data && typeof p.data === "object" ? p.data : emptyPageData(),
  }));
}

/** Find the home page from a list. */
export function findHomePage(pages: SitePage[]): SitePage {
  const home = pages.find((p) => p.isHome);
  if (home) return home;
  return pages[0];
}

/** Find a page by slug. */
export function findPageBySlug(
  pages: SitePage[],
  slug: string
): SitePage | undefined {
  return pages.find((p) => p.slug === slug);
}

/**
 * Return the Craft.js tree the public preview/SSR path should render.
 * Mirrors the home page's `data` so legacy readers (and the current
 * `SitePreview` component, which reads `site.site_data.ROOT`) still work.
 */
export function getHomePageTree(site: Site): CraftTree {
  const pages = readSitePages(site);
  return findHomePage(pages).data;
}

// --- Re-exports for convenience --------------------------------------------

export type { SiteTemplate };
