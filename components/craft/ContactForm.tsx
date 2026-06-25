"use client";

import { useNode } from "@craftjs/core";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { Input } from "@/components/ui/input";
import {
  BackgroundField,
  BoxModelField,
  BorderField,
  ColorField,
  HoverField,
  OpacityField,
  SelectField,
  ShadowField,
  SliderField,
  ToggleField,
  TransformField,
  TransitionField,
  boxToStyle,
} from "@/components/craft/settings";
import {
  backgroundToCSS,
  borderStyleToCSS,
  hoverToCSS,
  shadowToCSS,
  transformToCSS,
  transitionToCSS,
  type BackgroundValue,
  type BorderValue,
  type HoverValue,
  type ShadowValue,
  type TransformValue,
  type TransitionValue,
} from "@/lib/craft-styles";

/** Which fields are shown in the form. Order matters — controls render order. */
type ContactFormFields = {
  name: boolean;
  email: boolean;
  phone: boolean;
  subject: boolean;
  message: boolean;
  consent: boolean;
};

type ContactFormProps = {
  title?: string;
  description?: string;
  nameLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
  subjectLabel?: string;
  messageLabel?: string;
  consentLabel?: string;
  submitText?: string;
  /** Form action URL (mailto: or https://…). Empty = preventDefault. */
  action?: string;
  /** Email subject for mailto: actions. */
  emailSubject?: string;
  background?: BackgroundValue;
  accent?: string;
  accentText?: string;
  /** Border for the whole form card. */
  border?: BorderValue;
  borderRadius?: number;
  /** Whether fields are required by default. */
  requiredFields?: boolean;
  /** Form layout. */
  layout?: "stacked" | "two-column";
  /** Which fields to render. */
  fields?: ContactFormFields;
  /** Consent text colour. */
  consentColor?: string;
  customId?: string;
  /** Tailwind-style box model. */
  boxModel?: { margin?: any; padding?: any };
  shadow?: ShadowValue;
  transform?: TransformValue;
  hover?: HoverValue;
  transition?: TransitionValue;
  opacity?: number;
};

