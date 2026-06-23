"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Textarea } from "@/components/ui/textarea";
import { ColorField } from "@/components/craft/settings/ColorField";
import { SliderField } from "@/components/craft/settings/SliderField";
import { SelectField } from "@/components/craft/settings/SelectField";
import { Input } from "@/components/ui/input";

type ListProps = {
  items?: string;
  ordered?: boolean;
  fontSize?: number;
  color?: string;
  spacing?: number;
  customId?: string;
};

export function List({
  items = "First item\nSecond item\nThird item",
  ordered = false,
  fontSize = 16,
  color = "#374151",
  spacing = 8,
  customId = "",
}: ListProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const list = items.split("\n").filter((line) => line.trim().length > 0);
  const Tag = ordered ? "ol" : "ul";
  const listClass = ordered ? "list-decimal" : "list-disc";

  return (
    <Tag
      ref={(ref) => {
        connect(drag(ref!));
      }}
      id={customId || undefined}
      className={cn(
        listClass,
        "ml-6 outline-none",
        selected && "ring-2 ring-primary/40 ring-offset-2"
      )}
      style={{ fontSize, color }}
    >
      {list.map((item, idx) => (
        <li key={idx} style={{ marginBottom: spacing }}>
          {item}
        </li>
      ))}
    </Tag>
  );
}

function ListSettings() {
  const {
    actions: { setProp },
    items,
    ordered,
    fontSize,
    color,
    spacing,
    customId,
  } = useNode((node) => ({
    items: node.data.props.items as string,
    ordered: node.data.props.ordered as boolean,
    fontSize: node.data.props.fontSize as number,
    color: node.data.props.color as string,
    spacing: node.data.props.spacing as number,
    customId: (node.data.props.customId as string) ?? "",
  })) as any;

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: ListProps) => {
              props.customId = e.target.value;
            })
          }
          placeholder="my-list"
        />
      </FieldRow>
      <FieldRow label="Items (one per line)">
        <Textarea
          value={items}
          rows={6}
          onChange={(e) =>
            setProp((props: ListProps) => {
              props.items = e.target.value;
            })
          }
        />
      </FieldRow>
      <SelectField
        label="Type"
        value={ordered ? "ordered" : "unordered"}
        onChange={(v) =>
          setProp((props: ListProps) => {
            props.ordered = v === "ordered";
          })
        }
        options={[
          { value: "unordered", label: "Bulleted" },
          { value: "ordered", label: "Numbered" },
        ]}
      />
      <SliderField
        label="Font size"
        value={fontSize}
        min={10}
        max={32}
        onChange={(v) =>
          setProp((props: ListProps) => {
            props.fontSize = v;
          })
        }
      />
      <ColorField
        label="Color"
        value={color}
        onChange={(v) =>
          setProp((props: ListProps) => {
            props.color = v;
          })
        }
      />
      <SliderField
        label="Item spacing"
        value={spacing}
        min={0}
        max={40}
        onChange={(v) =>
          setProp((props: ListProps) => {
            props.spacing = v;
          })
        }
      />
    </div>
  );
}

List.craft = {
  displayName: "List",
  props: {
    items: "First item\nSecond item\nThird item",
    ordered: false,
    fontSize: 16,
    color: "#374151",
    spacing: 8,
    customId: "",
  },
  related: {
    settings: ListSettings,
  },
};