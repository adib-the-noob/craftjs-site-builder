"use client";

import { useNode, Element } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { ColorField } from "@/components/craft/settings/ColorField";
import { SliderField } from "@/components/craft/settings/SliderField";
import { SelectField } from "@/components/craft/settings/SelectField";

type GridProps = {
  columns?: 2 | 3 | 4;
  gap?: number;
  background?: string;
  padding?: number;
  customId?: string;
  children?: React.ReactNode;
};

export function Grid({
  columns = 3,
  gap = 16,
  background = "transparent",
  padding = 16,
  customId = "",
  children,
}: GridProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  // Ensure exactly `columns` child canvases exist so columns render predictably.
  const childCanvases = Array.from({ length: columns }, (_, idx) => (
    <Element
      key={`col-${idx}`}
      canvas
      is="div"
      custom={{ displayName: `Column ${idx + 1}` }}
      className="min-h-[40px] w-full"
    />
  ));

  return (
    <div
      ref={(ref) => {
        connect(drag(ref!));
      }}
      id={customId || undefined}
      className={cn("w-full")}
      style={{ background, padding }}
    >
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap,
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
    customId,
  } = useNode((node) => ({
    columns: node.data.props.columns as GridProps["columns"],
    gap: node.data.props.gap as number,
    background: node.data.props.background as string,
    padding: node.data.props.padding as number,
    customId: (node.data.props.customId as string) ?? "",
  })) as any;

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
        label="Padding"
        value={padding}
        min={0}
        max={120}
        onChange={(v) =>
          setProp((props: GridProps) => {
            props.padding = v;
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