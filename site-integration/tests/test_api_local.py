#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
#
# Black-box tests for /api/subjectmastery/* (progress, me, v2 profile/plan) and
# the return_to sign-in plumbing,
# run against `wrangler pages dev` with a LOCAL D1 seeded by local_fixture.sql.
#
#   python3 test_api_local.py [http://127.0.0.1:8788]
#
# Never point this at production: it creates, overwrites and deletes progress
# rows and deletes test account A.
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8788').rstrip('/')
assert '127.0.0.1' in BASE or 'localhost' in BASE, 'local server only'
A = 'batesai_session=sm-test-token-a'
B = 'batesai_session=sm-test-token-b'
KEY = 'economics/m01-foundations/l01-scarcity-and-choice'

passed = failed = 0


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


opener = urllib.request.build_opener(NoRedirect)


def call(method, path, body=None, cookie=None, headers=None, raw=None):
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    h = {'Content-Type': 'application/json'} if data is not None else {}
    if cookie:
        h['Cookie'] = cookie
    h.update(headers or {})
    req = urllib.request.Request(BASE + path, data=data, method=method, headers=h)
    try:
        with opener.open(req, timeout=30) as r:
            status, hdrs, text = r.status, r.headers, r.read().decode()
    except urllib.error.HTTPError as e:
        status, hdrs, text = e.code, e.headers, e.read().decode()
    try:
        parsed = json.loads(text) if text else None
    except ValueError:
        parsed = None
    return status, hdrs, parsed, text


def check(name, cond, detail=''):
    global passed, failed
    if cond:
        passed += 1
        print(f'  ok    {name}')
    else:
        failed += 1
        print(f'  FAIL  {name}  {detail}')


def put(items, cookie=A, **kw):
    return call('PUT', '/api/subjectmastery/progress', {'items': items}, cookie=cookie, **kw)


def item(key=KEY, status='in_progress', position=0, t=1000):
    return {'key': key, 'status': status, 'position': position, 'updatedAt': t}


print('auth gates')
s, h, j, _ = call('GET', '/api/subjectmastery/me')
check('me signed out -> 200 {signedIn:false}', s == 200 and j == {'signedIn': False}, (s, j))
check('me has Cache-Control: no-store', h.get('Cache-Control') == 'no-store', h.get('Cache-Control'))
s, h, j, _ = call('GET', '/api/subjectmastery/me', cookie=A)
check('me signed in -> user fields', s == 200 and j == {'signedIn': True, 'user': {
    'name': 'Tester A', 'email': 'tester.a@example.com', 'avatarUrl': 'https://example.com/a.png'}}, (s, j))
s, _, j, _ = call('GET', '/api/subjectmastery/me', cookie=B)
check('me avatar null when unset', s == 200 and j['user']['avatarUrl'] is None, j)
s, _, j, _ = call('GET', '/api/subjectmastery/me', cookie='batesai_session=not-a-real-token')
check('me with unknown token -> signedIn:false', s == 200 and j == {'signedIn': False}, (s, j))
for m in ('GET', 'PUT', 'DELETE'):
    s, h, j, _ = call(m, '/api/subjectmastery/progress', {'items': []} if m == 'PUT' else None)
    check(f'{m} progress without cookie -> 401 JSON', s == 401 and j and 'error' in j
          and h.get('Cache-Control') == 'no-store', (s, j))
s, _, j, _ = call('GET', '/api/subjectmastery/progress', headers={'Authorization': 'Bearer sm-test-token-a'})
check('Bearer token also accepted (native clients)', s == 200 and 'progress' in j, (s, j))

