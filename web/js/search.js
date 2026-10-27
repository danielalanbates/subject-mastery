// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Library-wide search (CONTRACT v3 "data/search.json"). Pure functions, no DOM.
//
// An index entry is { key, kind: 'subject'|'topic'|'lesson', title, summary,
// breadcrumb: [ancestor titles, subject first], minutes (lessons only) }, listed
// in path order (catalog order, then each subject depth first: a node, its own
// lessons, then its sub-topics; the same order as tree.js).
//
// Matching: the query and the text are normalised (case, diacritics, punctuation,
// "&" = "and", apostrophes dropped), then every query word must match a word of
// the entry's title, summary or breadcrumb, either exactly or as the start of a
// word (or of words run together, so "postexilic" finds "Post-Exilic"). Common
// English plurals fold ("cells" = "cell"). Small words such as "the" and "of" are
// ignored unless the query has nothing else; a one-letter word only matches the
// start of a title word (otherwise "a" would match nearly every summary).
//
// Ranking, best first: an exact title (small words and plurals aside, so "the cell"
// = "Cells" and "supply demand" = "Supply and Demand"); then more query words in the
// title; then more in the summary (the rest matched the breadcrumb, so a page that
// only sits under a matching topic comes last, below the topic itself); then more
// whole-word (not just start-of-word) matches; then titles that start with the
// query; then subjects before topics before pages; then path order (stable).

import { isSlug, isTopicKey, isLessonKey, subjectOf } from './tree.js';

export const SEARCH_LIMIT = 50;
export const MAX_QUERY = 200;
export const MAX_TERMS = 8;
export const KINDS = ['subject', 'topic', 'lesson'];
const KIND_RANK = { subject: 0, topic: 1, lesson: 2 };

const STOP = new Set(['a', 'an', 'and', 'the', 'of', 'in', 'on', 'to', 'for', 'with', 'at', 'by', 'from', 'or', 'as', 'is']);
// Letters that NFKD does not split into a base letter plus a mark.
const LETTERS = { 'ß': 'ss', 'æ': 'ae', 'œ': 'oe', 'ø': 'o', 'ł': 'l', 'đ': 'd', 'ð': 'd', 'þ': 'th', 'ı': 'i', 'ħ': 'h' };
const LETTERS_RE = /[ßæœøłđðþıħ]/g;

