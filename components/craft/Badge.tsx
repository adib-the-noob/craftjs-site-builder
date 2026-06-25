"use client";

import { useNode } from "@craftjs/core";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import {
  BoxModelField,
  BorderField,
  ColorField,
  HoverField,
  SelectField,
  ShadowField,
  SliderField,
  ToggleField,
  TransformField,
  TransitionField,
  OpacityField,
  boxToStyle,
} from "@/components/craft/settings";
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

type BadgeProps = {
  text?: string;
  background?: string;
  textColor?: string;
  size?: "sm" | "md" | "lg" | "custom";
  /** Custom font size (only when size === "custom"). */
  customFontSize?: number;
  /** Custom padding X (only when size === "custom"). */
  customPaddingX?: number;
  /** Custom padding Y (only when size === "custom"). */
  customPaddingY?: number;
  /** Shape. */
  shape?: "pill" | "rounded" | "square";
  /** Optional icon/emoji prefix. */
  icon?: string;
  /** Click-through link. */
  href?: string;
  newTab?: boolean;
  customId?: string;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
  border?: BorderValue;
  shadow?: ShadowValue;
  transform?: TransformValue;
  hover?: HoverValue;
  transition?: TransitionValue;
  opacity?: number;
};

export function Badge({
  text = "New",
  background = "#0f172a",
  textColor = "#ffffff",
  size = "md",
  customFontSize = 12,
  customPaddingX = 12,
  customPaddingY = 4,
  shape = "pill",
  icon = "",
  href = "",
  newTab = false,
  customId = "",
  boxModel,
  border,
  shadow,
  transform,
  hover,
  transition,
  opacity = 1,
}: BadgeProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const [hovered, setHovered] = useState(false);

  const sizing =
    size === "sm"
      ? { fontSize: 10, paddingX: 8, paddingY: 2 }
      : size === "lg"
        ? { fontSize: 14, paddingX: 16, paddingY: 6 }
        : size === "custom"
          ? {
              fontSize: customFontSize,
              paddingX: customPaddingX,
              paddingY: customPaddingY,
            }
          : { fontSize: 12, paddingX: 12, paddingY: 4 };

  const radius =
    shape === "pill"
      ? 999
      : shape === "rounded"
        ? 6
        : 0;

  const baseStyle: React.CSSProperties = {
    backgroundColor: background,
    color: textColor,
    fontSize: sizing.fontSize,
    paddingLeft: sizing.paddingX,
    paddingRight: sizing.paddingX,
    paddingTop: sizing.paddingY,
    paddingBottom: sizing.paddingY,
    borderRadius: radius,
    opacity,
    ...borderStyleToCSS(border),
    ...shadowToCSS(shadow),
    ...transformToCSS(transform),
    ...transitionToCSS(transition),
    ...boxToStyle(boxModel?.padding, "padding"),
    ...boxToStyle(boxModel?.margin, "margin"),
  };

  const hoverStyle: React.CSSProperties = hovered ? hoverToCSS(hover) : {};

  const inner = (
    <span
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium",
        selected && "ring-2 ring-primary/40 ring-offset-2"
      )}
      style={{ ...baseStyle, ...hoverStyle }}
    >
      {icon && <span aria-hidden>{icon}</span>}
      {text}
    </span>
  );

  if (href) {
    return (
      <a
        href={href}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        style={{ textDecoration: "none" }}
      >
        {inner}
      </a>
    );
  }
  return inner;
}

