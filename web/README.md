# Subject Mastery: web player

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved. · help@batesai.org · https://batesai.org

A static web app with no build step: plain HTML, CSS and vanilla ES modules. No framework,
bundler or CDN. It plays and tracks the subject paths described in `../docs/CONTRACT.md`
(v1, v2 and the v3 search index). It runs live at `https://batesai.org/subjectmastery/` and at `/` under any local
static server, because every asset and data URL is relative. The only absolute URLs are
the site APIs (`/api/subjectmastery/*`, `/api/auth/*`).

## Structure

```
web/
  index.html            shell + SEO/social meta; inline guard adds the trailing slash (/subjectmastery -> /subjectmastery/)
  manifest.webmanifest  install metadata; start_url and scope are "./" so it works under /subjectmastery/
  favicon.svg, icons/   mark, 192/512 PNGs (lock-screen artwork, apple-touch-icon), og-image.png (1200x630 social card)
  css/app.css           all styles; colour tokens on :root, dark mode via prefers-color-scheme
  js/
    app.js              shell: stores, sync, API-probe rule, header/tab bar + header search, "/" shortcut, sticky knowledge bar, footer, toasts, router, plan runs
    router.js           hash routes -> {name, …} (pure)
    data.js             fetch + cache of data/catalog.json, data/subjects/<id>.json, data/lessons/<key>.json, data/search.json (with fallback)
    search.js           library search: normalise, match, rank, group, highlight; index validation and the in-browser index builder (pure)
    tree.js             nested topic tree: index, knowledge %, resume point, next/prev (pure)
    progress.js         progress model, merge rules, localStorage store, account sync (pure core + factories)
    docsync.js          profile / study-plan documents: local store + whole-document LWW sync
    profile.js          profile document rules (pure)
    plan.js             study plan list operations + run resolution (pure)
    iq.js               "Estimated IQ" formula (pure, CONTRACT v2)
    markdown.js         tiny safe markdown renderer + text for speech (pure)
    player.js           audio engine (<audio>) and speech engine (speechSynthesis), same interface
    dnd.js              pointer-event drag and drop (mouse, pen, touch) for the plan editor
    image.js            client-side avatar resize to <= 64 KB
    credits.js          lesson "voice" id -> narration credit (voice, dataset, licence); unknown ids fall back to the id
    dom.js, icons.js, components.js   small helpers, inline SVG icon set, shared UI pieces
    screens/            catalog, topic (subject path), lesson (player), plan-tab, profile-page, account, about, search, notfound
  tests/
    *.test.mjs          unit tests: `node --test 'web/tests/*.test.mjs'`
    make_fixture.py     builds a small contract-shaped fixture site (+ ffmpeg tone MP3s)
    e2e_playwright.py   headless Chromium end-to-end run against the fixture, with screenshots
    e2e_search.py       headless search check on the fixture (1280 + 390/360 + dark, keyboard, no results, HTML characters, fallback, slow index, long links)
    e2e_goal.py         docs/GOAL.md conformance checks against a real build (or the live site with --base-url)
    make_icons.py, make_og_image.py   re-render icons/*.png with headless Chromium
```

Deploy copies only `index.html`, `favicon.svg`, `icons/`, `css/` and `js/`, plus the pipeline's
`data/` and `audio/`. Do not publish `tests/` or this README.

## Routes

