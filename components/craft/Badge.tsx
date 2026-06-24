"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { ColorField } from "@/components/craft/settings/ColorField";
import { SelectField } from "@/components/craft/settings/SelectField";
import { BoxModelField, boxToStyle } from "@/components/craft/settings/BoxModelField";

type BadgeProps = {
  text?: string;
  background?: string;
  textColor?: string;
  size?: "sm" | "md" | "lg";
  customId?: string;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
};

export function Badge({
  text = "New",
  background = "#0f172a",
  textColor = "#ffffff",
  size = "md",
  customId = "",
  boxModel,
}: BadgeProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const sizeClass =
    size === "sm"
      ? "px-2 py-0.5 text-xs"
      : size === "lg"
        ? "px-4 py-1.5 text-base"
        : "px-3 py-1 text-sm";

  return (
    <span
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        sizeClass,
        selected && "ring-2 ring-primary/40 ring-offset-2"
      )}
      style={{
        backgroundColor: background,
        color: textColor,
        ...boxToStyle(boxModel?.padding, "padding"),
        ...boxToStyle(boxModel?.margin, "margin"),
      }}
    >
      {text}
    </span>
  );
}

function BadgeSettings() {
  const {
    actions: { setProp },
    text,
    background,
    textColor,
    size,
    customId,
    boxModel,
  } = useNode((node) => ({
    text: node.data.props.text as string,
    background: node.data.props.background as string,
    textColor: node.data.props.textColor as string,
    size: node.data.props.size as BadgeProps["size"],
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as BadgeProps["boxModel"],
  })) as any;

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: BadgeProps) => {
              props.customId = e.target.value;
            })
          }
          placeholder="badge-1"
        />
      </FieldRow>
      <FieldRow label="Text">
        <Input
          value={text}
          onChange={(e) =>
            setProp((props: BadgeProps) => {
              props.text = e.target.value;
            })
          }
        />
      </FieldRow>
      <SelectField
        label="Size"
        value={size}
        onChange={(v) =>
          setProp((props: BadgeProps) => {
            props.size = v as BadgeProps["size"];
          })
        }
        options={[
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
        ]}
      />
      <ColorField
        label="Background"
        value={background}
        onChange={(v) =>
          setProp((props: BadgeProps) => {
            props.background = v;
          })
        }
      />
      <ColorField
        label="Text color"
        value={textColor}
        onChange={(v) =>
          setProp((props: BadgeProps) => {
            props.textColor = v;
          })
        }
      />
      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: BadgeProps) => {
            props.boxModel = v;
          })
        }
      />
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
    customId: "",
    boxModel: undefined,
  },
  related: {
    settings: BadgeSettings,
  },
};