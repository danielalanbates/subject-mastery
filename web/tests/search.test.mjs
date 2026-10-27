// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// Unit tests for search.js (library search, CONTRACT v3) and the #/search route.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalize, tokenize, fold, parseQuery, normalizeEntries, entriesFromSubjects, orderBySubject,
  prepareIndex, search, groupBySubject, highlight, SEARCH_LIMIT,
} from '../js/search.js';
import { indexSubject } from '../js/tree.js';
import { parseRoute, href } from '../js/router.js';

const subject = (key, title, summary = '') => ({ key, kind: 'subject', title, summary, breadcrumb: [] });
const topic = (key, title, crumbs, summary = '') => ({ key, kind: 'topic', title, summary, breadcrumb: crumbs });
const lesson = (key, title, crumbs, summary = '', minutes = 6) => ({ key, kind: 'lesson', title, summary, breadcrumb: crumbs, minutes });

// A small library in path order.
const ENTRIES = [
  subject('biology', 'Biology', 'The science of life.'),
  topic('biology/m01-cells', 'Cells', ['Biology'], 'The unit of life.'),
  lesson('biology/m01-cells/l01-the-cell', 'The Cell', ['Biology', 'Cells'], 'The smallest living unit.'),
  lesson('biology/m01-cells/l02-cellular-respiration', 'Cellular Respiration', ['Biology', 'Cells'], 'How cells release energy.'),
  lesson('biology/m01-cells/l03-cell-membranes', 'Cell Membranes', ['Biology', 'Cells'], 'A wall of lipids.'),
  topic('biology/m02-genetics', 'Genetics', ['Biology'], 'How traits pass on, from Mendel’s peas in Brünn to DNA.'),
  lesson('biology/m02-genetics/l01-dna', 'DNA', ['Biology', 'Genetics'], 'The molecule of heredity.'),
  lesson('biology/m02-genetics/l02-population-genetics', 'Population Genetics', ['Biology', 'Genetics'], 'Genes across a population.'),
  subject('economics', 'Economics', 'How people choose under scarcity.'),
  topic('economics/m01-markets', 'Markets', ['Economics'], 'How prices coordinate decisions.'),
  lesson('economics/m01-markets/l01-supply-and-demand', 'Supply and Demand', ['Economics', 'Markets'], 'Two curves that set a price.'),
  lesson('economics/m01-markets/l02-supply-shocks', 'Supply Shocks', ['Economics', 'Markets'], 'When a harvest fails, demand stays.'),
  subject('biblical-studies', 'Biblical Studies & Theology', 'Scripture, its world and its readers.'),
  lesson('biblical-studies/m01-history/l01-post-exilic-judaism', 'Post-Exilic Judaism', ['Biblical Studies & Theology', 'History'], 'Life after the return from Babylon.'),
];
const INDEX = prepareIndex(ENTRIES);
const keys = (res) => res.results.map((r) => r.entry.key);

// ---------------------------------------------------------------- normalisation

test('normalize folds case, punctuation, diacritics, "&" and apostrophes', () => {
  assert.equal(normalize('Café  Crème—Brûlée!'), 'cafe creme brulee');
  assert.equal(normalize('Biblical Studies & Theology'), 'biblical studies and theology');
  assert.equal(normalize('Newton’s Laws'), 'newtons laws');
  assert.equal(normalize("Newton's Laws"), 'newtons laws');
  assert.equal(normalize('STRAẞE, Ærø, Łódź'), 'strasse aero lodz');
  assert.equal(normalize('Post-Exilic: (538 BC)'), 'post exilic 538 bc');
  assert.equal(normalize('ﬁrst  ＡＢＣ'), 'first abc');
  assert.equal(normalize('<script>alert("x")</script>'), 'script alert x script');
  assert.equal(normalize(''), '');
  assert.equal(normalize(null), '');
  assert.equal(normalize(undefined), '');
  assert.deepEqual(tokenize('  The   Cell. '), ['the', 'cell']);
  assert.deepEqual(tokenize('!!!'), []);
});

test('fold: light, symmetric plural folding', () => {
  assert.equal(fold('cells'), 'cell');
  assert.equal(fold('churches'), 'church');
  assert.equal(fold('studies'), 'study');
  assert.equal(fold('classes'), 'class');
  assert.equal(fold('class'), 'class');
  assert.equal(fold('virus'), 'virus');
  assert.equal(fold('analysis'), 'analysis');
  assert.equal(fold('dna'), 'dna');
  assert.equal(fold('1940s'), '1940s');
});

