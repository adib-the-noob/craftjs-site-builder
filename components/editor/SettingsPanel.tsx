"use client";

import React from "react";
import { useEditor } from "@craftjs/core";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Settings2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SettingsPanelProps = {
  /**
   * Whether the right column is folded into a 48px rail.
   * Controlled by `SiteEditor` so it can persist across reloads.
   */
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

/**
 * Right-hand settings column. Renders either a slim icon rail
 * (when collapsed) or the full settings form for the currently
 * selected craft node. The fold state lives in the parent.
 */
export function SettingsPanel({
  collapsed,
  onToggleCollapsed,
}: SettingsPanelProps) {
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

  if (collapsed) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center gap-2 bg-background py-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapsed}
                aria-label="Show settings"
                className="h-8 w-8"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
            }
          />
          <TooltipContent side="left">Show settings</TooltipContent>
        </Tooltip>
        <div className="my-1 h-px w-6 bg-border" aria-hidden />
        <Tooltip>
          <TooltipTrigger
            render={
              <div
                aria-hidden
                className="flex h-8 w-8 items-center justify-center text-muted-foreground"
              >
                <Settings2Icon className="h-4 w-4" />
              </div>
            }
          />
          <TooltipContent side="left">Settings</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Settings2Icon className="h-4 w-4" />
          Settings
        </div>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapsed}
                aria-label="Hide settings"
                className="h-7 w-7"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            }
          />
          <TooltipContent side="left">Hide settings</TooltipContent>
        </Tooltip>
      </div>
      <div className="min-h-0 flex-1">
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
      </div>
    </div>
  );
}