function BadgeSettings() {
  const {
    actions: { setProp },
    text,
    background,
    textColor,
    size,
    customFontSize,
    customPaddingX,
    customPaddingY,
    shape,
    icon,
    href,
    newTab,
    customId,
    boxModel,
    border,
    shadow,
    transform,
    hover,
    transition,
    opacity,
  } = useNode((node) => ({
    text: (node.data.props.text as string) ?? "New",
    background: (node.data.props.background as string) ?? "#0f172a",
    textColor: (node.data.props.textColor as string) ?? "#ffffff",
    size: (node.data.props.size as BadgeProps["size"]) ?? "md",
    customFontSize: (node.data.props.customFontSize as number) ?? 12,
    customPaddingX: (node.data.props.customPaddingX as number) ?? 12,
    customPaddingY: (node.data.props.customPaddingY as number) ?? 4,
    shape: (node.data.props.shape as BadgeProps["shape"]) ?? "pill",
    icon: (node.data.props.icon as string) ?? "",
    href: (node.data.props.href as string) ?? "",
    newTab: (node.data.props.newTab as boolean) ?? false,
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as BadgeProps["boxModel"],
    border: node.data.props.border as BadgeProps["border"],
    shadow: node.data.props.shadow as BadgeProps["shadow"],
    transform: node.data.props.transform as BadgeProps["transform"],
    hover: node.data.props.hover as BadgeProps["hover"],
    transition: node.data.props.transition as BadgeProps["transition"],
    opacity: (node.data.props.opacity as number) ?? 1,
  })) as any;

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: BadgeProps) => { props.customId = e.target.value; })
          }
          placeholder="badge-1"
        />
      </FieldRow>
      <FieldRow label="Text">
        <Input
          value={text}
          onChange={(e) =>
            setProp((props: BadgeProps) => { props.text = e.target.value; })
          }
        />
      </FieldRow>
      <FieldRow label="Icon (optional)">
        <Input
          value={icon}
          placeholder="🔥 emoji or character"
          onChange={(e) =>
            setProp((props: BadgeProps) => { props.icon = e.target.value; })
          }
        />
      </FieldRow>
      <FieldRow label="Link URL (optional)">
        <Input
          value={href}
          placeholder="https://…"
          onChange={(e) =>
            setProp((props: BadgeProps) => { props.href = e.target.value; })
          }
        />
      </FieldRow>
      <ToggleField
        label="Open in new tab"
        value={newTab}
        onChange={(v) =>
          setProp((props: BadgeProps) => { props.newTab = v; })
        }
      />
      <SelectField
        label="Size"
        value={size}
        onChange={(v) =>
          setProp((props: BadgeProps) => { props.size = v as BadgeProps["size"]; })
        }
        options={[
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
          { value: "custom", label: "Custom" },
        ]}
      />
      {size === "custom" && (
        <>
          <SliderField label="Font size" value={customFontSize} min={8} max={32} unit="px" onChange={(v) =>
            setProp((props: BadgeProps) => { props.customFontSize = v; })
          } />
          <SliderField label="Padding X" value={customPaddingX} min={4} max={40} unit="px" onChange={(v) =>
            setProp((props: BadgeProps) => { props.customPaddingX = v; })
          } />
          <SliderField label="Padding Y" value={customPaddingY} min={2} max={20} unit="px" onChange={(v) =>
            setProp((props: BadgeProps) => { props.customPaddingY = v; })
          } />
        </>
      )}
      <SelectField
        label="Shape"
        value={shape}
        onChange={(v) =>
          setProp((props: BadgeProps) => { props.shape = v as BadgeProps["shape"]; })
        }
        options={[
          { value: "pill", label: "Pill (fully rounded)" },
          { value: "rounded", label: "Rounded" },
          { value: "square", label: "Square" },
        ]}
      />
      <ColorField
        label="Background"
        value={background}
        onChange={(v) =>
          setProp((props: BadgeProps) => { props.background = v; })
        }
      />
      <ColorField
        label="Text color"
        value={textColor}
        onChange={(v) =>
          setProp((props: BadgeProps) => { props.textColor = v; })
        }
      />
      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: BadgeProps) => { props.boxModel = v; })
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
              setProp((props: BadgeProps) => { props.border = v; })
            }
          />
          <ShadowField
            label="Shadow"
            value={shadow}
            onChange={(v) =>
              setProp((props: BadgeProps) => { props.shadow = v; })
            }
          />
          <HoverField
            value={hover}
            onChange={(v) =>
              setProp((props: BadgeProps) => { props.hover = v; })
            }
          />
          <TransitionField
            value={transition}
            onChange={(v) =>
              setProp((props: BadgeProps) => { props.transition = v; })
            }
          />
          <TransformField
            value={transform}
            onChange={(v) =>
              setProp((props: BadgeProps) => { props.transform = v; })
            }
          />
          <OpacityField
            value={opacity}
            onChange={(v) =>
              setProp((props: BadgeProps) => { props.opacity = v; })
            }
          />
        </>
      )}
    </div>
  );
}

Badge.craft = {
  displayName: "Badge",
  props: {
    text: "New",
    background: "#0f172a",
    textColor: "#ffffff",
    size: "md",
    customFontSize: 12,
    customPaddingX: 12,
    customPaddingY: 4,
    shape: "pill",
    icon: "",
    href: "",
    newTab: false,
    customId: "",
    boxModel: undefined,
    border: undefined,
    shadow: undefined,
    transform: undefined,
    hover: undefined,
    transition: undefined,
    opacity: 1,
  },
  related: {
    settings: BadgeSettings,
  },
};