test('parseQuery: deduplicates, drops small words unless nothing else is left, caps terms and length', () => {
  assert.deepEqual(parseQuery('The Cell cell').terms.map((t) => t.raw), ['cell']);
  assert.equal(parseQuery('The Cell').norm, 'the cell');
  assert.deepEqual(parseQuery('of the').terms.map((t) => t.raw), ['of', 'the']);
  assert.deepEqual(parseQuery('   ').terms, []);
  assert.equal(parseQuery('a b c d e f g h i j k l').terms.length, 8);
  assert.ok(parseQuery('x'.repeat(5000)).norm.length <= 200);
  assert.equal(parseQuery('cells').terms[0].folded, 'cell');
});

// ---------------------------------------------------------------- matching

test('search: every word must match (AND), as a word or the start of one', () => {
  const both = keys(search(INDEX, 'supply demand'));
  // "Supply Shocks" matches only through its summary ("demand stays").
  assert.deepEqual(both, ['economics/m01-markets/l01-supply-and-demand', 'economics/m01-markets/l02-supply-shocks']);
  assert.deepEqual(keys(search(INDEX, 'supply harvest')), ['economics/m01-markets/l02-supply-shocks']);
  assert.deepEqual(keys(search(INDEX, 'supp')).slice(0, 2), ['economics/m01-markets/l01-supply-and-demand', 'economics/m01-markets/l02-supply-shocks']);
  assert.equal(search(INDEX, 'supply zebra').total, 0);
  assert.equal(search(INDEX, 'upply').total, 0, 'no matches inside a word');
});

test('search: diacritics, punctuation, "&", apostrophes, plurals and run-together words', () => {
  assert.ok(keys(search(INDEX, 'brunn')).includes('biology/m02-genetics'));
  assert.ok(keys(search(INDEX, 'BRÜNN!!')).includes('biology/m02-genetics'));
  assert.ok(keys(search(INDEX, 'mendels')).includes('biology/m02-genetics'));
  assert.equal(keys(search(INDEX, 'biblical studies and theology'))[0], 'biblical-studies');
  assert.equal(keys(search(INDEX, 'Biblical Studies & Theology'))[0], 'biblical-studies');
  assert.equal(keys(search(INDEX, 'postexilic'))[0], 'biblical-studies/m01-history/l01-post-exilic-judaism');
  assert.equal(keys(search(INDEX, 'post-exilic'))[0], 'biblical-studies/m01-history/l01-post-exilic-judaism');
  // "cells" = "cell": The Cell is an exact title for it; Cells (topic) too.
  const cells = keys(search(INDEX, 'cells'));
  assert.deepEqual(cells.slice(0, 2), ['biology/m01-cells', 'biology/m01-cells/l01-the-cell']);
});

test('search: a page that only sits under a matching topic comes last; the breadcrumb also narrows', () => {
  const res = search(INDEX, 'genetics');
  // topic (exact title), a page with the word in its title, then the page that only sits in the topic
  assert.deepEqual(keys(res), ['biology/m02-genetics', 'biology/m02-genetics/l02-population-genetics', 'biology/m02-genetics/l01-dna']);
  assert.equal(res.results[2].viaCrumbs, 1);
  // DNA: title + breadcrumb; Genetics: breadcrumb + summary ("… to DNA") ranks below it.
  assert.deepEqual(keys(search(INDEX, 'biology dna')), ['biology/m02-genetics/l01-dna', 'biology/m02-genetics']);
  // Genetics: title + summary beats DNA: title + breadcrumb.
  assert.deepEqual(keys(search(INDEX, 'genetics dna')), ['biology/m02-genetics', 'biology/m02-genetics/l01-dna']);
});

// ---------------------------------------------------------------- ranking

