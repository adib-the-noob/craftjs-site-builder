"use client";

import { useNode } from "@craftjs/core";
import { Element } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { Text } from "./Text";
import { Heading } from "./Heading";
import { ColorField } from "@/components/craft/settings/ColorField";
import { SliderField } from "@/components/craft/settings/SliderField";
import { ToggleField } from "@/components/craft/settings/ToggleField";

type CardProps = {
  title?: string;
  body?: string;
  background?: string;
  padding?: number;
  shadow?: boolean;
  customId?: string;
  children?: React.ReactNode;
};

export function Card({
  title = "Card title",
  body = "Card description goes here.",
  background = "#ffffff",
  padding = 24,
  shadow = true,
  customId = "",
  children,
}: CardProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div
      ref={(ref) => {
        connect(drag(ref!));
      }}
      id={customId || undefined}
      className={cn(
        "rounded-xl border",
        shadow && "shadow-md"
      )}
      style={{ background, padding }}
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
    customId,
  } = useNode((node) => ({
    title: node.data.props.title as string,
    body: node.data.props.body as string,
    background: node.data.props.background as string,
    padding: node.data.props.padding as number,
    shadow: node.data.props.shadow as boolean,
    customId: (node.data.props.customId as string) ?? "",
  })) as any;

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
      <SliderField
        label="Padding"
        value={padding}
        min={0}
        max={80}
        onChange={(v) =>
          setProp((props: CardProps) => {
            props.padding = v;
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
    customId: "",
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
  related: {
    settings: CardSettings,
  },
};