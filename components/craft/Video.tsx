"use client";

import { useNode } from "@craftjs/core";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import {
  AlignField,
  BoxModelField,
  BorderField,
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

type VideoProps = {
  url?: string;
  height?: number;
  /** Aspect ratio. 0 = use height. Otherwise computed from width. */
  aspectRatio?: number; // 0 = off, 16/9 = 1.777, 4/3 = 1.333, etc.
  rounded?: boolean;
  borderRadius?: number;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  align?: "left" | "center" | "right";
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

function getEmbedUrl(url: string): { type: "youtube" | "vimeo" | "file" | null; src: string } {
  if (!url) return { type: null, src: "" };
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/
  );
  if (ytMatch) {
    return { type: "youtube", src: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { type: "vimeo", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }
  return { type: "file", src: url };
}

export function Video({
  url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  height = 420,
  aspectRatio = 0,
  rounded = true,
  borderRadius = 12,
  autoplay = false,
  muted = true,
  loop = false,
  controls = true,
  align = "center",
  customId = "",
  boxModel,
  border,
  shadow,
  transform,
  hover,
  transition,
  opacity = 1,
}: VideoProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const [hovered, setHovered] = useState(false);
  const { type, src } = getEmbedUrl(url);

  // Build the iframe src with autoplay / loop / mute params.
  const buildEmbedSrc = () => {
    if (type !== "youtube" && type !== "vimeo") return src;
    const params: string[] = [];
    if (autoplay) params.push("autoplay=1");
    if (muted) params.push("mute=1");
    if (loop) params.push("loop=1");
    if (!controls) params.push("controls=0");
    if (type === "youtube" && loop) {
      // YouTube needs the playlist=VIDEO_ID hack for looping a single video.
      const ytIdMatch = src.match(/\/embed\/([\w-]{6,})/);
      if (ytIdMatch) params.push(`playlist=${ytIdMatch[1]}`);
    }
    if (params.length === 0) return src;
    return `${src}${src.includes("?") ? "&" : "?"}${params.join("&")}`;
  };

  const containerStyle: React.CSSProperties = {
    height: aspectRatio > 0 ? undefined : height,
    aspectRatio: aspectRatio > 0 ? `${aspectRatio}` : undefined,
    borderRadius: rounded ? borderRadius : 0,
    ...borderStyleToCSS(border),
    ...shadowToCSS(shadow),
    ...transformToCSS(transform),
    ...transitionToCSS(transition),
    ...(hovered ? hoverToCSS(hover) : {}),
    opacity,
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
        "mx-auto w-full overflow-hidden",
        selected && "ring-2 ring-primary/40 ring-offset-2"
      )}
      style={{
        textAlign: align,
        ...boxToStyle(boxModel?.padding, "padding"),
        ...boxToStyle(boxModel?.margin, "margin"),
      }}
    >
      <div className="w-full" style={containerStyle}>
        {src ? (
          type === "file" ? (
            <video
              src={src}
              controls={controls}
              autoPlay={autoplay}
              muted={muted}
              loop={loop}
              playsInline
              className="h-full w-full"
            />
          ) : (
            <iframe
              src={buildEmbedSrc()}
              title="Embedded video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
            No video URL set
          </div>
        )}
      </div>
    </div>
  );
}

function VideoSettings() {
  const {
    actions: { setProp },
    url,
    height,
    aspectRatio,
    rounded,
    borderRadius,
    autoplay,
    muted,
    loop,
    controls,
    align,
    customId,
    boxModel,
    border,
    shadow,
    transform,
    hover,
    transition,
    opacity,
  } = useNode((node) => ({
    url: (node.data.props.url as string) ?? "",
    height: (node.data.props.height as number) ?? 420,
    aspectRatio: (node.data.props.aspectRatio as number) ?? 0,
    rounded: (node.data.props.rounded as boolean) ?? true,
    borderRadius: (node.data.props.borderRadius as number) ?? 12,
    autoplay: (node.data.props.autoplay as boolean) ?? false,
    muted: (node.data.props.muted as boolean) ?? true,
    loop: (node.data.props.loop as boolean) ?? false,
    controls: (node.data.props.controls as boolean) ?? true,
    align: node.data.props.align as VideoProps["align"],
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as VideoProps["boxModel"],
    border: node.data.props.border as VideoProps["border"],
    shadow: node.data.props.shadow as VideoProps["shadow"],
    transform: node.data.props.transform as VideoProps["transform"],
    hover: node.data.props.hover as VideoProps["hover"],
    transition: node.data.props.transition as VideoProps["transition"],
    opacity: (node.data.props.opacity as number) ?? 1,
  })) as any;

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: VideoProps) => { props.customId = e.target.value; })
          }
          placeholder="video-1"
        />
      </FieldRow>
      <FieldRow label="Video URL (YouTube, Vimeo, or direct file)">
        <Input
          value={url}
          onChange={(e) =>
            setProp((props: VideoProps) => { props.url = e.target.value; })
          }
          placeholder="https://..."
        />
      </FieldRow>
      <SliderField
        label="Height"
        value={height}
        min={120}
        max={800}
        step={20}
        onChange={(v) =>
          setProp((props: VideoProps) => { props.height = v; })
        }
      />
      <SelectField
        label="Aspect ratio"
        value={String(aspectRatio)}
        onChange={(v) =>
          setProp((props: VideoProps) => {
            props.aspectRatio = v === "0" ? 0 : Number(v);
          })
        }
        options={[
          { value: "0", label: "Custom height" },
          { value: "1.777", label: "16:9" },
          { value: "1.333", label: "4:3" },
          { value: "1", label: "1:1 (square)" },
          { value: "0.5625", label: "9:16 (vertical)" },
          { value: "2.35", label: "Cinematic" },
        ]}
      />
      <AlignField
        label="Alignment"
        value={align}
        onChange={(v) =>
          setProp((props: VideoProps) => { props.align = v; })
        }
      />
      <ToggleField
        label="Rounded corners"
        value={rounded}
        onChange={(v) =>
          setProp((props: VideoProps) => { props.rounded = v; })
        }
      />
      <SliderField
        label="Border radius"
        value={borderRadius}
        min={0}
        max={48}
        onChange={(v) =>
          setProp((props: VideoProps) => { props.borderRadius = v; })
        }
      />
      <div className="grid grid-cols-2 gap-2">
        <ToggleField
          label="Autoplay"
          value={autoplay}
          onChange={(v) =>
            setProp((props: VideoProps) => { props.autoplay = v; })
          }
        />
        <ToggleField
          label="Muted"
          value={muted}
          onChange={(v) =>
            setProp((props: VideoProps) => { props.muted = v; })
          }
        />
        <ToggleField
          label="Loop"
          value={loop}
          onChange={(v) =>
            setProp((props: VideoProps) => { props.loop = v; })
          }
        />
        <ToggleField
          label="Show controls"
          value={controls}
          onChange={(v) =>
            setProp((props: VideoProps) => { props.controls = v; })
          }
        />
      </div>
      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: VideoProps) => { props.boxModel = v; })
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
              setProp((props: VideoProps) => { props.border = v; })
            }
          />
          <ShadowField
            label="Shadow"
            value={shadow}
            onChange={(v) =>
              setProp((props: VideoProps) => { props.shadow = v; })
            }
          />
          <HoverField
            value={hover}
            onChange={(v) =>
              setProp((props: VideoProps) => { props.hover = v; })
            }
          />
          <TransitionField
            value={transition}
            onChange={(v) =>
              setProp((props: VideoProps) => { props.transition = v; })
            }
          />
          <TransformField
            value={transform}
            onChange={(v) =>
              setProp((props: VideoProps) => { props.transform = v; })
            }
          />
          <OpacityField
            value={opacity}
            onChange={(v) =>
              setProp((props: VideoProps) => { props.opacity = v; })
            }
          />
        </>
      )}
    </div>
  );
}

Video.craft = {
  displayName: "Video",
  props: {
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    height: 420,
    aspectRatio: 0,
    rounded: true,
    borderRadius: 12,
    autoplay: false,
    muted: true,
    loop: false,
    controls: true,
    align: "center",
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
    settings: VideoSettings,
  },
};