print('reset + basic write')
s, _, j, _ = call('DELETE', '/api/subjectmastery/progress', cookie=A)
check('DELETE -> 200 {progress:{}}', s == 200 and j == {'progress': {}}, (s, j))
call('DELETE', '/api/subjectmastery/progress', cookie=B)
s, h, j, _ = put([item(position=10.5, t=1000)])
check('PUT first write -> stored', s == 200 and j['progress'] == {KEY: {'status': 'in_progress', 'position': 10.5, 'updatedAt': 1000}}, j)
check('PUT has Cache-Control: no-store', h.get('Cache-Control') == 'no-store')
s, _, j, _ = call('GET', '/api/subjectmastery/progress', cookie=A)
check('GET returns same map', s == 200 and j['progress'][KEY]['position'] == 10.5, j)

print('last-write-wins')
s, _, j, _ = put([item(position=20, t=900)])
check('older write ignored', j['progress'][KEY] == {'status': 'in_progress', 'position': 10.5, 'updatedAt': 1000}, j)
s, _, j, _ = put([item(position=9, t=1000)])
check('equal timestamp, same status, smaller position: stored kept', j['progress'][KEY]['position'] == 10.5, j)
s, _, j, _ = put([item(position=99, t=1000)])
check('equal timestamp, same status, larger position wins (player tie-break)', j['progress'][KEY]['position'] == 99, j)
s, _, j, _ = put([item(position=30, t=2000)])
check('newer write wins', j['progress'][KEY] == {'status': 'in_progress', 'position': 30, 'updatedAt': 2000}, j)
s, _, j, _ = put([item(status='completed', position=31, t=3000)])
check('in_progress -> completed', j['progress'][KEY] == {'status': 'completed', 'position': 31, 'updatedAt': 3000}, j)

print('no-downgrade')
s, _, j, _ = put([item(status='in_progress', position=5, t=4000)])
check('newer in_progress keeps completed, takes position+time', j['progress'][KEY] == {'status': 'completed', 'position': 5, 'updatedAt': 4000}, j)
s, _, j, _ = put([item(status='known', position=0, t=5000)])
check('newer known replaces completed', j['progress'][KEY] == {'status': 'known', 'position': 0, 'updatedAt': 5000}, j)
s, _, j, _ = put([item(status='in_progress', position=7, t=9000)])
check('newer in_progress keeps known, takes position+time', j['progress'][KEY] == {'status': 'known', 'position': 7, 'updatedAt': 9000}, j)
s, _, j, _ = put([item(status='completed', position=1, t=10000)])
check('newer completed replaces known', j['progress'][KEY] == {'status': 'completed', 'position': 1, 'updatedAt': 10000}, j)
s, _, j, _ = put([item(status='known', position=0, t=5500)])
check('older known does not replace completed', j['progress'][KEY]['status'] == 'completed', j)
s, _, j, _ = put([item(status='known', position=50, t=10000)])
check('equal timestamp: known does not beat completed', j['progress'][KEY] == {'status': 'completed', 'position': 1, 'updatedAt': 10000}, j)
s, _, j, _ = put([item(status='in_progress', position=50, t=10000)])
check('equal timestamp: in_progress does not beat completed', j['progress'][KEY]['status'] == 'completed' and j['progress'][KEY]['position'] == 1, j)
K3 = 'economics/m02-markets/l01-supply'
put([item(K3, 'known', 0, 50)])
s, _, j, _ = put([item(K3, 'completed', 3, 50)])
check('equal timestamp: completed beats known', j['progress'][K3] == {'status': 'completed', 'position': 3, 'updatedAt': 50}, j)

print('duplicates in one request')
K2 = 'economics/m01-foundations/l02-opportunity-cost'
s, _, j, _ = put([item(K2, 'in_progress', 1, 10), item(K2, 'completed', 2, 20), item(K2, 'in_progress', 3, 30), item(K2, 'in_progress', 4, 15)])
check('dup keys collapse by the same rule', j['progress'][K2] == {'status': 'completed', 'position': 3, 'updatedAt': 30}, j)

