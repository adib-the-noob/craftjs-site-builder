# Content components

Text, headings, badges, icons, and lists — the words and small marks that make up a page.

## Heading

`components/craft/Heading.tsx`

`<h1>`–`<h6>` with inline `contentEditable` editing. Full typography surface.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `text` | `string` | `"Your heading"` | Editable inline when selected |
| `level` | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"` | `"h2"` | |
| `color` | `string` | `"#0f172a"` | |
| `align` | `"left" \| "center" \| "right" \| "justify"` | `"left"` | |
| `fontWeight` | `number` | `600` | 100–900 |
| `fontSize` | `number` | (level default) | Override the level's default size |
| `lineHeight` | `number` | `1.2` | unitless multiplier |
| `letterSpacing` | `number` | `-1` | px |
| `italic` | `boolean` | `false` | |
| `textCase` | `"none" \| "uppercase" \| "lowercase" \| "capitalize"` | `"none"` | |
| `textDecoration` | `"none" \| "underline" \| "line-through" \| "overline"` | `"none"` | |
| `maxWidth` | `number` | `0` | Constrains line length for readability (0 = none) |
| `fontFamily` | `string` | `""` | CSS class from `lib/fonts.ts` |
| `shadow`, `transform`, `hover`, `transition`, `opacity` | shared | — | |
| `boxModel` | `BoxModelValue` | — | |
| `customId` | `string` | `""` | |

### Level → default style

| Level | Default classes |
|---|---|
| h1 | `text-6xl font-bold tracking-tight` |
| h2 | `text-4xl font-semibold tracking-tight` |
| h3 | `text-3xl font-semibold tracking-tight` |
| h4 | `text-2xl font-medium` |
| h5 | `text-xl font-medium` |
| h6 | `text-lg font-medium uppercase tracking-wider` |

Set `fontSize` to override the level's default text size (e.g. an `h2` with `fontSize: 28` to match a specific design).

### Content editing

When the Heading is selected in the editor, the inner text becomes `contentEditable`. Pressing **Enter** inserts a line break; clicking elsewhere saves the new text via `setProp`.

---

## Text

`components/craft/Text.tsx`

`<p>` with inline `contentEditable` editing and a full typography surface.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `text` | `string` | `"Edit this text"` | Multiline supported — uses `whitespace-pre-wrap` |
| `fontSize` | `number` | `17` | |
| `fontWeight` | `number` | `400` | 100–900 |
| `lineHeight` | `number` | `1.7` | unitless |
| `letterSpacing` | `number` | `0` | px |
| `color` | `string` | `"#374151"` | |
| `align` | `"left" \| "center" \| "right" \| "justify"` | `"left"` | |
| `italic` | `boolean` | `false` | |
| `bold` | `boolean` | `false` | Forces `fontWeight ≥ 700` |
| `underline` | `boolean` | `false` | Sets `text-decoration: underline` |
| `strikethrough` | `boolean` | `false` | Sets `text-decoration: line-through` |
| `textCase` | `"none" \| "uppercase" \| "lowercase" \| "capitalize"` | `"none"` | |
| `textDecoration` | `"none" \| "underline" \| "line-through" \| "overline"` | derived from the booleans above | Manual override |
| `maxWidth` | `number` | `0` | |
| `fontFamily` | `string` | `""` | |
| `shadow`, `transform`, `hover`, `transition`, `opacity` | shared | — | |
| `boxModel` | `BoxModelValue` | — | |
| `customId` | `string` | `""` | |

### Bold / underline booleans vs. `textDecoration`

The three boolean toggles (`bold`, `underline`, `strikethrough`) are quick access for the common case. If `textDecoration` is explicitly set, it overrides the booleans.

### Content editing

Multiline text is supported (the rendered `<p>` uses `whitespace-pre-wrap` and `contentEditable`). To create line breaks, use **Shift+Enter** in the editor.

---

## Badge

`components/craft/Badge.tsx`

Small inline pill (or rounded/square) label. Optional icon prefix and click-through link.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `text` | `string` | `"New"` | |
| `background` | `string` | `"#0f172a"` | |
| `textColor` | `string` | `"#ffffff"` | |
| `size` | `"sm" \| "md" \| "lg" \| "custom"` | `"md"` | |
| `customFontSize`, `customPaddingX`, `customPaddingY` | `number` | `12`, `12`, `4` | Only used when `size === "custom"` |
| `shape` | `"pill" \| "rounded" \| "square"` | `"pill"` | |
| `icon` | `string` | `""` | Single emoji or character before the text |
| `href` | `string` | `""` | When set, the badge becomes a link |
| `newTab` | `boolean` | `false` | |
| `border`, `shadow`, `transform`, `hover`, `transition`, `opacity`, `boxModel` | shared | — | |
| `customId` | `string` | `""` | |

