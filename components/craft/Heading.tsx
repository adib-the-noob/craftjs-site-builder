"use client";

import { useNode } from "@craftjs/core";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { FontField } from "@/components/craft/settings/FontField";
import { Input } from "@/components/ui/input";
import {
  BoxModelField,
  ColorField,
  HoverField,
  OpacityField,
  SelectField,
  ShadowField,
  SliderField,
  TransformField,
  TransitionField,
  boxToStyle,
} from "@/components/craft/settings";
import {
  hoverToCSS,
  shadowToCSS,
  textCaseToCSS,
  textDecorationToCSS,
  transformToCSS,
  transitionToCSS,
  type HoverValue,
  type ShadowValue,
  type TextCase,
  type TextDecoration,
  type TransformValue,
  type TransitionValue,
} from "@/lib/craft-styles";

type HeadingProps = {
  text?: string;
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  color?: string;
  align?: "left" | "center" | "right" | "justify";
  fontWeight?: number;
  letterSpacing?: number;
  lineHeight?: number;
  fontSize?: number;
  italic?: boolean;
  textCase?: TextCase;
  textDecoration?: TextDecoration;
  /** Max width to constrain long headings (improves readability). */
  maxWidth?: number;
  customId?: string;
  /** CSS class name from the font registry (lib/fonts.ts). */
  fontFamily?: string;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
  shadow?: ShadowValue;
  transform?: TransformValue;
  hover?: HoverValue;
  transition?: TransitionValue;
  opacity?: number;
};

const headingStyles: Record<
  NonNullable<HeadingProps["level"]>,
  string
> = {
  h1: "text-6xl font-bold tracking-tight",
  h2: "text-4xl font-semibold tracking-tight",
  h3: "text-3xl font-semibold tracking-tight",
  h4: "text-2xl font-medium",
  h5: "text-xl font-medium",
  h6: "text-lg font-medium uppercase tracking-wider",
};

export function Heading({
  text = "Your heading",
  level = "h2",
  color = "#0f172a",
  align = "left",
  fontWeight = 600,
  letterSpacing = -1,
  lineHeight = 1.2,
  fontSize,
  italic = false,
  textCase = "none",
  textDecoration = "none",
  maxWidth = 0,
  customId = "",
  fontFamily = "",
  boxModel,
  shadow,
  transform,
  hover,
  transition,
  opacity = 1,
}: HeadingProps) {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const Tag = level;
  const [hovered, setHovered] = useState(false);

  const baseStyle: React.CSSProperties = {
    color,
    fontWeight,
    letterSpacing,
    lineHeight,
    fontSize,
    textAlign: align,
    fontStyle: italic ? "italic" : undefined,
    maxWidth: maxWidth || undefined,
    opacity,
    ...boxToStyle(boxModel?.padding, "padding"),
    ...boxToStyle(boxModel?.margin, "margin"),
    ...shadowToCSS(shadow),
    ...transformToCSS(transform),
    ...transitionToCSS(transition),
    ...textCaseToCSS(textCase),
    ...textDecorationToCSS(textDecoration),
  };

  const hoverStyle: React.CSSProperties = hovered ? hoverToCSS(hover) : {};

  return (
    <Tag
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      contentEditable={selected}
      suppressContentEditableWarning
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onBlur={(e) =>
        setProp((props: HeadingProps) => {
          props.text = e.currentTarget.innerText;
        })
      }
      className={cn(
        headingStyles[level],
        "outline-none",
        fontFamily,
        selected && "ring-2 ring-primary/40 ring-offset-2"
      )}
      style={{ ...baseStyle, ...hoverStyle }}
    >
      {text}
    </Tag>
  );
}

