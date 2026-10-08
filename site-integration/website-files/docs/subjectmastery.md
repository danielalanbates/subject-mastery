# Subject Mastery on batesai.org

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
Questions: help@batesai.org · https://batesai.org

Subject Mastery has standardized subject paths you can play as audio or read
as text, with progress tracking and an "Already know this" skip. It lives at
`https://batesai.org/subjectmastery/`. Its own repo (`subject-mastery`, in
Google Drive `My Drive/Code/subject-mastery`) owns the binding contract
(`docs/CONTRACT.md`), the player and the deploy runbook
(`site-integration/README.md`). This file covers only what lives in this repo.

## What is here

| Path | Role |
| --- | --- |
| `functions/api/subjectmastery/[[path]].js` | `GET me`, `GET/PUT/DELETE progress`, `GET/PUT profile`, `GET/PUT plan` |
| `migrations/0001_sm_progress.sql` | the `sm_progress` table (idempotent) |
| `migrations/0002_sm_profile_plan.sql` | the `sm_profile` and `sm_plan` tables (contract v2, idempotent) |
| `functions/_lib/return-to.js` | validates the post-sign-in return path |
| `functions/api/auth/[[path]].js` | `GET oauth/google?return_to=` sets the cookie; account deletion clears `sm_progress`, `sm_profile`, `sm_plan` |
| `functions/membership.js` | the Google callback lands on the return path when the cookie is set |
| `scripts/stage_subjectmastery.sh` | copies the built player into `public/subjectmastery/` (gitignored) |

## Rules worth knowing before changing anything

- **Progress merge rule.** The server and the player must agree on this. It
  mirrors `mergeRecord()` in the player's `web/js/progress.js`:
  - The newer `updatedAt` wins, per lesson key.
  - A newer `in_progress` keeps a stored `completed`/`known` status, but takes
    the newer position and time.
  - The reverse holds too: an older `completed`/`known` that arrives after a
    newer stored `in_progress` makes it done, keeping the stored position and
    time (stored `in_progress@20` plus `completed@10` gives `completed@20`).
  - On equal timestamps, `completed` beats `known`, which beats
    `in_progress`. After that, the larger position wins.

  The rule is enforced in the upsert's `ON CONFLICT … SET/WHERE`, so two
  devices writing at once cannot race past it. Duplicate keys in one PUT are
  applied in order by SQLite, one row at a time. Folding them in JavaScript
  first gave different answers, because the rule is not associative. The
  convergence test in `site-integration/tests/` caught that.
- **Profile and plan** are whole JSON documents, and the newer `updatedAt`
  wins (a tie keeps the stored copy). The server checks their shape and size.
  An image avatar must be a png/jpeg/webp `data:` URL. Only the fields the
  contract names are stored.
- **D1 limits** shaped the write path: at most 100 bound parameters per query
  and 50 queries per invocation on the Workers free plan. Rows go 16 per
  statement, so a full 500-item PUT is 32 statements in one batch.
- **Migrations before code.** Account deletion deletes from `sm_progress`,
  `sm_profile` and `sm_plan` inside one `DB.batch()`. If any of those tables is
  missing, every account deletion fails.
- **No return cookie means no change.** `/membership` and
  `/api/auth/oauth/google` respond exactly as before when `oauth_return_to` is
  absent. DaemonManager's sign-in webview waits for `/membership/?signed_in=1`.
  The test that proves this compares the new and old handlers header by
  header. It is in the subject-mastery repo under `site-integration/tests/`.
- **Same-origin only.** The API sends no CORS headers. A PUT or DELETE whose
  `Origin` names another site gets a 403. Requests with no `Origin` header
  (native apps, curl) still need a valid session.

## Production drift found on 2026-10-02 (read before any deploy)

The live deployment (`a62e742f`, 2026-09-26, uploaded when /qola was removed)
paired a correct static build of 7eea212f with `~/functions`
instead of this repo's `functions/`. That path is a symlink into the stale
iCloud tree `Code/batesai-website/functions`. As a
result, production was missing `functions/membership.js`, `/api/auth/me`,
`/api/daemonmanager/*`, `/api/seahawks/*`, `/ws` and the `/dev` gate. Google
sign-in on `/membership/` and DaemonManager sync were therefore broken there.
That stray copy also held one fix that had never been committed: Apple native
sign-in accepting a raw nonce. Commit `c2922106` carries that fix into source.
Deploying this branch restores all of the routes listed above. The
`subjectmastery` branch also commits the two edits that deploy made by hand
(`/qola` 301 to qolabible.com, and the Qola `_headers` block removed).

Always deploy `dist/` and `functions/` from the same checkout.
