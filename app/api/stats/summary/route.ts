import { db } from "@/db";
import { timeEntries, projects, claudeSessions, claudeEvents } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, eq, gte, lte } from "drizzle-orm";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

function getDateRange(period: string): { from: Date; to: Date } {
  const now = new Date();
  switch (period) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "week":
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
    case "month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    default:
      return { from: startOfDay(now), to: endOfDay(now) };
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") ?? "today";
    const { from, to } = getDateRange(period);

    const rows = await db
      .select({
        id: timeEntries.id,
        projectId: timeEntries.projectId,
        projectName: projects.name,
        projectColor: projects.color,
        startAt: timeEntries.startAt,
        endAt: timeEntries.endAt,
        source: timeEntries.source,
      })
      .from(timeEntries)
      .innerJoin(projects, eq(timeEntries.projectId, projects.id))
      .where(
        and(
          eq(timeEntries.userId, user.id),
          gte(timeEntries.startAt, from),
          lte(timeEntries.startAt, to)
        )
      );

    let totalSeconds = 0;
    const projectMap = new Map<string, { projectId: string; projectName: string; projectColor: string; totalSeconds: number }>();
    const bySource = { manual: 0, claude_code: 0 };

    for (const row of rows) {
      const end = row.endAt ? new Date(row.endAt).getTime() : Date.now();
      const start = new Date(row.startAt).getTime();
      const seconds = Math.floor((end - start) / 1000);

      totalSeconds += seconds;

      const existing = projectMap.get(row.projectId);
      if (existing) {
        existing.totalSeconds += seconds;
      } else {
        projectMap.set(row.projectId, {
          projectId: row.projectId,
          projectName: row.projectName,
          projectColor: row.projectColor,
          totalSeconds: seconds,
        });
      }

      if (row.source === "claude_code") {
        bySource.claude_code += seconds;
      } else {
        bySource.manual += seconds;
      }
    }

    const aiWorkingSeconds = await calculateAiWorkingTime(user.id, from, to);

    return NextResponse.json({
      totalSeconds,
      byProject: Array.from(projectMap.values()).sort((a, b) => b.totalSeconds - a.totalSeconds),
      bySource,
      aiWorkingSeconds,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

async function calculateAiWorkingTime(userId: string, from: Date, to: Date): Promise<number> {
  const sessions = await db
    .select({ id: claudeSessions.id })
    .from(claudeSessions)
    .where(
      and(
        eq(claudeSessions.userId, userId),
        gte(claudeSessions.startedAt, from),
        lte(claudeSessions.startedAt, to)
      )
    );

  if (sessions.length === 0) return 0;

  let totalMs = 0;

  for (const session of sessions) {
    const events = await db
      .select({ eventType: claudeEvents.eventType, timestamp: claudeEvents.timestamp })
      .from(claudeEvents)
      .where(eq(claudeEvents.sessionId, session.id))
      .orderBy(claudeEvents.timestamp);

    for (let i = 0; i < events.length; i++) {
      if (events[i].eventType === "UserPromptSubmit") {
        const next = events[i + 1];
        if (next && next.eventType === "Stop") {
          totalMs += new Date(next.timestamp).getTime() - new Date(events[i].timestamp).getTime();
        }
      }
    }
  }

  return Math.floor(totalMs / 1000);
}
