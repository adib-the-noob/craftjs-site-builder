"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { SitePreview } from "@/components/preview/SitePreview";
import { getPublicSite, type Site } from "@/lib/sites";

export default function PreviewPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getPublicSite(slug)
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
  }, [slug]);

  if (!slug) return null;

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

  return <SitePreview site={site} />;
}