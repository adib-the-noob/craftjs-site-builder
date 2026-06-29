"use client";

import { Editor, Element, Frame, useEditor } from "@craftjs/core";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import React from "react";
import { Container } from "@/components/craft";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EDITOR_FONT_CLASSNAMES } from "@/components/editor/EditorFontsProvider";
import { LeftSidebar } from "@/components/editor/LeftSidebar";
import { RenderNode } from "@/components/editor/RenderNode";
import { SelectionActions } from "@/components/editor/SelectionActions";
import { SettingsPanel } from "@/components/editor/SettingsPanel";
import { resolver } from "@/lib/resolver";
import {
  emptyPageData,
  getHomePageTree,
  getSite,
  updateSite,
  type Site,
} from "@/lib/sites";
import { getTemplateById } from "@/lib/templates";
import { setClipboard, getClipboard } from "@/lib/clipboard";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { toast } from "sonner";

function KeyboardShortcuts() {
  const router = useRouter();
  const { actions, query } = useEditor();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditingText =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (isEditingText) return;

      const selectedId = query.getEvent("selected").first();

      // Delete / Backspace: delete selected node
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        if (!query.node(selectedId).isDeletable()) return;
        e.preventDefault();
        actions.delete(selectedId);
        return;
      }

      const lookupTypeName = (
        componentType: string | React.ComponentType
      ): string | null => {
        const map = resolver as Record<string, React.ComponentType>;
        if (typeof componentType === "string") return componentType;
        for (const key of Object.keys(map)) {
          if (map[key] === componentType) return key;
        }
        return null;
      };

      const lookupType = (
        componentType: string | React.ComponentType
      ): React.ComponentType<Record<string, unknown>> | null => {
        const map = resolver as Record<string, React.ComponentType>;
        if (typeof componentType === "string") {
          return (map[componentType] as React.ComponentType<
            Record<string, unknown>
          >) ?? null;
        }
        return componentType as React.ComponentType<Record<string, unknown>>;
      };

      // Cmd/Ctrl + D: duplicate
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d" && selectedId) {
        e.preventDefault();
        const node = query.node(selectedId).get();
        const { type, props, displayName } = node.data;
        const Type = lookupType(type);
        if (!Type) return;
        const newNode = query.createNode(React.createElement(Type, props));
        const parentId = node.data.parent ?? "ROOT";
        actions.add(newNode, parentId);
        toast.success(`Duplicated "${displayName}"`);
        return;
      }

      // Cmd/Ctrl + C: copy
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c" && selectedId) {
        const node = query.node(selectedId).get();
        const typeName = lookupTypeName(node.data.type);
        if (!typeName) return;
        setClipboard({
          type: typeName,
          props: JSON.parse(JSON.stringify(node.data.props)),
          displayName: node.data.displayName,
          parent: node.data.parent,
        });
        toast.success(`Copied "${node.data.displayName}"`);
        return;
      }

      // Cmd/Ctrl + V: paste
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v" && selectedId) {
        const data = getClipboard();
        if (!data) return;
        const Type = (resolver as Record<string, React.ComponentType>)[
          data.type
        ];
        if (!Type) return;
        const node = query.node(selectedId).get();
        const parentId = node.data.parent ?? "ROOT";
        const newNode = query.createNode(React.createElement(Type, data.props));
        actions.add(newNode, parentId);
        toast.success(`Pasted "${data.displayName}"`);
        return;
      }

      // Escape: deselect
      if (e.key === "Escape") {
        actions.selectNode();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [actions, query, router]);

  return null;
}

/**
 * Hydrates the Craft.js editor with the saved tree after mount.
 *
 * Why not use <Frame data={saved}> directly? `Frame.deserialize` runs
 * the saved tree through `query.parseSerializedNode(...).toNode()`,
 * which calls a strict destructure (`{ type, props, ... } = node`).
 * If the saved tree contains an entry the resolver can't recognize
 * (a stale component, a half-finished save, or a plain `{}` from a
 * brand-new site), the destructure throws and the whole editor
 * tree crashes. Doing it ourselves inside `useEditor` lets us wrap
 * the call in try/catch and keep the default canvas drop target
 * alive when the saved data is bad.
 */
function HydrateOnMount({ data }: { data: string | null }) {
  const { actions } = useEditor();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!data) return; // No saved tree — keep the JSX default canvas.

    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch {
      return; // Corrupt JSON — ignore, keep default canvas.
    }
    if (!parsed || typeof parsed !== "object") return;
    if (Object.keys(parsed as object).length === 0) return;

    try {
      const tree = JSON.parse(JSON.stringify(parsed));
      actions.history.ignore().deserialize(tree);
    } catch (err) {
      // Bad saved tree (unrecognized component, missing type, etc.) —
      // log and keep the default canvas so dragging still works.
      console.warn("Failed to restore saved editor tree:", err);
    }
  }, [data, actions]);

  return null;
}

/**
 * (Removed) `TreeMirror` — the Save button now lives inside the
 * `<Editor>` provider, so it can call `query.serialize()` directly at
 * click time and always send the full fresh tree. The previous
 * 1.5-second window mirror caused stale saves when the user clicked
 * Save immediately after a settings change.
 */

const LEFT_COLLAPSED_KEY = "craftjs:left-sidebar-collapsed";
const SETTINGS_COLLAPSED_KEY = "craftjs:settings-collapsed";

