// Templates can come from three places:
//
//   1. The FastAPI backend (`/templates`, `/templates/{id}`) — the source of
//      truth for shared/curated templates.
//   2. Built-in `.tsx` templates under lib/craftTemplate/templates (see
//      lib/craftTemplate) — authored as real JSX and compiled to a Craft.js
//      tree at build time. Always available, no network; this is where the
//      polished starters live.
//   3. The local `data/templates.json` file — synchronous JSON starters kept
//      as a last-resort fallback.
//
// On id collision, the higher-priority source wins: backend > .tsx > JSON
// (so we can override a built-in remotely). Detail payloads are fetched
// lazily — the list endpoint only returns lightweight metadata (no
// `site_data`), and we hit `/templates/{id}` on demand when the user picks
// one from the dropdown.

import { apiGet } from "@/lib/api";
import type { SiteTemplate } from "@/lib/constants";
import localTemplates from "@/data/templates.json";
import { frontendTemplates, getFrontendTemplate } from "@/lib/craftTemplate/registry";

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
 * endpoint is unreachable or returns nothing. Always available. Combines the
 * `.tsx` built-ins (highest priority) with the JSON starters.
 */
export function getStarterTemplates(): SiteTemplate[] {
  const merged: SiteTemplate[] = [];
  const seen = new Set<string>();

  // 1. .tsx built-ins (highest local priority).
  for (const t of frontendTemplates) {
    if (!seen.has(t.id)) {
      seen.add(t.id);
      merged.push(t);
    }
  }
  // 2. JSON starters.
  for (const t of localList) {
    if (!seen.has(t.id)) {
      seen.add(t.id);
      merged.push({
        id: t.id,
        name: t.name,
        description: t.description,
        data: t.data,
      });
    }
  }
  return merged;
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
    // fall through to local sources
  }

  // 2. .tsx built-in (always available, no network).
  const frontend = getFrontendTemplate(id);
  if (frontend) return frontend;

  // 3. JSON starter fallback.
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
