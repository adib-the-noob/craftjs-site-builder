"use client";

import { useNode } from "@craftjs/core";
import { ChevronDownIcon, MenuIcon, SearchIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BackgroundField,
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
import {
  backgroundToCSS,
  borderStyleToCSS,
  hoverToCSS,
  shadowToCSS,
  transformToCSS,
  transitionToCSS,
  type BackgroundValue,
  type BorderValue,
  type HoverValue,
  type ShadowValue,
  type TransformValue,
  type TransitionValue,
} from "@/lib/craft-styles";

/**
 * One nav link in the navbar. Stored as a newline-separated block so we
 * can keep craft node props JSON-serialisable without a nested array
 * (which Craft.js's prop diffing can be picky about):
 *
 *   label1 | href1 | icon1
 *   label2 | href2 | icon2
 *   ...
 *
 * Empty / malformed lines are skipped.
 */
export type NavItem = {
  label: string;
  href: string;
  icon?: string;
};

export function parseNavItems(raw: string | undefined): NavItem[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [label = "", href = "", icon = ""] = line.split("|");
      return {
        label: label.trim(),
        href: href.trim() || "#",
        icon: icon.trim() || undefined,
      };
    })
    .filter((item) => item.label.length > 0);
}

export function serializeNavItems(items: NavItem[]): string {
  return items
    .map((it) =>
      [it.label, it.href, it.icon ?? ""].join("|").replace(/\|+$/, "")
    )
    .join("\n");
}

type NavbarProps = {
  /** Brand text shown on the left. */
  brand?: string;
  /** Single character / emoji used as the brand mark. */
  brandIcon?: string;
  /** Newline-separated `label | href | icon` rows. */
  navItems?: string;
  /** CTA button label shown on the right. Empty hides the button. */
  ctaLabel?: string;
  ctaHref?: string;
  /** Whether the CTA opens in a new tab. */
  ctaNewTab?: boolean;
  /** Layout: where the nav links sit relative to the brand. */
  layout?: "brand-left-links-right" | "brand-left-links-center" | "centered";
  align?: "left" | "right";
  /** Visual style. */
  variant?: "solid" | "transparent" | "bordered" | "floating";
  /** Sticky / floating with backdrop blur. */
  sticky?: boolean;
  /** Search box toggle. */
  enableSearch?: boolean;
  searchPlaceholder?: string;
  /** Announcement bar above navbar. */
  announcement?: string;
  background?: BackgroundValue;
  textColor?: string;
  borderColor?: string;
  /** CTA button colors. */
  ctaBackground?: string;
  ctaTextColor?: string;
  /** Announcement bar color. */
  announcementBackground?: string;
  announcementColor?: string;
  height?: number;
  maxWidth?: number;
  border?: BorderValue;
  borderRadius?: number;
  /** Optional customId for anchor links. */
  customId?: string;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
  shadow?: ShadowValue;
  transform?: TransformValue;
  hover?: HoverValue;
  transition?: TransitionValue;
  opacity?: number;
};

