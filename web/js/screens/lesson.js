// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Lesson player (#/l/<lessonKey>).
// - Mode Audio / Text / Both (remembered in prefs).
// - Audio: the lesson MP3, or the browser's speechSynthesis when there is no
//   recording (said plainly on screen). Play/pause, ±15 s, restart, speed,
//   scrubber, time, Media Session (lock screen), keyboard shortcuts.
// - "Already Known" at the top and "Mark as known" under the text set `known`
//   and advance. Audio ending sets `completed` and, with autoplay on, plays the
//   next page. Text mode: reaching the end and pressing Next/Mark complete
//   sets `completed`.
// - Audio position is saved every 5 s while playing so "Continue" resumes mid-page.
// - Once the player card scrolls out of view (Audio or Both mode), a slim
//   mini-player docks at the bottom with play/pause, progress and a skip-as-known.
// - The recording's voice is credited under the player (js/credits.js).
// - Inside a Study Plan run the next page comes from the plan instead of the path.

import { h, clear, formatTime, formatMinutes, isTypingTarget } from '../dom.js';
import { icon, STATUS_LABEL, STATUS_ICON } from '../icons.js';
import { button, iconButton, breadcrumbs, errorState, toggle } from '../components.js';
import { href } from '../router.js';
import { getSubject, getLesson, safeAudioPath } from '../data.js';
import { neighbor, topicOfLesson, lessonOrdinal } from '../tree.js';
import { renderMarkdown, speechBlocks, chunkForSpeech } from '../markdown.js';
import { createAudioEngine, createSpeechEngine, speechSupported } from '../player.js';
import { RATES } from '../prefs.js';
import { renderNotFound } from './notfound.js';
import { voiceLine } from '../credits.js';

const SAVE_EVERY_MS = 5000;
const MODES = [
  { id: 'audio', label: 'Audio', icon: 'headphones' },
  { id: 'text', label: 'Text', icon: 'book' },
  { id: 'both', label: 'Both', icon: 'both' },
];

