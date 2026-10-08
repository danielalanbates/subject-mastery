// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// Unit tests for web/js/markdown.js — run with: node --test 'web/tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown, renderInline, escapeHtml, parseBlocks, speechBlocks, chunkForSpeech, plainInline } from '../js/markdown.js';

test('escapes every HTML special character', () => {
  assert.equal(escapeHtml(`<a href="x" onclick='y'>&</a>`), '&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;');
});

test('raw HTML and script in markdown come out as inert text', () => {
  const md = '# T\n\nHello <script>alert(1)</script> and <img src=x onerror="alert(2)">\n\n- <b>li</b>\n\n## <i>h</i>';
  const html = renderMarkdown(md);
  assert.ok(!/<script/i.test(html));
  assert.ok(!/<img/i.test(html));
  assert.ok(!/<b>/.test(html));
  assert.ok(!/<i>/.test(html));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(html.includes('onerror=&quot;alert(2)&quot;'));
  // only whitelisted tags are present
  const tags = [...html.matchAll(/<\/?([a-z0-9]+)/g)].map((m) => m[1]);
  for (const t of tags) assert.ok(['h2', 'h3', 'p', 'ul', 'li'].includes(t), t);
});

test('attribute-breaking quotes inside emphasis stay escaped', () => {
  assert.equal(renderInline('**"x" onmouseover=\'y\'**'), '<strong>&quot;x&quot; onmouseover=&#39;y&#39;</strong>');
});

test('links render as their text only (no href ever emitted)', () => {
  const html = renderMarkdown('See [the source](javascript:alert(1)) now.');
  assert.equal(html, '<p>See the source now.</p>');
});

test('headings: leading title dropped, levels shifted by one', () => {
  const html = renderMarkdown('# Lesson Title\n\nIntro.\n\n## Key ideas\n\n### Detail');
  assert.equal(html, '<p>Intro.</p>\n<h3>Key ideas</h3>\n<h4>Detail</h4>');
  const keep = renderMarkdown('# Lesson Title', { dropTitle: false, shiftHeadings: 0 });
  assert.equal(keep, '<h1>Lesson Title</h1>');
});

test('paragraphs join soft-wrapped lines; blank lines separate', () => {
  assert.equal(renderMarkdown('one\ntwo\n\nthree'), '<p>one two</p>\n<p>three</p>');
  assert.equal(renderMarkdown('a\r\nb'), '<p>a b</p>');
});

test('bold and italic', () => {
  assert.equal(renderInline('**bold** and *it* and __b2__ and _i2_'), '<strong>bold</strong> and <em>it</em> and <strong>b2</strong> and <em>i2</em>');
  assert.equal(renderInline('***both***'), '<em><strong>both</strong></em>');
});

test('no emphasis inside words or around spaced asterisks', () => {
  assert.equal(renderInline('snake_case_name'), 'snake_case_name');
  assert.equal(renderInline('2 * 3 * 4'), '2 * 3 * 4');
  assert.equal(renderInline('a*b*c'), 'a*b*c');
});

test('code spans are escaped and not formatted', () => {
  assert.equal(renderInline('use `<b>**x**</b>`'), 'use <code>&lt;b&gt;**x**&lt;/b&gt;</code>');
});

test('bullet and numbered lists, with continuation lines', () => {
  const html = renderMarkdown('- one\n- two\n  continued\n\n1. first\n2. second');
  assert.equal(html, '<ul><li>one</li><li>two continued</li></ul>\n<ol><li>first</li><li>second</li></ol>');
  assert.equal(renderMarkdown('* a\n+ b'), '<ul><li>a</li><li>b</li></ul>');
});

test('quotes and rules', () => {
  assert.equal(renderMarkdown('> In the beginning\n> was the Word.'), '<blockquote><p>In the beginning was the Word.</p></blockquote>');
  assert.equal(renderMarkdown('a\n\n---\n\nb'), '<p>a</p>\n<hr>\n<p>b</p>');
});

test('empty / missing input renders nothing', () => {
  assert.equal(renderMarkdown(''), '');
  assert.equal(renderMarkdown(null), '');
  assert.deepEqual(parseBlocks(undefined), []);
});

test('speech text: markers stripped, headings and bullets end with a stop', () => {
  const blocks = speechBlocks('# Title\n\nThe **core** idea is _scarcity_.\n\n## Key ideas\n\n- Choices have costs\n- Trade helps?');
  assert.deepEqual(blocks, ['Title.', 'The core idea is scarcity.', 'Key ideas.', 'Choices have costs.', 'Trade helps?']);
  assert.equal(plainInline('a `b` [c](d)'), 'a b c');
});

test('speech chunks: sentence boundaries, size limit, nothing lost', () => {
  const text = 'One short sentence. ' + 'Another sentence that is a bit longer than the first one. '.repeat(10) + 'End';
  const chunks = chunkForSpeech([text], 120);
  assert.ok(chunks.length > 3);
  for (const c of chunks) assert.ok(c.length <= 120 * 1.6, c.length);
  const words = (s) => s.split(/\s+/).filter(Boolean).length;
  assert.equal(chunks.reduce((n, c) => n + words(c), 0), words(text));
  const long = chunkForSpeech(['word '.repeat(200).trim()], 100);
  for (const c of long) assert.ok(c.length <= 160);
  assert.equal(long.join(' ').split(' ').length, 200);
});
