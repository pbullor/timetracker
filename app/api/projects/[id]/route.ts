import { db } from "@/db";
import { projects, projectMembers } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { updateProjectSchema } from "@/lib/validators";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { cwdPattern, ...projectData } = parsed.data;

    const updated = await db
      .update(projects)
      .set(projectData)
      .where(and(eq(projects.id, id), eq(projects.ownerId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Project not found or not owner" }, { status: 404 });
    }

    if (cwdPattern !== undefined) {
      await db
        .update(projectMembers)
        .set({ cwdPattern })
        .where(and(eq(projectMembers.projectId, id), eq(projectMembers.userId, user.id)));
    }

    return NextResponse.json({ ...updated[0], cwdPattern: cwdPattern ?? null });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const updated = await db
      .update(projects)
      .set({ archived: true })
      .where(and(eq(projects.id, id), eq(projects.ownerId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Project not found or not owner" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
