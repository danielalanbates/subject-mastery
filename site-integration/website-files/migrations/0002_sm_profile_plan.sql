-- Subject Mastery v2: per-member profile and study plan documents.
-- Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
-- help@batesai.org · https://batesai.org
--
-- Idempotent, same handling as 0001_sm_progress.sql:
--   local:      npx wrangler d1 execute batesai-db --local  --file migrations/0002_sm_profile_plan.sql
--   production: npx wrangler d1 execute batesai-db --remote --file migrations/0002_sm_profile_plan.sql
-- Apply BEFORE deploying the code: account deletion clears both tables inside
-- one batch, so a missing table would make every account deletion fail.
--
-- `data` is the document as JSON text, already validated and trimmed to the
-- contract's fields by functions/api/subjectmastery/[[path]].js. `updated_at`
-- (ms epoch) is pulled out so last-write-wins runs in SQL. The shape is fixed by
-- the Subject Mastery CONTRACT.md ("v2 additions").

CREATE TABLE IF NOT EXISTS sm_profile (user_id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sm_plan    (user_id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
