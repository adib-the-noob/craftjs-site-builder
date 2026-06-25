"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import {
  BoxModelField,
  ColorField,
  HoverField,
  OpacityField,
  SelectField,
  SliderField,
  ToggleField,
  TransformField,
  TransitionField,
  boxToStyle,
} from "@/components/craft/settings";
import {
  hoverToCSS,
  transformToCSS,
  transitionToCSS,
  type HoverValue,
  type TransformValue,
  type TransitionValue,
} from "@/lib/craft-styles";

type DividerProps = {
  color?: string;
  thickness?: number;
  style?: "solid" | "dashed" | "dotted" | "double" | "groove";
  /** Width as a percentage of the parent. */
  width?: number;
  /** Optional label rendered in the middle of the divider (e.g. "OR"). */
  label?: string;
  /** Orientation. */
  orientation?: "horizontal" | "vertical";
  /** Vertical height when orientation === "vertical" (px). */
  verticalHeight?: number;
  customId?: string;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
  transform?: TransformValue;
  hover?: HoverValue;
  transition?: TransitionValue;
  opacity?: number;
};

export function Divider({
  color = "#e5e7eb",
  thickness = 1,
  style = "solid",
  width = 100,
  label = "",
  orientation = "horizontal",
  verticalHeight = 80,
  customId = "",
  boxModel,
  transform,
  hover,
  transition,
  opacity = 1,
}: DividerProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const baseStyle: React.CSSProperties = {
    opacity,
    ...transformToCSS(transform),
    ...transitionToCSS(transition),
    ...boxToStyle(boxModel?.padding, "padding"),
    ...boxToStyle(boxModel?.margin, "margin"),
  };

  if (orientation === "vertical") {
    return (
      <span
        ref={(ref) => { if (ref) connect(drag(ref)); }}
        id={customId || undefined}
        className={cn(
          "inline-block",
          selected && "outline-dashed outline-1 outline-primary/40"
        )}
        style={{
          ...baseStyle,
          height: verticalHeight,
          width: thickness,
          background: color,
          borderRadius: thickness / 2,
        }}
      />
    );
  }

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      className={cn(
        "flex w-full items-center",
        selected && "outline-dashed outline-1 outline-primary/40"
      )}
      style={baseStyle}
    >
      {label ? (
        <>
          <span
            className="grow"
            style={{
              borderTopWidth: thickness,
              borderTopStyle: style,
              borderTopColor: color,
              background: style === "solid" ? color : "transparent",
              height: style === "solid" ? thickness : 0,
            }}
          />
          <span
            className="px-3 text-xs uppercase tracking-wider text-muted-foreground"
            style={{ color }}
          >
            {label}
          </span>
          <span
            className="grow"
            style={{
              borderTopWidth: thickness,
              borderTopStyle: style,
              borderTopColor: color,
              background: style === "solid" ? color : "transparent",
              height: style === "solid" ? thickness : 0,
            }}
          />
        </>
      ) : (
        <span
          className="block"
          style={{
            width: `${width}%`,
            borderTopWidth: thickness,
            borderTopStyle: style,
            borderTopColor: color,
            background: style === "solid" ? color : "transparent",
            height: style === "solid" ? thickness : 0,
          }}
        />
      )}
    </div>
  );
}

function DividerSettings() {
  const {
    actions: { setProp },
    color,
    thickness,
    style,
    width,
    label,
    orientation,
    verticalHeight,
    customId,
    boxModel,
    transform,
    hover,
    transition,
    opacity,
  } = useNode((node) => ({
    color: (node.data.props.color as string) ?? "#e5e7eb",
    thickness: (node.data.props.thickness as number) ?? 1,
    style: (node.data.props.style as DividerProps["style"]) ?? "solid",
    width: (node.data.props.width as number) ?? 100,
    label: (node.data.props.label as string) ?? "",
    orientation: (node.data.props.orientation as DividerProps["orientation"]) ?? "horizontal",
    verticalHeight: (node.data.props.verticalHeight as number) ?? 80,
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as DividerProps["boxModel"],
    transform: node.data.props.transform as DividerProps["transform"],
    hover: node.data.props.hover as DividerProps["hover"],
    transition: node.data.props.transition as DividerProps["transition"],
    opacity: (node.data.props.opacity as number) ?? 1,
  })) as any;

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: DividerProps) => { props.customId = e.target.value; })
          }
          placeholder="divider-1"
        />
      </FieldRow>
      <SelectField
        label="Orientation"
        value={orientation}
        onChange={(v) =>
          setProp((props: DividerProps) => { props.orientation = v as DividerProps["orientation"]; })
        }
        options={[
          { value: "horizontal", label: "Horizontal" },
          { value: "vertical", label: "Vertical" },
        ]}
      />
      <ColorField
        label="Color"
        value={color}
        onChange={(v) =>
          setProp((props: DividerProps) => { props.color = v; })
        }
      />
      <SliderField
        label="Thickness"
        value={thickness}
        min={1}
        max={20}
        onChange={(v) =>
          setProp((props: DividerProps) => { props.thickness = v; })
        }
      />
      <SelectField
        label="Style"
        value={style}
        onChange={(v) =>
          setProp((props: DividerProps) => { props.style = v as DividerProps["style"]; })
        }
        options={[
          { value: "solid", label: "Solid" },
          { value: "dashed", label: "Dashed" },
          { value: "dotted", label: "Dotted" },
          { value: "double", label: "Double" },
          { value: "groove", label: "Groove" },
        ]}
      />
      {orientation === "horizontal" ? (
        <>
          <SliderField
            label="Width"
            value={width}
            min={10}
            max={100}
            step={5}
            unit="%"
            onChange={(v) =>
              setProp((props: DividerProps) => { props.width = v; })
            }
          />
          <FieldRow label="Center label (e.g. OR)">
            <Input
              value={label}
              onChange={(e) =>
                setProp((props: DividerProps) => { props.label = e.target.value; })
              }
            />
          </FieldRow>
        </>
      ) : (
        <SliderField
          label="Height"
          value={verticalHeight}
          min={20}
          max={400}
          unit="px"
          onChange={(v) =>
            setProp((props: DividerProps) => { props.verticalHeight = v; })
          }
        />
      )}
      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: DividerProps) => { props.boxModel = v; })
        }
      />
      <HoverField
        value={hover}
        onChange={(v) =>
          setProp((props: DividerProps) => { props.hover = v; })
        }
      />
      <TransitionField
        value={transition}
        onChange={(v) =>
          setProp((props: DividerProps) => { props.transition = v; })
        }
      />
      <TransformField
        value={transform}
        onChange={(v) =>
          setProp((props: DividerProps) => { props.transform = v; })
        }
      />
      <OpacityField
        value={opacity}
        onChange={(v) =>
          setProp((props: DividerProps) => { props.opacity = v; })
        }
      />
    </div>
  );
}

Divider.craft = {
  displayName: "Divider",
  props: {
    color: "#e5e7eb",
    thickness: 1,
    style: "solid",
    width: 100,
    label: "",
    orientation: "horizontal",
    verticalHeight: 80,
    customId: "",
    boxModel: undefined,
    transform: undefined,
    hover: undefined,
    transition: undefined,
    opacity: 1,
  },
  related: {
    settings: DividerSettings,
  },
};