// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
// Unit tests for the voice credits, the API-probe rule, the IQ "next point" hint and
// the #/about route — run with: node --test 'web/tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { voiceCredit, voiceLine, VOICES, ENGINE } from '../js/credits.js';
import { apiProbeAllowed, createSync, createProgressStore } from '../js/progress.js';
import { estimateIq, minutesToNextPoint } from '../js/iq.js';
import { parseRoute, href } from '../js/router.js';

// ---------------------------------------------------------------- credits

test('voice credits: the five Piper voices map to a name, dataset and licence', () => {
  for (const id of ['piper:en_US-john-medium', 'piper:en_US-lessac-medium', 'piper:en_US-ryan-high', 'piper:en_GB-cori-medium', 'piper:en_US-libritts_r-medium']) {
    const c = voiceCredit(id);
    assert.equal(c.known, true, id);
    assert.equal(c.engine, 'Piper TTS');
    assert.ok(c.name && c.dataset && c.licence && c.url.startsWith('https://'), id);
    assert.ok(VOICES[id]);
  }
  assert.equal(voiceCredit('piper:en_US-john-medium').licence, 'public domain');
  assert.equal(voiceCredit('piper:en_GB-cori-medium').licence, 'public domain');
  assert.equal(voiceCredit('piper:en_US-ryan-high').licence, 'CC BY-NC-SA 4.0');
  assert.match(voiceCredit('piper:en_US-lessac-medium').licence, /non-commercial/);
  assert.match(ENGINE.licence, /^GPL-3\.0-or-later/);
});

test('voice credits: an unknown voice falls back to its id; junk and missing voices are safe', () => {
  const c = voiceCredit('piper:en_AU-new-voice-high');
  assert.equal(c.known, false);
  assert.equal(c.name, 'piper:en_AU-new-voice-high');
  assert.equal(voiceLine('piper:en_AU-new-voice-high'), 'Narrated by Piper TTS · voice piper:en_AU-new-voice-high');
  assert.equal(voiceCredit('other:thing').engine, '');
  assert.equal(voiceCredit(null), null);
  assert.equal(voiceCredit(''), null);
  assert.equal(voiceLine(undefined), '');
  assert.equal(voiceCredit('<img src=x onerror=alert(1)>').name, 'unknown voice');
  assert.equal(voiceLine('piper:en_US-lessac-medium'), 'Narrated by Piper TTS · Lessac voice (US English)');
});

// ---------------------------------------------------------------- API probe

test('api probe: live hosts probe; loopback, .local, file: and app schemes stay local-only', () => {
  const yes = (o) => assert.equal(apiProbeAllowed(o), true, JSON.stringify(o));
  const no = (o) => assert.equal(apiProbeAllowed(o), false, JSON.stringify(o));
  yes({ protocol: 'https:', hostname: 'batesai.org' });
  yes({ protocol: 'https:', hostname: 'subject-mastery.pages.dev' });
  yes({ protocol: 'http:', hostname: '192.0.2.20' });
  no({ protocol: 'http:', hostname: '127.0.0.1' });
  no({ protocol: 'http:', hostname: '127.1.2.3' });
  no({ protocol: 'http:', hostname: 'localhost' });
  no({ protocol: 'http:', hostname: 'app.localhost' });
  no({ protocol: 'http:', hostname: '[::1]' });
  no({ protocol: 'http:', hostname: 'macbook.local' });
  no({ protocol: 'file:', hostname: '' });
  no({ protocol: 'app:', hostname: 'subjectmastery' });
  no({});
});

test('api probe: the developer switch beats the meta tag, which beats the host rule', () => {
  assert.equal(apiProbeAllowed({ protocol: 'http:', hostname: '127.0.0.1', override: 'on' }), true);
  assert.equal(apiProbeAllowed({ protocol: 'https:', hostname: 'batesai.org', override: 'off' }), false);
  assert.equal(apiProbeAllowed({ protocol: 'http:', hostname: 'localhost', meta: 'on' }), true);
  assert.equal(apiProbeAllowed({ protocol: 'https:', hostname: 'batesai.org', meta: 'off' }), false);
  assert.equal(apiProbeAllowed({ protocol: 'https:', hostname: 'batesai.org', meta: 'off', override: 'on' }), true);
  assert.equal(apiProbeAllowed({ protocol: 'https:', hostname: 'batesai.org', override: 'maybe' }), true);
});

function res(status, body, type = 'application/json') {
  return { ok: status >= 200 && status < 300, status, headers: { get: () => type }, json: async () => (typeof body === 'string' ? JSON.parse(body) : body) };
}

test('sync init: probe=false never calls fetch and reports local-only', async () => {
  let calls = 0;
  const sync = createSync({ store: createProgressStore({ storage: null }), storage: null, probe: false, fetchImpl: async () => { calls++; return res(200, { signedIn: true }); } });
  const st = await sync.init();
  assert.equal(calls, 0);
  assert.equal(st.available, false);
  assert.equal(st.signedIn, false);
});

test('sync init: 404, HTML, {} and broken JSON from /me all mean local-only, silently', async () => {
  const cases = [res(404, { error: 'x' }), res(200, '<!doctype html>', 'text/html'), res(200, {}), res(200, '{nope'), null];
  for (const r of cases) {
    const errors = [];
    const orig = console.error;
    console.error = (...a) => errors.push(a);
    try {
      const sync = createSync({ store: createProgressStore({ storage: null }), storage: null, fetchImpl: async () => { if (!r) throw new TypeError('Failed to fetch'); return r; } });
      const st = await sync.init();
      assert.equal(st.available, false);
      assert.equal(st.signedIn, false);
    } finally {
      console.error = orig;
    }
    assert.deepEqual(errors, []);
  }
});

test('sync init: {signedIn:false} means the API exists (Sign in is offered)', async () => {
  const sync = createSync({ store: createProgressStore({ storage: null }), storage: null, fetchImpl: async () => res(200, { signedIn: false }) });
  const st = await sync.init();
  assert.equal(st.available, true);
  assert.equal(st.signedIn, false);
});

// ---------------------------------------------------------------- IQ hint

test('IQ next point: minutes until the score rises by one', () => {
  for (const [T, B] of [[0, 0], [10, 0], [76, 0], [500, 2], [2900, 4]]) {
    const m = minutesToNextPoint(T, B);
    assert.ok(m > 0);
    assert.equal(estimateIq(T + m, B), estimateIq(T, B) + 1, `${T},${B}`);
    assert.equal(estimateIq(T + m - 1, B), estimateIq(T, B), `${T},${B} minimal`);
  }
  assert.equal(minutesToNextPoint(0, 0), 76);
  assert.equal(minutesToNextPoint(1e9, 1e9), null);
});

// ---------------------------------------------------------------- route

test('router: #/about (with an optional ?credits) is a route', () => {
  assert.deepEqual(parseRoute('#/about'), { name: 'about' });
  assert.deepEqual(parseRoute('#/about?credits'), { name: 'about' });
  assert.equal(parseRoute('#/about/x').name, 'notfound');
  assert.equal(href.about(), '#/about');
});
