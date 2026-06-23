"use client";

import { useNode } from "@craftjs/core";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { ColorField } from "@/components/craft/settings/ColorField";
import { SliderField } from "@/components/craft/settings/SliderField";

type SectionProps = {
  background?: string;
  paddingY?: number;
  maxWidth?: number;
  customId?: string;
  children?: React.ReactNode;
};

export function Section({
  background = "#ffffff",
  paddingY = 64,
  maxWidth = 1100,
  customId = "",
  children,
}: SectionProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <section
      ref={(ref) => {
        connect(drag(ref!));
      }}
      id={customId || undefined}
      className="w-full"
      style={{ background, paddingTop: paddingY, paddingBottom: paddingY }}
    >
      <div
        className="mx-auto w-full px-6"
        style={{ maxWidth }}
      >
        {children}
      </div>
    </section>
  );
}

function SectionSettings() {
  const {
    actions: { setProp },
    background,
    paddingY,
    maxWidth,
    customId,
  } = useNode((node) => ({
    background: node.data.props.background as string,
    paddingY: node.data.props.paddingY as number,
    maxWidth: node.data.props.maxWidth as number,
    customId: (node.data.props.customId as string) ?? "",
  })) as any;

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: SectionProps) => {
              props.customId = e.target.value;
            })
          }
          placeholder="hero"
        />
      </FieldRow>
      <ColorField
        label="Background"
        value={background}
        onChange={(v) =>
          setProp((props: SectionProps) => {
            props.background = v;
          })
        }
      />
      <SliderField
        label="Vertical padding"
        value={paddingY}
        min={0}
        max={200}
        onChange={(v) =>
          setProp((props: SectionProps) => {
            props.paddingY = v;
          })
        }
      />
      <SliderField
        label="Inner max width"
        value={maxWidth}
        min={480}
        max={1600}
        step={20}
        onChange={(v) =>
          setProp((props: SectionProps) => {
            props.maxWidth = v;
          })
        }
      />
    </div>
  );
}

Section.craft = {
  displayName: "Section",
  props: {
    background: "#ffffff",
    paddingY: 64,
    maxWidth: 1100,
    customId: "",
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
  related: {
    settings: SectionSettings,
  },
};