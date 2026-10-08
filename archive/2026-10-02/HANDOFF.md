# Handoff: Subject Mastery (state on 2026-10-02)

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved. · help@batesai.org · https://batesai.org

For the next AI or person. Read [`GOAL.md`](GOAL.md) (Daniel's words, authoritative) and
[`CONTRACT.md`](CONTRACT.md) (v1 + "v2 additions"; v2 wins) first. `$SM_REPO` means this repo;
`~/Downloads/subject-mastery-build` is the build root. Daniel's exact paths are in the gitignored
`docs/LOCAL_PATHS.md`.

## What exists

| Part | Where | State |
|---|---|---|
| Web player | `web/` | v2 contract complete: nested topics, knowledge bars, Already Known, autoplay, Study Plan, profile + Estimated IQ. 63 unit tests, 95 e2e checks on a fixture |
| Content | `content/`, status in `CONTENT_STATUS.md` | 4 pilot subjects, about 250 lessons planned; more than 100 written and growing (a long-running writer syncs into `content/`) |
| Pipeline | `pipeline/` | Free-tier LLM draft, review, revise, plus Piper audio and `build.py`; $0 |
| Site integration | `site-integration/` + build clone `~/Downloads/subject-mastery-build/website` (branch `subjectmastery`, no remote) | Pages Functions `/api/subjectmastery/*`, D1 migrations, sign-in `return_to`; tested locally only, **not deployed** |
| Mac beta app | `app/`, installed at `/Applications/Subject Mastery.app` | Swift + WKWebView + loopback server on 127.0.0.1:47913; verified, see `app/README.md` |
| Publish prep | `README.md`, `NOTICE`, `.gitignore`, `tools/privacy_scan.py` | Ready; **no git repo yet, nothing pushed** |

## Build, test, deploy

| Task | Command |
|---|---|
| Build the site | `SM_WEB_DIR="$SM_REPO/web" python3 -B pipeline/build.py` (long runs: use the local mirror, `pipeline/README.md`) |
| Serve locally | `python3 -m http.server 8765 --bind 127.0.0.1 --directory ~/Downloads/subject-mastery-build/dist` |
| Player tests | `node --test 'web/tests/*.test.mjs'`; e2e: `web/tests/e2e_playwright.py` (see `web/README.md`) |
| Site tests | `site-integration/tests/` (see its README) |
| Mac app | `app/build_app.sh`, then once: `app/verify_app.sh` (`--direct` when no one can click the Downloads consent dialog) |
| Deploy the site | `site-integration/README.md` runbook. Deploying, D1 writes and pushes need Daniel's go-ahead |
| Privacy scan before any push | `python3 -B tools/privacy_scan.py "$SM_REPO" --terms <local terms file> --out scan.md` (terms file path: `LOCAL_PATHS.md`) |

## Open decisions for Daniel

| Decision | Options and notes |
|---|---|
| Domain | subjectmastery.org (WHOIS "not found", likely free), .net, subject-mastery.org; .com is taken. Confirm at a registrar; any purchase needs Daniel |
| Narrator voice | `en_US-lessac-medium` is in use; a voice comparison is under way (`docs/VOICE.md` when done). The chosen voice's dataset licence must allow public use; fill `NOTICE` item 2 |
| Licence vs "open source" | The goal says "open source"; the repo uses Daniel's default PolyForm Noncommercial + 10% rider, which is source-available, not OSI open source. README says so. Switching to MIT/Apache would make it truly open source but drop the revenue rider |
| Piper is GPL-3.0 | piper-tts 1.7 (OHF-Voice/piper1-gpl) is GPL-3.0-or-later, and `pipeline/piper_worker.py` imports it. Options: call the `piper` command-line program as a separate process instead (arm's length), license that one worker file GPL-3.0, or pin the MIT rhasspy/piper 1.2 binary |
| Products card on batesai.org | The site branch adds a "Subject Mastery (Beta)" card under Web Apps in its own commit; keep it for a public launch or revert it for an unlisted beta |
| App signing | Ad-hoc signing means each rebuilt app may ask again for Downloads access. A stable identity (Apple Development / Developer ID) would keep the grant |
| Publishing `site-integration/` | It contains batesai.org membership/sign-in code and production notes. Fine for a source-available repo (no secrets), but Daniel may prefer to keep it out of the public repo |

## Alternative pathways considered

- **Player:** a framework (React/Svelte) or a bundler was rejected for plain ES modules: no build step, easy to audit, and it runs anywhere.
- **Hosting:** subfolder of batesai.org now (reuses Google sign-in and D1) versus its own domain later; the player uses relative URLs, so a move is a copy.
- **Accounts:** batesai.org membership sessions reused rather than a new auth system.
- **Content:** free LLM tiers with cross-family review instead of paid models; outlines align with OpenStax and others but never copy (OpenStax went CC BY-NC-SA in March 2026).
- **Audio:** local Piper instead of cloud TTS ($0, offline); browser speech as a fallback when audio is missing.
- **Mac app:** loopback HTTP server chosen over `WKURLSchemeHandler`, `loadFileURL` and Electron (reasons in `app/README.md`).
- **Git home:** Daniel's rule puts git in the Drive repo. Drive can stall reads for minutes, so an alternative is a clean export to `~/Downloads/subject-mastery-build/publish/repo`, committed and pushed from there, with Drive kept as the source.

## Remaining steps to publish on GitHub (danielalanbates/subject-mastery)

1. Wait until the content writer has finished and synced (`CONTENT_STATUS.md` quiet; no `write_lessons.py`/`tts.py` running).
2. Make the pipeline path edits listed in the scan report (`subjects.py`, `sync_content.py`, `llm.py`, and line 86 of `CONTENT_STATUS.md`), so no personal path or e-mail remains.
3. Refresh `docs/img/` from the final reviewed screenshots if the UI changed (under 300 KB each).
4. Run `tools/privacy_scan.py` again; it must report only the accepted items.
5. `git init` in `$SM_REPO`, set the repo-local `user.email` (see `LOCAL_PATHS.md`; the global one is a work address), commit, then check `git ls-files` contains no audio, logs or `LOCAL_*.md`.
6. Create the GitHub repo and push. Daniel's standing instruction is to publish when the work is done; this run was told not to push while content was still syncing. GitHub will show the licence as "Other".
7. Tag a release (`v0.1.0`) only when the site build is verified bug-free. The Mac app stays the local beta.
