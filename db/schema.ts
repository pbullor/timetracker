import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    client: text("client"),
    color: text("color").default("#3b82f6").notNull(),
    hourlyRate: numeric("hourly_rate"),
    cwdPattern: text("cwd_pattern"),
    archived: boolean("archived").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("projects_user_id_name_idx").on(table.userId, table.name)]
);

export const timeEntries = pgTable(
  "time_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }),
    source: text("source").notNull(),
    note: text("note"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("time_entries_user_start_idx").on(table.userId, table.startAt),
    index("time_entries_project_idx").on(table.projectId),
  ]
);

export const claudeSessions = pgTable(
  "claude_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    projectId: uuid("project_id").references(() => projects.id),
    externalSessionId: text("external_session_id").notNull().unique(),
    cwd: text("cwd").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    promptCount: integer("prompt_count").default(0).notNull(),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("claude_sessions_user_idx").on(table.userId),
    index("claude_sessions_cwd_idx").on(table.cwd),
  ]
);

export const claudeEvents = pgTable(
  "claude_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => claudeSessions.id),
    eventType: text("event_type").notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
    metadata: jsonb("metadata"),
  },
  (table) => [
    index("claude_events_session_ts_idx").on(table.sessionId, table.timestamp),
  ]
);
