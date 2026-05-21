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
import { Badge } from "@/components/ui/badge";
import { useApi } from "@/lib/hooks";
import { Users, UserPlus, Trash2 } from "lucide-react";

interface Member {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  cwdPattern: string | null;
  joinedAt: string;
}

interface MembersDialogProps {
  projectId: string;
  projectName: string;
  isOwner: boolean;
}

export function MembersDialog({ projectId, projectName, isOwner }: MembersDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Users className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Members — {projectName}</DialogTitle>
        </DialogHeader>
        {open && <MembersContent projectId={projectId} isOwner={isOwner} />}
      </DialogContent>
    </Dialog>
  );
}

function MembersContent({ projectId, isOwner }: { projectId: string; isOwner: boolean }) {
  const { data: members, refetch } = useApi<Member[]>(
    () => fetch(`/api/projects/${projectId}/members`).then((r) => r.json()),
    [projectId]
  );
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!email.includes("@")) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error);
      }
      setEmail("");
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setAdding(false);
    }
  }

  async function handleUpdateCwd(cwdPattern: string) {
    await fetch(`/api/projects/${projectId}/members`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cwdPattern: cwdPattern || null }),
    });
    refetch();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {members?.map((member) => (
          <div key={member.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div className="flex items-center gap-2">
              {member.image && (
                <img src={member.image} alt="" className="h-6 w-6 rounded-full" />
              )}
              <div>
                <p className="text-sm font-medium">{member.name || member.email}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {member.cwdPattern || "No CWD set"}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {member.role}
            </Badge>
          </div>
        ))}
      </div>

      {isOwner && (
        <div className="space-y-2 border-t border-border pt-4">
          <Label>Add member by email</Label>
          <div className="flex gap-2">
            <Input
              placeholder="teammate@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            />
            <Button size="sm" onClick={handleAdd} disabled={adding || !email.includes("@")}>
              <UserPlus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <p className="text-xs text-muted-foreground">
            The user must have signed up first. They can set their own CWD pattern in their project settings.
          </p>
        </div>
      )}
    </div>
  );
}
