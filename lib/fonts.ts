// Editor font registry. The fonts below are loaded once via next/font/google
// in <EditorFontsProvider /> (mounted by the editor and preview pages) and
// exposed to craft components through class names. Add new families here
// AND in EditorFontsProvider when extending the picker.

export type EditorFont = {
  /** CSS class applied to elements that should render with this font. */
  className: string;
  /** What we store in craft node props and use in the picker label. */
  label: string;
  /** Stack used as a CSS `font-family` value for inline styles. */
  stack: string;
};

export const EDITOR_FONTS: EditorFont[] = [
  {
    className: "ef-geist-sans",
    label: "Geist (default)",
    stack:
      "var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  {
    className: "ef-inter",
    label: "Inter",
    stack:
      "var(--font-inter), ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  {
    className: "ef-roboto",
    label: "Roboto",
    stack:
      "'Roboto', var(--font-inter), ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
  },
  {
    className: "ef-roboto-mono",
    label: "Roboto Mono",
    stack:
      "'Roboto Mono', var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
  {
    className: "ef-poppins",
    label: "Poppins",
    stack:
      "'Poppins', var(--font-inter), ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
  },
  {
    className: "ef-lora",
    label: "Lora (serif)",
    stack:
      "'Lora', Georgia, 'Times New Roman', Times, serif",
  },
  {
    className: "ef-playfair",
    label: "Playfair Display (serif)",
    stack:
      "'Playfair Display', Georgia, 'Times New Roman', Times, serif",
  },
  {
    className: "ef-merriweather",
    label: "Merriweather (serif)",
    stack:
      "'Merriweather', Georgia, 'Times New Roman', Times, serif",
  },
  {
    className: "ef-montserrat",
    label: "Montserrat",
    stack:
      "'Montserrat', var(--font-inter), ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
  },
  {
    className: "ef-jetbrains-mono",
    label: "JetBrains Mono",
    stack:
      "'JetBrains Mono', var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
  {
    className: "ef-system-sans",
    label: "System sans",
    stack:
      "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  {
    className: "ef-system-serif",
    label: "System serif",
    stack: "ui-serif, Georgia, 'Times New Roman', Times, serif",
  },
  {
    className: "ef-system-mono",
    label: "System mono",
    stack:
      "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
  },
];

/** Lookup by className. Returns the default font (Geist) when not found. */
export function getEditorFont(className?: string): EditorFont {
  return (
    EDITOR_FONTS.find((f) => f.className === className) ?? EDITOR_FONTS[0]
  );
}