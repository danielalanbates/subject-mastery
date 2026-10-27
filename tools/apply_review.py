#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""Apply verifier-accepted expert-review edits from a review workflow journal.

    apply_review.py <journal.jsonl> <repo> <logs dir> [--dry-run]

Reads every agent result in the journal, pairs each subject's reviewer edits with the
verifier's decisions, applies accepted edits (corrected_new wins) plus the verifier's own
extra edits, and refuses any edit whose old text does not occur exactly once at apply time.
Records expert_review in content/<subject>/provenance.json, appends to logs/hand_reviewed.txt
and logs/hand_edits.md, and prints contract problems for every touched lesson.
"""
import json
import os
import re
import sys

journal, repo, logs = sys.argv[1:4]
dry = "--dry-run" in sys.argv
sys.path.insert(0, os.path.join(repo, "pipeline"))
os.environ.setdefault("SM_CONTENT_DIR", os.path.join(repo, "content"))
import write_lessons  # noqa: E402

DATE = "2026-10-27"
reviews, verifies = {}, {}
for line in open(journal):
    try:
        ev = json.loads(line)
    except ValueError:
        continue
    res = ev.get("result")
    if isinstance(res, str):
        try:
            res = json.loads(res)
        except ValueError:
            continue
    if not isinstance(res, dict):
        continue
    if "edits" in res and "verdicts" in res and res.get("subject"):
        reviews[res["subject"]] = res
    elif "decisions" in res and "extra_edits" in res:
        ids = [d["id"] for d in res["decisions"]] + [e["id"] for e in res["extra_edits"]]
        subj = ids[0].rsplit("-", 1)[0] if ids else None
        if subj:
            verifies[subj] = res

summary = {}
for subj, rv in reviews.items():
    vf = verifies.get(subj)
    if not vf:
        print(f"!! {subj}: no verifier result; nothing applied")
        continue
    dec = {d["id"]: d for d in vf["decisions"]}
    todo = []
    for e in rv["edits"]:
        d = dec.get(e["id"])
        if d and d["accept"]:
            todo.append(dict(e, new=d.get("corrected_new") or e["new"], verified=d["reason"]))
    for e in vf["extra_edits"]:
        todo.append(dict(e, verified="found and verified by the second expert"))
    applied, failed, touched = [], [], {}
    for e in todo:
        path = os.path.join(repo, e["file"])
        if not os.path.exists(path):
            failed.append((e, "no such file"))
            continue
        text = touched.get(path) or open(path).read()
        n = text.count(e["old"])
        if n != 1:
            failed.append((e, f"old text occurs {n} times"))
            continue
        touched[path] = text.replace(e["old"], e["new"], 1)
        applied.append(e)
    problems = {}
    for path, text in touched.items():
        sid = os.path.relpath(path, os.path.join(repo, "content")).split(os.sep)[0]
        p = write_lessons.problems(text, sid)
        if p:
            problems[path] = p
        if not dry:
            with open(path, "w") as f:
                f.write(text)
    # provenance + review logs
    keys = [v["key"] for v in rv["verdicts"]]
    by_key = {}
    for e in applied:
        rel = os.path.relpath(os.path.join(repo, e["file"]), os.path.join(repo, "content", subj, "lessons"))
        k = f"{subj}/{rel[:-3]}"
        by_key.setdefault(k, []).append(e)
    if not dry:
        pp = os.path.join(repo, "content", subj, "provenance.json")
        prov = json.load(open(pp))
        for k in keys:
            rec = prov["lessons"].setdefault(k, {})
            es = by_key.get(k, [])
            rec["expert_review"] = {
                "date": DATE, "by": "Claude (Opus 5.5) expert reviewer + independent verifier",
                "edits": len(es), "categories": sorted({e["category"] for e in es}),
            }
        with open(pp, "w") as f:
            json.dump(prov, f, indent=2, sort_keys=True)
            f.write("\n")
        with open(os.path.join(logs, "hand_reviewed.txt"), "a") as f:
            f.write("".join(k + "\n" for k in keys))
        with open(os.path.join(logs, "hand_edits.md"), "a") as f:
            for k, es in sorted(by_key.items()):
                reasons = "; ".join(re.sub(r"\s+", " ", e["reason"]).strip() for e in es)
                f.write(f"- {k}: {reasons} ({DATE} expert review)\n")
    needs = [v["key"] for v in rv["verdicts"] if v["verdict"] == "needs_rewrite"]
    summary[subj] = {"reviewed": len(keys), "accepted": len(todo), "applied": len(applied),
                     "failed": [(e["id"], why) for e, why in failed], "problems": problems, "needs_rewrite": needs,
                     "by_category": {c: sum(1 for e in applied if e["category"] == c)
                                     for c in sorted({e["category"] for e in applied})}}
print(json.dumps(summary, indent=1))
