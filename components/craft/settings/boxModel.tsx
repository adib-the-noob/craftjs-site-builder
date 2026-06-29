"use client";

import { useMemo } from "react";
import { useCraftProps, useCraftSetProp } from "./useCraftNode";
import {
  BoxModelField,
  type BoxModelValue,
} from "./BoxModelField";

/**
 * Shared shape for any craft component that historically had a single
 * `padding` (and optional `marginTop`/`marginBottom`) number prop
 * and was upgraded to a Tailwind-style box-model editor.
 *
 *   Card     — padding only
 *   Grid     — padding only
 *   Container — padding + marginTop + marginBottom
 */
export type LegacyBoxProps = {
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  boxModel?: BoxModelValue;
};

/** Resolve the *effective* box model, falling back to legacy props. */
export function resolveBoxModel(
  legacy: LegacyBoxProps,
  options?: { includeMargin?: boolean }
): BoxModelValue {
  const includeMargin = options?.includeMargin ?? false;
  const hasLegacyMargin =
    typeof legacy.marginTop === "number" || typeof legacy.marginBottom === "number";
  if (legacy.boxModel) {
    // If margin is supported but legacy margin props are still set,
    // merge them so older serialized trees render correctly.
    if (includeMargin && hasLegacyMargin && !legacy.boxModel.margin) {
      return {
        ...legacy.boxModel,
        margin: {
          top: legacy.marginTop ?? 0,
          bottom: legacy.marginBottom ?? 0,
        },
      };
    }
    return legacy.boxModel;
  }
  const out: BoxModelValue = {};
  if (typeof legacy.padding === "number") {
    out.padding = legacy.padding;
  }
  if (includeMargin && hasLegacyMargin) {
    out.margin = {
      top: legacy.marginTop ?? 0,
      bottom: legacy.marginBottom ?? 0,
    };
  }
  return out;
}

/**
 * Settings UI for a craft component's box model.
 *
 * Mirrors the chosen value back into legacy props so older saved
 * trees still deserialize correctly. This used to be duplicated
 * inline in Card, Grid, and Container settings panels.
 */
export function BoxModelSettings<T extends LegacyBoxProps>(props: {
  label?: string;
  /** When true, also sync `marginTop`/`marginBottom` legacy props. */
  includeMargin?: boolean;
  /** Optional override of the value used when neither boxModel nor legacy are set. */
  fallback?: BoxModelValue;
}) {
  const setProp = useCraftSetProp<T>();
  const { boxModel, padding, marginTop, marginBottom } = useCraftProps<T>(
    (node) =>
      ({
        boxModel: node.data.props.boxModel as BoxModelValue | undefined,
        padding: node.data.props.padding as number | undefined,
        marginTop: node.data.props.marginTop as number | undefined,
        marginBottom: node.data.props.marginBottom as number | undefined,
      } as Partial<T>)
  );

  const current = useMemo<BoxModelValue>(
    () => boxModel ?? props.fallback ?? resolveBoxModel(
      { padding, marginTop, marginBottom } as LegacyBoxProps,
      { includeMargin: props.includeMargin }
    ),
    [boxModel, padding, marginTop, marginBottom, props.fallback, props.includeMargin]
  );

  return (
    <BoxModelField
      label={props.label ?? "Spacing (margin / padding)"}
      value={current}
      onChange={(next) =>
        setProp((p: any) => {
          p.boxModel = next;
          // Mirror back into legacy props for backward-compat reads.
          if (next.padding && typeof next.padding === "number") {
            p.padding = next.padding;
          } else if (next.padding && typeof next.padding === "object") {
            p.padding = next.padding.top ?? 0;
          } else {
            p.padding = 0;
          }
          if (props.includeMargin) {
            if (next.margin && typeof next.margin === "number") {
              p.marginTop = next.margin;
              p.marginBottom = next.margin;
            } else if (next.margin && typeof next.margin === "object") {
              p.marginTop = next.margin.top ?? 0;
              p.marginBottom = next.margin.bottom ?? 0;
            } else {
              p.marginTop = 0;
              p.marginBottom = 0;
            }
          }
        })
      }
    />
  );
}