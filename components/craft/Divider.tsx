"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { ColorField } from "@/components/craft/settings/ColorField";
import { SliderField } from "@/components/craft/settings/SliderField";
import { SelectField } from "@/components/craft/settings/SelectField";
import { Input } from "@/components/ui/input";
import { BoxModelField, boxToStyle } from "@/components/craft/settings/BoxModelField";

type DividerProps = {
  color?: string;
  thickness?: number;
  style?: "solid" | "dashed" | "dotted";
  width?: number;
  customId?: string;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
};

export function Divider({
  color = "#e5e7eb",
  thickness = 1,
  style = "solid",
  width = 100,
  customId = "",
  boxModel,
}: DividerProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      className={cn(
        "flex w-full justify-center",
        selected && "outline-dashed outline-1 outline-primary/40"
      )}
      style={{
        ...boxToStyle(boxModel?.padding, "padding"),
        ...boxToStyle(boxModel?.margin, "margin"),
      }}
    >
      <hr
        className={cn(
          "border-0",
          style === "dashed" && "border-t",
          style === "dotted" && "border-t"
        )}
        style={{
          borderTopWidth: thickness,
          borderTopStyle: style,
          borderTopColor: color,
          background: style === "solid" ? color : "transparent",
          height: style === "solid" ? thickness : 0,
          width: `${width}%`,
        }}
      />
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
    customId,
    boxModel,
  } = useNode((node) => ({
    color: node.data.props.color as string,
    thickness: node.data.props.thickness as number,
    style: node.data.props.style as DividerProps["style"],
    width: node.data.props.width as number,
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as DividerProps["boxModel"],
  })) as any;

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: DividerProps) => {
              props.customId = e.target.value;
            })
          }
          placeholder="divider-1"
        />
      </FieldRow>
      <ColorField
        label="Color"
        value={color}
        onChange={(v) =>
          setProp((props: DividerProps) => {
            props.color = v;
          })
        }
      />
      <SliderField
        label="Thickness"
        value={thickness}
        min={1}
        max={20}
        onChange={(v) =>
          setProp((props: DividerProps) => {
            props.thickness = v;
          })
        }
      />
      <SelectField
        label="Style"
        value={style}
        onChange={(v) =>
          setProp((props: DividerProps) => {
            props.style = v as DividerProps["style"];
          })
        }
        options={[
          { value: "solid", label: "Solid" },
          { value: "dashed", label: "Dashed" },
          { value: "dotted", label: "Dotted" },
        ]}
      />
      <SliderField
        label="Width"
        value={width}
        min={10}
        max={100}
        step={5}
        unit="%"
        onChange={(v) =>
          setProp((props: DividerProps) => {
            props.width = v;
          })
        }
      />
      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: DividerProps) => {
            props.boxModel = v;
          })
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
    customId: "",
    boxModel: undefined,
  },
  related: {
    settings: DividerSettings,
  },
};