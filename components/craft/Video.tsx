"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { SliderField } from "@/components/craft/settings/SliderField";
import { ToggleField } from "@/components/craft/settings/ToggleField";
import { AlignField } from "@/components/craft/settings/AlignField";
import { BoxModelField, boxToStyle } from "@/components/craft/settings/BoxModelField";

type VideoProps = {
  url?: string;
  height?: number;
  rounded?: boolean;
  borderRadius?: number;
  autoplay?: boolean;
  align?: "left" | "center" | "right";
  customId?: string;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
};

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  // Already an embed URL or a direct file
  return url;
}

export function Video({
  url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  height = 420,
  rounded = true,
  borderRadius = 12,
  autoplay = false,
  align = "center",
  customId = "",
  boxModel,
}: VideoProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const embed = getEmbedUrl(url);

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      className="w-full"
      style={{
        textAlign: align,
        ...boxToStyle(boxModel?.padding, "padding"),
        ...boxToStyle(boxModel?.margin, "margin"),
      }}
    >
      <div
        className={cn(
          "mx-auto w-full overflow-hidden",
          rounded && "rounded-xl",
          selected && "ring-2 ring-primary/40 ring-offset-2"
        )}
        style={{
          height,
          maxWidth: "100%",
          borderRadius: rounded ? borderRadius : 0,
        }}
      >
        {embed ? (
          <iframe
            src={
              embed +
              (autoplay ? (embed.includes("?") ? "&autoplay=1" : "?autoplay=1") : "")
            }
            title="Embedded video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
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
    rounded,
    borderRadius,
    autoplay,
    align,
    customId,
    boxModel,
  } = useNode((node) => ({
    url: node.data.props.url as string,
    height: node.data.props.height as number,
    rounded: node.data.props.rounded as boolean,
    borderRadius: (node.data.props.borderRadius as number) ?? 12,
    autoplay: node.data.props.autoplay as boolean,
    align: node.data.props.align as VideoProps["align"],
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as VideoProps["boxModel"],
  })) as any;

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: VideoProps) => {
              props.customId = e.target.value;
            })
          }
          placeholder="video-1"
        />
      </FieldRow>
      <FieldRow label="Video URL (YouTube, Vimeo, or direct file)">
        <Input
          value={url}
          onChange={(e) =>
            setProp((props: VideoProps) => {
              props.url = e.target.value;
            })
          }
          placeholder="https://..."
        />
      </FieldRow>
      <SliderField
        label="Height"
        value={height}
        min={180}
        max={720}
        step={20}
        onChange={(v) =>
          setProp((props: VideoProps) => {
            props.height = v;
          })
        }
      />
      <AlignField
        label="Alignment"
        value={align}
        onChange={(v) =>
          setProp((props: VideoProps) => {
            props.align = v;
          })
        }
      />
      <ToggleField
        label="Rounded corners"
        value={rounded}
        onChange={(v) =>
          setProp((props: VideoProps) => {
            props.rounded = v;
          })
        }
      />
      <SliderField
        label="Border radius"
        value={borderRadius}
        min={0}
        max={48}
        onChange={(v) =>
          setProp((props: VideoProps) => {
            props.borderRadius = v;
          })
        }
      />
      <ToggleField
        label="Autoplay (muted browsers may block)"
        value={autoplay}
        onChange={(v) =>
          setProp((props: VideoProps) => {
            props.autoplay = v;
          })
        }
      />
      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: VideoProps) => {
            props.boxModel = v;
          })
        }
      />
    </div>
  );
}

Video.craft = {
  displayName: "Video",
  props: {
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    height: 420,
    rounded: true,
    borderRadius: 12,
    autoplay: false,
    align: "center",
    customId: "",
    boxModel: undefined,
  },
  related: {
    settings: VideoSettings,
  },
};