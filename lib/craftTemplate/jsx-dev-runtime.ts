// Signature mirrors React's jsxDEV positionally; only `type`/`props` are used.
/* eslint-disable @typescript-eslint/no-unused-vars */

// Dev automatic-JSX runtime for craftTemplate template files. Next.js uses the
// dev runtime (`jsxDEV`) during `next dev` and the production runtime
// (`jsx`/`jsxs`) during `next build`, so both must exist. See ./jsx-runtime.

import type { ElementType, Key, ReactElement } from "react";

export { Fragment } from "react";
export type { JSX } from "react";

import { createElement } from "./core";

export interface JSXSource {
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
}

export function jsxDEV(
  type: ElementType,
  props: unknown,
  key: Key | undefined,
  _isStatic: boolean,
  _source?: JSXSource,
  _self?: unknown,
): ReactElement {
  return createElement(type, props) as unknown as ReactElement;
}
