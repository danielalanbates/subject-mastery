# Subject Mastery content pipeline

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved. · help@batesai.org · https://batesai.org

Turns a subject into a standardized path of lesson scripts and narrated audio, and builds the
static data the web player reads. Everything here is Python 3 standard library plus `ffmpeg`
and `ffprobe` (Homebrew). There are no pip dependencies. **Running it costs $0.** It only calls
free LLM tiers and local Piper TTS.

The binding data rules are in [`../docs/CONTRACT.md`](../docs/CONTRACT.md). The current state of
each subject is in [`../docs/CONTENT_STATUS.md`](../docs/CONTENT_STATUS.md).

## Files

| File | Job |
|---|---|
| `llm.py` | `generate(prompt, …)` over a fallback chain of free providers, with cooldowns |
| `subjects.py` | Per-subject specs: syllabus skeleton, writing guidance, colours; shared paths |
| `outline.py` | Generates `content/<subject>/subject.json` (modules and lessons, contract slugs) |
| `write_lessons.py` | For each lesson: draft, then independent review, then revise, then contract checks |
| `tts.py` + `piper_worker.py` | Markdown to speakable text, then Piper WAV, then loudness-normalized MP3, plus a sidecar JSON |
| `voice_compare.py` | Voice A/B: Whisper word-error-rate, pace, loudness and clipping per voice (`docs/VOICE.md`). `tts.py` takes `SM_VOICES_DIR` for voices outside VanaVoice |
| `build.py` | Validates everything against the contract and writes `~/Downloads/subject-mastery-build/dist/` |
| `status.py` | Markdown progress table (lessons written, audio, models used) |
| `sync_content.py` | Copies `content/` between the Drive repo and a local mirror, with timeouts |
| `check_quotes.py` | Checks every quoted Bible passage word for word against public-domain KJV/WEB/ASV text |

## Where things live

- **Repo (source of truth):** `…/My Drive/Code/subject-mastery/`. `content/` holds `catalog.json`,
  `<subject>/subject.json`, `<subject>/lessons/<module>/<lesson>.md` and
  `<subject>/provenance.json`, which records which model drafted, reviewed and revised each lesson.
- **Build dir (never in Drive):** `~/Downloads/subject-mastery-build/`
  - `audio/<subject>/<module>/<lesson>.mp3` plus a `.json` sidecar with `durationSec`, voice and text hash
  - `dist/`, the finished static site, which gets copied to the website's `public/subjectmastery/`
  - `logs/`, with per-run logs, raw outline output, cached drafts (`logs/drafts/`), full review notes
    (`logs/reviews/`) and the LLM cooldown state (`logs/llm_state.json`)
  - `work/`, a local mirror of `pipeline/` and `content/` for long runs (see below)

## Run it

```sh
cd ~/Downloads/subject-mastery-build
P="$SM_REPO/pipeline"   # SM_REPO = your checkout of this repo (Daniel's: docs/LOCAL_PATHS.md)

python3 -B "$P/llm.py" probe              # which free models answer right now
python3 -B "$P/outline.py" --all          # 1. outlines (skips subjects that already have one)
#    then review content/<subject>/subject.json by hand. IDs are permanent once published.
python3 -B "$P/write_lessons.py"          # 2. lesson scripts, resumable
python3 -B "$P/tts.py"                    # 3. audio for every lesson whose audio is missing or stale
python3 -B "$P/build.py"                  # 4. validate and build dist/
python3 -B "$P/status.py"                 #    progress table
```

