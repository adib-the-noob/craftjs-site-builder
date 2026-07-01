// Public surface for craftTemplate template files. A template file does:
//
//   /** @jsxImportSource @/lib/craftTemplate */
//   import { template, Container, Section, Heading, … } from "@/lib/craftTemplate";
//
// `jsx`/`jsxs`/`jsxDEV` are *not* imported by hand — the compiler pulls them
// from ./jsx-runtime (and ./jsx-dev-runtime) automatically because of the
// `@jsxImportSource` pragma. This barrel only re-exports what authors write.

export { template } from "./core";
export type { TemplateMeta } from "./core";

export {
  Container,
  Section,
  Card,
  Grid,
  Heading,
  Text,
  CtaButton,
  Badge,
  List,
  IconBox,
  ImageBlock,
  Divider,
  Spacer,
  Video,
  ContactForm,
  Navbar,
} from "./elements";
