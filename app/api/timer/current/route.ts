import { db } from "@/db";
import { timeEntries, projects } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireUser();

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
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
