#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
#
# Compare a built Astro dist/ against the live site, page by page.
#
#   live_diff.py <dist-dir> <out-dir> [--base https://batesai.org] [--skip-prefix subjectmastery/]
#
# For every HTML page in dist/ the live URL is fetched, both sides are reduced
# to visible text (tags, scripts, styles stripped; whitespace collapsed; asset
# hashes like Foo.AbC123xy.js normalized) and diffed. Non-HTML files are
# compared by SHA-256 of the raw bytes. Prints one line per file and writes
# full unified diffs into <out-dir>/.
#
# Known false alarms (see memory note project_batesai_website_repo):
#   - CSS minification differences (we compare text only, so these vanish)
#   - Cloudflare email obfuscation on /contact ("[email protected]")
import difflib
import hashlib
import html
import os
import re
import sys
import urllib.request

args = sys.argv[1:]
if len(args) < 2:
    sys.exit(__doc__ if __doc__ else 'usage: live_diff.py <dist> <out>')
dist, out = args[0], args[1]
base = 'https://batesai.org'
skip = []
i = 2
while i < len(args):
    if args[i] == '--base':
        base = args[i + 1].rstrip('/'); i += 2
    elif args[i] == '--skip-prefix':
        skip.append(args[i + 1]); i += 2
    else:
        sys.exit('unknown arg ' + args[i])
os.makedirs(out, exist_ok=True)

UA = {'User-Agent': 'Mozilla/5.0 (live-diff; batesai build check)'}


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()
    except Exception as e:  # network trouble: report, don't crash
        return -1, str(e).encode()


HASH_RE = re.compile(r'\.([A-Za-z0-9_-]{8})\.(js|css)\b')


def cf_decode(hexstr):
    """Cloudflare email obfuscation: first byte is an XOR key for the rest."""
    try:
        b = bytes.fromhex(hexstr)
        return ''.join(chr(c ^ b[0]) for c in b[1:])
    except ValueError:
        return hexstr


def undo_cf_email(s):
    # <a href="/cdn-cgi/l/email-protection#HEX"> -> <a href="mailto:EMAIL">
    s = re.sub(r'/cdn-cgi/l/email-protection#([0-9a-f]+)', lambda m: 'mailto:' + cf_decode(m.group(1)), s)
    # <span class="__cf_email__" data-cfemail="HEX">[email&#160;protected]</span> -> EMAIL
    s = re.sub(r'<span class="__cf_email__" data-cfemail="([0-9a-f]+)">[^<]*</span>',
               lambda m: cf_decode(m.group(1)), s)
    # the decoder script Cloudflare injects
    s = re.sub(r'<script[^>]*email-decode[^>]*></script>', '', s)
    return s


def to_text(raw):
    s = undo_cf_email(raw.decode('utf-8', 'replace'))
    s = HASH_RE.sub(r'.HASH.\2', s)
    s = re.sub(r'<script\b[^>]*>.*?</script>', ' ', s, flags=re.S | re.I)
    s = re.sub(r'<style\b[^>]*>.*?</style>', ' ', s, flags=re.S | re.I)
    s = re.sub(r'<!--.*?-->', ' ', s, flags=re.S)
    # keep link targets and image sources: they are content too
    s = re.sub(r'<a\b[^>]*\bhref="([^"]*)"[^>]*>', r' [href:\1] ', s, flags=re.I)
    s = re.sub(r'<img\b[^>]*\bsrc="([^"]*)"[^>]*>', r' [img:\1] ', s, flags=re.I)
    s = re.sub(r'<[^>]+>', '\n', s)
    s = html.unescape(s)
    lines = [re.sub(r'\s+', ' ', ln).strip() for ln in s.split('\n')]
    return [ln for ln in lines if ln]


def scripts_of(raw):
    """Inline script bodies (normalized) — catches behaviour changes the text diff hides."""
    s = HASH_RE.sub(r'.HASH.\2', undo_cf_email(raw.decode('utf-8', 'replace')))
    bodies = re.findall(r'<script\b[^>]*>(.*?)</script>', s, flags=re.S | re.I)
    return [re.sub(r'\s+', ' ', b).strip() for b in bodies if b.strip()]


results = []
for root, _dirs, files in os.walk(dist):
    for name in sorted(files):
        path = os.path.join(root, name)
        rel = os.path.relpath(path, dist)
        if any(rel.startswith(p) for p in skip):
            continue
        if rel in ('_headers', '_redirects', '_headers_merged_public'):
            continue  # Pages config files: consumed by Cloudflare, not served
        if rel.endswith('index.html'):
            url = base + '/' + rel[:-len('index.html')]
        else:
            url = base + '/' + rel
        status, live = fetch(url)
        with open(path, 'rb') as f:
            built = f.read()
        if rel.endswith('.html'):
            a, b = to_text(live), to_text(built)
            d = list(difflib.unified_diff(a, b, 'live' + url[len(base):], 'build/' + rel, lineterm='', n=1))
            sa, sb = scripts_of(live), scripts_of(built)
            ds = list(difflib.unified_diff(sa, sb, 'live-scripts', 'build-scripts', lineterm='', n=0))
            changed = sum(1 for ln in d if ln[:1] in '+-' and not ln.startswith(('+++', '---')))
            schanged = sum(1 for ln in ds if ln[:1] in '+-' and not ln.startswith(('+++', '---')))
            verdict = 'SAME' if changed == 0 and schanged == 0 else f'DIFF text={changed} scripts={schanged}'
            if d or ds:
                with open(os.path.join(out, rel.replace('/', '__') + '.diff'), 'w') as f:
                    f.write('\n'.join(d) + '\n\n# inline scripts\n' + '\n'.join(ds) + '\n')
        else:
            same = hashlib.sha256(live).hexdigest() == hashlib.sha256(built).hexdigest()
            verdict = 'SAME' if same else f'DIFF bytes live={len(live)} build={len(built)}'
        results.append((rel, status, verdict))

w = max(len(r[0]) for r in results)
for rel, status, verdict in sorted(results):
    print(f'{rel:<{w}}  live={status:<4} {verdict}')
print(f'\n{sum(1 for r in results if r[2] == "SAME")}/{len(results)} identical; diffs in {out}')
