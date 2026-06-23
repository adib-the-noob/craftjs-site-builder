"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  CopyIcon,
  EyeIcon,
  LayoutGridIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewSiteDialog } from "./NewSiteDialog";
import {
  createSite,
  deleteSite,
  duplicateSite,
  listSites,
  migrateLegacyState,
  updateSite,
  type Site,
} from "@/lib/sites";

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SiteDashboard() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setSites(listSites());
  }, []);

  useEffect(() => {
    migrateLegacyState();
    refresh();
    setHydrated(true);
  }, [refresh]);

  const handleCreate = useCallback(
    (name: string, templateId?: string) => {
      const site = createSite(name, templateId);
      toast.success(`Created "${site.name}"`);
      router.push(`/editor/${site.id}`);
    },
    [router]
  );

  const handleDelete = useCallback(
    (site: Site) => {
      if (!confirm(`Delete "${site.name}"? This cannot be undone.`)) return;
      deleteSite(site.id);
      toast.info(`Deleted "${site.name}"`);
      refresh();
    },
    [refresh]
  );

  const handleDuplicate = useCallback(
    (site: Site) => {
      const copy = duplicateSite(site.id);
      if (copy) {
        toast.success(`Duplicated as "${copy.name}"`);
        refresh();
      }
    },
    [refresh]
  );

  const handleRename = useCallback(
    (site: Site) => {
      const name = prompt("Rename site", site.name);
      if (!name || name.trim() === site.name) return;
      updateSite(site.id, { name: name.trim() });
      refresh();
    },
    [refresh]
  );

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading sites...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <LayoutGridIcon className="text-muted-foreground" />
            <span className="text-sm font-semibold tracking-tight">
              My Sites
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/editor"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <PencilIcon data-icon="inline-start" />
              Open editor
            </Link>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              New site
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {sites.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>No sites yet</CardTitle>
              <CardDescription>
                Create your first site to start building. You can launch,
                preview, and manage each site independently.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setDialogOpen(true)}>
                <PlusIcon data-icon="inline-start" />
                Create your first site
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <Card key={site.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1 text-base">
                      {site.name}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="shrink-0 font-mono text-[10px]"
                    >
                      {site.id}
                    </Badge>
                  </div>
                  <CardDescription>
                    Updated {formatDate(site.updatedAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex flex-wrap gap-2">
                  <Link
                    href={`/editor/${site.id}`}
                    className={buttonVariants({ size: "sm" })}
                  >
                    <PencilIcon data-icon="inline-start" />
                    Edit
                  </Link>
                  <Link
                    href={`/preview/${site.id}`}
                    target="_blank"
                    className={buttonVariants({
                      size: "sm",
                      variant: "outline",
                    })}
                  >
                    <EyeIcon data-icon="inline-start" />
                    Preview
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDuplicate(site)}
                  >
                    <CopyIcon />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRename(site)}
                  >
                    Rename
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(site)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2Icon />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <NewSiteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={handleCreate}
      />
    </div>
  );
}