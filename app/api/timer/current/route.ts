import { db } from "@/db";
import { timeEntries, projects } from "@/db/schema";
import { getUserFromRequest } from "@/lib/auth";
import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "X-User-Email header required" }, { status: 401 });
  }

  const running = await db
    .select({
      id: timeEntries.id,
      projectId: timeEntries.projectId,
      projectName: projects.name,
      projectColor: projects.color,
      startAt: timeEntries.startAt,
      note: timeEntries.note,
      source: timeEntries.source,
    })
    .from(timeEntries)
    .innerJoin(projects, eq(timeEntries.projectId, projects.id))
    .where(and(eq(timeEntries.userId, user.id), isNull(timeEntries.endAt), eq(timeEntries.source, "manual")))
    .limit(1);

  if (running.length === 0) {
    return NextResponse.json(null);
  }

  return NextResponse.json(running[0]);
}
