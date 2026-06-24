"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { SliderField } from "@/components/craft/settings/SliderField";
import { Input } from "@/components/ui/input";
import { BoxModelField, boxToStyle } from "@/components/craft/settings/BoxModelField";

type SpacerProps = {
  height?: number;
  customId?: string;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
};

export function Spacer({
  height = 40,
  customId = "",
  boxModel,
}: SpacerProps) {
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
      style={{
        height,
        ...boxToStyle(boxModel?.padding, "padding"),
        ...boxToStyle(boxModel?.margin, "margin"),
      }}
      className={cn(
        "w-full",
        selected && "outline-dashed outline-1 outline-primary/40"
      )}
    />
  );
}

function SpacerSettings() {
  const {
    actions: { setProp },
    height,
    customId,
    boxModel,
  } = useNode((node) => ({
    height: node.data.props.height as number,
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as SpacerProps["boxModel"],
  })) as any;

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: SpacerProps) => {
              props.customId = e.target.value;
            })
          }
          placeholder="spacer-1"
        />
      </FieldRow>
      <SliderField
        label="Height"
        value={height}
        min={8}
        max={300}
        step={4}
        onChange={(v) =>
          setProp((props: SpacerProps) => {
            props.height = v;
          })
        }
      />
      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: SpacerProps) => {
            props.boxModel = v;
          })
        }
      />
    </div>
  );
}

Spacer.craft = {
  displayName: "Spacer",
  props: {
    height: 40,
    customId: "",
    boxModel: undefined,
  },
  related: {
    settings: SpacerSettings,
  },
};