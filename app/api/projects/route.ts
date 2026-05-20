import { db } from "@/db";
import { projects } from "@/db/schema";
import { getUserFromRequest } from "@/lib/auth";
import { createProjectSchema } from "@/lib/validators";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "X-User-Email header required" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.userId, user.id), eq(projects.archived, false)))
    .orderBy(projects.name);

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "X-User-Email header required" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const data = parsed.data;
  const inserted = await db
    .insert(projects)
    .values({
      userId: user.id,
      name: data.name,
      client: data.client ?? null,
      color: data.color ?? "#3b82f6",
      hourlyRate: data.hourlyRate ?? null,
      cwdPattern: data.cwdPattern ?? null,
    })
    .returning();

  return NextResponse.json(inserted[0], { status: 201 });
}
