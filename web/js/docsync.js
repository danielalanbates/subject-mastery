// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Whole-document storage + sync for the profile and the study plan
// (CONTRACT v2 "API additions"): last write wins on the document's updatedAt.
//   GET  /api/subjectmastery/<name>  -> { <name>: doc | null }
//   PUT  /api/subjectmastery/<name>  body { <name>: doc } -> { <name>: doc }
// The local copy lives in localStorage and works without an account.

import { safeLocalStorage } from './progress.js';

export function createDocStore({ storage = safeLocalStorage(), key, normalize, now = () => Date.now() }) {
  const listeners = new Set();
  let doc = load();

  function load() {
    try {
      const raw = storage && storage.getItem(key);
      return raw ? normalize(JSON.parse(raw)) : normalize(null);
    } catch {
      return normalize(null);
    }
  }
  function persist() {
    try {
      if (storage) storage.setItem(key, JSON.stringify(doc));
    } catch { /* quota / private mode: keep it in memory */ }
  }
  function emit(source) {
    for (const fn of [...listeners]) {
      try { fn(doc, source); } catch (e) { console.error('[docstore] listener failed', e); }
    }
  }
  return {
    get: () => doc,
    /** A visitor edit: stamps updatedAt. */
    update(next) {
      doc = normalize({ ...next, updatedAt: Math.max(now(), (doc.updatedAt || 0) + 1) });
      persist();
      emit('local');
      return doc;
    },
    /** Replace with a server/other-tab copy (keeps its updatedAt). */
    replace(next, source = 'remote') {
      doc = normalize(next);
      persist();
      emit(source);
    },
    reload() {
      doc = load();
      emit('remote');
    },
    /** Re-run normalize (e.g. once the signed-in user is known). */
    renormalize() {
      doc = normalize(doc);
      emit('remote');
    },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
}

export function createDocSync({
  name,
  store,
  fetchImpl = globalThis.fetch ? globalThis.fetch.bind(globalThis) : null,
  apiBase = '/api/subjectmastery',
  debounceMs = 1500,
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = (id) => clearTimeout(id),
}) {
  let enabled = false;
  let timer = null;
  let dirty = false;
  let inFlight = null;
  let status = 'idle';
  const listeners = new Set();

  function setStatus(s) {
    status = s;
    for (const fn of [...listeners]) { try { fn(s); } catch { /* ignore */ } }
  }

  function request(method, body) {
    const init = { method, credentials: 'same-origin', cache: 'no-store', headers: { accept: 'application/json' } };
    if (body !== undefined) {
      init.headers['content-type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
    return fetchImpl(`${apiBase}/${name}`, init);
  }

  store.subscribe((_doc, source) => {
    if (source !== 'local') return;
    dirty = true;
    if (enabled) schedule();
  });

  function schedule() {
    if (timer) clearTimer(timer);
    timer = setTimer(() => { timer = null; push(); }, debounceMs);
  }

  /**
   * Sign-in handshake. `replaceLocal` = this device's copy belonged to another
   * account, so take the server's (or a fresh default) instead of merging.
   */
  async function pull({ replaceLocal = false } = {}) {
    if (!fetchImpl) return;
    enabled = true;
    let server = null;
    try {
      const res = await request('GET');
      if (res.status === 404) { enabled = false; setStatus('unavailable'); return; }
      if (!res.ok) throw new Error(`${name} ${res.status}`);
      const body = await res.json();
      server = body ? body[name] : null;
    } catch {
      setStatus('offline');
      return;
    }
    const local = store.get();
    if (replaceLocal) {
      store.replace(server);
      dirty = false;
      setStatus('saved');
      return;
    }
    const serverAt = server && Number(server.updatedAt) || 0;
    const localAt = local && Number(local.updatedAt) || 0;
    if (server && serverAt >= localAt) {
      if (serverAt > localAt) store.replace(server);
      dirty = false;
      setStatus('saved');
    } else if (localAt > 0) {
      dirty = true;
      await push();
    } else {
      setStatus('saved');
    }
  }

  async function push() {
    if (!enabled || !dirty) return;
    if (inFlight) { schedule(); return inFlight; }
    dirty = false;
    const doc = store.get();
    inFlight = (async () => {
      setStatus('saving');
      try {
        const res = await request('PUT', { [name]: doc });
        if (res.status === 401 || res.status === 404) { enabled = false; setStatus('unavailable'); return; }
        if (!res.ok) throw new Error(`${name} put ${res.status}`);
        let body = null;
        try { body = await res.json(); } catch { /* ignore */ }
        const back = body && body[name];
        if (back && Number(back.updatedAt) > Number(store.get().updatedAt || 0)) store.replace(back);
        setStatus('saved');
      } catch {
        dirty = true;
        setStatus('error');
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  }

  return {
    pull,
    push,
    retry() { if (dirty && enabled) schedule(); },
    disable() { enabled = false; },
    get status() { return status; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
}
