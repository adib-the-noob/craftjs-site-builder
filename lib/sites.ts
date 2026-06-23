"use client";

import {
  SITE_INDEX_KEY,
  SITE_COUNTER_KEY,
  siteKey,
  generateSiteId,
  STORAGE_KEY,
  type Site,
} from "@/lib/constants";
import { getDefaultTemplate, getTemplateById } from "@/lib/templates";

// Re-export Site so consumers can do `import type { Site } from "@/lib/sites"`.
export type { Site };

function isBrowser() {
  return typeof window !== "undefined";
}

function readIndex(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(SITE_INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeIndex(ids: string[]) {
  if (!isBrowser()) return;
  localStorage.setItem(SITE_INDEX_KEY, JSON.stringify(ids));
}

export function listSites(): Site[] {
  const ids = readIndex();
  const sites: Site[] = [];
  for (const id of ids) {
    const s = getSite(id);
    if (s) sites.push(s);
  }
  return sites.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getSite(id: string): Site | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(siteKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Site;
  } catch {
    return null;
  }
}

export function createSite(name: string, templateId?: string): Site {
  const id = generateSiteId();
  const now = Date.now();
  const template = templateId
    ? getTemplateById(templateId)
    : getDefaultTemplate();
  // Deep clone template data so edits never mutate the source JSON.
  const data = JSON.parse(JSON.stringify(template?.data ?? {}));
  const site: Site = {
    id,
    name: name.trim() || "Untitled site",
    createdAt: now,
    updatedAt: now,
    data,
    meta: {
      title: name.trim() || "Untitled site",
    },
  };
  if (isBrowser()) {
    localStorage.setItem(siteKey(id), JSON.stringify(site));
    const idx = readIndex();
    idx.push(id);
    writeIndex(idx);
    const counter = Number(localStorage.getItem(SITE_COUNTER_KEY) ?? "0") + 1;
    localStorage.setItem(SITE_COUNTER_KEY, String(counter));
  }
  return site;
}

export function updateSite(
  id: string,
  patch: Partial<Pick<Site, "name" | "data" | "meta">>
): Site | null {
  const current = getSite(id);
  if (!current) return null;
  const updated: Site = {
    ...current,
    ...patch,
    updatedAt: Date.now(),
  };
  if (isBrowser()) {
    localStorage.setItem(siteKey(id), JSON.stringify(updated));
  }
  return updated;
}

export function deleteSite(id: string): void {
  if (!isBrowser()) return;
  localStorage.removeItem(siteKey(id));
  const idx = readIndex().filter((x) => x !== id);
  writeIndex(idx);
}

export function duplicateSite(id: string): Site | null {
  const current = getSite(id);
  if (!current) return null;
  return createSite(`${current.name} (copy)`, undefined);
}

/**
 * One-time migration: if the legacy single-site key exists and the new
 * index is empty, lift it into a new site named "My Site".
 */
export function migrateLegacyState(): void {
  if (!isBrowser()) return;
  const idx = readIndex();
  if (idx.length > 0) return;
  const legacy = localStorage.getItem(STORAGE_KEY);
  if (!legacy) return;
  try {
    const data = JSON.parse(legacy);
    const id = generateSiteId();
    const now = Date.now();
    const site: Site = {
      id,
      name: "My Site",
      createdAt: now,
      updatedAt: now,
      data,
      meta: { title: "My Site" },
    };
    localStorage.setItem(siteKey(id), JSON.stringify(site));
    writeIndex([id]);
  } catch {
    // ignore corrupt legacy state
  }
}