print('user isolation')
s, _, j, _ = call('GET', '/api/subjectmastery/progress', cookie=B)
check('user B sees nothing of A', s == 200 and j == {'progress': {}}, j)
s, _, j, _ = put([item(position=1, t=1)], cookie=B)
check('user B writes own row', j['progress'] == {KEY: {'status': 'in_progress', 'position': 1, 'updatedAt': 1}}, j)
s, _, j, _ = call('GET', '/api/subjectmastery/progress', cookie=A)
check('A unaffected by B', j['progress'][KEY]['status'] == 'completed' and len(j['progress']) == 3, j)

print('validation')
now = int(time.time() * 1000)
bad = [
    ('bad key (uppercase)', [item('Economics/m01/l01')]),
    ('bad key (two parts)', [item('economics/m01')]),
    ('bad key (49 chars)', [item('a' * 49 + '/m/l')]),
    ('bad key (path traversal)', [item('../m/l')]),
    ('bad key (9 segments, v2 max is 8)', [item('/'.join(['a'] * 9))]),
    ('bad key (empty segment)', [item('a//b/c')]),
    ('bad status', [item(status='done')]),
    ('position negative', [item(position=-1)]),
    ('position > 86400', [item(position=86401)]),
    ('position string', [item(position='10')]),
    ('updatedAt string', [{'key': KEY, 'status': 'known', 'position': 0, 'updatedAt': '1000'}]),
    ('updatedAt missing', [{'key': KEY, 'status': 'known', 'position': 0}]),
    ('future timestamp (+10 min)', [item(t=now + 10 * 60 * 1000)]),
    ('item not an object', ['economics/m01/l01']),
]
for name, items in bad:
    s, h, j, _ = put(items)
    check(f'400 {name}', s == 400 and j and 'error' in j and j.get('index') == 0, (s, j))
s, _, j, _ = put([item(K2, 'known', 0, 99999999), item('Bad/Key/x')])
check('one bad item rejects whole request, index reported', s == 400 and j.get('index') == 1, (s, j))
s, _, j, _ = call('GET', '/api/subjectmastery/progress', cookie=A)
check('...and nothing from it was written', j['progress'][K2]['updatedAt'] == 30, j)
s, _, j, _ = put([item('/'.join(['b' * 48] * 8), 'known', 0, 77)])
check('v2 key: 8 segments of 48 chars accepted', s == 200 and j['progress'].get('/'.join(['b' * 48] * 8)) == {'status': 'known', 'position': 0, 'updatedAt': 77}, (s, j and len(j.get('progress', {}))))
s, _, j, _ = put([item('biology/m03-genetics/t02-inheritance/l04-punnett', 'in_progress', 12.5, 78)])
check('v2 key: nested topic lesson accepted', s == 200, (s, j))
s, _, j, _ = put([item('economics/m01-foundations/l03-near-future', 'in_progress', 0, now + 4 * 60 * 1000)])
check('timestamp +4 min accepted (skew allowance)', s == 200, (s, j))
s, _, j, _ = call('PUT', '/api/subjectmastery/progress', raw=b'{not json', cookie=A)
check('invalid JSON -> 400', s == 400 and 'error' in j, (s, j))
s, _, j, _ = call('PUT', '/api/subjectmastery/progress', body={'items': 'x'}, cookie=A)
check('items not array -> 400', s == 400, (s, j))
s, _, j, _ = call('PUT', '/api/subjectmastery/progress', body=[1, 2], cookie=A)
check('body is array -> 400', s == 400, (s, j))
s, _, j, _ = call('PUT', '/api/subjectmastery/progress', raw=b'x' * (600 * 1024), cookie=A)
check('oversized body -> 413', s == 413, (s, j))

print('size limits')
many = [item(f'bulk/m{i // 100:02d}/l{i:03d}', 'known', 0, 1000 + i) for i in range(500)]
t0 = time.time()
s, _, j, _ = put(many)
dt = time.time() - t0
check(f'500 items accepted in one PUT ({dt:.2f}s)', s == 200 and sum(k.startswith('bulk/') for k in j['progress']) == 500, (s, j and len(j.get('progress', {}))))
s, _, j, _ = put(many + [item('bulk/m99/l999')])
check('501 items -> 400', s == 400 and 'Too many' in j['error'], (s, j))

