"use client";

import { useNode } from "@craftjs/core";
import { useState } from "react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlignField,
  BackgroundField,
  BoxModelField,
  BorderField,
  ColorField,
  HoverField,
  OpacityField,
  SelectField,
  ShadowField,
  SliderField,
  ToggleField,
  TransformField,
  TransitionField,
  boxToStyle,
} from "@/components/craft/settings";
import {
  backgroundToCSS,
  borderStyleToCSS,
  hoverToCSS,
  shadowToCSS,
  transformToCSS,
  transitionToCSS,
  type BackgroundValue,
  type BorderValue,
  type HoverValue,
  type ShadowValue,
  type TransformValue,
  type TransitionValue,
} from "@/lib/craft-styles";

// Whitelist of safe icon names so users don't get arbitrary keys.
const ICON_OPTIONS = [
  "Sparkles", "Star", "Heart", "Zap", "Shield", "Rocket", "Globe",
  "Lightbulb", "Users", "Mail", "Phone", "Code", "Briefcase", "Camera",
  "Music", "Image", "Lock", "Cloud", "Trophy", "Target", "Settings",
  "BarChart", "PieChart", "TrendingUp", "Check", "CheckCircle",
  "Bookmark", "Calendar", "Clock", "Compass", "Cpu", "Database",
  "Download", "Eye", "FileText", "Flag", "Folder", "Gift", "Home",
  "Inbox", "Link", "Map", "MapPin", "MessageCircle", "MessageSquare",
  "Monitor", "Package", "Palette", "PenTool", "PieChart", "Play",
  "Plus", "Printer", "RefreshCw", "Save", "Search", "Send", "Server",
  "Share", "ShoppingBag", "ShoppingCart", "Smartphone", "Smile",
  "Speaker", "Sun", "Tablet", "Tag", "ThumbsUp", "Tool", "Trash",
  "Truck", "Tv", "Umbrella", "Upload", "User", "Video", "Volume2",
  "Wifi", "Wind", "X", "Youtube", "Zap", "ZoomIn",
];

type IconBoxProps = {
  icon?: string;
  title?: string;
  description?: string;
  iconColor?: string;
  iconBackground?: BackgroundValue;
  titleColor?: string;
  bodyColor?: string;
  iconSize?: number;
  iconStrokeWidth?: number;
  align?: "left" | "center" | "right";
  /** Layout: stacked (icon on top) or horizontal (icon left, text right). */
  layout?: "vertical" | "horizontal";
  /** Optional click-through link. */
  href?: string;
  newTab?: boolean;
  customId?: string;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
  border?: BorderValue;
  borderRadius?: number;
  shadow?: ShadowValue;
  background?: BackgroundValue;
  transform?: TransformValue;
  hover?: HoverValue;
  transition?: TransitionValue;
  opacity?: number;
};

function getIcon(name: string) {
  const lib = LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>;
  return lib[name] ?? LucideIcons.Sparkles;
}

export function IconBox({
  icon = "Sparkles",
  title = "Feature title",
  description = "Describe this feature in a short sentence.",
  iconColor = "#0f172a",
  iconBackground,
  titleColor = "#0f172a",
  bodyColor = "#475569",
  iconSize = 36,
  iconStrokeWidth = 1.5,
  align = "center",
  layout = "vertical",
  href = "",
  newTab = false,
  customId = "",
  boxModel,
  border,
  borderRadius = 0,
  shadow,
  background,
  transform,
  hover,
  transition,
  opacity = 1,
}: IconBoxProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const IconComponent = getIcon(icon);
  const [hovered, setHovered] = useState(false);

  const isHorizontal = layout === "horizontal";

  const baseStyle: React.CSSProperties = {
    textAlign: align,
    borderRadius,
    ...backgroundToCSS(background),
    ...borderStyleToCSS(border),
    ...shadowToCSS(shadow),
    ...transformToCSS(transform),
    ...transitionToCSS(transition),
    opacity,
    ...(hovered ? hoverToCSS(hover) : {}),
    ...boxToStyle(boxModel?.padding, "padding"),
    ...boxToStyle(boxModel?.margin, "margin"),
  };

  const justify =
    align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";

  const inner = (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        isHorizontal ? "flex flex-row items-start gap-4" : "flex flex-col gap-3",
        selected && "ring-2 ring-primary/40 ring-offset-2"
      )}
      style={baseStyle}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center",
          isHorizontal ? "" : "w-full"
        )}
        style={{
          justifyContent: justify,
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: iconSize + 24,
            height: iconSize + 24,
            borderRadius: 999,
            ...backgroundToCSS(iconBackground),
          }}
        >
          <IconComponent
            style={{ color: iconColor, width: iconSize, height: iconSize }}
            strokeWidth={iconStrokeWidth}
          />
        </div>
      </div>
      <div className={cn(isHorizontal ? "flex-1" : "")}>
        <h3
          className="text-xl font-semibold tracking-tight"
          style={{ color: titleColor, textAlign: align }}
        >
          {title}
        </h3>
        <p
          className="mt-1 text-sm leading-relaxed"
          style={{ color: bodyColor, textAlign: align }}
        >
          {description}
        </p>
      </div>
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

