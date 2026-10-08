// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Convergence check: the server's progress merge (SQL in
// functions/api/subjectmastery/[[path]].js) must agree with the player's
// mergeRecord() (web/js/progress.js) on every sequence of writes, ties
// included, or two devices can ping-pong forever.
//
// Sends random writes to a LOCAL `wrangler pages dev` as user B, one PUT per
// write and then the same writes again as one batched PUT, and compares both
// server results with folding the player's mergeRecord over the same writes.
//
//   node test_merge_convergence.mjs <copy of web/js/progress.js> [base-url]
import { pathToFileURL } from 'node:url';

const [progressPath, base = 'http://127.0.0.1:8788'] = process.argv.slice(2);
if (!/127\.0\.0\.1|localhost/.test(base)) throw new Error('local server only');
const { mergeRecord } = await import(pathToFileURL(progressPath).href);
const COOKIE = 'batesai_session=sm-test-token-b';

let seed = 20261002;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (xs) => xs[Math.floor(rand() * xs.length)];

async function call(method, items) {
  const res = await fetch(`${base}/api/subjectmastery/progress`, {
    method,
    headers: { Cookie: COOKIE, 'Content-Type': 'application/json' },
    body: items ? JSON.stringify({ items }) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${res.status} ${await res.text()}`);
  return (await res.json()).progress;
}

const KEYS = ['prop/m01/l01', 'prop/m01/l02', 'prop/m02/l01'];
const writes = [];
for (let i = 0; i < 400; i++) {
  writes.push({
    key: pick(KEYS),
    status: pick(['in_progress', 'in_progress', 'completed', 'known']),
    position: Math.round(rand() * 6000) / 10,          // one decimal, as the player stores it
    updatedAt: 1000 + Math.floor(rand() * 40),         // a narrow range forces many ties
  });
}

const expected = {};
for (const w of writes) {
  const { key, ...rec } = w;
  expected[key] = mergeRecord(expected[key], rec);
}

const pick3 = (m) => Object.fromEntries(KEYS.map((k) => [k, m[k]]));
let failed = 0;

await call('DELETE');
let server;
for (const w of writes) server = await call('PUT', [w]);
const one = pick3(server);
const okOne = JSON.stringify(one) === JSON.stringify(pick3(expected));
console.log(`${okOne ? '  ok  ' : '  FAIL'}  ${writes.length} single-item PUTs converge with the player's mergeRecord`);
if (!okOne) { failed++; console.log({ server: one, player: pick3(expected) }); }

await call('DELETE');
const batched = pick3(await call('PUT', writes.slice(0, 400)));
const okBatch = JSON.stringify(batched) === JSON.stringify(pick3(expected));
console.log(`${okBatch ? '  ok  ' : '  FAIL'}  one ${writes.length}-item PUT (duplicates collapsed) converges too`);
if (!okBatch) { failed++; console.log({ server: batched, player: pick3(expected) }); }

// Replay in another order, in 50-item PUTs: the server must equal the player's
// fold over that same order (the order the server received the writes in).
await call('DELETE');
const shuffled = writes.slice().sort(() => rand() - 0.5);
for (let i = 0; i < shuffled.length; i += 50) server = await call('PUT', shuffled.slice(i, i + 50));
const expectedShuffled = {};
for (const w of shuffled) {
  const { key, ...rec } = w;
  expectedShuffled[key] = mergeRecord(expectedShuffled[key], rec);
}
const okShuffle = JSON.stringify(pick3(server)) === JSON.stringify(pick3(expectedShuffled));
console.log(`${okShuffle ? '  ok  ' : '  FAIL'}  shuffled replay in 50-item PUTs matches the player's fold in that order`);
if (!okShuffle) { failed++; console.log({ server: pick3(server), player: pick3(expectedShuffled) }); }
// Informational only: is the rule itself order-independent?
const orderFree = JSON.stringify(pick3(expected)) === JSON.stringify(pick3(expectedShuffled));
console.log(`  info  player's mergeRecord gives the same result in both orders: ${orderFree}`);

await call('DELETE');
console.log(`\n${3 - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
