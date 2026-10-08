#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""GOAL conformance checks for the Subject Mastery web player (docs/GOAL.md).

    # against a local build (served from this process, stopped at the end)
    PLAYWRIGHT_BROWSERS_PATH=~/Downloads/subject-mastery-build/pw-browsers \\
      python3 web/tests/e2e_goal.py --dist ~/Downloads/subject-mastery-build/dist-review

    # later, against the live site (read-only: see "Safety" below)
    python3 web/tests/e2e_goal.py --base-url https://batesai.org/subjectmastery/

Options:
    --base-url URL     test a running site instead of serving --dist
    --dist DIR         built site to serve locally (default ~/Downloads/subject-mastery-build/dist-review)
    --shots DIR        evidence screenshots (default ~/Downloads/subject-mastery-build/screens-review)
    --viewports LIST   comma list of widths, default "1280,390"
    --only LIST        comma list of check groups to run (kbar,rise,known,autoplay,topics,resume,
                       plan,profile,iq,content,about,a11y,api)

Safety: it never writes to a real account. Every request to /api/* is answered by the
test itself: GET /api/subjectmastery/me says {"signedIn": false} and anything else is
refused with 403 and counted as a failure. A fresh browser context per viewport holds
no cookies. All progress, profile and plan data live in that context's localStorage.

Content-dependent choices (which subject, which pages) come from the site's own
data/catalog.json and data/subjects/*.json, so the checks keep working as content grows.
Audio is shortened by seeking to the last second, never by editing files.
Headless Chromium has no speech voices (an utterance starts and never ends), so the
autoplay checks use pages with recordings. Exit code 1 on any failure.
"""
import argparse
import functools
import http.server
import io
import json
import os
import re
import sys
import threading
import time
import urllib.request
import zlib
import struct

from playwright.sync_api import sync_playwright

BUILD = os.path.expanduser('~/Downloads/subject-mastery-build')
ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument('--base-url')
ap.add_argument('--dist', default=os.path.join(BUILD, 'dist-review'))
ap.add_argument('--shots', default=os.path.join(BUILD, 'screens-review'))
ap.add_argument('--viewports', default='1280,390')
ap.add_argument('--only', default='')
ARGS = ap.parse_args()
ONLY = set(filter(None, ARGS.only.split(',')))
SHOTS = os.path.abspath(os.path.expanduser(ARGS.shots))
os.makedirs(SHOTS, exist_ok=True)

results = []
NOTES = []


def check(name, ok, detail=''):
    results.append((name, bool(ok), detail))
    print(('PASS ' if ok else 'FAIL ') + name + (f'  [{detail}]' if detail and not ok else ''), flush=True)
    return bool(ok)


def note(text):
    NOTES.append(text)
    print('NOTE ' + text, flush=True)


def want(group):
    return not ONLY or group in ONLY


# ---------------------------------------------------------------------------
# Site data (read over HTTP so the same code runs against the live site)
# ---------------------------------------------------------------------------

# Cloudflare's bot rules answer Python's default User-Agent with 403 on the live site.
UA = {'User-Agent': 'subject-mastery-e2e/1.0 (+https://batesai.org; help@batesai.org)'}


def http_get(url, timeout):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout)


def fetch_json(base, rel):
    with http_get(base + rel, 30) as r:
        return json.loads(r.read().decode('utf-8'))


def walk(node, out, path):
    """Path order: a node's own lessons first, then its modules, depth first (tree.js)."""
    for ls in node.get('lessons', []) or []:
        out.append(dict(ls, parent=path))
    for m in node.get('modules', []) or []:
        walk(m, out, path + [m['id']])
    return out


class Subject:
    def __init__(self, raw):
        self.raw = raw
        self.id = raw['id']
        self.title = raw['title']
        self.lessons = walk(raw, [], [raw['id']])
        self.text = [l for l in self.lessons if l.get('hasText')]
        self.keys = [l['key'] for l in self.text]
        self.audio = {l['key'] for l in self.text if l.get('hasAudio')}
        self.modules = raw.get('modules', []) or []

    def module_keys(self, m):
        return [l['key'] for l in walk(m, [], []) if l.get('hasText')]

    def deep_nodes(self):
        """Topics nested two or more levels deep (subject/m/t…), with their text lesson keys."""
        found = []

        def rec(node, key, depth):
            for m in node.get('modules', []) or []:
                k = f'{key}/{m["id"]}'
                if depth >= 1:
                    found.append((k, m, self.module_keys(m)))
                rec(m, k, depth + 1)
        rec(self.raw, self.id, 0)
        return found


# ---------------------------------------------------------------------------
# Browser helpers
# ---------------------------------------------------------------------------

class StaticServer(http.server.ThreadingHTTPServer):
    request_queue_size = 128   # http.server's default backlog of 5 resets parallel module loads
    daemon_threads = True


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    """Static files with HTTP Range support. Browsers seek inside an MP3 with byte ranges;
    http.server ignores Range, so without this a seek (or "resume at 3:12") silently fails.
    Cloudflare Pages honours Range, and so must any server that hosts the player."""
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '.webmanifest': 'application/manifest+json', '.mjs': 'text/javascript'}

    def log_message(self, *args):
        pass

    def send_head(self):
        rng = self.headers.get('Range')
        path = self.translate_path(self.path)
        m = re.match(r'bytes=(\d*)-(\d*)$', rng or '')
        if not m or not os.path.isfile(path):
            return super().send_head()
        size = os.path.getsize(path)
        start = int(m.group(1)) if m.group(1) else max(0, size - int(m.group(2) or 0))
        end = int(m.group(2)) if m.group(1) and m.group(2) else size - 1
        end = min(end, size - 1)
        if start >= size or start > end:
            self.send_error(416)
            return None
        f = open(path, 'rb')
        f.seek(start)
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(end - start + 1))
        self.end_headers()
        self._range_left = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        left = getattr(self, '_range_left', None)
        if left is None:
            return super().copyfile(source, outputfile)
        try:
            while left > 0:
                buf = source.read(min(65536, left))
                if not buf:
                    break
                outputfile.write(buf)
                left -= len(buf)
        except (BrokenPipeError, ConnectionResetError):
            pass   # the browser cancels range requests freely while seeking
        finally:
            self._range_left = None

    def end_headers(self):
        if not getattr(self, '_range_left', None):
            self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()


BLOCKED = []


def guard_api(ctx):
    """Answer /api/* inside the test: signed out, and nothing is ever written anywhere."""
    def handler(route, request):
        url = request.url
        if request.method == 'GET' and url.split('?')[0].endswith('/api/subjectmastery/me'):
            return route.fulfill(status=200, content_type='application/json', body='{"signedIn": false}')
        BLOCKED.append(f'{request.method} {url}')
        return route.fulfill(status=403, content_type='application/json', body='{"error": "blocked by e2e_goal"}')
    ctx.route('**/api/**', handler)


def attach(page, bucket):
    def on_console(msg):
        if msg.type == 'error':
            bucket.append(('console', msg.text, (msg.location or {}).get('url', '')))
    page.on('console', on_console)
    page.on('pageerror', lambda e: bucket.append(('pageerror', str(e), '')))
    page.on('dialog', lambda d: (bucket.append(('dialog', d.message, '')), d.dismiss()))
    page.on('response', lambda r: bucket.append(('http', f'{r.status} {r.url}', '')) if r.status >= 400 else None)


class Run:
    def __init__(self, browser, base, width, height, label, subjects):
        self.base = base
        self.label = label
        self.width = width
        self.subjects = subjects
        self.ctx = browser.new_context(viewport={'width': width, 'height': height}, accept_downloads=False)
        guard_api(self.ctx)
        self.page = self.ctx.new_page()
        self.bucket = []
        attach(self.page, self.bucket)

    # -- navigation and state ------------------------------------------------
    def goto(self, route, wait='#main > *'):
        self.page.goto(self.base + route)
        self.page.wait_for_selector(wait, timeout=15000)
        self.page.wait_for_function("!document.querySelector('#main .state-loading')", timeout=15000)
        self.page.wait_for_timeout(150)

    def fresh(self):
        """Empty localStorage/sessionStorage, then a cold load of the catalog."""
        self.page.goto(self.base + 'favicon.svg')
        self.page.evaluate('localStorage.clear(); sessionStorage.clear()')
        self.goto('#/', '.subject-card')

    def seed(self, progress):
        self.page.goto(self.base + 'favicon.svg')
        self.page.evaluate('(p) => localStorage.setItem("sm.progress.v1", JSON.stringify(p))', progress)

    def progress(self):
        return self.page.evaluate("JSON.parse(localStorage.getItem('sm.progress.v1') || '{}')")

    def status(self, key):
        return (self.progress().get(key) or {}).get('status')

    def ls(self, key):
        return self.page.evaluate(f"JSON.parse(localStorage.getItem('{key}') || 'null')")

    def hash(self):
        return self.page.evaluate('location.hash')

    def wait_hash(self, want_hash, timeout=12):
        try:
            self.page.wait_for_function('(h) => location.hash === h', arg=want_hash, timeout=timeout * 1000)
            return True
        except Exception:
            return False

    def wait_hash_change(self, from_hash, timeout=12):
        try:
            self.page.wait_for_function('(h) => location.hash !== h', arg=from_hash, timeout=timeout * 1000)
            self.page.wait_for_timeout(150)
            return True
        except Exception:
            return False

    def shot(self, name, full=False):
        self.page.screenshot(path=os.path.join(SHOTS, f'goal_{self.label}_{name}.png'), full_page=full)

    # -- knowledge bar ---------------------------------------------------------
    def kbar(self):
        return self.page.evaluate("""() => [...document.querySelectorAll('.kbar:not([hidden]) .kbar-row')].map((r) => {
            const t = r.querySelector('.kbar-track'); const b = r.getBoundingClientRect();
            return { label: r.querySelector('.kbar-label').textContent.trim(),
                     pct: Number(t.getAttribute('aria-valuenow')), exact: Number(t.dataset.exact),
                     done: Number(t.dataset.done), total: Number(t.dataset.total),
                     top: b.top, bottom: b.bottom }; })""")

    def subject_bar(self):
        rows = self.kbar()
        return rows[0] if rows else None

    # -- player ------------------------------------------------------------------
    def playing(self):
        return self.page.evaluate("(() => { const b = document.querySelector('.play-btn'); return !!b && b.getAttribute('aria-label') === 'Pause'; })()")

    def wait_playing(self, timeout=8):
        try:
            self.page.wait_for_function("(() => { const b = document.querySelector('.play-btn'); return !!b && b.getAttribute('aria-label') === 'Pause'; })()", timeout=timeout * 1000)
            return True
        except Exception:
            return False

    def wait_duration(self, timeout=10):
        try:
            self.page.wait_for_function("(() => { const d = document.querySelector('.time-dur'); return d && /\\d/.test(d.textContent); })()", timeout=timeout * 1000)
            return True
        except Exception:
            return False

    def seek_near_end(self, before=1.0):
        """Drive the real scrubber (input + change), as a listener dragging to the end would."""
        self.page.evaluate("""(before) => { const s = document.querySelector('.scrub');
            s.value = String(Math.max(0, Number(s.max) - before));
            s.dispatchEvent(new Event('input', { bubbles: true }));
            s.dispatchEvent(new Event('change', { bubbles: true })); }""", before)

    def pause_if_playing(self):
        if self.playing():
            self.page.locator('.play-btn').click()
            self.page.wait_for_timeout(150)

    def close(self):
        self.ctx.close()

    def errors(self):
        return [b for b in self.bucket]


def lesson_route(key):
    return '#/l/' + key


# ---------------------------------------------------------------------------
# Checks
# ---------------------------------------------------------------------------

def g_kbar(r, S):
    """GOAL: each subject has its own "(subject) knowledge" bar at the top, always present."""
    m1 = S.modules[0]
    first = S.keys[0]
    screens = [('subject', '#/s/' + S.id, 1), ('topic', f'#/s/{S.id}/{m1["id"]}', 2), ('lesson', lesson_route(first), 2)]
    for name, route, rows in screens:
        r.goto(route, '.kbar-row')
        bars = r.kbar()
        labels = [b['label'] for b in bars]
        check(f'[{r.label}] kbar on {name} screen reads "{S.title} knowledge"', bars and labels[0] == f'{S.title} knowledge', json.dumps(labels))
        if rows == 2:
            check(f'[{r.label}] kbar on {name} screen adds the topic bar "{m1["title"]} knowledge"',
                  len(bars) == 2 and labels[1] == f'{m1["title"]} knowledge', json.dumps(labels))
        top0 = r.page.evaluate("document.querySelector('.kbar').getBoundingClientRect().top")
        r.page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)')
        r.page.wait_for_timeout(350)
        scrolled = r.page.evaluate('window.scrollY')
        info = r.page.evaluate("""() => { const k = document.querySelector('.kbar'); const b = k.getBoundingClientRect();
            const el = document.elementFromPoint(Math.min(innerWidth - 5, b.left + 40), b.top + b.height / 2);
            return { top: b.top, bottom: b.bottom, height: b.height, onTop: !!el && k.contains(el) }; }""")
        # Scrolled at least 50 px, yet the bar has not moved: it is pinned under the header.
        check(f'[{r.label}] kbar stays visible at the top while scrolled ({name}, scrollY={int(scrolled)})',
              scrolled > 50 and abs(info['top'] - top0) < 1 and 0 <= info['top'] <= 120 and info['onTop'] and info['height'] > 10,
              json.dumps([top0, info]))
        r.shot(f'kbar_sticky_{name}')


def g_rise(r, S):
    """GOAL: the % moves up when the user completes a single page: audio end, Already Known, Mark as known."""
    r.fresh()
    # (a) audio ending
    la = next((k for k in S.keys if k in S.audio), None)
    if not la:
        check(f'[{r.label}] rise by audio end: a page with a recording exists', False, 'no recorded page in ' + S.id)
        return
    r.goto(lesson_route(la), '.play-btn')
    r.wait_duration()
    before = r.subject_bar()
    r.page.locator('.play-btn').click()
    r.wait_playing()
    r.seek_near_end()
    ended = r.wait_hash_change(lesson_route(la), 15)
    r.page.wait_for_timeout(900)   # the bar animates
    after = r.subject_bar()
    r.pause_if_playing()
    ok = ended and r.status(la) == 'completed' and after['exact'] > before['exact'] and (after['pct'] > before['pct'] or after['total'] > 100)
    check(f'[{r.label}] % rises after a page\'s audio ends ({before["pct"]}% -> {after["pct"]}%, marked completed)', ok,
          json.dumps([before, after, r.status(la), r.hash()]))
    r.shot('rise_audio_end')

    # (b) Already Known at the top of the page
    lb = r.hash()[len('#/l/'):]
    r.goto(lesson_route(lb), '.lesson-title-row')
    before = r.subject_bar()
    r.page.get_by_role('button', name='Already Known', exact=True).click()
    moved = r.wait_hash_change(lesson_route(lb))
    r.page.wait_for_timeout(900)
    after = r.subject_bar()
    check(f'[{r.label}] % rises after "Already Known" ({before["pct"]}% -> {after["pct"]}%, marked known)',
          moved and r.status(lb) == 'known' and after['exact'] > before['exact'] and (after['pct'] > before['pct'] or after['total'] > 100),
          json.dumps([before, after, r.status(lb)]))
    r.shot('rise_already_known')

    # (c) Mark as known at the bottom of the text
    lc = r.hash()[len('#/l/'):]
    r.goto(lesson_route(lc), '.text-end')
    r.pause_if_playing()
    before = r.subject_bar()
    end = r.page.locator('.text-end')
    end.scroll_into_view_if_needed()
    btn = end.get_by_role('button', name='Mark as known', exact=True)
    below_text = r.page.evaluate("""() => { const a = document.querySelector('.prose').getBoundingClientRect();
        const b = document.querySelector('.text-end').getBoundingClientRect(); return b.top >= a.bottom - 1; }""")
    r.shot('rise_mark_as_known_bottom')
    btn.click()
    moved = r.wait_hash_change(lesson_route(lc))
    r.page.wait_for_timeout(900)
    after = r.subject_bar()
    check(f'[{r.label}] % rises after "Mark as known" under the text ({before["pct"]}% -> {after["pct"]}%)',
          below_text and moved and r.status(lc) == 'known' and after['exact'] > before['exact'] and (after['pct'] > before['pct'] or after['total'] > 100),
          json.dumps([below_text, before, after, r.status(lc)]))


def g_known_every_page(r, subjects):
    """GOAL: every page has "Already Known", which marks it known and skips to the next page."""
    r.fresh()
    total = 0
    for S in subjects:
        failures = []
        r.goto(lesson_route(S.keys[0]), '.lesson-title-row')
        for i, key in enumerate(S.keys):
            if r.hash() != lesson_route(key):
                failures.append(f'expected to be on {key}, on {r.hash()}')
                break
            r.page.wait_for_selector('.lesson-title-row .btn-known', timeout=10000)
            r.page.get_by_role('button', name='Already Known', exact=True).click()
            if i + 1 < len(S.keys):
                if not r.wait_hash(lesson_route(S.keys[i + 1])):
                    failures.append(f'{key}: did not advance (on {r.hash()})')
                    break
                r.page.wait_for_selector('#main .lesson', timeout=10000)
            else:
                # the last written page hands back to its topic's path (it has no next page)
                try:
                    r.page.wait_for_function('(p) => location.hash.startsWith(p)', arg=f'#/s/{S.id}', timeout=10000)
                except Exception:
                    failures.append(f'{key}: last page did not return to the path ({r.hash()})')
            total += 1
        p = r.progress()
        not_known = [k for k in S.keys if (p.get(k) or {}).get('status') != 'known']
        r.goto('#/s/' + S.id, '.kbar-row')
        bar = r.subject_bar()
        check(f'[{r.label}] Already Known on every {S.title} page ({len(S.keys)} pages) marks it known and advances; bar ends at 100%',
              not failures and not not_known and bar['pct'] == 100, json.dumps([failures[:3], not_known[:3], bar]))
        # every page done: selecting the subject starts again at the beginning
        r.goto('#/', '.subject-card')
        btn = r.page.get_by_role('button', name=f'Review {S.title}', exact=True)
        has_review = btn.count() == 1
        if has_review:
            btn.click()
            r.wait_hash_change('#/')
        at_start = r.hash() == lesson_route(S.keys[0])
        r.pause_if_playing()
        check(f'[{r.label}] {S.title} fully known: the subject button says Review and starts at the first page', has_review and at_start, r.hash())
    r.shot('known_every_page_done')
    return total


def consecutive_audio(S, n=3, start_after=None):
    keys = S.keys
    for i in range(len(keys) - n + 1):
        if all(k in S.audio for k in keys[i:i + n]):
            return keys[i:i + n]
    return None


def g_autoplay(r, S):
    """GOAL: pages auto-play continuously and are marked as the user listens."""
    r.fresh()
    run = consecutive_audio(S, 3)
    if not run:
        check(f'[{r.label}] autoplay: three consecutive recorded pages exist in {S.title}', False)
        return
    r.goto(lesson_route(run[0]), '.play-btn')
    r.wait_duration()
    r.page.locator('.play-btn').click()   # the only click in this check
    started = []
    for i, key in enumerate(run):
        started.append(r.wait_playing(10))
        r.wait_duration()
        r.seek_near_end()
        if not r.wait_hash_change(lesson_route(key), 15):
            break
    r.page.wait_for_timeout(300)
    next_playing = r.wait_playing(10)
    r.shot('autoplay_after_three_pages')
    r.pause_if_playing()
    statuses = [r.status(k) for k in run]
    check(f'[{r.label}] continuous autoplay: 3 pages played back to back with one click, each marked completed',
          all(started) and statuses == ['completed'] * 3 and next_playing, json.dumps([started, statuses, next_playing, r.hash()]))
    # The mini-player keeps play/pause and the skip within reach while reading
    r.goto(lesson_route(run[0]), '.play-btn')
    r.page.evaluate('window.scrollTo(0, 1400)')
    r.page.wait_for_timeout(400)
    mini = r.page.locator('.mini-player')
    check(f'[{r.label}] scrolled into the text, the mini-player docks with play/pause', mini.is_visible() and mini.locator('.mini-play').count() == 1)
    r.shot('mini_player')


def g_topics(r, S):
    """GOAL: subjects break down into topics; each topic has its own bar and resume point."""
    r.fresh()
    mods = [m for m in S.modules if len(S.module_keys(m)) >= 2][:2]
    if len(mods) < 2:
        check(f'[{r.label}] topics: {S.title} has two topics with written pages', False)
        return
    m1, m2 = mods
    k1, k2 = S.module_keys(m1), S.module_keys(m2)
    # each topic section on the subject page carries its own bar
    r.goto('#/s/' + S.id, '.module')
    labels = r.page.evaluate("[...document.querySelectorAll('.module .bar')].map((b) => b.getAttribute('aria-label'))")
    written = [m for m in S.modules if S.module_keys(m)]
    check(f'[{r.label}] every written topic on the {S.title} page has its own knowledge bar ({len(labels)})',
          labels == [f'{m["title"]} knowledge' for m in written], json.dumps(labels[:4]))
    # mark the first page of topic 1 known, then each topic resumes on its own
    r.goto(lesson_route(k1[0]), '.lesson-title-row')
    r.page.get_by_role('button', name='Already Known', exact=True).click()
    r.wait_hash_change(lesson_route(k1[0]))
    r.goto(f'#/s/{S.id}/{m1["id"]}', '.progress-panel')
    bars = r.kbar()
    panel = r.page.locator('.progress-panel').text_content()
    check(f'[{r.label}] topic page shows "{m1["title"]} knowledge" under the subject bar, with its own %',
          len(bars) == 2 and bars[1]['label'] == f'{m1["title"]} knowledge' and bars[1]['pct'] > bars[0]['pct'] and f'{m1["title"]} knowledge' in panel,
          json.dumps(bars))
    r.shot('topic_own_bar')
    r.page.get_by_role('button', name=f'Continue {m1["title"]}', exact=True).first.click()
    r.wait_hash_change(f'#/s/{S.id}/{m1["id"]}')
    r.pause_if_playing()
    check(f'[{r.label}] topic "{m1["title"]}" resumes at its first unfinished page', r.hash() == lesson_route(k1[1]), r.hash())
    r.goto(f'#/s/{S.id}/{m2["id"]}', '.progress-panel')
    r.page.get_by_role('button', name=f'Start {m2["title"]}', exact=True).first.click()
    r.wait_hash_change(f'#/s/{S.id}/{m2["id"]}')
    r.pause_if_playing()
    check(f'[{r.label}] topic "{m2["title"]}" has its own resume point (its first page)', r.hash() == lesson_route(k2[0]), r.hash())
    deep = S.deep_nodes()
    if deep:
        key, node, keys = deep[0]
        r.goto('#/s/' + key, '.kbar-row')
        bars = r.kbar()
        check(f'[{r.label}] nested sub-topic {key} has its own bar', len(bars) == 2 and bars[1]['label'] == f'{node["title"]} knowledge', json.dumps(bars))
    else:
        note(f'{S.title}: the published tree has one level of topics, so deeper sub-topics were checked only in the fixture e2e.')


def g_resume(r, S):
    """GOAL: selecting a subject resumes where the user left off (or the beginning); any page can be started."""
    r.fresh()
    btn = r.page.get_by_role('button', name=f'Start {S.title}', exact=True)
    check(f'[{r.label}] new learner: catalog button reads "Start {S.title}"', btn.count() == 1)
    btn.click()
    r.wait_hash_change('#/')
    r.pause_if_playing()
    check(f'[{r.label}] Start opens the first page of {S.title}', r.hash() == lesson_route(S.keys[0]), r.hash())
    for k in S.keys[:2]:
        r.goto(lesson_route(k), '.lesson-title-row')
        r.page.get_by_role('button', name='Already Known', exact=True).click()
        r.wait_hash_change(lesson_route(k))
    r.pause_if_playing()
    r.goto('#/', '.subject-card')
    r.page.wait_for_function("(t) => !!document.querySelector(`[aria-label='Continue ${t}']`)", arg=S.title, timeout=8000)
    r.shot('resume_catalog_continue')
    r.page.get_by_role('button', name=f'Continue {S.title}', exact=True).click()
    r.wait_hash_change('#/')
    r.pause_if_playing()
    check(f'[{r.label}] Continue {S.title} resumes at the first unfinished page (page 3)', r.hash() == lesson_route(S.keys[2]), r.hash())
    # start anywhere: a page from the middle of the path, by its row
    mid = S.keys[len(S.keys) // 2]
    r.goto('#/s/' + S.id, '.lesson-link')
    link = r.page.locator(f'a.lesson-link[data-fid="l-{mid}"]')
    link.scroll_into_view_if_needed()
    link.click()
    r.page.wait_for_function('(h) => location.hash === h', arg=lesson_route(mid), timeout=8000)
    r.page.wait_for_selector('.lesson-title-row')
    title = r.page.locator('.lesson h1').text_content().strip()
    want_title = next(l['title'] for l in S.text if l['key'] == mid)
    check(f'[{r.label}] any page can be started directly from the path ("{want_title}")', title == want_title, title)
    if mid in S.audio:
        r.wait_duration()
        r.page.locator('.play-btn').click()
        check(f'[{r.label}] the directly opened page plays', r.wait_playing())
        r.pause_if_playing()
    r.page.goto(r.base + 'favicon.svg')
    r.goto(lesson_route(S.keys[-1]), '.lesson h1')
    check(f'[{r.label}] a deep link to any page opens that page', r.page.locator('.lesson h1').count() == 1)


def blocks(r):
    return [b['topicKey'] for b in (r.ls('sm.plan.v1') or {}).get('blocks', [])]


def drag(r, source, target_box_fn, at='end'):
    page = r.page
    src = source.bounding_box()
    page.mouse.move(src['x'] + src['width'] / 2, src['y'] + src['height'] / 2)
    page.mouse.down()
    page.mouse.move(src['x'] + src['width'] / 2 + 20, src['y'] + src['height'] / 2 + 20, steps=4)
    t = target_box_fn()
    y = t['y'] + t['height'] - 10 if at == 'end' else t['y'] + 4
    page.mouse.move(t['x'] + t['width'] / 2, y, steps=10)
    page.wait_for_timeout(120)
    page.mouse.up()
    page.wait_for_timeout(200)


def show_editor(r):
    r.page.evaluate("""() => { const p = document.querySelector('.palette').getBoundingClientRect();
        window.scrollTo(0, window.scrollY + p.top - 76); }""")
    r.page.wait_for_timeout(250)


def g_plan(r, A, B):
    """GOAL: Study Plan by drag and drop on the profile; a Study Plan tab plays it (3 x A, then 1 x B)."""
    r.fresh()
    # Pages without a recording cannot finish in headless Chromium (no speech voices), so if
    # any of the first unfinished pages lack audio, mark those pages known first (still a real
    # learner state: the plan then plays the next unfinished pages, which is the rule under test).
    seed = {}
    now = int(time.time() * 1000)
    for S in (A, B):
        for k in S.keys:
            if k not in S.audio:
                seed[k] = {'status': 'known', 'position': 0, 'updatedAt': now}
    if seed:
        note(f'plan: {len(seed)} pages without recordings were pre-marked known so every played page has audio')
        r.seed(seed)
    r.goto('#/profile', '.palette-chip')
    show_editor(r)
    zone = lambda: r.page.locator('.plan-drop').bounding_box()   # noqa: E731
    for _ in range(3):
        drag(r, r.page.get_by_role('button', name=f'Add {A.title} to the plan', exact=True), zone)
    drag(r, r.page.get_by_role('button', name=f'Add {B.title} to the plan', exact=True), zone)
    got = blocks(r)
    groups = r.page.locator('.plan-group').all_text_contents()
    check(f'[{r.label}] plan by pointer drag: 3 x {A.title} then 1 x {B.title}', got == [A.id] * 3 + [B.id], json.dumps(got))
    check(f'[{r.label}] plan editor groups the blocks as "{A.title} x3", "{B.title}"',
          len(groups) == 2 and '×3' in groups[0] and A.title in groups[0] and B.title in groups[1], json.dumps(groups))
    r.shot('plan_editor_pointer')
    # reorder a group by dragging its handle to the top, then back
    drag(r, r.page.locator('.plan-group').nth(1).locator('.grip-btn'), lambda: r.page.locator('.plan-group').first.bounding_box(), at='start')
    check(f'[{r.label}] plan: dragging a group handle reorders it', blocks(r) == [B.id] + [A.id] * 3, json.dumps(blocks(r)))
    drag(r, r.page.locator('.plan-group').first.locator('.grip-btn'), zone)
    check(f'[{r.label}] plan: and back again', blocks(r) == [A.id] * 3 + [B.id], json.dumps(blocks(r)))

    # Touch path: the same pointer code with pointerType "touch", started from the chip's grip
    if r.width < 700:
        r.page.evaluate("""(name) => {
            const chip = [...document.querySelectorAll('.palette-chip')].find((c) => c.getAttribute('aria-label') === name);
            const grip = chip.querySelector('.chip-grip'); const g = grip.getBoundingClientRect();
            const z = document.querySelector('.plan-drop').getBoundingClientRect();
            const opt = (x, y) => ({ bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, button: 0, buttons: 1 });
            grip.dispatchEvent(new PointerEvent('pointerdown', opt(g.x + 5, g.y + 5)));
            for (let i = 1; i <= 8; i++) window.dispatchEvent(new PointerEvent('pointermove', opt(g.x + 5 + i * 4, g.y + 5 + (z.bottom - 12 - g.y) * i / 8)));
            window.dispatchEvent(new PointerEvent('pointerup', opt(g.x + 37, z.bottom - 12)));
        }""", f'Add {B.title} to the plan')
        r.page.wait_for_timeout(250)
        check(f'[{r.label}] plan: touch-style drag from a chip grip adds a block (synthetic touch pointer events)',
              blocks(r) == [A.id] * 3 + [B.id] * 2, json.dumps(blocks(r)))

    # Keyboard: clear, then build the same plan with buttons only
    r.page.get_by_role('button', name='Clear plan', exact=True).focus()
    r.page.keyboard.press('Enter')
    r.page.get_by_role('button', name='Clear', exact=True).focus()
    r.page.keyboard.press('Enter')
    check(f'[{r.label}] plan: Clear plan (keyboard) empties it', blocks(r) == [], json.dumps(blocks(r)))
    r.page.get_by_role('button', name=f'Add {A.title} to the plan', exact=True).focus()
    r.page.keyboard.press('Enter')
    for _ in range(2):
        r.page.get_by_role('button', name=f'One more {A.title} block', exact=True).focus()
        r.page.keyboard.press('Space')
    r.page.get_by_role('button', name=f'Add {B.title} to the plan', exact=True).focus()
    r.page.keyboard.press('Enter')
    kb1 = blocks(r)
    r.page.get_by_role('button', name=f'Move {B.title} up', exact=True).focus()
    r.page.keyboard.press('Enter')
    kb2 = blocks(r)
    r.page.get_by_role('button', name=f'Move {B.title} down', exact=True).focus()
    r.page.keyboard.press('Enter')
    kb3 = blocks(r)
    check(f'[{r.label}] plan by keyboard buttons: add, one more x2, add, move up, move down',
          kb1 == [A.id] * 3 + [B.id] and kb2 == [B.id] + [A.id] * 3 and kb3 == kb1, json.dumps([kb1, kb2, kb3]))
    r.shot('plan_editor_keyboard')

    # Play it from the separate Study Plan tab
    tab = r.page.locator('.tabbar-item[data-tab="plan"]' if r.width < 760 else '.tab[data-tab="plan"]')
    tab.click()
    r.page.wait_for_selector('.plan-item')
    items = r.page.locator('.plan-item').count()
    r.shot('plan_tab', full=True)
    check(f'[{r.label}] Study Plan tab lists the 4 blocks', items == 4, str(items))
    r.page.locator('.plan-actions').get_by_role('button', name='Play plan', exact=True).click()
    played, strips, started = [], [], []
    for i in range(4):
        if not r.page.wait_for_function("location.hash.startsWith('#/l/')", timeout=10000):
            break
        r.page.wait_for_selector('.plan-strip')
        played.append(r.hash()[len('#/l/'):])
        strips.append(r.page.locator('.plan-strip').text_content())
        started.append(r.wait_playing(10))
        r.wait_duration()
        if i == 1:
            r.shot('plan_playing_block2')
        r.seek_near_end()
        if not r.wait_hash_change('#/l/' + played[-1], 15):
            break
    finished = r.wait_hash('#/plan', 10)
    subj = [k.split('/')[0] for k in played]
    statuses = [r.status(k) for k in played]
    check(f'[{r.label}] Play plan: exactly 3 {A.title} pages then 1 {B.title} page, in order, back to back',
          subj == [A.id] * 3 + [B.id] and len(set(played)) == 4 and all(started) and finished,
          json.dumps([played, started, finished, r.hash()]))
    check(f'[{r.label}] Play plan: each played page is marked completed, strip shows "block n of 4"',
          statuses == ['completed'] * 4 and all(f'block {i + 1} of 4' in s for i, s in enumerate(strips)), json.dumps([statuses, strips]))
    want_first = [k for k in A.keys if k not in seed][:3]
    check(f'[{r.label}] Play plan: the {A.title} blocks played its next three unfinished pages in path order',
          played[:3] == want_first, json.dumps([played[:3], want_first]))


def png_bytes(w=160, h=160):
    """A small gradient PNG built by hand (no imaging library needed)."""
    rows = b''.join(b'\x00' + b''.join(bytes((x * 255 // w, 90, y * 255 // h)) for x in range(w)) for y in range(h))

    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(rows, 9)) + chunk(b'IEND', b''))


def g_profile(r, subjects):
    """GOAL: a fully customizable profile page."""
    r.fresh()
    r.goto('#/profile', '.profile-card')
    r.page.get_by_role('button', name='Edit profile', exact=True).click()
    r.page.fill('#pf-name', 'Goal Tester')
    r.page.fill('#pf-bio', 'Learning biology first, then economics.')
    r.page.get_by_role('button', name='Emoji', exact=True).click()
    r.page.get_by_role('button', name='Use 🦉', exact=True).click()
    r.page.get_by_role('button', name='Accent #7c3aed', exact=True).click()
    r.page.get_by_role('button', name='Dusk banner', exact=True).click()
    feats = [S.title for S in subjects[:2]]
    for t in feats:
        r.page.locator('.check', has_text=t).locator('input').check()
    r.shot('profile_edit', full=True)
    r.page.get_by_role('button', name='Save profile', exact=True).click()
    r.page.reload()
    r.page.wait_for_selector('.profile-card')
    prof = r.ls('sm.profile.v1') or {}
    shown = r.page.locator('.profile-card').text_content()
    av = r.page.locator('.profile-avatar .avatar').text_content()
    featured = r.page.locator('.featured-item > a').all_text_contents()
    banner = r.page.evaluate("getComputedStyle(document.querySelector('.profile-card')).getPropertyValue('--banner-a').trim()")
    check(f'[{r.label}] profile: name, bio, emoji avatar, accent, banner and featured subjects persist after reload',
          'Goal Tester' in shown and 'Learning biology first' in shown and av.strip() == '🦉' and prof.get('accent') == '#7c3aed'
          and prof.get('banner') == 'dusk' and banner == '#312e81' and featured == feats,
          json.dumps([prof.get('displayName'), av, prof.get('accent'), prof.get('banner'), banner, featured]))
    r.shot('profile_saved')
    # second edit: a photo avatar (resized on the device) and a custom gradient banner
    r.page.get_by_role('button', name='Edit profile', exact=True).click()
    r.page.get_by_role('button', name='Photo', exact=True).click()
    r.page.locator('.file-input').set_input_files({'name': 'me.png', 'mimeType': 'image/png', 'buffer': png_bytes()})
    r.page.wait_for_function("document.querySelector('.profile-editing .is-preview img.avatar')", timeout=8000)
    r.page.fill('input[aria-label="Banner start colour"]', '#123456')
    r.page.fill('input[aria-label="Banner end colour"]', '#abcdef')
    r.page.get_by_role('button', name='Save profile', exact=True).click()
    r.page.reload()
    r.page.wait_for_selector('.profile-card')
    prof = r.ls('sm.profile.v1') or {}
    src = r.page.locator('.profile-avatar img.avatar').get_attribute('src') or ''
    check(f'[{r.label}] profile: photo avatar (data URL under 64 KB) and custom banner persist after reload',
          src.startswith('data:image/') and len(src) <= 65536 and prof.get('banner') == '#123456,#abcdef' and prof.get('displayName') == 'Goal Tester',
          json.dumps([src[:30], len(src), prof.get('banner')]))
    r.shot('profile_photo_banner')


def g_iq(r, S):
    """GOAL: estimated IQ under the name; starts at the high-school-graduate level (100) and goes up."""
    r.fresh()
    r.goto('#/profile', '.profile-card')
    geo = r.page.evaluate("""() => { const n = document.querySelector('.profile-name'); const q = document.querySelector('.iq');
        return { next: n.nextElementSibling === q, nameBottom: n.getBoundingClientRect().bottom, iqTop: q.getBoundingClientRect().top }; }""")
    iq0 = r.page.locator('.iq-value').text_content().strip()
    text = r.page.locator('.iq').text_content()
    check(f'[{r.label}] Estimated IQ sits directly under the name and starts at 100',
          geo['next'] and geo['iqTop'] >= geo['nameBottom'] - 2 and iq0 == '100' and 'Estimated IQ' in text,
          json.dumps([geo, iq0]))
    check(f'[{r.label}] IQ is labelled a playful score with the high-school baseline', 'Not a clinical IQ test' in text and 'high-school-graduate baseline' in text, text)
    r.shot('iq_start')
    r.goto('#/s/' + S.id, '.progress-panel')
    r.page.get_by_role('button', name=f'Already know {S.title}: mark every page known', exact=True).first.click()
    r.page.wait_for_timeout(300)
    r.goto('#/profile', '.profile-card')
    iq1 = int(r.page.locator('.iq-value').text_content().strip())
    check(f'[{r.label}] Estimated IQ rises after progress (100 -> {iq1} after knowing {S.title})', iq1 > 100, str(iq1))
    r.shot('iq_after_progress')


FK_WORD = re.compile(r"[A-Za-z]+(?:'[A-Za-z]+)?")


def syllables(word):
    w = word.lower()
    groups = re.findall(r'[aeiouy]+', w)
    n = len(groups)
    if w.endswith('e') and not w.endswith(('le', 'ee')) and n > 1:
        n -= 1
    return max(1, n)


def g_content(base, subjects):
    """GOAL: content starts at entry-level college (heuristic: Flesch-Kincaid grade of each subject's first page)."""
    for S in subjects[:3]:
        key = S.keys[0]
        les = fetch_json(base, f'data/lessons/{key}.json')
        body = les['markdown'].split('\n', 1)[1]
        prose = re.split(r'^## Key ideas\s*$', body, flags=re.M)[0]
        words = FK_WORD.findall(prose)
        sentences = max(1, len(re.findall(r'[.!?]+(?=\s|$)', prose)))
        syl = sum(syllables(w) for w in words)
        fk = 0.39 * len(words) / sentences + 11.8 * syl / len(words) - 15.59
        # Flesch-Kincaid is only a hint: lessons are written for the ear, in short sentences, which
        # pulls the grade down whatever the ideas' level. The judgement is a human spot-read
        # (docs/web-player-notes.md); the automated part checks the page is a full lesson.
        note(f'content level: {key} "{les["title"]}": {len(words)} words, Flesch-Kincaid grade {fk:.1f} (hint only)')
        check(f'first page of {S.title} is a full lesson (600-1500 words of prose, {len(words)})', 600 <= len(words) <= 1500, str(len(words)))


def g_about(r, subjects):
    """About page, credits from the lessons' voice field, footer, SEO meta."""
    r.goto('#/about', '.about')
    r.page.wait_for_function("!document.querySelector('.credit-list').textContent.includes('Checking')", timeout=10000)
    t = r.page.locator('.about').text_content()
    need = ['not accredited', 'not a tutor', 'Estimated IQ is a playful learning score, not a clinical IQ test',
            'drafted by AI and reviewed by AI', 'help@batesai.org', 'docs/SOURCES.md', 'Nothing is copied from CC BY-NC-SA textbooks',
            'Piper TTS', 'GPL-3.0-or-later licence, OHF-Voice/piper1-gpl']
    missing = [n for n in need if n not in t]
    check(f'[{r.label}] About page states what it is and is not, AI drafting, sources and Piper TTS credit', not missing, json.dumps(missing))
    voices = r.page.evaluate("[...document.querySelectorAll('.credit')].map((c) => c.dataset.voice)")
    # the voice ids the published lessons actually carry (first and last recorded page per subject)
    expect = set()
    for S in subjects:
        rec = [k for k in S.keys if k in S.audio]
        for k in (rec[:1] + rec[-1:]):
            v = fetch_json(r.base, f'data/lessons/{k}.json').get('voice')
            if v:
                expect.add(v)
    check(f'[{r.label}] About credits name every voice the lessons use, from their "voice" field ({", ".join(sorted(expect))})',
          set(voices) == expect and all(r.page.locator(f'.credit[data-voice="{v}"]').text_content().find('licence') > 0 for v in voices),
          json.dumps([voices, sorted(expect)]))
    r.shot('about', full=True)
    lesson = next((k for S in subjects for k in S.keys if k in S.audio), None)
    if lesson:
        r.goto(lesson_route(lesson), '.player')
        line = r.page.locator('.voice-credit').text_content() if r.page.locator('.voice-credit').count() else ''
        check(f'[{r.label}] a recorded page credits its narration voice under the player', line.startswith('Narrated by Piper TTS'), line)
        r.pause_if_playing()
    foot = r.page.locator('.footer-legal').text_content().strip()
    check(f'[{r.label}] footer reads "© 2026 Daniel Bates / Bates LLC · batesai.org · help@batesai.org"',
          foot == '© 2026 Daniel Bates / Bates LLC · batesai.org · help@batesai.org', foot)
    meta = r.page.evaluate("""() => ({
        title: document.title, desc: (document.querySelector('meta[name=description]') || {}).content,
        og: [...document.querySelectorAll('meta[property^="og:"]')].map((m) => m.getAttribute('property')),
        theme: document.querySelectorAll('meta[name=theme-color]').length,
        manifest: (document.querySelector('link[rel=manifest]') || {}).href || '',
        icon: document.querySelector('link[rel=icon]').getAttribute('href') })""")
    man = fetch_json(r.base, 'manifest.webmanifest')
    og_ok = {'og:title', 'og:description', 'og:image', 'og:url', 'og:type'} <= set(meta['og'])
    check(f'[{r.label}] SEO/social meta: description, og:*, theme-color, manifest (relative start_url and icons)',
          bool(meta['desc']) and og_ok and meta['theme'] >= 1 and meta['manifest'].endswith('/manifest.webmanifest')
          and man.get('start_url') == './' and all(not i['src'].startswith('/') for i in man.get('icons', [])) and not meta['icon'].startswith('/'),
          json.dumps(meta)[:300])
    try:
        with http_get(r.base + 'icons/og-image.png', 20) as resp:
            og = resp.read()
        w, h = struct.unpack('>II', og[16:24])
        check(f'[{r.label}] og-image.png is published at 1200x630', (w, h) == (1200, 630), f'{w}x{h}')
    except Exception as e:
        check(f'[{r.label}] og-image.png is published', False, repr(e))


CONTRAST_JS = """(() => {
  const parse = (c) => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null;
    const p = m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const bgOf = (el) => { const stack = []; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e);
      if (cs.backgroundImage !== 'none' && !e.classList.contains('scrub')) return null;
      const c = parse(cs.backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; } }
    let out = { r: 255, g: 255, b: 255, a: 1 }; for (let i = stack.length - 1; i >= 0; i--) out = blend(stack[i], out); return out; };
  const opacity = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) o *= Number(getComputedStyle(e).opacity); return o; };
  const bad = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('[aria-hidden="true"], .sr-only, svg, .drag-ghost')) continue;
    if (el.matches(':disabled') || el.closest(':disabled')) continue;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!own) continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden') continue;
    const bg = bgOf(el); if (!bg) continue;
    const fg0 = parse(cs.color); const fg = blend({ ...fg0, a: fg0.a * opacity(el) }, bg);
    const L1 = lum(fg), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(cs.fontSize); const bold = Number(cs.fontWeight) >= 700;
    const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
    if (ratio < need) bad.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${el.textContent.trim().slice(0, 30)}" ${ratio.toFixed(2)} < ${need}`);
  }
  return [...new Set(bad)].slice(0, 12);
})()"""


def g_a11y(browser, base, S, width, label):
    """WCAG AA text contrast (light + dark), no horizontal scroll at 360 px, reduced motion, keyboard focus."""
    first = S.keys[0]
    routes = ['#/', '#/s/' + S.id, f'#/s/{S.id}/{S.modules[0]["id"]}', lesson_route(first), '#/plan', '#/profile', '#/account', '#/about']
    for scheme in ('light', 'dark'):
        ctx = browser.new_context(viewport={'width': width, 'height': 900}, color_scheme=scheme)
        guard_api(ctx)
        page = ctx.new_page()
        bad_all = {}
        for route in routes:
            page.goto(base + route)
            page.wait_for_selector('#main > *')
            page.wait_for_timeout(500)
            bad = page.evaluate(CONTRAST_JS)
            if bad:
                bad_all[route] = bad
        if scheme == 'dark':
            page.goto(base + '#/')
            page.wait_for_selector('.subject-card')
            page.wait_for_timeout(400)
            page.screenshot(path=os.path.join(SHOTS, f'goal_{label}_catalog_dark.png'), full_page=False)
        check(f'[{label}] WCAG AA text contrast on {len(routes)} screens ({scheme})', not bad_all, json.dumps(bad_all)[:900])
        ctx.close()
    if width < 700:
        ctx = browser.new_context(viewport={'width': 360, 'height': 780})
        guard_api(ctx)
        page = ctx.new_page()
        wide = {}
        for route in routes:
            page.goto(base + route)
            page.wait_for_selector('#main > *')
            page.wait_for_timeout(400)
            w = page.evaluate('[document.documentElement.scrollWidth, document.documentElement.clientWidth]')
            if w[0] > w[1]:
                wide[route] = w
        check('[360] no horizontal scroll on any screen at 360 px', not wide, json.dumps(wide))
        ctx.close()
    ctx = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
    guard_api(ctx)
    page = ctx.new_page()
    page.goto(base + '#/s/' + S.id)
    page.wait_for_selector('.kbar-fill', state='attached')
    dur = page.evaluate("getComputedStyle(document.querySelector('.kbar-fill')).transitionDuration")
    check(f'[{label}] prefers-reduced-motion turns the bar animation off', dur in ('1e-05s', '0s', '0.00001s'), dur)
    page.goto(base + lesson_route(first))
    page.wait_for_selector('.lesson-title-row')
    seen = []
    for _ in range(40):
        page.keyboard.press('Tab')
        info = page.evaluate("""() => { const a = document.activeElement; const cs = getComputedStyle(a);
            return { name: (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 40), ring: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2 }; }""")
        seen.append(info)
        if info['name'] == 'Already Known':
            break
    reached = any(s['name'] == 'Already Known' for s in seen)
    rings = all(s['ring'] for s in seen)
    check(f'[{label}] keyboard: Tab reaches "Already Known" on a page, every stop shows a focus ring', reached and rings, json.dumps(seen[-5:]))
    ctx.close()


def g_api(browser, base, S):
    """CONTRACT 4b: no API (or a broken one) -> quiet local-only mode."""
    cases = [('404', dict(status=404, content_type='text/html', body='<h1>Not found</h1>')),
             ('html-200', dict(status=200, content_type='text/html', body='<!doctype html><title>Home</title>')),
             ('json-without-signedIn', dict(status=200, content_type='application/json', body='{}')),
             ('bad-json', dict(status=200, content_type='application/json', body='{nope')),
             ('network-error', None)]
    for name, resp in cases:
        ctx = browser.new_context(viewport={'width': 1280, 'height': 900})
        hits = []

        def handler(route, request, resp=resp):
            hits.append(f'{request.method} {request.url}')
            if resp is None:
                return route.abort('failed')
            return route.fulfill(**resp)
        ctx.route('**/api/**', handler)
        page = ctx.new_page()
        bucket = []
        attach(page, bucket)
        page.goto(base + '?api=on#/')   # force the probe even on a loopback host
        page.wait_for_selector('.subject-card')
        page.wait_for_timeout(600)
        local = page.locator('.account-local').count() == 1 and page.locator('.account-slot a.btn').count() == 0
        page.goto(base + lesson_route(S.keys[0]))
        page.wait_for_selector('.lesson-title-row')
        page.get_by_role('button', name='Already Known', exact=True).click()
        page.wait_for_timeout(400)
        saved = (page.evaluate("JSON.parse(localStorage.getItem('sm.progress.v1') || '{}')").get(S.keys[0]) or {}).get('status') == 'known'
        app_errors = [b for b in bucket if b[0] in ('pageerror', 'dialog') or (b[0] == 'console' and 'Failed to load resource' not in b[1])]
        browser_net = [b for b in bucket if b[0] == 'console' and 'Failed to load resource' in b[1]]
        non_me = [h for h in hits if not h.split('?')[0].endswith('/api/subjectmastery/me')]
        check(f'/me {name}: silent local-only mode (no sign-in button, progress saved, no app errors, only /me asked)',
              local and saved and not app_errors and not non_me and len(hits) >= 1, json.dumps([local, saved, app_errors, hits]))
        if browser_net:
            note(f'/me {name}: Chromium itself logs {len(browser_net)} network line(s) ("{browser_net[0][1][:70]}"); '
                 'no page code logs anything. On a loopback host the probe is skipped, so this only happens when forced.')
        page.goto(base + '?api=auto#/')
        ctx.close()
    # default on a loopback host: the probe is skipped entirely
    if re.match(r'https?://(127\.|localhost)', base):
        ctx = browser.new_context()
        hits = []
        ctx.route('**/api/**', lambda route, request: (hits.append(request.url), route.fulfill(status=404, body='')))
        page = ctx.new_page()
        bucket = []
        attach(page, bucket)
        page.goto(base + '#/')
        page.wait_for_selector('.subject-card')
        page.wait_for_timeout(600)
        check('loopback host: no /api request at all and a clean console', not hits and not bucket, json.dumps([hits, bucket]))
        ctx.close()


# ---------------------------------------------------------------------------

def main():
    srv = None
    if ARGS.base_url:
        base = ARGS.base_url if ARGS.base_url.endswith('/') else ARGS.base_url + '/'
    else:
        root = os.path.abspath(os.path.expanduser(ARGS.dist))
        srv = StaticServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=root))
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        base = f'http://127.0.0.1:{srv.server_address[1]}/'
    print(f'base: {base}\nscreenshots: {SHOTS}')
    try:
        catalog = fetch_json(base, 'data/catalog.json')
        avail = [s['id'] for s in catalog['subjects'] if s.get('status') == 'available']
        subjects = [Subject(fetch_json(base, f'data/subjects/{sid}.json')) for sid in avail]
        subjects = [S for S in subjects if len(S.keys) >= 3]
        by_id = {S.id: S for S in subjects}
        A = by_id.get('biology') or subjects[0]
        B = by_id.get('economics') or next(S for S in subjects if S is not A)
        note(f'{len(subjects)} available subjects: ' + ', '.join(f'{S.id} {len(S.keys)} pages ({len(S.audio)} recorded)' for S in subjects))
        note(f'recorded plan check: 3 x {A.title} then 1 x {B.title}; Mathematics speech transition is checked by e2e_math_plan.py')
        if want('content'):
            g_content(base, subjects)
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--autoplay-policy=no-user-gesture-required'])
            try:
                for w in [int(x) for x in ARGS.viewports.split(',') if x.strip()]:
                    label = f'{w}'
                    r = Run(browser, base, w, 900 if w >= 700 else 844, label, subjects)
                    steps = [('kbar', lambda: g_kbar(r, A)), ('rise', lambda: g_rise(r, A)),
                             ('known', lambda: g_known_every_page(r, subjects if w >= 700 else subjects[:1])),
                             ('autoplay', lambda: g_autoplay(r, A)), ('topics', lambda: g_topics(r, A)),
                             ('resume', lambda: g_resume(r, B)), ('plan', lambda: g_plan(r, A, B)),
                             ('profile', lambda: g_profile(r, subjects)), ('iq', lambda: g_iq(r, A)),
                             ('about', lambda: g_about(r, subjects))]
                    for group, fn in steps:
                        if not want(group):
                            continue
                        try:
                            fn()
                        except Exception as e:   # keep going so one broken step does not hide the rest
                            check(f'[{label}] {group} crashed', False, repr(e)[:400])
                            try:
                                r.shot(f'crash_{group}')
                            except Exception:
                                pass
                    errs = [b for b in r.errors() if not (b[0] == 'http' and '/api/' in b[1])]
                    check(f'[{label}] no console errors, page errors, dialogs or failed requests during the run', not errs, json.dumps(errs[:6]))
                    r.close()
                    if want('a11y'):
                        try:
                            g_a11y(browser, base, A, w, label)
                        except Exception as e:
                            check(f'[{label}] a11y crashed', False, repr(e)[:400])
                if want('api'):
                    try:
                        g_api(browser, base, A)
                    except Exception as e:
                        check('api crashed', False, repr(e)[:400])
            finally:
                browser.close()
        check('no request ever reached a real account (all /api writes refused by the test)', not BLOCKED, json.dumps(BLOCKED[:5]))
    finally:
        if srv:
            srv.shutdown()
            srv.server_close()
    failed = [x for x in results if not x[1]]
    print(f'\n{len(results) - len(failed)}/{len(results)} checks passed; screenshots in {SHOTS}')
    for n in NOTES:
        print('  note:', n)
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
