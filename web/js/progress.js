// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Progress model, merge rules and account sync for the Subject Mastery player.
// See docs/CONTRACT.md ("Progress model", "Site API") — this file implements it.
//
// Three layers, each usable on its own (the tests in web/tests/ drive all three
// with fake storage, fake fetch and fake timers):
//   1. Pure functions: normalizeRecord, mergeRecord, mergeMaps, diffForPush, ...
//   2. createProgressStore(): the localStorage-backed map `sm.progress.v1`.
//   3. createSync(): talks to /api/subjectmastery/* when the visitor is signed in.
//
// Nothing here touches `window` at import time, so `node --test` can load it.

export const PROGRESS_KEY = 'sm.progress.v1';
export const OWNER_KEY = 'sm.owner.v1';
export const STATUSES = Object.freeze(['in_progress', 'completed', 'known']);
// CONTRACT v2: subject id + 2..7 more path segments (v1 three-part keys still match).
export const KEY_RE = /^[a-z0-9-]{1,48}(\/[a-z0-9-]{1,48}){2,7}$/;
export const MAX_POSITION = 86400;
export const MAX_PUT_ITEMS = 500;
// keepalive requests (sent while the page is closing) are capped at 64 KB of body.
export const MAX_KEEPALIVE_ITEMS = 200;

// Tie-break order when two records carry the same updatedAt.
const RANK = { in_progress: 1, known: 2, completed: 3 };

// ---------------------------------------------------------------------------
// 1. Pure functions
// ---------------------------------------------------------------------------

export function isDone(status) {
  return status === 'completed' || status === 'known';
}

export function isValidKey(key) {
  return typeof key === 'string' && KEY_RE.test(key);
}

/** Returns a clean {status, position, updatedAt} or null if the input is unusable. */
export function normalizeRecord(r) {
  if (!r || typeof r !== 'object') return null;
  if (!STATUSES.includes(r.status)) return null;
  const updatedAt = Number(r.updatedAt);
  if (!Number.isFinite(updatedAt) || updatedAt < 0) return null;
  let position = Number(r.position);
  if (!Number.isFinite(position) || position < 0) position = 0;
  if (position > MAX_POSITION) position = MAX_POSITION;
  position = Math.round(position * 10) / 10;
  return { status: r.status, position, updatedAt: Math.floor(updatedAt) };
}

/** Keeps only entries with a valid lesson key and a valid record. */
export function sanitizeMap(obj) {
  const out = {};
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return out;
  for (const key of Object.keys(obj)) {
    if (!isValidKey(key)) continue;
    const rec = normalizeRecord(obj[key]);
    if (rec) out[key] = rec;
  }
  return out;
}

export function sameRecord(a, b) {
  if (!a || !b) return !a && !b;
  return a.status === b.status && a.updatedAt === b.updatedAt &&
    Math.abs(a.position - b.position) < 0.05;
}

/**
 * Merge two versions of one lesson's record.
 * - Last write wins on updatedAt.
 * - Exception: a newer `in_progress` record never downgrades an older
 *   `completed`/`known` one (a stale device saving its audio position must not
 *   undo a completion). The done status is kept; the newer position/time ride along.
 * - Equal timestamps break ties by status rank, then by larger position, so the
 *   result does not depend on argument order.
 */
export function mergeRecord(a, b) {
  const x = normalizeRecord(a);
  const y = normalizeRecord(b);
  if (!x) return y;
  if (!y) return x;
  let newer;
  let older;
  if (x.updatedAt !== y.updatedAt) {
    [newer, older] = x.updatedAt > y.updatedAt ? [x, y] : [y, x];
  } else if (RANK[x.status] !== RANK[y.status]) {
    [newer, older] = RANK[x.status] > RANK[y.status] ? [x, y] : [y, x];
  } else {
    [newer, older] = x.position >= y.position ? [x, y] : [y, x];
  }
  if (newer.status === 'in_progress' && isDone(older.status)) {
    return { status: older.status, position: newer.position, updatedAt: newer.updatedAt };
  }
  return { ...newer };
}

/** Merge two whole progress maps key by key. Neither input is modified. */
export function mergeMaps(a, b) {
  const left = sanitizeMap(a);
  const right = sanitizeMap(b);
  const out = {};
  for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
    const rec = mergeRecord(left[key], right[key]);
    if (rec) out[key] = rec;
  }
  return out;
}

