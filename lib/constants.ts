// Shared types. Storage keys and ID generation moved out — sites now
// live in the FastAPI backend (`lib/sites.ts`) and are identified by an
// integer `id` (writes) and a string `slug` (URLs).

export type SiteTemplate = {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  data: Record<string, unknown>;
};
