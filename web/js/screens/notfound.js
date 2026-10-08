// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Fallback screen for unknown routes and missing data.

import { h } from '../dom.js';
import { linkButton } from '../components.js';
import { href } from '../router.js';

export async function renderNotFound(ctx, route, error) {
  const offline = error && error.status === 'network';
  const el = h('div', { class: 'wrap narrow' },
    h('section', { class: 'state state-error' },
      h('h1', null, offline ? 'You seem to be offline' : 'Page not found'),
      h('p', { class: 'muted' }, offline
        ? 'This page could not be loaded. Check your connection and try again.'
        : 'That subject or page does not exist, or it has not been published yet.'),
      h('div', { class: 'row gap' }, linkButton('All subjects', href.catalog(), { kind: 'primary', iconName: 'grid' }))));
  return { el, title: offline ? 'Offline' : 'Not found' };
}
