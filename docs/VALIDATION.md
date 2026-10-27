# Validation and release record: v0.2.0, 2026-10-27

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
help@batesai.org · https://batesai.org

The v0.1.0 record (2026-10-08) is archived in archive/2026-10-08/VALIDATION.md.

| Check | Result |
|---|---|
| Node player tests | 91 passed, 0 failed (72 earlier plus 19 for search, routing caps and emoji-safe query truncation) |
| Pipeline tests | Passed, including the new check that `data/search.json` matches the built tree |
| Content contract | `build.py --check` OK for all ten available subjects; the build reports that the dist data matches the contract |
| Recordings | 639 of 639 pages have a John-voice MP3. Each actual MP3 was measured with ffprobe: 319 to 546 seconds, none over 600, 73.1 hours in total |
| Audio spot checks (Whisper base.en, normalised word error) | Mathematics "Variables and Expressions": 1.08%. Chemistry "Balancing Chemical Equations": 2.09%. Mathematics quadratic formula: 8.48%, almost all of which is Whisper writing numerals for spoken number words; the one real slip was "plug" heard as "plot" |
| Bible quotations | check_quotes.py on Biblical Studies and Church History: 47 checked. All exact apart from 2 straight-quote pairing false positives in one Zwingli lesson, whose quotation of Matthew 26:26 (KJV) is exact |
| Expert review | 442 verified corrections across six subjects (docs/EXPERT_REVIEW.md) |
| Search (fixture) | e2e_search.py 52/52: desktop, phone and dark mode, keyboard path, no results, HTML characters, missing or broken index fallback, slow index, long deep link |
| GOAL suite (real v0.2.0 build, 1280 and 390) | 121 passed and 3 failed in the first full run. All 3 failures were in the phone pointer-drag Study Plan test. The v0.1.0 player failed it identically on the new ten-subject data, so the cause was test geometry, not a regression: the taller palette put the drop zone's edge under the tab bar. After the test fix, the plan group passed 24/24 at both widths, including the exact plan of three Biology pages then one Economics page with one Play click. The other groups were not rerun after the test-only change |
| Website preservation | The site was rebuilt from website@df17c6f, the same commit as the previous production deploy. live_diff.py found all 61 non-Subject-Mastery files identical before upload |
| Live site after deploy | live_diff.py over the whole deployed build found 1386/1386 files identical to production (pages compared as text; JSON, MP3 and every other file by SHA-256) |
| Live checks after deploy | Catalog shows 10 available subjects, 639 pages and 4,386 minutes. A Psychology lesson loads with audio and the John voice. An MP3 Range request returns 206 with bytes identical to the build. search.json has 769 entries. Signed out, `/me` returns `{"signedIn":false}` and `/progress` returns 401. /membership returns 200 |
| Mac beta | Version 0.2.0, build 20261027.1610. The bundle holds 639 recordings. Its bundled site, served by the app's own server code (SubjectMasteryServer, built from the same source), returned the catalog and search index, a 206 Range response with matching bytes, and 404 for path traversal |
| Privacy | tools/privacy_scan.py: 0 findings over 897 files |

Not exercised in this run:
- the Mac app window itself (verify_app.sh opens the app, and Daniel may have been playing a game)
- audible playback by a person
- a real Google sign-in
- e2e_math_plan.py (Mathematics now has recordings, so its recording-to-speech case no longer applies)

Browser tests used mocked accounts. No real learner data was read or changed. Every test server and browser was stopped.

## Published build

- Live site: https://batesai.org/subjectmastery/
- Cloudflare deployment: https://462e7db9.website-8lz.pages.dev, built from website branch `subjectmastery` at `df17c6f`. The deploy was static-only: no functions changed and no D1 migrations ran.
- /play and /dev/play were already absent from production before this deploy (the 2026-10-08 deploy did not include them). They were left out deliberately, because only an approved Antediluvia build may go online.
- Mac beta: `/Applications/Subject Mastery.app` 0.2.0. The previous 0.1.0 app is archived in the build workspace.
- GitHub release: https://github.com/danielalanbates/subject-mastery/releases/tag/v0.2.0, with `subject-mastery-v0.2.0-web.zip` and `SHA256SUMS.txt`.

Every lesson is AI-assisted educational content. Expert AI review is not the same as review by credentialed subject experts, and finite tests cannot prove the absence of all defects.
