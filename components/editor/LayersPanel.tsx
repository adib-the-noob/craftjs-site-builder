"use client";

import { useEditor } from "@craftjs/core";
import { ChevronRightIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type LayerNode = {
  id: string;
  name: string;
  depth: number;
};

function flattenTree(
  query: ReturnType<typeof useEditor>["query"],
  rootId: string,
  depth = 0,
  out: LayerNode[] = []
): LayerNode[] {
  const node = query.node(rootId).get();
  if (!node) return out;
  out.push({ id: rootId, name: node.data.displayName, depth });
  const children = node.data.nodes || [];
  for (const childId of children) {
    flattenTree(query, childId, depth + 1, out);
  }
  return out;
}

/**
 * Layers list rendered inside the left sidebar's "Layers" tab. The
 * outer header / fold button live on `LeftSidebar` — this component
 * just owns the scrollable list of nodes.
 */
export function LayersPanel() {
  // Pull `actions` out of useEditor so the click handler below has a stable
  // reference. We can't grab `actions.selectNode` from inside the selector
  // because `state` is only passed to the selector — the closure captured
  // there would call `undefined` at runtime.
  const { actions } = useEditor();
  const { layers, selectedId } = useEditor((_state, query) => {
    const selected = query.getEvent("selected").first();
    const list = flattenTree(query, "ROOT");
    return {
      layers: list,
      selectedId: selected as string | undefined,
    };
  });

  const select = (id: string) => actions.selectNode(id);

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col p-2">
        {layers.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">No layers</p>
        ) : (
          layers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => select(layer.id)}
              className={cn(
                "flex items-center gap-1 rounded-sm px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted",
                selectedId === layer.id && "bg-muted font-medium"
              )}
              style={{ paddingLeft: 8 + layer.depth * 12 }}
            >
              {layer.depth > 0 && (
                <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
              )}
              <span className="truncate">{layer.name}</span>
            </button>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
