# batesai.org integration

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
help@batesai.org · https://batesai.org

Subject Mastery runs at https://batesai.org/subjectmastery/. It reuses the existing Google membership session and stores private progress, profile and Study Plan documents in Cloudflare D1. The hosting repo is `danielalanbates/website`; its Subject Mastery integration is tracked in PR #12.

| Directory | Contents |
|---|---|
| `website-files/` | Snapshot of Subject Mastery API, auth return-path support, migrations and staging script; not an independent website |
| `tests/` | Local D1 fixtures, progress/API checks, OAuth return-path and merge convergence checks |

The API has `GET /api/subjectmastery/me`, `GET/PUT/DELETE progress`, and `GET/PUT profile` and `plan`. Writes require a session and enforce same-origin rules. Completed/known progress cannot be downgraded by position-only saves. Read docs/CONTRACT.md and the hosting repo's docs/subjectmastery.md before modifying merge behavior.

## Update the deployment

1. Build and validate the player from this repo into Downloads. Keep the verified build unchanged during upload.
2. Use the existing isolated website checkout; preserve its source branch and production functions.
3. Run `bash scripts/stage_subjectmastery.sh <verified-dist>` there, then `npm run build`.
4. Compare the website build with current production, excluding Subject Mastery assets. Investigate every unrelated difference. Do not launch another homepage or change auth incidentally.
5. Deploy from that same checkout with `npx wrangler pages deploy dist --project-name=website --branch=main --commit-dirty=true`. This pairs `dist/` and `functions/` correctly.
6. Confirm the live catalog, a lesson, a recording Range response, and signed-out `/me`/`progress` behavior. Record the deployment URL and commit in docs/VALIDATION.md.

The existing migrations are additive and already deployed. Do not rerun or rewind production D1 for a static curriculum update. Production sign-in is exercised only by a person; browser automation uses mocks and never writes a real learner account.

Historical setup and rollback details are archived in `archive/2026-10-02/DEPLOY_RUNBOOK.md`. Those account IDs, branch states and deployment IDs are dated examples, not current instructions. Retired patch files are retained as implementation history; prefer current snapshots and the website PR when updating.
