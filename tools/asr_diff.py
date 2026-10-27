#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""Compare a Whisper transcript with the lesson's normalised speech text; print the word-level
differences (likely mispronunciations) and the normalised WER. Usage: asr_diff.py <repo> <lesson key> <transcript.txt>"""
import difflib, os, re, sys
repo, key, tx = sys.argv[1:4]
sys.path.insert(0, os.path.join(repo, "pipeline"))
import tts
sid, rest = key.split("/", 1)
segs = tts.speech_segments(open(os.path.join(repo, "content", sid, "lessons", rest + ".md")).read())
NUM = {w: w for w in []}
def words(t):
    t = t.lower().replace("-", " ")
    return re.findall(r"[a-z0-9']+", t)
ref, hyp = words(" ".join(s for s, _ in segs)), words(open(tx).read())
sm = difflib.SequenceMatcher(a=ref, b=hyp, autojunk=False)
errs = 0
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == "equal":
        continue
    errs += max(i2 - i1, j2 - j1)
    ctx = " ".join(ref[max(0, i1 - 4):i1])
    print(f"{op:7} [{ctx}] REF: {' '.join(ref[i1:i2])!r}  HEARD: {' '.join(hyp[j1:j2])!r}")
print(f"WER {errs / max(1, len(ref)):.2%} over {len(ref)} words")
