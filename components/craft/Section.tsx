"use client";

import { useNode } from "@craftjs/core";
import { useState } from "react";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import {
  BackgroundField,
  BorderField,
  BoxModelField,
  ColorField,
  DisplayField,
  HoverField,
  OpacityField,
  OverflowField,
  PositionField,
  ShadowField,
  SliderField,
  TransformField,
  TransitionField,
  boxToStyle,
  ToggleField,
  SelectField,
} from "@/components/craft/settings";
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

type SectionProps = {
  background?: BackgroundValue;
  paddingY?: number;
  maxWidth?: number;
  /** Inner content horizontal padding (px) — typically for breakpoints. */
  contentPaddingX?: number;
  customId?: string;
  children?: React.ReactNode;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
  border?: BorderValue;
  borderRadius?: number;
  shadow?: ShadowValue;
  /** Min height (useful for hero sections). */
  minHeight?: number;
  display?: DisplayValue;
  position?: PositionValue;
  overflow?: OverflowValue;
  opacity?: number;
  transform?: TransformValue;
  hover?: HoverValue;
  transition?: TransitionValue;
};

export function Section({
  background = { type: "solid", color: "#ffffff" },
  paddingY = 96,
  maxWidth = 1100,
  contentPaddingX = 24,
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

  const [hovered, setHovered] = useState(false);
  const baseStyle: React.CSSProperties = {
    ...backgroundToCSS(background),
    ...borderStyleToCSS(border),
    ...boxToStyle(effectiveBox.padding, "padding"),
    ...boxToStyle(effectiveBox.margin, "margin"),
    borderRadius,
    ...shadowToCSS(shadow),
    display: display === "block" ? undefined : display,
    position: position === "static" ? undefined : position,
    ...overflowToCSS(overflow),
    opacity,
    ...transformToCSS(transform),
    ...transitionToCSS(transition),
    minHeight: minHeight || undefined,
  };

  const hoveredStyle: React.CSSProperties = hovered ? hoverToCSS(hover) : {};

  return (
    <section
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={
        selected ? "outline-2 outline-dashed outline-primary outline-offset-2" : undefined
      }
      style={{ ...baseStyle, ...hoveredStyle }}
    >
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: maxWidth || undefined,
          paddingLeft: contentPaddingX,
          paddingRight: contentPaddingX,
        }}
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
    contentPaddingX,
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
  } = useNode((node) => ({
    background: node.data.props.background as SectionProps["background"],
    paddingY: (node.data.props.paddingY as number) ?? 96,
    maxWidth: (node.data.props.maxWidth as number) ?? 1100,
    contentPaddingX: (node.data.props.contentPaddingX as number) ?? 24,
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as SectionProps["boxModel"],
    border: node.data.props.border as SectionProps["border"],
    borderRadius: (node.data.props.borderRadius as number) ?? 0,
    shadow: node.data.props.shadow as SectionProps["shadow"],
    minHeight: (node.data.props.minHeight as number) ?? 0,
    display: (node.data.props.display as DisplayValue) ?? "block",
    position: (node.data.props.position as PositionValue) ?? "static",
    overflow: (node.data.props.overflow as OverflowValue) ?? "visible",
    opacity: (node.data.props.opacity as number) ?? 1,
    transform: node.data.props.transform as SectionProps["transform"],
    hover: node.data.props.hover as SectionProps["hover"],
    transition: node.data.props.transition as SectionProps["transition"],
  })) as any;

  const [showAdvanced, setShowAdvanced] = useState(false);

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

      <BackgroundField
        label="Background"
        value={background}
        onChange={(v) =>
          setProp((props: SectionProps) => {
            props.background = v;
          })
        }
      />

      <BoxModelField
        label="Outer spacing (margin / padding)"
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
        label="Vertical padding"
        value={paddingY}
        min={0}
        max={400}
        step={4}
        onChange={(v) =>
          setProp((props: SectionProps) => {
            props.paddingY = v;
          })
        }
      />

      <SliderField
        label="Content max width"
        value={maxWidth}
        min={480}
        max={1600}
        step={20}
        unit="px"
        onChange={(v) =>
          setProp((props: SectionProps) => {
            props.maxWidth = v;
          })
        }
      />

      <SliderField
        label="Content horizontal padding"
        value={contentPaddingX}
        min={0}
        max={120}
        step={4}
        unit="px"
        onChange={(v) =>
          setProp((props: SectionProps) => {
            props.contentPaddingX = v;
          })
        }
      />

      <SliderField
        label="Min height (hero)"
        value={minHeight}
        min={0}
        max={1000}
        step={20}
        unit="px"
        onChange={(v) =>
          setProp((props: SectionProps) => {
            props.minHeight = v;
          })
        }
      />

      <SelectField
        label="Full bleed"
        value={maxWidth === 0 ? "yes" : "no"}
        onChange={(v) =>
          setProp((props: SectionProps) => {
            props.maxWidth = v === "yes" ? 0 : 1100;
          })
        }
        options={[
          { value: "no", label: "Constrained (with max-width)" },
          { value: "yes", label: "Full bleed (edge-to-edge)" },
        ]}
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
              setProp((props: SectionProps) => {
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
              setProp((props: SectionProps) => {
                props.borderRadius = v;
              })
            }
          />
          <ShadowField
            label="Shadow"
            value={shadow}
            onChange={(v) =>
              setProp((props: SectionProps) => {
                props.shadow = v;
              })
            }
          />
          <DisplayField
            value={display}
            onChange={(v) =>
              setProp((props: SectionProps) => {
                props.display = v;
              })
            }
          />
          <PositionField
            value={position}
            onChange={(v) =>
              setProp((props: SectionProps) => {
                props.position = v;
              })
            }
          />
          <OverflowField
            value={overflow}
            onChange={(v) =>
              setProp((props: SectionProps) => {
                props.overflow = v;
              })
            }
          />
          <OpacityField
            value={opacity}
            onChange={(v) =>
              setProp((props: SectionProps) => {
                props.opacity = v;
              })
            }
          />
          <TransformField
            value={transform}
            onChange={(v) =>
              setProp((props: SectionProps) => {
                props.transform = v;
              })
            }
          />
          <HoverField
            value={hover}
            onChange={(v) =>
              setProp((props: SectionProps) => {
                props.hover = v;
              })
            }
          />
          <TransitionField
            value={transition}
            onChange={(v) =>
              setProp((props: SectionProps) => {
                props.transition = v;
              })
            }
          />
        </>
      )}
    </div>
  );
}

Section.craft = {
  displayName: "Section",
  props: {
    background: { type: "solid", color: "#ffffff" },
    paddingY: 96,
    maxWidth: 1100,
    contentPaddingX: 24,
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
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
  related: {
    settings: SectionSettings,
  },
};