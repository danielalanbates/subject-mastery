#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""
build.py - assemble the static site in ~/Downloads/subject-mastery-build/dist/.

    python3 build.py            # validate content, then build dist/
    python3 build.py --check    # validate content only
    python3 build.py --no-web   # data + audio only (skip copying web/)

dist/ gets:
  * a copy of the repo's web/ folder (read-only for us; the player is built elsewhere), minus web/tests
  * data/catalog.json, data/subjects/<id>.json, data/lessons/<lesson key>.json  (CONTRACT.md v1 + v2)
  * data/search.json, the library search index (CONTRACT.md v3)
  * audio/<lesson key>.mp3 (hard links to ~/Downloads/subject-mastery-build/audio when possible)

Every id, key, colour, status and lesson file is validated against CONTRACT.md; any violation
stops the build with a non-zero exit and a list of problems. The new dist is assembled in
dist.new/ and swapped in only when complete, so a failed build never leaves a half-built dist.
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

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from subjects import BUILD, CONTENT, REPO_FIXED  # noqa: E402
import tts  # noqa: E402  (speech_segments + voice/length settings give the audio freshness hash)

# The repo's web/ (fixed path, so a local copy of the pipeline still reads the real player; never written to)
WEB = os.environ.get("SM_WEB_DIR") or os.path.join(REPO_FIXED, "web")
AUDIO = os.environ.get("SM_AUDIO_DIR") or os.path.join(BUILD, "audio")
DIST = os.environ.get("SM_DIST_DIR") or os.path.join(BUILD, "dist")

SLUG = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
MOD_ID = re.compile(r"^m\d{2}-[a-z0-9]+(-[a-z0-9]+)*$")
LES_ID = re.compile(r"^l\d{2}-[a-z0-9]+(-[a-z0-9]+)*$")
LESSON_KEY_V1 = re.compile(r"^[a-z0-9-]{1,48}/[a-z0-9-]{1,48}/[a-z0-9-]{1,48}$")
LESSON_KEY_V2 = re.compile(r"^[a-z0-9-]{1,48}(/[a-z0-9-]{1,48}){2,7}$")
COLOR = re.compile(r"^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")
STATUSES = {"available", "planned"}
MIN_WORDS, MAX_WORDS, PAGE_MAX_WORDS = 600, 1000, 1500
WPM = 150


class Problems(list):
    def add(self, where, msg):
        self.append(f"{where}: {msg}")


def slug_ok(s):
    return isinstance(s, str) and len(s) <= 48 and bool(SLUG.match(s))


def read_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def prose_and_total_words(md):
    body = "\n".join(md.splitlines()[1:])
    prose = re.split(r"^## Key ideas\s*$", body, flags=re.M)[0]

    def count(t):
        return len(re.findall(r"[A-Za-z0-9À-ɏ'’]+", re.sub(r"[#*_>`-]", " ", t)))
    return count(prose), count(body)


def check_markdown(where, md, title, subject_id, P):
    lines = md.splitlines()
    if not lines or lines[0] != f"# {title}":
        P.add(where, f"first line must be '# {title}' (is {lines[0][:60]!r})" if lines else "empty file")
    prose, total = prose_and_total_words(md)
    if not MIN_WORDS <= prose <= MAX_WORDS:
        P.add(where, f"prose has {prose} words (contract: {MIN_WORDS}-{MAX_WORDS})")
    if total > PAGE_MAX_WORDS:
        P.add(where, f"{total} words is over the {PAGE_MAX_WORDS}-word page limit")
    heads = [ln for ln in lines[1:] if ln.startswith("#")]
    if any(h != "## Key ideas" for h in heads) or len(heads) > 1:
        P.add(where, f"only one optional '## Key ideas' heading is allowed, found {heads}")
    if heads:
        tail = md.split("## Key ideas", 1)[1]
        bullets = [ln for ln in tail.splitlines() if ln.startswith("- ")]
        others = [ln for ln in tail.splitlines() if ln.strip() and not ln.startswith("- ")]
        if not 3 <= len(bullets) <= 6 or others:
            P.add(where, f"Key ideas needs 3-6 '- ' bullets and nothing else (bullets={len(bullets)}, other={len(others)})")
    if re.search(r"^\s*\|.*\|\s*$", md, re.M):
        P.add(where, "contains a table")
    if "```" in md or re.search(r"!\[", md):
        P.add(where, "contains a code block or image")
    if re.search(r"as shown (below|above)|see (the )?(figure|table|diagram)", md, re.I):
        P.add(where, "refers to something visual")
    if subject_id in ("biblical-studies", "church-history") and re.search(
            r"\b(NIV|ESV|NRSV|NASB|NLT|NKJV|RSV|CSB|New International Version|English Standard Version)\b", md):
        P.add(where, "names a copyrighted Bible translation")


