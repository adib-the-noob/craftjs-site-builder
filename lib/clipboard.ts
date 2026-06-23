"use client";

// Module-level clipboard for copy/paste of CraftJS nodes.
// We keep the raw "data" object captured from query.node(id).get(),
// because query.createNode() requires a React element to clone, and we want
// to reconstruct the element fresh at paste time using the current resolver.

export type ClipboardPayload = {
  type: string; // resolvedName
  props: Record<string, unknown>;
  displayName: string;
  parent?: string | null;
};

let buffer: ClipboardPayload | null = null;

export function setClipboard(payload: ClipboardPayload | null) {
  buffer = payload;
}

export function getClipboard(): ClipboardPayload | null {
  return buffer;
}