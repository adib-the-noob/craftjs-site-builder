"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EDITOR_FONTS } from "@/lib/fonts";
import { FieldRow } from "./FieldRow";
import { cn } from "@/lib/utils";

type FontFieldProps = {
  label: string;
  /** Class name of the currently selected font (e.g. "ef-inter"). */
  value: string | undefined;
  onChange: (className: string) => void;
};

/**
 * Font picker for craft node settings. Backed by the font registry in
 * `lib/fonts.ts`; the actual CSS variables + classes are loaded by
 * `EditorFontsProvider` so the picker matches what the canvas shows.
 */
export function FontField({ label, value, onChange }: FontFieldProps) {
  // Fall back to the registry default (Geist) when nothing is selected so
  // an empty select isn't shown to the user.
  const current = EDITOR_FONTS.find((f) => f.className === value);

  return (
    <FieldRow label={label}>
      <Select
        value={current?.className ?? EDITOR_FONTS[0].className}
        onValueChange={(v) => onChange(v ?? "")}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {EDITOR_FONTS.map((font) => (
              <SelectItem
                key={font.className}
                value={font.className}
                className={cn(font.className)}
              >
                {font.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </FieldRow>
  );
}