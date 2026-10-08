#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""
write_lessons.py - write lesson scripts: draft -> independent review -> revise.

    python3 write_lessons.py                       # all pilot subjects, module-major order
    python3 write_lessons.py economics biology     # just these
    python3 write_lessons.py --modules 1-2         # only modules 1 and 2
    python3 write_lessons.py --only economics/m01-foundations/l02-opportunity-cost --force
    python3 write_lessons.py --max-lessons 10      # stop after 10 new lessons
    python3 write_lessons.py --wait-hours 6        # when every provider is exhausted, sleep and retry
    python3 write_lessons.py --rereview-weak       # second review (Gemini/gpt-oss) of lessons Qwen passed

Order: module 1 of every subject, then module 2 of every subject, and so on, so that a
quota cut-off always leaves whole modules finished in every subject.

Resumable: a lesson whose .md exists is skipped unless --force. Each finished lesson is
recorded in content/<subject>/provenance.json (which models drafted, reviewed, revised).
Log: ~/Downloads/subject-mastery-build/logs/write_lessons-YYYYMMDD.log
"""
import argparse
import json
import os
import re
import sys
import time

sys.dont_write_bytecode = True  # keep __pycache__ out of the Drive repo
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import llm  # noqa: E402
from subjects import COMMON_RULES, CONTENT, LOGS, REPO_FIXED, SUBJECTS  # noqa: E402

MIN_WORDS, MAX_WORDS = 600, 1000
LOG = None

BANNED_TRANSLATIONS = re.compile(
    r"\b(NIV|ESV|NRSV|NASB|NLT|NKJV|RSV|CSB|HCSB|NET Bible|New International Version|English Standard Version|"
    r"New Revised Standard|New American Standard|New Living Translation|New King James|Revised Standard Version|"
    r"Christian Standard Bible|The Message)\b")
# Subjects that quote the Bible: only KJV, WEB or ASV may be quoted (CONTRACT; check_quotes.py verifies wording).
BIBLE_SUBJECTS = ("biblical-studies", "church-history")
VISUAL_REFS = re.compile(r"(as shown (below|above)|see (the )?(figure|table|diagram|chart|graph)|"
                         r"in the (figure|table|diagram|chart) (below|above)|pictured (below|above))", re.I)


def log(msg):
    line = f"{time.strftime('%Y-%m-%d %H:%M:%S')} {msg}"
    print(line, flush=True)
    if LOG:
        with open(LOG, "a") as f:
            f.write(line + "\n")


# ---------------------------------------------------------------- text checks
def _count(text):
    text = re.sub(r"[#*_>`-]", " ", text)
    return len(re.findall(r"[A-Za-z0-9À-ɏ'’]+", text))


def words_of(md):
    """All words a listener hears (prose + Key ideas), excluding the title line."""
    return _count("\n".join(md.splitlines()[1:]))


def prose_words(md):
    """Words of the prose body only (before '## Key ideas'), excluding the title line."""
    body = "\n".join(md.splitlines()[1:])
    return _count(re.split(r"^## Key ideas\s*$", body, flags=re.M)[0])


_UNITS = {w: i for i, w in enumerate("zero one two three four five six seven eight nine ten eleven twelve thirteen "
                                     "fourteen fifteen sixteen seventeen eighteen nineteen".split())}
_TENS = {w: 10 * i for i, w in enumerate("_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()) if w != "_"}
_NUMWORD = r"(?:" + "|".join(sorted(list(_UNITS) + list(_TENS) + ["hundred", "thousand", "and"], key=len,
                                       reverse=True)) + r")"
_SPELLED_DATE = re.compile(r"\b((?:" + _NUMWORD + r")(?:[ -]" + _NUMWORD + r")*)\s+(BCE|CE|before the common era|"
                           r"before the Common Era|of the common era|before Christ|after Christ|common era|"
                           r"Common Era)\b")


def _words_to_int(words):
    total, cur, prev = 0, 0, ""
    for w in re.split(r"[ -]+", words.lower()):
        if w == "and":
            if prev not in ("hundred", "thousand"):
                return None  # "seventy and eighty-five" is two numbers, not one
            prev = w
            continue
        prev = w
        if w in _UNITS:
            if _UNITS[w] >= 10 and cur % 100 >= 10:
                cur = cur * 100        # "nineteen ... eleven" style year pairs
            cur += _UNITS[w]
        elif w in _TENS:
            if cur % 100 >= 10:
                cur = cur * 100        # "thirteen twenty-five" = 1325, not 13 + 20 + 5
            cur += _TENS[w]
        elif w == "hundred":
            cur = (cur or 1) * 100
        elif w == "thousand":
            total += (cur or 1) * 1000
            cur = 0
        else:
            return None
    return total + cur


_TEEN = r"(?:eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)"
_TENS_W = r"(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)"
_UNIT_W = r"(?:one|two|three|four|five|six|seven|eight|nine)"
_YEAR_WORDS = re.compile(
    r"\b(in|from|to|until|till|by|between|and|of|around|about|after|before|since|circa)\s+(?:the\s+year\s+)?"
    r"(" + _TEEN + r"(?:\s+hundred(?:\s+and)?(?:\s+(?:" + _TENS_W + r"(?:-" + _UNIT_W + r")?|" + _UNIT_W + r"|ten|"
    + _TEEN + r"))?|[ -](?:" + _TENS_W + r"(?:-" + _UNIT_W + r")?|ten|" + _TEEN + r"|oh[ -]" + _UNIT_W + r")))\b")


def _year_phrase(m):
    words = m.group(2)
    oh = re.match(r"^(\w+)[ -]oh[ -](\w+)$", words)
    if oh:  # "nineteen oh five" = 1905
        n = _UNITS[oh.group(1)] * 100 + _UNITS[oh.group(2)]
    else:
        n = _words_to_int(words)
    return f"{m.group(1)} {n}" if n and 1000 <= n <= 2099 else m.group(0)


def numeric_dates(text):
    """'six hundred and twenty-two CE' -> '622 CE'; 'before the common era' -> 'BCE' (history guidance)."""
    def rep(m):
        n = _words_to_int(m.group(1))
        era = "BCE" if m.group(2).lower() in ("bce", "before the common era", "before christ") else "CE"
        return (f"{n:,} {era}" if n >= 10000 else f"{n} {era}") if n else m.group(0)
    text = _SPELLED_DATE.sub(rep, text)
    text = _YEAR_WORDS.sub(_year_phrase, text)  # "in fifteen forty-three" -> "in 1543"
    text = re.sub(r"\b(century|centuries|millennium|millennia)\s+(?:before the common era|before the Common Era|"
                  r"before Christ)\b", r"\1 BCE", text)
    text = re.sub(r"\b(\d+)\s+(?:before the common era|before the Common Era|before Christ)\b", r"\1 BCE", text)
    return re.sub(r"\b(\d+)\s+(?:common era|Common Era|after Christ)\b", r"\1 CE", text)


def tidy(md, title):
    """Deterministic clean-up: exact title line, no stray headings/markup, spoken symbols."""
    md = md.strip()
    # gpt-oss emits non-breaking hyphens/spaces (U+2011, U+202F, U+00A0); keep plain characters in the source
    md = md.replace("\u2011", "-").replace("\u2010", "-").replace("\u202f", " ").replace("\u00a0", " ")
    md = re.sub(r"^```(?:markdown|md)?\s*|\s*```$", "", md).strip()
    lines = md.splitlines()
    # drop anything before the first heading line, then force the exact title
    for i, ln in enumerate(lines):
        if ln.startswith("# "):
            lines = lines[i + 1:]
            break
    out, in_key = [], False
    for ln in lines:
        s = ln.rstrip()
        if re.match(r"^#{2,6}\s+key ideas\s*:?\s*$", s, re.I):
            out.append("## Key ideas")
            in_key = True
            continue
        if re.match(r"^#{1,6}\s", s):  # any other heading -> drop the marker, keep as a sentence-ish line
            text = re.sub(r"^#{1,6}\s+", "", s).strip()
            if text and not text.endswith((".", "?", "!", ":")):
                text += "."
            out.append(text)
            continue
        if in_key:
            s = re.sub(r"^\s*(?:[*+\-•]|\d+[.)])\s+", "- ", s)
        else:
            s = re.sub(r"^\s*(?:[*+•-]|\d+[.)])\s+", "", s)
        out.append(s)
    body = "\n".join(out)
    body = re.sub(r"\*\*(.+?)\*\*", r"\1", body)
    body = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"\1", body)
    body = re.sub(r"(?<!\w)_(?!\s)(.+?)(?<!\s)_(?!\w)", r"\1", body)
    body = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", body)
    body = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", body)
    body = re.sub(r"\b[A-Z](?:-[A-Z]){1,5}\b", lambda m: m.group(0).replace("-", ""), body)  # "A-T-P" -> "ATP"
    body = re.sub(r"\b[A-Z](?: [A-Z]){2,4}\b", lambda m: m.group(0).replace(" ", ""), body)  # "A T P" -> "ATP"
    body = numeric_dates(body)
    body = re.sub(r"\$([A-Za-z])\$", r"\1", body)  # LaTeX-wrapped single letter "$x$" -> "x" (flash-lite does this)
    body = re.sub(r"(\d)\s?%", r"\1 percent", body)
    body = body.replace("&", " and ")
    body = re.sub(r"\$(\d[\d,]*(?:\.\d+)?)(\s+(?:thousand|million|billion|trillion))?",
                  lambda m: f"{m.group(1)}{m.group(2) or ''} dollars", body)
    body = re.sub(r"[ \t]+", " ", body)
    body = re.sub(r" +([,.;:!?])", r"\1", body)
    body = re.sub(r"\n{3,}", "\n\n", body).strip()
    return f"# {title}\n\n{body}\n"


def problems(md, subject_id):
    """Contract violations that need an LLM fix. Empty list = acceptable."""
    p = []
    n = prose_words(md)
    if n < MIN_WORDS:
        p.append(f"prose too short: {n} words before Key ideas; it must be {MIN_WORDS + 150} to {MAX_WORDS - 100} words")
    if n > MAX_WORDS or words_of(md) > MAX_WORDS + 100:
        p.append(f"too long: the prose has {n} words; delete about {n - 820} words (whole sentences or a whole "
                 f"paragraph) so the prose is about 820 words, a hard maximum of {MAX_WORDS - 60}")
    if re.search(r"^\s*\|.*\|\s*$", md, re.M):
        p.append("contains a table; rewrite it as spoken prose")
    if "```" in md or "<" in md and re.search(r"</?[a-z]+[^>]*>", md):
        p.append("contains code or HTML; remove it")
    if re.search(r"\$(?!\d)", md):
        p.append("contains a dollar sign used as LaTeX math markup; write the mathematics in plain spoken words")
    if VISUAL_REFS.search(md):
        p.append("refers to a figure/table/'shown below'; the listener cannot see anything")
    if re.search(r"[=<>^~\\{}]", md):
        p.append("contains symbols such as = < > ^ ~; spell them out in words")
    if subject_id in BIBLE_SUBJECTS and BANNED_TRANSLATIONS.search(md):
        p.append("names or quotes a copyrighted Bible translation; quote only KJV, WEB or ASV and name it")
    key = re.split(r"^## Key ideas\s*$", md, flags=re.M)
    if len(key) == 2:
        bullets = [ln for ln in key[1].splitlines() if ln.startswith("- ")]
        if not 3 <= len(bullets) <= 6:
            p.append(f"Key ideas must have 3 to 6 bullets (has {len(bullets)})")
    return p


# ---------------------------------------------------------------- prompts
SYSTEM_WRITER = ("You are a master teacher and an experienced writer of spoken educational audio. "
                 "You write accurate, clear, warm, college-level lesson scripts that sound natural when read aloud.")

DRAFT = """Write one lesson script for Subject Mastery, an audio-first learning path.

