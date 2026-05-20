import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function getUserFromRequest(request: NextRequest) {
  const email = request.headers.get("x-user-email");
  if (!email) {
    return null;
  }
  return upsertUser(email);
}

export async function upsertUser(email: string) {
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return existing[0];
  }
  const inserted = await db.insert(users).values({ email }).returning();
  return inserted[0];
}