print('method / routing / origin')
s, h, j, _ = call('POST', '/api/subjectmastery/progress', {'items': []}, cookie=A)
check('POST progress -> 405 with Allow', s == 405 and h.get('Allow') == 'GET, PUT, DELETE', (s, h.get('Allow')))
s, _, j, _ = call('PUT', '/api/subjectmastery/me', {}, cookie=A)
check('PUT me -> 405', s == 405, s)
s, _, j, _ = call('GET', '/api/subjectmastery/nope', cookie=A)
check('unknown endpoint -> 404 JSON', s == 404 and j == {'error': 'Unknown endpoint'}, (s, j))
s, _, j, _ = call('GET', '/api/subjectmastery/progress/extra', cookie=A)
check('extra path segment -> 404', s == 404, s)
s, _, j, _ = put([item(t=99999999999)], headers={'Origin': 'https://evil.example'})
check('cross-origin PUT -> 403', s == 403, (s, j))
s, _, j, _ = call('DELETE', '/api/subjectmastery/progress', cookie=A, headers={'Origin': 'https://evil.example'})
check('cross-origin DELETE -> 403', s == 403, (s, j))
s, _, j, _ = put([item(K2, 'known', 0, 21)], headers={'Origin': BASE})
check('same-origin PUT with Origin header -> 200', s == 200, (s, j))
s, h, _, _ = call('OPTIONS', '/api/subjectmastery/progress', headers={'Origin': 'https://evil.example', 'Access-Control-Request-Method': 'PUT'})
check('no CORS: preflight gets no Access-Control-Allow-Origin', h.get('Access-Control-Allow-Origin') is None, (s, h.get('Access-Control-Allow-Origin')))

print('sign-in return_to (GET /api/auth/oauth/google)')


def cookies_of(h):
    return h.get_all('Set-Cookie') or []


s, h, _, _ = call('GET', '/api/auth/oauth/google')
c = cookies_of(h)
check('no return_to: 302 to Google, exactly one cookie (state)', s == 302 and h['Location'].startswith('https://accounts.google.com/')
      and len(c) == 1 and c[0].startswith('google_oauth_state='), (s, c))
s, h, _, _ = call('GET', '/api/auth/oauth/google?return_to=/subjectmastery/')
c = cookies_of(h)
check('return_to=/subjectmastery/: state + return cookie', s == 302 and len(c) == 2
      and any(x.startswith('oauth_return_to=/subjectmastery/; Path=/; Max-Age=600; SameSite=Lax; Secure; HttpOnly') for x in c), c)
check('redirect_uri unchanged (still /membership)', 'redirect_uri=http%3A%2F%2F127.0.0.1%3A8788%2Fmembership&' in h['Location'], h['Location'][:200])
for rt in ['//evil.com', 'https://evil.com/', '/a//b', '/a\\b', '/x?y=1', '/api/auth/logout', '/API/x', '/cdn-cgi/l',
           '/x/../api/auth/logout', '/./x', '/' + 'a' * 200, 'subjectmastery/', '/%2e%2e/api', '']:
    q = urllib.request.quote(rt, safe='')
    s, h, _, _ = call('GET', f'/api/auth/oauth/google?return_to={q}')
    c = cookies_of(h)
    check(f'return_to={rt[:40]!r} ignored', s == 302 and len(c) == 1 and c[0].startswith('google_oauth_state='), c)
s, h, _, _ = call('GET', '/api/auth/oauth/google?return_to=/' + 'a' * 199)
check('return_to of exactly 200 chars accepted', len(cookies_of(h)) == 2, cookies_of(h))
s, h, _, _ = call('GET', '/api/auth/oauth/google', cookie='oauth_return_to=/subjectmastery/')
c = cookies_of(h)
check('plain sign-in clears a leftover return cookie', len(c) == 2 and any(x.startswith('oauth_return_to=; Path=/; Max-Age=0') for x in c), c)

