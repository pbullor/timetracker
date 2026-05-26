import { db } from "@/db";
import { projects, projectMembers } from "@/db/schema";
import { requireUserOrApiKey } from "@/lib/auth";
import { and, eq, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { createProjectSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUserOrApiKey(request);

    const allProjects = await db
      .select({
        id: projects.id,
        ownerId: projects.ownerId,
        name: projects.name,
        client: projects.client,
        color: projects.color,
        hourlyRate: projects.hourlyRate,
        archived: projects.archived,
        createdAt: projects.createdAt,
        cwdPattern: projectMembers.cwdPattern,
        role: projectMembers.role,
      })
      .from(projectMembers)
      .innerJoin(projects, eq(projectMembers.projectId, projects.id))
      .where(and(eq(projectMembers.userId, user.id), eq(projects.archived, false)))
      .orderBy(projects.name);

    return NextResponse.json(allProjects);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUserOrApiKey(request);
    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = parsed.data;
    const inserted = await db
      .insert(projects)
      .values({
        ownerId: user.id,
        name: data.name,
        client: data.client ?? null,
        color: data.color ?? "#3b82f6",
        hourlyRate: data.hourlyRate ?? null,
      })
      .returning();

    await db.insert(projectMembers).values({
      projectId: inserted[0].id,
      userId: user.id,
      role: "owner",
      cwdPattern: data.cwdPattern ?? null,
    });

    return NextResponse.json(inserted[0], { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
