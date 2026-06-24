"use client";

import { useNode } from "@craftjs/core";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ColorField } from "@/components/craft/settings/ColorField";
import { SliderField } from "@/components/craft/settings/SliderField";
import { SelectField } from "@/components/craft/settings/SelectField";
import { AlignField } from "@/components/craft/settings/AlignField";
import { BoxModelField, boxToStyle } from "@/components/craft/settings/BoxModelField";

// Whitelist of safe icon names so users don't get arbitrary keys.
const ICON_OPTIONS = [
  "Sparkles",
  "Star",
  "Heart",
  "Zap",
  "Shield",
  "Rocket",
  "Globe",
  "Lightbulb",
  "Users",
  "Mail",
  "Phone",
  "Code",
  "Briefcase",
  "Camera",
  "Music",
  "Image",
  "Lock",
  "Cloud",
  "Trophy",
  "Target",
];

type IconBoxProps = {
  icon?: string;
  title?: string;
  description?: string;
  iconColor?: string;
  titleColor?: string;
  bodyColor?: string;
  iconSize?: number;
  align?: "left" | "center" | "right";
  customId?: string;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
  borderRadius?: number;
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
  titleColor = "#0f172a",
  bodyColor = "#475569",
  iconSize = 36,
  align = "center",
  customId = "",
  boxModel,
  borderRadius = 0,
}: IconBoxProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const IconComponent = getIcon(icon);

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      className={cn(
        "flex flex-col gap-3 outline-none",
        selected && "ring-2 ring-primary/40 ring-offset-2"
      )}
      style={{
        textAlign: align,
        borderRadius,
        ...boxToStyle(boxModel?.padding, "padding"),
        ...boxToStyle(boxModel?.margin, "margin"),
      }}
    >
      <div
        className="flex"
        style={{
          justifyContent:
            align === "center"
              ? "center"
              : align === "right"
                ? "flex-end"
                : "flex-start",
        }}
      >
        <IconComponent
          style={{ color: iconColor, width: iconSize, height: iconSize }}
          strokeWidth={1.5}
        />
      </div>
      <h3
        className="text-xl font-semibold tracking-tight"
        style={{ color: titleColor }}
      >
        {title}
      </h3>
      <p className="text-sm" style={{ color: bodyColor }}>
        {description}
      </p>
    </div>
  );
}

function IconBoxSettings() {
  const {
    actions: { setProp },
    icon,
    title,
    description,
    iconColor,
    titleColor,
    bodyColor,
    iconSize,
    align,
    customId,
    boxModel,
    borderRadius,
  } = useNode((node) => ({
    icon: node.data.props.icon as string,
    title: node.data.props.title as string,
    description: node.data.props.description as string,
    iconColor: node.data.props.iconColor as string,
    titleColor: node.data.props.titleColor as string,
    bodyColor: node.data.props.bodyColor as string,
    iconSize: node.data.props.iconSize as number,
    align: node.data.props.align as IconBoxProps["align"],
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as IconBoxProps["boxModel"],
    borderRadius: (node.data.props.borderRadius as number) ?? 0,
  })) as any;

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: IconBoxProps) => {
              props.customId = e.target.value;
            })
          }
          placeholder="feature-1"
        />
      </FieldRow>
      <SelectField
        label="Icon"
        value={icon}
        onChange={(v) =>
          setProp((props: IconBoxProps) => {
            props.icon = v;
          })
        }
        options={ICON_OPTIONS.map((name) => ({ value: name, label: name }))}
      />
      <FieldRow label="Title">
        <Input
          value={title}
          onChange={(e) =>
            setProp((props: IconBoxProps) => {
              props.title = e.target.value;
            })
          }
        />
      </FieldRow>
      <FieldRow label="Description">
        <Textarea
          value={description}
          rows={3}
          onChange={(e) =>
            setProp((props: IconBoxProps) => {
              props.description = e.target.value;
            })
          }
        />
      </FieldRow>
      <SliderField
        label="Icon size"
        value={iconSize}
        min={20}
        max={80}
        onChange={(v) =>
          setProp((props: IconBoxProps) => {
            props.iconSize = v;
          })
        }
      />
      <AlignField
        label="Alignment"
        value={align}
        onChange={(v) =>
          setProp((props: IconBoxProps) => {
            props.align = v;
          })
        }
      />
      <ColorField
        label="Icon color"
        value={iconColor}
        onChange={(v) =>
          setProp((props: IconBoxProps) => {
            props.iconColor = v;
          })
        }
      />
      <ColorField
        label="Title color"
        value={titleColor}
        onChange={(v) =>
          setProp((props: IconBoxProps) => {
            props.titleColor = v;
          })
        }
      />
      <ColorField
        label="Body color"
        value={bodyColor}
        onChange={(v) =>
          setProp((props: IconBoxProps) => {
            props.bodyColor = v;
          })
        }
      />
      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: IconBoxProps) => {
            props.boxModel = v;
          })
        }
      />
      <SliderField
        label="Border radius"
        value={borderRadius}
        min={0}
        max={48}
        onChange={(v) =>
          setProp((props: IconBoxProps) => {
            props.borderRadius = v;
          })
        }
      />
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
    titleColor: "#0f172a",
    bodyColor: "#475569",
    iconSize: 36,
    align: "center",
    customId: "",
    boxModel: undefined,
    borderRadius: 0,
  },
  related: {
    settings: IconBoxSettings,
  },
};