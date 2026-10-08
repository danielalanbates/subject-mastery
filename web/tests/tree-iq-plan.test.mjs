// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// Unit tests for tree.js, iq.js, plan.js, router.js, profile.js, docsync.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { indexSubject, knowledge, resumeKey, resumeOrFirst, neighbor, textKeys, latestInProgress, topicOfLesson, lessonOrdinal, isTopicKey, isLessonKey } from '../js/tree.js';
import { estimateIq, iqFromProgress } from '../js/iq.js';
import { groupBlocks, insertBlock, moveRange, duplicateAt, removeRange, moveGroup, normalizePlan, nextAssignment, MAX_BLOCKS } from '../js/plan.js';
import { parseRoute, href } from '../js/router.js';
import { normalizeProfile, defaultProfile, normalizeAvatar, bannerStops, initialsOf, MAX_BIO } from '../js/profile.js';
import { createDocStore, createDocSync } from '../js/docsync.js';

// A v2 nested subject: lessons directly on a module, nested modules, a lesson without text.
const BIO = {
  id: 'biology', title: 'Biology', color: '#2f855a',
  modules: [
    {
      id: 'm01-cells', title: 'Cells',
      lessons: [
        { id: 'l01-what-is-life', title: 'What Is Life', minutes: 6, hasAudio: true, hasText: true },
        { id: 'l02-the-cell', title: 'The Cell', minutes: 8, hasAudio: false, hasText: true },
      ],
      modules: [
        { id: 't01-membranes', title: 'Membranes', lessons: [
          { id: 'l01-lipids', title: 'Lipids', minutes: 7, hasAudio: true, hasText: true },
          { id: 'l02-proteins', title: 'Proteins', minutes: 5, hasAudio: false, hasText: false },
        ] },
      ],
    },
    { id: 'm02-genetics', title: 'Genetics', lessons: [
      { id: 'l01-dna', key: 'biology/m02-genetics/l01-dna', title: 'DNA', minutes: 9, hasAudio: true, hasText: true },
    ] },
  ],
};
const L = {
  life: 'biology/m01-cells/l01-what-is-life',
  cell: 'biology/m01-cells/l02-the-cell',
  lipids: 'biology/m01-cells/t01-membranes/l01-lipids',
  proteins: 'biology/m01-cells/t01-membranes/l02-proteins',
  dna: 'biology/m02-genetics/l01-dna',
};
const done = (status = 'completed', updatedAt = 1) => ({ status, position: 0, updatedAt });

// ---------------------------------------------------------------- tree

test('indexSubject: order is lessons first, then nested modules, depth first', () => {
  const idx = indexSubject(BIO);
  assert.deepEqual(idx.order, [L.life, L.cell, L.lipids, L.proteins, L.dna]);
  assert.deepEqual(idx.nodes.get('biology').allKeys, idx.order);
  assert.deepEqual(idx.nodes.get('biology/m01-cells').allKeys, [L.life, L.cell, L.lipids, L.proteins]);
  assert.equal(idx.nodes.get('biology/m01-cells/t01-membranes').number, '1.1');
  assert.equal(idx.nodes.get('biology/m02-genetics').number, '2');
  assert.deepEqual(idx.lessons.get(L.lipids).trail, ['biology', 'biology/m01-cells', 'biology/m01-cells/t01-membranes']);
});

test('indexSubject tolerates junk entries and duplicate ids', () => {
  const idx = indexSubject({ id: 'x', modules: [{ id: 'm1', lessons: [{ id: 'l1' }, { id: 'l1' }, { id: 'BAD ID' }, null] }, { id: 'm1' }, 'nope'] });
  assert.deepEqual(idx.order, ['x/m1/l1']);
  assert.equal(idx.lessons.get('x/m1/l1').minutes, 1);
  assert.throws(() => indexSubject({ id: 'Bad' }));
});

