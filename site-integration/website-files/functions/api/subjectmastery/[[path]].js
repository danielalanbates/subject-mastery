/**
 * Subject Mastery — per-member progress, profile and study plan
 * (https://batesai.org/subjectmastery/).
 *
 * Endpoints (all under /api/subjectmastery/), same-origin only, no CORS:
 *   GET    me        -> { signedIn: false } | { signedIn: true, user: { name, email, avatarUrl } }
 *   GET    progress  -> { progress: { <lessonKey>: { status, position, updatedAt } } }
 *   PUT    progress  <- { items: [{ key, status, position, updatedAt }] }   (at most 500)
 *                    -> { progress: { ...the full merged map... } }
 *   DELETE progress  -> { progress: {} }   wipes this member's progress (reset button)
 *   GET    profile   -> { profile: doc | null }      (CONTRACT v2)
 *   PUT    profile   <- { profile: doc } -> { profile: <whichever copy won> }
 *   GET    plan      -> { plan: doc | null }         (CONTRACT v2)
 *   PUT    plan      <- { plan: doc }    -> { plan: <whichever copy won> }
 *
 * The binding contract is docs/CONTRACT.md in the subject-mastery repo (v1 plus
 * its "v2 additions"). Auth is the ordinary batesai.org membership session
 * (batesai_session cookie, or a Bearer token for native clients) via
 * requireUser(); signed-out calls other than `me` answer 401 and the player
 * keeps working from localStorage alone.
 *
 * Progress merge rule, per lesson key — the same as mergeRecord() in the
 * player's web/js/progress.js, so server and client always converge:
 *   - last write wins on updatedAt (ms since epoch);
 *   - except that a newer `in_progress` never downgrades a stored `completed`
 *     or `known`: the done status stays, the newer position and time ride along
 *     (re-listening to a finished lesson must not un-finish it);
 *   - and the same holds the other way round: an older `completed`/`known`
 *     arriving after a newer stored `in_progress` makes it done, keeping the
 *     stored position and time (CONTRACT v2.1, rule 2);
 *   - equal timestamps: completed > known > in_progress, then larger position.
 * All of it lives in the upsert's ON CONFLICT ... SET/WHERE, so two devices
 * writing at once cannot race past it.
 *
 * Profile and plan are whole documents, last write wins on their updatedAt (a
 * tie keeps the stored copy). The server checks shape, sizes and anything that
 * could ever be rendered unsafely, and stores only the fields the contract
 * defines.
 *
 * D1 limits shaped the progress write path: at most 100 bound parameters per
 * query and (on the Workers free plan) 50 queries per invocation. Rows are
 * upserted 16 to a statement (80 parameters), so a full 500-item PUT is 32
 * statements in one transactional batch, plus the session lookup and read-back.
 *
 * Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
 * help@batesai.org · https://batesai.org
 */

import { requireUser } from '../../_lib/session.js';

// v2 keys: subject id, then 2-7 more ids down the topic tree to the lesson.
const LESSON_KEY_RE = /^[a-z0-9-]{1,48}(\/[a-z0-9-]{1,48}){2,7}$/;
const TOPIC_KEY_RE = /^[a-z0-9-]{1,48}(\/[a-z0-9-]{1,48}){0,6}$/;
const STATUSES = new Set(['in_progress', 'completed', 'known']);
const MAX_ITEMS = 500;
const MAX_POSITION = 86400; // seconds; no lesson is a day long
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const MAX_PROGRESS_BODY_CHARS = 512 * 1024; // 500 items of the longest v2 key is ~240 KB
const ROWS_PER_STATEMENT = 16;

// Whole-document routes. Table names come from this fixed map, never from input.
const DOCS = {
  profile: { table: 'sm_profile', clean: cleanProfile, maxChars: 96 * 1024 },
  // 200 blocks of the longest possible topic key is ~80 KB; real plans are tiny.
  plan: { table: 'sm_plan', clean: cleanPlan, maxChars: 128 * 1024 },
};

