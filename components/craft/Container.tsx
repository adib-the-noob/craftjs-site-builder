"use client";

import { useNode } from "@craftjs/core";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  BackgroundField,
  BorderField,
  BoxModelField,
  DisplayField,
  FieldRow,
  HoverField,
  OpacityField,
  OverflowField,
  PositionField,
  ShadowField,
  SliderField,
  TransformField,
  TransitionField,
  ToggleField,
  boxToStyle,
} from "@/components/craft/settings";
import { Input } from "@/components/ui/input";
import {
  backgroundToCSS,
  borderStyleToCSS,
  hoverToCSS,
  overflowToCSS,
  shadowToCSS,
  transformToCSS,
  transitionToCSS,
  type BackgroundValue,
  type BorderValue,
  type DisplayValue,
  type HoverValue,
  type OverflowValue,
  type PositionValue,
  type ShadowValue,
  type TransformValue,
  type TransitionValue,
} from "@/lib/craft-styles";

type ContainerProps = {
  background?: BackgroundValue;
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
  border?: BorderValue;
  borderRadius?: number;
  shadow?: ShadowValue;
  /** Min height. */
  minHeight?: number;
  display?: DisplayValue;
  position?: PositionValue;
  overflow?: OverflowValue;
  opacity?: number;
  transform?: TransformValue;
  hover?: HoverValue;
  transition?: TransitionValue;
  /** Auto-center horizontally (default true). */
  centerWhenConstrained?: boolean;
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
  border,
  borderRadius = 0,
  shadow,
  minHeight = 0,
  display = "block",
  position = "static",
  overflow = "visible",
  opacity = 1,
  transform,
  hover,
  transition,
  centerWhenConstrained = true,
}: ContainerProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const effectiveBox = boxModel ?? {
    padding: typeof padding === "number" ? padding : undefined,
    margin:
      marginTop || marginBottom
        ? { top: marginTop, bottom: marginBottom }
        : undefined,
  };

  const baseStyle: React.CSSProperties = {
    ...backgroundToCSS(background),
    ...borderStyleToCSS(border),
    borderRadius,
    ...shadowToCSS(shadow),
    minHeight: minHeight || undefined,
    display: display === "block" ? undefined : display,
    position: position === "static" ? undefined : position,
    ...overflowToCSS(overflow),
    opacity,
    ...transformToCSS(transform),
    ...transitionToCSS(transition),
    ...(typeof maxWidth === "number" && maxWidth > 0 && centerWhenConstrained
      ? { maxWidth, marginLeft: "auto", marginRight: "auto" }
      : { maxWidth: maxWidth || undefined }),
    ...boxToStyle(effectiveBox.padding, "padding"),
    ...boxToStyle(effectiveBox.margin, "margin"),
  };

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      className={cn(
        "w-full",
        selected && "outline-2 outline-dashed outline-primary outline-offset-2"
      )}
      style={baseStyle}
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
    border,
    borderRadius,
    shadow,
    minHeight,
    display,
    position,
    overflow,
    opacity,
    transform,
    hover,
    transition,
    centerWhenConstrained,
  } = useNode((node) => ({
    background: node.data.props.background as ContainerProps["background"],
    padding: (node.data.props.padding as number) ?? 24,
    maxWidth: (node.data.props.maxWidth as number) ?? 0,
    marginTop: (node.data.props.marginTop as number) ?? 0,
    marginBottom: (node.data.props.marginBottom as number) ?? 0,
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as ContainerProps["boxModel"],
    border: node.data.props.border as ContainerProps["border"],
    borderRadius: (node.data.props.borderRadius as number) ?? 0,
    shadow: node.data.props.shadow as ContainerProps["shadow"],
    minHeight: (node.data.props.minHeight as number) ?? 0,
    display: (node.data.props.display as DisplayValue) ?? "block",
    position: (node.data.props.position as PositionValue) ?? "static",
    overflow: (node.data.props.overflow as OverflowValue) ?? "visible",
    opacity: (node.data.props.opacity as number) ?? 1,
    transform: node.data.props.transform as ContainerProps["transform"],
    hover: node.data.props.hover as ContainerProps["hover"],
    transition: node.data.props.transition as ContainerProps["transition"],
    centerWhenConstrained:
      (node.data.props.centerWhenConstrained as boolean) ?? true,
  })) as any;

  const [showAdvanced, setShowAdvanced] = useState(false);

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
          placeholder="my-container"
        />
      </FieldRow>

      <BackgroundField
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
        label="Padding"
        value={padding}
        min={0}
        max={200}
        step={2}
        onChange={(v) =>
          setProp((props: ContainerProps) => {
            props.padding = v;
          })
        }
      />

      <SliderField
        label="Max width"
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

      <ToggleField
        label="Auto-center when constrained"
        value={centerWhenConstrained}
        onChange={(v) =>
          setProp((props: ContainerProps) => {
            props.centerWhenConstrained = v;
          })
        }
      />

      <SliderField
        label="Min height"
        value={minHeight}
        min={0}
        max={1000}
        step={10}
        onChange={(v) =>
          setProp((props: ContainerProps) => {
            props.minHeight = v;
          })
        }
      />

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="rounded-md border border-dashed py-1 text-[10px] text-muted-foreground hover:border-foreground hover:text-foreground"
      >
        {showAdvanced ? "▾ Hide advanced" : "▸ Show advanced (border, shadow, transform, hover)"}
      </button>

      {showAdvanced && (
        <>
          <BorderField
            label="Border"
            value={border}
            onChange={(v) =>
              setProp((props: ContainerProps) => {
                props.border = v;
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
          <ShadowField
            label="Shadow"
            value={shadow}
            onChange={(v) =>
              setProp((props: ContainerProps) => {
                props.shadow = v;
              })
            }
          />
          <DisplayField
            value={display}
            onChange={(v) =>
              setProp((props: ContainerProps) => {
                props.display = v;
              })
            }
          />
          <PositionField
            value={position}
            onChange={(v) =>
              setProp((props: ContainerProps) => {
                props.position = v;
              })
            }
          />
          <OverflowField
            value={overflow}
            onChange={(v) =>
              setProp((props: ContainerProps) => {
                props.overflow = v;
              })
            }
          />
          <OpacityField
            value={opacity}
            onChange={(v) =>
              setProp((props: ContainerProps) => {
                props.opacity = v;
              })
            }
          />
          <TransformField
            value={transform}
            onChange={(v) =>
              setProp((props: ContainerProps) => {
                props.transform = v;
              })
            }
          />
          <HoverField
            value={hover}
            onChange={(v) =>
              setProp((props: ContainerProps) => {
                props.hover = v;
              })
            }
          />
          <TransitionField
            value={transition}
            onChange={(v) =>
              setProp((props: ContainerProps) => {
                props.transition = v;
              })
            }
          />
        </>
      )}
    </div>
  );
}

Container.craft = {
  displayName: "Container",
  props: {
    background: "transparent",
    padding: 24,
    maxWidth: 0,
    marginTop: 0,
    marginBottom: 0,
    customId: "",
    boxModel: undefined,
    border: undefined,
    borderRadius: 0,
    shadow: undefined,
    minHeight: 0,
    display: "block",
    position: "static",
    overflow: "visible",
    opacity: 1,
    transform: undefined,
    hover: undefined,
    transition: undefined,
    centerWhenConstrained: true,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
  related: {
    settings: ContainerSettings,
  },
};