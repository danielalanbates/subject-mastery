// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Tiny, deliberately limited markdown renderer for lesson text.
// Supports: headings, paragraphs, **bold** / __bold__, *italic* / _italic_,
// `code`, bullet lists, numbered lists, > quotes, --- rules.
// Every piece of source text is HTML-escaped BEFORE any markup is added, and
// the only tags ever emitted are the fixed ones below — so the result is safe to
// assign to innerHTML even if the markdown contains <script> or attributes.
// Links [text](url) render as their text only (lessons are written for the ear).

// [text](url) — the url may hold one level of parentheses.
const LINK_RE = /\[([^\]\n]+)\]\(((?:[^()\s]|\([^()\s]*\))*)\)/g;

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ESC[c]);
}

/** Inline formatting on one block of raw text. Returns safe HTML. */
export function renderInline(raw) {
  const codes = [];
  // 1. Pull out code spans so their contents are not formatted.
  let s = String(raw).replace(/`([^`\n]+)`/g, (_, code) => {
    codes.push(code);
    return `\u0000${codes.length - 1}\u0000`;
  });
  // 2. Links -> their text.
  s = s.replace(LINK_RE, '$1');
  // 3. Escape everything.
  s = escapeHtml(s);
  // 4. Emphasis. Markers are plain ASCII, untouched by escaping.
  s = s.replace(/\*\*(?=\S)([^*]*?\S)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^\w])__(?=\S)([^_]*?\S)__(?![\w])/g, '$1<strong>$2</strong>');
  s = s.replace(/(^|[^*\w])\*(?=[^\s*])([^*]*?[^\s*])\*(?![*\w])/g, '$1<em>$2</em>');
  s = s.replace(/(^|[^_\w])_(?=[^\s_])([^_]*?[^\s_])_(?![_\w])/g, '$1<em>$2</em>');
  // 5. Put code spans back (escaped).
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${escapeHtml(codes[Number(i)])}</code>`);
  return s;
}

const RE = {
  heading: /^(#{1,6})[ \t]+(.+?)[ \t]*#*[ \t]*$/,
  bullet: /^[ \t]*[-*+][ \t]+(.*)$/,
  ordered: /^[ \t]*(\d{1,3})[.)][ \t]+(.*)$/,
  quote: /^[ \t]*>[ \t]?(.*)$/,
  rule: /^[ \t]*([-*_])([ \t]*\1){2,}[ \t]*$/,
  indented: /^[ \t]{2,}\S/,
};

/**
 * Parse markdown into a flat list of blocks:
 *   {type:'heading', level, text} | {type:'p', text} | {type:'ul'|'ol', items:[text]}
 *   {type:'quote', text} | {type:'hr'}
 */
export function parseBlocks(markdown) {
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let para = null;
  let list = null;
  let quote = null;

  const close = () => {
    if (para) blocks.push({ type: 'p', text: para.join(' ') });
    if (list) blocks.push(list);
    if (quote) blocks.push({ type: 'quote', text: quote.join(' ') });
    para = list = quote = null;
  };

  for (const line of lines) {
    if (!line.trim()) { close(); continue; }
    let m;
    if (RE.rule.test(line)) { close(); blocks.push({ type: 'hr' }); continue; }
    if ((m = line.match(RE.heading))) {
      close();
      blocks.push({ type: 'heading', level: m[1].length, text: m[2] });
      continue;
    }
    if ((m = line.match(RE.bullet)) || (m = line.match(RE.ordered))) {
      const type = RE.bullet.test(line) ? 'ul' : 'ol';
      const text = type === 'ul' ? line.match(RE.bullet)[1] : line.match(RE.ordered)[2];
      if (para || quote || (list && list.type !== type)) close();
      if (!list) list = { type, items: [] };
      list.items.push(text.trim());
      continue;
    }
    if ((m = line.match(RE.quote))) {
      if (para || list) close();
      if (!quote) quote = [];
      quote.push(m[1].trim());
      continue;
    }
    if (list && RE.indented.test(line)) {
      list.items[list.items.length - 1] += ' ' + line.trim();
      continue;
    }
    if (list || quote) close();
    if (!para) para = [];
    para.push(line.trim());
  }
  close();
  return blocks;
}