def walk_modules(subject_id, node, path, P, out):
    """Depth-first: a node's own lessons first, then its nested modules (matches web/js/tree.js)."""
    seen = set()
    for ls in node.get("lessons", []) or []:
        lid = ls.get("id")
        where = "/".join(path + [str(lid)])
        if not slug_ok(lid) or not LES_ID.match(lid or ""):
            P.add(where, "lesson id must match l<NN>-slug, <= 48 chars")
        if lid in seen:
            P.add(where, "duplicate lesson id")
        seen.add(lid)
        if not isinstance(ls.get("title"), str) or not ls["title"].strip():
            P.add(where, "lesson needs a title")
        key = "/".join(path + [lid])
        if not LESSON_KEY_V2.match(key):
            P.add(where, f"lesson key {key!r} breaks the v2 key regex")
        out.append((key, ls))
    for m in node.get("modules", []) or []:
        mid = m.get("id")
        where = "/".join(path + [str(mid)])
        if not slug_ok(mid) or not MOD_ID.match(mid or ""):
            P.add(where, "module id must match m<NN>-slug, <= 48 chars")
        if mid in seen:
            P.add(where, "duplicate id among siblings")
        seen.add(mid)
        if not isinstance(m.get("title"), str) or not m["title"].strip():
            P.add(where, "module needs a title")
        walk_modules(subject_id, m, path + [mid], P, out)


def audio_info(key, md_text):
    """(fresh, sidecar) - audio is fresh when it was rendered from this exact text with the current voice."""
    mp3 = os.path.join(AUDIO, key + ".mp3")
    side = os.path.join(AUDIO, key + ".json")
    if not (os.path.exists(mp3) and os.path.exists(side)):
        return False, None
    try:
        sc = read_json(side)
    except (OSError, ValueError):
        return False, None
    voice = sc.get("voice", "").split(":", 1)[-1]
    sha = hashlib.sha256(json.dumps([voice, tts.LENGTH_SCALE, tts.speech_segments(md_text)]).encode()).hexdigest()
    return sc.get("textSha256") == sha, sc


def link_or_copy(src, dst):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    try:
        os.link(src, dst)
    except OSError:
        shutil.copy2(src, dst)


def copy_web(stage, P):
    if not os.path.isdir(WEB):
        print("web/ not present yet; building data only")
        return 0
    # Drive can stall reads; rsync under a timeout turns a stall into a clear error instead of a hang.
    cmd = ["rsync", "-a", "--exclude", "tests/", "--exclude", ".DS_Store", "--exclude", "*.tmp", "--exclude", "*.md",
           WEB + "/", stage + "/"]
    for attempt in range(3):
        try:
            subprocess.run(cmd, check=True, timeout=300)
            break
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError) as e:
            print(f"copy web/ attempt {attempt + 1} failed: {e}")
            time.sleep(15)
    else:
        P.add("web/", "could not copy web/ (Google Drive stalled?)")
        return 0
    return sum(len(fs) for _, _, fs in os.walk(stage))


def stamp_web(stage, P):
    """Give the player's CSS and every JS module a content-hash URL (?v=...).

    batesai.org's zone caches .css/.js in the browser for 4 hours by name, which hid
    updates. index.html is always revalidated, so it carries the stamps: the stylesheet
    and entry script directly, every other module through an import map (relative
    imports resolve to plain URLs, which the map rewrites). A module whose bytes did
    not change keeps its URL, so it stays cached.
    """
    idx = os.path.join(stage, "index.html")
    if not os.path.isfile(idx):
        return

    def ver(rel):
        with open(os.path.join(stage, rel), "rb") as f:
            return hashlib.sha256(f.read()).hexdigest()[:10]

    mods = sorted(os.path.relpath(os.path.join(d, n), stage).replace(os.sep, "/")
                  for d, _, ns in os.walk(os.path.join(stage, "js")) for n in ns if n.endswith(".js"))
    imports = {f"./{rel}": f"./{rel}?v={ver(rel)}" for rel in mods}
    with open(idx, encoding="utf-8") as f:
        html = f.read()
    edits = [('href="css/app.css"', f'href="css/app.css?v={ver("css/app.css")}"'),
             ('<script type="module" src="js/app.js">',
              '<script type="importmap">' + json.dumps({"imports": imports}, separators=(",", ":")) + '</script>\n  '
              f'<script type="module" src="{imports["./js/app.js"]}">')]
    for old, new in edits:
        if html.count(old) != 1:
            P.add("web/index.html", f"cannot stamp asset URLs: expected exactly one {old!r}")
            return
        html = html.replace(old, new)
    with open(idx, "w", encoding="utf-8") as f:
        f.write(html)


