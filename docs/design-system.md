# Design system

The unified style vocabulary that every craft component speaks. The point: instead of every component reinventing its own way to handle borders, shadows, hover effects, etc., they all consume the **same helpers and the same prop names**.

## Two layers

1. **Helpers in `lib/craft-styles.ts`** — pure functions that turn a typed value into `React.CSSProperties`. No React, no UI. Use these anywhere you have a `style={...}` block.
2. **Settings primitives in `components/craft/settings/`** — the React UI components that render an editor-friendly control for each value type. Drop them into any settings panel.

## The unified prop vocabulary

Every craft component now accepts the same set of optional style props. Each is documented below with its type, helper, and settings primitive (if any).

### `boxModel` — margin + padding

```ts
type BoxModelValue = {
  margin?: Partial<BoxSides> | number;   // { top, right, bottom, left } or a single number
  padding?: Partial<BoxSides> | number;
};
```

- **Helper:** `boxToStyle(value, "margin" | "padding")` — already re-exported from `lib/craft-styles.ts`.
- **Field:** `<BoxModelField label value onChange />` — visual 4-sided diagram with numeric inputs.
- **Used by:** every component.

### `background` — solid / gradient / image

```ts
type BackgroundValue =
  | string                                  // shorthand for "type: solid, color: <value>"
  | {
      type?: "solid" | "gradient" | "image";
      color?: string;
      gradient?: { angle?: number; stops?: GradientStop[] };
      image?: {
        url?: string;
        size?: "cover" | "contain" | "auto";
        position?: string;        // any CSS background-position value
        repeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
        attachment?: "scroll" | "fixed" | "local";
      };
      overlay?: string;            // optional semi-transparent overlay (e.g. "rgba(0,0,0,0.4)")
    };
```

- **Helper:** `backgroundToCSS(value)` returns the right `background` / `background-image` / `background-size` / etc. properties.
- **Field:** `<BackgroundField label value onChange />` — type selector + per-type editor + live preview.
- **Used by:** Section, Container, Card, IconBox, List, Navbar, Grid (advanced).

### `border` — width / style / color / radius / per-side

```ts
type BorderValue = {
  width?: number;                       // px, applied to all sides unless overridden
  style?: "solid" | "dashed" | "dotted" | "double" | "none";
  color?: string;
  sides?: Partial<{ top: number; right: number; bottom: number; left: number }>;
  radius?: number;
};
```

- **Helper:** `borderStyleToCSS(value)` returns `border` (or per-side `borderTop/Right/Bottom/Left`) and optionally `borderRadius`.
- **Field:** `<BorderField label value onChange perSide? />` — full editor with a "Add border" toggle, style select, color picker, radius slider, optional per-side inputs.
- **Compact:** `<BorderFieldCompact value onChange />` — a single-row variant used in tight panels.
- **Used by:** Section, Container, Card, Grid, List, Badge, IconBox, ImageBlock, Video, Navbar, ContactForm.

### `shadow` — preset or manual

```ts
type ShadowValue = {
  preset?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  // OR manual:
  offsetX?: number;  offsetY?: number;  blur?: number;  spread?: number;
  color?: string;
};
```

- **Helper:** `shadowToCSS(value)`.
- **Field:** `<ShadowField label value onChange />` — preset dropdown OR manual sliders, with a live preview swatch.
- **Used by:** every component that has visual depth (Section, Container, Card, Heading, Text, ImageBlock, Video, List, Badge, IconBox, Navbar, CtaButton, ContactForm).

### `display` / `position` / `overflow` / `opacity`

```ts
type DisplayValue  = "block" | "flex" | "inline-flex" | "grid" | "inline-block" | "inline" | "none";
type PositionValue = "static" | "relative" | "absolute" | "fixed" | "sticky";
type OverflowValue = "visible" | "hidden" | "scroll" | "auto" | "clip";
type OpacityValue  = number;  // 0..1
```

- **Helpers:** `overflowToCSS(value)`. `display`, `position`, `opacity` are passed straight through to `style`.
- **Fields:** `<DisplayField />`, `<PositionField />`, `<OverflowField />`, `<OpacityField />`.
- **Used by:** Section, Container, Card, ImageBlock, Video, List, Badge, IconBox, Navbar, Heading, Text, Divider, Spacer, CtaButton, ContactForm.

### `transform` — rotate / scale / translate / skew

```ts
type TransformValue = {
  rotate?: number;       // degrees
  scaleX?: number;       // unitless, 1 = no scale
  scaleY?: number;
  translateX?: number;   // px
  translateY?: number;
  skewX?: number;        // degrees
  skewY?: number;
};
```