test('ranking: exact title > title words > summary > breadcrumb', () => {
  const lib = prepareIndex([
    topic('s/m01-a', 'Anything', ['S'], 'Mentions the market in passing.'),           // summary
    lesson('s/m01-a/l01-x', 'Exchange', ['S', 'Market Basics'], 'Barter.'),            // breadcrumb only
    lesson('s/m01-a/l02-y', 'Barter', ['S', 'Market Basics'], 'Trade without money.'), // breadcrumb only (+ summary for "trade")
    lesson('s/m01-a/l03-z', 'Market Failure', ['S', 'Anything']),                       // title word
    lesson('s/m01-a/l04-w', 'Market', ['S', 'Anything']),                               // exact title
    subject('s', 'S'),
  ]);
  assert.deepEqual(keys(search(lib, 'market')), ['s/m01-a/l04-w', 's/m01-a/l03-z', 's/m01-a', 's/m01-a/l01-x', 's/m01-a/l02-y']);
  const r = search(lib, 'market trade');
  assert.deepEqual(keys(r), ['s/m01-a/l02-y']);
  assert.deepEqual([r.results[0].inTitle, r.results[0].inSummary, r.results[0].viaCrumbs], [0, 1, 1]);
  assert.equal(search(lib, 'market').results[0].exactTitle, 1);
  assert.equal(search(lib, 'market').results[1].exactTitle, 0);
  // Small words do not stop an exact title: "supply demand" is the title "Supply and Demand".
  assert.equal(search(INDEX, 'supply demand').results[0].exactTitle, 1);
  // Both "The Cell" and "Cells" are exact; the one whose title reads exactly like the query leads.
  assert.deepEqual(keys(search(INDEX, 'the cell')).slice(0, 2), ['biology/m01-cells/l01-the-cell', 'biology/m01-cells']);
});

test('ranking: more query words in the title beat more in the summary', () => {
  const lib = prepareIndex([
    lesson('h/m01-a/l01-x', 'Judaism and Christianity', ['H', 'A'], 'Life in the Roman Empire.'),
    lesson('h/m01-a/l02-y', 'The Roman World', ['H', 'A'], 'An empire transformed.'),
  ]);
  assert.deepEqual(keys(search(lib, 'roman empire')), ['h/m01-a/l02-y', 'h/m01-a/l01-x']);
});

test('search: a one-letter word only matches the start of a title word', () => {
  const res = keys(search(INDEX, 'd'));
  assert.ok(res.includes('biology/m02-genetics/l01-dna') && res.includes('economics/m01-markets/l01-supply-and-demand'));
  assert.ok(!res.includes('economics/m01-markets'), 'its summary says "decisions" but its title has no d-word');
});

test('ranking: whole-word matches beat prefixes; a title starting with the query beats one that does not', () => {
  const res = search(INDEX, 'cell');
  const order = keys(res);
  // Cells (topic; plurals fold) and The Cell ("the" is ignored) are exact titles; then "Cell
  // Membranes" (whole word) beats "Cellular Respiration" (start of a word).
  assert.deepEqual(order.slice(0, 4), ['biology/m01-cells', 'biology/m01-cells/l01-the-cell', 'biology/m01-cells/l03-cell-membranes', 'biology/m01-cells/l02-cellular-respiration']);
});

test('ranking: subjects before topics before pages on a tie, then path order (stable)', () => {
  const lib = prepareIndex([
    lesson('s/m01-a/l01-x', 'Light Waves', ['S', 'A']),
    topic('s/m01-a', 'Light Waves', ['S']),
    subject('s', 'Light Waves'),
    lesson('s/m01-a/l02-y', 'Light Waves', ['S', 'A']),
  ]);
  assert.deepEqual(keys(search(lib, 'light waves')), ['s', 's/m01-a', 's/m01-a/l01-x', 's/m01-a/l02-y']);
  assert.deepEqual(keys(search(lib, 'light')), ['s', 's/m01-a', 's/m01-a/l01-x', 's/m01-a/l02-y']);
  // Stable and pure: the same call gives the same order and does not touch the entries.
  const before = JSON.stringify(lib.entries);
  assert.deepEqual(keys(search(lib, 'light')), keys(search(lib, 'light')));
  assert.equal(JSON.stringify(lib.entries), before);
});

test('search: result cap with the full total; empty and junk queries return nothing', () => {
  const many = prepareIndex(Array.from({ length: 120 }, (_, i) => lesson(`s/m01-a/l${String(i).padStart(3, '0')}-p`, `Photosynthesis part ${i}`, ['S', 'A'])));
  const res = search(many, 'photo');
  assert.equal(res.total, 120);
  assert.equal(res.results.length, SEARCH_LIMIT);
  assert.equal(res.results[0].entry.key, 's/m01-a/l000-p');
  assert.equal(search(many, 'photo', { limit: 5 }).results.length, 5);
  for (const q of ['', '   ', '!!!', null, undefined]) assert.deepEqual(search(many, q).results, []);
  assert.equal(search(null, 'photo').total, 0);
});