export function ContactForm({
  title = "Get in touch",
  description = "",
  nameLabel = "Name",
  emailLabel = "Email",
  phoneLabel = "Phone",
  subjectLabel = "Subject",
  messageLabel = "Message",
  consentLabel = "I agree to be contacted about my enquiry.",
  submitText = "Send message",
  action = "",
  emailSubject = "New contact form submission",
  background = { type: "solid", color: "#f8fafc" },
  accent = "#0f172a",
  accentText = "#ffffff",
  border,
  borderRadius = 12,
  requiredFields = true,
  layout = "stacked",
  fields = {
    name: true,
    email: true,
    phone: false,
    subject: false,
    message: true,
    consent: false,
  },
  consentColor = "#475569",
  customId = "",
  boxModel,
  shadow,
  transform,
  hover,
  transition,
  opacity = 1,
}: ContactFormProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  })) as any;

  const [submitted, setSubmitted] = useState(false);

  const isTwo = layout === "two-column";

  const inputClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (action.startsWith("mailto:")) {
      // Best-effort fallback: open the user's mail client.
      window.location.href = action + (emailSubject ? `?subject=${encodeURIComponent(emailSubject)}` : "");
      return;
    }
    if (action && /^https?:\/\//.test(action)) {
      // External endpoint: just navigate; production would POST form data here.
      window.open(action, "_blank", "noopener,noreferrer");
      return;
    }
    // Default: show success state in the editor / preview.
    setSubmitted(true);
  };

  const baseStyle: React.CSSProperties = {
    ...backgroundToCSS(background),
    borderRadius,
    ...borderStyleToCSS(border),
    opacity,
    ...shadowToCSS(shadow),
    ...transformToCSS(transform),
    ...transitionToCSS(transition),
    ...boxToStyle(boxModel?.padding, "padding"),
    ...boxToStyle(boxModel?.margin, "margin"),
  };

  if (submitted) {
    return (
      <div
        ref={(ref) => { if (ref) connect(drag(ref)); }}
        id={customId || undefined}
        className={cn(
          "mx-auto flex w-full max-w-md flex-col items-center gap-3 rounded-xl border p-8 text-center outline-none",
          selected && "ring-2 ring-primary/40 ring-offset-2"
        )}
        style={baseStyle}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
          style={{ background: accent, color: accentText }}
        >
          ✓
        </div>
        <h3 className="text-xl font-semibold tracking-tight">Thanks!</h3>
        <p className="text-sm text-muted-foreground">
          Your message has been received. We'll get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="text-xs underline text-muted-foreground"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={customId || undefined}
      onSubmit={handleSubmit}
      action={action || undefined}
      className={cn(
        "mx-auto flex w-full max-w-md flex-col gap-3 border p-6 outline-none",
        selected && "ring-2 ring-primary/40 ring-offset-2"
      )}
      style={baseStyle}
    >
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <div className={cn(isTwo && "grid grid-cols-1 sm:grid-cols-2 gap-3")}>
        {fields.name && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{nameLabel}{requiredFields && " *"}</span>
            <input
              type="text"
              name="name"
              required={requiredFields}
              placeholder="Your name"
              className={inputClass}
            />
          </label>
        )}
        {fields.email && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{emailLabel}{requiredFields && " *"}</span>
            <input
              type="email"
              name="email"
              required={requiredFields}
              placeholder="you@example.com"
              className={inputClass}
            />
          </label>
        )}
        {fields.phone && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{phoneLabel}{requiredFields && " *"}</span>
            <input
              type="tel"
              name="phone"
              required={requiredFields}
              placeholder="+1 555 0123"
              className={inputClass}
            />
          </label>
        )}
        {fields.subject && (
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium">{subjectLabel}{requiredFields && " *"}</span>
            <input
              type="text"
              name="subject"
              required={requiredFields}
              placeholder="What's this about?"
              className={inputClass}
            />
          </label>
        )}
      </div>

      {fields.message && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{messageLabel}{requiredFields && " *"}</span>
          <textarea
            name="message"
            required={requiredFields}
            rows={4}
            placeholder="..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </label>
      )}

      {fields.consent && (
        <label className="flex items-start gap-2 text-xs" style={{ color: consentColor }}>
          <input
            type="checkbox"
            name="consent"
            required
            className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-ring/40"
          />
          <span>{consentLabel}</span>
        </label>
      )}

      <button
        type="submit"
        className="mt-2 inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-medium transition-opacity hover:opacity-90"
        style={{ background: accent, color: accentText }}
      >
        {submitText}
      </button>
    </form>
  );
}

