// Params mirror React's jsx/jsxs signature positionally (children arrive in
// `props`); `key` is accepted so keyed elements type-check but unused here.
/* eslint-disable @typescript-eslint/no-unused-vars */

// Custom automatic-JSX runtime for craftTemplate template files.
//
// A template file starts with:
//
//   /** @jsxImportSource @/lib/craftTemplate */
//
// The compiler then imports `jsx`/`jsxs`/`Fragment` (production) or
// `jsxDEV`/`Fragment` (dev) from this package's `jsx-runtime` / `jsx-dev-runtime`
// instead of `react`. We build a Descriptor (see ./core) instead of a React
// element — the whole point — while re-exporting React's `JSX` namespace and
// `Fragment` so TypeScript keeps full JSX type-checking (mirrors the layout of
// @types/react's own jsx-runtime).

import type { ElementType, Key, ReactElement } from "react";

// Keep TypeScript's JSX machinery intact under this jsxImportSource.
export { Fragment } from "react";
export type { JSX } from "react";

import { createElement } from "./core";

/**
 * Production automatic-runtime entry point. Children arrive inside `props`.
 * Returns a Descriptor (typed as ReactElement so `<X/>` still type-checks as a
 * JSX element for `template(... , <X/>)`).
 */
export function jsx(
  type: ElementType,
  props: unknown,
  key?: Key,
): ReactElement {
  return createElement(type, props) as unknown as ReactElement;
}

/** Static-children variant — same handling (we normalise children ourselves). */
export function jsxs(
  type: ElementType,
  props: unknown,
  key?: Key,
): ReactElement {
  return createElement(type, props) as unknown as ReactElement;
}
