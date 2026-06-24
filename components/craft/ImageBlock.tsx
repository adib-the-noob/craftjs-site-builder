"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { SliderField } from "@/components/craft/settings/SliderField";
import { SelectField } from "@/components/craft/settings/SelectField";
import { AlignField } from "@/components/craft/settings/AlignField";
import { ToggleField } from "@/components/craft/settings/ToggleField";
import { BoxModelField, boxToStyle } from "@/components/craft/settings/BoxModelField";

type ImageBlockProps = {
  src?: string;
  alt?: string;
  height?: number;
  width?: number;
  rounded?: boolean;
  borderRadius?: number;
  objectFit?: "cover" | "contain" | "fill" | "none";
  align?: "left" | "center" | "right";
  customId?: string;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
};

export function ImageBlock({
  src = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
  alt = "Placeholder image",
  height = 240,
  width = 100,
  rounded = true,
  borderRadius = 12,
  objectFit = "cover",
  align = "center",
  customId = "",
  boxModel,
}: ImageBlockProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      src={src}
      alt={alt}
      id={customId || undefined}
      className={cn(
        "object-cover",
        rounded && "rounded-xl",
        selected && "ring-2 ring-primary/40 ring-offset-2"
      )}
      style={{
        height,
        width: `${width}%`,
        objectFit,
        borderRadius: rounded ? borderRadius : 0,
        textAlign: align,
        ...boxToStyle(boxModel?.padding, "padding"),
        ...boxToStyle(boxModel?.margin, "margin"),
      }}
    />
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
    borderRadius,
    objectFit,
    align,
    customId,
    boxModel,
  } = useNode((node) => ({
    src: node.data.props.src as string,
    alt: node.data.props.alt as string,
    height: node.data.props.height as number,
    width: (node.data.props.width as number) ?? 100,
    rounded: node.data.props.rounded as boolean,
    borderRadius: (node.data.props.borderRadius as number) ?? 12,
    objectFit: node.data.props.objectFit as ImageBlockProps["objectFit"],
    align: node.data.props.align as ImageBlockProps["align"],
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as ImageBlockProps["boxModel"],
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
      <SliderField
        label="Border radius"
        value={borderRadius}
        min={0}
        max={64}
        onChange={(v) =>
          setProp((props: ImageBlockProps) => {
            props.borderRadius = v;
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
      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: ImageBlockProps) => {
            props.boxModel = v;
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
    borderRadius: 12,
    objectFit: "cover",
    align: "center",
    customId: "",
    boxModel: undefined,
  },
  related: {
    settings: ImageBlockSettings,
  },
};