# Interactive components

Components that primarily respond to user action: buttons, cards with links, navigation, forms.

## CtaButton

`components/craft/CtaButton.tsx`

`<a>` styled as a button with five visual variants, five sizes, optional icon prefixes/suffixes, and `download` support.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `text` | `string` | `"Get started"` | The button label |
| `href` | `string` | `"#"` | `#` or empty triggers `preventDefault` (safe in editor) |
| `variant` | `"primary" \| "outline" \| "ghost" \| "soft" \| "gradient"` | `"primary"` | See variants below |
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "custom"` | `"md"` | Pixel heights: 32 / 40 / 52 / 60 / `customHeight` |
| `customHeight` / `customPaddingX` / `customFontSize` | `number` | `44` / `20` / `15` | Only when `size === "custom"` |
| `align` | `"left" \| "center" \| "right"` | `"left"` | Wraps in a flex row of the chosen alignment |
| `fullWidth` | `boolean` | `false` | Spans the wrapper width |
| `background` | `string` | `"#0f172a"` | The "color" for primary (bg), outline (border+text), ghost (text), soft (tinted bg), or gradient (start color) |
| `textColor` | `string` | `"#ffffff"` | Text color (ignored by outline/ghost where text inherits from `background`) |
| `gradientEnd` | `string` | `"#6366f1"` | End color for the gradient variant (`linear-gradient(135deg, …)`) |
| `iconLeft` / `iconRight` | `string` | `""` | Single character / emoji placed inline |
| `newTab` | `boolean` | `false` | `target="_blank"` + `rel="noopener noreferrer"` |
| `download` | `boolean` | `false` | Adds `download` attribute to the `<a>` |
| `borderRadius` | `number` | `8` | px |
| `fontFamily` | `string` | `""` | CSS class from `lib/fonts.ts` |
| `fontWeight` | `number` | `500` | 100–900 |
| `letterSpacing` | `number` | `0` | px |
| `textCase` | `"none" \| "uppercase" \| "lowercase" \| "capitalize"` | `"none"` | |
| `shadow`, `transform`, `hover`, `transition`, `opacity` | shared | — | |
| `boxModel` | `BoxModelValue` | — | Applied to the outer wrapper |
| `customId` | `string` | `""` | |

### Variants

| Variant | Visual |
|---|---|
| `primary` | Solid background, white-ish text. The default CTA. |
| `outline` | Transparent background, `1px` border in the chosen `background` color, text in that same color. |
| `ghost` | Transparent background, no border, text in `background` color. |
| `soft` | Tinted background — `background` at ~10% alpha (`#XXXXXX1A`), text in solid `background`. |
| `gradient` | `linear-gradient(135deg, background, gradientEnd)`, white text. |

### Sizes

| Size | Height | Padding | Font size |
|---|---|---|---|
| `sm` | 32 | `0 14px` | 12 |
| `md` (default) | 40 | `0 20px` | 14 |
| `lg` | 52 | `0 28px` | 16 |
| `xl` | 60 | `0 36px` | 18 |
| `custom` | `customHeight` | `0 customPaddingX` | `customFontSize` |

### Icons

`iconLeft` and `iconRight` accept any character or emoji. Common conventions:

- `→` (right arrow)
- `↗` (external link arrow)
- `★` (favorite)
- `🛒` (cart)

### Usage tip

The wrapper renders as a `<div>` with `display: block` + `text-align: align`. The inner `<a>` is `inline-flex`. This means `align: "center"` will center the button within its parent — no need to wrap in another flex container.

---

## Card

`components/craft/Card.tsx`

Implicit canvas (renders `{children}`). With no children, falls back to a default `Heading + spacer + Text` body. Vertical or horizontal orientation. Optional click-through link.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | `"Card title"` | Used in the default body |
| `body` | `string` | `"Card description goes here."` | Used in the default body |
| `background` | `BackgroundValue` | `{ type: "solid", color: "#ffffff" }` | |
| `padding` | `number` | `24` | Legacy — also exposed via `boxModel.padding` |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Horizontal uses `flex flex-row items-start gap-6` |
| `href` | `string` | `""` | When set, the entire card becomes a link |
| `newTab` | `boolean` | `false` | |
| `display` | `"block" \| "flex" \| "inline-block"` | `"block"` | |
| `position` | `PositionValue` | `"static"` | |
| `overflow` | `OverflowValue` | `"visible"` | |
| `border`, `borderRadius`, `shadow`, `transform`, `hover`, `transition`, `opacity`, `boxModel` | shared | — | |
| `customId` | `string` | `""` | |

### Default body vs. children

When you drop **no children** into the Card, it renders:

```
<Heading text={title} level="h3" />
<div style={{ height: 8 }} />
<Text text={body} />
```

As soon as you drag anything into the Card (even one item), the default body is replaced and your children take over. This lets you start with a quick "title + description" card and then customize.

### Canvas behavior

Card is an implicit canvas — it accepts any child component via Craft.js's normal drag-and-drop. There are **no `canMoveIn` restrictions**, so you can drop Cards inside Grids, Cards inside Cards, and so on.

### Horizontal orientation

When `orientation === "horizontal"`, the inner content is wrapped in `flex flex-row items-start gap-6`. Drop an `ImageBlock` + the default body into a horizontal card for a common "media-left, content-right" layout.

### Usage tip

For a clickable card, just set `href`. The Card wraps the whole interior in an `<a>` so the entire surface is clickable. Combine with `hover` (e.g. lift via `translateY: -2`) + `transition` for the classic card-hover effect.

---

## Navbar

`components/craft/Navbar.tsx`

