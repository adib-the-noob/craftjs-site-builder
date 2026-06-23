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
import { LayersPanel } from "@/components/editor/LayersPanel";
import { RenderNode } from "@/components/editor/RenderNode";
import { SelectionActions } from "@/components/editor/SelectionActions";
import { SettingsPanel } from "@/components/editor/SettingsPanel";
import { Toolbox } from "@/components/editor/Toolbox";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { resolver } from "@/lib/resolver";
import {
  findPageBySlug,
  getSite,
  normalisePages,
  readSitePages,
  updateSite,
  writeSitePages,
  type Site,
  type SitePage,
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
 * Hydrates the Craft.js editor with the current page's tree after mount.
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
 * Mirrors the editor's serialised tree onto `window.__craftEditorTree`
 * every 1.5s so the toolbar's Save button (which sits outside the
 * <Editor> provider) can grab the latest snapshot without dragging
 * `useEditor` into its component tree.
 */
function TreeMirror() {
  const { query } = useEditor();
  useEffect(() => {
    const w = window as unknown as {
      __craftEditorTree?: Record<string, unknown>;
    };
    const tick = () => {
      try {
        w.__craftEditorTree = JSON.parse(query.serialize());
      } catch {
        // editor not ready — ignore
      }
    };
    tick();
    const id = window.setInterval(tick, 1500);
    return () => window.clearInterval(id);
  }, [query]);
  return null;
}

function EditorInner({
  siteSlug,
  pageSlug,
}: {
  siteSlug: string;
  pageSlug: string;
}) {
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [pages, setPages] = useState<SitePage[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  // Load site + pages.
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
        setSite(s);
        setPages(normalisePages(readSitePages(s)));
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

  // The currently active page — derived from `pages` + URL `pageSlug`.
  // Falls back to the home page if the URL slug doesn't match (e.g.
  // the page was just deleted or renamed).
  const currentPage = useMemo<SitePage | null>(() => {
    if (!pages) return null;
    return (
      findPageBySlug(pages, pageSlug) ??
      pages.find((p) => p.isHome) ??
      pages[0] ??
      null
    );
  }, [pages, pageSlug]);

  // Used to remount the Craft.js <Editor> when switching pages. Without
  // this, the canvas would keep showing the previous page's tree because
  // Craft.js state is keyed by mount, not by props.
  const editorKey = useMemo(
    () => (currentPage ? currentPage.id : "loading"),
    [currentPage]
  );

  const initialData = useMemo<string | null>(() => {
    if (!currentPage) return null;
    const tree = currentPage.data;
    if (!tree || typeof tree !== "object") return null;
    if (Object.keys(tree).length === 0) return null;
    return JSON.stringify(tree);
  }, [currentPage]);

  /**
   * Pull the freshest tree out of Craft.js (which lives inside the
   * <Editor> provider). Falls back to the cached `currentPage.data`
   * if the mirror hasn't ticked yet.
   */
  const readLatestTree = useCallback((): Record<string, unknown> => {
    const w = window as unknown as {
      __craftEditorTree?: Record<string, unknown>;
    };
    return w.__craftEditorTree ?? currentPage?.data ?? {};
  }, [currentPage]);

  const handleSave = useCallback(async () => {
    if (!site || !currentPage || !pages) return;
    const tree = readLatestTree();
    const nextPages = normalisePages(
      pages.map((p) => (p.id === currentPage.id ? { ...p, data: tree } : p))
    );
    try {
      await updateSite(site.id, {
        data: writeSitePages(nextPages) as unknown as Record<string, unknown>,
      });
      setPages(nextPages);
      toast.success(`Saved "${currentPage.title}"`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      toast.error(message);
    }
  }, [site, currentPage, pages, readLatestTree]);

  const handleLoadTemplate = useCallback(
    async (templateId: string) => {
      if (!site || !currentPage || !pages) return;
      const template = await getTemplateById(templateId);
      if (!template) return;
      // Templates are single-page starters — they replace the *current*
      // page only, preserving the rest of the site's pages.
      const nextPages = normalisePages(
        pages.map((p) =>
          p.id === currentPage.id
            ? { ...p, data: JSON.parse(JSON.stringify(template.data)) }
            : p
        )
      );
      try {
        await updateSite(site.id, {
          data: writeSitePages(nextPages) as unknown as Record<
            string,
            unknown
          >,
        });
        setPages(nextPages);
        toast.success(
          `Loaded template "${template.name}" into "${currentPage.title}"`
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not load template";
        toast.error(message);
      }
    },
    [site, currentPage, pages]
  );

  const handleSiteChanged = useCallback(() => {
    // Refresh from backend so name edits reflect.
    if (!site) return;
    getSite(site.slug).then((s) => {
      if (s) setSite(s);
    });
  }, [site]);

  /**
   * Switch the active page. We save the outgoing page *first* and
   * then navigate, so the new mount reads the just-persisted tree
   * instead of racing against the in-flight PUT.
   */
  const handleSwitchPage = useCallback(
    async (pageId: string) => {
      if (!site || !pages) return;
      const target = pages.find((p) => p.id === pageId);
      if (!target || target.id === currentPage?.id) return;
      await handleSave();
      router.push(`/editor/${site.slug}/${target.slug}`);
    },
    [site, pages, currentPage, handleSave, router]
  );

  if (loadFailed || !site || !pages || !currentPage) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading editor…
      </div>
    );
  }

  return (
    <Editor
      key={editorKey}
      resolver={resolver}
      onRender={RenderNode}
    >
      <KeyboardShortcuts />
      <TreeMirror />
      <HydrateOnMount data={initialData} />
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <EditorToolbar
          site={site}
          pages={pages}
          currentPageId={currentPage.id}
          onSave={handleSave}
          onLoadTemplate={handleLoadTemplate}
          onSiteChanged={handleSiteChanged}
          onPagesChanged={setPages}
          onRequestSwitchPage={handleSwitchPage}
        />
        <ResizablePanelGroup
          id="site-editor-layout"
          orientation="horizontal"
          className="min-h-0 flex-1"
          defaultLayout={{ layers: 15, toolbox: 18, canvas: 45, settings: 22 }}
        >
          <ResizablePanel
            id="layers"
            defaultSize="15%"
            minSize="10%"
            maxSize="25%"
            className="min-w-0"
          >
            <LayersPanel />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            id="toolbox"
            defaultSize="18%"
            minSize="14%"
            maxSize="26%"
            className="min-w-0"
          >
            <Toolbox />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            id="canvas"
            defaultSize="45%"
            minSize="30%"
            className="min-w-0"
          >
            <div className="flex h-full flex-col bg-muted/30">
              <div className="flex items-center justify-between border-b bg-background/80 px-4 py-2 backdrop-blur">
                <p className="text-xs text-muted-foreground">
                  Click an element to select it. Drag from the left to add new components.
                </p>
                <SelectionActions />
              </div>
              <div className="flex-1 overflow-auto p-6">
                <div className="mx-auto min-h-full w-full max-w-4xl rounded-xl border bg-background shadow-sm">
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
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            id="settings"
            defaultSize="22%"
            minSize="18%"
            maxSize="35%"
            className="min-w-0"
          >
            <SettingsPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </Editor>
  );
}

export function SiteEditor({
  siteSlug,
  pageSlug,
}: {
  siteSlug: string;
  pageSlug: string;
}) {
  return (
    <AuthGuard>
      <EditorInner siteSlug={siteSlug} pageSlug={pageSlug} />
    </AuthGuard>
  );
}