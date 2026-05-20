"use client";

import { useState, useMemo } from "react";
import { api } from "@/lib/api-client";
import { useApi, formatHours } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Trash2 } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import type { EntryResponse } from "@/lib/api-client";

type Period = "today" | "week" | "month";

function getRange(period: Period) {
  const now = new Date();
  switch (period) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "week":
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
    case "month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
  }
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("week");
  const range = getRange(period);

  const { data: entries, refetch } = useApi<EntryResponse[]>(
    () => api.entries.list(range.from.toISOString(), range.to.toISOString()),
    [period]
  );

  const summary = useMemo(() => {
    if (!entries) return null;
    let totalSeconds = 0;
    let manualSeconds = 0;
    let claudeSeconds = 0;
    let estimatedRevenue = 0;
    const byProject = new Map<string, { name: string; color: string; seconds: number }>();

    for (const entry of entries) {
      totalSeconds += entry.durationSeconds;
      if (entry.source === "claude_code") {
        claudeSeconds += entry.durationSeconds;
      } else {
        manualSeconds += entry.durationSeconds;
      }
      if (entry.hourlyRate) {
        estimatedRevenue += (entry.durationSeconds / 3600) * parseFloat(entry.hourlyRate);
      }
      const existing = byProject.get(entry.projectId);
      if (existing) {
        existing.seconds += entry.durationSeconds;
      } else {
        byProject.set(entry.projectId, {
          name: entry.projectName,
          color: entry.projectColor,
          seconds: entry.durationSeconds,
        });
      }
    }

    return { totalSeconds, manualSeconds, claudeSeconds, estimatedRevenue, byProject: Array.from(byProject.values()) };
  }, [entries]);

  async function handleDelete(id: string) {
    await api.entries.delete(id);
    refetch();
  }

  function exportCsv() {
    if (!entries || entries.length === 0) return;
    const header = "Project,Start,End,Duration (h),Source,Note";
    const rows = entries.map((e) => {
      const hours = (e.durationSeconds / 3600).toFixed(2);
      const start = format(new Date(e.startAt), "yyyy-MM-dd HH:mm");
      const end = e.endAt ? format(new Date(e.endAt), "yyyy-MM-dd HH:mm") : "running";
      const note = (e.note ?? "").replace(/,/g, ";");
      return `${e.projectName},${start},${end},${hours},${e.source},${note}`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timetracker-${period}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex items-center gap-2">
          {(["today", "week", "month"] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p === "today" ? "Today" : p === "week" ? "This Week" : "This Month"}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-3.5 w-3.5 mr-1" />
            CSV
          </Button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold font-mono">{formatHours(summary.totalSeconds)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Manual</p>
              <p className="text-2xl font-bold font-mono text-blue-500">{formatHours(summary.manualSeconds)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">AI-Assisted</p>
              <p className="text-2xl font-bold font-mono text-emerald-500">{formatHours(summary.claudeSeconds)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Est. Revenue</p>
              <p className="text-2xl font-bold font-mono">${summary.estimatedRevenue.toFixed(0)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!entries || entries.length === 0) ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No entries in this period.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: entry.projectColor }}
                      />
                      {entry.projectName}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {format(new Date(entry.startAt), "MMM d, HH:mm")}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {entry.endAt ? format(new Date(entry.endAt), "HH:mm") : (
                      <Badge variant="secondary" className="text-xs">running</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm tabular-nums">
                    {formatHours(entry.durationSeconds)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={entry.source === "claude_code" ? "border-emerald-500/50 text-emerald-500" : "border-blue-500/50 text-blue-500"}
                    >
                      {entry.source === "claude_code" ? "AI" : "Manual"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-48 truncate">
                    {entry.note || "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
