/**
 * Shared style helpers for craft components.
 *
 * Every craft component renders a piece of UI, and most of them need to apply
 * the same set of styling concerns: borders, shadows, backgrounds, sizing,
 * transforms, opacity, transitions, hover states. Rather than each component
 * re-implementing these (and each one drifting slightly), they all consume the
 * helpers in this file.
 *
 * The companion shared "design tokens" (BorderField, ShadowField,
 * BackgroundField, etc.) emit these exact shapes. Components can then write:
 *
 *   style={{ ...borderToStyle(props.border), ...shadowToStyle(props.shadow) }}
 *
 * and never have to think about the CSS again.
 */

import type { CSSProperties } from "react";

/* -------------------------------------------------------------------------- */
/* Border                                                                     */
/* -------------------------------------------------------------------------- */

export type BorderSides = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export type BorderValue = {
  /** Width in px, applied to all sides unless overridden. */
  width?: number;
  /** CSS border-style. */
  style?: "solid" | "dashed" | "dotted" | "double" | "none";
  /** Border color (any valid CSS color). */
  color?: string;
  /** Per-side width override (rare). */
  sides?: BorderSides;
  /** Border radius (px). */
  radius?: number;
};

const BORDER_STYLES = ["solid", "dashed", "dotted", "double", "none"] as const;

export function borderStyleToCSS(b?: BorderValue): CSSProperties {
  if (!b) return {};
  const w = b.width ?? 0;
  const style = b.style ?? "solid";
  const color = b.color ?? "currentColor";

  if (b.sides) {
    const out: Record<string, string | number> = {};
    if (b.sides.top !== undefined)
      out.borderTop = `${b.sides.top}px ${style} ${color}`;
    if (b.sides.right !== undefined)
      out.borderRight = `${b.sides.right}px ${style} ${color}`;
    if (b.sides.bottom !== undefined)
      out.borderBottom = `${b.sides.bottom}px ${style} ${color}`;
    if (b.sides.left !== undefined)
      out.borderLeft = `${b.sides.left}px ${style} ${color}`;
    if (b.radius !== undefined) out.borderRadius = b.radius;
    return out as CSSProperties;
  }

  const border = w > 0 && style !== "none" ? `${w}px ${style} ${color}` : undefined;
  return {
    ...(border ? { border } : {}),
    ...(b.radius !== undefined ? { borderRadius: b.radius } : {}),
  };
}

/** Class names for hover transitions on borders. Used by the hover helper. */
export function borderHoverClass(b?: BorderValue): string {
  if (!b) return "";
  return "transition-[border-color,border-width] duration-200";
}

/* -------------------------------------------------------------------------- */
/* Shadow                                                                     */
/* -------------------------------------------------------------------------- */

export type ShadowValue = {
  /** Vertical offset (px). */
  offsetX?: number;
  /** Horizontal offset (px). */
  offsetY?: number;
  /** Blur radius (px). */
  blur?: number;
  /** Spread (px). */
  spread?: number;
  /** Shadow color. */
  color?: string;
  /** Quick presets. */
  preset?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
};

const SHADOW_PRESETS: Record<NonNullable<ShadowValue["preset"]>, string> = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
  md: "0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)",
  lg: "0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)",
  xl: "0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)",
  "2xl": "0 25px 50px -12px rgba(0,0,0,0.25)",
};

export function shadowToCSS(s?: ShadowValue): CSSProperties {
  if (!s) return {};
  if (s.preset) {
    if (s.preset === "none") return { boxShadow: "none" };
    return { boxShadow: SHADOW_PRESETS[s.preset] };
  }
  const x = s.offsetX ?? 0;
  const y = s.offsetY ?? 4;
  const blur = s.blur ?? 12;
  const spread = s.spread ?? 0;
  const color = s.color ?? "rgba(0,0,0,0.1)";
  return { boxShadow: `${x}px ${y}px ${blur}px ${spread}px ${color}` };
}

/* -------------------------------------------------------------------------- */
/* Background (color / gradient / image)                                      */
/* -------------------------------------------------------------------------- */

export type GradientStop = { color: string; position: number };
export type BackgroundValue =
  | string
  | {
      type?: "solid" | "gradient" | "image";
      color?: string;
      /** Linear gradient configuration. */
      gradient?: {
        angle?: number;
        stops?: GradientStop[];
      };
      image?: {
        url?: string;
        size?: "cover" | "contain" | "auto";
        position?: string;
        repeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
        attachment?: "scroll" | "fixed" | "local";
      };
      /** Optional overlay (typically used with image bg). */
      overlay?: string;
    };