`-B` (or the scripts' own `sys.dont_write_bytecode`) keeps `__pycache__` out of the Drive repo.

### Long runs: use the local mirror

Google Drive for desktop sometimes blocks a `read()` for minutes while it syncs a file. This was
seen on 2026-10-02 with `content/catalog.json` and `content/economics/subject.json`. A blocked read
hangs an unattended run. For long runs, work on a local copy:

```sh
W=~/Downloads/subject-mastery-build/work
mkdir -p $W/pipeline && cp "$P"/*.py $W/pipeline/
python3 -B $W/pipeline/sync_content.py pull                 # repo content/ -> $W/content
cd $W && SM_CONTENT_DIR=$W/content nohup python3 -B pipeline/write_lessons.py --wait-hours 12 \
      > ../logs/write.out 2>&1 &
SM_CONTENT_DIR=$W/content python3 -B pipeline/tts.py
SM_CONTENT_DIR=$W/content python3 -B pipeline/build.py
python3 -B $W/pipeline/sync_content.py push                 # results -> repo content/ (never deletes)
```

`SM_CONTENT_DIR` points every script at the mirror. `build.py` always reads the player from the
repo's `web/` (override with `SM_WEB_DIR`), and it never writes there.

## Resume and re-run rules

- **Outlines:** `outline.py` skips a subject that already has `subject.json`. Use `--force` only
  before publishing.
- **Lessons:** `write_lessons.py` skips any lesson whose `.md` exists. `--force` rewrites it, and
  `--only <key>` limits the run to one lesson. Drafts are cached in `logs/drafts/`, so a quota stop
  between draft and review does not waste the draft. Work goes **module by module across all
  subjects** (module 1 of every subject, then module 2, and so on), so a quota cut-off always
  leaves whole modules done. When every provider is exhausted, the script exits with code 3. With
  `--wait-hours N` it instead sleeps 20 minutes and retries, for up to N hours.
- **Audio:** `tts.py` re-renders a lesson only when its speakable text, voice or pace changed. It
  compares a SHA-256 hash stored in the sidecar. Editing a lesson by hand therefore re-renders just
  that lesson. `--force` re-renders everything.
- **Build:** `build.py` always rebuilds `dist/` from scratch in `dist.new/`, then swaps it in.
  Stale audio (text changed after rendering) is left out, and that lesson is marked
  `hasAudio:false` until `tts.py` runs again.

## LLM providers (free tiers only)

Keys are read at call time from `~/Library/Application Support/DaemonManager/secrets.json`
(`GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`) or from environment variables of the
same name. The GitHub token comes from `gh auth token`. Keys are never written, logged or printed.

Probed on 2026-10-02:

| Provider | Models used | Notes |
|---|---|---|
| Google Gemini | `gemini-3.8-flash`, `3.7-flash`, `3.6-flash`, `3.5-flash`, `3-flash-preview`, `2.5-flash` | Best writers. Often answer **503 "high demand"** on the free tier, so each 503 rests that model for 20 min. `gemini-2.5-pro` returns 404 for new users. `gemini-3.1-pro-preview` has a free quota of 0. `2.5-flash` hit its daily cap early, probably because other tools share the key. |
| Groq | `openai/gpt-oss-120b` (writer and reviewer), `qwen/qwen3.8-27b` (reviewer only) | Fast (about 4 s). gpt-oss: 1000 requests/day, 8000 tokens/minute; it is a reasoning model, so writing uses `reasoning_effort: low` (medium truncated answers). Qwen allows only **1000 output tokens per minute**, so it can review but cannot write. Groq's Cloudflare blocks urllib's default User-Agent (error 1010), so we send our own. |
| GitHub Models | `openai/gpt-5`, `openai/gpt-4.1` | `models.github.ai` answers every request, even unauthenticated ones, with a bare `OK` text/plain. The legacy Azure endpoint does not connect. `llm.py` detects this and skips the provider. Re-check with `llm.py probe`. |
| OpenRouter | `:free` models only (`nvidia/nemotron-3-ultra-550b-a55b:free`, `nemotron-3-super-120b-a12b:free`, `qwen/qwen3.8-27b:free`, `google/gemma-4-31b-it:free`) | **Never a paid model.** The id must end in `:free`, the live price list must show 0 for prompt and completion, and every request carries `provider.max_price = 0`. The account has a few cents of credit, and free use is about 50 requests/day. nemotron-ultra is slow: 290 s for one review. |

Chains and routing (from `write_lessons.py`, revised during the first run, see "Known weakness" below):

- **Drafts and revisions: Gemini first.** Full flash models are tried first, then flash-lite
  (`gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, about 5 s per lesson). If every Gemini model
  is only briefly cooling down (503 "high demand"), the script waits up to 15 minutes before it
  falls back to Groq gpt-oss and then OpenRouter.
- **Reviews: a different model family.** Gemini drafts are reviewed by Groq gpt-oss, then full
  Gemini, then OpenRouter nemotron. Other drafts are reviewed by full Gemini, then gpt-oss, then
  OpenRouter. The weak reviewers (Qwen and the flash-lite models, which passed almost everything
  with zero issues) come last.
- `--pause 20` between lessons keeps gpt-oss reviews under Groq's 8000 tokens per minute.
- Lessons whose first review came from a weak reviewer can get a stronger second pass later with
  `write_lessons.py --rereview-weak`. Lessons listed in `logs/hand_edits.md` are skipped, so hand
  fixes are never overwritten.

Observed daily limits on 2026-10-02 (free tier, shared with other tools that use the same keys):
`gemini-3-flash-preview`, `gemini-3.8-flash` and `gemini-2.5-flash` each hit "quota exceeded"
after a few dozen calls. Groq gpt-oss hit its **200,000 tokens/day** limit after roughly 60 calls.
OpenRouter allows about 50 free requests/day.

## Lesson quality loop (write_lessons.py)

1. **Draft** (Gemini first, see routing above). The prompt includes the subject, the module, the lesson
   summary, the previous and next lesson titles, and every other lesson title, so lessons
   connect and do not repeat. It also includes the subject guidance from `subjects.py`.
2. **Review** by a different model. It returns JSON listing factual errors (only certain ones,
   judged against standard textbooks), missing key ideas within this lesson's scope, ear
   problems and guidance problems.
3. **Revise** (Gemini first). The reviser is told the editor can be wrong and to keep
   textbook-correct wording. If the review lists nothing, the draft is kept as is.
4. **Deterministic clean-up** in `tidy()`: exact title line; markdown, bullets and stray headings
   stripped; `%`, `&` and `$` written out; letter-spelled acronyms rejoined (`A-T-P` and `A T P`
   become `ATP`); special hyphens and spaces normalized; and spelled-out dates turned into
   numerals with BCE/CE (`six hundred and twenty-two CE` becomes `622 CE`, and `in fifteen
   forty-three` becomes `in 1543`). Year pairs are read as years, so `thirteen twenty-five` is
   1325. An earlier version summed them to 38, which is why every date was spot-checked on
   2026-10-02.
5. **Contract checks** (`problems()`): exact title line, 600–1000 words
   of prose, `## Key ideas` with 3–6 bullets, no tables, code, HTML, images, visual references or
   symbols, and no copyrighted Bible translation names. Up to three targeted fix calls follow,
   rotating models after a failure.

**Known weakness:** a weaker reviewer can "correct" a right answer into a wrong one. This
happened on 2026-10-02: gpt-oss told the reviser that opportunity cost excludes the ticket price.
Hand spot-reads caught it, and the fixes are logged in `docs/CONTENT_STATUS.md`. Treat
LLM-reviewed text as a draft that still needs human or strong-model review before calling it
authoritative.

## Bible quotations (check_quotes.py)

`check_quotes.py` compares every quotation of six or more words in a lesson with the real
public-domain text. The text comes from the ebible.org "vpl" files (KJV, WEB, ASV), which are
downloaded once to `~/Downloads/subject-mastery-build/ref/bibles/`. It reports EXACT, CLOSE
(fix the wording), OTHER (wrong translation named), NOTFOUND and UNNAMED. It also reports
NOQUOTE: a sentence that names a translation together with a verse reference, or with a verb such
as "says" or "writes", but has no quotation marks. The models often paraphrase a verse and then label it "King James Version", so every NOQUOTE needs
either an exact quotation or the translation name removed. Run it after every theology batch.

## TTS (tts.py)

- Engine: VanaVoice's Piper 1.7, used **read-only**. Its Python runs `piper_worker.py`, which loads
  the voice once. Exactly one Piper process runs.
- Voice: **`en_US-lessac-medium`** at `length_scale 1.15`, about 160 words per minute (measured). See the A/B
  test in `docs/CONTENT_STATUS.md`. `--voice en_US-ryan-high` is available.
- Speakable text: the title, then the paragraphs (0.65 s pause between them), then "Key ideas."
  and each bullet. Markdown is stripped. Numbers and abbreviations are normalized for the ear.
  Years are read as years (1453 becomes "fourteen fifty-three") and so are decades. Dates
  read as ordinals ("June 28" becomes "June twenty-eighth"). Bible
  references become "John 3, verse 16". Roman numerals become "World War Two" or "Henry the
  Eighth". Acronyms are spelled out ("G D P"), except ones said as words (NATO, UNESCO). Check
  any lesson with `tts.py speak <file.md>`.
- Encode: `loudnorm=I=-19:TP=-1.5:LRA=11`, mono, 22.05 kHz, 40 kbps MP3, about 0.3 MB per minute.
- Stops before free disk would fall under 9 GB.
- Run it with `nice -n 19` when the Mac is busy (Daniel games on this machine). It is the only
  CPU-heavy step. On 2026-10-02 the load average was around 300, with a game, a Swift build and
  another Piper process running, and the render time per lesson rose from 30 s to 140 s.

## Costs

$0. Free API tiers only, plus local CPU for Piper and ffmpeg. The OpenRouter guard rules out
even its few cents of credit.
