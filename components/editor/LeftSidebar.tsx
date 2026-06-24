"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LayersIcon,
  LayoutTemplateIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LayersPanel } from "@/components/editor/LayersPanel";
import { Toolbox } from "@/components/editor/Toolbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export type LeftSidebarTab = "layers" | "components";

type LeftSidebarProps = {
  /** Whether the sidebar is folded into its 48px icon rail. */
  collapsed: boolean;
  /** Toggle for the collapsed state — wired to the chevron button. */
  onToggleCollapsed: () => void;
  /** Currently active tab. Defaults to "layers". */
  defaultTab?: LeftSidebarTab;
};

/**
 * Fixed-width left column shared by the Layers panel and the Components
 * toolbox. The user switches between the two via tabs; the column is
 * either 240px (expanded) or 48px (folded), with no resizable handle.
 *
 * Folded state lives in the parent (`SiteEditor`) so the canvas can
 * reclaim the space if needed.
 */
export function LeftSidebar({
  collapsed,
  onToggleCollapsed,
  defaultTab = "layers",
}: LeftSidebarProps) {
  const [tab, setTab] = useState<LeftSidebarTab>(defaultTab);

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
                aria-label="Show sidebar"
                className="h-8 w-8"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            }
          />
          <TooltipContent side="right">Show sidebar</TooltipContent>
        </Tooltip>
        <div className="my-1 h-px w-6 bg-border" aria-hidden />
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setTab("layers");
                  onToggleCollapsed();
                }}
                aria-label="Show layers"
                className="h-8 w-8"
              >
                <LayersIcon className="h-4 w-4" />
              </Button>
            }
          />
          <TooltipContent side="right">Layers</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setTab("components");
                  onToggleCollapsed();
                }}
                aria-label="Show components"
                className="h-8 w-8"
              >
                <LayoutTemplateIcon className="h-4 w-4" />
              </Button>
            }
          />
          <TooltipContent side="right">Components</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-3">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as LeftSidebarTab)}
          className="flex-1"
        >
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="layers" className="gap-1.5">
              <LayersIcon className="h-4 w-4" />
              Layers
            </TabsTrigger>
            <TabsTrigger value="components" className="gap-1.5">
              <LayoutTemplateIcon className="h-4 w-4" />
              Components
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapsed}
                aria-label="Hide sidebar"
                className="h-7 w-7"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
            }
          />
          <TooltipContent side="right">Hide sidebar</TooltipContent>
        </Tooltip>
      </div>
      <div className="min-h-0 flex-1">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as LeftSidebarTab)}
          className="h-full"
        >
          <TabsContent value="layers" className="h-full mt-0">
            <LayersPanel />
          </TabsContent>
          <TabsContent value="components" className="h-full mt-0">
            <Toolbox />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