/** "Café & Crème—Brûlée!" -> "cafe and creme brulee"; "Newton’s" -> "newtons". */
export function normalize(text) {
  return String(text == null ? '' : text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .replace(LETTERS_RE, (c) => LETTERS[c])
    .replace(/&/g, ' and ')
    .replace(/['’ʼ‘`]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function tokenize(text) {
  const n = normalize(text);
  return n ? n.split(' ') : [];
}

/** Light, symmetric plural folding: cells -> cell, churches -> church, studies -> study. */
export function fold(word) {
  const w = String(word || '');
  if (w.length <= 3 || /\d/.test(w)) return w;
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (/(ss|x|z|ch|sh)es$/.test(w)) return w.slice(0, -2);
  if (w.endsWith('s') && !/(ss|us|is)$/.test(w)) return w.slice(0, -1);
  return w;
}

/** Words without the small ones (unless that leaves none), plural-folded and run together. */
function contentKey(words) {
  const content = words.filter((w) => !STOP.has(w));
  return (content.length ? content : words).map(fold).join('');
}

/** The words a query must match (deduplicated, small words dropped unless that leaves none). */
export function parseQuery(query) {
  const words = tokenize(String(query == null ? '' : query).slice(0, MAX_QUERY));
  const unique = [...new Set(words)];
  const content = unique.filter((w) => !STOP.has(w));
  const terms = (content.length ? content : unique).slice(0, MAX_TERMS);
  return {
    norm: words.join(' '),
    compact: words.join(''),
    folded: contentKey(words),
    terms: terms.map((raw) => ({ raw, folded: fold(raw) })),
  };
}

function field(text) {
  const words = tokenize(text);
  const exact = new Set();
  const starts = [];
  let compact = '';
  for (const w of words) {
    exact.add(w);
    exact.add(fold(w));
    starts.push(compact.length);
    compact += w;
  }
  return { words, exact, starts, compact };
}

/** 2 = a whole word, 1 = the start of a word (or of words run together), 0 = no match. */
function level(f, t) {
  if (f.exact.has(t.raw) || f.exact.has(t.folded)) return 2;
  for (const s of f.starts) {
    if (f.compact.startsWith(t.raw, s) || (t.folded !== t.raw && f.compact.startsWith(t.folded, s))) return 1;
  }
  return 0;
}

function positiveInt(n, fallback) {
  const v = Math.round(Number(n));
  return Number.isFinite(v) && v >= 1 ? v : fallback;
}

/**
 * Validate data/search.json. Returns the usable entries (bad, duplicate and
 * unavailable-subject entries dropped), or null when the file is not an index at all.
 * `available` (Set of subject ids, optional) limits it to what the catalog offers.
 */
export function normalizeEntries(raw, available = null) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.entries)) return null;
  const seen = new Set();
  const out = [];
  for (const e of raw.entries) {
    if (!e || typeof e !== 'object' || typeof e.key !== 'string' || seen.has(e.key)) continue;
    const { kind, key } = e;
    const ok = kind === 'subject' ? isSlug(key)
      : kind === 'topic' ? isTopicKey(key) && key.includes('/')
        : kind === 'lesson' ? isLessonKey(key) : false;
    if (!ok) continue;
    if (available && !available.has(subjectOf(key))) continue;
    if (typeof e.title !== 'string' || !e.title.trim()) continue;
    seen.add(key);
    const entry = {
      key,
      kind,
      title: e.title,
      summary: typeof e.summary === 'string' ? e.summary : '',
      breadcrumb: Array.isArray(e.breadcrumb) ? e.breadcrumb.filter((s) => typeof s === 'string').slice(0, 8) : [],
    };
    if (kind === 'lesson') entry.minutes = positiveInt(e.minutes, 1);
    out.push(entry);
  }
  return out;
}

/**
 * The same entries build.py writes, made from subject indexes (tree.js indexSubject),
 * for hosts that have no data/search.json yet. Pass the indexes in catalog order.
 */
export function entriesFromSubjects(indexes) {
  const out = [];
  for (const idx of indexes || []) {
    if (!idx || !idx.nodes || !idx.nodes.has(idx.id)) continue;
    const subject = idx.subject || {};
    out.push({ key: idx.id, kind: 'subject', title: idx.title, summary: typeof subject.tagline === 'string' ? subject.tagline : '', breadcrumb: [] });
    const visit = (nodeKey, crumbs) => {
      const node = idx.nodes.get(nodeKey);
      for (const k of node.lessonKeys) {
        const l = idx.lessons.get(k);
        if (l.hasText) out.push({ key: k, kind: 'lesson', title: l.title, summary: l.summary, breadcrumb: crumbs, minutes: l.minutes });
      }
      for (const ck of node.childKeys) {
        const c = idx.nodes.get(ck);
        out.push({ key: ck, kind: 'topic', title: c.title, summary: c.summary, breadcrumb: crumbs });
        visit(ck, [...crumbs, c.title]);
      }
    };
    visit(idx.id, [idx.title]);
  }
  return out;
}

/** Stable sort of entries into the given subject order (unknown subjects last). */
export function orderBySubject(entries, subjectIds) {
  const pos = new Map(subjectIds.map((id, i) => [id, i]));
  const at = (e) => (pos.has(subjectOf(e.key)) ? pos.get(subjectOf(e.key)) : subjectIds.length);
  return entries.map((e, i) => [e, i]).sort((a, b) => at(a[0]) - at(b[0]) || a[1] - b[1]).map(([e]) => e);
}

/**
 * Prepare entries for search(). `under` maps every subject/topic key to the
 * lesson keys below it (the index only lists lessons with text), so a result
 * can show "4 pages · 25% known" without loading the subject files.
 */
