// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Credits for the narration. Every lesson JSON names the voice that read it
// (`"voice": "piper:<model>"`, CONTRACT v1); this map turns that id into a
// human credit with the voice's training-data licence. An unknown voice falls
// back to its id, so a new voice never breaks a page; add it here when one is
// introduced. Licences are from the Hugging Face `rhasspy/piper-voices` model
// cards, as recorded in docs/RELATED_PROJECTS.md ("Voice licensing").
// Pure data and functions, no DOM.

export const ENGINE = Object.freeze({
  name: 'Piper TTS',
  licence: 'GPL-3.0-or-later',
  source: 'OHF-Voice/piper1-gpl, piper-tts 1.7',
  url: 'https://github.com/OHF-Voice/piper1-gpl',
  note: 'Fast, local neural text-to-speech by the Rhasspy project. Every recording here was made on our own machine; no audio is sent to a cloud service.',
});

export const VOICES = Object.freeze({
  'piper:en_US-john-medium': {
    name: 'John',
    accent: 'US English',
    dataset: 'Voice by Bryce Beattie, trained on public-domain LibriVox audiobook recordings (fine-tuned from his Kristin voice)',
    licence: 'public domain',
    url: 'https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/john/medium/MODEL_CARD',
  },
  'piper:en_US-lessac-medium': {
    name: 'Lessac',
    accent: 'US English',
    dataset: 'Lessac voice data from the Blizzard Challenge 2013 (Lessac Technologies)',
    licence: 'research and non-commercial use only',
    url: 'https://www.cstr.ed.ac.uk/projects/blizzard/2013/lessac_blizzard2013/',
  },
  'piper:en_US-ryan-high': {
    name: 'Ryan',
    accent: 'US English',
    dataset: 'RyanSpeech corpus',
    licence: 'CC BY-NC-SA 4.0',
    url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  },
  'piper:en_GB-cori-medium': {
    name: 'Cori',
    accent: 'British English',
    dataset: 'LibriVox audiobook recordings read by Cori Samuel',
    licence: 'public domain',
    url: 'https://librivox.org/',
  },
  'piper:en_US-libritts_r-medium': {
    name: 'LibriTTS-R',
    accent: 'US English, many speakers',
    dataset: 'LibriTTS-R corpus (CC BY 4.0), fine-tuned from the Lessac voice (Blizzard Challenge 2013, research and non-commercial use only)',
    licence: 'CC BY 4.0 data on a non-commercial base voice',
    url: 'https://www.openslr.org/141/',
  },
});

const VOICE_ID_RE = /^[a-z0-9]+:[A-Za-z0-9_.-]{1,64}$/;

/**
 * Credit for one lesson's `voice` field.
 * @returns {{id, known, name, accent, engine, dataset, licence, url} | null}  null when the lesson has no recording
 */
export function voiceCredit(voiceId) {
  if (typeof voiceId !== 'string' || !voiceId) return null;
  const id = VOICE_ID_RE.test(voiceId) ? voiceId : 'unknown voice';
  const v = VOICES[id];
  const engine = id.startsWith('piper:') ? ENGINE.name : '';
  if (!v) return { id, known: false, name: id, accent: '', engine, dataset: '', licence: '', url: '' };
  return { id, known: true, engine, ...v };
}

/** One short line for under the player, e.g. "Narrated by Piper TTS · Lessac voice (US English)". */
export function voiceLine(voiceId) {
  const c = voiceCredit(voiceId);
  if (!c) return '';
  const who = c.known ? `${c.name} voice${c.accent ? ` (${c.accent})` : ''}` : `voice ${c.name}`;
  return c.engine ? `Narrated by ${c.engine} · ${who}` : `Narrated by ${who}`;
}
