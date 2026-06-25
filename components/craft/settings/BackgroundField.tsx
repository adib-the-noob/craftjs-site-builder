"use client";

import { FieldRow } from "./FieldRow";
import { ColorField } from "./ColorField";
import { SliderField } from "./SliderField";
import { SelectField } from "./SelectField";
import { Input } from "@/components/ui/input";
import type { BackgroundValue, GradientStop } from "@/lib/craft-styles";

type BackgroundFieldProps = {
  label?: string;
  value: BackgroundValue | undefined;
  onChange: (next: BackgroundValue) => void;
};

const TYPES = [
  { value: "solid", label: "Solid color" },
  { value: "gradient", label: "Gradient" },
  { value: "image", label: "Image" },
];

const SIZES = [
  { value: "cover", label: "Cover" },
  { value: "contain", label: "Contain" },
  { value: "auto", label: "Auto" },
];

const REPEATS = [
  { value: "no-repeat", label: "No repeat" },
  { value: "repeat", label: "Tile" },
  { value: "repeat-x", label: "Horizontal" },
  { value: "repeat-y", label: "Vertical" },
];

export function BackgroundField({
  label = "Background",
  value,
  onChange,
}: BackgroundFieldProps) {
  // Normalise legacy: if value is a string, treat it as a solid color.
  const obj: Exclude<BackgroundValue, string> =
    typeof value === "string"
      ? { type: "solid", color: value === "transparent" ? undefined : value }
      : (value ?? {});
  const set = (patch: Partial<typeof obj>) => onChange({ ...obj, ...patch });

  const type = obj.type ?? (obj.color ? "solid" : obj.gradient ? "gradient" : obj.image?.url ? "image" : "solid");

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-3">
      <span className="text-xs font-medium">{label}</span>

      <SelectField
        label="Type"
        value={type}
        onChange={(t) => set({ type: t as "solid" | "gradient" | "image" })}
        options={TYPES}
      />

      {type === "solid" && (
        <ColorField
          label="Color"
          value={obj.color ?? "#ffffff"}
          onChange={(color) => set({ color })}
        />
      )}

      {type === "gradient" && (
        <>
          <SliderField
            label="Angle"
            value={obj.gradient?.angle ?? 180}
            min={0}
            max={360}
            unit="°"
            onChange={(angle) =>
              set({ gradient: { ...(obj.gradient ?? {}), angle } })
            }
          />
          <FieldRow label="Color stops">
            <GradientStopsEditor
              stops={obj.gradient?.stops ?? [
                { color: "#6366f1", position: 0 },
                { color: "#ec4899", position: 100 },
              ]}
              onChange={(stops) =>
                set({ gradient: { ...(obj.gradient ?? {}), stops } })
              }
            />
          </FieldRow>
        </>
      )}

      {type === "image" && (
        <>
          <FieldRow label="Image URL">
            <Input
              value={obj.image?.url ?? ""}
              onChange={(e) =>
                set({ image: { ...(obj.image ?? {}), url: e.target.value } })
              }
              placeholder="https://images.unsplash.com/…"
            />
          </FieldRow>
          <SelectField
            label="Size"
            value={obj.image?.size ?? "cover"}
            onChange={(size) =>
              set({
                image: {
                  ...(obj.image ?? {}),
                  size: size as "cover" | "contain" | "auto",
                },
              })
            }
            options={SIZES}
          />
          <SelectField
            label="Repeat"
            value={obj.image?.repeat ?? "no-repeat"}
            onChange={(repeat) =>
              set({
                image: {
                  ...(obj.image ?? {}),
                  repeat: repeat as "no-repeat" | "repeat" | "repeat-x" | "repeat-y",
                },
              })
            }
            options={REPEATS}
          />
          <FieldRow label="Position (CSS)">
            <Input
              value={obj.image?.position ?? "center center"}
              onChange={(e) =>
                set({ image: { ...(obj.image ?? {}), position: e.target.value } })
              }
              placeholder="center center"
            />
          </FieldRow>
          <FieldRow label="Overlay color (optional)">
            <Input
              value={obj.overlay ?? ""}
              onChange={(e) => set({ overlay: e.target.value })}
              placeholder="rgba(0,0,0,0.4)"
            />
          </FieldRow>
        </>
      )}

      <BackgroundPreview value={obj as BackgroundValue} />
    </div>
  );
}

function GradientStopsEditor({
  stops,
  onChange,
}: {
  stops: GradientStop[];
  onChange: (stops: GradientStop[]) => void;
}) {
  const update = (i: number, patch: Partial<GradientStop>) => {
    const next = stops.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    onChange(next);
  };
  const add = () =>
    onChange([...stops, { color: "#000000", position: 50 }]);
  const remove = (i: number) => onChange(stops.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-2">
      {stops.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="color"
            value={s.color}
            onChange={(e) => update(i, { color: e.target.value })}
            className="h-7 w-10 cursor-pointer rounded-md border"
          />
          <input
            type="number"
            value={s.position}
            onChange={(e) =>
              update(i, { position: Math.max(0, Math.min(100, Number(e.target.value))) })
            }
            className="h-7 w-16 rounded-md border bg-background px-2 text-xs"
            min={0}
            max={100}
          />
          <span className="text-[10px] text-muted-foreground">%</span>
          {stops.length > 2 && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="ml-auto text-[10px] text-muted-foreground hover:text-destructive"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      {stops.length < 6 && (
        <button
          type="button"
          onClick={add}
          className="rounded-md border border-dashed py-1 text-[10px] text-muted-foreground hover:border-foreground hover:text-foreground"
        >
          + Add stop
        </button>
      )}
    </div>
  );
}

function BackgroundPreview({ value }: { value: BackgroundValue }) {
  let css = "transparent";
  if (typeof value === "string") css = value;
  else if (value.type === "gradient" && value.gradient) {
    const angle = value.gradient.angle ?? 180;
    const stops =
      value.gradient.stops && value.gradient.stops.length > 0
        ? value.gradient.stops
            .map((s) => `${s.color} ${s.position}%`)
            .join(", ")
        : "#000 0%, #fff 100%";
    css = `linear-gradient(${angle}deg, ${stops})`;
  } else if (value.type === "image" && value.image?.url) {
    css = `url('${value.image.url}') center/cover no-repeat`;
  } else if (value.color) css = value.color;

  return (
    <div className="flex h-16 items-center justify-center rounded-md bg-muted/30 p-2">
      <div
        className="h-12 w-full rounded-md border"
        style={{ background: css }}
      />
    </div>
  );
}