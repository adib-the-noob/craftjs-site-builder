"use client";

import { FieldRow } from "./FieldRow";
import { ColorField } from "./ColorField";
import { SliderField } from "./SliderField";
import { SelectField } from "./SelectField";
import { FontField } from "./FontField";
import type { TextCase, TextDecoration } from "@/lib/craft-styles";

export type TypographyValue = {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  align?: "left" | "center" | "right" | "justify";
  italic?: boolean;
  textCase?: TextCase;
  textDecoration?: TextDecoration;
  maxWidth?: number;
};

export function TypographyField({
  label = "Typography",
  value,
  onChange,
}: {
  label?: string;
  value: TypographyValue | undefined;
  onChange: (next: TypographyValue) => void;
}) {
  const v: TypographyValue = value ?? {};
  const set = (patch: Partial<TypographyValue>) => onChange({ ...v, ...patch });

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-3">
      <span className="text-xs font-medium">{label}</span>

      <FontField
        label="Font family"
        value={v.fontFamily ?? ""}
        onChange={(fontFamily) => set({ fontFamily })}
      />

      <SliderField
        label="Size"
        value={v.fontSize ?? 16}
        min={8}
        max={120}
        unit="px"
        onChange={(fontSize) => set({ fontSize })}
      />

      <SliderField
        label="Weight"
        value={v.fontWeight ?? 400}
        min={100}
        max={900}
        step={100}
        unit=""
        onChange={(fontWeight) => set({ fontWeight })}
      />

      <SliderField
        label="Line height"
        value={v.lineHeight ?? 1.5}
        min={0.8}
        max={3}
        step={0.05}
        unit=""
        onChange={(lineHeight) => set({ lineHeight })}
      />

      <SliderField
        label="Letter spacing"
        value={v.letterSpacing ?? 0}
        min={-5}
        max={20}
        unit="px"
        onChange={(letterSpacing) => set({ letterSpacing })}
      />

      <SelectField
        label="Alignment"
        value={v.align ?? "left"}
        onChange={(align) => set({ align: align as TypographyValue["align"] })}
        options={[
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
          { value: "justify", label: "Justify" },
        ]}
      />

      <SelectField
        label="Case"
        value={v.textCase ?? "none"}
        onChange={(textCase) => set({ textCase: textCase as TextCase })}
        options={[
          { value: "none", label: "As written" },
          { value: "uppercase", label: "UPPERCASE" },
          { value: "lowercase", label: "lowercase" },
          { value: "capitalize", label: "Capitalize" },
        ]}
      />

      <SelectField
        label="Decoration"
        value={v.textDecoration ?? "none"}
        onChange={(textDecoration) =>
          set({ textDecoration: textDecoration as TextDecoration })
        }
        options={[
          { value: "none", label: "None" },
          { value: "underline", label: "Underline" },
          { value: "line-through", label: "Strike" },
          { value: "overline", label: "Overline" },
        ]}
      />

      <ColorField
        label="Color"
        value={v.color ?? "#0f172a"}
        onChange={(color) => set({ color })}
      />

      <SliderField
        label="Max width"
        value={v.maxWidth ?? 0}
        min={0}
        max={1200}
        step={10}
        unit="px"
        onChange={(maxWidth) => set({ maxWidth })}
      />
    </div>
  );
}