"use client";

import { useEditor, useNode } from "@craftjs/core";
import React from "react";
import { cn } from "@/lib/utils";

type RenderNodeProps = {
  render: React.ReactElement;
};

export function RenderNode({ render }: RenderNodeProps) {
  const { id } = useNode();
  const { isActive } = useEditor((_, query) => ({
    isActive: query.getEvent("selected").contains(id),
  }));

  return (
    <div
      className={cn(
        "relative",
        isActive && "outline outline-2 outline-primary outline-offset-2"
      )}
    >
      {render}
    </div>
  );
}
