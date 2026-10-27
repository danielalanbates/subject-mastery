// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Search (#/search?q=…): one field, live results (debounced) grouped by subject.
// Each page shows its status, minutes and where it sits; topics and subjects show
// how many pages they hold and how much of them is known. Activating a result
// opens the page or topic. Keyboard: ↓ from the field into the results, ↑/↓
// between results, Esc back to the field (or clears it), Enter jumps to the first
// result. The result count is announced politely. Every string from the data is
// rendered as text (h() / text nodes), never as HTML.

import { h, clear, formatMinutes, plural, redrawKeepingFocus } from '../dom.js';
import { icon, STATUS_ICON, STATUS_LABEL } from '../icons.js';
import { searchBox, monogram, errorState, linkButton } from '../components.js';
import { href } from '../router.js';
import { search, groupBySubject, highlight, SEARCH_LIMIT } from '../search.js';
import { isDone } from '../progress.js';
import { safeColor } from '../tree.js';

const DEBOUNCE_MS = 150;
// The result opened last, so Back to the same query puts focus on it again.
let lastOpened = null;

export async function renderSearch(ctx, route) {
  const handover = ctx.searchHandover;
  ctx.searchHandover = null;
  let catalog;
  let index;
  try {
    catalog = await ctx.catalog();
    index = await ctx.searchIndex();
  } catch {
    const el = h('div', { class: 'wrap search-page' },
      h('h1', { class: 'sr-only' }, 'Search'),
      errorState('Search could not be loaded. Check your connection and try again.', { onRetry: () => ctx.navigate(location.hash) }));
    return { el, title: 'Search' };
  }

  const subjects = new Map(catalog.subjects.filter((s) => s.status === 'available').map((s) => [s.id, s]));
  const pageCount = index.entries.filter((e) => e.kind === 'lesson').length;
  const subjectCount = index.entries.filter((e) => e.kind === 'subject').length;

  const box = searchBox({
    id: 'search-q',
    label: 'Search pages, topics and subjects',
    landmark: 'Search the library',
    placeholder: 'A title, a topic or an idea',
    hint: 'Matches titles, topics and summaries. Press ↓ to move into the results.',
    visibleLabel: true,
    shortcut: true,
  });
  const input = box.input;
  input.value = route.q || '';
  const status = h('p', { class: 'search-status', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const results = h('div', { class: 'search-results', dataset: { source: index.source } });
  const el = h('div', { class: 'wrap search-page' },
    h('header', { class: 'page-head' },
      h('h1', null, 'Search the library'),
      h('p', { class: 'muted' }, `${plural(pageCount, 'page')} across ${plural(subjectCount, 'subject')}.`)),
    box.form,
    status,
    results);

  let current = null;
  function setStatus(text) {
    if (status.textContent !== text) status.textContent = text;
  }

  function marked(text, terms) {
    return highlight(text, terms).map((run) => (run.hit ? h('mark', null, run.text) : run.text));
  }

  function subjectColor(id) {
    const s = subjects.get(id);
    return safeColor(s && s.color);
  }

  function hit(r, terms, progress) {
    const e = r.entry;
    const context = [];
    const trail = e.breadcrumb.slice(1);
    if (trail.length) context.push(h('span', { class: 'hit-trail' }, trail.join(' › ')));
    let lead;
    if (e.kind === 'lesson') {
      const st = (progress[e.key] && progress[e.key].status) || 'none';
      lead = h('span', { class: `status status-${st}`, 'aria-hidden': 'true' }, icon(STATUS_ICON[st] || STATUS_ICON.none));
      context.push(h('span', null, formatMinutes(e.minutes)));
      context.push(h('span', { class: `hit-status hit-status-${st}` }, STATUS_LABEL[st] || STATUS_LABEL.none));
    } else {
      const keys = index.under.get(e.key) || [];
      const done = keys.filter((k) => progress[k] && isDone(progress[k].status)).length;
      lead = e.kind === 'subject'
        ? monogram(e.title, subjectColor(e.key), 22)
        : h('span', { class: 'hit-kind-icon', 'aria-hidden': 'true' }, icon('layers'));
      if (!keys.length) context.push(h('span', null, 'Coming soon'));
      else {
        context.push(h('span', null, plural(keys.length, 'page')));
        context.push(h('span', { class: done ? 'hit-status hit-status-known' : null },
          done === keys.length ? 'All known' : `${Math.floor((done / keys.length) * 100)}% known`));
      }
    }
    return h('li', null,
      h('a', {
        class: `search-hit hit-${e.kind}`,
        href: e.kind === 'lesson' ? href.lesson(e.key) : href.topic(e.key),
        dataset: { fid: `hit:${e.key}`, key: e.key, kind: e.kind },
        onClick: () => { lastOpened = { q: input.value.trim(), key: e.key }; },
      },
      lead,
      h('span', { class: 'hit-main' },
        h('span', { class: 'hit-title' }, marked(e.title, terms),
          e.kind === 'lesson' ? null : h('span', { class: 'badge' }, e.kind === 'subject' ? 'Subject' : 'Topic')),
        h('span', { class: 'hit-context' }, context),
        e.summary ? h('span', { class: 'hit-summary' }, marked(e.summary, terms)) : null)));
  }

  function intro() {
    const list = [...subjects.values()].filter((s) => index.entries.some((e) => e.key === s.id));
    return h('div', { class: 'search-intro' },
      h('p', null, 'Type a few letters of any page title, topic or idea. Every word you type must match, so add words to narrow the list.'),
      list.length ? h('nav', { 'aria-label': 'Browse subjects' },
        h('p', { class: 'small-h' }, 'Or browse a subject'),
        h('ul', { class: 'chips' }, list.map((s) => h('li', null, h('a', { class: 'chip chip-link', href: href.topic(s.id) }, s.title))))) : null);
  }

  function noResults(q) {
    return h('div', { class: 'search-empty' },
      icon('search'),
      h('p', { class: 'state-title' }, 'No pages or topics match ', h('span', { class: 'search-q' }, `“${q}”`), '.'),
      h('p', { class: 'muted' }, 'Check the spelling, use fewer or shorter words, or browse the subjects.'),
      linkButton('All subjects', href.catalog(), { kind: 'secondary', iconName: 'grid' }));
  }

  function draw() {
    const q = input.value.trim();
    const res = search(index, q, { limit: SEARCH_LIMIT });
    current = res;
    const progress = ctx.store.all();
    redrawKeepingFocus(results, () => {
      clear(results);
      if (!res.terms.length) {
        setStatus('');
        results.append(intro());
        return;
      }
      if (!res.total) {
        setStatus(`No results for “${q}”.`);
        results.append(noResults(q));
        return;
      }
      const groups = groupBySubject(res.results);
      const shown = res.results.length;
      setStatus(shown < res.total
        ? `Showing the best ${shown} of ${res.total} results for “${q}”. Add a word to narrow them down.`
        : `${plural(res.total, 'result')} for “${q}” in ${plural(groups.length, 'subject')}.`);
      for (const g of groups) {
        const s = subjects.get(g.subjectId);
        const title = (s && s.title) || g.subjectId;
        const gid = `sg-${g.subjectId}`;
        results.append(h('section', { class: 'search-group', 'aria-labelledby': gid },
          h('h2', { id: gid, class: 'search-group-head' },
            monogram(title, subjectColor(g.subjectId), 28),
            h('span', null, title),
            h('span', { class: 'search-group-count' }, plural(g.results.length, 'result'))),
          h('ul', { class: 'search-list' }, g.results.map((r) => hit(r, res.terms, progress)))));
      }
    });
  }

  let timer = 0;
  function flush() {
    clearTimeout(timer);
    timer = 0;
    const q = input.value.trim();
    const target = href.search(q);
    if (location.hash !== target) history.replaceState(null, '', target);
    document.title = q ? `Search: ${q} · Subject Mastery` : 'Search · Subject Mastery';
    draw();
  }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(flush, DEBOUNCE_MS);
  }

  function hits() {
    return [...results.querySelectorAll('.search-hit')];
  }

  input.addEventListener('input', schedule);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      if (timer) flush();
      const first = hits()[0];
      if (first) { e.preventDefault(); first.focus(); }
    } else if (e.key === 'Escape' && input.value) {
      e.preventDefault();
      input.value = '';
      flush();
    }
  });
  box.form.addEventListener('submit', () => {
    flush();
    const first = hits()[0];
    if (first) first.focus();
  });
  results.addEventListener('keydown', (e) => {
    const t = e.target;
    if (!(t instanceof Element) || !t.classList.contains('search-hit')) return;
    const list = hits();
    const i = list.indexOf(t);
    if (e.key === 'ArrowDown' && i < list.length - 1) { e.preventDefault(); list[i + 1].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); (i > 0 ? list[i - 1] : input).focus(); }
    else if (e.key === 'Escape') { e.preventDefault(); input.focus(); }
  });

  draw();
  const unsub = ctx.store.subscribe(() => { if (current) draw(); });

  const back = !handover && lastOpened && lastOpened.q === input.value.trim() ? lastOpened : null;
  lastOpened = null;
  return {
    el,
    title: input.value.trim() ? `Search: ${input.value.trim()}` : 'Search',
    noFocus: !!handover || !!back || !input.value.trim(),
    onMount() {
      if (handover) {
        // Typing started in the header or catalog field: carry on here without losing a key.
        const typed = handover.value;
        handover.value = '';
        if (typed !== input.value) { input.value = typed; flush(); }
        input.focus();
        const end = input.value.length;
        try { input.setSelectionRange(end, end); } catch { /* type=search may refuse */ }
        return;
      }
      if (back) {
        const a = results.querySelector(`[data-key="${CSS.escape(back.key)}"]`);
        if (a) { a.focus(); return; }
      }
      if (!input.value.trim()) input.focus();
    },
    cleanup() {
      clearTimeout(timer);
      unsub();
    },
  };
}
