"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Editor, Frame } from "@craftjs/core";

import { RenderNode } from "@/components/editor/RenderNode";
import { resolver } from "@/lib/resolver";
import type { Site } from "@/lib/sites";

type Props = {
  site: Site;
};

function getRootBackground(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const root = (data as Record<string, { props?: Record<string, unknown> }>)
    .ROOT;
  const bg = root?.props?.background;
  return typeof bg === "string" ? bg : undefined;
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft preview",
  published: "Published",
};

export function SitePreview({ site }: Props) {
  const serialized = useMemo(
    () => JSON.stringify(site.site_data ?? {}),
    [site.site_data],
  );
  const rootBackground = useMemo(
    () => getRootBackground(site.site_data),
    [site.site_data],
  );
  const statusLabel = STATUS_LABEL[site.status] ?? site.status;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-muted/40">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-mono text-foreground/80">{site.slug}</span>
            <span aria-hidden>·</span>
            <span>{statusLabel}</span>
          </div>
          <Link
            href={`/editor/${site.slug}`}
            className="text-foreground underline-offset-4 hover:underline"
          >
            Open in editor →
          </Link>
        </div>
      </header>

      <main
        className="flex-1"
        style={rootBackground ? { background: rootBackground } : undefined}
      >
        <Editor
          enabled={false}
          resolver={resolver}
          onRender={RenderNode}
        >
          <Frame data={serialized} />
        </Editor>
      </main>
    </div>
  );
}
