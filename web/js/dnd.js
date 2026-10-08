// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Pointer-event drag and drop for the Study Plan editor. One code path for
// mouse, pen and touch (HTML5 drag-and-drop does not work on touch screens).
// Drag sources call startDrag() from their pointerdown handler; the drop target
// is one list whose rows carry data-start (first block index) and data-count.
// Keyboard users get buttons instead (see profile-page.js); this file is only
// the pointer path.

const THRESHOLD = 6;
const EDGE = 72;

export function createDropList({ list, zone = list, length, onDrop }) {
  let drag = null;
  const indicator = document.createElement('li');
  indicator.className = 'drop-indicator';
  indicator.setAttribute('aria-hidden', 'true');

  function rows() {
    return [...list.querySelectorAll(':scope > [data-start]')];
  }

  function insertionIndex(y) {
    for (const row of rows()) {
      const r = row.getBoundingClientRect();
      if (y < r.top + r.height / 2) return { index: Number(row.dataset.start), before: row };
    }
    return { index: length(), before: null };
  }

  function inZone(x, y) {
    const r = zone.getBoundingClientRect();
    return x >= r.left - 24 && x <= r.right + 24 && y >= r.top - 40 && y <= r.bottom + 40;
  }

  function placeIndicator(x, y) {
    if (!inZone(x, y)) {
      indicator.remove();
      drag.target = null;
      zone.classList.remove('is-over');
      return;
    }
    zone.classList.add('is-over');
    const { index, before } = insertionIndex(y);
    drag.target = index;
    if (before) list.insertBefore(indicator, before);
    else list.append(indicator);
  }

  function moveGhost(x, y) {
    drag.ghost.style.transform = `translate(${x - drag.offsetX}px, ${y - drag.offsetY}px)`;
  }

  function autoScroll() {
    if (!drag || !drag.active) return;
    const y = drag.lastY;
    if (y < EDGE) window.scrollBy(0, -Math.ceil((EDGE - y) / 6));
    else if (y > window.innerHeight - EDGE) window.scrollBy(0, Math.ceil((y - (window.innerHeight - EDGE)) / 6));
    if (drag.active) {
      placeIndicator(drag.lastX, drag.lastY);
      drag.raf = requestAnimationFrame(autoScroll);
    }
  }

  function begin() {
    const src = drag.source;
    const r = src.getBoundingClientRect();
    drag.offsetX = drag.startX - r.left;
    drag.offsetY = drag.startY - r.top;
    const ghost = src.cloneNode(true);
    ghost.classList.add('drag-ghost');
    ghost.removeAttribute('id');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.width = `${r.width}px`;
    document.body.append(ghost);
    drag.ghost = ghost;
    drag.active = true;
    src.classList.add('is-dragging');
    document.body.classList.add('is-dragging-any');
    moveGhost(drag.startX, drag.startY);
    drag.raf = requestAnimationFrame(autoScroll);
  }

  function end(commit) {
    if (!drag) return;
    const d = drag;
    drag = null;
    cancelAnimationFrame(d.raf);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onCancel);
    window.removeEventListener('keydown', onKey, true);
    indicator.remove();
    zone.classList.remove('is-over');
    document.body.classList.remove('is-dragging-any');
    if (d.ghost) d.ghost.remove();
    d.source.classList.remove('is-dragging');
    if (d.active) {
      // Swallow the click that follows a real drag.
      const swallow = (e) => { e.stopPropagation(); e.preventDefault(); };
      window.addEventListener('click', swallow, { capture: true, once: true });
      setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);
      if (commit && d.target != null) onDrop(d.payload, d.target);
    }
  }

  function onMove(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    if (!drag.active) {
      if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < THRESHOLD) return;
      begin();
    }
    e.preventDefault();
    moveGhost(e.clientX, e.clientY);
    placeIndicator(e.clientX, e.clientY);
  }
  function onUp(e) { if (drag && e.pointerId === drag.pointerId) end(true); }
  function onCancel(e) { if (drag && e.pointerId === drag.pointerId) end(false); }
  function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); end(false); } }

  return {
    /** Call from a pointerdown handler. payload is passed back to onDrop. */
    startDrag(e, source, payload) {
      if (drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
      if (e.pointerType === 'mouse') e.preventDefault(); // no text selection
      drag = {
        pointerId: e.pointerId, source, payload, active: false, target: null,
        startX: e.clientX, startY: e.clientY, lastX: e.clientX, lastY: e.clientY,
      };
      window.addEventListener('pointermove', onMove, { passive: false });
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
      window.addEventListener('keydown', onKey, true);
    },
    get dragging() { return !!(drag && drag.active); },
    destroy() { end(false); },
  };
}