/** Convert a BackgroundValue into CSS background* properties. */
export function backgroundToCSS(bg?: BackgroundValue): CSSProperties {
  if (!bg) return {};
  if (typeof bg === "string") {
    if (bg === "transparent") return {};
    return { background: bg };
  }

  const out: Record<string, string> = {};

  if (bg.type === "gradient" && bg.gradient) {
    const angle = bg.gradient.angle ?? 180;
    const stops =
      bg.gradient.stops && bg.gradient.stops.length > 0
        ? bg.gradient.stops
            .map((s) => `${s.color} ${Math.max(0, Math.min(100, s.position))}%`)
            .join(", ")
        : "#000000 0%, #ffffff 100%";
    out.background = `linear-gradient(${angle}deg, ${stops})`;
  } else if (bg.type === "image" && bg.image?.url) {
    const img = bg.image;
    out.backgroundImage = `url('${img.url}')`;
    out.backgroundSize = img.size ?? "cover";
    out.backgroundPosition = img.position ?? "center center";
    out.backgroundRepeat = img.repeat ?? "no-repeat";
    out.backgroundAttachment = img.attachment ?? "scroll";
    if (bg.color) out.backgroundColor = bg.color;
  } else if (bg.color) {
    out.background = bg.color;
  }

  if (bg.overlay) {
    // An overlay is rendered as a pseudo-element-friendly background-image
    // combination. We don't have direct ::before access in inline styles, so
    // we approximate by stacking two background images. Consumers wanting a
    // real overlay layer can extend this via their own wrapper.
    const existing = (out.backgroundImage as string) ?? "";
    out.backgroundImage = existing
      ? `${existing}, linear-gradient(${bg.overlay}, ${bg.overlay})`
      : `linear-gradient(${bg.overlay}, ${bg.overlay})`;
  }

  return out as CSSProperties;
}

/** Convenience: does the BackgroundValue represent anything other than transparent? */
export function backgroundIsSet(bg?: BackgroundValue): boolean {
  if (!bg) return false;
  if (typeof bg === "string") return bg !== "transparent" && bg.length > 0;
  if (bg.type === "image") return !!bg.image?.url;
  if (bg.type === "gradient") return !!bg.gradient;
  return !!bg.color && bg.color !== "transparent";
}

/* -------------------------------------------------------------------------- */
/* Size (width / height / min / max)                                          */
/* -------------------------------------------------------------------------- */

export type SizePreset = "auto" | "fit" | "full" | "screen";
export type SizeInput = number | SizePreset | string | undefined;

export type SizeValue = {
  width?: SizeInput;
  height?: SizeInput;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
};

export function sizeToCSS(s?: SizeValue): CSSProperties {
  if (!s) return {};
  const out: Record<string, string | number> = {};
  if (s.width !== undefined) out.width = sizeInputToCSS(s.width);
  if (s.height !== undefined) out.height = sizeInputToCSS(s.height);
  if (s.minWidth !== undefined) out.minWidth = s.minWidth;
  if (s.minHeight !== undefined) out.minHeight = s.minHeight;
  if (s.maxWidth !== undefined) out.maxWidth = s.maxWidth;
  if (s.maxHeight !== undefined) out.maxHeight = s.maxHeight;
  return out as CSSProperties;
}

function sizeInputToCSS(v: SizeInput): string | number {
  if (v === undefined) return "auto";
  if (typeof v === "number") return v;
  if (v === "auto" || v === "fit" || v === "full" || v === "screen") return "100%";
  return v;
}

/* -------------------------------------------------------------------------- */
/* Display / position / overflow / opacity                                    */
/* -------------------------------------------------------------------------- */

export type DisplayValue =
  | "block"
  | "flex"
  | "inline-flex"
  | "grid"
  | "inline-block"
  | "inline"
  | "none";

export const DISPLAY_OPTIONS: { value: DisplayValue; label: string }[] = [
  { value: "block", label: "Block" },
  { value: "flex", label: "Flex" },
  { value: "inline-flex", label: "Inline flex" },
  { value: "grid", label: "Grid" },
  { value: "inline-block", label: "Inline block" },
  { value: "inline", label: "Inline" },
  { value: "none", label: "None (hidden)" },
];

export type PositionValue =
  | "static"
  | "relative"
  | "absolute"
  | "fixed"
  | "sticky";

export const POSITION_OPTIONS: { value: PositionValue; label: string }[] = [
  { value: "static", label: "Static" },
  { value: "relative", label: "Relative" },
  { value: "absolute", label: "Absolute" },
  { value: "fixed", label: "Fixed" },
  { value: "sticky", label: "Sticky" },
];

export type OverflowValue = "visible" | "hidden" | "scroll" | "auto" | "clip";

