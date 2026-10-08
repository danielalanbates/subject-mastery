// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Catalog (#/): the one-line promise, a live sample of how a path looks, the
// available subjects as cards with their knowledge %, "Continue where you left
// off", the Study Plan shortcut, and the planned library grouped by field.

import { h, clear, formatMinutes, plural, redrawKeepingFocus } from '../dom.js';
import { icon, STATUS_ICON } from '../icons.js';
import { button, linkButton, progressBar, errorState, exactPct, monogram } from '../components.js';
import { href } from '../router.js';
import { getAllSubjects } from '../data.js';
import { knowledge, latestInProgress, resumeKey, safeColor, textKeys } from '../tree.js';

export async function renderCatalog(ctx) {
  let catalog;
  try {
    catalog = await ctx.catalog();
  } catch {
    const el = h('div', { class: 'wrap' }, errorState('The subject list could not be loaded. Check your connection and try again.', {
      onRetry: () => ctx.navigate('#/'),
      backHref: null,
    }));
    return { el, title: 'Subjects' };
  }

  const available = catalog.subjects.filter((s) => s.status === 'available');
  const planned = catalog.subjects.filter((s) => s.status !== 'available');
  const indexes = new Map();
  const pages = available.reduce((n, s) => n + (Number(s.lessonCount) || 0), 0);
  const minutes = available.reduce((n, s) => n + (Number(s.minutes) || 0), 0);

  const continueSlot = h('div', { class: 'continue-slot' });
  const nudgeSlot = h('div', { class: 'nudge-slot' });
  const planSlot = h('div', { class: 'plan-slot' });
  const sampleSlot = h('div', { class: 'hero-sample', 'aria-hidden': 'true' });
  const grid = h('div', { class: 'subject-grid' });
  const heroBtn = available.length ? button('Start learning', { kind: 'primary', iconName: 'play', 'data-fid': 'hero-start', onClick: () => startSomewhere() }) : null;

  const el = h('div', { class: 'wrap catalog' },
    h('section', { class: 'hero' },
      h('div', { class: 'hero-copy' },
        h('p', { class: 'hero-kicker' }, 'Free · Listen or read · Entry-level college and up'),
        h('h1', { class: 'hero-title' }, 'Learn a whole subject, one page at a time.'),
        h('p', { class: 'hero-lede' },
          'Standard learning paths you can play like a podcast or read like a book. Every page takes ten minutes or less. Already know a page? Skip it, and it still counts toward your knowledge.'),
        h('div', { class: 'hero-cta' },
          heroBtn,
          linkButton('How it works', href.about(), { kind: 'ghost' })),
        h('dl', { class: 'hero-stats' },
          stat(String(available.length), available.length === 1 ? 'subject ready' : 'subjects ready'),
          stat(String(pages), pages === 1 ? 'page' : 'pages'),
          stat(formatMinutes(minutes), 'of lessons'),
          planned.length ? stat(String(planned.length), 'more planned') : null),
        nudgeSlot),
      sampleSlot),
    continueSlot,
    planSlot,
    h('section', { class: 'section', 'aria-labelledby': 'avail-h' },
      h('div', { class: 'section-head' },
        h('h2', { id: 'avail-h' }, 'Start a subject'),
        h('p', { class: 'muted' }, 'Pick one to begin at its first page, or carry on where you stopped.')),
      available.length ? grid : h('p', { class: 'state' }, 'The first subjects are being recorded. Check back soon.')),
    planned.length ? renderPlanned(planned) : null);

  /** Hero "Start learning": continue the most recent page, else the first subject's resume point. */
  function startSomewhere() {
    const recent = recentKey();
    if (recent) { ctx.navigate(href.lesson(recent), { autoplay: true }); return; }
    if (available.length) ctx.playTopic(available[0].id);
  }

  function recentKey() {
    const keys = [];
    for (const idx of indexes.values()) for (const k of textKeys(idx)) keys.push(k);
    return latestInProgress(ctx.store.all(), keys);
  }

  function drawNudge() {
    clear(nudgeSlot);
    if (ctx.apiAvailable && !ctx.signedIn) {
      nudgeSlot.append(h('p', { class: 'nudge' },
        icon('cloud'),
        h('span', null, 'Progress saves on this device. Sign in with Google to keep it everywhere. '),
        h('a', { href: ctx.signInUrl(), onClick: () => ctx.rememberReturn() }, 'Sign in with Google')));
    }
  }

  // A real slice of a real path, so the promise is concrete: the knowledge bar and
  // the first pages of the subject you touched last (or the first subject).
  function drawSample() {
    clear(sampleSlot);
    const progress = ctx.store.all();
    const recent = recentKey();
    const idx = (recent && indexes.get(recent.split('/')[0])) || indexes.get(available[0] && available[0].id);
    if (!idx) { sampleSlot.append(h('div', { class: 'sample-card is-loading' })); return; }
    const k = knowledge(idx, idx.id, progress);
    const next = resumeKey(idx, idx.id, progress);
    const keys = textKeys(idx);
    const at = Math.max(0, Math.min(keys.length - 3, keys.indexOf(next) - 1));
    const rows = keys.slice(at, at + 3);
    sampleSlot.append(h('div', { class: 'sample-card', style: { '--subject': idx.color } },
      h('div', { class: 'sample-head' },
        monogram(idx.title, idx.color, 40),
        h('div', null, h('p', { class: 'sample-eyebrow' }, k.done ? 'Your path' : 'Inside a path'), h('p', { class: 'sample-title' }, idx.title))),
      h('div', { class: 'sample-bar' },
        h('div', { class: 'knowledge-label' }, h('span', null, `${idx.title} knowledge`), h('span', { class: 'knowledge-pct' }, `${k.pct}%`)),
        progressBar(k.pct, { color: idx.color, exact: exactPct(k) })),
      h('ul', { class: 'sample-rows' }, rows.map((key) => {
        const l = idx.lessons.get(key);
        const st = progress[key] ? progress[key].status : 'none';
        const label = key === next ? 'Up next' : st === 'known' ? 'Already known' : st === 'completed' ? 'Completed' : st === 'in_progress' ? 'In progress' : `${l.minutes} min`;
        return h('li', { class: `sample-row${key === next ? ' is-next' : ''}` },
          h('span', { class: `status status-${key === next ? 'next' : st}` }, icon(key === next ? 'play' : STATUS_ICON[st])),
          h('span', { class: 'sample-row-title' }, l.title),
          h('span', { class: 'sample-row-meta' }, label));
      })),
      h('p', { class: 'sample-foot' }, icon('skip'), 'Know a page already? One tap marks it known.')));
  }

  function drawContinue() {
    clear(continueSlot);
    const progress = ctx.store.all();
    const key = recentKey();
    if (heroBtn) heroBtn.querySelector('.btn-label').textContent = key ? 'Continue learning' : 'Start learning';
    if (!key) return;
    const idx = indexes.get(key.split('/')[0]);
    const lesson = idx.lessons.get(key);
    const parent = idx.nodes.get(lesson.parentKey);
    const pos = progress[key].position;
    continueSlot.append(h('section', { class: 'continue', style: { '--subject': idx.color }, 'aria-label': 'Continue where you left off' },
      monogram(idx.title, idx.color, 48),
      h('div', { class: 'continue-text' },
        h('p', { class: 'eyebrow' }, 'Continue where you left off'),
        h('p', { class: 'continue-title' }, h('a', { href: href.lesson(key) }, lesson.title)),
        h('p', { class: 'muted' }, parent && parent.key !== idx.id ? `${idx.title} · ${parent.title}` : idx.title,
          pos > 5 ? ` · stopped at ${Math.floor(pos / 60)}:${String(Math.floor(pos % 60)).padStart(2, '0')}` : '')),
      button('Continue', { kind: 'primary', iconName: 'play', 'data-fid': 'continue', onClick: () => ctx.navigate(href.lesson(key), { autoplay: true }) })));
  }

  function drawPlan() {
    clear(planSlot);
    const n = ctx.planStore.get().blocks.length;
    if (!n) return;
    planSlot.append(h('section', { class: 'plan-mini', 'aria-label': 'Your Study Plan' },
      icon('calendar'),
      h('p', null, h('strong', null, 'Your Study Plan'), ` · ${plural(n, 'block')}`),
      h('div', { class: 'row gap' },
        button('Play plan', { kind: 'secondary', iconName: 'play', 'data-fid': 'plan-play', onClick: () => ctx.startPlan() }),
        linkButton('View', href.plan(), { kind: 'ghost' }))));
  }

  function drawGrid() {
    redrawKeepingFocus(grid, () => {
      clear(grid);
      const progress = ctx.store.all();
      for (const s of available) grid.append(subjectCard(ctx, s, indexes.get(s.id), progress));
    });
  }

  function drawAll() {
    drawNudge();
    drawSample();
    drawContinue();
    drawPlan();
    drawGrid();
  }
  drawAll();

  getAllSubjects(catalog).then((list) => {
    for (const idx of list) indexes.set(idx.id, idx);
    drawSample();
    drawContinue();
    drawGrid();
  });

  const unsub = [
    ctx.store.subscribe(() => { drawSample(); drawContinue(); drawGrid(); }),
    ctx.sync.subscribe(drawNudge),
    ctx.planStore.subscribe(drawPlan),
  ];
  return { el, title: 'Subjects', cleanup: () => unsub.forEach((u) => u()) };
}

