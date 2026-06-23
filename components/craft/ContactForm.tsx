"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import { ColorField } from "@/components/craft/settings/ColorField";
import { SelectField } from "@/components/craft/settings/SelectField";
import { Button } from "@/components/ui/button";

type ContactFormProps = {
  title?: string;
  nameLabel?: string;
  emailLabel?: string;
  messageLabel?: string;
  submitText?: string;
  background?: string;
  accent?: string;
  customId?: string;
};

export function ContactForm({
  title = "Get in touch",
  nameLabel = "Name",
  emailLabel = "Email",
  messageLabel = "Message",
  submitText = "Send message",
  background = "#f8fafc",
  accent = "#0f172a",
  customId = "",
}: ContactFormProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  return (
    <form
      ref={(ref) => {
        connect(drag(ref!));
      }}
      id={customId || undefined}
      onSubmit={(e) => e.preventDefault()}
      className={cn(
        "mx-auto flex w-full max-w-md flex-col gap-3 rounded-xl border p-6 outline-none",
        selected && "ring-2 ring-primary/40 ring-offset-2"
      )}
      style={{ background }}
    >
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{nameLabel}</span>
        <input
          type="text"
          placeholder="Your name"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{emailLabel}</span>
        <input
          type="email"
          placeholder="you@example.com"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{messageLabel}</span>
        <textarea
          rows={4}
          placeholder="..."
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </label>
      <Button
        type="submit"
        className="mt-2 w-full"
        style={{ backgroundColor: accent }}
      >
        {submitText}
      </Button>
    </form>
  );
}

function ContactFormSettings() {
  const {
    actions: { setProp },
    title,
    nameLabel,
    emailLabel,
    messageLabel,
    submitText,
    background,
    accent,
    customId,
  } = useNode((node) => ({
    title: node.data.props.title as string,
    nameLabel: node.data.props.nameLabel as string,
    emailLabel: node.data.props.emailLabel as string,
    messageLabel: node.data.props.messageLabel as string,
    submitText: node.data.props.submitText as string,
    background: node.data.props.background as string,
    accent: node.data.props.accent as string,
    customId: (node.data.props.customId as string) ?? "",
  })) as any;

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: ContactFormProps) => {
              props.customId = e.target.value;
            })
          }
          placeholder="contact"
        />
      </FieldRow>
      <FieldRow label="Title">
        <Input
          value={title}
          onChange={(e) =>
            setProp((props: ContactFormProps) => {
              props.title = e.target.value;
            })
          }
        />
      </FieldRow>
      <FieldRow label="Name label">
        <Input
          value={nameLabel}
          onChange={(e) =>
            setProp((props: ContactFormProps) => {
              props.nameLabel = e.target.value;
            })
          }
        />
      </FieldRow>
      <FieldRow label="Email label">
        <Input
          value={emailLabel}
          onChange={(e) =>
            setProp((props: ContactFormProps) => {
              props.emailLabel = e.target.value;
            })
          }
        />
      </FieldRow>
      <FieldRow label="Message label">
        <Input
          value={messageLabel}
          onChange={(e) =>
            setProp((props: ContactFormProps) => {
              props.messageLabel = e.target.value;
            })
          }
        />
      </FieldRow>
      <FieldRow label="Submit button text">
        <Input
          value={submitText}
          onChange={(e) =>
            setProp((props: ContactFormProps) => {
              props.submitText = e.target.value;
            })
          }
        />
      </FieldRow>
      <SelectField
        label="Layout hint"
        value="stacked"
        onChange={() => {}}
        options={[{ value: "stacked", label: "Stacked" }]}
      />
      <ColorField
        label="Card background"
        value={background}
        onChange={(v) =>
          setProp((props: ContactFormProps) => {
            props.background = v;
          })
        }
      />
      <ColorField
        label="Button color"
        value={accent}
        onChange={(v) =>
          setProp((props: ContactFormProps) => {
            props.accent = v;
          })
        }
      />
    </div>
  );
}

ContactForm.craft = {
  displayName: "Contact Form",
  props: {
    title: "Get in touch",
    nameLabel: "Name",
    emailLabel: "Email",
    messageLabel: "Message",
    submitText: "Send message",
    background: "#f8fafc",
    accent: "#0f172a",
    customId: "",
  },
  related: {
    settings: ContactFormSettings,
  },
};