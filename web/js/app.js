// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// App shell: wires the stores and sync engines, renders the header/tab bar,
// the sticky knowledge bar and toasts, and routes hash changes to screens.
// Screens live in js/screens/*.js and receive the shared `ctx` built here.

import { h, clear } from './dom.js';
import { icon } from './icons.js';
import { avatar } from './components.js';
import { parseRoute, href } from './router.js';
import { createProgressStore, createSync, PROGRESS_KEY, safeLocalStorage, isDone, apiProbeAllowed, API_SWITCH_KEY } from './progress.js';
import { createPrefs, PREFS_KEY } from './prefs.js';
import { createDocStore, createDocSync } from './docsync.js';
import { normalizeProfile, PROFILE_KEY } from './profile.js';
import { normalizePlan, nextAssignment, PLAN_KEY, PLAN_RUN_KEY } from './plan.js';
import { knowledge, resumeKey, subjectOf } from './tree.js';
import { getCatalog, getSubject } from './data.js';

import { renderCatalog } from './screens/catalog.js';
import { renderTopic } from './screens/topic.js';
import { renderLesson } from './screens/lesson.js';
import { renderPlanTab } from './screens/plan-tab.js';
import { renderProfile } from './screens/profile-page.js';
import { renderAccount } from './screens/account.js';
import { renderNotFound } from './screens/notfound.js';
import { renderAbout } from './screens/about.js';

const UNDO_MS = 10000;
const RETURN_ROUTE_KEY = 'sm.returnRoute';

// ---------------------------------------------------------------------------
// Stores and sync
// ---------------------------------------------------------------------------

const storage = safeLocalStorage();
const store = createProgressStore({ storage });
const prefs = createPrefs(storage);

// Is there a site API to ask? (progress.js apiProbeAllowed). `?api=on|off` sets a
// sticky developer switch, e.g. to test sign-in under `wrangler pages dev` on 127.0.0.1.
function apiSwitch() {
  const q = new URLSearchParams(location.search).get('api');
  try {
    if (q === 'on' || q === 'off') storage && storage.setItem(API_SWITCH_KEY, q);
    if (q === 'auto') storage && storage.removeItem(API_SWITCH_KEY);
    return (storage && storage.getItem(API_SWITCH_KEY)) || '';
  } catch { return ''; }
}
const metaApi = document.querySelector('meta[name="sm-api"]');
const probe = apiProbeAllowed({
  protocol: location.protocol,
  hostname: location.hostname,
  meta: metaApi ? metaApi.getAttribute('content') : '',
  override: apiSwitch(),
});
const sync = createSync({ store, storage, probe });

let currentUser = null;
// A profile nobody has edited yet (updatedAt 0) is re-derived from the signed-in
// user, so a new Google user starts with their name and Google photo.
const profileStore = createDocStore({ storage, key: PROFILE_KEY, normalize: (p) => normalizeProfile(p && p.updatedAt ? p : null, currentUser) });
const planStore = createDocStore({ storage, key: PLAN_KEY, normalize: normalizePlan });
const profileSync = createDocSync({ name: 'profile', store: profileStore });
const planSync = createDocSync({ name: 'plan', store: planStore });

function session() {
  try { return globalThis.sessionStorage || null; } catch { return null; }
}

/** Sign-in link. In production this is exactly /api/auth/oauth/google?return_to=/subjectmastery/ */
function signInUrl() {
  const path = /^\/[A-Za-z0-9/_-]*$/.test(location.pathname) ? location.pathname : '/subjectmastery/';
  return `/api/auth/oauth/google?return_to=${path}`;
}

// ---------------------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------------------

function createToaster(root) {
  let current = null;
  function dismiss() {
    if (!current) return;
    const c = current;
    current = null;
    clearTimeout(c.timer);
    c.el.classList.add('toast-leave');
    setTimeout(() => c.el.remove(), 180);
    if (c.onExpire) c.onExpire();
  }
  function show({ message, action, duration = 4500, onExpire }) {
    dismiss();
    const el = h('div', { class: 'toast', role: 'status' }, h('span', { class: 'toast-msg' }, message));
    if (action) {
      el.append(h('button', {
        type: 'button',
        class: 'toast-action',
        onClick: () => {
          const c = current;
          current = null;
          if (c) clearTimeout(c.timer);
          el.remove();
          action.run();
        },
      }, action.label));
    }
    el.append(h('button', { type: 'button', class: 'toast-close', 'aria-label': 'Dismiss', onClick: dismiss }, icon('close')));
    root.append(el);
    current = { el, onExpire, timer: setTimeout(dismiss, duration) };
  }
  return { show, commit: dismiss };
}

