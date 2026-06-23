"use client";

import { FieldRow } from "./FieldRow";

type SliderFieldProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
};

export function SliderField({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = "px",
  onChange,
}: SliderFieldProps) {
  return (
    <FieldRow label={`${label} (${value}${unit})`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 w-full cursor-pointer accent-primary"
      />
    </FieldRow>
  );
}