"use client";

import { Element, useEditor } from "@craftjs/core";
import {
  BoxIcon,
  Heading1Icon,
  ImageIcon,
  LayoutTemplateIcon,
  ListIcon,
  MailIcon,
  MousePointerClickIcon,
  Rows3Icon,
  SparklesIcon,
  SquareIcon,
  TagIcon,
  TypeIcon,
  VideoIcon,
  MinusIcon,
} from "lucide-react";
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
} from "@/components/craft";
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type Item = {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  element: React.ReactElement;
  group: "Layout" | "Content" | "Media" | "Form";
};

const toolboxItems: Item[] = [
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

export function Toolbox() {
  const { connectors } = useEditor();

  const groups: Item["group"][] = ["Layout", "Content", "Media", "Form"];

  return (
    <UICard className="flex h-full min-h-0 flex-col rounded-none border-0 border-r shadow-none">
      <CardHeader className="shrink-0 border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <LayoutTemplateIcon />
          Components
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 p-0">
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
                    <button
                      key={item.name}
                      ref={(ref) => {
                        if (ref) {
                          connectors.create(ref, item.element);
                        }
                      }}
                      type="button"
                      className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </UICard>
  );
}