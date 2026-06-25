"use client";

import { useNode } from "@craftjs/core";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  BoxModelField,
  ColorField,
  HoverField,
  ShadowField,
  SliderField,
  ToggleField,
  TransformField,
  TransitionField,
  boxToStyle,
  SelectField,
  AlignField,
  FontField,
} from "@/components/craft/settings";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import {
  hoverToCSS,
  shadowToCSS,
  transformToCSS,
  transitionToCSS,
  type HoverValue,
  type ShadowValue,
  type TransformValue,
  type TransitionValue,
} from "@/lib/craft-styles";

type CtaButtonProps = {
  text?: string;
  href?: string;
  variant?: "primary" | "outline" | "ghost" | "soft" | "gradient";
  size?: "sm" | "md" | "lg" | "xl" | "custom";
  /** Custom height in px, used when size === "custom". */
  customHeight?: number;
  /** Custom horizontal padding in px, used when size === "custom". */
  customPaddingX?: number;
  /** Custom font size in px, used when size === "custom". */
  customFontSize?: number;
  align?: "left" | "center" | "right";
  fullWidth?: boolean;
  background?: string;
  textColor?: string;
  /** Secondary colour for gradient variant. */
  gradientEnd?: string;
  /** Optional icon name (lucide). */
  iconLeft?: string;
  iconRight?: string;
  /** Open link in new tab. */
  newTab?: boolean;
  /** Apply `download` attribute to the link. */
  download?: boolean;
  customId?: string;
  /** Tailwind-style box model — applied to the outer wrapper. */
  boxModel?: { margin?: any; padding?: any };
  borderRadius?: number;
  fontFamily?: string;
  fontWeight?: number;
  letterSpacing?: number;
  textCase?: "none" | "uppercase" | "lowercase" | "capitalize";
  shadow?: ShadowValue;
  transform?: TransformValue;
  hover?: HoverValue;
  transition?: TransitionValue;
  opacity?: number;
};

