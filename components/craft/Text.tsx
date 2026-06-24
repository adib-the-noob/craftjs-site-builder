"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { FontField } from "@/components/craft/settings/FontField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ColorField } from "@/components/craft/settings/ColorField";
import { SliderField } from "@/components/craft/settings/SliderField";
import { SelectField } from "@/components/craft/settings/SelectField";
import { AlignField } from "@/components/craft/settings/AlignField";
import { ToggleField } from "@/components/craft/settings/ToggleField";
import { BoxModelField, boxToStyle } from "@/components/craft/settings/BoxModelField";

type TextProps = {
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  color?: string;
  align?: "left" | "center" | "right" | "justify";
  italic?: boolean;
  customId?: string;
  /** CSS class name from the font registry (lib/fonts.ts). */
  fontFamily?: string;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
};

export function Text({
  text = "Edit this text",
  fontSize = 17,
  fontWeight = 400,
  lineHeight = 1.7,
  color = "#374151",
  align = "left",
  italic = false,
  customId = "",
  fontFamily = "",
  boxModel,
}: TextProps) {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  return (
    <p
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      contentEditable={selected}
      suppressContentEditableWarning
      onBlur={(e) =>
        setProp((props: TextProps) => {
          props.text = e.currentTarget.innerText;
        })
      }
      className={cn(
        "max-w-none whitespace-pre-wrap outline-none",
        fontFamily,
        selected && "ring-2 ring-primary/40 ring-offset-2",
        italic && "italic"
      )}
      style={{
        fontSize,
        fontWeight,
        lineHeight,
        color,
        textAlign: align,
        ...boxToStyle(boxModel?.padding, "padding"),
        ...boxToStyle(boxModel?.margin, "margin"),
      }}
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
    color,
    align,
    italic,
    customId,
    fontFamily,
    boxModel,
  } = useNode((node) => ({
    text: node.data.props.text as string,
    fontSize: node.data.props.fontSize as number,
    fontWeight: (node.data.props.fontWeight as number) ?? 400,
    lineHeight: (node.data.props.lineHeight as number) ?? 1.6,
    color: node.data.props.color as string,
    align: node.data.props.align as TextProps["align"],
    italic: (node.data.props.italic as boolean) ?? false,
    customId: (node.data.props.customId as string) ?? "",
    fontFamily: (node.data.props.fontFamily as string) ?? "",
    boxModel: node.data.props.boxModel as TextProps["boxModel"],
  })) as any;

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
      <ToggleField
        label="Italic"
        value={italic}
        onChange={(v) =>
          setProp((props: TextProps) => {
            props.italic = v;
          })
        }
      />
      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: TextProps) => {
            props.boxModel = v;
          })
        }
      />
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
    color: "#374151",
    align: "left",
    italic: false,
    customId: "",
    fontFamily: "",
    boxModel: undefined,
  },
  related: {
    settings: TextSettings,
  },
};