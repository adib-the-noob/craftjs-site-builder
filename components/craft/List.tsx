"use client";

import { useNode } from "@craftjs/core";
import { useState } from "react";
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

type ListProps = {
  items?: string;
  ordered?: boolean;
  fontSize?: number;
  color?: string;
  spacing?: number;
  fontWeight?: number;
  align?: "left" | "center" | "right";
  /** Bullet style (only for unordered). */
  bulletStyle?: "disc" | "circle" | "square" | "none" | "check" | "arrow";
  /** Numbering start (only for ordered). */
  start?: number;
  /** Layout: stacked column or multi-column grid. */
  columns?: number;
  /** Background of the list container. */
  background?: BackgroundValue;
  /** Border around each item (creates card-like items). */
  itemBorder?: BorderValue;
  itemBackground?: BackgroundValue;
  itemPadding?: number;
  itemRadius?: number;
  customId?: string;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
  border?: BorderValue;
  borderRadius?: number;
  shadow?: ShadowValue;
  transform?: TransformValue;
  hover?: HoverValue;
  transition?: TransitionValue;
  opacity?: number;
};

export function List({
  items = "First item\nSecond item\nThird item",
  ordered = false,
  fontSize = 16,
  color = "#374151",
  spacing = 8,
  fontWeight = 400,
  align = "left",
  bulletStyle = "disc",
  start = 1,
  columns = 1,
  background,
  itemBorder,
  itemBackground,
  itemPadding = 0,
  itemRadius = 0,
  customId = "",
  boxModel,
  border,
  borderRadius = 0,
  shadow,
  transform,
  hover,
  transition,
  opacity = 1,
}: ListProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const list = items.split("\n").filter((line) => line.trim().length > 0);

  // Map bullet style to a marker character/icon.
  const bulletPrefix = (idx: number) => {
    if (ordered) return `${start + idx}.`;
    if (bulletStyle === "check") return "✓";
    if (bulletStyle === "arrow") return "→";
    return ""; // rely on default list-style
  };

  const listClass =
    ordered
      ? "list-decimal"
      : bulletStyle === "none"
        ? "list-none"
        : bulletStyle === "circle"
          ? "list-[circle]"
          : bulletStyle === "square"
            ? "list-[square]"
            : "list-disc";

  const baseStyle: React.CSSProperties = {
    fontSize,
    color,
    fontWeight,
    textAlign: align,
    borderRadius,
    opacity,
    ...backgroundToCSS(background),
    ...borderStyleToCSS(border),
    ...shadowToCSS(shadow),
    ...transformToCSS(transform),
    ...transitionToCSS(transition),
    ...boxToStyle(boxModel?.padding, "padding"),
    ...boxToStyle(boxModel?.margin, "margin"),
  };

  const itemBaseStyle: React.CSSProperties = {
    marginBottom: spacing,
    padding: itemPadding,
    borderRadius: itemRadius,
    ...backgroundToCSS(itemBackground),
    ...borderStyleToCSS(itemBorder),
  };

  const containerClass =
    columns > 1 ? `grid grid-cols-1 sm:grid-cols-2 gap-x-6` : "";

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      className={cn(
        selected && "ring-2 ring-primary/40 ring-offset-2 rounded-md",
        containerClass
      )}
      style={baseStyle}
    >
      {list.map((item, idx) => {
        const Tag = ordered ? "ol" : "ul";
        return (
          <div
            key={idx}
            className="flex items-start gap-2"
            style={itemBaseStyle}
          >
            {bulletPrefix(idx) && (
              <span className="select-none pt-0.5 font-medium" style={{ minWidth: "1.5em" }}>
                {bulletPrefix(idx)}
              </span>
            )}
            <Tag
              className={cn(
                bulletStyle === "none" || ordered ? "" : listClass,
                "outline-none m-0 p-0"
              )}
              start={ordered ? start : undefined}
              style={{ flex: 1 }}
            >
              <li style={{ display: "inline" }}>{item}</li>
            </Tag>
          </div>
        );
      })}
    </div>
  );
}

