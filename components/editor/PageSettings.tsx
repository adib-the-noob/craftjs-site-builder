"use client";

import { useNode } from "@craftjs/core";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ColorField } from "@/components/craft/settings/ColorField";

type RootProps = {
  background?: string;
  metaTitle?: string;
  metaDescription?: string;
  customCss?: string;
};

export function PageSettings() {
  const {
    actions: { setProp },
    background,
    metaTitle,
    metaDescription,
    customCss,
  } = useNode((node) => ({
    background: (node.data.props.background as string) ?? "#ffffff",
    metaTitle: (node.data.props.metaTitle as string) ?? "",
    metaDescription: (node.data.props.metaDescription as string) ?? "",
    customCss: (node.data.props.customCss as string) ?? "",
  }));

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Page settings
      </p>
      <p className="text-xs text-muted-foreground">
        Settings here apply to the entire page (the root container).
      </p>
      <ColorField
        label="Page background"
        value={background}
        onChange={(v) =>
          setProp((props: RootProps) => {
            props.background = v;
          })
        }
      />
      <FieldRow label="Browser tab title">
        <Input
          value={metaTitle}
          onChange={(e) =>
            setProp((props: RootProps) => {
              props.metaTitle = e.target.value;
            })
          }
          placeholder="My site"
        />
      </FieldRow>
      <FieldRow label="Meta description">
        <Textarea
          value={metaDescription}
          rows={3}
          onChange={(e) =>
            setProp((props: RootProps) => {
              props.metaDescription = e.target.value;
            })
          }
          placeholder="Short description for search engines and previews."
        />
      </FieldRow>
      <FieldRow label="Custom CSS (preview only)">
        <Textarea
          value={customCss}
          rows={6}
          onChange={(e) =>
            setProp((props: RootProps) => {
              props.customCss = e.target.value;
            })
          }
          placeholder="body { font-family: serif; }"
        />
      </FieldRow>
    </div>
  );
}