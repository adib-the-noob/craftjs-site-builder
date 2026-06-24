"use client";

import { useNode } from "@craftjs/core";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { ColorField } from "@/components/craft/settings/ColorField";
import { SliderField } from "@/components/craft/settings/SliderField";
import { BoxModelField, boxToStyle } from "@/components/craft/settings/BoxModelField";

type SectionProps = {
  background?: string;
  paddingY?: number;
  maxWidth?: number;
  customId?: string;
  children?: React.ReactNode;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
  borderRadius?: number;
};

export function Section({
  background = "#ffffff",
  paddingY = 96,
  maxWidth = 1100,
  customId = "",
  children,
  boxModel,
  borderRadius = 0,
}: SectionProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const effectiveBox = boxModel ?? {
    padding: typeof paddingY === "number" ? { top: paddingY, bottom: paddingY } : undefined,
  };

  return (
    <section
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      className="w-full"
      style={{
        background,
        ...boxToStyle(effectiveBox.padding, "padding"),
        ...boxToStyle(effectiveBox.margin, "margin"),
        borderRadius,
        ...(selected ? { outline: "2px dashed var(--ring)" } : {}),
      }}
    >
      <div className="mx-auto w-full px-6" style={{ maxWidth }}>
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
    boxModel,
    borderRadius,
  } = useNode((node) => ({
    background: node.data.props.background as string,
    paddingY: node.data.props.paddingY as number,
    maxWidth: node.data.props.maxWidth as number,
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as SectionProps["boxModel"],
    borderRadius: (node.data.props.borderRadius as number) ?? 0,
  })) as any;

  const currentBox = boxModel ?? {
    padding: { top: paddingY ?? 0, bottom: paddingY ?? 0 },
  };

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
      <BoxModelField
        label="Spacing (margin / padding)"
        value={currentBox}
        onChange={(v) =>
          setProp((props: SectionProps) => {
            props.boxModel = v;
            if (v.padding && typeof v.padding === "object") {
              props.paddingY = v.padding.top ?? v.padding.bottom ?? 0;
            } else if (typeof v.padding === "number") {
              props.paddingY = v.padding;
            } else {
              props.paddingY = 0;
            }
          })
        }
      />
      <SliderField
        label="Border radius"
        value={borderRadius}
        min={0}
        max={64}
        onChange={(v) =>
          setProp((props: SectionProps) => {
            props.borderRadius = v;
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
    paddingY: 96,
    maxWidth: 1100,
    customId: "",
    boxModel: undefined,
    borderRadius: 0,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
  related: {
    settings: SectionSettings,
  },
};