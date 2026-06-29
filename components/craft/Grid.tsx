"use client";

import React, { memo, useMemo } from "react";
import { Element, useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { ColorField } from "@/components/craft/settings/ColorField";
import { SliderField } from "@/components/craft/settings/SliderField";
import { ToggleField } from "@/components/craft/settings/ToggleField";
import { SelectField } from "@/components/craft/settings/SelectField";
import { SizeField, sizeToStyle } from "@/components/craft/settings/BoxModelField";
import {
  BoxModelSettings,
  resolveBoxModel,
} from "@/components/craft/settings/boxModel";
import { useCraftSelected } from "@/components/craft/settings/useCraftNode";
import { boxToStyle } from "@/components/craft/settings/BoxModelField";
import { Container } from "./Container";
import { sanitizeCustomId } from "@/lib/themeTokens";
import { CustomIdField } from "@/components/craft/settings/CustomIdField";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Responsive column counts, in increasing breakpoint order. */
export type ResponsiveColumns = {
  base: number;   // < 640px
  sm?: number;    // >= 640px
  md?: number;    // >= 768px
  lg?: number;    // >= 1024px
  xl?: number;    // >= 1280px
  "2xl"?: number; // >= 1536px
};

export type GridAlign =
  | "stretch"
  | "start"
  | "center"
  | "end"
  | "baseline";
export type GridJustify =
  | "stretch"
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";
export type GridFlow = "row" | "col" | "dense" | "row-dense" | "col-dense";
export type GridSemantic = "div" | "section" | "ul" | "ol" | "nav";

type GridProps = {
  /** Column count (legacy). Used as `base` when `responsive` isn't set. */
  columns?: number;
  /** Gap in px (legacy). Used when `gaps` isn't set. */
  gap?: number;
  /** Background. */
  background?: string;
  /** Border colour (omit to inherit Tailwind `border-border`). */
  borderColor?: string;
  /** Border width in px. 0 hides the border. */
  borderWidth?: number;
  /** Corner radius. */
  borderRadius?: number;
  /** Legacy padding — used when `boxModel` isn't set. */
  padding?: number;
  /** Independent row/column gap. Overrides `gap` when set. */
  gaps?: { row?: number; column?: number };
  /** Per-breakpoint column counts. Overrides `columns` when set. */
  responsive?: ResponsiveColumns;
  /** Cell alignment (`align-items`). */
  alignItems?: GridAlign;
  /** Cell justification (`justify-items`). */
  justifyItems?: GridAlign;
  /** Track auto-flow. */
  flow?: GridFlow;
  /** Auto-fit / fill with min track size. e.g. `minmax(220px, 1fr)`. */
  autoMin?: number;
  /** Width/height. */
  size?: { width?: number | string; height?: number | string };
  /** Render as semantic element. */
  as?: GridSemantic;
  /** HTML id. */
  customId?: string;
  /** Tailwind-style box model. */
  boxModel?: import("@/components/craft/settings/BoxModelField").BoxModelValue;
  /** Extra Tailwind classes. */
  classes?: string;
  children?: React.ReactNode;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BREAKPOINTS: Array<keyof ResponsiveColumns> = [
  "base",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
];

const BP_TAILWIND_PREFIX: Partial<Record<keyof ResponsiveColumns, string>> = {
  base: "",
  sm: "sm:",
  md: "md:",
  lg: "lg:",
  xl: "xl:",
  "2xl": "2xl:",
};

function clampColumns(n: number | undefined | null): number {
  return Math.max(1, Math.min(12, Math.floor(Number(n) || 1)));
}

function columnsForBreakpoint(
  responsive: ResponsiveColumns | undefined,
  legacy: number | undefined
): ResponsiveColumns {
  if (responsive) return responsive;
  const base = clampColumns(legacy ?? 3);
  return { base };
}

/**
 * Build Tailwind `grid-cols-{n}` classes covering every breakpoint
 * that has an explicit value. Skipped breakpoints inherit the
 * previous one so the cascade works correctly.
 */
function buildColClasses(responsive: ResponsiveColumns): string {
  let last = clampColumns(responsive.base);
  const parts: string[] = ["grid"];
  // base
  parts.push(`grid-cols-${last}`);
  for (const bp of BREAKPOINTS.slice(1)) {
    const v = responsive[bp];
    if (typeof v === "number") {
      last = clampColumns(v);
      parts.push(`${BP_TAILWIND_PREFIX[bp]}grid-cols-${last}`);
    } else {
      // Inherit from previous breakpoint so the cascade doesn't reset.
      parts.push(`${BP_TAILWIND_PREFIX[bp]}grid-cols-${last}`);
    }
  }
  return parts.join(" ");
}

function buildAutoFitClasses(autoMin: number | undefined, responsive: ResponsiveColumns): string {
  if (!autoMin || autoMin <= 0) return "";
  // For Tailwind we can't express arbitrary grid-template-columns at runtime
  // via classes, so we fall back to inline style for the auto-fit case.
  return "";
}

const ALIGN_ITEMS: Record<GridAlign, string> = {
  stretch: "items-stretch",
  start: "items-start",
  center: "items-center",
  end: "items-end",
  baseline: "items-baseline",
};

const JUSTIFY_ITEMS: Record<GridJustify, string> = {
  stretch: "justify-items-stretch",
  start: "justify-items-start",
  center: "justify-items-center",
  end: "justify-items-end",
  between: "justify-items-between",
  around: "justify-items-around",
  evenly: "justify-items-evenly",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function GridComponent(props: GridProps) {
  const {
    columns = 3,
    gap = 24,
    background = "transparent",
    borderColor = "",
    borderWidth = 0,
    borderRadius = 0,
    padding = 0,
    gaps,
    responsive,
    alignItems = "stretch",
    justifyItems,
    flow = "row",
    autoMin,
    size,
    as = "div",
    customId = "",
    boxModel,
    classes = "",
    children,
  } = props;

  const selected = useCraftSelected();
  const {
    connectors: { connect, drag },
    nodes,
  } = useNode((node) => ({ nodes: node.data.nodes ?? [] }));

  const effectiveBox = useMemo(
    () => resolveBoxModel({ padding, boxModel }),
    [padding, boxModel]
  );

  const responsiveCols = useMemo(
    () => columnsForBreakpoint(responsive, columns),
    [responsive, columns]
  );

  // Compute the total slot count we'll render. For auto-fit we expose
  // up to `maxColumns` slots (12); users can leave extras empty.
  const slotCount = useMemo(() => {
    if (autoMin && autoMin > 0) {
      // Auto-fit: render slots for the largest configured breakpoint,
      // but at least 1. We'll let the grid CSS handle auto-fit and the
      // extras stay empty in the DOM but hidden visually.
      const max = Math.max(...BREAKPOINTS.map((bp) => responsiveCols[bp] ?? 0));
      return Math.max(1, clampColumns(max || responsiveCols.base));
    }
    return clampColumns(responsiveCols.base);
  }, [autoMin, responsiveCols]);

  // Preserve user content across column-count changes.
  // - existing linked nodes (from the user) are rendered in the order
  //   they appear in the `nodes` array.
  // - we fill the rest with empty Container slots so the grid always
  //   has N cells to lay out.
  const userNodeIds = useMemo(
    () =>
      ((nodes as unknown) as Array<{ id: string; linkedNode?: string }>)
        .map((n) => n.linkedNode)
        .filter((id): id is string => Boolean(id)),
    [nodes]
  );

  const filledSlots = Math.max(slotCount, userNodeIds.length);

  const tagClasses = cn(
    buildColClasses(responsiveCols),
    ALIGN_ITEMS[alignItems],
    justifyItems ? JUSTIFY_ITEMS[justifyItems as GridJustify] : "",
    // Default behaviour: fill the grid container.
    "w-full",
    !borderColor && borderWidth > 0 && "border",
    !borderColor && borderWidth > 0 && "border-border",
    selected && "ring-2 ring-primary/40 ring-offset-2",
    classes
  );

  const inlineStyle: React.CSSProperties = {
    background,
    borderRadius,
    borderColor: borderColor || undefined,
    borderWidth: borderWidth > 0 ? borderWidth : undefined,
    borderStyle: borderWidth > 0 ? "solid" : undefined,
    ...sizeToStyle(size?.width, "width"),
    ...sizeToStyle(size?.height, "height"),
    ...boxToStyle(effectiveBox.padding, "padding"),
    ...boxToStyle(effectiveBox.margin, "margin"),
  };

  // If autoMin is set we override gridTemplateColumns with auto-fit.
  if (autoMin && autoMin > 0) {
    inlineStyle.gridTemplateColumns = `repeat(auto-fit, minmax(${autoMin}px, 1fr))`;
  } else {
    // Independent row/column gap via inline style.
    if (gaps) {
      if (typeof gaps.row === "number") inlineStyle.rowGap = `${gaps.row}px`;
      if (typeof gaps.column === "number")
        inlineStyle.columnGap = `${gaps.column}px`;
    } else {
      inlineStyle.gap = `${gap}px`;
    }
    if (flow) {
      inlineStyle.gridAutoFlow =
        flow === "row"
          ? "row"
          : flow === "col"
          ? "column"
          : flow === "dense"
          ? "row dense"
          : flow === "row-dense"
          ? "row dense"
          : "column dense";
    }
  }

  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={(ref: any) => {
        if (ref && typeof ref === "object") connect(drag(ref));
      }}
      id={sanitizeCustomId(customId) || undefined}
      className={tagClasses}
      style={inlineStyle}
    >
      {/* Render up to `filledSlots` cells. User-moved content lives in
          the slots that were originally dragged in; the rest are empty
          Containers that the user can drop new content into. */}
      {Array.from({ length: filledSlots }, (_, i) => (
        <Element
          key={`cell-${i}`}
          canvas
          id={`cell-${i}`}
          is={Container}
        />
      ))}
      {children}
    </Tag>
  );
}

export const Grid = memo(GridComponent);

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

function GridSettings() {
  const {
    actions: { setProp },
    columns,
    gap,
    background,
    borderColor,
    borderWidth,
    padding,
    borderRadius,
    gaps,
    responsive,
    alignItems,
    justifyItems,
    flow,
    autoMin,
    size,
    as,
    customId,
    boxModel,
    classes,
  } = useNode((node) => ({
    columns: node.data.props.columns as number,
    gap: node.data.props.gap as number,
    background: node.data.props.background as string,
    borderColor: (node.data.props.borderColor as string) ?? "",
    borderWidth: (node.data.props.borderWidth as number) ?? 0,
    padding: node.data.props.padding as number,
    borderRadius: (node.data.props.borderRadius as number) ?? 0,
    gaps: node.data.props.gaps as GridProps["gaps"],
    responsive: node.data.props.responsive as GridProps["responsive"],
    alignItems: (node.data.props.alignItems as GridAlign) ?? "stretch",
    justifyItems: node.data.props.justifyItems as GridAlign | undefined,
    flow: (node.data.props.flow as GridFlow) ?? "row",
    autoMin: node.data.props.autoMin as number | undefined,
    size: node.data.props.size as GridProps["size"],
    as: (node.data.props.as as GridSemantic) ?? "div",
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as GridProps["boxModel"],
    classes: (node.data.props.classes as string) ?? "",
  })) as any;

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <CustomIdField
          value={customId}
          onChange={(v) =>
            setProp((props: GridProps) => {
              props.customId = v;
            })
          }
          placeholder="grid-1"
          label=""
        />
      </FieldRow>

      <div className="rounded-md border border-border p-2">
        <div className="mb-2 text-xs font-medium">Responsive columns</div>
        <div className="grid grid-cols-2 gap-2">
          {BREAKPOINTS.map((bp) => {
            const value =
              responsive?.[bp] ?? (bp === "base" ? columns ?? 3 : undefined);
            return (
              <SliderField
                key={bp}
                label={`Columns @ ${bp}`}
                value={value ?? 0}
                min={0}
                max={12}
                step={1}
                unit={value ? "" : " (inherit)"}
                onChange={(v) => {
                  setProp((props: GridProps) => {
                    if (bp === "base") {
                      // base is also the legacy `columns` field.
                      props.columns = v;
                    }
                    const prev = (props.responsive ?? {}) as ResponsiveColumns;
                    const next: ResponsiveColumns = { ...prev } as ResponsiveColumns;
                    (next as any)[bp] = v;
                    if (bp === "base") {
                      (next as any).base = v;
                    }
                    props.responsive = next;
                  });
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="rounded-md border border-border p-2">
        <div className="mb-2 text-xs font-medium">Gap</div>
        <div className="grid grid-cols-2 gap-2">
          <SliderField
            label="Row gap"
            value={gaps?.row ?? gap ?? 24}
            min={0}
            max={96}
            step={4}
            onChange={(v) =>
              setProp((props: GridProps) => {
                props.gaps = { ...(props.gaps ?? {}), row: v };
                props.gap = v;
              })
            }
          />
          <SliderField
            label="Column gap"
            value={gaps?.column ?? gap ?? 24}
            min={0}
            max={96}
            step={4}
            onChange={(v) =>
              setProp((props: GridProps) => {
                props.gaps = { ...(props.gaps ?? {}), column: v };
              })
            }
          />
        </div>
      </div>

      <SliderField
        label="Auto-fit min (0 = fixed columns)"
        value={autoMin ?? 0}
        min={0}
        max={480}
        step={20}
        unit="px"
        onChange={(v) =>
          setProp((props: GridProps) => {
            props.autoMin = v > 0 ? v : undefined;
          })
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Align items"
          value={alignItems}
          onChange={(v) =>
            setProp((props: GridProps) => {
              props.alignItems = v as GridAlign;
            })
          }
          options={[
            { value: "stretch", label: "Stretch" },
            { value: "start", label: "Start" },
            { value: "center", label: "Center" },
            { value: "end", label: "End" },
            { value: "baseline", label: "Baseline" },
          ]}
        />
        <SelectField
          label="Flow"
          value={flow}
          onChange={(v) =>
            setProp((props: GridProps) => {
              props.flow = v as GridFlow;
            })
          }
          options={[
            { value: "row", label: "Row" },
            { value: "col", label: "Column" },
            { value: "dense", label: "Row dense" },
            { value: "col-dense", label: "Column dense" },
          ]}
        />
      </div>

      <SelectField
        label="Justify items"
        value={justifyItems ?? "stretch"}
        onChange={(v) =>
          setProp((props: GridProps) => {
            props.justifyItems = (v === "stretch" ? undefined : (v as GridAlign));
          })
        }
        options={[
          { value: "stretch", label: "Stretch" },
          { value: "start", label: "Start" },
          { value: "center", label: "Center" },
          { value: "end", label: "End" },
        ]}
      />

      <ColorField
        label="Background"
        value={background}
        onChange={(v) =>
          setProp((props: GridProps) => {
            props.background = v;
          })
        }
      />
      <ColorField
        label="Border colour"
        value={borderColor || "#e5e7eb"}
        onChange={(v) =>
          setProp((props: GridProps) => {
            props.borderColor = v;
          })
        }
      />

      <BoxModelSettings<GridProps> />

      <SizeField
        label="Grid size"
        value={size ?? { width: undefined, height: undefined }}
        onChange={(v) =>
          setProp((props: GridProps) => {
            props.size = v;
          })
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <SliderField
          label="Border width"
          value={borderWidth}
          min={0}
          max={8}
          onChange={(v) =>
            setProp((props: GridProps) => {
              props.borderWidth = v;
            })
          }
        />
        <SliderField
          label="Border radius"
          value={borderRadius}
          min={0}
          max={64}
          onChange={(v) =>
            setProp((props: GridProps) => {
              props.borderRadius = v;
            })
          }
        />
      </div>

      <SelectField
        label="Render as"
        value={as}
        onChange={(v) =>
          setProp((props: GridProps) => {
            props.as = v as GridSemantic;
          })
        }
        options={[
          { value: "div", label: "div" },
          { value: "section", label: "section" },
          { value: "ul", label: "ul" },
          { value: "ol", label: "ol" },
          { value: "nav", label: "nav" },
        ]}
      />

      <FieldRow label="Extra Tailwind classes">
        <Input
          value={classes}
          onChange={(e) =>
            setProp((props: GridProps) => {
              props.classes = e.target.value;
            })
          }
          placeholder="e.g. container mx-auto"
        />
      </FieldRow>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Craft metadata
// ---------------------------------------------------------------------------

(Grid as any).craft = {
  displayName: "Grid",
  props: {
    columns: 3,
    gap: 24,
    background: "transparent",
    borderColor: "",
    borderWidth: 0,
    borderRadius: 0,
    padding: 0,
    gaps: undefined,
    responsive: undefined,
    alignItems: "stretch" as GridAlign,
    justifyItems: undefined,
    flow: "row" as GridFlow,
    autoMin: undefined,
    size: undefined,
    as: "div" as GridSemantic,
    customId: "",
    boxModel: undefined,
    classes: "",
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
  related: {
    settings: GridSettings,
  },
};