"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { SliderField } from "@/components/craft/settings/SliderField";
import { ToggleField } from "@/components/craft/settings/ToggleField";
import { AlignField } from "@/components/craft/settings/AlignField";

type VideoProps = {
  url?: string;
  height?: number;
  rounded?: boolean;
  autoplay?: boolean;
  align?: "left" | "center" | "right";
  customId?: string;
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
  autoplay = false,
  align = "center",
  customId = "",
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
      style={{ textAlign: align }}
      id={customId || undefined}
      className="w-full"
    >
      <div
        ref={(ref) => {
          connect(drag(ref!));
        }}
        className={cn(
          "mx-auto w-full overflow-hidden",
          rounded && "rounded-xl",
          selected && "ring-2 ring-primary/40 ring-offset-2"
        )}
        style={{ height, maxWidth: "100%" }}
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
    autoplay,
    align,
    customId,
  } = useNode((node) => ({
    url: node.data.props.url as string,
    height: node.data.props.height as number,
    rounded: node.data.props.rounded as boolean,
    autoplay: node.data.props.autoplay as boolean,
    align: node.data.props.align as VideoProps["align"],
    customId: (node.data.props.customId as string) ?? "",
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
      <ToggleField
        label="Autoplay (muted browsers may block)"
        value={autoplay}
        onChange={(v) =>
          setProp((props: VideoProps) => {
            props.autoplay = v;
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
    autoplay: false,
    align: "center",
    customId: "",
  },
  related: {
    settings: VideoSettings,
  },
};