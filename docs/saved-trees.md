# Saved trees

Every editor state — a freshly-spun-up blank site, a half-finished page, a fully designed landing page — is a single JSON blob called a **saved tree**. This file explains the shape of that tree and how to author one by hand (for example, when adding a starter template to `data/templates.json`).

## What is a saved tree?

It's the output of `query.serialize()` (Craft.js's built-in serializer). The toolbar's `Save` button mirrors this onto `window.__craftEditorTree` every 1.5 s. When you reload the editor or visit `/preview/<slug>`, the same string is round-tripped through `actions.deserialize()` to rehydrate the page.

A saved tree is a **flat dictionary** keyed by node id:

```jsonc
{
  "ROOT":        { /* Container node — the top-level canvas */ },
  "a1Hero":      { /* Section node */ },
  "a1HeroHead":  { /* Heading node — child of a1Hero */ },
  "a1HeroBody":  { /* Text node */ },
  "a1CtaButton": { /* CtaButton node */ },
  "a2Features":  { /* another section */ },
  /* … */
}
```

Every key is a unique node id; every value is a node record. There is no nested structure — parent/child relationships are expressed by **referencing** ids via `parent` and `nodes`/`linkedNodes`.

## Node shape

Every node (including `ROOT`) has this shape:

```ts
{
  type: { resolvedName: string };  // keys into lib/resolver.ts
  props: Record<string, unknown>;  // the component's current props
  nodes: string[];                 // ids of children that live in the default {children} slot
  linkedNodes: Record<string, string | string[]>; // ids of children in NAMED slots
  parent?: string;                 // id of this node's parent ("ROOT" or undefined for the root)
  isCanvas: boolean;               // true if this node renders {children} / named canvases
  displayName: string;             // human-readable label shown in the layers panel
  hidden: boolean;                 // if true, the node is not rendered
  custom: Record<string, unknown>; // free-form metadata (rarely used)
}
```

### `type.resolvedName`

Maps to a key in `lib/resolver.ts` (which exports `{ Container, CtaButton, Heading, … }`). If you reference a name that isn't registered, `deserialize()` throws — see [`docs/architecture.md`](architecture.md) for the safe-deserialize behaviour in `SiteEditor.tsx`.

### `props`

Whatever the component declares in its `.craft.props` defaults block. Every component is fully driven by its props — there's no hidden state.

### `nodes`

A flat array of child ids that the component will render via Craft.js's implicit `{children}` slot. For example, a `Section` with one `Heading` and one `CtaButton` looks like:

```jsonc
"a1Hero": {
  "type": { "resolvedName": "Section" },
  "nodes": ["a1HeroHead", "a1CtaButton"],
  "parent": "ROOT",
  "isCanvas": true,
  /* … */
}
```

The order in the array is the render order. Reorder the array → reorder the children.

### `linkedNodes`

For components that have **named** child slots (Grid's `col-N`, anything that's a DropTarget with an explicit id), children are referenced by slot name here, **not** in `nodes`:

```jsonc
"f2Grid": {
  "type": { "resolvedName": "Grid" },
  "nodes": [],
  "linkedNodes": {
    "col-0": "f2Service1",     // single child
    "col-1": "f2Service2",
    "col-2": "f2Service3"
  }
}
```

The value can be a **single string** (one child) or an **array of strings** (multiple children — they stack vertically inside that slot). For example, to put three Cards in one Grid column:

```jsonc
"myGrid": {
  "type": { "resolvedName": "Grid" },
  "props": { "columns": 3, "gap": 16 },
  "linkedNodes": {
    "col-0": ["cardA", "cardB", "cardC"],   // ← three stacked children
    "col-1": [],
    "col-2": []
  }
},
"cardA": { "type": { "resolvedName": "Card" }, "parent": "myGrid", /* … */ },
"cardB": { "type": { "resolvedName": "Card" }, "parent": "myGrid", /* … */ },
"cardC": { "type": { "resolvedName": "Card" }, "parent": "myGrid", /* … */ }
```

Each child must still set `"parent": "myGrid"` so Craft.js can validate the tree on load.

> **Note:** Some template files use the single-string form (`"col-0": "f2Service1"`) and some use the array form. Both are valid; Craft.js normalizes them on load. Prefer the **array form** when authoring new templates — it's the canonical shape produced by `query.serialize()`.

### `parent`

The id of this node's parent. The root Container node has no `parent` key (or `parent: "ROOT"` — both work). Every other node must set its parent id.

### `isCanvas`

