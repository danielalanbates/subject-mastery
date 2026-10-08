// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// About (#/about): what Subject Mastery is and is not, how lessons are made,
// privacy, credits and licences. The narration credit is data-driven: it reads
// the `voice` field of published lessons (a few per subject, in parallel) and
// maps each id through js/credits.js. `#/about?credits` scrolls to the credits.

import { h, clear } from '../dom.js';
import { icon } from '../icons.js';
import { linkButton } from '../components.js';
import { href } from '../router.js';
import { getAllSubjects, getLesson } from '../data.js';
import { ENGINE, voiceCredit } from '../credits.js';

const REPO_URL = 'https://github.com/danielalanbates/subject-mastery';
const REPORT_MAIL = 'mailto:help@batesai.org?subject=Subject%20Mastery%20correction';

/** Voice ids used by the published lessons: the first and last recorded page of each subject. */
async function voicesInUse(ctx) {
  const catalog = await ctx.catalog();
  const indexes = await getAllSubjects(catalog);
  const keys = new Set();
  for (const idx of indexes) {
    const recorded = idx.order.filter((k) => idx.lessons.get(k).hasAudio);
    if (recorded.length) { keys.add(recorded[0]); keys.add(recorded[recorded.length - 1]); }
  }
  const lessons = await Promise.allSettled([...keys].map((k) => getLesson(k)));
  const ids = new Set();
  for (const r of lessons) if (r.status === 'fulfilled' && r.value && r.value.voice) ids.add(r.value.voice);
  return [...ids].sort();
}

function section(id, title, ...body) {
  return h('section', { class: 'about-section', 'aria-labelledby': id },
    h('h2', { id }, title), ...body);
}

function ext(url, label) {
  return h('a', { href: url, rel: 'noopener', target: '_blank' }, label);
}

export async function renderAbout(ctx) {
  const voiceList = h('ul', { class: 'credit-list', 'aria-live': 'polite' },
    h('li', { class: 'muted' }, 'Checking which voices the published lessons use…'));

  const el = h('div', { class: 'wrap narrow about' },
    h('header', { class: 'page-head' },
      h('p', { class: 'eyebrow' }, 'About'),
      h('h1', null, 'About Subject Mastery'),
      h('p', { class: 'lede' },
        'Subject Mastery is a library of standard learning paths. Each subject is broken into topics and then into pages of ten minutes or less, which you can play as audio or read as text. The site keeps track of what you know, subject by subject.')),

    section('about-how', 'How it works',
      h('ul', { class: 'about-points' },
        h('li', null, icon('headphones'), h('span', null, h('strong', null, 'Listen or read. '), 'Pages play one after another, like a podcast, or read like a book.')),
        h('li', null, icon('skip'), h('span', null, h('strong', null, 'Skip what you know. '), '“Already Known” marks a page as known and moves on. It still counts.')),
        h('li', null, icon('check'), h('span', null, h('strong', null, 'See your knowledge grow. '), 'Every subject and topic has its own knowledge bar and remembers where you stopped.')),
        h('li', null, icon('calendar'), h('span', null, h('strong', null, 'Plan your study. '), 'Drag subjects into a Study Plan, then press Play.')))),

    section('about-not', 'What it is not',
      h('p', null, 'Subject Mastery is a self-study companion. It is ', h('strong', null, 'not accredited'), ', it awards no degrees or certificates, and it is ', h('strong', null, 'not a tutor'), ': nobody grades your work or answers questions.'),
      h('p', null, h('strong', null, 'Estimated IQ is a playful learning score, not a clinical IQ test. '), 'It counts the minutes of pages you have completed or marked known, and how many subjects you know at least a quarter of. It starts at 100, the high-school-graduate baseline, and rises as you learn.')),

    section('about-made', 'How the lessons are made',
      h('p', null, 'Lessons start at entry-level college and build from there. They are ', h('strong', null, 'drafted by AI and reviewed by AI'), ' against standard university outlines, then narrated. That means mistakes are possible. If you spot one, please tell us at ',
        h('a', { href: REPORT_MAIL }, 'help@batesai.org'), ' and name the page.'),
      h('p', null, 'Writers use open textbooks and course outlines only as references for scope and order. Those reference sources are listed in ',
        ext(`${REPO_URL}/blob/main/docs/SOURCES.md`, 'docs/SOURCES.md'),
        '. Nothing is copied from CC BY-NC-SA textbooks such as OpenStax; every sentence is written fresh for the ear. Bible quotations come only from public-domain translations (KJV, ASV or WEB), and the page says which.')),

    section('about-privacy', 'Your data',
      h('p', null, 'Your progress, profile and Study Plan are saved in this browser. When sign-in is available you can sign in with Google through batesai.org to keep them on every device. There are no ads and no trackers, and the site loads no outside fonts or scripts.'),
      h('p', null, linkButton('Your account and data', href.account(), { kind: 'secondary', iconName: 'user' }))),

    section('credits', 'Credits',
      h('h3', { class: 'small-h' }, 'Narration'),
      h('p', null, ext(ENGINE.url, ENGINE.name), ` (${ENGINE.licence} licence, ${ENGINE.source}). ${ENGINE.note}`),
      h('p', { class: 'muted small' }, 'Each recorded page names its voice under the player. The voices used by the published lessons are:'),
      voiceList,
      h('h3', { class: 'small-h' }, 'Everything else'),
      h('p', null, 'Published by Daniel Bates / Bates LLC, with lessons drafted by AI. Type is your device’s own system font, and the icons are drawn for this site.')),

    section('about-licence', 'Copyright and licence',
      h('p', null, '© 2026 Daniel Bates / Bates LLC. All rights reserved.'),
      h('p', null, 'The code is source-available under the PolyForm Noncommercial License 1.0.0. Commercial use needs a separate licence from Bates LLC (standard terms: 10% of the revenue it earns). See ',
        ext(REPO_URL, 'the project on GitHub'), ' or write to ', h('a', { href: 'mailto:help@batesai.org' }, 'help@batesai.org'), '.'),
      h('p', null, 'Subject Mastery is a ', ext('https://batesai.org/', 'BatesAI'), ' project.')));

  voicesInUse(ctx).then((ids) => {
    clear(voiceList);
    if (!ids.length) {
      voiceList.append(h('li', { class: 'muted' }, 'No recordings are published yet. Pages without a recording are read by your browser’s built-in voice.'));
      return;
    }
    for (const id of ids) {
      const c = voiceCredit(id);
      voiceList.append(h('li', { class: 'credit', dataset: { voice: c.id } },
        h('p', { class: 'credit-name' }, c.known ? `${c.name} voice` : c.name, c.accent ? h('span', { class: 'muted' }, ` · ${c.accent}`) : null),
        c.known
          ? h('p', { class: 'muted small' }, `Trained on ${c.dataset}. Data licence: `, c.url ? ext(c.url, c.licence) : c.licence, '.')
          : h('p', { class: 'muted small' }, 'Credit details for this voice are being added.')));
    }
    voiceList.append(h('li', { class: 'muted small' }, 'Pages without a recording yet are read by your browser’s built-in voice.'));
  }).catch(() => {
    clear(voiceList);
    voiceList.append(h('li', { class: 'muted' }, 'The voice list could not be loaded just now.'));
  });

  return {
    el,
    title: 'About',
    onMount() {
      if (/[?&]credits\b/.test(location.hash)) {
        const target = el.querySelector('#credits');
        if (target) target.scrollIntoView({ block: 'start' });
      }
    },
  };
}
