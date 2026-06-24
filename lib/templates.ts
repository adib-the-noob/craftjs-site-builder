// Templates can come from two places:
//
//   1. The FastAPI backend (`/templates`, `/templates/{id}`) — these are
//      the source of truth for shared/curated templates.
//   2. The local `data/templates.json` file — these are the synchronous
//      fallbacks we always show in the Templates dropdown so the editor
//      has something usable even when the backend is unreachable.
//
// Backend templates are merged on top of the local ones (a backend entry
// with the same `id` wins, so we can override a local starter remotely).
// Detail payloads are fetched lazily — the list endpoint only returns
// lightweight metadata (no `site_data`), and we hit `/templates/{id}`
// on demand when the user picks one from the dropdown.

import { apiGet } from "@/lib/api";
import type { SiteTemplate } from "@/lib/constants";
import localTemplates from "@/data/templates.json";

type LocalTemplate = {
  id: string;
  name: string;
  description: string;
  data: Record<string, unknown>;
};

const localMap = localTemplates as Record<string, LocalTemplate>;
const localList: LocalTemplate[] = Object.values(localMap);

/**
 * Synchronous starter templates used as a fallback when the backend list
 * endpoint is unreachable or returns nothing. Always available.
 */
export function getStarterTemplates(): SiteTemplate[] {
  return localList.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    data: t.data,
  }));
}

/**
 * Async — fetches the backend list, merges with local starters, and
 * returns lightweight metadata (no `data` payload). Use `getTemplateById`
 * (or the local map) to load the full tree on demand.
 */
export async function getTemplates(): Promise<SiteTemplate[]> {
  const starters = getStarterTemplates();
  let backend: BackendTemplateListItem[] = [];
  try {
    backend = await apiGet<BackendTemplateListItem[]>("/templates", {
      auth: false,
    });
  } catch {
    // Backend down or CORS — fall back to local starters only.
    return starters;
  }

  const backendAsTemplates: SiteTemplate[] = backend.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description ?? "",
    thumbnail: t.thumbnail ?? undefined,
    data: {},
  }));

  // Backend entries win on id collision; otherwise append.
  const seen = new Set(backendAsTemplates.map((t) => t.id));
  const merged = [...backendAsTemplates];
  for (const t of starters) {
    if (!seen.has(t.id)) merged.push(t);
  }
  return merged;
}

type BackendTemplateListItem = {
  id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
};

type BackendTemplateDetail = BackendTemplateListItem & {
  site_data: SiteTemplate["data"] | null;
};

/**
 * Async — fetches the full template (with `data` payload) from the backend
 * by id. Falls back to the local starter map if the backend is unreachable
 * or returns 404. Returns `null` only if the id is unknown everywhere.
 */
export async function getTemplateById(
  id: string
): Promise<SiteTemplate | null> {
  // 1. Try the backend first (authoritative for shared templates).
  try {
    const t = await apiGet<BackendTemplateDetail>(
      `/templates/${encodeURIComponent(id)}`,
      { auth: false }
    );
    return {
      id: t.id,
      name: t.name,
      description: t.description ?? "",
      thumbnail: t.thumbnail ?? undefined,
      data: (t.site_data ?? {}) as SiteTemplate["data"],
    };
  } catch {
    // fall through to local map
  }

  // 2. Local starter fallback (always available, no network).
  const local = localMap[id];
  if (local) {
    return {
      id: local.id,
      name: local.name,
      description: local.description,
      data: local.data,
    };
  }

  return null;
}

/**
 * Synchronous fallback used by the editor's Templates dropdown while a
 * fetch is in flight. Returns the first local starter — UI callers should
 * branch on `templates.length === 0` to show a loading state.
 */
export function getDefaultTemplate(): SiteTemplate {
  const blank = localMap.blank ?? localList[0];
  return {
    id: blank.id,
    name: blank.name,
    description: blank.description,
    data: blank.data,
  };
}
