-- Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
-- LOCAL TEST FIXTURE ONLY. Never run with --remote.
--
-- A minimal stand-in for the production batesai-db schema: just enough for the
-- Subject Mastery API and the account-deletion batch in
-- functions/api/auth/[[path]].js to run against a local D1. Column sets are
-- trimmed to what those code paths touch; users/sessions follow schema.sql.
--   npx wrangler d1 execute batesai-db --local --file migrations/0001_sm_progress.sql
--   npx wrangler d1 execute batesai-db --local --file migrations/0002_sm_profile_plan.sql
--   npx wrangler d1 execute batesai-db --local --file local_fixture.sql
-- (migrations first: the last lines below reset the test users' Subject
-- Mastery rows so the suite starts clean on every run).

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  avatar_url TEXT,
  oauth_provider TEXT,
  oauth_id TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  membership_tier TEXT DEFAULT 'free'
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Tables the account-deletion batch clears by user_id.
CREATE TABLE IF NOT EXISTS fitness_profiles (user_id TEXT PRIMARY KEY, display_name TEXT, friend_code TEXT, created_at INTEGER, updated_at INTEGER);
CREATE TABLE IF NOT EXISTS workout_sessions (id TEXT, user_id TEXT);
CREATE TABLE IF NOT EXISTS xp_transactions (id TEXT, user_id TEXT);
CREATE TABLE IF NOT EXISTS activity_feed (id TEXT, user_id TEXT);
CREATE TABLE IF NOT EXISTS activity_reactions (id TEXT, user_id TEXT);
CREATE TABLE IF NOT EXISTS talents (id TEXT, user_id TEXT);
CREATE TABLE IF NOT EXISTS achievements (id TEXT, user_id TEXT);
CREATE TABLE IF NOT EXISTS quests (id TEXT, user_id TEXT);
CREATE TABLE IF NOT EXISTS personal_records (id TEXT, user_id TEXT);
CREATE TABLE IF NOT EXISTS guild_members (guild_id TEXT, user_id TEXT, role TEXT, joined_at INTEGER);
CREATE TABLE IF NOT EXISTS challenge_participants (id TEXT, user_id TEXT);
CREATE TABLE IF NOT EXISTS subscriptions (id TEXT, user_id TEXT);
CREATE TABLE IF NOT EXISTS user_settings (id TEXT, user_id TEXT);
CREATE TABLE IF NOT EXISTS workout_programs (id TEXT, user_id TEXT);
CREATE TABLE IF NOT EXISTS programs (id TEXT, user_id TEXT);
CREATE TABLE IF NOT EXISTS meso_cycles (id TEXT, user_id TEXT);
CREATE TABLE IF NOT EXISTS progress_metrics (id TEXT, user_id TEXT);
CREATE TABLE IF NOT EXISTS talent_unlocks (id TEXT, user_id TEXT);
CREATE TABLE IF NOT EXISTS dm_sync (user_id TEXT PRIMARY KEY, doc TEXT, updated_at INTEGER);
CREATE TABLE IF NOT EXISTS friendships (user_low TEXT, user_high TEXT);
CREATE TABLE IF NOT EXISTS challenges (id TEXT, creator_id TEXT, opponent_id TEXT);
CREATE TABLE IF NOT EXISTS guilds (id TEXT PRIMARY KEY, owner_id TEXT);

-- Two test members. Tokens (sent as the batesai_session cookie):
--   user A: sm-test-token-a   user B: sm-test-token-b
-- token_hash = SHA-256 hex of the token, exactly as requireUser() computes it.
INSERT OR REPLACE INTO users (id, email, password_hash, name, avatar_url, oauth_provider, oauth_id)
VALUES
  ('u-test-a', 'tester.a@example.com', '', 'Tester A', 'https://example.com/a.png', 'google', 'sub-a'),
  ('u-test-b', 'tester.b@example.com', '', 'Tester B', NULL, 'google', 'sub-b');
INSERT OR REPLACE INTO sessions (id, user_id, token_hash, expires_at)
VALUES
  ('s-test-a', 'u-test-a', '87fb543392ea67dd8b274c013c226354707b8b03c9f6563c157ded3af169a613', 4102444800),
  ('s-test-b', 'u-test-b', 'cc49a2ad1da72f84e6e762b675d0a2554e5b20e76b01010ce5bbcf9344c04080', 4102444800);

DELETE FROM sm_progress WHERE user_id IN ('u-test-a', 'u-test-b');
DELETE FROM sm_profile  WHERE user_id IN ('u-test-a', 'u-test-b');
DELETE FROM sm_plan     WHERE user_id IN ('u-test-a', 'u-test-b');