export function CtaButton({
  text = "Get started",
  href = "#",
  variant = "primary",
  size = "md",
  customHeight = 44,
  customPaddingX = 20,
  customFontSize = 15,
  align = "left",
  fullWidth = false,
  background = "#0f172a",
  textColor = "#ffffff",
  gradientEnd = "#6366f1",
  iconLeft = "",
  iconRight = "",
  newTab = false,
  download = false,
  customId = "",
  boxModel,
  borderRadius = 8,
  fontFamily = "",
  fontWeight = 500,
  letterSpacing = 0,
  textCase = "none",
  shadow,
  transform,
  hover,
  transition,
  opacity = 1,
}: CtaButtonProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const sizeStyle =
    size === "sm"
      ? { height: 32, padding: "0 14px", fontSize: 12 }
      : size === "lg"
        ? { height: 52, padding: "0 28px", fontSize: 16 }
        : size === "xl"
          ? { height: 60, padding: "0 36px", fontSize: 18 }
          : size === "custom"
            ? {
                height: customHeight,
                padding: `0 ${customPaddingX}px`,
                fontSize: customFontSize,
              }
            : { height: 40, padding: "0 20px", fontSize: 14 };

  const variantStyle =
    variant === "primary"
      ? { background, color: textColor, border: "none" }
      : variant === "outline"
        ? {
            backgroundColor: "transparent",
            color: background,
            border: `1px solid ${background}`,
          }
        : variant === "ghost"
          ? { backgroundColor: "transparent", color: background, border: "none" }
          : variant === "gradient"
            ? {
                background: `linear-gradient(135deg, ${background}, ${gradientEnd})`,
                color: textColor,
                border: "none",
              }
            : {
                // soft
                backgroundColor: background + "1A", // ~10% alpha
                color: background,
                border: "none",
              };

  const [hovered, setHovered] = useState(false);

  const buttonStyle: React.CSSProperties = {
    ...variantStyle,
    borderRadius,
    height: sizeStyle.height,
    padding: sizeStyle.padding,
    fontSize: sizeStyle.fontSize,
    fontWeight,
    letterSpacing,
    textTransform:
      textCase === "none" ? undefined : (textCase as CSSStyleDeclaration["textTransform"]),
    opacity,
    fontFamily: fontFamily || undefined,
    ...shadowToCSS(shadow),
    ...transformToCSS(transform),
    ...transitionToCSS(transition),
    ...(hovered ? hoverToCSS(hover) : {}),
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
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        download={download || undefined}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-colors no-underline",
          fullWidth && "w-full",
          selected && "ring-2 ring-primary/40 ring-offset-2"
        )}
        style={buttonStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          if (href === "#" || href === "") e.preventDefault();
        }}
      >
        {iconLeft && <span aria-hidden>{iconLeft}</span>}
        {text}
        {iconRight && <span aria-hidden>{iconRight}</span>}
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
    customHeight,
    customPaddingX,
    customFontSize,
    align,
    fullWidth,
    background,
    textColor,
    gradientEnd,
    iconLeft,
    iconRight,
    newTab,
    download,
    customId,
    boxModel,
    borderRadius,
    fontFamily,
    fontWeight,
    letterSpacing,
    textCase,
    shadow,
    transform,
    hover,
    transition,
    opacity,
  } = useNode((node) => ({
    text: (node.data.props.text as string) ?? "Get started",
    href: (node.data.props.href as string) ?? "#",
    variant: node.data.props.variant as CtaButtonProps["variant"],
    size: (node.data.props.size as CtaButtonProps["size"]) ?? "md",
    customHeight: (node.data.props.customHeight as number) ?? 44,
    customPaddingX: (node.data.props.customPaddingX as number) ?? 20,
    customFontSize: (node.data.props.customFontSize as number) ?? 15,
    align: node.data.props.align as CtaButtonProps["align"],
    fullWidth: (node.data.props.fullWidth as boolean) ?? false,
    background: (node.data.props.background as string) ?? "#0f172a",
    textColor: (node.data.props.textColor as string) ?? "#ffffff",
    gradientEnd: (node.data.props.gradientEnd as string) ?? "#6366f1",
    iconLeft: (node.data.props.iconLeft as string) ?? "",
    iconRight: (node.data.props.iconRight as string) ?? "",
    newTab: (node.data.props.newTab as boolean) ?? false,
    download: (node.data.props.download as boolean) ?? false,
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as CtaButtonProps["boxModel"],
    borderRadius: (node.data.props.borderRadius as number) ?? 8,
    fontFamily: (node.data.props.fontFamily as string) ?? "",
    fontWeight: (node.data.props.fontWeight as number) ?? 500,
    letterSpacing: (node.data.props.letterSpacing as number) ?? 0,
    textCase: (node.data.props.textCase as CtaButtonProps["textCase"]) ?? "none",
    shadow: node.data.props.shadow as CtaButtonProps["shadow"],
    transform: node.data.props.transform as CtaButtonProps["transform"],
    hover: node.data.props.hover as CtaButtonProps["hover"],
    transition: node.data.props.transition as CtaButtonProps["transition"],
    opacity: (node.data.props.opacity as number) ?? 1,
  })) as any;

  const [showAdvanced, setShowAdvanced] = useState(false);

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
      <ToggleField
        label="Open in new tab"
        value={newTab}
        onChange={(v) =>
          setProp((props: CtaButtonProps) => { props.newTab = v; })
        }
      />
      <ToggleField
        label="Download attribute"
        value={download}
        onChange={(v) =>
          setProp((props: CtaButtonProps) => { props.download = v; })
        }
      />

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
          { value: "soft", label: "Soft (tinted)" },
          { value: "gradient", label: "Gradient" },
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
          { value: "sm", label: "Small (32)" },
          { value: "md", label: "Medium (40)" },
          { value: "lg", label: "Large (52)" },
          { value: "xl", label: "Extra large (60)" },
          { value: "custom", label: "Custom" },
        ]}
      />

      {size === "custom" && (
        <>
          <SliderField label="Height" value={customHeight} min={24} max={120} unit="px" onChange={(v) =>
            setProp((props: CtaButtonProps) => { props.customHeight = v; })
          } />
          <SliderField label="Padding X" value={customPaddingX} min={4} max={80} unit="px" onChange={(v) =>
            setProp((props: CtaButtonProps) => { props.customPaddingX = v; })
          } />
          <SliderField label="Font size" value={customFontSize} min={10} max={32} unit="px" onChange={(v) =>
            setProp((props: CtaButtonProps) => { props.customFontSize = v; })
          } />
        </>
      )}

      <AlignField
        label="Alignment"
        value={align}
        onChange={(v) =>
          setProp((props: CtaButtonProps) => { props.align = v; })
        }
      />
      <ToggleField
        label="Full width"
        value={fullWidth}
        onChange={(v) =>
          setProp((props: CtaButtonProps) => { props.fullWidth = v; })
        }
      />
      <ColorField
        label="Background color"
        value={background}
        onChange={(v) =>
          setProp((props: CtaButtonProps) => { props.background = v; })
        }
      />
      <ColorField
        label="Text color"
        value={textColor}
        onChange={(v) =>
          setProp((props: CtaButtonProps) => { props.textColor = v; })
        }
      />
      {variant === "gradient" && (
        <ColorField
          label="Gradient end color"
          value={gradientEnd}
          onChange={(v) =>
            setProp((props: CtaButtonProps) => { props.gradientEnd = v; })
          }
        />
      )}

      <FieldRow label="Icon (left)">
        <Input
          value={iconLeft}
          onChange={(e) =>
            setProp((props: CtaButtonProps) => { props.iconLeft = e.target.value; })
          }
          placeholder="→ or any character / emoji"
        />
      </FieldRow>
      <FieldRow label="Icon (right)">
        <Input
          value={iconRight}
          onChange={(e) =>
            setProp((props: CtaButtonProps) => { props.iconRight = e.target.value; })
          }
          placeholder="→ or any character / emoji"
        />
      </FieldRow>

      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: CtaButtonProps) => { props.boxModel = v; })
        }
      />
      <SliderField
        label="Border radius"
        value={borderRadius}
        min={0}
        max={48}
        onChange={(v) =>
          setProp((props: CtaButtonProps) => { props.borderRadius = v; })
        }
      />
      <FontField
        label="Font"
        value={fontFamily}
        onChange={(v) =>
          setProp((props: CtaButtonProps) => { props.fontFamily = v; })
        }
      />
      <SliderField
        label="Font weight"
        value={fontWeight}
        min={100}
        max={900}
        step={100}
        unit=""
        onChange={(v) =>
          setProp((props: CtaButtonProps) => { props.fontWeight = v; })
        }
      />
      <SliderField
        label="Letter spacing"
        value={letterSpacing}
        min={-2}
        max={10}
        unit="px"
        onChange={(v) =>
          setProp((props: CtaButtonProps) => { props.letterSpacing = v; })
        }
      />
      <SelectField
        label="Text case"
        value={textCase}
        onChange={(v) =>
          setProp((props: CtaButtonProps) => { props.textCase = v as CtaButtonProps["textCase"]; })
        }
        options={[
          { value: "none", label: "As written" },
          { value: "uppercase", label: "UPPERCASE" },
          { value: "lowercase", label: "lowercase" },
          { value: "capitalize", label: "Capitalize" },
        ]}
      />

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="rounded-md border border-dashed py-1 text-[10px] text-muted-foreground hover:border-foreground hover:text-foreground"
      >
        {showAdvanced ? "▾ Hide advanced" : "▸ Show advanced (shadow, transform, hover)"}
      </button>

      {showAdvanced && (
        <>
          <ShadowField
            label="Shadow"
            value={shadow}
            onChange={(v) =>
              setProp((props: CtaButtonProps) => { props.shadow = v; })
            }
          />
          <TransformField
            value={transform}
            onChange={(v) =>
              setProp((props: CtaButtonProps) => { props.transform = v; })
            }
          />
          <HoverField
            value={hover}
            onChange={(v) =>
              setProp((props: CtaButtonProps) => { props.hover = v; })
            }
          />
          <TransitionField
            value={transition}
            onChange={(v) =>
              setProp((props: CtaButtonProps) => { props.transition = v; })
            }
          />
          <SliderField
            label="Opacity"
            value={opacity * 100}
            min={0}
            max={100}
            step={1}
            unit="%"
            onChange={(v) =>
              setProp((props: CtaButtonProps) => { props.opacity = v / 100; })
            }
          />
        </>
      )}
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
    customHeight: 44,
    customPaddingX: 20,
    customFontSize: 15,
    align: "left",
    fullWidth: false,
    background: "#0f172a",
    textColor: "#ffffff",
    gradientEnd: "#6366f1",
    iconLeft: "",
    iconRight: "",
    newTab: false,
    download: false,
    customId: "",
    boxModel: undefined,
    borderRadius: 8,
    fontFamily: "",
    fontWeight: 500,
    letterSpacing: 0,
    textCase: "none",
    shadow: undefined,
    transform: undefined,
    hover: undefined,
    transition: undefined,
    opacity: 1,
  },
  related: {
    settings: CtaButtonSettings,
  },
};