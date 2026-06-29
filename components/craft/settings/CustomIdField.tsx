"use client";

import { useMemo } from "react";
import { useEditor } from "@craftjs/core";
import { Input } from "@/components/ui/input";
import { FieldRow } from "./FieldRow";
import {
  sanitizeCustomId,
  CUSTOM_ID_PATTERN,
} from "@/lib/themeTokens";
import { cn } from "@/lib/utils";

type CustomIdFieldProps = {
  label?: string;
  value: string | undefined;
  onChange: (next: string) => void;
  placeholder?: string;
};

/**
 * Craft-side field for the `customId` prop.
 *
 * - Sanitises input to a valid HTML id (lowercase, dash-separated).
 * - Detects collisions against the rest of the live tree.
 * - Renders a small inline status (✓ ok / ⚠ invalid / ⨯ duplicate).
 */
export function CustomIdField({
  label,
  value,
  onChange,
  placeholder,
}: CustomIdFieldProps) {
  const { query } = useEditor();

  const { sanitised, status, message } = useMemo(() => {
    const cleaned = sanitizeCustomId(value ?? "");
    if (!cleaned) {
      return { sanitised: "", status: "neutral" as const, message: "" };
    }
    if (!CUSTOM_ID_PATTERN.test(cleaned)) {
      return {
        sanitised: cleaned,
        status: "invalid" as const,
        message: "Must start with a letter and use letters, numbers, dashes.",
      };
    }
    // Collision check: query every node, find one with the same customId.
    const dupe = findDuplicateId(query, cleaned);
    if (dupe) {
      return {
        sanitised: cleaned,
        status: "duplicate" as const,
        message: `Already used by another element on this page.`,
      };
    }
    return {
      sanitised: cleaned,
      status: "ok" as const,
      message: "Anchor target looks good.",
    };
  }, [value, query]);

  const handleChange = (raw: string) => {
    // Always store the raw text in the editor so the user sees their
    // typing in real time. Sanitisation happens at render time and the
    // `id` attribute applied to the DOM element uses `sanitised`.
    onChange(raw);
  };

  return (
    <FieldRow label={label}>
      <div className="flex flex-col gap-1">
        <Input
          value={value ?? ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder ?? "anchor-id"}
          className={cn(
            status === "duplicate" && "border-destructive",
            status === "invalid" && "border-yellow-500"
          )}
        />
        {message && (
          <span
            className={cn(
              "text-[10px]",
              status === "duplicate" && "text-destructive",
              status === "invalid" && "text-yellow-600",
              status === "ok" && "text-muted-foreground"
            )}
          >
            {status === "duplicate" && "⨯ "}
            {status === "invalid" && "⚠ "}
            {status === "ok" && "✓ "}
            {message}
          </span>
        )}
      </div>
    </FieldRow>
  );
}

function findDuplicateId(query: any, id: string): string | null {
  try {
    const all = query.getState().nodes ?? {};
    for (const nodeId of Object.keys(all)) {
      const props = all[nodeId]?.data?.props;
      if (props?.customId && sanitizeCustomId(props.customId) === id) {
        return nodeId;
      }
    }
  } catch {
    // query not available outside an editor context — treat as no dupe.
  }
  return null;
}