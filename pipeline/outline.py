#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""
outline.py - generate content/<subject>/subject.json (the ordered mastery path).

    python3 outline.py economics            # generate if missing
    python3 outline.py --all                # all four pilot subjects
    python3 outline.py biology --force      # regenerate (overwrites; only before publishing!)

The LLM proposes modules and lessons; this script turns titles into contract slugs
(m01-..., l01-..., <= 48 chars, unique), validates counts and writes the file.
A human (or AI) reviewer then edits subject.json by hand - see docs/CONTENT_STATUS.md.
IDs become permanent once published, so never --force after publishing.
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
from subjects import CONTENT, LOGS, SUBJECTS  # noqa: E402

SLUG_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
STOP = {"a", "an", "the", "of", "and", "in", "to", "for", "on", "its", "from", "with"}


def slugify(title, prefix, maxlen=48):
    s = title.lower().replace("&", " and ").replace("'", "").replace("’", "")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    words = [w for w in s.split("-") if w]
    # drop leading/trailing stopwords, then cut on word boundaries to fit
    while words and words[0] in STOP:
        words.pop(0)
    out = prefix
    for w in words:
        cand = f"{out}-{w}"
        if len(cand) > maxlen:
            break
        out = cand
    while out.count("-") > 1 and out.rsplit("-", 1)[1] in STOP:
        out = out.rsplit("-", 1)[0]
    assert SLUG_RE.match(out) and len(out) <= maxlen, out
    return out


PROMPT = """You are designing the standardized learning path for the subject "{title}" on Subject Mastery,
an audio-first learning site. Each lesson is a 5 to 7 minute spoken script (600 to 1000 words).
The path must take a motivated adult from entry-level college foundations to advanced command of the field:
being able to explain and use its main ideas.

{reference}

Subject guidance: {guidance}

Requirements:
- Exactly {mods} modules, ordered prerequisite-first, from foundations to advanced.
- Each module has 4 to 6 lessons ({lessons_hint}). Lessons inside a module are ordered so each builds on the previous.
- No two lessons may cover the same material. Each lesson title is specific (not "Introduction" or "Overview" alone).
- Module and lesson titles are short (2 to 7 words), in Title Case, and contain no numbering.
- Every module and lesson has a one-sentence summary saying what the learner will understand.

Return ONLY JSON in this shape:
{{"modules": [{{"title": "...", "summary": "...", "lessons": [{{"title": "...", "summary": "..."}}]}}]}}"""


def build(subject_id, force=False, mods=12):
    spec = SUBJECTS[subject_id]
    out_dir = os.path.join(CONTENT, subject_id)
    out = os.path.join(out_dir, "subject.json")
    if os.path.exists(out) and not force:
        print(f"{subject_id}: subject.json exists (use --force to regenerate)")
        return out
    os.makedirs(LOGS, exist_ok=True)
    llm.set_log(os.path.join(LOGS, f"outline-{time.strftime('%Y%m%d')}.log"))
    prompt = PROMPT.format(title=spec["title"], reference=spec["reference"], guidance=spec["guidance"],
                           mods=mods, lessons_hint="about 5 on average; 60 lessons at most in total")
    res = llm.generate(prompt, chain="writer", max_tokens=8000, temperature=0.4, json_mode=True, min_chars=500)
    raw_path = os.path.join(LOGS, f"outline-raw-{subject_id}-{time.strftime('%Y%m%d-%H%M%S')}.json")
    with open(raw_path, "w") as f:
        f.write(res.text)
    text = res.text.strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text)
    data = json.loads(text)
    modules = []
    for mi, m in enumerate(data["modules"], 1):
        mid = slugify(m["title"], f"m{mi:02d}")
        lessons, seen = [], set()
        for li, ls in enumerate(m["lessons"], 1):
            lid = slugify(ls["title"], f"l{li:02d}")
            if lid in seen:
                raise SystemExit(f"duplicate lesson id {lid} in {mid}")
            seen.add(lid)
            lessons.append({"id": lid, "title": ls["title"].strip(), "summary": ls["summary"].strip()})
        modules.append({"id": mid, "title": m["title"].strip(), "summary": m["summary"].strip(), "lessons": lessons})
    subject = {"id": subject_id, "title": spec["title"], "tagline": spec["tagline"],
               "description": spec["description"], "category": spec["category"], "color": spec["color"],
               "modules": modules}
    os.makedirs(out_dir, exist_ok=True)
    with open(out, "w") as f:
        json.dump(subject, f, indent=2, ensure_ascii=False)
        f.write("\n")
    prov_path = os.path.join(out_dir, "provenance.json")
    prov = {}
    if os.path.exists(prov_path):
        with open(prov_path) as f:
            prov = json.load(f)
    prov["outline"] = {"model": res.label, "date": time.strftime("%Y-%m-%d"), "raw": os.path.basename(raw_path),
                       "hand_reviewed": False}
    prov.setdefault("lessons", {})
    with open(prov_path, "w") as f:
        json.dump(prov, f, indent=2, sort_keys=True)
        f.write("\n")
    n = sum(len(m["lessons"]) for m in modules)
    print(f"{subject_id}: {len(modules)} modules, {n} lessons via {res.label} -> {out}")
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("subjects", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--modules", type=int, default=12)
    a = ap.parse_args()
    ids = list(SUBJECTS) if a.all else a.subjects
    if not ids:
        ap.error("name a subject or use --all")
    for sid in ids:
        if sid not in SUBJECTS:
            raise SystemExit(f"unknown subject {sid}")
        build(sid, a.force, a.modules)


if __name__ == "__main__":
    main()
