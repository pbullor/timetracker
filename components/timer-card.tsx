"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Square, Play } from "lucide-react";
import { useElapsedSeconds, formatDuration } from "@/lib/hooks";
import type { TimerResponse, ProjectResponse } from "@/lib/api-client";

interface TimerCardProps {
  timer: TimerResponse | null;
  projects: ProjectResponse[];
  onStop: () => void;
  onStart: (projectId: string) => void;
}

export function TimerCard({ timer, projects, onStop, onStart }: TimerCardProps) {
  const elapsed = useElapsedSeconds(timer?.startAt ?? null);

  if (timer) {
    return (
      <Card className="border-2" style={{ borderColor: timer.projectColor }}>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: timer.projectColor }}
            />
            <div>
              <p className="text-sm text-muted-foreground">Tracking</p>
              <p className="text-lg font-semibold">{timer.projectName}</p>
              {timer.note && <p className="text-sm text-muted-foreground">{timer.note}</p>}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-4xl font-mono font-bold tabular-nums">
              {formatDuration(elapsed)}
            </span>
            <Button
              variant="destructive"
              size="lg"
              className="h-14 w-14 rounded-full"
              onClick={onStop}
            >
              <Square className="h-5 w-5 fill-current" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground mb-4">Quick start a timer</p>
        {projects.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No projects yet. Create one in the Projects tab.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {projects.map((project) => (
              <Button
                key={project.id}
                variant="outline"
                className="gap-2"
                onClick={() => onStart(project.id)}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
                <Play className="h-3 w-3" />
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
