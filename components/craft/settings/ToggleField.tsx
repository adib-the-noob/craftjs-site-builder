"use client";

import { FieldRow } from "./FieldRow";
import { cn } from "@/lib/utils";

type ToggleFieldProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export function ToggleField({ label, value, onChange }: ToggleFieldProps) {
  return (
    <FieldRow label={label}>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          value ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-background shadow-sm transition-transform",
            value ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </FieldRow>
  );
}