test('knowledge = done ÷ lessons with text, never above 100%', () => {
  const idx = indexSubject(BIO);
  assert.deepEqual(textKeys(idx), [L.life, L.cell, L.lipids, L.dna]);
  assert.equal(knowledge(idx, 'biology', {}).pct, 0);
  const p = { [L.life]: done('known'), [L.cell]: { status: 'in_progress', position: 3, updatedAt: 1 }, [L.proteins]: done('known') };
  const k = knowledge(idx, 'biology', p);
  assert.equal(k.done, 1);
  assert.equal(k.total, 4);
  assert.equal(k.pct, 25);
  assert.equal(knowledge(idx, 'biology/m01-cells/t01-membranes', p).pct, 0);
  const all = Object.fromEntries(idx.order.map((key) => [key, done()]));
  assert.equal(knowledge(idx, 'biology', all).pct, 100);
  assert.equal(knowledge(idx, 'biology', all).minutesDone, 6 + 8 + 7 + 9);
});

test('resume point: first lesson neither completed nor known; first lesson when all done', () => {
  const idx = indexSubject(BIO);
  assert.equal(resumeKey(idx, 'biology', {}), L.life);
  assert.equal(resumeKey(idx, 'biology', { [L.life]: done('known') }), L.cell);
  assert.equal(resumeKey(idx, 'biology', { [L.life]: done(), [L.cell]: { status: 'in_progress', position: 9, updatedAt: 1 } }), L.cell);
  assert.equal(resumeKey(idx, 'biology/m02-genetics', {}), L.dna);
  const all = Object.fromEntries(idx.order.map((key) => [key, done()]));
  assert.equal(resumeKey(idx, 'biology', all), null);
  assert.equal(resumeOrFirst(idx, 'biology', all), L.life);
  assert.equal(resumeKey(idx, 'biology', {}, new Set([L.life, L.cell])), L.lipids);
});

test('neighbor skips lessons without text', () => {
  const idx = indexSubject(BIO);
  assert.equal(neighbor(idx, L.lipids, +1), L.dna);
  assert.equal(neighbor(idx, L.dna, -1), L.lipids);
  assert.equal(neighbor(idx, L.life, -1), null);
  assert.equal(neighbor(idx, L.dna, +1), null);
});

test('helpers: latest in-progress, topic of lesson, ordinal', () => {
  const idx = indexSubject(BIO);
  const p = { [L.life]: { status: 'in_progress', position: 1, updatedAt: 5 }, [L.dna]: { status: 'in_progress', position: 1, updatedAt: 9 }, [L.cell]: done('completed', 99) };
  assert.equal(latestInProgress(p, idx.order), L.dna);
  assert.equal(topicOfLesson(idx, L.lipids), 'biology/m01-cells/t01-membranes');
  assert.deepEqual(lessonOrdinal(idx, L.dna), { n: 4, of: 4 });
});

test('key validators', () => {
  assert.ok(isTopicKey('biology'));
  assert.ok(isTopicKey('biology/m03-genetics'));
  assert.ok(!isTopicKey('biology//x'));
  assert.ok(isLessonKey(L.lipids));
  assert.ok(!isLessonKey('biology/m01'));
});

// ---------------------------------------------------------------- IQ

test('estimateIq: formula, baseline 100, below 150', () => {
  assert.equal(estimateIq(0, 0), 100);
  assert.equal(estimateIq(3000, 0), 100 + Math.floor(40 * (1 - Math.exp(-1))));
  assert.equal(estimateIq(0, 5), 100 + Math.floor(10 * (1 - Math.exp(-1))));
  assert.equal(estimateIq(600, 2), 100 + Math.floor(40 * (1 - Math.exp(-0.2)) + 10 * (1 - Math.exp(-0.4))));
  assert.ok(estimateIq(1e9, 1e6) < 150);
  assert.equal(estimateIq(-5, NaN), 100);
  let last = 100;
  for (let t = 0; t <= 20000; t += 500) { const v = estimateIq(t, 0); assert.ok(v >= last); last = v; }
});

