#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""
status.py - print per-subject progress of the content pipeline as Markdown.

    python3 status.py            # summary per subject and module
    python3 status.py --missing  # also list every lesson still to write / render
    python3 status.py --write-doc  # refresh the generated sections of docs/CONTENT_STATUS.md

Reads content/ (or SM_CONTENT_DIR), provenance.json and the audio sidecars.
"""
import collections
import json
import os
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from subjects import BUILD, CONTENT, LOGS, REPO_FIXED, SUBJECTS  # noqa: E402

AUDIO = os.environ.get("SM_AUDIO_DIR") or os.path.join(BUILD, "audio")


def table_and_modules():
    """(markdown table, per-module lines, list of missing keys, totals)."""
    rows = ["| Subject | Modules | Lessons written | With audio | Audio minutes | Hand-reviewed | Draft models |",
            "|---|---|---|---|---|---|---|"]
    reviewed = set()
    hp = os.path.join(LOGS, "hand_reviewed.txt")
    if os.path.exists(hp):
        with open(hp) as f:
            reviewed = {ln.strip() for ln in f if ln.strip()}
    mods, missing = [], []
    tot = collections.Counter()
    for sid in SUBJECTS:
        with open(os.path.join(CONTENT, sid, "subject.json")) as f:
            s = json.load(f)
        prov = {}
        pp = os.path.join(CONTENT, sid, "provenance.json")
        if os.path.exists(pp):
            with open(pp) as f:
                prov = json.load(f).get("lessons", {})
        c = collections.Counter()
        models = collections.Counter()
        secs = 0.0
        mods.append(f"\n**{s['title']}**\n")
        for m in s["modules"]:
            mw = ma = mr = 0
            for ls in m["lessons"]:
                key = f"{sid}/{m['id']}/{ls['id']}"
                c["total"] += 1
                has_md = os.path.exists(os.path.join(CONTENT, sid, "lessons", m["id"], ls["id"] + ".md"))
                side = os.path.join(AUDIO, key + ".json")
                if has_md:
                    c["written"] += 1
                    mw += 1
                    models[prov.get(key, {}).get("draft", "unknown")] += 1
                    if key in reviewed:
                        c["reviewed"] += 1
                        mr += 1
                if os.path.exists(side):
                    c["audio"] += 1
                    ma += 1
                    with open(side) as f:
                        secs += json.load(f).get("durationSec", 0)
                if not has_md:
                    missing.append(key)
            mods.append(f"- `{m['id']}` {m['title']}: {mw}/{len(m['lessons'])} written, {ma} audio, {mr} hand-reviewed")
        top = ", ".join(f"{k} ({v})" for k, v in models.most_common())
        rows.append(f"| {s['title']} | {len(s['modules'])} | {c['written']}/{c['total']} | {c['audio']} | "
                    f"{secs / 60:.0f} | {c['reviewed']} | {top} |")
        tot.update(c)
        tot["modules"] += len(s["modules"])
        tot["minutes"] += secs / 60
    rows.append(f"| **All** | {tot['modules']} | {tot['written']}/{tot['total']} | {tot['audio']} | {tot['minutes']:.0f} | "
                f"{tot['reviewed']} | |")
    return "\n".join(rows), "\n".join(mods), missing, tot


def write_doc():
    doc = os.path.join(REPO_FIXED, "docs", "CONTENT_STATUS.md")
    with open(doc) as f:
        text = f.read()
    table, mods, missing, tot = table_and_modules()
    edits = []
    hp = os.path.join(LOGS, "hand_edits.md")
    if os.path.exists(hp):
        with open(hp) as f:
            edits = [ln.rstrip() for ln in f if ln.startswith("- ") and "no change needed" not in ln]
    reviewed = []
    rp = os.path.join(LOGS, "hand_reviewed.txt")
    if os.path.exists(rp):
        with open(rp) as f:
            reviewed = sorted({ln.strip() for ln in f if ln.strip()})
    blocks = {
        "STATUS-TABLE": table + "\n\nPer module:\n" + mods,
        "HAND-EDITS": "### Hand edits (" + str(len(edits)) + ")\n\n" + "\n".join(edits)
        + "\n\n<details><summary>All hand-reviewed lessons (" + str(len(reviewed)) + "), read in full by Claude on "
        "2026-10-02; --rereview-weak skips these</summary>\n\n" + "\n".join(f"- `{k}`: reviewed" for k in reviewed)
        + "\n\n</details>",
    }
    for name, body in blocks.items():
        start, end = f"<!-- {name} -->", f"<!-- /{name} -->"
        if start in text and end in text:
            a = text.index(start) + len(start)
            b = text.index(end)
            text = text[:a] + "\n" + body + "\n" + text[b:]
        elif start in text:
            text = text.replace(start, start + "\n" + body + "\n" + end)
    tmp = doc + ".tmp"
    with open(tmp, "w") as f:
        f.write(text)
    os.replace(tmp, doc)
    print(f"updated {doc}: {tot['written']}/{tot['total']} written, {tot['audio']} audio, {len(missing)} missing")


def main():
    if "--write-doc" in sys.argv:
        write_doc()
        return
    missing = "--missing" in sys.argv
    print("| Subject | Modules | Lessons written | Audio | Audio minutes | Models (draft) |")
    print("|---|---|---|---|---|---|")
    details = []
    for sid in SUBJECTS:
        with open(os.path.join(CONTENT, sid, "subject.json")) as f:
            s = json.load(f)
        prov = {}
        pp = os.path.join(CONTENT, sid, "provenance.json")
        if os.path.exists(pp):
            with open(pp) as f:
                prov = json.load(f).get("lessons", {})
        total = written = audio = 0
        secs = 0.0
        models = collections.Counter()
        mod_rows = []
        for m in s["modules"]:
            mw = ma = 0
            for ls in m["lessons"]:
                key = f"{sid}/{m['id']}/{ls['id']}"
                total += 1
                md = os.path.join(CONTENT, sid, "lessons", m["id"], ls["id"] + ".md")
                side = os.path.join(AUDIO, key + ".json")
                has_md = os.path.exists(md)
                has_a = os.path.exists(side)
                if has_md:
                    written += 1
                    mw += 1
                    models[prov.get(key, {}).get("draft", "hand/unknown")] += 1
                if has_a:
                    audio += 1
                    ma += 1
                    with open(side) as f:
                        secs += json.load(f).get("durationSec", 0)
                if missing and (not has_md or not has_a):
                    details.append(f"- `{key}`: {'text' if has_md else 'NO TEXT'}, {'audio' if has_a else 'NO AUDIO'}")
            mod_rows.append(f"  - {m['id']}: {mw}/{len(m['lessons'])} written, {ma} audio")
        top = ", ".join(f"{k} ({v})" for k, v in models.most_common())
        print(f"| {s['title']} | {len(s['modules'])} | {written}/{total} | {audio} | {secs / 60:.0f} | {top} |")
        details.insert(0, f"\n**{s['title']}**\n" + "\n".join(mod_rows)) if not missing else None
    print("\n".join(details))


if __name__ == "__main__":
    main()
