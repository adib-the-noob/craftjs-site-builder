"use client";

import React, { memo, useMemo } from "react";
import { Element, useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { Text } from "./Text";
import { Heading } from "./Heading";
import { Container } from "./Container";
import { ColorField } from "@/components/craft/settings/ColorField";
import { SliderField } from "@/components/craft/settings/SliderField";
import { ToggleField } from "@/components/craft/settings/ToggleField";
import { SelectField } from "@/components/craft/settings/SelectField";
import { AlignField } from "@/components/craft/settings/AlignField";
import { SizeField, sizeToStyle } from "@/components/craft/settings/BoxModelField";
import {
  BoxModelSettings,
  resolveBoxModel,
} from "@/components/craft/settings/boxModel";
import { useCraftSelected } from "@/components/craft/settings/useCraftNode";
import { boxToStyle } from "@/components/craft/settings/BoxModelField";
import {
  sanitizeCustomId,
  THEME_TOKENS,
} from "@/lib/themeTokens";
import { CustomIdField } from "@/components/craft/settings/CustomIdField";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CardOrientation = "vertical" | "horizontal";
export type CardSemantic = "div" | "article" | "section" | "aside";
export type CardShadowSize = "none" | "sm" | "md" | "lg" | "xl" | "2xl";
export type CardAlign = "start" | "center" | "end" | "between";
export type CardInteraction =
  | "none"
  | "lift"
  | "glow"
  | "scale"
  | "border";

type CardProps = {
  /** Legacy title — used as a seed for the inner Heading. */
  title?: string;
  /** Legacy body — used as a seed for the inner Text. */
  body?: string;

  /** Background colour. */
  background?: string;
  /** Border colour (omit to inherit Tailwind `border-border`). */
  borderColor?: string;
  /** Border width in px. 0 hides the border entirely. */
  borderWidth?: number;
  /** Legacy padding (used when `boxModel` isn't set). */
  padding?: number;
  /** Shadow size. */
  shadow?: CardShadowSize;
  /** Corner radius in px. */
  borderRadius?: number;
  /** Width/height. Accepts numbers (px) or tokens: auto/fit/full/screen. */
  size?: { width?: number | string; height?: number | string };
  /** Inner layout. `horizontal` flips media to the side on `md+`. */
  orientation?: CardOrientation;
  /** Vertical alignment of body content inside the card. */
  align?: CardAlign;
  /** Interactive styling preset. */
  interaction?: CardInteraction;
  /** Render as a semantic element. */
  as?: CardSemantic;
  /** Optional aria-label; defaults to the card title. */
  ariaLabel?: string;
  /** HTML id for anchor links. */
  customId?: string;
  /** Tailwind-style box model — overrides `padding`/`margin*` props. */
  boxModel?: import("@/components/craft/settings/BoxModelField").BoxModelValue;
  /** Extra Tailwind classes appended to the root. */
  classes?: string;
  /** Clickable — wraps content in an accessible button. */
  clickable?: boolean;
  children?: React.ReactNode;
};

// ---------------------------------------------------------------------------
// Default props (craft.js seed values)
// ---------------------------------------------------------------------------

const SHADOW_CLASS: Record<CardShadowSize, string> = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
};

const INTERACTION_CLASS: Record<CardInteraction, string> = {
  none: "",
  lift: "transition-transform duration-200 will-change-transform hover:-translate-y-0.5",
  glow: "transition-shadow duration-200 hover:shadow-2xl",
  scale: "transition-transform duration-200 will-change-transform hover:scale-[1.02]",
  border: "transition-colors duration-200 hover:border-primary",
};

