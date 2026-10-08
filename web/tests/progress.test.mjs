// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// Unit tests for web/js/progress.js — run with: node --test web/tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeRecord, mergeRecord, mergeMaps, diffForPush, sanitizeMap, isValidKey,
  createProgressStore, createSync, chunk, ownerTag, summarize, OWNER_KEY, PROGRESS_KEY,
} from '../js/progress.js';

const K = 'economics/m01-foundations/l01-scarcity-and-choice';
const K2 = 'economics/m01-foundations/l02-opportunity-cost';
const rec = (status, position, updatedAt) => ({ status, position, updatedAt });

function memStorage(init = {}) {
  const m = new Map(Object.entries(init));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    _m: m,
  };
}

// ---------------------------------------------------------------- keys / records

test('lesson keys: v1 three-part and v2 deeper keys are valid, junk is not', () => {
  assert.ok(isValidKey(K));
  assert.ok(isValidKey('biology/m03-genetics/t02-mendel/l01-peas'));
  assert.ok(!isValidKey('economics/m01'));
  assert.ok(!isValidKey('Economics/m01/l01'));
  assert.ok(!isValidKey('a/b/c/d/e/f/g/h/i'));
  assert.ok(!isValidKey('__proto__/x/y'));
  assert.ok(!isValidKey(`${'a'.repeat(49)}/b/c`));
});

test('normalizeRecord rejects bad status/time and clamps position', () => {
  assert.equal(normalizeRecord(null), null);
  assert.equal(normalizeRecord(rec('done', 0, 1)), null);
  assert.equal(normalizeRecord(rec('known', 0, NaN)), null);
  assert.deepEqual(normalizeRecord(rec('in_progress', -5, 10)), rec('in_progress', 0, 10));
  assert.deepEqual(normalizeRecord(rec('in_progress', 999999, 10)), rec('in_progress', 86400, 10));
  assert.deepEqual(normalizeRecord(rec('in_progress', 'x', 10.7)), rec('in_progress', 0, 10));
  assert.deepEqual(normalizeRecord(rec('in_progress', 12.345, 10)), rec('in_progress', 12.3, 10));
});

test('sanitizeMap drops invalid keys and records', () => {
  const out = sanitizeMap({ [K]: rec('known', 0, 5), 'bad key': rec('known', 0, 5), [K2]: { status: 'nope' } });
  assert.deepEqual(Object.keys(out), [K]);
  assert.deepEqual(sanitizeMap([1, 2]), {});
  assert.deepEqual(sanitizeMap('x'), {});
});

// ---------------------------------------------------------------- merge rules

test('last write wins on updatedAt', () => {
  assert.deepEqual(mergeRecord(rec('in_progress', 10, 100), rec('in_progress', 50, 200)), rec('in_progress', 50, 200));
  assert.deepEqual(mergeRecord(rec('completed', 0, 300), rec('known', 0, 200)), rec('completed', 0, 300));
  assert.deepEqual(mergeRecord(rec('completed', 0, 100), rec('known', 0, 200)), rec('known', 0, 200));
});

test('a newer in_progress position save never downgrades completed or known', () => {
  const done = rec('completed', 0, 100);
  const stale = rec('in_progress', 42, 200);
  assert.deepEqual(mergeRecord(done, stale), rec('completed', 42, 200));
  assert.deepEqual(mergeRecord(stale, done), rec('completed', 42, 200));
  assert.deepEqual(mergeRecord(rec('known', 0, 100), rec('in_progress', 7, 999)).status, 'known');
});

test('merge is commutative and idempotent, ties are deterministic', () => {
  const cases = [
    [rec('in_progress', 10, 100), rec('in_progress', 20, 100)],
    [rec('known', 0, 100), rec('completed', 0, 100)],
    [rec('in_progress', 5, 100), rec('known', 0, 100)],
    [rec('completed', 0, 50), rec('in_progress', 9, 60)],
    [rec('known', 0, 70), rec('known', 0, 70)],
  ];
  for (const [a, b] of cases) {
    const ab = mergeRecord(a, b);
    assert.deepEqual(ab, mergeRecord(b, a), JSON.stringify([a, b]));
    assert.deepEqual(mergeRecord(ab, ab), ab);
    assert.deepEqual(mergeRecord(ab, a), ab);
  }
  assert.deepEqual(mergeRecord(rec('known', 0, 100), rec('completed', 0, 100)).status, 'completed');
  assert.deepEqual(mergeRecord(rec('in_progress', 10, 100), rec('in_progress', 20, 100)).position, 20);
});

