// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Profile document (CONTRACT v2 "Profile", local `sm.profile.v1`, server `sm_profile`).
//   { displayName, bio (≤ 280), avatar: {kind: google|initials|emoji|image, value},
//     accent (hex), banner (preset id or hex gradient), featuredSubjects: [topicKey…] (≤ 6),
//     showIq: true, updatedAt }
// Interpretation choices (the contract leaves them open):
//   - displayName is capped at 60 characters.
//   - a "hex gradient" banner is two hex colours joined by a comma: "#1f6feb,#7c3aed".
//   - avatar.value: '' for google (the Google photo URL comes from /me at render time),
//     up to 3 letters for initials, one emoji (≤ 16 UTF-16 units), a data: URL for image.
// Pure functions only.

import { isTopicKey } from './tree.js';

export const PROFILE_KEY = 'sm.profile.v1';
export const MAX_BIO = 280;
export const MAX_NAME = 60;
export const MAX_FEATURED = 6;
export const MAX_AVATAR_BYTES = 64 * 1024;
export const MAX_PROFILE_BYTES = 96 * 1024;

export const AVATAR_KINDS = Object.freeze(['google', 'initials', 'emoji', 'image']);

export const ACCENTS = Object.freeze(['#0f766e', '#1f6feb', '#7c3aed', '#c2410c', '#be123c', '#4d7c0f', '#0e7490', '#a16207']);

export const BANNERS = Object.freeze([
  { id: 'tide', label: 'Tide', stops: ['#0f766e', '#22d3ee'] },
  { id: 'dusk', label: 'Dusk', stops: ['#312e81', '#db2777'] },
  { id: 'meadow', label: 'Meadow', stops: ['#3f6212', '#facc15'] },
  { id: 'ember', label: 'Ember', stops: ['#9a3412', '#fbbf24'] },
  { id: 'slate', label: 'Slate', stops: ['#1e293b', '#64748b'] },
  { id: 'sky', label: 'Sky', stops: ['#1d4ed8', '#93c5fd'] },
]);

export const EMOJI_CHOICES = Object.freeze(['📚', '🦉', '🧠', '🌱', '🔭', '🧭', '⚛️', '🏛️', '✝️', '🎓', '🌍', '🧪']);

const HEX_RE = /^#[0-9a-f]{6}$/i;
const GRADIENT_RE = /^#[0-9a-f]{6},#[0-9a-f]{6}$/i;
const DATA_URL_RE = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/;

export function isHex(c) {
  return typeof c === 'string' && HEX_RE.test(c);
}

export function bannerStops(banner) {
  const preset = BANNERS.find((b) => b.id === banner);
  if (preset) return preset.stops;
  if (typeof banner === 'string' && GRADIENT_RE.test(banner)) return banner.split(',');
  return BANNERS[0].stops;
}

export function initialsOf(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'SM';
  const letters = words.length === 1 ? [...words[0]].slice(0, 2) : [[...words[0]][0], [...words[words.length - 1]][0]];
  return letters.join('').toUpperCase();
}

function clip(s, n) {
  // Clip by code points so emoji are never cut in half.
  return [...String(s)].slice(0, n).join('');
}

export function defaultProfile(user) {
  const name = (user && user.name) || '';
  return {
    displayName: clip(name, MAX_NAME),
    bio: '',
    avatar: user && user.avatarUrl ? { kind: 'google', value: '' } : { kind: 'initials', value: initialsOf(name) },
    accent: ACCENTS[0],
    banner: BANNERS[0].id,
    featuredSubjects: [],
    showIq: true,
    updatedAt: 0,
  };
}

export function normalizeAvatar(a, fallbackName = '') {
  const kind = a && AVATAR_KINDS.includes(a.kind) ? a.kind : 'initials';
  let value = a && typeof a.value === 'string' ? a.value : '';
  if (kind === 'google') value = '';
  if (kind === 'initials') {
    value = clip(value.replace(/[^\p{L}\p{N}]/gu, ''), 3).toUpperCase() || initialsOf(fallbackName);
  }
  if (kind === 'emoji') {
    value = value.trim();
    if (!value || value.length > 16 || /[<>&"'`]/.test(value)) return { kind: 'initials', value: initialsOf(fallbackName) };
  }
  if (kind === 'image') {
    if (!DATA_URL_RE.test(value) || value.length > MAX_AVATAR_BYTES) return { kind: 'initials', value: initialsOf(fallbackName) };
  }
  return { kind, value };
}

/** Clean any incoming profile (local storage, server, form). Returns a valid profile. */
export function normalizeProfile(p, user) {
  const base = defaultProfile(user);
  if (!p || typeof p !== 'object') return base;
  const displayName = typeof p.displayName === 'string' ? clip(p.displayName.replace(/[\u0000-\u001f]/g, '').trim(), MAX_NAME) : base.displayName;
  const bio = typeof p.bio === 'string' ? clip(p.bio.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f]/g, ''), MAX_BIO) : '';
  const featured = Array.isArray(p.featuredSubjects)
    ? [...new Set(p.featuredSubjects.filter(isTopicKey))].slice(0, MAX_FEATURED)
    : [];
  const banner = BANNERS.some((b) => b.id === p.banner) || (typeof p.banner === 'string' && GRADIENT_RE.test(p.banner))
    ? p.banner.toLowerCase()
    : base.banner;
  const updatedAt = Number(p.updatedAt);
  const out = {
    displayName,
    bio,
    avatar: normalizeAvatar(p.avatar, displayName || (user && user.name)),
    accent: isHex(p.accent) ? p.accent.toLowerCase() : base.accent,
    banner,
    featuredSubjects: featured,
    showIq: p.showIq !== false,
    updatedAt: Number.isFinite(updatedAt) && updatedAt > 0 ? Math.floor(updatedAt) : 0,
  };
  if (JSON.stringify(out).length > MAX_PROFILE_BYTES) out.avatar = { kind: 'initials', value: initialsOf(displayName) };
  return out;
}