function readStoredFlag(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeStoredFlag(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, value ? "1" : "0");
  } catch {
    // localStorage unavailable — ignore.
  }
}

function EditorInner({ siteSlug }: { siteSlug: string }) {
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [initialTree, setInitialTree] = useState<Record<string, unknown> | null>(
    null
  );
  const [loadFailed, setLoadFailed] = useState(false);

  // Both side columns are fixed-width with their own fold buttons.
  // State lives here (not inside the panels) so the canvas can grow
  // to fill the rest of the row.
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [settingsCollapsed, setSettingsCollapsed] = useState(false);

  useEffect(() => {
    setLeftCollapsed(readStoredFlag(LEFT_COLLAPSED_KEY));
    setSettingsCollapsed(readStoredFlag(SETTINGS_COLLAPSED_KEY));
  }, []);

  const toggleLeft = useCallback(() => {
    setLeftCollapsed((prev) => {
      const next = !prev;
      writeStoredFlag(LEFT_COLLAPSED_KEY, next);
      return next;
    });
  }, []);

  const toggleSettings = useCallback(() => {
    setSettingsCollapsed((prev) => {
      const next = !prev;
      writeStoredFlag(SETTINGS_COLLAPSED_KEY, next);
      return next;
    });
  }, []);

  // Load site + tree.
  useEffect(() => {
    let cancelled = false;
    getSite(siteSlug)
      .then((s) => {
        if (cancelled) return;
        if (!s) {
          toast.error("Site not found");
          setLoadFailed(true);
          router.replace("/sites");
          return;
        }
        // Single-page model: `site_data` IS the tree. Route through
        // `getHomePageTree` so the root Container is normalised to
        // full width (maxWidth = 0) on every load.
        const tree = getHomePageTree(s);
        if (!tree || Object.keys(tree).length === 0) {
          setInitialTree(emptyPageData());
        } else {
          setInitialTree(tree);
        }
        setSite(s);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Could not load site";
        toast.error(message);
        setLoadFailed(true);
        router.replace("/sites");
      });
    return () => {
      cancelled = true;
    };
  }, [siteSlug, router]);

  const initialData = useMemo<string | null>(() => {
    if (!initialTree) return null;
    if (Object.keys(initialTree).length === 0) return null;
    return JSON.stringify(initialTree);
  }, [initialTree]);

  const handleLoadTemplate = useCallback(
    async (templateId: string) => {
      if (!site) return;
      const template = await getTemplateById(templateId);
      if (!template) return;
      const tree = JSON.parse(JSON.stringify(template.data));
      try {
        await updateSite(site.id, { data: tree });
        toast.success(`Loaded template "${template.name}"`);
        // Reload so the editor re-hydrates with the new tree.
        router.refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not load template";
        toast.error(message);
      }
    },
    [site, router]
  );

  const handleSiteChanged = useCallback(() => {
    // Refresh from backend so name edits reflect.
    if (!site) return;
    getSite(site.slug).then((s) => {
      if (s) setSite(s);
    });
  }, [site]);

  if (loadFailed || !site || !initialTree) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading editor…
      </div>
    );
  }

  return (
    <Editor resolver={resolver} onRender={RenderNode}>
      <KeyboardShortcuts />
      <HydrateOnMount data={initialData} />
      <div
        className={`flex h-screen flex-col overflow-hidden bg-background ${EDITOR_FONT_CLASSNAMES}`}
      >
        <EditorToolbar
          site={site}
          onLoadTemplate={handleLoadTemplate}
          onSiteChanged={handleSiteChanged}
        />
        {/*
          Three-column layout. Both side columns are fixed-width and
          foldable; only the canvas stretches to fill the rest of the
          row. No resizable handles anywhere.
        */}
        <div className="flex min-h-0 flex-1">
          {/* Left: Layers + Components tabs (combined). */}
          <div
            className={
              leftCollapsed
                ? "w-[48px] shrink-0 border-r"
                : "w-[260px] shrink-0 border-r"
            }
          >
            <LeftSidebar
              collapsed={leftCollapsed}
              onToggleCollapsed={toggleLeft}
            />
          </div>

          {/* Middle: canvas. Takes the remaining space. */}
          <div className="flex min-w-0 flex-1 flex-col bg-muted/30">
            <div className="flex items-center justify-between border-b bg-background/80 px-4 py-2 backdrop-blur">
              <p className="text-xs text-muted-foreground">
                Click an element to select it. Drag from the left to add new
                components.
              </p>
              <SelectionActions />
            </div>
            <div className="flex-1 overflow-auto bg-muted/30">
              <div className="min-h-full w-full bg-background">
                <Frame>
                  <Element
                    canvas
                    is={Container}
                    padding={0}
                    background="#ffffff"
                  />
                </Frame>
              </div>
            </div>
          </div>

          {/* Right: Settings. */}
          <div
            className={
              settingsCollapsed
                ? "w-[48px] shrink-0 border-l"
                : "w-[300px] shrink-0 border-l"
            }
          >
            <SettingsPanel
              collapsed={settingsCollapsed}
              onToggleCollapsed={toggleSettings}
            />
          </div>
        </div>
      </div>
    </Editor>
  );
}

export function SiteEditor({ siteSlug }: { siteSlug: string }) {
  return (
    <AuthGuard>
      <EditorInner siteSlug={siteSlug} />
    </AuthGuard>
  );
}