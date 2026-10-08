// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Small reusable UI pieces shared by the screens.

import { h } from './dom.js';
import { icon, STATUS_ICON, STATUS_LABEL } from './icons.js';
import { bannerStops, initialsOf } from './profile.js';

/** Button with optional leading icon. kind: primary | secondary | ghost | danger */
export function button(label, { kind = 'secondary', iconName, iconAfter = false, onClick, type = 'button', ...rest } = {}) {
  return h('button', { type, class: `btn btn-${kind}`, onClick, ...rest },
    iconName && !iconAfter ? icon(iconName) : null,
    label ? h('span', { class: 'btn-label' }, label) : null,
    iconName && iconAfter ? icon(iconName) : null);
}

export function linkButton(label, href, { kind = 'secondary', iconName, ...rest } = {}) {
  return h('a', { href, class: `btn btn-${kind}`, ...rest },
    iconName ? icon(iconName) : null,
    label ? h('span', { class: 'btn-label' }, label) : null);
}

export function iconButton(iconName, label, { onClick, className = '', ...rest } = {}) {
  return h('button', { type: 'button', class: `icon-btn ${className}`.trim(), 'aria-label': label, title: label, onClick, ...rest }, icon(iconName));
}

/** `exact` (0–100, optional) sets the fill precisely while the value stays the integer `pct`. */
export function progressBar(pct, { label, thin = false, color, exact } = {}) {
  const p = Math.max(0, Math.min(100, Math.round(pct || 0)));
  const w = Number.isFinite(exact) ? Math.max(0, Math.min(100, exact)) : p;
  return h('div', {
    class: `bar${thin ? ' bar-thin' : ''}`,
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    'aria-valuenow': String(p),
    'aria-label': label || `${p}% known`,
    style: color ? { '--bar-color': color } : null,
  }, h('div', { class: 'bar-fill', style: { width: `${w}%` } }));
}

/** Exact knowledge ratio in percent, for bar fills (see progressBar). */
export function exactPct(k) {
  return k && k.total ? (k.done / k.total) * 100 : 0;
}

/** Square tile with a subject's initials in its colour (decorative). */
export function monogram(title, color, size = 44) {
  const words = String(title || '').replace(/&/g, ' ').split(/\s+/).filter((w) => /^[A-Za-z]/.test(w));
  const letters = (words.length > 1 ? words[0][0] + words[1][0] : (words[0] || '?')[0]).toUpperCase();
  return h('span', { class: 'monogram', style: { '--subject': color, '--mono-size': `${size}px` }, 'aria-hidden': 'true' }, letters);
}

export function statusIcon(status, { soon = false } = {}) {
  const s = soon ? 'soon' : status || 'none';
  return h('span', { class: `status status-${s}`, title: STATUS_LABEL[s] },
    icon(STATUS_ICON[s]),
    h('span', { class: 'sr-only' }, STATUS_LABEL[s]));
}

export function statusLegend() {
  return h('ul', { class: 'legend', 'aria-label': 'Status key' },
    ['none', 'in_progress', 'completed', 'known'].map((s) =>
      h('li', null, statusIcon(s), h('span', { 'aria-hidden': 'true' }, STATUS_LABEL[s]))));
}

export function breadcrumbs(items) {
  return h('nav', { class: 'crumbs', 'aria-label': 'Breadcrumb' },
    h('ol', null, items.map((it, i) => h('li', null,
      it.href && i < items.length - 1 ? h('a', { href: it.href }, it.label) : h('span', { 'aria-current': i === items.length - 1 ? 'page' : null }, it.label)))));
}

export function loading(label = 'Loading…') {
  return h('div', { class: 'state state-loading', role: 'status' }, h('span', { class: 'spinner', 'aria-hidden': 'true' }), h('span', null, label));
}

export function errorState(message, { onRetry, backHref = '#/', backLabel = 'All subjects' } = {}) {
  return h('div', { class: 'state state-error', role: 'alert' },
    h('p', { class: 'state-title' }, message),
    h('div', { class: 'row gap' },
      onRetry ? button('Try again', { kind: 'primary', iconName: 'reset', onClick: onRetry }) : null,
      backHref ? h('a', { href: backHref, class: 'btn btn-ghost' }, backLabel) : null));
}

/** Avatar for a profile. size in px. */
export function avatar(profile, user, size = 40) {
  const a = (profile && profile.avatar) || { kind: 'initials', value: '' };
  const name = (profile && profile.displayName) || (user && user.name) || '';
  const style = { '--av-size': `${size}px`, '--av-color': (profile && profile.accent) || '#0f766e' };
  const fallback = () => h('span', { class: 'avatar avatar-initials', style, 'aria-hidden': 'true' }, initialsOf(name));
  if (a.kind === 'google' && user && user.avatarUrl) {
    const img = h('img', { class: 'avatar', style, src: user.avatarUrl, alt: '', referrerpolicy: 'no-referrer', width: size, height: size, loading: 'lazy' });
    img.addEventListener('error', () => img.replaceWith(fallback()), { once: true });
    return img;
  }
  if (a.kind === 'image' && a.value) {
    return h('img', { class: 'avatar', style, src: a.value, alt: '', width: size, height: size });
  }
  if (a.kind === 'emoji' && a.value) {
    return h('span', { class: 'avatar avatar-emoji', style, 'aria-hidden': 'true' }, a.value);
  }
  return h('span', { class: 'avatar avatar-initials', style, 'aria-hidden': 'true' }, (a.kind === 'initials' && a.value) || initialsOf(name));
}

export function bannerStyle(banner) {
  const [a, b] = bannerStops(banner);
  return { '--banner-a': a, '--banner-b': b };
}

export function toggle(label, checked, onChange, { id, hint } = {}) {
  const input = h('input', { type: 'checkbox', role: 'switch', id, class: 'switch-input', checked: checked ? true : null });
  input.addEventListener('change', () => onChange(input.checked));
  return h('label', { class: 'switch' }, input, h('span', { class: 'switch-track', 'aria-hidden': 'true' }), h('span', { class: 'switch-label' }, label, hint ? h('span', { class: 'hint' }, hint) : null));
}
