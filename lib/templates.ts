// Templates are now owned by the FastAPI backend. The list endpoint is
// public (no auth required) and returns the lightweight metadata. To get
// the full `data` payload (Craft.js serialised state), you must call the
// detail endpoint.
//
// We don't cache the list in memory across navigations — each caller awaits
// a fresh fetch. The backend is the source of truth.

import { apiGet } from "@/lib/api";
import type { SiteTemplate } from "@/lib/constants";

type BackendTemplateListItem = {
  id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
};

type BackendTemplateDetail = BackendTemplateListItem & {
  site_data: SiteTemplate["data"] | null;
};

export async function getTemplates(): Promise<SiteTemplate[]> {
  const items = await apiGet<BackendTemplateListItem[]>("/templates", {
    auth: false,
  });
  return items.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description ?? "",
    thumbnail: t.thumbnail ?? undefined,
    data: {},
  }));
}

export async function getTemplateById(
  id: string
): Promise<SiteTemplate | null> {
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
    return null;
  }
}

/**
 * Synchronous fallback used by the editor's Templates dropdown while a
 * fetch is in flight. Returns an empty array — UI callers should branch on
 * `templates.length === 0` to show a loading state.
 */
export function getDefaultTemplate(): SiteTemplate {
  return {
    id: "blank",
    name: "Blank site",
    description: "Start from an empty canvas",
    data: { ROOT: { type: "Container", props: { padding: 0, background: "#ffffff" }, displayName: "Container", custom: {}, hidden: false, nodes: [] } },
  };
}
