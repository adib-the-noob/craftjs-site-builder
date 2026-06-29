"use client";

import { useEditor } from "@craftjs/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  EyeIcon,
  HomeIcon,
  LayoutTemplateIcon,
  PencilIcon,
  Redo2Icon,
  SaveIcon,
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
import {
  deleteSite,
  publishSite,
  unpublishSite,
  updateSite,
  type Site,
} from "@/lib/sites";
import type { SiteTemplate } from "@/lib/constants";

/**
 * Accessible toggle styled to match the rest of the toolbar. Built inline
 * (no shadcn switch primitive installed) — uses `role="switch"` and
 * `aria-checked` per WAI-ARIA. Disabled state is forwarded.
 */
function StatusSwitch({
  checked,
  disabled,
  onClick,
}: {
  checked: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? "Unpublish site" : "Publish site"}
      disabled={disabled}
      onClick={onClick}
      className={[
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full",
        "border border-transparent transition-colors",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        checked ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700",
      ].join(" ")}
    >
      <span
        aria-hidden
        className={[
          "pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}

type EditorToolbarProps = {
  site: Site;
  onLoadTemplate: (templateId: string) => void;
  onSiteChanged: () => void;
};

export function EditorToolbar({
  site,
  onLoadTemplate,
  onSiteChanged,
}: EditorToolbarProps) {
  const { id: siteId, slug, name: siteName } = site;
  const router = useRouter();
  // We grab `query` directly so the Save button can call
  // `query.serialize()` at click time — guaranteeing the *full*, *fresh*
  // tree is sent (no stale window-mirrored snapshot).
  const { actions, query, canUndo, canRedo } = useEditor((_, q) => ({
    canUndo: q.history.canUndo(),
    canRedo: q.history.canRedo(),
  }));
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(siteName);
  const [templates, setTemplates] = useState<SiteTemplate[]>([]);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [saving, setSaving] = useState(false);

  // Status derived from props so it stays in sync when the parent
  // re-fetches the site after a save/load-template/etc.
  const status = site.status;
  const isPublished = status === "published";

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

  /**
   * Save the editor's current tree to the backend.
   *
   * We pull `query.serialize()` *at click time* — never from a cached
   * snapshot — so the *full* Craft.js tree (every node, every prop,
   * every linkedNodes entry) is sent in one PUT. The backend stores
   * it as `site_data`; no client-side diffing.
   */
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const tree = JSON.parse(query.serialize());
      await updateSite(siteId, { data: tree });
      toast.success("Saved");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Save failed";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

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

  const handleToggleStatus = async () => {
    if (togglingStatus) return;
    const next = !isPublished;
    setTogglingStatus(true);
    try {
      const updated = next
        ? await publishSite(siteId)
        : await unpublishSite(siteId);
      toast.success(
        next ? `Published "${siteName}"` : `Reverted "${siteName}" to draft`
      );
      // Keep the toolbar's in-memory copy of the site in sync so the
      // Switch + badge reflect the new state immediately without a
      // full router refresh.
      onSiteChanged();
      // Discard the return — parent will refetch.
      void updated;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not change status";
      toast.error(message);
    } finally {
      setTogglingStatus(false);
    }
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

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            <LayoutTemplateIcon data-icon="inline-start" />
            Templates
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Replace page with…</DropdownMenuLabel>
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
                          `Replace "${siteName}" with the "${template.name}" template?`
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

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-2">
          <StatusSwitch
            checked={isPublished}
            disabled={togglingStatus}
            onClick={handleToggleStatus}
          />
          <Badge
            variant={isPublished ? "default" : "secondary"}
            className="font-mono text-[10px] capitalize"
            title={
              isPublished
                ? "Visible to the public — click the switch to revert to draft"
                : "Only you can see this site — click the switch to publish"
            }
          >
            {togglingStatus
              ? isPublished
                ? "Unpublishing…"
                : "Publishing…"
              : status}
          </Badge>
        </div>
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
          disabled={saving}
          onClick={handleSave}
          title="Save"
        >
          <SaveIcon data-icon="inline-start" />
          {saving ? "Saving…" : "Save"}
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
    </header>
  );
}