const ALIGN_CLASS: Record<CardAlign, string> = {
  start: "items-start text-left",
  center: "items-center text-center",
  end: "items-end text-right",
  between: "items-stretch text-left",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function CardComponent(props: CardProps) {
  const {
    title = "Card title",
    body = "Card description goes here.",
    background = "#ffffff",
    borderColor = "",
    borderWidth = 1,
    padding = 24,
    shadow = "md",
    borderRadius = 12,
    size,
    orientation = "vertical",
    align = "start",
    interaction = "none",
    as = "article",
    ariaLabel = "",
    customId = "",
    boxModel,
    classes = "",
    clickable = false,
    children,
  } = props;

  // Split selector: only re-render when *this* node becomes selected.
  const selected = useCraftSelected();
  const {
    connectors: { connect, drag },
  } = useNode();

  const effectiveBox = useMemo(
    () => resolveBoxModel({ padding, boxModel }),
    [padding, boxModel]
  );

  const composedStyle: React.CSSProperties = {
    background,
    borderRadius,
    borderColor: borderColor || undefined,
    borderWidth: borderWidth > 0 ? borderWidth : undefined,
    borderStyle: borderWidth > 0 ? "solid" : undefined,
    ...sizeToStyle(size?.width, "width"),
    ...sizeToStyle(size?.height, "height"),
    // Apply padding / margin through boxToStyle for both single-value and
    // per-side cases. No <style dangerouslySetInnerHTML> hacks.
    ...boxToStyle(effectiveBox.padding, "padding"),
    ...boxToStyle(effectiveBox.margin, "margin"),
  };

  const Tag = as as React.ElementType;

  // Body: either caller-provided children or the slot layout.
  const slotBody =
    children ??
    ((
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-3",
          orientation === "horizontal" &&
            "md:flex-row md:items-stretch md:gap-4",
          ALIGN_CLASS[align]
        )}
      >
        {/* media slot — uses Container so Craft.js can drag/connect it
            without triggering React 19's `element.ref` deprecation
            (which fires when Element.is is a string like "div"). */}
        <div
          className={cn(
            "flex w-full shrink-0 flex-col gap-2 overflow-hidden rounded-md",
            orientation === "horizontal" && "md:w-1/3"
          )}
        >
          <Element id="media" canvas is={Container} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2 self-stretch">
          <Element id="header" canvas is={Heading} text={title} />
          <Element id="body" canvas is={Text} text={body} />
        </div>

        <div className="mt-auto flex w-full flex-wrap items-center gap-2">
          <Element id="footer" canvas is={Container} />
        </div>
      </div>
    ) as React.ReactNode);

  const inner = (
    <Tag
      ref={(ref: any) => {
        if (ref && typeof ref === "object") connect(drag(ref));
      }}
      id={sanitizeCustomId(customId) || undefined}
      role={
        clickable
          ? "button"
          : as === "article" || as === "section"
          ? undefined
          : "group"
      }
      tabIndex={clickable ? 0 : undefined}
      aria-label={ariaLabel || title || undefined}
      className={cn(
        "relative w-full",
        // Border defaults: Tailwind `border-border` unless we have our own.
        !borderColor && borderWidth > 0 && "border",
        !borderColor && borderWidth > 0 && "border-border",
        // Shadow.
        SHADOW_CLASS[shadow],
        // Interaction.
        INTERACTION_CLASS[interaction],
        // Selection ring (uses theme token).
        selected && "ring-2 ring-primary/40 ring-offset-2",
        classes
      )}
      style={composedStyle}
    >
      {slotBody}
    </Tag>
  );

  return inner;
}

export const Card = memo(CardComponent);

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

