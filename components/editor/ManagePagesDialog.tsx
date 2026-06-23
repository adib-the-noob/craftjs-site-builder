"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CopyIcon,
  HomeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  emptyPageData,
  normalisePages,
  slugifyPageTitle,
  updateSite,
  writeSitePages,
  type Site,
  type SitePage,
} from "@/lib/sites";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: Site;
  pages: SitePage[];
  currentPageId: string;
  /** Called with the next pages array. Caller is expected to persist + re-render. */
  onPagesChanged: (pages: SitePage[]) => void;
};

/**
 * Modal CRUD for the site's pages. Mutates the local `pages` array and
 * persists via `updateSite` so the change is reflected both in the
 * editor and the public preview.
 */
export function ManagePagesDialog({
  open,
  onOpenChange,
  site,
  pages,
  currentPageId,
  onPagesChanged,
}: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const persist = async (next: SitePage[], message: string) => {
    const normalised = normalisePages(next);
    setSaving(true);
    try {
      await updateSite(site.id, {
        data: writeSitePages(normalised) as unknown as Record<string, unknown>,
      });
      onPagesChanged(normalised);
      toast.success(message);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    const title = newTitle.trim() || "New page";
    const next: SitePage[] = [
      ...pages,
      {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        slug: slugifyPageTitle(title),
        title,
        isHome: false,
        data: emptyPageData(),
      },
    ];
    setNewTitle("");
    setAdding(false);
    await persist(next, `Added "${title}"`);
  };

  const handleRename = async (id: string) => {
    const trimmed = titleDraft.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    const next = pages.map((p) =>
      p.id === id
        ? { ...p, title: trimmed, slug: slugifyPageTitle(trimmed) }
        : p
    );
    setEditingId(null);
    setTitleDraft("");
    await persist(next, "Page renamed");
    // If we just renamed the page we're sitting on, the URL slug is now
    // stale — push the new one so the editor stays on this page.
    if (id === currentPageId) {
      const renamed = next.find((p) => p.id === id);
      if (renamed && renamed.slug !== window.location.pathname.split("/").pop()) {
        router.replace(`/editor/${site.slug}/${renamed.slug}`);
      }
    }
  };

  const handleDelete = async (page: SitePage) => {
    if (page.isHome) {
      toast.error("The home page can't be deleted. Set another page as home first.");
      return;
    }
    if (pages.length <= 1) {
      toast.error("A site must have at least one page.");
      return;
    }
    if (!confirm(`Delete page "${page.title}"? Its contents will be lost.`)) {
      return;
    }
    const next = pages.filter((p) => p.id !== page.id);
    await persist(next, `Deleted "${page.title}"`);
    // If we just deleted the current page, navigate to the home page.
    if (page.id === currentPageId) {
      const home = next.find((p) => p.isHome) ?? next[0];
      router.replace(`/editor/${site.slug}/${home.slug}`);
    }
  };

  const handleDuplicate = async (page: SitePage) => {
    const title = `${page.title} copy`;
    const next: SitePage[] = [
      ...pages,
      {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        slug: slugifyPageTitle(title),
        title,
        isHome: false,
        data: JSON.parse(JSON.stringify(page.data)),
      },
    ];
    await persist(next, `Duplicated "${page.title}"`);
  };

  const handleSetHome = async (page: SitePage) => {
    if (page.isHome) return;
    const next = pages.map((p) => ({ ...p, isHome: p.id === page.id }));
    await persist(next, `Set "${page.title}" as home`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle>Pages</DialogTitle>
          <DialogDescription>
            Add, rename, reorder, and choose the home page for your site.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1">
          {pages.length === 0 ? (
            <p className="px-1 py-4 text-center text-sm text-muted-foreground">
              No pages yet.
            </p>
          ) : (
            pages.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 rounded-lg border bg-background px-2 py-1.5"
              >
                {p.isHome ? (
                  <HomeIcon
                    className="size-4 shrink-0 text-amber-500"
                    aria-label="Home page"
                  />
                ) : (
                  <span
                    className="size-4 shrink-0"
                    aria-label="Page"
                  />
                )}

                {editingId === p.id ? (
                  <Input
                    autoFocus
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={() => handleRename(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(p.id);
                      if (e.key === "Escape") {
                        setEditingId(null);
                        setTitleDraft("");
                      }
                    }}
                    className="h-7 flex-1"
                    disabled={saving}
                  />
                ) : (
                  <button
                    type="button"
                    className="flex flex-1 flex-col items-start text-left"
                    onClick={() => {
                      setEditingId(p.id);
                      setTitleDraft(p.title);
                    }}
                    disabled={saving}
                  >
                    <span className="text-sm font-medium leading-tight">
                      {p.title}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      /{p.slug}
                    </span>
                  </button>
                )}

                {p.id === currentPageId && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    Editing
                  </span>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={saving}
                        aria-label={`Page actions for ${p.title}`}
                      />
                    }
                  >
                    <MoreHorizontalIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingId(p.id);
                        setTitleDraft(p.title);
                      }}
                    >
                      <PencilIcon />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(p)}>
                      <CopyIcon />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSetHome(p)}
                      disabled={p.isHome}
                    >
                      <StarIcon />
                      {p.isHome ? "Already home" : "Set as home"}
                    </DropdownMenuItem>
                    <Separator className="my-1" />
                    <DropdownMenuItem
                      onClick={() => handleDelete(p)}
                      disabled={p.isHome || pages.length <= 1}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2Icon />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>

        {adding ? (
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              placeholder="Page title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") {
                  setAdding(false);
                  setNewTitle("");
                }
              }}
              disabled={saving}
            />
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={saving || !newTitle.trim()}
            >
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setNewTitle("");
              }}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAdding(true)}
            disabled={saving}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <PlusIcon data-icon="inline-start" />
            Add page
          </Button>
        )}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
