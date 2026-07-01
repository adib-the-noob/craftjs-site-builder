// ---------------------------------------------------------------------------
// craftTemplate — author Craft.js page trees as real JSX, compile them to the
// exact serialized shape the editor stores, and ship them as built-in templates.
//
// A template file looks like this:
//
//   /** @jsxImportSource @/lib/craftTemplate */
//   import { template, Container, Section, Heading, CtaButton } from "@/lib/craftTemplate";
//
//   export default template(
//     { id: "saas", name: "SaaS Landing", description: "…" },
//     <Container maxWidth={0}>
//       <Section background="#0f172a">
//         <Heading text="Ship faster" level="h1" />
//       </Section>
//     </Container>,
//   );
//
// The `@jsxImportSource` pragma (above) makes the compiler call OUR `jsx`
// factory (see ./jsx-runtime) instead of React's. Each craft element
// (`<Container>`, `<Section>`, …) is a *sentinel* — `jsx`/`createElement`
// turns it into a lightweight Descriptor, never invoking it as a component.
// `serialize()` then walks the descriptor tree and emits the flat
// `{ ROOT: {…}, nodeA: {…}, … }` map Craft.js stores in `site_data`.
//
// Output is byte-for-byte compatible with data/templates.json, so a built-in
// template loads, edits, and saves exactly like a hand-authored one.
// ---------------------------------------------------------------------------

import type { ComponentType, ReactElement } from "react";
import { Fragment as ReactFragment } from "react";
import type { SiteTemplate } from "@/lib/constants";

/**
 * Internal, in-memory representation of one Craft.js node, before ids and
 * parent links are assigned. Produced by `createElement` / the JSX factory.
 */
export type Descriptor = {
  /** Brand so we can tell a Descriptor apart from a stray React element. */
  readonly $$craft: true;
  /** Craft.js `resolvedName` (e.g. "Container"), or FRAGMENT. */
  readonly type: string;
  /** Props the author set (minus `children`/`key`/`ref`). */
  readonly props: Record<string, unknown>;
  /** Child descriptors, in order. */
  readonly children: Descriptor[];
};

const FRAGMENT = "__fragment__";

/** Node types whose Craft.js node is a droppable canvas (isCanvas: true). */
const CONTAINER_TYPES = new Set(["Container", "Section", "Card", "Grid"]);

/**
 * Components whose direct children become *linked nodes* rather than regular
 * `nodes`. The Grid renders a fixed set of `<Element id="cell-N" canvas
 * is={Container} />` column slots (see components/craft/Grid.tsx), so its
 * columns must be stored under `linkedNodes["cell-N"]` — and each column must
 * itself be a Container to match the slot's `is={Container}` (Craft.js reuses
 * a saved linked node only when its type matches the slot, verified in
 * @craftjs/core's `<Element>` render path).
 */
const SLOT_PREFIX: Record<string, string> = { Grid: "cell" };

// ---------------------------------------------------------------------------
// Element sentinels
// ---------------------------------------------------------------------------

/**
 * A craft element is a plain function tagged with `$$craft = "<resolvedName>"`.
 * It is typed as a React component so `<Container …/>` is fully prop-checked,
 * but it is *never rendered* — `createElement` only reads `type.$$craft`.
 */
export type CraftComponent<P> = (props: P) => ReactElement | null;

/**
 * Define a craft element for JSX. The returned value is a no-op function
 * carrying the resolved name; its TypeScript type is a component accepting `P`,
 * so the compiler checks every prop the author writes.
 */
export function defineElement<P>(name: string): CraftComponent<P> {
  const fn = (() => null) as unknown as CraftComponent<P> & {
    $$craft: string;
  };
  (fn as { $$craft: string }).$$craft = name;
  return fn;
}

// ---------------------------------------------------------------------------
// createElement / jsx core
// ---------------------------------------------------------------------------

function isDescriptor(v: unknown): v is Descriptor {
  return (
    typeof v === "object" &&
    v !== null &&
    (v as { $$craft?: unknown }).$$craft === true
  );
}

/**
 * Turn one JSX element into a Descriptor. `config` is the props object the
 * automatic JSX runtime passes (children live under `config.children`).
 */
export function createElement(type: unknown, config: unknown): Descriptor {
  // Resolve the Craft.js name. `<>…</>` arrives as React's Fragment.
  let name: string;
  if (type === ReactFragment) {
    name = FRAGMENT;
  } else {
    name = (type as { $$craft?: string } | null | undefined)?.$$craft ?? "";
    if (!name) {
      throw new Error(
        "craftTemplate: unknown JSX element. Every tag must be a craft " +
          "element imported from @/lib/craftTemplate (e.g. Container, Section).",
      );
    }
  }

  const props: Record<string, unknown> = {};
  let rawChildren: unknown = undefined;

  if (config && typeof config === "object") {
    for (const [key, value] of Object.entries(
      config as Record<string, unknown>,
    )) {
      if (key === "key" || key === "ref") continue;
      if (key === "children") {
        rawChildren = value;
        continue;
      }
      if (value === undefined) continue;
      props[key] = value;
    }
  }

  const children = normalizeChildren(rawChildren);

  // Leaves can't hold children — surfaces authoring mistakes at build time.
  if (
    name !== FRAGMENT &&
    !CONTAINER_TYPES.has(name) &&
    children.length > 0
  ) {
    throw new Error(
      `craftTemplate: <${name}> is a leaf component and cannot contain children.`,
    );
  }

  return { $$craft: true, type: name, props, children };
}

