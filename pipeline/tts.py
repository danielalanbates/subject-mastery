#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""
tts.py - lesson markdown -> speakable text -> Piper WAV -> loudness-normalized MP3.

    python3 tts.py                      # every written lesson that lacks current audio
    python3 tts.py economics            # one subject
    python3 tts.py --only <lesson key>  # one lesson (repeatable)
    python3 tts.py --modules 1-2        # only modules 1 and 2 of each subject
    python3 tts.py --force              # re-render even if audio is current
    python3 tts.py --voice en_US-lessac-medium
    python3 tts.py speak <file.md>      # print the speakable text (debugging)
    python3 tts.py compare              # voice A/B: speed + Groq Whisper word-error-rate

Output: ~/Downloads/subject-mastery-build/audio/<subject>/<module>/<lesson>.mp3 plus a
sidecar <lesson>.json {durationSec, voice, textSha256, words}. Audio is "current" when the
sidecar's textSha256 and voice match, so editing a lesson re-renders only that lesson.

Exactly one Piper process runs (piper_worker.py under VanaVoice's Python, used read-only).
Stops before free disk would fall under 9 GB.
"""
import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
import uuid

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from subjects import BUILD, CONTENT, LOGS, SUBJECTS  # noqa: E402

VANAVOICE = os.path.expanduser("~/Library/Application Support/VanaVoice/engine")
PIPER_PY = os.environ.get("SM_PIPER_PYTHON") or os.path.join(VANAVOICE, "bin", "python3")
VOICES = os.environ.get("SM_VOICES_DIR") or os.path.join(BUILD, "voices")
WORKER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "piper_worker.py")
AUDIO = os.environ.get("SM_AUDIO_DIR") or os.path.join(BUILD, "audio")
TMP = os.environ.get("SM_TMP_DIR") or os.path.join(BUILD, "tmp")
LOGS = os.environ.get("SM_LOGS_DIR") or LOGS   # keeps a side render's log out of the main BUILD/logs
# Public-domain LibriVox training data; see docs/VOICE.md and NOTICE.
DEFAULT_VOICE = "en_US-john-medium"
LENGTH_SCALE = 1.15   # measured 2026-10-02: 1.08 still gave ~167 words/min overall; 1.15 measured ~160
SENTENCE_SILENCE = 0.30
PAUSE_TITLE, PAUSE_PARA, PAUSE_KEY_HEAD, PAUSE_BULLET, PAUSE_END = 1.0, 0.65, 0.6, 0.55, 1.0
MIN_FREE_GB = 9.0
LOG = None


def log(msg):
    line = f"{time.strftime('%Y-%m-%d %H:%M:%S')} {msg}"
    print(line, flush=True)
    if LOG:
        with open(LOG, "a") as f:
            f.write(line + "\n")


# ---------------------------------------------------------------- text normalisation for the ear
ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
        "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"]
TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]
ORD = {"one": "first", "two": "second", "three": "third", "five": "fifth", "eight": "eighth", "nine": "ninth",
       "twelve": "twelfth"}


def two(n):
    if n < 20:
        return ONES[n]
    t, o = divmod(n, 10)
    return TENS[t] + ("-" + ONES[o] if o else "")


def year_words(y):
    """1453 -> fourteen fifty-three; 1900 -> nineteen hundred; 1905 -> nineteen oh five; 2008 -> two thousand eight."""
    if 2000 <= y <= 2009:
        return "two thousand" + (" " + ONES[y - 2000] if y > 2000 else "")
    hi, lo = divmod(y, 100)
    if lo == 0:
        return two(hi) + " hundred"
    if lo < 10:
        return two(hi) + " oh " + ONES[lo]
    return two(hi) + " " + two(lo)


def plural_decade(w):
    # "nineteen ninety" -> "nineteen nineties"; "eighteen hundred" -> "eighteen hundreds"
    if w.endswith("y"):
        return w[:-1] + "ies"
    return w + "s"


ROMAN = {"II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10, "XI": 11, "XII": 12,
         "XIII": 13, "XIV": 14, "XV": 15, "XVI": 16, "XXIII": 23}
CARDINAL_BEFORE_ROMAN = {"War", "Vatican", "Phase", "Part", "Volume", "Book", "Chapter", "Act", "Type", "Photosystem",
                        "Polymerase", "Meiosis", "Complex"}


def ordinal(n):
    w = two(n)
    last = w.split("-")[-1]
    if last in ORD:
        o = ORD[last]
    elif last.endswith("y"):
        o = last[:-1] + "ieth"
    else:
        o = last + "th"
    return "-".join(w.split("-")[:-1] + [o])


ACRONYM_WORDS = {"NATO", "NASA", "UNESCO", "UNICEF", "OPEC", "AIDS", "ASEAN", "NAFTA", "FIFA", "SARS", "COVID",
                 "LASER", "RADAR", "SCUBA", "UNIX", "GATT", "OSHA", "FEMA", "ISIS", "SWAT", "AWOL", "OK", "I",
                 "A", "YHWH", "SPQR"}
ABBREV = [
    (r"\be\.g\.,?", "for example,"), (r"\bi\.e\.,?", "that is,"), (r"\betc\.", "and so on."),
    (r"\bvs\.?(?=\s)", "versus"), (r"\bcf\.", "compare"), (r"\bca\.\s?(?=\d)", "about "), (r"\bc\.\s(?=\d)", "about "),
    (r"\bDr\.", "Doctor"), (r"\bMr\.", "Mister"), (r"\bMrs\.", "Missus"), (r"\bSt\.(?=\s[A-Z])", "Saint"),
    (r"\bMt\.(?=\s[A-Z])", "Mount"), (r"\bU\.S\.A\.", "U S A"), (r"\bU\.S\.", "U S"), (r"\bU\.K\.", "U K"),
    (r"\bWorld War I\b", "World War One"), (r"\bVatican I\b", "Vatican One"),
    (r"\b(Elizabeth|Charles|James|Henry|Peter|Catherine|Napoleon|Francis|Frederick|Louis|William|Mary|Edward|George|"
     r"Richard|Philip|Alexander|Nicholas|Leo|Gregory|Innocent|Clement|Urban|Pius|John|Paul|Darius|Xerxes|Ferdinand|"
     r"Isabella|Selim|Suleiman|Mehmed|Chandragupta|Constantine|Justinian|Otto|Cyrus|Artaxerxes|Ramesses) I\b(?!')",
     r"\1 the First"),
    (r"\bA\.D\.", "A D"), (r"\bB\.C\.E\.", "B C E"), (r"\bB\.C\.", "B C"), (r"\bC\.E\.", "C E"),
]


def normalise(text):
    t = text.replace("\u2011", "-").replace("\u2010", "-").replace("\u202f", " ").replace("\u00a0", " ")
    for pat, rep in ABBREV:
        t = re.sub(pat, rep, t)
    t = t.replace("—", ", ").replace("–", " to ").replace(" - ", ", ")
    t = re.sub(r"\(([^)]*)\)", r", \1,", t)
    # Bible references: "John 3:16" -> "John 3, verse 16"; "3:16-18" -> "3, verses 16 to 18"
    t = re.sub(r"\b(\d{1,3}):(\d{1,3})\s?[-–]\s?(\d{1,3})\b", r"\1, verses \2 to \3", t)
    t = re.sub(r"\b(\d{1,3}):(\d{1,3})\b", r"\1, verse \2", t)
    # dates: "June 28, 1914" -> "June twenty-eighth, 1914" (Piper would say "June twenty-eight")
    t = re.sub(r"\b(January|February|March|April|May|June|July|August|September|October|November|December) "
               r"([1-9]|[12]\d|3[01])\b(?![,.]?\d)", lambda m: f"{m.group(1)} {ordinal(int(m.group(2)))}", t)
    # decades: 1990s -> nineteen nineties; 1800s -> eighteen hundreds
    t = re.sub(r"\b(1[1-9]\d0|20[0-2]0)s\b", lambda m: plural_decade(year_words(int(m.group(1)))), t)
    # bare 4-digit numbers 1100-1999 read as years ("fifteen hundred" is also natural for counts)
    t = re.sub(r"(?<![\d,.$])\b(1[1-9]\d\d)\b(?![,.]\d|\s*percent)", lambda m: year_words(int(m.group(1))), t)
    t = re.sub(r"(?<![\d,.$])\b(200\d)\b(?![,.]\d)", lambda m: year_words(int(m.group(1))), t)
    # Roman numerals after a capitalised word: World War II -> World War Two; Henry VIII -> Henry the Eighth
    def roman(m):
        word, rn = m.group(1), m.group(2)
        n = ROMAN[rn]
        return f"{word} {two(n).capitalize()}" if word in CARDINAL_BEFORE_ROMAN else f"{word} the {ordinal(n).capitalize()}"
    t = re.sub(r"\b([A-Z][a-z]+) (" + "|".join(sorted(ROMAN, key=len, reverse=True)) + r")\b(?![a-z])", roman, t)
    # science names with numerals: "RNA polymerase II", "photosystem II", "meiosis II", "type II diabetes"
    t = re.sub(r"\b(polymerase|photosystem|meiosis|type|phase|complex) (I{1,3}|IV)\b",
               lambda m: f"{m.group(1)} {two({'I': 1, 'II': 2, 'III': 3, 'IV': 4}[m.group(2)])}", t)
    # acronyms: spell letter by letter unless pronounced as a word
    def acro(m):
        w, s = m.group(1), m.group(2) or ""
        if w in ACRONYM_WORDS or w in ROMAN:
            return m.group(0)
        return " ".join(w) + (" " + s if s[:1].isdigit() else s)
    t = re.sub(r"\b([A-Z]{2,5})(s|\d{1,2})?\b", acro, t)   # NADH -> N A D H; FADH2 -> F A D H 2
    t = t.replace("&", " and ").replace("%", " percent").replace("+", " plus ").replace("=", " equals ")
    t = re.sub(r"[\"“”*_#`]", "", t)
    t = re.sub(r"\s+,", ",", t)
    t = re.sub(r",\s*,", ",", t)
    t = re.sub(r",\s*([.?!;:])", r"\1", t)
    t = re.sub(r"\s{2,}", " ", t)
    return t.strip()


def speech_segments(md):
    """Markdown lesson -> [(text, pause_after_seconds)]."""
    lines = md.strip().splitlines()
    title = re.sub(r"^#\s+", "", lines[0]).strip()
    segs = [(normalise(title.rstrip(".") + "."), PAUSE_TITLE)]
    body = "\n".join(lines[1:])
    parts = re.split(r"^##\s+Key ideas\s*$", body, flags=re.M)
    prose = parts[0]
    for para in re.split(r"\n\s*\n", prose):
        para = " ".join(ln.strip() for ln in para.splitlines() if ln.strip())
        para = re.sub(r"^#+\s*", "", para)
        if para:
            segs.append((normalise(para), PAUSE_PARA))
    if len(parts) > 1:
        segs.append(("Key ideas.", PAUSE_KEY_HEAD))
        for ln in parts[1].splitlines():
            ln = ln.strip()
            if ln.startswith(("- ", "* ")):
                b = ln[2:].strip()
                if b and not b.endswith((".", "?", "!")):
                    b += "."
                segs.append((normalise(b), PAUSE_BULLET))
    if segs:
        segs[-1] = (segs[-1][0], PAUSE_END)
    return segs


# ---------------------------------------------------------------- piper worker (exactly one)
class Piper:
    def __init__(self, voice):
        model = os.path.join(VOICES, voice + ".onnx")
        if not os.path.exists(model):
            raise SystemExit(f"voice not found: {model}")
        if not os.path.exists(PIPER_PY):
            raise SystemExit(f"VanaVoice python not found: {PIPER_PY}")
        self.p = subprocess.Popen([PIPER_PY, "-B", WORKER, model, str(LENGTH_SCALE), str(SENTENCE_SILENCE)],
                                  stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
                                  text=True, bufsize=1)
        ready = json.loads(self.p.stdout.readline())
        if not ready.get("ready"):
            raise SystemExit("piper worker failed to start")

    def render(self, segments, out_wav):
        self.p.stdin.write(json.dumps({"out": out_wav, "segments": segments}) + "\n")
        self.p.stdin.flush()
        line = self.p.stdout.readline()
        if not line:
            raise RuntimeError("piper worker died")
        r = json.loads(line)
        if not r.get("ok"):
            raise RuntimeError(r.get("error"))
        return r["seconds"]

    def close(self):
        try:
            self.p.stdin.close()
            self.p.wait(timeout=30)
        except Exception:  # noqa: BLE001
            self.p.kill()


def encode(wav, mp3, title, album):
    tmp = mp3 + ".part.mp3"
    cmd = ["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-i", wav,
           "-af", "loudnorm=I=-19:TP=-1.5:LRA=11", "-ac", "1", "-ar", "22050", "-codec:a", "libmp3lame",
           "-b:a", "40k", "-metadata", f"title={title}", "-metadata", f"album={album}",
           "-metadata", "artist=Subject Mastery", "-metadata", "copyright=(c) 2026 Daniel Bates / Bates LLC",
           tmp]
    subprocess.run(cmd, check=True, timeout=600)
    os.replace(tmp, mp3)


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of",
                          "default=noprint_wrappers=1:nokey=1", path], capture_output=True, text=True, check=True,
                         timeout=60).stdout
    return float(out.strip())


def free_gb():
    return shutil.disk_usage(os.path.expanduser("~")).free / 1e9


# ---------------------------------------------------------------- driver
def lessons_in(subject_id, modules=None):
    with open(os.path.join(CONTENT, subject_id, "subject.json")) as f:
        s = json.load(f)
    for mi, m in enumerate(s["modules"], 1):
        if modules and mi not in modules:
            continue
        for ls in m["lessons"]:
            md = os.path.join(CONTENT, subject_id, "lessons", m["id"], ls["id"] + ".md")
            yield f"{subject_id}/{m['id']}/{ls['id']}", md, s["title"]


def sidecar_ok(side, sha, voice, mp3):
    if not (os.path.exists(side) and os.path.exists(mp3)):
        return False
    try:
        with open(side) as f:
            d = json.load(f)
        return d.get("textSha256") == sha and d.get("voice") == f"piper:{voice}"
    except (OSError, ValueError):
        return False


def run(args):
    global LOG
    os.makedirs(LOGS, exist_ok=True)
    os.makedirs(TMP, exist_ok=True)
    LOG = os.path.join(LOGS, f"tts-{time.strftime('%Y%m%d')}.log")
    ids = args.subjects or list(SUBJECTS)
    mods = None
    if args.modules:
        mods = set()
        for part in args.modules.split(","):
            a, _, b = part.partition("-")
            mods.update(range(int(a), int(b or a) + 1))
    todo = []
    for sid in ids:
        for key, md, album in lessons_in(sid, mods):
            if args.only and key not in args.only:
                continue
            if not os.path.exists(md):
                continue
            with open(md) as f:
                text = f.read()
            segs = speech_segments(text)
            sha = hashlib.sha256(json.dumps([args.voice, LENGTH_SCALE, segs]).encode()).hexdigest()
            mp3 = os.path.join(AUDIO, key + ".mp3")
            side = os.path.join(AUDIO, key + ".json")
            if not args.force and sidecar_ok(side, sha, args.voice, mp3):
                continue
            todo.append((key, segs, sha, mp3, side, album, text))
    log(f"tts start: {len(todo)} lesson(s) to render with {args.voice}; free disk {free_gb():.1f} GB")
    if not todo:
        return
    piper = Piper(args.voice)
    done = 0
    try:
        for key, segs, sha, mp3, side, album, text in todo:
            if free_gb() < MIN_FREE_GB + 0.5:
                log(f"STOP: free disk {free_gb():.1f} GB is near the {MIN_FREE_GB} GB floor")
                break
            t0 = time.time()
            wav = os.path.join(TMP, f"{uuid.uuid4().hex}.wav")
            try:
                raw = piper.render(segs, wav)
                os.makedirs(os.path.dirname(mp3), exist_ok=True)
                encode(wav, mp3, re.sub(r"^#\s+", "", text.splitlines()[0]).strip(), album)
            finally:
                if os.path.exists(wav):
                    os.remove(wav)
            dur = duration(mp3)
            words = len(re.findall(r"[A-Za-z0-9']+", " ".join(s for s, _ in segs)))
            with open(side, "w") as f:
                json.dump({"key": key, "durationSec": round(dur, 2), "voice": f"piper:{args.voice}",
                           "textSha256": sha, "words": words, "bytes": os.path.getsize(mp3),
                           "rendered": time.strftime("%Y-%m-%d %H:%M:%S")}, f, indent=1)
            done += 1
            log(f"  {key}: {dur:.0f}s audio ({raw:.0f}s raw) {os.path.getsize(mp3) / 1e6:.2f} MB "
                f"in {time.time() - t0:.0f}s [{done}/{len(todo)}]")
    finally:
        piper.close()
    log(f"tts end: rendered {done}; free disk {free_gb():.1f} GB")


# ---------------------------------------------------------------- voice comparison
def _wer(ref, hyp):
    r = re.findall(r"[a-z0-9']+", ref.lower())
    h = re.findall(r"[a-z0-9']+", hyp.lower())
    d = list(range(len(h) + 1))
    for i in range(1, len(r) + 1):
        prev, d[0] = d[0], i
        for j in range(1, len(h) + 1):
            cur = d[j]
            d[j] = min(d[j] + 1, d[j - 1] + 1, prev + (r[i - 1] != h[j - 1]))
            prev = cur
    return d[len(h)] / max(1, len(r))


def _whisper(path):
    """Transcribe with Groq's free whisper-large-v3 (key from secrets.json/env; never printed)."""
    import urllib.request
    import llm
    key = llm._secret("GROQ_API_KEY")
    boundary = uuid.uuid4().hex
    with open(path, "rb") as f:
        audio = f.read()
    body = b"".join([
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"model\"\r\n\r\nwhisper-large-v3\r\n".encode(),
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"language\"\r\n\r\nen\r\n".encode(),
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"a.mp3\"\r\n"
        f"Content-Type: audio/mpeg\r\n\r\n".encode(), audio, f"\r\n--{boundary}--\r\n".encode()])
    req = urllib.request.Request("https://api.groq.com/openai/v1/audio/transcriptions", data=body, method="POST",
                                 headers={"Authorization": f"Bearer {key}", "User-Agent": llm.UA,
                                          "Content-Type": f"multipart/form-data; boundary={boundary}"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read())["text"]


def compare(md_path):
    with open(md_path) as f:
        segs = speech_segments(f.read())
    ref = " ".join(s for s, _ in segs)
    out_dir = os.path.join(BUILD, "voice-compare")
    os.makedirs(out_dir, exist_ok=True)
    for voice in ("en_US-ryan-high", "en_US-lessac-medium"):
        p = Piper(voice)
        wav = os.path.join(out_dir, voice + ".wav")
        mp3 = os.path.join(out_dir, voice + ".mp3")
        t0 = time.time()
        p.render(segs, wav)
        synth = time.time() - t0
        p.close()
        encode(wav, mp3, "voice test", "voice test")
        os.remove(wav)
        dur = duration(mp3)
        words = len(ref.split())
        try:
            hyp = _whisper(mp3)
            wer = _wer(ref, hyp)
        except Exception as e:  # noqa: BLE001
            hyp, wer = f"(whisper failed: {e})", float("nan")
        print(f"{voice}: audio {dur:.0f}s, {words / (dur / 60):.0f} words/min, synth {synth:.0f}s "
              f"(x{dur / synth:.1f} realtime), Whisper WER {wer * 100:.1f}%")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("subjects", nargs="*")
    ap.add_argument("--only", action="append")
    ap.add_argument("--modules", help="module numbers, e.g. 1 or 1-3 or 1,4")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--voice", default=DEFAULT_VOICE)
    a = ap.parse_args()
    if a.subjects and a.subjects[0] == "speak":
        with open(a.subjects[1]) as f:
            for s, p in speech_segments(f.read()):
                print(f"[{p}] {s}\n")
        return
    if a.subjects and a.subjects[0] == "compare":
        compare(a.subjects[1])
        return
    run(a)


if __name__ == "__main__":
    main()
