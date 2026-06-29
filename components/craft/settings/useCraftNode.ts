"use client";

import { useNode } from "@craftjs/core";

/**
 * Strongly-typed wrappers around Craft.js's `useNode`. These exist so
 * that Card / Grid / Container (and the rest of the craft layer) can
 * stop scattering `as any` casts in every settings panel.
 *
 * - `useCraftProps<T>(mapFn)` returns a `T`-shaped object built from
 *   the live node data. Useful for reading many props at once.
 * - `useCraftSelected()` returns just the `selected` boolean. Splitting
 *   this out means siblings don't re-render when an unrelated node is
 *   selected.
 * - `useCraftSetProp<T>()` returns the typed `setProp` callback from
 *   the node's `actions` (the modern API — `useNode().setProp` is
 *   deprecated).
 */
export function useCraftProps<T>(mapFn: (node: any) => Partial<T>): Partial<T> {
  return useNode((node) => mapFn(node)) as Partial<T>;
}

export function useCraftSelected(): boolean {
  return useNode((node) => node.events.selected) as unknown as boolean;
}

export function useCraftSetProp<T>(): (cb: (props: T) => void) => void {
  // Calling `useNode()` without a selector returns the full result
  // including `actions`, which holds `setProp`. Calling with a selector
  // only gives us what the selector returned from the underlying node
  // data — it does NOT include `actions`.
  const node = useNode() as any;
  const setProp = node.actions.setProp as (cb: (props: T) => void) => void;
  return setProp as unknown as (cb: (props: T) => void) => void;
}