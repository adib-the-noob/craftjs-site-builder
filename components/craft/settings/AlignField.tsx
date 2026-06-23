"use client";

import { FieldRow } from "./FieldRow";
import { cn } from "@/lib/utils";

type AlignValue = "left" | "center" | "right";

type AlignFieldProps = {
  label: string;
  value: string | undefined;
  onChange: (value: AlignValue) => void;
};

function coerce(v: string | undefined): AlignValue {
  if (v === "left" || v === "center" || v === "right") return v;
  return "left";
}

export function AlignField({ label, value, onChange }: AlignFieldProps) {
  const current = coerce(value);
  const options: AlignValue[] = ["left", "center", "right"];
  return (
    <FieldRow label={label}>
      <div className="grid grid-cols-3 gap-1 rounded-md border bg-muted/40 p-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-sm px-2 py-1 text-xs font-medium capitalize transition-colors",
              current === opt
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </FieldRow>
  );
}