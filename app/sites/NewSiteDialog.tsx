"use client";

import { useState } from "react";
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

export function NewSiteDialog({
  open,
  onOpenChange,
  onCreate,
}: NewSiteDialogProps) {
  const templates = getTemplates();
  const [name, setName] = useState("My new site");
  const [templateId, setTemplateId] = useState<string>(templates[0]?.id ?? "blank");

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), templateId);
    setName("My new site");
    setTemplateId(templates[0]?.id ?? "blank");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new site</DialogTitle>
          <DialogDescription>
            Give it a name and pick a starting template. You can change anything
            later.
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
            options={templates.map((t) => ({ value: t.id, label: t.name }))}
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