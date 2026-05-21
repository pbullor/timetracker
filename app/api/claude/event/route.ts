import { db } from "@/db";
import { claudeSessions, claudeEvents, projectMembers, projects, timeEntries } from "@/db/schema";
import { getUserByApiKey } from "@/lib/auth";
import { claudeEventSchema } from "@/lib/validators";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const IDLE_THRESHOLD_MS = 5 * 60 * 1000;

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "X-Api-Key header required" }, { status: 401 });
  }

  const user = await getUserByApiKey(apiKey);
  if (!user) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = claudeEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { external_session_id, event_type, cwd, timestamp, metadata } = parsed.data;
  const eventTime = timestamp ? new Date(timestamp) : new Date();

  if (event_type === "SessionStart") {
    const matchedProject = await findProjectByCwd(user.id, cwd);

    await db.insert(claudeSessions).values({
      userId: user.id,
      projectId: matchedProject?.id ?? null,
      externalSessionId: external_session_id,
      cwd,
      startedAt: eventTime,
      lastActivityAt: eventTime,
    }).onConflictDoNothing();

    await insertEvent(external_session_id, event_type, eventTime, metadata ?? null);
    return NextResponse.json({ ok: true, matched_project: matchedProject?.name ?? null }, { status: 201 });
  }

  const session = await db
    .select()
    .from(claudeSessions)
    .where(eq(claudeSessions.externalSessionId, external_session_id))
    .limit(1);

  if (session.length === 0) {
    if (event_type === "UserPromptSubmit") {
      const matchedProject = await findProjectByCwd(user.id, cwd);
      await db.insert(claudeSessions).values({
        userId: user.id,
        projectId: matchedProject?.id ?? null,
        externalSessionId: external_session_id,
        cwd,
        startedAt: eventTime,
        promptCount: 1,
        lastActivityAt: eventTime,
      }).onConflictDoNothing();
      await insertEvent(external_session_id, event_type, eventTime, metadata ?? null);
      return NextResponse.json({ ok: true }, { status: 201 });
    }
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const currentSession = session[0];

  if (event_type === "UserPromptSubmit") {
    await db
      .update(claudeSessions)
      .set({
        promptCount: currentSession.promptCount + 1,
        lastActivityAt: eventTime,
      })
      .where(eq(claudeSessions.id, currentSession.id));

    await insertEvent(external_session_id, event_type, eventTime, metadata ?? null);
    return NextResponse.json({ ok: true });
  }

  if (event_type === "Stop" || event_type === "SessionEnd") {
    await db
      .update(claudeSessions)
      .set({ endedAt: eventTime })
      .where(eq(claudeSessions.id, currentSession.id));

    await insertEvent(external_session_id, event_type, eventTime, metadata ?? null);

    if (currentSession.projectId) {
      const idleMs = await calculateIdleTime(currentSession.id);
      const totalMs = eventTime.getTime() - new Date(currentSession.startedAt).getTime();
      const activeMs = Math.max(totalMs - idleMs, 0);
      const activeEnd = new Date(new Date(currentSession.startedAt).getTime() + activeMs);

      await db.insert(timeEntries).values({
        projectId: currentSession.projectId,
        userId: user.id,
        startAt: currentSession.startedAt,
        endAt: activeEnd,
        source: "claude_code",
        note: `Claude Code session (${currentSession.promptCount} prompts)`,
        metadata: {
          claudeSessionId: currentSession.id,
          externalSessionId: external_session_id,
          idleSeconds: Math.floor(idleMs / 1000),
          totalSeconds: Math.floor(totalMs / 1000),
        },
      });
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown event_type" }, { status: 400 });
}

async function findProjectByCwd(userId: string, cwd: string) {
  const memberships = await db
    .select({
      projectId: projectMembers.projectId,
      cwdPattern: projectMembers.cwdPattern,
      projectName: projects.name,
      projectArchived: projects.archived,
    })
    .from(projectMembers)
    .innerJoin(projects, eq(projectMembers.projectId, projects.id))
    .where(eq(projectMembers.userId, userId));

  for (const m of memberships) {
    if (m.cwdPattern && !m.projectArchived && cwd.startsWith(m.cwdPattern)) {
      return { id: m.projectId, name: m.projectName };
    }
  }
  return null;
}

async function insertEvent(
  externalSessionId: string,
  eventType: string,
  timestamp: Date,
  metadata: Record<string, unknown> | null
) {
  const session = await db
    .select({ id: claudeSessions.id })
    .from(claudeSessions)
    .where(eq(claudeSessions.externalSessionId, externalSessionId))
    .limit(1);

  if (session.length === 0) return;

  await db.insert(claudeEvents).values({
    sessionId: session[0].id,
    eventType,
    timestamp,
    metadata,
  });
}

async function calculateIdleTime(sessionId: string): Promise<number> {
  const events = await db
    .select()
    .from(claudeEvents)
    .where(eq(claudeEvents.sessionId, sessionId))
    .orderBy(claudeEvents.timestamp);

  let idleMs = 0;
  for (let i = 1; i < events.length; i++) {
    const gap = new Date(events[i].timestamp).getTime() - new Date(events[i - 1].timestamp).getTime();
    if (gap > IDLE_THRESHOLD_MS) {
      idleMs += gap - IDLE_THRESHOLD_MS;
    }
  }
  return idleMs;
}
