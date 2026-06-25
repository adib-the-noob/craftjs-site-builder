# Layout components

Components that primarily structure a page: rows, columns, grids, spacers, dividers.

## Section

`components/craft/Section.tsx`

Full-width `<section>` with an inner constrained container. The workhorse for top-level page rows. Renders `{children}` so anything can be dropped in.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `background` | `BackgroundValue` | `{ type: "solid", color: "#ffffff" }` | Color, gradient, or image |
| `paddingY` | `number` | `96` | Vertical padding inside the section |
| `maxWidth` | `number` | `1100` | Inner content max width (px). Set to `0` for full-bleed |
| `contentPaddingX` | `number` | `24` | Horizontal padding inside the constrained container |
| `minHeight` | `number` | `0` | Min height (use for hero sections) |
| `display` | `DisplayValue` | `"block"` | CSS display |
| `position` | `PositionValue` | `"static"` | CSS position |
| `overflow` | `OverflowValue` | `"visible"` | CSS overflow |
| `opacity` | `number` | `1` | 0..1 |
| `border` | `BorderValue` | — | See [design-system.md](../design-system.md#border) |
| `borderRadius` | `number` | `0` | Quick radius slider (separate from `border.radius` for legacy support) |
| `shadow` | `ShadowValue` | — | |
| `transform` | `TransformValue` | — | |
| `hover` | `HoverValue` | — | |
| `transition` | `TransitionValue` | — | |
| `boxModel` | `BoxModelValue` | — | Outer margin/padding |
| `customId` | `string` | `""` | HTML id for anchor links |

### Usage tip

Use `maxWidth: 0` for full-bleed hero/banner sections. Use `minHeight` for hero bands (e.g. `500–800px`).

---

## Container

`components/craft/Container.tsx`

Generic drop target `<div>`. Renders `{children}`. Use to group things that don't need their own visual styling but should sit together (or constrain their inner width).

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `background` | `BackgroundValue` | `"transparent"` | |
| `padding` | `number` | `24` | (legacy — also exposed via `boxModel.padding`) |
| `maxWidth` | `number` | `0` | 0 = full width. Otherwise constrained + auto-centered. |
| `centerWhenConstrained` | `boolean` | `true` | Toggle auto-centering when `maxWidth > 0` |
| `minHeight` | `number` | `0` | |
| `display` / `position` / `overflow` / `opacity` | shared | "block"/"static"/"visible"/1 | |
| `border`, `shadow`, `transform`, `hover`, `transition`, `boxModel` | shared | — | |
| `borderRadius` | `number` | `0` | |

### Usage tip

The root canvas is a single `Container` (`SiteEditor.tsx`). New sites start as a full-width transparent canvas — drop a `Section` inside for your first row.

---

## Grid

`components/craft/Grid.tsx`

CSS Grid with **fixed `columns` named canvases**. The dotted column outline is gone. Each `col-N` slot is a real Craft.js canvas that accepts any number of children (they stack via `flex flex-col`).

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `columns` | `number` | `3` | 1–12 |
| `columnWidths` | `string` | `""` | When set, overrides `columns` for `gridTemplateColumns`. E.g. `"1fr 2fr 1fr"`, `"300px 1fr"` |
| `gap` | `number` | `16` | Both row and column gap (px) |
| `minRowHeight` | `number` | `0` | Min height per row (px) |
| `zebra` | `boolean` | `false` | Alternating row backgrounds |
| `overflow` | `"visible" \| "hidden"` | `"visible"` | |
| `background` | `BackgroundValue` | — | Background of the grid container itself |
| `border` | `BorderValue` | — | |
| `boxModel` | `BoxModelValue` | — | Outer spacing |
| `customId` | `string` | `""` | |

### Layout presets

In the settings panel, "Layout preset" lets users pick:

- 1, 2, 3, 4, 5, 6 columns (sets `columns`)
- "Custom (CSS track sizes)" (reveals a `columnWidths` input + quick-pick buttons: equal, wide-center, wide-left, fixed+flex, etc.)

### Multi-child columns

To put 3 Cards in one column:

```tsx
// In the editor: drop a Grid, drag 3 Cards into col-0.
// In a saved tree:
{
  type: { resolvedName: "Grid" },
  props: { columns: 3, gap: 16, ... },
  linkedNodes: {
    "col-0": ["cardA", "cardB", "cardC"],  // ← three ids under one slot
    "col-1": [],
    "col-2": [],
  },
}
```

The column wrapper uses `flex flex-col` so the children stack with a 12px gap.

### "Show advanced" toggle

The settings panel tucks `background` and `border` behind the advanced toggle. They apply to the **outer grid container**, not to the individual columns.

---

## Spacer

`components/craft/Spacer.tsx`

Empty box that pushes content apart. Has a small built-in decoration option for visible breaks.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `direction` | `"vertical" \| "horizontal" \| "both"` | `"vertical"` | |
| `height` | `number` | `40` | Vertical size (px) |
| `width` | `number` | `0` | Horizontal size (px) |
| `minHeight` | `number` | `0` | Responsive floor |
| `decoration` | `"none" \| "line" \| "dot"` | `"none"` | Visible decoration centered in the spacer |
| `decorationColor` | `string` | `"#e5e7eb"` | |
| `background` | `string` | `"transparent"` | Useful in editor to make the spacer visible |
| `boxModel` | `BoxModelValue` | — | |
| `transform` | `TransformValue` | — | |
| `opacity` | `number` | `1` | |

### Usage tip

Prefer `direction: "vertical"` for vertical breathing room. Horizontal spacers are useful inside `display: flex` containers to push items to the edges.

---

## Divider

`components/craft/Divider.tsx`

Horizontal **or** vertical line. The horizontal variant supports a centered label ("OR" divider) — useful inside forms.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | |
| `color` | `string` | `"#e5e7eb"` | |
| `thickness` | `number` | `1` | px |
| `style` | `"solid" \| "dashed" \| "dotted" \| "double" \| "groove"` | `"solid"` | |
| `width` | `number` | `100` | % of parent (horizontal only) |
| `verticalHeight` | `number` | `80` | Height of vertical dividers |
| `label` | `string` | `""` | Centered label (horizontal only). E.g. `"OR"` |
| `boxModel`, `transform`, `hover`, `transition`, `opacity` | shared | — | |

### Usage tip

A horizontal Divider with `label: "OR"` placed between the email field and a "Sign in with Google" button gives that classic form-style separator.