test('merge with a missing side returns the other', () => {
  assert.deepEqual(mergeRecord(null, rec('known', 0, 1)), rec('known', 0, 1));
  assert.deepEqual(mergeRecord(rec('known', 0, 1), undefined), rec('known', 0, 1));
  assert.equal(mergeRecord(null, null), null);
});

test('mergeMaps unions keys and does not mutate inputs', () => {
  const a = { [K]: rec('in_progress', 10, 100) };
  const b = { [K]: rec('completed', 0, 50), [K2]: rec('known', 0, 5) };
  const aCopy = JSON.parse(JSON.stringify(a));
  const m = mergeMaps(a, b);
  assert.deepEqual(m[K], rec('completed', 10, 100));
  assert.deepEqual(m[K2], rec('known', 0, 5));
  assert.deepEqual(a, aCopy);
});

test('diffForPush sends only what the server lacks or has older', () => {
  const local = { [K]: rec('known', 0, 300), [K2]: rec('in_progress', 5, 100) };
  const server = { [K2]: rec('in_progress', 9, 200) };
  const items = diffForPush(local, server);
  assert.deepEqual(items, [{ key: K, ...rec('known', 0, 300) }]);
  assert.deepEqual(diffForPush(server, server), []);
});

test('chunk splits lists for the 500-item PUT limit', () => {
  const list = Array.from({ length: 1201 }, (_, i) => i);
  assert.deepEqual(chunk(list, 500).map((c) => c.length), [500, 500, 201]);
  assert.deepEqual(chunk([], 500), []);
});

test('ownerTag is stable and case-insensitive', () => {
  assert.equal(ownerTag('A@EXAMPLE.COM'), ownerTag(' a@example.com '));
  assert.notEqual(ownerTag('a@example.com'), ownerTag('c@example.com'));
  assert.match(ownerTag('x'), /^u[0-9a-f]{8}$/);
});

test('summarize counts statuses', () => {
  const s = summarize({ [K]: rec('known', 0, 1), [K2]: rec('completed', 0, 1) });
  assert.deepEqual(s, { total: 2, completed: 1, known: 1, inProgress: 0, done: 2 });
});

// ---------------------------------------------------------------- local store

test('store persists to sm.progress.v1 and keeps done status on position saves', () => {
  const storage = memStorage();
  let t = 1000;
  const store = createProgressStore({ storage, now: () => t });
  store.markStarted(K);
  assert.equal(store.status(K), 'in_progress');
  t = 2000;
  store.savePosition(K, 33.3);
  assert.deepEqual(store.get(K), rec('in_progress', 33.3, 2000));
  t = 3000;
  store.setStatus(K, 'completed');
  t = 4000;
  assert.equal(store.savePosition(K, 50), false);
  assert.deepEqual(store.get(K), rec('completed', 0, 3000));
  assert.deepEqual(JSON.parse(storage.getItem(PROGRESS_KEY))[K], rec('completed', 0, 3000));
  // a second store reads it back
  assert.deepEqual(createProgressStore({ storage }).get(K), rec('completed', 0, 3000));
});

test('store survives corrupt storage and throwing storage', () => {
  const bad = memStorage({ [PROGRESS_KEY]: '{not json' });
  assert.deepEqual(createProgressStore({ storage: bad }).all(), {});
  const throwing = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  const s = createProgressStore({ storage: throwing });
  s.setStatus(K, 'known');
  assert.equal(s.status(K), 'known');
});

