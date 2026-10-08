// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Study Plan (CONTRACT v2): `{ blocks: [{id, topicKey}], updatedAt }`, ≤ 200 blocks.
// One block = one lesson: the next lesson of that topic that is neither completed
// nor known *at play time*, skipping lessons already queued earlier in the same run.
// Pure list operations + run bookkeeping; no DOM, no storage.

import { isTopicKey } from './tree.js';

export const PLAN_KEY = 'sm.plan.v1';
export const PLAN_RUN_KEY = 'sm.planrun.v1'; // sessionStorage: the run in progress
export const MAX_BLOCKS = 200;
const ID_RE = /^[A-Za-z0-9_-]{1,32}$/;

export function newBlockId(rand = Math.random) {
  let s = '';
  for (let i = 0; i < 10; i++) s += Math.floor(rand() * 36).toString(36);
  return 'b' + s;
}

export function emptyPlan() {
  return { blocks: [], updatedAt: 0 };
}

export function normalizePlan(p) {
  if (!p || typeof p !== 'object' || !Array.isArray(p.blocks)) return emptyPlan();
  const seen = new Set();
  const blocks = [];
  for (const b of p.blocks) {
    if (!b || !isTopicKey(b.topicKey)) continue;
    let id = typeof b.id === 'string' && ID_RE.test(b.id) && !seen.has(b.id) ? b.id : newBlockId();
    while (seen.has(id)) id = newBlockId();
    seen.add(id);
    blocks.push({ id, topicKey: b.topicKey });
    if (blocks.length >= MAX_BLOCKS) break;
  }
  const updatedAt = Number(p.updatedAt);
  return { blocks, updatedAt: Number.isFinite(updatedAt) && updatedAt > 0 ? Math.floor(updatedAt) : 0 };
}

/** Consecutive blocks with the same topicKey, shown as one row ("Biology ×3"). */
export function groupBlocks(blocks) {
  const groups = [];
  blocks.forEach((b, i) => {
    const last = groups[groups.length - 1];
    if (last && last.topicKey === b.topicKey) {
      last.count++;
      last.ids.push(b.id);
    } else {
      groups.push({ topicKey: b.topicKey, start: i, count: 1, ids: [b.id] });
    }
  });
  return groups;
}

/** Insert a new block for `topicKey` before index `at` (clamped). */
export function insertBlock(blocks, topicKey, at, id = newBlockId()) {
  if (!isTopicKey(topicKey) || blocks.length >= MAX_BLOCKS) return blocks.slice();
  const i = Math.max(0, Math.min(blocks.length, at));
  const out = blocks.slice();
  out.splice(i, 0, { id, topicKey });
  return out;
}

/**
 * Move blocks[start .. start+count) so they sit before original index `to`
 * (an insertion point in the list as it was before the move).
 */
export function moveRange(blocks, start, count, to) {
  if (count < 1 || start < 0 || start + count > blocks.length) return blocks.slice();
  const t = Math.max(0, Math.min(blocks.length, to));
  if (t >= start && t <= start + count) return blocks.slice(); // no-op: dropped onto itself
  const moving = blocks.slice(start, start + count);
  const rest = blocks.slice(0, start).concat(blocks.slice(start + count));
  const at = t > start ? t - count : t;
  rest.splice(at, 0, ...moving);
  return rest;
}

export function duplicateAt(blocks, index, id = newBlockId()) {
  if (index < 0 || index >= blocks.length || blocks.length >= MAX_BLOCKS) return blocks.slice();
  return insertBlock(blocks, blocks[index].topicKey, index + 1, id);
}

export function removeRange(blocks, start, count = 1) {
  const out = blocks.slice();
  out.splice(start, count);
  return out;
}

/** Group-level helpers used by the editor's keyboard buttons. */
export function moveGroup(blocks, groupIndex, dir) {
  const groups = groupBlocks(blocks);
  const g = groups[groupIndex];
  if (!g) return blocks.slice();
  if (dir < 0 && groupIndex > 0) return moveRange(blocks, g.start, g.count, groups[groupIndex - 1].start);
  if (dir > 0 && groupIndex < groups.length - 1) {
    const next = groups[groupIndex + 1];
    return moveRange(blocks, g.start, g.count, next.start + next.count);
  }
  return blocks.slice();
}

/**
 * Find the next block that resolves to a lesson.
 * @param blocks    plan blocks
 * @param from      first block index to try
 * @param assigned  {blockIndex: lessonKey} for blocks already played in this run
 * @param resolve   (topicKey, excludeSet) => lessonKey | null
 * @returns {index, key, skipped:[indexes with nothing left]} or null when the plan is finished
 */
export function nextAssignment(blocks, from, assigned, resolve) {
  const skipped = [];
  for (let i = Math.max(0, from); i < blocks.length; i++) {
    const exclude = new Set();
    for (const [idx, key] of Object.entries(assigned || {})) if (Number(idx) < i && key) exclude.add(key);
    const key = resolve(blocks[i].topicKey, exclude);
    if (key) return { index: i, key, skipped };
    skipped.push(i);
  }
  return null;
}