test('iqFromProgress counts minutes of done lessons and subjects at 25%+', () => {
  const idx = indexSubject(BIO);
  const r0 = iqFromProgress({}, [idx]);
  assert.deepEqual(r0, { iq: 100, minutes: 0, broadSubjects: 0 });
  const r = iqFromProgress({ [L.life]: done('known'), [L.dna]: done('completed') }, [idx]);
  assert.equal(r.minutes, 15);
  assert.equal(r.broadSubjects, 1);
  assert.equal(r.iq, estimateIq(15, 1));
});

// ---------------------------------------------------------------- plan

const B = (id, topicKey) => ({ id, topicKey });

test('groupBlocks groups consecutive identical topics ("Biology ×3")', () => {
  const blocks = [B('a', 'biology'), B('b', 'biology'), B('c', 'biology'), B('d', 'economics'), B('e', 'biology')];
  assert.deepEqual(groupBlocks(blocks).map((g) => [g.topicKey, g.start, g.count]), [['biology', 0, 3], ['economics', 3, 1], ['biology', 4, 1]]);
  assert.deepEqual(groupBlocks([]), []);
});

test('insert, move, duplicate, remove', () => {
  const blocks = [B('a', 'biology'), B('b', 'economics'), B('c', 'world-history')];
  assert.deepEqual(insertBlock(blocks, 'biology', 1, 'n').map((b) => b.id), ['a', 'n', 'b', 'c']);
  assert.deepEqual(insertBlock(blocks, 'biology', 99, 'n').map((b) => b.id), ['a', 'b', 'c', 'n']);
  assert.deepEqual(insertBlock(blocks, 'Not A Key', 0).length, 3);
  assert.deepEqual(moveRange(blocks, 0, 1, 3).map((b) => b.id), ['b', 'c', 'a']);
  assert.deepEqual(moveRange(blocks, 2, 1, 0).map((b) => b.id), ['c', 'a', 'b']);
  assert.deepEqual(moveRange(blocks, 1, 1, 1).map((b) => b.id), ['a', 'b', 'c']);
  assert.deepEqual(moveRange(blocks, 0, 2, 3).map((b) => b.id), ['c', 'a', 'b']);
  assert.deepEqual(duplicateAt(blocks, 1, 'd').map((b) => b.id), ['a', 'b', 'd', 'c']);
  assert.deepEqual(removeRange(blocks, 1).map((b) => b.id), ['a', 'c']);
  assert.equal(blocks.length, 3, 'inputs are not mutated');
});

test('moveGroup moves a whole run past its neighbour group', () => {
  const blocks = [B('a', 'biology'), B('b', 'biology'), B('c', 'economics'), B('d', 'world-history'), B('e', 'world-history')];
  assert.deepEqual(moveGroup(blocks, 0, 1).map((b) => b.id), ['c', 'a', 'b', 'd', 'e']);
  assert.deepEqual(moveGroup(blocks, 2, -1).map((b) => b.id), ['a', 'b', 'd', 'e', 'c']);
  assert.deepEqual(moveGroup(blocks, 0, -1).map((b) => b.id), ['a', 'b', 'c', 'd', 'e']);
});

test('normalizePlan: drops junk, fixes duplicate ids, caps at 200', () => {
  const p = normalizePlan({ blocks: [B('x', 'biology'), B('x', 'economics'), B('y', 'BAD'), { topicKey: 'biology' }], updatedAt: 5 });
  assert.equal(p.blocks.length, 3);
  assert.equal(new Set(p.blocks.map((b) => b.id)).size, 3);
  assert.equal(p.updatedAt, 5);
  const big = normalizePlan({ blocks: Array.from({ length: 300 }, (_, i) => B(`b${i}`, 'biology')) });
  assert.equal(big.blocks.length, MAX_BLOCKS);
  assert.deepEqual(normalizePlan(null), { blocks: [], updatedAt: 0 });
});

