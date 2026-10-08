// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Unit tests for the return_to change in functions/membership.js and the
// GET /api/auth/oauth/google start route, run in Node with fetch stubbed.
//
// A real Google round trip cannot be scripted (it needs a person at Google's
// consent screen), so the token exchange subrequest is replaced by a stub that
// answers the way /api/auth/oauth/google does. Two things are proven:
//   1. With no oauth_return_to cookie, the NEW code's responses (status, every
//      header including each Set-Cookie, body) are identical to the ORIGINAL
//      code from commit 7eea212f, across every branch of both handlers.
//   2. With the cookie, success lands on <path>?signed_in=1 with the session
//      cookie set and the return cookie cleared; failures land on
//      <path>?signin_error=<reason>.
//
//   node test_membership_unit.mjs <old-functions-dir> <new-functions-dir>
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const [oldDir, newDir] = process.argv.slice(2);
if (!oldDir || !newDir) throw new Error('usage: node test_membership_unit.mjs <old functions/> <new functions/>');
const load = (dir, rel) => import(pathToFileURL(path.join(dir, rel)).href);
const oldMember = await load(oldDir, 'membership.js');
const newMember = await load(newDir, 'membership.js');
const oldAuth = await load(oldDir, 'api/auth/[[path]].js');
const newAuth = await load(newDir, 'api/auth/[[path]].js');

