// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Profile (#/profile): customizable profile card with the Estimated IQ under the
// name (CONTRACT v2), featured subjects, and the Study Plan editor (drag and
// drop with pointer + touch, plus keyboard buttons).

import { h, clear, formatMinutes, plural } from '../dom.js';
import { icon } from '../icons.js';
import { button, iconButton, linkButton, progressBar, avatar, bannerStyle, toggle, exactPct } from '../components.js';
import { href } from '../router.js';
import { getAllSubjects } from '../data.js';
import { knowledge, subjectOf } from '../tree.js';
import { iqFromProgress, minutesToNextPoint, IQ_BASELINE, IQ_LABEL, IQ_DISCLAIMER } from '../iq.js';
import { ACCENTS, BANNERS, EMOJI_CHOICES, MAX_BIO, MAX_NAME, MAX_FEATURED, bannerStops, initialsOf, normalizeProfile } from '../profile.js';
import { groupBlocks, insertBlock, moveRange, removeRange, moveGroup, MAX_BLOCKS } from '../plan.js';
import { summarize } from '../progress.js';
import { imageFileToAvatar } from '../image.js';
import { createDropList } from '../dnd.js';

function iqHint(iq, minutes, broadSubjects) {
  const next = minutesToNextPoint(minutes, broadSubjects);
  const base = iq <= IQ_BASELINE ? `Everyone starts at ${IQ_BASELINE}, the high-school-graduate baseline.` : `Up from ${IQ_BASELINE}, the high-school-graduate baseline.`;
  if (next == null) return `${base} You have reached the top of the scale.`;
  return `${base} Your next point comes after about ${formatMinutes(Math.max(1, Math.ceil(next)))} more of learning.`;
}

