"use client";

import { useNode } from "@craftjs/core";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import {
  AlignField,
  BoxModelField,
  BorderField,
  ColorField,
  HoverField,
  OpacityField,
  SelectField,
  ShadowField,
  SliderField,
  ToggleField,
  TransformField,
  TransitionField,
  boxToStyle,
} from "@/components/craft/settings";
import { Input } from "@/components/ui/input";
import {
  borderStyleToCSS,
  hoverToCSS,
  shadowToCSS,
  transformToCSS,
  transitionToCSS,
  type BorderValue,
  type HoverValue,
  type ShadowValue,
  type TransformValue,
  type TransitionValue,
} from "@/lib/craft-styles";

type ImageBlockProps = {
  src?: string;
  alt?: string;
  height?: number;
  /** Width mode. */
  width?: number;
  /** Fixed pixel width (overrides width %). */
  widthPx?: number;
  rounded?: boolean;
  borderRadius?: number;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  objectPosition?: string;
  align?: "left" | "center" | "right";
  /** Caption text shown below the image. */
  caption?: string;
  /** Click-through link. */
  href?: string;
  newTab?: boolean;
  /** Hover zoom effect (scale). */
  hoverZoom?: boolean;
  /** Optional filter applied to the image. */
  filter?: "none" | "grayscale" | "sepia" | "blur" | "brightness";
  filterAmount?: number;
  customId?: string;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
  border?: BorderValue;
  shadow?: ShadowValue;
  transform?: TransformValue;
  hover?: HoverValue;
  transition?: TransitionValue;
  opacity?: number;
};

