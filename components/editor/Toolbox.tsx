"use client";

import { Element, useEditor } from "@craftjs/core";
import {
  BoxIcon,
  Heading1Icon,
  ImageIcon,
  LayoutTemplateIcon,
  ListIcon,
  MailIcon,
  MenuIcon,
  MousePointerClickIcon,
  Rows3Icon,
  SparklesIcon,
  SquareIcon,
  TagIcon,
  TypeIcon,
  VideoIcon,
  MinusIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";

import {
  Container,
  CtaButton,
  Heading,
  ImageBlock,
  Section,
  Text,
  Divider,
  Spacer,
  Badge,
  List,
  Card,
  Grid,
  IconBox,
  Video,
  ContactForm,
  Navbar,
} from "@/components/craft";
import { ScrollArea } from "@/components/ui/scroll-area";

type Item = {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  element: React.ReactElement;
  group: "Layout" | "Content" | "Media" | "Form";
};

const toolboxItems: Item[] = [
  {
    name: "Navbar",
    icon: MenuIcon,
    group: "Layout",
    // Wrap in <Section> so the navbar lands as a top-level page row by
    // default — pages always render Section > children, and a navbar
    // dropping in unparented looks odd in the canvas.
    element: (
      <Element canvas is={Section} paddingY={0}>
        <Element is={Navbar} />
      </Element>
    ),
  },
  {
    name: "Section",
    icon: Rows3Icon,
    group: "Layout",
    element: <Element canvas is={Section} />,
  },
  {
    name: "Container",
    icon: BoxIcon,
    group: "Layout",
    element: <Element canvas is={Container} />,
  },
  {
    name: "Grid",
    icon: LayoutTemplateIcon,
    group: "Layout",
    element: <Element canvas is={Grid} columns={3} />,
  },
  {
    name: "Divider",
    icon: MinusIcon,
    group: "Layout",
    element: <Divider />,
  },
  {
    name: "Spacer",
    icon: SquareIcon,
    group: "Layout",
    element: <Spacer />,
  },
  {
    name: "Heading",
    icon: Heading1Icon,
    group: "Content",
    element: <Heading />,
  },
  {
    name: "Text",
    icon: TypeIcon,
    group: "Content",
    element: <Text />,
  },
  {
    name: "List",
    icon: ListIcon,
    group: "Content",
    element: <List />,
  },
  {
    name: "Badge",
    icon: TagIcon,
    group: "Content",
    element: <Badge />,
  },
  {
    name: "Card",
    icon: SquareIcon,
    group: "Content",
    element: <Element canvas is={Card} />,
  },
  {
    name: "Button",
    icon: MousePointerClickIcon,
    group: "Content",
    element: <CtaButton />,
  },
  {
    name: "Icon Feature",
    icon: SparklesIcon,
    group: "Content",
    element: <IconBox />,
  },
  {
    name: "Image",
    icon: ImageIcon,
    group: "Media",
    element: <ImageBlock />,
  },
  {
    name: "Video",
    icon: VideoIcon,
    group: "Media",
    element: <Video />,
  },
  {
    name: "Contact Form",
    icon: MailIcon,
    group: "Form",
    element: <ContactForm />,
  },
];

function ToolboxItem({ item }: { item: Item }) {
  const { connectors } = useEditor();
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Bind the drag-source listeners. Craft.js's `connectors.create` returns
    // `void` (no cleanup) on this build, so re-binding on remount is safe —
    // the previous binding is replaced when the same DOM node is reused, and
    // detached when the node unmounts.
    connectors.create(el, item.element);
  }, [connectors, item.element]);

  return (
    <button
      ref={ref}
      type="button"
      draggable
      className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
    >
      <item.icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">{item.name}</span>
    </button>
  );
}

/**
 * Components drawer rendered inside the left sidebar's "Components"
 * tab. The outer tabs header / fold button live on `LeftSidebar`.
 */
export function Toolbox() {
  const groups: Item["group"][] = ["Layout", "Content", "Media", "Form"];

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        {groups.map((group) => {
          const items = toolboxItems.filter((it) => it.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </p>
              {items.map((item) => (
                <ToolboxItem key={item.name} item={item} />
              ))}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
