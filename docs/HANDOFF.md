# Successor handoff: Subject Mastery, 2026-10-27

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
help@batesai.org · https://batesai.org

Read AGENTS.md, GOAL.md and CONTRACT.md first. Published lesson IDs are permanent. This handoff supersedes the 2026-10-08 one, which is preserved under archive/2026-10-08/HANDOFF.md.

## Current state (v0.2.0)

| Part | State |
|---|---|
| Public website | https://batesai.org/subjectmastery/: 639 pages in ten subjects, every page recorded |
| Recordings | 639 John-voice MP3s, 73.1 hours; the longest is 546 s (limit 600 s) |
| Subjects | Economics, Biology, World History, Biblical Studies & Theology, Mathematics, Computer Science, Chemistry, Psychology, US History, Church History |
| Review | Every available lesson has an expert-review record in provenance: the pilots by hand on 2026-10-02, the other six on 2026-10-27 (docs/EXPERT_REVIEW.md, 442 verified corrections) |
| New in 0.2.0 | Library-wide search (`#/search`, `data/search.json`, contract v3); five subjects activated; Mathematics recorded; web/icons tracked again (the old `Icon?` ignore rule hid it) |
| Drafts | Calculus and Physics: outlines plus free-model lesson drafts (see CONTENT_STATUS.md). Status planned. They have not had expert review or narration yet |
| Source | Public `danielalanbates/subject-mastery`, release v0.2.0. The canonical checkout is in Google Drive Code. Local paths are only in the ignored LOCAL_PATHS.md |
| Website integration | Private `danielalanbates/website`, branch `subjectmastery` (PR #12). Deployed as a static-only update; see VALIDATION.md for the deployment id |
| Mac beta | /Applications/Subject Mastery.app 0.2.0 bundles the full site and recordings (APFS clones). Older builds are archived in the build workspace |

## How 0.2.0 was produced

1. Restore. The old Downloads build folder had been deleted. The 250 existing MP3s were recovered from the Mac beta bundle with `tools/adopt_audio.py`, which writes tts-compatible sidecars only when the lesson text is unchanged. The John model was re-downloaded from rhasspy/piper-voices. VanaVoice's Python is broken, because its uv CPython was removed from the machine, so Piper now runs from a separate venv set with `SM_PIPER_PYTHON`.
2. Review. `tools/review_workflow.js` ran one expert reviewer plus one independent verifier per subject. `tools/apply_review.py` applied only verified edits.
3. Narration. `pipeline/tts.py` ran with one Piper process at nice 19, using `tools/render_rest.sh` to wait for disk space. Whisper spot checks of real audio are done with `tools/asr_diff.py`.
4. Build, check and ship. Run build.py, ffprobe every MP3, the node unit tests, the pipeline tests, the GOAL browser suite and the privacy scan. Then deploy, rebuild the .app and publish the GitHub release.

## Continue work

| Task | Steps |
|---|---|
| Activate Calculus and Physics | Finish any missing drafts (`pipeline/write_lessons.py calculus physics`), then run tools/review_workflow.js for both and apply with tools/apply_review.py. Render with tools/render_rest.sh calculus physics, then Whisper-check a few lessons. Then set the catalog status to available, rebuild, test and deploy |
| More subjects | Add a spec to pipeline/subjects.py: a reference syllabus, plus guidance that includes the voice rules (lone "a", colons, four-digit numbers, symbols). Then run outline.py, fix the titles by hand, and run write_lessons.py. Keep the subject planned until it has been reviewed and narrated |
| Player change | Edit web/ and run the node tests, e2e_search.py and the relevant e2e_goal.py groups. Rebuild, deploy and refresh the .app |
| Deploy | See site-integration/README.md. Rebuild the website from branch `subjectmastery` (or whatever branch production was last deployed from; check `wrangler pages deployment list`). Stage the dist with `cp -cR`, build, run live_diff.py (every non-Subject-Mastery file must be SAME), then deploy. /play and /dev/play are NOT live (an earlier deploy dropped them). Do not stage the Antediluvia build unless Daniel has approved that build |
| Mac beta | `SM_BUILD=<build> SM_APP_SITE=<verified dist> bash app/build_app.sh`. It refuses to install while the app is running |

## Machine hazards seen this run

- **Disk:** free space swung between 7 and 25 GB during the run (iCloud CloudKit cache runaway, swap growth, another session's 7.3 GB simulator runtime). The user-level `cloudd` and `bird` processes were SIGSTOPped to stop a cache runaway of up to 1.2 GB/min. A reboot or `kill -CONT` resumes them. Check `df` before every bulk step; Daniel's floor is 8 GB.
- **Free models:** the writer stops when every provider fails ("providers exhausted"). Rerun it later; finished lessons are skipped.
- **Drive:** git inside Google Drive hangs. Work in a Downloads clone, push to GitHub, then copy the tree back to Drive.

## Further paths

| Path | Notes |
|---|---|
| Knowledge checks and spaced repetition | Completion currently measures exposure plus self-report. Short recall questions per page would give real evidence of retention |
| Irregular plurals in search | "matrix/matrices", "crisis/crises" don't match each other yet (see web/README.md search section) |
| Offline PWA | Needs a cache and versioning plan for a 1.3 GB audio library. The Mac beta already works offline |
| Own domain | subjectmastery.org/.net looked unregistered on 2026-10-02. Daniel approves any purchase |
| Signing and notarization | The beta is ad-hoc signed. Developer ID notarization is the next step if the app is distributed |

Retired code belongs in archive/ with a note on why it failed. Keep keys, personal information, audio masters, logs, generated builds and learner data out of git.
