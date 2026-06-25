# Architecture

How the runtime, the resolver, the components, and the saved-tree JSON fit together.

## TL;DR

A site is a **tree of nodes**. Each node is a `useNode()`-aware React component. The editor runtime gives us drag/drop and selection on top; we serialize the tree to JSON and persist it. The preview deserializes and renders the same tree through a read-only `<Editor>`.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Editor runtime                            │
│  <Editor resolver={resolver} onRender={RenderNode}>             │
│   ├─ <Frame> … the root canvas                                   │
│   │   └─ <Element canvas is={Container} />  ← root container    │
│   │       └─ <Element canvas is={Section}>                       │
│   │           └─ <Element canvas is={Grid} columns={3}>          │
│   │               ├─ <Element id="col-0" canvas>                │
│   │               │   └─ <Element is={Card} title="..." />      │
│   │               ├─ <Element id="col-1" canvas>                │
│   │               └─ <Element id="col-2" canvas>                │
│   └─ <Toolbox>  ← drag source                                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ query.serialize() → JSON
                            ▼
                  ┌────────────────────┐
                  │   lib/sites.ts     │
                  │   (save/load)      │
                  └────────────────────┘
                            │
                            ▼
        ┌──────────────────────────────────────┐
        │     <Editor enabled={false}>         │
        │   preview renders the same tree      │
        └──────────────────────────────────────┘
```

## Key files

| File | Role |
|---|---|
| `lib/resolver.ts` | Maps `resolvedName` strings to React components. Adding a new craft component requires an entry here. |
| `components/craft/index.ts` | Barrel export of all 16 components. |
| `components/craft/<Name>.tsx` | A craft component. Each file exports `function <Name>(props)` and `const <Name>Settings`. The component is bound to its settings via `<Name>.craft = { ..., related: { settings: <Name>Settings } }`. |
| `components/editor/SiteEditor.tsx` | `<Editor resolver onRender={RenderNode}>` + `<Frame>` + initial `<Element canvas is={Container}>` and a `<HydrateOnMount>` that deserializes the persisted tree. |
| `components/editor/RenderNode.tsx` | Wraps every node in a `<div>` that adds the dashed "selected" outline. |
| `components/editor/Toolbox.tsx` | The left-sidebar drag source. Each toolbox item is `<Element canvas is={Component} {...defaults} />`. |
| `components/preview/SitePreview.tsx` | `<Editor enabled={false}>` that renders a serialized tree read-only. |
| `data/templates.json` | Saved-tree examples — useful as canonical shapes when authoring templates. |
| `lib/craft-styles.ts` | Shared design-system helpers (see [design-system.md](./design-system.md)). |

## How a node becomes a drop target

There's no separate "Container vs Item" class. **Whether a node accepts children depends only on what its JSX renders**:

- Renders `{children}` → implicit drop target (e.g. Card, Container, Section, Heading contentEditable in some flows).
- Renders `<Element canvas is="..." />` → an explicit canvas (rare; only used in dynamic nested-grid patterns).
- Renders `<Element id="..." canvas is="..." />` → a **named** canvas slot — used by Grid so Craft.js can map it onto `parent.data.linkedNodes[col-N]` on save/load.

If a component renders *neither* `{children}` nor `<Element canvas>`, it's a leaf (Heading, Text, ImageBlock, CtaButton, Badge, Spacer leaf-mode, Divider leaf-mode, etc.).

## How multi-child Grid columns work

`Grid` is special: it renders exactly `columns` named canvases, one per column:

```tsx
// components/craft/Grid.tsx
const childCanvases = Array.from({ length: columns }, (_, idx) => (
  <Element
    key={`${id}-col-${idx}`}
    id={`col-${idx}`}   // ← the slot name
    canvas
    is="div"
    ...
  />
));
```

The `id` is what Craft.js looks up in `parent.data.linkedNodes` when rehydrating a saved tree. **Any `col-N` slot accepts multiple children** — they stack vertically because the wrapping `<div>` uses `flex flex-col`. To put 3 Cards in one column:

1. **In the editor:** drop a Grid, then drag a Card into `col-0`, then a second, then a third.
2. **In a saved tree:** declare a `Grid` node with `linkedNodes: { "col-0": ["cardA", "cardB", "cardC"], "col-1": [], "col-2": [] }`. `linkedNodes` values can be scalar OR arrays.

For full coverage of the saved-tree shape, see [saved-trees.md](./saved-trees.md).

## How saved trees round-trip

```
Editor tree (React)  ──query.serialize()──▶  JSON  ──save──▶  storage
                                                                       │
                                                                       ▼
                  Editor loads  ◀──deserialize──  JSON  ◀──load──  storage