print('sign-in return_to (GET /membership callback; no real Google round trip possible)')
RT = 'oauth_return_to=/subjectmastery/'
s, h, _, _ = call('GET', '/membership?code=bogus&state=s1')
check('no cookie, exchange fails -> /membership/?error=… (unchanged)', s == 302 and h['Location'].endswith('/membership/?error=token_rejected')
      and not cookies_of(h), (s, h.get('Location'), cookies_of(h)))
s, h, _, _ = call('GET', '/membership?code=bogus&state=s1', cookie=RT)
check('cookie, exchange fails -> /subjectmastery/?signin_error=…', s == 302 and h['Location'].endswith('/subjectmastery/?signin_error=token_rejected')
      and any(x.startswith('oauth_return_to=; Path=/; Max-Age=0') for x in cookies_of(h)), (s, h.get('Location'), cookies_of(h)))
s, h, _, _ = call('GET', '/membership?code=bogus&state=s1', cookie=RT + '; google_oauth_state=other')
check('cookie, state mismatch -> /subjectmastery/?signin_error=state_mismatch', h['Location'].endswith('/subjectmastery/?signin_error=state_mismatch'), h.get('Location'))
s, h, _, _ = call('GET', '/membership?error=access_denied&state=s1', cookie=RT)
check('cookie, consent refused (no code) -> /subjectmastery/?signin_error=access_denied', s == 302 and h['Location'].endswith('/subjectmastery/?signin_error=access_denied'), (s, h.get('Location')))
s, h, _, _ = call('GET', '/membership?error=access_denied&state=s1')
check('no cookie, consent refused -> 308 /membership/?error=… (unchanged)', s == 308 and h['Location'].endswith('/membership/?error=access_denied&state=s1'), (s, h.get('Location')))
s, h, _, _ = call('GET', '/membership', cookie=RT)
check('cookie, plain visit -> 308 /membership/ (cookie kept)', s == 308 and h['Location'].endswith('/membership/') and not cookies_of(h), (s, h.get('Location')))
s, h, _, _ = call('GET', '/membership?code=bogus&state=s1', cookie='oauth_return_to=//evil.com')
check('planted invalid cookie ignored -> /membership/?error=…', h['Location'].endswith('/membership/?error=token_rejected'), h.get('Location'))

print('profile + plan documents (CONTRACT v2)')
PROFILE = {'displayName': 'Tester A', 'bio': 'Learning economics.\nOne page a day.', 'avatar': {'kind': 'emoji', 'value': '🦉'},
           'accent': '#1f6feb', 'banner': 'tide', 'featuredSubjects': ['economics', 'biology/m03-genetics'], 'showIq': True}


def doc(name, body=None, cookie=A, method=None, **kw):
    return call(method or ('PUT' if body is not None else 'GET'), f'/api/subjectmastery/{name}', body, cookie=cookie, **kw)


for name in ('profile', 'plan'):
    s, h, j, _ = doc(name, cookie=None)
    check(f'GET {name} signed out -> 401', s == 401 and h.get('Cache-Control') == 'no-store', (s, j))
    s, _, j, _ = doc(name, {name: {'updatedAt': 1}}, cookie=None)
    check(f'PUT {name} signed out -> 401', s == 401, (s, j))
    s, _, j, _ = doc(name)
    check(f'GET {name} before any save -> {{{name}: null}}', s == 200 and j == {name: None}, (s, j))
    s, h, j, _ = doc(name, method='DELETE')
    check(f'DELETE {name} -> 405', s == 405 and h.get('Allow') == 'GET, PUT', (s, h.get('Allow')))
