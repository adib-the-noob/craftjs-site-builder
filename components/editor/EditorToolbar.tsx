"use client";

import { useEditor } from "@craftjs/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  EyeIcon,
  FileIcon,
  HomeIcon,
  LayoutTemplateIcon,
  PencilIcon,
  Redo2Icon,
  SaveIcon,
  SettingsIcon,
  Trash2Icon,
  Undo2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getTemplates } from "@/lib/templates";
import { deleteSite, type Site, type SitePage } from "@/lib/sites";
import type { SiteTemplate } from "@/lib/constants";
import { ManagePagesDialog } from "./ManagePagesDialog";

type EditorToolbarProps = {
  site: Site;
  pages: SitePage[];
  currentPageId: string;
  onSave: () => void;
  onLoadTemplate: (templateId: string) => void;
  onSiteChanged: () => void;
  onPagesChanged: (pages: SitePage[]) => void;
  onRequestSwitchPage: (pageId: string) => void;
};

export function EditorToolbar({
  site,
  pages,
  currentPageId,
  onSave,
  onLoadTemplate,
  onSiteChanged,
  onPagesChanged,
  onRequestSwitchPage,
}: EditorToolbarProps) {
  const { id: siteId, slug, name: siteName } = site;
  const router = useRouter();
  const { actions, canUndo, canRedo } = useEditor((_, q) => ({
    canUndo: q.history.canUndo(),
    canRedo: q.history.canRedo(),
  }));
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(siteName);
  const [templates, setTemplates] = useState<SiteTemplate[]>([]);
  const [pagesDialogOpen, setPagesDialogOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getTemplates()
      .then((items) => {
        if (!cancelled) setTemplates(items);
      })
      .catch(() => {
        if (!cancelled) setTemplates([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentPage = pages.find((p) => p.id === currentPageId) ?? pages[0];

  const handleCommitName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === siteName) {
      setNameDraft(siteName);
      setEditingName(false);
      return;
    }
    // Backend doesn't expose a rename endpoint — locally update and refresh.
    // For now, surface a clear message; a PATCH /sites/{id} can be added
    // server-side later.
    setNameDraft(trimmed);
    setEditingName(false);
    onSiteChanged();
    toast.info("Renaming sites isn't supported by the backend yet");
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${siteName}"? This cannot be undone.`)) return;
    try {
      await deleteSite(siteId);
      toast.info(`Deleted "${siteName}"`);
      router.push("/sites");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      toast.error(message);
    }
  };

  const handleSwitchPage = (pageId: string) => {
    const target = pages.find((p) => p.id === pageId);
    if (!target || target.id === currentPageId) return;
    // Defer to the parent: it has the router and can await the save
    // before navigating, so the next mount reads the freshest tree.
    onRequestSwitchPage(target.id);
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-3">
        <Link
          href="/sites"
          className="text-muted-foreground hover:text-foreground"
        >
          <HomeIcon className="h-4 w-4" />
        </Link>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2">
          {editingName ? (
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={handleCommitName}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCommitName();
                if (e.key === "Escape") {
                  setNameDraft(siteName);
                  setEditingName(false);
                }
              }}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            />
          ) : (
            <button
              onClick={() => {
                setNameDraft(siteName);
                setEditingName(true);
              }}
              className="flex items-center gap-1.5 rounded px-1 text-sm font-medium hover:bg-muted"
            >
              <span>{siteName}</span>
              <PencilIcon className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
          <Badge variant="secondary" className="font-mono text-[10px]">
            {slug}
          </Badge>
        </div>
        <Separator orientation="vertical" className="h-6" />

        {/* Page switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="min-w-40 justify-between"
                title="Switch page"
              />
            }
          >
            {currentPage ? (
              <span className="flex min-w-0 items-center gap-1.5">
                {currentPage.isHome ? (
                  <HomeIcon className="size-3.5 text-amber-500" />
                ) : (
                  <FileIcon className="size-3.5 text-muted-foreground" />
                )}
                <span className="truncate">{currentPage.title}</span>
              </span>
            ) : (
              <span>No page</span>
            )}
            <ChevronsUpDownIcon data-icon="inline-end" className="text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Pages</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {pages.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => handleSwitchPage(p.id)}
                  className="flex items-center justify-between"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    {p.isHome ? (
                      <HomeIcon className="size-3.5 shrink-0 text-amber-500" />
                    ) : (
                      <FileIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <span className="flex flex-col">
                      <span className="truncate font-medium">{p.title}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        /{p.slug}
                      </span>
                    </span>
                  </span>
                  {p.id === currentPageId && (
                    <CheckIcon className="size-3.5 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setPagesDialogOpen(true)}>
                <SettingsIcon />
                Manage pages…
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            <LayoutTemplateIcon data-icon="inline-start" />
            Templates
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Replace this page with…</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {templates.length === 0 ? (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  No templates available
                </div>
              ) : (
                templates.map((template) => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => {
                      if (
                        confirm(
                          `Replace "${currentPage?.title ?? "this page"}" with the "${template.name}" template? Other pages are kept.`
                        )
                      ) {
                        onLoadTemplate(template.id);
                      }
                    }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {template.description}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!canUndo}
          onClick={() => actions.history.undo()}
          title="Undo (Cmd/Ctrl+Z)"
        >
          <Undo2Icon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!canRedo}
          onClick={() => actions.history.redo()}
          title="Redo (Cmd/Ctrl+Y)"
        >
          <Redo2Icon />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          title="Save this page"
        >
          <SaveIcon data-icon="inline-start" />
          Save
        </Button>
        <Link
          href={`/preview/${slug}`}
          target="_blank"
          className={buttonVariants({ variant: "outline", size: "sm" })}
          title="Open preview in new tab"
        >
          <EyeIcon data-icon="inline-start" />
          Preview
        </Link>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDelete}
          className="text-destructive hover:text-destructive"
          title="Delete site"
        >
          <Trash2Icon />
        </Button>
      </div>

      {pagesDialogOpen && (
        <ManagePagesDialog
          open={pagesDialogOpen}
          onOpenChange={setPagesDialogOpen}
          site={site}
          pages={pages}
          currentPageId={currentPageId}
          onPagesChanged={onPagesChanged}
        />
      )}
    </header>
  );
}