test('setStatusMany + restore implements undo, including back to "not started"', () => {
  let t = 10;
  const store = createProgressStore({ storage: memStorage(), now: () => t });
  store.savePosition(K, 12);
  const events = [];
  store.subscribe((keys, source) => events.push([keys.slice().sort(), source]));
  t = 20;
  const snap = store.setStatusMany([K, K2], 'known');
  assert.equal(store.status(K), 'known');
  assert.equal(store.status(K2), 'known');
  store.restore(snap);
  assert.deepEqual(store.get(K), rec('in_progress', 12, 10));
  assert.equal(store.get(K2), null);
  assert.deepEqual(events, [[[K, K2].sort(), 'local'], [[K, K2].sort(), 'local']]);
});

test('mergeIn reports remote changes only for keys that changed', () => {
  const store = createProgressStore({ storage: memStorage(), now: () => 5 });
  store.setStatus(K, 'known');
  const seen = [];
  store.subscribe((keys, source) => seen.push({ keys, source }));
  const changed = store.mergeIn({ [K]: rec('known', 0, 1), [K2]: rec('completed', 0, 9) });
  assert.deepEqual(changed, [K2]);
  assert.deepEqual(seen, [{ keys: [K2], source: 'remote' }]);
});

// ---------------------------------------------------------------- sync engine

function fakeTimers() {
  let id = 0;
  const pending = new Map();
  return {
    setTimer(fn, ms) { pending.set(++id, { fn, ms }); return id; },
    clearTimer(i) { pending.delete(i); },
    async runAll() {
      for (let guard = 0; guard < 20 && pending.size; guard++) {
        const [[i, { fn }]] = pending;
        pending.delete(i);
        await fn();
        await new Promise((r) => setImmediate(r));
      }
    },
    get size() { return pending.size; },
  };
}

function json(status, body) {
  return { ok: status >= 200 && status < 300, status, headers: { get: () => 'application/json' }, json: async () => body };
}

function fakeServer({ me = { signedIn: true, user: { name: 'Ada', email: 'ada@example.com', avatarUrl: 'https://x.test/a.png' } }, progress = {}, failPut = false } = {}) {
  const db = { ...progress };
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const method = init.method || 'GET';
    calls.push({ method, url, body: init.body ? JSON.parse(init.body) : undefined });
    if (url.endsWith('/me')) return json(200, me);
    if (url.endsWith('/progress')) {
      if (!me.signedIn) return json(401, { error: 'signed out' });
      if (method === 'GET') return json(200, { progress: db });
      if (method === 'PUT') {
        if (failPut) throw new TypeError('network down');
        for (const it of JSON.parse(init.body).items) {
          const { key, ...r } = it;
          db[key] = mergeRecord(db[key], r);
        }
        return json(200, { progress: db });
      }
      if (method === 'DELETE') { for (const k of Object.keys(db)) delete db[k]; return json(200, { ok: true }); }
    }
    if (url === '/api/auth/logout') return json(200, { message: 'ok' });
    return json(404, { error: 'nope' });
  };
  return { db, calls, fetchImpl };
}

test('sync: API missing (local dev 404) means local-only, silently', async () => {
  const store = createProgressStore({ storage: memStorage() });
  const fetchImpl = async () => ({ ok: false, status: 404, headers: { get: () => 'text/html' }, json: async () => { throw new Error('html'); } });
  const sync = createSync({ store, storage: memStorage(), fetchImpl });
  const st = await sync.init();
  assert.equal(st.available, false);
  assert.equal(st.signedIn, false);
});

test('sync: an HTML 200 fallback page also means local-only', async () => {
  const store = createProgressStore({ storage: memStorage() });
  const fetchImpl = async () => ({ ok: true, status: 200, headers: { get: () => 'text/html' }, json: async () => { throw new Error('html'); } });
  const st = await createSync({ store, storage: memStorage(), fetchImpl }).init();
  assert.equal(st.available, false);
});

test('sync: signed out -> available but nothing is sent', async () => {
  const server = fakeServer({ me: { signedIn: false } });
  const store = createProgressStore({ storage: memStorage() });
  const sync = createSync({ store, storage: memStorage(), fetchImpl: server.fetchImpl });
  const st = await sync.init();
  assert.equal(st.available, true);
  assert.equal(st.signedIn, false);
  store.setStatus(K, 'known');
  assert.deepEqual(server.calls.map((c) => c.method), ['GET']);
});

