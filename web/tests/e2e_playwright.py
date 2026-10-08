#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""Headless end-to-end check of the web player against the fixture site.

    python3 web/tests/make_fixture.py ~/Downloads/subject-mastery-build/fixture-dist
    PLAYWRIGHT_BROWSERS_PATH=~/Downloads/subject-mastery-build/pw-browsers \\
      python3 web/tests/e2e_playwright.py ~/Downloads/subject-mastery-build/fixture-dist \\
                                          ~/Downloads/subject-mastery-build/screens

Serves the fixture with Python's http.server (threaded, larger backlog) on a free
port inside this process (stopped at the end), drives headless
Chromium, and prints PASS/FAIL per check. Part A runs local-only: on a loopback
host the player does not probe the API at all. Part B switches the probe on
(localStorage sm.api.v1 = "on", as ?api=on does) and mocks /api/subjectmastery/* and
/api/auth/* with Playwright routes to exercise the signed-in sync path. Exit code 1
on any failure. Screenshots go to the second argument.
"""
import functools
import http.server
import json
import os
import sys
import threading
import time

from playwright.sync_api import sync_playwright

ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
PARTS = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--parts=')), 'abc')
ROOT = os.path.abspath(os.path.expanduser(ARGS[0] if ARGS else '~/Downloads/subject-mastery-build/fixture-dist'))
SHOTS = os.path.abspath(os.path.expanduser(ARGS[1] if len(ARGS) > 1 else '~/Downloads/subject-mastery-build/screens'))
os.makedirs(SHOTS, exist_ok=True)

E1 = 'economics/m01-foundations/l01-scarcity-and-choice'
E2 = 'economics/m01-foundations/l02-opportunity-cost'
E3 = 'economics/m02-markets/l01-supply-and-demand'
E4 = 'economics/m02-markets/l02-price-signals'
B2 = 'biology/m01-cells/l02-the-cell'
B3 = 'biology/m01-cells/t01-membranes/l01-lipids'

results = []


def check(name, ok, detail=''):
    results.append((name, bool(ok), detail))
    print(('PASS ' if ok else 'FAIL ') + name + (f'  [{detail}]' if detail and not ok else ''))


class StaticServer(http.server.ThreadingHTTPServer):
    # The stock `python3 -m http.server` keeps a listen backlog of 5, and Chromium's
    # parallel ES-module requests then hit ERR_CONNECTION_RESET. Same handler, bigger queue.
    request_queue_size = 128
    daemon_threads = True


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def progress(page):
    return page.evaluate("JSON.parse(localStorage.getItem('sm.progress.v1') || '{}')")


def ls(page, key):
    return page.evaluate(f"JSON.parse(localStorage.getItem('{key}') || 'null')")


def no_hscroll(page):
    w = page.evaluate('[document.documentElement.scrollWidth, document.documentElement.clientWidth]')
    return w[0] <= w[1], w


def shot(page, name):
    page.screenshot(path=os.path.join(SHOTS, name + '.png'), full_page=True)


PUMP = []  # the active page; waiting through it lets Playwright run route handlers


def wait_for(fn, timeout=8.0, step=0.1):
    end = time.time() + timeout
    while time.time() < end:
        try:
            if fn():
                return True
        except Exception:
            pass
        if PUMP:
            PUMP[-1].wait_for_timeout(step * 1000)
        else:
            time.sleep(step)
    return False


def attach_console(page, bucket):
    def on_console(msg):
        if msg.type != 'error':
            return
        url = (msg.location or {}).get('url', '')
        text = msg.text
        # The API is absent under a static server: those 404s are expected (local-only mode).
        if 'Failed to load resource' in text and ('/api/' in url or url == ''):
            bucket.append(('expected-404', text, url))
            return
        bucket.append(('error', text, url))
    page.on('console', on_console)
    page.on('pageerror', lambda e: bucket.append(('pageerror', str(e), '')))
    page.on('dialog', lambda d: (bucket.append(('dialog', d.message, '')), d.dismiss()))
    page.on('response', lambda r: bucket.append(('http404', r.url, '')) if r.status == 404 and '/api/' not in r.url else None)


def real_errors(bucket):
    return [b for b in bucket if b[0] in ('error', 'pageerror', 'dialog', 'http404')]


def part_a(browser, base):
    print('\n== Part A: local-only (no API) ==')
    ctx = browser.new_context(viewport={'width': 1280, 'height': 900}, accept_downloads=True)
    page = ctx.new_page()
    PUMP.append(page)
    bucket = []
    attach_console(page, bucket)

    # Catalog
    page.goto(base + '#/')
    page.wait_for_selector('.subject-card')
    page.wait_for_timeout(400)
    check('catalog: 2 available subject cards', page.locator('.subject-card').count() == 2)
    check('catalog: 8 planned subjects as chips', page.locator('.soon .chip').count() == 8)
    check('catalog: planned grouped by category', page.locator('.soon-group').count() == 5)
    check('catalog: account control is local-only link', page.locator('.account-local').count() == 1)
    check('catalog: no sign-in nudge when API is missing', page.locator('.nudge').count() == 0)
    check('catalog: loopback host makes no /api request at all', not [b for b in bucket if b[0] == 'expected-404'], json.dumps(bucket))
    shot(page, 'a01_catalog_1280')

    # Subject path + module "Already know this" + undo
    page.goto(base + '#/s/economics')
    page.wait_for_selector('.module')
    check('subject: 2 modules', page.locator('.module').count() == 2)
    check('subject: coming-soon lesson is not a link', page.locator('.is-soon a').count() == 0 and page.locator('.is-soon').count() == 1)
    check('subject: knowledge bar sticky at top', page.locator('.kbar:not([hidden]) .kbar-row').count() == 1)
    page.get_by_role('button', name='Already know Foundations: mark every page known').click()
    p = progress(page)
    check('module known: both lessons known', p.get(E1, {}).get('status') == 'known' and p.get(E2, {}).get('status') == 'known', json.dumps(p))
    check('module known: undo toast shown', page.get_by_role('button', name='Undo').count() == 1)
    page.wait_for_timeout(900)
    check('knowledge bar: Economics 66% after 2 of 3', '66%' in page.locator('.kbar-row').first.inner_text())
    shot(page, 'a02_subject_known_toast_1280')
    page.get_by_role('button', name='Undo').click()
    p = progress(page)
    check('module undo: back to not started', E1 not in p and E2 not in p, json.dumps(p))

    # Lesson with audio: play, position save, resume
    page.goto(base + '#/l/' + E1)
    page.wait_for_selector('.play-btn')
    check('lesson: mode toggle has 3 options', page.locator('.seg-btn').count() == 3)
    check('lesson: markdown escaped (no injected img/script)', page.locator('.prose img, .prose script').count() == 0 and '<script>' in page.locator('.prose').inner_text())
    check('lesson: "Already Known" at top and "Mark as known" at bottom',
          page.get_by_role('button', name='Already Known').count() == 1 and page.get_by_role('button', name='Mark as known').count() == 1)
    ok = wait_for(lambda: page.locator('.time-dur').inner_text().strip() == '0:20', 6)
    check('audio: duration loaded (0:20)', ok, page.locator('.time-dur').inner_text())
    page.locator('.play-btn').click()
    ok = wait_for(lambda: page.locator('.play-btn').get_attribute('aria-label') == 'Pause', 4)
    check('audio: plays (button becomes Pause)', ok)
    page.wait_for_timeout(5600)
    page.locator('.play-btn').click()
    page.wait_for_timeout(300)
    r = progress(page).get(E1, {})
    check('audio: position saved on pause', r.get('status') == 'in_progress' and r.get('position', 0) > 3, json.dumps(r))
    check('media session: metadata set', page.evaluate("navigator.mediaSession && navigator.mediaSession.metadata && navigator.mediaSession.metadata.title") == 'Scarcity and Choice')
    shot(page, 'a03_lesson_audio_1280')
    page.goto(base + '#/')
    page.wait_for_selector('.continue')
    check('catalog: "Continue where you left off" shows the in-progress page', 'Scarcity and Choice' in page.locator('.continue').inner_text())
    shot(page, 'a03b_catalog_continue_1280')
    page.goto(base + '#/l/' + E1)
    page.wait_for_selector('.play-btn')
    ok = wait_for(lambda: page.locator('.resume-note').is_visible(), 5)
    check('resume: "Picking up where you left off" after reload', ok)

    # Audio end -> completed -> autoplay next (speech fallback lesson)
    page.select_option('.rate', '2')
    page.locator('.play-btn').click()
    ok = wait_for(lambda: E2 in page.url, 15)
    check('audio end: autoplay moves to next page', ok, page.url)
    check('audio end: lesson marked completed', progress(page).get(E1, {}).get('status') == 'completed', json.dumps(progress(page).get(E1)))
    check('prefs: rate remembered', (ls(page, 'sm.prefs.v1') or {}).get('rate') == 2)
    page.wait_for_selector('.source-note')
    note = page.locator('.source-note').inner_text()
    check('no-audio lesson: says it uses the browser voice', 'browser' in note.lower(), note)
    shot(page, 'a04_lesson_speech_fallback_1280')

    # Keyboard: k = known + advance
    page.locator('body').click(position={'x': 5, 'y': 400})
    page.keyboard.press('k')
    ok = wait_for(lambda: E3 in page.url, 5)
    check('keyboard k: marks known and advances', ok and progress(page).get(E2, {}).get('status') == 'known', page.url)

    # Space toggles playback. (K was pressed while speech played, so this page auto-started;
    # reload for a fresh, paused page.)
    page.reload()
    page.wait_for_selector('.play-btn')
    wait_for(lambda: page.locator('.time-dur').inner_text().strip() != '–:––', 4)
    page.locator('h1').click()
    page.keyboard.press('Space')
    ok = wait_for(lambda: page.locator('.play-btn').get_attribute('aria-label') == 'Pause', 3)
    check('keyboard space: plays', ok)
    page.keyboard.press('ArrowRight')
    page.keyboard.press('Space')
    check('keyboard space: pauses', wait_for(lambda: page.locator('.play-btn').get_attribute('aria-label') == 'Play', 3))

    # Text mode, remembered in prefs
    page.get_by_role('button', name='Text', exact=True).click()
    check('mode text: player hidden', not page.locator('.player').is_visible())
    check('mode text: saved in prefs', (ls(page, 'sm.prefs.v1') or {}).get('mode') == 'text')
    page.reload()
    page.wait_for_selector('.prose')
    check('mode text: survives reload', not page.locator('.player').is_visible() and page.locator('.prose').is_visible())
    check('end of subject: "Back to topic" instead of Next', page.locator('.lesson-nav a.nav-next').count() == 1)

    # Text-mode completion: reach the end, press Next
    page.goto(base + '#/l/' + B2)
    page.wait_for_selector('.prose')
    page.locator('.text-end').scroll_into_view_if_needed()
    page.wait_for_timeout(300)
    page.locator('.text-end').get_by_role('button', name='Next page').click()
    ok = wait_for(lambda: B3 in page.url, 4)
    check('text mode: reaching the end + Next marks completed', ok and progress(page).get(B2, {}).get('status') == 'completed', json.dumps(progress(page).get(B2)))
    shot(page, 'a05_lesson_text_mode_1280')
    check('nested lesson: thin topic bar for "Membranes"', 'Membranes knowledge' in page.locator('.kbar-topic').inner_text())
    page.goto(base + '#/s/biology')
    page.wait_for_selector('.subtopic-link')
    check('subject page: nested sub-topic listed with its own %', 'Membranes' in page.locator('.subtopic-link').inner_text() and '%' in page.locator('.subtopic-link').inner_text())
    page.goto(base + '#/s/biology/m01-cells')
    page.wait_for_selector('.module')
    check('topic page: sub-topic shown as its own section', 'Membranes' in page.locator('.module').first.inner_text())
    check('topic page: thin topic bar under the subject bar', page.locator('.kbar-row').count() == 2)
    shot(page, 'a05b_topic_nested_1280')
    page.goto(base + '#/l/' + B3)
    page.wait_for_selector('.seg-btn')
    page.get_by_role('button', name='Both', exact=True).click()

    # Lesson without text
    page.goto(base + '#/l/' + E4)
    page.wait_for_selector('.soon-state')
    check('no-text lesson: shows coming soon', 'coming soon' in page.locator('.soon-state').inner_text().lower())

    # Study plan: click to add, drag to reorder, play, skip
    page.goto(base + '#/profile')
    page.wait_for_selector('.palette-chip')
    page.get_by_role('button', name='Add Biology to the plan').click()
    page.get_by_role('button', name='Add Biology to the plan').click()
    page.get_by_role('button', name='Add Economics to the plan').click()
    plan = ls(page, 'sm.plan.v1') or {}
    check('plan: 3 blocks added by click', len(plan.get('blocks', [])) == 3, json.dumps(plan))
    check('plan: consecutive blocks grouped (Biology ×2)', '×2' in page.locator('.plan-group').first.inner_text())
    # drag the Economics chip (mouse) above the first group; mouse coordinates must be on screen
    page.locator('.plan-drop').scroll_into_view_if_needed()
    chip = page.get_by_role('button', name='Add Economics to the plan').bounding_box()
    first = page.locator('.plan-group').first.bounding_box()
    page.mouse.move(chip['x'] + chip['width'] / 2, chip['y'] + chip['height'] / 2)
    page.mouse.down()
    page.mouse.move(chip['x'] + 40, chip['y'] + 30, steps=4)
    page.mouse.move(first['x'] + 80, first['y'] + 4, steps=8)
    page.wait_for_timeout(150)
    shot(page, 'a06_plan_dragging_1280')
    page.mouse.up()
    plan = ls(page, 'sm.plan.v1') or {}
    keys = [b['topicKey'] for b in plan.get('blocks', [])]
    check('plan: drag from palette inserts at drop point', keys == ['economics', 'biology', 'biology', 'economics'], json.dumps(keys))
    # drag a group (Biology x2) to the end with its handle
    page.locator('.plan-drop').scroll_into_view_if_needed()
    handle = page.locator('.plan-group').nth(1).locator('.grip-btn').bounding_box()
    last = page.locator('.plan-group').last.bounding_box()
    page.mouse.move(handle['x'] + 20, handle['y'] + 20)
    page.mouse.down()
    page.mouse.move(handle['x'] + 20, handle['y'] + 40, steps=4)
    page.mouse.move(last['x'] + 80, last['y'] + last['height'] - 2, steps=8)
    page.mouse.up()
    keys = [b['topicKey'] for b in (ls(page, 'sm.plan.v1') or {}).get('blocks', [])]
    check('plan: drag a group to reorder', keys == ['economics', 'economics', 'biology', 'biology'], json.dumps(keys))
    page.get_by_role('button', name='Move Biology up').click()
    keys = [b['topicKey'] for b in (ls(page, 'sm.plan.v1') or {}).get('blocks', [])]
    check('plan: keyboard move-up button', keys == ['biology', 'biology', 'economics', 'economics'], json.dumps(keys))
    shot(page, 'a07_profile_plan_1280')
    iq_text = page.locator('.iq').text_content()
    check('profile: Estimated IQ shown with disclaimer', 'Estimated IQ' in iq_text and 'Not a clinical IQ test' in iq_text, iq_text)
    check('profile: IQ above the 100 baseline after progress', int(page.locator('.iq-value').text_content()) > 100, page.locator('.iq-value').text_content())

    page.goto(base + '#/plan')
    page.wait_for_selector('.plan-item')
    check('plan tab: 4 blocks listed', page.locator('.plan-item').count() == 4)
    shot(page, 'a08_plan_tab_1280')
    page.get_by_role('button', name='Play plan').click()
    ok = wait_for(lambda: '#/l/biology/' in page.url, 5)
    check('plan play: opens the first block lesson', ok, page.url)
    page.wait_for_selector('.plan-strip')
    check('plan play: shows plan strip block 1 of 4', 'block 1 of 4' in page.locator('.plan-strip').inner_text())
    first_lesson = page.url
    page.get_by_role('button', name='Skip block').click()
    ok = wait_for(lambda: page.url != first_lesson and '#/l/biology/' in page.url, 5)
    check('plan skip: next block plays a different biology page', ok, page.url)
    check('plan skip: strip shows block 2 of 4', wait_for(lambda: 'block 2 of 4' in page.locator('.plan-strip').inner_text(), 3))
    page.goto(base + '#/plan')
    page.wait_for_selector('.plan-item.is-current')
    check('plan tab: current block highlighted', page.locator('.plan-item').nth(1).get_attribute('class').find('is-current') >= 0)
    page.get_by_role('button', name='Resume at block 2').click()
    page.wait_for_selector('.plan-strip')
    page.get_by_role('button', name='Stop plan').click()
    nxt = page.locator('.lesson-nav .nav-next').inner_text().strip()
    check('plan stop: strip removed and Next follows the path again', page.locator('.plan-strip').count() == 0 and nxt in ('Next', 'Back to topic'), nxt)

    # Profile edit
    page.goto(base + '#/profile')
    page.get_by_role('button', name='Edit profile').click()
    page.fill('#pf-name', 'Fixture Learner')
    page.fill('#pf-bio', 'Testing the profile editor.')
    page.get_by_role('button', name='Emoji', exact=True).click()
    page.get_by_role('button', name='Use 🦉').click()
    page.locator('.check', has_text='Economics').locator('input').check()
    shot(page, 'a09_profile_edit_1280')
    page.get_by_role('button', name='Save profile').click()
    prof = ls(page, 'sm.profile.v1') or {}
    check('profile: saved locally', prof.get('displayName') == 'Fixture Learner' and prof.get('avatar', {}).get('value') == '🦉' and prof.get('featuredSubjects') == ['economics'], json.dumps(prof)[:200])
    shot(page, 'a10_profile_saved_1280')

    # Account: export + reset with in-page confirm
    page.goto(base + '#/account')
    page.wait_for_selector('.account-card')
    check('account: local-only note', 'saved on this device' in page.locator('.save-note').inner_text())
    with page.expect_download() as dl:
        page.get_by_role('button', name='Export my progress').click()
    path = dl.value.path()
    data = json.load(open(path))
    check('account: export downloads JSON with progress', isinstance(data.get('progress'), dict) and E1 in data['progress'] and dl.value.suggested_filename.endswith('.json'))
    page.get_by_role('button', name='Reset my progress').click()
    check('reset: in-page confirm shown', page.locator('.confirm').is_visible())
    shot(page, 'a11_account_reset_confirm_1280')
    page.get_by_role('button', name='Yes, reset everything').click()
    page.wait_for_timeout(200)
    check('reset: progress cleared', progress(page) == {})

    # Responsive pass at 390 and 360: no horizontal scroll on any route
    for width in (390, 360):
        page.set_viewport_size({'width': width, 'height': 844})
        for route, name in (('#/', 'catalog'), ('#/s/economics', 'subject'), ('#/s/biology/m01-cells', 'topic'),
                            ('#/l/' + E1, 'lesson'), ('#/l/' + E2, 'lesson_speech'), ('#/profile', 'profile'),
                            ('#/plan', 'plan'), ('#/account', 'account'), ('#/l/' + E4, 'lesson_soon')):
            page.goto(base + route)
            page.wait_for_timeout(500)
            ok, w = no_hscroll(page)
            check(f'{width}px: no horizontal scroll on {name}', ok, str(w))
            if width == 390:
                shot(page, f'a20_{name}_390')

    errs = real_errors(bucket)
    check('part A: no console errors, page errors, dialogs or non-API 404s', not errs, json.dumps(errs)[:600])
    ctx.close()


def part_b(browser, base):
    print('\n== Part B: signed in (mocked API) ==')
    ctx = browser.new_context(viewport={'width': 1280, 'height': 900})
    state = {'signed_in': True, 'db': {E3: {'status': 'completed', 'position': 0, 'updatedAt': 1000}},
             'puts': [], 'logout': 0, 'profile': None, 'plan': None, 'profile_puts': 0}
    icon_png = open(os.path.join(ROOT, 'icons', 'icon-192.png'), 'rb').read()

    def j(route, status, body):
        route.fulfill(status=status, content_type='application/json', body=json.dumps(body))

    def api(route, request):
        url = request.url
        m = request.method
        if url.endswith('/api/subjectmastery/me'):
            return j(route, 200, {'signedIn': True, 'user': {'name': 'Test Learner', 'email': 'learner@example.com', 'avatarUrl': 'https://lh3.googleusercontent.com/a/test-avatar'}} if state['signed_in'] else {'signedIn': False})
        if not state['signed_in']:
            return j(route, 401, {'error': 'signed out'})
        if url.endswith('/api/subjectmastery/progress'):
            if m == 'GET':
                return j(route, 200, {'progress': state['db']})
            if m == 'PUT':
                items = json.loads(request.post_data)['items']
                state['puts'].append(items)
                for it in items:
                    k = it.pop('key')
                    old = state['db'].get(k)
                    if not old or it['updatedAt'] >= old['updatedAt']:
                        state['db'][k] = it
                return j(route, 200, {'progress': state['db']})
            if m == 'DELETE':
                state['db'] = {}
                return j(route, 200, {'ok': True})
        for name in ('profile', 'plan'):
            if url.endswith('/api/subjectmastery/' + name):
                if m == 'GET':
                    return j(route, 200, {name: state[name]})
                body = json.loads(request.post_data)[name]
                state[name] = body
                if name == 'profile':
                    state['profile_puts'] += 1
                return j(route, 200, {name: body})
        return j(route, 404, {'error': 'not mocked'})

    def auth(route, request):
        if request.url.endswith('/api/auth/logout'):
            state['logout'] += 1
            state['signed_in'] = False
            return j(route, 200, {'message': 'Logged out successfully'})
        return j(route, 404, {})

    def logged(handler):
        def run(route, request):
            state.setdefault('log', []).append(f'{request.method} {request.url.split("/api/")[-1]}')
            try:
                handler(route, request)
            except Exception as e:  # never leave a request hanging
                state['log'].append(f'handler error: {e!r}')
                route.fulfill(status=500, body='mock error')
        return run

    api = logged(api)
    auth = logged(auth)
    ctx.route('**/api/subjectmastery/**', api)
    ctx.route('**/api/auth/**', auth)
    ctx.route('https://lh3.googleusercontent.com/**', lambda r: r.fulfill(status=200, content_type='image/png', body=icon_png))

    page = ctx.new_page()
    PUMP.append(page)
    bucket = []
    attach_console(page, bucket)
    # progress made before signing in, on this device (seeded from a non-app page so no app code races it)
    page.goto(base + 'favicon.svg')
    page.evaluate(f"localStorage.setItem('sm.progress.v1', JSON.stringify({{'{E1}': {{status: 'known', position: 0, updatedAt: Date.now()}}}}))")
    # 127.0.0.1 is a loopback host, where the player skips the API probe; switch it on (as ?api=on does)
    page.evaluate("localStorage.setItem('sm.api.v1', 'on')")
    page.goto(base + '?signed_in=1#/')
    page.wait_for_selector('.account-link img, .account-link .avatar')
    check('signed in: header shows avatar account link', page.get_by_role('link', name='Account: Test Learner').count() == 1)
    check('signed in: ?signed_in=1 removed from URL', 'signed_in' not in page.url, page.url)
    check('signed in: welcome toast', wait_for(lambda: 'Signed in' in page.locator('.toasts').inner_text(), 3))
    check('signed in: server progress downloaded', wait_for(lambda: progress(page).get(E3, {}).get('status') == 'completed', 3))
    check('signed in: local progress uploaded on sign-in', wait_for(lambda: E1 in state['db'], 3), json.dumps(state['puts']))
    check('signed in: owner tag stored', page.evaluate("localStorage.getItem('sm.owner.v1')") is not None)
    shot(page, 'b01_catalog_signed_in_1280')

    # A change is held during the undo window, then sent when the toast closes
    page.goto(base + '#/l/' + E2)
    page.wait_for_selector('h1')
    n_before = len(state['puts'])
    page.get_by_role('button', name='Already Known').click()
    page.wait_for_timeout(2600)
    held = len(state['puts']) == n_before
    page.locator('.toast-close').click()
    sent = wait_for(lambda: E2 in state['db'] and state['db'][E2]['status'] == 'known', 5)
    check('sync: change held during undo window, PUT after it closes', held and sent, f'held={held} sent={sent}')

    # Undo before the window ends never reaches the server
    page.goto(base + '#/l/' + B2)
    page.wait_for_selector('h1')
    page.get_by_role('button', name='Already Known').click()
    page.get_by_role('button', name='Undo').click()
    page.wait_for_timeout(3000)
    # (Undo returns to the page, which re-marks it in_progress as any opened page is; it must never be "known".)
    check('sync: undone change never sent', state['db'].get(B2, {}).get('status') != 'known' and progress(page).get(B2, {}).get('status') != 'known',
          json.dumps([state['db'].get(B2), progress(page).get(B2)]))

    # Profile edit syncs
    page.goto(base + '#/profile')
    page.get_by_role('button', name='Edit profile').click()
    check('profile: Google photo option offered when signed in', page.get_by_role('button', name='Google photo').count() == 1)
    page.fill('#pf-name', 'Synced Learner')
    page.get_by_role('button', name='Save profile').click()
    check('profile: PUT to server', wait_for(lambda: (state['profile'] or {}).get('displayName') == 'Synced Learner', 4), json.dumps(state['profile'])[:200])
    shot(page, 'b02_profile_signed_in_1280')

    # Account page + sign out
    page.goto(base + '#/account')
    page.wait_for_selector('.who-name')
    check('account: shows name and email', 'Test Learner' in page.locator('.who').inner_text() and 'learner@example.com' in page.locator('.who').inner_text())
    check('account: note says device + batesai.org account', 'batesai.org account' in page.locator('.save-note').inner_text())
    check('account: sync status line', wait_for(lambda: 'saved' in page.locator('.sync-line').inner_text().lower(), 4), page.locator('.sync-line').inner_text())
    shot(page, 'b03_account_signed_in_1280')
    page.get_by_role('button', name='Sign out').click()
    page.wait_for_load_state('load')
    ok = wait_for(lambda: page.locator('.account-slot a.btn').count() == 1, 6)
    check('sign out: POST /api/auth/logout then reload', state['logout'] == 1 and ok)
    href = page.locator('.account-slot a.btn').get_attribute('href') if ok else ''
    check('signed out: header "Sign in" links to Google OAuth with return_to', (href or '').startswith('/api/auth/oauth/google?return_to=/'), href)
    check('signed out: progress kept on this device', progress(page).get(E2, {}).get('status') == 'known')
    page.goto(base + '#/')
    page.wait_for_selector('.nudge')
    check('signed out: catalog nudge to sign in with Google', 'Sign in with Google' in page.locator('.nudge').inner_text())
    shot(page, 'b04_catalog_signed_out_nudge_1280')

    errs = real_errors(bucket)
    check('part B: no console errors, page errors or dialogs', not errs, json.dumps(errs)[:600])
    if any(not r[1] for r in results):
        print('  mock request log:', *state.get('log', []), sep='\n    ')
    ctx.close()


def part_c(browser, base):
    print('\n== Part C: dark theme screenshots ==')
    ctx = browser.new_context(viewport={'width': 390, 'height': 844}, color_scheme='dark')
    page = ctx.new_page()
    PUMP.append(page)
    bucket = []
    attach_console(page, bucket)
    for route, name in (('#/', 'catalog'), ('#/s/biology', 'subject'), ('#/l/' + E1, 'lesson'), ('#/profile', 'profile')):
        page.goto(base + route)
        page.wait_for_timeout(600)
        shot(page, f'c_{name}_390_dark')
    page.set_viewport_size({'width': 1280, 'height': 900})
    page.goto(base + '#/l/' + E1)
    page.wait_for_timeout(600)
    shot(page, 'c_lesson_1280_dark')
    check('part C: dark theme renders without errors', not real_errors(bucket), json.dumps(real_errors(bucket))[:400])
    ctx.close()


def main():
    srv = StaticServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{srv.server_address[1]}/'
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--autoplay-policy=no-user-gesture-required'])
            try:
                for key, part in (('a', part_a), ('b', part_b), ('c', part_c)):
                    if key not in PARTS:
                        continue
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