export async function renderLesson(ctx, route) {
  let index;
  try {
    index = await getSubject(route.subjectId);
  } catch (e) {
    return renderNotFound(ctx, route, e);
  }
  const meta = index.lessons.get(route.lessonKey);
  if (!meta) return renderNotFound(ctx, route);
  const key = meta.key;
  const topicKey = topicOfLesson(index, key);
  ctx.kbar.show(index, topicKey);

  const prevKey = neighbor(index, key, -1);
  const nextKey = neighbor(index, key, +1);
  const parent = index.nodes.get(meta.parentKey);
  const ordinal = lessonOrdinal(index, key);
  const planCur = ctx.planRun.current();
  let inPlan = !!planCur && planCur.key === key; // false again after "Stop plan"

  let lesson = null;
  let loadError = null;
  if (meta.hasText) {
    try { lesson = await getLesson(key); } catch (e) { loadError = e; }
  }

  const cleanups = [];
  const prefs = ctx.prefs.get();
  let engine = null;
  let unbindEngine = null;
  let finished = false;
  let readToEnd = false;
  let openedWithAutoplay = false;
  let lastSave = 0;

  // ----- header -------------------------------------------------------------
  const crumbs = [{ label: 'Subjects', href: href.catalog() }];
  for (const nk of meta.trail) crumbs.push({ label: index.nodes.get(nk).title, href: href.topic(nk) });

  const statusChip = h('span', { class: 'status-chip' });
  function drawStatus() {
    clear(statusChip);
    const s = ctx.store.status(key) || 'none';
    statusChip.className = `status-chip status-${s}`;
    statusChip.append(icon(STATUS_ICON[s]), h('span', null, STATUS_LABEL[s]));
    if (completeBtn) {
      const done = s === 'completed';
      completeBtn.disabled = done;
      completeBtn.querySelector('.btn-label').textContent = done ? 'Completed' : 'Mark complete';
    }
  }

  const knownTop = button('Already Known', {
    kind: 'known', iconName: 'skip', 'aria-keyshortcuts': 'k',
    title: 'Mark this page as known and go to the next one (K)',
    onClick: () => markKnownAndAdvance(),
  });

  const planStrip = inPlan ? h('div', { class: 'plan-strip', role: 'region', 'aria-label': 'Study Plan' },
    icon('calendar'),
    h('p', null, h('strong', null, 'Study Plan'), ` · block ${planCur.index + 1} of ${planCur.total}`),
    h('div', { class: 'row gap-sm' },
      button('Skip block', { kind: 'ghost', iconName: 'skip', onClick: () => skipBlock() }),
      button('Stop plan', {
        kind: 'ghost', iconName: 'close',
        onClick: () => {
          ctx.planRun.stop();
          inPlan = false;
          planStrip.remove();
          buildNav();
          drawStatus();
          ctx.toast.show({ message: 'Study Plan stopped. Pick it up again from the Study Plan tab.' });
        },
      }),
    )) : null;

  const head = h('header', { class: 'lesson-head' },
    breadcrumbs(crumbs),
    h('div', { class: 'lesson-title-row' },
      h('div', { class: 'lesson-title-text' },
        h('p', { class: 'eyebrow' }, ordinal.n ? `Page ${ordinal.n} of ${ordinal.of}` : 'Page', ' · ', formatMinutes(meta.minutes)),
        h('h1', null, (lesson && lesson.title) || meta.title),
        statusChip),
      meta.hasText && !loadError ? knownTop : null));

  // ----- not ready / failed -------------------------------------------------
  const navBar = h('nav', { class: 'lesson-nav', 'aria-label': 'Page navigation' });
  let completeBtn = null;

  function buildNav() {
    clear(navBar);
    navBar.append(
      prevKey
        ? h('a', { class: 'btn btn-ghost nav-prev', href: href.lesson(prevKey), 'aria-label': `Previous page: ${index.lessons.get(prevKey).title}` }, icon('prev'), h('span', { class: 'btn-label' }, 'Previous'))
        : h('span', { class: 'nav-spacer' }),
      meta.hasText && !loadError ? (completeBtn = button('Mark complete', { kind: 'secondary', iconName: 'check', onClick: () => markComplete() })) : null,
      (inPlan || nextKey)
        ? button(inPlan ? 'Next block' : 'Next', {
          kind: 'primary', class: 'btn btn-primary nav-next', iconName: 'next', iconAfter: true,
          'aria-label': inPlan ? 'Next Study Plan block' : `Next page: ${index.lessons.get(nextKey).title}`,
          onClick: () => onNextClick(),
        })
        : h('a', { class: 'btn btn-secondary nav-next', href: href.topic(topicKey || index.id) }, h('span', { class: 'btn-label' }, 'Back to topic')),
    );
  }
  buildNav();

  if (!meta.hasText || loadError) {
    const el = h('div', { class: 'wrap lesson', style: { '--subject': index.color } },
      planStrip, head,
      !meta.hasText
        ? h('section', { class: 'state soon-state' }, icon('sparkle'),
          h('p', { class: 'state-title' }, 'This page is coming soon.'),
          h('p', { class: 'muted' }, 'It is being written and recorded. The pages around it are ready.'))
        : errorState('This page could not be loaded. Check your connection and try again.', {
          onRetry: () => ctx.navigate(href.lesson(key), { replace: true }),
          backHref: href.topic(topicKey || index.id), backLabel: 'Back to topic',
        }),
      navBar);
    drawStatus();
    return { el, title: meta.title, cleanup: () => {} };
  }

  // ----- mode toggle --------------------------------------------------------
  let mode = prefs.mode;
  const modeButtons = MODES.map((m) => h('button', {
    type: 'button', class: 'seg-btn', 'aria-pressed': String(m.id === mode), dataset: { mode: m.id },
    onClick: () => setMode(m.id),
  }, icon(m.icon), h('span', null, m.label)));
  const modeBar = h('div', { class: 'seg', role: 'group', 'aria-label': 'Show as' }, modeButtons);

  // ----- player -------------------------------------------------------------
  const audioPath = safeAudioPath(lesson.audio);
  const canSpeak = speechSupported();
  const chunks = chunkForSpeech(speechBlocks(lesson.markdown || ''));

  const playBtn = h('button', { type: 'button', class: 'play-btn', 'aria-label': 'Play', 'aria-keyshortcuts': 'Space' }, icon('play'));
  const timeCur = h('span', { class: 'time time-cur' }, '0:00');
  const timeDur = h('span', { class: 'time time-dur' }, '–:––');
  const scrub = h('input', { type: 'range', class: 'scrub', min: '0', max: '100', step: '1', value: '0', 'aria-label': 'Position' });
  const restartBtn = iconButton('restart', 'Restart from the beginning');
  const backBtn = iconButton('back15', 'Back 15 seconds', { 'aria-keyshortcuts': 'ArrowLeft' });
  const fwdBtn = iconButton('fwd15', 'Forward 15 seconds', { 'aria-keyshortcuts': 'ArrowRight' });
  const rateSel = h('select', { class: 'rate', 'aria-label': 'Playback speed' },
    RATES.map((r) => h('option', { value: String(r), selected: r === prefs.rate ? true : null }, `${r}×`)));
  const sourceNote = h('p', { class: 'source-note', role: 'note' });
  const resumeNote = h('p', { class: 'resume-note', hidden: true });
  const autoplayToggle = toggle('Autoplay next page', ctx.prefs.get().autoplayNext, (v) => ctx.prefs.set({ autoplayNext: v }));
  const credit = audioPath && lesson.voice
    ? h('p', { class: 'voice-credit' }, icon('speaker'), h('span', null, voiceLine(lesson.voice), ' · '), h('a', { href: `${href.about()}?credits` }, 'Credits'))
    : null;

  const controls = h('div', { class: 'controls' },
    h('div', { class: 'scrub-row' }, timeCur, scrub, timeDur),
    h('div', { class: 'button-row' }, restartBtn, backBtn, playBtn, fwdBtn,
      h('label', { class: 'rate-wrap' }, h('span', { class: 'sr-only' }, 'Speed'), rateSel)));

  const playerCard = h('section', { class: 'player card', 'aria-label': 'Audio player' },
    sourceNote, controls, resumeNote,
    h('div', { class: 'player-foot' }, autoplayToggle, credit,
      h('details', { class: 'keys' },
        h('summary', null, icon('keyboard'), h('span', null, 'Shortcuts')),
        h('ul', null,
          h('li', null, h('kbd', null, 'Space'), ' play or pause'),
          h('li', null, h('kbd', null, '←'), ' ', h('kbd', null, '→'), ' back or forward 15 seconds'),
          h('li', null, h('kbd', null, 'K'), ' already known, next page')))));

  // ----- text ---------------------------------------------------------------
  const article = h('article', { class: 'prose', lang: 'en' });
  article.innerHTML = renderMarkdown(lesson.markdown || '', { shiftHeadings: 1, dropTitle: true }); // escaped by renderMarkdown
  const sentinel = h('div', { class: 'end-sentinel', 'aria-hidden': 'true' });
  const knownBottom = button('Mark as known', { kind: 'known', iconName: 'skip', onClick: () => markKnownAndAdvance() });
  const textEnd = h('div', { class: 'text-end' },
    h('p', { class: 'muted' }, 'End of page.'),
    h('div', { class: 'row gap' }, knownBottom,
      (inPlan || nextKey) ? button('Next page', { kind: 'secondary', iconName: 'next', iconAfter: true, onClick: () => onNextClick() }) : null));
  const textSection = h('section', { class: 'text card', 'aria-label': 'Lesson text' }, article, sentinel, textEnd);

  // ----- mini-player (docks at the bottom once the player card scrolls away) --
  const miniPlay = h('button', { type: 'button', class: 'mini-play', 'aria-label': 'Play' }, icon('play'));
  const miniFill = h('div', { class: 'mini-fill' });
  const miniTime = h('span', { class: 'mini-time' }, '');
  const miniKnown = h('button', {
    type: 'button', class: 'mini-known', 'aria-label': 'Mark known and skip to the next page', title: 'Mark known and skip to the next page (K)',
    onClick: () => markKnownAndAdvance(),
  }, icon('skip'), h('span', { class: 'mini-known-label', 'aria-hidden': 'true' }, 'Known'));
  const mini = h('div', { class: 'mini-player', role: 'region', 'aria-label': 'Now playing', hidden: true, style: { '--subject': index.color } },
    h('div', { class: 'mini-track', 'aria-hidden': 'true' }, miniFill),
    h('div', { class: 'wrap mini-inner' },
      miniPlay,
      h('div', { class: 'mini-text' },
        h('p', { class: 'mini-title' }, (lesson && lesson.title) || meta.title),
        h('p', { class: 'mini-sub' }, index.title, ' · ', miniTime)),
      miniKnown));
  miniPlay.addEventListener('click', () => engine && engine.toggle());
  let playerOffscreen = false;
  function drawMini() {
    const show = playerOffscreen && mode !== 'text' && !!engine && !controls.hidden;
    mini.hidden = !show;
    document.body.classList.toggle('has-mini', show);
  }

  const el = h('div', { class: 'wrap lesson', style: { '--subject': index.color } },
    planStrip, head, modeBar, playerCard, textSection, navBar, mini);

  const ms = 'mediaSession' in navigator ? navigator.mediaSession : null;

  // ----- engine wiring ------------------------------------------------------
  function setSourceNote(kind, extra) {
    clear(sourceNote);
    if (kind === 'audio') {
      sourceNote.hidden = true;
      return;
    }
    sourceNote.hidden = false;
    if (kind === 'speech') {
      sourceNote.append(icon('speaker'), h('span', null, extra || 'No recording yet. Your browser’s built-in voice reads this page, so it may sound robotic.'));
    } else {
      sourceNote.append(icon('info'), h('span', null, 'Audio is not available for this page yet. Switch to Text to read it.'));
    }
  }

  function updateControls() {
    if (!engine) return;
    const playing = !engine.paused;
    playBtn.replaceChildren(icon(playing ? 'pause' : 'play'));
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    playBtn.classList.toggle('is-playing', playing);
    playBtn.classList.toggle('is-buffering', engine.buffering);
    const d = engine.duration;
    const t = engine.currentTime;
    if (!scrubbing) {
      scrub.max = String(Math.max(1, Math.round(d)));
      scrub.value = String(Math.round(t));
      timeCur.textContent = (engine.kind === 'speech' ? '≈ ' : '') + formatTime(t);
    }
    timeDur.textContent = d ? (engine.kind === 'speech' ? '≈ ' : '') + formatTime(d) : '–:––';
    scrub.setAttribute('aria-valuetext', `${formatTime(t)} of ${d ? formatTime(d) : 'unknown'}`);
    scrub.style.setProperty('--fill', d ? `${Math.min(100, (t / d) * 100)}%` : '0%');
    miniPlay.replaceChildren(icon(playing ? 'pause' : 'play'));
    miniPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    miniFill.style.width = d ? `${Math.min(100, (t / d) * 100)}%` : '0%';
    miniTime.textContent = `${engine.kind === 'speech' ? '≈ ' : ''}${formatTime(t)}${d ? ` / ${formatTime(d)}` : ''}`;
    updateMediaSession();
  }

  let scrubbing = false;
  scrub.addEventListener('input', () => {
    scrubbing = true;
    timeCur.textContent = formatTime(Number(scrub.value));
    scrub.style.setProperty('--fill', `${(Number(scrub.value) / Math.max(1, Number(scrub.max))) * 100}%`);
  });
  scrub.addEventListener('change', () => {
    scrubbing = false;
    if (engine) engine.seekTo(Number(scrub.value));
  });

  playBtn.addEventListener('click', () => engine && engine.toggle());
  restartBtn.addEventListener('click', () => { if (engine) { engine.restart(); resumeNote.hidden = true; } });
  backBtn.addEventListener('click', () => engine && engine.seekBy(-15));
  fwdBtn.addEventListener('click', () => engine && engine.seekBy(15));
  rateSel.addEventListener('change', () => {
    const r = Number(rateSel.value);
    ctx.prefs.set({ rate: r });
    if (engine) engine.setRate(r);
  });

  function savePosition(force = false) {
    if (!engine || finished) return;
    const now = Date.now();
    if (!force && now - lastSave < SAVE_EVERY_MS) return;
    lastSave = now;
    const t = engine.currentTime;
    if (t > 1) ctx.store.savePosition(key, t);
  }

  function bind(e) {
    if (unbindEngine) unbindEngine();
    engine = e;
    const offs = [
      e.on('state', () => {
        updateControls();
        if (!e.paused) ctx.store.markStarted(key);
        else savePosition(true);
      }),
      e.on('time', () => { updateControls(); if (!e.paused) savePosition(); }),
      e.on('ended', () => onFinished()),
      e.on('blocked', () => { updateControls(); }),
      e.on('error', (err) => {
        if (e.kind === 'audio' && canSpeak) {
          const wasAt = e.currentTime;
          e.destroy();
          bind(createSpeechEngine(chunks, { rate: ctx.prefs.get().rate }));
          setSourceNote('speech', 'The recording could not be loaded, so your browser’s built-in voice reads this page instead.');
          if (wasAt > 0) engine.seekTo(wasAt);
        } else if (e.kind === 'speech') {
          // Blocked (no user gesture yet) or stalled: keep the controls so Play can retry.
          const code = err && err.error;
          setSourceNote('speech', code === 'not-allowed'
            ? 'Press play to start your browser’s built-in voice for this page.'
            : 'Your browser’s built-in voice stopped responding. Press play to try again, or switch to Text to read this page.');
          updateControls();
        } else {
          setSourceNote('none');
          controls.hidden = true;
          drawMini();
        }
      }),
    ];
    if (e.kind === 'audio') {
      offs.push(e.on('ready', () => applyResume()));
    }
    unbindEngine = () => offs.forEach((off) => off());
    updateControls();
  }

  function applyResume() {
    const rec = ctx.store.get(key);
    if (!rec || rec.status !== 'in_progress' || rec.position < 4) return;
    const d = engine.duration;
    if (d && rec.position > d - 5) return;
    engine.seekTo(Math.max(0, rec.position - 2));
    resumeNote.hidden = false;
    clear(resumeNote);
    resumeNote.append(`Picking up where you left off, at ${formatTime(rec.position)}. `,
      h('button', { type: 'button', class: 'link-btn', onClick: () => { engine.seekTo(0); resumeNote.hidden = true; } }, 'Start from the beginning'));
  }

  if (audioPath) {
    setSourceNote('audio');
    bind(createAudioEngine(audioPath, { rate: prefs.rate }));
  } else if (canSpeak && chunks.length) {
    setSourceNote('speech');
    bind(createSpeechEngine(chunks, { rate: prefs.rate }));
    applyResume();
  } else {
    setSourceNote('none');
    controls.hidden = true;
  }

  // ----- mode ---------------------------------------------------------------
  function setMode(m, { persist = true } = {}) {
    mode = m;
    if (persist) ctx.prefs.set({ mode: m });
    for (const b of modeButtons) b.setAttribute('aria-pressed', String(b.dataset.mode === m));
    playerCard.hidden = m === 'text';
    textSection.hidden = m === 'audio';
    if (m === 'text' && engine && !engine.paused) engine.pause();
    drawMini();
  }
  setMode(mode, { persist: false });

  if ('IntersectionObserver' in window) {
    const pio = new IntersectionObserver((entries) => {
      for (const en of entries) playerOffscreen = !en.isIntersecting && en.boundingClientRect.top < 0;
      drawMini();
    });
    pio.observe(playerCard);
    cleanups.push(() => pio.disconnect());
  }
  cleanups.push(() => document.body.classList.remove('has-mini'));

  // Reaching the end of the text (text or both mode).
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting && !textSection.hidden) readToEnd = true;
    });
    io.observe(sentinel);
    cleanups.push(() => io.disconnect());
  } else {
    readToEnd = true;
  }

  // ----- actions ------------------------------------------------------------
  async function goNext({ autoplay }) {
    if (inPlan) {
      const nk = await ctx.planRun.advance();
      if (nk) { ctx.navigate(href.lesson(nk), { autoplay: true }); return; }
      ctx.toast.show({ message: 'Study Plan finished. Well done.' });
      ctx.navigate(href.plan());
      return;
    }
    if (nextKey) { ctx.navigate(href.lesson(nextKey), { autoplay }); return; }
    const where = topicKey ? index.nodes.get(topicKey).title : index.title;
    ctx.toast.show({ message: `You reached the end of “${where}”.` });
    ctx.navigate(href.topic(topicKey || index.id));
  }

  function wantsAutoplay() {
    return mode !== 'text' && !!engine && (!engine.paused || openedWithAutoplay);
  }

  function markKnownAndAdvance() {
    const autoplay = wantsAutoplay();
    if (engine) engine.pause();
    finished = true;
    const title = (lesson && lesson.title) || meta.title;
    ctx.setStatusWithUndo([key], 'known', {
      message: `“${title}” marked as known.`,
      undoMessage: `“${title}” is back the way it was.`,
      onUndo: () => ctx.navigate(href.lesson(key)),
    });
    goNext({ autoplay });
  }

  function markComplete() {
    if (ctx.store.status(key) === 'completed') return;
    const title = (lesson && lesson.title) || meta.title;
    ctx.setStatusWithUndo([key], 'completed', { message: `“${title}” marked complete.`, undoMessage: 'Undone.' });
  }

  function onNextClick() {
    const autoplay = wantsAutoplay();
    if (mode !== 'audio' && readToEnd && !ctx.isDone(ctx.store.status(key))) {
      finished = true;
      ctx.store.setStatus(key, 'completed');
    } else {
      savePosition(true);
    }
    if (engine) engine.pause();
    goNext({ autoplay });
  }

  async function skipBlock() {
    if (engine) engine.pause();
    savePosition(true);
    const nk = await ctx.planRun.advance();
    if (nk) ctx.navigate(href.lesson(nk), { autoplay: true });
    else { ctx.toast.show({ message: 'That was the last block in your Study Plan.' }); ctx.navigate(href.plan()); }
  }

  function onFinished() {
    if (finished) return;
    finished = true;
    if (!ctx.isDone(ctx.store.status(key)) || ctx.store.status(key) === 'known') ctx.store.setStatus(key, 'completed');
    if (inPlan || ctx.prefs.get().autoplayNext) {
      goNext({ autoplay: true });
    } else {
      ctx.toast.show({ message: 'Page complete.' });
    }
  }

  // ----- media session ------------------------------------------------------
  function setupMediaSession() {
    if (!ms || !engine) return;
    try {
      ms.metadata = new MediaMetadata({
        title: (lesson && lesson.title) || meta.title,
        artist: `Subject Mastery · ${index.title}`,
        album: parent && parent.key !== index.id ? parent.title : index.title,
        artwork: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      });
    } catch { /* MediaMetadata missing */ }
    const set = (action, fn) => { try { ms.setActionHandler(action, fn); } catch { /* unsupported action */ } };
    set('play', () => engine && engine.play());
    set('pause', () => engine && engine.pause());
    set('stop', () => engine && engine.pause());
    set('seekbackward', (d) => engine && engine.seekBy(-((d && d.seekOffset) || 15)));
    set('seekforward', (d) => engine && engine.seekBy((d && d.seekOffset) || 15));
    set('seekto', (d) => { if (engine && d && Number.isFinite(d.seekTime)) engine.seekTo(d.seekTime); });
    set('previoustrack', prevKey ? () => ctx.navigate(href.lesson(prevKey), { autoplay: true }) : null);
    set('nexttrack', (inPlan || nextKey) ? () => onNextClick() : null);
    cleanups.push(() => {
      for (const a of ['play', 'pause', 'stop', 'seekbackward', 'seekforward', 'seekto', 'previoustrack', 'nexttrack']) set(a, null);
      try { ms.playbackState = 'none'; } catch { /* ignore */ }
    });
  }
  function updateMediaSession() {
    if (!ms || !engine) return;
    try { ms.playbackState = engine.paused ? 'paused' : 'playing'; } catch { /* ignore */ }
    if (engine.kind === 'audio' && engine.duration && ms.setPositionState) {
      try {
        ms.setPositionState({ duration: engine.duration, position: Math.min(engine.currentTime, engine.duration), playbackRate: engine.rate || 1 });
      } catch { /* ignore */ }
    }
  }

  // ----- keyboard -----------------------------------------------------------
  function onKey(e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if (isTypingTarget(e.target)) return;
    const t = e.target instanceof Element ? e.target : null;
    if (e.key === ' ' || e.code === 'Space') {
      if (t && t.closest('button, a, summary, input, select, [role="switch"]')) return;
      if (!engine || mode === 'text') return;
      e.preventDefault();
      engine.toggle();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      if (t && t.closest('input, select')) return;
      if (!engine || mode === 'text') return;
      e.preventDefault();
      engine.seekBy(e.key === 'ArrowLeft' ? -15 : 15);
    } else if ((e.key === 'k' || e.key === 'K') && !e.shiftKey) {
      e.preventDefault();
      markKnownAndAdvance();
    }
  }
  document.addEventListener('keydown', onKey);
  cleanups.push(() => document.removeEventListener('keydown', onKey));

  const unsubStore = ctx.store.subscribe((keys) => { if (keys.includes(key)) drawStatus(); });
  cleanups.push(unsubStore);
  drawStatus();

  const onHide = () => savePosition(true);
  window.addEventListener('pagehide', onHide);
  cleanups.push(() => window.removeEventListener('pagehide', onHide));

  return {
    el,
    title: (lesson && lesson.title) || meta.title,
    onMount() {
      setupMediaSession();
      if (ctx.pendingAutoplay === key) {
        ctx.pendingAutoplay = null;
        openedWithAutoplay = true;
        if (engine && mode !== 'text') engine.play();
      }
      if (mode !== 'audio') ctx.store.markStarted(key);
    },
    cleanup() {
      savePosition(true);
      if (unbindEngine) unbindEngine();
      if (engine) engine.destroy();
      engine = null;
      cleanups.forEach((fn) => { try { fn(); } catch { /* ignore */ } });
    },
  };
}
