// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Study Plan tab (#/plan): Play runs the blocks in order with continuous
// autoplay; the current block is highlighted and can be skipped. Each block
// shows the page it will play right now (resolved at play time, CONTRACT v2).

import { h, clear, formatMinutes, plural } from '../dom.js';
import { icon } from '../icons.js';
import { button, linkButton } from '../components.js';
import { href } from '../router.js';
import { getSubject } from '../data.js';
import { resumeKey, subjectOf } from '../tree.js';

export async function renderPlanTab(ctx) {
  const body = h('div', { class: 'plan-body' });
  const el = h('div', { class: 'wrap narrow plan-tab' }, body);
  const indexes = new Map();

  async function loadIndexes() {
    const ids = [...new Set(ctx.planStore.get().blocks.map((b) => subjectOf(b.topicKey)))];
    await Promise.all(ids.filter((id) => !indexes.has(id)).map(async (id) => {
      try { indexes.set(id, await getSubject(id)); } catch { /* missing subject */ }
    }));
  }

  function preview(blocks) {
    // What each block would play if the run started now (or continues now).
    const cur = ctx.planRun.current();
    const progress = ctx.store.all();
    const used = new Set();
    return blocks.map((b, i) => {
      const idx = indexes.get(subjectOf(b.topicKey));
      const node = idx && idx.nodes.get(b.topicKey);
      if (cur && cur.assigned[i]) {
        used.add(cur.assigned[i]);
        return { idx, node, key: cur.assigned[i], state: i === cur.index ? 'current' : 'played' };
      }
      if (cur && cur.skipped[i]) return { idx, node, key: null, state: 'empty' };
      const key = idx && node ? resumeKey(idx, b.topicKey, progress, used) : null;
      if (key) used.add(key);
      return { idx, node, key, state: cur && i < cur.index ? 'played' : key ? 'upcoming' : 'empty' };
    });
  }

  function draw() {
    clear(body);
    const blocks = ctx.planStore.get().blocks;
    const cur = ctx.planRun.current();
    const rows = preview(blocks);
    const minutes = rows.reduce((sum, r) => sum + (r.key && r.idx ? r.idx.lessons.get(r.key).minutes : 0), 0);

    body.append(h('header', { class: 'page-head' },
      h('p', { class: 'eyebrow' }, 'Study Plan'),
      h('h1', null, 'Play your plan'),
      h('p', { class: 'lede' }, 'Each block plays the next page you have not finished in that subject or topic. Pages play one after another until the plan is done.')));

    if (!blocks.length) {
      body.append(h('section', { class: 'state empty-plan card' },
        icon('calendar'),
        h('p', { class: 'state-title' }, 'Your Study Plan is empty.'),
        h('p', { class: 'muted' }, 'On your profile, drag subjects into the plan. For example: three Biology blocks, then one Economics block.'),
        linkButton('Build my plan', href.profile(), { kind: 'primary', iconName: 'edit', onClick: () => { ctx.scrollToPlanEditor = true; } })));
      return;
    }

    const playLabel = cur ? `Resume at block ${cur.index + 1}` : 'Play plan';
    body.append(h('div', { class: 'plan-actions card' },
      h('div', null,
        h('p', { class: 'plan-summary' }, h('strong', null, plural(blocks.length, 'block')), minutes ? ` · about ${formatMinutes(minutes)}` : ''),
        cur ? h('p', { class: 'muted small' }, 'A run is in progress.') : null),
      h('div', { class: 'row gap' },
        button(playLabel, {
          kind: 'primary', iconName: 'play', 'data-fid': 'plan-play',
          onClick: () => (cur && cur.key ? ctx.navigate(href.lesson(cur.key), { autoplay: true }) : ctx.startPlan()),
        }),
        cur ? button('Start over', { kind: 'ghost', iconName: 'reset', onClick: () => { ctx.planRun.stop(); ctx.startPlan(); } }) : null,
        cur ? button('Skip block', { kind: 'ghost', iconName: 'skip', onClick: () => skip() }) : null,
        linkButton('Edit', href.profile(), { kind: 'ghost', iconName: 'edit', onClick: () => { ctx.scrollToPlanEditor = true; } }))));

    const list = h('ol', { class: 'plan-list' });
    rows.forEach((r, i) => {
      const lesson = r.key && r.idx ? r.idx.lessons.get(r.key) : null;
      const title = r.node ? r.node.title : 'Unavailable topic';
      const subj = r.idx ? r.idx.title : subjectOf(blocks[i].topicKey);
      list.append(h('li', {
        class: `plan-item is-${r.state}`,
        style: { '--subject': r.idx ? r.idx.color : null },
        'aria-current': r.state === 'current' ? 'step' : null,
      },
        h('span', { class: 'plan-num', 'aria-hidden': 'true' }, String(i + 1)),
        h('div', { class: 'plan-text' },
          h('p', { class: 'plan-topic' }, title, r.node && r.node.key !== (r.idx && r.idx.id) ? h('span', { class: 'muted' }, ` · ${subj}`) : null),
          h('p', { class: 'muted small' },
            r.state === 'empty' ? 'Nothing left to learn here. This block will be skipped.'
              : lesson ? [r.state === 'played' ? 'Played: ' : r.state === 'current' ? 'Now: ' : 'Next up: ', lesson.title, ` · ${formatMinutes(lesson.minutes)}`]
                : '')),
        r.state === 'current' ? h('div', { class: 'plan-item-tools' },
          h('span', { class: 'badge badge-accent' }, 'Now playing'),
          button('Skip', { kind: 'ghost', iconName: 'skip', onClick: () => skip(), 'aria-label': 'Skip this block' })) : null));
    });
    body.append(list);
  }

  async function skip() {
    const nk = await ctx.planRun.advance();
    if (nk) ctx.navigate(href.lesson(nk), { autoplay: true });
    else { ctx.toast.show({ message: 'That was the last block in your Study Plan.' }); draw(); }
  }

  await loadIndexes();
  draw();
  const unsub = [
    ctx.planStore.subscribe(async () => { await loadIndexes(); draw(); }),
    ctx.store.subscribe(() => draw()),
  ];
  return { el, title: 'Study Plan', cleanup: () => unsub.forEach((u) => u()) };
}
