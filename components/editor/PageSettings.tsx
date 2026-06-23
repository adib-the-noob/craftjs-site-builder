"use client";

import { useEditor } from "@craftjs/core";
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

/**
 * `PageSettings` is rendered by `SettingsPanel` as a sibling of the canvas
 * (inside `<Editor>` but outside any `<Element>`). That means `useNode` is
 * not valid here — it only works for components that are descendants of a
 * Craft `<Element>`. For root-level page settings we read/write the ROOT
 * node directly via `useEditor()` + `query.node("ROOT")`.
 */
export function PageSettings() {
  const { actions, query } = useEditor();
  const root = query.node("ROOT").get();
  const props = (root.data.props ?? {}) as RootProps;

  const update = (patch: Partial<RootProps>) => {
    actions.setProp("ROOT", (p: RootProps) => Object.assign(p, patch));
  };

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
        value={props.background ?? "#ffffff"}
        onChange={(v) => update({ background: v })}
      />
      <FieldRow label="Browser tab title">
        <Input
          value={props.metaTitle ?? ""}
          onChange={(e) => update({ metaTitle: e.target.value })}
          placeholder="My site"
        />
      </FieldRow>
      <FieldRow label="Meta description">
        <Textarea
          value={props.metaDescription ?? ""}
          rows={3}
          onChange={(e) => update({ metaDescription: e.target.value })}
          placeholder="Short description for search engines and previews."
        />
      </FieldRow>
      <FieldRow label="Custom CSS (preview only)">
        <Textarea
          value={props.customCss ?? ""}
          rows={6}
          onChange={(e) => update({ customCss: e.target.value })}
          placeholder="body { font-family: serif; }"
        />
      </FieldRow>
    </div>
  );
}