export function ImageBlock({
  src = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
  alt = "Placeholder image",
  height = 240,
  width = 100,
  widthPx = 0,
  rounded = true,
  borderRadius = 12,
  objectFit = "cover",
  objectPosition = "center",
  align = "center",
  caption = "",
  href = "",
  newTab = false,
  hoverZoom = false,
  filter = "none",
  filterAmount = 50,
  customId = "",
  boxModel,
  border,
  shadow,
  transform,
  hover,
  transition,
  opacity = 1,
}: ImageBlockProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const [hovered, setHovered] = useState(false);

  const filterCSS = (() => {
    const a = filterAmount / 100;
    switch (filter) {
      case "grayscale":
        return `grayscale(${a})`;
      case "sepia":
        return `sepia(${a})`;
      case "blur":
        return `blur(${a * 8}px)`;
      case "brightness":
        return `brightness(${0.5 + a * 1.5})`;
      default:
        return "none";
    }
  })();

  const baseImgStyle: React.CSSProperties = {
    height,
    width: widthPx > 0 ? widthPx : `${width}%`,
    objectFit,
    objectPosition,
    borderRadius: rounded ? borderRadius : 0,
    opacity,
    filter: filterCSS,
    ...borderStyleToCSS(border),
    ...shadowToCSS(shadow),
    ...transformToCSS(transform),
    ...transitionToCSS(transition),
    ...(hovered ? hoverToCSS(hover) : {}),
    ...(hoverZoom && hovered ? { transform: "scale(1.05)" } : {}),
  };

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      src={src}
      alt={alt}
      id={customId || undefined}
      loading="lazy"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        rounded && !border && "rounded-xl",
        selected && "ring-2 ring-primary/40 ring-offset-2"
      )}
      style={baseImgStyle}
    />
  );

  const wrapped = href ? (
    <a
      href={href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      style={{ display: "block", textDecoration: "none" }}
    >
      {img}
    </a>
  ) : (
    img
  );

  return (
    <div
      style={{
        textAlign: align,
        ...boxToStyle(boxModel?.padding, "padding"),
        ...boxToStyle(boxModel?.margin, "margin"),
      }}
    >
      {wrapped}
      {caption && (
        <div
          className="mt-2 text-xs text-muted-foreground"
          style={{ textAlign: align }}
        >
          {caption}
        </div>
      )}
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
    widthPx,
    rounded,
    borderRadius,
    objectFit,
    objectPosition,
    align,
    caption,
    href,
    newTab,
    hoverZoom,
    filter,
    filterAmount,
    customId,
    boxModel,
    border,
    shadow,
    transform,
    hover,
    transition,
    opacity,
  } = useNode((node) => ({
    src: (node.data.props.src as string) ?? "",
    alt: (node.data.props.alt as string) ?? "",
    height: (node.data.props.height as number) ?? 240,
    width: (node.data.props.width as number) ?? 100,
    widthPx: (node.data.props.widthPx as number) ?? 0,
    rounded: (node.data.props.rounded as boolean) ?? true,
    borderRadius: (node.data.props.borderRadius as number) ?? 12,
    objectFit: node.data.props.objectFit as ImageBlockProps["objectFit"],
    objectPosition: (node.data.props.objectPosition as string) ?? "center",
    align: node.data.props.align as ImageBlockProps["align"],
    caption: (node.data.props.caption as string) ?? "",
    href: (node.data.props.href as string) ?? "",
    newTab: (node.data.props.newTab as boolean) ?? false,
    hoverZoom: (node.data.props.hoverZoom as boolean) ?? false,
    filter: (node.data.props.filter as ImageBlockProps["filter"]) ?? "none",
    filterAmount: (node.data.props.filterAmount as number) ?? 50,
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as ImageBlockProps["boxModel"],
    border: node.data.props.border as ImageBlockProps["border"],
    shadow: node.data.props.shadow as ImageBlockProps["shadow"],
    transform: node.data.props.transform as ImageBlockProps["transform"],
    hover: node.data.props.hover as ImageBlockProps["hover"],
    transition: node.data.props.transition as ImageBlockProps["transition"],
    opacity: (node.data.props.opacity as number) ?? 1,
  })) as any;

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: ImageBlockProps) => { props.customId = e.target.value; })
          }
          placeholder="my-image"
        />
      </FieldRow>
      <FieldRow label="Image URL">
        <Input
          value={src}
          onChange={(e) =>
            setProp((props: ImageBlockProps) => { props.src = e.target.value; })
          }
          placeholder="https://images.unsplash.com/…"
        />
      </FieldRow>
      <FieldRow label="Alt text">
        <Input
          value={alt}
          onChange={(e) =>
            setProp((props: ImageBlockProps) => { props.alt = e.target.value; })
          }
        />
      </FieldRow>
      <FieldRow label="Caption (optional)">
        <Input
          value={caption}
          onChange={(e) =>
            setProp((props: ImageBlockProps) => { props.caption = e.target.value; })
          }
        />
      </FieldRow>
      <FieldRow label="Link URL (optional)">
        <Input
          value={href}
          placeholder="https://…"
          onChange={(e) =>
            setProp((props: ImageBlockProps) => { props.href = e.target.value; })
          }
        />
      </FieldRow>
      <ToggleField
        label="Open link in new tab"
        value={newTab}
        onChange={(v) =>
          setProp((props: ImageBlockProps) => { props.newTab = v; })
        }
      />

      <SliderField
        label="Height"
        value={height}
        min={80}
        max={600}
        step={10}
        onChange={(v) =>
          setProp((props: ImageBlockProps) => { props.height = v; })
        }
      />
      <SliderField
        label="Width (% of parent)"
        value={width}
        min={10}
        max={100}
        step={5}
        unit="%"
        onChange={(v) =>
          setProp((props: ImageBlockProps) => { props.width = v; })
        }
      />
      <SliderField
        label="Width (fixed px, 0 = off)"
        value={widthPx}
        min={0}
        max={1200}
        step={10}
        unit="px"
        onChange={(v) =>
          setProp((props: ImageBlockProps) => { props.widthPx = v; })
        }
      />

      <ToggleField
        label="Rounded corners"
        value={rounded}
        onChange={(v) =>
          setProp((props: ImageBlockProps) => { props.rounded = v; })
        }
      />
      <SliderField
        label="Border radius"
        value={borderRadius}
        min={0}
        max={64}
        onChange={(v) =>
          setProp((props: ImageBlockProps) => { props.borderRadius = v; })
        }
      />

      <SelectField
        label="Object fit"
        value={objectFit}
        onChange={(v) =>
          setProp((props: ImageBlockProps) => { props.objectFit = v as ImageBlockProps["objectFit"]; })
        }
        options={[
          { value: "cover", label: "Cover" },
          { value: "contain", label: "Contain" },
          { value: "fill", label: "Fill" },
          { value: "none", label: "None" },
          { value: "scale-down", label: "Scale down" },
        ]}
      />
      <FieldRow label="Object position">
        <Input
          value={objectPosition}
          onChange={(e) =>
            setProp((props: ImageBlockProps) => { props.objectPosition = e.target.value; })
          }
          placeholder="center / top / 50% 30%"
        />
      </FieldRow>

      <AlignField
        label="Alignment"
        value={align}
        onChange={(v) =>
          setProp((props: ImageBlockProps) => { props.align = v; })
        }
      />

      <SelectField
        label="Filter"
        value={filter}
        onChange={(v) =>
          setProp((props: ImageBlockProps) => { props.filter = v as ImageBlockProps["filter"]; })
        }
        options={[
          { value: "none", label: "None" },
          { value: "grayscale", label: "Grayscale" },
          { value: "sepia", label: "Sepia" },
          { value: "blur", label: "Blur" },
          { value: "brightness", label: "Brightness" },
        ]}
      />
      {filter !== "none" && (
        <SliderField
          label="Filter amount"
          value={filterAmount}
          min={0}
          max={100}
          unit="%"
          onChange={(v) =>
            setProp((props: ImageBlockProps) => { props.filterAmount = v; })
          }
        />
      )}

      <ToggleField
        label="Hover zoom"
        value={hoverZoom}
        onChange={(v) =>
          setProp((props: ImageBlockProps) => { props.hoverZoom = v; })
        }
      />

      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: ImageBlockProps) => { props.boxModel = v; })
        }
      />

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="rounded-md border border-dashed py-1 text-[10px] text-muted-foreground hover:border-foreground hover:text-foreground"
      >
        {showAdvanced ? "▾ Hide advanced" : "▸ Show advanced (border, shadow, hover)"}
      </button>

      {showAdvanced && (
        <>
          <BorderField
            label="Border"
            value={border}
            onChange={(v) =>
              setProp((props: ImageBlockProps) => { props.border = v; })
            }
          />
          <ShadowField
            label="Shadow"
            value={shadow}
            onChange={(v) =>
              setProp((props: ImageBlockProps) => { props.shadow = v; })
            }
          />
          <HoverField
            value={hover}
            onChange={(v) =>
              setProp((props: ImageBlockProps) => { props.hover = v; })
            }
          />
          <TransitionField
            value={transition}
            onChange={(v) =>
              setProp((props: ImageBlockProps) => { props.transition = v; })
            }
          />
          <TransformField
            value={transform}
            onChange={(v) =>
              setProp((props: ImageBlockProps) => { props.transform = v; })
            }
          />
          <OpacityField
            value={opacity}
            onChange={(v) =>
              setProp((props: ImageBlockProps) => { props.opacity = v; })
            }
          />
        </>
      )}
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
    widthPx: 0,
    rounded: true,
    borderRadius: 12,
    objectFit: "cover",
    objectPosition: "center",
    align: "center",
    caption: "",
    href: "",
    newTab: false,
    hoverZoom: false,
    filter: "none",
    filterAmount: 50,
    customId: "",
    boxModel: undefined,
    border: undefined,
    shadow: undefined,
    transform: undefined,
    hover: undefined,
    transition: undefined,
    opacity: 1,
  },
  related: {
    settings: ImageBlockSettings,
  },
};