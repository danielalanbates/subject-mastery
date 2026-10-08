#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""Render web/icons/icon-192.png and icon-512.png from the mark with headless Chromium.

    PLAYWRIGHT_BROWSERS_PATH=... python3 web/tests/make_icons.py web/icons
"""
import os, sys
from playwright.sync_api import sync_playwright
out = sys.argv[1]
svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%">
<rect width="24" height="24" fill="#0f766e"/>
<g transform="translate(12 12) scale(0.78) translate(-12 -12)">
<path d="M6.5 16.5 10 12l3 2.5 4.5-6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="17.5" cy="8.5" r="1.6" fill="#fff"/></g></svg>'''
with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    for size in (192, 512):
        pg = b.new_page(viewport={'width': size, 'height': size})
        pg.set_content(f'<html><body style="margin:0">{svg}</body></html>')
        pg.screenshot(path=os.path.join(out, f'icon-{size}.png'), omit_background=False)
        pg.close()
    b.close()
print('ok')
