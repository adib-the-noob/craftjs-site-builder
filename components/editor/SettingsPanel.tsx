"use client";

import React from "react";
import { useEditor } from "@craftjs/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Settings2Icon } from "lucide-react";

export function SettingsPanel() {
  const { selected } = useEditor((_, query) => {
    const currentNodeId = query.getEvent("selected").first();
    let selectedNode;

    if (currentNodeId) {
      const node = query.node(currentNodeId).get();
      selectedNode = {
        id: currentNodeId,
        name: node.data.displayName,
        isRoot: currentNodeId === "ROOT",
        settings: node.related && node.related.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
      };
    }

    return { selected: selectedNode };
  });

  return (
    <Card className="flex h-full min-h-0 flex-col rounded-none border-0 border-l shadow-none">
      <CardHeader className="shrink-0 border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Settings2Icon />
          Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-4">
            {!selected ? (
              <p className="text-sm text-muted-foreground">
                Select an element on the canvas to edit its properties.
              </p>
            ) : selected.isRoot ? (
              <p className="text-sm text-muted-foreground">
                Container settings are inline with the canvas — select an inner
                element to edit it, or use the Layers panel on the left to
                reorder sections.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Selected
                  </p>
                  <p className="text-sm font-medium">{selected.name}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    id: {selected.id}
                  </p>
                </div>
                <Separator />
                {selected.settings ? (
                  React.createElement(selected.settings)
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No settings available for this element.
                  </p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}