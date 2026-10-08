# Site integration: decisions, dead ends and open questions

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
help@batesai.org · https://batesai.org

This is for whoever (human or AI) next touches the batesai.org side of Subject
Mastery. The runbook is `../site-integration/README.md`. What follows is why
things are the way they are.

## Choosing the base commit

The website repo at `~/.git` (the home folder is its work tree; see `docs/LOCAL_PATHS.md`) has two lines that split at
`b5ab0634`:

- the local line, ending at `7eea212f`: DM sync, membership Google/Apple
  sign-in, the /dev gate;
- GitHub `main`, `795954d9`: the homepage redesign.

The obvious guess, "production has the local work, maybe the redesign too", was
only half right. The evidence:

- **Static output.** A build of `7eea212f` matches every live file: 61 of 61,
  hashed `_astro` bundles included, once Cloudflare's email obfuscation is
  decoded. None of the redesign's text is on the live homepage. So the branch
  is based on `7eea212f`, and `main` is **not** merged in.
- **Functions.** Probing routes showed production lacks `membership.js`,
  `/api/auth/me`, `/api/daemonmanager`, `/api/seahawks`, `/ws` and `/dev`. The
  probes were preview URLs of the last two deployments plus each route's
  fingerprint (status code, body, and whether it fell back to the homepage).
  The cause was in session log `37d55575…` (2026-09-26): the /qola removal
  deploy staged `~/.git/dist` together with `~/functions`, instead of
  `~/.git/functions`. `~/functions` is a symlink into the stale iCloud tree
  `Code/batesai-website/functions`, which the memory note already warns about. That copy holds only
  10 of the 18 function files. Each one matches `7eea212f`, except that
  `api/auth/[[path]].js` is the merge-base version plus an uncommitted Apple
  raw-nonce fix.
- **Resolution.** The branch keeps `7eea212f`'s functions. Subject Mastery
  needs `membership.js`, and the missing routes are clearly unintended losses.
  It also commits the production-only pieces: the /qola redirect, the Qola
  header removal, and the nonce fix. The nonce commit keeps the old Apple
  audience as well, so nothing production accepts today starts to fail.

## Contract interpretations

- **Progress merge rule.** The first version dropped a newer `in_progress`
  write over `completed`/`known` entirely, and kept the stored record on a
  timestamp tie. The player builder's `web/js/progress.js mergeRecord()` does
  two things differently:
  - It keeps the done status but takes the newer position and time.
  - On ties it ranks completed > known > in_progress, then takes the larger
    position.

  The server was changed to match exactly, in SQL. Both readings fit the
  contract text. Agreement matters more than which one is chosen: with
  different rules a device and the server can disagree forever.
  `tests/test_merge_convergence.mjs` checks this with 400 random writes and
  many ties. **Suggestion for CONTRACT.md** (owner to decide; not edited
  here): spell out the tie-break and the "status kept, position taken" detail.
- **Dead end: folding duplicate keys in JavaScript.** Collapsing repeated keys
  within one PUT before writing looked harmless. It is not equivalent to
  applying them in order, because the merge rule is not associative once ties
  and the no-downgrade exception interact. The convergence test caught it on a
  shuffled replay. SQLite applies a multi-row upsert one row at a time, and a
  later row sees an earlier one, as `sqlite3` confirmed. So duplicates are now
  sent in request order and SQL does the merging.
- **The player's rule depends on order.** For example, completed@5,
  then in_progress@10, then known@10 gives completed. The same writes in a
  different order give known. The server matches the player for any given
  arrival order, but two devices that see writes in different orders can hold
  different records until the next sync, when the server's copy wins. This
  is worth a look by the player owner. It is not a server bug.
- **Profile and plan validation** follows the player's normalizers, so anything
  the player produces passes. An image avatar must be a png/jpeg/webp `data:`
  URL. That makes a future public profile page safe to render. Unknown fields
  are dropped. A PUT that loses LWW returns the stored copy.
- **Not provided, because the contract does not ask for them:**
  - `DELETE` of the profile or plan;
  - per-key progress delete. A stored `known` cannot be un-known on the
    server; the player's `holdFor()` undo works by never sending the change.

## Sign-in return path

- Google's `redirect_uri` is fixed at `https://batesai.org/membership`, so the
  return path rides in an `oauth_return_to` cookie: HttpOnly, Lax, ten minutes.
  The cookie is set by `GET /api/auth/oauth/google?return_to=` and read and
  cleared by `functions/membership.js`.
- Validation goes beyond the spec in two ways:
  - It refuses `.`/`..` segments, because `new URL()` would otherwise resolve
    `/x/../api/…` past the prefix check.
  - It refuses `/api/` and `/cdn-cgi/` targets. `GET /api/auth/logout` deletes
    the session regardless of method, so a crafted return path could sign
    someone straight out again.

  The cookie is re-validated on read, because a sibling `*.batesai.org` host
  could plant one.
- A plain sign-in (no `return_to`) clears any leftover cookie, so an abandoned
  Subject Mastery sign-in cannot redirect a later /membership sign-in.
- A refused consent screen comes back as `/membership?error=…` with no code.
  That case also returns to the page that started sign-in.
- Apple sign-in does not take `return_to`. It was not asked for, and its
  `form_post` path is unchanged.
- Without the cookie, every response is identical to `7eea212f`. This was
  checked header for header in Node, with the token exchange stubbed.
  DaemonManager depends on it.

## Smaller decisions

- **No schema convention existed** in the website repo (`schema.sql` is
  gitignored), so the SQL lives in `migrations/NNNN_*.sql`. Run it with
  `d1 execute --file`, not `d1 migrations apply`: nothing suggests production
  has a `d1_migrations` table, and applying would start tracking from an
  unknown baseline.
- **D1 limits:** 100 bound parameters per query, and 50 queries per invocation
  on the free plan (which Workers plan this account has is unverified). That
  is why upserts go 16 rows per statement. A full PUT is 34 queries.
- **No CORS headers.** The player is same-origin. PUT and DELETE with a
  foreign `Origin` get a 403. No `Origin` header (native apps with a Bearer
  token, curl) is allowed through, and the session is still required.
- **The products card** went under "Web Apps" as Beta, in a commit of its own
  so it can be reverted for an unlisted launch. The homepage redesign on
  GitHub `main` has its own product list, which will need the card too if it
  ever ships.
- **`public/sitemap.xml`** is a dead duplicate: `src/pages/sitemap.xml.ts`
  overwrites it at build time (verified). Only the `.ts` file was changed.

## Not verified

- **A real Google login.** It needs a person at Google's consent screen. The
  success path was verified only with a stubbed exchange.
- **Production D1.** Not touched at all: whether every table in the
  account-deletion batch exists, and which Workers plan applies. Runbook step 6
  checks the tables.
- **Runtime version.** Local `wrangler pages dev` (4.78) fell back to
  compatibility date 2026-03-17. Production uses the project's own setting.
- **The player's build** at `~/Downloads/subject-mastery-build/dist` was still
  empty when this was written. Staging was tested only with a two-file fake
  build.
