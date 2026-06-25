"use client";

import { useNode } from "@craftjs/core";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  BackgroundField,
  BorderField,
  BoxModelField,
  ColorField,
  HoverField,
  OpacityField,
  OverflowField,
  PositionField,
  ShadowField,
  SliderField,
  ToggleField,
  TransformField,
  TransitionField,
  boxToStyle,
} from "@/components/craft/settings";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { Text } from "./Text";
import { Heading } from "./Heading";
import {
  backgroundToCSS,
  borderStyleToCSS,
  hoverToCSS,
  overflowToCSS,
  shadowToCSS,
  transformToCSS,
  transitionToCSS,
  type BackgroundValue,
  type BorderValue,
  type HoverValue,
  type OverflowValue,
  type PositionValue,
  type ShadowValue,
  type TransformValue,
  type TransitionValue,
} from "@/lib/craft-styles";

type CardProps = {
  title?: string;
  body?: string;
  background?: BackgroundValue;
  padding?: number;
  /** Card orientation (vertical/horizontal). */
  orientation?: "vertical" | "horizontal";
  customId?: string;
  children?: React.ReactNode;
  /** Tailwind-style box model — overrides padding when set. */
  boxModel?: { margin?: any; padding?: any };
  border?: BorderValue;
  borderRadius?: number;
  shadow?: ShadowValue;
  display?: "block" | "flex" | "inline-block";
  position?: PositionValue;
  overflow?: OverflowValue;
  opacity?: number;
  transform?: TransformValue;
  hover?: HoverValue;
  transition?: TransitionValue;
  /** Click-through link. */
  href?: string;
  /** Open link in new tab. */
  newTab?: boolean;
};

export function Card({
  title = "Card title",
  body = "Card description goes here.",
  background = { type: "solid", color: "#ffffff" },
  padding = 24,
  orientation = "vertical",
  customId = "",
  children,
  boxModel,
  border,
  borderRadius = 12,
  shadow = { preset: "md" },
  display = "block",
  position = "static",
  overflow = "visible",
  opacity = 1,
  transform,
  hover,
  transition,
  href,
  newTab = false,
}: CardProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const effectiveBox = boxModel ?? {
    padding: typeof padding === "number" ? padding : undefined,
  };

  const [hovered, setHovered] = useState(false);

  const baseStyle: React.CSSProperties = {
    ...backgroundToCSS(background),
    ...borderStyleToCSS(border),
    ...boxToStyle(effectiveBox.padding, "padding"),
    ...boxToStyle(effectiveBox.margin, "margin"),
    borderRadius,
    ...shadowToCSS(shadow),
    display: display === "block" ? undefined : display,
    position: position === "static" ? undefined : position,
    ...overflowToCSS(overflow),
    opacity,
    ...transformToCSS(transform),
    ...transitionToCSS(transition),
  };

  const hoveredStyle: React.CSSProperties = hovered ? hoverToCSS(hover) : {};

  const inner = (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        orientation === "horizontal" && "flex flex-row items-start gap-6",
        selected && "outline-2 outline-dashed outline-primary outline-offset-2"
      )}
      style={{ ...baseStyle, ...hoveredStyle }}
    >
      {children ?? (
        <div className={cn(orientation === "horizontal" ? "flex-1" : "")}>
          <Heading text={title} level="h3" />
          <div style={{ height: 8 }} />
          <Text text={body} />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        style={{ display: "block", textDecoration: "none", color: "inherit" }}
      >
        {inner}
      </a>
    );
  }

  return inner;
}

