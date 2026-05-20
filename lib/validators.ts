import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  client: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  hourlyRate: z.string().nullable().optional(),
  cwdPattern: z.string().nullable().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  client: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  hourlyRate: z.string().nullable().optional(),
  cwdPattern: z.string().nullable().optional(),
  archived: z.boolean().optional(),
});

export const startTimerSchema = z.object({
  projectId: z.string().uuid(),
  note: z.string().nullable().optional(),
});

export const updateEntrySchema = z.object({
  note: z.string().nullable().optional(),
  projectId: z.string().uuid().optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().nullable().optional(),
});

export const claudeEventSchema = z.object({
  external_session_id: z.string().min(1),
  event_type: z.enum(["SessionStart", "UserPromptSubmit", "Stop", "SessionEnd"]),
  cwd: z.string().min(1),
  timestamp: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});