export async function onRequest(context) {
  const { request, env, params } = context;
  const path = params.path || [];
  const endpoint = path.length === 1 ? path[0] : '';
  const writing = request.method === 'PUT' || request.method === 'DELETE';

  try {
    if (writing && !sameOrigin(request)) return json({ error: 'Cross-origin request refused' }, 403);

    if (endpoint === 'me') {
      if (request.method !== 'GET') return methodNotAllowed('GET');
      return await handleMe(request, env);
    }
    if (endpoint === 'progress') {
      if (request.method === 'GET') return await handleGetProgress(request, env);
      if (request.method === 'PUT') return await handlePutProgress(request, env);
      if (request.method === 'DELETE') return await handleDeleteProgress(request, env);
      return methodNotAllowed('GET, PUT, DELETE');
    }
    if (Object.prototype.hasOwnProperty.call(DOCS, endpoint)) {
      if (request.method === 'GET') return await handleGetDoc(request, env, endpoint);
      if (request.method === 'PUT') return await handlePutDoc(request, env, endpoint);
      return methodNotAllowed('GET, PUT');
    }
    return json({ error: 'Unknown endpoint' }, 404);
  } catch (error) {
    console.error('Subject Mastery API error:', error && error.stack ? error.stack : error);
    return json({ error: 'Internal server error' }, 500);
  }
}

/* ------------------------------------------------------------------ */
/* me                                                                  */
/* ------------------------------------------------------------------ */

async function handleMe(request, env) {
  const userId = await requireUser(request, env);
  if (!userId) return json({ signedIn: false });
  const user = await env.DB.prepare('SELECT name, email, avatar_url FROM users WHERE id = ?')
    .bind(userId).first();
  // A live session whose user row is gone (account deleted elsewhere) is signed out.
  if (!user) return json({ signedIn: false });
  return json({
    signedIn: true,
    user: { name: user.name || null, email: user.email || null, avatarUrl: user.avatar_url || null },
  });
}

/* ------------------------------------------------------------------ */
/* progress                                                            */
/* ------------------------------------------------------------------ */

async function handleGetProgress(request, env) {
  const userId = await requireUser(request, env);
  if (!userId) return notSignedIn();
  return json({ progress: await loadProgress(env, userId) });
}

async function handlePutProgress(request, env) {
  const userId = await requireUser(request, env);
  if (!userId) return notSignedIn();

  const parsed = await readJson(request, MAX_PROGRESS_BODY_CHARS);
  if (parsed.error) return parsed.error;
  const body = parsed.body;
  if (!isPlainObject(body) || !Array.isArray(body.items)) {
    return json({ error: 'Body must be an object with an "items" array' }, 400);
  }
  if (body.items.length > MAX_ITEMS) {
    return json({ error: `Too many items: at most ${MAX_ITEMS} per request` }, 400);
  }

  // Validate everything before writing anything: a request is applied whole or not at all.
  const latest = Date.now() + MAX_CLOCK_SKEW_MS;
  const rows = [];
  for (let i = 0; i < body.items.length; i++) {
    const checked = validateItem(body.items[i], latest);
    if (checked.error) return json({ error: `items[${i}]: ${checked.error}`, index: i }, 400);
    rows.push(checked.item);
  }

  if (rows.length) {
    // Rows are applied strictly in request order. SQLite runs a multi-row
    // upsert one row at a time, so a key repeated in the same request merges
    // with its own earlier row, exactly like separate PUTs would. (Folding
    // duplicates in JavaScript first is NOT equivalent: the merge rule is not
    // associative once ties and the no-downgrade exception interact.)
    const statements = [];
    for (let i = 0; i < rows.length; i += ROWS_PER_STATEMENT) {
      statements.push(upsertProgress(env, userId, rows.slice(i, i + ROWS_PER_STATEMENT)));
    }
    // batch() is one transaction: either every chunk lands or none does.
    await env.DB.batch(statements);
  }

  return json({ progress: await loadProgress(env, userId) });
}