/**
 * Items the client must PUT so the server ends up with the merged view:
 * every key where merge(local, server) differs from what the server has.
 */
export function diffForPush(local, server) {
  const l = sanitizeMap(local);
  const s = sanitizeMap(server);
  const items = [];
  for (const key of Object.keys(l)) {
    const merged = mergeRecord(l[key], s[key]);
    if (merged && !sameRecord(merged, s[key])) items.push({ key, ...merged });
  }
  return items;
}

export function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/** Small, stable, non-cryptographic hash (FNV-1a 32-bit) used to tell accounts apart locally. */
export function ownerTag(email) {
  const s = String(email || '').trim().toLowerCase();
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return 'u' + h.toString(16).padStart(8, '0');
}

/** Counts per status for a set of lesson keys (or every key when `keys` is omitted). */
export function summarize(map, keys) {
  const list = keys || Object.keys(map || {});
  const out = { total: list.length, completed: 0, known: 0, inProgress: 0, done: 0 };
  for (const key of list) {
    const r = map && map[key];
    if (!r) continue;
    if (r.status === 'completed') out.completed++;
    else if (r.status === 'known') out.known++;
    else if (r.status === 'in_progress') out.inProgress++;
  }
  out.done = out.completed + out.known;
  return out;
}

// ---------------------------------------------------------------------------
// 2. Local store (always on, signed in or not)
// ---------------------------------------------------------------------------