function stat(value, label) {
  return h('div', { class: 'hero-stat' }, h('dt', null, label), h('dd', null, value));
}

function subjectCard(ctx, s, idx, progress) {
  const color = safeColor(s.color || (idx && idx.color));
  const k = idx ? knowledge(idx, idx.id, progress) : null;
  const started = k && (k.done > 0 || idx.order.some((key) => progress[key]));
  const allDone = k && k.total > 0 && k.done === k.total;
  const label = !k ? 'Start' : allDone ? 'Review' : started ? 'Continue' : 'Start';
  const next = idx ? resumeKey(idx, idx.id, progress) : null;
  const stats = [];
  if (s.moduleCount) stats.push(h('span', null, icon('layers'), plural(s.moduleCount, 'topic')));
  if (s.lessonCount) stats.push(h('span', null, icon('list'), plural(s.lessonCount, 'page')));
  if (s.minutes) stats.push(h('span', null, icon('clock'), formatMinutes(s.minutes)));
  return h('article', { class: 'card subject-card', style: { '--subject': color } },
    h('div', { class: 'subject-card-head' },
      monogram(s.title, color, 48),
      h('div', { class: 'subject-card-titles' },
        h('p', { class: 'eyebrow' }, s.category || 'Subject'),
        h('h3', { class: 'card-title' }, h('a', { href: href.topic(s.id) }, s.title)))),
    s.tagline ? h('p', { class: 'card-tagline' }, s.tagline) : null,
    stats.length ? h('p', { class: 'card-stats' }, stats) : null,
    h('div', { class: 'knowledge' },
      h('div', { class: 'knowledge-label' },
        h('span', null, `${s.title} knowledge`),
        h('span', { class: 'knowledge-pct' }, k ? `${k.pct}%` : '–')),
      progressBar(k ? k.pct : 0, { label: `${s.title} knowledge`, color, exact: exactPct(k) })),
    h('p', { class: 'card-next' }, next ? [h('span', { class: 'muted' }, started ? 'Up next: ' : 'Begins with: '), idx.lessons.get(next).title]
      : allDone ? [icon('check'), 'Every page known. Review any time.'] : ' '),
    h('div', { class: 'card-actions' },
      button(label, { kind: 'primary', iconName: 'play', 'data-fid': `play-${s.id}`, onClick: () => ctx.playTopic(s.id), 'aria-label': `${label} ${s.title}` }),
      linkButton('All pages', href.topic(s.id), { kind: 'ghost', 'data-fid': `path-${s.id}`, 'aria-label': `All pages in ${s.title}` })));
}

function renderPlanned(planned) {
  const byCat = new Map();
  for (const s of planned) {
    const cat = s.category || 'Other';
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat).push(s);
  }
  // Biggest fields first, then by name: the library reads as broad at a glance.
  const cats = [...byCat.keys()].sort((a, b) => byCat.get(b).length - byCat.get(a).length || a.localeCompare(b));
  return h('section', { class: 'section soon', 'aria-labelledby': 'soon-h' },
    h('div', { class: 'section-head' },
      h('h2', { id: 'soon-h' }, 'Coming to the library'),
      h('p', { class: 'muted' }, `${plural(planned.length, 'more subject')} planned across ${plural(cats.length, 'field')}. The goal is every subject.`)),
    h('div', { class: 'soon-groups' },
      cats.map((cat) => h('section', { class: 'soon-group', 'aria-label': cat },
        h('h3', null, h('span', null, cat), h('span', { class: 'soon-count' }, String(byCat.get(cat).length))),
        h('ul', { class: 'chips' },
          byCat.get(cat).sort((a, b) => a.title.localeCompare(b.title)).map((s) =>
            h('li', { class: 'chip', title: s.tagline || null }, s.title)))))));
}