test('nextAssignment: one lesson per block, skipping lessons queued earlier and empty topics', () => {
  const idx = indexSubject(BIO);
  const progress = { [L.dna]: done('known') };
  const resolve = (topicKey, exclude) => resumeKey(idx, topicKey, progress, exclude);
  const blocks = [B('1', 'biology'), B('2', 'biology'), B('3', 'biology/m02-genetics'), B('4', 'biology')];
  const assigned = {};
  const r1 = nextAssignment(blocks, 0, assigned, resolve);
  assert.deepEqual([r1.index, r1.key], [0, L.life]);
  assigned[r1.index] = r1.key;
  const r2 = nextAssignment(blocks, 1, assigned, resolve);
  assert.deepEqual([r2.index, r2.key], [1, L.cell]); // L.life still unfinished but already queued
  assigned[r2.index] = r2.key;
  const r3 = nextAssignment(blocks, 2, assigned, resolve);
  assert.deepEqual([r3.index, r3.key, r3.skipped], [3, L.lipids, [2]]); // genetics all known -> skipped
  assert.equal(nextAssignment(blocks, 4, assigned, resolve), null);
});

// ---------------------------------------------------------------- router

test('parseRoute covers every v2 route and rejects bad ids', () => {
  assert.deepEqual(parseRoute(''), { name: 'catalog' });
  assert.deepEqual(parseRoute('#/'), { name: 'catalog' });
  assert.deepEqual(parseRoute('#/s/biology'), { name: 'subject', topicKey: 'biology', subjectId: 'biology' });
  assert.deepEqual(parseRoute('#/s/biology/m01-cells/t01-membranes'), { name: 'subject', topicKey: 'biology/m01-cells/t01-membranes', subjectId: 'biology' });
  assert.deepEqual(parseRoute(`#/l/${L.lipids}`), { name: 'lesson', lessonKey: L.lipids, subjectId: 'biology' });
  assert.deepEqual(parseRoute('#/plan'), { name: 'plan' });
  assert.deepEqual(parseRoute('#/profile'), { name: 'profile' });
  assert.deepEqual(parseRoute('#/account'), { name: 'account' });
  assert.equal(parseRoute('#/l/biology/m01').name, 'notfound');
  assert.equal(parseRoute('#/s/../../etc').name, 'notfound');
  assert.equal(parseRoute('#/s/Biology').name, 'notfound');
  assert.equal(parseRoute('#/l/a/b/%E0%A4%A').name, 'notfound');
  assert.equal(parseRoute('#/nope').name, 'notfound');
  assert.equal(href.lesson(L.dna), `#/l/${L.dna}`);
});

// ---------------------------------------------------------------- profile

test('profile defaults and normalization', () => {
  const user = { name: 'Ada Lovelace', email: 'a@b.c', avatarUrl: 'https://x/a.png' };
  const d = defaultProfile(user);
  assert.equal(d.displayName, 'Ada Lovelace');
  assert.deepEqual(d.avatar, { kind: 'google', value: '' });
  assert.equal(d.showIq, true);
  assert.deepEqual(defaultProfile(null).avatar, { kind: 'initials', value: 'SM' });
  const p = normalizeProfile({
    displayName: '  Ada\u0007  ', bio: 'x'.repeat(400), accent: '#ABCDEF', banner: '#111111,#222222',
    featuredSubjects: ['biology', 'biology', 'BAD', 'a', 'b', 'c', 'd', 'e', 'f'], showIq: false,
    avatar: { kind: 'emoji', value: '🦉' }, updatedAt: 12.9,
  }, user);
  assert.equal(p.displayName, 'Ada');
  assert.equal([...p.bio].length, MAX_BIO);
  assert.equal(p.accent, '#abcdef');
  assert.equal(p.banner, '#111111,#222222');
  assert.deepEqual(p.featuredSubjects, ['biology', 'a', 'b', 'c', 'd', 'e']);
  assert.equal(p.showIq, false);
  assert.deepEqual(p.avatar, { kind: 'emoji', value: '🦉' });
  assert.equal(p.updatedAt, 12);
  assert.equal(normalizeProfile({ accent: 'red', banner: 'url(x)' }).accent, '#0f766e');
  assert.equal(normalizeProfile({ banner: 'url(x)' }).banner, 'tide');
});

