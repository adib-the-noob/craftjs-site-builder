"use client";

import { useNode } from "@craftjs/core";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { ColorField } from "@/components/craft/settings/ColorField";
import { SliderField } from "@/components/craft/settings/SliderField";
import { BoxModelField, boxToStyle } from "@/components/craft/settings/BoxModelField";

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
  /** Tailwind-style box model — overrides padding/marginTop/marginBottom when set. */
  boxModel?: { margin?: any; padding?: any };
  borderRadius?: number;
};

export function Container({
  background = "transparent",
  padding = 24,
  maxWidth = 0,
  marginTop = 0,
  marginBottom = 0,
  customId = "",
  children,
  boxModel,
  borderRadius = 0,
}: ContainerProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  // Backward-compat: when boxModel isn't set, derive it from the legacy
  // `padding` / `marginTop` / `marginBottom` props.
  const effectiveBox = boxModel ?? {
    padding: typeof padding === "number" ? padding : undefined,
    margin:
      marginTop || marginBottom
        ? { top: marginTop, bottom: marginBottom }
        : undefined,
  };

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      className="min-h-10 w-full"
      style={{
        background,
        ...boxToStyle(effectiveBox.padding, "padding"),
        ...boxToStyle(effectiveBox.margin, "margin"),
        ...(typeof maxWidth === "number" && maxWidth > 0
          ? { maxWidth, marginLeft: "auto", marginRight: "auto" }
          : {}),
        borderRadius,
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
    boxModel,
    borderRadius,
  } = useNode((node) => ({
    background: node.data.props.background as string,
    padding: node.data.props.padding as number,
    maxWidth: node.data.props.maxWidth as number,
    marginTop: node.data.props.marginTop as number,
    marginBottom: node.data.props.marginBottom as number,
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as ContainerProps["boxModel"],
    borderRadius: (node.data.props.borderRadius as number) ?? 0,
  })) as any;

  // Derive a current box model for the field, falling back to legacy props.
  const currentBox = boxModel ?? {
    padding: padding ?? 0,
    margin:
      marginTop || marginBottom
        ? { top: marginTop, bottom: marginBottom }
        : undefined,
  };

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
      <BoxModelField
        label="Spacing (margin / padding)"
        value={currentBox}
        onChange={(v) =>
          setProp((props: ContainerProps) => {
            props.boxModel = v;
            // Mirror into legacy props so older serialized trees still
            // see the same values on load.
            if (v.padding && typeof v.padding === "number") {
              props.padding = v.padding;
            } else if (v.padding && typeof v.padding === "object") {
              props.padding = v.padding.top ?? 0;
            } else {
              props.padding = 0;
            }
            if (v.margin && typeof v.margin === "number") {
              props.marginTop = v.margin;
              props.marginBottom = v.margin;
            } else if (v.margin && typeof v.margin === "object") {
              props.marginTop = v.margin.top ?? 0;
              props.marginBottom = v.margin.bottom ?? 0;
            } else {
              props.marginTop = 0;
              props.marginBottom = 0;
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
          setProp((props: ContainerProps) => {
            props.borderRadius = v;
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
    boxModel: undefined,
    borderRadius: 0,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
  related: {
    settings: ContainerSettings,
  },
};