let passed = 0;
let failed = 0;
function check(name, cond, detail) {
  if (cond) { passed++; console.log(`  ok    ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
}

// ---- fetch stub ---------------------------------------------------------
let stubMode = 'ok';
let stubCalls = [];
globalThis.fetch = async (url, init) => {
  stubCalls.push({ url: String(url), method: init?.method, body: init?.body });
  if (stubMode === 'throw') throw new Error('network down');
  if (stubMode === 'invalid_grant') {
    return new Response(JSON.stringify({ error: 'Failed to exchange authorization code', detail: 'Bad Request', code: 'invalid_grant' }), { status: 400 });
  }
  if (stubMode === 'redirect_mismatch') {
    return new Response(JSON.stringify({ error: 'x', code: 'redirect_uri_mismatch' }), { status: 400 });
  }
  if (stubMode === 'server500') return new Response('oops', { status: 500 });
  const res = new Response(JSON.stringify({ success: true, token: 'tok123' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  res.headers.append('Set-Cookie', 'batesai_session=tok123; Path=/; Max-Age=2592000; SameSite=Lax; Secure; HttpOnly');
  return res;
};

// Deterministic state values so the old and new start routes can be compared.
Object.defineProperty(globalThis.crypto, 'randomUUID', { value: () => '00000000-0000-4000-8000-000000000000', configurable: true });

async function snapshot(res) {
  return {
    status: res.status,
    headers: [...res.headers].map(([k, v]) => `${k}: ${v}`),
    body: res.body ? await res.text() : null,
  };
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const req = (url, cookie, init = {}) => new Request(url, { ...init, headers: { ...(cookie ? { Cookie: cookie } : {}), ...(init.headers || {}) } });

// ---- 1. membership GET: old vs new with no return cookie ---------------
console.log('membership GET, no return cookie: new == original');
const O = 'https://batesai.org';
const getCases = [
  ['bare /membership', `${O}/membership`, '', 'ok'],
  ['query passthrough', `${O}/membership?utm=x&b=2`, '', 'ok'],
  ['consent refused, no code', `${O}/membership?error=access_denied&state=s`, '', 'ok'],
  ['code + error', `${O}/membership?code=c&error=access_denied`, '', 'ok'],
  ['state mismatch', `${O}/membership?code=c&state=b`, 'google_oauth_state=a', 'ok'],
  ['subrequest throws', `${O}/membership?code=c&state=s`, 'google_oauth_state=s', 'throw'],
  ['invalid_grant', `${O}/membership?code=c&state=s`, 'google_oauth_state=s', 'invalid_grant'],
  ['redirect_uri_mismatch', `${O}/membership?code=c`, '', 'redirect_mismatch'],
  ['exchange 500', `${O}/membership?code=c`, '', 'server500'],
  ['success', `${O}/membership?code=c&state=s`, 'google_oauth_state=s', 'ok'],
  ['success, unrelated cookies', `${O}/membership?code=c&state=s`, 'google_oauth_state=s; batesai_session=old; theme=dark', 'ok'],
  ['success, invalid planted return cookie', `${O}/membership?code=c`, 'oauth_return_to=//evil.com', 'ok'],
];
for (const [name, url, cookie, mode] of getCases) {
  stubMode = mode;
  stubCalls = [];
  const a = await snapshot(await oldMember.onRequestGet({ request: req(url, cookie) }));
  const oldCalls = stubCalls; stubCalls = [];
  const b = await snapshot(await newMember.onRequestGet({ request: req(url, cookie) }));
  // An invalid planted cookie is ignored by the new code, so it must match the
  // original's no-cookie answer exactly.
  check(`${name}: identical response`, same(a, b), { old: a, new: b });
  check(`${name}: identical subrequests`, same(oldCalls, stubCalls), { old: oldCalls, new: stubCalls });
}

// ---- 2. membership GET with a return cookie ----------------------------
console.log('membership GET with oauth_return_to=/subjectmastery/');
const RT = 'oauth_return_to=/subjectmastery/';
const CLEAR = 'oauth_return_to=; Path=/; Max-Age=0; SameSite=Lax; Secure; HttpOnly';
stubMode = 'ok'; stubCalls = [];
let r = await snapshot(await newMember.onRequestGet({ request: req(`${O}/membership?code=abc&state=s`, `google_oauth_state=s; ${RT}`) }));
check('success -> 302 /subjectmastery/?signed_in=1', r.status === 302 && r.headers.includes(`location: ${O}/subjectmastery/?signed_in=1`), r);
check('success sets the session cookie', r.headers.includes('set-cookie: batesai_session=tok123; Path=/; Max-Age=2592000; SameSite=Lax; Secure; HttpOnly'), r.headers);
check('success clears state cookie', r.headers.includes('set-cookie: google_oauth_state=; Path=/; Max-Age=0; SameSite=Lax; Secure; HttpOnly'), r.headers);
check('success clears return cookie', r.headers.includes(`set-cookie: ${CLEAR}`), r.headers);
check('exchange called once, POST, with the code', stubCalls.length === 1 && stubCalls[0].method === 'POST'
  && stubCalls[0].url === `${O}/api/auth/oauth/google` && JSON.parse(stubCalls[0].body).authorization_code === 'abc', stubCalls);

const failCases = [
  ['invalid_grant', `${O}/membership?code=c`, RT, 'invalid_grant', 'code_replayed'],
  ['redirect_uri_mismatch', `${O}/membership?code=c`, RT, 'redirect_mismatch', 'not_configured'],
  ['exchange 500', `${O}/membership?code=c`, RT, 'server500', 'token_rejected'],
  ['subrequest throws', `${O}/membership?code=c`, RT, 'throw', 'server_error'],
  ['state mismatch', `${O}/membership?code=c&state=b`, `google_oauth_state=a; ${RT}`, 'ok', 'state_mismatch'],
  ['code + error', `${O}/membership?code=c&error=x`, RT, 'ok', 'access_denied'],
  ['consent refused, no code', `${O}/membership?error=access_denied`, RT, 'ok', 'access_denied'],
];
for (const [name, url, cookie, mode, reason] of failCases) {
  stubMode = mode;
  r = await snapshot(await newMember.onRequestGet({ request: req(url, cookie) }));
  check(`${name} -> /subjectmastery/?signin_error=${reason} + clear`, r.status === 302
    && r.headers.includes(`location: ${O}/subjectmastery/?signin_error=${reason}`)
    && r.headers.includes(`set-cookie: ${CLEAR}`)
    && !r.headers.some((h) => h.startsWith('set-cookie: batesai_session')), r);
}
stubMode = 'ok';
r = await snapshot(await newMember.onRequestGet({ request: req(`${O}/membership`, RT) }));
check('plain /membership visit with cookie -> unchanged 308, cookie kept', r.status === 308
  && r.headers.includes(`location: ${O}/membership/`) && !r.headers.some((h) => h.startsWith('set-cookie')), r);
r = await snapshot(await newMember.onRequestGet({ request: req(`${O}/membership?code=c`, 'oauth_return_to=/learn/economics/') }));
check('other valid return path honoured', r.headers.includes(`location: ${O}/learn/economics/?signed_in=1`), r.headers);

// ---- 3. membership POST (Apple) untouched -------------------------------
console.log('membership POST (Apple form_post): new == original, even with a return cookie');
for (const [name, form, cookie] of [
  ['id_token', 'id_token=x.y.z&state=s', 'apple_oauth_state=s'],
  ['error', 'error=user_cancelled_authorize', ''],
  ['nothing', 'foo=1', ''],
  ['with return cookie', 'id_token=x.y.z', RT],
]) {
  stubMode = 'ok';
  const mk = () => req(`${O}/membership`, cookie, { method: 'POST', body: form, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  const a = await snapshot(await oldMember.onRequestPost({ request: mk() }));
  const b = await snapshot(await newMember.onRequestPost({ request: mk() }));
  check(`POST ${name}: identical`, same(a, b), { old: a, new: b });
}

// ---- 4. GET /api/auth/oauth/google start route --------------------------
console.log('GET /api/auth/oauth/google');
const env = { OAUTH_GOOGLE_CLIENT_ID: 'test-client.apps.googleusercontent.com' };
const start = (mod, url, cookie) => mod.onRequest({ request: req(url, cookie), env, params: { path: ['oauth', 'google'] } });
for (const [name, url, cookie] of [
  ['no return_to', `${O}/api/auth/oauth/google`, ''],
  ['no return_to, other cookies', `${O}/api/auth/oauth/google`, 'batesai_session=x; theme=dark'],
  ['invalid return_to', `${O}/api/auth/oauth/google?return_to=//evil.com`, ''],
  ['unrelated query', `${O}/api/auth/oauth/google?foo=bar`, ''],
]) {
  const a = await snapshot(await start(oldAuth, url, cookie));
  const b = await snapshot(await start(newAuth, url, cookie));
  check(`${name}: identical to original`, same(a, b), { old: a, new: b });
}
r = await snapshot(await start(newAuth, `${O}/api/auth/oauth/google?return_to=/subjectmastery/`, ''));
check('return_to: adds exactly the return cookie', r.status === 302 && r.headers.filter((h) => h.startsWith('set-cookie')).length === 2
  && r.headers.includes('set-cookie: oauth_return_to=/subjectmastery/; Path=/; Max-Age=600; SameSite=Lax; Secure; HttpOnly'), r.headers);
const noRt = await snapshot(await start(oldAuth, `${O}/api/auth/oauth/google`, ''));
check('return_to: Location identical to a plain sign-in', r.headers.find((h) => h.startsWith('location')) === noRt.headers.find((h) => h.startsWith('location')), r.headers);
r = await snapshot(await start(newAuth, `${O}/api/auth/oauth/google`, RT));
check('plain sign-in with leftover return cookie clears it', r.headers.includes(`set-cookie: ${CLEAR}`), r.headers);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