async function handleDeleteProgress(request, env) {
  const userId = await requireUser(request, env);
  if (!userId) return notSignedIn();
  await env.DB.prepare('DELETE FROM sm_progress WHERE user_id = ?').bind(userId).run();
  return json({ progress: {} });
}

function validateItem(item, latestAllowedMs) {
  if (!isPlainObject(item)) return { error: 'must be an object' };
  const { key, status, position, updatedAt } = item;
  if (typeof key !== 'string' || !LESSON_KEY_RE.test(key)) {
    return { error: 'key must be "<subject>/<topic>/…/<lesson>": 3-8 lowercase slugs of 1-48 chars' };
  }
  if (typeof status !== 'string' || !STATUSES.has(status)) {
    return { error: 'status must be one of in_progress, completed, known' };
  }
  if (typeof position !== 'number' || !Number.isFinite(position) || position < 0 || position > MAX_POSITION) {
    return { error: `position must be a finite number of seconds, 0-${MAX_POSITION}` };
  }
  const t = checkUpdatedAt(updatedAt, latestAllowedMs);
  if (t.error) return t;
  return { item: { key, status, position, updatedAt: t.value } };
}

// The merge rule, written once, in SQL. It mirrors mergeRecord() in the
// player's web/js/progress.js (CONTRACT v2.1, "Progress merge rule, exactly");
// change the two together.
const RANK_SQL = (t) => `(CASE ${t}.status WHEN 'completed' THEN 3 WHEN 'known' THEN 2 ELSE 1 END)`;

// True when the incoming row is the "newer" record: later updatedAt, then
// higher status rank, then larger position.
const INCOMING_NEWER_SQL =
  `(excluded.updated_at > sm_progress.updated_at
    OR (excluded.updated_at = sm_progress.updated_at
        AND (${RANK_SQL('excluded')} > ${RANK_SQL('sm_progress')}
             OR (${RANK_SQL('excluded')} = ${RANK_SQL('sm_progress')}
                 AND excluded.position > sm_progress.position))))`;

// Two ways a stored row changes:
//   - the incoming row is newer: it wins, except that a newer in_progress
//     keeps a stored completed/known status (rule 2, incoming side);
//   - the incoming row is older but completed/known while the stored row is
//     in_progress: the done status is taken, the stored position and time are
//     kept (rule 2, stored side; e.g. stored in_progress@20 + completed@10
//     gives completed@20).
// Every other older row leaves the stored one alone. SET expressions all see
// the row as it was before this update, so the CASEs agree with the WHERE.
function upsertProgress(env, userId, rows) {
  const values = rows.map(() => '(?, ?, ?, ?, ?)').join(', ');
  const binds = rows.flatMap((r) => [userId, r.key, r.status, r.position, r.updatedAt]);
  return env.DB.prepare(
    `INSERT INTO sm_progress (user_id, lesson_key, status, position, updated_at)
     VALUES ${values}
     ON CONFLICT(user_id, lesson_key) DO UPDATE SET
       status = CASE
                  WHEN excluded.status = 'in_progress' AND sm_progress.status IN ('completed', 'known')
                  THEN sm_progress.status
                  ELSE excluded.status
                END,
       position = CASE WHEN ${INCOMING_NEWER_SQL} THEN excluded.position ELSE sm_progress.position END,
       updated_at = CASE WHEN ${INCOMING_NEWER_SQL} THEN excluded.updated_at ELSE sm_progress.updated_at END
     WHERE ${INCOMING_NEWER_SQL}
        OR (sm_progress.status = 'in_progress' AND excluded.status IN ('completed', 'known'))`
  ).bind(...binds);
}

async function loadProgress(env, userId) {
  const { results } = await env.DB.prepare(
    'SELECT lesson_key, status, position, updated_at FROM sm_progress WHERE user_id = ?'
  ).bind(userId).all();
  const progress = {};
  for (const row of results || []) {
    progress[row.lesson_key] = { status: row.status, position: row.position, updatedAt: row.updated_at };
  }
  return progress;
}

