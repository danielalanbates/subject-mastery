export const meta = {
  name: 'sm-review-subjects',
  description: 'Expert review of Subject Mastery lessons for the given subjects, with adversarial verification of every proposed correction',
  phases: [
    { title: 'Review', detail: 'one expert reviewer per subject reads every lesson and proposes exact edits' },
    { title: 'Verify', detail: 'one skeptic per subject re-checks each proposed edit and spot-checks for misses' },
  ],
}
// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved. help@batesai.org · https://batesai.org
// Claude Code Workflow script used for the 2026-10-27 expert review (docs/EXPERT_REVIEW.md).
// Run with the Workflow tool, args: {repo: "<checkout>", subjects: [{id, title, lessons}]}; then
// tools/apply_review.py <run journal.jsonl> <repo> <build logs dir>.
// (The Workflow tool requires the meta block to be the first statement, so this note follows it.)

const REPO = args.repo
const EDIT_SCHEMA = {
  type: 'object',
  properties: {
    subject: { type: 'string' },
    lessons_reviewed: { type: 'integer' },
    verdicts: { type: 'array', items: { type: 'object', properties: {
      key: { type: 'string' }, verdict: { type: 'string', enum: ['ok', 'edited', 'needs_rewrite'] }, note: { type: 'string' } },
      required: ['key', 'verdict'] } },
    edits: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' },
      file: { type: 'string', description: 'repo-relative path, e.g. content/chemistry/lessons/m01-x/l01-y.md' },
      old: { type: 'string', description: 'exact substring of the current file, occurring exactly once' },
      new: { type: 'string' },
      category: { type: 'string', enum: ['factual', 'numeric', 'quotation', 'tts', 'contract', 'clarity', 'coherence'] },
      severity: { type: 'string', enum: ['high', 'medium', 'low'] },
      reason: { type: 'string' } },
      required: ['id', 'file', 'old', 'new', 'category', 'severity', 'reason'] } },
    subject_notes: { type: 'string' },
  },
  required: ['subject', 'lessons_reviewed', 'verdicts', 'edits', 'subject_notes'],
}
const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    decisions: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, accept: { type: 'boolean' },
      corrected_new: { type: 'string', description: 'only when accepting with a corrected replacement' },
      reason: { type: 'string' } }, required: ['id', 'accept', 'reason'] } },
    extra_edits: { type: 'array', description: 'high/medium misses you found and verified yourself', items: { type: 'object', properties: {
      id: { type: 'string' }, file: { type: 'string' }, old: { type: 'string' }, new: { type: 'string' },
      category: { type: 'string' }, severity: { type: 'string' }, reason: { type: 'string' } },
      required: ['id', 'file', 'old', 'new', 'category', 'severity', 'reason'] } },
    notes: { type: 'string' },
  },
  required: ['decisions', 'extra_edits', 'notes'],
}

const COMMON = `You are working on Subject Mastery, an audio-first college learning library. Repo (read-only for you): ${REPO}
Each lesson is a markdown script at content/<subject>/lessons/<module>/<lesson>.md, read aloud by the Piper text-to-speech voice "John" and also shown on screen. Learners are adults at entry-level college. The lessons were drafted and lightly reviewed by small free LLMs, which misremember facts and make arithmetic slips, so expert review is needed before publication.
Read first: docs/CONTRACT.md (lesson rules), pipeline/subjects.py (COMMON_RULES and this subject's "guidance"; the guidance lists the voice's known misreadings), and the normalise() function in pipeline/tts.py (what the speech normaliser already rewrites automatically: e.g. "%" -> percent, 2-5 letter acronyms spelled letter by letter, 1100-1999 read as years, "3:16" read as a Bible verse, roman numerals after capitalised words). The word-count rule: 600 to 1000 words of prose before "## Key ideas", then 3 to 6 one-sentence bullets.
DO NOT modify any file. You only read files and return structured output. You may run python3 for arithmetic and for checking that a string occurs exactly once in a file.`

