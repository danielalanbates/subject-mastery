// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Account (#/account): Google sign-in / sign-out, sync status, preferences,
// export of everything stored, and "Reset my progress" with an in-page confirm.

import { h, clear, plural } from '../dom.js';
import { icon } from '../icons.js';
import { button, avatar, toggle } from '../components.js';
import { summarize } from '../progress.js';
import { RATES } from '../prefs.js';

const STATUS_TEXT = {
  idle: 'Ready.',
  saving: 'Saving…',
  saved: 'All changes saved to your account.',
  offline: 'Offline. Changes are kept on this device and will be sent when you reconnect.',
  error: 'Could not reach your account. Changes are kept on this device and will be retried.',
};

export async function renderAccount(ctx) {
  const whoSlot = h('section', { class: 'card account-card', 'aria-labelledby': 'acct-h' });
  const prefsSlot = h('section', { class: 'card', 'aria-labelledby': 'prefs-h' });
  const dataSlot = h('section', { class: 'card', 'aria-labelledby': 'data-h' });
  const el = h('div', { class: 'wrap narrow account' },
    h('header', { class: 'page-head' }, h('p', { class: 'eyebrow' }, 'Account'), h('h1', null, 'Your account and data')),
    whoSlot, prefsSlot, dataSlot);

  let lastSig = '';
  function drawWho() {
    const st = ctx.sync.getState();
    const sig = `${st.available}|${st.signedIn}|${st.user && st.user.email}|${st.status}|${st.pending}`;
    if (sig === lastSig) return;
    lastSig = sig;
    clear(whoSlot);
    const note = h('p', { class: 'save-note' }, icon(st.signedIn ? 'cloud' : 'device'),
      st.signedIn ? 'Your progress is saved on this device and to your batesai.org account.' : 'Your progress is saved on this device.');

    if (st.available === null) {
      whoSlot.append(h('h2', { id: 'acct-h' }, 'Checking your account…'), note);
      return;
    }
    if (st.signedIn) {
      const clearBox = h('input', { type: 'checkbox', id: 'clear-device' });
      whoSlot.append(
        h('h2', { id: 'acct-h', class: 'sr-only' }, 'Signed in'),
        h('div', { class: 'who' },
          avatar(ctx.profileStore.get(), st.user, 56),
          h('div', null,
            h('p', { class: 'who-name' }, (st.user && st.user.name) || 'Signed in'),
            st.user && st.user.email ? h('p', { class: 'muted' }, st.user.email) : null,
            h('p', { class: `sync-line sync-${st.status}`, role: 'status' }, STATUS_TEXT[st.status] || '', st.pending ? ` (${plural(st.pending, 'change')} waiting)` : ''))),
        note,
        h('div', { class: 'signout' },
          h('label', { class: 'check' }, clearBox, h('span', null, 'Also remove my progress from this device (for shared computers)')),
          button('Sign out', {
            kind: 'secondary', iconName: 'logout',
            onClick: async (e) => {
              e.currentTarget.disabled = true;
              await ctx.sync.signOut({ clearDevice: clearBox.checked });
              if (clearBox.checked) {
                ctx.profileStore.replace(null);
                ctx.planStore.replace(null);
              }
              location.reload();
            },
          })));
      return;
    }
    if (st.available) {
      whoSlot.append(
        h('h2', { id: 'acct-h' }, 'Sign in to keep your progress everywhere'),
        h('p', { class: 'muted' }, 'Sign in with your Google account. Your progress, profile and Study Plan follow you to any device. Progress you made here before signing in is added to your account.'),
        h('a', { class: 'btn btn-google', href: ctx.signInUrl(), onClick: () => ctx.rememberReturn() }, googleMark(), h('span', { class: 'btn-label' }, 'Sign in with Google')),
        note);
      return;
    }
    whoSlot.append(
      h('h2', { id: 'acct-h' }, 'Saved on this device'),
      h('p', { class: 'muted' }, 'Sign-in is not available here (you may be offline, or this is a local preview). Everything still works and is kept in this browser.'),
      note);
  }

  function drawPrefs() {
    clear(prefsSlot);
    const p = ctx.prefs.get();
    const modeSel = h('select', { id: 'pref-mode' },
      [['both', 'Audio and text'], ['audio', 'Audio only'], ['text', 'Text only']].map(([v, l]) => h('option', { value: v, selected: p.mode === v ? true : null }, l)));
    modeSel.addEventListener('change', () => ctx.prefs.set({ mode: modeSel.value }));
    const rateSel = h('select', { id: 'pref-rate' }, RATES.map((r) => h('option', { value: String(r), selected: p.rate === r ? true : null }, `${r}×`)));
    rateSel.addEventListener('change', () => ctx.prefs.set({ rate: Number(rateSel.value) }));
    prefsSlot.append(
      h('h2', { id: 'prefs-h' }, 'Listening preferences'),
      h('div', { class: 'field-row' }, h('label', { for: 'pref-mode' }, 'Show pages as'), modeSel),
      h('div', { class: 'field-row' }, h('label', { for: 'pref-rate' }, 'Speed'), rateSel),
      toggle('Autoplay the next page', p.autoplayNext, (v) => ctx.prefs.set({ autoplayNext: v }), { hint: 'When a page finishes, the next one starts on its own.' }));
  }

  const confirmSlot = h('div', { class: 'confirm-slot' });
  function drawData() {
    clear(dataSlot);
    const counts = summarize(ctx.store.all());
    dataSlot.append(
      h('h2', { id: 'data-h' }, 'Your data'),
      h('p', { class: 'muted' }, `${plural(counts.completed, 'page')} completed · ${counts.known} known · ${counts.inProgress} in progress.`),
      h('div', { class: 'row gap wrap-row' },
        button('Export my progress', { kind: 'secondary', iconName: 'download', onClick: exportData }),
        button('Reset my progress', { kind: 'danger-ghost', iconName: 'reset', onClick: () => drawConfirm() })),
      confirmSlot);
  }

  function drawConfirm(errorText) {
    clear(confirmSlot);
    const signedIn = ctx.signedIn;
    const confirmBtn = button('Yes, reset everything', {
      kind: 'danger',
      onClick: async () => {
        confirmBtn.disabled = true;
        const res = await ctx.sync.resetAll();
        if (!res.ok) {
          drawConfirm(res.reason === 'offline'
            ? 'Could not reach your account, so nothing was reset. Check your connection and try again.'
            : 'Your account could not be reset just now, so nothing was changed. Please try again.');
          return;
        }
        ctx.planRun.stop();
        clear(confirmSlot);
        drawData();
        ctx.toast.show({ message: 'Your progress was reset.' });
      },
    });
    confirmSlot.append(h('div', { class: 'confirm', role: 'alertdialog', 'aria-labelledby': 'confirm-t', 'aria-describedby': 'confirm-d' },
      h('p', { id: 'confirm-t', class: 'confirm-title' }, 'Reset all progress?'),
      h('p', { id: 'confirm-d', class: 'muted' }, signedIn
        ? 'This removes every completed, known and in-progress page from this device and from your batesai.org account. Your profile and Study Plan stay. This cannot be undone. Another device that is still signed in may send its own copy back the next time it opens.'
        : 'This removes every completed, known and in-progress page from this device. Your profile and Study Plan stay. This cannot be undone.'),
      errorText ? h('p', { class: 'form-error', role: 'alert' }, errorText) : null,
      h('div', { class: 'row gap' }, confirmBtn, button('Cancel', { kind: 'ghost', onClick: () => clear(confirmSlot) }))));
    confirmBtn.focus();
  }

  function exportData() {
    const payload = {
      app: 'Subject Mastery',
      exportedAt: new Date().toISOString(),
      progress: ctx.store.all(),
      prefs: ctx.prefs.get(),
      profile: ctx.profileStore.get(),
      plan: ctx.planStore.get(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: `subject-mastery-progress-${new Date().toISOString().slice(0, 10)}.json`, hidden: true });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  drawWho();
  drawPrefs();
  drawData();
  const unsub = [
    ctx.sync.subscribe(drawWho),
    ctx.store.subscribe(() => { if (!confirmSlot.firstChild) drawData(); }),
    ctx.profileStore.subscribe(() => { lastSig = ''; drawWho(); }),
  ];
  return { el, title: 'Account', cleanup: () => unsub.forEach((u) => u()) };
}

/** Google "G" mark, drawn inline (no external asset). */
function googleMark() {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 48 48');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  // Constant markup (the standard four-colour G), not data.
  svg.innerHTML = '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>';
  return svg;
}
