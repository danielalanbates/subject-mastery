# Subject Mastery on batesai.org: integration and deploy runbook

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
help@batesai.org · https://batesai.org

This runbook puts Subject Mastery live at `https://batesai.org/subjectmastery/`,
with Google sign-in that keeps each member's progress, profile and study plan.
**Nothing here has been deployed or pushed, and production D1 is untouched.**
Background, decisions and dead ends are in `../docs/site-integration.md`.

## State on 2026-10-02

| Item | Value |
| --- | --- |
| Website build tree | `~/Downloads/subject-mastery-build/website`, a local clone of `~/.git` (the batesai.org website repo; see `docs/LOCAL_PATHS.md`) with no remotes |
| Branch | `subjectmastery`, 8 commits on top of `7eea212f` (head `2f0ececa`) |
| Bundle for the PR step | `~/Downloads/subject-mastery-build/website-subjectmastery.bundle`. Holds `7eea212f` plus the 8 commits, and needs `5bed0a82` (PR #10's head) to be present |
| Reference copy | `website-files/`: every new or changed site file, plus `website-files/patches/` (`git am`-able) |
| Tests | `tests/`: live diff, local D1 fixture, API suite, sign-in unit test, merge convergence test |

Commits (oldest first):

```
01f1906d Match production: /qola 301s to qolabible.com, Qola headers block removed
c2922106 Carry production's Apple native-sign-in nonce fix into source
cc5661cb Google sign-in: optional return_to so other pages can get members back
f708e2f5 Subject Mastery progress API and sm_progress table
de1f73c6 Serve the Subject Mastery player at /subjectmastery/
8fb90240 Products: Subject Mastery card under Web Apps (Beta)
897f28d5 Document Subject Mastery's footprint here and the production drift
2f0ececa Subject Mastery contract v2: profile + plan documents, nested lesson keys
```

### What production is right now (read this before deploying)

Production is deployment `a62e742f-fca8-4f82-9c16-71836da013f6`, from
2026-09-26. It is the Qola session's "remove /qola" upload, which was staged
from `~/.git/dist` plus `~/functions`. That path is a symlink into the stale
iCloud tree `Code/batesai-website/functions`.

- **The static site matches `7eea212f` exactly.** All 61 built files were
  compared, every `_astro` bundle included. The only differences were the hand
  edits to `_redirects`/`_headers` for /qola, now committed as `01f1906d`.
- **The homepage redesign (GitHub `main` `795954d9`, PR #11) is NOT live.**
  None of its text appears on batesai.org.
- **The functions are not `7eea212f`'s.** These routes are missing on
  production; they still work on the deployment before it (`5b4564eb`):
  - `functions/membership.js`, which redeems Google sign-in codes on the
    server. `/membership?code=x` gives a 308 instead of a 302.
  - `/api/auth/me`, which answers 404 "Unknown endpoint". **Google sign-in on
    /membership/ is therefore broken on production now.** The code lands on a
    static page that no longer redeems it, and the page cannot see a session.
  - `/api/daemonmanager/*`. **DaemonManager settings sync is broken.** The
    route falls through to the homepage HTML.
  - `/ws` (the Antediluvia WebSocket proxy), `/api/seahawks/*`, and the `/dev`
    gate: `/dev/` serves the homepage instead of a 404.
- **One fix exists only on production.** The stray auth router accepts a raw
  Apple nonce, which Endgame Fitness builds up to 6 send. That fix is now
  committed as `c2922106`, alongside the corrected bundle id, so deploying this
  branch does not regress it.

**Deploying this branch therefore also restores every route listed above.**
That is what `7eea212f` intended (it was live as `5b4564eb`). Daniel should
know it is part of the change.

### Live vs. build diff for this branch

Run with `tests/live_diff.py` (text diff with tags stripped, asset hashes
normalized and Cloudflare email obfuscation decoded; byte diff for every
other file):

```
58/61 identical. Differences, all ours:
  products/index.html             + the Subject Mastery card under Web Apps
  sitemap.xml                     + https://batesai.org/subjectmastery/
  _astro/ProductShowcase.*.js     new bundle hash (the card's data)
```

The functions cannot be compared that way. They change exactly as described
above, plus `/api/subjectmastery/*` and the `return_to` support.

## Deploy runbook

Every step runs in `~/Downloads/subject-mastery-build/website`, never in Drive
or iCloud. Wrangler hangs on cloud-backed folders, and the memory note
`project_batesai_website_repo` has the history. Deploy `dist/` and
`functions/` **from this same checkout**. Mixing them is how production broke.

0. **Preconditions.**
   - Daniel has said yes to deploying, and separately to step 6, because it
     changes production D1.
   - `npx wrangler whoami` shows the Cloudflare account `043cd08e…`.
   - `df -h /System/Volumes/Data` shows at least 9 GB free.
   - `~/Downloads/subject-mastery-build/dist/index.html` exists (the player
     build).
1. **Check the tree.**

   ```
   git branch --show-current          # subjectmastery
   git log -1 --format=%h             # 2f0ececa, or newer if work was added
   git status --short | grep -vE '^ M (dist|node_modules)/|^ D dist/'   # empty
   ```

   `dist/` and `node_modules/` are tracked in this old repo, so builds always
   show them as modified. That is expected; never commit them.
2. **Install dependencies** if `node_modules` is missing: `npm ci`.
3. **Stage the player.** Run `scripts/stage_subjectmastery.sh`. It refuses
   any of these:
   - a build without `index.html`;
   - symlinks;
   - a file over 25 MiB;
   - more than 15,000 files.
4. **Build.** Run `rm -rf dist && npm run build`. Check that
   `dist/subjectmastery/index.html` exists, and that
   `find dist -type f | wc -l` is under 20,000 (the Pages limit).
5. **Diff against live.**

   ```
   python3 ../website-tools/live_diff.py dist ../live/diff-predeploy --skip-prefix subjectmastery/
   ```

   Expect exactly the 3 differences listed above. **Stop on anything else**:
   someone has deployed in the meantime, so find out what changed first.
6. **Production D1 migrations** (additive, idempotent). These must run before
   step 7, because account deletion clears these tables inside one batch.

   ```
   npx wrangler d1 time-travel info batesai-db          # note the bookmark (for rollback)
   npx wrangler d1 execute batesai-db --remote --file migrations/0001_sm_progress.sql
   npx wrangler d1 execute batesai-db --remote --file migrations/0002_sm_profile_plan.sql
   npx wrangler d1 execute batesai-db --remote --command \
     "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('sm_progress','sm_profile','sm_plan','dm_sync','sessions','fitness_profiles','workout_sessions','xp_transactions','activity_feed','activity_reactions','talents','achievements','quests','personal_records','guild_members','challenge_participants','subscriptions','user_settings','workout_programs','programs','meso_cycles','progress_metrics','talent_unlocks','friendships','challenges','guilds','users')"
   ```

   The last query must list all 27 tables. If any table the deletion batch
   names is missing, account deletion already fails today. Fix that first,
   because the new code depends on it the same way.
7. **Deploy.**

   ```
   npx wrangler pages deploy dist --project-name=website --branch=main --commit-dirty=true
   ```

   Run it from this directory, so `functions/` comes from the same checkout.
   Record the deployment id it prints.
8. **Post-deploy checks** (expected result after each `#`).

   ```
   B=https://batesai.org
   curl -s -o /dev/null -w '%{http_code}\n' $B/subjectmastery/                 # 200
   curl -s -D - $B/api/subjectmastery/me | grep -iE 'cache-control|^\{'        # no-store, {"signedIn":false}
   curl -s -w ' %{http_code}\n' $B/api/subjectmastery/progress                 # {"error":"Not signed in"} 401
   curl -s -w ' %{http_code}\n' $B/api/subjectmastery/profile                  # 401
   curl -s -D - -o /dev/null "$B/api/auth/oauth/google?return_to=/subjectmastery/" | grep -ic '^set-cookie'   # 2
   curl -s -D - -o /dev/null "$B/api/auth/oauth/google" | grep -ic '^set-cookie'                               # 1
   curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "$B/membership?code=bogus"                       # 302 …/membership/?error=code_replayed
   curl -s -o /dev/null -w '%{redirect_url}\n' -H 'Cookie: oauth_return_to=/subjectmastery/' "$B/membership?code=bogus"   # …/subjectmastery/?signin_error=code_replayed
   curl -s $B/api/auth/me                                                      # {"signedIn":false}   (restored)
   curl -s -o /dev/null -w '%{http_code}\n' $B/api/daemonmanager/sync          # 401                  (restored)
   curl -s -o /dev/null -w '%{http_code}\n' $B/ws                              # 426                  (restored)
   curl -s -o /dev/null -w '%{http_code}\n' $B/dev/                            # 404                  (restored)
   curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' $B/qola            # 301 https://qolabible.com/
   curl -s $B/sitemap.xml | grep -c subjectmastery                             # 1
   python3 ../website-tools/live_diff.py dist ../live/diff-postdeploy          # 61+/61+ identical
   ```

   The `code_replayed` reason assumes Google answers `invalid_grant` for a
   bogus code, as it did before. Any `?error=` / `?signin_error=` redirect
   still proves the route is live.
9. **Daniel checks by hand.** Only a person can complete a Google login.
   - In a private window, open `https://batesai.org/subjectmastery/` and use
     its sign-in link. Expect to land on `/subjectmastery/?signed_in=1` with
     your name shown.
   - Mark a lesson known. In a second browser, sign in and check that it shows
     as known there too.
   - Sign in from DaemonManager's batesai.org sign-in, which must still land
     on `/membership/?signed_in=1`, and check that its settings sync works.
   - On an Endgame Fitness phone build, check that Sign in with Apple still
     works.

## Rollback

- **Pages.** Run `npx wrangler pages deployment list --project-name=website --environment=production`
  to find the deployment to return to. Wrangler 4.78 has no Pages rollback
  command, so use one of these:
  - the dashboard: Workers & Pages → website → Deployments → ⋯ → *Rollback to
    this deployment*;
  - the API: `curl -X POST -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" https://api.cloudflare.com/client/v4/accounts/<account-id>/pages/projects/website/deployments/<id>/rollback`.

  The two candidates as of today:
  - `a62e742f-fca8-4f82-9c16-71836da013f6` is the current production
    deployment. It has the broken functions described above, so rolling back
    to it brings those breakages back.
  - `5b4564eb-1eba-44b0-b606-7e184e158555` has 7eea212f's correct functions,
    but predates the /qola removal and lacks the Apple raw-nonce fix.
- **D1.** Both migrations only add tables, and the older code never reads
  them, so leave them in place after a code rollback. If they must go, drop
  them only *after* the code rollback: the new account-deletion code fails
  without them. `wrangler d1 time-travel restore batesai-db --bookmark=<step 6 bookmark>`
  is the last resort. It rewinds **every** table, including any sign-ups made
  since.

## Branch and PR plan for GitHub (`danielalanbates/website`)

- GitHub `main` (`795954d9`) is the merge base `b5ab0634` plus the homepage
  redesign (PR #11, not live).
- The local lineage up to `7eea212f` was never merged. It covers DM sync, the
  membership Google/Apple work and the dev gate. Open PR #10
  (`fix/google-oauth-server-side-callback`, head `5bed0a82`) carries part of
  it. PR #9 (`chore/repo-hygiene`) untracks `node_modules/`, `Code/`,
  `Library/` and the other stray paths this repo still tracks.
- `subjectmastery` merges cleanly with `main` and with `chore/repo-hygiene`
  (`git merge-tree --write-tree` exit 0 for both). It contains all of PR #10.

Steps, from the canonical GitHub clone. Today that is Drive
`My Drive/Code/GitHub/website`, per Daniel's 2026-09-25 directive; CLAUDE.md
§6 still names the iCloud Code folder, so Daniel should confirm. Never push
from the Downloads build tree.

```
git fetch origin                                           # brings 5bed0a82 (PR #10 head)
git fetch ~/Downloads/subject-mastery-build/website-subjectmastery.bundle subjectmastery:subjectmastery
git push origin subjectmastery
gh pr create --base main --head subjectmastery --title "Subject Mastery at /subjectmastery/ + restore production drift"
```

Then close PR #10 as superseded.

**Caution:** once this PR is merged, `main` contains the unreleased homepage
redesign, and deploying from `main` would launch it. Until Daniel decides
about the redesign, keep deploying from a build of `subjectmastery`.

If Subject Mastery should launch unlisted, run `git revert 8fb90240` (the
products card) before building. The sitemap entry is in `de1f73c6`.

## Re-running the tests locally

Run these in the website build tree, against a **local** D1 only.

```
export WRANGLER_SEND_METRICS=false
npx wrangler d1 execute batesai-db --local --file migrations/0001_sm_progress.sql
npx wrangler d1 execute batesai-db --local --file migrations/0002_sm_profile_plan.sql
npx wrangler d1 execute batesai-db --local --file ../website-tools/local_fixture.sql   # test users; rerun before every suite run
npx wrangler pages dev dist --port 8788 --ip 127.0.0.1 \
  --d1 DB=<database-id> \
  --binding OAUTH_GOOGLE_CLIENT_ID=local-test-client.apps.googleusercontent.com \
  --show-interactive-dev-session=false &
python3 ../website-tools/test_api_local.py http://127.0.0.1:8788 "$PWD"           # 137 passed
node ../website-tools/test_merge_convergence.mjs <copy of web/js/progress.js>      # 3 passed
# old = `git archive 7eea212f functions`, new = this tree's functions/, each under a {"type":"module"} package.json
node ../website-tools/test_membership_unit.mjs <old>/functions <new>/functions     # 49 passed
kill %1
```

`--d1 DB=<database_id>` makes `pages dev` share the sqlite file that
`d1 execute --local` writes. No Google secret is configured locally, so the
exchange subrequest fails fast with `token_rejected` and never reaches Google.