def _text(v):
    return v if isinstance(v, str) else ""


def search_index(catalog, subjects_out):
    """data/search.json (CONTRACT v3): one compact entry per available subject, per topic node and
    per lesson with text, in path order (catalog order, then depth first: a node, its own lessons,
    then its sub-topics, as web/js/tree.js). No lesson text, so it stays small; the same input always
    gives the same bytes. web/js/search.js entriesFromSubjects() builds the identical list in the
    browser when a host has no search.json."""
    entries = []
    for s in catalog.get("subjects", []):
        subj = subjects_out.get(s.get("id"))
        if s.get("status") != "available" or subj is None:
            continue
        sid = subj["id"]
        entries.append({"key": sid, "kind": "subject", "title": subj["title"], "summary": _text(subj.get("tagline")),
                        "breadcrumb": []})

        def walk(node, path, crumbs):
            for ls in node.get("lessons", []) or []:
                if ls.get("hasText"):
                    entries.append({"key": ls["key"], "kind": "lesson", "title": ls["title"],
                                    "summary": _text(ls.get("summary")), "breadcrumb": crumbs, "minutes": ls["minutes"]})
            for m in node.get("modules", []) or []:
                key = "/".join(path + [m["id"]])
                summary = m.get("summary") if isinstance(m.get("summary"), str) else _text(m.get("tagline"))
                entries.append({"key": key, "kind": "topic", "title": m["title"], "summary": summary,
                                "breadcrumb": crumbs})
                walk(m, path + [m["id"]], crumbs + [m["title"]])
        walk(subj, [sid], [subj["title"]])
    return {"version": 1, "entries": entries}


