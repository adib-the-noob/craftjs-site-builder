"use client";

import { FieldRow } from "./FieldRow";
import { SelectField } from "./SelectField";
import { SliderField } from "./SliderField";
import { DISPLAY_OPTIONS, DisplayValue, PositionValue, POSITION_OPTIONS, OverflowValue } from "@/lib/craft-styles";

export function DisplayField({
  value,
  onChange,
}: {
  value: DisplayValue | undefined;
  onChange: (next: DisplayValue) => void;
}) {
  return (
    <SelectField
      label="Display"
      value={value ?? "block"}
      onChange={(v) => onChange(v as DisplayValue)}
      options={DISPLAY_OPTIONS}
    />
  );
}

export function PositionField({
  value,
  onChange,
}: {
  value: PositionValue | undefined;
  onChange: (next: PositionValue) => void;
}) {
  return (
    <SelectField
      label="Position"
      value={value ?? "static"}
      onChange={(v) => onChange(v as PositionValue)}
      options={POSITION_OPTIONS}
    />
  );
}

export function OverflowField({
  value,
  onChange,
}: {
  value: OverflowValue | { x?: OverflowValue; y?: OverflowValue } | undefined;
  onChange: (next: OverflowValue) => void;
}) {
  return (
    <SelectField
      label="Overflow"
      value={
        typeof value === "string" ? value : (value?.x ?? value?.y ?? "visible")
      }
      onChange={(v) => onChange(v as OverflowValue)}
      options={[
        { value: "visible", label: "Visible" },
        { value: "hidden", label: "Hidden" },
        { value: "scroll", label: "Scroll" },
        { value: "auto", label: "Auto" },
        { value: "clip", label: "Clip" },
      ]}
    />
  );
}

export function OpacityField({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (next: number) => void;
}) {
  return (
    <SliderField
      label="Opacity"
      value={Math.round((value ?? 1) * 100)}
      min={0}
      max={100}
      unit="%"
      onChange={(v) => onChange(v / 100)}
    />
  );
}