test('avatar validation: emoji must be short and inert, images must be small data URLs', () => {
  assert.equal(normalizeAvatar({ kind: 'emoji', value: '<img>' }, 'Ada B').kind, 'initials');
  assert.equal(normalizeAvatar({ kind: 'image', value: 'https://evil/x.png' }).kind, 'initials');
  assert.equal(normalizeAvatar({ kind: 'image', value: 'data:image/png;base64,AAAA' }).kind, 'image');
  assert.equal(normalizeAvatar({ kind: 'image', value: 'data:image/png;base64,' + 'A'.repeat(70000) }).kind, 'initials');
  assert.equal(normalizeAvatar({ kind: 'image', value: 'data:image/svg+xml;base64,AAAA' }).kind, 'initials');
  assert.deepEqual(normalizeAvatar({ kind: 'initials', value: 'a<b>c d' }), { kind: 'initials', value: 'ABC' });
  assert.equal(initialsOf('Ada Lovelace'), 'AL');
  assert.equal(initialsOf('cher'), 'CH');
  assert.deepEqual(bannerStops('dusk'), ['#312e81', '#db2777']);
});

// ---------------------------------------------------------------- docsync

function memStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}
function jsonRes(status, body) { return { ok: status < 300, status, json: async () => body }; }

test('doc sync: newer server copy wins; newer local copy is PUT', async () => {
  let server = { blocks: [B('s1', 'biology')], updatedAt: 500 };
  const puts = [];
  const fetchImpl = async (url, init = {}) => {
    if ((init.method || 'GET') === 'GET') return jsonRes(200, { plan: server });
    const body = JSON.parse(init.body);
    puts.push(body);
    if (body.plan.updatedAt > server.updatedAt) server = body.plan;
    return jsonRes(200, { plan: server });
  };
  let t = 100;
  const store = createDocStore({ storage: memStorage(), key: 'sm.plan.v1', normalize: normalizePlan, now: () => t });
  const sync = createDocSync({ name: 'plan', store, fetchImpl, setTimer: (fn) => { fn(); return 1; }, clearTimer: () => {} });
  store.update({ blocks: [B('l1', 'economics')] }); // local at t=100, older than server
  await sync.pull();
  assert.deepEqual(store.get().blocks.map((b) => b.id), ['s1']);
  assert.equal(puts.length, 0);
  t = 900;
  store.update({ blocks: [B('l2', 'economics')] });
  await new Promise((r) => setImmediate(r));
  assert.equal(puts.length, 1);
  assert.equal(server.blocks[0].id, 'l2');
});

test('doc sync: replaceLocal takes the server copy (or a fresh default)', async () => {
  const fetchImpl = async () => jsonRes(200, { plan: null });
  const store = createDocStore({ storage: memStorage(), key: 'sm.plan.v1', normalize: normalizePlan, now: () => 5 });
  store.update({ blocks: [B('mine', 'biology')] });
  const sync = createDocSync({ name: 'plan', store, fetchImpl });
  await sync.pull({ replaceLocal: true });
  assert.deepEqual(store.get(), { blocks: [], updatedAt: 0 });
});

test('doc sync: missing endpoint (404) disables quietly', async () => {
  const fetchImpl = async () => jsonRes(404, {});
  const store = createDocStore({ storage: memStorage(), key: 'sm.profile.v1', normalize: (p) => normalizeProfile(p) });
  const sync = createDocSync({ name: 'profile', store, fetchImpl });
  await sync.pull();
  assert.equal(sync.status, 'unavailable');
});
