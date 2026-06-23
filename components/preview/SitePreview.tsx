"use client";

import { Editor, Frame } from "@craftjs/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeftIcon, ExternalLinkIcon, HashIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { resolver } from "@/lib/resolver";
import { getSite } from "@/lib/sites";
import type { Site } from "@/lib/sites";

type SitePreviewProps = {
  siteId: string;
};

// Inject meta tags and custom CSS at runtime in the preview iframe/page
function PreviewHead({ site }: { site: Site }) {
  const title = site.meta?.title || site.name;
  const description = site.meta?.description || "";
  const customCss = site.meta?.customCss || "";

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = title;

    let desc = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;
    if (description) {
      if (!desc) {
        desc = document.createElement("meta");
        desc.name = "description";
        document.head.appendChild(desc);
      }
      desc.content = description;
    } else if (desc) {
      desc.remove();
    }

    let styleEl = document.getElementById(
      "site-preview-custom-css"
    ) as HTMLStyleElement | null;
    if (customCss.trim()) {
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "site-preview-custom-css";
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = customCss;
    } else if (styleEl) {
      styleEl.remove();
    }

    return () => {
      const el = document.getElementById("site-preview-custom-css");
      if (el) el.remove();
    };
  }, [title, description, customCss]);

  return null;
}

function getRootBackground(data: Record<string, unknown>): string {
  const root = data.ROOT as { props?: { background?: string } } | undefined;
  return root?.props?.background ?? "#ffffff";
}

export function SitePreview({ siteId }: SitePreviewProps) {
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);

  useEffect(() => {
    // SSR safety: localStorage is not available during server render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const s = getSite(siteId);
    if (!s) {
      toast.error("Site not found");
      router.replace("/sites");
      return;
    }
    setSite(s);
  }, [siteId, router]);

  if (!site) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading preview...
      </div>
    );
  }

  const background = getRootBackground(site.data);
  const previewUrl =
    typeof window !== "undefined" ? window.location.href : `/preview/${siteId}`;

  return (
    <div className="min-h-screen bg-background">
      <PreviewHead site={site} />
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/sites"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              <ArrowLeftIcon data-icon="inline-start" />
              All sites
            </Link>
            <span className="text-sm font-semibold">{site.name}</span>
            <Badge variant="secondary" className="font-mono text-[10px]">
              <HashIcon className="mr-0.5 h-3 w-3" />
              {site.id}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(previewUrl);
                  toast.success("Preview URL copied");
                }
              }}
            >
              <CopyIcon data-icon="inline-start" />
              Copy URL
            </Button>
            <Link
              href={`/editor/${siteId}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ExternalLinkIcon data-icon="inline-start" />
              Edit
            </Link>
          </div>
        </div>
      </div>
      <div className="border-b bg-muted/30 px-4 py-2 text-center text-xs text-muted-foreground">
        Preview mode · Site ID:{" "}
        <code className="rounded bg-background px-1 py-0.5 font-mono text-[10px]">
          {site.id}
        </code>
      </div>
      <Editor enabled={false} resolver={resolver}>
        <div style={{ background }}>
          <Frame data={JSON.stringify(site.data)} />
        </div>
      </Editor>
    </div>
  );
}