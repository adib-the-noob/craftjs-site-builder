"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FieldRow } from "@/components/craft/settings/FieldRow";
import { SelectField } from "@/components/craft/settings/SelectField";
import { getTemplates } from "@/lib/templates";

type NewSiteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, templateId?: string) => void;
};

type TemplateOption = { value: string; label: string };

export function NewSiteDialog({
  open,
  onOpenChange,
  onCreate,
}: NewSiteDialogProps) {
  const [name, setName] = useState("My new site");
  const [templateId, setTemplateId] = useState<string>("");
  const [templateOptions, setTemplateOptions] = useState<TemplateOption[]>([
    { value: "", label: "Blank site" },
  ]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getTemplates()
      .then((templates) => {
        if (cancelled) return;
        const options: TemplateOption[] = [
          { value: "", label: "Blank site" },
          ...templates.map((t) => ({ value: t.id, label: t.name })),
        ];
        setTemplateOptions(options);
        // Keep the current selection if it's still valid; otherwise fall back
        // to blank.
        setTemplateId((current) =>
          options.some((o) => o.value === current) ? current : ""
        );
      })
      .catch(() => {
        // Swallow — user can still create a blank site.
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), templateId || undefined);
    setName("My new site");
    setTemplateId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new site</DialogTitle>
          <DialogDescription>
            Give it a name and pick a starting template. You can change
            anything later.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <FieldRow label="Name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My new site"
              autoFocus
            />
          </FieldRow>
          <SelectField
            label="Template"
            value={templateId}
            onChange={setTemplateId}
            options={templateOptions}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create site
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}