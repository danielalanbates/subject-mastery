#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""Build a small FIXTURE site for testing the web player without the real pipeline.

    python3 web/tests/make_fixture.py ~/Downloads/subject-mastery-build/fixture-dist

Copies the player (index.html, css/, js/, icons/, favicon.svg) and writes data
that follows docs/CONTRACT.md:
  - economics (available, v1 shape): 2 modules x 2 lessons; one lesson has no
    audio (speech fallback), one has no text (coming soon).
  - biology (available, v2 nested): a topic with a sub-topic, to exercise the tree.
  - a handful of planned subjects in several categories.
  - short, quiet sine-tone MP3s made with ffmpeg (-ac 1 -ar 22050 -b:a 40k).
Never run this inside Google Drive; the destination should be under ~/Downloads.
"""
import json
import os
import shutil
import subprocess
import sys

WEB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SCARCITY = """# Scarcity and Choice

Economics begins with a simple fact: we want more than we can have. Time, money, land and attention are all **limited**, while our wishes are not. That gap is called *scarcity*.

Because of scarcity, every choice has a cost. When you spend an hour studying, you give up an hour of something else.

## A closer look

Economists call the value of the best thing you gave up the _opportunity cost_. It is not always money. It can be sleep, friendship or a walk outside.

This line tries to inject markup and must show as plain text: <script>alert('x')</script> <img src=x onerror="alert(1)">

## Key ideas

- Wants are unlimited; resources are limited.
- Every choice has an opportunity cost.
- Good decisions weigh what you give up, not only what you get.
"""

OPPORTUNITY = """# Opportunity Cost

Opportunity cost is the value of the next best alternative you give up when you choose. It is the hidden price tag on every decision.

Imagine you have one free evening. You could work a shift and earn money, or you could rest. If you rest, the money you did not earn is part of your cost.

## Key ideas

- The cost of a choice is the best option you gave up.
- Costs include time and effort, not only money.
"""

SUPPLY = """# Supply and Demand

Prices in a market come from two forces. **Demand** describes how much buyers want at each price. **Supply** describes how much sellers offer at each price.

When the two meet, the market settles at an equilibrium price. If the price is too high, goods go unsold. If it is too low, shelves run empty.

## Key ideas

- Demand falls as price rises.
- Supply rises as price rises.
- Equilibrium is where they meet.
"""

LIFE = """# What Is Life

Biologists list a few signs of life: order, growth, response to the surroundings, reproduction and the use of energy.

None of these alone is enough. A crystal grows, and fire uses energy, but neither is alive.
"""

CELL = """# The Cell

Every living thing is made of one or more cells. The cell is the smallest unit that can carry out all the processes of life.

> Omne vivum ex vivo: all life comes from life.
"""

LIPIDS = """# Lipids and Membranes

A cell membrane is a thin double layer of lipids. Each lipid has a head that likes water and two tails that avoid it, so the layer forms on its own.
"""

DNA = """# DNA