test('sync: sign-in merges both ways (local-only progress is uploaded, server progress is downloaded)', async () => {
  const server = fakeServer({ progress: { [K2]: rec('completed', 0, 500) } });
  const storage = memStorage();
  const store = createProgressStore({ storage, now: () => 900 });
  store.setStatus(K, 'known');
  const sync = createSync({ store, storage, fetchImpl: server.fetchImpl });
  await sync.init();
  assert.equal(store.status(K2), 'completed');
  assert.deepEqual(server.db[K], rec('known', 0, 900));
  const put = server.calls.find((c) => c.method === 'PUT');
  assert.deepEqual(put.body.items.map((i) => i.key), [K]);
  assert.equal(storage.getItem(OWNER_KEY), ownerTag('ada@example.com'));
  assert.equal(sync.getState().status, 'saved');
});

test('sync: a device previously synced to another account is not merged into this one', async () => {
  const server = fakeServer({ progress: { [K2]: rec('completed', 0, 500) } });
  const storage = memStorage({ [OWNER_KEY]: ownerTag('someone-else@example.com') });
  const store = createProgressStore({ storage, now: () => 900 });
  store.setStatus(K, 'known');
  const sync = createSync({ store, storage, fetchImpl: server.fetchImpl });
  const st = await sync.init();
  assert.equal(st.foreign, true);
  assert.equal(store.get(K), null);
  assert.equal(store.status(K2), 'completed');
  assert.equal(server.db[K], undefined);
  assert.equal(server.calls.filter((c) => c.method === 'PUT').length, 0);
});

test('sync: local changes are debounced, then PUT once', async () => {
  const server = fakeServer();
  const timers = fakeTimers();
  let t = 1000;
  const storage = memStorage();
  const store = createProgressStore({ storage, now: () => t });
  const sync = createSync({ store, storage, fetchImpl: server.fetchImpl, setTimer: timers.setTimer, clearTimer: timers.clearTimer, now: () => t });
  await sync.init();
  store.savePosition(K, 10);
  t += 100;
  store.savePosition(K, 20);
  store.setStatus(K2, 'known');
  assert.equal(server.calls.filter((c) => c.method === 'PUT').length, 0);
  await timers.runAll();
  const puts = server.calls.filter((c) => c.method === 'PUT');
  assert.equal(puts.length, 1);
  assert.deepEqual(puts[0].body.items.map((i) => i.key).sort(), [K, K2].sort());
  assert.equal(server.db[K].position, 20);
});

test('sync: failures keep the queue and retry on the next change', async () => {
  const server = fakeServer();
  const timers = fakeTimers();
  let t = 1000;
  let down = false;
  const storage = memStorage();
  const store = createProgressStore({ storage, now: () => t });
  const fetchImpl = async (u, i) => {
    if (down && i && i.method === 'PUT') throw new TypeError('offline');
    return server.fetchImpl(u, i);
  };
  const sync = createSync({ store, storage, fetchImpl, setTimer: timers.setTimer, clearTimer: timers.clearTimer, now: () => t });
  await sync.init();
  down = true;
  store.setStatus(K, 'known');
  await timers.runAll();
  assert.ok(['error', 'offline'].includes(sync.getState().status));
  assert.equal(sync.getState().pending, 1);
  assert.equal(server.db[K], undefined);
  down = false;
  t += 10;
  store.setStatus(K2, 'completed');
  await timers.runAll();
  assert.equal(server.db[K].status, 'known');
  assert.equal(server.db[K2].status, 'completed');
  assert.equal(sync.getState().pending, 0);
  assert.equal(sync.getState().status, 'saved');
});

test('sync: holdFor keeps an undoable change off the server; undo drops it entirely', async () => {
  const server = fakeServer();
  const timers = fakeTimers();
  let t = 1000;
  const storage = memStorage();
  const store = createProgressStore({ storage, now: () => t });
  const sync = createSync({ store, storage, fetchImpl: server.fetchImpl, setTimer: timers.setTimer, clearTimer: timers.clearTimer, now: () => t });
  await sync.init();
  sync.holdFor(10000);
  const snap = store.setStatusMany([K, K2], 'known');
  // A flush during the hold only reschedules.
  await sync.flush();
  assert.equal(server.calls.filter((c) => c.method === 'PUT').length, 0);
  store.restore(snap); // undo: back to "not started"
  sync.release();
  t += 20000;
  await timers.runAll();
  assert.equal(server.calls.filter((c) => c.method === 'PUT').length, 0);
  assert.equal(server.db[K], undefined);
  assert.equal(sync.getState().pending, 0);
});

