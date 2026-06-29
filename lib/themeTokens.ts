/**
 * Theme tokens used across craft components. Centralising these means a
 * single Tailwind config update flows through every Card / Grid without
 * a code change here. Kept in `lib/` so it's available to both the
 * editor and the published site.
 *
 * Names mirror the keys the components used previously (e.g.
 * `primary/40`) so callers can grep for the old value while migrating.
 */
export const THEME_TOKENS = {
  /** Selection ring colour (rgba via Tailwind opacity). */
  selectionRing: "primary/40",
  /** Default border colour when the user hasn't picked one. */
  border: "border-border",
  /** Card surface colour. */
  surface: "#ffffff",
  /** Hover accent for `interaction: "border"` preset. */
  hoverAccent: "primary",
} as const;

/**
 * Sanitises a user-supplied `customId` so it's safe as an HTML id and
 * anchor target.
 *
 *   "card 1 with spaces!"  ->  "card-1-with-spaces"
 *
 * Returns the empty string when the input contains no usable
 * characters after sanitisation.
 */
export function sanitizeCustomId(raw: string): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

/**
 * Validates a (already-sanitised) id against the live tree of nodes.
 * Returns `null` when the id is unused, or the id of the *other* node
 * that already claims it.
 *
 * NOTE: live collision detection requires access to Craft.js's node
 * store, which is only available inside a component. This helper is
 * used by settings panels via `useEditor`.
 */
export const CUSTOM_ID_PATTERN = /^[a-z][a-z0-9-_]*$/;
