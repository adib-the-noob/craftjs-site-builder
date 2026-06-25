"use client";

import { FieldRow } from "./FieldRow";
import { SliderField } from "./SliderField";
import { SelectField } from "./SelectField";
import { ToggleField } from "./ToggleField";
import type {
  HoverValue,
  TransformValue,
  TransitionValue,
} from "@/lib/craft-styles";

/* -------------------------------------------------------------------------- */
/* Hover field                                                                */
/* -------------------------------------------------------------------------- */

export function HoverField({
  value,
  onChange,
}: {
  value: HoverValue | undefined;
  onChange: (next: HoverValue) => void;
}) {
  const v: HoverValue = value ?? {};
  const set = (patch: Partial<HoverValue>) => onChange({ ...v, ...patch });

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-3">
      <span className="text-xs font-medium">Hover effects</span>

      <ColorFieldRow
        label="Background"
        value={typeof v.background === "string" ? v.background : v.background?.color ?? ""}
        onChange={(color) =>
          set({ background: color ? { type: "solid", color } : undefined })
        }
      />

      <ColorFieldRow
        label="Text color"
        value={v.color ?? ""}
        onChange={(color) => set({ color: color || undefined })}
      />

      <ColorFieldRow
        label="Border color"
        value={v.borderColor ?? ""}
        onChange={(color) => set({ borderColor: color || undefined })}
      />

      <SliderField
        label="Lift (translateY)"
        value={v.translateY ?? 0}
        min={-20}
        max={20}
        unit="px"
        onChange={(translateY) => set({ translateY })}
      />

      <SliderField
        label="Scale"
        value={(v.scale ?? 1) * 100}
        min={50}
        max={150}
        unit="%"
        onChange={(scale) => set({ scale: scale / 100 })}
      />

      <SliderField
        label="Opacity"
        value={(v.opacity ?? 1) * 100}
        min={0}
        max={100}
        unit="%"
        onChange={(opacity) => set({ opacity: opacity / 100 })}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Transform field                                                            */
/* -------------------------------------------------------------------------- */

export function TransformField({
  value,
  onChange,
}: {
  value: TransformValue | undefined;
  onChange: (next: TransformValue) => void;
}) {
  const v: TransformValue = value ?? {};
  const set = (patch: Partial<TransformValue>) => onChange({ ...v, ...patch });

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-3">
      <span className="text-xs font-medium">Transform</span>
      <SliderField
        label="Rotate"
        value={v.rotate ?? 0}
        min={-180}
        max={180}
        unit="°"
        onChange={(rotate) => set({ rotate })}
      />
      <SliderField
        label="Scale X"
        value={(v.scaleX ?? 1) * 100}
        min={0}
        max={200}
        unit="%"
        onChange={(scaleX) => set({ scaleX: scaleX / 100 })}
      />
      <SliderField
        label="Scale Y"
        value={(v.scaleY ?? 1) * 100}
        min={0}
        max={200}
        unit="%"
        onChange={(scaleY) => set({ scaleY: scaleY / 100 })}
      />
      <SliderField
        label="Translate X"
        value={v.translateX ?? 0}
        min={-200}
        max={200}
        unit="px"
        onChange={(translateX) => set({ translateX })}
      />
      <SliderField
        label="Translate Y"
        value={v.translateY ?? 0}
        min={-200}
        max={200}
        unit="px"
        onChange={(translateY) => set({ translateY })}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Transition field                                                           */
/* -------------------------------------------------------------------------- */

export function TransitionField({
  value,
  onChange,
}: {
  value: TransitionValue | undefined;
  onChange: (next: TransitionValue) => void;
}) {
  const v: TransitionValue = value ?? {};
  const set = (patch: Partial<TransitionValue>) => onChange({ ...v, ...patch });

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-3">
      <span className="text-xs font-medium">Transition</span>
      <SliderField
        label="Duration"
        value={v.duration ?? 200}
        min={0}
        max={2000}
        step={50}
        unit="ms"
        onChange={(duration) => set({ duration })}
      />
      <SelectField
        label="Easing"
        value={v.easing ?? "ease"}
        onChange={(easing) => set({ easing: easing as TransitionValue["easing"] })}
        options={[
          { value: "linear", label: "Linear" },
          { value: "ease", label: "Ease" },
          { value: "ease-in", label: "Ease in" },
          { value: "ease-out", label: "Ease out" },
          { value: "ease-in-out", label: "Ease in-out" },
        ]}
      />
      <SliderField
        label="Delay"
        value={v.delay ?? 0}
        min={0}
        max={2000}
        step={50}
        unit="ms"
        onChange={(delay) => set({ delay })}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable color row (inline color + hex + alpha)                          */
/* -------------------------------------------------------------------------- */

function ColorFieldRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <FieldRow label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={normaliseColor(value)}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-10 cursor-pointer rounded-md border bg-background"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="transparent"
          className="h-7 w-full rounded-md border bg-background px-2 text-xs"
        />
      </div>
    </FieldRow>
  );
}

function normaliseColor(c: string): string {
  // <input type="color"> requires a 6-digit hex. If we have rgba or empty,
  // fall back to a sensible default so the picker still works.
  if (!c) return "#000000";
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c)) {
    return c.length === 4
      ? "#" + c.slice(1).split("").map((ch) => ch + ch).join("")
      : c;
  }
  return "#000000";
}