test('sync: hold expiry without undo sends the change', async () => {
  const server = fakeServer();
  const timers = fakeTimers();
  let t = 1000;
  const storage = memStorage();
  const store = createProgressStore({ storage, now: () => t });
  const sync = createSync({ store, storage, fetchImpl: server.fetchImpl, setTimer: timers.setTimer, clearTimer: timers.clearTimer, now: () => t });
  await sync.init();
  sync.holdFor(10000);
  store.setStatusMany([K], 'known');
  t += 11000;
  await timers.runAll();
  assert.equal(server.db[K].status, 'known');
});

test('sync: 401 during PUT drops to signed-out without losing local data', async () => {
  const server = fakeServer();
  const timers = fakeTimers();
  let expired = false;
  const storage = memStorage();
  const store = createProgressStore({ storage });
  const fetchImpl = async (u, i) => {
    if (expired && u.endsWith('/progress')) return json(401, { error: 'expired' });
    return server.fetchImpl(u, i);
  };
  const sync = createSync({ store, storage, fetchImpl, setTimer: timers.setTimer, clearTimer: timers.clearTimer });
  await sync.init();
  expired = true;
  store.setStatus(K, 'known');
  await timers.runAll();
  assert.equal(sync.getState().signedIn, false);
  assert.equal(store.status(K), 'known');
});

test('sync: resetAll wipes server then device; a failed server wipe changes nothing', async () => {
  const server = fakeServer({ progress: { [K]: rec('known', 0, 5) } });
  const storage = memStorage();
  const store = createProgressStore({ storage });
  const sync = createSync({ store, storage, fetchImpl: server.fetchImpl });
  await sync.init();
  assert.equal(store.status(K), 'known');
  assert.deepEqual(await sync.resetAll(), { ok: true });
  assert.deepEqual(store.all(), {});
  assert.deepEqual(server.db, {});

  store.setStatus(K2, 'known');
  const failing = createSync({ store, storage, fetchImpl: async (u, i) => ((i && i.method === 'DELETE') ? json(500, {}) : server.fetchImpl(u, i)) });
  await failing.init();
  const res = await failing.resetAll();
  assert.equal(res.ok, false);
  assert.equal(store.status(K2), 'known');
});

test('sync: signOut flushes, posts logout, optionally clears the device', async () => {
  const server = fakeServer();
  const storage = memStorage();
  const store = createProgressStore({ storage });
  const sync = createSync({ store, storage, fetchImpl: server.fetchImpl });
  await sync.init();
  store.setStatus(K, 'known');
  const res = await sync.signOut({ clearDevice: true });
  assert.equal(res.ok, true);
  assert.equal(server.db[K].status, 'known', 'queued change was sent before signing out');
  assert.ok(server.calls.some((c) => c.method === 'POST' && c.url === '/api/auth/logout'));
  assert.deepEqual(store.all(), {});
  assert.equal(storage.getItem(OWNER_KEY), null);
  assert.equal(sync.getState().signedIn, false);
});

test('sync: more than 500 queued items go in several PUTs', async () => {
  const server = fakeServer();
  const storage = memStorage();
  const store = createProgressStore({ storage, now: () => 77 });
  const keys = Array.from({ length: 1100 }, (_, i) => `economics/m01-foundations/l${String(i).padStart(4, '0')}`);
  store.setStatusMany(keys, 'known');
  const sync = createSync({ store, storage, fetchImpl: server.fetchImpl });
  await sync.init();
  const puts = server.calls.filter((c) => c.method === 'PUT');
  assert.deepEqual(puts.map((p) => p.body.items.length), [500, 500, 100]);
  assert.equal(Object.keys(server.db).length, 1100);
});