| Hash | Screen |
|---|---|
| `#/` | Catalog: available subjects (knowledge %, Start/Continue), "Continue where you left off", Study Plan shortcut, planned subjects grouped by category |
| `#/s/<topicKey>` | Subject or topic path. `topicKey` is `biology` or `biology/m03-genetics/...`. Shows pages, sub-topics, status icons, per-topic bars, "Already know this", "Add to Study Plan" |
| `#/l/<lessonKey>` | Lesson player. `lessonKey` is `subject/.../lesson` (3 to 8 segments) |
| `#/plan` | Study Plan tab: Play, current block highlighted, Skip |
| `#/profile` | Profile with Estimated IQ, featured subjects, and the drag-and-drop plan editor |
| `#/account` | Google sign-in/out, sync status, preferences, export, reset |
| `#/about` | What Subject Mastery is and is not, how lessons are made, privacy, credits (narration voices from the lessons' `voice` field), copyright. `#/about?credits` scrolls to the credits |
| `#/search?q=<text>` | Library search (CONTRACT v3): live results grouped by subject; each page shows its status, minutes and breadcrumb, each topic its page count and % known. `q` is URL-encoded, at most 200 characters |

Every id is checked against the contract regexes before anything is fetched.

## Search

`data/search.json` (CONTRACT v3, written by `pipeline/build.py`) lists every available subject,
topic and written page with its title, summary, breadcrumb and minutes, but no lesson text:
about 130 KB (28 KB gzipped) for 316 pages. If a host has no such file, `data.js` builds the
same list in the browser from the subject files, and the e2e check confirms both lists are
identical.

- **Where.** A field in the header from 1024 px (a search icon linking to `#/search` below
  that), a "Find a page or topic" field on the catalog, and `/` from any screen when you are
  not typing. Typing in the header or catalog field opens `#/search` after 200 ms (Enter opens
  it at once), and the search screen continues from what you typed. Focusing either field
  preloads the index, and the hand-over waits for it, so no key is lost even on a slow
  connection. On `#/search` the header field is
  hidden but keeps its space.
- **Matching** (`search.js`). Case, diacritics and punctuation are normalised, `&` counts as
  "and", apostrophes are dropped (`newton’s` = `newtons`), and common plurals fold (`cells` =
  `cell`). Every query word must match the start of a word in the entry's title, summary or
  breadcrumb, or the start of several words run together (`postexilic` finds `Post-Exilic`).
  Small words (`the`, `of`, …) are ignored unless the query has nothing else, and a one-letter
  word only matches titles.
- **Ranking.** An exact title comes first, ignoring small words and plurals. After that the
  order is: more query words in the title, more in the summary, more whole-word matches,
  titles that start with the query, subjects before topics before pages, and finally path
  order. A page that matches only through its breadcrumb (it sits inside a matching topic)
  ranks last. The best 50 are shown, and the full count is announced.
- **Screen.** Live results (150 ms debounce) are grouped by subject in the order of each
  group's best result. A page shows Not started / In progress / Completed / Already known
  from local progress; a topic or subject shows its page count and % known. Matched words
  are wrapped in `<mark>`. Every string is a text node, never HTML. The URL follows the query
  through `history.replaceState`, so Back from a result returns to the same query with focus
  on the result you opened.
- **Keyboard and screen readers.** The field has a visible label. `↓` moves into the
  results, `↑`/`↓` move between them, Enter in the field jumps to the first result, `Esc`
  returns to the field or clears it. The count line is a polite `role="status"` region.

## Run locally

```sh
# 1. a fixture site (or the pipeline's real dist/) under ~/Downloads, never inside Google Drive
python3 web/tests/make_fixture.py ~/Downloads/subject-mastery-build/fixture-dist
# 2. serve it
python3 -m http.server 8765 --bind 127.0.0.1 --directory ~/Downloads/subject-mastery-build/fixture-dist
# open http://127.0.0.1:8765/
```

`make_fixture.py` copies `web/icons/`. On a case-insensitive checkout the `.gitignore` rule `Icon?`
also ignores `icons/`, so a fresh clone may not have it. Recreate the PNGs with
`python3 web/tests/make_icons.py web/icons` (needs Playwright's Chromium).

The API is absent locally, and the player knows it: on a loopback host (`127.0.0.1`,
`localhost`, `*.local`) and on non-http pages it never calls `/api/subjectmastery/me`, so the
console stays clean and the app runs local-only. Progress, profile and plan still work and
are kept in this browser. To test sign-in against `wrangler pages dev` on 127.0.0.1, open the
app once with `?api=on` (stored in `localStorage sm.api.v1`; `?api=off` and `?api=auto` also
work). On a real host the probe runs, and anything except a 200 JSON answer with a boolean
`signedIn` (a 404, an HTML fallback page, `{}`, broken JSON, a network error) also means
local-only, silently.

**Any host must honour HTTP Range requests for `audio/*.mp3`.** Seeking, "resume at 2:11" and
the mini-player scrubber all need byte ranges. Cloudflare Pages and the .app's server do;
`python3 -m http.server` does not (seeks silently fail there). The test servers in
`e2e_goal.py` add Range support.

Tests:

```sh
node --test 'web/tests/*.test.mjs'                      # unit tests (merge rules, markdown, tree, IQ, plan, router, profile, doc sync, search)
PLAYWRIGHT_BROWSERS_PATH=~/Downloads/subject-mastery-build/pw-browsers \
  python3 web/tests/e2e_playwright.py ~/Downloads/subject-mastery-build/fixture-dist ~/Downloads/subject-mastery-build/screens
PLAYWRIGHT_BROWSERS_PATH=~/Downloads/subject-mastery-build/pw-browsers \
  python3 web/tests/e2e_search.py ~/Downloads/subject-mastery-build/fixture-dist ~/Downloads/subject-mastery-build/screens-search
```

GOAL conformance against a real build (serves the folder itself, with Range support; about
13 minutes for both viewports; never writes to an account because it answers every
`/api/*` call itself):

```sh
PLAYWRIGHT_BROWSERS_PATH=~/Downloads/subject-mastery-build/pw-browsers \
  python3 web/tests/e2e_goal.py --dist ~/Downloads/subject-mastery-build/dist-review \
                                --shots ~/Downloads/subject-mastery-build/screens-review
# later, live:  python3 web/tests/e2e_goal.py --base-url https://batesai.org/subjectmastery/
# one group:    --only plan   (kbar, rise, known, autoplay, topics, resume, plan, profile, iq, content, about, a11y, api)
```

The e2e run needs Python Playwright plus a Chromium. The one used here was installed with
`PLAYWRIGHT_BROWSERS_PATH=… python3 -m playwright install --only-shell chromium`. Under
`python3 -m http.server` itself, a page load sometimes gets `ERR_CONNECTION_RESET` on module
files because its listen backlog is 5. The e2e script serves with a larger queue. See
`docs/web-player-notes.md`.

## How progress and sync work

**Local first.** Every change goes to `localStorage` straight away:

| Key | Contents |
|---|---|
| `sm.progress.v1` | `{ "<lessonKey>": {status, position, updatedAt} }`. Status is `in_progress`, `completed` or `known`; a missing key means not started |
| `sm.prefs.v1` | `{ mode: "audio"|"text"|"both", rate, autoplayNext }`. Defaults: both, 1×, autoplay on |
| `sm.profile.v1`, `sm.plan.v1` | CONTRACT v2 documents |
| `sm.owner.v1` | Extra key (not in the contract): a short FNV-1a hash of the email of the last account this device synced with |
| `sessionStorage sm.planrun.v1` | The Study Plan run in progress (block index, lesson assigned per block) |

**When each status is set.** Opening a page in Text or Both mode, or starting audio, sets
`in_progress`. While audio plays, the position is saved every 5 s and on pause or close.
When the audio ends, the page becomes `completed`, and with autoplay on the next page
starts. In Text mode, reaching the end of the text and pressing Next or Mark complete sets
`completed`. "Already Known" at the top, "Mark as known" under the text, the `K` key, and
"Already know this topic" all set `known` and advance. Both statuses count as knowledge.

**Merge rule (`progress.js`).** Last write wins on `updatedAt`, per key. One exception: a
newer `in_progress` record never downgrades a `completed` or `known` one, so a stale device's
position save cannot undo a completion. The done status is kept, and the newer
position and time come along with it. Ties break by status rank (completed > known >
in_progress), then by the larger position. The merge is commutative and idempotent, and
the unit tests check both properties.

**Signed in.** On load the app calls `GET /api/subjectmastery/me`:

- A 404, an HTML page or a network error means **local-only**, and the app says nothing.
- `{signedIn:false}` shows "Sign in". The sign-in link is
  `/api/auth/oauth/google?return_to=<this app's path>`, which in production is exactly
  `/api/auth/oauth/google?return_to=/subjectmastery/`.
- `{signedIn:true}`: the app sends `GET /progress` and merges the server map into the local
  one. It then PUTs every key the server is missing or holds an older copy of, at most 500
  items per PUT, and merges the server's reply back in. If `sm.owner.v1` names a
  *different* account, this device's progress is not merged into the new account; the
  account's own progress replaces it on this device.
- After that, local changes are queued per key and PUT 2 s after the last change. A
  failure (offline, 5xx) keeps the queue and retries on the next change, on the `online`
  event, and on a backoff timer (15 s doubling to 5 min). A 401 drops to signed-out and
  keeps all local data. Closing the page sends the queue with `fetch(…, {keepalive:true})`.
- **Undo.** The contract has no "not started" status that could be sent to undo a change.
  So an undoable change (Already known, Already know this topic, Mark complete) holds the
  sync queue for the 10 s undo window. Undo restores the previous records, including back
  to "not started", before the server ever sees the change. When the toast closes or times
  out, the change is sent.
- Profile and plan sync as whole documents, last write wins on `updatedAt` (`docsync.js`).
- **Reset my progress** sends `DELETE /progress` first and then clears this device. If the
  server call fails, nothing is cleared. **Sign out** sends the queue, calls
  `POST /api/auth/logout`, and reloads the page. You can tick a box to also clear this
  device.
- `?signed_in=1` after the Google round trip is removed from the URL. The route you were on
  when you clicked Sign in is restored from sessionStorage, and a toast confirms sign-in.

## Player details

- **Knowledge bar.** One compact line per bar, sticky under the header on subject, topic and
  lesson screens. The label is the contract's integer % (`floor`); the fill uses the exact
  ratio, so the bar visibly moves after one page even in a subject with more than 100 pages.
  The track carries `data-done`, `data-total` and `data-exact` for tests and screen readers
  get "23%, 7 of 29 pages".
- **Mini-player.** When the player card scrolls out of view in Audio or Both mode, a slim bar
  docks at the bottom (above the phone tab bar) with play/pause, progress, time and a
  "Known" skip. Its skip button is named "Mark known and skip to the next page", so it never
  collides with the "Already Known" button in tests or for screen readers.
- **Voice credit.** A recorded page shows "Narrated by Piper TTS · Lessac voice (US English) ·
  Credits" under the player, from the lesson's `voice` field (`js/credits.js`).

- **Audio engine.** It uses the lesson MP3 at `lesson.audio`, a relative path that is
  validated first. Controls: play/pause, back and forward 15 s, restart, speed
  (0.75× to 2×, remembered), scrubber and times. Media Session supports lock-screen play,
  pause, seek and next/previous.
- **Speech fallback.** If there is no recording, or the MP3 fails to load,
  `speechSynthesis` reads the text sentence by sentence at volume 0.7, and the page says so.
  Its times are estimates at 150 words per minute and are shown with a "≈" sign. A per-chunk
  watchdog (2.5 × the chunk's estimated length + 6 s) turns a voice that starts but never
  finishes (no installed voices; headless Chromium) into a visible "press play to try again,
  or switch to Text" note instead of a player that looks busy forever. The controls stay.
- **Keyboard.** `Space` plays or pauses, `←` and `→` seek 15 s, and `K` marks the page known
  and moves to the next. Keys are ignored while you type in a field.
- **Pages without text** (`hasText:false`) show "coming soon" and are skipped by next/prev,
  by resume points and by plan blocks. They are also left out of the knowledge denominator.
- **Markdown.** All source text is HTML-escaped before the few allowed tags are added
  (headings, p, strong/em, code, ul/ol/li, blockquote, hr). Links render as their text only.

## Accessibility and layout

The app has real buttons and links, visible focus rings and a skip link. In the plan editor,
keyboard focus returns to the same button after every change (or to the row's drag handle
when that button became disabled), and to the first subject chip after "Clear". Status icons have
text alternatives, and the plan editor has an `aria-live` region. Mode and speed have
labels, and every drag action also has a keyboard button. The layout is mobile first:
16 px gutters, a bottom tab bar under 760 px, and no horizontal scroll at 360 px (the e2e
run checks this on every route). Light and dark themes come from `prefers-color-scheme`,
and motion is reduced when `prefers-reduced-motion` is set. `e2e_goal.py` measures WCAG AA
text contrast on eight screens in both themes, the focus ring on every Tab stop to
"Already Known", reduced motion, and 360 px overflow.

Size (2026-10-27, with search): about 244 KB of JS (71 KB gzipped) in 28 modules and 60 KB of CSS
(12 KB gzipped), unminified, no dependencies and no build step. Only
the system font stack; no CDN, font service, analytics or tracker.
