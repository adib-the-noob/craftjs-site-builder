"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { Text } from "./Text";
import { Heading } from "./Heading";
import { ColorField } from "@/components/craft/settings/ColorField";
import { SliderField } from "@/components/craft/settings/SliderField";
import { ToggleField } from "@/components/craft/settings/ToggleField";
import { BoxModelField, boxToStyle } from "@/components/craft/settings/BoxModelField";

type CardProps = {
  title?: string;
  body?: string;
  background?: string;
  padding?: number;
  shadow?: boolean;
  borderRadius?: number;
  customId?: string;
  children?: React.ReactNode;
  /** Tailwind-style box model — overrides padding when set. */
  boxModel?: { margin?: any; padding?: any };
};

export function Card({
  title = "Card title",
  body = "Card description goes here.",
  background = "#ffffff",
  padding = 24,
  shadow = true,
  borderRadius = 12,
  customId = "",
  children,
  boxModel,
}: CardProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  // Backward-compat: when boxModel isn't set, derive padding from legacy
  // `padding` prop so older saved trees still render correctly.
  const effectiveBox = boxModel ?? {
    padding: typeof padding === "number" ? padding : undefined,
  };

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      className={cn(
        "rounded-xl border",
        shadow && "shadow-md",
        selected && "ring-2 ring-primary/40 ring-offset-2"
      )}
      style={{
        background,
        borderRadius,
        ...boxToStyle(effectiveBox.padding, "padding"),
        ...boxToStyle(effectiveBox.margin, "margin"),
      }}
    >
      {children ?? (
        <>
          <Heading text={title} level="h3" />
          <div style={{ height: 8 }} />
          <Text text={body} />
        </>
      )}
    </div>
  );
}

function CardSettings() {
  const {
    actions: { setProp },
    title,
    body,
    background,
    padding,
    shadow,
    borderRadius,
    customId,
    boxModel,
  } = useNode((node) => ({
    title: node.data.props.title as string,
    body: node.data.props.body as string,
    background: node.data.props.background as string,
    padding: node.data.props.padding as number,
    shadow: node.data.props.shadow as boolean,
    borderRadius: (node.data.props.borderRadius as number) ?? 12,
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as CardProps["boxModel"],
  })) as any;

  const currentBox = boxModel ?? { padding: padding ?? 0 };

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: CardProps) => {
              props.customId = e.target.value;
            })
          }
          placeholder="card-1"
        />
      </FieldRow>
      <FieldRow label="Title">
        <Input
          value={title}
          onChange={(e) =>
            setProp((props: CardProps) => {
              props.title = e.target.value;
            })
          }
        />
      </FieldRow>
      <FieldRow label="Body">
        <Input
          value={body}
          onChange={(e) =>
            setProp((props: CardProps) => {
              props.body = e.target.value;
            })
          }
        />
      </FieldRow>
      <ColorField
        label="Background"
        value={background}
        onChange={(v) =>
          setProp((props: CardProps) => {
            props.background = v;
          })
        }
      />
      <BoxModelField
        label="Spacing (margin / padding)"
        value={currentBox}
        onChange={(v) =>
          setProp((props: CardProps) => {
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
      <SliderField
        label="Border radius"
        value={borderRadius}
        min={0}
        max={48}
        onChange={(v) =>
          setProp((props: CardProps) => {
            props.borderRadius = v;
          })
        }
      />
      <ToggleField
        label="Shadow"
        value={shadow}
        onChange={(v) =>
          setProp((props: CardProps) => {
            props.shadow = v;
          })
        }
      />
    </div>
  );
}

Card.craft = {
  displayName: "Card",
  props: {
    title: "Card title",
    body: "Card description goes here.",
    background: "#ffffff",
    padding: 24,
    shadow: true,
    borderRadius: 12,
    customId: "",
    boxModel: undefined,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
  related: {
    settings: CardSettings,
  },
};