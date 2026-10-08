// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Static data loading (CONTRACT "Built static data"). Every URL is relative to
// the app root so the same files work at /subjectmastery/ and at / locally.

import { indexSubject, isSlug, isLessonKey } from './tree.js';

const cache = new Map();

export class DataError extends Error {
  constructor(url, status) {
    super(`Could not load ${url} (${status})`);
    this.url = url;
    this.status = status;
  }
}

function loadJson(url) {
  if (!cache.has(url)) {
    const p = fetch(url, { cache: 'no-cache', headers: { accept: 'application/json' } })
      .then(async (res) => {
        if (!res.ok) throw new DataError(url, res.status);
        try {
          return await res.json();
        } catch {
          throw new DataError(url, 'bad-json');
        }
      })
      .catch((e) => {
        cache.delete(url);
        throw e instanceof DataError ? e : new DataError(url, 'network');
      });
    cache.set(url, p);
  }
  return cache.get(url);
}

export async function getCatalog() {
  const c = await loadJson('data/catalog.json');
  const subjects = Array.isArray(c && c.subjects) ? c.subjects.filter((s) => s && isSlug(s.id)) : [];
  return { ...c, subjects };
}

const indexCache = new Map();
/** Subject JSON + its index (see tree.js). Cached per session. */
export async function getSubject(id) {
  if (!isSlug(id)) throw new DataError(`data/subjects/${id}.json`, 'bad-id');
  if (!indexCache.has(id)) {
    const p = loadJson(`data/subjects/${id}.json`).then((raw) => indexSubject(raw));
    p.catch(() => indexCache.delete(id));
    indexCache.set(id, p);
  }
  return indexCache.get(id);
}

/** Every available subject's index; failures are dropped, not fatal. */
export async function getAllSubjects(catalog) {
  const ids = catalog.subjects.filter((s) => s.status === 'available').map((s) => s.id);
  const results = await Promise.allSettled(ids.map((id) => getSubject(id)));
  return results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
}

export function getLesson(lessonKey) {
  if (!isLessonKey(lessonKey)) return Promise.reject(new DataError(lessonKey, 'bad-key'));
  return loadJson(`data/lessons/${lessonKey}.json`);
}

/** Only accept a plain relative path for audio (no scheme, no leading slash, no ..). */
export function safeAudioPath(p) {
  if (typeof p !== 'string' || !p) return null;
  if (!/^[A-Za-z0-9._/-]+$/.test(p) || p.startsWith('/') || p.split('/').includes('..')) return null;
  return p;
}
