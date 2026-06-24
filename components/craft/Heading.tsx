"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { FontField } from "@/components/craft/settings/FontField";
import { Input } from "@/components/ui/input";
import { ColorField } from "@/components/craft/settings/ColorField";
import { SelectField } from "@/components/craft/settings/SelectField";
import { AlignField } from "@/components/craft/settings/AlignField";
import { SliderField } from "@/components/craft/settings/SliderField";

type HeadingProps = {
  text?: string;
  level?: "h1" | "h2" | "h3" | "h4";
  color?: string;
  align?: "left" | "center" | "right";
  fontWeight?: number;
  letterSpacing?: number;
  customId?: string;
  /** CSS class name from the font registry (lib/fonts.ts). */
  fontFamily?: string;
};

const headingStyles: Record<NonNullable<HeadingProps["level"]>, string> = {
  h1: "text-6xl font-bold tracking-tight",
  h2: "text-4xl font-semibold tracking-tight",
  h3: "text-3xl font-semibold tracking-tight",
  h4: "text-2xl font-medium",
};

export function Heading({
  text = "Your heading",
  level = "h2",
  color = "#0f172a",
  align = "left",
  fontWeight = 600,
  letterSpacing = -1,
  customId = "",
  fontFamily = "",
}: HeadingProps) {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const Tag = level;

  return (
    <Tag
      ref={(ref) => {
        connect(drag(ref!));
      }}
      id={customId || undefined}
      contentEditable={selected}
      suppressContentEditableWarning
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
      style={{
        color,
        textAlign: align,
        fontWeight,
        letterSpacing,
      }}
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
    customId,
    fontFamily,
  } = useNode((node) => ({
    text: node.data.props.text as string,
    level: node.data.props.level as HeadingProps["level"],
    color: node.data.props.color as string,
    align: node.data.props.align as HeadingProps["align"],
    fontWeight: (node.data.props.fontWeight as number) ?? 600,
    letterSpacing: (node.data.props.letterSpacing as number) ?? -0.5,
    customId: (node.data.props.customId as string) ?? "",
    fontFamily: (node.data.props.fontFamily as string) ?? "",
  })) as any;

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
      <AlignField
        label="Alignment"
        value={align}
        onChange={(v) =>
          setProp((props: HeadingProps) => {
            props.align = v;
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
          setProp((props: HeadingProps) => {
            props.fontWeight = v;
          })
        }
      />
      <SliderField
        label="Letter spacing"
        value={letterSpacing}
        min={-3}
        max={10}
        unit="px"
        onChange={(v) =>
          setProp((props: HeadingProps) => {
            props.letterSpacing = v;
          })
        }
      />
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
    customId: "",
    fontFamily: "",
  },
  related: {
    settings: HeadingSettings,
  },
};