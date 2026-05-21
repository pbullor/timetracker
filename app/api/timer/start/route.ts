import { db } from "@/db";
import { timeEntries, projects, projectMembers } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { startTimerSchema } from "@/lib/validators";
import { and, eq, isNull, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = startTimerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(timeEntries)
      .where(and(eq(timeEntries.userId, user.id), isNull(timeEntries.endAt), eq(timeEntries.source, "manual")))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "A timer is already running. Stop it first." }, { status: 409 });
    }

    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, parsed.data.projectId))
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const membership = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, parsed.data.projectId), eq(projectMembers.userId, user.id)))
      .limit(1);

    if (membership.length === 0) {
      return NextResponse.json({ error: "Not a member of this project" }, { status: 403 });
    }

    const inserted = await db
      .insert(timeEntries)
      .values({
        projectId: parsed.data.projectId,
        userId: user.id,
        startAt: new Date(),
        source: "manual",
        note: parsed.data.note ?? null,
      })
      .returning();

    return NextResponse.json({
      id: inserted[0].id,
      projectId: project[0].id,
      projectName: project[0].name,
      projectColor: project[0].color,
      startAt: inserted[0].startAt,
      note: inserted[0].note,
      source: inserted[0].source,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