export function safeLocalStorage() {
  try {
    const s = globalThis.localStorage;
    if (!s) return null;
    const probe = '__sm_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

/**
 * The progress map, persisted to localStorage under `sm.progress.v1`.
 * Listeners get (changedKeys, source) where source is 'local' for the
 * visitor's own actions and 'remote' for server merges, resets, other tabs.
 */
export function createProgressStore({ storage = safeLocalStorage(), now = () => Date.now() } = {}) {
  let map = load();
  const listeners = new Set();

  function load() {
    try {
      const raw = storage && storage.getItem(PROGRESS_KEY);
      return raw ? sanitizeMap(JSON.parse(raw)) : {};
    } catch {
      return {};
    }
  }
  function persist() {
    try {
      if (storage) storage.setItem(PROGRESS_KEY, JSON.stringify(map));
    } catch {
      /* quota or privacy mode: keep working in memory */
    }
  }
  function emit(keys, source) {
    if (!keys.length) return;
    for (const fn of [...listeners]) {
      try { fn(keys, source); } catch (e) { console.error('[progress] listener failed', e); }
    }
  }
  function write(key, rec) {
    if (!isValidKey(key)) return false;
    const clean = rec ? normalizeRecord(rec) : null;
    if (clean) map[key] = clean;
    else delete map[key];
    return true;
  }

  return {
    get(key) {
      const r = map[key];
      return r ? { ...r } : null;
    },
    status(key) {
      return map[key] ? map[key].status : null;
    },
    all() {
      const out = {};
      for (const k of Object.keys(map)) out[k] = { ...map[k] };
      return out;
    },
    /** Set an explicit status (the visitor chose it). Done states reset the position. */
    setStatus(key, status) {
      if (!STATUSES.includes(status) || !isValidKey(key)) return null;
      const prev = map[key] ? { ...map[key] } : null;
      const position = status === 'in_progress' && prev ? prev.position : 0;
      write(key, { status, position, updatedAt: now() });
      persist();
      emit([key], 'local');
      return prev;
    },
    /** Same status for many keys at once. Returns a snapshot for undo(). */
    setStatusMany(keys, status) {
      const snapshot = {};
      const changed = [];
      const t = now();
      for (const key of keys) {
        if (!isValidKey(key) || !STATUSES.includes(status)) continue;
        snapshot[key] = map[key] ? { ...map[key] } : null;
        write(key, { status, position: 0, updatedAt: t });
        changed.push(key);
      }
      persist();
      emit(changed, 'local');
      return snapshot;
    },
    /** Opening a lesson: creates an in_progress record if there is none yet. */
    markStarted(key) {
      if (!isValidKey(key) || map[key]) return false;
      write(key, { status: 'in_progress', position: 0, updatedAt: now() });
      persist();
      emit([key], 'local');
      return true;
    },
    /** Audio position save. No-op for lessons already completed/known. */
    savePosition(key, position) {
      if (!isValidKey(key)) return false;
      const prev = map[key];
      if (prev && isDone(prev.status)) return false;
      if (prev && Math.abs(prev.position - position) < 0.5) return false;
      write(key, { status: 'in_progress', position, updatedAt: now() });
      persist();
      emit([key], 'local');
      return true;
    },
    /** Put back records captured by setStatus/setStatusMany (null = remove). */
    restore(snapshot) {
      const keys = Object.keys(snapshot || {});
      for (const key of keys) write(key, snapshot[key]);
      persist();
      emit(keys, 'local');
    },
    /** Fold another map (e.g. the server's) into ours with mergeRecord. */
    mergeIn(other) {
      const incoming = sanitizeMap(other);
      const changed = [];
      for (const key of Object.keys(incoming)) {
        const merged = mergeRecord(map[key], incoming[key]);
        if (!sameRecord(merged, map[key])) {
          map[key] = merged;
          changed.push(key);
        }
      }
      if (changed.length) persist();
      emit(changed, 'remote');
      return changed;
    },
    /** Replace everything (used when this device's data belonged to another account). */
    replaceAll(next) {
      const before = Object.keys(map);
      map = sanitizeMap(next);
      persist();
      emit([...new Set([...before, ...Object.keys(map)])], 'remote');
    },
    clear() {
      const before = Object.keys(map);
      map = {};
      persist();
      emit(before, 'remote');
    },
    /** Re-read storage (another tab changed it). */
    reload() {
      const before = map;
      map = load();
      const keys = [...new Set([...Object.keys(before), ...Object.keys(map)])]
        .filter((k) => !sameRecord(before[k], map[k]));
      emit(keys, 'remote');
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

// ---------------------------------------------------------------------------
// 3. Account sync
// ---------------------------------------------------------------------------

function cleanUser(u) {
  if (!u || typeof u !== 'object') return { name: '', email: '', avatarUrl: '' };
  const name = typeof u.name === 'string' ? u.name.slice(0, 120) : '';
  const email = typeof u.email === 'string' ? u.email.slice(0, 200) : '';
  let avatarUrl = '';
  if (typeof u.avatarUrl === 'string') {
    try {
      const url = new URL(u.avatarUrl);
      if (url.protocol === 'https:') avatarUrl = url.href;
    } catch { /* ignore */ }
  }
  return { name, email, avatarUrl };
}

/**
 * Should the player ask the site API who is signed in? The API exists only where
 * batesai.org's Pages Functions run. Locally (a static server, the .app, a file://
 * page) it does not, and probing it would only leave a 404 in the console, so the
 * player stays quietly local-only there. Precedence:
 *   1. a developer switch `localStorage['sm.api.v1']` = 'on' | 'off' (set by `?api=on|off`);
 *   2. `<meta name="sm-api" content="on|off">` in index.html;
 *   3. otherwise: probe on http(s) pages whose host is not a loopback or `.local` name.
 */
export const API_SWITCH_KEY = 'sm.api.v1';
export function apiProbeAllowed({ protocol = '', hostname = '', meta = '', override = '' } = {}) {
  if (override === 'on' || override === 'off') return override === 'on';
  if (meta === 'on' || meta === 'off') return meta === 'on';
  if (protocol !== 'http:' && protocol !== 'https:') return false;
  const host = String(hostname).toLowerCase().replace(/^\[|\]$/g, '');
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return false;
  if (/^127(\.\d{1,3}){3}$/.test(host) || host === '::1' || host === '0.0.0.0') return false;
  return true;
}

async function readJson(res) {
  const type = (res.headers && res.headers.get && res.headers.get('content-type')) || '';
  if (type && !type.includes('json')) throw new Error('not json: ' + type);
  return res.json();
}

/**
 * Sync engine. State shape:
 *   { available: null|true|false,  // null until /me answered; false = local-only (API missing)
 *     signedIn: bool, user: {name,email,avatarUrl}|null,
 *     status: 'idle'|'saving'|'saved'|'offline'|'error', pending: number }
 *
 * Local changes are queued per key and PUT after `debounceMs`. Failures keep the
 * queue and retry on the next change, on `online`, or on a backoff timer.
 * holdFor(ms) delays the next PUT so an "Undo" can cancel a change before the
 * server ever sees it (the contract has no "not started" status to send back).
 */
export function createSync({
  store,
  storage = safeLocalStorage(),
  fetchImpl = globalThis.fetch ? globalThis.fetch.bind(globalThis) : null,
  probe = true,
  apiBase = '/api/subjectmastery',
  logoutUrl = '/api/auth/logout',
  debounceMs = 2000,
  retryBaseMs = 15000,
  retryMaxMs = 5 * 60 * 1000,
  now = () => Date.now(),
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = (id) => clearTimeout(id),
} = {}) {
  // foreign: this device's data had been synced to a different account (set by pull()).
  const state = { available: null, signedIn: false, user: null, status: 'idle', pending: 0, foreign: false };
  const listeners = new Set();
  const pending = new Set();
  const versions = new Map();
  let timer = null;
  let retryTimer = null;
  let retryDelay = retryBaseMs;
  let holdUntil = 0;
  let inFlight = null;
  let again = false;

  function setState(patch) {
    Object.assign(state, patch, { pending: pending.size });
    for (const fn of [...listeners]) {
      try { fn({ ...state }); } catch (e) { console.error('[sync] listener failed', e); }
    }
  }

  function api(method, path, body, keepalive = false) {
    const headers = { accept: 'application/json' };
    const init = { method, credentials: 'same-origin', cache: 'no-store', headers };
    if (body !== undefined) {
      headers['content-type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
    if (keepalive) init.keepalive = true;
    return fetchImpl(path.startsWith('/api/') ? path : apiBase + path, init);
  }

  function schedule(ms) {
    if (timer) clearTimer(timer);
    timer = setTimer(() => { timer = null; flush(); }, Math.max(0, ms));
  }

  function scheduleRetry() {
    if (retryTimer) return;
    retryTimer = setTimer(() => { retryTimer = null; flush(); }, retryDelay);
    retryDelay = Math.min(retryDelay * 2, retryMaxMs);
  }

  function signedOutLocally() {
    pending.clear();
    setState({ signedIn: false, user: null, status: 'idle' });
  }

  // Local edits mark keys dirty. A key whose record disappeared (undo back to
  // "not started") is simply dropped from the queue.
  const unsubscribe = store.subscribe((keys, source) => {
    if (source !== 'local') return;
    for (const key of keys) {
      versions.set(key, (versions.get(key) || 0) + 1);
      if (store.get(key)) pending.add(key);
      else pending.delete(key);
    }
    setState({});
    if (state.signedIn) schedule(Math.max(debounceMs, holdUntil - now()));
  });

  async function init() {
    if (!fetchImpl || !probe) {
      setState({ available: false });
      return { ...state };
    }
    let me;
    try {
      const res = await api('GET', '/me');
      if (!res.ok) throw new Error('me ' + res.status);
      me = await readJson(res);
      // Anything but the contract's shape (an HTML fallback page, `{}`, a proxy's
      // JSON error) means there is no Subject Mastery API here: stay local-only.
      if (!me || typeof me !== 'object' || typeof me.signedIn !== 'boolean') throw new Error('bad me');
    } catch {
      setState({ available: false, signedIn: false, user: null });
      return { ...state };
    }
    if (me.signedIn !== true) {
      setState({ available: true, signedIn: false, user: null });
      return { ...state };
    }
    setState({ available: true, signedIn: true, user: cleanUser(me.user) });
    await pull();
    return { ...state };
  }

  /** GET the server map, merge it in, queue whatever the server is missing, PUT. */
  async function pull() {
    if (!state.signedIn) return;
    setState({ status: 'saving' });
    let server;
    try {
      const res = await api('GET', '/progress');
      if (res.status === 401) { signedOutLocally(); return; }
      if (!res.ok) throw new Error('progress ' + res.status);
      const body = await readJson(res);
      server = sanitizeMap(body && body.progress);
    } catch {
      setState({ status: 'offline' });
      scheduleRetry();
      return;
    }
    const tag = ownerTag(state.user && state.user.email);
    let previousOwner = null;
    try { previousOwner = storage && storage.getItem(OWNER_KEY); } catch { /* ignore */ }
    const foreign = !!(previousOwner && previousOwner !== tag);
    setState({ foreign });
    if (foreign) {
      // This device's progress was synced to a different account: don't merge it
      // into this one. Show this account's progress instead.
      pending.clear();
      store.replaceAll(server);
    } else {
      for (const item of diffForPush(store.all(), server)) pending.add(item.key);
      store.mergeIn(server);
    }
    try { if (storage) storage.setItem(OWNER_KEY, tag); } catch { /* ignore */ }
    if (pending.size) await flush();
    else setState({ status: 'saved' });
  }

  async function flush({ keepalive = false, force = false } = {}) {
    if (timer) { clearTimer(timer); timer = null; }
    if (!state.signedIn || !pending.size) return;
    const wait = holdUntil - now();
    if (wait > 0 && !keepalive && !force) { schedule(wait); return; }
    if (inFlight) { again = true; return inFlight; }

    const keys = [...pending];
    const sent = new Map(keys.map((k) => [k, versions.get(k) || 0]));
    const items = [];
    for (const key of keys) {
      const rec = store.get(key);
      if (rec) items.push({ key, ...rec });
      else pending.delete(key);
    }
    if (!items.length) { setState({}); return; }

    inFlight = (async () => {
      setState({ status: 'saving' });
      try {
        for (const part of chunk(items, keepalive ? MAX_KEEPALIVE_ITEMS : MAX_PUT_ITEMS)) {
          const res = await api('PUT', '/progress', { items: part }, keepalive);
          if (res.status === 401) { signedOutLocally(); return; }
          if (!res.ok) throw new Error('put ' + res.status);
          let body = null;
          try { body = await readJson(res); } catch { /* keepalive / empty body */ }
          for (const it of part) {
            if ((versions.get(it.key) || 0) === sent.get(it.key)) pending.delete(it.key);
          }
          if (body && body.progress) store.mergeIn(body.progress);
        }
        retryDelay = retryBaseMs;
        if (retryTimer) { clearTimer(retryTimer); retryTimer = null; }
        setState({ status: pending.size ? 'saving' : 'saved' });
      } catch {
        const offline = globalThis.navigator && globalThis.navigator.onLine === false;
        setState({ status: offline ? 'offline' : 'error' });
        scheduleRetry();
      } finally {
        inFlight = null;
        if (again || (pending.size && state.status === 'saving')) {
          again = false;
          schedule(debounceMs);
        }
      }
    })();
    return inFlight;
  }

  /** Delay PUTs for `ms` (undo window). */
  function holdFor(ms) {
    holdUntil = Math.max(holdUntil, now() + ms);
  }
  /** End the undo window and send what is queued. */
  function release() {
    holdUntil = 0;
    if (state.signedIn && pending.size) schedule(debounceMs);
  }

  /** Reset: wipe the account copy first (if signed in), then this device. */
  async function resetAll() {
    if (state.signedIn) {
      try {
        const res = await api('DELETE', '/progress');
        if (res.status === 401) { signedOutLocally(); return { ok: false, reason: 'signed-out' }; }
        if (!res.ok) return { ok: false, reason: 'server' };
      } catch {
        return { ok: false, reason: 'offline' };
      }
    }
    pending.clear();
    holdUntil = 0;
    store.clear();
    setState({ status: state.signedIn ? 'saved' : 'idle' });
    return { ok: true };
  }

  /** Send anything queued, then end the batesai.org session. */
  async function signOut({ clearDevice = false } = {}) {
    holdUntil = 0;
    try { await flush({ force: true }); } catch { /* best effort */ }
    let ok = false;
    try {
      const res = await fetchImpl(logoutUrl, { method: 'POST', credentials: 'same-origin' });
      ok = res.ok;
    } catch { ok = false; }
    if (clearDevice) {
      store.clear();
      try { if (storage) storage.removeItem(OWNER_KEY); } catch { /* ignore */ }
    }
    signedOutLocally();
    return { ok };
  }

  return {
    init,
    pull,
    flush,
    holdFor,
    release,
    resetAll,
    signOut,
    getState: () => ({ ...state }),
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    destroy() {
      unsubscribe();
      if (timer) clearTimer(timer);
      if (retryTimer) clearTimer(retryTimer);
    },
  };
}