/**
 * Render markdown to safe HTML.
 * options.shiftHeadings: add to every heading level (the page already has an <h1>).
 * options.dropTitle: drop a leading level-1 heading (the lesson title, shown elsewhere).
 */
export function renderMarkdown(markdown, { shiftHeadings = 1, dropTitle = true } = {}) {
  let blocks = parseBlocks(markdown);
  if (dropTitle && blocks.length && blocks[0].type === 'heading' && blocks[0].level === 1) {
    blocks = blocks.slice(1);
  }
  const out = [];
  for (const b of blocks) {
    switch (b.type) {
      case 'heading': {
        const level = Math.min(6, Math.max(1, b.level + shiftHeadings));
        out.push(`<h${level}>${renderInline(b.text)}</h${level}>`);
        break;
      }
      case 'p':
        out.push(`<p>${renderInline(b.text)}</p>`);
        break;
      case 'ul':
      case 'ol':
        out.push(`<${b.type}>${b.items.map((t) => `<li>${renderInline(t)}</li>`).join('')}</${b.type}>`);
        break;
      case 'quote':
        out.push(`<blockquote><p>${renderInline(b.text)}</p></blockquote>`);
        break;
      case 'hr':
        out.push('<hr>');
        break;
      default:
        break;
    }
  }
  return out.join('\n');
}

/** Strip inline markers, leaving plain words (for speech). */
export function plainInline(raw) {
  return String(raw)
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(LINK_RE, '$1')
    .replace(/(\*\*|__)(?=\S)(.*?\S)\1/g, '$2')
    .replace(/(^|[^*\w])\*(?=[^\s*])([^*]*?[^\s*])\*(?![*\w])/g, '$1$2')
    .replace(/(^|[^_\w])_(?=[^\s_])([^_]*?[^\s_])_(?![_\w])/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Plain-text blocks for the speech fallback, in reading order. Headings and
 * list items get a full stop so the voice pauses after them.
 */
export function speechBlocks(markdown, { dropTitle = false } = {}) {
  let blocks = parseBlocks(markdown);
  if (dropTitle && blocks.length && blocks[0].type === 'heading' && blocks[0].level === 1) {
    blocks = blocks.slice(1);
  }
  const out = [];
  const stop = (t) => (/[.!?:;]["')\]]?$/.test(t) ? t : t + '.');
  for (const b of blocks) {
    if (b.type === 'heading') out.push(stop(plainInline(b.text)));
    else if (b.type === 'p' || b.type === 'quote') out.push(plainInline(b.text));
    else if (b.type === 'ul' || b.type === 'ol') for (const t of b.items) out.push(stop(plainInline(t)));
  }
  return out.filter(Boolean);
}

/** Split text blocks into utterance-sized chunks (sentence boundaries, ≤ maxLen chars). */
export function chunkForSpeech(blocks, maxLen = 220) {
  const chunks = [];
  for (const block of blocks) {
    const sentences = block.match(/[^.!?]+(?:[.!?]+["')\]]*|$)\s*/g) || [block];
    let cur = '';
    for (const raw of sentences) {
      const s = raw.trim();
      if (!s) continue;
      if (cur && (cur.length + 1 + s.length) > maxLen) {
        chunks.push(cur);
        cur = s;
      } else {
        cur = cur ? cur + ' ' + s : s;
      }
      while (cur.length > maxLen * 1.6) {
        // A very long sentence: break at the last comma/space before the limit.
        let cut = cur.lastIndexOf(', ', maxLen);
        if (cut < maxLen / 3) cut = cur.lastIndexOf(' ', maxLen);
        if (cut < 1) cut = maxLen;
        chunks.push(cur.slice(0, cut + 1).trim());
        cur = cur.slice(cut + 1).trim();
      }
    }
    if (cur) chunks.push(cur);
  }
  return chunks;
}