def build(check_only=False, with_web=True):
    P = Problems()
    catalog = read_json(os.path.join(CONTENT, "catalog.json"))
    if catalog.get("version") != 1:
        P.add("catalog.json", "version must be 1")
    ids = set()
    subjects_out, lessons_out, audio_out = {}, {}, []
    stats = {}
    for s in catalog.get("subjects", []):
        sid = s.get("id")
        where = f"catalog.json:{sid}"
        if not slug_ok(sid):
            P.add(where, "subject id must be a slug <= 48 chars")
        if sid in ids:
            P.add(where, "duplicate subject id")
        ids.add(sid)
        if s.get("status") not in STATUSES:
            P.add(where, f"status must be one of {sorted(STATUSES)}")
        for f in ("title", "tagline", "category"):
            if not isinstance(s.get(f), str) or not s[f].strip():
                P.add(where, f"missing {f}")
        if s.get("status") != "available":
            continue
        sp = os.path.join(CONTENT, sid, "subject.json")
        if not os.path.exists(sp):
            P.add(where, "available subject has no subject.json")
            continue
        subj = read_json(sp)
        if subj.get("id") != sid:
            P.add(sp, f"id {subj.get('id')!r} != catalog id {sid!r}")
        if not COLOR.match(str(subj.get("color", ""))):
            P.add(sp, "color must be #rgb or #rrggbb")
        for f in ("title", "tagline", "description", "category"):
            if not isinstance(subj.get(f), str) or not subj[f].strip():
                P.add(sp, f"missing {f}")
        flat = []
        walk_modules(sid, subj, [sid], P, flat)
        for key, ls in flat:
            if not LESSON_KEY_V1.match(key):
                pass  # nested (v2) keys are allowed; v1 regex only applies to flat 3-part keys
            md_path = os.path.join(CONTENT, sid, "lessons", *key.split("/")[1:]) + ".md"
            has_text = os.path.exists(md_path)
            ls["key"] = key
            ls["hasText"] = has_text
            ls["hasAudio"] = False
            ls["minutes"] = 6  # placeholder estimate for lessons not yet written
            if not has_text:
                continue
            with open(md_path, encoding="utf-8") as f:
                md = f.read()
            check_markdown(md_path, md, ls["title"], sid, P)
            prose, total = prose_and_total_words(md)
            fresh, sc = audio_info(key, md)
            if sc and not fresh:
                print(f"note: stale audio ignored for {key} (text or voice changed since rendering)")
            if fresh and (not isinstance(sc.get("durationSec"), (int, float))
                          or not 0 < sc["durationSec"] <= 600):
                P.add(key, "recorded page must have a duration greater than zero and at most 600 seconds")
                fresh = False
            dur = round(sc["durationSec"]) if fresh else None
            minutes = max(1, round(dur / 60)) if dur else max(1, round(total / WPM))
            ls["minutes"] = minutes
            ls["hasAudio"] = bool(fresh)
            rel_audio = f"audio/{key}.mp3" if fresh else None
            lessons_out[key] = {"key": key, "title": ls["title"], "markdown": md, "words": total,
                                "minutes": minutes, "audio": rel_audio, "durationSec": dur,
                                "voice": sc["voice"] if fresh else None}
            if fresh:
                audio_out.append(key)
        # module-level enrichment: topic key + counts (handy for the player; extra fields are harmless)
        def enrich(node, path):
            node_lessons = []
            for ls in node.get("lessons", []) or []:
                node_lessons.append(ls)
            for m in node.get("modules", []) or []:
                m["key"] = "/".join(path + [m["id"]])
                node_lessons += enrich(m, path + [m["id"]])
                written = [x for x in m["_all"] if x["hasText"]]
                m["lessonCount"] = len(written)
                m["minutes"] = sum(x["minutes"] for x in written)
            node["_all"] = node_lessons
            return node_lessons
        everything = enrich(subj, [sid])
        written = [x for x in everything if x["hasText"]]

        def strip(node):
            node.pop("_all", None)
            for m in node.get("modules", []) or []:
                strip(m)
        strip(subj)
        subjects_out[sid] = subj
        stats[sid] = {"modules": len(subj.get("modules", [])), "lessons_planned": len(everything),
                      "lessons_written": len(written), "audio": sum(1 for x in written if x["hasAudio"]),
                      "minutes": sum(x["minutes"] for x in written)}
        s["moduleCount"] = len(subj.get("modules", []))
        s["lessonCount"] = len(written)
        s["minutes"] = stats[sid]["minutes"]
        s["color"] = subj["color"]
        s["description"] = subj["description"]
        if not written:
            P.add(where, "available subject has no written lessons")

    if P:
        print(f"\nBUILD FAILED: {len(P)} contract problem(s):", file=sys.stderr)
        for p in P:
            print("  -", p, file=sys.stderr)
        sys.exit(2)
    for sid, st in stats.items():
        print(f"{sid}: {st['modules']} modules, {st['lessons_written']}/{st['lessons_planned']} lessons written, "
              f"{st['audio']} with audio, {st['minutes']} min")
    if check_only:
        print("check: OK")
        return

    stage = DIST + ".new"
    shutil.rmtree(stage, ignore_errors=True)
    os.makedirs(stage)
    n_web = copy_web(stage, P) if with_web else 0
    if n_web:
        stamp_web(stage, P)
    if P:
        print("\n".join(P), file=sys.stderr)
        sys.exit(2)

    def dump(rel, obj):
        p = os.path.join(stage, rel)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))

    dump("data/catalog.json", catalog)
    for sid, subj in subjects_out.items():
        dump(f"data/subjects/{sid}.json", subj)
    dump("data/search.json", search_index(catalog, subjects_out))
    for key, les in lessons_out.items():
        dump(f"data/lessons/{key}.json", les)
    for key in audio_out:
        link_or_copy(os.path.join(AUDIO, key + ".mp3"), os.path.join(stage, "audio", key + ".mp3"))
    verify(stage)
    old = DIST + ".old"
    shutil.rmtree(old, ignore_errors=True)
    if os.path.exists(DIST):
        os.rename(DIST, old)
    os.rename(stage, DIST)
    shutil.rmtree(old, ignore_errors=True)
    size = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(DIST) for f in fs)
    print(f"dist: {n_web} web files, {len(lessons_out)} lesson files, {len(audio_out)} audio files, "
          f"{size / 1e6:.1f} MB -> {DIST}")


