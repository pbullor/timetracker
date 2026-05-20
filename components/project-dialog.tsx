"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProjectResponse, CreateProject } from "@/lib/api-client";

interface ProjectDialogProps {
  project?: ProjectResponse;
  trigger: React.ReactNode;
  onSave: (data: CreateProject) => Promise<void>;
}

export function ProjectDialog({ project, trigger, onSave }: ProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    await onSave({
      name: form.get("name") as string,
      client: (form.get("client") as string) || null,
      color: (form.get("color") as string) || "#3b82f6",
      hourlyRate: (form.get("hourlyRate") as string) || null,
      cwdPattern: (form.get("cwdPattern") as string) || null,
    });
    setSaving(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "New Project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" defaultValue={project?.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Input id="client" name="client" defaultValue={project?.client ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                name="color"
                type="color"
                defaultValue={project?.color ?? "#3b82f6"}
                className="h-10 p-1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                step="0.01"
                defaultValue={project?.hourlyRate ?? ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cwdPattern">CWD Pattern</Label>
            <Input
              id="cwdPattern"
              name="cwdPattern"
              placeholder="/Users/me/code/project"
              defaultValue={project?.cwdPattern ?? ""}
            />
            <p className="text-xs text-muted-foreground">
              Directory prefix to auto-match Claude Code sessions to this project
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
