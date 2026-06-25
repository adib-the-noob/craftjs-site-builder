# Craft.js Site Builder — Documentation

A visual site builder on top of [`@craftjs/core`](https://github.com/prevwong/craft.js) v0.2 (legacy API), Next.js 16 App Router, React 19, Tailwind v4, and shadcn/ui (`base-nova` style).

> The 16 craft components in `components/craft/` are the building blocks users drag from the toolbox and drop into the editor. This documentation describes the **shared design system** that powers them, the prop surface of every component, and how saved trees round-trip through the database.

## Quick links

- **[Architecture](./architecture.md)** — How the editor, resolver, components, and saved-tree JSON fit together.
- **[Design system](./design-system.md)** — `lib/craft-styles.ts` helpers, all settings primitives, and the unified prop vocabulary used by every component.
- **Component reference**
  - [Layout: Section, Container, Grid, Spacer, Divider](./components/layout.md)
  - [Content: Heading, Text, Badge, IconBox, List](./components/content.md)
  - [Media: ImageBlock, Video](./components/media.md)
  - [Interactive: CtaButton, Card, Navbar, ContactForm](./components/interactive.md)
- **Guides**
  - [Authoring saved trees (templates.json shape)](./saved-trees.md)
  - [Adding a new craft component](./adding-new-components.md)

## What this codebase is

A site is a tree of nodes. Each node has:

```ts
{
  type: { resolvedName: "Card" },   // name from lib/resolver.ts
  props: { title: "Hello", ... },   // JSON-serializable component props
  displayName: "Card",
  parent: "<parentNodeId>",
  isCanvas: true,                   // whether the node can hold children
  linkedNodes: { "slot-id": ["child-id", ...] }  // for components with named slots (e.g. Grid.col-0)
}
```

The editor is the React tree at runtime; `query.serialize()` produces JSON, which we persist in `lib/sites.ts`. The preview renders the same JSON with `<Editor enabled={false}>`, so the runtime editor code path is shared.

## What the major upgrade delivered

A single, unified design system that **every** component now consumes. Previously each component had its own ad-hoc `boxModel` and a couple of color pickers; the upgrade exposed a much larger, consistent prop surface:

- **Borders** — width / style / color / radius / per-side, with a live preview. (Previously almost no component had this.)
- **Shadows** — 6 Tailwind-style presets OR manual offsetX/Y/blur/spread/color.
- **Backgrounds** — solid color, multi-stop gradient, or image (with size/repeat/position/overlay).
- **Sizing** — width (%, px, presets), height, min/max — wired into every component.
- **Hover state** — color, background, border-color, lift (translateY), scale, opacity.
- **Transitions** — duration / easing / delay, applied to every hover-capable component.
- **Transforms** — rotate / scaleX / scaleY / translateX / translateY.
- **Display / position / overflow / opacity** — full CSS layout primitives.
- **Advanced typography** — text case (uppercase / lowercase / capitalize), text decoration (underline / strike / overline), line height, letter spacing, max-width (for readability), and per-component variants of these.
- **Multi-child Grid columns** — `col-N` slots accept any number of children; the dotted column outline is gone; up to 12 columns, custom CSS track sizes, row gap, zebra striping.
- **Click-through links** on Card, Badge, IconBox, Navbar CTA, plus CtaButton (with `target`/`rel`/`download`).

The full list of new settings fields per component is in [design-system.md](./design-system.md). All upgrades are **backward compatible** — old saved trees still render correctly because every new prop has a sensible default in `Component.craft.props`.

## How to run

```bash
npm install
npm run dev
```

Open `/sites` to pick a site, `/editor/<slug>` to edit, `/preview/<slug>` to see the read-only render.

```bash
npm run build      # production build (TypeScript-checked)
npx tsc --noEmit   # type-check only
```

## File map

```
app/
  editor/[siteSlug]/page.tsx     # Editor route
  preview/[siteSlug]/page.tsx    # Preview route
  sites/page.tsx                 # Sites dashboard

components/
  craft/                         # The 16 craft components (see docs/components/)
  craft/settings/                # Reusable settings UI primitives
  editor/                        # SiteEditor, RenderNode, Toolbox, LeftSidebar
  preview/                       # SitePreview

data/
  templates.json                 # Saved-tree examples (3,500+ lines)

lib/
  craft-styles.ts                # ⭐ Shared design-system helpers
  resolver.ts                    # Craft.js component registry
  sites.ts                       # getHomePageTree, save/load helpers
  templates.ts                   # template loading
  fonts.ts                       # EDITOR_FONTS registry

docs/                            # ← you are here
```