function CardSettings() {
  const {
    actions: { setProp },
    title,
    body,
    background,
    padding,
    orientation,
    customId,
    boxModel,
    border,
    borderRadius,
    shadow,
    display,
    position,
    overflow,
    opacity,
    transform,
    hover,
    transition,
    href,
    newTab,
  } = useNode((node) => ({
    title: (node.data.props.title as string) ?? "Card title",
    body: (node.data.props.body as string) ?? "Card description goes here.",
    background: node.data.props.background as CardProps["background"],
    padding: (node.data.props.padding as number) ?? 24,
    orientation: (node.data.props.orientation as CardProps["orientation"]) ?? "vertical",
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as CardProps["boxModel"],
    border: node.data.props.border as CardProps["border"],
    borderRadius: (node.data.props.borderRadius as number) ?? 12,
    shadow: node.data.props.shadow as CardProps["shadow"],
    display: (node.data.props.display as CardProps["display"]) ?? "block",
    position: (node.data.props.position as PositionValue) ?? "static",
    overflow: (node.data.props.overflow as OverflowValue) ?? "visible",
    opacity: (node.data.props.opacity as number) ?? 1,
    transform: node.data.props.transform as CardProps["transform"],
    hover: node.data.props.hover as CardProps["hover"],
    transition: node.data.props.transition as CardProps["transition"],
    href: (node.data.props.href as string) ?? "",
    newTab: (node.data.props.newTab as boolean) ?? false,
  })) as any;

  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentBox = boxModel ?? { padding: padding ?? 0 };

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: CardProps) => {
              props.customId = e.target.value;
            })
          }
          placeholder="card-1"
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

      <FieldRow label="Link URL (optional)">
        <Input
          value={href}
          placeholder="https://…"
          onChange={(e) =>
            setProp((props: CardProps) => {
              props.href = e.target.value;
            })
          }
        />
      </FieldRow>

      <ToggleField
        label="Open link in new tab"
        value={newTab}
        onChange={(v) =>
          setProp((props: CardProps) => {
            props.newTab = v;
          })
        }
      />

      <FieldRow label="Orientation">
        <div className="flex gap-2">
          {(["vertical", "horizontal"] as const).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() =>
                setProp((props: CardProps) => {
                  props.orientation = o;
                })
              }
              className={cn(
                "flex-1 rounded-md border px-3 py-2 text-xs capitalize",
                orientation === o
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:border-foreground/40"
              )}
            >
              {o}
            </button>
          ))}
        </div>
      </FieldRow>

      <BackgroundField
        label="Background"
        value={background}
        onChange={(v) =>
          setProp((props: CardProps) => {
            props.background = v;
          })
        }
      />

      <BoxModelField
        label="Spacing (margin / padding)"
        value={currentBox}
        onChange={(v) =>
          setProp((props: CardProps) => {
            props.boxModel = v;
            if (v.padding && typeof v.padding === "number") {
              props.padding = v.padding;
            } else if (v.padding && typeof v.padding === "object") {
              props.padding = v.padding.top ?? 0;
            } else {
              props.padding = 0;
            }
          })
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
          <BorderField
            label="Border"
            value={border}
            onChange={(v) =>
              setProp((props: CardProps) => {
                props.border = v;
              })
            }
          />
          <SliderField
            label="Border radius"
            value={borderRadius}
            min={0}
            max={64}
            onChange={(v) =>
              setProp((props: CardProps) => {
                props.borderRadius = v;
              })
            }
          />
          <ShadowField
            label="Shadow"
            value={shadow}
            onChange={(v) =>
              setProp((props: CardProps) => {
                props.shadow = v;
              })
            }
          />
          <HoverField
            value={hover}
            onChange={(v) =>
              setProp((props: CardProps) => {
                props.hover = v;
              })
            }
          />
          <TransitionField
            value={transition}
            onChange={(v) =>
              setProp((props: CardProps) => {
                props.transition = v;
              })
            }
          />
          <TransformField
            value={transform}
            onChange={(v) =>
              setProp((props: CardProps) => {
                props.transform = v;
              })
            }
          />
          <OpacityField
            value={opacity}
            onChange={(v) =>
              setProp((props: CardProps) => {
                props.opacity = v;
              })
            }
          />
        </>
      )}
    </div>
  );
}

Card.craft = {
  displayName: "Card",
  props: {
    title: "Card title",
    body: "Card description goes here.",
    background: { type: "solid", color: "#ffffff" },
    padding: 24,
    orientation: "vertical",
    customId: "",
    boxModel: undefined,
    border: undefined,
    borderRadius: 12,
    shadow: { preset: "md" },
    display: "block",
    position: "static",
    overflow: "visible",
    opacity: 1,
    transform: undefined,
    hover: undefined,
    transition: undefined,
    href: "",
    newTab: false,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
  related: {
    settings: CardSettings,
  },
};