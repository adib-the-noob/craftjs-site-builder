"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Editor, Frame } from "@craftjs/core";

import { RenderNode } from "@/components/editor/RenderNode";
import { EDITOR_FONT_CLASSNAMES } from "@/components/editor/EditorFontsProvider";
import { resolver } from "@/lib/resolver";
import {
  getHomePageTree,
  readSitePages,
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

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft preview",
  published: "Published",
};

export function SitePreview({ site, page }: Props) {
  // Resolve the tree to render. If a `page` is supplied, use its data;
  // otherwise fall back to the home page (handles legacy single-tree
  // sites via `getHomePageTree`).
  const tree = useMemo(() => {
    if (page) return page.data;
    // No explicit page — keep the existing behaviour (home or legacy).
    return getHomePageTree(site);
  }, [site, page]);

  const resolvedPage = useMemo<SitePage | null>(() => {
    if (page) return page;
    const pages = readSitePages(site);
    return pages.find((p) => p.isHome) ?? pages[0] ?? null;
  }, [site, page]);

  const serialized = useMemo(() => JSON.stringify(tree ?? {}), [tree]);
  const rootBackground = useMemo(() => getRootBackground(tree), [tree]);
  const statusLabel = STATUS_LABEL[site.status] ?? site.status;

  return (
    <div className={`min-h-screen flex flex-col bg-background ${EDITOR_FONT_CLASSNAMES}`}>
      <header className="border-b bg-muted/40">
        <div className="flex items-center justify-between gap-3 px-4 py-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-mono text-foreground/80">{site.slug}</span>
            <span aria-hidden>·</span>
            <span>{statusLabel}</span>
            {resolvedPage && !resolvedPage.isHome && (
              <>
                <span aria-hidden>·</span>
                <span className="font-mono">/{resolvedPage.slug}</span>
              </>
            )}
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
