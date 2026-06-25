"use client";

import { useNode, Element } from "@craftjs/core";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { SliderField, SelectField, ToggleField, BackgroundField, BorderField, BoxModelField, boxToStyle } from "@/components/craft/settings";
import type { BackgroundValue, BorderValue } from "@/lib/craft-styles";

type GridProps = {
  /** Column count (1–12). */
  columns?: number;
  /** Gap between rows AND columns (px). */
  gap?: number;
  /** Per-column track sizing — when set, overrides `columns` for the template. */
  columnWidths?: string;
  /** Min height per row (px). 0 = auto. */
  minRowHeight?: number;
  /** Background of the grid container. */
  background?: BackgroundValue;
  /** Padding inside the grid container. */
  padding?: number;
  /** Outer spacing. */
  boxModel?: { margin?: any; padding?: any };
  /** Border around the entire grid. */
  border?: BorderValue;
  /** Whether to alternate row backgrounds (zebra). */
  zebra?: boolean;
  /** Whether to allow content to overflow columns. */
  overflow?: "visible" | "hidden";
  customId?: string;
  children?: React.ReactNode;
};

export function Grid({
  columns = 3,
  gap = 16,
  columnWidths,
  minRowHeight = 0,
  background,
  padding = 0,
  boxModel,
  border,
  zebra = false,
  overflow = "visible",
  customId = "",
  children,
}: GridProps) {
  const {
    id,
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    id: node.id,
    selected: node.events.selected,
  })) as any;

  const effectiveBox = boxModel ?? {
    padding: typeof padding === "number" ? padding : undefined,
  };

  // Ensure exactly `columns` child canvases exist so columns render predictably.
  // Each <Element> needs an `id` slot name so Craft.js can map it onto
  // `parent.data.linkedNodes[col-N]` when a saved tree is rehydrated —
  // otherwise the runtime invariant "A <Element /> that is used inside a
  // User Component must specify an `id` prop" fires, and even if it didn't
  // the columns wouldn't round-trip through save/load.
  //
  // Multi-child-per-column: each `col-N` slot is a regular Craft.js canvas,
  // so it accepts ANY number of children. They stack vertically because the
  // column wrapper below uses flex-column flow. This means you can place, e.g.,
  // 3 Cards in a single column by either:
  //   (a) dragging a Card into `col-0` three times in the editor, or
  //   (b) declaring three Card nodes with `parent: <grid-id>` and listing
  //       all three ids in this Grid's `linkedNodes["col-0"]` array
  //       (see e.g. the `f2Grid` template in data/templates.json).
  const colCount = Math.max(1, Math.min(12, columns));
  const childCanvases = Array.from({ length: colCount }, (_, idx) => (
    <Element
      key={`${id}-col-${idx}`}
      id={`col-${idx}`}
      canvas
      is="div"
      custom={{ displayName: `Column ${idx + 1}` }}
      className="min-h-[40px] w-full"
    />
  ));

  const trackTemplate = columnWidths?.trim()
    ? columnWidths
    : `repeat(${colCount}, minmax(0, 1fr))`;

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      className={cn(
        "w-full",
        selected && "outline-2 outline-dashed outline-primary outline-offset-2",
        overflow === "hidden" && "overflow-hidden"
      )}
      style={{
        ...backgroundToStyle(background),
        ...boxToStyle(effectiveBox.padding, "padding"),
        ...boxToStyle(effectiveBox.margin, "margin"),
        ...borderToStyle(border),
      }}
    >
      <div
        className={cn("grid w-full", zebra && "[&>div:nth-child(even)]:bg-muted/30")}
        style={{
          gridTemplateColumns: trackTemplate,
          gap,
          minHeight: minRowHeight || undefined,
        }}
      >
        {childCanvases.map((child, idx) => (
          <div
            key={idx}
            className={cn(
              "min-h-[40px] flex flex-col gap-3"
            )}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

// Local helpers so this file is self-contained.
function backgroundToStyle(bg?: BackgroundValue): React.CSSProperties {
  if (!bg) return {};
  if (typeof bg === "string") return bg === "transparent" ? {} : { background: bg };
  const out: Record<string, string> = {};
  if (bg.type === "gradient" && bg.gradient) {
    const angle = bg.gradient.angle ?? 180;
    const stops = (bg.gradient.stops ?? [])
      .map((s) => `${s.color} ${s.position}%`)
      .join(", ");
    out.background = `linear-gradient(${angle}deg, ${stops})`;
  } else if (bg.type === "image" && bg.image?.url) {
    out.backgroundImage = `url('${bg.image.url}')`;
    out.backgroundSize = bg.image.size ?? "cover";
    out.backgroundPosition = bg.image.position ?? "center center";
    out.backgroundRepeat = bg.image.repeat ?? "no-repeat";
    if (bg.color) out.backgroundColor = bg.color;
  } else if (bg.color) {
    out.background = bg.color;
  }
  return out as React.CSSProperties;
}

function borderToStyle(b?: BorderValue): React.CSSProperties {
  if (!b) return {};
  const w = b.width ?? 0;
  const style = b.style ?? "solid";
  const color = b.color ?? "currentColor";
  const border = w > 0 && style !== "none" ? `${w}px ${style} ${color}` : undefined;
  return {
    ...(border ? { border } : {}),
    ...(b.radius !== undefined ? { borderRadius: b.radius } : {}),
  };
}

/* -------------------------------------------------------------------------- */
/* Settings panel                                                            */
/* -------------------------------------------------------------------------- */

function GridSettings() {
  const {
    actions: { setProp },
    columns,
    gap,
    columnWidths,
    minRowHeight,
    background,
    padding,
    boxModel,
    border,
    zebra,
    overflow,
    customId,
  } = useNode((node) => ({
    columns: (node.data.props.columns as number) ?? 3,
    gap: (node.data.props.gap as number) ?? 16,
    columnWidths: (node.data.props.columnWidths as string) ?? "",
    minRowHeight: (node.data.props.minRowHeight as number) ?? 0,
    background: node.data.props.background as GridProps["background"],
    padding: (node.data.props.padding as number) ?? 16,
    boxModel: node.data.props.boxModel as GridProps["boxModel"],
    border: node.data.props.border as GridProps["border"],
    zebra: (node.data.props.zebra as boolean) ?? false,
    overflow: (node.data.props.overflow as GridProps["overflow"]) ?? "visible",
    customId: (node.data.props.customId as string) ?? "",
  })) as any;

  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentBox = boxModel ?? { padding: padding ?? 0 };

  // Presets for the column-width field.
  const presets = [
    { value: "1fr 1fr 1fr", label: "Equal (3)" },
    { value: "1fr 2fr 1fr", label: "Wide center (3)" },
    { value: "2fr 1fr 1fr", label: "Wide left (3)" },
    { value: "1fr 1fr 1fr 1fr", label: "Equal (4)" },
    { value: "1fr 3fr", label: "2-col asymmetric" },
    { value: "300px 1fr", label: "Fixed + flex" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: GridProps) => {
              props.customId = e.target.value;
            })
          }
          placeholder="grid-1"
        />
      </FieldRow>

      <SelectField
        label="Layout preset"
        value={
          columnWidths
            ? "custom"
            : columns <= 2
              ? "2"
              : columns === 3
                ? "3"
                : columns === 4
                  ? "4"
                  : String(columns)
        }
        onChange={(v) =>
          setProp((props: GridProps) => {
            if (v === "custom") {
              props.columnWidths = props.columnWidths || "1fr 1fr 1fr";
            } else {
              props.columnWidths = "";
              props.columns = Number(v);
            }
          })
        }
        options={[
          { value: "1", label: "1 column" },
          { value: "2", label: "2 columns" },
          { value: "3", label: "3 columns" },
          { value: "4", label: "4 columns" },
          { value: "5", label: "5 columns" },
          { value: "6", label: "6 columns" },
          { value: "custom", label: "Custom (CSS track sizes)" },
        ]}
      />

      {columnWidths ? (
        <FieldRow label="Column widths (CSS)">
          <div className="flex flex-col gap-1">
            <Input
              value={columnWidths}
              onChange={(e) =>
                setProp((props: GridProps) => {
                  props.columnWidths = e.target.value;
                })
              }
              placeholder="1fr 2fr 1fr"
            />
            <div className="flex flex-wrap gap-1">
              {presets.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() =>
                    setProp((props: GridProps) => {
                      props.columnWidths = p.value;
                    })
                  }
                  className="rounded-md border border-border bg-muted/30 px-2 py-0.5 text-[10px] hover:bg-muted"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </FieldRow>
      ) : (
        <SliderField
          label="Columns"
          value={columns}
          min={1}
          max={12}
          onChange={(v) =>
            setProp((props: GridProps) => {
              props.columns = v;
            })
          }
        />
      )}

      <SliderField
        label="Gap"
        value={gap}
        min={0}
        max={80}
        onChange={(v) =>
          setProp((props: GridProps) => {
            props.gap = v;
          })
        }
      />

      <SliderField
        label="Min row height"
        value={minRowHeight}
        min={0}
        max={400}
        step={10}
        onChange={(v) =>
          setProp((props: GridProps) => {
            props.minRowHeight = v;
          })
        }
      />

      <ToggleField
        label="Zebra striping"
        value={zebra}
        onChange={(v) =>
          setProp((props: GridProps) => {
            props.zebra = v;
          })
        }
      />

      <SelectField
        label="Overflow"
        value={overflow}
        onChange={(v) =>
          setProp((props: GridProps) => {
            props.overflow = v as GridProps["overflow"];
          })
        }
        options={[
          { value: "visible", label: "Visible" },
          { value: "hidden", label: "Hidden" },
        ]}
      />

      <BoxModelField
        label="Container spacing (margin / padding)"
        value={currentBox}
        onChange={(v) =>
          setProp((props: GridProps) => {
            props.boxModel = v;
            if (v.padding && typeof v.padding === "number") {
              props.padding = v.padding;
            } else if (v.padding && typeof v.padding === "object") {
              props.padding = v.padding.top ?? v.padding.bottom ?? 0;
            } else {
              props.padding = 0;
            }
          })
        }
      />

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="rounded-md border border-dashed py-1 text-[10px] text-muted-foreground hover:border-foreground hover:text-foreground"
      >
        {showAdvanced ? "▾ Hide advanced" : "▸ Show advanced (background, border)"}
      </button>

      {showAdvanced && (
        <>
          <BackgroundField
            label="Grid background"
            value={background}
            onChange={(v) =>
              setProp((props: GridProps) => {
                props.background = v;
              })
            }
          />
          <BorderField
            label="Grid border"
            value={border}
            onChange={(v) =>
              setProp((props: GridProps) => {
                props.border = v;
              })
            }
          />
        </>
      )}
    </div>
  );
}

Grid.craft = {
  displayName: "Grid",
  props: {
    columns: 3,
    gap: 16,
    columnWidths: "",
    minRowHeight: 0,
    background: undefined,
    padding: 16,
    boxModel: undefined,
    border: undefined,
    zebra: false,
    overflow: "visible",
    customId: "",
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
  related: {
    settings: GridSettings,
  },
};