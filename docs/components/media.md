# Media components

Visual media — images and videos. Both expose full style surfaces, hover states, and click-through links.

## ImageBlock

`components/craft/ImageBlock.tsx`

`<img>` with fixed height/width control, object-fit, optional CSS filters, hover zoom, caption, and click-through link.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `src` | `string` | Unsplash placeholder | Direct image URL (no upload pipeline yet) |
| `alt` | `string` | `"Placeholder image"` | Required for a11y |
| `height` | `number` | `240` | px |
| `width` | `number` | `100` | % of parent (used when `widthPx === 0`) |
| `widthPx` | `number` | `0` | Fixed pixel width — when `> 0` overrides `width` |
| `rounded` | `boolean` | `true` | Quick rounded toggle |
| `borderRadius` | `number` | `12` | px (only when `rounded`) |
| `objectFit` | `"cover" \| "contain" \| "fill" \| "none" \| "scale-down"` | `"cover"` | |
| `objectPosition` | `string` | `"center"` | Any CSS object-position value (e.g. `"top"`, `"50% 30%"`) |
| `align` | `"left" \| "center" \| "right"` | `"center"` | Wraps the image in a centering container |
| `caption` | `string` | `""` | Small text below the image |
| `href` | `string` | `""` | When set, the image becomes a link |
| `newTab` | `boolean` | `false` | Open link in new tab |
| `hoverZoom` | `boolean` | `false` | Scale to 1.05 on hover |
| `filter` | `"none" \| "grayscale" \| "sepia" \| "blur" \| "brightness"` | `"none"` | CSS filter preset |
| `filterAmount` | `number` | `50` | Filter intensity 0–100 |
| `shadow`, `transform`, `hover`, `transition`, `opacity` | shared | — | |
| `border` | `BorderValue` | — | |
| `boxModel` | `BoxModelValue` | — | |
| `customId` | `string` | `""` | |

### Width modes

Two ways to control the rendered width:

- **`width`** — percentage of the parent (default `100`). Responsive by design.
- **`widthPx`** — fixed pixel width. When `> 0`, it overrides `width`. Use for thumbnails, avatars, fixed-size brand assets.

### Filter presets

| Filter | CSS output |
|---|---|
| `none` | `filter: none` |
| `grayscale` | `filter: grayscale(0..1)` — amount 0 = full color, 100 = full B&W |
| `sepia` | `filter: sepia(0..1)` |
| `blur` | `filter: blur(0..8px)` — amount scales the blur radius |
| `brightness` | `filter: brightness(0.5..2)` — amount 0 = black, 50 = unchanged, 100 = blown out |

### Hover zoom

When `hoverZoom: true`, hovering scales the image to 1.05. Combine with `transition` and `hover` for layered effects (e.g. zoom + shadow lift).

### Usage tip

ImageBlock is a leaf — it does **not** render `{children}`. To put a Badge over an image, wrap them in a Container set to `position: relative` and put the Badge with `position: absolute` on top.

---

## Video

`components/craft/Video.tsx`

Embeds YouTube, Vimeo, or a direct video file via `<iframe>` / `<video>`. Auto-detects the source type from the URL.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `url` | `string` | YouTube placeholder | YouTube / Vimeo / direct file URL |
| `height` | `number` | `420` | px (used when `aspectRatio === 0`) |
| `aspectRatio` | `number` | `0` | `0` = use `height`; otherwise `aspect-ratio` CSS. Common values: `1.777` (16:9), `1.333` (4:3), `1` (square), `0.5625` (9:16 vertical), `2.35` (cinematic) |
| `rounded` | `boolean` | `true` | |
| `borderRadius` | `number` | `12` | px |
| `autoplay` | `boolean` | `false` | Note: most browsers require `muted: true` for autoplay to work |
| `muted` | `boolean` | `true` | Default-on so autoplay can work |
| `loop` | `boolean` | `false` | YouTube loops via `playlist=VIDEO_ID` hack |
| `controls` | `boolean` | `true` | Show player controls |
| `align` | `"left" \| "center" \| "right"` | `"center"` | |
| `border`, `shadow`, `transform`, `hover`, `transition`, `opacity`, `boxModel` | shared | — | |
| `customId` | `string` | `""` | |

### URL detection

The component matches the URL against simple regexes and picks a renderer:

- **YouTube** — `youtube.com/watch?v=…`, `youtube.com/embed/…`, `youtube.com/shorts/…`, `youtu.be/…`
- **Vimeo** — `vimeo.com/<digits>`
- **File** — anything else (treated as a direct file URL and rendered with `<video>`)

The YouTube match is rewritten to `https://www.youtube.com/embed/<id>` and the `autoplay`/`mute`/`loop`/`controls=0` flags are appended as query params.

### Aspect ratio vs. fixed height

- `aspectRatio: 0` — render with `height: <height>px` and let width follow the parent.
- `aspectRatio: 1.777` — render with `aspect-ratio: 1.777` and let the height follow the width. Responsive by design.

### Autoplay caveats

- Most browsers block autoplay unless `muted: true`. The default is `muted: true` so you can flip `autoplay: true` directly.
- YouTube single-video looping requires the `playlist=<VIDEO_ID>` param — Video does this automatically when `loop: true` and the source is YouTube.

### Usage tip

For a "hero video" with text on top: wrap `Video` and a `Container` (with `position: absolute` content) in a parent `Container` set to `position: relative`.