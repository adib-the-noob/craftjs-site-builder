"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { SliderField } from "@/components/craft/settings/SliderField";
import { SelectField } from "@/components/craft/settings/SelectField";
import { AlignField } from "@/components/craft/settings/AlignField";
import { ToggleField } from "@/components/craft/settings/ToggleField";

type ImageBlockProps = {
  src?: string;
  alt?: string;
  height?: number;
  width?: number;
  rounded?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none";
  align?: "left" | "center" | "right";
  customId?: string;
};

export function ImageBlock({
  src = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
  alt = "Placeholder image",
  height = 240,
  width = 100,
  rounded = true,
  objectFit = "cover",
  align = "center",
  customId = "",
}: ImageBlockProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  return (
    <div style={{ textAlign: align }} id={customId || undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={(ref) => {
          connect(drag(ref!));
        }}
        src={src}
        alt={alt}
        className={cn(
          "object-cover",
          rounded && "rounded-xl",
          selected && "ring-2 ring-primary/40 ring-offset-2"
        )}
        style={{
          height,
          width: `${width}%`,
          objectFit,
        }}
      />
    </div>
  );
}

function ImageBlockSettings() {
  const {
    actions: { setProp },
    src,
    alt,
    height,
    width,
    rounded,
    objectFit,
    align,
    customId,
  } = useNode((node) => ({
    src: node.data.props.src as string,
    alt: node.data.props.alt as string,
    height: node.data.props.height as number,
    width: (node.data.props.width as number) ?? 100,
    rounded: node.data.props.rounded as boolean,
    objectFit: node.data.props.objectFit as ImageBlockProps["objectFit"],
    align: node.data.props.align as ImageBlockProps["align"],
    customId: (node.data.props.customId as string) ?? "",
  })) as any;

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: ImageBlockProps) => {
              props.customId = e.target.value;
            })
          }
          placeholder="my-image"
        />
      </FieldRow>
      <FieldRow label="Image URL">
        <Input
          value={src}
          onChange={(e) =>
            setProp((props: ImageBlockProps) => {
              props.src = e.target.value;
            })
          }
        />
      </FieldRow>
      <FieldRow label="Alt text">
        <Input
          value={alt}
          onChange={(e) =>
            setProp((props: ImageBlockProps) => {
              props.alt = e.target.value;
            })
          }
        />
      </FieldRow>
      <SliderField
        label="Height"
        value={height}
        min={80}
        max={600}
        step={10}
        onChange={(v) =>
          setProp((props: ImageBlockProps) => {
            props.height = v;
          })
        }
      />
      <SliderField
        label="Width"
        value={width}
        min={10}
        max={100}
        step={5}
        unit="%"
        onChange={(v) =>
          setProp((props: ImageBlockProps) => {
            props.width = v;
          })
        }
      />
      <SelectField
        label="Object fit"
        value={objectFit}
        onChange={(v) =>
          setProp((props: ImageBlockProps) => {
            props.objectFit = v as ImageBlockProps["objectFit"];
          })
        }
        options={[
          { value: "cover", label: "Cover" },
          { value: "contain", label: "Contain" },
          { value: "fill", label: "Fill" },
          { value: "none", label: "None" },
        ]}
      />
      <AlignField
        label="Alignment"
        value={align}
        onChange={(v) =>
          setProp((props: ImageBlockProps) => {
            props.align = v;
          })
        }
      />
      <ToggleField
        label="Rounded corners"
        value={rounded}
        onChange={(v) =>
          setProp((props: ImageBlockProps) => {
            props.rounded = v;
          })
        }
      />
    </div>
  );
}

ImageBlock.craft = {
  displayName: "Image",
  props: {
    src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
    alt: "Placeholder image",
    height: 240,
    width: 100,
    rounded: true,
    objectFit: "cover",
    align: "center",
    customId: "",
  },
  related: {
    settings: ImageBlockSettings,
  },
};