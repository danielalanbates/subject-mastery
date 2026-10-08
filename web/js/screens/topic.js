// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Subject / topic path (#/s/<topicKey>): the node's own pages, then each
// sub-topic with its pages, per-page status, per-topic knowledge bar, a
// Start/Continue button and "Already know this" for whole topics (with undo).
// A progress panel next to the title names the resume page. Topics with no
// written pages yet collapse to one "coming soon" line that can be expanded.

import { h, clear, formatMinutes, plural, redrawKeepingFocus } from '../dom.js';
import { icon } from '../icons.js';
import { button, progressBar, statusIcon, statusLegend, breadcrumbs, exactPct, monogram } from '../components.js';
import { href } from '../router.js';
import { getSubject } from '../data.js';
import { knowledge, resumeKey, textKeys, latestInProgress } from '../tree.js';
import { insertBlock } from '../plan.js';
import { isDone } from '../progress.js';
import { renderNotFound } from './notfound.js';

export async function renderTopic(ctx, route) {
  let index;
  try {
    index = await getSubject(route.subjectId);
  } catch (e) {
    return renderNotFound(ctx, route, e);
  }
  const node = index.nodes.get(route.topicKey);
  if (!node) return renderNotFound(ctx, route);
  const isSubject = node.key === index.id;
  ctx.kbar.show(index, isSubject ? null : node.key);

  let category = '';
  try {
    const cat = await ctx.catalog();
    const entry = cat.subjects.find((s) => s.id === index.id);
    category = (entry && entry.category) || index.subject.category || '';
  } catch { category = index.subject.category || ''; }

  const body = h('div', { class: 'topic-body' });
  const el = h('div', { class: 'wrap topic', style: { '--subject': index.color } }, body);

  const crumbs = [{ label: 'Subjects', href: href.catalog() }];
  let walk = node;
  const chain = [];
  while (walk) { chain.unshift(walk); walk = walk.parentKey ? index.nodes.get(walk.parentKey) : null; }
  for (const n of chain) crumbs.push({ label: n.title, href: href.topic(n.key) });

  function markNodeKnown(n) {
    const progress = ctx.store.all();
    const keys = textKeys(index, n.key).filter((k) => !(progress[k] && isDone(progress[k].status)));
    if (!keys.length) return;
    ctx.setStatusWithUndo(keys, 'known', {
      message: `Marked ${plural(keys.length, 'page')} in “${n.title}” as known.`,
      undoMessage: `“${n.title}” is back the way it was.`,
    });
  }

  function addToPlan(n) {
    const plan = ctx.planStore.get();
    ctx.planStore.update({ ...plan, blocks: insertBlock(plan.blocks, n.key, plan.blocks.length) });
    ctx.toast.show({
      message: `Added “${n.title}” to your Study Plan.`,
      action: { label: 'Open plan', run: () => ctx.navigate(href.plan()) },
    });
  }

  function lessonRow(key, progress, nextKey) {
    const l = index.lessons.get(key);
    const rec = progress[key];
    const meta = [formatMinutes(l.minutes)];
    if (l.hasText && !l.hasAudio) meta.push('no recording yet');
    if (!l.hasText) {
      return h('li', { class: 'lesson-row is-soon' },
        h('div', { class: 'lesson-link', 'aria-disabled': 'true' },
          statusIcon(null, { soon: true }),
          h('span', { class: 'lesson-main' },
            h('span', { class: 'lesson-title' }, l.title),
            h('span', { class: 'badge' }, 'Coming soon')),
          h('span', { class: 'lesson-meta' }, formatMinutes(l.minutes))));
    }
    return h('li', { class: `lesson-row${key === nextKey ? ' is-next' : ''}` },
      h('a', { class: 'lesson-link', href: href.lesson(key), 'data-fid': `l-${key}` },
        statusIcon(rec && rec.status),
        h('span', { class: 'lesson-main' },
          h('span', { class: 'lesson-title' }, l.title),
          key === nextKey ? h('span', { class: 'badge badge-accent' }, 'Up next') : null),
        h('span', { class: 'lesson-meta' }, meta.join(' · '))));
  }

  function nodeActions(n, k, { compact = false } = {}) {
    const allDone = k.total > 0 && k.done === k.total;
    const started = k.done > 0 || n.allKeys.some((key) => ctx.store.get(key));
    const label = allDone ? 'Review' : started ? 'Continue' : 'Start';
    const kind = isSubject && n === node ? 'subject' : 'topic';
    return h('div', { class: `node-actions${compact ? ' compact' : ''}` },
      k.total ? button(label, { kind: compact ? 'secondary' : 'primary', iconName: 'play', 'data-fid': `play-${n.key}`, onClick: () => ctx.playTopic(n.key), 'aria-label': `${label} ${n.title}` }) : null,
      k.total && !allDone
        ? button(compact ? 'Already know this' : `Already know this ${kind}`, { kind: 'known-ghost', iconName: 'skip', 'data-fid': `known-${n.key}`, onClick: () => markNodeKnown(n), 'aria-label': `Already know ${n.title}: mark every page known` })
        : k.total ? h('span', { class: 'done-chip', tabindex: '-1', 'data-fid': `known-${n.key}` }, icon('check'), 'All known') : null,
      !compact ? button('Add to Study Plan', { kind: 'ghost', iconName: 'plus', 'data-fid': `plan-${n.key}`, onClick: () => addToPlan(n) }) : null);
  }

  function draw() {
    clear(body);
    const progress = ctx.store.all();
    const k = knowledge(index, node.key, progress);
    const nextKey = resumeKey(index, node.key, progress);
    const recent = latestInProgress(progress, node.allKeys);

    const planned = node.allKeys.length - k.total;
    const crumbBar = h('div', { class: 'topic-crumbs' }, breadcrumbs(crumbs));
    const hero = h('section', { class: 'topic-hero' },
      h('div', { class: 'topic-hero-text' },
        h('p', { class: 'eyebrow' }, isSubject ? category || 'Subject' : `Topic ${node.number} · ${index.title}`),
        h('h1', null, node.title),
        (isSubject ? index.subject.description || index.subject.tagline : node.summary)
          ? h('p', { class: 'lede' }, isSubject ? index.subject.description || index.subject.tagline : node.summary) : null,
        h('p', { class: 'topic-stats' },
          isSubject && node.childKeys.length ? h('span', null, icon('layers'), plural(node.childKeys.length, 'topic')) : null,
          h('span', null, icon('list'), `${plural(k.total, 'page')} ready`),
          planned > 0 ? h('span', null, icon('sparkle'), `${planned} coming soon`) : null,
          h('span', null, icon('clock'), formatMinutes(k.minutesTotal)))),
      h('aside', { class: 'progress-panel card', 'aria-label': `${node.title} progress` },
        h('div', { class: 'panel-top' },
          monogram(index.title, index.color, 44),
          h('div', null,
            h('p', { class: 'panel-pct' }, `${k.pct}%`),
            h('p', { class: 'muted small' }, `${node.title} knowledge · ${k.done} of ${k.total} pages`))),
        progressBar(k.pct, { label: `${node.title} knowledge`, color: index.color, exact: exactPct(k) }),
        nextKey ? h('p', { class: 'panel-next' }, h('span', { class: 'muted' }, k.done || recent ? 'Up next: ' : 'Begins with: '),
          h('a', { href: href.lesson(nextKey) }, index.lessons.get(nextKey).title)) : null,
        nodeActions(node, k),
        recent && recent !== nextKey ? h('p', { class: 'muted small panel-recent' }, 'Last listened: ', h('a', { href: href.lesson(recent) }, index.lessons.get(recent).title)) : null));

    const contents = h('section', { class: 'contents', 'aria-label': 'Pages in this path' },
      h('div', { class: 'contents-head' }, h('h2', { class: 'sr-only' }, 'Pages'), statusLegend()));

    if (node.lessonKeys.length) {
      contents.append(h('ol', { class: 'lessons' }, node.lessonKeys.map((key) => lessonRow(key, progress, nextKey))));
    }
    for (const childKey of node.childKeys) {
      const child = index.nodes.get(childKey);
      const ck = knowledge(index, childKey, progress);
      if (!ck.total && child.allKeys.length) {
        // Nothing written yet: one compact line, expandable to the planned titles.
        contents.append(h('section', { class: 'module module-soon', 'aria-labelledby': `h-${childKey.replace(/\//g, '-')}` },
          h('div', { class: 'module-soon-head' },
            h('p', { class: 'eyebrow' }, `Topic ${child.number}`),
            h('h2', { id: `h-${childKey.replace(/\//g, '-')}` }, child.title),
            h('span', { class: 'badge' }, 'Coming soon')),
          h('details', { class: 'soon-details' },
            h('summary', null, `${plural(child.allKeys.length, 'page')} planned`),
            h('ol', { class: 'soon-titles' }, child.allKeys.map((key) => h('li', null, index.lessons.get(key).title))))));
        continue;
      }
      contents.append(h('section', { class: 'module', 'aria-labelledby': `h-${childKey.replace(/\//g, '-')}` },
        h('header', { class: 'module-head' },
          h('div', { class: 'module-title' },
            h('p', { class: 'eyebrow' }, `Topic ${child.number}`),
            h('h2', { id: `h-${childKey.replace(/\//g, '-')}` }, h('a', { href: href.topic(childKey) }, child.title)),
            child.summary ? h('p', { class: 'muted' }, child.summary) : null),
          h('div', { class: 'module-progress' },
            h('div', { class: 'knowledge-label' }, h('span', null, `${ck.done} of ${ck.total} known`), h('span', { class: 'knowledge-pct' }, `${ck.pct}%`)),
            progressBar(ck.pct, { thin: true, label: `${child.title} knowledge`, color: index.color, exact: exactPct(ck) })),
          nodeActions(child, ck, { compact: true })),
        child.lessonKeys.length ? h('ol', { class: 'lessons' }, child.lessonKeys.map((key) => lessonRow(key, progress, nextKey))) : null,
        child.childKeys.length ? h('ul', { class: 'subtopics' }, child.childKeys.map((gk) => {
          const g = index.nodes.get(gk);
          const gkn = knowledge(index, gk, progress);
          return h('li', null, h('a', { class: 'subtopic-link', href: href.topic(gk), 'data-fid': `t-${gk}` },
            icon('layers'),
            h('span', { class: 'lesson-title' }, g.title),
            h('span', { class: 'lesson-meta' }, `${plural(gkn.total, 'page')} · ${gkn.pct}% known`),
            icon('next', 'chev')));
        })) : null));
    }
    if (!node.lessonKeys.length && !node.childKeys.length) {
      contents.append(h('p', { class: 'state' }, 'Pages for this topic are being written.'));
    }
    body.append(crumbBar, hero, contents);
  }

  draw();
  const unsub = ctx.store.subscribe(() => redrawKeepingFocus(body, draw));
  return { el, title: node.title, cleanup: unsub };
}