function HeadingSettings() {
  const {
    actions: { setProp },
    text,
    level,
    color,
    align,
    fontWeight,
    letterSpacing,
    lineHeight,
    fontSize,
    italic,
    textCase,
    textDecoration,
    maxWidth,
    customId,
    fontFamily,
    boxModel,
    shadow,
    transform,
    hover,
    transition,
    opacity,
  } = useNode((node) => ({
    text: (node.data.props.text as string) ?? "Your heading",
    level: node.data.props.level as HeadingProps["level"],
    color: (node.data.props.color as string) ?? "#0f172a",
    align: node.data.props.align as HeadingProps["align"],
    fontWeight: (node.data.props.fontWeight as number) ?? 600,
    letterSpacing: (node.data.props.letterSpacing as number) ?? -0.5,
    lineHeight: (node.data.props.lineHeight as number) ?? 1.2,
    fontSize: node.data.props.fontSize as number | undefined,
    italic: (node.data.props.italic as boolean) ?? false,
    textCase: (node.data.props.textCase as TextCase) ?? "none",
    textDecoration: (node.data.props.textDecoration as TextDecoration) ?? "none",
    maxWidth: (node.data.props.maxWidth as number) ?? 0,
    customId: (node.data.props.customId as string) ?? "",
    fontFamily: (node.data.props.fontFamily as string) ?? "",
    boxModel: node.data.props.boxModel as HeadingProps["boxModel"],
    shadow: node.data.props.shadow as HeadingProps["shadow"],
    transform: node.data.props.transform as HeadingProps["transform"],
    hover: node.data.props.hover as HeadingProps["hover"],
    transition: node.data.props.transition as HeadingProps["transition"],
    opacity: (node.data.props.opacity as number) ?? 1,
  })) as any;

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: HeadingProps) => {
              props.customId = e.target.value;
            })
          }
          placeholder="my-heading"
        />
      </FieldRow>
      <FieldRow label="Content">
        <Input
          value={text}
          onChange={(e) =>
            setProp((props: HeadingProps) => {
              props.text = e.target.value;
            })
          }
        />
      </FieldRow>
      <SelectField
        label="Level"
        value={level}
        onChange={(v) =>
          setProp((props: HeadingProps) => {
            props.level = v as HeadingProps["level"];
          })
        }
        options={[
          { value: "h1", label: "Heading 1" },
          { value: "h2", label: "Heading 2" },
          { value: "h3", label: "Heading 3" },
          { value: "h4", label: "Heading 4" },
          { value: "h5", label: "Heading 5" },
          { value: "h6", label: "Heading 6" },
        ]}
      />
      <FontField
        label="Font"
        value={fontFamily}
        onChange={(v) =>
          setProp((props: HeadingProps) => {
            props.fontFamily = v;
          })
        }
      />
      <ColorField
        label="Color"
        value={color}
        onChange={(v) =>
          setProp((props: HeadingProps) => {
            props.color = v;
          })
        }
      />
      <SelectField
        label="Alignment"
        value={align}
        onChange={(v) =>
          setProp((props: HeadingProps) => {
            props.align = v as HeadingProps["align"];
          })
        }
        options={[
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
          { value: "justify", label: "Justify" },
        ]}
      />
      <SliderField
        label="Font weight"
        value={fontWeight}
        min={100}
        max={900}
        step={100}
        unit=""
        onChange={(v) =>
          setProp((props: HeadingProps) => {
            props.fontWeight = v;
          })
        }
      />
      <SliderField
        label="Font size (override)"
        value={fontSize ?? 0}
        min={0}
        max={120}
        step={1}
        unit="px"
        onChange={(v) =>
          setProp((props: HeadingProps) => {
            props.fontSize = v === 0 ? undefined : v;
          })
        }
      />
      <SliderField
        label="Line height"
        value={lineHeight}
        min={0.8}
        max={3}
        step={0.05}
        unit=""
        onChange={(v) =>
          setProp((props: HeadingProps) => {
            props.lineHeight = v;
          })
        }
      />
      <SliderField
        label="Letter spacing"
        value={letterSpacing}
        min={-3}
        max={20}
        unit="px"
        onChange={(v) =>
          setProp((props: HeadingProps) => {
            props.letterSpacing = v;
          })
        }
      />
      <SelectField
        label="Text case"
        value={textCase}
        onChange={(v) =>
          setProp((props: HeadingProps) => {
            props.textCase = v as TextCase;
          })
        }
        options={[
          { value: "none", label: "As written" },
          { value: "uppercase", label: "UPPERCASE" },
          { value: "lowercase", label: "lowercase" },
          { value: "capitalize", label: "Capitalize" },
        ]}
      />
      <SelectField
        label="Decoration"
        value={textDecoration}
        onChange={(v) =>
          setProp((props: HeadingProps) => {
            props.textDecoration = v as TextDecoration;
          })
        }
        options={[
          { value: "none", label: "None" },
          { value: "underline", label: "Underline" },
          { value: "line-through", label: "Strike" },
          { value: "overline", label: "Overline" },
        ]}
      />
      <SliderField
        label="Max width"
        value={maxWidth}
        min={0}
        max={1200}
        step={10}
        unit="px"
        onChange={(v) =>
          setProp((props: HeadingProps) => {
            props.maxWidth = v;
          })
        }
      />
      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: HeadingProps) => {
            props.boxModel = v;
          })
        }
      />

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="rounded-md border border-dashed py-1 text-[10px] text-muted-foreground hover:border-foreground hover:text-foreground"
      >
        {showAdvanced ? "▾ Hide advanced" : "▸ Show advanced (shadow, transform, hover)"}
      </button>

      {showAdvanced && (
        <>
          <ShadowField
            label="Text shadow"
            value={shadow}
            onChange={(v) =>
              setProp((props: HeadingProps) => {
                props.shadow = v;
              })
            }
          />
          <TransformField
            value={transform}
            onChange={(v) =>
              setProp((props: HeadingProps) => {
                props.transform = v;
              })
            }
          />
          <HoverField
            value={hover}
            onChange={(v) =>
              setProp((props: HeadingProps) => {
                props.hover = v;
              })
            }
          />
          <TransitionField
            value={transition}
            onChange={(v) =>
              setProp((props: HeadingProps) => {
                props.transition = v;
              })
            }
          />
          <OpacityField
            value={opacity}
            onChange={(v) =>
              setProp((props: HeadingProps) => {
                props.opacity = v;
              })
            }
          />
        </>
      )}
    </div>
  );
}

Heading.craft = {
  displayName: "Heading",
  props: {
    text: "Your heading",
    level: "h2",
    color: "#0f172a",
    align: "left",
    fontWeight: 600,
    letterSpacing: -1,
    lineHeight: 1.2,
    fontSize: undefined,
    italic: false,
    textCase: "none",
    textDecoration: "none",
    maxWidth: 0,
    customId: "",
    fontFamily: "",
    boxModel: undefined,
    shadow: undefined,
    transform: undefined,
    hover: undefined,
    transition: undefined,
    opacity: 1,
  },
  related: {
    settings: HeadingSettings,
  },
};