-- Add auth columns to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" timestamp with time zone;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "api_key" text UNIQUE;

-- Rename user_id to owner_id in projects
ALTER TABLE "projects" RENAME COLUMN "user_id" TO "owner_id";

-- Drop old cwd_pattern from projects (moved to project_members)
ALTER TABLE "projects" DROP COLUMN IF EXISTS "cwd_pattern";

-- Drop old unique index and create new one
DROP INDEX IF EXISTS "projects_user_id_name_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "projects_owner_id_name_idx" ON "projects" USING btree ("owner_id","name");

-- Auth tables
CREATE TABLE IF NOT EXISTS "accounts" (
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "provider_account_id" text NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text,
  PRIMARY KEY ("provider", "provider_account_id")
);

CREATE TABLE IF NOT EXISTS "sessions" (
  "session_token" text PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "expires" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" text NOT NULL,
  "token" text NOT NULL,
  "expires" timestamp with time zone NOT NULL,
  PRIMARY KEY ("identifier", "token")
);

-- Project members table
CREATE TABLE IF NOT EXISTS "project_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "role" text DEFAULT 'member' NOT NULL,
  "cwd_pattern" text,
  "joined_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "project_members_project_user_idx" ON "project_members" USING btree ("project_id","user_id");
CREATE INDEX IF NOT EXISTS "project_members_user_idx" ON "project_members" USING btree ("user_id");

-- Migrate existing projects: create owner memberships for existing projects
INSERT INTO "project_members" ("project_id", "user_id", "role")
SELECT "id", "owner_id", 'owner' FROM "projects"
ON CONFLICT DO NOTHING;
