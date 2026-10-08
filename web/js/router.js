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
// Pure: parseRoute() takes a hash string and validates every id before any fetch.

import { isTopicKey, isLessonKey } from './tree.js';

export function parseRoute(hash) {
  let h = String(hash || '');
  if (h.startsWith('#')) h = h.slice(1);
  h = h.split('?')[0];
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
};
