// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Hash routes (CONTRACT v2 "Routes"):
//   #/                    catalog
//   #/s/<topicKey>        subject or topic tree   (topicKey = subject[/module…])
//   #/l/<lessonKey>       lesson player           (lessonKey = subject/…/lesson)
//   #/plan                Study Plan tab
//   #/profile             profile + plan editor
//   #/account             sign-in and data
//   #/about               what this is, credits, licences (v2.1 clarification)
//   #/search?q=<text>     library-wide search (v3)
// Pure: parseRoute() takes a hash string and validates every id before any fetch.

import { isTopicKey, isLessonKey } from './tree.js';

export const MAX_SEARCH_QUERY = 200;

/** At most MAX_SEARCH_QUERY UTF-16 units, never ending in half a surrogate pair (encodeURIComponent throws on one). */
function capQuery(q) {
  return String(q).slice(0, MAX_SEARCH_QUERY).replace(/[\uD800-\uDBFF]$/, '');
}

/** The `q` of a hash query string ("q=cell%20wall" -> "cell wall"), capped. */
function searchQuery(qs) {
  let q = '';
  try { q = new URLSearchParams(qs).get('q') || ''; } catch { q = ''; }
  return capQuery(q);
}

export function parseRoute(hash) {
  let h = String(hash || '');
  if (h.startsWith('#')) h = h.slice(1);
  const qAt = h.indexOf('?');
  const qs = qAt >= 0 ? h.slice(qAt + 1) : '';
  if (qAt >= 0) h = h.slice(0, qAt);
  let path;
  try {
    path = decodeURIComponent(h);
  } catch {
    return { name: 'notfound' };
  }
  const parts = path.split('/').filter(Boolean);
  if (!parts.length) return { name: 'catalog' };
  const [head, ...rest] = parts;
  const key = rest.join('/');
  if (head === 's' && rest.length && isTopicKey(key)) return { name: 'subject', topicKey: key, subjectId: rest[0] };
  if (head === 'l' && isLessonKey(key)) return { name: 'lesson', lessonKey: key, subjectId: rest[0] };
  if (!rest.length && (head === 'plan' || head === 'profile' || head === 'account' || head === 'about')) return { name: head };
  if (!rest.length && head === 'search') return { name: 'search', q: searchQuery(qs) };
  return { name: 'notfound' };
}

export const href = {
  catalog: () => '#/',
  topic: (topicKey) => `#/s/${topicKey}`,
  lesson: (lessonKey) => `#/l/${lessonKey}`,
  plan: () => '#/plan',
  profile: () => '#/profile',
  account: () => '#/account',
  about: () => '#/about',
  search: (q = '') => {
    const t = capQuery(String(q).trim());
    return t ? `#/search?q=${encodeURIComponent(t)}` : '#/search';
  },
};