export async function renderProfile(ctx) {
  let catalog = { subjects: [] };
  try { catalog = await ctx.catalog(); } catch { /* offline: profile still works */ }
  const indexes = await getAllSubjects(catalog).catch(() => []);
  const byId = new Map(indexes.map((i) => [i.id, i]));

  const cardSlot = h('div', { class: 'profile-slot' });
  const editorSlot = h('section', { class: 'plan-editor card', id: 'plan-editor', 'aria-labelledby': 'plan-h' });
  const el = h('div', { class: 'wrap profile-page' }, cardSlot, editorSlot);
  let editing = false;
  const cleanups = [];

  function topicTitle(topicKey) {
    const idx = byId.get(subjectOf(topicKey));
    const node = idx && idx.nodes.get(topicKey);
    return { title: node ? node.title : topicKey, subject: idx ? idx.title : subjectOf(topicKey), color: idx ? idx.color : '#64748b', isSubject: !!idx && topicKey === idx.id, idx, node };
  }

  // ----- profile card -------------------------------------------------------
  function profileCard(p, { preview = false } = {}) {
    const user = ctx.user;
    const progress = ctx.store.all();
    const { iq, minutes, broadSubjects } = iqFromProgress(progress, indexes);
    const counts = summarize(progress);
    const name = p.displayName || (user && user.name) || 'Learner';
    return h('section', { class: `profile-card card${preview ? ' is-preview' : ''}`, style: { ...bannerStyle(p.banner), '--accent-user': p.accent }, 'aria-label': preview ? 'Preview' : 'Profile' },
      h('div', { class: 'profile-banner', 'aria-hidden': 'true' }),
      h('div', { class: 'profile-main' },
        h('div', { class: 'profile-avatar' }, avatar(p, user, 96)),
        h('div', { class: 'profile-id' },
          preview ? h('p', { class: 'profile-name' }, name) : h('h1', { class: 'profile-name' }, name),
          p.showIq
            ? h('div', { class: 'iq' },
              h('p', { class: 'iq-line' },
                h('span', { class: 'iq-label' }, IQ_LABEL),
                h('span', { class: 'iq-value' }, String(iq))),
              h('p', { class: 'iq-hint' }, iqHint(iq, minutes, broadSubjects)),
              h('p', { class: 'iq-note' }, IQ_DISCLAIMER))
            : null,
          p.bio ? h('p', { class: 'profile-bio' }, p.bio) : null),
        !preview ? h('div', { class: 'profile-edit-btn' }, button('Edit profile', { kind: 'secondary', iconName: 'edit', onClick: () => { editing = true; drawCard(); } })) : null),
      h('dl', { class: 'profile-stats' },
        h('div', null, h('dt', null, 'Pages known'), h('dd', null, String(counts.done))),
        h('div', null, h('dt', null, 'Time learned'), h('dd', null, formatMinutes(minutes))),
        h('div', null, h('dt', null, 'Subjects at 25%+'), h('dd', null, String(broadSubjects)))),
      p.featuredSubjects.length ? h('div', { class: 'featured' },
        h('h2', { class: 'small-h' }, 'Featured subjects'),
        h('ul', { class: 'featured-list' }, p.featuredSubjects.map((tk) => {
          const t = topicTitle(tk);
          const k = t.idx && t.node ? knowledge(t.idx, tk, progress) : { pct: 0, done: 0, total: 0 };
          return h('li', { class: 'featured-item', style: { '--subject': t.color } },
            h('a', { href: href.topic(tk) }, t.title),
            h('div', { class: 'knowledge-label' }, h('span', null, `${t.title} knowledge`), h('span', { class: 'knowledge-pct' }, `${k.pct}%`)),
            progressBar(k.pct, { thin: true, color: t.color, label: `${t.title} knowledge`, exact: exactPct(k) }));
        }))) : null,
      !preview && !ctx.signedIn ? h('p', { class: 'muted small profile-local' }, icon('device'), ctx.apiAvailable
        ? ['This profile is saved on this device. ', h('a', { href: ctx.signInUrl(), onClick: () => ctx.rememberReturn() }, 'Sign in with Google'), ' to keep it on every device.']
        : 'This profile is saved on this device.') : null);
  }

  // ----- edit form ----------------------------------------------------------
  function editForm() {
    const user = ctx.user;
    const draft = JSON.parse(JSON.stringify(ctx.profileStore.get()));
    const previewSlot = h('div');
    const errorLine = h('p', { class: 'form-error', role: 'alert', hidden: true });
    const refresh = () => { clear(previewSlot); previewSlot.append(profileCard(normalizeProfile(draft, user), { preview: true })); };

    const nameInput = h('input', { id: 'pf-name', type: 'text', maxlength: String(MAX_NAME), value: draft.displayName || '', autocomplete: 'nickname', placeholder: (user && user.name) || 'Your name' });
    nameInput.addEventListener('input', () => { draft.displayName = nameInput.value; if (draft.avatar.kind === 'initials') { draft.avatar.value = initialsOf(nameInput.value); initialsInput.value = draft.avatar.value; } refresh(); });

    const bioCount = h('span', { class: 'counter', 'aria-live': 'polite' }, `${[...(draft.bio || '')].length}/${MAX_BIO}`);
    const bioInput = h('textarea', { id: 'pf-bio', rows: '3', maxlength: String(MAX_BIO), placeholder: 'A line or two about what you are learning.' });
    bioInput.value = draft.bio || '';
    bioInput.addEventListener('input', () => { draft.bio = bioInput.value; bioCount.textContent = `${[...bioInput.value].length}/${MAX_BIO}`; refresh(); });

    // Avatar
    const avatarKinds = [];
    if (user && user.avatarUrl) avatarKinds.push({ id: 'google', label: 'Google photo' });
    avatarKinds.push({ id: 'initials', label: 'Initials' }, { id: 'emoji', label: 'Emoji' }, { id: 'image', label: 'Photo' });
    const kindButtons = avatarKinds.map((k) => h('button', { type: 'button', class: 'seg-btn', 'aria-pressed': String(draft.avatar.kind === k.id), dataset: { kind: k.id }, onClick: () => setKind(k.id) }, k.label));
    const initialsInput = h('input', { type: 'text', maxlength: '3', class: 'short', 'aria-label': 'Initials', value: draft.avatar.kind === 'initials' ? draft.avatar.value : initialsOf(draft.displayName || (user && user.name)) });
    initialsInput.addEventListener('input', () => { draft.avatar = { kind: 'initials', value: initialsInput.value }; refresh(); });
    const emojiGrid = h('div', { class: 'emoji-grid', role: 'group', 'aria-label': 'Choose an emoji' }, EMOJI_CHOICES.map((em) =>
      h('button', { type: 'button', class: 'emoji-btn', 'aria-pressed': String(draft.avatar.kind === 'emoji' && draft.avatar.value === em), 'aria-label': `Use ${em}`, onClick: (e) => {
        draft.avatar = { kind: 'emoji', value: em };
        for (const b of emojiGrid.children) b.setAttribute('aria-pressed', String(b === e.currentTarget));
        refresh();
      } }, em)));
    const fileInput = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp', class: 'file-input', 'aria-label': 'Choose a photo' });
    const fileNote = h('p', { class: 'muted small' }, 'Resized on your device to a small square (under 64 KB).');
    fileInput.addEventListener('change', async () => {
      const f = fileInput.files && fileInput.files[0];
      if (!f) return;
      errorLine.hidden = true;
      try {
        draft.avatar = { kind: 'image', value: await imageFileToAvatar(f) };
        fileNote.textContent = 'Photo ready. Save to keep it.';
        refresh();
      } catch (e) {
        errorLine.textContent = e.message;
        errorLine.hidden = false;
      }
    });
    const kindPanels = {
      google: h('p', { class: 'muted small' }, 'Uses the photo from your Google account.'),
      initials: h('label', { class: 'inline-field' }, h('span', null, 'Letters'), initialsInput),
      emoji: emojiGrid,
      image: h('div', null, fileInput, fileNote),
    };
    const kindPanel = h('div', { class: 'kind-panel' });
    function setKind(k) {
      for (const b of kindButtons) b.setAttribute('aria-pressed', String(b.dataset.kind === k));
      clear(kindPanel);
      kindPanel.append(kindPanels[k]);
      if (k === 'google') draft.avatar = { kind: 'google', value: '' };
      if (k === 'initials') draft.avatar = { kind: 'initials', value: initialsInput.value };
      if (k === 'emoji' && draft.avatar.kind !== 'emoji') draft.avatar = { kind: 'emoji', value: EMOJI_CHOICES[0] };
      if (k === 'image' && draft.avatar.kind !== 'image') { /* waits for a file */ }
      refresh();
    }

    // Accent
    const accentCustom = h('input', { type: 'color', value: draft.accent, 'aria-label': 'Custom accent colour', class: 'color-input' });
    const accentRow = h('div', { class: 'swatches', role: 'group', 'aria-label': 'Accent colour' },
      ACCENTS.map((c) => h('button', { type: 'button', class: 'swatch', style: { '--sw': c }, 'aria-label': `Accent ${c}`, 'aria-pressed': String(draft.accent === c), onClick: (e) => {
        draft.accent = c; accentCustom.value = c;
        for (const b of accentRow.querySelectorAll('.swatch')) b.setAttribute('aria-pressed', String(b === e.currentTarget));
        refresh();
      } })), accentCustom);
    accentCustom.addEventListener('input', () => {
      draft.accent = accentCustom.value;
      for (const b of accentRow.querySelectorAll('.swatch')) b.setAttribute('aria-pressed', 'false');
      refresh();
    });

    // Banner
    const [ba, bb] = bannerStops(draft.banner);
    const bannerA = h('input', { type: 'color', value: ba, class: 'color-input', 'aria-label': 'Banner start colour' });
    const bannerB = h('input', { type: 'color', value: bb, class: 'color-input', 'aria-label': 'Banner end colour' });
    const bannerRow = h('div', { class: 'swatches', role: 'group', 'aria-label': 'Banner' },
      BANNERS.map((b) => h('button', { type: 'button', class: 'swatch swatch-wide', style: { '--banner-a': b.stops[0], '--banner-b': b.stops[1] }, 'aria-label': `${b.label} banner`, title: b.label, 'aria-pressed': String(draft.banner === b.id), onClick: (e) => {
        draft.banner = b.id; bannerA.value = b.stops[0]; bannerB.value = b.stops[1];
        for (const x of bannerRow.querySelectorAll('.swatch')) x.setAttribute('aria-pressed', String(x === e.currentTarget));
        refresh();
      } })),
      h('span', { class: 'custom-gradient' }, bannerA, bannerB));
    const onCustomBanner = () => {
      draft.banner = `${bannerA.value},${bannerB.value}`;
      for (const x of bannerRow.querySelectorAll('.swatch')) x.setAttribute('aria-pressed', 'false');
      refresh();
    };
    bannerA.addEventListener('input', onCustomBanner);
    bannerB.addEventListener('input', onCustomBanner);

    // Featured subjects
    const featuredNote = h('p', { class: 'muted small' });
    const featuredBoxes = indexes.map((idx) => {
      const box = h('input', { type: 'checkbox', value: idx.id, checked: draft.featuredSubjects.includes(idx.id) ? true : null });
      box.addEventListener('change', () => {
        const set = draft.featuredSubjects.filter((k) => k !== idx.id);
        if (box.checked) set.push(idx.id);
        draft.featuredSubjects = set.slice(0, MAX_FEATURED);
        syncFeatured();
        refresh();
      });
      return h('label', { class: 'check' }, box, h('span', null, idx.title));
    });
    function syncFeatured() {
      const n = draft.featuredSubjects.length;
      featuredNote.textContent = `${n} of ${MAX_FEATURED} chosen.`;
      for (const l of featuredBoxes) {
        const b = l.querySelector('input');
        b.disabled = !b.checked && n >= MAX_FEATURED;
      }
    }
    syncFeatured();

    const iqToggle = toggle('Show my Estimated IQ', draft.showIq, (v) => { draft.showIq = v; refresh(); }, { hint: 'Only you see this page for now.' });

    const form = h('form', { class: 'profile-form card', 'aria-label': 'Edit profile', novalidate: true },
      h('h1', { class: 'form-title' }, 'Edit profile'),
      h('div', { class: 'field' }, h('label', { for: 'pf-name' }, 'Display name'), nameInput),
      h('div', { class: 'field' }, h('label', { for: 'pf-bio' }, 'Bio'), bioInput, bioCount),
      h('fieldset', { class: 'field' }, h('legend', null, 'Picture'), h('div', { class: 'seg', role: 'group', 'aria-label': 'Picture type' }, kindButtons), kindPanel),
      h('fieldset', { class: 'field' }, h('legend', null, 'Accent colour'), accentRow),
      h('fieldset', { class: 'field' }, h('legend', null, 'Banner'), bannerRow),
      indexes.length ? h('fieldset', { class: 'field' }, h('legend', null, `Featured subjects (up to ${MAX_FEATURED})`), h('div', { class: 'checks' }, featuredBoxes), featuredNote) : null,
      h('div', { class: 'field' }, iqToggle),
      errorLine,
      h('div', { class: 'form-actions' },
        button('Save profile', { kind: 'primary', type: 'submit', iconName: 'check' }),
        button('Cancel', { kind: 'ghost', onClick: () => { editing = false; drawCard(); cardSlot.scrollIntoView({ block: 'start' }); } })));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      ctx.profileStore.update(normalizeProfile(draft, user));
      editing = false;
      drawCard();
      cardSlot.scrollIntoView({ block: 'start' });
      const editBtn = cardSlot.querySelector('.profile-edit-btn button');
      if (editBtn) editBtn.focus({ preventScroll: true });
      ctx.toast.show({ message: ctx.signedIn ? 'Profile saved to your account.' : 'Profile saved on this device.' });
    });
    setKind(draft.avatar.kind === 'google' && !(user && user.avatarUrl) ? 'initials' : draft.avatar.kind);
    refresh();
    return h('div', { class: 'profile-editing' }, previewSlot, form);
  }

  function drawCard() {
    clear(cardSlot);
    cardSlot.append(editing ? editForm() : profileCard(ctx.profileStore.get()));
    if (editing) { const t = cardSlot.querySelector('#pf-name'); if (t) t.focus(); }
  }

  // ----- plan editor --------------------------------------------------------
  const live = h('p', { class: 'sr-only', 'aria-live': 'polite' });
  const groupsList = h('ol', { class: 'plan-groups', 'aria-label': 'Your Study Plan blocks' });
  const dropZone = h('div', { class: 'plan-drop' }, groupsList);
  const summaryLine = h('p', { class: 'muted small plan-count' });
  const clearSlot = h('div', { class: 'clear-slot' });

  function blocks() { return ctx.planStore.get().blocks; }
  function setBlocks(next, message) {
    ctx.planStore.update({ ...ctx.planStore.get(), blocks: next });
    if (message) live.textContent = message;
  }
  const dnd = createDropList({
    list: groupsList,
    zone: dropZone,
    length: () => blocks().length,
    onDrop(payload, at) {
      if (payload.type === 'new') {
        if (blocks().length >= MAX_BLOCKS) { ctx.toast.show({ message: `A plan can hold up to ${MAX_BLOCKS} blocks.` }); return; }
        setBlocks(insertBlock(blocks(), payload.topicKey, at), `${topicTitle(payload.topicKey).title} added. ${plural(blocks().length + 1, 'block')}.`);
      } else {
        setBlocks(moveRange(blocks(), payload.start, payload.count, at), 'Moved.');
      }
    },
  });
  cleanups.push(() => dnd.destroy());

  function addToEnd(topicKey) {
    if (blocks().length >= MAX_BLOCKS) { ctx.toast.show({ message: `A plan can hold up to ${MAX_BLOCKS} blocks.` }); return; }
    setBlocks(insertBlock(blocks(), topicKey, blocks().length), `${topicTitle(topicKey).title} added. ${plural(blocks().length + 1, 'block')}.`);
  }

  function paletteChip(topicKey, label, color, { small = false } = {}) {
    const grip = h('span', { class: 'chip-grip', 'aria-hidden': 'true' }, icon('grip'));
    const chip = h('button', {
      type: 'button',
      class: `palette-chip${small ? ' is-small' : ''}`,
      style: { '--subject': color },
      'aria-label': `Add ${label} to the plan`,
      title: 'Drag into your plan, or click to add at the end',
      onClick: () => addToEnd(topicKey),
    }, grip, h('span', { class: 'dot', 'aria-hidden': 'true' }), h('span', null, label), icon('plus', 'chip-plus'));
    chip.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' && !grip.contains(e.target)) return; // touch: drag from the grip, tap to add
      dnd.startDrag(e, chip, { type: 'new', topicKey });
    });
    return chip;
  }

  function drawPalette() {
    const items = [];
    for (const idx of indexes) {
      const topics = idx.nodes.get(idx.id).childKeys.map((k) => idx.nodes.get(k));
      const topicList = h('div', { class: 'palette-topics', hidden: true },
        topics.map((t) => paletteChip(t.key, t.title, idx.color, { small: true })));
      const more = topics.length ? h('button', {
        type: 'button', class: 'link-btn palette-more', 'aria-expanded': 'false',
        onClick: (e) => {
          const open = topicList.hidden;
          topicList.hidden = !open;
          e.currentTarget.setAttribute('aria-expanded', String(open));
          e.currentTarget.textContent = open ? 'Hide topics' : `${plural(topics.length, 'topic')}`;
        },
      }, `${plural(topics.length, 'topic')}`) : null;
      items.push(h('div', { class: 'palette-item' }, h('div', { class: 'palette-row' }, paletteChip(idx.id, idx.title, idx.color), more), topicList));
    }
    return h('div', { class: 'palette', role: 'group', 'aria-label': 'Subjects you can add' },
      items.length ? items : h('p', { class: 'muted' }, 'Subjects will appear here once they are published.'));
  }

  // Keyboard users keep their place: the list is rebuilt on every change, so focus
  // returns to the same button of the same topic (or its drag handle when that
  // button is now disabled or gone, e.g. "Move up" on what became the first row).
  function drawGroups() {
    const active = document.activeElement;
    const fid = active && groupsList.contains(active) ? active.dataset.fid || '' : '';
    renderGroups();
    if (!fid) return;
    const topic = fid.slice(fid.indexOf(':') + 1);
    const pick = (f) => groupsList.querySelector(`[data-fid="${CSS.escape(f)}"]`);
    const target = [pick(fid), pick(`grip:${topic}`), groupsList.querySelector('.grip-btn'), editorSlot.querySelector('.palette-chip')]
      .find((el) => el && !el.disabled);
    if (target) target.focus({ preventScroll: true });
  }

  function renderGroups() {
    clear(groupsList);
    const list = blocks();
    const groups = groupBlocks(list);
    const progress = ctx.store.all();
    let minutes = 0;
    groups.forEach((g, gi) => {
      const t = topicTitle(g.topicKey);
      if (t.idx && t.node) {
        const k = knowledge(t.idx, g.topicKey, progress);
        minutes += Math.round((k.total ? k.minutesTotal / k.total : 0) * g.count);
      }
      const handle = h('button', { type: 'button', class: 'grip-btn', 'aria-label': `Drag ${t.title} to reorder`, title: 'Drag to reorder', 'data-fid': `grip:${g.topicKey}` }, icon('grip'));
      const fid = (a) => `${a}:${g.topicKey}`;
      const row = h('li', { class: 'plan-group', style: { '--subject': t.color }, dataset: { start: String(g.start), count: String(g.count) } },
        handle,
        h('span', { class: 'dot', 'aria-hidden': 'true' }),
        h('div', { class: 'group-text' },
          h('p', { class: 'group-title' }, t.title, g.count > 1 ? h('span', { class: 'times' }, ` ×${g.count}`) : null),
          !t.isSubject ? h('p', { class: 'muted small' }, t.subject) : null),
        h('div', { class: 'group-tools' },
          iconButton('minus', `One less ${t.title} block`, { 'data-fid': fid('less'), onClick: () => setBlocks(removeRange(blocks(), g.start + g.count - 1, 1), `${t.title}: ${plural(g.count - 1, 'block')}.`) }),
          h('span', { class: 'count', 'aria-hidden': 'true' }, String(g.count)),
          iconButton('plus', `One more ${t.title} block`, { 'data-fid': fid('more'), onClick: () => { if (blocks().length < MAX_BLOCKS) setBlocks(insertBlock(blocks(), g.topicKey, g.start + g.count), `${t.title}: ${plural(g.count + 1, 'block')}.`); } }),
          iconButton('up', `Move ${t.title} up`, { 'data-fid': fid('up'), disabled: gi === 0 ? true : null, onClick: () => setBlocks(moveGroup(blocks(), gi, -1), `${t.title} moved up.`) }),
          iconButton('down', `Move ${t.title} down`, { 'data-fid': fid('down'), disabled: gi === groups.length - 1 ? true : null, onClick: () => setBlocks(moveGroup(blocks(), gi, 1), `${t.title} moved down.`) }),
          iconButton('close', `Remove ${t.title}`, { 'data-fid': fid('rm'), className: 'danger', onClick: () => setBlocks(removeRange(blocks(), g.start, g.count), `${t.title} removed.`) })));
      handle.addEventListener('pointerdown', (e) => dnd.startDrag(e, row, { type: 'move', start: g.start, count: g.count }));
      groupsList.append(row);
    });
    if (!groups.length) {
      groupsList.append(h('li', { class: 'drop-empty' }, icon('plus'), 'Drag subjects here, or click one above.'));
    }
    summaryLine.textContent = list.length ? `${plural(list.length, 'block')} · about ${formatMinutes(minutes)} · each block plays one page` : 'No blocks yet.';
    drawClear(false);
  }

  function drawClear(confirming) {
    clear(clearSlot);
    if (!blocks().length) return;
    if (!confirming) {
      clearSlot.append(button('Clear plan', { kind: 'ghost', iconName: 'reset', onClick: () => drawClear(true) }));
    } else {
      clearSlot.append(h('div', { class: 'confirm-inline', role: 'group', 'aria-label': 'Confirm clearing the plan' },
        h('span', null, 'Remove every block?'),
        button('Clear', { kind: 'danger', onClick: () => {
          setBlocks([], 'Plan cleared.');
          ctx.planRun.stop();
          const chip = editorSlot.querySelector('.palette-chip');
          if (chip) chip.focus({ preventScroll: true });
        } }),
        button('Keep', { kind: 'ghost', onClick: () => drawClear(false) })));
      clearSlot.querySelector('.btn-danger').focus();
    }
  }

  editorSlot.append(
    h('div', { class: 'plan-editor-head' },
      h('div', null,
        h('h2', { id: 'plan-h' }, 'Study Plan'),
        h('p', { class: 'muted' }, 'Drag subjects or topics into your plan in the order you want them. Each block plays one page: three Biology blocks then one Economics block plays three Biology pages, then one Economics page.')),
      button('Play plan', { kind: 'primary', iconName: 'play', onClick: () => ctx.startPlan() })),
    drawPalette(),
    h('div', { class: 'plan-list-head' }, h('h3', { class: 'small-h' }, 'Your blocks'), summaryLine),
    dropZone,
    h('div', { class: 'plan-editor-foot' }, linkButton('Open the Study Plan tab', href.plan(), { kind: 'ghost', iconName: 'calendar' }), clearSlot),
    live);

  drawCard();
  drawGroups();
  cleanups.push(ctx.planStore.subscribe(() => { if (!dnd.dragging) drawGroups(); }));
  cleanups.push(ctx.profileStore.subscribe(() => { if (!editing) drawCard(); }));
  cleanups.push(ctx.store.subscribe(() => { if (!editing) drawCard(); }));
  let authSig = '';
  cleanups.push(ctx.sync.subscribe((st) => {
    const sig = `${st.available}|${st.signedIn}|${st.user && st.user.email}`;
    if (sig !== authSig && !editing) { authSig = sig; drawCard(); }
  }));

  return {
    el,
    title: 'Profile',
    onMount() {
      if (ctx.scrollToPlanEditor) {
        ctx.scrollToPlanEditor = false;
        editorSlot.scrollIntoView({ block: 'start' });
      }
    },
    cleanup: () => cleanups.forEach((fn) => fn()),
  };
}
