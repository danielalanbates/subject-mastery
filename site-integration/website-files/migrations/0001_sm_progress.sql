-- Subject Mastery: per-member lesson progress (https://batesai.org/subjectmastery/).
-- Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
-- help@batesai.org · https://batesai.org
--
-- Idempotent: safe to run any number of times.
--   local:      npx wrangler d1 execute batesai-db --local  --file migrations/0001_sm_progress.sql
--   production: npx wrangler d1 execute batesai-db --remote --file migrations/0001_sm_progress.sql
-- Apply it to production BEFORE deploying code that references sm_progress:
-- account deletion (functions/api/auth/[[path]].js) deletes from this table
-- inside one batch, and a missing table would make every deletion fail.
--
-- This database has no tracked migration history (no d1_migrations table is
-- relied on), so the file is run with `d1 execute`, not `d1 migrations apply`.
--
-- No extra index: the primary key (user_id, lesson_key) already serves every
-- query the API makes (all are "WHERE user_id = ?", optionally plus the key).
-- No foreign key to users(id) either (the shape is fixed by the Subject
-- Mastery CONTRACT.md); account deletion removes these rows explicitly, the
-- same way it clears dm_sync.

CREATE TABLE IF NOT EXISTS sm_progress (
  user_id    TEXT    NOT NULL,
  lesson_key TEXT    NOT NULL,
  status     TEXT    NOT NULL CHECK (status IN ('in_progress','completed','known')),
  position   REAL    NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, lesson_key)
);
