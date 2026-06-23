import templates from "@/data/templates.json";
import type { SiteTemplate } from "@/lib/constants";

export function getTemplates(): SiteTemplate[] {
  return templates as SiteTemplate[];
}

export function getTemplateById(id: string): SiteTemplate | undefined {
  return getTemplates().find((template) => template.id === id);
}

export function getDefaultTemplate(): SiteTemplate {
  return getTemplates()[0];
}
