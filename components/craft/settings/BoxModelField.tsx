"use client";

import { cn } from "@/lib/utils";

/**
 * TailwindCSS-style box-model editor. Renders a 2-D diagram (margin
 * (outer) → padding (inner) → content) with four numeric inputs that
 * map to Top / Right / Bottom / Left. Accepts either a single value
 * (applied to all sides) or a per-side record.
 */

export type BoxSides = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type BoxModelValue = {
  margin?: Partial<BoxSides>;
  padding?: Partial<BoxSides>;
};

const SIDES: Array<keyof BoxSides> = ["top", "right", "bottom", "left"];

function normalise(
  v: Partial<BoxSides> | number | undefined,
  fallback: BoxSides
): BoxSides {
  if (typeof v === "number") return { top: v, right: v, bottom: v, left: v };
  return {
    top: v?.top ?? fallback.top,
    right: v?.right ?? fallback.right,
    bottom: v?.bottom ?? fallback.bottom,
    left: v?.left ?? fallback.left,
  };
}

function asPartial(sides: BoxSides): Partial<BoxSides> {
  // If all four sides are equal, emit a single number so the storage
  // stays compact and easy to read.
  if (sides.top === sides.right && sides.right === sides.bottom && sides.bottom === sides.left) {
    return { top: sides.top };
  }
  return sides;
}

type BoxModelFieldProps = {
  /** Field label, e.g. "Spacing" or "Container spacing". */
  label: string;
  value: BoxModelValue;
  onChange: (next: BoxModelValue) => void;
  /** Whether to render the visual diagram. */
  showDiagram?: boolean;
  /** Min / max bounds for the numeric inputs. */
  min?: number;
  max?: number;
  /** Whether to allow negative margins (useful for nudging). */
  allowNegative?: boolean;
};