/**
 * Flatten JSX children into a flat list of Descriptors.
 * - arrays (incl. nested, from `.map()` / fragments) are flattened;
 * - `null`/`undefined`/`boolean` (conditionals) are dropped;
 * - Descriptors pass through; fragments expand to their children;
 * - raw strings/numbers have no Craft.js node to live in (templates put text
 *   in `Text`/`Heading` props), so they are ignored with a dev warning.
 */
function normalizeChildren(raw: unknown): Descriptor[] {
  const out: Descriptor[] = [];
  const walk = (v: unknown) => {
    if (v === null || v === undefined || typeof v === "boolean") return;
    if (Array.isArray(v)) {
      for (const item of v) walk(item);
      return;
    }
    if (isDescriptor(v)) {
      if (v.type === FRAGMENT) {
        for (const child of v.children) walk(child);
      } else {
        out.push(v);
      }
      return;
    }
    if (typeof v === "string" || typeof v === "number") {
      if (typeof v === "string" && v.trim().length === 0) return;
      console.warn(
        `craftTemplate: ignoring bare text "${String(v).slice(0, 40)}" — put copy inside a <Text> or <Heading> prop instead.`,
      );
      return;
    }
  };
  walk(raw);
  return out;
}

// ---------------------------------------------------------------------------
// serialize — Descriptor tree → flat Craft.js node map
// ---------------------------------------------------------------------------

type CraftNode = {
  type: { resolvedName: string };
  nodes: string[];
  props: Record<string, unknown>;
  custom: Record<string, unknown>;
  hidden: boolean;
  isCanvas: boolean;
  displayName: string;
  linkedNodes: Record<string, string>;
  parent?: string;
};

type CraftTree = Record<string, CraftNode>;

export type TemplateMeta = {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  /** Written onto the ROOT Container's props (read by the editor's <head>/meta path). */
  metaTitle?: string;
  metaDescription?: string;
  customCss?: string;
};

/**
 * Compile a descriptor tree into the flat Craft.js node map stored as
 * `site_data`. Node ids are deterministic per call (scoped counter), unique,
 * and never `"ROOT"`. The root descriptor must be a <Container>.
 */
export function serialize(
  root: Descriptor,
  meta: TemplateMeta | null | undefined = undefined,
): Record<string, unknown> {
  if (root.type !== "Container") {
    throw new Error(
      "craftTemplate: a template's root element must be a <Container>.",
    );
  }

  const tree: CraftTree = {};
  let counter = 0;
  const nextId = (typeName: string) =>
    `${typeName.toLowerCase()}-${(counter += 1)}`;

  buildNode(root, "ROOT", null, true, tree, nextId, meta);
  return tree;
}

function buildNode(
  desc: Descriptor,
  id: string,
  parentId: string | null,
  isRoot: boolean,
  tree: CraftTree,
  nextId: (t: string) => string,
  meta: TemplateMeta | null | undefined,
): void {
  const isCanvas = isRoot || CONTAINER_TYPES.has(desc.type);
  const slotPrefix = SLOT_PREFIX[desc.type];

  const nodes: string[] = [];
  const linkedNodes: Record<string, string> = {};

  if (slotPrefix) {
    // Grid columns: each child becomes a linked node keyed `${prefix}-N`.
    // Auto-wrap non-Container children so every column matches the Grid's
    // `<Element id="cell-N" is={Container}>` slot type (see SLOT_PREFIX note).
    let slot = 0;
    for (const child of desc.children) {
      const column =
        child.type === "Container"
          ? child
          : ({ $$craft: true, type: "Container", props: {}, children: [child] } as Descriptor);
      const cid = nextId(column.type);
      buildNode(column, cid, id, false, tree, nextId, null);
      linkedNodes[`${slotPrefix}-${slot}`] = cid;
      slot += 1;
    }
  } else {
    for (const child of desc.children) {
      const cid = nextId(child.type);
      buildNode(child, cid, id, false, tree, nextId, null);
      nodes.push(cid);
    }
  }

  const props: Record<string, unknown> = { ...desc.props };
  if (isRoot && meta) {
    if (meta.metaTitle !== undefined) props.metaTitle = meta.metaTitle;
    if (meta.metaDescription !== undefined)
      props.metaDescription = meta.metaDescription;
    if (meta.customCss !== undefined) props.customCss = meta.customCss;
  }

  const node: CraftNode = {
    type: { resolvedName: desc.type },
    nodes,
    props,
    custom: {},
    hidden: false,
    isCanvas,
    displayName: desc.type,
    linkedNodes,
  };
  if (parentId) node.parent = parentId;

  tree[id] = node;
}

// ---------------------------------------------------------------------------
// template() — the template-file entry point
// ---------------------------------------------------------------------------

/**
 * Define a built-in template. `root` is the JSX tree (a <Container>…</Container>
 * element); at runtime the JSX factory has already compiled it to a Descriptor.
 */
export function template(meta: TemplateMeta, root: unknown): SiteTemplate {
  if (!isDescriptor(root)) {
    throw new Error(
      "craftTemplate: template() expected a <Container>…</Container> element " +
        "as its second argument. If you are seeing this, the " +
        "/** @jsxImportSource @/lib/craftTemplate */ pragma at the top of the " +
        "template file was not applied by the compiler.",
    );
  }
  return {
    id: meta.id,
    name: meta.name,
    description: meta.description,
    ...(meta.thumbnail ? { thumbnail: meta.thumbnail } : {}),
    data: serialize(root, meta),
  };
}

/** Re-exported for type-only consumers (registry, tests). */
export type { ComponentType, SiteTemplate };
