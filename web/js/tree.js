// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Subject trees (CONTRACT v2 "Nested topic tree"): indexing, knowledge %,
// resume points and next/previous navigation. Pure functions, no DOM.
//
// Ordering rule (not spelled out in the contract): inside a module, its own
// `lessons` come first, then its nested `modules`, depth first. That puts a
// topic's introduction before its sub-topics.

import { isDone } from './progress.js';

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const TOPIC_KEY_RE = /^[a-z0-9-]{1,48}(\/[a-z0-9-]{1,48}){0,6}$/;
export const LESSON_KEY_RE = /^[a-z0-9-]{1,48}(\/[a-z0-9-]{1,48}){2,7}$/;

export function isSlug(s) {
  return typeof s === 'string' && s.length <= 48 && SLUG_RE.test(s);
}
export function isTopicKey(k) {
  return typeof k === 'string' && TOPIC_KEY_RE.test(k);
}
export function isLessonKey(k) {
  return typeof k === 'string' && LESSON_KEY_RE.test(k);
}
export function subjectOf(key) {
  return String(key).split('/')[0];
}

const COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
export function safeColor(c, fallback = '#0f766e') {
  return typeof c === 'string' && COLOR_RE.test(c) ? c : fallback;
}

function positiveInt(n, fallback) {
  const v = Math.round(Number(n));
  return Number.isFinite(v) && v >= 1 ? v : fallback;
}

/**
 * Build lookup tables for one subject JSON (dist/data/subjects/<id>.json).
 * Returns {
 *   id, title, color, subject,                       // the raw subject object
 *   nodes:   Map<topicKey, Node>,                     // the subject itself is a node too
 *   lessons: Map<lessonKey, Lesson>,
 *   order:   [lessonKey, …]                           // full path order
 * }
 * Node   = { key, id, title, summary, depth, parentKey, childKeys[], lessonKeys[] (direct),
 *            allKeys[] (every lesson under it, in order), number (e.g. "2.1") }
 * Lesson = { key, id, title, summary, minutes, hasAudio, hasText, parentKey, subjectId,
 *            index (position in order), trail [nodeKey…] (subject → parent) }
 */
export function indexSubject(subject) {
  if (!subject || !isSlug(subject.id)) throw new Error('subject without a valid id');
  const nodes = new Map();
  const lessons = new Map();
  const order = [];

  function walk(raw, key, depth, parentKey, trail, number) {
    const node = {
      key,
      id: raw.id,
      title: String(raw.title || raw.id),
      summary: typeof raw.summary === 'string' ? raw.summary : (typeof raw.tagline === 'string' ? raw.tagline : ''),
      depth,
      parentKey,
      childKeys: [],
      lessonKeys: [],
      allKeys: [],
      number,
    };
    nodes.set(key, node);
    const here = [...trail, key];

    for (const l of Array.isArray(raw.lessons) ? raw.lessons : []) {
      if (!l || !isSlug(l.id)) continue;
      const derived = `${key}/${l.id}`;
      const lessonKey = isLessonKey(l.key) ? l.key : derived;
      if (!isLessonKey(lessonKey) || lessons.has(lessonKey)) continue;
      const lesson = {
        key: lessonKey,
        id: l.id,
        title: String(l.title || l.id),
        summary: typeof l.summary === 'string' ? l.summary : '',
        minutes: positiveInt(l.minutes, 1),
        hasAudio: l.hasAudio === true,
        hasText: l.hasText !== false,
        parentKey: key,
        subjectId: subject.id,
        index: order.length,
        trail: here,
      };
      lessons.set(lessonKey, lesson);
      node.lessonKeys.push(lessonKey);
      order.push(lessonKey);
    }
    let childNo = 0;
    for (const m of Array.isArray(raw.modules) ? raw.modules : []) {
      if (!m || !isSlug(m.id)) continue;
      const childKey = `${key}/${m.id}`;
      if (!isTopicKey(childKey) || nodes.has(childKey)) continue;
      childNo++;
      node.childKeys.push(childKey);
      walk(m, childKey, depth + 1, key, here, number ? `${number}.${childNo}` : String(childNo));
    }
    return node;
  }

  walk(subject, subject.id, 0, null, [], '');

  // allKeys for every node, bottom-up via the lesson trails.
  for (const key of order) {
    for (const nodeKey of lessons.get(key).trail) nodes.get(nodeKey).allKeys.push(key);
  }
  return {
    id: subject.id,
    title: String(subject.title || subject.id),
    color: safeColor(subject.color),
    subject,
    nodes,
    lessons,
    order,
  };
}

/** Lessons under a node (or the whole subject) that can actually be played/read. */
export function textKeys(index, nodeKey = index.id) {
  const node = index.nodes.get(nodeKey);
  if (!node) return [];
  return node.allKeys.filter((k) => index.lessons.get(k).hasText);
}

/**
 * CONTRACT v2 knowledge: done (completed|known) ÷ lessons with text.
 * Lessons without text are left out of both sides, so the value never exceeds 100%.
 */
export function knowledge(index, nodeKey, progress) {
  const keys = textKeys(index, nodeKey);
  let done = 0;
  let minutesDone = 0;
  let minutesTotal = 0;
  for (const k of keys) {
    const l = index.lessons.get(k);
    minutesTotal += l.minutes;
    const r = progress && progress[k];
    if (r && isDone(r.status)) { done++; minutesDone += l.minutes; }
  }
  const total = keys.length;
  const pct = total ? Math.floor((done / total) * 100) : 0;
  return { done, total, pct, minutesDone, minutesTotal };
}

/**
 * Resume point: first lesson (with text) under the node that is neither
 * completed nor known; if every one is done, the first lesson. `exclude` skips
 * keys already queued (Study Plan runs).
 */
export function resumeKey(index, nodeKey, progress, exclude = null) {
  const keys = textKeys(index, nodeKey);
  for (const k of keys) {
    if (exclude && exclude.has(k)) continue;
    const r = progress && progress[k];
    if (!r || !isDone(r.status)) return k;
  }
  return null;
}

export function resumeOrFirst(index, nodeKey, progress) {
  return resumeKey(index, nodeKey, progress) || textKeys(index, nodeKey)[0] || null;
}

/** Next/previous lesson in path order, skipping lessons without text. */
export function neighbor(index, lessonKey, dir) {
  const lesson = index.lessons.get(lessonKey);
  if (!lesson) return null;
  for (let i = lesson.index + dir; i >= 0 && i < index.order.length; i += dir) {
    const k = index.order[i];
    if (index.lessons.get(k).hasText) return k;
  }
  return null;
}

/** Most recently touched in-progress lesson among the given keys (for "Continue"). */
export function latestInProgress(progress, keys) {
  let best = null;
  for (const k of keys) {
    const r = progress && progress[k];
    if (r && r.status === 'in_progress' && (!best || r.updatedAt > progress[best].updatedAt)) best = k;
  }
  return best;
}

/** The deepest topic a lesson sits in (null when the lesson hangs directly off the subject). */
export function topicOfLesson(index, lessonKey) {
  const l = index.lessons.get(lessonKey);
  if (!l || l.parentKey === index.id) return null;
  return l.parentKey;
}

/** Position of a lesson inside its subject, counting only lessons with text. */
export function lessonOrdinal(index, lessonKey) {
  const keys = textKeys(index);
  return { n: keys.indexOf(lessonKey) + 1, of: keys.length };
}
