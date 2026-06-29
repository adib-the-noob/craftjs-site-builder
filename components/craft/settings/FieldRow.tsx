"use client";

import { Label } from "@/components/ui/label";

type FieldRowProps = {
  label?: string;
  htmlFor?: string;
  children: React.ReactNode;
};

export function FieldRow({ label, htmlFor, children }: FieldRowProps) {
  return (
    <div className="flex flex-col gap-2">
      {label ? <Label htmlFor={htmlFor}>{label}</Label> : null}
      {children}
    </div>
  );
}
