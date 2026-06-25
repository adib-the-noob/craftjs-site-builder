"use client";

import { FieldRow } from "./FieldRow";
import { ColorField } from "./ColorField";
import { SliderField } from "./SliderField";
import { SelectField } from "./SelectField";
import type { ShadowValue } from "@/lib/craft-styles";

type ShadowFieldProps = {
  label?: string;
  value: ShadowValue | undefined;
  onChange: (next: ShadowValue) => void;
};

const PRESETS = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
  { value: "2xl", label: "2XL" },
];

export function ShadowField({
  label = "Shadow",
  value,
  onChange,
}: ShadowFieldProps) {
  const v: ShadowValue = value ?? {};
  const set = (patch: Partial<ShadowValue>) => onChange({ ...v, ...patch });

  // If a preset is active, hide the manual sliders to avoid confusion.
  const usingPreset = !!v.preset;

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{label}</span>
        <button
          type="button"
          onClick={() => set(v.preset ? {} : { preset: "md" })}
          className="text-[10px] text-muted-foreground underline hover:text-foreground"
        >
          {v.preset ? "Edit manually" : "Use preset"}
        </button>
      </div>

      {usingPreset ? (
        <SelectField
          label="Preset"
          value={v.preset ?? "md"}
          onChange={(preset) => set({ preset: preset as ShadowValue["preset"] })}
          options={PRESETS}
        />
      ) : (
        <>
          <SliderField
            label="Offset X"
            value={v.offsetX ?? 0}
            min={-50}
            max={50}
            unit="px"
            onChange={(offsetX) => set({ offsetX })}
          />
          <SliderField
            label="Offset Y"
            value={v.offsetY ?? 4}
            min={-50}
            max={50}
            unit="px"
            onChange={(offsetY) => set({ offsetY })}
          />
          <SliderField
            label="Blur"
            value={v.blur ?? 12}
            min={0}
            max={100}
            unit="px"
            onChange={(blur) => set({ blur })}
          />
          <SliderField
            label="Spread"
            value={v.spread ?? 0}
            min={-20}
            max={40}
            unit="px"
            onChange={(spread) => set({ spread })}
          />
          <ColorField
            label="Color"
            value={v.color ?? "rgba(0,0,0,0.1)"}
            onChange={(color) => set({ color })}
          />
        </>
      )}

      <ShadowPreview value={v} />
    </div>
  );
}

function ShadowPreview({ value }: { value: ShadowValue }) {
  let css = "none";
  if (value.preset) {
    if (value.preset === "none") css = "none";
    else if (value.preset === "sm") css = "0 1px 2px 0 rgba(0,0,0,0.05)";
    else if (value.preset === "md")
      css = "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)";
    else if (value.preset === "lg")
      css = "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)";
    else if (value.preset === "xl")
      css = "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)";
    else if (value.preset === "2xl")
      css = "0 25px 50px -12px rgba(0,0,0,0.25)";
  } else {
    const x = value.offsetX ?? 0;
    const y = value.offsetY ?? 4;
    const blur = value.blur ?? 12;
    const spread = value.spread ?? 0;
    const color = value.color ?? "rgba(0,0,0,0.1)";
    css = `${x}px ${y}px ${blur}px ${spread}px ${color}`;
  }
  return (
    <div className="flex h-16 items-center justify-center rounded-md bg-muted/30">
      <div
        className="h-8 w-24 rounded-md bg-background"
        style={{ boxShadow: css }}
      />
    </div>
  );
}
