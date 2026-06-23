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
      style={{ textAlign: align }}
      className={cn(fullWidth && "w-full")}
      id={customId || undefined}
    >
      <a
        ref={(ref) => {
          connect(drag(ref!));
        }}
        href={href}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
          sizeClass,
          fullWidth && "w-full",
          selected && "ring-2 ring-primary/40 ring-offset-2"
        )}
        style={variantStyle}
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
      <SliderField
        label="Padding X"
        value={parseInt(size === "lg" ? "32" : size === "sm" ? "16" : "24", 10)}
        min={8}
        max={64}
        step={2}
        unit="px"
        onChange={() => {
          /* visual padding is driven by size; this is reserved for future */
        }}
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
  },
  related: {
    settings: CtaButtonSettings,
  },
};