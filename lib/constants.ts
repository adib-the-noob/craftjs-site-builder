// Legacy single-site key — kept for migration
export const STORAGE_KEY = "craftjs-site-builder-state";

// Multi-site storage layout
export const SITE_INDEX_KEY = "craftjs-site-builder:index";
export const SITE_PREFIX = "craftjs-site-builder:site:";
export const SITE_COUNTER_KEY = "craftjs-site-builder:counter";

export const siteKey = (id: string) => `${SITE_PREFIX}${id}`;

export type SiteTemplate = {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  data: Record<string, unknown>;
};

export type Site = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  data: Record<string, unknown>;
  meta?: {
    title?: string;
    description?: string;
    customCss?: string;
  };
};

// Generate a short, URL-friendly id like "site_a1b2c3d4"
export function generateSiteId(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `site_${window.crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }
  const rand = Math.random().toString(36).slice(2, 10);
  return `site_${rand}`;
}