function ListSettings() {
  const {
    actions: { setProp },
    items,
    ordered,
    fontSize,
    color,
    spacing,
    fontWeight,
    align,
    bulletStyle,
    start,
    columns,
    background,
    itemBorder,
    itemBackground,
    itemPadding,
    itemRadius,
    customId,
    boxModel,
    border,
    borderRadius,
    shadow,
    transform,
    hover,
    transition,
    opacity,
  } = useNode((node) => ({
    items: (node.data.props.items as string) ?? "",
    ordered: (node.data.props.ordered as boolean) ?? false,
    fontSize: (node.data.props.fontSize as number) ?? 16,
    color: (node.data.props.color as string) ?? "#374151",
    spacing: (node.data.props.spacing as number) ?? 8,
    fontWeight: (node.data.props.fontWeight as number) ?? 400,
    align: node.data.props.align as ListProps["align"],
    bulletStyle: (node.data.props.bulletStyle as ListProps["bulletStyle"]) ?? "disc",
    start: (node.data.props.start as number) ?? 1,
    columns: (node.data.props.columns as number) ?? 1,
    background: node.data.props.background as ListProps["background"],
    itemBorder: node.data.props.itemBorder as ListProps["itemBorder"],
    itemBackground: node.data.props.itemBackground as ListProps["itemBackground"],
    itemPadding: (node.data.props.itemPadding as number) ?? 0,
    itemRadius: (node.data.props.itemRadius as number) ?? 0,
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as ListProps["boxModel"],
    border: node.data.props.border as ListProps["border"],
    borderRadius: (node.data.props.borderRadius as number) ?? 0,
    shadow: node.data.props.shadow as ListProps["shadow"],
    transform: node.data.props.transform as ListProps["transform"],
    hover: node.data.props.hover as ListProps["hover"],
    transition: node.data.props.transition as ListProps["transition"],
    opacity: (node.data.props.opacity as number) ?? 1,
  })) as any;

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: ListProps) => { props.customId = e.target.value; })
          }
          placeholder="my-list"
        />
      </FieldRow>
      <FieldRow label="Items (one per line)">
        <Textarea
          value={items}
          rows={6}
          onChange={(e) =>
            setProp((props: ListProps) => { props.items = e.target.value; })
          }
        />
      </FieldRow>
      <SelectField
        label="Type"
        value={ordered ? "ordered" : "unordered"}
        onChange={(v) =>
          setProp((props: ListProps) => { props.ordered = v === "ordered"; })
        }
        options={[
          { value: "unordered", label: "Bulleted" },
          { value: "ordered", label: "Numbered" },
        ]}
      />
      {!ordered && (
        <SelectField
          label="Bullet style"
          value={bulletStyle}
          onChange={(v) =>
            setProp((props: ListProps) => { props.bulletStyle = v as ListProps["bulletStyle"]; })
          }
          options={[
            { value: "disc", label: "Disc" },
            { value: "circle", label: "Circle" },
            { value: "square", label: "Square" },
            { value: "none", label: "None" },
            { value: "check", label: "Check ✓" },
            { value: "arrow", label: "Arrow →" },
          ]}
        />
      )}
      {ordered && (
        <SliderField
          label="Start at"
          value={start}
          min={0}
          max={100}
          onChange={(v) =>
            setProp((props: ListProps) => { props.start = v; })
          }
        />
      )}
      <SliderField
        label="Columns"
        value={columns}
        min={1}
        max={4}
        onChange={(v) =>
          setProp((props: ListProps) => { props.columns = v; })
        }
      />
      <SliderField
        label="Font size"
        value={fontSize}
        min={10}
        max={32}
        onChange={(v) =>
          setProp((props: ListProps) => { props.fontSize = v; })
        }
      />
      <SliderField
        label="Font weight"
        value={fontWeight}
        min={100}
        max={900}
        step={100}
        unit=""
        onChange={(v) =>
          setProp((props: ListProps) => { props.fontWeight = v; })
        }
      />
      <ColorField
        label="Color"
        value={color}
        onChange={(v) =>
          setProp((props: ListProps) => { props.color = v; })
        }
      />
      <SliderField
        label="Item spacing"
        value={spacing}
        min={0}
        max={40}
        onChange={(v) =>
          setProp((props: ListProps) => { props.spacing = v; })
        }
      />
      <AlignField
        label="Alignment"
        value={align}
        onChange={(v) =>
          setProp((props: ListProps) => { props.align = v; })
        }
      />
      <SliderField
        label="Item padding"
        value={itemPadding}
        min={0}
        max={32}
        unit="px"
        onChange={(v) =>
          setProp((props: ListProps) => { props.itemPadding = v; })
        }
      />
      <SliderField
        label="Item radius"
        value={itemRadius}
        min={0}
        max={32}
        unit="px"
        onChange={(v) =>
          setProp((props: ListProps) => { props.itemRadius = v; })
        }
      />
      <BackgroundField
        label="Item background"
        value={itemBackground}
        onChange={(v) =>
          setProp((props: ListProps) => { props.itemBackground = v; })
        }
      />
      <BorderField
        label="Item border"
        value={itemBorder}
        onChange={(v) =>
          setProp((props: ListProps) => { props.itemBorder = v; })
        }
      />
      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: ListProps) => { props.boxModel = v; })
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
            label="List background"
            value={background}
            onChange={(v) =>
              setProp((props: ListProps) => { props.background = v; })
            }
          />
          <BorderField
            label="List border"
            value={border}
            onChange={(v) =>
              setProp((props: ListProps) => { props.border = v; })
            }
          />
          <SliderField
            label="Border radius"
            value={borderRadius}
            min={0}
            max={48}
            onChange={(v) =>
              setProp((props: ListProps) => { props.borderRadius = v; })
            }
          />
          <ShadowField
            label="Shadow"
            value={shadow}
            onChange={(v) =>
              setProp((props: ListProps) => { props.shadow = v; })
            }
          />
          <HoverField
            value={hover}
            onChange={(v) =>
              setProp((props: ListProps) => { props.hover = v; })
            }
          />
          <TransitionField
            value={transition}
            onChange={(v) =>
              setProp((props: ListProps) => { props.transition = v; })
            }
          />
          <TransformField
            value={transform}
            onChange={(v) =>
              setProp((props: ListProps) => { props.transform = v; })
            }
          />
          <OpacityField
            value={opacity}
            onChange={(v) =>
              setProp((props: ListProps) => { props.opacity = v; })
            }
          />
        </>
      )}
    </div>
  );
}

List.craft = {
  displayName: "List",
  props: {
    items: "First item\nSecond item\nThird item",
    ordered: false,
    fontSize: 16,
    color: "#374151",
    spacing: 8,
    fontWeight: 400,
    align: "left",
    bulletStyle: "disc",
    start: 1,
    columns: 1,
    background: undefined,
    itemBorder: undefined,
    itemBackground: undefined,
    itemPadding: 0,
    itemRadius: 0,
    customId: "",
    boxModel: undefined,
    border: undefined,
    borderRadius: 0,
    shadow: undefined,
    transform: undefined,
    hover: undefined,
    transition: undefined,
    opacity: 1,
  },
  related: {
    settings: ListSettings,
  },
};