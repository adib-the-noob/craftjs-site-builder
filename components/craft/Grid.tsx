"use client";

import { useNode, Element } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { ColorField } from "@/components/craft/settings/ColorField";
import { SliderField } from "@/components/craft/settings/SliderField";
import { SelectField } from "@/components/craft/settings/SelectField";
import { BoxModelField, boxToStyle } from "@/components/craft/settings/BoxModelField";

type GridProps = {
  columns?: 2 | 3 | 4;
  gap?: number;
  background?: string;
  padding?: number;
  borderRadius?: number;
  customId?: string;
  children?: React.ReactNode;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
};

export function Grid({
  columns = 3,
  gap = 16,
  background = "transparent",
  padding = 16,
  borderRadius = 0,
  customId = "",
  children,
  boxModel,
}: GridProps) {
  const {
    id,
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    id: node.id,
    selected: node.events.selected,
  })) as any;

  // Backward-compat: when boxModel isn't set, derive padding from legacy
  // `padding` prop.
  const effectiveBox = boxModel ?? {
    padding: typeof padding === "number" ? padding : undefined,
  };

  // Ensure exactly `columns` child canvases exist so columns render predictably.
  // Each <Element> needs an `id` slot name so Craft.js can map it onto
  // `parent.data.linkedNodes[col-N]` when a saved tree is rehydrated —
  // otherwise the runtime invariant "A <Element /> that is used inside a
  // User Component must specify an `id` prop" fires, and even if it didn't
  // the columns wouldn't round-trip through save/load.
  const childCanvases = Array.from({ length: columns }, (_, idx) => (
    <Element
      key={`${id}-col-${idx}`}
      id={`col-${idx}`}
      canvas
      is="div"
      custom={{ displayName: `Column ${idx + 1}` }}
      className="min-h-[40px] w-full"
    />
  ));

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      className={cn("w-full", selected && "ring-2 ring-primary/40 ring-offset-2")}
      style={{
        background,
        borderRadius,
        ...boxToStyle(effectiveBox.padding, "padding"),
        ...boxToStyle(effectiveBox.margin, "margin"),
      }}
    >
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap,
          padding: typeof padding === "number" ? padding : 0,
        }}
      >
        {childCanvases.map((child, idx) => (
          <div
            key={idx}
            className="min-h-[40px] rounded-md border border-dashed border-border/60 bg-background/40 p-2"
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

function GridSettings() {
  const {
    actions: { setProp },
    columns,
    gap,
    background,
    padding,
    borderRadius,
    customId,
    boxModel,
  } = useNode((node) => ({
    columns: node.data.props.columns as GridProps["columns"],
    gap: node.data.props.gap as number,
    background: node.data.props.background as string,
    padding: node.data.props.padding as number,
    borderRadius: (node.data.props.borderRadius as number) ?? 0,
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as GridProps["boxModel"],
  })) as any;

  const currentBox = boxModel ?? { padding: padding ?? 0 };

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
        label="Columns"
        value={String(columns)}
        onChange={(v) =>
          setProp((props: GridProps) => {
            props.columns = Number(v) as GridProps["columns"];
          })
        }
        options={[
          { value: "2", label: "2 columns" },
          { value: "3", label: "3 columns" },
          { value: "4", label: "4 columns" },
        ]}
      />
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
      <ColorField
        label="Background"
        value={background}
        onChange={(v) =>
          setProp((props: GridProps) => {
            props.background = v;
          })
        }
      />
      <SliderField
        label="Inner padding"
        value={padding}
        min={0}
        max={120}
        onChange={(v) =>
          setProp((props: GridProps) => {
            props.padding = v;
          })
        }
      />
      <SliderField
        label="Border radius"
        value={borderRadius}
        min={0}
        max={48}
        onChange={(v) =>
          setProp((props: GridProps) => {
            props.borderRadius = v;
          })
        }
      />
      <BoxModelField
        label="Spacing (margin / padding)"
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
    </div>
  );
}

Grid.craft = {
  displayName: "Grid",
  props: {
    columns: 3,
    gap: 16,
    background: "transparent",
    padding: 16,
    borderRadius: 0,
    customId: "",
    boxModel: undefined,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
  related: {
    settings: GridSettings,
  },
};