function ContactFormSettings() {
  const {
    actions: { setProp },
    title,
    description,
    nameLabel,
    emailLabel,
    phoneLabel,
    subjectLabel,
    messageLabel,
    consentLabel,
    submitText,
    action,
    emailSubject,
    background,
    accent,
    accentText,
    border,
    borderRadius,
    requiredFields,
    layout,
    fields,
    consentColor,
    customId,
    boxModel,
    shadow,
    transform,
    hover,
    transition,
    opacity,
  } = useNode((node) => ({
    title: (node.data.props.title as string) ?? "",
    description: (node.data.props.description as string) ?? "",
    nameLabel: (node.data.props.nameLabel as string) ?? "Name",
    emailLabel: (node.data.props.emailLabel as string) ?? "Email",
    phoneLabel: (node.data.props.phoneLabel as string) ?? "Phone",
    subjectLabel: (node.data.props.subjectLabel as string) ?? "Subject",
    messageLabel: (node.data.props.messageLabel as string) ?? "Message",
    consentLabel: (node.data.props.consentLabel as string) ?? "",
    submitText: (node.data.props.submitText as string) ?? "Send message",
    action: (node.data.props.action as string) ?? "",
    emailSubject: (node.data.props.emailSubject as string) ?? "",
    background: node.data.props.background as ContactFormProps["background"],
    accent: (node.data.props.accent as string) ?? "#0f172a",
    accentText: (node.data.props.accentText as string) ?? "#ffffff",
    border: node.data.props.border as ContactFormProps["border"],
    borderRadius: (node.data.props.borderRadius as number) ?? 12,
    requiredFields: (node.data.props.requiredFields as boolean) ?? true,
    layout: (node.data.props.layout as ContactFormProps["layout"]) ?? "stacked",
    fields: (node.data.props.fields as ContactFormFields) ?? {
      name: true,
      email: true,
      phone: false,
      subject: false,
      message: true,
      consent: false,
    },
    consentColor: (node.data.props.consentColor as string) ?? "#475569",
    customId: (node.data.props.customId as string) ?? "",
    boxModel: node.data.props.boxModel as ContactFormProps["boxModel"],
    shadow: node.data.props.shadow as ContactFormProps["shadow"],
    transform: node.data.props.transform as ContactFormProps["transform"],
    hover: node.data.props.hover as ContactFormProps["hover"],
    transition: node.data.props.transition as ContactFormProps["transition"],
    opacity: (node.data.props.opacity as number) ?? 1,
  })) as any;

  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleField = (key: keyof ContactFormFields) => {
    setProp((props: ContactFormProps) => {
      props.fields = { ...(props.fields ?? fields), [key]: !(props.fields?.[key] ?? fields[key]) };
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <FieldRow label="HTML id (anchor target)">
        <Input
          value={customId}
          onChange={(e) =>
            setProp((props: ContactFormProps) => { props.customId = e.target.value; })
          }
          placeholder="contact"
        />
      </FieldRow>

      <FieldRow label="Title">
        <Input
          value={title}
          onChange={(e) =>
            setProp((props: ContactFormProps) => { props.title = e.target.value; })
          }
        />
      </FieldRow>
      <FieldRow label="Description">
        <Input
          value={description}
          onChange={(e) =>
            setProp((props: ContactFormProps) => { props.description = e.target.value; })
          }
          placeholder="Optional supporting copy"
        />
      </FieldRow>

      <div className="rounded-md border border-dashed p-2">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Fields</p>
        <div className="grid grid-cols-2 gap-2">
          {(["name", "email", "phone", "subject", "message", "consent"] as const).map((k) => (
            <ToggleField
              key={k}
              label={k.charAt(0).toUpperCase() + k.slice(1)}
              value={fields[k]}
              onChange={() => toggleField(k)}
            />
          ))}
        </div>
      </div>

      <FieldRow label="Name label">
        <Input
          value={nameLabel}
          onChange={(e) =>
            setProp((props: ContactFormProps) => { props.nameLabel = e.target.value; })
          }
        />
      </FieldRow>
      <FieldRow label="Email label">
        <Input
          value={emailLabel}
          onChange={(e) =>
            setProp((props: ContactFormProps) => { props.emailLabel = e.target.value; })
          }
        />
      </FieldRow>
      {fields.phone && (
        <FieldRow label="Phone label">
          <Input
            value={phoneLabel}
            onChange={(e) =>
              setProp((props: ContactFormProps) => { props.phoneLabel = e.target.value; })
            }
          />
        </FieldRow>
      )}
      {fields.subject && (
        <FieldRow label="Subject label">
          <Input
            value={subjectLabel}
            onChange={(e) =>
              setProp((props: ContactFormProps) => { props.subjectLabel = e.target.value; })
            }
          />
        </FieldRow>
      )}
      <FieldRow label="Message label">
        <Input
          value={messageLabel}
          onChange={(e) =>
            setProp((props: ContactFormProps) => { props.messageLabel = e.target.value; })
          }
        />
      </FieldRow>
      {fields.consent && (
        <>
          <FieldRow label="Consent text">
            <Input
              value={consentLabel}
              onChange={(e) =>
                setProp((props: ContactFormProps) => { props.consentLabel = e.target.value; })
              }
            />
          </FieldRow>
          <ColorField
            label="Consent color"
            value={consentColor}
            onChange={(v) =>
              setProp((props: ContactFormProps) => { props.consentColor = v; })
            }
          />
        </>
      )}

      <FieldRow label="Submit button text">
        <Input
          value={submitText}
          onChange={(e) =>
            setProp((props: ContactFormProps) => { props.submitText = e.target.value; })
          }
        />
      </FieldRow>

      <FieldRow label="Form action (mailto: or https://…)">
        <Input
          value={action}
          placeholder="mailto:hello@example.com"
          onChange={(e) =>
            setProp((props: ContactFormProps) => { props.action = e.target.value; })
          }
        />
      </FieldRow>
      <FieldRow label="Email subject (for mailto:)">
        <Input
          value={emailSubject}
          onChange={(e) =>
            setProp((props: ContactFormProps) => { props.emailSubject = e.target.value; })
          }
        />
      </FieldRow>

      <SelectField
        label="Layout"
        value={layout}
        onChange={(v) =>
          setProp((props: ContactFormProps) => { props.layout = v as ContactFormProps["layout"]; })
        }
        options={[
          { value: "stacked", label: "Stacked (full-width)" },
          { value: "two-column", label: "Two-column (name + email on a row)" },
        ]}
      />

      <ToggleField
        label="Required fields"
        value={requiredFields}
        onChange={(v) =>
          setProp((props: ContactFormProps) => { props.requiredFields = v; })
        }
      />

      <BackgroundField
        label="Card background"
        value={background}
        onChange={(v) =>
          setProp((props: ContactFormProps) => { props.background = v; })
        }
      />
      <ColorField
        label="Button color"
        value={accent}
        onChange={(v) =>
          setProp((props: ContactFormProps) => { props.accent = v; })
        }
      />
      <ColorField
        label="Button text color"
        value={accentText}
        onChange={(v) =>
          setProp((props: ContactFormProps) => { props.accentText = v; })
        }
      />
      <SliderField
        label="Border radius"
        value={borderRadius}
        min={0}
        max={32}
        onChange={(v) =>
          setProp((props: ContactFormProps) => { props.borderRadius = v; })
        }
      />
      <BoxModelField
        label="Spacing (margin / padding)"
        value={boxModel ?? {}}
        onChange={(v) =>
          setProp((props: ContactFormProps) => { props.boxModel = v; })
        }
      />

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="rounded-md border border-dashed py-1 text-[10px] text-muted-foreground hover:border-foreground hover:text-foreground"
      >
        {showAdvanced ? "▾ Hide advanced" : "▸ Show advanced (border, shadow, hover)"}
      </button>

      {showAdvanced && (
        <>
          <BorderField
            label="Form border"
            value={border}
            onChange={(v) =>
              setProp((props: ContactFormProps) => { props.border = v; })
            }
          />
          <ShadowField
            label="Shadow"
            value={shadow}
            onChange={(v) =>
              setProp((props: ContactFormProps) => { props.shadow = v; })
            }
          />
          <HoverField
            value={hover}
            onChange={(v) =>
              setProp((props: ContactFormProps) => { props.hover = v; })
            }
          />
          <TransitionField
            value={transition}
            onChange={(v) =>
              setProp((props: ContactFormProps) => { props.transition = v; })
            }
          />
          <TransformField
            value={transform}
            onChange={(v) =>
              setProp((props: ContactFormProps) => { props.transform = v; })
            }
          />
          <OpacityField
            value={opacity}
            onChange={(v) =>
              setProp((props: ContactFormProps) => { props.opacity = v; })
            }
          />
        </>
      )}
    </div>
  );
}

ContactForm.craft = {
  displayName: "Contact Form",
  props: {
    title: "Get in touch",
    description: "",
    nameLabel: "Name",
    emailLabel: "Email",
    phoneLabel: "Phone",
    subjectLabel: "Subject",
    messageLabel: "Message",
    consentLabel: "I agree to be contacted about my enquiry.",
    submitText: "Send message",
    action: "",
    emailSubject: "New contact form submission",
    background: { type: "solid", color: "#f8fafc" },
    accent: "#0f172a",
    accentText: "#ffffff",
    border: undefined,
    borderRadius: 12,
    requiredFields: true,
    layout: "stacked",
    fields: {
      name: true,
      email: true,
      phone: false,
      subject: false,
      message: true,
      consent: false,
    },
    consentColor: "#475569",
    customId: "",
    boxModel: undefined,
    shadow: undefined,
    transform: undefined,
    hover: undefined,
    transition: undefined,
    opacity: 1,
  },
  related: {
    settings: ContactFormSettings,
  },
};