import { db } from "@/db";
import { timeEntries } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { updateEntrySchema } from "@/lib/validators";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.note !== undefined) updates.note = parsed.data.note;
    if (parsed.data.projectId !== undefined) updates.projectId = parsed.data.projectId;
    if (parsed.data.startAt !== undefined) updates.startAt = new Date(parsed.data.startAt);
    if (parsed.data.endAt !== undefined) updates.endAt = parsed.data.endAt ? new Date(parsed.data.endAt) : null;

    const updated = await db
      .update(timeEntries)
      .set(updates)
      .where(and(eq(timeEntries.id, id), eq(timeEntries.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const deleted = await db
      .delete(timeEntries)
      .where(and(eq(timeEntries.id, id), eq(timeEntries.userId, user.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
