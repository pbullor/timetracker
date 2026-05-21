import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({ apiKey: user.apiKey });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST() {
  try {
    const user = await requireUser();
    const newKey = `tt_${randomBytes(32).toString("hex")}`;

    await db
      .update(users)
      .set({ apiKey: newKey })
      .where(eq(users.id, user.id));

    return NextResponse.json({ apiKey: newKey });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();

    await db
      .update(users)
      .set({ apiKey: null })
      .where(eq(users.id, user.id));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