- **Helper:** `transformToCSS(value)` joins non-default parts into a single `transform` string.
- **Field:** `<TransformField value onChange />`.
- **Used by:** every component that exposes it (most layout / interactive components).

### `transition` — duration / easing / delay

```ts
type TransitionValue = {
  duration?: number;     // ms, default 200
  easing?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
  property?: string;     // CSS property or "all"
  delay?: number;        // ms
};
```

- **Helper:** `transitionToCSS(value)`.
- **Field:** `<TransitionField value onChange />`.
- **Used by:** every interactive component (auto-applied alongside hover).

### `hover` — interactive state

```ts
type HoverValue = {
  background?: BackgroundValue;
  color?: string;
  borderColor?: string;
  scale?: number;        // 1 = no scale
  translateY?: number;   // px, positive = down
  shadow?: ShadowValue;
  opacity?: number;      // 0..1
};
```

- **Helper:** `hoverToCSS(value)` returns the styles to apply while hovered.
- **Field:** `<HoverField value onChange />` — exposes background / text / border colors, lift (translateY), scale, and opacity.
- **Wired by:** the component itself, via `onMouseEnter/onMouseLeave` + local `useState`. Each component that exposes `hover` should also accept a `transition` so the change animates.

### `typography` — Heading & Text

The Heading and Text components expose a rich typography surface directly:

```ts
type TextProps = {
  text?: string;
  fontSize?: number;
  fontWeight?: number;       // 100..900
  lineHeight?: number;       // unitless, e.g. 1.7
  letterSpacing?: number;    // px
  color?: string;
  align?: "left" | "center" | "right" | "justify";
  italic?: boolean;
  bold?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  textCase?: "none" | "uppercase" | "lowercase" | "capitalize";
  textDecoration?: TextDecoration;
  maxWidth?: number;         // constrains long lines for readability
  fontFamily?: string;       // CSS class from lib/fonts.ts
  // + all the shared concerns: shadow, transform, hover, transition, opacity
};
```

- **Helpers:** `textCaseToCSS(value)`, `textDecorationToCSS(value)`.
- **Field:** `<TypographyField label value onChange />` is a bundled editor exposing every text-related control at once. Most components don't need it because they don't expose text content; Heading and Text build their settings UI directly.

### `size` — width / height / min / max

```ts
type SizeValue = {
  width?: number | "auto" | "fit" | "full" | "screen" | string;
  height?: number | "auto" | "fit" | "full" | "screen" | string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
};
```

- **Helper:** `sizeToCSS(value)`.
- **Field:** `<SizeField label value onChange />` is the bundled editor. Most components reach for individual `SliderField`s instead.

## Settings primitives — full reference

All in `components/craft/settings/`. Re-exported from `components/craft/settings/index.ts`.

| Field | What it controls | Component props it accepts |
|---|---|---|
| `FieldRow` | Generic label + children wrapper | `{ label, htmlFor?, children }` |
| `AlignField` | 3-segment left/center/right toggle | `{ label, value: "left"\|"center"\|"right", onChange }` |
| `BoxModelField` | Visual margin + padding diagram | `{ label, value, onChange, showDiagram?, min?, max?, allowNegative? }` |
| `SizeField` | Width/height/min/max with auto/fit/full/screen presets | `{ label, value, onChange }` |
| `SpacingField` | 4-side numeric grid | `{ ... }` |
| `ColorField` | Color swatch + hex input | `{ label, value, onChange }` |
| `SliderField` | Single-handle range with label | `{ label, value, min, max, step?, unit?, onChange }` |
| `SelectField` | shadcn `<Select>` wrapper | `{ label, value, options: { value, label }[], onChange }` |
| `ToggleField` | Two-state switch | `{ label, value: boolean, onChange }` |
| `FontField` | Dropdown of EDITOR_FONTS | `{ label, value, onChange }` |
| `BorderField` | Border editor with live preview | `{ label, value, onChange, perSide? }` |
| `BorderFieldCompact` | Single-row border (width/style/color/radius) | `{ value, onChange }` |
| `ShadowField` | Preset OR manual shadow with preview | `{ label, value, onChange }` |
| `BackgroundField` | Solid/gradient/image background | `{ label, value, onChange }` |
| `DisplayField` | Display mode selector | `{ value, onChange }` |
| `PositionField` | Position mode selector | `{ value, onChange }` |
| `OverflowField` | Overflow mode selector | `{ value, onChange }` |
| `OpacityField` | 0–100% slider | `{ value, onChange }` |
| `TypographyField` | Bundled typography editor | `{ label, value: TypographyValue, onChange }` |
| `HoverField` | Background / text / border / lift / scale / opacity hover | `{ value, onChange }` |
| `TransformField` | Rotate / scaleX/Y / translateX/Y | `{ value, onChange }` |
| `TransitionField` | Duration / easing / delay | `{ value, onChange }` |

