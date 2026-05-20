"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours } from "@/lib/hooks";
import type { StatsSummary } from "@/lib/api-client";

interface DaySummaryProps {
  stats: StatsSummary | null;
}

export function DaySummary({ stats }: DaySummaryProps) {
  if (!stats) return null;

  const total = stats.totalSeconds;
  const manualPct = total > 0 ? (stats.bySource.manual / total) * 100 : 0;
  const claudePct = total > 0 ? (stats.bySource.claude_code / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Today</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-3xl font-bold font-mono tabular-nums">
            {formatHours(total)}
          </p>
          <p className="text-sm text-muted-foreground">total tracked</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">By source</p>
          <div className="flex h-3 rounded-full overflow-hidden bg-muted">
            {manualPct > 0 && (
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${manualPct}%` }}
              />
            )}
            {claudePct > 0 && (
              <div
                className="bg-emerald-500 transition-all"
                style={{ width: `${claudePct}%` }}
              />
            )}
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Manual: {formatHours(stats.bySource.manual)}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Claude Code: {formatHours(stats.bySource.claude_code)}
            </span>
          </div>
        </div>

        {stats.byProject.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">By project</p>
            {stats.byProject.map((p) => {
              const pct = total > 0 ? (p.totalSeconds / total) * 100 : 0;
              return (
                <div key={p.projectId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: p.projectColor }}
                      />
                      {p.projectName}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatHours(p.totalSeconds)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: p.projectColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
