#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""Adopt MP3s bundled in the Mac beta as current John renders when the lesson text is unchanged.
Writes tts.py-compatible sidecars so tts.py skips them. Usage: adopt_audio.py <app Site dir> <repo> <audio out>"""
import hashlib, json, os, shutil, subprocess, sys
site, repo, out = sys.argv[1:4]
sys.path.insert(0, os.path.join(repo, "pipeline"))
os.environ["SM_CONTENT_DIR"] = os.path.join(repo, "content")
import tts
voice = "en_US-john-medium"
adopted = changed = 0
for root, _, files in os.walk(os.path.join(site, "data", "lessons")):
    for fn in files:
        d = json.load(open(os.path.join(root, fn)))
        if not d.get("audio"):
            continue
        key = d["key"]; sid, rest = key.split("/", 1)
        md = os.path.join(repo, "content", sid, "lessons", rest + ".md")
        text = open(md).read()
        if text.strip() != d["markdown"].strip():
            changed += 1; print("CHANGED", key); continue
        if d.get("voice") != "piper:" + voice:
            print("VOICE", key, d.get("voice")); continue
        segs = tts.speech_segments(text)
        sha = hashlib.sha256(json.dumps([voice, tts.LENGTH_SCALE, segs]).encode()).hexdigest()
        src = os.path.join(site, d["audio"]); mp3 = os.path.join(out, key + ".mp3")
        os.makedirs(os.path.dirname(mp3), exist_ok=True); shutil.copy2(src, mp3)
        dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                             "-of", "csv=p=0", mp3]).decode().strip())
        words = sum(len(__import__("re").findall(r"[A-Za-z0-9']+", s)) for s, _ in segs)
        json.dump({"key": key, "durationSec": round(dur, 2), "voice": "piper:" + voice, "textSha256": sha,
                   "words": words, "bytes": os.path.getsize(mp3), "rendered": "adopted from Mac beta 0.1.0"},
                  open(os.path.join(out, key + ".json"), "w"), indent=1)
        adopted += 1
print("adopted", adopted, "changed", changed)
