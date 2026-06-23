"use client";

import React from "react";
import { useEditor } from "@craftjs/core";
import { CopyIcon, Trash2Icon, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resolver } from "@/lib/resolver";
import { setClipboard, getClipboard } from "@/lib/clipboard";

type ResolverMap = Record<string, React.ComponentType<Record<string, unknown>>>;

export function SelectionActions() {
  const {
    selectedId,
    actions,
    query,
    canMoveUp,
    canMoveDown,
    selectedDisplayName,
  } = useEditor((state, query) => {
    const id = query.getEvent("selected").first();
    if (!id) {
      return {
        selectedId: null as string | null,
        canMoveUp: false,
        canMoveDown: false,
        selectedDisplayName: "" as string,
      };
    }
    const node = query.node(id).get();
    const parentId = node.data.parent;
    const siblings =
      parentId && query.node(parentId).get().data.nodes.includes(id)
        ? query.node(parentId).get().data.nodes
        : [];
    const idx = siblings.indexOf(id);
    return {
      selectedId: id,
      canMoveUp: idx > 0,
      canMoveDown: idx >= 0 && idx < siblings.length - 1,
      selectedDisplayName: node.data.displayName,
    };
  });

  if (!selectedId) return null;

  const lookupType = (
    componentType: string | React.ComponentType
  ): React.ComponentType<Record<string, unknown>> | null => {
    // At runtime, componentType is the React component reference (or its string name
    // if a string was used in the resolver). For our resolver we only use
    // component references, so we match by reference identity.
    const map = resolver as ResolverMap;
    if (typeof componentType === "string") {
      return map[componentType] ?? null;
    }
    for (const key of Object.keys(map)) {
      if (map[key] === componentType) return map[key];
    }
    return null;
  };

  const getTypeName = (
    componentType: string | React.ComponentType
  ): string | null => {
    const map = resolver as ResolverMap;
    if (typeof componentType === "string") return componentType;
    for (const key of Object.keys(map)) {
      if (map[key] === componentType) return key;
    }
    return null;
  };

  const handleDuplicate = () => {
    const node = query.node(selectedId).get();
    const { type, props, displayName } = node.data;
    const Type = lookupType(type);
    if (!Type) {
      toast.error(`Unknown component: ${displayName}`);
      return;
    }
    const freshNode = query.createNode(React.createElement(Type, props));
    const parentId = node.data.parent ?? "ROOT";
    actions.add(freshNode, parentId);
    toast.success(`Duplicated "${displayName}"`);
  };

  const handleCopy = () => {
    const node = query.node(selectedId).get();
    const typeName = getTypeName(node.data.type);
    if (!typeName) return;
    setClipboard({
      type: typeName,
      props: JSON.parse(JSON.stringify(node.data.props)),
      displayName: node.data.displayName,
      parent: node.data.parent,
    });
    toast.success(`Copied "${node.data.displayName}"`);
  };

  const handlePaste = () => {
    const data = getClipboard();
    if (!data) return;
    const Type = (resolver as ResolverMap)[data.type];
    if (!Type) {
      toast.error(`Unknown component: ${data.type}`);
      return;
    }
    const node = query.node(selectedId).get();
    const parentId = node.data.parent ?? "ROOT";
    const newNode = query.createNode(React.createElement(Type, data.props));
    actions.add(newNode, parentId);
    toast.success(`Pasted "${data.displayName}"`);
  };

  const handleMove = (direction: "up" | "down") => {
    const node = query.node(selectedId).get();
    const parentId = node.data.parent;
    if (!parentId) return;
    const siblings = query.node(parentId).get().data.nodes;
    const idx = siblings.indexOf(selectedId);
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= siblings.length) return;
    actions.move(selectedId, parentId, swapWith);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    if (!query.node(selectedId).isDeletable()) {
      toast.error("This element cannot be deleted");
      return;
    }
    actions.delete(selectedId);
    toast.info(`Deleted "${selectedDisplayName}"`);
  };

  return (
    <div className="flex items-center gap-1 rounded-md border bg-background p-1 shadow-sm">
      <Button
        size="icon-xs"
        variant="ghost"
        onClick={handleDuplicate}
        title="Duplicate"
      >
        <CopyIcon />
      </Button>
      <Button size="icon-xs" variant="ghost" onClick={handleCopy} title="Copy">
        <CopyIcon />
      </Button>
      <Button
        size="icon-xs"
        variant="ghost"
        onClick={handlePaste}
        title="Paste after selection"
      >
        <span className="text-xs font-semibold">Paste</span>
      </Button>
      <div className="mx-1 h-4 w-px bg-border" />
      <Button
        size="icon-xs"
        variant="ghost"
        disabled={!canMoveUp}
        onClick={() => handleMove("up")}
        title="Move up"
      >
        <ArrowUpIcon />
      </Button>
      <Button
        size="icon-xs"
        variant="ghost"
        disabled={!canMoveDown}
        onClick={() => handleMove("down")}
        title="Move down"
      >
        <ArrowDownIcon />
      </Button>
      <div className="mx-1 h-4 w-px bg-border" />
      <Button
        size="icon-xs"
        variant="ghost"
        onClick={handleDelete}
        className="text-destructive hover:text-destructive"
        title="Delete (Del)"
      >
        <Trash2Icon />
      </Button>
    </div>
  );
}