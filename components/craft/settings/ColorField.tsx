"use client";

import { Input } from "@/components/ui/input";
import { FieldRow } from "./FieldRow";

type ColorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <FieldRow label={label}>
      <div className="flex gap-2">
        <input
          type="color"
          value={normalizeColor(value)}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-background"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
        />
      </div>
    </FieldRow>
  );
}

function normalizeColor(value: string): string {
  if (!value) return "#000000";
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return value;
  return "#000000";
}