```

The `useNode()` hook in every component is what lets the editor track each node by id, including its `data.linkedNodes` map. When we call `actions.history.ignore().deserialize(JSON)` in the editor, the runtime walks the JSON, finds each `resolvedName` in `lib/resolver.ts`, and renders the corresponding component.

**Two critical invariants:**

1. Every `<Element>` rendered inside a User Component (i.e. inside a craft component's JSX) **must have an `id`**. Otherwise Craft.js throws at hydration time. Grid respects this with `id={`col-${idx}`}`.
2. A child's `parent` id must match the id of the parent node in the tree. The resolver is global — components can be dropped into any canvas that renders `{children}` or `<Element canvas>`.

## The craft settings panel

Every craft component exports an `<X>Settings` React component. It's wired via:

```tsx
Card.craft = {
  displayName: "Card",
  props: { ...defaults },
  rules: { canDrag: () => true, canMoveIn: () => true },
  related: { settings: CardSettings },
};
```

`RenderNode` (in `components/editor/RenderNode.tsx`) hooks into `useEditor((state) => state.events.selected)` to know which node is selected, then renders that node's `craft.related.settings` component in the right-hand sidebar. The settings component reads/writes via `useNode((node) => node.data.props.*)` and `actions.setProp(...)`.

**Conventions every settings panel follows:**

1. **First field is `customId`** — an HTML `id` attribute for anchor links. Empty = no id.
2. **Content fields are next** — text inputs / textareas for the user-visible strings.
3. **Layout/visual fields** — sizing, alignment, color.
4. **Box model** — margin + padding via `BoxModelField`.
5. **"Show advanced" toggle** — for less-common props (shadow, transform, hover, transition, opacity, display, position, overflow). Keeps the panel tidy for casual edits but exposes power features.

## Adding new functionality

The codebase already has the canonical recipe for the most common operations:

| I want to... | Where to look |
|---|---|
| Add a new craft component | [adding-new-components.md](./adding-new-components.md) |
| Add a new settings primitive | `components/craft/settings/<NewField>.tsx` + re-export from `components/craft/settings/index.ts` |
| Add a new style concern (e.g. `filter`) | Extend `lib/craft-styles.ts` with a new `*ToCSS` helper + `*Value` type, then optionally add a `<X>Field` primitive |
| Add a new tool to the toolbox | `components/editor/Toolbox.tsx` — append to `toolboxItems` |
| Add a new template | Append an entry to `data/templates.json` (see [saved-trees.md](./saved-trees.md)) |

## What we intentionally DON'T do

- **No responsive breakpoints.** Each prop has one value at all viewport widths. (Adding `desktop/tablet/mobile` per prop is a future improvement.)
- **No CSS class system per component.** Tailwind utility classes live in the JSX; everything custom is via inline styles. This keeps saved trees JSON-only — no separate stylesheet round-tripping.
- **No theming / design tokens.** Colors are stored as raw hex / CSS strings. (Future improvement: a `tokens.json` registry that the color picker reads from.)
- **No animation library.** Hover effects are CSS transitions + transforms only. (Future improvement: motion-one or framer-motion for entrance animations.)