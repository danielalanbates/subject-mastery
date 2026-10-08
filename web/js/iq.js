// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// "Estimated IQ" — a playful learning score (CONTRACT v2). It is NOT a clinical
// IQ and the UI must always say so. 100 = high-school-graduate baseline, max < 150.
//
//   T  = total minutes of lessons completed or known (lesson.minutes)
//   B  = number of top-level subjects with knowledge >= 25%
//   IQ = 100 + floor( 40 * (1 - exp(-T / 3000)) + 10 * (1 - exp(-B / 5)) )

import { isDone } from './progress.js';
import { knowledge } from './tree.js';

export const IQ_BASELINE = 100;
export const IQ_LABEL = 'Estimated IQ';
export const IQ_DISCLAIMER = 'A playful learning score based on what you have studied here. Not a clinical IQ test.';

/** The formula itself. Bad inputs count as zero. */
export function estimateIq(totalMinutes, broadSubjects) {
  const T = Number.isFinite(totalMinutes) && totalMinutes > 0 ? totalMinutes : 0;
  const B = Number.isFinite(broadSubjects) && broadSubjects > 0 ? broadSubjects : 0;
  const raw = IQ_BASELINE + Math.floor(40 * (1 - Math.exp(-T / 3000)) + 10 * (1 - Math.exp(-B / 5)));
  // In floating point both exp() terms underflow to 0 for absurd inputs and the
  // sum reaches exactly 150; the contract promises max < 150, so cap at 149.
  return Math.min(149, raw);
}

/**
 * Minutes of further learning (completed or known pages) until the score rises by
 * one point, holding the subject count fixed. null once the score is capped.
 */
export function minutesToNextPoint(totalMinutes, broadSubjects) {
  const T = Number.isFinite(totalMinutes) && totalMinutes > 0 ? totalMinutes : 0;
  const now = estimateIq(T, broadSubjects);
  if (now >= 149) return null;
  let lo = 0;
  let hi = 1;
  while (estimateIq(T + hi, broadSubjects) <= now) {
    hi *= 2;
    if (hi > 1e7) return null;
  }
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (estimateIq(T + mid, broadSubjects) > now) hi = mid; else lo = mid;
  }
  return hi;
}

/**
 * Inputs from real data.
 * @param progress  the sm.progress.v1 map
 * @param indexes   indexSubject() results for every available subject
 * @returns {{iq:number, minutes:number, broadSubjects:number}}
 */
export function iqFromProgress(progress, indexes) {
  let minutes = 0;
  let broadSubjects = 0;
  for (const index of indexes || []) {
    for (const [key, lesson] of index.lessons) {
      const r = progress && progress[key];
      if (r && isDone(r.status)) minutes += lesson.minutes;
    }
    if (knowledge(index, index.id, progress).pct >= 25) broadSubjects++;
  }
  return { iq: estimateIq(minutes, broadSubjects), minutes, broadSubjects };
}
