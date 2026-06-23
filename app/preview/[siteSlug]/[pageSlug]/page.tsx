"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { SitePreview } from "@/components/preview/SitePreview";
import {
  findPageBySlug,
  getPublicSite,
  readSitePages,
  type Site,
} from "@/lib/sites";

export default function PreviewPage() {
  const params = useParams<{ siteSlug: string; pageSlug: string }>();
  const siteSlug = params?.siteSlug;
  const pageSlug = params?.pageSlug;

  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!siteSlug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getPublicSite(siteSlug)
      .then((s) => {
        if (cancelled) return;
        setSite(s);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to load";
        setError(message);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [siteSlug]);

  if (!siteSlug || !pageSlug) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading preview…
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-sm font-medium text-foreground">
          Site not available
        </p>
        <p className="max-w-sm text-xs text-muted-foreground">
          {error ??
            "This site hasn't been published yet, or the slug is wrong. Open it in the editor to publish."}
        </p>
      </div>
    );
  }

  // Resolve the requested page. If it doesn't exist, fall back to the
  // home page — never render a blank canvas on a typo'd URL.
  const pages = readSitePages(site);
  const page = findPageBySlug(pages, pageSlug) ??
    pages.find((p) => p.isHome) ??
    pages[0] ??
    null;

  return <SitePreview site={site} page={page} />;
}