test('groupBySubject keeps rank order inside groups and orders groups by their best result', () => {
  const res = search(INDEX, 'how');
  const groups = groupBySubject(res.results);
  assert.deepEqual(groups.map((g) => g.subjectId), [...new Set(keys(res).map((k) => k.split('/')[0]))]);
  for (const g of groups) assert.ok(g.results.every((r) => r.entry.key.split('/')[0] === g.subjectId));
  assert.deepEqual(groups.flatMap((g) => g.results).length, res.results.length);
});

// ---------------------------------------------------------------- highlight

test('highlight marks whole matching words and keeps every character as text', () => {
  assert.deepEqual(highlight('Cell Membranes and cellular life', ['cell']), [
    { text: 'Cell', hit: true }, { text: ' Membranes and ', hit: false }, { text: 'cellular', hit: true }, { text: ' life', hit: false },
  ]);
  const html = '<b>Supply</b> & "demand"';
  const runs = highlight(html, ['supply']);
  assert.equal(runs.map((r) => r.text).join(''), html);
  assert.deepEqual(runs.filter((r) => r.hit).map((r) => r.text), ['Supply']);
  assert.deepEqual(highlight('Brünn', ['brunn']), [{ text: 'Brünn', hit: true }]);
  assert.deepEqual(highlight('The Cells', ['cell']).filter((r) => r.hit).map((r) => r.text), ['Cells']);
  assert.deepEqual(highlight('', ['x']), []);
  assert.deepEqual(highlight('Plain', []), [{ text: 'Plain', hit: false }]);
});

// ---------------------------------------------------------------- index data

const BIO = {
  id: 'biology', title: 'Biology', tagline: 'Life, from cells up.', color: '#2f855a',
  modules: [
    { id: 'm01-cells', title: 'Cells', summary: 'The unit of life.',
      lessons: [
        { id: 'l01-what-is-life', title: 'What Is Life', summary: 'Signs of life.', minutes: 6, hasText: true },
        { id: 'l02-soon', title: 'Not Written Yet', summary: 'Later.', minutes: 6, hasText: false },
      ],
      modules: [{ id: 't01-membranes', title: 'Membranes', summary: 'The boundary.',
        lessons: [{ id: 'l01-lipids', title: 'Lipids', minutes: 3, hasText: true }] }] },
    { id: 'm02-genetics', title: 'Genetics', lessons: [{ id: 'l01-dna', title: 'DNA', summary: 'Heredity.', minutes: 9, hasText: true }] },
  ],
};

test('entriesFromSubjects: the build.py shape, in path order, pages without text left out', () => {
  const entries = entriesFromSubjects([indexSubject(BIO)]);
  assert.deepEqual(entries, [
    { key: 'biology', kind: 'subject', title: 'Biology', summary: 'Life, from cells up.', breadcrumb: [] },
    { key: 'biology/m01-cells', kind: 'topic', title: 'Cells', summary: 'The unit of life.', breadcrumb: ['Biology'] },
    { key: 'biology/m01-cells/l01-what-is-life', kind: 'lesson', title: 'What Is Life', summary: 'Signs of life.', breadcrumb: ['Biology', 'Cells'], minutes: 6 },
    { key: 'biology/m01-cells/t01-membranes', kind: 'topic', title: 'Membranes', summary: 'The boundary.', breadcrumb: ['Biology', 'Cells'] },
    { key: 'biology/m01-cells/t01-membranes/l01-lipids', kind: 'lesson', title: 'Lipids', summary: '', breadcrumb: ['Biology', 'Cells', 'Membranes'], minutes: 3 },
    { key: 'biology/m02-genetics', kind: 'topic', title: 'Genetics', summary: '', breadcrumb: ['Biology'] },
    { key: 'biology/m02-genetics/l01-dna', kind: 'lesson', title: 'DNA', summary: 'Heredity.', breadcrumb: ['Biology', 'Genetics'], minutes: 9 },
  ]);
});

test('prepareIndex: `under` lists the indexed pages below every subject and topic', () => {
  const idx = prepareIndex(entriesFromSubjects([indexSubject(BIO)]));
  assert.deepEqual(idx.under.get('biology'), ['biology/m01-cells/l01-what-is-life', 'biology/m01-cells/t01-membranes/l01-lipids', 'biology/m02-genetics/l01-dna']);
  assert.deepEqual(idx.under.get('biology/m01-cells'), ['biology/m01-cells/l01-what-is-life', 'biology/m01-cells/t01-membranes/l01-lipids']);
  assert.deepEqual(idx.under.get('biology/m01-cells/t01-membranes'), ['biology/m01-cells/t01-membranes/l01-lipids']);
  assert.equal(idx.under.get('biology/m01-cells/l01-what-is-life'), undefined);
});

