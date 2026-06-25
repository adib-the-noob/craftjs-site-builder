# Adding new components

This is the recipe for adding a new craft component to the site builder. Follow it end-to-end and your new component will be draggable from the toolbox, editable in the settings panel, serializable to saved trees, and stylable through the unified design system.

The recipe is structured as a sequence of six small steps. The "verify" check at each step tells you when to move on.

## Step 1 — Create the component file

Create `components/craft/MyThing.tsx`. Start from the template below. It includes the four things every craft component needs:

1. A props `type` with sensible defaults as default parameter values.
2. The exported component function, reading selection state from `useNode`.
3. A `MyThingSettings` function that renders the settings panel.
4. A `MyThing.craft = { displayName, props, related: { settings }, rules? }` registration block.

```tsx
"use client";

import { useNode } from "@craftjs/core";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import {
  BoxModelField,
  HoverField,
  ShadowField,
  TransformField,
  TransitionField,
  boxToStyle,
} from "@/components/craft/settings";
import { Input } from "@/components/ui/input";
import {
  borderStyleToCSS,
  hoverToCSS,
  shadowToCSS,
  transformToCSS,
  transitionToCSS,
  type BorderValue,
  type HoverValue,
  type ShadowValue,
  type TransformValue,
  type TransitionValue,
} from "@/lib/craft-styles";

type MyThingProps = {
  text?: string;
  customId?: string;
  boxModel?: { margin?: any; padding?: any };
  border?: BorderValue;
  shadow?: ShadowValue;
  transform?: TransformValue;
  hover?: HoverValue;
  transition?: TransitionValue;
  opacity?: number;
};

export function MyThing({
  text = "Hello",
  customId = "",
  boxModel,
  border,
  shadow,
  transform,
  hover,
  transition,
  opacity = 1,
}: MyThingProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const [hovered, setHovered] = useState(false);

  const style: React.CSSProperties = {
    opacity,
    ...borderStyleToCSS(border),
    ...shadowToCSS(shadow),
    ...transformToCSS(transform),
    ...transitionToCSS(transition),
    ...(hovered ? hoverToCSS(hover) : {}),
    ...boxToStyle(boxModel?.padding, "padding"),
    ...boxToStyle(boxModel?.margin, "margin"),
  };

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      id={customId || undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(selected && "outline outline-2 outline-primary/40 outline-offset-2")}
      style={style}
    >
      {text}
    </div>
  );
}

function MyThingSettings() {
  const {
    actions: { setProp },
    text, customId, boxModel, border, shadow,
    transform, hover, transition, opacity,
  } = useNode((node) => ({
    text: (node.data.props.text as string) ?? "",
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as MyThingProps["boxModel"],
    border: node.data.props.border as MyThingProps["border"],
    shadow: node.data.props.shadow as MyThingProps["shadow"],
    transform: node.data.props.transform as MyThingProps["transform"],
    hover: node.data.props.hover as MyThingProps["hover"],
    transition: node.data.props.transition as MyThingProps["transition"],
    opacity: (node.data.props.opacity as number) ?? 1,
  })) as any;

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: MyThingProps) => { props.customId = e.target.value; })
          }
        />
      </FieldRow>
      <FieldRow label="Text">
        <Input
          value={text}
          onChange={(e) =>
            setProp((props: MyThingProps) => { props.text = e.target.value; })
          }
        />
      </FieldRow>
      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: MyThingProps) => { props.boxModel = v; })
        }
      />
      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="rounded-md border border-dashed py-1 text-[10px] text-muted-foreground hover:border-foreground hover:text-foreground"
      >
        {showAdvanced ? "▾ Hide advanced" : "▸ Show advanced (border, shadow, hover)"}
      </button>
      {showAdvanced && (
        <>
          <ShadowField label="Shadow" value={shadow} onChange={(v) =>
            setProp((props: MyThingProps) => { props.shadow = v; })
          } />
          <HoverField value={hover} onChange={(v) =>
            setProp((props: MyThingProps) => { props.hover = v; })
          } />
          <TransitionField value={transition} onChange={(v) =>
            setProp((props: MyThingProps) => { props.transition = v; })
          } />
          <TransformField value={transform} onChange={(v) =>
            setProp((props: MyThingProps) => { props.transform = v; })
          } />
        </>
      )}
    </div>
  );
}

MyThing.craft = {
  displayName: "My Thing",
  props: {
    text: "Hello",
    customId: "",
    boxModel: undefined,
    border: undefined,
    shadow: undefined,
    transform: undefined,
    hover: undefined,
    transition: undefined,
    opacity: 1,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
    canMoveOut: () => true,
  },
  related: {
    settings: MyThingSettings,
  },
};
```