Full-width top navigation. Brand mark + nav links + optional search + optional CTA. Four visual variants, three layouts, optional announcement bar, mobile hamburger menu.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `brand` | `string` | `"Acme"` | Brand text on the left |
| `brandIcon` | `string` | `""` | Single emoji / letter shown in a tinted square |
| `navItems` | `string` | (4-item sample) | Newline-separated `label \| href \| icon` rows. See format below. |
| `ctaLabel` | `string` | `"Get started"` | Empty hides the CTA |
| `ctaHref` | `string` | `"#"` | |
| `ctaNewTab` | `boolean` | `false` | |
| `layout` | `"brand-left-links-right" \| "brand-left-links-center" \| "centered"` | `"brand-left-links-right"` | See layouts below |
| `variant` | `"solid" \| "transparent" \| "bordered" \| "floating"` | `"solid"` | See variants below |
| `sticky` | `boolean` | `true` | `position: sticky; top: 0` |
| `enableSearch` | `boolean` | `false` | Show a search input |
| `searchPlaceholder` | `string` | `"Search…"` | |
| `announcement` | `string` | `""` | Empty hides the announcement bar |
| `background` | `BackgroundValue` | white solid | |
| `textColor` | `string` | `"#0f172a"` | |
| `borderColor` | `string` | `"#e5e7eb"` | Used by the `bordered` variant and the mobile menu border |
| `ctaBackground` / `ctaTextColor` | `string` | `""` (auto) | If empty, derived from `textColor` / `background.color` |
| `announcementBackground` / `announcementColor` | `string` | `#0f172a` / `#ffffff` | |
| `height` | `number` | `72` | px |
| `maxWidth` | `number` | `1200` | Inner container max-width |
| `borderRadius` | `number` | `0` | Only meaningful with `floating` variant |
| `border`, `shadow`, `transform`, `hover`, `transition`, `opacity`, `boxModel` | shared | — | |
| `customId` | `string` | `""` | |

### Nav items format

`navItems` is a newline-separated string. Each line is `label | href | icon`:

```
Home | /
Docs | /docs | 📚
Pricing | /pricing
About | /about | 👋
```

The settings panel exposes both a structured editor (per-row label/href/icon with add/remove) and a raw textarea for bulk-pasting.

### Layouts

| Layout | Brand | Links | CTA |
|---|---|---|---|
| `brand-left-links-right` | Left | Right cluster | Right |
| `brand-left-links-center` | Left | Centered | Right |
| `centered` | Centered | Centered next to brand | Far right |

### Variants

| Variant | Visual |
|---|---|
| `solid` | White (or background-colored) bar with shadow + sticky + backdrop blur on supported browsers |
| `transparent` | Same, but no background — sits over the hero section |
| `bordered` | White bar with a bottom border in `borderColor` |
| `floating` | Pill-shaped bar with `borderRadius`, floats inside a `p-3` outer padding |

### Mobile menu

If `navItems` is non-empty, a hamburger toggle appears on screens `< md`. Clicking it opens a full-width dropdown with the same links, stacked vertically.

### Rules

Navbar has `canMoveIn: () => false` — you can't drop other craft components into it. The links, search, and CTA are all configured via props, not by dragging.

---

## ContactForm

`components/craft/ContactForm.tsx`

`<form>` with configurable fields, custom labels, optional consent checkbox, mailto: or https:// action, and a success state.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | `"Get in touch"` | |
| `description` | `string` | `""` | Supporting copy under the title |
| `nameLabel` / `emailLabel` / `phoneLabel` / `subjectLabel` / `messageLabel` / `consentLabel` | `string` | (defaults) | Per-field labels |
| `submitText` | `string` | `"Send message"` | Submit button label |
| `action` | `string` | `""` | `mailto:you@…` opens mail client; `https://…` opens in new tab; empty shows success state |
| `emailSubject` | `string` | `"New contact form submission"` | Subject for `mailto:` action |
| `background` | `BackgroundValue` | `{ type: "solid", color: "#f8fafc" }` | Form card background |
| `accent` / `accentText` | `string` | `#0f172a` / `#ffffff` | Submit button colors |
| `border` / `borderRadius` | `BorderValue` / `number` | — / `12` | |
| `requiredFields` | `boolean` | `true` | Adds `required` to all fields and `*` after labels |
| `layout` | `"stacked" \| "two-column"` | `"stacked"` | Two-column pairs name+email, phone+subject, message+consent on one row |
| `fields` | `ContactFormFields` | (name/email/message on) | Toggle which fields render |
| `consentColor` | `string` | `"#475569"` | |
| `shadow`, `transform`, `hover`, `transition`, `opacity`, `boxModel` | shared | — | |
| `customId` | `string` | `""` | |

### Fields object

```ts
type ContactFormFields = {
  name: boolean;
  email: boolean;
  phone: boolean;
  subject: boolean;
  message: boolean;
  consent: boolean;
};
```

Each entry can be toggled in the settings panel. Order is fixed: name → email → phone → subject → message → consent.

### Submission behavior

| `action` value | Behavior |
|---|---|
| `""` (empty) | `preventDefault`, render a success card with "Send another" button |
| `"mailto:hello@example.com"` | `preventDefault`, set `window.location.href = action + ?subject=…` |
| `"https://your-api/submit"` | `preventDefault`, open `action` in a new tab (you'd wire the actual POST in production) |

### Success state

When `action` is empty and the user submits, the form swaps to a centered success card (check mark + "Thanks!" + "Send another"). This is purely visual — no data is sent anywhere.

### Layout modes

- **`stacked`** — every field is full-width.
- **`two-column`** — name + email share a row on `sm+`, phone + subject share a row, message and consent span both columns. Falls back to single-column on mobile.