#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""
voice_compare.py - A/B any number of Piper voices on the same lessons (see docs/VOICE.md).

    python3 voice_compare.py --out DIR --voices en_US-norman-medium,en_US-ryan-high A.md [B.md ...]
    python3 voice_compare.py --out DIR --report A.md [B.md ...]     # markdown table from saved results

For every voice and lesson it records render speed (x realtime), audio length and words per
minute, integrated loudness and true peak (ffmpeg ebur128), clipped samples (raw Piper WAV and
decoded MP3), worker memory, and the Groq Whisper (free whisper-large-v3) word-error-rate
against the speakable text that tts.py feeds Piper. Rendering and encoding are tts.py's own
code, so the numbers match production (same LENGTH_SCALE, pauses and loudnorm).
"WER raw" is tts.py compare's formula. "WER normalised" (--report) first evens out spellings that
are not voice errors (digits, "$", "St.", apostrophes) and sets aside whole sentences Whisper skipped.

Voices are looked up in SM_VOICES_DIR, then ~/Downloads/subject-mastery-build/voices, then
VanaVoice (read-only). Exactly one Piper process of ours runs at a time. Results are written to
DIR/results.json after every render, and a rerun skips pairs already measured. Run it with
SM_TMP_DIR set so the WAVs land outside the main pipeline's tmp folder.
"""
import argparse
import array
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import wave

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tts  # noqa: E402

SEARCH = [d for d in (os.environ.get("SM_VOICES_DIR"), os.path.join(tts.BUILD, "voices"),
                      os.path.join(tts.VANAVOICE, "voices")) if d]


def voice_dir(voice):
    for d in SEARCH:
        if os.path.exists(os.path.join(d, voice + ".onnx")):
            return d
    raise SystemExit(f"voice not found in {SEARCH}: {voice}")


def clipped(samples):
    return samples.count(32767) + samples.count(-32768)


def wav_stats(path):
    with wave.open(path, "rb") as w:
        a = array.array("h", w.readframes(w.getnframes()))
    peak = max(max(a), -min(a)) if a else 0
    return {"rawPeak": round(peak / 32768, 4), "rawClipped": clipped(a)}


def mp3_stats(path):
    pcm = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-"],
                         capture_output=True, check=True, timeout=300).stdout
    a = array.array("h", pcm)
    err = subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-nostats", "-i", path, "-filter_complex",
                          "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True,
                         timeout=300).stderr
    summary = err[err.rfind("Summary:"):]
    lufs = re.search(r"I:\s+(-?[\d.]+) LUFS", summary)
    tp = re.search(r"True peak:\s+Peak:\s+(-?[\d.]+|-inf) dBFS", summary)
    return {"lufs": float(lufs.group(1)) if lufs else None,
            "truePeakDb": float(tp.group(1)) if tp and tp.group(1) != "-inf" else None,
            "mp3Clipped": clipped(a)}


def whisper(path, tries=8):
    """tts._whisper with patience for Groq's free audio-seconds-per-hour limit (HTTP 429)."""
    for i in range(tries):
        try:
            return tts._whisper(path)
        except urllib.error.HTTPError as e:
            if e.code != 429 or i == tries - 1:
                raise
            wait = min(900, int(float(e.headers.get("retry-after") or 60)) + 5)
            print(f"    whisper 429, waiting {wait}s", flush=True)
            time.sleep(wait)


