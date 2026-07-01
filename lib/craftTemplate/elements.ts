// The craft element sentinels used as JSX tags inside template files
// (`<Container>`, `<Section>`, …). Each is a no-op function tagged with its
// Craft.js resolved name; the JSX factory (./core.createElement) reads that
// name and never renders the function.
//
// Prop types are inferred straight from the real components via
// `React.ComponentProps<typeof X>`, using `import type` so there is **no
// runtime coupling** to the "use client" craft components (and no prop-name
// drift — if a component's props change, the templates stop compiling).

import type {
  Badge as BadgeComp,
  Card as CardComp,
  ContactForm as ContactFormComp,
  Container as ContainerComp,
  CtaButton as CtaButtonComp,
  Divider as DividerComp,
  Grid as GridComp,
  Heading as HeadingComp,
  IconBox as IconBoxComp,
  ImageBlock as ImageBlockComp,
  List as ListComp,
  Navbar as NavbarComp,
  Section as SectionComp,
  Spacer as SpacerComp,
  Text as TextComp,
  Video as VideoComp,
} from "@/components/craft";
import type { ComponentProps, JSXElementConstructor } from "react";
import { defineElement } from "./core";

/**
 * Resolve a craft component's props. Constrained to JSXElementConstructor so
 * both plain function components (Heading, …) and `memo()`-wrapped ones
 * (Card, Grid) satisfy ComponentProps without drift-prone re-typing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type P<T extends JSXElementConstructor<any>> = ComponentProps<T>;

// Layout containers (accept children). Grid children become its column slots.
export const Container = defineElement<P<typeof ContainerComp>>("Container");
export const Section = defineElement<P<typeof SectionComp>>("Section");
export const Card = defineElement<P<typeof CardComp>>("Card");
export const Grid = defineElement<P<typeof GridComp>>("Grid");

// Leaf content components (no children).
export const Heading = defineElement<P<typeof HeadingComp>>("Heading");
export const Text = defineElement<P<typeof TextComp>>("Text");
export const CtaButton = defineElement<P<typeof CtaButtonComp>>("CtaButton");
export const Badge = defineElement<P<typeof BadgeComp>>("Badge");
export const List = defineElement<P<typeof ListComp>>("List");
export const IconBox = defineElement<P<typeof IconBoxComp>>("IconBox");
export const ImageBlock = defineElement<P<typeof ImageBlockComp>>("ImageBlock");
export const Divider = defineElement<P<typeof DividerComp>>("Divider");
export const Spacer = defineElement<P<typeof SpacerComp>>("Spacer");
export const Video = defineElement<P<typeof VideoComp>>("Video");
export const ContactForm = defineElement<P<typeof ContactFormComp>>(
  "ContactForm",
);
export const Navbar = defineElement<P<typeof NavbarComp>>("Navbar");
