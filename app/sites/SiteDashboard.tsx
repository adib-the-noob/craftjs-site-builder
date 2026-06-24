"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  EyeIcon,
  LayoutGridIcon,
  LogOutIcon,
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
  listSites,
  type Site,
} from "@/lib/sites";
import { getCurrentUser as getMe, logout as logoutToken } from "@/lib/auth";
import { AuthGuard } from "@/components/auth/AuthGuard";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DashboardInner() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await listSites();
      // Newest first — backend returns insertion order, not sorted.
      data.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      setSites(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load sites";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    getMe()
      .then((u) => setUserEmail(u?.email ?? null))
      .catch(() => setUserEmail(null));
  }, [refresh]);

  const handleCreate = useCallback(
    async (name: string, templateId?: string) => {
      try {
        const site = await createSite(name, templateId ?? null);
        toast.success(`Created "${site.name}"`);
        router.push(`/editor/${site.slug}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not create site";
        toast.error(message);
      }
    },
    [router]
  );

  const handleDelete = useCallback(
    async (site: Site) => {
      if (!confirm(`Delete "${site.name}"? This cannot be undone.`)) return;
      try {
        await deleteSite(site.id);
        toast.info(`Deleted "${site.name}"`);
        await refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Delete failed";
        toast.error(message);
      }
    },
    [refresh]
  );

  const handleLogout = useCallback(() => {
    logoutToken();
    toast.info("Signed out");
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <LayoutGridIcon className="text-muted-foreground" />
            <span className="text-sm font-semibold tracking-tight">
              My Sites
            </span>
            {userEmail && (
              <span className="text-xs text-muted-foreground">
                · {userEmail}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              New site
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              title="Sign out"
            >
              <LogOutIcon data-icon="inline-start" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading sites…</div>
        ) : sites.length === 0 ? (
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
                      {site.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Updated {formatDate(site.updated_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex flex-wrap gap-2">
                  <Link
                    href={`/editor/${site.slug}`}
                    className={buttonVariants({ size: "sm" })}
                  >
                    <PencilIcon data-icon="inline-start" />
                    Edit
                  </Link>
                  <Link
                    href={`/preview/${site.slug}`}
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
                    onClick={() => handleDelete(site)}
                    className="ml-auto text-destructive hover:text-destructive"
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

export function SiteDashboard() {
  return (
    <AuthGuard>
      <DashboardInner />
    </AuthGuard>
  );
}