function reviewPrompt(s) {
  return `${COMMON}

Your task: act as a senior professor of ${s.title} and an audio editor. Review EVERY lesson of the subject "${s.id}" (${s.lessons} lessons; order is in content/${s.id}/subject.json). Read each lesson file in full.

For each lesson check, in priority order:
1. factual: wrong or misleading statements of fact, definitions, attributions, dates, names, scientific claims. Flag only what you are confident a standard college textbook contradicts. Never "correct" a standard definition into a nonstandard one.
2. numeric: recompute EVERY worked example and every number derived in the text (use python3). A wrong intermediate or final result is high severity. Also check that a verbal expression parses to the intended mathematics when heard (e.g. "x plus two squared" is ambiguous).
3. quotation: any quotation must be accurate and from a public-domain source; if you cannot confirm wording, replace it with a paraphrase.
4. tts: things the voice will misread, per the subject guidance and the normaliser (lone letter "a" or "A" as a variable or point name, a colon between numbers that is not a Bible reference, four-or-more-digit non-year numbers without commas, two-letter element symbols spelled out, typed symbols such as = < > ^ / used as operators, abbreviations like sin, cos, ln, log base markers written as symbols, roman numerals that the normaliser will misread). Only flag when the misreading is real per the normaliser rules.
5. contract: visual references ("as shown below"), tables, lists inside body prose, broken Key ideas, length outside the range.
6. coherence: the lesson must teach what its title and summary in subject.json promise, without using a concept taught only in a LATER lesson unless it explains it.

Each edit must be surgical: "old" is an exact substring copied from the current file (include enough surrounding words that it occurs exactly once; verify with python3), "new" is its replacement in the same voice. Keep prose length within the rule. Do not rewrite for style; at most one low-severity clarity edit per lesson. If a lesson is fundamentally broken, mark verdict needs_rewrite and explain, instead of patching it heavily.
Give every edit a unique id like "${s.id}-001". Return a verdict for every lesson key (key = "${s.id}/<module>/<lesson>").`
}

function verifyPrompt(s, review) {
  return `${COMMON}

You are an independent, skeptical second expert in ${s.title}. Another reviewer proposed the edits below for the subject "${s.id}". Your job is to stop wrong "corrections" from being published (earlier free-model reviews proposed arithmetic changes that were themselves wrong).

For EACH edit: open the file, confirm "old" occurs exactly once (python3), then decide.
- factual / numeric / quotation / coherence edits: accept only if (a) the original is genuinely wrong or misleading and (b) the replacement is correct (recompute numbers with python3). If the original is acceptable, reject. If the idea is right but the replacement has a flaw, accept with corrected_new. Default to reject when uncertain.
- tts / contract / clarity edits: accept unless the replacement introduces an error, changes meaning, or breaks the voice rules.
Also reject any edit whose "old" does not occur exactly once, explaining why.

Then do a completeness pass: pick the 8 lessons in this subject that the reviewer marked "ok" and that contain the most numbers, dates or worked examples; read them fully and return any high or medium severity problem the reviewer missed as extra_edits (same exact-substring rules, ids like "${s.id}-x01"). You verify those yourself.

Reviewer's notes: ${review.subject_notes}
Proposed edits (JSON):
${JSON.stringify(review.edits)}`
}

const results = await pipeline(
  args.subjects,
  s => agent(reviewPrompt(s), { label: `review:${s.id}`, phase: 'Review', schema: EDIT_SCHEMA }),
  (review, s) => review
    ? agent(verifyPrompt(s, review), { label: `verify:${s.id}`, phase: 'Verify', schema: VERDICT_SCHEMA })
        .then(v => ({ subject: s.id, review, verify: v }))
    : null,
)

return results.filter(Boolean).map(r => ({
  subject: r.subject,
  lessons_reviewed: r.review.lessons_reviewed,
  proposed: r.review.edits.length,
  accepted: r.verify ? r.verify.decisions.filter(d => d.accept).length : 0,
  extra: r.verify ? r.verify.extra_edits.length : 0,
  needs_rewrite: r.review.verdicts.filter(v => v.verdict === 'needs_rewrite').map(v => v.key),
}))
