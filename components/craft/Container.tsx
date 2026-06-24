"use client";

import { useNode } from "@craftjs/core";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { ColorField } from "@/components/craft/settings/ColorField";
import { SliderField } from "@/components/craft/settings/SliderField";
import { SpacingField } from "@/components/craft/settings/SpacingField";

type ContainerProps = {
  background?: string;
  padding?: number;
  /**
   * Max width in px. `0` (or any non-positive value) means "no cap" —
   * the container fills its parent. The root canvas uses this so the
   * published site spans the full viewport by default.
   */
  maxWidth?: number;
  marginTop?: number;
  marginBottom?: number;
  customId?: string;
  children?: React.ReactNode;
};

export function Container({
  background = "transparent",
  padding = 24,
  maxWidth = 0,
  marginTop = 0,
  marginBottom = 0,
  customId = "",
  children,
}: ContainerProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div
      ref={(ref) => {
        connect(drag(ref!));
      }}
      id={customId || undefined}
      className="min-h-10 w-full"
      style={{
        background,
        padding,
        ...(typeof maxWidth === "number" && maxWidth > 0
          ? { maxWidth, marginLeft: "auto", marginRight: "auto" }
          : {}),
        marginTop,
        marginBottom,
      }}
    >
      {children}
    </div>
  );
}

function ContainerSettings() {
  const {
    actions: { setProp },
    background,
    padding,
    maxWidth,
    marginTop,
    marginBottom,
    customId,
  } = useNode((node) => ({
    background: node.data.props.background as string,
    padding: node.data.props.padding as number,
    maxWidth: node.data.props.maxWidth as number,
    marginTop: node.data.props.marginTop as number,
    marginBottom: node.data.props.marginBottom as number,
    customId: (node.data.props.customId as string) ?? "",
  })) as any;

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: ContainerProps) => {
              props.customId = e.target.value;
            })
          }
          placeholder="my-section"
        />
      </FieldRow>
      <ColorField
        label="Background"
        value={background}
        onChange={(v) =>
          setProp((props: ContainerProps) => {
            props.background = v;
          })
        }
      />
      <SliderField
        label="Padding"
        value={padding}
        min={0}
        max={120}
        onChange={(v) =>
          setProp((props: ContainerProps) => {
            props.padding = v;
          })
        }
      />
      <SliderField
        label={maxWidth > 0 ? "Max width" : "Max width (full width)"}
        value={maxWidth}
        min={0}
        max={1600}
        step={20}
        unit={maxWidth > 0 ? "px" : ""}
        onChange={(v) =>
          setProp((props: ContainerProps) => {
            props.maxWidth = v;
          })
        }
      />
      <SpacingField
        label="Margin"
        value={{
          top: marginTop,
          right: 0,
          bottom: marginBottom,
          left: 0,
        }}
        onChange={(v) =>
          setProp((props: ContainerProps) => {
            props.marginTop = v.top;
            props.marginBottom = v.bottom;
          })
        }
      />
    </div>
  );
}

Container.craft = {
  displayName: "Container",
  props: {
    background: "transparent",
    padding: 24,
    // 0 = full width (no cap). Inner Containers can still be constrained
    // by setting a positive value from the settings panel.
    maxWidth: 0,
    marginTop: 0,
    marginBottom: 0,
    customId: "",
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
  related: {
    settings: ContainerSettings,
  },
};