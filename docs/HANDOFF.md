# Successor handoff — Subject Mastery, 2026-10-08

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
help@batesai.org · https://batesai.org

Read AGENTS.md, GOAL.md and CONTRACT.md first. Published lesson IDs are permanent. This handoff supersedes the dated October 2 record under archive/2026-10-02.

## Current state

| Part | State |
|---|---|
| Public website | https://batesai.org/subjectmastery/ — 316 pages in Biology, Economics, World History, Biblical Studies & Theology, Mathematics |
| Recordings | 250 John-voice MP3s, about 30 hours, below ten minutes per page; Mathematics currently uses device speech |
| Source | Public `danielalanbates/subject-mastery`; canonical checkout in Google Drive Code; exact local paths only in ignored LOCAL_PATHS.md |
| Content | All 639 lessons written across ten subjects. Five subjects are available; Chemistry, Psychology, Computer Science, US History and Church History are planned drafts |
| Website integration | Separate private `danielalanbates/website` repository; open PR #12, head branch subjectmastery. Do not merge unrelated homepage changes just to update this curriculum |
| Mac beta | /Applications/Subject Mastery.app, self-contained verified site and recordings bundled in Resources/Site; never replaces a running copy |
| License | PolyForm NC with 10% commercial rider for main code; GPL-3.0-or-later for the small Piper adapter; original ISC/MIT icon notices included |
| Verification | See VALIDATION.md. Player/sync behavior, every-page skip, ordered audio-to-speech plan, private local API, mobile layout and accessibility have passing evidence |

## Architecture and invariants

- Player: vanilla ES modules, static JSON data, system fonts; no runtime dependency install or bundler. Hash routes work in a subfolder and the beta's local origin.
- Progress: localStorage first; server syncing after Google sign-in. Timestamp merge never downgrades a known/completed lesson on a position save. Equal timestamps prefer completed over known over in_progress. Changes remain undoable before sync.
- Subject tree: arbitrary nesting within contract depth limits. Every available page contributes one unit to its subject/topic denominator; known and completed both count. Use exact fractional fill even when integer labels round down.
- Study Plan: blocks reference stable topic keys. Each block chooses one next unfinished page at play time, excluding pages queued earlier in that run. A block for a whole subject, topic or subtopic uses the same resolver.
- Profile: private whole-document sync for customization and plan. Estimated IQ is explicitly a playful learning score starting at 100; it cannot establish a measured IQ.
- Narration: John is selected by default; models live outside git. pipeline/tts.py uses one Piper subprocess, ffmpeg normalization and text/voice hashes. A build excludes stale audio and rejects recordings over 600 seconds.
- Mac: AppKit/WKWebView with loopback server, HTTP Range, stable preferred port and persistent website store. Bundled site is preferred; an unbundled developer binary falls back to Downloads builds. Google login opens the browser only on a click.

## Continue work

| Task | Steps |
|---|---|
| Player change | Edit web/, run Node tests and relevant headless browser checks; build, stage/deploy, refresh beta and public release when verified |
| New content | Keep catalog status planned until complete and reviewed. Record per-page review provenance. Run contract/quotation checks, build and update content status |
| Mathematics recordings | Improve pronunciation normalization first, then render the 66 existing pages with John. Check every actual duration; validate recorded-to-recorded plans before publishing |
| Remaining five drafts | Read samples and run stronger/expert review; check numeric examples and quotations. Then render/validate audio and activate one subject at a time |
| Build in Downloads | Set SM_REPO or explicit SM_CONTENT_DIR/SM_WEB_DIR/SM_DIST_DIR; do not depend on private machine paths embedded in source |
| Sync to Drive | Copy finished tracked source back to the canonical checkout. Drive reads can stall; use the verified Downloads mirror for builds and publication |
| Deploy web content | Follow site-integration/README.md in the separate website checkout. Preserve production functions and all non-Subject-Mastery files; existing D1 migrations need no rerun for static updates |
| Update Mac beta | SM_APP_SITE=<verified-dist> bash app/build_app.sh. It bundles the site, checks signing and archives the previous app |
| Release | Privacy scan, passing checks, tag source, attach ready-built web ZIP and checksum. Do not represent unverified behavior as tested |

Secrets come from environment variables or ignored SM_SECRETS_FILE. Only free model tiers are allowed. This run used Gemini 3.1 Flash Lite for the extra 66-page Mathematics review; temporary 503s prevented larger free Gemini models. No paid provider was used. Review suggestions must be checked: several suggested arithmetic changes were wrong and were rejected (MATH_REVIEW.md).

## Further paths and tradeoffs

| Path | Reason / remaining work |
|---|---|
| Knowledge checks + spaced repetition | Completion currently measures exposure/self-reported knowledge. Recall questions can provide better evidence of retention |
| Advanced curricula | Add deeper paths while preserving original IDs and linking prerequisites |
| Public profile pages | Require a separate explicit privacy/consent model; existing profiles are private/local |
| Offline PWA | Add cache/version strategy and storage limits for a roughly 500 MB audio library; the self-contained Mac beta already works offline with installed speech voices |
| Own domain | subjectmastery.com/.org remains a future domain decision; no purchase or custom-domain change was made |
| App signing | Developer ID/notarization and Intel universal build are future distribution options; local beta is ad-hoc signed |
| Portable TTS | Set SM_PIPER_PYTHON and SM_VOICES_DIR instead of relying on the existing VanaVoice installation |
| Hosting change | Relative paths permit another static host; account sync requires deploying the corresponding session/API backend |

Retired code belongs in archive/ with why it failed. Keep keys, personal information, audio masters, logs, generated builds and learner data out of public git. The public license is source available; changing to OSI open source would require an explicit license decision because the requested commercial restrictions conflict with that definition.
