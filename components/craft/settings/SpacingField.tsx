"use client";

import { FieldRow } from "./FieldRow";
import { Input } from "@/components/ui/input";

type SpacingFieldProps = {
  label: string;
  value: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  onChange: (value: SpacingFieldProps["value"]) => void;
  max?: number;
};

export function SpacingField({
  label,
  value,
  onChange,
  max = 200,
}: SpacingFieldProps) {
  const set = (key: keyof SpacingFieldProps["value"], raw: string) => {
    const num = Math.max(0, Math.min(max, Number(raw) || 0));
    onChange({ ...value, [key]: num });
  };

  return (
    <FieldRow label={label}>
      <div className="grid grid-cols-2 gap-2">
        <SpacingInput
          label="Top"
          value={value.top}
          onChange={(v) => set("top", v)}
        />
        <SpacingInput
          label="Right"
          value={value.right}
          onChange={(v) => set("right", v)}
        />
        <SpacingInput
          label="Bottom"
          value={value.bottom}
          onChange={(v) => set("bottom", v)}
        />
        <SpacingInput
          label="Left"
          value={value.left}
          onChange={(v) => set("left", v)}
        />
      </div>
    </FieldRow>
  );
}

function SpacingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input
        type="number"
        value={value}
        min={0}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}