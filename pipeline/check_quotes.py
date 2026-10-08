#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""
check_quotes.py - verify Bible quotations in lesson scripts against the real public-domain text.

    python3 check_quotes.py                  # all subjects
    python3 check_quotes.py biblical-studies

The CONTRACT allows Bible quotations only from KJV, WEB or ASV, and the lesson must name the
translation. LLMs misremember wording, so every quotation of six or more words is checked:

  EXACT     found word-for-word (ignoring case/punctuation) in the translation named in that paragraph
  CLOSE     >= 85% similar to a passage of the named translation -> fix the wording by hand
  OTHER     found exactly in a different PD translation than the one named -> fix the attribution
  NOTFOUND  not found in any of the three -> paraphrase or fix
  UNNAMED   a quotation that looks biblical (CLOSE/EXACT somewhere) with no translation named nearby
  NOQUOTE   a sentence names a translation and a verse (or a verb like says/writes) but has no quotation marks:
            it may be a paraphrase presented as that translation (about 18 passages in 11 lessons on
            2026-10-02) -> quote exactly or drop the name

Reference texts (public domain, from ebible.org "vpl" files) are downloaded once into
~/Downloads/subject-mastery-build/ref/bibles/. Exit code 1 if anything other than EXACT is found.
"""
import difflib
import json
import os
import re
import sys
import urllib.request
import zipfile

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from subjects import BUILD, CONTENT, SUBJECTS  # noqa: E402

REF = os.path.join(BUILD, "ref", "bibles")
TRANSLATIONS = {"KJV": "eng-kjv", "WEB": "eng-web", "ASV": "eng-asv"}
NAMES = {"KJV": r"King James|\bKJV\b", "WEB": r"World English Bible|\bWEB\b",
         "ASV": r"American Standard|\bASV\b"}
QUOTE = re.compile(r"[\"“]([^\"”]{20,600})[\"”]")


def norm(t):
    t = t.lower().replace("’", "'").replace("‘", "'")
    t = re.sub(r"[^a-z0-9' ]+", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def load(code):
    d = os.path.join(REF, TRANSLATIONS[code])
    txt = os.path.join(d, TRANSLATIONS[code] + "_vpl.txt")
    if not os.path.exists(txt):
        os.makedirs(d, exist_ok=True)
        z = os.path.join(REF, TRANSLATIONS[code] + "_vpl.zip")
        urllib.request.urlretrieve(f"https://ebible.org/Scriptures/{TRANSLATIONS[code]}_vpl.zip", z)
        with zipfile.ZipFile(z) as zf:
            zf.extractall(d)
    verses = []
    with open(txt, encoding="utf-8-sig") as f:
        for line in f:
            m = re.match(r"^([1-3A-Z]{3}) (\d+):(\d+) (.*)$", line.strip())
            if m:
                verses.append((f"{m.group(1)} {m.group(2)}:{m.group(3)}", norm(m.group(4))))
    joined = " ".join(v for _, v in verses)
    return verses, joined


def best_close(q, verses):
    """Highest similarity of q against windows of 1-3 consecutive verses that share rare words."""
    words = [w for w in q.split() if len(w) > 4]
    best = (0.0, "")
    for i, (ref, v) in enumerate(verses):
        if not any(w in v for w in words[:6]):
            continue
        for span in (1, 2, 3):
            window = " ".join(x for _, x in verses[i:i + span])
            r = difflib.SequenceMatcher(None, q, window).find_longest_match(0, len(q), 0, len(window))
            if r.size < min(len(q), 25):
                continue
            # compare q with the aligned slice of the window
            start = max(0, r.b - r.a)
            cand = window[start:start + len(q) + 10]
            ratio = difflib.SequenceMatcher(None, q, cand).ratio()
            if ratio > best[0]:
                best = (ratio, ref)
    return best


def main():
    ids = sys.argv[1:] or list(SUBJECTS)
    bibles = {c: load(c) for c in TRANSLATIONS}
    bad = 0
    total = 0
    for sid in ids:
        root = os.path.join(CONTENT, sid, "lessons")
        for d, _, fs in sorted(os.walk(root)):
            for fn in sorted(fs):
                if not fn.endswith(".md"):
                    continue
                path = os.path.join(d, fn)
                key = sid + "/" + os.path.relpath(path, root)[:-3]
                with open(path, encoding="utf-8") as f:
                    paras = re.split(r"\n\s*\n", f.read())
                for p in paras:
                    named = [c for c, pat in NAMES.items() if re.search(pat, p)]
                    for sent in re.split(r"(?<=[.!?])\s+", p):
                        if any(re.search(pat, sent) for pat in NAMES.values()) and not QUOTE.search(sent) \
                                and not re.search(r"[\"“”]", sent) and re.search(r"(says|said|saying|writes|wrote|reads|declares|"
                                                                       r"records|puts it|begins|:)\s|\bverses? (?:\d|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|"
                                                                       r"sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|"
                                                                       r"ninety)|\d:\d", sent):
                            total += 1
                            bad += 1
                            print(f"{'NOQUOTE (check wording)':60s} {key}: {sent[:110]}")
                    for m in QUOTE.finditer(p):
                        q = norm(m.group(1))
                        if len(q.split()) < 6:
                            continue
                        exact = [c for c in TRANSLATIONS if q in bibles[c][1]]
                        if named and any(c in exact for c in named):
                            status = "EXACT"
                        elif exact and named:
                            status = f"OTHER (named {'/'.join(named)}, text is {'/'.join(exact)})"
                        elif exact:
                            status = f"UNNAMED (exact {'/'.join(exact)})"
                        else:
                            scores = {c: best_close(q, bibles[c][0]) for c in (named or TRANSLATIONS)}
                            c, (r, ref) = max(scores.items(), key=lambda kv: kv[1][0])
                            if r >= 0.85:
                                status = f"CLOSE {c} {ref} {r:.2f}" if named else f"UNNAMED (close {c} {ref} {r:.2f})"
                            elif named:
                                status = f"NOTFOUND (named {'/'.join(named)}; best {c} {ref} {r:.2f})"
                            else:
                                continue  # not biblical (e.g. a creed or a historical source)
                        total += 1
                        if status != "EXACT":
                            bad += 1
                        print(f"{status:60s} {key}: “{m.group(1)[:90]}”")
    print(f"\n{total} Bible quotation(s) checked, {bad} need attention")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