export function BoxModelField({
  label,
  value,
  onChange,
  showDiagram = true,
  min = 0,
  max = 240,
  allowNegative = true,
}: BoxModelFieldProps) {
  const margin = normalise(value.margin, { top: 0, right: 0, bottom: 0, left: 0 });
  const padding = normalise(value.padding, { top: 0, right: 0, bottom: 0, left: 0 });

  const setMargin = (next: BoxSides) =>
    onChange({ ...value, margin: asPartial(next) });
  const setPadding = (next: BoxSides) =>
    onChange({ ...value, padding: asPartial(next) });

  const handleSide = (
    which: "margin" | "padding",
    side: keyof BoxSides,
    raw: string
  ) => {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    const clamped = Math.min(max, Math.max(allowNegative ? -200 : min, parsed));
    const current = which === "margin" ? { ...margin } : { ...padding };
    current[side] = clamped;
    if (which === "margin") setMargin(current);
    else setPadding(current);
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-2">
      <span className="text-xs font-medium">{label}</span>

      {showDiagram && (
        <div className="relative mx-auto h-24 w-full max-w-[200px] select-none rounded-md border bg-background p-2">
          {/* Margin row (top) */}
          <SideInput
            value={margin.top}
            onChange={(v) => handleSide("margin", "top", v)}
            min={min}
            max={max}
            allowNegative={allowNegative}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          <SideInput
            value={margin.left}
            onChange={(v) => handleSide("margin", "left", v)}
            min={min}
            max={max}
            allowNegative={allowNegative}
            className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2"
          />
          <SideInput
            value={margin.right}
            onChange={(v) => handleSide("margin", "right", v)}
            min={min}
            max={max}
            allowNegative={allowNegative}
            className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2"
          />
          <SideInput
            value={margin.bottom}
            onChange={(v) => handleSide("margin", "bottom", v)}
            min={min}
            max={max}
            allowNegative={allowNegative}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
          />

          {/* Padding box (inner) */}
          <div className="relative flex h-full w-full items-center justify-center rounded border border-dashed border-primary/40 bg-primary/5">
            <SideInput
              value={padding.top}
              onChange={(v) => handleSide("padding", "top", v)}
              min={min}
              max={max}
              allowNegative={allowNegative}
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
            <SideInput
              value={padding.left}
              onChange={(v) => handleSide("padding", "left", v)}
              min={min}
              max={max}
              allowNegative={allowNegative}
              className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2"
            />
            <SideInput
              value={padding.right}
              onChange={(v) => handleSide("padding", "right", v)}
              min={min}
              max={max}
              allowNegative={allowNegative}
              className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2"
            />
            <SideInput
              value={padding.bottom}
              onChange={(v) => handleSide("padding", "bottom", v)}
              min={min}
              max={max}
              allowNegative={allowNegative}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
            />
            <span className="text-[10px] font-medium text-primary/70">content</span>
          </div>
        </div>
      )}

      {/* Compact all-sides grid (no diagram). */}
      {!showDiagram && (
        <div className="grid grid-cols-2 gap-2">
          {SIDES.map((side) => (
            <label key={`m-${side}`} className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Margin {side}
              </span>
              <input
                type="number"
                value={margin[side]}
                onChange={(e) => handleSide("margin", side, e.target.value)}
                className="h-7 rounded-md border bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
              />
            </label>
          ))}
          {SIDES.map((side) => (
            <label key={`p-${side}`} className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Padding {side}
              </span>
              <input
                type="number"
                value={padding[side]}
                onChange={(e) => handleSide("padding", side, e.target.value)}
                className="h-7 rounded-md border bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function SideInput({
  value,
  onChange,
  min,
  max,
  allowNegative,
  className,
}: {
  value: number;
  onChange: (v: string) => void;
  min: number;
  max: number;
  allowNegative: boolean;
  className?: string;
}) {
  return (
    <input
      type="number"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(e.target.value)}
      onFocus={(e) => e.currentTarget.select()}
      min={allowNegative ? -200 : min}
      max={max}
      aria-label={`${value}px`}
      className={cn(
        "h-6 w-12 rounded-md border bg-background px-1 text-center text-[10px] tabular-nums outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
        className
      )}
    />
  );
}

/**
 * Standalone width/height field with auto/fit/fill modes (matching
 * TailwindCSS w-* / h-* utilities). Useful for blocks like Image,
 * Video, Spacer, etc.
 */
export type SizeFieldValue = {
  width?: number | "auto" | "fit" | "full" | "screen" | string;
  height?: number | "auto" | "fit" | "full" | "screen" | string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
};

const WIDTH_PRESETS = [
  { value: "auto", label: "auto" },
  { value: "fit", label: "fit" },
  { value: "full", label: "full" },
  { value: "screen", label: "screen" },
];

type SizeFieldProps = {
  label: string;
  value: SizeFieldValue;
  onChange: (next: SizeFieldValue) => void;
};

export function SizeField({ label, value, onChange }: SizeFieldProps) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-2">
      <span className="text-xs font-medium">{label}</span>
      <div className="grid grid-cols-2 gap-2">
        <DimensionInput
          label="Width"
          value={value.width}
          onChange={(v) => onChange({ ...value, width: v })}
          presets={WIDTH_PRESETS}
        />
        <DimensionInput
          label="Height"
          value={value.height}
          onChange={(v) => onChange({ ...value, height: v })}
          presets={WIDTH_PRESETS}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Min width
          </span>
          <input
            type="number"
            value={value.minWidth ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                minWidth: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            className="h-7 rounded-md border bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Min height
          </span>
          <input
            type="number"
            value={value.minHeight ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                minHeight: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            className="h-7 rounded-md border bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
          />
        </label>
      </div>
    </div>
  );
}

function DimensionInput({
  label,
  value,
  onChange,
  presets,
}: {
  label: string;
  value: number | string | undefined;
  onChange: (v: number | string | undefined) => void;
  presets: { value: string; label: string }[];
}) {
  const isPreset = typeof value === "string" && presets.some((p) => p.value === value);
  const numericMode = typeof value === "number";
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex gap-1">
        <input
          type={numericMode ? "number" : "text"}
          value={typeof value === "number" ? value : value ?? ""}
          placeholder="auto"
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              onChange(undefined);
            } else if (!Number.isNaN(Number(raw)) && /^-?\d+(\.\d+)?$/.test(raw)) {
              onChange(Number(raw));
            } else {
              onChange(raw);
            }
          }}
          className="h-7 w-full rounded-md border bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
        />
        <select
          aria-label={`${label} preset`}
          value={isPreset ? (value as string) : ""}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") return;
            onChange(v);
          }}
          className="h-7 rounded-md border bg-background px-1 text-xs"
        >
          <option value="">…</option>
          {presets.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/** Convert a (possibly-partial) sides record into CSS properties. */
export function boxToStyle(
  v: Partial<BoxSides> | number | undefined,
  prop: "margin" | "padding"
): React.CSSProperties {
  if (v === undefined) return {};
  if (typeof v === "number") {
    return { [prop]: v } as React.CSSProperties;
  }
  const out: Record<string, number> = {};
  if (v.top !== undefined) out[`${prop}Top`] = v.top;
  if (v.right !== undefined) out[`${prop}Right`] = v.right;
  if (v.bottom !== undefined) out[`${prop}Bottom`] = v.bottom;
  if (v.left !== undefined) out[`${prop}Left`] = v.left;
  return out as React.CSSProperties;
}

/** Convert a size value into CSS width/height strings. */
export function sizeToStyle(
  value: number | string | undefined,
  prop: "width" | "height"
): React.CSSProperties {
  if (value === undefined) return {};
  if (typeof value === "number") return { [prop]: value } as React.CSSProperties;
  return { [prop]: value } as React.CSSProperties;
}