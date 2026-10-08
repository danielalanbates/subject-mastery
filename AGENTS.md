# Subject Mastery contributor instructions

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
Contact: help@batesai.org · https://batesai.org

- Read docs/GOAL.md, docs/CONTRACT.md and docs/HANDOFF.md before changing behavior.
- Use the canonical Google Drive Code checkout for source. Build, logs, browser artifacts and audio belong in Downloads. Set SM_REPO, SM_CONTENT_DIR and SM_DIST_DIR when using a local mirror. Personal paths belong only in gitignored docs/LOCAL_PATHS.md.
- Never change published lesson IDs; progress depends on them. Preserve both skip buttons, exact fractional knowledge-bar movement and ordered Study Plan playback.
- New subjects remain planned until their lessons are complete, validated and reviewed. Record corrections in provenance. Preserve original text and its sources; never copy textbook prose.
- Use free model tiers only. Do not send secrets or profile data to models. Keys come from environment variables or an ignored SM_SECRETS_FILE.
- Keep sound modest. Use headless browser tests; do not take over the GUI, close other apps, run duplicate instances, or introduce persistent test/relaunch loops.
- Run player unit tests, relevant browser checks and tools/privacy_scan.py before publishing. Duration must be at most 600 seconds at 1x for each recording. Check actual audio, not only metadata, when changing narration.
- Keep /Applications/Subject Mastery.app current by rebuilding it with a verified bundled site. Never replace a running app.
- Preserve the PolyForm Noncommercial license and commercial rider. Respect third-party notices; no credentials, personal account paths, logs or learner exports in git.
- Public releases follow successful validation; report unverified behavior plainly. Changes to the separate website repo use a PR and its existing deployment workflow.
