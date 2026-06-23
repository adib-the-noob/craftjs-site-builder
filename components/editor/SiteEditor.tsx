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
import { getSite, updateSite } from "@/lib/sites";
import { getTemplateById } from "@/lib/templates";
import { setClipboard, getClipboard } from "@/lib/clipboard";
import { toast } from "sonner";

function KeyboardShortcuts() {
  const router = useRouter();
  const { actions, query } = useEditor((state, q) => ({}));

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

type SiteEditorProps = {
  siteId: string;
};

export function SiteEditor({ siteId }: SiteEditorProps) {
  const router = useRouter();
  const [initialData, setInitialData] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string>("");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // We must read from localStorage in an effect because it's not available
    // during SSR. Calling setState synchronously here is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const site = getSite(siteId);
    if (!site) {
      toast.error("Site not found");
      router.replace("/sites");
      return;
    }
    setSiteName(site.name);
    setInitialData(JSON.stringify(site.data));
  }, [siteId, router]);

  const handleLoadTemplate = useCallback(
    (templateId: string) => {
      const template = getTemplateById(templateId);
      if (!template) return;
      const data = JSON.parse(JSON.stringify(template.data));
      setInitialData(JSON.stringify(data));
      updateSite(siteId, { data });
    },
    [siteId]
  );

  const refreshSiteName = useCallback(() => {
    const site = getSite(siteId);
    if (site) setSiteName(site.name);
  }, [siteId]);

  const editorKey = useMemo(() => initialData ?? "loading", [initialData]);

  if (!initialData) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading editor...
      </div>
    );
  }

  return (
    <Editor
      key={editorKey}
      resolver={resolver}
      onRender={RenderNode}
      onNodesChange={(query) => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          const site = getSite(siteId);
          if (!site) return;
          updateSite(siteId, { data: JSON.parse(query.serialize()) });
        }, 500);
      }}
    >
      <KeyboardShortcuts />
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <EditorToolbar
          siteId={siteId}
          siteName={siteName}
          onLoadTemplate={handleLoadTemplate}
          onSiteChanged={refreshSiteName}
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
                  <Frame data={initialData}>
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