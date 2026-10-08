#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""Render web/icons/og-image.png (1200x630 social card) with headless Chromium.

    PLAYWRIGHT_BROWSERS_PATH=... python3 web/tests/make_og_image.py web/icons

The card is plain HTML drawn here (system fonts, no external assets), so it can be
re-rendered whenever the wording changes. Run it in ~/Downloads, never in Google Drive,
then copy the PNG into web/icons/.
"""
import os
import sys

from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'

ROWS = [('done', 'The Scientific Study of Life', 'Completed'),
        ('known', 'Atoms and Chemical Bonds', 'Already known'),
        ('next', 'Water and the Chemistry of Carbon', 'Up next')]

HTML = '''<!doctype html><html><head><meta charset="utf-8"><style>
* { box-sizing: border-box; }
body { margin: 0; width: 1200px; height: 630px; overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: radial-gradient(circle at 88% 12%, #d6f0ea 0, transparent 42%), #f7f6f2; color: #161d21; }
.wrap { display: grid; grid-template-columns: 1.08fr 0.92fr; gap: 56px; align-items: center; height: 100%; padding: 0 72px; }
.brand { display: flex; align-items: center; gap: 14px; font-size: 30px; font-weight: 800; letter-spacing: -0.01em; }
.mark { width: 52px; height: 52px; }
h1 { font-size: 68px; line-height: 1.02; letter-spacing: -0.035em; margin: 34px 0 22px; font-weight: 850; }
.sub { font-size: 27px; color: #4d585e; line-height: 1.35; margin: 0; }
.url { margin-top: 30px; font-size: 22px; font-weight: 700; color: #0f766e; }
.card { background: #fff; border: 1px solid #e4e1d8; border-radius: 30px; padding: 34px 32px 26px;
  box-shadow: 0 30px 60px rgba(20, 24, 26, 0.14); position: relative; }
.card:after { content: ""; position: absolute; z-index: -1; inset: 26px -18px -20px 26px; border-radius: 32px; background: #cdeee0; }
.head { display: flex; align-items: center; gap: 14px; margin-bottom: 22px; }
.mono { width: 54px; height: 54px; border-radius: 16px; background: #2da44e; color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 24px; }
.t { font-size: 28px; font-weight: 800; } .e { font-size: 15px; color: #59646a; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.label { display: flex; justify-content: space-between; font-size: 20px; font-weight: 750; margin-bottom: 10px; }
.track { height: 14px; border-radius: 99px; background: #e6e3da; overflow: hidden; margin-bottom: 22px; }
.fill { width: 38%; height: 100%; background: #2da44e; border-radius: 99px; }
.row { display: grid; grid-template-columns: 30px 1fr auto; gap: 14px; align-items: center; padding: 15px 6px; border-top: 1px solid #e4e1d8; font-size: 21px; font-weight: 650; }
.row span:last-child { font-size: 16px; color: #59646a; font-weight: 600; }
.row.next { background: #dcefe9; border-radius: 14px; border-color: transparent; padding: 15px 12px; }
.row.next span:last-child { color: #0f766e; font-weight: 800; }
.dot { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; color: #fff; font-size: 15px; font-weight: 900; }
.done .dot { background: #0f766e; } .known .dot { background: #6d28d9; } .next .dot { background: transparent; color: #0f766e; font-size: 20px; }
</style></head><body><div class="wrap">
<div>
  <div class="brand"><svg class="mark" viewBox="0 0 24 24"><rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="#0f766e"/>
  <path d="M6.5 16.5 10 12l3 2.5 4.5-6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="17.5" cy="8.5" r="1.6" fill="#fff"/></svg>Subject Mastery</div>
  <h1>Learn a whole subject, one page at a time.</h1>
  <p class="sub">Listen like a podcast or read like a book. Skip what you already know. Watch your knowledge grow.</p>
  <p class="url">batesai.org/subjectmastery</p>
</div>
<div class="card">
  <div class="head"><div class="mono">B</div><div><div class="e">Natural Sciences</div><div class="t">Biology</div></div></div>
  <div class="label"><span>Biology knowledge</span><span>38%</span></div>
  <div class="track"><div class="fill"></div></div>
  ROWS
</div></div></body></html>'''

rows = ''.join(f'<div class="row {k}"><span class="dot">{ {"done": "✓", "known": "»", "next": "▶"}[k] }</span><span>{t}</span><span>{m}</span></div>'
               for k, t, m in ROWS)

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={'width': 1200, 'height': 630})
    pg.set_content(HTML.replace('ROWS', rows))
    pg.wait_for_timeout(200)
    pg.screenshot(path=os.path.join(OUT, 'og-image.png'))
    b.close()
print('wrote', os.path.join(OUT, 'og-image.png'))
