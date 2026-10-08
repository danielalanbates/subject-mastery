// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Two playback engines with one interface, so the lesson screen does not care
// which is running:
//   - createAudioEngine(src): the lesson's MP3 in an <audio> element.
//   - createSpeechEngine(chunks): the browser's speechSynthesis reading the text
//     (fallback when a lesson has no recording yet).
// Interface: play() pause() toggle() seekTo(sec) seekBy(sec) restart() setRate(r)
//            currentTime duration paused kind  on(event, fn) destroy()
// Events: 'state' (play/pause/buffering), 'time', 'ended', 'error', 'ready'.
// Speech "time" is estimated from word counts at 150 words per minute.
// Some browsers start an utterance and then never finish it (no installed voice,
// headless Chromium). A per-chunk watchdog turns that silence into an 'error'
// ({error: 'stalled'}) instead of a player that looks like it is playing forever.

function emitter() {
  const map = new Map();
  return {
    on(evt, fn) {
      if (!map.has(evt)) map.set(evt, new Set());
      map.get(evt).add(fn);
      return () => map.get(evt).delete(fn);
    },
    emit(evt, arg) {
      for (const fn of [...(map.get(evt) || [])]) {
        try { fn(arg); } catch (e) { console.error('[player]', e); }
      }
    },
    clear() { map.clear(); },
  };
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function createAudioEngine(src, { rate = 1 } = {}) {
  const ev = emitter();
  const audio = new Audio();
  audio.preload = 'metadata';
  audio.src = src;
  audio.defaultPlaybackRate = rate;
  audio.playbackRate = rate;
  let destroyed = false;
  let buffering = false;

  const onState = () => ev.emit('state');
  audio.addEventListener('play', onState);
  audio.addEventListener('pause', onState);
  audio.addEventListener('playing', () => { buffering = false; onState(); });
  audio.addEventListener('waiting', () => { buffering = true; onState(); });
  audio.addEventListener('timeupdate', () => ev.emit('time'));
  audio.addEventListener('seeked', () => ev.emit('time'));
  audio.addEventListener('durationchange', () => ev.emit('time'));
  audio.addEventListener('loadedmetadata', () => {
    audio.playbackRate = rate;
    ev.emit('ready');
    ev.emit('time');
  });
  audio.addEventListener('ended', () => { onState(); ev.emit('ended'); });
  audio.addEventListener('error', () => {
    if (destroyed) return;
    ev.emit('error', audio.error);
  });

  const api = {
    kind: 'audio',
    el: audio,
    get currentTime() { return audio.currentTime || 0; },
    get duration() { return Number.isFinite(audio.duration) ? audio.duration : 0; },
    get paused() { return audio.paused; },
    get buffering() { return buffering && !audio.paused; },
    get rate() { return rate; },
    play() {
      const p = audio.play();
      if (p && p.catch) p.catch((err) => { if (!destroyed) ev.emit('blocked', err); });
      return p;
    },
    pause() { audio.pause(); },
    toggle() { return audio.paused ? api.play() : api.pause(); },
    seekTo(t) {
      const d = api.duration;
      audio.currentTime = clamp(Number(t) || 0, 0, d ? Math.max(0, d - 0.25) : Number(t) || 0);
      ev.emit('time');
    },
    seekBy(delta) { api.seekTo(api.currentTime + delta); },
    restart() { api.seekTo(0); api.play(); },
    setRate(r) {
      rate = r;
      audio.defaultPlaybackRate = r;
      audio.playbackRate = r;
    },
    on: ev.on,
    destroy() {
      destroyed = true;
      ev.clear();
      try {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      } catch { /* ignore */ }
    },
  };
  return api;
}

export function speechSupported() {
  return typeof globalThis.speechSynthesis !== 'undefined' &&
    typeof globalThis.SpeechSynthesisUtterance !== 'undefined';
}

const WORDS_PER_SEC = 150 / 60;

/**
 * @param chunks  utterance-sized strings (markdown.chunkForSpeech)
 * @param opts.volume  0..1 — kept modest by default
 */
export function createSpeechEngine(chunks, { rate = 1, volume = 0.7, lang = 'en-US' } = {}) {
  const ev = emitter();
  const synth = globalThis.speechSynthesis;
  const words = chunks.map((c) => c.split(/\s+/).filter(Boolean).length);
  const startAt = [];
  let acc = 0;
  for (const w of words) { startAt.push(acc / WORDS_PER_SEC); acc += w; }
  const total = acc / WORDS_PER_SEC;

  let index = 0;
  let playing = false;
  let generation = 0;
  let destroyed = false;
  let voice = null;
  let watchdog = null;
  const stopWatchdog = () => { if (watchdog) { clearTimeout(watchdog); watchdog = null; } };

  function pickVoice() {
    try {
      const voices = synth.getVoices() || [];
      const want = lang.toLowerCase();
      voice = voices.find((v) => v.lang && v.lang.toLowerCase() === want && v.localService) ||
        voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(want.slice(0, 2)) && v.default) ||
        voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(want.slice(0, 2))) || null;
    } catch { voice = null; }
  }
  pickVoice();
  const onVoices = () => pickVoice();
  try { synth.addEventListener('voiceschanged', onVoices); } catch { /* old Safari */ }

  function speakCurrent() {
    const my = ++generation;
    if (index >= chunks.length) {
      playing = false;
      ev.emit('state');
      ev.emit('ended');
      return;
    }
    const u = new SpeechSynthesisUtterance(chunks[index]);
    u.rate = rate;
    u.volume = volume;
    u.lang = lang;
    if (voice) u.voice = voice;
    u.onend = () => {
      stopWatchdog();
      if (my !== generation || !playing || destroyed) return;
      index++;
      ev.emit('time');
      speakCurrent();
    };
    u.onerror = (e) => {
      stopWatchdog();
      if (my !== generation || destroyed) return;
      if (e && (e.error === 'interrupted' || e.error === 'canceled')) return;
      playing = false;
      ev.emit('state');
      ev.emit('error', e);
    };
    // A chunk that takes far longer than its estimated length has stalled.
    stopWatchdog();
    const expected = (words[index] || 1) / WORDS_PER_SEC / Math.max(0.5, rate);
    watchdog = setTimeout(() => {
      watchdog = null;
      if (my !== generation || !playing || destroyed) return;
      playing = false;
      generation++;
      try { synth.cancel(); } catch { /* ignore */ }
      ev.emit('state');
      ev.emit('error', { error: 'stalled' });
    }, (expected * 2.5 + 6) * 1000);
    // Chrome sometimes drops a speak() issued right after cancel(); give it a beat.
    if (synth.speaking || synth.pending) {
      synth.cancel();
      setTimeout(() => { if (my === generation && playing && !destroyed) synth.speak(u); }, 80);
    } else {
      synth.speak(u);
    }
    ev.emit('time');
  }

  function indexForTime(t) {
    let i = 0;
    while (i + 1 < startAt.length && startAt[i + 1] <= t + 0.01) i++;
    return i;
  }

  const api = {
    kind: 'speech',
    get currentTime() { return startAt[Math.min(index, startAt.length - 1)] ?? 0; },
    get duration() { return total; },
    get paused() { return !playing; },
    get buffering() { return false; },
    get rate() { return rate; },
    get chunkIndex() { return index; },
    get chunkCount() { return chunks.length; },
    play() {
      if (destroyed || !chunks.length) return;
      if (index >= chunks.length) index = 0;
      playing = true;
      ev.emit('state');
      speakCurrent();
    },
    pause() {
      playing = false;
      generation++;
      stopWatchdog();
      try { synth.cancel(); } catch { /* ignore */ }
      ev.emit('state');
    },
    toggle() { return playing ? api.pause() : api.play(); },
    seekTo(t) {
      index = clamp(indexForTime(Number(t) || 0), 0, Math.max(0, chunks.length - 1));
      ev.emit('time');
      if (playing) speakCurrent();
    },
    seekBy(delta) {
      const target = api.currentTime + delta;
      let i = indexForTime(Math.max(0, target));
      if (delta > 0 && i === index) i = Math.min(chunks.length - 1, index + 1);
      if (delta < 0 && i === index) i = Math.max(0, index - 1);
      index = i;
      ev.emit('time');
      if (playing) speakCurrent();
    },
    restart() { index = 0; playing = true; ev.emit('state'); speakCurrent(); },
    setRate(r) {
      rate = r;
      if (playing) speakCurrent();
    },
    on: ev.on,
    destroy() {
      destroyed = true;
      playing = false;
      generation++;
      stopWatchdog();
      ev.clear();
      try { synth.removeEventListener('voiceschanged', onVoices); } catch { /* ignore */ }
      try { synth.cancel(); } catch { /* ignore */ }
    },
  };
  return api;
}
