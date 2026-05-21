import { db } from "@/db";
import { projectMembers, users, projects } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const addMemberSchema = z.object({
  email: z.string().email(),
  cwdPattern: z.string().nullable().optional(),
});

const updateMemberSchema = z.object({
  cwdPattern: z.string().nullable().optional(),
  role: z.enum(["owner", "member"]).optional(),
});

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const isMember = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, id), eq(projectMembers.userId, user.id)))
      .limit(1);

    if (isMember.length === 0) {
      return NextResponse.json({ error: "Not a member of this project" }, { status: 403 });
    }

    const members = await db
      .select({
        id: projectMembers.id,
        userId: projectMembers.userId,
        email: users.email,
        name: users.name,
        image: users.image,
        role: projectMembers.role,
        cwdPattern: projectMembers.cwdPattern,
        joinedAt: projectMembers.joinedAt,
      })
      .from(projectMembers)
      .innerJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, id));

    return NextResponse.json(members);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const project = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.ownerId, user.id)))
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json({ error: "Only project owner can add members" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = addMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const targetUser = await db
      .select()
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);

    if (targetUser.length === 0) {
      return NextResponse.json({ error: "User not found. They need to sign up first." }, { status: 404 });
    }

    const existing = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, id), eq(projectMembers.userId, targetUser[0].id)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "User is already a member" }, { status: 409 });
    }

    const inserted = await db
      .insert(projectMembers)
      .values({
        projectId: id,
        userId: targetUser[0].id,
        role: "member",
        cwdPattern: parsed.data.cwdPattern ?? null,
      })
      .returning();

    return NextResponse.json({
      ...inserted[0],
      email: targetUser[0].email,
      name: targetUser[0].name,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const body = await request.json();
    const parsed = updateMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const membership = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, id), eq(projectMembers.userId, user.id)))
      .limit(1);

    if (membership.length === 0) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.cwdPattern !== undefined) updates.cwdPattern = parsed.data.cwdPattern;

    const updated = await db
      .update(projectMembers)
      .set(updates)
      .where(and(eq(projectMembers.projectId, id), eq(projectMembers.userId, user.id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