def verify(stage):
    """Re-read what was written and check it against the contract shapes the player relies on."""
    errs = []
    cat = read_json(os.path.join(stage, "data/catalog.json"))
    for s in cat["subjects"]:
        if s["status"] == "available":
            for f in ("moduleCount", "lessonCount", "minutes"):
                if not isinstance(s.get(f), int):
                    errs.append(f"catalog {s['id']}.{f} not int")
            if not COLOR.match(s.get("color", "")) or not s.get("description"):
                errs.append(f"catalog {s['id']} color/description")
            subj = read_json(os.path.join(stage, f"data/subjects/{s['id']}.json"))

            def walk(node):
                for ls in node.get("lessons", []) or []:
                    if not LESSON_KEY_V2.match(ls.get("key", "")):
                        errs.append(f"bad key {ls.get('key')}")
                    if not isinstance(ls.get("minutes"), int) or ls["minutes"] < 1:
                        errs.append(f"{ls.get('key')} minutes")
                    if not isinstance(ls.get("hasAudio"), bool) or not isinstance(ls.get("hasText"), bool):
                        errs.append(f"{ls.get('key')} has* flags")
                    lp = os.path.join(stage, "data/lessons", ls["key"] + ".json")
                    if ls["hasText"] != os.path.exists(lp):
                        errs.append(f"{ls['key']} hasText mismatch")
                    if ls["hasText"]:
                        lj = read_json(lp)
                        for f, t in (("key", str), ("title", str), ("markdown", str), ("words", int),
                                     ("minutes", int)):
                            if not isinstance(lj.get(f), t):
                                errs.append(f"{ls['key']} lesson.{f}")
                        if lj["key"] != ls["key"] or lj["minutes"] != ls["minutes"]:
                            errs.append(f"{ls['key']} lesson/subject mismatch")
                        if ls["hasAudio"]:
                            if lj.get("audio") != f"audio/{ls['key']}.mp3" or not os.path.exists(
                                    os.path.join(stage, lj["audio"])):
                                errs.append(f"{ls['key']} audio missing")
                            if not isinstance(lj.get("durationSec"), int) or not str(lj.get("voice", "")).startswith(
                                    "piper:"):
                                errs.append(f"{ls['key']} durationSec/voice")
                        elif lj.get("audio") is not None:
                            errs.append(f"{ls['key']} audio should be null")
                for m in node.get("modules", []) or []:
                    walk(m)
            walk(subj)
    errs += verify_search(stage, cat)
    if errs:
        print("VERIFY FAILED:\n  " + "\n  ".join(errs[:50]), file=sys.stderr)
        sys.exit(3)
    print("verify: dist data matches the contract")


def verify_search(stage, cat):
    """data/search.json lists exactly the available subjects, their topics and their written lessons."""
    errs = []
    try:
        idx = read_json(os.path.join(stage, "data/search.json"))
    except (OSError, ValueError) as e:
        return [f"search.json unreadable: {e}"]
    entries = idx.get("entries") if isinstance(idx, dict) else None
    if not isinstance(entries, list) or idx.get("version") != 1:
        return ["search.json needs version 1 and an entries list"]
    available = [s["id"] for s in cat["subjects"] if s["status"] == "available"]
    if [e.get("key") for e in entries if e.get("kind") == "subject"] != available:
        errs.append("search.json subjects differ from the available catalog subjects")
    keys = set()
    for e in entries:
        k, kind = e.get("key"), e.get("kind")
        if k in keys:
            errs.append(f"search.json duplicate key {k}")
        keys.add(k)
        if kind not in ("subject", "topic", "lesson") or not isinstance(e.get("title"), str) or not e["title"] \
                or not isinstance(e.get("summary"), str) or not isinstance(e.get("breadcrumb"), list) \
                or not all(isinstance(t, str) for t in e["breadcrumb"]) or "markdown" in e:
            errs.append(f"search.json entry {k} shape")
        elif kind == "lesson" and (not LESSON_KEY_V2.match(k or "") or not isinstance(e.get("minutes"), int)
                                   or not os.path.exists(os.path.join(stage, "data/lessons", k + ".json"))):
            errs.append(f"search.json lesson {k} has no lesson file or minutes")
    n_lessons = sum(1 for _, _, fs in os.walk(os.path.join(stage, "data/lessons")) for f in fs if f.endswith(".json"))
    if sum(1 for e in entries if e.get("kind") == "lesson") != n_lessons:
        errs.append("search.json lesson count differs from the lesson files")
    return errs


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--no-web", action="store_true")
    a = ap.parse_args()
    build(a.check, not a.no_web)
