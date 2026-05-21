import { db } from "@/db";
import { timeEntries, projects } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json({ error: "from and to query params required" }, { status: 400 });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    const rows = await db
      .select({
        id: timeEntries.id,
        projectId: timeEntries.projectId,
        projectName: projects.name,
        projectColor: projects.color,
        startAt: timeEntries.startAt,
        endAt: timeEntries.endAt,
        source: timeEntries.source,
        note: timeEntries.note,
        hourlyRate: projects.hourlyRate,
      })
      .from(timeEntries)
      .innerJoin(projects, eq(timeEntries.projectId, projects.id))
      .where(
        and(
          eq(timeEntries.userId, user.id),
          gte(timeEntries.startAt, fromDate),
          lte(timeEntries.startAt, toDate)
        )
      )
      .orderBy(sql`${timeEntries.startAt} DESC`);

    const result = rows.map((row) => {
      const end = row.endAt ? new Date(row.endAt).getTime() : Date.now();
      const start = new Date(row.startAt).getTime();
      return {
        ...row,
        durationSeconds: Math.floor((end - start) / 1000),
      };
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
