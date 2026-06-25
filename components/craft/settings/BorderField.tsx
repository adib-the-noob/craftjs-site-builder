"use client";

import { FieldRow } from "./FieldRow";
import { ColorField } from "./ColorField";
import { SliderField } from "./SliderField";
import { SelectField } from "./SelectField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { BorderValue } from "@/lib/craft-styles";

type BorderFieldProps = {
  label?: string;
  value: BorderValue | undefined;
  onChange: (next: BorderValue) => void;
  /** When true, includes the per-side width inputs. */
  perSide?: boolean;
};

const BORDER_STYLES = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
  { value: "double", label: "Double" },
  { value: "none", label: "None" },
];

export function BorderField({
  label = "Border",
  value,
  onChange,
  perSide = false,
}: BorderFieldProps) {
  const v: BorderValue = value ?? {};
  const set = (patch: Partial<BorderValue>) => onChange({ ...v, ...patch });

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{label}</span>
        <button
          type="button"
          onClick={() => set({ width: v.width ? 0 : 1, style: "solid", color: v.color ?? "#e5e7eb" })}
          className="text-[10px] text-muted-foreground underline hover:text-foreground"
        >
          {v.width ? "Remove border" : "Add border"}
        </button>
      </div>

      <SliderField
        label="Width"
        value={v.width ?? 0}
        min={0}
        max={20}
        unit="px"
        onChange={(width) => set({ width })}
      />

      <SelectField
        label="Style"
        value={v.style ?? "solid"}
        onChange={(style) => set({ style: style as BorderValue["style"] })}
        options={BORDER_STYLES}
      />

      <ColorField
        label="Color"
        value={v.color ?? "#e5e7eb"}
        onChange={(color) => set({ color })}
      />

      <SliderField
        label="Radius"
        value={v.radius ?? 0}
        min={0}
        max={64}
        unit="px"
        onChange={(radius) => set({ radius })}
      />

      {perSide && (
        <div className="grid grid-cols-2 gap-2">
          <SideInput
            label="Top"
            value={v.sides?.top}
            onChange={(top) => set({ sides: { ...(v.sides ?? {}), top } })}
          />
          <SideInput
            label="Right"
            value={v.sides?.right}
            onChange={(right) => set({ sides: { ...(v.sides ?? {}), right } })}
          />
          <SideInput
            label="Bottom"
            value={v.sides?.bottom}
            onChange={(bottom) => set({ sides: { ...(v.sides ?? {}), bottom } })}
          />
          <SideInput
            label="Left"
            value={v.sides?.left}
            onChange={(left) => set({ sides: { ...(v.sides ?? {}), left } })}
          />
        </div>
      )}
    </div>
  );
}

function SideInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <Input
        type="number"
        value={value ?? ""}
        placeholder="—"
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") onChange(undefined);
          else {
            const n = Number(raw);
            if (Number.isFinite(n)) onChange(n);
          }
        }}
        className="h-7 px-2 text-xs"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Compact variant — width / style / color only, used in tight settings.    */
/* -------------------------------------------------------------------------- */

export function BorderFieldCompact({
  value,
  onChange,
}: {
  value: BorderValue | undefined;
  onChange: (next: BorderValue) => void;
}) {
  const v: BorderValue = value ?? {};
  return (
    <div className={cn("flex items-center gap-2")}>
      <input
        type="number"
        value={v.width ?? 0}
        onChange={(e) => onChange({ ...v, width: Number(e.target.value) })}
        className="h-7 w-14 rounded-md border bg-background px-2 text-xs"
        placeholder="0"
      />
      <select
        value={v.style ?? "solid"}
        onChange={(e) => onChange({ ...v, style: e.target.value as BorderValue["style"] })}
        className="h-7 rounded-md border bg-background px-1 text-xs"
      >
        {BORDER_STYLES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <input
        type="color"
        value={v.color ?? "#e5e7eb"}
        onChange={(e) => onChange({ ...v, color: e.target.value })}
        className="h-7 w-10 cursor-pointer rounded-md border bg-background"
      />
      <input
        type="number"
        value={v.radius ?? 0}
        onChange={(e) => onChange({ ...v, radius: Number(e.target.value) })}
        className="h-7 w-14 rounded-md border bg-background px-2 text-xs"
        placeholder="0"
        title="Radius"
      />
    </div>
  );
}