export function prepareIndex(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const under = new Map();
  const items = list.map((entry, order) => {
    const title = field(entry.title);
    if (entry.kind === 'lesson') {
      const parts = entry.key.split('/');
      for (let i = 1; i < parts.length; i++) {
        const k = parts.slice(0, i).join('/');
        if (!under.has(k)) under.set(k, []);
        under.get(k).push(entry.key);
      }
    }
    return {
      entry,
      order,
      kindRank: KIND_RANK[entry.kind] ?? 3,
      title,
      summary: field(entry.summary),
      crumbs: field((entry.breadcrumb || []).join(' ')),
      folded: contentKey(title.words),
    };
  });
  return { entries: list, items, under };
}

function compare(a, b) {
  return b.exactTitle - a.exactTitle || b.inTitle - a.inTitle || b.inSummary - a.inSummary
    || b.exact - a.exact || b.prefix - a.prefix || a.kindRank - b.kindRank || a.order - b.order;
}

/**
 * Search a prepared index. Returns { query, terms, total, results } where results
 * (at most `limit`) are { entry, exactTitle (0|1), inTitle, inSummary, viaCrumbs
 * (query words matched in each field), exact, prefix, kindRank, order }, best first,
 * and total counts every match before the cap.
 */
export function search(index, query, { limit = SEARCH_LIMIT } = {}) {
  const q = parseQuery(query);
  const terms = q.terms.map((t) => t.raw);
  if (!q.terms.length || !index || !index.items) return { query: q.norm, terms, total: 0, results: [] };
  const hits = [];
  for (const p of index.items) {
    let inTitle = 0;
    let inSummary = 0;
    let viaCrumbs = 0;
    let exact = 0;
    let ok = true;
    for (const t of q.terms) {
      const a = level(p.title, t);
      if (a) { inTitle++; if (a === 2) exact++; continue; }
      if (t.raw.length < 2) { ok = false; break; }
      const b = level(p.summary, t);
      if (b) { inSummary++; if (b === 2) exact++; continue; }
      if (level(p.crumbs, t)) { viaCrumbs++; continue; }
      ok = false;
      break;
    }
    if (!ok) continue;
    const exactTitle = p.folded === q.folded ? 1 : 0;
    const prefix = p.title.compact.startsWith(q.compact) ? 1 : 0;
    hits.push({ entry: p.entry, exactTitle, inTitle, inSummary, viaCrumbs, exact, prefix, kindRank: p.kindRank, order: p.order });
  }
  hits.sort(compare);
  return { query: q.norm, terms, total: hits.length, results: hits.slice(0, Math.max(0, limit)) };
}

/** Results grouped by subject, groups in order of their best result. */
export function groupBySubject(results) {
  const groups = new Map();
  for (const r of results || []) {
    const id = subjectOf(r.entry.key);
    if (!groups.has(id)) groups.set(id, { subjectId: id, results: [] });
    groups.get(id).results.push(r);
  }
  return [...groups.values()];
}

/**
 * Split text into [{ text, hit }] runs, marking whole words that a query term
 * matches (same rules as search()). The caller renders the runs as text nodes.
 */
export function highlight(text, terms) {
  const s = String(text == null ? '' : text);
  if (!s) return [];
  const list = (terms || []).map((t) => String(t)).filter(Boolean);
  if (!list.length) return [{ text: s, hit: false }];
  const out = [];
  s.split(/([\p{L}\p{N}\p{M}'’ʼ]+)/u).forEach((part, i) => {
    if (!part) return;
    let hit = false;
    if (i % 2 === 1) {
      const n = normalize(part).replace(/ /g, '');
      const f = fold(n);
      hit = !!n && list.some((t) => n.startsWith(t) || f === fold(t) || n.startsWith(fold(t)));
    }
    const last = out[out.length - 1];
    if (last && last.hit === hit) last.text += part;
    else out.push({ text: part, hit });
  });
  return out;
}
