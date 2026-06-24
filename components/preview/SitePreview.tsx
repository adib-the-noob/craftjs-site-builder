"use client";

import { useMemo } from "react";

import { Editor, Frame } from "@craftjs/core";

import { RenderNode } from "@/components/editor/RenderNode";
import { EDITOR_FONT_CLASSNAMES } from "@/components/editor/EditorFontsProvider";
import { FloatingOwnerBar } from "@/components/preview/FloatingOwnerBar";
import { resolver } from "@/lib/resolver";
import {
  getHomePageTree,
  type Site,
  type SitePage,
} from "@/lib/sites";

type Props = {
  site: Site;
  /**
   * Which page to render. Defaults to the home page (preserves the
   * legacy `/preview/[slug]` route behaviour). Pass a specific page
   * from `/preview/[siteSlug]/[pageSlug]`.
   */
  page?: SitePage | null;
};

function getRootBackground(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const root = (data as Record<string, { props?: Record<string, unknown> }>)
    .ROOT;
  const bg = root?.props?.background;
  return typeof bg === "string" ? bg : undefined;
}

export function SitePreview({ site, page }: Props) {
  // Resolve the tree to render. If a `page` is supplied, use its data;
  // otherwise fall back to the home page (handles legacy single-tree
  // sites via `getHomePageTree`).
  const tree = useMemo(() => {
    if (page) return page.data;
    // No explicit page — keep the existing behaviour (home or legacy).
    return getHomePageTree(site);
  }, [site, page]);

  const serialized = useMemo(() => JSON.stringify(tree ?? {}), [tree]);
  const rootBackground = useMemo(() => getRootBackground(tree), [tree]);

  return (
    <div
      className={`min-h-screen flex flex-col bg-background ${EDITOR_FONT_CLASSNAMES}`}
    >
      {/*
        The old top header bar is gone. We render only the canvas;
        the floating chip in <FloatingOwnerBar> handles status +
        quick actions for owners and is hidden from anonymous
        visitors.
      */}
      <main
        className="flex-1"
        style={rootBackground ? { background: rootBackground } : undefined}
      >
        <Editor enabled={false} resolver={resolver} onRender={RenderNode}>
          <Frame data={serialized} />
        </Editor>
      </main>

      {/* Floating owner controls (renders nothing for non-owners). */}
      <FloatingOwnerBar site={site} />
    </div>
  );
}
