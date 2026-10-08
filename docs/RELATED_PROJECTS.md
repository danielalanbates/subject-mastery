# Related projects and prior art

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved. · help@batesai.org · https://batesai.org

Researched 2026-10-02 per Daniel's rule (search GitHub for open-licensed related work
before starting). Stars and last-push dates come from `gh api repos/<owner>/<repo>`,
fetched that day. Licenses were checked against each repo's actual LICENSE file.
Where GitHub reports `NOASSERTION` or `none`, the license text was read directly.
Subject reference texts are in `SOURCES.md`.

Our product license is **PolyForm Noncommercial**, with all rights reserved. Reuse rules:
- **MIT / BSD / Apache-2.0 / Unlicense / CC0 / CC BY:** OK to borrow. Keep the copyright
  notice and license text, and credit in `NOTICE` or the About page.
- **GPL / AGPL:** do not copy code. Their copyleft would force our derived code under the
  GPL, which conflicts with PolyForm NC. Studying ideas is fine.
- **CC BY-SA:** text adaptations must stay BY-SA. Do not paste text; learning facts and
  structure from it is fine.
- **CC BY-NC(-SA/-ND):** our use is noncommercial, but SA forces derived text to be
  BY-NC-SA and ND forbids adaptation. Use only as an alignment reference: chapter order,
  topic coverage, facts. Never paste or paraphrase closely.
- **Custom "personal use only" (roadmap.sh):** do not reuse anything.

## 1. Course and syllabus catalogs