// ---------------------------------------------------------------------------
// Sticky knowledge bar (CONTRACT v2 "Knowledge")
// ---------------------------------------------------------------------------

function createKnowledgeBar(root) {
  let index = null;
  let topicKey = null;
  let last = { subject: null, topic: null };
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });

  // The label shows the contract's integer %; the fill uses the exact ratio, so the
  // bar visibly moves after a single page even in a subject with over 100 pages.
  function row(label, linkHref, k, thin, color, prev) {
    const pct = k.pct;
    const exact = k.total ? Math.round((k.done / k.total) * 10000) / 100 : 0;
    const from = prev == null ? null : prev;
    const fill = h('div', { class: 'kbar-fill', style: { width: `${from == null ? exact : from.exact}%` } });
    const num = h('span', { class: 'kbar-pct' }, `${from == null ? pct : from.pct}%`);
    const el = h('div', { class: `kbar-row${thin ? ' kbar-topic' : ''}`, style: { '--bar-color': color } },
      h('a', { class: 'kbar-label', href: linkHref }, label),
      h('div', {
        class: 'kbar-track', role: 'progressbar', 'aria-label': label,
        'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(pct),
        'aria-valuetext': `${pct}%, ${k.done} of ${k.total} pages`,
        dataset: { exact: String(exact), done: String(k.done), total: String(k.total) },
      }, fill),
      num);
    if (from != null && from.exact !== exact) {
      requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = `${exact}%`; }));
      if (from.pct !== pct) tween(num, from.pct, pct);
      if (exact > from.exact) el.classList.add('kbar-up');
    }
    return { el, state: { pct, exact } };
  }

  function tween(el, from, to) {
    const start = performance.now();
    const dur = 700;
    const step = (t) => {
      const k = Math.min(1, (t - start) / dur);
      el.textContent = `${Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)))}%`;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  let drawn = '';
  function render({ force = false } = {}) {
    if (!index) { clear(root); root.hidden = true; drawn = ''; return; }
    const progress = store.all();
    const s = knowledge(index, index.id, progress);
    const tk = topicKey && topicKey !== index.id && index.nodes.has(topicKey) ? topicKey : null;
    const sig = `${index.id}:${s.done}/${s.total}|${tk}:${tk ? knowledge(index, tk, progress).done : ''}`;
    if (!force && sig === drawn) return; // e.g. audio position saves: nothing to redraw
    drawn = sig;
    const kids = [];
    const sr = row(`${index.title} knowledge`, href.topic(index.id), s, false, index.color,
      last.subject && last.subject.key === index.id ? last.subject : null);
    kids.push(sr.el);
    let tr = null;
    if (tk) {
      const node = index.nodes.get(tk);
      tr = row(`${node.title} knowledge`, href.topic(tk), knowledge(index, tk, progress), true, index.color,
        last.topic && last.topic.key === tk ? last.topic : null);
      kids.push(tr.el);
    }
    if (last.subject && last.subject.key === index.id && s.pct > last.subject.pct) {
      live.textContent = `${index.title} knowledge ${s.pct}%`;
    }
    last = { subject: { key: index.id, ...sr.state }, topic: tr ? { key: tk, ...tr.state } : null };
    clear(root);
    root.hidden = false;
    root.append(h('div', { class: 'wrap kbar-inner' }, kids), live);
  }

  store.subscribe(() => { if (index) render(); });
  return {
    show(i, tk = null) {
      index = i;
      topicKey = tk;
      render();
    },
    hide() { index = null; topicKey = null; render(); },
  };
}

// ---------------------------------------------------------------------------
// Study Plan runs (CONTRACT v2 "Study Plan")
// ---------------------------------------------------------------------------

function createPlanRun() {
  let run = load();

  function load() {
    try {
      const raw = session() && session().getItem(PLAN_RUN_KEY);
      const r = raw ? JSON.parse(raw) : null;
      if (r && typeof r.index === 'number' && r.assigned && typeof r.assigned === 'object') return r;
    } catch { /* ignore */ }
    return null;
  }
  function save() {
    try {
      const s = session();
      if (!s) return;
      if (run) s.setItem(PLAN_RUN_KEY, JSON.stringify(run));
      else s.removeItem(PLAN_RUN_KEY);
    } catch { /* ignore */ }
  }
  function valid() {
    if (!run) return false;
    if (run.planAt !== planStore.get().updatedAt) { run = null; save(); return false; }
    return true;
  }

  async function resolver(blocks) {
    const ids = [...new Set(blocks.map((b) => subjectOf(b.topicKey)))];
    const indexes = new Map();
    await Promise.all(ids.map(async (id) => {
      try { indexes.set(id, await getSubject(id)); } catch { /* subject missing: its blocks are skipped */ }
    }));
    const progress = store.all();
    return (topicKey, exclude) => {
      const idx = indexes.get(subjectOf(topicKey));
      if (!idx || !idx.nodes.has(topicKey)) return null;
      return resumeKey(idx, topicKey, progress, exclude);
    };
  }

  async function advanceFrom(from) {
    const blocks = planStore.get().blocks;
    const resolve = await resolver(blocks);
    const res = nextAssignment(blocks, from, run.assigned, resolve);
    if (!res) { run = null; save(); return null; }
    for (const i of res.skipped) run.skipped[i] = true;
    run.index = res.index;
    run.assigned[res.index] = res.key;
    save();
    return res.key;
  }

  return {
    /** Start from block 0. Resolves to the first lesson key, or null if nothing is left. */
    async start() {
      run = { planAt: planStore.get().updatedAt, index: -1, assigned: {}, skipped: {}, startedAt: Date.now() };
      return advanceFrom(0);
    },
    /** Finish the current block and move on. */
    async advance() {
      if (!valid()) return null;
      return advanceFrom(run.index + 1);
    },
    stop() { run = null; save(); },
    current() {
      if (!valid() || run.index < 0) return null;
      const blocks = planStore.get().blocks;
      return { index: run.index, key: run.assigned[run.index], total: blocks.length, block: blocks[run.index], assigned: { ...run.assigned }, skipped: { ...run.skipped } };
    },
    isCurrent(lessonKey) {
      const c = this.current();
      return !!c && c.key === lessonKey;
    },
  };
}

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

const root = document.getElementById('app');
const accountSlot = h('div', { class: 'account-slot' });
const tabsTop = h('nav', { class: 'tabs', 'aria-label': 'Main' });
const tabsBottom = h('nav', { class: 'tabbar', 'aria-label': 'Main' });
const kbarRoot = h('div', { class: 'kbar', hidden: true });
const main = h('main', { id: 'main', class: 'main', tabindex: '-1' });
const toastRoot = h('div', { class: 'toasts', 'aria-live': 'polite' });

const TABS = [
  { id: 'catalog', label: 'Subjects', icon: 'grid', href: href.catalog() },
  { id: 'plan', label: 'Study Plan', icon: 'calendar', href: href.plan() },
  { id: 'profile', label: 'Profile', icon: 'user', href: href.profile() },
];
for (const t of TABS) {
  tabsTop.append(h('a', { href: t.href, class: 'tab', dataset: { tab: t.id } }, icon(t.icon), h('span', null, t.label)));
  tabsBottom.append(h('a', { href: t.href, class: 'tabbar-item', dataset: { tab: t.id } }, icon(t.icon), h('span', null, t.label)));
}

root.append(
  h('a', { class: 'skip-link', href: '#main', onClick: (e) => { e.preventDefault(); main.focus(); } }, 'Skip to content'),
  h('header', { class: 'site-header' },
    h('div', { class: 'wrap header-row' },
      h('div', { class: 'brand-group' },
        h('a', { class: 'brand', href: '#/', 'aria-label': 'Subject Mastery home' }, icon('logo', 'brand-mark'), h('span', { class: 'brand-name' }, 'Subject Mastery')),
        h('a', { class: 'by-link', href: 'https://batesai.org/', title: 'BatesAI home' }, h('span', { class: 'by-word' }, 'by '), 'BatesAI')),
      tabsTop,
      accountSlot)),
  kbarRoot,
  main,
  h('footer', { class: 'site-footer' },
    h('div', { class: 'wrap footer-inner' },
      h('div', { class: 'footer-brand' },
        h('p', { class: 'footer-name' }, icon('logo', 'brand-mark'), 'Subject Mastery'),
        h('p', { class: 'footer-note' }, 'Lessons are drafted and reviewed by AI. A self-study path: not a tutor and not accredited.')),
      h('nav', { class: 'footer-links', 'aria-label': 'Footer' },
        h('a', { href: href.about() }, 'About'),
        h('a', { href: `${href.about()}?credits` }, 'Credits'),
        h('a', { href: href.account() }, 'Your data'),
        h('a', { href: 'mailto:help@batesai.org?subject=Subject%20Mastery' }, 'Report a mistake')),
      h('p', { class: 'footer-legal' },
        '© 2026 Daniel Bates / Bates LLC · ',
        h('a', { href: 'https://batesai.org/' }, 'batesai.org'),
        ' · ',
        h('a', { href: 'mailto:help@batesai.org' }, 'help@batesai.org')))),
  tabsBottom,
  toastRoot,
);

const toast = createToaster(toastRoot);
const kbar = createKnowledgeBar(kbarRoot);
const planRun = createPlanRun();

let catalogPromise = null;
const ctx = {
  store, prefs, sync, profileStore, planStore, profileSync, planSync,
  toast, kbar, planRun,
  pendingAutoplay: null,
  signInUrl,
  get user() { return sync.getState().user; },
  get apiAvailable() { return sync.getState().available; },
  get signedIn() { return sync.getState().signedIn; },
  catalog() {
    if (!catalogPromise) {
      catalogPromise = getCatalog();
      catalogPromise.catch(() => { catalogPromise = null; });
    }
    return catalogPromise;
  },
  navigate(hash, { autoplay = false, replace = false } = {}) {
    if (autoplay) {
      const route = parseRoute(hash);
      ctx.pendingAutoplay = route.name === 'lesson' ? route.lessonKey : null;
    }
    if (location.hash === hash) onRoute();
    else if (replace) { history.replaceState(null, '', hash); onRoute(); }
    else location.hash = hash;
  },
  rememberReturn() {
    try { session() && session().setItem(RETURN_ROUTE_KEY, location.hash || '#/'); } catch { /* ignore */ }
  },
  /**
   * Set a status on lessons with a 10 s undo. Server sync is held for the undo
   * window so an undo never has to be sent (there is no "not started" status).
   */
  setStatusWithUndo(keys, status, { message, onUndo, undoMessage = 'Undone.' } = {}) {
    const list = keys.filter(Boolean);
    if (!list.length) return;
    toast.commit();
    const snapshot = store.setStatusMany(list, status);
    sync.holdFor(UNDO_MS);
    toast.show({
      message,
      duration: UNDO_MS,
      onExpire: () => sync.release(),
      action: {
        label: 'Undo',
        run: () => {
          store.restore(snapshot);
          sync.release();
          toast.show({ message: undoMessage, duration: 2500 });
          if (onUndo) onUndo();
        },
      },
    });
  },
  /** Start a subject/topic at its resume point (CONTRACT v2: first lesson neither completed nor known). */
  async playTopic(topicKey) {
    const index = await getSubject(subjectOf(topicKey));
    const key = resumeKey(index, topicKey, store.all()) ||
      index.nodes.get(topicKey)?.allKeys.find((k) => index.lessons.get(k).hasText);
    if (!key) { toast.show({ message: 'No pages are ready in this topic yet.' }); return; }
    planRun.stop();
    ctx.navigate(href.lesson(key), { autoplay: true });
  },
  async startPlan() {
    const key = await planRun.start();
    if (!key) {
      toast.show({ message: planStore.get().blocks.length ? 'Every block in your plan is already known. Add more on your profile.' : 'Your Study Plan is empty. Add blocks on your profile.' });
      return;
    }
    ctx.navigate(href.lesson(key), { autoplay: true });
  },
  isDone,
};

// Header account control + tab highlight
function renderAccountSlot() {
  const st = sync.getState();
  clear(accountSlot);
  if (st.available === null) {
    accountSlot.append(h('span', { class: 'account-pending', 'aria-hidden': 'true' }));
  } else if (st.signedIn) {
    const name = profileStore.get().displayName || (st.user && st.user.name) || 'Account';
    accountSlot.append(h('a', { href: href.account(), class: 'account-link', 'aria-label': `Account: ${name}`, title: name },
      avatar(profileStore.get(), st.user, 32),
      st.status === 'error' || st.status === 'offline' ? h('span', { class: 'sync-dot', title: 'Not synced yet' }) : null));
  } else if (st.available) {
    accountSlot.append(h('a', { href: signInUrl(), class: 'btn btn-primary btn-sm', onClick: () => ctx.rememberReturn() }, 'Sign in'));
  } else {
    accountSlot.append(h('a', { href: href.account(), class: 'account-link account-local', 'aria-label': 'Your data on this device', title: 'Your data on this device' }, icon('user')));
  }
}
sync.subscribe(renderAccountSlot);
profileStore.subscribe(renderAccountSlot);
renderAccountSlot();

function highlightTab(route) {
  const active = route.name === 'catalog' || route.name === 'subject' || route.name === 'lesson' ? 'catalog' : route.name;
  for (const a of [...tabsTop.children, ...tabsBottom.children]) {
    if (a.dataset.tab === active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

const SCREENS = {
  catalog: renderCatalog,
  subject: renderTopic,
  lesson: renderLesson,
  plan: renderPlanTab,
  profile: renderProfile,
  account: renderAccount,
  about: renderAbout,
  notfound: renderNotFound,
};

let current = null;
let token = 0;

async function onRoute() {
  const route = parseRoute(location.hash);
  const my = ++token;
  if (current && current.cleanup) { try { current.cleanup(); } catch (e) { console.error(e); } }
  current = null;
  // The old screen stays visible until the next one is ready (or "Loading…" after 150 ms), but its cleanup
  // has run: make it inert so a quick second click cannot act on the page we are leaving.
  for (const old of main.children) old.inert = true;
  highlightTab(route);
  if (route.name !== 'subject' && route.name !== 'lesson') kbar.hide();
  const slow = setTimeout(() => { if (my === token) { clear(main); main.append(h('div', { class: 'wrap' }, h('div', { class: 'state state-loading', role: 'status' }, h('span', { class: 'spinner', 'aria-hidden': 'true' }), 'Loading…'))); } }, 150);
  let view;
  try {
    view = await SCREENS[route.name](ctx, route);
  } catch (e) {
    console.error(e);
    view = await renderNotFound(ctx, route, e);
  }
  clearTimeout(slow);
  if (my !== token) { if (view && view.cleanup) view.cleanup(); return; }
  current = view;
  clear(main);
  main.append(view.el);
  document.title = view.title ? `${view.title} · Subject Mastery` : 'Subject Mastery';
  if (!view.keepScroll) window.scrollTo(0, 0);
  const heading = main.querySelector('h1');
  if (heading && document.activeElement !== heading && route.name !== 'catalog' && !view.noFocus) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
  if (view.onMount) view.onMount();
}

window.addEventListener('hashchange', onRoute);

// ---------------------------------------------------------------------------
// Lifecycle: other tabs, network, page close
// ---------------------------------------------------------------------------

window.addEventListener('storage', (e) => {
  if (e.key === PROGRESS_KEY) store.reload();
  else if (e.key === PREFS_KEY) prefs.reload();
  else if (e.key === PROFILE_KEY) profileStore.reload();
  else if (e.key === PLAN_KEY) planStore.reload();
});
window.addEventListener('online', () => { sync.flush(); profileSync.retry(); planSync.retry(); });
function flushNow() {
  toast.commit();
  sync.flush({ keepalive: true });
}
window.addEventListener('pagehide', flushNow);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushNow(); });

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

const params = new URLSearchParams(location.search);
const justSignedIn = params.get('signed_in') === '1';
if (params.has('api') && !justSignedIn) {
  params.delete('api');
  const rest = params.toString();
  history.replaceState(null, '', location.pathname + (rest ? `?${rest}` : '') + location.hash);
}
if (justSignedIn) {
  history.replaceState(null, '', location.pathname + location.hash);
  try {
    const back = session() && session().getItem(RETURN_ROUTE_KEY);
    if (back && (!location.hash || location.hash === '#/' || location.hash === '#') && parseRoute(back).name !== 'notfound') {
      history.replaceState(null, '', location.pathname + back);
    }
    if (session()) session().removeItem(RETURN_ROUTE_KEY);
  } catch { /* ignore */ }
}

onRoute();

(async () => {
  const st = await sync.init();
  if (st.signedIn) {
    currentUser = st.user;
    profileStore.renormalize();
    const replaceLocal = !!st.foreign;
    await Promise.all([profileSync.pull({ replaceLocal }), planSync.pull({ replaceLocal })]);
    if (justSignedIn) toast.show({ message: 'Signed in. Your progress now saves to your batesai.org account.' });
  } else if (justSignedIn && st.available === false) {
    toast.show({ message: 'Could not reach your account just now. Progress is still saved on this device.' });
  }
  renderAccountSlot();
})();