def _canon(text):
    """Word list with the spelling differences that are not voice errors evened out: Whisper writes
    "19th", "66", "St." and "God's" where the script says "nineteenth", "sixty six", "Saint", "God’s"."""
    def cardinal(n):
        if n < 100:
            return tts.two(n) or "zero"
        if n < 1000:
            return tts.two(n // 100) + " hundred" + (" " + tts.two(n % 100) if n % 100 else "")
        return cardinal(n // 1000) + " thousand" + (" " + cardinal(n % 1000) if n % 1000 else "")

    text = re.sub(r"(?<=\d),(?=\d{3})", "", text.lower().replace("’", "'"))
    text = re.sub(r"\$(\d+)", r"\1 dollars", text).replace("%", " percent ")
    text = re.sub(r"(?<=[a-z])(?=\d)", " ", text)   # "fadh2" -> "fadh 2"
    out = []
    for w in re.findall(r"[a-z0-9']+", text):
        w = w.replace("'", "")
        m = re.fullmatch(r"(\d+)(st|nd|rd|th)?", w)
        if m and m.group(2) and int(m.group(1)) < 100:
            w = tts.ordinal(int(m.group(1)))
        elif m and not m.group(2) and 1100 <= int(w) <= 2099:
            w = tts.year_words(int(w))
        elif m and not m.group(2) and int(w) < 1000000:
            w = cardinal(int(w))
        out.extend({"st": "saint", "dr": "doctor", "mr": "mister"}.get(x, x) for x in w.replace("-", " ").split())
    # tts.py spells acronyms letter by letter ("N A D H", "B C E"); Whisper writes "NADH", "BCE"
    merged, in_run = [], False
    for i, w in enumerate(out):
        single = len(w) == 1 and w.isalpha()
        nxt = out[i + 1] if i + 1 < len(out) else ""
        if single and w in "ai" and not (len(nxt) == 1 and nxt.isalpha()):
            single = False   # the words "a" and "I" after an acronym, not part of it
        if single and in_run:
            merged[-1] += w
        else:
            merged.append(w)
        in_run = single
    return merged


def norm_wer(ref, hyp, skip_run=8):
    """(word-error-rate %, words in Whisper skips): canonical spelling, and any run of >= skip_run
    reference words with no transcript at all is set aside as a Whisper skip (full-file Whisper
    sometimes drops a whole sentence; re-transcribing that slice alone shows the audio is fine)."""
    import difflib
    r, h = _canon(ref), _canon(hyp)
    errors = skipped = 0
    for op, a1, a2, b1, b2 in difflib.SequenceMatcher(None, r, h, autojunk=False).get_opcodes():
        if op == "delete" and a2 - a1 >= skip_run:
            skipped += a2 - a1
        elif op != "equal":
            errors += max(a2 - a1, b2 - b1)
    return round(100 * errors / max(1, len(r) - skipped), 2), skipped


def report(out_dir, lessons):
    rows = json.load(open(os.path.join(out_dir, "results.json")))
    refs = {}
    for path in lessons:
        with open(path) as f:
            refs[os.path.splitext(os.path.basename(path))[0]] = " ".join(s for s, _ in tts.speech_segments(f.read()))
    by_voice = {}
    for r in rows:
        if r["lesson"] not in refs:
            continue
        r["normWer"], r["skipped"] = None, 0
        txt = os.path.join(out_dir, r["voice"], r["lesson"] + ".whisper.txt")
        if os.path.exists(txt):
            with open(txt) as f:
                r["normWer"], r["skipped"] = norm_wer(refs[r["lesson"]], f.read())
        by_voice.setdefault(r["voice"], []).append(r)
    print("| Voice | WER raw | WER normalised | Mean normalised WER | Words/min | x realtime | LUFS | "
          "True peak dBFS | Clipped samples (Piper WAV / MP3) | Worker RSS MB |")
    print("|---|---|---|---|---|---|---|---|---|---|")
    for v, rs in by_voice.items():
        rs.sort(key=lambda r: r["lesson"])

        def j(fmt):
            return " · ".join(fmt.format(**r) for r in rs)
        norm = [r["normWer"] for r in rs if r.get("normWer") is not None]
        skips = sum(r.get("skipped") or 0 for r in rs)
        print(f"| {v} | {j('{wer}')} | {j('{normWer}')}{f' ({skips} words lost to a Whisper skip)' if skips else ''} | "
              f"{sum(norm) / max(1, len(norm)):.2f} | {j('{wpm}')} | {j('{xRealtime}')} | {j('{lufs}')} | "
              f"{j('{truePeakDb}')} | {j('{rawClipped} / {mp3Clipped}')} | {max(r['workerRssMb'] or 0 for r in rs)} |")
    print("\nEach cell lists the lessons in this order: " + ", ".join(sorted(refs)))
    with open(os.path.join(out_dir, "results-normalised.json"), "w") as f:
        json.dump(rows, f, indent=1)


def rss_mb(pid):
    out = subprocess.run(["ps", "-o", "rss=", "-p", str(pid)], capture_output=True, text=True).stdout.strip()
    return round(int(out) / 1024) if out else None


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--voices", help="comma-separated voice names")
    ap.add_argument("--out", required=True)
    ap.add_argument("--report", action="store_true", help="print the markdown table from saved results only")
    ap.add_argument("lessons", nargs="+")
    a = ap.parse_args()
    if a.report:
        report(a.out, a.lessons)
        return
    if not a.voices:
        ap.error("--voices is required unless --report")
    os.makedirs(a.out, exist_ok=True)
    tmp = os.environ.get("SM_TMP_DIR") or os.path.join(a.out, "tmp")
    os.makedirs(tmp, exist_ok=True)
    res_path = os.path.join(a.out, "results.json")
    results = json.load(open(res_path)) if os.path.exists(res_path) else []
    done = {(r["voice"], r["lesson"]) for r in results if r.get("wer") is not None}
    lessons = []
    for path in a.lessons:
        with open(path) as f:
            md = f.read()
        segs = tts.speech_segments(md)
        ref = " ".join(s for s, _ in segs)
        lessons.append((os.path.splitext(os.path.basename(path))[0], segs, ref, md))
    for voice in [v.strip() for v in a.voices.split(",") if v.strip()]:
        todo = [ls for ls in lessons if (voice, ls[0]) not in done]
        if not todo:
            continue
        tts.VOICES = voice_dir(voice)
        t0 = time.time()
        piper = tts.Piper(voice)
        load = time.time() - t0
        try:
            for name, segs, ref, md in todo:
                vdir = os.path.join(a.out, voice)
                os.makedirs(vdir, exist_ok=True)
                wav = os.path.join(tmp, f"{voice}-{name}.wav")
                mp3 = os.path.join(vdir, name + ".mp3")
                t1 = time.time()
                raw = piper.render(segs, wav)
                synth = time.time() - t1
                mem = rss_mb(piper.p.pid)
                ws = wav_stats(wav)
                tts.encode(wav, mp3, re.sub(r"^#\s+", "", md.splitlines()[0]).strip(), "voice test")
                os.remove(wav)
                dur = tts.duration(mp3)
                words = len(re.findall(r"[A-Za-z0-9']+", ref))
                row = {"voice": voice, "lesson": name, "voicesDir": tts.VOICES, "loadSec": round(load, 1),
                       "synthSec": round(synth, 1), "rawSec": round(raw, 1), "durationSec": round(dur, 1),
                       "xRealtime": round(dur / synth, 1), "words": words, "wpm": round(words / (dur / 60)),
                       "workerRssMb": mem, **ws, **mp3_stats(mp3), "wer": None}
                try:
                    hyp = whisper(mp3)
                    with open(os.path.join(vdir, name + ".whisper.txt"), "w") as f:
                        f.write(hyp)
                    row["wer"] = round(tts._wer(ref, hyp) * 100, 2)
                except Exception as e:  # noqa: BLE001 - keep the render, record why WER is missing
                    row["werError"] = f"{type(e).__name__}: {e}"[:300]
                results = [r for r in results if (r["voice"], r["lesson"]) != (voice, name)] + [row]
                with open(res_path + ".tmp", "w") as f:
                    json.dump(results, f, indent=1)
                os.replace(res_path + ".tmp", res_path)
                print(f"{voice} {name}: {dur:.0f}s audio, {row['wpm']} wpm, synth {synth:.0f}s "
                      f"(x{row['xRealtime']}), {row['lufs']} LUFS, TP {row['truePeakDb']} dB, "
                      f"clipped raw/mp3 {ws['rawClipped']}/{row['mp3Clipped']}, rss {mem} MB, WER {row['wer']}%",
                      flush=True)
        finally:
            piper.close()


if __name__ == "__main__":
    main()
