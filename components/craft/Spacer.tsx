"use client";

import { useNode } from "@craftjs/core";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { SliderField } from "@/components/craft/settings/SliderField";
import { Input } from "@/components/ui/input";

type SpacerProps = {
  height?: number;
  customId?: string;
};

export function Spacer({ height = 40, customId = "" }: SpacerProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div
      ref={(ref) => {
        connect(drag(ref!));
      }}
      id={customId || undefined}
      style={{ height }}
      className="w-full"
    />
  );
}

function SpacerSettings() {
  const {
    actions: { setProp },
    height,
    customId,
  } = useNode((node) => ({
    height: node.data.props.height as number,
    customId: (node.data.props.customId as string) ?? "",
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
    </div>
  );
}

Spacer.craft = {
  displayName: "Spacer",
  props: {
    height: 40,
    customId: "",
  },
  related: {
    settings: SpacerSettings,
  },
};