## Recipe: adding a new style concern

Suppose you want to add **`filter`** (CSS `filter` property) to every component.

1. **Extend the type and helper in `lib/craft-styles.ts`:**

   ```ts
   export type FilterValue = {
     blur?: number;          // px
     grayscale?: number;     // 0..100
     brightness?: number;    // 0..200 (100 = no change)
     contrast?: number;      // 0..200
     saturate?: number;      // 0..200
   };

   export function filterToCSS(f?: FilterValue): CSSProperties {
     if (!f) return {};
     const parts: string[] = [];
     if (f.blur) parts.push(`blur(${f.blur}px)`);
     if (f.grayscale) parts.push(`grayscale(${f.grayscale}%)`);
     if (f.brightness !== undefined && f.brightness !== 100)
       parts.push(`brightness(${f.brightness}%)`);
     if (f.contrast !== undefined && f.contrast !== 100)
       parts.push(`contrast(${f.contrast}%)`);
     if (f.saturate !== undefined && f.saturate !== 100)
       parts.push(`saturate(${f.saturate}%)`);
     return parts.length === 0 ? {} : { filter: parts.join(" ") };
   }
   ```

2. **(Optional) Add a settings primitive** in `components/craft/settings/FilterField.tsx` and re-export from `index.ts`.

3. **Wire it into the components** that should expose it — typically by:
   - Adding `filter?: FilterValue` to the component's props type with a default of `undefined`.
   - Adding it to `Component.craft.props` with a default.
   - Applying `...filterToCSS(filter)` inside the `style={{...}}` block.

4. **(Optional) Add it to the settings panel** with a `<FilterField value={filter} onChange={(v) => setProp((p) => { p.filter = v; })} />`.

That's it. The "Show advanced" toggle convention lets you tuck less-common props out of the way without losing them.

## Recipe: writing a settings panel

```tsx
function MyComponentSettings() {
  const {
    actions: { setProp },
    title, background, border, shadow, hover, transition,
    // …other props you read
  } = useNode((node) => ({
    title: (node.data.props.title as string) ?? "",
    background: node.data.props.background as BackgroundValue,
    border: node.data.props.border as BorderValue,
    shadow: node.data.props.shadow as ShadowValue,
    hover: node.data.props.hover as HoverValue,
    transition: node.data.props.transition as TransitionValue,
  })) as any;

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* 1. customId */}
      <FieldRow label="HTML id (anchor target)">
        <Input value={customId} onChange={(e) =>
          setProp((p: MyProps) => { p.customId = e.target.value; })
        } />
      </FieldRow>

      {/* 2. content fields */}
      <FieldRow label="Title">
        <Input value={title} onChange={(e) =>
          setProp((p: MyProps) => { p.title = e.target.value; })
        } />
      </FieldRow>

      {/* 3. visual fields */}
      <BackgroundField label="Background" value={background} onChange={(v) =>
        setProp((p: MyProps) => { p.background = v; })
      } />

      {/* 4. box model */}
      <BoxModelField label="Spacing" value={boxModel ?? {}} onChange={(v) =>
        setProp((p: MyProps) => { p.boxModel = v; })
      } />

      {/* 5. advanced, behind a toggle */}
      <button onClick={() => setShowAdvanced((v) => !v)}>
        {showAdvanced ? "▾ Hide advanced" : "▸ Show advanced"}
      </button>
      {showAdvanced && (
        <>
          <BorderField label="Border" value={border} onChange={(v) =>
            setProp((p: MyProps) => { p.border = v; })
          } />
          <ShadowField label="Shadow" value={shadow} onChange={(v) =>
            setProp((p: MyProps) => { p.shadow = v; })
          } />
          <HoverField value={hover} onChange={(v) =>
            setProp((p: MyProps) => { p.hover = v; })
          } />
          <TransitionField value={transition} onChange={(v) =>
            setProp((p: MyProps) => { p.transition = v; })
          } />
        </>
      )}
    </div>
  );
}
```

The structure isn't mandatory but is followed by every existing component. It gives users a consistent mental model when switching between components in the sidebar.