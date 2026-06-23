"use client";

import { useEditor } from "@craftjs/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CopyIcon,
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
import { getSite } from "@/lib/sites";
import { updateSite, deleteSite } from "@/lib/sites";

type EditorToolbarProps = {
  siteId: string;
  siteName: string;
  onLoadTemplate: (templateId: string) => void;
  onSiteChanged: () => void;
};

export function EditorToolbar({
  siteId,
  siteName,
  onLoadTemplate,
  onSiteChanged,
}: EditorToolbarProps) {
  const router = useRouter();
  const { actions, canUndo, canRedo, query } = useEditor((_, q) => ({
    canUndo: q.history.canUndo(),
    canRedo: q.history.canRedo(),
  }));
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(siteName);

  const handleSave = () => {
    const serialized = query.serialize();
    const current = getSite(siteId);
    if (!current) return;
    updateSite(siteId, { data: JSON.parse(serialized) });
    toast.success("Site saved");
  };

  const handleCommitName = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === siteName) {
      setNameDraft(siteName);
      setEditingName(false);
      return;
    }
    updateSite(siteId, { name: trimmed });
    setEditingName(false);
    onSiteChanged();
    toast.success("Site renamed");
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${siteName}"? This cannot be undone.`)) return;
    deleteSite(siteId);
    toast.info(`Deleted "${siteName}"`);
    router.push("/sites");
  };

  const handleDuplicate = () => {
    // Refresh name first then go back to dashboard where duplicate happens.
    router.push(`/sites`);
  };

  const templates = getTemplates();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-3">
        <Link href="/sites" className="text-muted-foreground hover:text-foreground">
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
            {siteId}
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
              <DropdownMenuLabel>Replace canvas with…</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {templates.map((template) => (
                <DropdownMenuItem
                  key={template.id}
                  onClick={() => {
                    if (
                      confirm(
                        `Replace the current canvas with "${template.name}"? Unsaved changes will be lost.`
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
              ))}
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
        <Button variant="outline" size="sm" onClick={handleSave} title="Save">
          <SaveIcon data-icon="inline-start" />
          Save
        </Button>
        <Link
          href={`/preview/${siteId}`}
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
          onClick={handleDuplicate}
          title="Duplicate site"
        >
          <CopyIcon />
        </Button>
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