/* ------------------------------------------------------------------ */
/* profile + plan (whole documents, last write wins)                   */
/* ------------------------------------------------------------------ */

async function handleGetDoc(request, env, name) {
  const userId = await requireUser(request, env);
  if (!userId) return notSignedIn();
  return json({ [name]: await loadDoc(env, userId, name) });
}

async function handlePutDoc(request, env, name) {
  const userId = await requireUser(request, env);
  if (!userId) return notSignedIn();
  const spec = DOCS[name];

  const parsed = await readJson(request, spec.maxChars + 1024);
  if (parsed.error) return parsed.error;
  const body = parsed.body;
  if (!isPlainObject(body) || !isPlainObject(body[name])) {
    return json({ error: `Body must be {"${name}": {...}}` }, 400);
  }
  const checked = spec.clean(body[name], Date.now() + MAX_CLOCK_SKEW_MS);
  if (checked.error) return json({ error: `${name}: ${checked.error}` }, 400);
  const data = JSON.stringify(checked.doc);
  if (data.length > spec.maxChars) return json({ error: `${name} is larger than ${spec.maxChars} bytes` }, 413);

  await env.DB.prepare(
    `INSERT INTO ${spec.table} (user_id, data, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
     WHERE excluded.updated_at > ${spec.table}.updated_at`
  ).bind(userId, data, checked.doc.updatedAt).run();

  return json({ [name]: await loadDoc(env, userId, name) });
}

async function loadDoc(env, userId, name) {
  const row = await env.DB.prepare(`SELECT data, updated_at FROM ${DOCS[name].table} WHERE user_id = ?`)
    .bind(userId).first();
  if (!row) return null;
  try {
    return { ...JSON.parse(row.data), updatedAt: row.updated_at };
  } catch {
    return null; // unreadable row: let the client's copy win on its next save
  }
}

const HEX_RE = /^#[0-9a-f]{6}$/i;
const GRADIENT_RE = /^#[0-9a-f]{6},#[0-9a-f]{6}$/i;
const PRESET_RE = /^[a-z0-9-]{1,32}$/;
const DATA_URL_RE = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/;
const AVATAR_KINDS = new Set(['google', 'initials', 'emoji', 'image']);
const BLOCK_ID_RE = /^[A-Za-z0-9_-]{1,32}$/;
// The player strips these before saving (tab/newline are allowed in a bio only).
const NAME_CONTROL_RE = /[\u0000-\u001f]/;
const BIO_CONTROL_RE = /[\u0000-\u0008\u000b-\u001f]/;
const codePoints = (s) => [...s].length;

/**
 * Profile (CONTRACT v2): { displayName, bio (≤ 280), avatar: {kind, value},
 * accent, banner, featuredSubjects (≤ 6), showIq, updatedAt }. Every field but
 * updatedAt is optional (the player fills defaults); unknown fields are dropped.
 * The checks follow normalizeProfile() in web/js/profile.js, so anything the
 * player produces passes.
 */
