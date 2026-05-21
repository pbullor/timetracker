import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { users, projects, timeEntries, claudeSessions } from "@/db/schema";
import { sql, eq, gte, count } from "drizzle-orm";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function GET() {
  try {
    const user = await requireUser();
    if (!ADMIN_EMAIL || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      usersLast7d,
      usersLast30d,
      planBreakdown,
      totalProjects,
      totalEntries,
      totalClaudeSessions,
      recentUsers,
    ] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(users).where(gte(users.createdAt, sevenDaysAgo)),
      db.select({ count: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),
      db
        .select({ plan: users.plan, planStatus: users.planStatus, count: count() })
        .from(users)
        .groupBy(users.plan, users.planStatus),
      db.select({ count: count() }).from(projects),
      db.select({ count: count() }).from(timeEntries),
      db.select({ count: count() }).from(claudeSessions),
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          plan: users.plan,
          planStatus: users.planStatus,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(sql`${users.createdAt} desc`)
        .limit(20),
    ]);

    return NextResponse.json({
      totalUsers: totalUsers[0].count,
      usersLast7d: usersLast7d[0].count,
      usersLast30d: usersLast30d[0].count,
      planBreakdown,
      totalProjects: totalProjects[0].count,
      totalEntries: totalEntries[0].count,
      totalClaudeSessions: totalClaudeSessions[0].count,
      recentUsers,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
