# Subject Mastery — shared contract (v1)

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved. · help@batesai.org · https://batesai.org

Every part of the system (content pipeline, web player, server API, .app) agrees on
this file. Change it here first, then in code.

## Product

Standardized subject paths you can **play as audio or read as text**, with progress
tracking and an easy **"Already know this"** skip. Not a tutor, not accredited.
"Mastery" = command of a field's knowledge (explain + use it), not a degree.

Live URL: `https://batesai.org/subjectmastery/` (no own domain yet — Daniel approves any purchase).

## Locations

| What | Where |
|---|---|
| Source of truth (git, GitHub `danielalanbates/subject-mastery`) | `$SM_REPO`, the repo checkout (Daniel's is in Google Drive `My Drive/Code/subject-mastery`; exact path in the gitignored `docs/LOCAL_PATHS.md`) |
| Build / scratch / audio masters (never build in Drive) | `~/Downloads/subject-mastery-build/` |
| Generated audio (gitignored, regenerable) | `~/Downloads/subject-mastery-build/audio/<subject>/<module>/<lesson>.mp3` |
| Built static site (what gets copied to the website) | `~/Downloads/subject-mastery-build/dist/` → website `public/subjectmastery/` |

## IDs

- `subjectId`, `moduleId`, `lessonId` slugs: `^[a-z0-9]+(-[a-z0-9]+)*$`, ≤ 48 chars.
- Module ids are ordered with a numeric prefix: `m01-foundations`, `m02-…`.
- Lesson ids likewise: `l01-what-is-economics`.
- **Global lesson key** (used for progress everywhere): `"<subjectId>/<moduleId>/<lessonId>"`,
  regex `^[a-z0-9-]{1,48}/[a-z0-9-]{1,48}/[a-z0-9-]{1,48}$`.
- IDs are permanent once published (progress is keyed on them). Retitle freely; never re-slug.

## Content source files (`content/`)

```
content/
  catalog.json                      # every subject, available or planned
  <subjectId>/
    subject.json                    # the ordered path
    lessons/<moduleId>/<lessonId>.md   # the lesson script (same words as the audio)
```

`content/catalog.json`
```json
{ "version": 1,
  "subjects": [
    { "id": "economics", "title": "Economics", "tagline": "…", "category": "Social Sciences",
      "status": "available" }          // or "planned" (shown as coming soon, no path yet)
  ] }
```

`content/<subjectId>/subject.json`
```json
{ "id": "economics", "title": "Economics", "tagline": "one line", "description": "2–3 sentences",
  "category": "Social Sciences", "color": "#1f6feb",
  "modules": [
    { "id": "m01-foundations", "title": "Foundations", "summary": "one sentence",
      "lessons": [ { "id": "l01-scarcity-and-choice", "title": "Scarcity and Choice", "summary": "one sentence" } ] }
  ] }
```

Lesson markdown (`lessons/<moduleId>/<lessonId>.md`): starts with `# <Lesson title>`, then
600–1000 words of prose **written for the ear** (no tables, no code blocks, no images,
no "as shown below", spell out symbols). Optional final section `## Key ideas` with 3–6
bullets. Bible quotations only from public-domain translations (KJV, WEB, ASV) and say which.

## Built static data (`dist/data/`) — what the web player reads

`dist/data/catalog.json` — content/catalog.json enriched with, per available subject:
`moduleCount`, `lessonCount`, `minutes` (total, integer), `color`, `description`.

`dist/data/subjects/<subjectId>.json` — subject.json enriched per lesson with:
`key` (global lesson key), `minutes` (integer, ≥1), `hasAudio` (bool), `hasText` (bool).

`dist/data/lessons/<subjectId>/<moduleId>/<lessonId>.json`
```json
{ "key": "economics/m01-foundations/l01-scarcity-and-choice",
  "title": "Scarcity and Choice", "markdown": "…full lesson markdown…",
  "words": 812, "minutes": 6,
  "audio": "audio/economics/m01-foundations/l01-scarcity-and-choice.mp3",   // relative to the app root, or null
  "durationSec": 371, "voice": "piper:en_US-ryan-high" }
```

`dist/data/search.json` — **v3 addition (2026-10-27): the library search index.** Written by
`pipeline/build.py` for **available** subjects only, so the player can search the whole library
without loading every subject file. One compact entry per subject, per topic (module) node and
per lesson **with text**, in path order: catalog order, then each subject depth first (a node,
its own lessons, then its sub-topics, the same order as `web/js/tree.js`). No lesson body text.
Compact JSON (no whitespace, UTF-8); the same content always gives the same bytes.
```json
{ "version": 1,
  "entries": [
    { "key": "economics", "kind": "subject", "title": "Economics", "summary": "<tagline>", "breadcrumb": [] },
    { "key": "economics/m01-foundations", "kind": "topic", "title": "Foundations", "summary": "…",
      "breadcrumb": ["Economics"] },
    { "key": "economics/m01-foundations/l01-scarcity-and-choice", "kind": "lesson", "title": "Scarcity and Choice",
      "summary": "…", "breadcrumb": ["Economics", "Foundations"], "minutes": 6 } ] }
```
- `key`: subject id, topic key, or global lesson key (v2 regexes). `kind`: `subject` | `topic` | `lesson`.
- `summary`: the subject's `tagline`, the module's `summary`, or the lesson's `summary` (`""` if none).
- `breadcrumb`: ancestor titles, subject first (`[]` for a subject). `minutes`: lessons only, as in the subject file.
- Every topic node is listed, even one with no written lessons yet; lessons without text are not.
- Readers validate entries and drop any they do not understand. A host without `search.json` (older
  builds) still works: the player builds the identical list from `data/subjects/<id>.json`
  (`entriesFromSubjects()` in `web/js/search.js`), and fills in any available subject the file lacks.
- Route: `#/search?q=<text>` (URL-encoded, at most 200 characters).

All URLs in the player are **relative** (the app lives at `/subjectmastery/` live and at
`/` under a local static server). The only absolute paths are the site APIs below.

## Audio

Piper TTS (local, free): engine `~/Library/Application Support/VanaVoice/engine/bin/piper`,
voices in `…/VanaVoice/engine/voices/` (read-only — do not modify VanaVoice).
Encode: `ffmpeg … -ac 1 -ar 22050 -b:a 40k` MP3. Modest loudness (`loudnorm I=-19`).

## Progress model

Status per lesson key: `in_progress` | `completed` | `known` (skipped as already known).
Absent = not started. Each record: `{ status, position (seconds, float), updatedAt (ms epoch) }`.

- **Always** stored in `localStorage` key `sm.progress.v1` = `{ "<key>": {status, position, updatedAt} }`.
- When signed in, synced with the server; **last-write-wins on `updatedAt`** per key, except
  a `completed`/`known` record is never downgraded to `in_progress` by a merely-newer position save.
- Prefs in `localStorage` `sm.prefs.v1` = `{ mode: "audio"|"text"|"both", rate: 1, autoplayNext: true }`.

## Site API (Cloudflare Pages Functions on batesai.org, D1 binding `DB`)

Auth reuses batesai.org membership: opaque `batesai_session` cookie, `requireUser()` in
`functions/_lib/session.js`.

- Sign in: link to `/api/auth/oauth/google?return_to=/subjectmastery/` — after Google, the
  existing `/membership` callback redirects to `return_to` (validated same-site path) with
  `?signed_in=1`. With no `return_to` the old behaviour is unchanged.
- `GET  /api/subjectmastery/me` → `200 {signedIn:false}` or `{signedIn:true, user:{name, email, avatarUrl}}`.
- `GET  /api/subjectmastery/progress` → `401 {error}` or `200 {progress:{<key>:{status,position,updatedAt}}}`.
- `PUT  /api/subjectmastery/progress` body `{items:[{key,status,position,updatedAt}]}` (≤ 500 items)
  → upsert LWW → `200 {progress:{…full merged map…}}`. Validates key regex, status enum,
  finite position 0–86400, updatedAt ≤ now+5min.
- `DELETE /api/subjectmastery/progress` → wipe this user's progress (reset button).
- Sign out: `POST /api/auth/logout` (existing).

D1 table:
```sql
CREATE TABLE IF NOT EXISTS sm_progress (
  user_id    TEXT    NOT NULL,
  lesson_key TEXT    NOT NULL,
  status     TEXT    NOT NULL CHECK (status IN ('in_progress','completed','known')),
  position   REAL    NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, lesson_key)
);
```
Account deletion must also delete the user's `sm_progress` rows.

---

# v2 additions (2026-10-02 goal — see docs/GOAL.md). v2 wins over v1 where they differ.

## Nested topic tree
- A module may contain `lessons`, nested `modules` (sub-topics), or both, to any depth. v1 flat files are a valid v2 tree.
- A lesson **key** is the subject id followed by the id path down to the lesson: regex
  `^[a-z0-9-]{1,48}(/[a-z0-9-]{1,48}){2,7}$`. Lesson JSON lives at `dist/data/lessons/<key>.json`;
  audio at `audio/<key>.mp3`; markdown at `content/<subjectId>/lessons/<path after subject>.md`.
- Every node (subject or module/topic) has a **topic key** = its id path (`biology`, `biology/m03-genetics`).
  Each node is selectable as a "subject" on its own: it has its own knowledge bar, resume point and play button.
- **Page = lesson.** At most 10 minutes of audio at 1x (≤ 1,500 words); pilot target is 600–1,000 words. Content starts at entry-level college.

## Knowledge
- `knowledge(node)` = (# lessons under node with status `completed` or `known`) ÷ (# lessons under node with `hasText`), shown as an integer % and labelled "<Title> knowledge".
- A sticky bar at the top of every subject/topic/lesson screen shows the bar for the current subject, and for the current topic as a thinner bar when you are inside one. It animates when the value changes.
- Finishing a lesson's audio sets `completed`. **Already Known** at the top of every lesson, and **Mark as known** at the bottom of its text, set `known`. Both count as knowledge, and both advance.
- Autoplay-next defaults to **on**: the player plays page after page continuously.
- Picking a subject or topic opens its first lesson that is neither completed nor known (its resume point), or its first lesson if all are done. You can also start from any lesson.

## Estimated IQ (playful score, labelled as such, never presented as a clinical IQ)
```
T = total minutes of lessons completed or known (lesson.minutes)
B = number of top-level subjects with knowledge >= 25%
IQ = 100 + floor( 40 * (1 - exp(-T / 3000)) + 10 * (1 - exp(-B / 5)) )      // 100 = high-school-graduate baseline, max < 150
```
Implemented once as a pure function in `web/js/iq.js`, with unit tests.

## Profile (local `sm.profile.v1`; server `sm_profile`)
`{ displayName, bio (≤ 280), avatar: { kind: "google"|"initials"|"emoji"|"image", value }, accent (hex), banner (preset id or hex gradient),
   featuredSubjects: [topicKey…] (≤ 6), showIq: true, updatedAt }`.
An `image` avatar is a client-resized data URL of at most 64 KB. The whole JSON is at most 96 KB.

## Study Plan (local `sm.plan.v1`; server `sm_plan`)
`{ blocks: [ { id: "<random>", topicKey: "biology" | "biology/m03-genetics" } ], updatedAt }`, at most 200 blocks.
- **One block = one lesson**: the next lesson of that topic that is neither completed nor known *at play time*, skipping lessons already queued earlier in the same run.
- The profile page edits the plan by drag and drop from a subject palette into an ordered list. Blocks can be reordered, removed and duplicated. Consecutive blocks of the same subject are shown grouped, for example "Biology ×3". Pointer and touch drag both work, plus keyboard buttons for accessibility.
- The **Study Plan tab** (`#/plan`) has Play, which plays the blocks in order with continuous autoplay. It shows the current block highlighted and lets you skip a block.

## API additions (same auth as v1)
- `GET /api/subjectmastery/profile` → `{profile|null}`; `PUT` body `{profile}` → LWW on `updatedAt` → `{profile}`.
- `GET /api/subjectmastery/plan` → `{plan|null}`; `PUT` body `{plan}` → LWW → `{plan}`.
- Progress keys accept the v2 key regex.
```sql
CREATE TABLE IF NOT EXISTS sm_profile (user_id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sm_plan    (user_id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
```
Account deletion also clears `sm_profile` and `sm_plan`.

## Routes
`#/` catalog · `#/s/<topicKey>` subject/topic tree · `#/l/<lessonKey>` player · `#/plan` Study Plan · `#/profile` profile + plan editor · `#/account` sign-in and data. v3 adds `#/search?q=<text>` library search (see `data/search.json`).