DNA stores the instructions for building and running a living thing. It is written in four chemical letters, read three at a time.
"""


def words(md):
    return len([w for w in md.replace('#', ' ').split() if w.strip()])


def tone(path, seconds, freq):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    subprocess.run([
        'ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', f'sine=frequency={freq}:duration={seconds}',
        '-af', 'volume=0.04', '-ac', '1', '-ar', '22050', '-b:a', '40k', path,
    ], check=True)


def main(dest):
    dest = os.path.abspath(os.path.expanduser(dest))
    if 'GoogleDrive' in dest or 'CloudStorage' in dest:
        sys.exit('Refusing to build inside Google Drive. Use ~/Downloads/subject-mastery-build/.')
    if os.path.exists(dest):
        shutil.rmtree(dest)
    os.makedirs(dest)
    for item in ('index.html', 'favicon.svg'):
        shutil.copy2(os.path.join(WEB, item), dest)
    for folder in ('css', 'js', 'icons'):
        shutil.copytree(os.path.join(WEB, folder), os.path.join(dest, folder))

    lessons = {
        # key: (title, markdown, audio seconds or None, has_text)
        'economics/m01-foundations/l01-scarcity-and-choice': ('Scarcity and Choice', SCARCITY, 20, True),
        'economics/m01-foundations/l02-opportunity-cost': ('Opportunity Cost', OPPORTUNITY, None, True),
        'economics/m02-markets/l01-supply-and-demand': ('Supply and Demand', SUPPLY, 6, True),
        'economics/m02-markets/l02-price-signals': ('Price Signals', None, None, False),
        'biology/m01-cells/l01-what-is-life': ('What Is Life', LIFE, 5, True),
        'biology/m01-cells/l02-the-cell': ('The Cell', CELL, None, True),
        'biology/m01-cells/t01-membranes/l01-lipids': ('Lipids and Membranes', LIPIDS, 5, True),
        'biology/m02-genetics/l01-dna': ('DNA', DNA, 5, True),
    }

    def lesson_entry(key, summary):
        title, md, secs, has_text = lessons[key]
        minutes = max(1, round(words(md) / 150)) if md else 6
        return {
            'id': key.split('/')[-1], 'title': title, 'summary': summary, 'key': key,
            'minutes': minutes, 'hasAudio': secs is not None, 'hasText': has_text,
        }

    economics = {
        'id': 'economics', 'title': 'Economics', 'tagline': 'How people, firms and nations choose under scarcity.',
        'description': 'A standard introductory path through microeconomics and macroeconomics, written to be heard. Start with scarcity and choice and work up to markets.',
        'category': 'Social Sciences', 'color': '#1f6feb',
        'modules': [
            {'id': 'm01-foundations', 'title': 'Foundations', 'summary': 'The questions every economy must answer.',
             'lessons': [lesson_entry('economics/m01-foundations/l01-scarcity-and-choice', 'Why every choice has a cost.'),
                         lesson_entry('economics/m01-foundations/l02-opportunity-cost', 'The value of the road not taken.')]},
            {'id': 'm02-markets', 'title': 'Markets', 'summary': 'How prices coordinate millions of decisions.',
             'lessons': [lesson_entry('economics/m02-markets/l01-supply-and-demand', 'Two curves that set a price.'),
                         lesson_entry('economics/m02-markets/l02-price-signals', 'What prices tell buyers and sellers.')]},
        ],
    }
    biology = {
        'id': 'biology', 'title': 'Biology', 'tagline': 'The science of living things, from cells to ecosystems.',
        'description': 'An entry-level college path through biology. This fixture uses a nested topic to test the v2 tree.',
        'category': 'Natural Sciences', 'color': '#2f855a',
        'modules': [
            {'id': 'm01-cells', 'title': 'Cells', 'summary': 'The unit of life.',
             'lessons': [lesson_entry('biology/m01-cells/l01-what-is-life', 'The signs of life.'),
                         lesson_entry('biology/m01-cells/l02-the-cell', 'The smallest living unit.')],
             'modules': [{'id': 't01-membranes', 'title': 'Membranes', 'summary': 'The boundary of the cell.',
                          'lessons': [lesson_entry('biology/m01-cells/t01-membranes/l01-lipids', 'A self-assembling wall.')]}]},
            {'id': 'm02-genetics', 'title': 'Genetics', 'summary': 'How traits pass on.',
             'lessons': [lesson_entry('biology/m02-genetics/l01-dna', 'The molecule of heredity.')]},
        ],
    }

    def count(node):
        n = len(node.get('lessons', []))
        mins = sum(l['minutes'] for l in node.get('lessons', []))
        for m in node.get('modules', []):
            a, b = count(m)
            n += a
            mins += b
        return n, mins

    catalog_subjects = []
    for s in (economics, biology):
        n, mins = count(s)
        catalog_subjects.append({'id': s['id'], 'title': s['title'], 'tagline': s['tagline'], 'category': s['category'],
                                 'status': 'available', 'moduleCount': len(s['modules']), 'lessonCount': n,
                                 'minutes': mins, 'color': s['color'], 'description': s['description']})
    planned = [
        ('world-history', 'World History', 'Humanities'), ('biblical-studies', 'Biblical Studies & Theology', 'Religion & Theology'),
        ('chemistry', 'Chemistry', 'Natural Sciences'), ('physics', 'Physics', 'Natural Sciences'),
        ('psychology', 'Psychology', 'Social Sciences'), ('philosophy', 'Philosophy', 'Humanities'),
        ('calculus', 'Calculus', 'Mathematics'), ('statistics', 'Statistics', 'Mathematics'),
    ]
    for sid, title, cat in planned:
        catalog_subjects.append({'id': sid, 'title': title, 'tagline': f'An introductory path through {title.lower()}.', 'category': cat, 'status': 'planned'})

    data = os.path.join(dest, 'data')
    os.makedirs(os.path.join(data, 'subjects'))
    with open(os.path.join(data, 'catalog.json'), 'w') as f:
        json.dump({'version': 1, 'subjects': catalog_subjects}, f, indent=1)
    for s in (economics, biology):
        with open(os.path.join(data, 'subjects', f"{s['id']}.json"), 'w') as f:
            json.dump(s, f, indent=1)

    for key, (title, md, secs, has_text) in lessons.items():
        if not has_text:
            continue
        audio_rel = f'audio/{key}.mp3' if secs else None
        if secs:
            tone(os.path.join(dest, audio_rel), secs, 330 + 40 * (len(key) % 7))
        path = os.path.join(data, 'lessons', key + '.json')
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w') as f:
            json.dump({'key': key, 'title': title, 'markdown': md, 'words': words(md),
                       'minutes': max(1, round(words(md) / 150)), 'audio': audio_rel,
                       'durationSec': secs, 'voice': 'fixture:sine'}, f, indent=1)
    print('fixture written to', dest)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Downloads/subject-mastery-build/fixture-dist'))