Subject: {subject}
Module {mi} of {mn}: {module} - {module_summary}
Lesson {li} of {ln} in this module: "{title}"
What this lesson must teach: {summary}
Previous lesson: {prev}
Next lesson: {next}

Other lessons in this subject (cover only THIS lesson's material; do not repeat what these teach):
{others}

Rules:
{rules}
Subject guidance: {guidance}

Shape:
- First line exactly: # {title}
- Then {lo} to {hi} words of flowing spoken prose (about 8 to 10 paragraphs of 70 to 100 words; a hard maximum
  of 900 words). No other headings, no bullet lists in the body.
- Open with a concrete hook (a question, a scene, or an everyday example), not with "Welcome" or "In this lesson".
- Briefly connect to the previous lesson where natural. Define every new term in plain words. Use one or two worked examples.
- End the prose with a sentence or two that points toward the next lesson's topic.
- Finish with a section headed exactly "## Key ideas" containing 3 to 5 bullets, each one full sentence starting with "- ".
Return only the lesson markdown."""

SYSTEM_REVIEWER = ("You are a meticulous subject-matter expert and audio editor reviewing a lesson script before "
                   "publication. You are independent of the writer. You check facts carefully and are concise.")

REVIEW = """Review this lesson script for the subject "{subject}" (module: {module}; lesson: "{title}").
It is meant to teach: {summary}
It will be read aloud by a text-to-speech voice to adult learners at entry-level college.

Previous lesson: {prev}
Next lesson: {next}
Other lessons in the path (their material belongs THERE, not here): {others}

Subject guidance the writer had to follow (it applies only where relevant to THIS lesson's topic): {guidance}

Format rules (correct by design, do NOT flag): the script ends with a "## Key ideas" section of 3 to 5 bullets;
the body is about 700 to 900 words; the first line is the title.

Check for:
1. Factual errors or misleading simplifications (quote the exact phrase and give the correction). Flag an error
   ONLY when you are certain, judged against standard college textbooks in this field. Never "correct" a standard
   textbook definition; if you are unsure, leave it out.
2. Key ideas a standard college course would include in THIS lesson's topic but that are missing. Do not ask for
   material that the other lessons listed above will teach, and do not ask for longer coverage than the length allows.
3. Ear-unfriendly writing: long tangled sentences, symbols or numbers that read badly aloud, references to visuals,
   lists inside the body prose.
4. Anything that breaks the guidance as it applies to this topic (balance, sourcing, quotation rules, copyrighted text).

Return ONLY JSON:
{{"verdict": "pass" or "revise",
  "factual_errors": ["..."], "missing_key_ideas": ["..."], "ear_problems": ["..."], "guidance_problems": ["..."]}}
Use empty lists where there is nothing substantive. Use "pass" only if the script is publishable as is.

LESSON SCRIPT:
{draft}"""

REVISE = """Revise this lesson script using the editor's review below. Fix every factual error. Add missing key ideas
briefly if they fit this lesson's scope. Fix every ear problem. Keep what already works; keep the same title line.

Rules:
{rules}
Subject guidance: {guidance}
Length: {lo} to {hi} words, then the "## Key ideas" section (3 to 5 one-sentence bullets starting with "- ").
No other headings. No bullet lists in the body.

The editor can be wrong. Apply a factual correction only if it agrees with standard college textbooks in the
field; otherwise keep the original wording. Ignore any review point that would add material belonging to another
lesson in the path ({next} comes next) or that conflicts with these rules. Never mention diagrams, graphs or
anything visual: the listener cannot see.

EDITOR'S REVIEW:
{review}

CURRENT SCRIPT:
{draft}

Return only the full revised lesson markdown, starting with "# {title}"."""

FIX = """This lesson script breaks these rules: {issues}.
Rewrite it so that it fixes them, keeping its content, tone and the title line "# {title}".
Body length: {lo} to {hi} words, then "## Key ideas" with 3 to 5 one-sentence bullets starting with "- ".
Rules:
{rules}
SCRIPT:
{draft}

Return only the full lesson markdown."""


def parse_review(text):
    t = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip())
    m = re.search(r"\{.*\}", t, re.S)
    if not m:
        return None
    try:
        r = json.loads(m.group(0))
    except ValueError:
        return None
    for k in ("factual_errors", "missing_key_ideas", "ear_problems", "guidance_problems"):
        v = r.get(k) or []
        r[k] = [str(x) for x in v] if isinstance(v, list) else [str(v)]
    r["verdict"] = str(r.get("verdict", "revise")).lower()
    return r


def review_text(r):
    parts = []
    for k, label in (("factual_errors", "Factual errors"), ("missing_key_ideas", "Missing key ideas"),
                     ("ear_problems", "Ear problems"), ("guidance_problems", "Guidance problems")):
        if r[k]:
            parts.append(label + ":\n" + "\n".join(f"- {x}" for x in r[k]))
    return "\n\n".join(parts)


# ---------------------------------------------------------------- model routing
# Lesson 2026-10-02: Groq gpt-oss drafts reviewed by Groq Qwen let real errors through (wrong dates, invented
# scholar attributions), and a gpt-oss review once "corrected" a right definition into a wrong one. So:
#  * drafts and revisions go to Gemini first and WAIT (up to 15 min) for a briefly overloaded Gemini model
#    before falling back to the rest of the writer chain;
#  * reviews cross model families: Gemini drafts are reviewed by gpt-oss, other drafts by Gemini;
#  * Qwen (weakest) reviews only as a last resort.
GEMINI = [("gemini", m) for m in llm.GEMINI_ALL]
# Reviewers that passed nearly everything with zero issues on 2026-10-02 (lessons they passed still had errors):
WEAK_REVIEWERS = {"groq:qwen/qwen3.8-27b", "gemini:gemini-3.5-flash-lite", "gemini:gemini-3.1-flash-lite"}
STRONG_GEMINI = [("gemini", m) for m in llm.GEMINI_MODELS]


def gemini_first(prompt, fallback, max_wait=900, exclude=(), pool=None, **kw):
    waited = 0
    pool = [c for c in (pool or GEMINI) if f"{c[0]}:{c[1]}" not in exclude]
    while pool:
        try:
            return llm.generate(prompt, chain=pool, exclude=exclude, **kw)
        except llm.LLMError:
            soon = llm.seconds_until_available(pool)
            if soon and waited + soon <= max_wait:
                log(f"  (waiting {soon:.0f}s for a Gemini model)")
                time.sleep(soon + 3)
                waited += soon + 3
                continue
            break
    return llm.generate(prompt, chain=fallback, exclude=exclude, **kw)


def review_chain_for(drafter_label):
    """Cross-family first; the weak reviewers only as a last resort."""
    if drafter_label.startswith("gemini:"):
        return [("groq", "openai/gpt-oss-120b")] + STRONG_GEMINI + [
            ("openrouter", llm.OPENROUTER_MODELS[1]), ("openrouter", llm.OPENROUTER_MODELS[0])] + [
            ("gemini", m) for m in llm.GEMINI_LITE] + [("groq", "qwen/qwen3.8-27b")]
    return None  # use gemini_first with this fallback:


REVIEW_FALLBACK = [("groq", "openai/gpt-oss-120b"), ("openrouter", llm.OPENROUTER_MODELS[1]),
                   ("openrouter", llm.OPENROUTER_MODELS[0])] + [("gemini", m) for m in llm.GEMINI_LITE] + [
                   ("groq", "qwen/qwen3.8-27b")]


def do_review(draft, fmt, drafter_label, key):
    prompt = REVIEW.format(draft=draft, **fmt)
    kw = dict(system=SYSTEM_REVIEWER, max_tokens=1500, temperature=0.2, json_mode=True, min_chars=20, timeout=180,
              exclude={drafter_label})
    for _ in range(2):
        chain = review_chain_for(drafter_label)
        r = (llm.generate(prompt, chain=chain, **kw) if chain
             else gemini_first(prompt, REVIEW_FALLBACK, max_wait=300, pool=STRONG_GEMINI, **kw))
        parsed = parse_review(r.text)
        if parsed is not None:
            return r, parsed
        log(f"  review {key}: unparseable JSON from {r.label}")
        kw["exclude"] = kw["exclude"] | {r.label}
    raise llm.LLMError("no parseable review")


def finish(final, fmt, subject_id, key, title):
    """Contract checks with up to three targeted fixes. Returns (text, fixer labels)."""
    fixes, tried = [], set()
    for attempt in range(3):
        issues = problems(final, subject_id)
        if not issues:
            break
        paras = [x for x in re.split(r"\n\s*\n", final.split("## Key ideas")[0]) if x.strip()][1:]
        if any(i.startswith("too long") for i in issues):
            issues.append(f"the prose now has {len(paras)} paragraphs; return at most 9 paragraphs of at most 95 words each")
        log(f"  fix    {key}: {'; '.join(issues)}")
        # after a failed attempt, let a different model try (some models will not shorten their own text)
        f = gemini_first(FIX.format(issues="; ".join(issues), draft=final, **fmt), llm.CHAINS["writer"],
                         max_wait=300, exclude=set(tried) if attempt >= 1 else set(), system=SYSTEM_WRITER,
                         max_tokens=3000, temperature=0.4, min_chars=2000)
        tried.add(f.label)
        final = tidy(f.text, title)
        fixes.append(f.label)
    issues = problems(final, subject_id)
    if issues:
        raise RuntimeError(f"{key} still breaks the contract after fixes: {issues}")
    return final, fixes


def hand_edited_keys():
    """Lessons a human/AI fixed by hand; --rereview-weak never touches them. Read from the build log and from
    the copy folded into docs/CONTENT_STATUS.md (which travels with the repo)."""
    keys = set()
    for p in (os.path.join(LOGS, "hand_edits.md"), os.path.join(REPO_FIXED, "docs", "CONTENT_STATUS.md")):
        if os.path.exists(p):
            with open(p) as f:
                for ln in f:
                    m = re.match(r"^- `?([a-z0-9-]+/[a-z0-9-]+/[a-z0-9-]+)`?:", ln)
                    if m:
                        keys.add(m.group(1))
    rp = os.path.join(LOGS, "hand_reviewed.txt")
    if os.path.exists(rp):
        with open(rp) as f:
            keys.update(ln.strip() for ln in f if ln.strip())
    return keys


def lesson_context(subject_id, spec, subject, mi, li, flat):
    mod = subject["modules"][mi]
    les = mod["lessons"][li]
    key = f"{subject_id}/{mod['id']}/{les['id']}"
    pos = flat.index(key)
    prev = flat_titles[subject_id][pos - 1] if pos > 0 else "(none: this is the first lesson of the subject)"
    nxt = flat_titles[subject_id][pos + 1] if pos + 1 < len(flat) else "(none: this is the final lesson of the subject)"
    others = "; ".join(t for k, t in zip(flat, flat_titles[subject_id]) if k != key)
    fmt = dict(subject=spec["title"], mi=mi + 1, mn=len(subject["modules"]), module=mod["title"],
               module_summary=mod["summary"], li=li + 1, ln=len(mod["lessons"]), title=les["title"],
               summary=les["summary"], prev=prev, next=nxt, others=others, rules=COMMON_RULES,
               guidance=spec["guidance"], lo=700, hi=850)
    path = os.path.join(CONTENT, subject_id, "lessons", mod["id"], les["id"] + ".md")
    return key, les, path, fmt


def rereview_one(subject_id, spec, subject, mi, li, flat):
    """Second, stronger review of an existing lesson whose first review was weak. Overwrites the .md."""
    key, les, path, fmt = lesson_context(subject_id, spec, subject, mi, li, flat)
    prov = load_provenance(subject_id).get(key, {})
    if not os.path.exists(path) or key in hand_edited_keys():
        return "skip"
    weak = prov.get("review") in WEAK_REVIEWERS or (prov.get("review_issues") == 0 and prov.get("draft", "").startswith(
        "groq:"))
    if not weak or prov.get("rereview"):
        return "skip"
    t0 = time.time()
    with open(path) as fh:
        text = fh.read()
    drafter = prov.get("draft", "unknown:unknown")
    r, parsed = do_review(text, fmt, drafter, key)
    notes = review_text(parsed)
    n_issues = sum(len(parsed[k]) for k in ("factual_errors", "missing_key_ideas", "ear_problems", "guidance_problems"))
    log(f"  re-review {key} verdict={parsed['verdict']} issues={n_issues} via {r.label}")
    revised_by = None
    final = text
    if n_issues or parsed["verdict"] != "pass":
        v = gemini_first(REVISE.format(review=notes or "(verdict revise, no details)", draft=text, **fmt),
                         llm.CHAINS["writer"], system=SYSTEM_WRITER, max_tokens=3000, temperature=0.5,
                         min_chars=2500)
        final = tidy(v.text, les["title"])
        revised_by = v.label
    final, fixes = finish(final, fmt, subject_id, key, les["title"])
    write_text(path, final)
    prov["rereview"] = {"review": r.label, "review_verdict": parsed["verdict"], "review_issues": n_issues,
                        "revise": revised_by or "skipped (review passed)", "fixes": fixes,
                        "date": time.strftime("%Y-%m-%d")}
    prov["words"] = words_of(final)
    save_provenance(subject_id, key, prov, notes, suffix=".rereview")
    log(f"  done   {key} (re-review) {prov['words']}w in {time.time() - t0:.0f}s")
    return "written"


def write_text(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w") as fh:
        fh.write(text)
    os.replace(tmp, path)


# ---------------------------------------------------------------- one lesson
def write_one(subject_id, spec, subject, mi, li, flat, force=False):
    mod = subject["modules"][mi]
    les = mod["lessons"][li]
    key = f"{subject_id}/{mod['id']}/{les['id']}"
    path = os.path.join(CONTENT, subject_id, "lessons", mod["id"], les["id"] + ".md")
    if os.path.exists(path) and not force:
        return "skip"
    pos = flat.index(key)
    prev = flat_titles[subject_id][pos - 1] if pos > 0 else "(none: this is the first lesson of the subject)"
    nxt = flat_titles[subject_id][pos + 1] if pos + 1 < len(flat) else "(none: this is the final lesson of the subject)"
    others = "; ".join(t for k, t in zip(flat, flat_titles[subject_id]) if k != key)
    rules = COMMON_RULES
    fmt = dict(subject=spec["title"], mi=mi + 1, mn=len(subject["modules"]), module=mod["title"],
               module_summary=mod["summary"], li=li + 1, ln=len(mod["lessons"]), title=les["title"],
               summary=les["summary"], prev=prev, next=nxt, others=others, rules=rules,
               guidance=spec["guidance"], lo=700, hi=850)
    t0 = time.time()
    # 1. draft (cached in the build dir so a quota stop between steps does not waste the draft)
    cache = os.path.join(LOGS, "drafts", key + ".json")
    d = None
    if os.path.exists(cache) and not force:
        with open(cache) as fh:
            c = json.load(fh)
        d = llm.Result(c["text"], c["provider"], c["model"])
        log(f"  draft  {key} (cached) via {d.label}")
    if d is None:
        d = gemini_first(DRAFT.format(**fmt), llm.CHAINS["writer"], system=SYSTEM_WRITER, max_tokens=3000,
                         temperature=0.7, min_chars=2500)
        os.makedirs(os.path.dirname(cache), exist_ok=True)
        with open(cache, "w") as fh:
            json.dump({"text": d.text, "provider": d.provider, "model": d.model}, fh)
    draft = tidy(d.text, les["title"])
    log(f"  draft  {key} {words_of(draft)}w via {d.label}")
    # 2. independent review by a different model family where possible
    r, parsed = do_review(draft, fmt, d.label, key)
    final, revised_by = draft, None
    notes = review_text(parsed)
    n_issues = sum(len(parsed[k]) for k in ("factual_errors", "missing_key_ideas", "ear_problems", "guidance_problems"))
    log(f"  review {key} verdict={parsed['verdict']} issues={n_issues} via {r.label}")
    # 3. revise (Gemini first) unless the review found nothing
    if n_issues or parsed["verdict"] != "pass":
        v = gemini_first(REVISE.format(review=notes or "(verdict revise, no details)", draft=draft, **fmt),
                         llm.CHAINS["writer"], system=SYSTEM_WRITER, max_tokens=3000, temperature=0.5,
                         min_chars=2500)
        final = tidy(v.text, les["title"])
        revised_by = v.label
        log(f"  revise {key} {words_of(final)}w via {v.label}")
    # 4. contract checks; up to three targeted fixes
    final, fixes = finish(final, fmt, subject_id, key, les["title"])
    write_text(path, final)
    record = {"draft": d.label, "review": r.label, "review_verdict": parsed["verdict"], "review_issues": n_issues,
              "revise": revised_by or "skipped (review passed)", "fixes": fixes, "words": words_of(final),
              "date": time.strftime("%Y-%m-%d"), "seconds": round(time.time() - t0)}
    save_provenance(subject_id, key, record, notes)
    log(f"  done   {key} {record['words']}w in {record['seconds']}s")
    return "written"


def load_provenance(subject_id):
    p = os.path.join(CONTENT, subject_id, "provenance.json")
    if os.path.exists(p):
        with open(p) as f:
            return json.load(f).get("lessons", {})
    return {}


def save_provenance(subject_id, key, record, notes, suffix=""):
    p = os.path.join(CONTENT, subject_id, "provenance.json")
    prov = {}
    if os.path.exists(p):
        with open(p) as f:
            prov = json.load(f)
    prov.setdefault("lessons", {})[key] = record
    tmp = p + ".tmp"
    with open(tmp, "w") as f:
        json.dump(prov, f, indent=2, sort_keys=True)
        f.write("\n")
    os.replace(tmp, p)
    # full review notes go to the build log dir (not the repo)
    rd = os.path.join(LOGS, "reviews", subject_id)
    os.makedirs(rd, exist_ok=True)
    with open(os.path.join(rd, key.split("/", 1)[1].replace("/", "__") + suffix + ".txt"), "w") as f:
        f.write(json.dumps(record, indent=1) + "\n\n" + (notes or "(no issues)") + "\n")


# ---------------------------------------------------------------- driver
flat_titles = {}


def parse_range(s, n):
    if not s:
        return list(range(n))
    out = set()
    for part in s.split(","):
        if "-" in part:
            a, b = part.split("-")
            out.update(range(int(a) - 1, int(b)))
        else:
            out.add(int(part) - 1)
    return sorted(i for i in out if 0 <= i < n)


def main():
    global LOG
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("subjects", nargs="*")
    ap.add_argument("--modules", help="module numbers, e.g. 1-3 or 1,4")
    ap.add_argument("--only", action="append", help="lesson key(s) to write")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--max-lessons", type=int, default=0)
    ap.add_argument("--wait-hours", type=float, default=0.0,
                    help="if every provider is exhausted, sleep and retry for up to this many hours")
    ap.add_argument("--pause", type=float, default=20.0,
                    help="seconds between lessons; ~20 s keeps Groq gpt-oss reviews under its 8000 tokens/minute")
    ap.add_argument("--rereview-weak", action="store_true",
                    help="instead of writing, re-review (stronger model) lessons whose first review was weak")
    a = ap.parse_args()
    os.makedirs(LOGS, exist_ok=True)
    LOG = os.path.join(LOGS, f"write_lessons-{time.strftime('%Y%m%d')}.log")
    llm.set_log(LOG)
    ids = a.subjects or list(SUBJECTS)
    subjects = {}
    for sid in ids:
        with open(os.path.join(CONTENT, sid, "subject.json")) as f:
            subjects[sid] = json.load(f)
        keys, titles = [], []
        for m in subjects[sid]["modules"]:
            for ls in m["lessons"]:
                keys.append(f"{sid}/{m['id']}/{ls['id']}")
                titles.append(f"{ls['title']} ({m['title']})")
        subjects[sid]["_flat"] = keys
        flat_titles[sid] = titles
    max_mods = max(len(s["modules"]) for s in subjects.values())
    jobs = []  # module-major: module 1 of every subject first
    for mi in parse_range(a.modules, max_mods):
        for sid in ids:
            s = subjects[sid]
            if mi >= len(s["modules"]):
                continue
            for li, ls in enumerate(s["modules"][mi]["lessons"]):
                key = f"{sid}/{s['modules'][mi]['id']}/{ls['id']}"
                if a.only and key not in a.only:
                    continue
                jobs.append((sid, mi, li, key))
    log(f"write_lessons start: {len(jobs)} lessons in scope")
    written = skipped = failed = 0
    deadline = time.time() + a.wait_hours * 3600
    for sid, mi, li, key in jobs:
        while True:
            try:
                if a.rereview_weak:
                    res = rereview_one(sid, SUBJECTS[sid], subjects[sid], mi, li, subjects[sid]["_flat"])
                else:
                    res = write_one(sid, SUBJECTS[sid], subjects[sid], mi, li, subjects[sid]["_flat"], a.force)
                break
            except llm.LLMError as e:
                if time.time() < deadline:
                    log(f"  all providers exhausted at {key}; sleeping 20 min ({str(e)[:160]})")
                    time.sleep(1200)
                    continue
                log(f"STOP: providers exhausted at {key}: {str(e)[:300]}")
                log(f"write_lessons stop: written={written} skipped={skipped} failed={failed}")
                print(f"\nResume later with the same command; finished lessons are skipped.")
                sys.exit(3)
            except (RuntimeError, ValueError, KeyError) as e:
                log(f"  FAILED {key}: {str(e)[:300]}")
                res = "failed"
                break
        if res == "skip":
            skipped += 1
            continue
        if res == "failed":
            failed += 1
            continue
        written += 1
        if a.max_lessons and written >= a.max_lessons:
            break
        time.sleep(a.pause)
    log(f"write_lessons end: written={written} skipped={skipped} failed={failed}")


if __name__ == "__main__":
    main()
