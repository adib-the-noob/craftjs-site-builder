"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { ColorField } from "@/components/craft/settings/ColorField";
import { SelectField } from "@/components/craft/settings/SelectField";
import { AlignField } from "@/components/craft/settings/AlignField";
import { ToggleField } from "@/components/craft/settings/ToggleField";
import { SliderField } from "@/components/craft/settings/SliderField";
import { BoxModelField, boxToStyle } from "@/components/craft/settings/BoxModelField";

type CtaButtonProps = {
  text?: string;
  href?: string;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  align?: "left" | "center" | "right";
  fullWidth?: boolean;
  background?: string;
  textColor?: string;
  customId?: string;
  /** Tailwind-style box model — applied to the outer wrapper so the
   * button can be nudged without breaking the centred alignment. */
  boxModel?: { margin?: any; padding?: any };
  borderRadius?: number;
};

export function CtaButton({
  text = "Get started",
  href = "#",
  variant = "primary",
  size = "md",
  align = "left",
  fullWidth = false,
  background = "#0f172a",
  textColor = "#ffffff",
  customId = "",
  boxModel,
  borderRadius = 8,
}: CtaButtonProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const sizeClass =
    size === "sm"
      ? "h-8 px-4 text-xs"
      : size === "lg"
        ? "h-12 px-8 text-base"
        : "h-10 px-6 text-sm";

  const variantStyle =
    variant === "primary"
      ? { backgroundColor: background, color: textColor, border: "none" }
      : variant === "outline"
        ? {
            backgroundColor: "transparent",
            color: background,
            border: `1px solid ${background}`,
          }
        : {
            backgroundColor: "transparent",
            color: background,
            border: "none",
          };

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      className={cn(fullWidth && "w-full")}
      style={{
        textAlign: align,
        ...boxToStyle(boxModel?.padding, "padding"),
        ...boxToStyle(boxModel?.margin, "margin"),
      }}
    >
      <a
        href={href}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors",
          sizeClass,
          fullWidth && "w-full",
          selected && "ring-2 ring-primary/40 ring-offset-2"
        )}
        style={{ ...variantStyle, borderRadius }}
        onClick={(e) => e.preventDefault()}
      >
        {text}
      </a>
    </div>
  );
}

function CtaButtonSettings() {
  const {
    actions: { setProp },
    text,
    href,
    variant,
    size,
    align,
    fullWidth,
    background,
    textColor,
    customId,
    boxModel,
    borderRadius,
  } = useNode((node) => ({
    text: node.data.props.text as string,
    href: node.data.props.href as string,
    variant: node.data.props.variant as CtaButtonProps["variant"],
    size: (node.data.props.size as CtaButtonProps["size"]) ?? "md",
    align: node.data.props.align as CtaButtonProps["align"],
    fullWidth: (node.data.props.fullWidth as boolean) ?? false,
    background: (node.data.props.background as string) ?? "#0f172a",
    textColor: (node.data.props.textColor as string) ?? "#ffffff",
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as CtaButtonProps["boxModel"],
    borderRadius: (node.data.props.borderRadius as number) ?? 8,
  })) as any;

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: CtaButtonProps) => {
              props.customId = e.target.value;
            })
          }
          placeholder="my-button"
        />
      </FieldRow>
      <FieldRow label="Label">
        <Input
          value={text}
          onChange={(e) =>
            setProp((props: CtaButtonProps) => {
              props.text = e.target.value;
            })
          }
        />
      </FieldRow>
      <FieldRow label="Link URL">
        <Input
          value={href}
          onChange={(e) =>
            setProp((props: CtaButtonProps) => {
              props.href = e.target.value;
            })
          }
        />
      </FieldRow>
      <SelectField
        label="Variant"
        value={variant}
        onChange={(v) =>
          setProp((props: CtaButtonProps) => {
            props.variant = v as CtaButtonProps["variant"];
          })
        }
        options={[
          { value: "primary", label: "Primary" },
          { value: "outline", label: "Outline" },
          { value: "ghost", label: "Ghost" },
        ]}
      />
      <SelectField
        label="Size"
        value={size}
        onChange={(v) =>
          setProp((props: CtaButtonProps) => {
            props.size = v as CtaButtonProps["size"];
          })
        }
        options={[
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
        ]}
      />
      <AlignField
        label="Alignment"
        value={align}
        onChange={(v) =>
          setProp((props: CtaButtonProps) => {
            props.align = v;
          })
        }
      />
      <ToggleField
        label="Full width"
        value={fullWidth}
        onChange={(v) =>
          setProp((props: CtaButtonProps) => {
            props.fullWidth = v;
          })
        }
      />
      <ColorField
        label="Background color"
        value={background}
        onChange={(v) =>
          setProp((props: CtaButtonProps) => {
            props.background = v;
          })
        }
      />
      <ColorField
        label="Text color"
        value={textColor}
        onChange={(v) =>
          setProp((props: CtaButtonProps) => {
            props.textColor = v;
          })
        }
      />
      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: CtaButtonProps) => {
            props.boxModel = v;
          })
        }
      />
      <SliderField
        label="Border radius"
        value={borderRadius}
        min={0}
        max={48}
        onChange={(v) =>
          setProp((props: CtaButtonProps) => {
            props.borderRadius = v;
          })
        }
      />
    </div>
  );
}

CtaButton.craft = {
  displayName: "Button",
  props: {
    text: "Get started",
    href: "#",
    variant: "primary",
    size: "md",
    align: "left",
    fullWidth: false,
    background: "#0f172a",
    textColor: "#ffffff",
    customId: "",
    boxModel: undefined,
    borderRadius: 8,
  },
  related: {
    settings: CtaButtonSettings,
  },
};