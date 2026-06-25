"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import {
  BoxModelField,
  ColorField,
  OpacityField,
  SelectField,
  SliderField,
  ToggleField,
  TransformField,
  boxToStyle,
} from "@/components/craft/settings";
import {
  transformToCSS,
  type TransformValue,
} from "@/lib/craft-styles";

type SpacerProps = {
  /** Direction of the spacer. */
  direction?: "vertical" | "horizontal" | "both";
  height?: number;
  width?: number;
  /** Whether the spacer is responsive (uses min-height when content is small). */
  minHeight?: number;
  /** Optional visible line decoration in the middle (great for visual breaks). */
  decoration?: "none" | "line" | "dot";
  decorationColor?: string;
  customId?: string;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
  /** Background for visibility while editing. */
  background?: string;
  transform?: TransformValue;
  opacity?: number;
};

export function Spacer({
  direction = "vertical",
  height = 40,
  width = 0,
  minHeight = 0,
  decoration = "none",
  decorationColor = "#e5e7eb",
  customId = "",
  boxModel,
  background = "transparent",
  transform,
  opacity = 1,
}: SpacerProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const verticalPx = direction === "horizontal" ? 0 : height;
  const horizontalPx = direction === "vertical" ? 0 : width;

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      className={cn(
        "flex w-full items-center justify-center",
        direction === "vertical" && "flex-col",
        selected && "outline-dashed outline-1 outline-primary/40"
      )}
      style={{
        height: verticalPx || undefined,
        minHeight: minHeight || undefined,
        width: horizontalPx ? horizontalPx : undefined,
        background,
        opacity,
        ...transformToCSS(transform),
        ...boxToStyle(boxModel?.padding, "padding"),
        ...boxToStyle(boxModel?.margin, "margin"),
      }}
    >
      {decoration !== "none" && (
        <div
          style={{
            width: decoration === "line" ? 64 : 6,
            height: decoration === "line" ? 1 : 6,
            background: decorationColor,
            borderRadius: decoration === "dot" ? "50%" : 0,
          }}
        />
      )}
    </div>
  );
}

function SpacerSettings() {
  const {
    actions: { setProp },
    direction,
    height,
    width,
    minHeight,
    decoration,
    decorationColor,
    customId,
    boxModel,
    background,
    transform,
    opacity,
  } = useNode((node) => ({
    direction: (node.data.props.direction as SpacerProps["direction"]) ?? "vertical",
    height: (node.data.props.height as number) ?? 40,
    width: (node.data.props.width as number) ?? 0,
    minHeight: (node.data.props.minHeight as number) ?? 0,
    decoration: (node.data.props.decoration as SpacerProps["decoration"]) ?? "none",
    decorationColor: (node.data.props.decorationColor as string) ?? "#e5e7eb",
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as SpacerProps["boxModel"],
    background: (node.data.props.background as string) ?? "transparent",
    transform: node.data.props.transform as SpacerProps["transform"],
    opacity: (node.data.props.opacity as number) ?? 1,
  })) as any;

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: SpacerProps) => { props.customId = e.target.value; })
          }
          placeholder="spacer-1"
        />
      </FieldRow>
      <SelectField
        label="Direction"
        value={direction}
        onChange={(v) =>
          setProp((props: SpacerProps) => { props.direction = v as SpacerProps["direction"]; })
        }
        options={[
          { value: "vertical", label: "Vertical (height)" },
          { value: "horizontal", label: "Horizontal (width)" },
          { value: "both", label: "Both" },
        ]}
      />
      {direction !== "horizontal" && (
        <SliderField
          label="Height"
          value={height}
          min={8}
          max={400}
          step={4}
          onChange={(v) =>
            setProp((props: SpacerProps) => { props.height = v; })
          }
        />
      )}
      {direction !== "vertical" && (
        <SliderField
          label="Width"
          value={width}
          min={8}
          max={400}
          step={4}
          unit="px"
          onChange={(v) =>
            setProp((props: SpacerProps) => { props.width = v; })
          }
        />
      )}
      <SliderField
        label="Min height (responsive)"
        value={minHeight}
        min={0}
        max={400}
        step={4}
        unit="px"
        onChange={(v) =>
          setProp((props: SpacerProps) => { props.minHeight = v; })
        }
      />
      <SelectField
        label="Decoration"
        value={decoration}
        onChange={(v) =>
          setProp((props: SpacerProps) => { props.decoration = v as SpacerProps["decoration"]; })
        }
        options={[
          { value: "none", label: "None (invisible)" },
          { value: "line", label: "Horizontal line" },
          { value: "dot", label: "Dot" },
        ]}
      />
      {decoration !== "none" && (
        <ColorField
          label="Decoration color"
          value={decorationColor}
          onChange={(v) =>
            setProp((props: SpacerProps) => { props.decorationColor = v; })
          }
        />
      )}
      <ColorField
        label="Background (visible in editor)"
        value={background}
        onChange={(v) =>
          setProp((props: SpacerProps) => { props.background = v; })
        }
      />
      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: SpacerProps) => { props.boxModel = v; })
        }
      />
      <TransformField
        value={transform}
        onChange={(v) =>
          setProp((props: SpacerProps) => { props.transform = v; })
        }
      />
      <OpacityField
        value={opacity}
        onChange={(v) =>
          setProp((props: SpacerProps) => { props.opacity = v; })
        }
      />
    </div>
  );
}

Spacer.craft = {
  displayName: "Spacer",
  props: {
    direction: "vertical",
    height: 40,
    width: 0,
    minHeight: 0,
    decoration: "none",
    decorationColor: "#e5e7eb",
    customId: "",
    boxModel: undefined,
    background: "transparent",
    transform: undefined,
    opacity: 1,
  },
  related: {
    settings: SpacerSettings,
  },
};