s, _, j, _ = doc('profile', {'profile': dict(PROFILE, updatedAt=1000, isAdmin=True)})
check('PUT profile -> stored, unknown field dropped', s == 200 and j['profile'] == dict(PROFILE, updatedAt=1000), (s, j))
s, _, j, _ = doc('profile', {'profile': dict(PROFILE, displayName='Older', updatedAt=900)})
check('older profile ignored, stored copy returned', j['profile']['displayName'] == 'Tester A' and j['profile']['updatedAt'] == 1000, j)
s, _, j, _ = doc('profile', {'profile': dict(PROFILE, displayName='Tie', updatedAt=1000)})
check('equal-time profile keeps stored', j['profile']['displayName'] == 'Tester A', j)
s, _, j, _ = doc('profile', {'profile': {'displayName': 'Newer', 'updatedAt': 2000}})
check('newer profile replaces whole document', j['profile'] == {'displayName': 'Newer', 'updatedAt': 2000}, j)
s, _, j, _ = doc('profile', cookie=B)
check('user B cannot see A\'s profile', j == {'profile': None}, j)
img = 'data:image/png;base64,' + 'A' * 1000
s, _, j, _ = doc('profile', {'profile': dict(PROFILE, avatar={'kind': 'image', 'value': img}, bio='é' * 280, updatedAt=3000)})
check('image avatar data URL + 280-character bio accepted', s == 200 and j['profile']['avatar']['kind'] == 'image', (s, j))
bad_profiles = [
    ('javascript: avatar', {'avatar': {'kind': 'image', 'value': 'javascript:alert(1)'}}),
    ('svg data URL avatar', {'avatar': {'kind': 'image', 'value': 'data:image/svg+xml;base64,PHN2Zz4='}}),
    ('oversized image avatar', {'avatar': {'kind': 'image', 'value': 'data:image/png;base64,' + 'A' * (64 * 1024)}}),
    ('emoji avatar with markup', {'avatar': {'kind': 'emoji', 'value': '<b>'}}),
    ('unknown avatar kind', {'avatar': {'kind': 'url', 'value': ''}}),
    ('bio of 281 characters', {'bio': 'x' * 281}),
    ('displayName of 61 characters', {'displayName': 'x' * 61}),
    ('displayName with newline', {'displayName': 'a\nb'}),
    ('accent not hex', {'accent': 'red'}),
    ('banner with markup', {'banner': '<x>'}),
    ('7 featured subjects', {'featuredSubjects': ['a', 'b', 'c', 'd', 'e', 'f', 'g']}),
    ('featured subject bad key', {'featuredSubjects': ['Bad Key']}),
    ('showIq not boolean', {'showIq': 'yes'}),
    ('updatedAt future', {'updatedAt': now + 10 * 60 * 1000}),
    ('updatedAt missing', {'updatedAt': None}),
]
for name, patch in bad_profiles:
    body = dict(PROFILE, updatedAt=4000)
    body.update(patch)
    if body.get('updatedAt') is None:
        body.pop('updatedAt')
    s, _, j, _ = doc('profile', {'profile': body})
    check(f'400 profile {name}', s == 400 and 'error' in j, (s, j))
s, _, j, _ = doc('profile', {'displayName': 'not wrapped', 'updatedAt': 5000})
check('400 profile body not wrapped in {profile}', s == 400, (s, j))
s, _, j, _ = doc('profile', {'profile': [1]})
check('400 profile is an array', s == 400, (s, j))
s, _, j, _ = call('PUT', '/api/subjectmastery/profile', raw=b'{"profile":{"bio":"' + b'x' * (100 * 1024) + b'","updatedAt":1}}', cookie=A)
check('oversized profile body -> 413', s == 413, (s, j))
s, _, j, _ = doc('profile', {'profile': dict(PROFILE, updatedAt=6000)}, headers={'Origin': 'https://evil.example'})
check('cross-origin PUT profile -> 403', s == 403, (s, j))
s, _, j, _ = doc('profile')
check('rejected writes left the stored profile alone', j['profile']['updatedAt'] == 3000, j)

