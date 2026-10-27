# Expert review, 2026-10-27

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
help@batesai.org · https://batesai.org

Before this review, Mathematics and the five drafted subjects (Chemistry, Computer Science, Psychology, US History, Church History) had only been drafted and checked by small free models. This pass brought them up to the editorial standard of the four pilot subjects, which Claude had read by hand on 2026-10-02. All ten subjects were then narrated and published in v0.2.0.

## Method

| Step | What happened |
|---|---|
| 1. Expert read | One reviewer per subject (Claude Opus 5.5, acting as a senior professor of the field and an audio editor) read every lesson in full, in path order. It checked facts, recomputed every worked example with Python, checked quotations, flagged phrases the John voice misreads (judged against `pipeline/tts.py` normalise()), checked the lesson contract, and checked that each lesson teaches what its title promises without relying on later lessons. It changed no files. It returned exact `old` → `new` replacements, each of which must occur exactly once. |
| 2. Independent verification | A second, skeptical expert re-checked every proposed edit. For factual, numeric, quotation and coherence edits, it accepted an edit only if the original was wrong and the replacement was right. When uncertain it rejected. When the idea was right but the wording was flawed, it accepted the edit with a corrected replacement. It then read the eight most number-heavy lessons that the first reviewer had passed and returned any misses it could verify itself. |
| 3. Deterministic apply | `tools/apply_review.py` applied only accepted and extra edits. It refused any edit whose text no longer occurred exactly once, re-ran the writer's contract checks on every touched lesson, and recorded `expert_review` in each lesson's `provenance.json`. |
| 4. Checks | `pipeline/build.py --check` passed. `pipeline/check_quotes.py` ran on the two Bible subjects: 47 quotations checked, all exact, apart from two straight-quote pairing false positives in one Zwingli lesson, where the actual quotation "This is my body" (KJV, Matthew 26:26) is exact. Narration was re-rendered from the corrected text. |

## Results

| Subject | Lessons | Proposed | Rejected | Corrected by verifier | Extra found by verifier | Applied |
|---|---:|---:|---:|---:|---:|---:|
| Mathematics | 66 | 72 | 0 | 1 | 4 | 76 |
| Chemistry | 63 | 68 | 0 | 8 | 2 | 70 |
| Computer Science | 60 | 61 | 3 | 2 | 0 | 58 |
| Psychology | 68 | 70 | 0 | 3 | 4 | 74 |
| US History | 66 | 75 | 0 | 3 | 1 | 76 |
| Church History | 66 | 82 | 1 | 6 | 7 | 88 |
| **All** | **389** | **428** | **4** | **23** | **18** | **442** |

Applied edits by kind: 252 factual, 42 numeric, 14 quotation, 43 text-to-speech, 55 coherence, 35 clarity, 1 contract. No lesson needed a full rewrite.

Representative corrections:

- **Mathematics:**
  - "The square root of eighteen is the square root of nine times the square root of three" now uses root two.
  - A cubic's "turning points" used inputs where the function only rises.
  - A circle check substituted the centre, which can never satisfy the equation.
  - A spoken quadratic formula divided only the first term.
- **Chemistry:**
  - A false claim that standard enthalpies of formation of elements follow periodic trends. Every element in its standard state is zero by definition.
  - A Key idea with Le Chatelier backwards.
  - Calcium oxide given calcium carbonate's atoms.
- **Computer Science:** the four essential freedoms were attributed to the Open Source Initiative. They come from the Free Software Foundation's Free Software Definition.
- **US History:** an unverifiable, probably invented presidential quotation was replaced with a documented one.
- **Church History:** Saladin took Jerusalem in 1187, before the Third Crusade, not during it.

The rejected edits were judgment calls in which the original wording was acceptable. Examples: "trillions of operations" for a quadratic sort of a million items, and a Key ideas list that left out a topic without saying anything wrong.

## Limits

- The reviewers are AI models, not credentialed subject-matter experts. This review is far stronger than the free-model pass, but it is not peer review or accreditation. Corrections from readers are welcome at help@batesai.org or as GitHub issues.
- The review prompts are in `tools/review_workflow.js`. The per-edit decisions, with reasons, are summarised in `docs/CONTENT_STATUS.md` ("Hand edits"). The full workflow journals stayed on the build machine.
- Audio was spot-checked with Whisper. Normalised word error was 1.1% on a Mathematics lesson and 2.1% on a Chemistry lesson. The Mathematics quadratic-formula lesson scored 8.5%, but almost all of that is Whisper writing numerals for spoken number words; the one real slip was "plug" heard as "plot".
