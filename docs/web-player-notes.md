# Web player: decisions, contract gaps, dead ends (2026-10-02)

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved. · help@batesai.org · https://batesai.org

These notes are for whoever works on `web/` next. Read `web/README.md` first for how the
player works.

## Scope note

This builder started from the v1 task. `docs/CONTRACT.md` gained the "v2 additions" while
the work was under way, and v2 wins where the two differ. So the player implements v2:

- the nested topic tree, with keys of 3 to 8 segments and `#/s/<topicKey>` and
  `#/l/<lessonKey>` routes;
- sticky subject and topic knowledge bars, with "Already Known" at the top of each page and
  "Mark as known" under its text;
- autoplay on by default, and resume points;
- the Study Plan (editor plus tab);
- the profile with Estimated IQ.

v1 data is a valid v2 tree, so v1 fixtures and keys keep working.

## Decisions the contract left open

1. **Order inside a module that has both lessons and sub-modules.** Its own lessons come
   first, then its sub-modules, depth first. This applies to tree.js `order`, next/prev and
   resume points.
2. **Knowledge numerator.** Only lessons with `hasText` count, so the value never goes past
   100%. "Already know this topic" also marks only lessons that have text. A lesson that
   gains text later starts as not known, which is correct: it is new content.
3. **"Picking a subject" opens its resume page.** On the catalog, Start/Continue goes
   straight to the resume page and starts playing. "All pages" and the title open the path
   instead, so you can still start anywhere. The catalog's "Continue where you left off"
   banner shows the most recently touched in-progress page, wherever it is.
4. **Autoplay after "Already known".** The next page plays only if audio was already
   playing, or if this page itself was auto-started. Someone skimming in Text mode is
   never surprised by audio.
5. **Estimated IQ cap.** In floating point, both `exp()` terms underflow to 0 for absurd
   inputs, so the formula returns exactly 150. That breaks the contract's "max < 150", so
   the result is capped at 149. `web/js/iq.js` is the only implementation; other clients
   should port it as is.
6. **Profile fields.** `displayName` is capped at 60 characters. A custom banner is two hex
   colours joined by a comma (`"#1f6feb,#7c3aed"`). Avatar `value` is `''` for google (the
   photo URL comes from `/me` at render time), up to 3 letters for initials, one short emoji,
   or a `data:image/(png|jpeg|webp);base64,…` URL of at most 64 KB. A profile nobody has
   edited (`updatedAt` 0) is re-derived from the signed-in user, so new Google users start
   with their name and photo. The profile is private for now: there is no public profile URL
   or API.
7. **Study Plan runs** live in `sessionStorage sm.planrun.v1`, so a reload resumes the run.
   Editing the plan ends the run (`planAt` no longer matches the plan's `updatedAt`). A block
   whose topic is fully known is skipped and shown as "nothing left". Plan playback always
   autoplays, whatever the autoplay preference says.
8. **Extra local key `sm.owner.v1`.** It holds an FNV-1a tag of the email last synced from
   this device. If a different Google account signs in on the same browser, the first
   person's progress is not merged into the second account; the device shows the new
   account's own progress instead.

## Contract gaps worth fixing in v3 (not changed here; CONTRACT.md is not mine to edit)

- **There is no way to send "not started".** An undo, or a reset on one device, cannot reach
  the server or other devices. What the player does about it:
  - It holds sync for 10 s during an undo window, so an undone change is never sent.
  - Reset clears the server first.
  - Another device that still holds old local copies can upload them again on its next
    sync. The reset confirmation says this plainly.

  Proposal: accept `status: "not_started"` as a tombstone in PUT, stored with its
  `updatedAt` and treated as "absent" by readers. That makes undo and reset propagate under
  the same last-write-wins rule.
- **The server's merge rule should match `mergeRecord()` exactly.** The rule is: on equal
  `updatedAt`, completed > known > in_progress, then the larger position; a newer
  in_progress keeps the older done status but takes the newer position and time. If the
  server differs, nothing breaks, because the client always adopts the server's reply. It
  may cost one extra PUT per conflicting key.
- **catalog.json has no count of lessons with text.** The catalog therefore loads every
  available subject file to show the knowledge %. That is fine for the four pilot subjects,
  but with hundreds of subjects the pipeline should add `textLessonCount` and `textMinutes`.

## Dead ends and gotchas (all hit during this build)

- **`python3 -m http.server` resets connections.** Its listen backlog is 5. Chromium loads
  about 20 ES modules in parallel, and some requests failed at random with
  `net::ERR_CONNECTION_RESET`. The e2e script uses `ThreadingHTTPServer` with
  `request_queue_size = 128`. Nothing like this happens on Cloudflare Pages.
- **Playwright (sync Python) route handlers only run while Python is inside a Playwright
  call.** A `time.sleep()` polling loop leaves mocked requests unanswered. Wait with
  `page.wait_for_timeout()` instead; see `wait_for()` in `e2e_playwright.py`.
- **Playwright `inner_text()` applies CSS `text-transform`.** "Estimated IQ" came back as
  "ESTIMATED IQ". Use `text_content()` for text assertions.
- **Playwright mouse drags must stay inside the viewport.** Moving to coordinates below the
  fold silently does nothing. Scroll the target into view first.
- **Seeding localStorage while the app page is still syncing loses the seed.** The page
  persists its whole map after the server merge and overwrites the seed. The test seeds
  from `favicon.svg` (same origin, no app code). Real tabs stay consistent through the
  `storage` event (`store.reload()`).
- **Lesson media-session TDZ.** `const ms` was declared below the first `bind()` call,
  which already calls `updateMediaSession()`. Keep `ms` above the engine wiring.
- **Chrome `speechSynthesis`.** Long utterances cut out after about 15 s, and a `speak()`
  issued right after `cancel()` can be dropped. The player speaks one sentence-sized chunk
  at a time (no more than about 220 characters) and waits 80 ms after a `cancel()`. Pause
  is implemented as cancel plus remembering the chunk, because native `pause()` is
  unreliable across browsers.
- **Relative URLs need `/subjectmastery/` with the trailing slash.** At `/subjectmastery`,
  `css/app.css` would resolve to `/css/app.css`. `index.html` has a tiny inline script that
  adds the slash. The site has no CSP that blocks inline scripts as of today; check
  `public/_headers` before adding one.

## Not done / not verified

- No real Google sign-in round trip was run, because nothing may be deployed to
  batesai.org. The signed-in path was verified only against Playwright-mocked
  `/api/subjectmastery/*` and `/api/auth/logout` that follow the contract.
- Media Session on a real phone lock screen, iOS Safari speech (it needs a user gesture
  for the first utterance), and real touch drag-and-drop on a phone have not been tried on
  hardware. Headless Chromium covered mouse drag and the layout at 390 and 360 px.
- There is no offline service worker. The app needs the network for data and audio, and
  progress changes made offline are kept and retried.
- No sticky mini-player while scrolling long text in Both mode; candidate polish.
