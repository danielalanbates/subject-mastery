#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""Headless check of library search (#/search, CONTRACT v3) against the fixture site.

    python3 web/tests/make_fixture.py ~/Downloads/subject-mastery-build/fixture-dist
    PLAYWRIGHT_BROWSERS_PATH=~/Downloads/subject-mastery-build/pw-browsers \\
      python3 web/tests/e2e_search.py ~/Downloads/subject-mastery-build/fixture-dist \\
                                      ~/Downloads/subject-mastery-build/screens-search

Desktop 1280 and phone 390 (+ 360 overflow, dark theme): header and catalog fields, the
hand-over from those fields to the search screen without losing keys, results grouped by
subject with status / minutes / breadcrumb, keyboard-only use (/, arrows, Enter, Esc, Back),
a no-results query, queries and data with HTML characters (rendered as text), diacritics,
the polite result count, and the fallback that builds the index from the subject files when
data/search.json is missing. Serves on 127.0.0.1 (random port, stopped at the end). Exit 1 on
any failure.
"""
import functools
import http.server
import json
import os
import sys
import threading

from playwright.sync_api import sync_playwright

ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
ROOT = os.path.abspath(os.path.expanduser(ARGS[0] if ARGS else '~/Downloads/subject-mastery-build/fixture-dist'))
SHOTS = os.path.abspath(os.path.expanduser(ARGS[1] if len(ARGS) > 1 else '~/Downloads/subject-mastery-build/screens-search'))
os.makedirs(SHOTS, exist_ok=True)

CELL = 'biology/m01-cells/l02-the-cell'
LIPIDS = 'biology/m01-cells/t01-membranes/l01-lipids'
SCARCITY = 'economics/m01-foundations/l01-scarcity-and-choice'
OPP = 'economics/m01-foundations/l02-opportunity-cost'
HTMLQ = '<img src=x onerror=alert(1)>'
results = []


def check(name, ok, detail=''):
    results.append((name, bool(ok)))
    print(('PASS ' if ok else 'FAIL ') + name + (f'  [{detail}]' if detail and not ok else ''))


class StaticServer(http.server.ThreadingHTTPServer):
    request_queue_size = 128  # see e2e_playwright.py: the stock backlog of 5 resets module loads
    daemon_threads = True


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def shot(page, name, full=True):
    page.screenshot(path=os.path.join(SHOTS, name + '.png'), full_page=full)


def attach(page, bucket, allow_404=()):
    page.on('console', lambda m: bucket.append(('console', m.text)) if m.type == 'error' and not any(a in m.text for a in allow_404) and 'Failed to load resource' not in m.text else None)
    page.on('pageerror', lambda e: bucket.append(('pageerror', str(e))))
    page.on('dialog', lambda d: (bucket.append(('dialog', d.message)), d.dismiss()))
    page.on('response', lambda r: bucket.append(('http404', r.url)) if r.status == 404 and not any(a in r.url for a in allow_404) else None)


def active(page):
    return page.evaluate("""() => { const a = document.activeElement; return { id: a.id, tag: a.tagName, key: a.dataset ? a.dataset.key || '' : '',
        value: 'value' in a ? a.value : '', ring: getComputedStyle(a).outlineStyle !== 'none' && parseFloat(getComputedStyle(a).outlineWidth) >= 2 }; }""")


def no_hscroll(page):
    w = page.evaluate('[document.documentElement.scrollWidth, document.documentElement.clientWidth]')
    return w[0] <= w[1], w


def seed(page, base):
    # Seed progress from a non-app page so no app code races the write (see e2e_playwright.py).
    page.goto(base + 'favicon.svg')
    page.evaluate("""([a, b]) => localStorage.setItem('sm.progress.v1', JSON.stringify({
        [a]: { status: 'known', position: 0, updatedAt: Date.now() },
        [b]: { status: 'in_progress', position: 12, updatedAt: Date.now() } }))""", [CELL, SCARCITY])


def hit_texts(page):
    return page.locator('.search-hit').evaluate_all('els => els.map((e) => e.textContent)')


def desktop(browser, base):
    print('\n== Desktop 1280 ==')
    ctx = browser.new_context(viewport={'width': 1280, 'height': 900})
    page = ctx.new_page()
    bucket = []
    attach(page, bucket)
    seed(page, base)

    # The fallback builder in the browser produces exactly the file the build wrote.
    page.goto(base + '#/')
    page.wait_for_selector('.subject-card')
    same = page.evaluate("""async () => {
      const s = await import('./js/search.js'); const t = await import('./js/tree.js');
      const get = async (u) => (await fetch(u)).json();
      const cat = await get('data/catalog.json');
      const ids = cat.subjects.filter((x) => x.status === 'available').map((x) => x.id);
      const idx = await Promise.all(ids.map(async (id) => t.indexSubject(await get(`data/subjects/${id}.json`))));
      const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort()) : x));
      const file = await get('data/search.json');
      return [canon(s.entriesFromSubjects(idx)) === canon(file.entries), file.entries.length];
    }""")
    check('index: in-browser fallback builds the same entries as data/search.json', same[0], str(same))

    header = page.get_by_role('searchbox', name='Search the library')
    finder = page.get_by_role('searchbox', name='Find a page or topic')
    check('header: labelled search field visible at 1280', header.is_visible())
    check('catalog: labelled "Find a page or topic" field', finder.is_visible())
    shot(page, 's01_catalog_1280')

    # Catalog field: type, pause (hand-over to #/search), keep typing: no key may be lost.
    finder.click()
    page.keyboard.type('mem', delay=30)
    page.wait_for_url(lambda u: '#/search?q=mem' in u, timeout=4000)
    page.keyboard.type('branes', delay=30)
    page.wait_for_timeout(400)
    a = active(page)
    check('catalog hand-over: search screen field focused with every key typed', a['id'] == 'search-q' and a['value'] == 'membranes', json.dumps(a))
    check('catalog hand-over: URL follows the query', page.url.endswith('#/search?q=membranes'), page.url)
    check('search route: header field steps aside, knowledge bar hidden',
          page.evaluate("getComputedStyle(document.querySelector('.header-search')).visibility") == 'hidden' and page.locator('.kbar').is_hidden())

    # "cell": grouped by subject, page status + minutes + breadcrumb, topics with page counts.
    page.fill('#search-q', 'cell')
    page.wait_for_function("document.querySelector('.search-status').textContent.includes('“cell”')")
    status = page.locator('.search-status')
    check('a11y: result count is a polite live status', status.get_attribute('role') == 'status' and status.get_attribute('aria-live') == 'polite')
    check('results: count announced', 'result' in status.text_content() and 'in 1 subject' in status.text_content(), status.text_content())
    check('results: grouped under a "Biology" heading', page.locator('.search-group h2').count() == 1 and 'Biology' in page.locator('.search-group h2').text_content())
    texts = hit_texts(page)
    first = page.locator('.search-hit').first.get_attribute('data-key')
    check('results: the Cells topic and "The Cell" lead (exact titles)', first == 'biology/m01-cells' and page.locator('.search-hit').nth(1).get_attribute('data-key') == CELL, json.dumps(texts)[:300])
    cell_hit = page.locator(f'.search-hit[data-key="{CELL}"]').text_content()
    check('results: a page shows minutes, breadcrumb and its status (Already known)', '1 min' in cell_hit and 'Cells' in cell_hit and 'Already known' in cell_hit, cell_hit)
    topic_hit = page.locator('.search-hit[data-key="biology/m01-cells"]').text_content()
    check('results: a topic shows its page count and known %', '3 pages' in topic_hit and '33% known' in topic_hit, topic_hit)
    check('results: matched words are highlighted', page.locator('.search-hit mark').first.text_content().lower().startswith('cell'))
    shot(page, 's02_search_cell_1280')

    # Keyboard: ↓ into the results, ↓/↑ between them, Enter opens, Back returns to the same result.
    page.locator('#search-q').focus()
    page.keyboard.press('ArrowDown')
    a1 = active(page)
    page.keyboard.press('ArrowDown')
    a2 = active(page)
    check('keyboard: ↓ moves from the field into the results, then to the next one', a1['key'] == 'biology/m01-cells' and a2['key'] == CELL, json.dumps([a1, a2]))
    check('keyboard: a focused result shows a focus ring', a2['ring'])
    shot(page, 's03_keyboard_focus_1280', full=False)
    page.keyboard.press('ArrowUp')
    page.keyboard.press('ArrowUp')
    check('keyboard: ↑ from the first result returns to the field', active(page)['id'] == 'search-q')
    page.keyboard.press('ArrowDown')
    page.keyboard.press('ArrowDown')
    page.keyboard.press('Enter')
    page.wait_for_url(lambda u: u.endswith('#/l/' + CELL), timeout=4000)
    page.wait_for_selector('.lesson-title-row')
    check('keyboard: Enter on a page result opens the lesson', page.url.endswith('#/l/' + CELL))
    page.go_back()
    page.wait_for_selector('.search-hit')
    page.wait_for_timeout(200)
    a = active(page)
    check('Back: search restored with the query and focus on the result opened', page.locator('#search-q').input_value() == 'cell' and a['key'] == CELL, json.dumps(a))

    # Enter in the field jumps to the first result; Esc clears the field.
    page.locator('#search-q').focus()
    page.keyboard.press('Enter')
    check('keyboard: Enter in the field focuses the first result', active(page)['key'] == 'biology/m01-cells')
    page.keyboard.press('Escape')
    check('keyboard: Esc in the results returns to the field', active(page)['id'] == 'search-q')
    page.keyboard.press('Escape')
    page.wait_for_timeout(250)
    check('keyboard: Esc in the field clears it (intro shown, URL #/search)', page.locator('#search-q').input_value() == '' and page.locator('.search-intro').count() == 1 and page.url.endswith('#/search'), page.url)

    # Status labels: in progress, and a topic opened by keyboard.
    page.fill('#search-q', 'scarcity')
    page.wait_for_function("document.querySelector('.search-status').textContent.includes('“scarcity”')")
    sc = page.locator(f'.search-hit[data-key="{SCARCITY}"]').text_content()
    check('results: in-progress page labelled "In progress"', 'In progress' in sc, sc)
    page.fill('#search-q', 'membranes')
    page.wait_for_selector('.search-hit[data-key="biology/m01-cells/t01-membranes"]')
    page.locator('.search-hit[data-key="biology/m01-cells/t01-membranes"]').focus()
    page.keyboard.press('Enter')
    page.wait_for_url(lambda u: u.endswith('#/s/biology/m01-cells/t01-membranes'), timeout=4000)
    check('keyboard: Enter on a topic result opens the topic', page.url.endswith('#/s/biology/m01-cells/t01-membranes'))

    # "/" from a lesson focuses the header field; typing there hands over too.
    page.goto(base + '#/l/' + LIPIDS)
    page.wait_for_selector('.lesson-title-row')
    page.locator('h1').click()
    page.keyboard.press('/')
    check('keyboard: "/" focuses the header field on a lesson page', active(page)['id'] == 'hs-q')
    page.keyboard.type('dna', delay=30)
    page.wait_for_url(lambda u: '#/search?q=dn' in u, timeout=4000)
    page.wait_for_timeout(300)
    a = active(page)
    check('header hand-over: search screen continues with "dna"', a['id'] == 'search-q' and a['value'] == 'dna', json.dumps(a))
    check('header hand-over: header field emptied', page.locator('#hs-q').input_value() == '')
    page.fill('#search-q', 'brunn')
    page.wait_for_function("document.querySelector('.search-status').textContent.includes('“brunn”')")
    marks = page.locator('.search-hit[data-key="biology/m02-genetics"] mark').all_text_contents()
    check('diacritics: "brunn" finds the topic whose summary says Brünn, and marks it', 'Brünn' in marks, json.dumps(marks))

    # No results.
    page.fill('#search-q', 'zzqxv')
    page.wait_for_selector('.search-empty')
    check('no results: says so in the live status and offers a way on', 'No results for “zzqxv”' in status.text_content() and page.locator('.search-empty a[href="#/"]').count() == 1, status.text_content())
    shot(page, 's04_no_results_1280')

    # HTML characters in the query: shown as text, nothing injected.
    page.fill('#search-q', HTMLQ)
    page.wait_for_function("document.querySelector('.search-status').textContent.includes('onerror')")
    page.wait_for_timeout(300)
    check('HTML query: shown literally, no element injected, no dialog',
          HTMLQ in status.text_content() and HTMLQ in page.locator('.search-empty').text_content() and page.locator('#main img').count() == 0
          and not [b for b in bucket if b[0] == 'dialog'], status.text_content())
    check('HTML query: kept in the URL and parsed back', json.loads(page.evaluate("JSON.stringify(new URLSearchParams(location.hash.split('?')[1]).get('q'))")) == HTMLQ)
    shot(page, 's05_html_query_1280')
    # HTML characters in the data: the fixture summary '<b>&</b> why "free"…' renders as text.
    page.fill('#search-q', 'free')
    page.wait_for_selector(f'.search-hit[data-key="{OPP}"]')
    summ = page.locator(f'.search-hit[data-key="{OPP}"] .hit-summary')
    check('HTML data: summary markup shown as text, never parsed', '<b>&</b>' in summ.text_content() and summ.locator('b').count() == 0, summ.text_content())
    shot(page, 's06_html_data_1280')

    # Reload on a search URL keeps the query.
    page.goto(base + '#/search?q=supply%20and')
    page.wait_for_selector('.search-hit')
    check('deep link: #/search?q=supply%20and shows "Supply and Demand" first', page.locator('.search-hit').first.get_attribute('data-key') == 'economics/m02-markets/l01-supply-and-demand')

    check('desktop: no console errors, page errors, dialogs or 404s', not bucket, json.dumps(bucket)[:500])
    ctx.close()


def phone(browser, base):
    print('\n== Phone 390 (and 360) ==')
    ctx = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    bucket = []
    attach(page, bucket)
    seed(page, base)
    page.goto(base + '#/l/' + LIPIDS)
    page.wait_for_selector('.lesson-title-row')
    link = page.get_by_role('link', name='Search', exact=True)
    check('phone: header shows a "Search" link, the field is hidden', link.is_visible() and page.locator('#hs-q').is_hidden())
    ok, w = no_hscroll(page)
    check('phone 390: no horizontal scroll on a lesson with the header search link', ok, str(w))
    link.tap()
    page.wait_for_url(lambda u: u.endswith('#/search'), timeout=4000)
    page.wait_for_selector('#search-q')
    page.wait_for_timeout(150)
    check('phone: the link opens #/search with the field focused', active(page)['id'] == 'search-q')
    check('phone: header link marked as the current page', link.get_attribute('aria-current') == 'page')
    shot(page, 's07_search_empty_390')
    page.keyboard.type('supply', delay=30)
    page.wait_for_selector('.search-hit')
    page.wait_for_timeout(250)
    ok, w = no_hscroll(page)
    check('phone 390: results fit (no horizontal scroll)', ok, str(w))
    check('phone: results grouped under Economics', 'Economics' in page.locator('.search-group h2').first.text_content())
    shot(page, 's08_search_supply_390')
    page.locator('.search-hit').first.tap()
    page.wait_for_url(lambda u: u.endswith('#/l/economics/m02-markets/l01-supply-and-demand'), timeout=4000)
    check('phone: tapping a result opens it', True)
    page.goto(base + '#/')
    page.wait_for_selector('.subject-card')
    page.locator('#catalog-q').scroll_into_view_if_needed()
    shot(page, 's09_catalog_field_390', full=False)
    page.set_viewport_size({'width': 360, 'height': 780})
    for route in ('#/', '#/search?q=cell', '#/l/' + LIPIDS, '#/s/biology/m01-cells'):
        page.goto(base + route)
        page.wait_for_timeout(400)
        ok, w = no_hscroll(page)
        check(f'360px: no horizontal scroll on {route}', ok, str(w))
    shot(page, 's10_search_cell_360', full=False)
    check('phone: no console errors, page errors, dialogs or 404s', not bucket, json.dumps(bucket)[:500])
    ctx.close()

    ctx = browser.new_context(viewport={'width': 390, 'height': 844}, color_scheme='dark')
    page = ctx.new_page()
    bucket = []
    attach(page, bucket)
    seed(page, base)
    page.goto(base + '#/search?q=cell')
    page.wait_for_selector('.search-hit')
    page.wait_for_timeout(300)
    bg = page.evaluate("getComputedStyle(document.body).backgroundColor")
    check('dark: search renders on the dark background', bg in ('rgb(13, 18, 20)',), bg)
    shot(page, 's11_search_cell_390_dark')
    page.set_viewport_size({'width': 1280, 'height': 900})
    page.goto(base + '#/')
    page.wait_for_selector('.subject-card')
    shot(page, 's12_catalog_1280_dark', full=False)
    check('dark: no console errors', not bucket, json.dumps(bucket)[:300])
    ctx.close()


def fallback(browser, base):
    print('\n== Older host: no data/search.json ==')
    ctx = browser.new_context(viewport={'width': 1280, 'height': 900})
    ctx.route('**/data/search.json', lambda r: r.fulfill(status=404, content_type='text/html', body='<h1>Not found</h1>'))
    page = ctx.new_page()
    bucket = []
    attach(page, bucket, allow_404=('data/search.json',))
    page.goto(base + '#/search?q=lipids')
    page.wait_for_selector('.search-hit')
    src = page.locator('.search-results').get_attribute('data-source')
    check('fallback: index built from the subject files', src == 'subjects', src)
    check('fallback: same results ("Lipids and Membranes")', page.locator(f'.search-hit[data-key="{LIPIDS}"]').count() == 1)
    shot(page, 's13_fallback_1280', full=False)
    check('fallback: no errors beyond the expected 404', not bucket, json.dumps(bucket)[:300])
    ctx.close()


def edges(browser, base):
    print('\n== Slow index, long deep link ==')
    ctx = browser.new_context(viewport={'width': 1280, 'height': 900})
    held = []
    ctx.route('**/data/search.json', lambda r: held.append(r))  # answered below, after the typing
    page = ctx.new_page()
    bucket = []
    attach(page, bucket)
    page.goto(base + '#/')
    finder = page.get_by_role('searchbox', name='Find a page or topic')
    finder.click()
    page.keyboard.type('mem', delay=30)
    page.wait_for_timeout(500)  # the launcher has fired; the index is still on its way
    page.keyboard.type('branes', delay=30)
    page.wait_for_timeout(200)
    for r in held:
        r.continue_()
    page.wait_for_url(lambda u: '#/search?q=' in u, timeout=4000)
    page.wait_for_timeout(400)
    a = active(page)
    check('slow index: catalog hand-over still keeps every key', a['id'] == 'search-q' and a['value'] == 'membranes', json.dumps(a))
    # A shared link cut at 200 characters in the middle of an emoji must not break the screen.
    page.goto(base + '#/search?q=' + 'a' * 199 + '%F0%9F%98%80')
    page.wait_for_selector('#search-q')
    page.locator('#search-q').focus()
    page.keyboard.press('Enter')
    page.wait_for_timeout(300)
    check('long deep link: Enter after a 200-character cap inside an emoji raises no error',
          not bucket and page.evaluate('location.hash') == '#/search?q=' + 'a' * 199, json.dumps(bucket)[:300])
    ctx.close()


def main():
    srv = StaticServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{srv.server_address[1]}/'
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            try:
                for part in (desktop, phone, fallback, edges):
                    try:
                        part(browser, base)
                    except Exception as e:  # keep going so one broken step does not hide the rest
                        check(f'{part.__name__} crashed', False, repr(e)[:500])
            finally:
                browser.close()
    finally:
        srv.shutdown()
        srv.server_close()
    failed = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(failed)}/{len(results)} checks passed; screenshots in {SHOTS}')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
