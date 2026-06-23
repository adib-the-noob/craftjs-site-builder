import { STORAGE_KEY } from "@/lib/constants";

export function loadSiteState(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function saveSiteState(serialized: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, serialized);
}

export function clearSiteState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