`true` for components that have child slots (Section, Container, Card, Grid, Navbar's wrapper, anything that renders `{children}` or named `<Element canvas />`s). `false` for leaves (Heading, Text, ImageBlock, CtaButton, etc.). Setting it wrong is usually harmless but can confuse the layers panel.

## A worked example — the `f2Grid` from `data/templates.json`

The following is a complete, real excerpt from `data/templates.json` showing a Grid → Card → IconBox layout:

```jsonc
"f2Grid": {
  "type": { "resolvedName": "Grid" },
  "nodes": [],
  "props": {
    "columns": 3,
    "gap": 24,
    "background": "transparent",
    "padding": 0,
    "borderRadius": 0,
    "customId": ""
  },
  "custom": {},
  "hidden": false,
  "parent": "f2ServicesSection",
  "isCanvas": true,
  "displayName": "Grid",
  "linkedNodes": {
    "col-0": "f2Service1",
    "col-1": "f2Service2",
    "col-2": "f2Service3"
  }
},
"f2Service1": {
  "type": { "resolvedName": "Card" },
  "nodes": ["f2Service1Box"],
  "props": {
    "title": "UI/UX Design",
    "body": "From wireframes to polished Figma prototypes…",
    "background": "#ffffff",
    "padding": 28,
    "shadow": false,
    "borderRadius": 16
  },
  "custom": {},
  "hidden": false,
  "parent": "f2Grid",
  "isCanvas": true,
  "displayName": "Card",
  "linkedNodes": {}
},
"f2Service1Box": {
  "type": { "resolvedName": "IconBox" },
  "nodes": [],
  "props": {
    "icon": "Sparkles",
    "title": "UI/UX Design",
    "description": "From wireframes to polished Figma prototypes…",
    "iconColor": "#FF6B2B",
    "titleColor": "#0f172a",
    "bodyColor": "#52525b",
    "iconSize": 28,
    "align": "left"
  },
  "custom": {},
  "hidden": false,
  "parent": "f2Service1",
  "isCanvas": false,
  "displayName": "IconBox",
  "linkedNodes": {}
}
```

Reading the tree top-down:

- `f2Grid` declares 3 named canvas slots in `linkedNodes`. `nodes` is empty because the implicit-children slot is unused.
- `f2Service1` lives in `col-0` (its `parent` is `f2Grid`) and itself has one child (`f2Service1Box`).
- `f2Service1Box` is a leaf — `nodes: []`, `isCanvas: false`.

## ROOT — the top-level canvas

Every saved tree needs exactly one `ROOT` entry. It is a `Container` node with no `parent`:

```jsonc
"ROOT": {
  "type": { "resolvedName": "Container" },
  "nodes": ["a1Hero", "a2Features", "a3CTA", "a4Footer"],
  "props": {
    "background": "#ffffff",
    "padding": 0,
    "maxWidth": 1200,
    "customId": "",
    "metaTitle": "Welcome",
    "metaDescription": "A simple landing page built with Craft.js.",
    "customCss": ""
  },
  "isCanvas": true,
  "linkedNodes": {}
}
```

`metaTitle`, `metaDescription`, and `customCss` are site-level metadata that the Container holds for convenience (they're not part of its visible render).

## Authoring new templates

To add a new entry to `data/templates.json`:

1. **Pick a key** for the top-level entry (e.g. `"product"`). It maps to the template id.
2. **Construct `ROOT`** as a Container. Set `nodes` to the list of top-level child ids.
3. **Build children top-down.** For every node:
   - Pick a unique id (prefix with a category letter for readability: `h1…` for header, `f1…` for first feature, etc.).
   - Set `type.resolvedName` to a key from `lib/resolver.ts`.
   - Set `props` to the initial values (only the ones you care about — defaults from the component's `.craft.props` block will fill in the rest).
   - Set `parent` to the parent node's id, or omit for ROOT.
   - Set `isCanvas: true` if the component has children, `false` if not.
   - Set `nodes` (for implicit-children containers) and/or `linkedNodes` (for named slots).
4. **Wrap it in the template envelope:**

   ```jsonc
   "product": {
     "id": "product",
     "name": "Product launch",
     "description": "Hero, features, pricing, and footer.",
     "data": {
       "ROOT": { /* … */ },
       "h1Section": { /* … */ },
       /* … */
     }
   }
   ```

   `id` matches the outer key. `name` and `description` are what the user sees in the template picker.

5. **Round-trip-test:** copy the `data` object into a site's saved tree (via the editor's import / paste flow) and confirm the page renders identically. The toolbar's `Save` action stores the result of `query.serialize()` directly, so any tree you produce should match the editor's output.

## Programmatic composition

You can also build trees inside the live editor via `useEditor`:

```tsx
const { actions, query } = useEditor();

const cardA = query.createNode(
  React.createElement(Card, { title: "A", body: "First" })
);
const cardB = query.createNode(
  React.createElement(Card, { title: "B", body: "Second" })
);
const cardC = query.createNode(
  React.createElement(Card, { title: "C", body: "Third" })
);

const grid = query.createNode(
  React.createElement(Grid, { columns: 3, gap: 16 }),
  // second arg = linkedNodes map for named slots
  { "col-0": [cardA, cardB, cardC], "col-1": [], "col-2": [] }
);

actions.add(grid, "ROOT");
```

This is the same pattern the `duplicate` keyboard shortcut uses internally (see `SiteEditor.tsx` Cmd/Ctrl+D handler).

## Common pitfalls

- **Forgetting `parent`.** Craft.js will warn but still load the node at the top level. Always set it.
- **Mismatched `parent` ↔ `nodes`.** If `parent: "a1Hero"` is set, the id must appear in either `a1Hero.nodes` or `a1Hero.linkedNodes[<some-slot>]`. Otherwise the node is orphaned.
- **Single-string vs array `linkedNodes`.** Both work but serialize differently. The single-string form is what older code tends to produce by accident; the array form is the canonical shape. When authoring templates, prefer the array form.
- **Stale `resolvedName`.** If you remove a component from `lib/resolver.ts` but a saved tree still references it, `deserialize()` will throw. `SiteEditor.tsx`'s try/catch keeps the default canvas alive so the editor stays usable, but the orphaned node will be lost on next save.
- **Root props other than `Container`.** `ROOT` should always be a `Container` — that's what `<Editor resolver={…}>` wraps. If you change it, you'd need to change `SiteEditor.tsx` too.