### Usage tip

Use `icon: "🔥"` for "NEW", `icon: "⚡"` for "FAST", etc.

---

## IconBox

`components/craft/IconBox.tsx`

Lucide icon + title + description. Supports 80+ icons, vertical/horizontal layout, an icon background, and a click-through link.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `icon` | `string` | `"Sparkles"` | One of the 80+ whitelisted lucide names (see source) |
| `title` | `string` | `"Feature title"` | |
| `description` | `string` | `"Describe this feature in a short sentence."` | |
| `iconColor` | `string` | `"#0f172a"` | |
| `iconBackground` | `BackgroundValue` | — | Tinted circle behind the icon |
| `iconSize` | `number` | `36` | px |
| `iconStrokeWidth` | `number` | `1.5` | 0.5–4 |
| `titleColor` | `string` | `"#0f172a"` | |
| `bodyColor` | `string` | `"#475569"` | |
| `layout` | `"vertical" \| "horizontal"` | `"vertical"` | |
| `align` | `"left" \| "center" \| "right"` | `"center"` | |
| `href` | `string` | `""` | |
| `newTab` | `boolean` | `false` | |
| `background`, `border`, `shadow`, `transform`, `hover`, `transition`, `opacity`, `boxModel` | shared | — | |
| `customId` | `string` | `""` | |

### Available icons

`Sparkles`, `Star`, `Heart`, `Zap`, `Shield`, `Rocket`, `Globe`, `Lightbulb`, `Users`, `Mail`, `Phone`, `Code`, `Briefcase`, `Camera`, `Music`, `Image`, `Lock`, `Cloud`, `Trophy`, `Target`, `Settings`, `BarChart`, `PieChart`, `TrendingUp`, `Check`, `CheckCircle`, `Bookmark`, `Calendar`, `Clock`, `Compass`, `Cpu`, `Database`, `Download`, `Eye`, `FileText`, `Flag`, `Folder`, `Gift`, `Home`, `Inbox`, `Link`, `Map`, `MapPin`, `MessageCircle`, `MessageSquare`, `Monitor`, `Package`, `Palette`, `PenTool`, `Play`, `Plus`, `Printer`, `RefreshCw`, `Save`, `Search`, `Send`, `Server`, `Share`, `ShoppingBag`, `ShoppingCart`, `Smartphone`, `Smile`, `Speaker`, `Sun`, `Tablet`, `Tag`, `ThumbsUp`, `Tool`, `Trash`, `Truck`, `Tv`, `Umbrella`, `Upload`, `User`, `Video`, `Volume2`, `Wifi`, `Wind`, `X`, `Youtube`, `Zap`, `ZoomIn`.

If you need a name not on this list, add it to the `ICON_OPTIONS` array in `components/craft/IconBox.tsx` (it's whitelisted for safety so the picker doesn't accept arbitrary `LucideIcons` keys).

### Layout modes

- **Vertical** (default): icon on top, title + description stacked below.
- **Horizontal**: icon left, title + description right. Great for "feature row" patterns in a 2- or 3-column grid.

---

## List

`components/craft/List.tsx`

`<ul>` or `<ol>` from newline-separated items. Per-item background/border/padding, multiple columns, and modern bullet styles (including check and arrow).

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `string` | `"First item\nSecond item\nThird item"` | One item per line |
| `ordered` | `boolean` | `false` | `<ol>` vs `<ul>` |
| `bulletStyle` | `"disc" \| "circle" \| "square" \| "none" \| "check" \| "arrow"` | `"disc"` | Unordered only |
| `start` | `number` | `1` | Ordered only — start-at number |
| `columns` | `number` | `1` | 1–4. Uses CSS grid for multi-column. |
| `fontSize` | `number` | `16` | |
| `fontWeight` | `number` | `400` | |
| `color` | `string` | `"#374151"` | |
| `spacing` | `number` | `8` | Vertical gap between items |
| `align` | `"left" \| "center" \| "right"` | `"left"` | |
| `itemBorder` | `BorderValue` | — | Per-item border (creates card-like items) |
| `itemBackground` | `BackgroundValue` | — | Per-item background |
| `itemPadding` | `number` | `0` | Per-item padding (px) |
| `itemRadius` | `number` | `0` | Per-item border radius |
| `background`, `border`, `shadow`, `transform`, `hover`, `transition`, `opacity`, `boxModel` | shared | — | |
| `customId` | `string` | `""` | |

### Bullet styles

The `check` and `arrow` variants replace the default list marker with a `✓` or `→` glyph (rendered in a fixed-width column to the left of the item text). These override the per-item background/border treatment.

### Multi-column

`columns: 2` lays out items in a 2-column grid (responsive — collapses to 1 column on small screens). Useful for "feature bullets" patterns.