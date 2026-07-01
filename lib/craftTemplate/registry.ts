// Built-in templates authored as .tsx files under lib/craftTemplate/templates.
// Each module default-exports a SiteTemplate (metadata + a Craft.js tree
// compiled from JSX by the craftTemplate runtime). They are merged into the
// editor's Templates dropdown alongside backend templates and the legacy
// data/templates.json starters (see lib/templates.ts).
//
// Add a new built-in template: author `lib/craftTemplate/templates/your-template.tsx`,
// then import + append it to the array below.

import type { SiteTemplate } from "@/lib/constants";
import agencyStudio from "./templates/agency";
import freelancerPortfolio from "./templates/freelancer";
import localBusiness from "./templates/local-business";
import saasLanding from "./templates/saas";

export const frontendTemplates: SiteTemplate[] = [
  saasLanding,
  freelancerPortfolio,
  agencyStudio,
  localBusiness,
];

const byId = new Map(frontendTemplates.map((t) => [t.id, t]));

/** O(1) lookup used by getTemplateById's local fallback chain. */
export function getFrontendTemplate(id: string): SiteTemplate | null {
  return byId.get(id) ?? null;
}
