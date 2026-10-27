// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Small inline SVG icon set (24×24, stroke = currentColor). The markup below is
// fixed constant text written here, never data, so innerHTML on the <svg> is safe.

const NS = 'http://www.w3.org/2000/svg';

const P = {
  play: '<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" fill="currentColor" stroke="none"/>',
  pause: '<rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none"/><rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none"/>',
  back15: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3.5 3.5v4.5H8"/><text x="12.6" y="15.6" text-anchor="middle" font-size="7.6" font-weight="700" font-family="system-ui,sans-serif" fill="currentColor" stroke="none">15</text>',
  fwd15: '<path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M20.5 3.5v4.5H16"/><text x="11.4" y="15.6" text-anchor="middle" font-size="7.6" font-weight="700" font-family="system-ui,sans-serif" fill="currentColor" stroke="none">15</text>',
  restart: '<path d="M19 19 9 12l10-7z" fill="currentColor" stroke="none"/><path d="M5 5v14"/>',
  prev: '<path d="m15 18-6-6 6-6"/>',
  next: '<path d="m9 18 6-6-6-6"/>',
  arrowLeft: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  statusNone: '<circle cx="12" cy="12" r="8.5"/>',
  statusProgress: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none"/>',
  statusDone: '<circle cx="12" cy="12" r="9.5" fill="currentColor" stroke="none"/><path d="m7.8 12.3 2.8 2.8 5.6-5.8" stroke="var(--on-accent, #fff)" stroke-width="2.2"/>',
  statusKnown: '<circle cx="12" cy="12" r="9.5" fill="currentColor" stroke="none"/><path d="m7.5 8.5 3.5 3.5-3.5 3.5M12.5 8.5l3.5 3.5-3.5 3.5" stroke="var(--on-accent, #fff)" stroke-width="2"/>',
  statusSoon: '<circle cx="12" cy="12" r="8.5" stroke-dasharray="2.6 2.6"/>',
  skip: '<path d="m6 7 5 5-5 5M13 7l5 5-5 5"/>',
  headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
  both: '<path d="M3 13v-1a9 9 0 0 1 18 0v1"/><path d="M3 15h2.5a1.5 1.5 0 0 1 1.5 1.5v2A1.5 1.5 0 0 1 5.5 20H5a2 2 0 0 1-2-2z"/><path d="M21 15h-2.5a1.5 1.5 0 0 0-1.5 1.5v2a1.5 1.5 0 0 0 1.5 1.5h.5a2 2 0 0 0 2-2z"/><path d="M10 15h4M10 18h4"/>',
  speaker: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  layers: '<path d="m12 3 9 4.5-9 4.5-9-4.5z"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1" fill="currentColor"/><circle cx="3.5" cy="12" r="1" fill="currentColor"/><circle cx="3.5" cy="18" r="1" fill="currentColor"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><path d="M7.5 13.5h3M13.5 13.5h3M7.5 17h3"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  up: '<path d="m18 15-6-6-6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  grip: '<circle cx="9" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.4" fill="currentColor" stroke="none"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  keyboard: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M18 13h.01M10 13h4M7 16h10"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
  cloud: '<path d="M17.5 19H8a6 6 0 1 1 1.3-11.86A5 5 0 0 1 19 9.5a4.5 4.5 0 0 1-1.5 9.5z"/>',
  device: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18h2"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M6.3 17.7l2.5-2.5M15.2 8.8l2.5-2.5"/>',
  logo: '<rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="currentColor" stroke="none"/><path d="M6.5 16.5 10 12l3 2.5 4.5-6" stroke="var(--logo-ink, #fff)" stroke-width="2.2"/><circle cx="17.5" cy="8.5" r="1.6" fill="var(--logo-ink, #fff)" stroke="none"/>',
};

export function icon(name, className = '') {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('class', `icon${className ? ' ' + className : ''}`);
  svg.innerHTML = P[name] || P.info;
  return svg;
}

export const STATUS_ICON = {
  none: 'statusNone',
  in_progress: 'statusProgress',
  completed: 'statusDone',
  known: 'statusKnown',
  soon: 'statusSoon',
};

export const STATUS_LABEL = {
  none: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
  known: 'Already known',
  soon: 'Coming soon',
};