export function overflowToCSS(o?: OverflowValue | { x?: OverflowValue; y?: OverflowValue }): CSSProperties {
  if (!o) return {};
  if (typeof o === "string") return { overflow: o };
  const out: Record<string, string> = {};
  if (o.x) out.overflowX = o.x;
  if (o.y) out.overflowY = o.y;
  return out as CSSProperties;
}

/* -------------------------------------------------------------------------- */
/* Transform                                                                  */
/* -------------------------------------------------------------------------- */

export type TransformValue = {
  rotate?: number;
  scaleX?: number;
  scaleY?: number;
  translateX?: number;
  translateY?: number;
  skewX?: number;
  skewY?: number;
};

export function transformToCSS(t?: TransformValue): CSSProperties {
  if (!t) return {};
  const parts: string[] = [];
  if (t.rotate) parts.push(`rotate(${t.rotate}deg)`);
  if (t.scaleX !== undefined && t.scaleX !== 1) parts.push(`scaleX(${t.scaleX})`);
  if (t.scaleY !== undefined && t.scaleY !== 1) parts.push(`scaleY(${t.scaleY})`);
  if (t.translateX) parts.push(`translateX(${t.translateX}px)`);
  if (t.translateY) parts.push(`translateY(${t.translateY}px)`);
  if (t.skewX) parts.push(`skewX(${t.skewX}deg)`);
  if (t.skewY) parts.push(`skewY(${t.skewY}deg)`);
  if (parts.length === 0) return {};
  return { transform: parts.join(" ") };
}

/* -------------------------------------------------------------------------- */
/* Transition                                                                 */
/* -------------------------------------------------------------------------- */

export type TransitionValue = {
  duration?: number; // ms
  easing?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
  property?: string; // CSS property or "all"
  delay?: number;
};

export function transitionToCSS(t?: TransitionValue): CSSProperties {
  if (!t) return {};
  const dur = t.duration ?? 200;
  const easing = t.easing ?? "ease";
  const prop = t.property ?? "all";
  const delay = t.delay ?? 0;
  return {
    transition: `${prop} ${dur}ms ${easing}${delay ? ` ${delay}ms` : ""}`,
  };
}

/* -------------------------------------------------------------------------- */
/* Hover                                                                      */
/* -------------------------------------------------------------------------- */

export type HoverValue = {
  background?: BackgroundValue;
  color?: string;
  borderColor?: string;
  scale?: number;
  translateY?: number;
  shadow?: ShadowValue;
  opacity?: number;
};

/** Pure CSS-in-JS for hover state. The component is responsible for wiring
 * the actual hover via inline style + onMouseEnter/Leave, OR via a CSS
 * `data-hover` attribute. This helper returns the hover styles to apply. */
export function hoverToCSS(h?: HoverValue): CSSProperties {
  if (!h) return {};
  const out: Record<string, string | number> = {};
  const bg = backgroundToCSS(h.background as BackgroundValue);
  Object.assign(out, bg);
  if (h.color) out.color = h.color;
  if (h.borderColor) out.borderColor = h.borderColor;
  if (h.scale !== undefined && h.scale !== 1) out.transform = `scale(${h.scale})`;
  if (h.translateY !== undefined && h.translateY !== 0) {
    out.transform = `${out.transform ?? ""} translateY(${h.translateY}px)`.trim();
  }
  if (h.shadow) Object.assign(out, shadowToCSS(h.shadow));
  if (h.opacity !== undefined) out.opacity = h.opacity;
  return out as CSSProperties;
}

/* -------------------------------------------------------------------------- */
/* Typography                                                                 */
/* -------------------------------------------------------------------------- */

export type TextCase = "none" | "uppercase" | "lowercase" | "capitalize";
export type TextDecoration = "none" | "underline" | "line-through" | "overline";

export function textCaseToCSS(c?: TextCase): CSSProperties {
  return c && c !== "none" ? { textTransform: c } : {};
}

export function textDecorationToCSS(d?: TextDecoration): CSSProperties {
  return d && d !== "none" ? { textDecoration: d } : {};
}

/* -------------------------------------------------------------------------- */
/* Common "selected" outline                                                  */
/* -------------------------------------------------------------------------- */

export const SELECTED_OUTLINE: CSSProperties = {
  outline: "2px dashed hsl(var(--primary))",
  outlineOffset: "2px",
};

/* -------------------------------------------------------------------------- */
/* Re-export the existing BoxModel helpers so consumers can import everything */
/* from one place.                                                            */
/* -------------------------------------------------------------------------- */

export { boxToStyle, sizeToStyle } from "@/components/craft/settings/BoxModelField";
export type { BoxModelValue, BoxSides, SizeFieldValue } from "@/components/craft/settings/BoxModelField";