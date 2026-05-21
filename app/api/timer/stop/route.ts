import { db } from "@/db";
import { timeEntries, projects } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const user = await requireUser();

    const running = await db
      .select({
        id: timeEntries.id,
        projectId: timeEntries.projectId,
        startAt: timeEntries.startAt,
        note: timeEntries.note,
        source: timeEntries.source,
      })
      .from(timeEntries)
      .where(and(eq(timeEntries.userId, user.id), isNull(timeEntries.endAt), eq(timeEntries.source, "manual")))
      .limit(1);

    if (running.length === 0) {
      return NextResponse.json({ error: "No timer is running" }, { status: 404 });
    }

    const now = new Date();
    await db
      .update(timeEntries)
      .set({ endAt: now })
      .where(eq(timeEntries.id, running[0].id));

    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, running[0].projectId))
      .limit(1);

    return NextResponse.json({
      id: running[0].id,
      projectId: running[0].projectId,
      projectName: project[0].name,
      projectColor: project[0].color,
      startAt: running[0].startAt,
      endAt: now,
      note: running[0].note,
      source: running[0].source,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
