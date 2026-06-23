"use client";

// Backward-compat: the editor used to live at `/editor/[slug]`. After the
// multi-page refactor it lives at `/editor/[siteSlug]/[pageSlug]`. This
// client page resolves the site's home slug and replaces the URL so old
// bookmarks and shared links keep working.
//
// We share the same `[siteSlug]` segment name as the canonical route so
// Next.js doesn't complain about two siblings using different param
// names for the same dynamic position.

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getSite, findHomePage, readSitePages } from "@/lib/sites";

export default function LegacyEditorRedirect() {
  const params = useParams<{ siteSlug: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const slug = params?.siteSlug;
    if (!slug) return;
    let cancelled = false;
    getSite(slug)
      .then((site) => {
        if (cancelled) return;
        if (!site) {
          setError("Site not found");
          return;
        }
        const pages = readSitePages(site);
        const home = findHomePage(pages);
        router.replace(`/editor/${site.slug}/${home.slug}`);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Could not load site";
        setError(message);
      });
    return () => {
      cancelled = true;
    };
  }, [params, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center text-sm text-muted-foreground">
        {error}
      </div>
    );
  }
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      Opening editor…
    </div>
  );
}
