"use client";

import { useNode } from "@craftjs/core";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { FontField } from "@/components/craft/settings/FontField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BoxModelField,
  ColorField,
  HoverField,
  OpacityField,
  SelectField,
  ShadowField,
  SliderField,
  ToggleField,
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

type TextProps = {
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  align?: "left" | "center" | "right" | "justify";
  italic?: boolean;
  bold?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  textCase?: TextCase;
  textDecoration?: TextDecoration;
  /** Max width to constrain long paragraphs (improves readability). */
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

export function Text({
  text = "Edit this text",
  fontSize = 17,
  fontWeight = 400,
  lineHeight = 1.7,
  letterSpacing = 0,
  color = "#374151",
  align = "left",
  italic = false,
  bold = false,
  underline = false,
  strikethrough = false,
  textCase = "none",
  textDecoration,
  maxWidth = 0,
  customId = "",
  fontFamily = "",
  boxModel,
  shadow,
  transform,
  hover,
  transition,
  opacity = 1,
}: TextProps) {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const [hovered, setHovered] = useState(false);

  const resolvedDecoration: TextDecoration =
    textDecoration ??
    (underline
      ? "underline"
      : strikethrough
        ? "line-through"
        : "none");

  const baseStyle: React.CSSProperties = {
    fontSize,
    fontWeight: bold ? Math.max(fontWeight, 700) : fontWeight,
    lineHeight,
    letterSpacing,
    color,
    textAlign: align,
    maxWidth: maxWidth || undefined,
    opacity,
    ...boxToStyle(boxModel?.padding, "padding"),
    ...boxToStyle(boxModel?.margin, "margin"),
    ...shadowToCSS(shadow),
    ...transformToCSS(transform),
    ...transitionToCSS(transition),
    ...textCaseToCSS(textCase),
    ...textDecorationToCSS(resolvedDecoration),
  };

  const hoverStyle: React.CSSProperties = hovered ? hoverToCSS(hover) : {};

  return (
    <p
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      contentEditable={selected}
      suppressContentEditableWarning
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onBlur={(e) =>
        setProp((props: TextProps) => {
          props.text = e.currentTarget.innerText;
        })
      }
      className={cn(
        "whitespace-pre-wrap outline-none",
        fontFamily,
        selected && "ring-2 ring-primary/40 ring-offset-2",
        italic && "italic"
      )}
      style={{ ...baseStyle, ...hoverStyle }}
    >
      {text}
    </p>
  );
}

function TextSettings() {
  const {
    actions: { setProp },
    text,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    color,
    align,
    italic,
    bold,
    underline,
    strikethrough,
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
    text: (node.data.props.text as string) ?? "Edit this text",
    fontSize: (node.data.props.fontSize as number) ?? 17,
    fontWeight: (node.data.props.fontWeight as number) ?? 400,
    lineHeight: (node.data.props.lineHeight as number) ?? 1.7,
    letterSpacing: (node.data.props.letterSpacing as number) ?? 0,
    color: (node.data.props.color as string) ?? "#374151",
    align: node.data.props.align as TextProps["align"],
    italic: (node.data.props.italic as boolean) ?? false,
    bold: (node.data.props.bold as boolean) ?? false,
    underline: (node.data.props.underline as boolean) ?? false,
    strikethrough: (node.data.props.strikethrough as boolean) ?? false,
    textCase: (node.data.props.textCase as TextCase) ?? "none",
    textDecoration: node.data.props.textDecoration as TextDecoration | undefined,
    maxWidth: (node.data.props.maxWidth as number) ?? 0,
    customId: (node.data.props.customId as string) ?? "",
    fontFamily: (node.data.props.fontFamily as string) ?? "",
    boxModel: node.data.props.boxModel as TextProps["boxModel"],
    shadow: node.data.props.shadow as TextProps["shadow"],
    transform: node.data.props.transform as TextProps["transform"],
    hover: node.data.props.hover as TextProps["hover"],
    transition: node.data.props.transition as TextProps["transition"],
    opacity: (node.data.props.opacity as number) ?? 1,
  })) as any;

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: TextProps) => {
              props.customId = e.target.value;
            })
          }
          placeholder="my-paragraph"
        />
      </FieldRow>
      <FieldRow label="Content">
        <Textarea
          value={text}
          rows={5}
          onChange={(e) =>
            setProp((props: TextProps) => {
              props.text = e.target.value;
            })
          }
        />
      </FieldRow>
      <FontField
        label="Font"
        value={fontFamily}
        onChange={(v) =>
          setProp((props: TextProps) => {
            props.fontFamily = v;
          })
        }
      />
      <SliderField
        label="Font size"
        value={fontSize}
        min={10}
        max={72}
        onChange={(v) =>
          setProp((props: TextProps) => {
            props.fontSize = v;
          })
        }
      />
      <SliderField
        label="Font weight"
        value={fontWeight}
        min={100}
        max={900}
        step={100}
        unit=""
        onChange={(v) =>
          setProp((props: TextProps) => {
            props.fontWeight = v;
          })
        }
      />
      <SliderField
        label="Line height"
        value={lineHeight}
        min={1}
        max={2.5}
        step={0.1}
        unit="x"
        onChange={(v) =>
          setProp((props: TextProps) => {
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
          setProp((props: TextProps) => {
            props.letterSpacing = v;
          })
        }
      />
      <ColorField
        label="Color"
        value={color}
        onChange={(v) =>
          setProp((props: TextProps) => {
            props.color = v;
          })
        }
      />
      <SelectField
        label="Alignment"
        value={align}
        onChange={(v) =>
          setProp((props: TextProps) => {
            props.align = v as TextProps["align"];
          })
        }
        options={[
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
          { value: "justify", label: "Justify" },
        ]}
      />
      <div className="flex gap-2">
        <ToggleField label="Bold" value={bold} onChange={(v) =>
          setProp((props: TextProps) => { props.bold = v; })
        } />
        <ToggleField label="Italic" value={italic} onChange={(v) =>
          setProp((props: TextProps) => { props.italic = v; })
        } />
      </div>
      <div className="flex gap-2">
        <ToggleField label="Underline" value={underline} onChange={(v) =>
          setProp((props: TextProps) => { props.underline = v; })
        } />
        <ToggleField label="Strike" value={strikethrough} onChange={(v) =>
          setProp((props: TextProps) => { props.strikethrough = v; })
        } />
      </div>
      <SelectField
        label="Text case"
        value={textCase}
        onChange={(v) =>
          setProp((props: TextProps) => { props.textCase = v as TextCase; })
        }
        options={[
          { value: "none", label: "As written" },
          { value: "uppercase", label: "UPPERCASE" },
          { value: "lowercase", label: "lowercase" },
          { value: "capitalize", label: "Capitalize" },
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
          setProp((props: TextProps) => { props.maxWidth = v; })
        }
      />
      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: TextProps) => { props.boxModel = v; })
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
              setProp((props: TextProps) => { props.shadow = v; })
            }
          />
          <TransformField
            value={transform}
            onChange={(v) =>
              setProp((props: TextProps) => { props.transform = v; })
            }
          />
          <HoverField
            value={hover}
            onChange={(v) =>
              setProp((props: TextProps) => { props.hover = v; })
            }
          />
          <TransitionField
            value={transition}
            onChange={(v) =>
              setProp((props: TextProps) => { props.transition = v; })
            }
          />
          <OpacityField
            value={opacity}
            onChange={(v) =>
              setProp((props: TextProps) => { props.opacity = v; })
            }
          />
        </>
      )}
    </div>
  );
}

Text.craft = {
  displayName: "Text",
  props: {
    text: "Edit this text",
    fontSize: 17,
    fontWeight: 400,
    lineHeight: 1.7,
    letterSpacing: 0,
    color: "#374151",
    align: "left",
    italic: false,
    bold: false,
    underline: false,
    strikethrough: false,
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
    settings: TextSettings,
  },
};