PLAN = {'blocks': [{'id': 'b1a2b3c4d5', 'topicKey': 'biology'}, {'id': 'b2', 'topicKey': 'biology/m03-genetics'},
                   {'id': 'b3', 'topicKey': 'economics'}]}
s, _, j, _ = doc('plan', {'plan': dict(PLAN, updatedAt=1000, extra=1)})
check('PUT plan -> stored', s == 200 and j['plan'] == dict(PLAN, updatedAt=1000), (s, j))
s, _, j, _ = doc('plan', {'plan': {'blocks': [], 'updatedAt': 999}})
check('older plan ignored', len(j['plan']['blocks']) == 3, j)
s, _, j, _ = doc('plan', {'plan': {'blocks': [], 'updatedAt': 1001}})
check('newer empty plan replaces it', j['plan'] == {'blocks': [], 'updatedAt': 1001}, j)
longkey = '/'.join(['c' * 48] * 7)
s, _, j, _ = doc('plan', {'plan': {'blocks': [{'id': f'b{i:03d}' + 'x' * 28, 'topicKey': longkey} for i in range(200)], 'updatedAt': 1002}})
check('200 blocks of the longest topic key accepted', s == 200 and len(j['plan']['blocks']) == 200, (s, j and str(j)[:100]))
for name, plan in [
    ('201 blocks', {'blocks': [{'id': f'b{i}', 'topicKey': 'biology'} for i in range(201)]}),
    ('bad topicKey', {'blocks': [{'id': 'b1', 'topicKey': 'Biology'}]}),
    ('topicKey too deep', {'blocks': [{'id': 'b1', 'topicKey': '/'.join(['a'] * 8)}]}),
    ('bad block id', {'blocks': [{'id': 'b 1', 'topicKey': 'biology'}]}),
    ('blocks missing', {}),
]:
    s, _, j, _ = doc('plan', {'plan': dict(plan, updatedAt=2000)})
    check(f'400 plan {name}', s == 400, (s, j))
put([item(position=1, t=1)], cookie=B)
doc('profile', {'profile': {'displayName': 'B', 'updatedAt': 1}}, cookie=B)
doc('plan', {'plan': {'blocks': [], 'updatedAt': 1}}, cookie=B)

print('account deletion clears sm_progress, sm_profile, sm_plan')
s, _, j, _ = call('GET', '/api/subjectmastery/progress', cookie=A)
before = len(j['progress'])
s, _, j, _ = call('DELETE', '/api/auth/account', cookie=A)
check('DELETE /api/auth/account -> deleted', s == 200 and j == {'deleted': True}, (s, j))


def d1_counts(table):
    out = subprocess.run(['wrangler', 'd1', 'execute', 'batesai-db', '--local', '--json', '--command',
                          f"SELECT user_id, COUNT(*) AS n FROM {table} GROUP BY user_id"],
                         capture_output=True, text=True, timeout=120, cwd=sys.argv[2] if len(sys.argv) > 2 else None)
    try:
        return {r['user_id']: r['n'] for r in json.loads(out.stdout)[0]['results']}
    except Exception:
        return (out.stdout[-300:], out.stderr[-300:])


counts = d1_counts('sm_progress')
check(f'sm_progress: A had {before} rows, now none; B keeps its 1', isinstance(counts, dict) and 'u-test-a' not in counts and counts.get('u-test-b') == 1, counts)
for table in ('sm_profile', 'sm_plan'):
    counts = d1_counts(table)
    check(f'{table}: A gone, B kept', isinstance(counts, dict) and 'u-test-a' not in counts and counts.get('u-test-b') == 1, counts)
s, _, j, _ = call('GET', '/api/subjectmastery/progress', cookie=A)
check('A session gone -> 401', s == 401, s)

print(f'\n{passed} passed, {failed} failed')
sys.exit(1 if failed else 0)
