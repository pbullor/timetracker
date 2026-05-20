"use client";

import { api } from "@/lib/api-client";
import { useApi } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectDialog } from "@/components/project-dialog";
import { Plus, Pencil, Archive } from "lucide-react";
import type { ProjectResponse, CreateProject } from "@/lib/api-client";

export default function ProjectsPage() {
  const { data: projects, refetch } = useApi<ProjectResponse[]>(
    () => api.projects.list(),
    []
  );

  async function handleCreate(data: CreateProject) {
    await api.projects.create(data);
    refetch();
  }

  async function handleUpdate(id: string, data: CreateProject) {
    await api.projects.update(id, data);
    refetch();
  }

  async function handleArchive(id: string) {
    await api.projects.archive(id);
    refetch();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <ProjectDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          }
          onSave={handleCreate}
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>CWD Pattern</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!projects || projects.length === 0) ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No projects yet. Create your first one.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.client || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs max-w-48 truncate">
                    {project.cwdPattern || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.hourlyRate ? `$${project.hourlyRate}/h` : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <ProjectDialog
                        project={project}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        }
                        onSave={(data) => handleUpdate(project.id, data)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleArchive(project.id)}
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