function cleanProfile(p, latestAllowedMs) {
  const t = checkUpdatedAt(p.updatedAt, latestAllowedMs);
  if (t.error) return t;
  const doc = {};
  if (p.displayName !== undefined) {
    if (typeof p.displayName !== 'string' || codePoints(p.displayName) > 60 || NAME_CONTROL_RE.test(p.displayName)) {
      return { error: 'displayName must be text of at most 60 characters' };
    }
    doc.displayName = p.displayName;
  }
  if (p.bio !== undefined) {
    if (typeof p.bio !== 'string' || codePoints(p.bio) > 280 || BIO_CONTROL_RE.test(p.bio)) {
      return { error: 'bio must be text of at most 280 characters' };
    }
    doc.bio = p.bio;
  }
  if (p.avatar !== undefined) {
    const a = p.avatar;
    if (!isPlainObject(a) || !AVATAR_KINDS.has(a.kind) || typeof a.value !== 'string') {
      return { error: 'avatar must be {kind: google|initials|emoji|image, value}' };
    }
    if (a.kind === 'image' && (a.value.length > 64 * 1024 || !DATA_URL_RE.test(a.value))) {
      return { error: 'image avatar must be a png/jpeg/webp data: URL of at most 64 KB' };
    }
    if (a.kind !== 'image' && (a.value.length > 16 || /[<>&"'`]/.test(a.value))) {
      return { error: 'avatar value is too long or has characters that are not allowed' };
    }
    doc.avatar = { kind: a.kind, value: a.value };
  }
  if (p.accent !== undefined) {
    if (typeof p.accent !== 'string' || !HEX_RE.test(p.accent)) return { error: 'accent must be a #rrggbb colour' };
    doc.accent = p.accent;
  }
  if (p.banner !== undefined) {
    if (typeof p.banner !== 'string' || !(PRESET_RE.test(p.banner) || GRADIENT_RE.test(p.banner))) {
      return { error: 'banner must be a preset id or "#rrggbb,#rrggbb"' };
    }
    doc.banner = p.banner;
  }
  if (p.featuredSubjects !== undefined) {
    const f = p.featuredSubjects;
    if (!Array.isArray(f) || f.length > 6 || !f.every((k) => typeof k === 'string' && TOPIC_KEY_RE.test(k))) {
      return { error: 'featuredSubjects must be at most 6 topic keys' };
    }
    doc.featuredSubjects = f.slice();
  }
  if (p.showIq !== undefined) {
    if (typeof p.showIq !== 'boolean') return { error: 'showIq must be true or false' };
    doc.showIq = p.showIq;
  }
  doc.updatedAt = t.value;
  return { doc };
}

/** Study plan (CONTRACT v2): { blocks: [{id, topicKey}] (≤ 200), updatedAt }. */
function cleanPlan(p, latestAllowedMs) {
  const t = checkUpdatedAt(p.updatedAt, latestAllowedMs);
  if (t.error) return t;
  if (!Array.isArray(p.blocks) || p.blocks.length > 200) return { error: 'blocks must be an array of at most 200' };
  const blocks = [];
  for (let i = 0; i < p.blocks.length; i++) {
    const b = p.blocks[i];
    if (!isPlainObject(b) || typeof b.id !== 'string' || !BLOCK_ID_RE.test(b.id)
        || typeof b.topicKey !== 'string' || !TOPIC_KEY_RE.test(b.topicKey)) {
      return { error: `blocks[${i}] must be {id, topicKey}` };
    }
    blocks.push({ id: b.id, topicKey: b.topicKey });
  }
  return { doc: { blocks, updatedAt: t.value } };
}

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

function checkUpdatedAt(updatedAt, latestAllowedMs) {
  if (typeof updatedAt !== 'number' || !Number.isFinite(updatedAt) || updatedAt < 0) {
    return { error: 'updatedAt must be a millisecond epoch timestamp' };
  }
  if (updatedAt > latestAllowedMs) {
    return { error: 'updatedAt is in the future (more than 5 minutes ahead of the server clock)' };
  }
  return { value: Math.floor(updatedAt) };
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

async function readJson(request, maxChars) {
  const raw = await request.text();
  if (raw.length > maxChars) return { error: json({ error: 'Request body too large' }, 413) };
  try {
    return { body: JSON.parse(raw) };
  } catch {
    return { error: json({ error: 'Body must be JSON' }, 400) };
  }
}

/**
 * The player is served from the same origin, so a browser write that names a
 * different Origin is not ours. Requests with no Origin header (curl, native
 * apps using a Bearer token) are let through; the session check still applies.
 */
function sameOrigin(request) {
  const origin = request.headers.get('Origin');
  return !origin || origin === new URL(request.url).origin;
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Per-member data: never cached by the browser or Cloudflare.
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

function notSignedIn() {
  return json({ error: 'Not signed in' }, 401);
}

function methodNotAllowed(allow) {
  return json({ error: 'Method not allowed' }, 405, { Allow: allow });
}
