// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Player preferences, localStorage `sm.prefs.v1` (CONTRACT "Progress model").

import { safeLocalStorage } from './progress.js';

export const PREFS_KEY = 'sm.prefs.v1';
export const MODES = Object.freeze(['audio', 'text', 'both']);
export const RATES = Object.freeze([0.75, 1, 1.25, 1.5, 1.75, 2]);
export const DEFAULT_PREFS = Object.freeze({ mode: 'both', rate: 1, autoplayNext: true });

export function normalizePrefs(p) {
  const out = { ...DEFAULT_PREFS };
  if (p && typeof p === 'object') {
    if (MODES.includes(p.mode)) out.mode = p.mode;
    const r = Number(p.rate);
    if (Number.isFinite(r) && r >= 0.75 && r <= 2) out.rate = r;
    if (typeof p.autoplayNext === 'boolean') out.autoplayNext = p.autoplayNext;
  }
  return out;
}

export function createPrefs(storage = safeLocalStorage()) {
  let prefs = load();
  const listeners = new Set();
  function load() {
    try {
      const raw = storage && storage.getItem(PREFS_KEY);
      return normalizePrefs(raw ? JSON.parse(raw) : null);
    } catch {
      return { ...DEFAULT_PREFS };
    }
  }
  return {
    get: () => ({ ...prefs }),
    set(patch) {
      prefs = normalizePrefs({ ...prefs, ...patch });
      try { if (storage) storage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
      for (const fn of [...listeners]) fn({ ...prefs });
      return { ...prefs };
    },
    reload() { prefs = load(); for (const fn of [...listeners]) fn({ ...prefs }); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
}
