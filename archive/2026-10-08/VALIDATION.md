# Validation and release record — 2026-10-08

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
help@batesai.org · https://batesai.org

| Check | Result |
|---|---|
| Node player tests | 72 passed, 0 failed: progress, merge/sync, nested trees, Study Plans, profiles, learning score, safe Markdown and credits |
| Fixture browser suite | 96/96 passed: desktop/mobile routes, recordings, speech fallback UI, drag/keyboard controls, profile customization, local persistence and mocked account sync |
| Full goal suite | 120/120 passed on the original four-subject build, including sticky bars, exact bar movement, every-page Already Known, continuous listening, ordered plans, resume, accessibility and error handling |
| Final curriculum checks | 30/30 passed after enabling Mathematics: all five subjects, every-page known/advance, content contract and About/credits metadata |
| Exact requested plan | Desktop 1280 and phone 390 passed: three distinct Biology recordings followed by one Mathematics speech lesson, one Play click, all four marked completed, automatic return to Study Plan |
| Duration regression | Invalid, negative, zero, nonnumeric, nonfinite and over-600-second audio blocks publication; exactly 600 seconds is accepted |
| Public source privacy | 0 findings; personal paths are kept in ignored LOCAL_PATHS.md; no keys, logs, audio masters or learner exports in git |
| Static build | 316 lesson JSON files, 250 recordings, five available subjects; all built data matches the shared contract |
| Website preservation | All 61 existing non-Subject-Mastery website files matched live production before deployment |
| Mac beta | Ad-hoc signature verified; bundled curriculum includes Mathematics; actual MP3 byte Range response matched disk bytes; API auth, traversal and foreign Host checks passed |
| Live website | Catalog returns five available subjects and 316 pages; Mathematics lesson text loads; signed-out /me returns false and /progress returns 401 |

The exact plan test uses the real MP3s and a silent deterministic speech stub because headless Chromium has no installed OS voice. It proves speech completion and plan transitions; it does not verify audible pronunciation. Some early harness runs failed because of a native voice type mismatch and observing navigation before the current media controls were ready. The retired setup is preserved in archive/2026-10-08; the final test waits for the specific title and loaded, seekable audio.

The Mac AppKit window, native file dialogs, audible output and a real Google login were not exercised in this run. Prior WKWebView persistence checks are documented in the archived handoff. Account browser tests use mocks; no real learner's data was read or changed. Tests and preview servers were stopped after use; no GUI control or relaunch loop was used.

## Published build

- Live site: https://batesai.org/subjectmastery/
- Cloudflare deployment: https://2ca974fb.website-8lz.pages.dev
- Website source branch: `subjectmastery`, commit `df17c6f9` (existing PR #12 updated to include its cache revalidation fix).
- Mac beta: `/Applications/Subject Mastery.app`, version 0.1.0, build 20261008.1421, with bundled site.
- Public GitHub source/release: https://github.com/danielalanbates/subject-mastery/releases/tag/v0.1.0
- Release artifact: `subject-mastery-v0.1.0-web.zip`; matching `SHA256SUMS.txt` is attached to the release.

Recordings were refreshed for three history pages whose source text changed. All 250 current MP3s are checked with ffprobe against the ten-minute limit. Every lesson remains AI-assisted educational content; expert content review is distinct from software verification. The release records what was verified and does not claim that finite testing can prove every possible use case defect-free.