function CardSettings() {
  const {
    actions: { setProp },
    title,
    body,
    background,
    borderColor,
    borderWidth,
    padding,
    shadow,
    borderRadius,
    orientation,
    align,
    interaction,
    as,
    ariaLabel,
    customId,
    boxModel,
    size,
    classes,
    clickable,
  } = useNode((node) => ({
    title: node.data.props.title as string,
    body: node.data.props.body as string,
    background: node.data.props.background as string,
    borderColor: (node.data.props.borderColor as string) ?? "",
    borderWidth: (node.data.props.borderWidth as number) ?? 1,
    padding: node.data.props.padding as number,
    shadow: (node.data.props.shadow as CardShadowSize) ?? "md",
    borderRadius: (node.data.props.borderRadius as number) ?? 12,
    orientation: (node.data.props.orientation as CardOrientation) ?? "vertical",
    align: (node.data.props.align as CardAlign) ?? "start",
    interaction: (node.data.props.interaction as CardInteraction) ?? "none",
    as: (node.data.props.as as CardSemantic) ?? "article",
    ariaLabel: (node.data.props.ariaLabel as string) ?? "",
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as CardProps["boxModel"],
    size: (node.data.props.size as CardProps["size"]) ?? undefined,
    classes: (node.data.props.classes as string) ?? "",
    clickable: (node.data.props.clickable as boolean) ?? false,
  })) as any;

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <CustomIdField
          value={customId}
          onChange={(v) =>
            setProp((props: CardProps) => {
              props.customId = v;
            })
          }
          placeholder="card-1"
          label=""
        />
      </FieldRow>

      <FieldRow label="Title">
        <Input
          value={title}
          onChange={(e) =>
            setProp((props: CardProps) => {
              props.title = e.target.value;
            })
          }
        />
      </FieldRow>
      <FieldRow label="Body">
        <Input
          value={body}
          onChange={(e) =>
            setProp((props: CardProps) => {
              props.body = e.target.value;
            })
          }
        />
      </FieldRow>

      <div className="grid grid-cols-2 gap-3">
        <ColorField
          label="Background"
          value={background}
          onChange={(v) =>
            setProp((props: CardProps) => {
              props.background = v;
            })
          }
        />
        <ColorField
          label="Border colour"
          value={borderColor || "#e5e7eb"}
          onChange={(v) =>
            setProp((props: CardProps) => {
              props.borderColor = v;
            })
          }
        />
      </div>

      <BoxModelSettings<CardProps> />

      <SizeField
        label="Card size"
        value={size ?? { width: undefined, height: undefined }}
        onChange={(v) =>
          setProp((props: CardProps) => {
            props.size = v;
          })
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <SliderField
          label="Border width"
          value={borderWidth}
          min={0}
          max={8}
          onChange={(v) =>
            setProp((props: CardProps) => {
              props.borderWidth = v;
            })
          }
        />
        <SliderField
          label="Border radius"
          value={borderRadius}
          min={0}
          max={48}
          onChange={(v) =>
            setProp((props: CardProps) => {
              props.borderRadius = v;
            })
          }
        />
      </div>

      <SelectField
        label="Shadow"
        value={shadow}
        onChange={(v) =>
          setProp((props: CardProps) => {
            props.shadow = v as CardShadowSize;
          })
        }
        options={[
          { value: "none", label: "None" },
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
          { value: "xl", label: "XL" },
          { value: "2xl", label: "2XL" },
        ]}
      />

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Orientation"
          value={orientation}
          onChange={(v) =>
            setProp((props: CardProps) => {
              props.orientation = v as CardOrientation;
            })
          }
          options={[
            { value: "vertical", label: "Vertical" },
            { value: "horizontal", label: "Horizontal (md+)" },
          ]}
        />
        <SelectField
          label="Hover effect"
          value={interaction}
          onChange={(v) =>
            setProp((props: CardProps) => {
              props.interaction = v as CardInteraction;
            })
          }
          options={[
            { value: "none", label: "None" },
            { value: "lift", label: "Lift" },
            { value: "glow", label: "Glow" },
            { value: "scale", label: "Scale" },
            { value: "border", label: "Border accent" },
          ]}
        />
      </div>

      <AlignField
        label="Content alignment"
        value={align === "between" ? "left" : align === "start" ? "left" : align === "end" ? "right" : align}
        onChange={(v) =>
          setProp((props: CardProps) => {
            const mapped =
              v === "left" ? "start" : v === "right" ? "end" : "center";
            props.align = mapped;
          })
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Render as"
          value={as}
          onChange={(v) =>
            setProp((props: CardProps) => {
              props.as = v as CardSemantic;
            })
          }
          options={[
            { value: "article", label: "Article" },
            { value: "section", label: "Section" },
            { value: "aside", label: "Aside" },
            { value: "div", label: "Generic div" },
          ]}
        />
        <FieldRow label="Aria label">
          <Input
            value={ariaLabel}
            onChange={(e) =>
              setProp((props: CardProps) => {
                props.ariaLabel = e.target.value;
              })
            }
            placeholder={title || "Card"}
          />
        </FieldRow>
      </div>

      <ToggleField
        label="Clickable (button role)"
        value={!!clickable}
        onChange={(v) =>
          setProp((props: CardProps) => {
            props.clickable = v;
          })
        }
      />

      <FieldRow label="Extra Tailwind classes">
        <Input
          value={classes}
          onChange={(e) =>
            setProp((props: CardProps) => {
              props.classes = e.target.value;
            })
          }
          placeholder="e.g. backdrop-blur-md bg-white/70"
        />
      </FieldRow>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Craft metadata
// ---------------------------------------------------------------------------

(Card as any).craft = {
  displayName: "Card",
  props: {
    title: "Card title",
    body: "Card description goes here.",
    background: "#ffffff",
    borderColor: "",
    borderWidth: 1,
    padding: 24,
    shadow: "md",
    borderRadius: 12,
    size: undefined,
    orientation: "vertical" as CardOrientation,
    align: "start" as CardAlign,
    interaction: "none" as CardInteraction,
    as: "article" as CardSemantic,
    ariaLabel: "",
    customId: "",
    boxModel: undefined,
    classes: "",
    clickable: false,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
  related: {
    settings: CardSettings,
  },
};