export function Navbar({
  brand = "Acme",
  brandIcon = "",
  navItems = "",
  ctaLabel = "Get started",
  ctaHref = "#",
  ctaNewTab = false,
  layout = "brand-left-links-right",
  align = "left",
  variant = "solid",
  sticky = true,
  enableSearch = false,
  searchPlaceholder = "Search…",
  announcement = "",
  background = { type: "solid", color: "#ffffff" },
  textColor = "#0f172a",
  borderColor = "#e5e7eb",
  ctaBackground = "",
  ctaTextColor = "",
  announcementBackground = "#0f172a",
  announcementColor = "#ffffff",
  height = 72,
  maxWidth = 1200,
  border,
  borderRadius = 0,
  customId = "",
  boxModel,
  shadow,
  transform,
  hover,
  transition,
  opacity = 1,
}: NavbarProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const items = parseNavItems(navItems);

  const isCentered = layout === "centered";
  const linksOnRight = layout === "brand-left-links-right";

  // Resolve CTA color — if empty, invert against navbar bg.
  const resolvedCtaBg = ctaBackground || textColor;
  const resolvedCtaText = ctaTextColor || (typeof background === "string" ? background : background.color || "#ffffff");

  const containerStyle: React.CSSProperties = {
    ...backgroundToCSS(background),
    color: textColor,
    borderBottom:
      variant === "bordered" ? `1px solid ${borderColor}` : undefined,
    border: variant === "floating" ? undefined : undefined,
    borderRadius: variant === "floating" ? borderRadius || 16 : borderRadius,
    ...borderStyleToCSS(border),
    ...boxToStyle(boxModel?.padding, "padding"),
    ...boxToStyle(boxModel?.margin, "margin"),
    ...shadowToCSS(shadow),
    ...transformToCSS(transform),
    ...transitionToCSS(transition),
    opacity,
    ...(hovered ? hoverToCSS(hover) : {}),
  };

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "w-full",
        sticky && variant !== "floating" && "sticky top-0 z-40",
        variant === "floating" && "px-4 py-3",
        selected && "outline outline-2 outline-primary/40 outline-offset-[-2px]"
      )}
      style={containerStyle}
    >
      {announcement && (
        <div
          className="w-full text-center text-xs font-medium"
          style={{
            background: announcementBackground,
            color: announcementColor,
            paddingTop: 8,
            paddingBottom: 8,
          }}
        >
          {announcement}
        </div>
      )}

      <nav
        className={cn(
          "mx-auto flex items-center gap-6 px-6",
          sticky && variant !== "floating" && "supports-[backdrop-filter]:backdrop-blur"
        )}
        style={{
          maxWidth,
          minHeight: height,
        }}
      >
        {/* Brand */}
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className={cn(
            "flex shrink-0 items-center gap-2 font-semibold tracking-tight",
            isCentered && "mx-auto"
          )}
          style={{ fontSize: 18 }}
        >
          {brandIcon && (
            <span
              aria-hidden
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-base"
              style={{
                background: "rgba(15,23,42,0.06)",
                color: textColor,
              }}
            >
              {brandIcon}
            </span>
          )}
          <span>{brand}</span>
        </a>

        {/* Nav links (desktop) */}
        {items.length > 0 && (
          <ul
            className={cn(
              "hidden items-center gap-1 md:flex",
              isCentered && "mx-auto",
              linksOnRight && "ml-auto",
              !isCentered && !linksOnRight && "mx-auto"
            )}
          >
            {items.map((item, idx) => (
              <li key={`${item.label}-${idx}`}>
                <a
                  href={item.href}
                  onClick={(e) => e.preventDefault()}
                  className="group inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium opacity-80 transition-all hover:opacity-100 hover:bg-black/5"
                  style={{ color: textColor }}
                >
                  {item.icon && (
                    <span aria-hidden className="text-base leading-none">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* Search (desktop) */}
        {enableSearch && (
          <div
            className={cn(
              "hidden items-center gap-2 rounded-md border px-3 py-1.5 md:flex",
              isCentered ? "ml-auto" : ""
            )}
            style={{ borderColor, color: textColor }}
          >
            <SearchIcon className="h-3.5 w-3.5" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              className="w-32 bg-transparent text-sm outline-none placeholder:text-current placeholder:opacity-50"
              onClick={(e) => e.preventDefault()}
            />
          </div>
        )}

        {/* Right cluster: CTA + mobile toggle */}
        <div className={cn("flex items-center gap-2", isCentered && "ml-auto")}>
          {ctaLabel && (
            <a
              href={ctaHref}
              target={ctaNewTab ? "_blank" : undefined}
              rel={ctaNewTab ? "noopener noreferrer" : undefined}
              onClick={(e) => {
                if (ctaHref === "#" || ctaHref === "") e.preventDefault();
              }}
              className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                background: resolvedCtaBg,
                color: resolvedCtaText,
              }}
            >
              {ctaLabel}
            </a>
          )}
          {items.length > 0 && (
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={(e) => {
                e.stopPropagation();
                setMobileOpen((v) => !v);
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border md:hidden"
              style={{
                borderColor,
                color: textColor,
                background: "transparent",
              }}
            >
              {mobileOpen ? (
                <XIcon className="h-4 w-4" />
              ) : (
                <MenuIcon className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown */}
      {items.length > 0 && mobileOpen && (
        <div
          className="border-t md:hidden"
          style={{
            borderColor,
            ...backgroundToCSS(background),
          }}
        >
          <ul className="mx-auto flex max-w-[1200px] flex-col px-6 py-3">
            {items.map((item, idx) => (
              <li key={`m-${item.label}-${idx}`}>
                <a
                  href={item.href}
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center gap-2 rounded-md px-2 py-2.5 text-sm font-medium"
                  style={{ color: textColor }}
                >
                  {item.icon && (
                    <span aria-hidden className="text-base leading-none">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function NavbarSettings() {
  const {
    actions: { setProp },
    brand,
    brandIcon,
    navItems,
    ctaLabel,
    ctaHref,
    ctaNewTab,
    layout,
    variant,
    sticky,
    enableSearch,
    searchPlaceholder,
    announcement,
    background,
    textColor,
    borderColor,
    ctaBackground,
    ctaTextColor,
    announcementBackground,
    announcementColor,
    height,
    maxWidth,
    border,
    borderRadius,
    customId,
    boxModel,
    shadow,
    transform,
    hover,
    transition,
    opacity,
  } = useNode((node) => ({
    brand: (node.data.props.brand as string) ?? "",
    brandIcon: (node.data.props.brandIcon as string) ?? "",
    navItems: (node.data.props.navItems as string) ?? "",
    ctaLabel: (node.data.props.ctaLabel as string) ?? "",
    ctaHref: (node.data.props.ctaHref as string) ?? "",
    ctaNewTab: (node.data.props.ctaNewTab as boolean) ?? false,
    layout: (node.data.props.layout as NavbarProps["layout"]) ?? "brand-left-links-right",
    variant: (node.data.props.variant as NavbarProps["variant"]) ?? "solid",
    sticky: (node.data.props.sticky as boolean) ?? true,
    enableSearch: (node.data.props.enableSearch as boolean) ?? false,
    searchPlaceholder: (node.data.props.searchPlaceholder as string) ?? "",
    announcement: (node.data.props.announcement as string) ?? "",
    background: node.data.props.background as NavbarProps["background"],
    textColor: (node.data.props.textColor as string) ?? "#0f172a",
    borderColor: (node.data.props.borderColor as string) ?? "#e5e7eb",
    ctaBackground: (node.data.props.ctaBackground as string) ?? "",
    ctaTextColor: (node.data.props.ctaTextColor as string) ?? "",
    announcementBackground: (node.data.props.announcementBackground as string) ?? "#0f172a",
    announcementColor: (node.data.props.announcementColor as string) ?? "#ffffff",
    height: (node.data.props.height as number) ?? 72,
    maxWidth: (node.data.props.maxWidth as number) ?? 1200,
    border: node.data.props.border as NavbarProps["border"],
    borderRadius: (node.data.props.borderRadius as number) ?? 0,
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as NavbarProps["boxModel"],
    shadow: node.data.props.shadow as NavbarProps["shadow"],
    transform: node.data.props.transform as NavbarProps["transform"],
    hover: node.data.props.hover as NavbarProps["hover"],
    transition: node.data.props.transition as NavbarProps["transition"],
    opacity: (node.data.props.opacity as number) ?? 1,
  })) as any;

  const items = parseNavItems(navItems);
  const updateItem = (idx: number, patch: Partial<NavItem>) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    setProp((props: NavbarProps) => {
      props.navItems = serializeNavItems(next);
    });
  };
  const addItem = () => {
    const next: NavItem[] = [...items, { label: "New link", href: "#" }];
    setProp((props: NavbarProps) => {
      props.navItems = serializeNavItems(next);
    });
  };
  const removeItem = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    setProp((props: NavbarProps) => {
      props.navItems = serializeNavItems(next);
    });
  };

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: NavbarProps) => {
              props.customId = e.target.value;
            })
          }
          placeholder="site-nav"
        />
      </FieldRow>

      <FieldRow label="Brand text">
        <Input
          value={brand}
          onChange={(e) =>
            setProp((props: NavbarProps) => { props.brand = e.target.value; })
          }
          placeholder="Acme"
        />
      </FieldRow>
      <FieldRow label="Brand mark (single emoji or letter)">
        <Input
          value={brandIcon}
          maxLength={2}
          onChange={(e) =>
            setProp((props: NavbarProps) => { props.brandIcon = e.target.value; })
          }
          placeholder="🚀"
        />
      </FieldRow>

      <FieldRow label="Announcement bar (empty to hide)">
        <Input
          value={announcement}
          onChange={(e) =>
            setProp((props: NavbarProps) => { props.announcement = e.target.value; })
          }
          placeholder="🎉 Free shipping on orders over $50"
        />
      </FieldRow>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Nav links</span>
          <button
            type="button"
            onClick={addItem}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium hover:bg-muted"
          >
            + Add link
          </button>
        </div>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No nav links yet. Click "Add link" to insert one.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item, idx) => (
              <div
                key={`${item.label}-${idx}`}
                className="flex flex-col gap-1.5 rounded-md border border-border p-2"
              >
                <div className="grid grid-cols-[1fr_1fr_auto] gap-1.5">
                  <Input
                    value={item.label}
                    placeholder="Label"
                    onChange={(e) => updateItem(idx, { label: e.target.value })}
                  />
                  <Input
                    value={item.href}
                    placeholder="/path"
                    onChange={(e) => updateItem(idx, { href: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="rounded-md border border-border bg-background px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Remove link"
                  >
                    ✕
                  </button>
                </div>
                <Input
                  value={item.icon ?? ""}
                  placeholder="Optional emoji (e.g. ✨)"
                  className="h-8"
                  onChange={(e) => updateItem(idx, { icon: e.target.value || undefined })}
                />
              </div>
            ))}
          </div>
        )}
        <p className="text-[10px] text-muted-foreground">
          Tip: you can also paste lines like
          <span className="font-mono"> Home | / | 🏠</span> below.
        </p>
        <Textarea
          value={navItems}
          rows={4}
          onChange={(e) =>
            setProp((props: NavbarProps) => { props.navItems = e.target.value; })
          }
          placeholder={"Home | /\nDocs | /docs | 📚\nPricing | /pricing"}
        />
      </div>

      <FieldRow label="CTA label (empty to hide)">
        <Input
          value={ctaLabel}
          onChange={(e) =>
            setProp((props: NavbarProps) => { props.ctaLabel = e.target.value; })
          }
          placeholder="Get started"
        />
      </FieldRow>
      <FieldRow label="CTA link">
        <Input
          value={ctaHref}
          onChange={(e) =>
            setProp((props: NavbarProps) => { props.ctaHref = e.target.value; })
          }
          placeholder="https://..."
        />
      </FieldRow>
      <ToggleField
        label="Open CTA in new tab"
        value={ctaNewTab}
        onChange={(v) =>
          setProp((props: NavbarProps) => { props.ctaNewTab = v; })
        }
      />

      <ToggleField
        label="Show search"
        value={enableSearch}
        onChange={(v) =>
          setProp((props: NavbarProps) => { props.enableSearch = v; })
        }
      />
      {enableSearch && (
        <FieldRow label="Search placeholder">
          <Input
            value={searchPlaceholder}
            onChange={(e) =>
              setProp((props: NavbarProps) => { props.searchPlaceholder = e.target.value; })
            }
          />
        </FieldRow>
      )}

      <SelectField
        label="Layout"
        value={layout}
        onChange={(v) =>
          setProp((props: NavbarProps) => { props.layout = v as NavbarProps["layout"]; })
        }
        options={[
          { value: "brand-left-links-right", label: "Brand left, links right" },
          { value: "brand-left-links-center", label: "Brand left, links centered" },
          { value: "centered", label: "Brand centered" },
        ]}
      />

      <SelectField
        label="Visual variant"
        value={variant}
        onChange={(v) =>
          setProp((props: NavbarProps) => { props.variant = v as NavbarProps["variant"]; })
        }
        options={[
          { value: "solid", label: "Solid (with shadow)" },
          { value: "transparent", label: "Transparent" },
          { value: "bordered", label: "Bordered" },
          { value: "floating", label: "Floating pill" },
        ]}
      />

      <ToggleField
        label="Sticky to top"
        value={sticky}
        onChange={(v) =>
          setProp((props: NavbarProps) => { props.sticky = v; })
        }
      />

      <BackgroundField
        label="Background"
        value={background}
        onChange={(v) =>
          setProp((props: NavbarProps) => { props.background = v; })
        }
      />
      <ColorField
        label="Text color"
        value={textColor}
        onChange={(v) =>
          setProp((props: NavbarProps) => { props.textColor = v; })
        }
      />
      <ColorField
        label="Border color"
        value={borderColor}
        onChange={(v) =>
          setProp((props: NavbarProps) => { props.borderColor = v; })
        }
      />
      <ColorField
        label="CTA background (empty = auto)"
        value={ctaBackground}
        onChange={(v) =>
          setProp((props: NavbarProps) => { props.ctaBackground = v; })
        }
      />
      <ColorField
        label="CTA text color (empty = auto)"
        value={ctaTextColor}
        onChange={(v) =>
          setProp((props: NavbarProps) => { props.ctaTextColor = v; })
        }
      />
      <ColorField
        label="Announcement bar background"
        value={announcementBackground}
        onChange={(v) =>
          setProp((props: NavbarProps) => { props.announcementBackground = v; })
        }
      />
      <ColorField
        label="Announcement bar text color"
        value={announcementColor}
        onChange={(v) =>
          setProp((props: NavbarProps) => { props.announcementColor = v; })
        }
      />

      <SliderField
        label="Bar height"
        value={height}
        min={48}
        max={120}
        unit="px"
        onChange={(v) =>
          setProp((props: NavbarProps) => { props.height = v; })
        }
      />
      <SliderField
        label="Inner max width"
        value={maxWidth}
        min={640}
        max={1600}
        step={20}
        onChange={(v) =>
          setProp((props: NavbarProps) => { props.maxWidth = v; })
        }
      />
      <SliderField
        label="Border radius (for floating variant)"
        value={borderRadius}
        min={0}
        max={48}
        onChange={(v) =>
          setProp((props: NavbarProps) => { props.borderRadius = v; })
        }
      />
      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: NavbarProps) => { props.boxModel = v; })
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
              setProp((props: NavbarProps) => { props.border = v; })
            }
          />
          <ShadowField
            label="Shadow"
            value={shadow}
            onChange={(v) =>
              setProp((props: NavbarProps) => { props.shadow = v; })
            }
          />
          <HoverField
            value={hover}
            onChange={(v) =>
              setProp((props: NavbarProps) => { props.hover = v; })
            }
          />
          <TransitionField
            value={transition}
            onChange={(v) =>
              setProp((props: NavbarProps) => { props.transition = v; })
            }
          />
          <TransformField
            value={transform}
            onChange={(v) =>
              setProp((props: NavbarProps) => { props.transform = v; })
            }
          />
          <OpacityField
            value={opacity}
            onChange={(v) =>
              setProp((props: NavbarProps) => { props.opacity = v; })
            }
          />
        </>
      )}
    </div>
  );
}

Navbar.craft = {
  displayName: "Navbar",
  props: {
    brand: "Acme",
    brandIcon: "🚀",
    navItems: serializeNavItems([
      { label: "Home", href: "/" },
      { label: "Docs", href: "/docs" },
      { label: "Pricing", href: "/pricing" },
      { label: "About", href: "/about" },
    ]),
    ctaLabel: "Get started",
    ctaHref: "#",
    ctaNewTab: false,
    layout: "brand-left-links-right",
    variant: "solid",
    sticky: true,
    enableSearch: false,
    searchPlaceholder: "Search…",
    announcement: "",
    background: { type: "solid", color: "#ffffff" },
    textColor: "#0f172a",
    borderColor: "#e5e7eb",
    ctaBackground: "",
    ctaTextColor: "",
    announcementBackground: "#0f172a",
    announcementColor: "#ffffff",
    height: 72,
    maxWidth: 1200,
    border: undefined,
    borderRadius: 0,
    customId: "",
    boxModel: undefined,
    shadow: undefined,
    transform: undefined,
    hover: undefined,
    transition: undefined,
    opacity: 1,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
    canMoveOut: () => true,
  },
  related: {
    settings: NavbarSettings,
  },
};