> **Note:** `rules` is optional. Use it to forbid certain actions:
>
> - `canMoveIn: () => false` — the node will reject drops (e.g. `Navbar` uses this because its links are configured via props, not by dragging).
> - `canMoveOut: () => false` — the node can't be dragged out of its parent.
> - `canDrag: () => false` — the node is undraggable entirely.

**Verify:** the file compiles (`npx tsc --noEmit`).

## Step 2 — Export from the barrel

Add a line to `components/craft/index.ts`:

```ts
export { MyThing } from "./MyThing";
```

**Verify:** `npx tsc --noEmit` still passes.

## Step 3 — Register in the resolver

The resolver is what `actions.deserialize()` looks up by `resolvedName`. Without an entry here, your component will deserialize to a `null` and disappear from saved trees.

Add your component to `lib/resolver.ts`:

```ts
import {
  /* …existing imports… */
  MyThing,
} from "@/components/craft";

export const resolver = {
  /* …existing entries… */
  MyThing,
};
```

**Verify:** `npx tsc --noEmit` still passes. The resolver is also what's used by `cmd/ctrl + D` (duplicate) and `cmd/ctrl + V` (paste) in the editor — if your component is missing here, those shortcuts won't work for it.

## Step 4 — Add to the toolbox

`components/editor/Toolbox.tsx` is the left sidebar. Find the section that matches your category (Layout, Content, Media, Interactive, etc.) and add a new entry. The pattern is:

```tsx
import { /* …existing… */, MyThing } from "@/components/craft";

// inside the layout section
{
  name: "My Thing",
  icon: <SparklesIcon className="h-4 w-4" />,   // any lucide icon
  component: MyThing,
  description: "One-line description shown on hover.",
}
```

`Toolbox.tsx` uses `react-dnd` to make the row draggable — you just supply the React component.

**Verify:** Run `npm run dev`, open any site's editor, and drag your new component from the left sidebar onto the canvas.

## Step 5 — Make it stylable through the design system (optional but recommended)

See [`docs/design-system.md`](design-system.md) for the full vocabulary. The short version:

1. Add your new prop types to `lib/craft-styles.ts` (or extend an existing one).
2. Add a corresponding settings primitive in `components/craft/settings/MyField.tsx` and re-export it from the barrel.
3. Wire the field into your component's settings panel.
4. Apply the helper output to your component's `style={…}` block.

If your component exposes only the **shared** props (`boxModel`, `border`, `shadow`, `transform`, `hover`, `transition`, `opacity`, `customId`), the template in Step 1 already covers all of those — you just need to keep the imports and the `style={…}` block.

## Step 6 — Test in the editor and the preview

1. **Drop and configure.** Open the editor, drag your component in, edit some props, confirm the preview updates.
2. **Save and reload.** Click Save, reload the page, confirm the component rehydrates with the same props.
3. **Preview.** Open `/preview/<slug>` and confirm the component renders identically there.
4. **Round-trip with templates.** Add a small entry to `data/templates.json` (see [`docs/saved-trees.md`](saved-trees.md)), load it into a fresh site, confirm everything renders.

## Common gotchas

- **`"use client"`.** Every craft component is a client component (Craft.js uses hooks). Forgetting the directive will throw a build error.
- **Missing `customId` prop.** Most components accept a `customId` for anchor links. Add it unless you have a strong reason not to — it's the cheapest way to enable in-page navigation.
- **`borderStyleToCSS` returns `border-radius` only when you want it.** The `BorderValue.radius` field is applied automatically, but a separate `borderRadius` prop on your component overrides it. Be intentional about which one you expose.
- **`hover` requires `transition`.** A hover effect without a transition snaps in/out. The settings panel pairs them, but if you write a custom layout, show both together.
- **`canMoveIn` defaults to `true`.** If your component should not accept children (it has no `{children}` in its JSX), explicitly set `canMoveIn: () => false` so the editor's drop indicator doesn't accept drops that go nowhere.

## Where to look for reference

- **`lib/craft-styles.ts`** — all the helper signatures and value types.
- **`components/craft/Section.tsx`** — a content-rich container that exposes every shared prop.
- **`components/craft/Grid.tsx`** — the most complex example (named canvas slots).
- **`components/craft/Navbar.tsx`** — example of `canMoveIn: false`.
- **`components/craft/Heading.tsx`** — example of a leaf component with `contentEditable` text.
- **`data/templates.json`** — real-world saved trees you can copy/adapt.

That's it. Once the six steps are done, your component behaves like every other one in the builder — drag, drop, edit, save, reload, preview, all working.