function IconBoxSettings() {
  const {
    actions: { setProp },
    icon,
    title,
    description,
    iconColor,
    iconBackground,
    titleColor,
    bodyColor,
    iconSize,
    iconStrokeWidth,
    align,
    layout,
    href,
    newTab,
    customId,
    boxModel,
    border,
    borderRadius,
    shadow,
    background,
    transform,
    hover,
    transition,
    opacity,
  } = useNode((node) => ({
    icon: (node.data.props.icon as string) ?? "Sparkles",
    title: (node.data.props.title as string) ?? "",
    description: (node.data.props.description as string) ?? "",
    iconColor: (node.data.props.iconColor as string) ?? "#0f172a",
    iconBackground: node.data.props.iconBackground as IconBoxProps["iconBackground"],
    titleColor: (node.data.props.titleColor as string) ?? "#0f172a",
    bodyColor: (node.data.props.bodyColor as string) ?? "#475569",
    iconSize: (node.data.props.iconSize as number) ?? 36,
    iconStrokeWidth: (node.data.props.iconStrokeWidth as number) ?? 1.5,
    align: node.data.props.align as IconBoxProps["align"],
    layout: (node.data.props.layout as IconBoxProps["layout"]) ?? "vertical",
    href: (node.data.props.href as string) ?? "",
    newTab: (node.data.props.newTab as boolean) ?? false,
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as IconBoxProps["boxModel"],
    border: node.data.props.border as IconBoxProps["border"],
    borderRadius: (node.data.props.borderRadius as number) ?? 0,
    shadow: node.data.props.shadow as IconBoxProps["shadow"],
    background: node.data.props.background as IconBoxProps["background"],
    transform: node.data.props.transform as IconBoxProps["transform"],
    hover: node.data.props.hover as IconBoxProps["hover"],
    transition: node.data.props.transition as IconBoxProps["transition"],
    opacity: (node.data.props.opacity as number) ?? 1,
  })) as any;

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: IconBoxProps) => { props.customId = e.target.value; })
          }
          placeholder="feature-1"
        />
      </FieldRow>
      <SelectField
        label="Icon"
        value={icon}
        onChange={(v) =>
          setProp((props: IconBoxProps) => { props.icon = v; })
        }
        options={ICON_OPTIONS.map((name) => ({ value: name, label: name }))}
      />
      <FieldRow label="Title">
        <Input
          value={title}
          onChange={(e) =>
            setProp((props: IconBoxProps) => { props.title = e.target.value; })
          }
        />
      </FieldRow>
      <FieldRow label="Description">
        <Textarea
          value={description}
          rows={3}
          onChange={(e) =>
            setProp((props: IconBoxProps) => { props.description = e.target.value; })
          }
        />
      </FieldRow>
      <FieldRow label="Link URL (optional)">
        <Input
          value={href}
          placeholder="https://…"
          onChange={(e) =>
            setProp((props: IconBoxProps) => { props.href = e.target.value; })
          }
        />
      </FieldRow>
      <ToggleField
        label="Open link in new tab"
        value={newTab}
        onChange={(v) =>
          setProp((props: IconBoxProps) => { props.newTab = v; })
        }
      />

      <SelectField
        label="Layout"
        value={layout}
        onChange={(v) =>
          setProp((props: IconBoxProps) => { props.layout = v as IconBoxProps["layout"]; })
        }
        options={[
          { value: "vertical", label: "Vertical (stacked)" },
          { value: "horizontal", label: "Horizontal (side-by-side)" },
        ]}
      />

      <SliderField
        label="Icon size"
        value={iconSize}
        min={16}
        max={120}
        onChange={(v) =>
          setProp((props: IconBoxProps) => { props.iconSize = v; })
        }
      />
      <SliderField
        label="Icon stroke width"
        value={iconStrokeWidth}
        min={0.5}
        max={4}
        step={0.5}
        unit=""
        onChange={(v) =>
          setProp((props: IconBoxProps) => { props.iconStrokeWidth = v; })
        }
      />
      <AlignField
        label="Alignment"
        value={align}
        onChange={(v) =>
          setProp((props: IconBoxProps) => { props.align = v; })
        }
      />

      <ColorField
        label="Icon color"
        value={iconColor}
        onChange={(v) =>
          setProp((props: IconBoxProps) => { props.iconColor = v; })
        }
      />
      <BackgroundField
        label="Icon background"
        value={iconBackground}
        onChange={(v) =>
          setProp((props: IconBoxProps) => { props.iconBackground = v; })
        }
      />
      <ColorField
        label="Title color"
        value={titleColor}
        onChange={(v) =>
          setProp((props: IconBoxProps) => { props.titleColor = v; })
        }
      />
      <ColorField
        label="Body color"
        value={bodyColor}
        onChange={(v) =>
          setProp((props: IconBoxProps) => { props.bodyColor = v; })
        }
      />

      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: IconBoxProps) => { props.boxModel = v; })
        }
      />

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="rounded-md border border-dashed py-1 text-[10px] text-muted-foreground hover:border-foreground hover:text-foreground"
      >
        {showAdvanced ? "▾ Hide advanced" : "▸ Show advanced (background, border, hover)"}
      </button>

      {showAdvanced && (
        <>
          <BackgroundField
            label="Card background"
            value={background}
            onChange={(v) =>
              setProp((props: IconBoxProps) => { props.background = v; })
            }
          />
          <BorderField
            label="Border"
            value={border}
            onChange={(v) =>
              setProp((props: IconBoxProps) => { props.border = v; })
            }
          />
          <SliderField
            label="Border radius"
            value={borderRadius}
            min={0}
            max={64}
            onChange={(v) =>
              setProp((props: IconBoxProps) => { props.borderRadius = v; })
            }
          />
          <ShadowField
            label="Shadow"
            value={shadow}
            onChange={(v) =>
              setProp((props: IconBoxProps) => { props.shadow = v; })
            }
          />
          <HoverField
            value={hover}
            onChange={(v) =>
              setProp((props: IconBoxProps) => { props.hover = v; })
            }
          />
          <TransitionField
            value={transition}
            onChange={(v) =>
              setProp((props: IconBoxProps) => { props.transition = v; })
            }
          />
          <TransformField
            value={transform}
            onChange={(v) =>
              setProp((props: IconBoxProps) => { props.transform = v; })
            }
          />
          <OpacityField
            value={opacity}
            onChange={(v) =>
              setProp((props: IconBoxProps) => { props.opacity = v; })
            }
          />
        </>
      )}
    </div>
  );
}

IconBox.craft = {
  displayName: "Icon Feature",
  props: {
    icon: "Sparkles",
    title: "Feature title",
    description: "Describe this feature in a short sentence.",
    iconColor: "#0f172a",
    iconBackground: undefined,
    titleColor: "#0f172a",
    bodyColor: "#475569",
    iconSize: 36,
    iconStrokeWidth: 1.5,
    align: "center",
    layout: "vertical",
    href: "",
    newTab: false,
    customId: "",
    boxModel: undefined,
    border: undefined,
    borderRadius: 0,
    shadow: undefined,
    background: undefined,
    transform: undefined,
    hover: undefined,
    transition: undefined,
    opacity: 1,
  },
  related: {
    settings: IconBoxSettings,
  },
};