| Repo | License (verified) | Stars | Last push | What it offers us | OK for us? |
|---|---|---|---|---|---|
| [ossu/computer-science](https://github.com/ossu/computer-science) | MIT | 209,689 | 2026-07-14 | The gold standard for a "standardized path" README: ordered stages, prerequisites, time estimates | Yes, for structure ideas. Its links point to third-party courses we don't use. |
| [ossu/math](https://github.com/ossu/math) | MIT | 9,210 | 2026-08-08 | Same pattern for maths | Yes (ideas) |
| [ossu/precollege-math](https://github.com/ossu/precollege-math) | MIT | 322 | 2026-06-01 | Prerequisite path | Yes (ideas) |
| [ossu/data-science](https://github.com/ossu/data-science) | CC BY-SA 4.0 (LICENSE.md) | 22,131 | 2025-05-13 | Path layout | Ideas only. Don't copy text. |
| [ossu/bioinformatics](https://github.com/ossu/bioinformatics) | none (archived) | 7,111 | 2024-04-08 | Bio-adjacent path | No license. Look only. |
| [TheOdinProject/curriculum](https://github.com/TheOdinProject/curriculum) | CC BY-NC-SA 4.0 (license.md) | 13,109 | 2026-10-02 | Lesson-markdown repo layout, which is close to our `content/` tree | Ideas only (SA) |
| [freeCodeCamp/freeCodeCamp](https://github.com/freeCodeCamp/freeCodeCamp) | BSD-3-Clause | 456,632 | 2026-10-02 | Curriculum data plus progress model at scale | Code is allowed but far too heavy. Ideas only. |
| [nilbuild/developer-roadmap](https://github.com/nilbuild/developer-roadmap) (roadmap.sh, formerly kamranahmedse) | Custom "personal use only" | 368,716 | 2026-10-02 | Visual roadmap and "mark as done / skip" UX, the closest UX to our "Already know this" | **No reuse of any kind** |
| [Developer-Y/cs-video-courses](https://github.com/Developer-Y/cs-video-courses) | none | 83,595 | 2026-09-27 | Link list | No license |
| [prakhar1989/awesome-courses](https://github.com/prakhar1989/awesome-courses) | none | 71,539 | 2023-05-04 | Link list | No license |

Finding: OSSU has CS, Math, Data Science and (archived) Bioinformatics paths. It has **no
paths for economics, biology, history or theology**. A GitHub search for "economics
curriculum", "biology curriculum" and "systematic theology" found only repos with 0–1 stars.
Nobody in open source publishes standardized, audio-first paths for these subjects.

## 2. Learning platforms and progress tracking

| Repo | License | Stars | Last push | Notes |
|---|---|---|---|---|
| [learningequality/kolibri](https://github.com/learningequality/kolibri) | MIT | 1,126 | 2026-10-02 | Offline-first learning app with per-learner progress. A heavy Django/Vue stack. Ideas only. |
| [oppia/oppia](https://github.com/oppia/oppia) | Apache-2.0 | 6,839 | 2026-10-02 | Interactive "explorations" with progress. Heavy. Ideas only. |
| [LiaScript/LiaScript](https://github.com/LiaScript/LiaScript) | BSD-3-Clause | 284 | 2026-10-01 | Markdown courses with built-in TTS narration, which is conceptually close. Elm. Ideas only. |
| [openedx/openedx-platform](https://github.com/openedx/openedx-platform) | AGPL-3.0 | 8,197 | 2026-10-02 | Full LMS. Don't copy. |
| [moodle/moodle](https://github.com/moodle/moodle) | GPL-3.0 | 7,454 | 2026-10-01 | Full LMS. Don't copy. |
| [frappe/lms](https://github.com/frappe/lms), [learnhouse/learnhouse](https://github.com/learnhouse/learnhouse), [classroomio/classroomio](https://github.com/classroomio/classroomio), [codelitdev/courselit](https://github.com/codelitdev/courselit) | AGPL-3.0 (all four) | 3,284 / 2,313 / 1,707 / 1,269 | Sep–Oct 2026 | Course builders. Don't copy. |
| [geritol/ossu-progress](https://github.com/geritol/ossu-progress) | MIT | 28 | 2021-06-10 | Tiny static "my OSSU progress" site. Shows people want a progress view on top of a path. |
| [open-spaced-repetition/ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) | MIT | 803 | 2026-10-01 | FSRS scheduler in TypeScript. Only relevant if we later add review quizzes. Not v1. |
| [andymatuschak/orbit](https://github.com/andymatuschak/orbit) | Apache-2.0, except app/backend (AGPL/BUSL) | 1,835 | 2024-10-14 | Spaced repetition built into prose. Ideas only. |
| [ankitects/anki](https://github.com/ankitects/anki) | NOASSERTION in the API (AGPL per its project, not re-read) | 31,713 | 2026-10-02 | Don't copy. |

## 3. Audio players and podcast learning

| Repo | License | Stars | Last push | Notes |
|---|---|---|---|---|
| [sampotts/plyr](https://github.com/sampotts/plyr) | MIT | 30,017 | 2026-09-29 | Polished media player. A plain `<audio>` plus our own controls is lighter. Not needed. |
| [katspaugh/wavesurfer.js](https://github.com/katspaugh/wavesurfer.js) | BSD-3-Clause | 10,425 | 2026-10-02 | Waveform UI. Not needed. |
| [jessuni/shikwasa](https://github.com/jessuni/shikwasa) | MIT | 505 | 2024-04-13 | Small podcast web player with chapters and speed control. The best reference for player UX if we want one. |
| [amugofjava/anytime_podcast_player](https://github.com/amugofjava/anytime_podcast_player) | BSD-3-Clause | 623 | 2026-04-22 | Flutter podcast app. Mobile ideas. |
| [podlove/podlove-web-player](https://github.com/podlove/podlove-web-player) | NOASSERTION (archived) | 351 | 2021-05-24 | Archived. Skip. |
| [madeofpendletonwool/PinePods](https://github.com/madeofpendletonwool/PinePods), [akhilrex/podgrab](https://github.com/akhilrex/podgrab) | GPL-3.0 | 1,001 / 1,988 | 2026-10-02 | Don't copy. |

## 4. TTS / course-to-audio generators

| Repo | License | Stars | Last push | Notes |
|---|---|---|---|---|
| [rhasspy/piper](https://github.com/rhasspy/piper) | MIT (**archived**) | 11,296 | 2025-08-26 | The engine we use (via VanaVoice). It is archived. |
| [OHF-Voice/piper1-gpl](https://github.com/OHF-Voice/piper1-gpl) | **GPL-3.0** | 5,744 | 2026-09-28 | Piper's maintained successor is GPL. Calling the binary as a separate process is fine. Do **not** vendor or link its code into our source. |
| [aedocw/epub2tts](https://github.com/aedocw/epub2tts) | Apache-2.0 | 961 | 2026-02-08 | Text to audiobook chunking. Code is allowed, but our pipeline is simpler. |
| [DrewThomasson/ebook2audiobook](https://github.com/DrewThomasson/ebook2audiobook) | Apache-2.0 | 20,261 | 2026-10-02 | Same, but heavy (voice cloning). Ideas only. |
| [souzatharsis/podcastfy](https://github.com/souzatharsis/podcastfy) | Apache-2.0 | 6,579 | 2026-05-04 | Two-voice "podcast" generation. A possible v2 idea. |
| [coqui-ai/TTS](https://github.com/coqui-ai/TTS) | MPL-2.0 | 46,096 | 2026-10-02 | Heavy for 8 GB RAM. Not needed. |

### Voice licensing (important, verified from Hugging Face `rhasspy/piper-voices` MODEL_CARDs)

The license of the training data for a Piper voice is separate from Piper's code license.
The contract's default voice, `piper:en_US-ryan-high`, was trained from scratch on
**RyanSpeech, CC BY-NC-SA 4.0**. Our use is noncommercial, so this is probably acceptable.
Whether ShareAlike reaches synthesized audio is legally unsettled.

Also checked:
- `lessac` was trained on Blizzard 2013 data. That license is research-only, with no
  commercial use and no stand-alone use. Every voice "finetuned from lessac" inherits this:
  alan, aru, semaine, vctk, arctic, l2arctic and libritts_r. **Avoid all of them.**
- **`en_GB-cori-medium`** was trained from scratch on **public-domain LibriVox** recordings.
  It is the cleanest-licensed installed voice, but it is a British female voice.

Recommendation for Daniel: keep `ryan-high` for the pilot, since we are noncommercial.
Switch to `cori` or another PD voice trained from scratch before any commercial or
sponsored use. Credit the voice and its dataset on the About page.

## 5. Bible, creeds and theology data

| Repo | License | Stars | Last push | Notes |
|---|---|---|---|---|
| [scrollmapper/bible_databases](https://github.com/scrollmapper/bible_databases) | MIT (repo) | 1,694 | 2026-07-10 | KJV/ASV/WEB plus cross-references (SQL/JSON). Each translation keeps its own status, so use only PD ones. |
| [thiagobodruk/bible](https://github.com/thiagobodruk/bible) | MIT (repo) | 745 | 2026-09-24 | Bible JSON, 90 versions. Many are **not** PD. Filter to KJV/ASV/WEB. |
| [seven1m/bible_api](https://github.com/seven1m/bible_api) | MIT | 835 | 2026-08-29 | JSON API over PD Bibles (Ruby). Not needed. Writers quote from ebible.org directly. |
| [NonlinearFruit/Creeds.json](https://github.com/NonlinearFruit/Creeds.json) | Unlicense, **except 8 listed copyrighted texts** (README) | 29 | 2026-08-26 | Structured Reformed creeds, confessions and catechisms. Excluded as copyrighted: Chicago Statement, Helvetic Consensus (tr.), Savoy, and five Crossway items. |
| [jimbob88/CatenaVetus](https://github.com/jimbob88/CatenaVetus) | Unlicense | 23 | 2026-09-28 | Church Fathers reader (TUI). Ideas only. |
| [AndBible/and-bible](https://github.com/AndBible/and-bible) | GPL-3.0 | 815 | 2026-09-29 | Don't copy. |

## 6. Curriculum data standards

| Spec | License | Relevance |
|---|---|---|
| [adlnet/xAPI-Spec](https://github.com/adlnet/xAPI-Spec) (952★, 2025-07-03) | Apache-2.0 | The standard for statements like "learner completed lesson X". Our `{status, position, updatedAt}` model maps cleanly to the xAPI verbs `progressed`, `completed` and `skipped`/`waived`, so an export is possible later. Not v1. |
| [schemaorg/schemaorg](https://github.com/schemaorg/schemaorg) (6,263★) | Apache-2.0 | `Course` / `LearningResource` / LRMI properties. Cheap SEO: add JSON-LD `Course` per subject page. Recommended v1.1. |
| [opensalt/opensalt](https://github.com/opensalt/opensalt) (45★, MIT) | MIT | A server for 1EdTech CASE (competency frameworks). Overkill. Ideas only. |

## Near-miss products, and how Subject Mastery differs

LearnIVO, A-Learn/Learnera and Unlock Genius were checked by web search on 2026-10-02.
The other entries come from general knowledge and were not re-verified on 2026-10-02.

- **LearnIVO:** **unverified**. Web search found no product by that name. Its positioning can't be compared.
- **A-Learn / Learnera:** **unverified**. The only "A-Learn" found is an AR letter-cards game for kids (App Store id1580936736), and "Learna" is an AI language tutor. Neither matches. If the handoff meant another product, we need its URL.
- **Unlock Genius:** **unverified**. Not found. The closest match is "Genius – Learn How To Think" (App Store id6738075248), which has audio lessons plus study guides for thinking skills. It has no standardized subject paths and no skip-what-you-know.
- **OSSU:** link lists of other people's courses, CS and maths only, no audio, no progress tracking. We write our own ear-first lessons, cover non-CS fields, and track progress per lesson.
- **Blinkist / Shortform:** summaries of individual books, with no ordered path through a field and a subscription paywall. We teach a field's core in order, not one book at a time.
- **The Great Courses (Wondrium):** professor-led video and audio courses, paid, one course per lecturer with no field-wide standard path. We offer one free standardized path per subject plus skip/known.
- **Coursera:** university courses with video, deadlines, quizzes and paid certificates. We are not accredited, have no certificates or deadlines, are audio/text first, and can be listened to in a car.
- **Class Central:** a search engine over MOOCs. It hosts no content and tracks no progress. It is an aggregator, not a path.

## Reuse recommendations

1. **Borrow no third-party code for v1.** Everything we need is small: a static player,
   `<audio>`, localStorage plus a tiny API, and a Piper shell-out. Writing it ourselves
   keeps the repo purely PolyForm NC with no attribution burden. No candidate is both
   small and better than writing it ourselves.
2. **Piper:** keep invoking the existing VanaVoice binary as a separate process. Never
   copy code from `OHF-Voice/piper1-gpl`, which is GPL. Credit "Piper TTS (MIT,
   rhasspy/piper)" and the voice dataset (RyanSpeech, CC BY-NC-SA 4.0) on the About page.
3. **Allowed to borrow if needed:**
   - `jessuni/shikwasa` (MIT) for player UX patterns, such as a speed button and chapter list.
   - `NonlinearFruit/Creeds.json` (Unlicense) for creed texts, skipping its 8 copyrighted files.
   - `scrollmapper/bible_databases` (MIT) for PD Bible text.

   Required attribution: MIT means keeping the copyright line and license text in
   `NOTICE`. Unlicense needs none, but credit it anyway.
4. **Structure, not text:** model `subject.json` on the OSSU README pattern (ordered
   stages, prerequisites, time). Align chapter coverage to OpenStax, but see the warning in
   `SOURCES.md`. **OpenStax relicensed to CC BY-NC-SA 4.0 in March 2026.**
5. **Later:** add an xAPI-style export of progress, and schema.org `Course` JSON-LD on
   subject pages.