test('normalizeEntries validates search.json: bad keys, kinds, titles, duplicates and unavailable subjects go', () => {
  assert.equal(normalizeEntries(null), null);
  assert.equal(normalizeEntries({ version: 1 }), null);
  assert.equal(normalizeEntries([]), null);
  const raw = { version: 1, entries: [
    { key: 'biology', kind: 'subject', title: 'Biology', summary: 'x', breadcrumb: [] },
    { key: 'biology', kind: 'subject', title: 'Duplicate' },
    { key: 'biology/m01', kind: 'topic', title: 'Cells', summary: 7, breadcrumb: ['Biology', 3, null] },
    { key: 'biology/m01/l01', kind: 'lesson', title: 'Life', breadcrumb: 'nope', minutes: 'x' },
    { key: 'biology/m01/l02', kind: 'lesson', title: '   ' },
    { key: 'Biology/m01/l03', kind: 'lesson', title: 'Bad key' },
    { key: 'biology/m01', kind: 'lesson', title: 'Too short for a lesson' },
    { key: 'biology', kind: 'topic', title: 'A topic needs a parent' },
    { key: 'biology/m01/l04', kind: 'video', title: 'Unknown kind' },
    { key: 'chemistry', kind: 'subject', title: 'Chemistry (planned)' },
    '<script>', null, 42,
  ] };
  const out = normalizeEntries(raw, new Set(['biology']));
  assert.deepEqual(out, [
    { key: 'biology', kind: 'subject', title: 'Biology', summary: 'x', breadcrumb: [] },
    { key: 'biology/m01', kind: 'topic', title: 'Cells', summary: '', breadcrumb: ['Biology'] },
    { key: 'biology/m01/l01', kind: 'lesson', title: 'Life', summary: '', breadcrumb: [], minutes: 1 },
  ]);
  assert.equal(normalizeEntries(raw).filter((e) => e.key === 'chemistry').length, 1, 'no catalog filter without `available`');
});

test('orderBySubject puts entries into catalog order and keeps path order inside a subject', () => {
  const list = [lesson('b/m/l1', 'B1', []), subject('a', 'A'), lesson('b/m/l2', 'B2', []), subject('b', 'B'), subject('z', 'Z')];
  assert.deepEqual(orderBySubject(list, ['a', 'b']).map((e) => e.key), ['a', 'b/m/l1', 'b/m/l2', 'b', 'z']);
});

// ---------------------------------------------------------------- route

test('router: #/search?q=… is a route; q is decoded and capped; href.search round-trips', () => {
  assert.deepEqual(parseRoute('#/search'), { name: 'search', q: '' });
  assert.deepEqual(parseRoute('#/search?q=cell%20wall'), { name: 'search', q: 'cell wall' });
  assert.deepEqual(parseRoute('#/search?q=a+b'), { name: 'search', q: 'a b' });
  assert.deepEqual(parseRoute('#/search?x=1&q=dna'), { name: 'search', q: 'dna' });
  assert.deepEqual(parseRoute('#/search?q=100%'), { name: 'search', q: '100%' });
  assert.equal(parseRoute('#/search/extra').name, 'notfound');
  assert.equal(parseRoute(`#/search?q=${'x'.repeat(500)}`).q.length, 200);
  for (const q of ['Biblical Studies & Theology', '<img src=x onerror=alert(1)>', 'café?#/l/x', '50% off']) {
    assert.equal(parseRoute(href.search(q)).q, q);
  }
  assert.equal(href.search(''), '#/search');
  assert.equal(href.search('  '), '#/search');
  assert.equal(href.search(' dna '), '#/search?q=dna');
  // The cap never leaves half an emoji (encodeURIComponent throws on a lone surrogate).
  const long = `${'a'.repeat(199)}😀`;
  assert.equal(parseRoute(`#/search?q=${encodeURIComponent(long)}`).q, 'a'.repeat(199));
  assert.equal(href.search(long), `#/search?q=${'a'.repeat(199)}`);
  assert.equal(parseRoute(href.search(`${'a'.repeat(198)}😀`)).q, `${'a'.repeat(198)}😀`);
  // the other routes are unchanged by the query-string handling
  assert.deepEqual(parseRoute('#/about?credits'), { name: 'about' });
  assert.deepEqual(parseRoute('#/s/biology?x=1'), { name: 'subject', topicKey: 'biology', subjectId: 'biology' });
});
