# Content status

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved. · help@batesai.org · https://batesai.org

_Updated 2026-10-27. Ten subjects are available, with 639 pages, every one recorded with the John voice. Calculus and Physics are fully drafted and expert-reviewed but stay planned until they are narrated. Every written lesson has an expert-review record: the four pilots were reviewed by hand on 2026-10-02, and the other eight on 2026-10-27 (docs/EXPERT_REVIEW.md). Regenerate the table with `SM_AUDIO_DIR=<John audio folder> python3 -B pipeline/status.py --write-doc`._

<!-- STATUS-TABLE -->
| Subject | Modules | Lessons written | With audio | Audio minutes | Hand-reviewed | Draft models |
|---|---|---|---|---|---|---|
| Economics | 12 | 61/61 | 61 | 434 | 61 | gemini:gemini-3.5-flash-lite (55), groq:openai/gpt-oss-120b (3), gemini:gemini-3.5-flash (2), gemini:gemini-3-flash-preview (1) |
| Biology | 12 | 61/61 | 61 | 442 | 61 | gemini:gemini-3.5-flash-lite (50), gemini:gemini-3-flash-preview (5), gemini:gemini-3.1-flash-lite (4), groq:openai/gpt-oss-120b (1), gemini:gemini-3.6-flash (1) |
| World History | 12 | 63/63 | 63 | 473 | 63 | gemini:gemini-3.5-flash-lite (47), gemini:gemini-3.1-flash-lite (10), groq:openai/gpt-oss-120b (4), gemini:gemini-3.5-flash (2) |
| Biblical Studies & Theology | 12 | 65/65 | 65 | 449 | 65 | gemini:gemini-3.5-flash-lite (53), gemini:gemini-3.1-flash-lite (7), groq:openai/gpt-oss-120b (3), gemini:gemini-3-flash-preview (1), gemini:gemini-3.5-flash (1) |
| Mathematics | 12 | 66/66 | 66 | 445 | 66 | gemini:gemini-3.5-flash-lite (53), gemini:gemini-3.1-flash-lite (13) |
| Psychology | 12 | 68/68 | 68 | 458 | 68 | gemini:gemini-3.1-flash-lite (68) |
| US History | 12 | 66/66 | 66 | 461 | 66 | gemini:gemini-3.1-flash-lite (66) |
| Chemistry | 12 | 63/63 | 63 | 408 | 63 | gemini:gemini-3.1-flash-lite (63) |
| Computer Science | 12 | 60/60 | 60 | 384 | 60 | gemini:gemini-3.1-flash-lite (60) |
| Church History | 12 | 66/66 | 66 | 433 | 66 | gemini:gemini-3.1-flash-lite (66) |
| Calculus | 12 | 59/59 | 0 | 0 | 59 | gemini:gemini-3.5-flash-lite (45), gemini:gemini-3-flash-preview (8), gemini:gemini-3.6-flash (3), gemini:gemini-2.5-flash (1), gemini:gemini-3.8-flash (1), gemini:gemini-3.7-flash (1) |
| Physics | 12 | 58/58 | 0 | 0 | 58 | gemini:gemini-3.5-flash-lite (50), gemini:gemini-3.5-flash (4), gemini:gemini-2.5-flash (3), gemini:gemini-3-flash-preview (1) |
| **All** | 144 | 756/756 | 639 | 4386 | 756 | |

Per module:

**Economics**

- `m01-foundations` Foundations of Economic Thinking: 5/5 written, 5 audio, 5 hand-reviewed
- `m02-supply-and-demand` Supply, Demand and Markets: 5/5 written, 5 audio, 5 hand-reviewed
- `m03-elasticity-and-consumer-choice` Elasticity and Consumer Choice: 5/5 written, 5 audio, 5 hand-reviewed
- `m04-costs-and-market-structure` Production Costs and Market Structure: 5/5 written, 5 audio, 5 hand-reviewed
- `m05-market-failure-and-policy` Market Failures and Government Policy: 5/5 written, 5 audio, 5 hand-reviewed
- `m06-labor-inequality-and-public-choice` Labor, Inequality and Public Choice: 5/5 written, 5 audio, 5 hand-reviewed
- `m07-measuring-the-macroeconomy` Measuring the Macroeconomy: 5/5 written, 5 audio, 5 hand-reviewed
- `m08-aggregate-demand-and-supply` Aggregate Demand and Supply: 5/5 written, 5 audio, 5 hand-reviewed
- `m09-money-banking-and-monetary-policy` Money, Banking and Monetary Policy: 5/5 written, 5 audio, 5 hand-reviewed
- `m10-fiscal-policy-and-budgets` Fiscal Policy and Government Budgets: 5/5 written, 5 audio, 5 hand-reviewed
- `m11-international-economics` International Trade and Finance: 6/6 written, 6 audio, 6 hand-reviewed
- `m12-schools-evidence-and-open-questions` Schools, Evidence and Open Questions: 5/5 written, 5 audio, 5 hand-reviewed

**Biology**

- `m01-chemistry-of-life` Chemical Foundations of Life: 5/5 written, 5 audio, 5 hand-reviewed
- `m02-the-cell` The Cell and Its Membrane: 6/6 written, 6 audio, 6 hand-reviewed
- `m03-energy-and-metabolism` Cellular Energetics and Metabolism: 6/6 written, 6 audio, 6 hand-reviewed
- `m04-cell-division-and-heredity` Cell Division and Heredity: 5/5 written, 5 audio, 5 hand-reviewed
- `m05-molecular-genetics` Molecular Genetics and Gene Expression: 5/5 written, 5 audio, 5 hand-reviewed
- `m06-evolution` Evolution: 5/5 written, 5 audio, 5 hand-reviewed
- `m07-microbes-and-fungi` Microbial and Fungal Diversity: 4/4 written, 4 audio, 4 hand-reviewed
- `m08-plant-and-animal-diversity` Plant and Animal Diversity: 4/4 written, 4 audio, 4 hand-reviewed
- `m09-how-plants-work` How Plants Work: 5/5 written, 5 audio, 5 hand-reviewed
- `m10-animal-body-and-control-systems` The Animal Body and Its Control Systems: 5/5 written, 5 audio, 5 hand-reviewed
- `m11-animal-organ-systems` Animal Organ Systems and Defense: 6/6 written, 6 audio, 6 hand-reviewed
- `m12-ecology-and-conservation` Ecology and Conservation Biology: 5/5 written, 5 audio, 5 hand-reviewed

**World History**

- `m01-historical-thinking-and-human-origins` Historical Thinking and Human Origins: 4/4 written, 4 audio, 4 hand-reviewed
- `m02-first-civilizations` The First Urban Civilizations: 5/5 written, 5 audio, 5 hand-reviewed
- `m03-classical-mediterranean-and-persia` The Classical Mediterranean and Persia: 5/5 written, 5 audio, 5 hand-reviewed
- `m04-classical-asia-africa-americas` Classical Asia, Africa and the Americas: 6/6 written, 6 audio, 6 hand-reviewed
- `m05-age-of-faiths` An Age of Faiths, 500 to 1200: 4/4 written, 4 audio, 4 hand-reviewed
- `m06-post-classical-states` Post-Classical States and Networks: 6/6 written, 6 audio, 6 hand-reviewed
- `m07-global-middle-ages` A Global Middle Ages, 1200 to 1500: 5/5 written, 5 audio, 5 hand-reviewed
- `m08-connections-across-continents` Connections Across Continents, 1450 to 1750: 6/6 written, 6 audio, 6 hand-reviewed
- `m09-early-modern-transformations` Early Modern Transformations: 5/5 written, 5 audio, 5 hand-reviewed
- `m10-age-of-revolution` The Age of Revolution, 1750 to 1900: 6/6 written, 6 audio, 6 hand-reviewed
- `m11-nationalism-and-imperialism` Nationalism and Global Imperialism: 5/5 written, 5 audio, 5 hand-reviewed
- `m12-modern-world` The Modern World, 1914 to the Present: 6/6 written, 6 audio, 6 hand-reviewed

**Biblical Studies & Theology**

- `m01-foundations-of-theology` Foundations of Theology: 5/5 written, 5 audio, 5 hand-reviewed
- `m02-the-bible` The Bible: Canon, Text and Interpretation: 5/5 written, 5 audio, 5 hand-reviewed
- `m03-torah-and-history-of-israel` The Torah and the Story of Israel: 5/5 written, 5 audio, 5 hand-reviewed
- `m04-poetry-wisdom-and-prophets` Poetry, Wisdom and the Prophets: 5/5 written, 5 audio, 5 hand-reviewed
- `m05-gospels-and-jesus` The Gospels and the Life of Jesus: 5/5 written, 5 audio, 5 hand-reviewed
- `m06-acts-and-letters` Acts and the Letters: 6/6 written, 6 audio, 6 hand-reviewed
- `m07-creeds-and-councils` The Historic Creeds and Councils: 6/6 written, 6 audio, 6 hand-reviewed
- `m08-god-and-creation` God, Creation and Humanity: 5/5 written, 5 audio, 5 hand-reviewed
- `m09-christ-and-salvation` Christ and Salvation: 5/5 written, 5 audio, 5 hand-reviewed
- `m10-spirit-church-and-last-things` The Spirit, the Church and Last Things: 6/6 written, 6 audio, 6 hand-reviewed
- `m11-church-history` Church History: 6/6 written, 6 audio, 6 hand-reviewed
- `m12-apologetics-and-ethics` Apologetics and Christian Ethics: 6/6 written, 6 audio, 6 hand-reviewed

**Mathematics**

- `m01-numbers-and-mathematical-thinking` Numbers and Mathematical Thinking: 5/5 written, 5 audio, 5 hand-reviewed
- `m02-algebraic-expressions` Algebraic Expressions: 6/6 written, 6 audio, 6 hand-reviewed
- `m03-equations-and-inequalities` Equations and Inequalities: 6/6 written, 6 audio, 6 hand-reviewed
- `m04-coordinates-and-lines` Coordinates and Lines: 5/5 written, 5 audio, 5 hand-reviewed
- `m05-functions` Functions: 6/6 written, 6 audio, 6 hand-reviewed
- `m06-polynomial-and-rational-functions` Polynomial and Rational Functions: 6/6 written, 6 audio, 6 hand-reviewed
- `m07-exponential-and-logarithmic-functions` Exponential and Logarithmic Functions: 6/6 written, 6 audio, 6 hand-reviewed
- `m08-trigonometric-functions` Trigonometric Functions: 5/5 written, 5 audio, 5 hand-reviewed
- `m09-trigonometric-identities-and-applications` Trigonometric Identities and Applications: 5/5 written, 5 audio, 5 hand-reviewed
- `m10-systems-and-conic-sections` Systems of Equations and Conic Sections: 5/5 written, 5 audio, 5 hand-reviewed
- `m11-sequences-counting-and-probability` Sequences, Series, Counting and Probability: 6/6 written, 6 audio, 6 hand-reviewed
- `m12-proof-and-mathematical-reasoning` Proof and Mathematical Reasoning: 5/5 written, 5 audio, 5 hand-reviewed

**Psychology**

- `m01-psychology-as-a-science` Psychology as a Science: 6/6 written, 6 audio, 6 hand-reviewed
- `m02-biology-of-behavior` The Biology of Behavior: 5/5 written, 5 audio, 5 hand-reviewed
- `m03-states-of-consciousness` States of Consciousness: 5/5 written, 5 audio, 5 hand-reviewed
- `m04-sensation-and-perception` Sensation and Perception: 6/6 written, 6 audio, 6 hand-reviewed
- `m05-learning-and-memory` Learning and Memory: 6/6 written, 6 audio, 6 hand-reviewed
- `m06-thinking-language-and-intelligence` Thinking, Language and Intelligence: 6/6 written, 6 audio, 6 hand-reviewed
- `m07-lifespan-development` Lifespan Development: 6/6 written, 6 audio, 6 hand-reviewed
- `m08-motivation-emotion-and-stress` Motivation, Emotion and Stress: 5/5 written, 5 audio, 5 hand-reviewed
- `m09-personality` Personality: 5/5 written, 5 audio, 5 hand-reviewed
- `m10-social-psychology` Social Psychology: 6/6 written, 6 audio, 6 hand-reviewed
- `m11-psychological-disorders` Psychological Disorders: 6/6 written, 6 audio, 6 hand-reviewed
- `m12-therapy-and-treatment` Therapy and Treatment: 6/6 written, 6 audio, 6 hand-reviewed

**US History**

- `m01-native-america-and-the-atlantic-world` Native America and the Atlantic World: 5/5 written, 5 audio, 5 hand-reviewed
- `m02-the-english-colonies` The English Colonies: 6/6 written, 6 audio, 6 hand-reviewed
- `m03-the-road-to-revolution` The Road to Revolution: 5/5 written, 5 audio, 5 hand-reviewed
- `m04-creating-a-nation` Creating a Nation: 6/6 written, 6 audio, 6 hand-reviewed
- `m05-markets-democracy-and-reform` Markets, Democracy and Reform: 5/5 written, 5 audio, 5 hand-reviewed
- `m06-expansion-and-sectional-crisis` Expansion and Sectional Crisis: 5/5 written, 5 audio, 5 hand-reviewed
- `m07-civil-war-and-reconstruction` Civil War and Reconstruction: 6/6 written, 6 audio, 6 hand-reviewed
- `m08-the-west-and-the-gilded-age` The West and the Gilded Age: 5/5 written, 5 audio, 5 hand-reviewed
- `m09-populism-empire-and-progressivism` Populism, Empire and Progressivism: 5/5 written, 5 audio, 5 hand-reviewed
- `m10-boom-depression-and-world-war` Boom, Depression and World War: 6/6 written, 6 audio, 6 hand-reviewed
- `m11-cold-war-and-civil-rights` Cold War and Civil Rights: 6/6 written, 6 audio, 6 hand-reviewed
- `m12-recent-america` Recent America: 6/6 written, 6 audio, 6 hand-reviewed

**Chemistry**

- `m01-matter-and-measurement` Matter and Measurement: 4/4 written, 4 audio, 4 hand-reviewed
- `m02-atoms-molecules-and-ions` Atoms, Molecules and Ions: 5/5 written, 5 audio, 5 hand-reviewed
- `m03-moles-and-chemical-reactions` Moles and Chemical Reactions: 6/6 written, 6 audio, 6 hand-reviewed
- `m04-thermochemistry` Thermochemistry: 4/4 written, 4 audio, 4 hand-reviewed
- `m05-electronic-structure-and-periodic-trends` Electronic Structure and Periodic Trends: 5/5 written, 5 audio, 5 hand-reviewed
- `m06-chemical-bonding-and-molecular-shape` Chemical Bonding and Molecular Shape: 6/6 written, 6 audio, 6 hand-reviewed
- `m07-gases` Gases: 4/4 written, 4 audio, 4 hand-reviewed
- `m08-liquids-solids-and-solutions` Liquids, Solids and Solutions: 6/6 written, 6 audio, 6 hand-reviewed
- `m09-reaction-rates-and-equilibrium` Reaction Rates and Equilibrium: 6/6 written, 6 audio, 6 hand-reviewed
- `m10-acids-bases-and-solubility` Acids, Bases and Solubility Equilibria: 5/5 written, 5 audio, 5 hand-reviewed
- `m11-thermodynamics-and-electrochemistry` Thermodynamics and Electrochemistry: 6/6 written, 6 audio, 6 hand-reviewed
- `m12-organic-and-nuclear-chemistry` Organic and Nuclear Chemistry: 6/6 written, 6 audio, 6 hand-reviewed

**Computer Science**

- `m01-computational-thinking-and-history` Computational Thinking and History: 4/4 written, 4 audio, 4 hand-reviewed
- `m02-data-representation-and-compression` Data Representation and Compression: 5/5 written, 5 audio, 5 hand-reviewed
- `m03-how-computers-work` How Computers Work: 5/5 written, 5 audio, 5 hand-reviewed
- `m04-programming-concepts` Programming Concepts in Plain Words: 6/6 written, 6 audio, 6 hand-reviewed
- `m05-algorithms-and-efficiency` Algorithms and Efficiency: 6/6 written, 6 audio, 6 hand-reviewed
- `m06-data-structures` Data Structures: 5/5 written, 5 audio, 5 hand-reviewed
- `m07-limits-of-computation` Limits of Computation: 4/4 written, 4 audio, 4 hand-reviewed
- `m08-networks-and-the-internet` Networks and the Internet: 5/5 written, 5 audio, 5 hand-reviewed
- `m09-security-and-cryptography` Security and Cryptography: 5/5 written, 5 audio, 5 hand-reviewed
- `m10-databases-and-data` Databases and Data: 4/4 written, 4 audio, 4 hand-reviewed
- `m11-software-engineering` Software Engineering: 5/5 written, 5 audio, 5 hand-reviewed
- `m12-artificial-intelligence-and-ethics` Artificial Intelligence and Ethics: 6/6 written, 6 audio, 6 hand-reviewed

**Church History**

- `m01-the-apostolic-church` The Apostolic Church: 5/5 written, 5 audio, 5 hand-reviewed
- `m02-the-church-of-the-martyrs` The Church of the Martyrs: 5/5 written, 5 audio, 5 hand-reviewed
- `m03-constantine-and-the-imperial-church` Constantine and the Imperial Church: 4/4 written, 4 audio, 4 hand-reviewed
- `m04-fathers-councils-and-divisions` Fathers, Councils and Divisions: 5/5 written, 5 audio, 5 hand-reviewed
- `m05-the-early-medieval-church` The Early Medieval Church: 6/6 written, 6 audio, 6 hand-reviewed
- `m06-the-high-medieval-church` The High Medieval Church: 6/6 written, 6 audio, 6 hand-reviewed
- `m07-the-late-medieval-church` The Late Medieval Church: 5/5 written, 5 audio, 5 hand-reviewed
- `m08-the-protestant-reformations` The Protestant Reformations: 6/6 written, 6 audio, 6 hand-reviewed
- `m09-catholic-reform-and-the-confessional-age` Catholic Reform and the Confessional Age: 6/6 written, 6 audio, 6 hand-reviewed
- `m10-enlightenment-revival-and-missions` Enlightenment, Revival and Missions: 6/6 written, 6 audio, 6 hand-reviewed
- `m11-the-church-in-the-modern-world` The Church in the Modern World: 6/6 written, 6 audio, 6 hand-reviewed
- `m12-global-christianity-today` Global Christianity Today: 6/6 written, 6 audio, 6 hand-reviewed

**Calculus**

- `m01-functions-and-limits-foundations` Functions and Limits Foundations: 4/4 written, 0 audio, 4 hand-reviewed
- `m02-limits-and-continuity` Limits and Continuity: 5/5 written, 0 audio, 5 hand-reviewed
- `m03-derivative` The Derivative: 5/5 written, 0 audio, 5 hand-reviewed
- `m04-differentiation-rules` Differentiation Rules: 5/5 written, 0 audio, 5 hand-reviewed
- `m05-applications-of-derivatives` Applications of Derivatives: 6/6 written, 0 audio, 6 hand-reviewed
- `m06-integral` The Integral: 5/5 written, 0 audio, 5 hand-reviewed
- `m07-applications-of-integration` Applications of Integration: 5/5 written, 0 audio, 5 hand-reviewed
- `m08-techniques-of-integration` Techniques of Integration: 5/5 written, 0 audio, 5 hand-reviewed
- `m09-differential-equations` Differential Equations: 5/5 written, 0 audio, 5 hand-reviewed
- `m10-sequences-and-series` Sequences and Series: 5/5 written, 0 audio, 5 hand-reviewed
- `m11-power-series` Power Series: 4/4 written, 0 audio, 4 hand-reviewed
- `m12-parametric-and-polar-curves` Parametric and Polar Curves: 5/5 written, 0 audio, 5 hand-reviewed

**Physics**

- `m01-foundations-of-physical-measurement` Foundations of Physical Measurement: 4/4 written, 0 audio, 4 hand-reviewed
- `m02-motion-in-one-dimension` Motion in One Dimension: 5/5 written, 0 audio, 5 hand-reviewed
- `m03-motion-in-two-dimensions` Motion in Two Dimensions: 4/4 written, 0 audio, 4 hand-reviewed
- `m04-forces-and-newtons-laws` Forces and Newton's Laws: 6/6 written, 0 audio, 6 hand-reviewed
- `m05-work-and-energy` Work and Energy: 5/5 written, 0 audio, 5 hand-reviewed
- `m06-momentum-and-rotational-motion` Momentum and Rotational Motion: 5/5 written, 0 audio, 5 hand-reviewed
- `m07-fluids-and-thermodynamics` Fluids and Thermodynamics: 5/5 written, 0 audio, 5 hand-reviewed
- `m08-oscillations-and-waves` Oscillations and Waves: 5/5 written, 0 audio, 5 hand-reviewed
- `m09-electricity-and-circuits` Electricity and Circuits: 5/5 written, 0 audio, 5 hand-reviewed
- `m10-magnetism-and-electromagnetism` Magnetism and Electromagnetism: 5/5 written, 0 audio, 5 hand-reviewed
- `m11-light-and-optics` Light and Optics: 4/4 written, 0 audio, 4 hand-reviewed
- `m12-modern-physics` Modern Physics: 5/5 written, 0 audio, 5 hand-reviewed
<!-- /STATUS-TABLE -->

## How to resume

Everything is resumable. Finished lessons are skipped and audio re-renders only when text changes.
See `pipeline/README.md` for details.

```sh
cd ~/Downloads/subject-mastery-build
P="$SM_REPO/pipeline"
W=~/Downloads/subject-mastery-build/work            # local mirror (Drive can stall reads)
cp "$P"/*.py $W/pipeline/ && python3 -B $W/pipeline/sync_content.py pull
cd $W && SM_CONTENT_DIR=$W/content python3 -B pipeline/write_lessons.py --wait-hours 12   # next lessons
SM_CONTENT_DIR=$W/content python3 -B pipeline/write_lessons.py --rereview-weak             # stronger 2nd review
SM_CONTENT_DIR=$W/content python3 -B pipeline/check_quotes.py                              # Bible quotes vs KJV/WEB/ASV
SM_CONTENT_DIR=$W/content python3 -B pipeline/tts.py                                       # audio
SM_CONTENT_DIR=$W/content python3 -B pipeline/build.py                                     # dist/
python3 -B pipeline/sync_content.py push                                                   # mirror -> repo
```

Free quotas reset daily. Gemini resets at midnight Pacific; Groq and OpenRouter use rolling windows.
`python3 pipeline/llm.py state` shows which models are cooling down and why.

## Outlines (hand-reviewed)

All four outlines were generated by Gemini (`gemini-3.5-flash` for Economics and Biology,
`gemini-3-flash-preview` for World History and Theology). Each was then reviewed and edited by
hand on 2026-10-02. The edit is recorded in `archive/2026-10-02_hand_edit_outlines.py`, and the
untouched LLM outlines are in `~/Downloads/subject-mastery-build/logs/content-outline-llm-original/`.
Main changes:

- **Economics:** lesson 1 widened to "the economic way of thinking" (models, the margin,
  positive/normative). Comparative advantage moved out of module 1, which now has
  "Specialization, Trade and Markets", so it is not taught twice. Elasticity applications were
  moved before utility. Environmental policy now follows negative externalities. Exchange
  rates moved to the international module. A "Financial Markets" lesson was added. Behavioral
  economics is no longer duplicated in the capstone, which has "Institutions and Economic
  Development" instead.
- **Biology:** macromolecules were split into two lessons. Cytoskeleton/junctions, cell
  signaling, cell-cycle control and cancer were added. Respiratory and circulatory systems were
  split apart.
- **World History:** "West vs East" classical modules were regrouped (Mediterranean and Persia;
  Asia, Africa and the Americas). Added: Judaism and the rise of Christianity, classical Asian
  religions and philosophies, Japan/Korea/Southeast Asia, the medieval church and Crusades,
  Renaissance Europe, conquest of the Americas, industrial society and ideologies, and Qing
  decline and the Opium Wars, so the story is not Europe-only and not religion-blind.
- **Theology:** reordered to follow the SOURCES.md suggested path. Added: Paul's life and
  mission, the Rule of Faith and early controversies, Reformation-era confessions, grace,
  election and free will (Augustine/Pelagius, Calvinist/Arminian), sanctification, resurrection
  and new creation, medieval church and scholasticism, and the problem of evil (moved out of the
  doctrine of creation). "Justification across the traditions" now includes Orthodox theosis.

Totals: Economics 12 modules / 61 lessons, Biology 12 / 61, World History 12 / 63,
Theology 12 / 65 (250 lessons).

## Voice choice (2026-10-02)

The A/B test ran on two finished lessons with `tts.py compare`. Intelligibility was measured by
transcribing each render with Groq's free Whisper large-v3 and computing the word error rate
against the script.

| Voice | Theology lesson WER | Economics lesson WER | Render speed |
|---|---|---|---|
| en_US-ryan-high | 3.5% | 1.6% | 2.8 to 3.9x realtime (about 2 min per lesson) |
| **en_US-lessac-medium** | **2.8%** | **1.5%** | **20 to 29x realtime (about 15 s per lesson)** |

**Chosen: `en_US-lessac-medium`.** It was at least as intelligible on both lessons and renders
about 7x faster. That is what makes a few hundred lessons practical on this 8 GB Mac. A human
has not yet listened to compare naturalness. ryan-high may sound richer, and `--voice
en_US-ryan-high` re-renders everything if Daniel prefers it. Pace is `length_scale 1.15`, which
measured about 160 words per minute including pauses. The player's rate control can go faster.

## Quality notes: what the automation gets wrong

Claude read all 250 lessons in full on 2026-10-02 and corrected 211 of them. Most fixes are small (a date, a
number, a missing caveat), but many are real errors a learner would have absorbed. Every fix is listed below with
the reason. The patterns:

- **Groq gpt-oss drafts reviewed by Groq Qwen were the worst.** They had wrong prehistoric
  dates, invented attributions to named scholars, anachronisms (clay tablets before writing,
  Neolithic watermills), and Bible verses misquoted or misattributed. One theology lesson
  attributed "I and my Father are one" to the Father and cited "Mark thirty-one". It was deleted
  and regenerated.
- **A reviewer can make a lesson worse.** gpt-oss "corrected" the textbook definition of
  opportunity cost into a wrong one, and the reviser applied it. The prompts now tell reviewers
  to flag only certain errors and tell revisers that the editor can be wrong.
- **Flash-lite reviewers pass everything** (0 issues), so lite and Qwen reviews count as
  "weak". `write_lessons.py --rereview-weak` gives those lessons a second review later.
- Routing since 12:15: drafts come from Gemini (full flash, then flash-lite), reviews from a
  different model family (gpt-oss for Gemini drafts, full Gemini for others), and revisions
  from Gemini.
- **The late flash-lite drafts were no better.** Modules 11 and 12 (drafted by Gemini flash-lite, reviewed by
  OpenRouter nemotron or Gemini flash) still needed fixes in nearly every lesson. Examples: an arithmetic slip
  (a 40-point rise called "40 percent"), the July 1914 crisis in the wrong order, "most scholars use" the
  minimal-facts method (it is one apologist's method), Nuremberg credited with prosecuting genocide, Quakers
  called Anabaptists, Luther credited with Calvin's view of the intermediate state, and a garbled "incense to
  anvil the emperor". Recurring kinds: invented precision (rates, death tolls given as one number), one school
  or tradition caricatured, schools named for views they do not hold, and one-sided claims without the main
  counter-view.
- **Bible paraphrases labelled as a translation** were the most common theology fault: about 18 passages in 11 lessons.
  `check_quotes.py` verifies every quoted passage word for word against the real KJV/WEB/ASV text from
  ebible.org, and its NOQUOTE check now flags any sentence that names a translation plus a verse (or says
  "says", "writes" and so on) without quotation marks. Paraphrases that name no translation are still not
  checked.
- **Spelled-out years.** `write_lessons.py` turns "in fifteen forty-six" into "1546" when it saves a lesson.
  Older lessons were normalized in one pass on 2026-10-02 (16 files; the speech text, and therefore the audio,
  is identical). `tts.py` now reads "June 28, 1914" as "June twenty-eighth".

<!-- HAND-EDITS -->
### Hand edits (576)

- economics/m01-foundations/l02-opportunity-cost: reviewer (gpt-oss) had pushed a wrong definition (opportunity cost excludes the ticket / tuition). Restored textbook definition: opportunity cost = explicit + implicit costs (festival 110 dollars, college 45,000); removed "visual representation".
- economics/m01-foundations/l03-budget-constraint: removed "price ratio, also called the marginal rate of transformation" (MRT is the PPF slope); replaced symbol-letter equation (P S times Q S...) with words; clarified the pivot point.
- economics/m01-foundations/l04-production-possibilities-frontier: worked example was a straight line while claiming increasing cost -> new bowed numbers (50 cars/150 computers, 80/90); car-only technology "swings the frontier outward except at the all-computer end", not "whole curve shifts"; removed "drawn as a curve / single picture".
- economics/m01-foundations/l05-specialization-trade-and-markets: contradictory opening (friends already specialized) fixed; island example is absolute advantage, so it now says so and points to the later comparative-advantage lesson.
- biology/m01-chemistry-of-life/l02-atoms-and-chemical-bonds: charcoal is not pure carbon -> graphite vs diamond; electron position sentence no longer blames speed.
- world-history/m01-historical-thinking-and-human-origins/l02-human-origins-and-paleolithic-life: (gpt-oss draft, Qwen review passed it) fixed Out-of-Africa chronology (pan-African origin ~300k; early Levant forays ~180k; main dispersal 60-70k; Australia ~50k; Europe ~45k), Oldowan 2.6 Mya not 3 Mya, Blombos ~75k, Americas by >=14.5k (Monte Verde) not ~10k, key ideas.
- world-history/m01-historical-thinking-and-human-origins/l03-neolithic-revolution: (gpt-oss draft, Qwen review) removed invented attributions to Bellwood/Flannery; bananas were domesticated in New Guinea, not imported; Fertile Crescent extent; zebu cattle instead of water buffalo in the Indus; Jericho ~8000 BCE wall/tower, removed "genetically different grains"; potato 7-8k years ago; removed anachronistic watermills; first states ~3500 BCE.
- world-history/m01-historical-thinking-and-human-origins/l04-first-villages-and-social-hierarchy: Çatalhöyük was presented as evidence of elites; scholarly view is the reverse (similar houses, household ritual) -> rewritten; metalworking/kilns made "much later".
- biology/m01-chemistry-of-life/l01-scientific-study-of-life: 'know these things for certain' -> science gives reliable, not absolute, knowledge.
- biology/m01-chemistry-of-life/l04-carbohydrates-and-lipids: myelin is lipid-rich (not 'fatty-acid-rich').
- world-history/m01-historical-thinking-and-human-origins/l01-historians-craft: farming began ~10,000 BCE (not 12,000 BCE); removed anachronistic "clay tablets" (no writing yet) from the early-farming evidence example.
- biology/m01-chemistry-of-life/l05-proteins-and-nucleic-acids: added primary and quaternary structure (lesson called secondary structure "the first level"); credited Franklin and Wilkins; lactase example now distinguishes congenital lactase deficiency (coding change) from common adult lactase non-persistence (regulation).
- biblical-studies/m01-foundations-of-theology/l03-sources-of-authority: (gpt-oss + Qwen) named the Wesleyan quadrilateral (Outler); Nicene Creed quote now exact BCP wording; removed false "Catholics say Holy Bible, Protestants say Word of God"; Apostolic Tradition is not by Clement (removed); removed wrong definition of "theology proper"; Pentecostal Spirit baptism described as tested against Scripture; Matthew 28:19 quote now names KJV.
- biblical-studies/m01-foundations-of-theology/l04-faith-and-scholarship: removed a fabricated Augustine quotation (now "believe in order to understand"); Beatitudes echo Isaiah 61 / Psalm 37 (not "prophetic tradition, Psalms of lament"); "iron sharpeneth iron" is Proverbs 27:17 (was 26:24) with exact KJV text; Pentateuch authorship positions corrected (Catholic scholarship mostly accepts composite sources); cut the Trinity paragraph for length.
- biblical-studies/m01-foundations-of-theology/l05-branches-of-theology: practical theology 'tools' -> fields; covenant theology dated to 16th-17th c. Reformed with Irenaeus as an early precedent.
- biblical-studies/m01-foundations-of-theology/l01-what-theology-is: (regenerated: gpt-oss draft, Gemini-lite review) Psalm 24:1 wording is KJV not WEB (now quoted exactly, KJV); 'Nicaea in 325'; 'scholars across the spectrum agree' -> 'believers across the traditions hold'.
- economics/m02-supply-and-demand/l01-law-of-demand: added substitution and income effects (why demand slopes down); dropped 'always slopes downward'.
- economics/m02-supply-and-demand/l04-price-controls-and-surplus: removed loaded rhetoric (mountains of goods, desperate workers, insidious); added monopsony and the Card-Krueger minimum-wage evidence; efficiency is not fairness.
- economics/m02-supply-and-demand/l03-market-equilibrium: surplus example made logical (overestimated popularity, not a 'craze'); 'disrupt this natural process' -> 'override this process'.
- biology/m02-the-cell/l01-prokaryotic-and-eukaryotic-cells: size comparison was wrong (10,000x smaller than a sand grain is smaller than a bacterium) -> about 100x.
- biology/m02-the-cell/l02-endomembrane-system-and-organelles: wording ('workers package', 'scientists understand ... likely').
- biology/m02-the-cell/l04-cell-membrane-structure: GPI was expanded wrongly ('gly-co-phospho-inositol'; it is glycosylphosphatidylinositol) and lipid-anchored proteins were called peripheral -> rewritten; syllable-hyphenated words (gly-co-calyx) restored to normal spelling; credited Singer and Nicolson 1972.
- biology/m02-the-cell/l05-membrane-transport: osmosis direction explained correctly (water diffuses toward higher solute); Na/K pump is in nearly all animal cells, 3 Na out / 2 K in; "A-T-P" -> ATP in text.
- biology/m02-the-cell/l06-cell-communication: G-protein responses take seconds, not milliseconds; "hundreds of millions of years".
- world-history/m02-first-civilizations/l01-mesopotamia: cuneiform = wedge-shaped marks from reed styluses (not wedge-shaped styluses).
- world-history/m02-first-civilizations/l02-ancient-egypt: pharaoh as divine in office/embodiment of Horus; "entire economy state-run" softened (temples, private estates); "citizens" -> subjects; added Giza workers' villages (builders were not slaves); added Old/Middle/New Kingdom periodization.
- world-history/m02-first-civilizations/l03-indus-valley: Ghaggar-Hakra is a separate river system, not an Indus tributary.
- world-history/m02-first-civilizations/l05-early-americas: added Caral / Norte Chico (~3000 BCE, older than the Olmec); Olmec "flourished by" 1200 BCE; heads "thought to portray" rulers; removed "urban" (the lesson says these were not cities).
- biblical-studies/m02-the-bible/l01-formation-of-the-canon: same 27-book NT for Catholic/Orthodox/Protestant, noting the wider Ethiopian collection.
- biblical-studies/m02-the-bible/l02-manuscripts-and-textual-criticism: Sinaiticus/Vaticanus "among the most important" (not "most reliable"); Dead Sea Scrolls date range and textual plurality (MT and LXX-type texts); "critics agree the message is secure" -> what textual critics (incl. Ehrman) actually agree on.
- biblical-studies/m02-the-bible/l03-english-bible-translations: Tyndale was executed in 1536 (lesson said he lived in exile "to avoid execution").
- biblical-studies/m02-the-bible/l04-reading-by-genre: canon counts (Orthodox vs Ethiopian 81); Revelation paragraph now describes preterist/futurist/idealist readings fairly instead of calling futurist reading a "mistake".
- biblical-studies/m02-the-bible/l05-historical-and-cultural-context: "gospel was a propaganda term" softened to the documented imperial use of euangelion (Priene/Augustus); Caesar-vs-Jesus and household-code claims attributed as scholarly arguments/debates.
- economics/m03 l01-l03: small wording fixes (revenue numbers stated; luxury-good sentence; gas stations 'pass along' not 'absorb' price rises).
- economics/m03-elasticity-and-consumer-choice/l01-price-elasticity-of-demand: revenue numbers stated.
- economics/m03-elasticity-and-consumer-choice/l02-other-elasticities: luxury-good sentence repaired.
- economics/m03-elasticity-and-consumer-choice/l03-elasticity-in-the-real-world: gas stations "pass along" price rises.
- biology/m03-energy-and-metabolism/l01-energy-atp-and-enzymes: ATP energy explained as more-stable products (not an "exceptionally unstable bond").
- biology/m03-energy-and-metabolism/l02-glycolysis-and-citric-acid-cycle: citrate is converted back within one turn (not "several turns"), named oxaloacetate; pyruvate oxidation also yields NADH; FADH2 spelling.
- biology/m03-energy-and-metabolism/l03-oxidative-phosphorylation: "A T P" -> ATP in text; added total yield (~30-32 ATP per glucose).
- biology/m03-energy-and-metabolism/l04-fermentation: lactate is not the cause of muscle soreness (old myth).
- biology/m03-energy-and-metabolism/l05-light-reactions: oxygenic photosynthesis arose in cyanobacterial ancestors >2.5 billion years ago (light reactions as such did not "first evolve in cyanobacteria").
- biology/m03-energy-and-metabolism/l06-calvin-cycle: readable rubisco name; 3-phosphoglycerate; added C4 and CAM pathways.
- world-history/m03-classical-mediterranean-and-persia/l01-persian-empire: tribute list "survives in Herodotus"; Royal Road was not paved; removed "ironically" from the king's eyes and ears.
- world-history/m03-classical-mediterranean-and-persia/l02-greece-and-the-hellenistic-world: "before the Common Era" -> BCE with numerals (guidance); Hellenistic period end date (30 BCE).
- world-history/m03-classical-mediterranean-and-persia/l03-rise-of-rome: thatched huts are 8th c. BCE (by the 6th c. Rome was a city); "patrician class" -> senatorial elite (late Republic); Judaism "spread", Christianity "rose".
- world-history/m03-classical-mediterranean-and-persia/l04-judaism-and-early-christianity: origin of Israelite monotheism now gives both the traditional and the historians' account (was critical view stated as fact, with "capricious gods"); resurrection/Christ wording neutral; Jerusalem meeting ~49 CE per Acts; dates as numerals; Theodosius 380 made it the official religion.
- world-history/m03-classical-mediterranean-and-persia/l05-transformation-of-the-roman-world: Huns drove the Goths across the Danube in 376 (before Attila); Rome's decline timescale in the opening.
- biblical-studies/m03-torah-and-history-of-israel/l01-genesis-and-beginnings: Abram's call was from Haran (family had left Ur), age 75 on leaving Haran; Genesis 1 opening now notes the range of Christian readings of the six days instead of ruling out literal ones; "hovering bird" given as what the Hebrew verb suggests.
- biblical-studies/m03-torah-and-history-of-israel/l02-exodus-sinai-and-the-law: Exodus 19:4-5 was a modernized paraphrase labelled KJV -> exact KJV; moral/civil/ceremonial division attributed to Christian theology (Aquinas, Reformed), with the Jewish view (613 commandments); Sea of Reeds; dating debate noted; "tutor" attributed to Paul.
- biblical-studies/m03-torah-and-history-of-israel/l03-conquest-judges-and-kings: Judges 21:25 was a paraphrase labelled KJV -> exact KJV; added the historians' debate on the size of David's kingdom (Tel Dan inscription); "empire" -> kingdom.
- biblical-studies/m01-foundations-of-theology/l01-what-theology-is: Ephesians 3:9 (KJV) and 1 Peter 1:15 (ASV) paraphrases turned into exact quotations.
- biblical-studies/m03-torah-and-history-of-israel/l04-exile-and-return: dates as numerals (586, 538, 516 BCE); synagogue origins "debated"; Cyrus Cylinder instead of "enlightened"; removed false claim that the exile "permanently cured Judaism of political idolatry and pagan nationalism"; weeping elders attributed to Ezra (removed Shekinah claim).
- biblical-studies/m03-torah-and-history-of-israel/l05-authorship-and-dating: added the current state of the debate (four-source model contested; fragment/supplement models; conservative Mosaic-authorship view).
- economics/m04-costs-and-market-structure/l01-costs-of-production: diminishing returns vs marginal cost sentence fixed; constant returns to scale defined correctly (flat LRAC range).
- economics/m04-costs-and-market-structure/l03-monopoly-and-market-power: added barriers to entry and natural monopoly; next-lesson pointer described monopolistic competition as "a small group of firms" (that is oligopoly) -> fixed.
- economics/m04-costs-and-market-structure/l04-monopolistic-competition: opening example (detergents made by a handful of corporations) was oligopoly -> restaurant street.
- economics/m04-costs-and-market-structure/l05-oligopoly-and-game-theory: dominant strategy explained correctly (best whatever the rival does, not "avoids the worst case"); named the prisoner's dilemma.
- biology/m04-cell-division-and-heredity/l01-cell-cycle-and-mitosis: added plant cell plate; G1/G2/G0 spelled normally.
- biology/m04-cell-division-and-heredity/l02-cell-cycle-control-and-cancer: p53, proto-oncogenes, cyclin-dependent kinases spelled normally.
- biology/m04-cell-division-and-heredity/l03-meiosis: "maternal and genetic" -> maternal and paternal alleles; haploid explained as one chromosome per homologous pair; polar bodies named.
- biology/m04-cell-division-and-heredity/l04-mendelian-inheritance: Mendel = Augustinian friar in Brno; 1866 publication, 1900 rediscovery.
- biology/m04-cell-division-and-heredity/l05-chromosomes-and-complex-inheritance: credited Sutton, Boveri and Morgan.
- world-history/m04-classical-asia-africa-americas/l01-classical-asian-religions-and-philosophies: Mahavira as last of 24 Tirthankaras (not founder); Confucius lived in the Spring and Autumn period, taught (did not write) - Analects.
- world-history/m04-classical-asia-africa-americas/l02-mauryan-and-gupta-india: Aryabhata did not argue the Earth orbits the sun (removed); zero as a number is Brahmagupta, 7th c.; Arthashastra "traditionally credited" to Kautilya; Nanda dynasty; edict pillar description (languages, read aloud).
- world-history/m04-classical-asia-africa-americas/l03-qin-and-han-china: Han Feizi was not "the architect" (Shang Yang, Han Feizi, Li Si); Han recruitment by recommendation + testing, not the later civil-service examinations.
- world-history/m04-classical-asia-africa-americas/l04-silk-roads: routes ran from northern China (not "the Pacific coast"); Roman coins "back to Asian mints" -> coin hoards found in India.
- world-history/m04-classical-asia-africa-americas/l05-kush-and-aksum: Aksum stelae are 70+ feet (not forty), 4th c. CE; Aksum lies southeast of Kush.
- world-history/m04-classical-asia-africa-americas/l06-maya-and-teotihuacan: Teotihuacan's center burned ~550 CE (lesson said mid-8th c.) and the Maya collapse was 9th c.; ~2,000 apartment compounds (not "tens of thousands of multistory").
- biblical-studies/m04-poetry-wisdom-and-prophets/l01-psalms: Psalm 19:1 labelled KJV used ASV spelling -> exact KJV, quoted; Hallel is Psalms 113-118 (said "113 through 108").
- biblical-studies/m04-poetry-wisdom-and-prophets/l02-wisdom-literature: Proverbs compilation described accurately (older material, completed after the exile); BCE dating.
- biblical-studies/m04-poetry-wisdom-and-prophets/l03-major-prophets: Jewish canon places Daniel in the Writings; Jeremiah 31:31 exact KJV (had dropped "saith the LORD"); BCE numerals.
- biblical-studies/m04-poetry-wisdom-and-prophets/l05-messianic-hope: Isaiah 9:6 and 53:4 put in quotation marks (text was exact KJV); typo "thirty-1".
- economics/m05-market-failure-and-policy/l01-negative-externalities: unexplained "seventeenth or eighteenth barrel" replaced with the actual marginal logic; added the Coase caveat.
- economics/m05-market-failure-and-policy/l02-environmental-policy: market-based tools reach the same target "at lower total cost" (not "exact same... minimizing disruption"); SO2 cap-and-trade example.
- economics/m05-market-failure-and-policy/l03-positive-externalities-and-public-goods: wording ("unprovided").
- economics/m05-market-failure-and-policy/l04-information-risk-and-insurance: mandatory pools "largely" (not "entirely") remove adverse selection.
- economics/m05-market-failure-and-policy/l05-antitrust-and-competition-policy: HHI thresholds updated to the 2023 US merger guidelines (1,800 / 100; old 2,500 / 200 noted); "Mainstream vs Chicago" framing fixed; neo-Brandeisian view added.
- biology/m05-molecular-genetics/l01-dna-structure-and-replication: base-pair hydrogen bonds (2 for A-T, 3 for G-C) stated correctly.
- biology/m05-molecular-genetics/l02-transcription-and-rna-processing: "Roman numeral two" -> RNA polymerase II.
- biology/m05-molecular-genetics/l03-translation: EF-Tu identified as the bacterial elongation factor.
- biology/m05-molecular-genetics/l04-gene-regulation: allolactose named; "millions" -> billions of years; added lactase persistence (enhancer variants), which an earlier lesson promised.
- biology/m05-molecular-genetics/l05-biotechnology-and-genomics: Cas9 spelling; Doudna and Charpentier (2020 Nobel); 2018 germline-editing case and current restrictions.
- world-history/m05-age-of-faiths/l01-byzantine-empire: caesaropapism flagged as an over-simple label; 1054 schism "traditionally dated", hardened in 1204.
- world-history/m05-age-of-faiths/l02-muhammad-and-early-islam: dates as numerals; historiography note (sources written down a century+ later); "one true God" -> "one God" in the narrator's voice.
- world-history/m05-age-of-faiths/l03-umayyad-and-abbasid-caliphates: capital moved from Arabia (not Medina, Ali ruled from Kufa); Sunni-Shia split explained with Karbala 680; House of Wisdom's formality debated; Ibn Sina was later and Persian (not a Baghdad House of Wisdom figure); numerals.
- world-history/m05-age-of-faiths/l04-spread-of-buddhism: Borobudur is a terraced stupa on Java (~800 CE), not 'stone spires'.
- biblical-studies/m05-gospels-and-jesus/l01-between-the-testaments: synagogue origins debated (earliest evidence 3rd c. BCE Egypt); 4 Ezra is post-70 CE.
- biblical-studies/m05-gospels-and-jesus/l02-synoptic-gospels: the Lord's Prayer is not a "minor agreement" (it is not in Mark) -> correct example; dates as CE numerals.
- biblical-studies/m05-gospels-and-jesus/l03-mark-and-matthew: Mark 1:15 now exact WEB; five-discourse structure attributed to scholars; "proving" -> "presenting".
- biblical-studies/m05-gospels-and-jesus/l04-luke: 70-85 CE.
- biblical-studies/m05-gospels-and-jesus/l05-john: John 1:1 and 1:14 quoted exactly (KJV); "I am" sayings framed as interpretation.
- economics/m06-labor-inequality-and-public-choice/l01-wages-and-labor-markets: added the productivity-pay gap debate.
- economics/m06-labor-inequality-and-public-choice/l02-poverty-and-the-safety-net: credited Mollie Orshansky; Social Security capitalized.
- economics/m06-labor-inequality-and-public-choice/l04-public-choice-theory: softened "agencies perpetuate problems"; added the main criticism of public choice.
- economics/m06-labor-inequality-and-public-choice/l05-voting-and-government-failure: second worked example was self-contradictory -> both examples rewritten (efficient park rejected by majority; inefficient project passed by concentrated interests); replaced material duplicated from the previous lesson with the median voter theorem, Condorcet's paradox and Arrow's theorem, as the outline promised.
- biology/m06-evolution/l01-darwin-and-natural-selection: the peppered moth was not Darwin's Beagle observation -> Darwin and Wallace (1858), Origin (1859), Kettlewell's later moth studies.
- biology/m06-evolution/l02-evidence-for-evolution: cavefish embryos begin to form eyes that degenerate; embryonic tail not "bony"; genetic distance "roughly" (not exactly) proportional to time.
- biology/m06-evolution/l03-population-genetics: added the Hardy-Weinberg proportions in words; noted natural selection as the fourth force.
- biology/m06-evolution/l05-phylogenetics-and-the-tree-of-life: parsimony is one classic method; modern trees use maximum likelihood and Bayesian methods.
- world-history/m06-post-classical-states/l01-tang-and-song-china: exams began under the Sui and became central under the Song (Tang did not "perfect" them); Champa rice; Grand Canal was built under the Sui, not expanded by the Song; Chang'an "perhaps a million".
- world-history/m06-post-classical-states/l02-japan-korea-and-southeast-asia: Koryo did adopt examinations (958); Tripitaka Koreana was woodblock (13th c.), separate from movable metal type (1377).
- world-history/m06-post-classical-states/l03-feudal-europe: Carolingians did mint coins (removed "no coins"); added the historians' critique of the term feudalism.
- world-history/m06-post-classical-states/l04-medieval-church-and-crusades: Urban II offered remission of penance (not "sins immediately forgiven"); added Saladin 1187 and Acre 1291; Greek learning came mainly via Spain and Sicily, not the Crusades.
- world-history/m06-post-classical-states/l05-ghana-and-mali: Mansa Musa came to power ~1312 (said "early 1400s") and made the hajj in 1324 (text said "38 CE"); silent barter attributed to Arab writers; al-Sahili "credited with".
- world-history/m06-post-classical-states/l06-swahili-coast-and-indian-ocean: monsoon directions were reversed (NE monsoon Nov-Mar brings ships to Africa; SW Apr-Sep takes them home).
- world-history/m06-post-classical-states/l05-ghana-and-mali: NOTE the '38 CE' error was introduced by the pipeline's own date converter (summed 'thirteen twenty-five'); converter fixed to read year pairs.
- biblical-studies/m06-acts-and-letters/l01-acts: Lukan authorship "traditionally attributed"; Acts 2 paraphrase no longer presented as a KJV quotation; removed dispensational "church age"; "birth of the church" attributed.
- biblical-studies/m06-acts-and-letters/l02-paul-life-and-mission: Gamaliel and Roman citizenship come from Acts, not Paul's letters; full list of disputed letters (Ephesians, Colossians, 2 Thessalonians; Pastorals).
- biblical-studies/m06-acts-and-letters/l03-romans-galatians-and-justification: 1999 Joint Declaration; named Sanders, Dunn, Wright; canyon illustration made coherent.
- biblical-studies/m06-acts-and-letters/l04-prison-and-pastoral-letters: 2 Timothy 4:7 quoted exactly (KJV).
- biblical-studies/m06-acts-and-letters/l05-hebrews-and-general-letters: James 2 phrase quoted exactly; Hebrews dating hedged.
- biblical-studies/m06-acts-and-letters/l06-revelation: "most mature scholarship" -> "many scholars".
- economics/m07-measuring-the-macroeconomy/l01-gross-domestic-product: why transfers are excluded; Social Security capitalized.
- economics/m07-measuring-the-macroeconomy/l02-economic-growth: endogenous growth (Romer) named.
- economics/m07-measuring-the-macroeconomy/l05-business-cycle: "necessary correction" attributed as a view, not fact.
- biology/m07-microbes-and-fungi/l01-viruses: virus size relative to bacteria (10-100x smaller, not "a thousand times"); viral origins described as debated.
- biology/m07-microbes-and-fungi/l02-bacteria-and-archaea: garbled "across all domains of life" removed; horizontal gene transfer "in a matter of hours" softened.
- biology/m07-microbes-and-fungi/l03-protists: "internal skeleton" -> cytoskeleton.
- biology/m07-microbes-and-fungi/l04-fungi: plants reached land ~470 million years ago; fungi are closer to animals than plants.
- world-history/m07-global-middle-ages/l01-mongol-empire: Yassa's existence as a written code is debated; Baghdad 1258 named; title meaning hedged.
- world-history/m07-global-middle-ages/l02-pax-mongolica: unsupported specific crop list replaced with a careful statement.
- world-history/m07-global-middle-ages/l03-black-death: East Asian impact in the 1340s is debated; scapegoating made specific (Jewish communities, Strasbourg 1349).
- world-history/m07-global-middle-ages/l04-renaissance-europe: 1453 as numeral.
- world-history/m07-global-middle-ages/l05-aztec-and-inca: Inca "split inheritance" is a historians' argument, not settled fact.
- biblical-studies/m07-creeds-and-councils/l02-apostles-creed: the Father section is the shortest (said "largest"); "eternal sonship" is Nicene, not in the Apostles' Creed; Old Roman Symbol dating hedged.
- biblical-studies/m07-creeds-and-councils/l03-nicene-creed: Athanasius was a deacon assisting Bishop Alexander (did not "lead" Nicaea); filioque named as a later Western addition the Orthodox reject; dates as numerals.
- biblical-studies/m07-creeds-and-councils/l04-chalcedon: Alexandrian/Antiochene positions untangled (Eutyches was in Constantinople; Apollinarianism was the error Antioch opposed); 451 date; modern Oriental Orthodox dialogues.
- biblical-studies/m07-creeds-and-councils/l06-reformation-era-confessions: dates as numerals; Trent did not define papal magisterium as such; added Schleitheim (1527) and Dositheus (1672).
- economics/m08-aggregate-demand-and-supply/l02-keynesian-perspective: "proving" -> "suggesting"; General Theory (1936) named.
- economics/m08-aggregate-demand-and-supply/l04-phillips-curve: "proving" -> "implying".
- biology/m08-plant-and-animal-diversity/l03-invertebrates: deuterostome/chordate/vertebrate relationship stated correctly.
- biology/m08-plant-and-animal-diversity/l04-vertebrates: earliest tetrapods were not modern amphibians; theropods named.
- world-history/m08-connections-across-continents/l01-european-exploration: da Gama left 1497, reached India 1498; Ottoman "blockade" thesis hedged; compass transmission wording.
- world-history/m08-connections-across-continents/l03-columbian-exchange: "every single food" overgeneralization fixed.
- world-history/m08-connections-across-continents/l04-atlantic-slave-trade: ~12.5 million embarked; triangular-trade model qualified (direct Brazil-Africa trade).
- world-history/m08-connections-across-continents/l05-ottoman-and-safavid-empires: Orban named; "gunpowder empires" label noted as debated.
- world-history/m08-connections-across-continents/l06-mughal-india-and-ming-china: spelled dates -> numerals; "hajin" -> haijin.
- biblical-studies/m08-god-and-creation/l01-attributes-of-god: added the Orthodox essence-energies distinction.
- biblical-studies/m08-god-and-creation/l02-trinity: perichoresis is not a specifically Western emphasis -> Augustinian Western emphasis described accurately; perichoresis shared by East and West.
- biblical-studies/m08-god-and-creation/l03-creation-and-providence: Genesis 1:1 quoted exactly; Arminian and Orthodox views no longer conflated ("uncreated energies" is Orthodox); Thomist-Molinist debate added; "laws of physics are God's habits" attributed.
- biblical-studies/m08-god-and-creation/l04-image-of-god: Genesis 1:27, Colossians 1:15, Hebrews 1:3, Romans 8:29 and 1 Corinthians 15:49 were paraphrases labelled KJV -> exact quotations ("earthy", not "earthly"); Lutheran view of the lost image noted.
- biblical-studies/m08-god-and-creation/l05-fall-and-sin: range of readings of the Eden story acknowledged; incurvatus in se attributed to Luther.
- economics/m09-money-banking-and-monetary-policy/l01-money-and-how-banks-create-it: "loans create deposits" view tied to central banks (Bank of England 2014); US reserve requirements are zero since March 2020, so the 10% multiplier is flagged as a teaching model.
- economics/m09-money-banking-and-monetary-policy/l04-monetary-policy-tools: added interest on reserves (the Fed's main tool in its ample-reserves regime); reserve requirement now zero in the US.
- biology/m09-how-plants-work/l04-plant-hormones-and-responses: added gibberellins (a major hormone class was missing); photoperiodic flowering (short-day/long-day).
- biology/m09-how-plants-work/l05-flowering-plant-reproduction: removed repeated dictionary-style definitions that made the audio clumsy.
- world-history/m09-early-modern-transformations/l01-reformation: Jesuits were founded by Ignatius (1540), not created by Trent; nailing of the theses "by tradition"; Luther's own German Bible; Thirty Years' War losses range.
- world-history/m09-early-modern-transformations/l02-scientific-revolution: early scientific societies did not "institutionalize peer review" (anachronism); dates as numerals; "proved" -> "suggested".
- world-history/m09-early-modern-transformations/l03-absolute-monarchy: dates as numerals.
- biblical-studies/m09-christ-and-salvation/l01-person-of-christ: John 1:1 and 1:14 quoted exactly; 451 numeral.
- biblical-studies/m09-christ-and-salvation/l02-atonement: imputation is a Reformation idea, removed from Anselm's model; Isaiah 53:6 quoted exactly.
- biblical-studies/m09-christ-and-salvation/l03-grace-election-and-free-will: TULIP is a much later English nickname, not formulated at Dort; dates as numerals.
- biblical-studies/m09-christ-and-salvation/l05-sanctification: "infused grace" is Catholic language; Orthodox described in its own terms (energies).
- economics/m10-fiscal-policy-and-budgets/l01-government-budgets-and-taxation: Social Security / Medicare capitalized.
- economics/m10-fiscal-policy-and-budgets/l03-deficits-and-national-debt: functional finance attributed to Lerner and MMT (not "the Keynesian school"), with the inflation constraint and critics; garbled "debt-to-GDP gross domestic product ratio".
- biology/m10-animal-body-and-control-systems/l01-homeostasis: removed a sentence copied from the writing guidance; Cannon and Bernard credited properly.
- biology/m10-animal-body-and-control-systems/l02-nutrition-and-digestion: intestinal surface area updated (~30 m2; the "tennis court" figure is outdated).
- biology/m10-animal-body-and-control-systems/l03-neurons-and-nervous-system: resting potential mainly from potassium leak (pump maintains gradients).
- biology/m10-animal-body-and-control-systems/l05-endocrine-system: "testosterones" -> androgens such as testosterone; opening sentence repaired.
- world-history/m10-age-of-revolution/l01-enlightenment: the blank slate is from Locke's Essay Concerning Human Understanding, not the Two Treatises.
- world-history/m10-age-of-revolution/l02-american-and-french-revolutions: capitalization.
- world-history/m10-age-of-revolution/l03-haitian-revolution-and-abolition: Saint-Domingue's economic weight stated with standard figures (40% of Europe's sugar, >50% of its coffee).
- world-history/m10-age-of-revolution/l06-industrial-society-and-new-ideologies: liberal views on poverty not universalized; Owen's New Lanark (profitable) vs New Harmony (failed); Bismarck's social insurance as the conservative example.
- biblical-studies/m10-spirit-church-and-last-things/l01-holy-spirit: 381 as numeral; 2 Peter 1:21 and Romans 8:11 made exact quoted KJV; corrected regeneration sentence (Catholic/Orthodox/Lutheran link new birth to baptism incl. infants; Arminian/Wesleyan: prevenient grace enables faith)
- biblical-studies/m10-spirit-church-and-last-things/l03-sacraments-and-ordinances: added that Catholic/Orthodox count seven sacraments, most Protestants two
- biblical-studies/m10-spirit-church-and-last-things/l04-death-and-intermediate-state: Luther did not teach immediate conscious presence (he spoke of soul sleep); credited Calvin's treatise against soul sleep; Seventh-day spelling
- biblical-studies/m10-spirit-church-and-last-things/l05-return-of-christ-and-millennium: named Justin Martyr, Irenaeus, George Eldon Ladd; removed "localized" tribulation
- biblical-studies/m10-spirit-church-and-last-things/l06-resurrection-judgment-new-creation: 1 Cor 15:44 made exact quoted KJV; added renewal vs dissolution-and-recreation views (2 Peter 3); N. T. Wright attribution softened to "argues"
- economics/m11-international-economics/l01-comparative-advantage-and-gains-from-trade: fixed false claim that absolute advantage makes trade unnecessary (Smith 1776, Ricardo 1817); clarified opportunity-cost arithmetic
- economics/m11-international-economics/l02-protectionism-and-tariffs: added infant-industry defenders (19th-c. US, South Korea) and 2018-2019 US tariff pass-through evidence; trimmed effective-protection jargon
- economics/m11-international-economics/l03-balance-of-payments: capital-account examples corrected to debt forgiveness and trademarks/brand names (patents are produced assets, recorded in services); current-account deficit wording
- economics/m11-international-economics/l04-exchange-rates: added that PPP holds only roughly and is a long-run anchor
- economics/m11-international-economics/l05-globalization-and-its-critics: removed duplicate of l01's Alpha/Beta example; added Autor-Dorn-Hanson China-shock evidence; "hundreds of millions"; hyphenation
- economics/m11-international-economics/l06-international-financial-crises: added real crises (Mexico 1994, Asia 1997, Argentina 2001, IMF/Stiglitz critique); fixed caricature of "neoclassical" as anti-bailout (now moral-hazard free-market view); why borrowing is in dollars
- biology/m11-animal-organ-systems/l01-muscles-and-skeleton: fixed nuclei-filled-with-myofibrils wording; added T tubules and named tropomyosin; removed unsupported "five to ten times every second" cross-bridge rate
- biology/m11-animal-organ-systems/l02-respiratory-system: alveolar area corrected (about 70 square meters, not a whole tennis court); cooperative oxygen binding described correctly; "hundreds of millions" alveoli in key ideas
- biology/m11-animal-organ-systems/l03-circulatory-system: added comparative circulation (open insect system, fish/amphibian/reptile hearts, four chambers evolved separately); named the lymphatic system
- biology/m11-animal-organ-systems/l04-osmoregulation-and-excretion: ammonia comes from amino-acid breakdown, not digestion; urea concentrated by kidneys; uric acid in birds, most reptiles, insects; "around a million" nephrons; cut filler ending
- biology/m11-animal-organ-systems/l05-immune-system: "helper" T cells coordinate; MHC naming; hundreds of millions of years; fixed "in any other context ... fatal"
- biology/m11-animal-organ-systems/l06-reproduction-and-development: added the missing reproduction content (asexual vs sexual, external vs internal fertilization); all gametes haploid (not "most"); named the notochord; two germ layers in cnidarians
- world-history/m11-nationalism-and-imperialism/l01-nationalism-and-unification: Italy proclaimed 1861, Rome 1870 (not "by 1871"); added Mazzini; named Bismarck's three wars; exact gist of 1862 "iron and blood" speech (removed invented "industrial might")
- world-history/m11-nationalism-and-imperialism/l02-new-imperialism: 1870 exceptions (Algeria, Cape/Boer); 1914 with only Ethiopia and Liberia independent; removed anachronistic African petroleum; Berlin Conference set rules (effective occupation), did not itself draw most borders; missionaries who exposed Congo Free State abuses
- world-history/m11-nationalism-and-imperialism/l03-qing-decline-and-opium-wars: century of humiliation dates from the First Opium War; "one of the world's great engines"; Taiping toll "at least twenty million"; named Self-Strengthening Movement
- world-history/m11-nationalism-and-imperialism/l04-meiji-japan: Nagasaki Dutch/Chinese trade exception; Edo Bay; 1873 land tax in cash; zaibatsu were family-controlled and bought state factories (not "state-guided"); annexation "in 1910"
- world-history/m11-nationalism-and-imperialism/l05-resistance-to-colonial-rule: sepoys served the East India Company army; added Adwa 1896 (Menelik II); removed false causal link from Maji Maji to West African congress; Boxers also killed thousands of Chinese Christians; Samori "more than fifteen years"
- biblical-studies/m11-church-history/l01-early-church-and-monasticism: fixed garbled "incense to anvil the emperor"; amphitheater not Colosseum (no firm evidence of martyrdoms there); Nero's persecution local vs Decius/Diocletian empire-wide; Tertullian's actual line ("the blood of Christians is seed", c. 197); 312/313 with Licinius; Theodosius 380; "two and a half centuries of intermittent persecution"; "white martyrdom" is a later term
- biblical-studies/m11-church-history/l02-medieval-church-and-scholasticism: Gregory 590-604 numerals; Lombards; Gregorian chant attribution is later tradition; Franciscans/Dominicans are friars, not monastic orders; scholasticism began before universities; Summa = hundreds of questions, thousands of articles
- biblical-studies/m11-church-history/l03-east-west-schism: earlier Chalcedonian separation (451) acknowledged; Western rationale for filioque added for balance; named Humbert and Cerularius; 1965 lifting of excommunications; numerals
- biblical-studies/m11-church-history/l04-reformation-and-catholic-reform: theses sent to Archbishop of Mainz; door-posting flagged as later tradition; "across Germany within weeks"; Anabaptist nonviolence "for most"; Schmalkaldic War not "decades of warfare"; Trent on justification and seven sacraments; Jesuit fourth vow described correctly
- biblical-studies/m11-church-history/l05-enlightenment-and-modern-theology: Descartes and Locke were believers (not teachers of doubting everything); scientific pioneers often devout; Campbell's reply to Hume; Pietists/Wesley instead of "retreated into piety"; Schleiermacher "aimed to protect"; Asa Gray on evolution; "many mainline" denominations
- biblical-studies/m11-church-history/l06-global-christianity-today: added Oriental Orthodox churches; Azusa Street 1906
- economics/m12-schools-evidence-and-open-questions/l01-schools-of-economic-thought: added Marx (fair, brief); classical -> marginalist origin of microeconomics; Friedman-Schwartz; Lucas; menu costs defined; one trillion not 'one thousand billion'; monetarists 'argued' not 'demonstrated'
- economics/m12-schools-evidence-and-open-questions/l02-how-economists-use-evidence: arithmetic error fixed (40 percentage points, not 40 percent); explained why randomization licenses causal claims; added natural experiments and Card-Krueger minimum-wage study (l03 referred back to natural experiments that were missing); regression limits; "increasingly" + 2019 Nobel for RCTs
- economics/m12-schools-evidence-and-open-questions/l03-institutions-and-development: inclusive/extractive is Acemoglu-Robinson's framework (2024 Nobel), not "economists generally"; North's definition attributed; Nogales example; "several times" not "ten times"; Sachs critique for balance; softened IP and "primary driver" claims
- economics/m12-schools-evidence-and-open-questions/l04-unresolved-questions: secular stagnation revived by Summers; replaced invented "neoclassicals say growth limits are temporary" with Gordon's supply-side view vs optimists; Piketty named; labor not "behavioral" economists on bargaining power; historical record on technology and jobs (Autor)
- economics/m12-schools-evidence-and-open-questions/l05-thinking-like-an-economist: café example made coherent (discount for own mug, not free coffee "shifting costs onto consumers")
- biology/m12-ecology-and-conservation/l01-climate-biomes-and-biosphere: ocean salinity about 3.5 percent (not 3); conifer needle and crown adaptations described correctly
- biology/m12-ecology-and-conservation/l02-population-ecology: goldfish "few years" not decades; K-selected example whales not oak trees (oaks make thousands of acorns); r/K as a continuum and simplification
- biology/m12-ecology-and-conservation/l03-community-ecology: competitive exclusion sentence rewritten and credited to Gause; Paine's mussels crowded out "many", not all; climax concept caveat
- biology/m12-ecology-and-conservation/l04-ecosystems-and-nutrient-cycles: ten-percent rule flagged as rule of thumb (5-20 percent); water is not an atom; Haber-Bosch added; dead-zone mechanism corrected (decomposition of algae consumes oxygen; hypoxia, not always zero)
- biology/m12-ecology-and-conservation/l05-conservation-biology: replaced "unprecedented speed" with background-rate comparison and 2019 IPBES one-million-species estimate; Soule's "crisis discipline" instead of "medical intervention for a feverish planet"; Yellowstone wolves with the cascade debate noted
- world-history/m12-modern-world/l01-world-war-one: dates as numerals; July Crisis order fixed (blank check came before the ultimatum, then Austria declared war); deaths "fifteen to twenty million"; mandates included German colonies
- world-history/m12-modern-world/l02-interwar-years: numerals for decades and 1923 hyperinflation; Russia had food shortages, not "widespread famine", in 1917; named 1932-33 famine (Ukraine, Kazakhstan); world trade fell about two-thirds in value 1929-34; Hitler appointed chancellor January 1933
- world-history/m12-modern-world/l03-world-war-two-and-the-holocaust: added German bombing of Warsaw/Rotterdam/London alongside Allied bombing; total deaths 70-85 million; Holocaust killing methods (mass shootings, ghettos, Auschwitz, Treblinka) and victims corrected; Nanjing and comfort-women numbers given as scholarly ranges; atomic-bomb deaths corrected; Nuremberg did not charge genocide (1948 Convention)
- world-history/m12-modern-world/l04-cold-war: added the end of the Cold War (Gorbachev, 1989 revolutions with churches and Solidarity, USSR dissolved December 1991); Korea already divided in 1945, war ended in 1953 armistice; Truman Doctrine wording ("free peoples", Greece and Turkey); Churchill 1946
- world-history/m12-modern-world/l05-decolonization: numerals; Atlantic Charter caveat (Churchill excluded the empire); settler examples Kenya/Algeria/Rhodesia (not South Africa); partition numbers; Indochina 1954, Indonesia 1945-1949; Ghana "one of the first"; Lumumba's murder; dependency theory presented as one view
- world-history/m12-modern-world/l06-globalization-and-the-present: IMF/World Bank austerity criticism; "helped lift"; Fertile Crescent capitalized
- biblical-studies/m12-apologetics-and-ethics/l01-arguments-for-god: Kalam's Islamic origins (al-Ghazali); Aquinas's Five Ways stated correctly (not Leibniz's "something rather than nothing"); fine-tuning separated from biological design, Darwin added; Plato's Euthyphro; Barth; Vatican I (1870); ending made descriptive
- biblical-studies/m12-apologetics-and-ethics/l02-problem-of-evil: Epicurus credited; Plantinga's 1974 free will defense and shift to evidential problem; Irenaean theodicy rooted in Irenaeus, developed by Hick (1966); Augustinian fallen-creation view not limited to Reformed/Orthodox; Revelation's author "John" (apostolic authorship debated)
- biblical-studies/m12-apologetics-and-ethics/l03-resurrection-and-history: minimal facts is Habermas's apologetic method, not what "most scholars use"; 1 Cor 15:3-4 quoted exactly (KJV) instead of naming KJV with no quote; creed dating "within a few years"; enemy attestation comes via Christian sources and the empty tomb is more disputed; Troeltsch named; resurrection as validation "for Christians"
- biblical-studies/m12-apologetics-and-ethics/l04-biblical-ethics: Matthew 22:37-40 was a paraphrase labelled KJV; now exact quoted KJV; Scripture "authoritative" (Catholic/Orthodox read it within tradition) instead of "primary lens" for all; secular ethics not strawmanned (Kant)
- biblical-studies/m12-apologetics-and-ethics/l05-virtue-ethics: Galatians 5:22-23 made exact quoted KJV; Aquinas's cardinal and theological virtues; Orthodox synergy distinguished from Catholic infused virtues
- biblical-studies/m12-apologetics-and-ethics/l06-contemporary-ethical-issues: Rerum Novarum 1891; added Lutheran two kingdoms; Kuyper; Quakers and Brethren are peace churches but not Anabaptist
- biblical-studies/m03-torah-and-history-of-israel/l01-genesis-and-beginnings: Genesis 3:15 paraphrase labelled KJV replaced with an exact quoted KJV clause (found by a wider translation-name scan)
- mathematics/m01-numbers-and-mathematical-thinking/l05-exponents-and-scientific-notation: arithmetic slip fixed (dividing eighty-one by three four times gives one, not three; now three times through twenty-seven and nine)
- mathematics/m01-numbers-and-mathematical-thinking/l03-order-of-operations-and-properties: Heard aloud, 'three times the quantity four plus one minus five' can mean three times (4+1-5), giving 2 instead of 12; and the 'commutative' step rewrote the expression as itself, so no property was actually demonstrated. The replacement fixes the grouping by ear, shows real commutative and associative steps, and checks the result of 12. (2026-10-27 expert review)
- mathematics/m01-numbers-and-mathematical-thinking/l05-exponents-and-scientific-notation: The lesson's own figure, 5.97 times ten to the 24th, is about six trillion trillion, not five.; The lesson defines scientific notation as a number between one and ten times a power of ten, then leaves the answer as 12 times ten to the fifth. That breaks its own definition. The normalized answer is 1.2 times ten to the sixth. (2026-10-27 expert review)
- mathematics/m02-algebraic-expressions/l01-variables-and-expressions: Heard aloud, the quantity could run on to include 'minus two times x'. The added pause word shows where the grouping ends. (2026-10-27 expert review)
- mathematics/m02-algebraic-expressions/l02-polynomial-arithmetic: 'The quantity x plus y squared' can be heard as x plus y-squared. Saying 'the square of the quantity' removes the ambiguity.; Same ambiguity by ear: x minus y-squared versus the square of the difference. (2026-10-27 expert review)
- mathematics/m02-algebraic-expressions/l03-factoring-common-factors-and-grouping: The summary promises that each result is checked by multiplying back, but the grouping result was never checked. (2026-10-27 expert review)
- mathematics/m02-algebraic-expressions/l04-factoring-trinomials-and-special-forms: 'Place three with two x' suggests the binomial two x plus three, which gives a middle term of five x. The final answer, (2x+1)(x+3), needs the one paired with two x and the three paired with x. (2026-10-27 expert review)
- mathematics/m02-algebraic-expressions/l05-rational-expressions: Tripling one-half of a cup gives three halves, not three-sixths. Three-sixths is just one-half written another way. The new opening shows cancelling a common factor, which is what the lesson goes on to teach.; 'Excluded domain' is not standard terminology. The domain is the set of allowed values, and textbooks call the forbidden ones excluded values. (2026-10-27 expert review)
- mathematics/m02-algebraic-expressions/l06-radicals-and-rational-exponents: Eighteen is nine times two, so the split is root nine times root two. Root nine times root three would be root twenty-seven, so the stated step contradicts the stated result.; It is the even root of an even power, as in the square root of x squared, that needs an absolute value. The even power of a root, the square of root x, is just x for x of zero or more. The example given matches the corrected wording. (2026-10-27 expert review)
- mathematics/m03-equations-and-inequalities/l01-linear-and-rational-equations: The extraneous-solution rule, which the summary promises to explain, is shown only with a made-up answer and no equation. The guidance requires showing rules on actual numbers. Checked: x/(x-4) = 4/(x-4) reduces to x = 4, which is excluded, so there is no solution. This matches the following sentences.; The lesson opens with 'How many muffins are in one batch?' and never answers it, the same defect the reviewer fixed for the dice question in m11 l06. 2b + 5 = 35 gives b = 15. After both m03 l01 edits the prose is 851 words. (2026-10-27 expert review)
- mathematics/m03-equations-and-inequalities/l02-modeling-with-word-problems: The summary promises rearranging a formula to solve for one quantity, but the lesson only says this can be done and never does it. This adds the steps and a numeric check. (2026-10-27 expert review)
- mathematics/m03-equations-and-inequalities/l03-quadratics-by-factoring-and-square-roots: 'x minus four squared' can be heard as x minus sixteen. (2026-10-27 expert review)
- mathematics/m03-equations-and-inequalities/l04-completing-the-square-and-quadratic-formula: This lesson's own statement of the quadratic formula has no grouping word after 'the square root of'. By ear the radical can end after 'the second coefficient squared', which gives root of b squared, minus 4ac. Adding 'the quantity' matches the subject's convention. (2026-10-27 expert review)
- mathematics/m03-equations-and-inequalities/l05-radical-and-absolute-value-equations: Without grouping words, the factored form is heard as m minus 2m minus 3 equals zero. (2026-10-27 expert review)
- mathematics/m03-equations-and-inequalities/l06-linear-and-absolute-value-inequalities: 'Strictly between' excludes both endpoints, which contradicts 'including four'. (2026-10-27 expert review)
- mathematics/m04-coordinates-and-lines/l01-coordinate-plane: Distance and midpoint is the next lesson in this same module, not the next module. (2026-10-27 expert review)
- mathematics/m04-coordinates-and-lines/l03-slope-as-a-rate-of-change: A cyclist holding fifty miles per hour for two hours is not realistic. A car fits the numbers.; Keeps the wording consistent with the corrected example. (2026-10-27 expert review)
- mathematics/m04-coordinates-and-lines/l04-equations-of-lines: The original says the slopes 'mean' the lines are perpendicular, which is a non sequitur. Horizontal and vertical lines are the one case the negative-reciprocal rule, taught next, cannot handle. (2026-10-27 expert review)
- mathematics/m05-functions/l02-domain-range-and-piecewise-functions: For inputs greater than one, x plus three is greater than four and never equals four. The lesson itself later says the range resumes strictly above four. (2026-10-27 expert review)
- mathematics/m05-functions/l03-graph-behavior-and-rates-of-change: As spoken, 'the quantity f of x plus h' is heard as f(x) + h, which is the wrong expression. The input x plus h must sit inside f. (2026-10-27 expert review)
- mathematics/m05-functions/l04-transforming-graphs: The normaliser's Roman-numeral rule turns 'The V' into 'The the Fifth'. I checked this with normalise(). Putting a lowercase word before V avoids it.; By ear, 'the negative of the quantity x minus one squared plus four' can mean negative of ((x-1) squared + 4). That graph has its vertex at (1, -4), not the (1, 4) the lesson derives. (2026-10-27 expert review)
- mathematics/m05-functions/l05-combining-and-composing-functions: As written, the definition says f(x)+g(x) equals f(x)+g(x), which defines nothing. The sum function is (f+g)(x). (2026-10-27 expert review)
- mathematics/m05-functions/l06-inverse-functions: The next lesson, Quadratic Functions and the Vertex, never covers restricting a domain to invert a function, so this preview promised content that does not exist. (2026-10-27 expert review)
- mathematics/m06-polynomial-and-rational-functions/l01-quadratic-functions-and-the-vertex: 'x minus h squared' can be heard as x minus h-squared.; The summary promises using the vertex to solve maximum and minimum problems, but the lesson only mentions profit in general terms with no worked numbers. I checked this example: perimeter 40, vertex at 10, area 100, and 9 by 11 gives 99. (2026-10-27 expert review)
- mathematics/m06-polynomial-and-rational-functions/l02-polynomial-functions-and-graphs: The outputs -2, 0, 2 at x = -2, 0, 2 only increase, so they show no turning at all. The turns appear at x = -1, where f is 2, and x = 1, where f is -2. Checked in python. (2026-10-27 expert review)
- mathematics/m06-polynomial-and-rational-functions/l03-dividing-polynomials-and-the-factor-theorem: 'Negative two squared' is heard as the negative of two squared, which is -4, but the remainder check needs (-2) squared, which is +4. (2026-10-27 expert review)
- mathematics/m06-polynomial-and-rational-functions/l05-zeros-of-polynomials: Gauss's 1799 proof is famous but is generally regarded as incomplete, with a topological gap, so 'first proven completely' overstates it. (2026-10-27 expert review)
- mathematics/m07-exponential-and-logarithmic-functions/l02-the-number-e-and-continuous-growth: e to the 0.3 is 1.34986, which rounds to 1.350. 1.349 is a truncation.; 50 times e to the -0.8 is 22.466, which rounds to 22.5. (2026-10-27 expert review)
- mathematics/m07-exponential-and-logarithmic-functions/l03-logarithms-as-inverses: The summary promises the shape of the logarithm graph in words, and a Key idea mentions the graph, but the body never describes it. (2026-10-27 expert review)
- mathematics/m07-exponential-and-logarithmic-functions/l04-laws-of-logarithms: The worked expansion never states its final result. The subject guidance asks for the result to be said plainly. (2026-10-27 expert review)
- mathematics/m07-exponential-and-logarithmic-functions/l05-solving-exponential-and-log-equations: 'Negative two squared' is heard as the negative of two squared, which is -4. The square of negative two is 4. (2026-10-27 expert review)
- mathematics/m07-exponential-and-logarithmic-functions/l06-exponential-models: The half-life example never gives its answer, and the description leaves out the logarithm of one-tenth. 5 times ln(0.1) divided by ln(0.5) is 16.61.; The worked example never gives its answer. 10 times ln(13/3) is 14.66.; The worked example never gives its answer. ln 9 divided by 0.2 is 10.99. (2026-10-27 expert review)
- mathematics/m08-trigonometric-functions/l01-angles-and-radian-measure: Where the 360-degree division came from is uncertain. The lesson states one popular explanation as fact, and the course rules require saying so when scholars disagree. (2026-10-27 expert review)
- mathematics/m08-trigonometric-functions/l02-right-triangle-trigonometry: The summary promises exact values 'from two special triangles', but the lesson only lists the values. The guidance also asks for an explanation of why each rule works.; The hypotenuse also touches the chosen angle. The adjacent side is the leg, not the hypotenuse, that touches it. (2026-10-27 expert review)
- mathematics/m08-trigonometric-functions/l03-the-unit-circle: A reference angle is an angle, the acute one with the x-axis, not a distance. The new wording also shows how pi over six is found. (2026-10-27 expert review)
- mathematics/m08-trigonometric-functions/l04-graphs-of-sine-and-cosine: Without a picture, the listener needs to know where the peak, the middle zero and the valley occur. (2026-10-27 expert review)
- mathematics/m08-trigonometric-functions/l05-inverse-trigonometric-functions: As written, the bullet loses the second family of sine solutions (180 degrees minus the angle) that the body correctly includes. (2026-10-27 expert review)
- mathematics/m09-trigonometric-identities-and-applications/l01-fundamental-trigonometric-identities: The bullet makes a single numerical check sound like a required part of the proof. The course itself stresses that examples never prove a general claim.; The body says checking at angle zero shows 'the identity holds'. That treats one example as proof, contradicting the course's proof-versus-example principle and the corrected Key idea in mathematics-045. The prose is 870 words after the edit. (2026-10-27 expert review)
- mathematics/m09-trigonometric-identities-and-applications/l03-solving-trigonometric-equations: The voice reads the lone letter a as 'uh', so 'four times a times c' and 'two times a' are misread. The guidance requires role names instead. (2026-10-27 expert review)
- mathematics/m09-trigonometric-identities-and-applications/l04-laws-of-sines-and-cosines: The altitude comparison (none, one right triangle, two, one) applies only when the given angle is acute.; This completes the ambiguous-case rule for an obtuse given angle, which the lesson left out. (2026-10-27 expert review)
- mathematics/m10-systems-and-conic-sections/l02-three-variables-matrices-and-row-reduction: 'These operations' refers to nothing, because row operations have not yet been introduced at that point. (2026-10-27 expert review)
- mathematics/m10-systems-and-conic-sections/l03-circles-and-parabolas: The center (3, -2) does not satisfy the circle's equation (it gives -16, not 0), so the instructed check would make a correct answer look wrong. The new check, using the point (7, -2), gives 0. (2026-10-27 expert review)
- mathematics/m10-systems-and-conic-sections/l04-ellipses-and-hyperbolas: The lone letter a is read as 'uh', and it also clashes with the m and n the lesson uses for the semi-axes.; The lone letter a is read as 'uh'. This keeps the lesson's own m and n notation.; The lone letter a is misread, and the Key ideas use letters the body never defined.; The lone letter a is misread. The body uses m and n, not a and b.; 'Elliptic geometry' and 'hyperbolic geometry' are names of non-Euclidean geometries, not the study of these curves. (2026-10-27 expert review)
- mathematics/m10-systems-and-conic-sections/l05-nonlinear-systems-and-inequalities: As stated, only the opposite of the linear coefficient is divided by two times the leading coefficient, giving -b/(2a) plus or minus root D, which is the wrong formula. The square root must also be divided.; 'One plus the square root of seventeen divided by two' is heard as 1 + (root 17)/2. The y values were also never stated. Checked: (2.56, 3.56) and (-1.56, -0.56) lie on both curves.; The inside of the upward bowl is the region containing (0, 1), which the test just excluded, so 'the interior region beneath the parabola' contradicts itself.; A circle (the curve) together with y > 0 gives only an arc, not the half-disc described. The disc inequality is needed. (2026-10-27 expert review)
- mathematics/m11-sequences-counting-and-probability/l01-sequences-and-summation: 'Three times the quantity one plus two' is 3 times (1+2), which is 9, not 5. The rule is 3n + 2, so the grouping words contradict the arithmetic. (2026-10-27 expert review)
- mathematics/m11-sequences-counting-and-probability/l03-geometric-sequences-and-series: Terms getting smaller does not by itself make a sum finite; the harmonic series is the standard counterexample. The new text gives the real reason, using actual numbers.; With a ratio of -1 or below, the partial sums swing back and forth rather than growing without bound. (2026-10-27 expert review)
- mathematics/m11-sequences-counting-and-probability/l04-counting-permutations-and-combinations: 'Product one' is a meaningless label left over from drafting, and it is confusing when heard.; 'Arrangement total one' is a meaningless label left over from drafting. (2026-10-27 expert review)
- mathematics/m11-sequences-counting-and-probability/l05-binomial-theorem: The lesson says the coefficients are combinations but never explains why, and the guidance asks for the why. (2026-10-27 expert review)
- mathematics/m11-sequences-counting-and-probability/l06-basic-probability: The opening dice question is never answered, and the summary promises 'using counting to find probabilities', which the lesson never actually does. The answer is 5 over 36. (2026-10-27 expert review)
- mathematics/m12-proof-and-mathematical-reasoning/l02-proof-by-contradiction: The aside about p = 4 and q = 6 has nothing to do with the square root of two. In the middle of the proof it suggests those values are relevant. (2026-10-27 expert review)
- mathematics/m12-proof-and-mathematical-reasoning/l03-mathematical-induction: 'Two times the quantity n minus one' is 2(n-1), which is even. The nth odd number is 2n - 1.; Same error: 2(k-1) is even. The kth odd number is 2k - 1, as the lesson's own inductive step uses. (2026-10-27 expert review)
- mathematics/m12-proof-and-mathematical-reasoning/l04-sets-and-functions: Seven is also a prime digit, so calling the set two, three, five 'a set of prime digits' is incomplete.; Union and intersection are never shown on actual elements. The guidance requires every rule to be shown on numbers. (2026-10-27 expert review)
- chemistry/m01-matter-and-measurement/l02-classifying-matter: The listener does not undergo the change; the ice does. (2026-10-27 expert review)
- chemistry/m01-matter-and-measurement/l04-unit-conversions: Only defined conversion factors are exact; the lesson itself later uses density, a measured conversion factor that does limit significant figures.; The Key idea repeated the overgeneralisation that every conversion factor is exact.; Particles keep a zero-point motion even at absolute zero; textbooks define it as the lowest possible temperature.; This sentence directly follows the text edited by chemistry-002 and still says every conversion factor adds no uncertainty, which contradicts the new statement that a measured factor such as density limits significant figures. Apply it together with chemistry-002. Occurs exactly once. (2026-10-27 expert review)
- chemistry/m02-atoms-molecules-and-ions/l01-development-of-atomic-theory: The law of definite proportions is Proust's mass-based law, which Dalton's atom-ratio postulate explained; the text misattributed and misstated it.; The periodic-table sentence was a non sequitur that relied on a later lesson; the replacement states the mass ratio that the law of multiple proportions actually describes. (2026-10-27 expert review)
- chemistry/m02-atoms-molecules-and-ions/l04-ionic-and-molecular-compounds: An ionic compound is made of ions, not atoms; the negative ion of chlorine is the chloride ion. (2026-10-27 expert review)
- chemistry/m02-atoms-molecules-and-ions/l05-naming-compounds: Hydrocyanic acid uses hydro but is not binary; the lesson itself just said cyanide ends in ide.; The Key idea carried the same overstatement. (2026-10-27 expert review)
- chemistry/m03-moles-and-chemical-reactions/l03-balancing-chemical-equations: The voice reads the lone letter A as 'uh', so 'the letters A Q' is misheard. (2026-10-27 expert review)
- chemistry/m03-moles-and-chemical-reactions/l06-stoichiometry-and-yield: A mole is not microscopic; it is the bridge between particle counts and amounts we can weigh. (2026-10-27 expert review)
- chemistry/m04-thermochemistry/l04-hess-law-and-enthalpies-of-formation: Every element in its standard state, including the alkali metals, has a standard enthalpy of formation of zero by definition. The paragraph claimed alkali metals have nonzero values and that noble gases are zero because they are stable.; The Key idea made the same false claim that elements' enthalpies of formation follow periodic trends. (2026-10-27 expert review)
- chemistry/m05-electronic-structure-and-periodic-trends/l01-light-and-electromagnetic-energy: The ionization-energy sentence is a non sequitur in a lesson on light, and it uses effective nuclear charge, which is only taught in the periodic trends lesson.; The Key idea was vague and not taught in the lesson; replaced with a core idea the lesson does teach. (2026-10-27 expert review)
- chemistry/m05-electronic-structure-and-periodic-trends/l02-bohr-model-and-line-spectra: Bohr derived the level energies from his model, and they matched hydrogen lines that had already been measured; he did not get them by measuring wavelengths. (2026-10-27 expert review)
- chemistry/m05-electronic-structure-and-periodic-trends/l03-quantum-numbers-and-orbitals: The lesson summary promises the shapes of s, p and d orbitals described in words, but d orbitals were never described. (2026-10-27 expert review)
- chemistry/m05-electronic-structure-and-periodic-trends/l04-electron-configurations: Heard aloud, 'the three p orbitals' sounds like the 3p subshell; sodium's six electrons go into 2p, as the configuration that follows says. (2026-10-27 expert review)
- chemistry/m05-electronic-structure-and-periodic-trends/l05-periodic-trends: The beryllium-to-boron dip comes from the higher-energy, shielded 2p electron, not from electron-electron repulsion; only the nitrogen-to-oxygen dip is a pairing-repulsion effect.; The sentence contradicted itself: poor shielding would not balance the added nuclear charge. Inner d electrons shield the outer s electrons fairly effectively.; The lanthanide contraction makes the second and third transition series (periods five and six) similar in size; there is no fourth and fifth series in this sense.; Lithium's outer electron is in level two and potassium's is in level four, so potassium has two more levels, not one.; The dips occur at boron and oxygen (beryllium and nitrogen are local highs), and the boron dip is not a repulsion effect. (2026-10-27 expert review)
- chemistry/m06-chemical-bonding-and-molecular-shape/l01-ionic-and-covalent-bonding: Electrons do not orbit atoms; the earlier module replaced orbits with probability regions. (2026-10-27 expert review)
- chemistry/m06-chemical-bonding-and-molecular-shape/l02-lewis-structures-and-resonance: Four bonds hold eight shared electrons, and the rule the lesson just stated subtracts half of them. As written, the arithmetic contradicts the rule.; The carbon dioxide example stopped before reaching a valid structure, so the learner never hears how multiple bonds arise. (2026-10-27 expert review)
- chemistry/m06-chemical-bonding-and-molecular-shape/l03-molecular-shape-and-vsepr: The voice reads the lone letter A as 'uh', and the notation is never used again in the lesson. Prose stays at 631 words. (2026-10-27 expert review)
- chemistry/m06-chemical-bonding-and-molecular-shape/l04-molecular-polarity: Molecular polarity is an electric dipole, not magnetism; the molecular orbital lesson uses magnetism for something different.; The comb attracts the water electrically, not magnetically. (2026-10-27 expert review)
- chemistry/m06-chemical-bonding-and-molecular-shape/l05-valence-bond-theory-and-hybridization: Methane is tetrahedral; 'pyramid' suggests a square-based shape. (2026-10-27 expert review)
- chemistry/m06-chemical-bonding-and-molecular-shape/l06-molecular-orbital-theory: Nitrogen's sigma two s antibonding orbital is filled, so it is false that all its antibonding orbitals are empty. Bond order three comes from eight bonding electrons minus two antibonding electrons, divided by two. (2026-10-27 expert review)
- chemistry/m07-gases/l02-the-ideal-gas-law: Decimals are read digit by digit everywhere else in the subject; 'point sixty-three' is nonstandard. (2026-10-27 expert review)
- chemistry/m07-gases/l03-gas-mixtures-and-gas-stoichiometry: Molarity is not taught until the solutions module, after this lesson. (2026-10-27 expert review)
- chemistry/m07-gases/l04-kinetic-molecular-theory-and-real-gases: The attractive forces do not get stronger at low temperature; slower molecules simply cannot escape them as easily. (2026-10-27 expert review)
- chemistry/m08-liquids-solids-and-solutions/l05-molarity-and-dilution: One part per million equals one milligram per liter only for dilute water solutions with a density near one gram per milliliter.; No one-liter flask was specified; the procedure works for any volumetric flask. (2026-10-27 expert review)
- chemistry/m08-liquids-solids-and-solutions/l06-colligative-properties: Heard aloud, 'per mole per kilogram' is ambiguous; the constant is degrees per unit of molality. (2026-10-27 expert review)
- chemistry/m09-reaction-rates-and-equilibrium/l01-reaction-rates-and-rate-laws: The voice reads the lone letter A as 'uh', so 'the concentration of A' is misheard; X and Y are read correctly.; Five more uses of the lone letter A as a variable name, each read as 'uh'. The arithmetic (0.02 divided by 0.1 is 0.2) is unchanged and correct. (2026-10-27 expert review)
- chemistry/m09-reaction-rates-and-equilibrium/l02-integrated-rate-laws-and-half-life: A lesson titled Integrated Rate Laws, whose focus is first order, never stated the first-order integrated rate law itself. (2026-10-27 expert review)
- chemistry/m09-reaction-rates-and-equilibrium/l03-collision-theory-and-activation-energy: The frequency factor includes the orientation requirement the lesson stresses, not just the collision count. The summary also promises the Arrhenius equation, which was never stated. (2026-10-27 expert review)
- chemistry/m09-reaction-rates-and-equilibrium/l04-mechanisms-and-catalysis: Ammonia synthesis still runs at high pressure, chosen for the equilibrium yield; a catalyst lowers the temperature needed for a useful rate, not the pressure. (2026-10-27 expert review)
- chemistry/m09-reaction-rates-and-equilibrium/l05-dynamic-equilibrium-and-the-constant: The lesson itself says a constant near one means comparable amounts of reactants and products; calling a value of two product-favored contradicts that. The calculation (16 divided by 8 is 2) is correct. (2026-10-27 expert review)
- chemistry/m09-reaction-rates-and-equilibrium/l06-le-chateliers-principle: Removing a product shifts the equilibrium toward the products, as the body of the lesson correctly says; the Key idea stated the opposite.; 'Potential of hydrogen' is a folk etymology, not the scale's name; the origin of the p is uncertain. (2026-10-27 expert review)
- chemistry/m10-acids-bases-and-solubility/l02-strong-and-weak-acids-and-bases: 'Potential of hydrogen' is a folk etymology, not the name of the scale taught in the previous lesson. (2026-10-27 expert review)
- chemistry/m10-acids-bases-and-solubility/l03-buffers: A buffer needs substantial amounts of both the weak acid and its conjugate base; acetic acid alone in water has too little acetate to absorb added acid.; The subject guidance requires constants to be named in words, not letter symbols, and the voice reads 'pKa' unpredictably.; The same letter symbol appears in the Key ideas.; The same letter symbol appears in the Key ideas. (2026-10-27 expert review)
- chemistry/m10-acids-bases-and-solubility/l05-solubility-equilibria: Heard aloud, 'the quantity two x squared' parses as two times x squared, which would give two x cubed, not four x cubed. The final 0.022 moles per liter is correct. (2026-10-27 expert review)
- chemistry/m11-thermodynamics-and-electrochemistry/l01-entropy-and-spontaneity: Calcium oxide has one calcium and one oxygen atom. The sentence gave it the composition of calcium carbonate, which also breaks conservation of atoms.; Zero-point motion remains at absolute zero; the third law needs only a single lowest-energy arrangement. (2026-10-27 expert review)
- chemistry/m11-thermodynamics-and-electrochemistry/l02-gibbs-free-energy: The positive enthalpy change is a thermodynamic cost, not an activation barrier; the kinetics module uses 'energy barrier' for activation energy. (2026-10-27 expert review)
- chemistry/m11-thermodynamics-and-electrochemistry/l03-balancing-redox-reactions: Sulfurous acid has three oxygen atoms and sulfate has four, so water goes on the left and hydrogen ions on the right. The text had both reversed, which contradicts its own next sentence that counts four positive charges on the right.; The worked example never stated its balanced result. Added and checked: atoms balance, and the charge is negative two on each side. (2026-10-27 expert review)
- chemistry/m11-thermodynamics-and-electrochemistry/l04-galvanic-cells-and-cell-potentials: The voice reads the lone letter A as 'uh', giving 'double uh battery'. (2026-10-27 expert review)
- chemistry/m11-thermodynamics-and-electrochemistry/l05-batteries-fuel-cells-and-corrosion: The subject reference says to explain the voltage drop without the Nernst equation, which is never taught. The replacement uses the free energy and reaction quotient from the Gibbs lesson.; Oxygen is reduced at a cathodic region of the metal surface; oxygen itself is not the cathode. (2026-10-27 expert review)
- chemistry/m11-thermodynamics-and-electrochemistry/l06-electrolysis: 2,000 divided by 96,485 is 0.0207. Rounding it early to 0.021 pushes the final mass off.; Carried through without early rounding, the result is 0.0104 moles and 0.66 grams of copper (0.6581 grams exactly), not 0.0105 moles and 0.67 grams.; Electrolysis converts one substance into another; it does not turn energy into matter.; Silver ions (reduction potential +0.80 volts) are spontaneously reduced by copper, brass and most other base metals, as in the classic silver-tree demonstration, so 'nothing happens because the reaction is not spontaneous' teaches a wrong spontaneity judgement. The replacement keeps the hook's point that an even coat needs an applied current. Occurs exactly once. This lesson is outside the 8 'ok' lessons; the reviewer edited it but missed this. (2026-10-27 expert review)
- chemistry/m12-organic-and-nuclear-chemistry/l01-hydrocarbons: The name came from odor; only the modern meaning refers to the electronic structure. (2026-10-27 expert review)
- chemistry/m12-organic-and-nuclear-chemistry/l02-oxygen-containing-functional-groups: Attaching a carbon chain to butanol's oxygen makes an ether, not an ester; in an ester the oxygen is bonded to a carbonyl carbon. (2026-10-27 expert review)
- chemistry/m12-organic-and-nuclear-chemistry/l03-amines-amides-and-polymers: Ring-opening polymerization releases no small molecule, so it is not a condensation polymerization as the paragraph defines it. (2026-10-27 expert review)
- chemistry/m12-organic-and-nuclear-chemistry/l05-half-life-and-radiometric-dating: Daughter nuclei are often radioactive: uranium two thirty-eight decays to radioactive thorium two thirty-four, as the previous lesson shows.; Reservoir corrections are adjustments for ocean and lake samples, not an independent calibration record. (2026-10-27 expert review)
- chemistry/m12-organic-and-nuclear-chemistry/l06-fission-fusion-and-radiation: Abbreviations must be spelled out on first use. (2026-10-27 expert review)
- computer-science/m01-computational-thinking-and-history/l03-pioneers-of-computing: Babbage proposed and designed the Difference Engine in the 1820s (from 1822), and the Analytical Engine followed from 1834. 'Mid-eighteen hundreds' misdates it.; Lovelace's notes speak of the engine composing music. 'Graphics' is not in her notes and is an anachronistic attribution.; The Turing machine did not 'prove' that it can run any algorithm. That is the Church-Turing thesis, which is accepted but cannot be proved, because 'algorithm' is an informal notion.; The subject guidance requires naming the competing claims for the first compiler, and 'undoubtedly the most influential' overstates. Adds Hopper's A-0 (1952), Glennie's Autocode (1952) and Backus's FORTRAN compiler (1957), without writing 'A-0', which the voice would misread. (2026-10-27 expert review)
- computer-science/m01-computational-thinking-and-history/l04-from-vacuum-tubes-to-smartphones: Machines like ENIAC used about eighteen thousand vacuum tubes, not hundreds.; Moore's 1965 paper predicted a doubling every year, and he revised it to about every two years in 1975. He co-founded Intel in 1968, after the observation. (2026-10-27 expert review)
- computer-science/m02-data-representation-and-compression/l01-bits-binary-and-hexadecimal: The voice reads a lone capital A as the article 'uh', so 'the letters A through F' would be heard as 'the letters uh through F'.; Plural to match the rest of the list of place values. (2026-10-27 expert review)
- computer-science/m02-data-representation-and-compression/l02-whole-numbers-and-overflow: Heard aloud, 'two to the power of n minus one' sounds the same as two to the n, minus one. The intended range is minus 2 to the (n minus 1) up to 2 to the (n minus 1), minus 1. Reworded so it cannot be misheard, and added the eight-bit case (minus 128 to 127, checked).; The bullet has the same problem: 'two to the power of n minus one minus one' cannot be parsed by ear. A concrete range replaces it.; This mixed up two cases. A millisecond uptime counter wraps to zero (2 to the 32 milliseconds is about 49.7 days); it does not jump decades. The jump into the past is the 2038 problem, where signed 32-bit seconds wrap to December 1901. Both checked. (2026-10-27 expert review)
- computer-science/m02-data-representation-and-compression/l03-fractions-and-floating-point: Storing bank balances in binary floating point is the standard example of what not to do; textbooks teach whole cents or decimal types for money. The old sentence also clashed with the next one, which lists financial modeling as high-stakes.; A stored one tenth compares equal to one tenth. The comparison fails for computed results: 0.3 minus 0.2 gives 0.09999999999999998 (checked). (2026-10-27 expert review)
- computer-science/m02-data-representation-and-compression/l04-text-encoding: The voice reads a lone capital A as 'uh'. B is also stored in a single byte, so the point is unchanged. (2026-10-27 expert review)
- computer-science/m02-data-representation-and-compression/l05-images-sound-and-compression: Sampling rate and bit depth alone give a bit rate, not a file size; you also need the duration and the number of channels. For example, 44,100 times 16 times 2 times 60 is about 10.6 megabytes per minute.; The bullet repeated the incomplete audio-size formula.; 'Beyond simple patterns' referred to an example the lesson never gave. Adds run-length encoding as the simple case. (2026-10-27 expert review)
- computer-science/m04-programming-concepts/l01-variables-types-and-expressions: Converting the string 123 to an integer, the lesson's own example, does not reinterpret the bit pattern. It reads the characters and builds a new value. Reinterpreting raw bits is a different and rarer operation. (2026-10-27 expert review)
- computer-science/m04-programming-concepts/l02-conditionals-and-branching: The voice reads a lone capital A as 'uh', so this would be heard as 'assign an uh'.; The two branches described unrelated outcomes (a discount and a shipping fee), which blurs the if-else contrast. (2026-10-27 expert review)
- computer-science/m05-algorithms-and-efficiency/l01-what-makes-a-good-algorithm: Correctness depends on the problem being solved and is not part of the standard definition of an algorithm (definite steps, inputs and outputs, finiteness). The subject summary itself lists it separately as 'plus correctness'.; Goes with the previous edit: correctness marks a good algorithm but is not a defining property. (2026-10-27 expert review)
- computer-science/m05-algorithms-and-efficiency/l03-measuring-efficiency-with-big-o: Big O is an upper bound that can describe the best, average or worst case. It is not by definition about the worst case.; Exponential-time problems are impractical, not impossible; 'impossible' belongs to the undecidable problems of module seven. The edit also gives this class the example the summary promises. (2026-10-27 expert review)
- computer-science/m05-algorithms-and-efficiency/l04-selection-and-insertion-sort: Theta notation is never taught; the previous lesson covers only big O. Selection sort makes n times (n minus 1) over 2 comparisons, which is about half of n squared.; The same untaught theta notation appears in the bullet. (2026-10-27 expert review)
- computer-science/m05-algorithms-and-efficiency/l05-recursion: A lone capital A used as a function name is read 'uh', so this would be heard as 'function uh calls function B'. (2026-10-27 expert review)
- computer-science/m06-data-structures/l01-arrays-and-lists: The lockers are numbered from zero, so fifty lockers (zero to forty-nine) come before locker fifty, not forty-nine. (2026-10-27 expert review)
- computer-science/m06-data-structures/l03-hash-tables: Hash-table caches live in main memory and save trips to disks, databases or networks. Avoiding main memory is the job of the hardware cache, which is a different thing. (2026-10-27 expert review)
- computer-science/m06-data-structures/l04-trees: Comparing each child only with its parent does not define a binary search tree. The rule applies to whole subtrees, as the body correctly says. (2026-10-27 expert review)
- computer-science/m06-data-structures/l05-graphs: Names the standard algorithm the lesson describes and states its one precondition: no negative edge weights. (2026-10-27 expert review)
- computer-science/m07-limits-of-computation/l01-tractable-and-intractable-problems: Both halves of the old sentence said the same thing (no clever algorithm is known), so the 'distinction' was empty. The real distinction is between a proven lower bound and merely having no known efficient algorithm. (2026-10-27 expert review)
- computer-science/m07-limits-of-computation/l02-p-versus-np: NP-completeness applies to yes-or-no (decision) problems. Finding the shortest route is the optimization version, which is NP-hard, not NP-complete.; A proof that P equals NP might not show how to build the fast algorithm, or the polynomial might be impractically large, so 'with ease' overclaims. (2026-10-27 expert review)
- computer-science/m07-limits-of-computation/l03-heuristics-and-approximation: PTAS and FPTAS are all-capital words of five letters or fewer that contain an A. The normaliser spells them letter by letter and the voice reads the A as 'uh'. The subject guidance says to use the full words for such acronyms. (2026-10-27 expert review)
- computer-science/m07-limits-of-computation/l04-undecidable-problems-and-the-halting-problem: The proof sketch left out the step where the contrary program is run on its own description, which is where the contradiction comes from. 'Asks the checker what it should do' does not make a proof. (2026-10-27 expert review)
- computer-science/m08-networks-and-the-internet/l02-ip-addresses-and-routing: Surviving attack was Baran's motive for packet switching, but historians and the ARPANET's builders stress that the ARPANET itself was built for resource sharing. 'Rand' is written in mixed case so the voice does not spell out R A N D with an 'uh'. (2026-10-27 expert review)
- computer-science/m08-networks-and-the-internet/l03-reliable-delivery-with-tcp: 'The Internet Protocol, or version four' makes the protocol and one of its versions sound like the same thing. (2026-10-27 expert review)
- computer-science/m08-networks-and-the-internet/l04-domain-name-system: Lowercase 'uk' is not caught by the acronym rule, so the voice will try to say it as a word.; In standard terms, the query from your computer to the resolver is the recursive one. The resolver then asks the root, top-level-domain and authoritative servers one after another (iterative queries), so it is not a 'recursive search' down the tree. (2026-10-27 expert review)
- computer-science/m09-security-and-cryptography/l02-social-engineering-and-phishing: Phishers routinely trick victims into handing over one-time codes, so multi-factor sign-in is not an absolute block. Adds the matching habit. (2026-10-27 expert review)
- computer-science/m09-security-and-cryptography/l03-symmetric-and-public-key-encryption: Practical ciphers are infeasible to break with any realistic amount of computing, not mathematically impossible. Only the one-time pad is provably unbreakable. (2026-10-27 expert review)
- computer-science/m10-databases-and-data/l03-data-at-scale: 'Pick two of three' is the popular misreading that Brewer himself has corrected. A system cannot opt out of partitions, so the real choice is consistency or availability during a partition, which the next sentence then describes.; The bullet contradicts itself: during a network failure, partition tolerance is already required, so there is no choice of 'two of three'. (2026-10-27 expert review)
- computer-science/m11-software-engineering/l01-development-life-cycle: Royce's 1970 paper presented the strict sequential model as risky and argued for iteration. He never used the word waterfall, which came later. Calling him the formalizer of the waterfall model is a well-known misattribution. (2026-10-27 expert review)
- computer-science/m11-software-engineering/l02-requirements-and-design: That definition describes availability. Reliability is how consistently, or for how long, the system runs without failure. (2026-10-27 expert review)
- computer-science/m11-software-engineering/l05-open-source-and-licensing: The four essential freedoms come from the Free Software Foundation's Free Software Definition. The Open Source Initiative's Open Source Definition is a list of ten criteria. This misattributes the lesson's central definition.; The bullet repeats the same misattribution.; This stated a contested claim as fact. Well-known open-source flaws such as Heartbleed and Shellshock went unnoticed for years. The edit gives the argument along with its limit. (2026-10-27 expert review)
- computer-science/m12-artificial-intelligence-and-ethics/l01-search-and-problem-solving: The voice reads the lone capital A in 'A star' as 'uh star'. The edit describes the method instead, and adds the condition (the estimate must never overestimate) without which it is not guaranteed to find the best path. Keeping the name would need a pronunciation fix in the pipeline.; The bullet has the same 'uh star' misreading. It now uses the other informed method the lesson names. (2026-10-27 expert review)
- computer-science/m12-artificial-intelligence-and-ethics/l02-machine-learning: Artificial neural networks are only loosely inspired by the brain. 'Emulate' overclaims, and the next lesson itself says 'inspired by'. (2026-10-27 expert review)
- computer-science/m12-artificial-intelligence-and-ethics/l03-neural-networks-and-deep-learning: The old phrasing was muddled ('before the early tens, specifically around twelve'). The date is now tied to the 2012 ImageNet result. (2026-10-27 expert review)
- computer-science/m12-artificial-intelligence-and-ethics/l04-large-language-models: The summary promises how these models are trained, and as of the mid-2020s that includes a second stage after pretraining: training on example answers and on human ratings. The added sentence also keeps the lesson safely above the 600-word floor (it was at 601).; Whether large language models reason is an open and actively debated question. The contract says to state such disagreement plainly rather than settle it. (2026-10-27 expert review)
- computer-science/m12-artificial-intelligence-and-ethics/l05-algorithmic-bias-and-fairness: The impossibility results (Kleinberg and colleagues; Chouldechova) do not hold in special cases such as equal base rates or perfect prediction.; Predictive parity means equal positive predictive value across groups. The old definition described calibration, which blurred the two metrics together.; Demographic parity and equal opportunity are not incompatible on their own; both can hold if false positive rates differ between groups. The theorems are about satisfying the whole set at once, mainly calibration or predictive parity together with equal error rates. (2026-10-27 expert review)
- psychology/m01-psychology-as-a-science/l01-origins-of-psychology: A misattribution of the same kind as the Vygotsky 'scaffolding' fix. Titchener named and led structuralism (his 1898 'Postulates of a Structural Psychology'). Historians, Leahey 1981 among them, show that Wundt's own system (voluntarism) differs from it. 'They' in the next sentence now refers to the structuralists. Prose goes from 652 to 665 words. (2026-10-27 expert review)
- psychology/m01-psychology-as-a-science/l02-schools-and-modern-perspectives: Watson's behaviorism (1913) reacted mainly against introspective, consciousness-centred psychology (structuralism), not against psychoanalysis. (2026-10-27 expert review)
- psychology/m01-psychology-as-a-science/l03-descriptive-and-correlational-research: The voice misreads a lone letter 'A' used as a variable name as the article 'a'. (2026-10-27 expert review)
- psychology/m01-psychology-as-a-science/l04-experiments-and-research-ethics: Animal research is reviewed by an animal care and use committee, not the Institutional Review Board. The body now names the right committee, so the corrected Key idea is actually taught.; The bullet implied that the Institutional Review Board protects animal participants. Animal studies go to a separate animal care committee. (2026-10-27 expert review)
- psychology/m01-psychology-as-a-science/l06-replication-crisis-and-open-science: Low power does not raise the per-test false-positive rate, which alpha fixes. It lowers the share of significant results that are true and inflates the effect sizes found. 'Mathematical certainty' was also overstated.; Replication projects add to ordinary small studies; they have not replaced them. (2026-10-27 expert review)
- psychology/m02-biology-of-behavior/l01-genes-evolution-and-behavior: The core twin design compares identical with fraternal twins, the 100 versus 50 percent contrast set up in the previous sentence, and the sentence left it out.; 'Indirect evolutionary anthropology' and 'a moderate, hypothetical explanation' are garbled phrases. (2026-10-27 expert review)
- psychology/m02-biology-of-behavior/l02-neurons-and-neural-communication: The Key ideas call the action potential all-or-nothing, but the body never teaches that idea. (2026-10-27 expert review)
- psychology/m02-biology-of-behavior/l03-the-nervous-system: The fight-or-flight concept dates from Walter Cannon in the early twentieth century, so 'centuries' is wrong. (2026-10-27 expert review)
- psychology/m02-biology-of-behavior/l04-the-brain: The normaliser turns the plural EEGs into 'E E Gs'. The singular reads cleanly.; The normaliser turns MRIs into 'M R Is', which the voice reads as the word 'is'.; The same plural-acronym misreadings ('M R Is', 'E E Gs') occur in the Key ideas. (2026-10-27 expert review)
- psychology/m02-biology-of-behavior/l05-endocrine-system: The pituitary hangs from the base of the brain, below the hypothalamus, not deep in its centre.; The old claim was garbled (suspicion toward one's own group). The research shows in-group favoritism and out-group bias. The edit also adds the replication problems of nasal-spray oxytocin studies, as the guidance asks. (2026-10-27 expert review)
- psychology/m03-states-of-consciousness/l03-sleep-disorders: In the sleep apnea paragraph, this sentence tells learners that actigraphy identifies apnea. Actigraphy records only movement and cannot detect breathing events. Apnea is diagnosed by polysomnography or home sleep apnea testing (AASM 2017). Prose goes from 628 to 636 words. (2026-10-27 expert review)
- psychology/m03-states-of-consciousness/l04-psychoactive-drugs: 'Excite neural activity and speed up body functions' reproduces a standard textbook glossary definition word for word.; The first sentence copies a textbook glossary definition verbatim. 'Five-HT-two-A' also ends in a lone 'A' that the voice misreads, and the serotonin mechanism applies to the classic psychedelics, not to all hallucinogens (ketamine and PCP work differently). (2026-10-27 expert review)
- psychology/m03-states-of-consciousness/l05-hypnosis-and-meditation: Nearly word for word a widely used textbook glossary definition of hypnosis. The contract forbids close paraphrase of textbooks.; Hilgard's evidence was the 'hidden observer' self-report, not measurements of brain processing. (2026-10-27 expert review)
- psychology/m04-sensation-and-perception/l01-thresholds-and-signal-detection: The embedded definition copies a textbook glossary entry verbatim. 'Sensitivity is proportional to magnitude' also inverted the relation: the change needed grows, so sensitivity to a fixed change falls. (2026-10-27 expert review)
- psychology/m04-sensation-and-perception/l05-touch-pain-and-body-senses: 'Toward the middle of the brain' suggests a deep structure. The somatosensory strip is on the surface, just behind the motor cortex.; A-delta fibers are thin, lightly myelinated fibers (the 'small fibers' of gate-control theory), not thick ones. Their name also starts with a lone 'A', which the voice misreads.; The voice reads the lone 'A' in 'A-delta' as the article. The new wording matches the corrected body. (2026-10-27 expert review)
- psychology/m05-learning-and-memory/l01-classical-conditioning: Acquisition is the initial learning stage, not 'the strength of the learning'. In delay conditioning the stimulus overlaps with the food, and the old wording did not tell it apart from trace conditioning. (2026-10-27 expert review)
- psychology/m05-learning-and-memory/l04-how-memory-works: Visual (iconic) sensory memory lasts well under a second. Only echoic memory lasts a few seconds. (2026-10-27 expert review)
- psychology/m05-learning-and-memory/l05-forgetting-and-false-memories: 'No empirical support' overstates a dispute that is still open. The guidance asks to name both positions. (2026-10-27 expert review)
- psychology/m05-learning-and-memory/l06-improving-memory-and-learning: The spacing effect rests mainly on experiments, not longitudinal studies. It improves long-term retention; it is not what moves material out of working memory.; Concrete examples are not a desirable difficulty. Spacing and interleaving are the standard examples, and the body teaches both. (2026-10-27 expert review)
- psychology/m06-thinking-language-and-intelligence/l01-concepts-and-problem-solving: Gamma-band bursts are measured with EEG, not functional MRI. The finding (Jung-Beeman and colleagues) is in the right hemisphere and comes from one research group, and the structure needed a spoken location. (2026-10-27 expert review)
- psychology/m06-thinking-language-and-intelligence/l02-heuristics-and-biases: The conjunction fallacy and base-rate neglect are separate errors, and the bullet merged them. (2026-10-27 expert review)
- psychology/m06-thinking-language-and-intelligence/l04-theories-of-intelligence: A garbled repetition, read aloud as 'emotional intelligence, or emotional intelligence, E Q'. (2026-10-27 expert review)
- psychology/m06-thinking-language-and-intelligence/l06-genes-environment-and-intelligence: The summary promises to explain why heritability cannot by itself explain group differences, but the lesson only asserted it. The edit adds the classic seed analogy.; A non sequitur: rising scores could never prove that intelligence is fixed. The real caveat is whether underlying ability rose as much as the scores did. (2026-10-27 expert review)
- psychology/m07-lifespan-development/l02-attachment-and-early-relationships: Bowlby was a psychiatrist and psychoanalyst.; The current view is a sensitive period, not a critical one, and the lesson itself says later relationships can reshape attachment. (2026-10-27 expert review)
- psychology/m07-lifespan-development/l03-cognitive-development: Vygotsky did not coin 'scaffolding'. Wood, Bruner and Ross introduced the term in the nineteen-seventies. (2026-10-27 expert review)
- psychology/m07-lifespan-development/l04-moral-and-psychosocial-development: The summary promises 'the criticisms' of Kohlberg, including Gilligan's, but only Gilligan's was given. (2026-10-27 expert review)
- psychology/m07-lifespan-development/l05-adolescence: An unsourced specific effect size. The guidance forbids inventing statistics. (2026-10-27 expert review)
- psychology/m07-lifespan-development/l06-adulthood-aging-and-death: Kubler-Ross described dying patients, not bereaved people. The evidence problem is that there is no fixed sequence, not that the feelings are a myth. (2026-10-27 expert review)
- psychology/m08-motivation-emotion-and-stress/l01-theories-of-motivation: The Yerkes-Dodson 'law' is not a well-replicated finding: it rests on a 1908 study of mice, and human evidence is mixed. The task-difficulty part of the law was also missing.; Competing meta-analyses disputed how general the overjustification effect is. The guidance asks to name such debates. (2026-10-27 expert review)
- psychology/m08-motivation-emotion-and-stress/l02-hunger-and-eating: 'Evidence-based' describes treatments, not conditions. (2026-10-27 expert review)
- psychology/m08-motivation-emotion-and-stress/l03-sexual-behavior: Overstates a settled consensus on prenatal biological causes. Genetic studies explain only a modest share of the variation, and the hormonal account is still a hypothesis.; Matches the corrected body: it states the evidence without presenting the question as closed. (2026-10-27 expert review)
- psychology/m08-motivation-emotion-and-stress/l04-emotion: The summary promises 'the debate' over universal basic emotions, but the lesson gave only Ekman's side.; Updates the Key idea to match the debate now taught in the body. (2026-10-27 expert review)
- psychology/m08-motivation-emotion-and-stress/l05-stress-coping-and-health: Reproduces a textbook glossary definition of stress word for word. (2026-10-27 expert review)
- psychology/m09-personality/l01-freud-and-the-psychodynamic-tradition: The id, ego and superego model dates from The Ego and the Id (1923), not the late nineteenth century.; Heard aloud, 'social security' suggests the government program. Horney stressed the child's need for security. (2026-10-27 expert review)
- psychology/m09-personality/l02-humanistic-and-social-cognitive-approaches: Unconditional positive regard is only the acceptance condition, not a name for all three conditions. (2026-10-27 expert review)
- psychology/m09-personality/l03-trait-theories-and-the-big-five: The summary promises trait theories 'from Allport and Eysenck', but the lesson never mentioned Eysenck.; An unsourced, unexplained statistic (factor loadings), replaced with the documented cross-cultural limit that the summary asks for.; The normaliser spells OCEAN letter by letter ('O C E A N', with a lone 'A'), which loses the mnemonic. (2026-10-27 expert review)
- psychology/m09-personality/l05-personality-assessment: A garbled repetition of the full name. The summary calls it the MMPI.; Meta-analytic work supports a few Rorschach variables. The guidance asks to state both positions. (2026-10-27 expert review)
- psychology/m10-social-psychology/l01-attribution-and-self-presentation: Biases are not 'evidence-based patterns of thought', and the self-protective role belongs mainly to the self-serving bias.; The actor-observer bias is taught as settled, but Malle's 2006 Psychological Bulletin meta-analysis of 173 studies found an average asymmetry near zero that appears only under particular conditions. The guidance requires saying so for seriously criticized classics. The self-serving bias is strongly supported (Mezulis 2004). Does not overlap edit 056. Prose goes from 636 to 680 words. (2026-10-27 expert review)
- psychology/m10-social-psychology/l03-conformity-compliance-and-obedience: The voice reads a lone letter 'A' used as a line label as the article 'a'.; A near word-for-word copy of a textbook glossary definition.; Review boards came mainly from research-ethics laws of the nineteen-seventies, prompted largely by medical abuses. Milgram fed that debate but did not by himself 'lead to' them. (2026-10-27 expert review)
- psychology/m10-social-psychology/l05-prejudice-and-discrimination: A word-for-word copy of a textbook glossary definition. (2026-10-27 expert review)
- psychology/m10-social-psychology/l06-aggression-helping-and-attraction: 'Many people did call the police' overcorrects the myth. The record shows few real witnesses, one or two calls, and one neighbor (Sophia Farrar) who went to her. (2026-10-27 expert review)
- psychology/m11-psychological-disorders/l01-defining-and-diagnosing-disorders: The four Ds are a teaching framework. No longitudinal studies validate them. (2026-10-27 expert review)
- psychology/m11-psychological-disorders/l02-anxiety-and-related-disorders: Meta-analyses put drug-versus-placebo effects for anxiety disorders in the small-to-moderate range, not moderate-to-large. (2026-10-27 expert review)
- psychology/m11-psychological-disorders/l03-depression-and-bipolar-disorder: The DSM definition of a manic episode requires abnormal mood plus increased energy for at least a week. The old text left out mood. (2026-10-27 expert review)
- psychology/m11-psychological-disorders/l05-dissociative-and-personality-disorders: Ego-syntonic traits are typical but not defining. People with borderline personality disorder, for example, often find their symptoms distressing.; 'Cluster A' is a lone letter A used as a label. The acro rule leaves single letters alone, so the voice reads it as the article. This is the same problem the reviewer fixed in 002, 022 and 057, and it was the only remaining instance in the subject (grep confirmed). B and C are kept because they read correctly, and the Key idea names Cluster B. Does not overlap edit 065. (2026-10-27 expert review)
- psychology/m12-therapy-and-treatment/l01-mental-health-care-past-and-present: Dorothea Dix's campaigns began in the eighteen-forties, in the mid-nineteenth century. (2026-10-27 expert review)
- psychology/m12-therapy-and-treatment/l05-group-family-and-community-approaches: An unsourced specific effect size with unexplained jargon ('d-value'). The guidance forbids inventing effect sizes.; An unsourced specific effect size. The edit keeps the qualitative claim.; Housing First trials show large gains in housing stability, but systematic reviews find mental health outcomes similar to usual care. (2026-10-27 expert review)
- psychology/m12-therapy-and-treatment/l06-how-well-treatment-works: Alliance-outcome correlations are about point two to point three, and the earlier lesson rightly calls the link modest. (2026-10-27 expert review)
- us-history/m01-native-america-and-the-atlantic-world/l02-europe-and-west-africa-before-1492: The 'navigation school at Sagres' is a legend modern historians reject, and placing Portugal's effort after 1453 reverses the chronology: Henry's voyages began in the 1410s to 1430s.; Portuguese Atlantic voyages predate 1453, so 1453 did not 'force' the search; it added to existing incentives.; Key ideas repeats the discredited Sagres 'school' claim. (2026-10-27 expert review)
- us-history/m01-native-america-and-the-atlantic-world/l03-columbus-and-the-columbian-exchange: Horses evolved in the Americas and died out there about ten thousand years ago; it was domesticated horses that were new. (2026-10-27 expert review)
- us-history/m01-native-america-and-the-atlantic-world/l04-new-spain-and-the-borderlands: The summary promises 'the Spanish conquest', but the lesson never names the conquests of the Aztec and Inca empires. (2026-10-27 expert review)
- us-history/m02-the-english-colonies/l01-jamestown-and-the-chesapeake: As written, it says the starving time was survived thanks to Powhatan generosity; in fact the Powhatan were besieging the fort that winter. Their trade sustained the colony in its earliest years.; The 1632 date is the charter; settlement began in 1634. (2026-10-27 expert review)
- us-history/m02-the-english-colonies/l02-puritan-new-england: When heard, the dashes become commas, so 'King Philip' seems to name Massasoit rather than Metacom. (2026-10-27 expert review)
- us-history/m02-the-english-colonies/l04-rise-of-racial-slavery: Around 1700 enslaved people were roughly a quarter of Virginia's population, not a majority of the whole labor force. The standard claim is that they outnumbered indentured servants among bound laborers.; 'seventeen hundred and five' is an odd way to say a year. With numerals, the normaliser reads 'sixteen sixty-seven' and 'seventeen oh five', as the subject guidance asks.; Same overstatement in Key ideas. (2026-10-27 expert review)
- us-history/m02-the-english-colonies/l06-imperial-wars-and-the-seven-years-war: France had no stake in the Philippines. The fighting there was Britain against Spain, France's ally, with Manila taken in 1762. (2026-10-27 expert review)
- us-history/m03-the-road-to-revolution/l03-declaration-of-independence: The Declaration says it is 'the Right of the People to alter or to abolish it'. It uses 'duty' only for throwing off a government after a long train of abuses. (2026-10-27 expert review)
- us-history/m03-the-road-to-revolution/l04-war-for-independence: The Polish letter ł is likely to be mispronounced or dropped by the voice. Casimir Pulaski is the standard English form in American textbooks.; Article 7 of the 1783 treaty explicitly forbade the British from 'carrying away any Negroes'. The treaty did address them; the British ignored that clause and evacuated about three thousand people. (2026-10-27 expert review)
- us-history/m04-creating-a-nation/l01-articles-of-confederation: Only major measures (war, treaties, money, borrowing, appropriations) needed nine states; other questions took a majority of states. (2026-10-27 expert review)
- us-history/m04-creating-a-nation/l02-constitutional-convention: The clause barred Congress from banning imports before 1808. It did not guarantee that the trade would grow. (2026-10-27 expert review)
- us-history/m04-creating-a-nation/l04-washington-hamilton-and-the-first-parties: Jefferson's party called itself Republican. 'Democratic-Republican' is mainly a later label; the subject summary itself says 'Jeffersonian Republicans'. (2026-10-27 expert review)
- us-history/m04-creating-a-nation/l06-missouri-compromise-and-monroe-doctrine: The land and credit boom behind the Panic of 1819 came after the war, from 1815 to 1818. (2026-10-27 expert review)
- us-history/m05-markets-democracy-and-reform/l01-market-revolution: Wage labor existed long before the Lowell mills; the factory system spread it. (2026-10-27 expert review)
- us-history/m05-markets-democracy-and-reform/l03-indian-removal: The Senate vote was on May 18, 1836. May 23 is when Jackson proclaimed the treaty. 31 of 46 is the bare two-thirds minimum.; Each removal route was roughly 800 to 1,200 miles, not thousands.; The body itself says some Seminoles stayed, and the Eastern Band of Cherokee and Mississippi Choctaw also remained, so the displacement was not 'total'. (2026-10-27 expert review)
- us-history/m05-markets-democracy-and-reform/l04-slavery-and-the-cotton-south: Most of the Black people killed with no link to Turner died at the hands of white militias and mobs, not by state execution. (2026-10-27 expert review)
- us-history/m06-expansion-and-sectional-crisis/l02-manifest-destiny-and-the-west: The summary promises 'Texas independence', but the lesson gave only the date. Added the standard account of the settlers, the revolt, the Alamo and San Jacinto. (2026-10-27 expert review)
- us-history/m06-expansion-and-sectional-crisis/l03-mexican-american-war: The United States already had a Pacific coastline from the 1846 Oregon Treaty, which the previous lesson teaches. (2026-10-27 expert review)
- us-history/m06-expansion-and-sectional-crisis/l04-compromise-of-1850-and-fugitive-slaves: As written, it sounds as if Texas paid ten million dollars. In fact the federal government paid Texas ten million dollars toward its debts in return for dropping its claim to New Mexico land. (2026-10-27 expert review)
- us-history/m07-civil-war-and-reconstruction/l01-secession-and-the-coming-of-war: The 'needless war' or 'blundering generation' school was the revisionism of the 1930s and 1940s (James G. Randall's 1940 'The Blundering Generation', Avery Craven), not the early twentieth century. The lesson's summary promises historians' explanations, so the wrong dating misleads on a core point. The old string occurs exactly once, and the normaliser gives 'nineteen thirties and nineteen forties'. (2026-10-27 expert review)
- us-history/m07-civil-war-and-reconstruction/l02-course-of-the-war: The traditional 620,000 figure has been revised upward, to about 750,000 in the 2011 census-based estimate. The guidance asks for a range where estimates differ. (2026-10-27 expert review)
- us-history/m07-civil-war-and-reconstruction/l04-reconstruction-in-washington: The Bureau was created in March 1865, under Lincoln, so it could not be a response to Johnson's policies. Congress's response was the 1866 extension, passed over his veto.; The military districts came in 1867, before the 1868 impeachment, not after Johnson's acquittal. (2026-10-27 expert review)
- us-history/m08-the-west-and-the-gilded-age/l01-plains-wars-and-native-nations: Pratt's 1892 words were 'Kill the Indian in him, and save the man.' The shortened slogan is a later paraphrase, not his wording, and not a school motto. (2026-10-27 expert review)
- us-history/m08-the-west-and-the-gilded-age/l02-railroads-and-the-settlement-of-the-west: The 1862 act already covered 'any person who is the head of a family, or who has arrived at the age of twenty-one years', so single women and widows could file from the start. No amendment was needed. (2026-10-27 expert review)
- us-history/m08-the-west-and-the-gilded-age/l04-workers-and-the-labor-movement: Gompers called his approach 'pure and simple' unionism. 'Bread and butter unionism' is a later descriptive label. (2026-10-27 expert review)
- us-history/m08-the-west-and-the-gilded-age/l05-immigration-and-the-growth-of-cities: Big-city tenements were typically five-to-seven-story walk-ups, not low-rise buildings. (2026-10-27 expert review)
- us-history/m09-populism-empire-and-progressivism/l01-gilded-age-politics-and-populism: Bryan's 1896 line was 'you shall not crucify mankind upon a cross of gold'. The paraphrase should keep 'mankind'. (2026-10-27 expert review)
- us-history/m09-populism-empire-and-progressivism/l02-american-empire: Hay wrote the letter from London on July 27, 1898, while he was ambassador to Britain. He became secretary of state that September. (2026-10-27 expert review)
- us-history/m09-populism-empire-and-progressivism/l03-progressive-reformers: Unspaced 'W.E.B.' risks being read as the word 'web'. The spaced form matches the earlier Jim Crow lesson. (2026-10-27 expert review)
- us-history/m09-populism-empire-and-progressivism/l05-the-first-world-war: Wilson's August 1914 appeal said 'impartial in thought as well as in action'. (2026-10-27 expert review)
- us-history/m10-boom-depression-and-world-war/l01-prosperity-and-conflict-in-the-1920s: Scopes was in fact convicted and fined one hundred dollars. 'Seemed to favor' is vague and misleading. (2026-10-27 expert review)
- us-history/m10-boom-depression-and-world-war/l02-great-depression: The lesson promises 'Hoover's response' but describes only voluntarism. Standard surveys also cover his Reconstruction Finance Corporation of 1932. (2026-10-27 expert review)
- us-history/m10-boom-depression-and-world-war/l04-the-road-to-world-war-two: Cash-and-carry for non-military goods came with the 1937 act. The 1939 act's change was to repeal the arms embargo and allow weapons sales on cash-and-carry terms.; About nineteen to twenty-one ships were sunk or damaged, and only a few were total losses, so 'destroyed dozens' is wrong. 188 aircraft were destroyed. (2026-10-27 expert review)
- us-history/m10-boom-depression-and-world-war/l05-fighting-world-war-two: Most historians put the war's turning point on the Eastern Front, at Stalingrad. D-Day was decisive in the west.; Midway was a carrier battle fought by aircraft at long range, not island-hopping close-quarters combat.; Deaths by the end of 1945 are usually estimated at about 110,000 to 210,000 for the two cities, far more than 'thousands more'.; Same overstatement in Key ideas; the body itself credits the Soviet advance. (2026-10-27 expert review)
- us-history/m10-boom-depression-and-world-war/l06-the-home-front: The normaliser turns 'Double V' (capitalised word, space, V) into 'Double the Fifth'. The hyphenated form avoids that.; The Double V campaign began in February 1942, after the June 1941 order, so it cannot have produced it. The order was won by A. Philip Randolph's March on Washington Movement. The number is also spelled out, because '8802' would be read as 'eight thousand eight hundred two'.; A four-digit non-year number; spoken the way historians say it rather than 'nine thousand sixty-six'.; Braceros were temporary contract laborers, not immigrants.; Fixes the same chronology error in Key ideas and avoids the 'Double the Fifth' misreading. (2026-10-27 expert review)
- us-history/m11-cold-war-and-civil-rights/l01-origins-of-the-cold-war: Airlift planes landed and unloaded at West Berlin airfields; they did not drop cargo.; Post-revisionism, as in Gaddis, is usually described as shared responsibility and mutual misperception, not inevitability 'regardless of the choices of leaders'. (2026-10-27 expert review)
- us-history/m11-cold-war-and-civil-rights/l02-korea-and-the-nuclear-age: About 36,000 is the American death toll; Americans killed or wounded were over 140,000. Korean and Chinese deaths alone are usually estimated at two to three million or more, so 'two million killed or wounded' understates them. (2026-10-27 expert review)
- us-history/m11-cold-war-and-civil-rights/l04-civil-rights-movement: The normaliser spells CORE out as 'C O R E', but the name is said as the word 'core'.; Same CORE misreading in Key ideas. (2026-10-27 expert review)
- us-history/m11-cold-war-and-civil-rights/l06-vietnam-war: The 1969 lottery replaced a deferment system seen as unfair; it was not created to fix manpower shortages.; The summary promises 'the counterculture at home', which the lesson never mentions. (2026-10-27 expert review)
- us-history/m12-recent-america/l01-protest-and-new-rights-movements: The Alcatraz occupation of 1969 to 1971 was led by Indians of All Tribes, not the American Indian Movement. (2026-10-27 expert review)
- us-history/m12-recent-america/l02-watergate-and-the-1970s: Misspelled proper name, which also shows on screen. (2026-10-27 expert review)
- us-history/m12-recent-america/l03-the-conservative-turn: The normaliser spells out every two-to-five-letter capitalised word, so 'STOP' would be read 'S T O P'.; Same 'S T O P' misreading in Key ideas.; PATCO is said as a word ('pat-co'), but the normaliser would spell it 'P A T C O'. (2026-10-27 expert review)
- us-history/m12-recent-america/l04-end-of-the-cold-war-and-the-1990s: The quoted sentence and its setting (a UN address in 1991) cannot be verified and appear invented. It is replaced with Bush's well-documented remark of August 5, 1990.; The summary promises 'the collapse of the Soviet Union', but the lesson never says how or when it happened.; The 1994 Crime Bill was signed in September 1994 by a Democratic Congress, before the November Republican takeover, so the takeover did not produce it.; Same misattribution in Key ideas. (2026-10-27 expert review)
- us-history/m12-recent-america/l05-september-11-and-the-war-on-terror: The 'no distinction' line comes from Bush's address on the evening of September 11, not from the joint session nine days later.; The normaliser does not handle '9/11'. The voice may read the slash, or read it as a fraction such as 'nine elevenths'.; Same '9/11' misreading in Key ideas.; About 7,000 Americans were killed and over 50,000 wounded in the two wars; 'thousands' understates both. (2026-10-27 expert review)
- us-history/m12-recent-america/l06-the-twenty-first-century: Afghanistan is in Central and South Asia, not the Middle East.; The pandemic began in early 2020, at the start of a decade, not 'midway' through one.; The summary says the lesson ends with the 2024 election and Trump's return in January 2025; the lesson never mentions either, and Biden's presidency was thin. The added facts are well established and stated neutrally.; Adds the promised 2024 election to Key ideas, making five bullets. (2026-10-27 expert review)
- church-history/m01-the-apostolic-church/l01-jewish-world-of-jesus: 'Rigid legalism' is the old polemical stereotype of Pharisaic Judaism that modern scholarship (Sanders and after) rejects. The subject guidance requires describing Judaism in terms its adherents would accept and saying whose view a judgment is.; No Roman legions were stationed in Galilee while Antipas ruled, so Roman soldiers marching there is misleading. The edit also places Galilee in its modern country, as the guidance requires. (2026-10-27 expert review)
- church-history/m01-the-apostolic-church/l02-pentecost-and-the-jerusalem-church: Grammar slip: the passage is one chapter (Joel 2:28-32), so 'chapters' should be 'chapter'.; In Acts the arrest of Peter and John (Acts 4) comes before the Seven are appointed (Acts 6), not 'soon' after. The old punctuation also made Peter and John sound like the only apostles.; The summary promises the community's leaders, but James the brother of Jesus, the main leader of the Jerusalem church in Acts 15 and Galatians, was missing. (2026-10-27 expert review)
- church-history/m01-the-apostolic-church/l03-paul-and-the-gentile-mission: As written, Corinth and Ephesus seem to be founded before the Jerusalem meeting of about 49 CE, but in Acts they come on the later journeys. The edit also covers the missionary journeys the summary promises. (2026-10-27 expert review)
- church-history/m01-the-apostolic-church/l04-early-worship-and-leadership: Paul's letters do not record a 'transition from the Sabbath'. The evidence is meetings on the first day of the week (Acts 20:7, 1 Corinthians 16:2) and 'the Lord's day' (Revelation 1:10), and many Jewish Christians kept both days. (2026-10-27 expert review)
- church-history/m01-the-apostolic-church/l05-parting-of-the-ways: The tax was not levied on the Temple. It was the half-shekel Temple tax paid by Jews, which Vespasian redirected to Jupiter Capitolinus.; Whether the Birkat ha-Minim was aimed at Christians is a well-known scholarly debate (minim means heretics in general). This lesson is about debate over the parting, yet it stated the point as fact. (2026-10-27 expert review)
- church-history/m02-the-church-of-the-martyrs/l02-the-apologists: Heard aloud, 'emperors, such as Justin Martyr' makes Justin an emperor. Who the Second Apology was addressed to (the Senate or Marcus Aurelius) is also disputed, so that claim is dropped.; 'Faith seeking understanding' is Anselm's eleventh-century formula. Crediting the second-century apologists with developing it is anachronistic. (2026-10-27 expert review)
- church-history/m02-the-church-of-the-martyrs/l04-rule-of-faith-bishops-and-canon: The summary promises how the canon took shape over several centuries, but the lesson stopped at about 200 CE. The disputed books and Athanasius's Festal Letter of 367 are the standard markers. (2026-10-27 expert review)
- church-history/m03-constantine-and-the-imperial-church/l01-constantine-and-the-edict-of-milan: The 'edict' was an agreement reached at Milan and issued by Licinius as a rescript (at Nicomedia, June 313). Lactantius and Eusebius preserve its actual text, not just a knowledge of its provisions. (2026-10-27 expert review)
- church-history/m03-constantine-and-the-imperial-church/l02-arius-and-the-council-of-nicaea: Constantine had already intervened in the Donatist dispute by calling the Council of Arles in 314. What was new at Nicaea was an empire-wide council on doctrine. (2026-10-27 expert review)
- church-history/m03-constantine-and-the-imperial-church/l03-athanasius-cappadocians-and-constantinople: Coming right after the Council of 381, the original says monasticism 'began to emerge'. Antony withdrew about 270 and Pachomius founded his community about 320. The next lesson, with edit 015, now says 'decades before Constantine', so the two lessons contradict each other. (2026-10-27 expert review)
- church-history/m03-constantine-and-the-imperial-church/l04-rise-of-monasticism: The lesson frames monasticism as a response to Constantine's favor, but Antony withdrew about forty years before 313. Saying so keeps the chronology honest.; Egypt was itself part of the Eastern Roman Empire, so the movement could not cross from Egypt into it.; Martin founded Ligugé about 361 and Cassian settled at Marseille about 415, half a century later, so 'shortly after' is wrong. (2026-10-27 expert review)
- church-history/m04-fathers-councils-and-divisions/l01-augustine-of-hippo: Augustine says he seized a codex (a bound book) of the Apostle, not a scroll.; Manichaeism was a religion founded by the prophet Mani, with its own scriptures and clergy, not a philosophical school. (2026-10-27 expert review)
- church-history/m04-fathers-councils-and-divisions/l02-jerome-ambrose-and-chrysostom: Jerome argued against treating the deuterocanonical books as canonical (in the Prologus Galeatus) and translated only Tobit and Judith. The Vulgate's other deuterocanonical books are Old Latin texts added later.; Ambrose is known for his hymns. The repertory called Ambrosian chant developed after him and only carries his name. (2026-10-27 expert review)
- church-history/m04-fathers-councils-and-divisions/l03-ephesus-and-chalcedon: Nestorius's view did not form the Church of the East. That church already existed in Persia and later adopted the Antiochene theology of Theodore of Mopsuestia. The next lesson says so, and the guidance forbids using old polemical labels as names.; The same error appears in the Key ideas. Followers of Nestorius did not found the Church of the East, which is older than he is, and saying so repeats the polemical 'Nestorian' label.; Nestorius became patriarch in 428, in the late 420s, not the early 400s. (2026-10-27 expert review)
- church-history/m04-fathers-councils-and-divisions/l04-churches-beyond-chalcedon: The summary promises modern agreements for both church families, but the lesson named none involving the Church of the East. The 1994 declaration of John Paul II and Mar Dinkha IV is the standard example. (2026-10-27 expert review)
- church-history/m04-fathers-councils-and-divisions/l05-fall-of-rome-benedict-and-gregory: In Gregory's day Rome was still under the Eastern Roman (Byzantine) emperor, and Gregory was his loyal subject, so the church was not simply independent of the Roman state. (2026-10-27 expert review)
- church-history/m05-the-early-medieval-church/l01-missions-to-ireland-britain-and-germany: Patrick's mission is traditionally dated from 432, and many scholars place it later in the century, so 'early fifth century' claims more than is known.; Gregory sent the mission in 596; it arrived in Kent in 597. (2026-10-27 expert review)
- church-history/m05-the-early-medieval-church/l02-the-papacy-and-charlemagne: The filioque did not begin at the Frankish court; it comes from Visigothic Spain (Toledo, 589). 'The West adopted' it is wrong for Rome: Leo III refused to insert it in 809-810, and Rome added it only in 1014.; Edit 029 corrects the body, but this Key idea still says the filioque began at the Frankish court. It came from Visigothic Spain (Toledo, 589), and Rome added it only in 1014. Left as it is, the bullet contradicts the corrected body. (2026-10-27 expert review)
- church-history/m05-the-early-medieval-church/l04-church-of-the-east-in-asia: The Church of the East already had its Syriac Bible, the Peshitta. Its missionaries translated from Syriac into Sogdian, Chinese and other languages, not into Syriac.; Contact with India ran by sea, not across the mountains after Central Asia. About 550, Cosmas Indicopleustes reports clergy appointed from Persia on the Malabar coast. (2026-10-27 expert review)
- church-history/m05-the-early-medieval-church/l06-cyril-methodius-and-the-slavs: Rastislav's request reached Constantinople in 862; the brothers arrived in Moravia in 863. (2026-10-27 expert review)
- church-history/m06-the-high-medieval-church/l01-monastic-and-papal-reform: This is the same 'formal break' overstatement the reviewer fixed in the next lesson (edit 033). The 1054 bulls targeted individuals, and the next lesson's summary says most historians see the split as a long process. As written, the two lessons contradict each other. (2026-10-27 expert review)
- church-history/m06-the-high-medieval-church/l02-east-west-schism-of-1054: This Key idea contradicts the first Key idea and the body, which present the split as a long process, not one event. The 1054 bulls excommunicated individuals, not churches.; This supports the corrected Key idea and the summary's point that 1054 was not one clean break. The joint lifting of the excommunications on 7 December 1965 is standard. (2026-10-27 expert review)
- church-history/m06-the-high-medieval-church/l03-the-crusades: Saladin took Jerusalem in 1187, after the battle of Hattin and before the Third Crusade (1189 to 1192). That crusade was launched in response and failed to retake the city.; Current scholarship credits translation centres in Spain (Toledo) and Sicily, not the crusader states, with most of the transmission of Arabic and Greek learning. (2026-10-27 expert review)
- church-history/m06-the-high-medieval-church/l06-dissent-and-the-inquisition: The summary promises the inquisitions' methods. Leaving out the papal authorization of torture (Ad extirpanda, 1252) is a whitewash, which the guidance forbids. (2026-10-27 expert review)
- church-history/m07-the-late-medieval-church/l01-avignon-and-the-western-schism: The transition says new thinkers emerged after Constance, and the next lesson is on Wycliffe (died 1384) and Hus (burned at Constance in 1415). Both were active before or during the council. This is the same chronology error the reviewer fixed in m07 l03 (edit 039). (2026-10-27 expert review)
- church-history/m07-the-late-medieval-church/l02-wycliffe-hus-and-dissent: An indulgence is not a payment. In Catholic teaching it remits temporal punishment for sins already forgiven, and in this period it was often obtained by giving money. The guidance asks for definitions a tradition's own members would accept. (2026-10-27 expert review)
- church-history/m07-the-late-medieval-church/l03-mystics-and-lay-devotion: Wycliffe (died 1384) and Hus (died 1415) were contemporaries of Julian, Catherine and Groote, and the previous lesson already covered them. The Imitation of Christ was written after Hus died, so 'later ... would build upon' gets the order wrong. (2026-10-27 expert review)
- church-history/m07-the-late-medieval-church/l04-renaissance-humanism-and-erasmus: 'Riddled with errors' overstates Erasmus's critique of the Vulgate and is unfair to the Catholic tradition. The real problems were accumulated copying errors and some translation choices. (2026-10-27 expert review)
- church-history/m07-the-late-medieval-church/l05-fall-of-constantinople-and-russia: Western aid did arrive, though it was not enough: the Crusade of Varna in 1444, and Giustiniani's Genoese and Venetian troops in 1453.; In practice Russian autocephaly dates from 1448, when Metropolitan Jonas was elected without Constantinople. 1589 raised Moscow to a patriarchate, installed by Patriarch Jeremias II of Constantinople, rather than first separating the two churches. (2026-10-27 expert review)
- church-history/m08-the-protestant-reformations/l01-luther-and-wittenberg: Luther's letter to Albrecht of 31 October 1517 is certain. The door posting rests on later testimony (Melanchthon) and has been debated since Iserloh, so it should not be stated as plain fact. (2026-10-27 expert review)
- church-history/m08-the-protestant-reformations/l03-zwingli-and-reformed-beginnings: The contract requires every Bible quotation to name its public-domain translation and reference. The wording matches KJV Matthew 26:26. (2026-10-27 expert review)
- church-history/m08-the-protestant-reformations/l04-calvin-and-geneva: The lesson left out Calvin's own part in the prosecution and how Servetus died. The guidance asks for the church's failures to be told soberly, without whitewash. (2026-10-27 expert review)
- church-history/m08-the-protestant-reformations/l05-anabaptists-and-radical-reformers: No Anabaptist leader named Margaretha Blaurock is documented in the standard sources; the name looks invented from George Blaurock. Elisabeth Dirks, a teacher drowned at Leeuwarden in 1549, is well attested.; The baptisms of 21 January 1525, in Felix Manz's house, were done by pouring water from a dipper, not by going to a river.; In 1525 the Swiss Brethren broke with Zwingli. Calvin's reform in Geneva began only in 1536. (2026-10-27 expert review)
- church-history/m08-the-protestant-reformations/l06-english-and-scottish-reformations: The Ten Articles (1536) and Six Articles (1539) belong to Henry's reign, not Edward's, and the Six Articles reaffirmed Catholic doctrine against Cranmer's wishes. Cranmer's work under Edward was the 1549 and 1552 Prayer Books and the Forty-Two Articles.; The First Book of Discipline did not abolish bishops. It created superintendents, and bishops persisted in Scotland until 1689. Full presbyterianism came later, with Melville and the Second Book of Discipline of 1578.; The same error appears in the Key ideas: the 1560 settlement did not abolish the office of bishop. The summary itself says Knox led the church 'toward' Presbyterian order. (2026-10-27 expert review)
- church-history/m09-catholic-reform-and-the-confessional-age/l01-council-of-trent: As written, the bullet says original sin is necessary for baptism. The body correctly says baptism is necessary to remit original sin. (2026-10-27 expert review)
- church-history/m09-catholic-reform-and-the-confessional-age/l04-wars-of-religion-and-westphalia: The summary promises how Westphalia settled religion in the empire. The lesson leaves out its central mechanism: the Treaty of Osnabrück (Article V) fixed confessional status at the normative year 1624, limiting princes' right to impose religion, and granted dissenters private worship and the right to emigrate. As written, Westphalia sounds like it simply re-enacted the Augsburg principle. (2026-10-27 expert review)
- church-history/m09-catholic-reform-and-the-confessional-age/l05-puritans-and-pietists: The Moravians were among the most active Protestant missionaries of the century, as the next sentence shows, so 'almost missionary' contradicts the lesson. (2026-10-27 expert review)
- church-history/m09-catholic-reform-and-the-confessional-age/l06-orthodoxy-under-ottomans-and-tsars: The decades after 1589 included the Time of Troubles (1598 to 1613), when Polish forces held Moscow and Patriarch Hermogenes died in captivity, so 'relative stability' is wrong. (2026-10-27 expert review)
- church-history/m10-enlightenment-revival-and-missions/l01-science-enlightenment-and-faith: Newton was a devout, if unorthodox, believer who held that God actively sustains the universe. The lesson implied that his own work was deist. (2026-10-27 expert review)
- church-history/m10-enlightenment-revival-and-missions/l02-wesley-and-methodism: In the 1739 preface, Wesley's 'social holiness' opposed solitary, hermit-like religion. Reading it as a call to public reform is a common modern misreading that a seminary course corrects. (2026-10-27 expert review)
- church-history/m10-enlightenment-revival-and-missions/l04-the-modern-missionary-movement: The figure 'about a thousand missionaries were departing' has no source and no time base (per year or in total?) and looks invented. The guidance forbids invented statistics.; The summary promises Hudson Taylor, but the lesson never mentioned him. The China Inland Mission, founded in 1865, is a standard landmark of the movement.; The summary promises the African and Asian Christians who did much of the evangelism, but none was named. Crowther is the standard example.; Venn and Anderson formulated the three-self principle in the 1840s and 1850s, and Venn died in 1873, so 'late nineteenth century' is too late.; The Key idea credited the three-self principle to indigenous leaders, but Western mission secretaries formulated it, as the body says. (2026-10-27 expert review)
- church-history/m10-enlightenment-revival-and-missions/l05-slavery-abolition-and-the-black-church: The normaliser turns 'August 1' into 'August first' only when the month comes first, so '1 August' would be read 'one August'.; The account was garbled: they were pulled up while praying in a section reserved for white worshipers. Also, the AME Church was founded as a denomination in 1816, not in the 1790s. (2026-10-27 expert review)
- church-history/m10-enlightenment-revival-and-missions/l06-vatican-i-and-catholic-revival: The Oxford Movement was an Anglican movement, not part of the Catholic Church's revival, but as written it reads as Catholic. (2026-10-27 expert review)
- church-history/m11-the-church-in-the-modern-world/l02-birth-of-pentecostalism: The Holiness movement grew from Wesleyan perfectionism (Phoebe Palmer and others, from the 1830s), not as a reaction to liberal theology. (2026-10-27 expert review)
- church-history/m11-the-church-in-the-modern-world/l03-fundamentalist-modernist-controversy: The lesson never names the 'famous figures' of the Scopes trial; Bryan and Darrow are what a learner needs to know. (2026-10-27 expert review)
- church-history/m11-the-church-in-the-modern-world/l05-the-ecumenical-movement: The lesson sets visible unity against organic union. In ecumenical usage, visible unity 'in one faith and one eucharistic fellowship' is the overall goal in the WCC constitution, and organic union is one form of it. Mutual recognition while staying distinct is 'reconciled diversity', the term the Lutheran World Federation adopted in 1977. The Church of South India of 1947 is the standard example of organic union.; The same conceptual error appears in the Key ideas. This keeps the bullet consistent with the corrected body. (2026-10-27 expert review)
- church-history/m11-the-church-in-the-modern-world/l06-civil-rights-and-the-church: This reproduces, almost word for word, a line from King's copyrighted Stride Toward Freedom. The guidance requires paraphrasing King, never quoting him.; The summary promises the divided response of white churches, but the lesson named no event. The Birmingham letter is the standard example. (2026-10-27 expert review)
- church-history/m12-global-christianity-today/l01-second-vatican-council: The lesson implies John the Twenty-third led the whole council, but he died in June 1963 and Paul the Sixth completed it.; Dei Verbum teaches that Scripture and Tradition form one deposit of the word of God. 'Supreme importance of Scripture' restates Catholic teaching in Protestant terms. (2026-10-27 expert review)
- church-history/m12-global-christianity-today/l02-evangelicals-and-lausanne: The Lausanne Covenant did not adopt the term 'integral mission'; it affirmed social responsibility while calling evangelism primary. Integral mission (misión integral) was the Latin American call of Padilla and Escobar, which the summary asks the lesson to name. (2026-10-27 expert review)
- church-history/m12-global-christianity-today/l03-christianity-in-africa: Church membership figures are estimates, and the guidance says to present them as such.; The guidance asks for places to be named by their modern countries, and 'the Congo' could mean either of two countries. (2026-10-27 expert review)
- church-history/m12-global-christianity-today/l04-christianity-in-latin-america: Europe had more Catholics than Latin America for most of the colonial era. Latin America became the largest Catholic region only in the twentieth century.; The phrase 'preferential option for the poor' became official at Puebla in 1979. Medellín spoke of solidarity with, and preference for, the poor.; The second Vatican instruction on liberation theology is Libertatis Conscientia (1986), and John Paul II's well-known letter went to the Brazilian bishops in 1986. No standard source records a 1992 letter or instruction of this kind.; The two instructions of the Congregation for the Doctrine of the Faith on liberation theology are dated 1984 and 1986.; About 70 percent is Pew's 2014 figure. Early-2020s data are lower (Brazil's 2022 census about 57 percent, Latinobarómetro in the mid-50s), so a single 70 percent figure is out of date.; The same outdated 70 percent figure appears in the Key ideas.; The guidance requires claims about the present to be dated: Francis died in April 2025 and Leo the Fourteenth was elected in May 2025. Leo's long ministry in Peru belongs in this lesson. The edit also paraphrases Francis's own copyrighted phrase. (2026-10-27 expert review)
- church-history/m12-global-christianity-today/l05-christianity-in-asia: The body correctly presents the Thomas origin as local tradition, but the Key idea stated it as historical fact. (2026-10-27 expert review)
- physics/m01-foundations-of-physical-measurement/l01-models-and-the-scientific-method: The vacuum fall time from 10 m is the square root of (2 times 10 divided by 9.8), about 1.43 s. If air drag explains the gap, the measured time must be longer than predicted, but 1.41 s was shorter than the true prediction. The new values keep the stated 0.01 s difference. (2026-10-27 expert review)
- physics/m01-foundations-of-physical-measurement/l02-units-and-the-international-system: At 20 m/s, 2.5 s covers 50 m, which is an Olympic pool. A typical 25 m pool would take 1.25 s.; Nano and micro are not subatomic scales (an atom is about 0.1 nm across), and mega and giga are not cosmic scales. (2026-10-27 expert review)
- physics/m01-foundations-of-physical-measurement/l03-significant-figures-and-estimation: Fermi's paper-drop estimate at the Trinity test was of the yield, which is energy, not power. The course later defines power separately, so the distinction matters. (2026-10-27 expert review)
- physics/m02-motion-in-one-dimension/l01-displacement-and-velocity: The subject is algebra-based and must not use calculus. The lesson never explains the derivative.; This Key idea relied on the calculus derivative, which the algebra-based course does not teach. (2026-10-27 expert review)
- physics/m02-motion-in-one-dimension/l02-defining-acceleration: A speedometer shows speed, not acceleration. The original sentence plants that misconception in the very lesson that defines acceleration. (2026-10-27 expert review)
- physics/m02-motion-in-one-dimension/l03-equations-of-constant-acceleration: Gravity is a pull, not a push. (2026-10-27 expert review)
- physics/m03-motion-in-two-dimensions/l01-vector-addition-and-components: Heading east across a current flowing south lands you downstream, which is south of the dock. The path runs southeast from the start, but the landing point is not southeast of the target.; The original quadrant rule is muddled. The case where both components are negative is already covered by a negative X, and the sentence never says which correction applies in which case. The new text states the standard rule. (2026-10-27 expert review)
- physics/m03-motion-in-two-dimensions/l02-physics-of-projectiles: The subject guidance requires every worked example to go step by step, and this step was skipped. (2026-10-27 expert review)
- physics/m03-motion-in-two-dimensions/l03-relative-velocity-and-frames: Two frames moving at constant velocity relative to each other are not necessarily inertial, because both could share the same acceleration. An inertial frame is one that is not accelerating.; Northeast means 45 degrees, but the inverse tangent of three-fourths gives 36.9 degrees east of north. Also, 5 m/s (18 km/h) is a relaxed cycling speed, not a fast one.; Regional turboprops cruise at about 500 km/h. A speed of about 206 km/h matches a small single-engine trainer. (2026-10-27 expert review)
- physics/m03-motion-in-two-dimensions/l04-uniform-circular-motion: 31.4 squared is 985.96, which rounds to 986, giving 9.86 m/s squared. (2026-10-27 expert review)
- physics/m04-forces-and-newtons-laws/l03-action-and-reaction-pairs: 'Downward' and 'upward' have no meaning for the Earth and Moon. Each pulls the other along the line joining their centers. (2026-10-27 expert review)
- physics/m04-forces-and-newtons-laws/l04-weight-and-normal-force: The normal force on you is exerted by the scale, not by your feet on the scale. The previous lesson taught that third-law pairs act on different objects, so the wording should not swap them. (2026-10-27 expert review)
- physics/m04-forces-and-newtons-laws/l05-friction-and-drag: Static friction can be anything up to the coefficient times the normal force; that product is only its maximum. The bullet contradicted the body, which says static friction matches the push up to a limit. (2026-10-27 expert review)
- physics/m04-forces-and-newtons-laws/l06-free-body-reasoning: 'Second law of dynamics' is a nonstandard name. The rest of the course calls it Newton's second law. (2026-10-27 expert review)
- physics/m05-work-and-energy/l01-work-and-kinetic-energy: The course is explicitly algebra-based with no calculus, and it never teaches integrals or dot products. The area under the graph is the standard algebra-based equivalent.; This Key idea used an integral, which the algebra-based course does not teach. (2026-10-27 expert review)
- physics/m05-work-and-energy/l02-potential-energy-and-storage: Removes calculus (integration) from an algebra-based course. The average-force argument the lesson already gives produces the same result. (2026-10-27 expert review)
- physics/m05-work-and-energy/l03-conservation-of-mechanical-energy: On a frictionless track the final speed depends only on the height dropped, not on how steep the track is. That is the central point of energy conservation. (2026-10-27 expert review)
- physics/m05-work-and-energy/l04-nonconservative-forces-and-power: A nonconservative force is defined by work that depends on the path, and such forces can add energy as well as remove it. The tension of a frayed rope is not a standard example and misleads. (2026-10-27 expert review)
- physics/m05-work-and-energy/l05-energy-in-living-systems: Internal contradiction: the climb needs about 2,060 J of potential energy, but 20 to 25 percent of 4,000 J is only 800 to 1,000 J. This also fixes the typo 'clouding', which the voice would read aloud.; The original is physically inconsistent. At 20 to 25 percent muscle efficiency, 2 MJ of work needs 8 to 10 MJ of food energy, which leaves nothing for basal metabolism, and the lesson says basal metabolism is the largest use. Realistic overall daily efficiency is a few percent. (2026-10-27 expert review)
- physics/m06-momentum-and-rotational-motion/l01-impulse-and-linear-momentum: A snowbank is a cushioned stop, the opposite of the abrupt 0.1 s impact the example describes. (2026-10-27 expert review)
- physics/m06-momentum-and-rotational-motion/l05-gravity-and-planetary-orbits: 7,900 m/s divided by 343 m/s is about 23. (2026-10-27 expert review)
- physics/m07-fluids-and-thermodynamics/l01-pressure-and-buoyancy: The repeated word 'pressing' sounds awkward when read aloud. (2026-10-27 expert review)
- physics/m07-fluids-and-thermodynamics/l02-fluid-dynamics-and-flow: Wrong result: 150,000 Pa minus (one half times 1,000 times (16 minus 4)) is 144,000 Pa, not 142,000 Pa. The worked step was also missing.; COMMON_RULES says that where scholars disagree, the lesson must say so plainly and name the positions. The shower-curtain effect also happens with cold water, and the Bernoulli, rising-warm-air and vortex explanations (the last from a 2001 computer simulation) are still debated. The lesson states Bernoulli as settled; the reviewer noted this but left it. Prose rises from 778 to 807 words. (2026-10-27 expert review)
- physics/m07-fluids-and-thermodynamics/l03-temperature-and-ideal-gases: Doubling kinetic energy multiplies speed by the square root of 2 (about 1.41), not by 2. Pressure doubles because the momentum delivered per hit and the rate of hits each rise by that factor.; Duplicated word: the voice would say 'gas gas'. (2026-10-27 expert review)
- physics/m07-fluids-and-thermodynamics/l04-heat-transfer-and-calorimetry: Aluminum's specific heat (about 900 J per kilogram per degree) is about twice iron's (about 450), so specific heat cannot explain why the foil cools faster. The difference comes from mass and thinness.; 83,680 J is the kinetic energy of a 1,000 kg car at about 12.9 m/s (46 km/h). At walking pace, about 1.5 m/s, the same car has only about 1,100 J. (2026-10-27 expert review)
- physics/m07-fluids-and-thermodynamics/l05-laws-of-thermodynamics: The next sentence describes an orderly crystalline structure, but glass is amorphous, not crystalline. (2026-10-27 expert review)
- physics/m08-oscillations-and-waves/l02-wave-properties-and-behavior: A 10 m ocean wave cannot arrive twice a second. Deep-water waves of that length travel at about 4 m/s with a period near 2.5 s. The example still demonstrates the same equation.; A wave's energy is proportional to the square of its amplitude, not directly proportional to the amplitude. (2026-10-27 expert review)
- physics/m08-oscillations-and-waves/l04-physics-of-sound: Middle C is about 261.6 Hz in standard tuning, not 265 Hz.; Keeps the worked example consistent with the corrected frequency. 343 divided by 262 is still about 1.3 m, so the stated answer holds. (2026-10-27 expert review)
- physics/m08-oscillations-and-waves/l05-resonance-and-music: 250 Hz is closer to the B below middle C (about 247 Hz) than to middle C (about 262 Hz).; 'Resonant resonators' is redundant. (2026-10-27 expert review)
- physics/m09-electricity-and-circuits/l01-electric-charge-and-fields: 9 mN is the weight of about 0.9 g. A large mosquito weighs a few milligrams, hundreds of times less. (2026-10-27 expert review)
- physics/m09-electricity-and-circuits/l05-electrical-safety-and-power: A watt is a unit of power, not energy. The sentence confuses the two in the very passage meant to separate them.; Thirty cents is well below what a candy bar costs today. (2026-10-27 expert review)
- physics/m10-magnetism-and-electromagnetism/l02-electromagnets-and-motors: A refrigerator magnet is about 5 to 10 mT, stronger than 2.5 mT. 2.5 mT is about fifty times Earth's field of roughly 50 microtesla. (2026-10-27 expert review)
- physics/m10-magnetism-and-electromagnetism/l04-generators-and-transformers: Two sentences later the same generator has one hundred turns, which contradicts 'a single loop'. (2026-10-27 expert review)
- physics/m11-light-and-optics/l01-reflection-and-mirrors: The image distance equals the object distance, so 'three feet behind' only follows if you stand three feet away. (2026-10-27 expert review)
- physics/m11-light-and-optics/l02-refraction-and-lenses: The subject guidance requires saying when a 'first' is disputed. Ibn Sahl (about 984) and Harriot (about 1602) both came before Snellius (1621). This also adds the possessive in 'Snell's law'. (2026-10-27 expert review)
- physics/m11-light-and-optics/l04-wave-optics-and-diffraction: The single-slit dark-minimum condition holds only for nonzero m. With 'an integer', m equals zero predicts darkness at the center, which contradicts the 'wide central maximum' the same paragraph describes. Standard texts state m equals 1, 2, 3 and so on.; The bullet does not say whether the condition marks bright or dark bands, so it reads like the double-slit bright-fringe rule, a classic confusion. It also allows zero, which would put a dark band at the bright center. The body says the condition is for dark minima only. The new bullet is one sentence, and prose words are unchanged. (2026-10-27 expert review)
- physics/m12-modern-physics/l01-special-relativity: Relativistic effects are not subjective. Measurements depend on the frame, and every observer's result is objective and predictable. (2026-10-27 expert review)
- physics/m12-modern-physics/l04-radioactivity-and-the-nucleus: The body's potassium, including radioactive potassium-40, sits mostly in muscle and soft tissue, not bone.; A large textbook weighs 1 to 2 kg. The new text also uses the lesson's own term, half-life, instead of 'decay cycle'. (2026-10-27 expert review)
- physics/m12-modern-physics/l05-fission-fusion-and-cosmology: Stellar fusion builds elements only up to about iron. Most heavier elements come from neutron capture in giant stars, supernovae and neutron-star mergers, not from fusion.; 6.3 times ten to the 11 J is about 175,000 kWh. At about 10,500 kWh a year, that runs a home for about 17 years, not decades.; Big Bang nucleosynthesis fused protons and neutrons into helium, plus traces of deuterium and lithium. The hydrogen nuclei were not made by fusion. (2026-10-27 expert review)
- calculus/m01-functions-and-limits-foundations/l02-two-problems-of-calculus: The difference quotient is the ratio itself; its limit as delta x goes to zero is the derivative. The original merges the two.; Heard aloud, 'the quantity x plus delta x squared' parses as x plus (delta x) squared; the intended expression is (x plus delta x) squared.; The next lesson is intuitive limits from tables, not the formal limit rules (those come in module two). (2026-10-27 expert review)
- calculus/m01-functions-and-limits-foundations/l03-intuitive-limits-and-tables: Newton and Leibniz did not create limit notation (it dates from the late eighteenth and nineteenth centuries); their notations are for derivatives and integrals, as the body says. (2026-10-27 expert review)
- calculus/m02-limits-and-continuity/l01-limit-laws-and-algebraic-evaluation: Subject guidance forbids typed grouping parentheses; grouping must be spoken as 'the quantity'.; Limit laws and algebraic limit evaluation were not refined by Newton and Leibniz; the rigorous limit is due to Cauchy and Weierstrass in the nineteenth century. (2026-10-27 expert review)
- calculus/m02-limits-and-continuity/l02-squeeze-theorem-and-sine: The previous lesson only taught factoring; rationalizing was never shown. (2026-10-27 expert review)
- calculus/m02-limits-and-continuity/l03-continuity-and-the-intermediate-value: Invented history: continuity was not a defined focus for Newton and Leibniz; the precise definition is due to Bolzano (1817) and Cauchy (1821). (2026-10-27 expert review)
- calculus/m02-limits-and-continuity/l04-limits-at-infinity-and-asymptotes: 'x to the one hundredth power' can be heard as x to the one-hundredth (a root); the intended power is one hundred. (2026-10-27 expert review)
- calculus/m02-limits-and-continuity/l05-precise-epsilon-delta-definition: 'EPSILO-N' is a misspelling shown on screen and will be garbled by the voice; the contract forbids splitting words.; The normaliser spells the five-letter capital word DELTA letter by letter; the spelling aside adds nothing.; Failure of the definition for a particular L shows only that L is not the limit; another value might still be the limit.; Same logical error in Key ideas: failing for one candidate L does not show that no limit exists. (2026-10-27 expert review)
- calculus/m03-derivative/l01-derivative-as-a-limit: Heard aloud, 'the quantity f of x plus h' suggests f(x) + h, and 'minus f of x divided by h' suggests only f(x) is divided; the definition is [f(x+h) - f(x)]/h.; Same ambiguous spoken form of the derivative definition in Key ideas.; The value subtracted is f of three, which is nine, not 'the function value at nine' (which would be eighty-one).; A tangent line need not meet the curve at exactly one point (for example, a tangent to a cubic); this is a standard misconception textbooks warn against. (2026-10-27 expert review)
- calculus/m03-derivative/l02-derivative-as-a-function: The previous lesson never computed a speed at five seconds; it found the slope of x squared at three. (2026-10-27 expert review)
- calculus/m03-derivative/l03-power-and-constant-multiple-rules: The binomial-expansion argument proves the rule only for positive integer n, yet the text states it for every real power and implies the same proof covers all cases.; Differentiating the result again does not verify a derivative; the passage describes a non-check and leans on antiderivatives, which are not yet taught.; 'No slope' is the phrase usually used for vertical lines (undefined slope); a horizontal line has slope zero. (2026-10-27 expert review)
- calculus/m03-derivative/l04-product-and-quotient-rules: The rules and notations date from the 1660s to 1680s; the priority dispute erupted around 1699 to 1712, so they were not introduced 'during' it. (2026-10-27 expert review)
- calculus/m03-derivative/l05-velocity-and-acceleration: The voice reads the lone letter a (and the quoted 'a') as 'uh', so the formula is unintelligible; the passage also relies on integration, which is not taught until module six. Rewritten with k, per the subject guidance, and checked by differentiation.; Lone letter a in Key ideas is read as 'uh'. (2026-10-27 expert review)
- calculus/m04-differentiation-rules/l01-trigonometric-derivatives: Implies trigonometric derivative problems shaped calculus and caused the priority dispute, which is unsupported. (2026-10-27 expert review)
- calculus/m04-differentiation-rules/l02-chain-rule: In a clock the minute hand does not drive the gears that swing the pendulum; the analogy runs the mechanism backward.; Uses the derivative of e to the x, which is taught only in lesson four of this module; flag it as a forward reference. (2026-10-27 expert review)
- calculus/m04-differentiation-rules/l03-implicit-differentiation: The example stops before reaching a derivative; finishing it gives the learner the result.; A zero denominator gives a vertical tangent only when the numerator is nonzero (0 over 0 can mean a cusp or something else); the bullet also cited something the body never showed. (2026-10-27 expert review)
- calculus/m04-differentiation-rules/l04-exponential-and-natural-logarithm: Heard aloud, 'e to the power of h minus one' suggests e to the (h minus one); the limit is (e to the h, minus one) over h.; The base is named with the lone letter a, which the voice reads as 'uh'; the next lesson already uses b for the base.; Lone letter a used as the logarithm base is read as 'uh'.; Lone letter a used as a base in Key ideas is read as 'uh'.; Lone letter a used as a base in Key ideas is read as 'uh'.; 'All closed' is not a meaningful spoken grouping marker and confuses the listener.; Same meaningless 'all closed' marker, twice. (2026-10-27 expert review)
- calculus/m05-applications-of-derivatives/l01-related-rates-and-linear-approximation: 'f prime of a' and 'the derivative at a' use the lone letter a, read as 'uh'.; Lone letter a in Key ideas is read as 'uh'. (2026-10-27 expert review)
- calculus/m05-applications-of-derivatives/l02-maxima-minima-and-extreme-values: The extreme value theorem locates absolute extrema; it does not classify critical numbers as local peaks or valleys, which is what the original question asks.; The local classification was asserted without justification; comparing function values does not classify local extrema. The second derivative test supplies the reason. (2026-10-27 expert review)
- calculus/m05-applications-of-derivatives/l03-mean-value-theorem: The given explanation is circular (it assumes the slope passes above and below the secant slope) and is not the reason the theorem holds; the standard proof applies Rolle's Theorem, which the lesson already introduced. (2026-10-27 expert review)
- calculus/m05-applications-of-derivatives/l06-optimization-and-newtons-method: The lesson promises learners will use Newton's method but never runs a single iteration; this adds a short checked example (1, then 1.5, then 1.41667). (2026-10-27 expert review)
- calculus/m06-integral/l01-antiderivatives-and-riemann-sums: Lowercase f and capital F sound identical aloud, so the statement is heard as 'the integral of f of t equals f of t plus c'.; Same f versus F ambiguity in Key ideas.; Newton's dots marked fluxions (derivatives), not integrals; his integral marks were an overbar stroke or an enclosing box. (2026-10-27 expert review)
- calculus/m06-integral/l02-definite-integral: Understates a standard theorem: every continuous function on a closed interval is Riemann integrable, not merely most. (2026-10-27 expert review)
- calculus/m06-integral/l04-integration-by-substitution: Prime notation is Lagrange's, as the subject's own lesson on the derivative as a function says; Newton used dots.; Malformed number 'one thousand,024' displays badly and reads unpredictably; four to the fifth is one thousand twenty-four. (2026-10-27 expert review)
- calculus/m07-applications-of-integration/l01-area-between-curves: The Riemann sum is a nineteenth-century formalisation by Riemann, not a product of the Newton and Leibniz dispute. (2026-10-27 expert review)
- calculus/m07-applications-of-integration/l02-volumes-by-slicing-and-disks: 'f of x squared' is heard as f of (x squared); the disk formula squares f of x.; The slicing method uses cross-sectional area, not the surface area of the slice (both faces plus rim). (2026-10-27 expert review)
- calculus/m07-applications-of-integration/l03-volumes-by-cylindrical-shells: 'All enclosed in grouping symbols' is redundant after 'the quantity' and awkward to hear.; In the shell method the strips are parallel to the axis, but the integration variable runs perpendicular to it; 'integrating parallel to the axis' is misleading. (2026-10-27 expert review)
- calculus/m07-applications-of-integration/l04-arc-length-and-physical-applications: Wrong result: the arc length of x to the three halves from zero to four is (8/27)(10 times root 10, minus 1), about 9.07, not 80/27 (about 2.96), which is even shorter than the straight chord of about 8.94. (2026-10-27 expert review)
- calculus/m07-applications-of-integration/l05-growth-and-decay-revisited: By Newton's law of cooling, the coffee's rate of cooling is proportional to its temperature difference from the room, not to its temperature.; Negative k gives exponential decay in general; radioactive decay is one example.; 'Integrating both sides' of d y over d t equals k y is really separation of variables, taught only in module nine; this spells out the step using the logarithm derivative already taught. (2026-10-27 expert review)
- calculus/m08-techniques-of-integration/l02-trigonometric-integrals-and-substitution: Heard aloud, 'the negative of the cosine of x plus the cube...' parses as the negative of the whole sum, giving the wrong sign on the cube term.; The sentence equates a quantity with a square root; it is the square root that becomes the new square root.; Partial fractions requires factoring the denominator; the preview states the opposite. (2026-10-27 expert review)
- calculus/m08-techniques-of-integration/l03-integration-by-partial-fractions: Without 'the quantity' this is heard as five over x squared, plus x, minus two. (2026-10-27 expert review)
- calculus/m08-techniques-of-integration/l04-numerical-integration-and-simpsons-rule: In the trapezoidal rule every interior value is counted twice, not most of them. (2026-10-27 expert review)
- calculus/m08-techniques-of-integration/l05-evaluating-improper-integrals: The course does not leave single-variable calculus; differential equations, series and polar curves that follow are all single-variable.; 'The infinite area is finite' is self-contradictory to the ear.; The comparison idea in this bullet is never taught in the lesson; the replacement summarises the lesson's own benchmark results. (2026-10-27 expert review)
- calculus/m09-differential-equations/l01-introduction-to-differential-equations: 'd y d x' is not how the notation is read; every other lesson says 'd y over d x'.; Same 'd y d x' reading in Key ideas.; The summary promises verifying solutions to initial value problems but no initial value problem is worked; this adds a one-step example using the lesson's own function. (2026-10-27 expert review)
- calculus/m09-differential-equations/l03-solving-separable-equations: Key ideas warns about lost equilibrium solutions, but the body never mentions them. (2026-10-27 expert review)
- calculus/m09-differential-equations/l04-logistic-growth-equation: The nested spoken formula can be heard as (1 + M - P0)/P0 times e^(-kt). The guidance says to name intermediate results. Checked: the constant is (1000-100)/100 = 9, and P(0) = 1000/(1+9) = 100. The new body has 818 words. (2026-10-27 expert review)
- calculus/m09-differential-equations/l05-first-order-linear-equations: False as a universal claim: the lesson's own example, y prime plus two y equals four, is separable. (2026-10-27 expert review)
- calculus/m10-sequences-and-series/l01-sequences-and-their-limits: The traditional name is a sub n, not b sub n; the guidance asks to say so once and then use another letter.; Capital N and lowercase n sound the same, so the definition is heard as 'an integer en such that for every index en greater than en'. This is the same class of problem as the accepted f versus F fix. The new body has 930 words. (2026-10-27 expert review)
- calculus/m10-sequences-and-series/l03-divergence-and-integral-tests: Learners commonly take the integral's value as the series sum; the sum of one over n squared is pi squared over six, about 1.645. (2026-10-27 expert review)
- calculus/m10-sequences-and-series/l04-comparison-and-alternating-series: The test does not 'guarantee only conditional convergence'; a series passing it may converge absolutely. It proves convergence, and absolute convergence must be checked separately.; 'Negative one to the power n plus one' is heard as (negative one to the n) plus one.; Same exponent ambiguity in Key ideas.; Accepted edit 072 corrects the body, but this Key ideas bullet still says the convergence is 'typically only conditional'. Many series that pass the test converge absolutely (for example, alternating 1 over n squared); the test only fails to establish absolute convergence. (2026-10-27 expert review)
- calculus/m10-sequences-and-series/l05-ratio-and-root-tests: 'Two raised to the power n plus one' is heard as two to the n, plus one; the later cancellation only works for two to the (n plus one).; Same exponent ambiguity for the next term.; Edits 075 and 076 fix 'two raised to the power n plus one' but leave two more instances in the cancellation step, which can be heard as 2^n + 1. The cancellation 2^(n+1)/2^(n+2) = 1/2 was checked. (2026-10-27 expert review)
- calculus/m11-power-series/l01-power-series-and-convergence: Ratio and root tests decide whether a series, not a sequence, has a finite sum.; The p-series was never introduced anywhere in the course; the replacement justifies divergence with the integral test already taught.; Heard aloud, the square root of (n+1) could sit in the numerator ((x/2)^n times sqrt(n+1)). The worked example needs it in the denominator; the radius of 2 and the interval from -2 (closed) to 2 (open) were checked.; Same issue for the (n+1)-th term: the exponents can be heard as x^n + 1 and 2^n + 1, and it is unclear whether the root is in the denominator. The new body has 748 words. (2026-10-27 expert review)
- calculus/m11-power-series/l02-working-with-power-series: 'Raised to the power of n minus one' can be heard as (negative one to the n) minus one. (2026-10-27 expert review)
- calculus/m11-power-series/l04-using-taylor-series: Heard as one plus (x to the fifth); the derivative is 24 over (1 plus x) to the fifth. (2026-10-27 expert review)
- calculus/m12-parametric-and-polar-curves/l01-parametric-curves-and-motion: Wrong description: for t between zero and one, x of t equals t cubed minus three t decreases, so the particle moves left, not right; the self-crossing is at (0, 1) when t is plus or minus root three, and t equals two ends at (2, 2). (2026-10-27 expert review)
- calculus/m12-parametric-and-polar-curves/l02-calculus-with-parametric-curves: Presents a study habit as a mathematical requirement. (2026-10-27 expert review)
- calculus/m12-parametric-and-polar-curves/l05-future-of-higher-mathematics: Fourier series are not descendants of Taylor series; they are a parallel kind of expansion. (2026-10-27 expert review)

<details><summary>All hand-reviewed lessons (756), read in full by Claude (the four pilots on 2026-10-02; Mathematics and the five other drafted subjects on 2026-10-27); --rereview-weak skips these</summary>

- `biblical-studies/m01-foundations-of-theology/l01-what-theology-is`: reviewed
- `biblical-studies/m01-foundations-of-theology/l02-general-and-special-revelation`: reviewed
- `biblical-studies/m01-foundations-of-theology/l03-sources-of-authority`: reviewed
- `biblical-studies/m01-foundations-of-theology/l04-faith-and-scholarship`: reviewed
- `biblical-studies/m01-foundations-of-theology/l05-branches-of-theology`: reviewed
- `biblical-studies/m02-the-bible/l01-formation-of-the-canon`: reviewed
- `biblical-studies/m02-the-bible/l02-manuscripts-and-textual-criticism`: reviewed
- `biblical-studies/m02-the-bible/l03-english-bible-translations`: reviewed
- `biblical-studies/m02-the-bible/l04-reading-by-genre`: reviewed
- `biblical-studies/m02-the-bible/l05-historical-and-cultural-context`: reviewed
- `biblical-studies/m03-torah-and-history-of-israel/l01-genesis-and-beginnings`: reviewed
- `biblical-studies/m03-torah-and-history-of-israel/l02-exodus-sinai-and-the-law`: reviewed
- `biblical-studies/m03-torah-and-history-of-israel/l03-conquest-judges-and-kings`: reviewed
- `biblical-studies/m03-torah-and-history-of-israel/l04-exile-and-return`: reviewed
- `biblical-studies/m03-torah-and-history-of-israel/l05-authorship-and-dating`: reviewed
- `biblical-studies/m04-poetry-wisdom-and-prophets/l01-psalms`: reviewed
- `biblical-studies/m04-poetry-wisdom-and-prophets/l02-wisdom-literature`: reviewed
- `biblical-studies/m04-poetry-wisdom-and-prophets/l03-major-prophets`: reviewed
- `biblical-studies/m04-poetry-wisdom-and-prophets/l04-book-of-the-twelve`: reviewed
- `biblical-studies/m04-poetry-wisdom-and-prophets/l05-messianic-hope`: reviewed
- `biblical-studies/m05-gospels-and-jesus/l01-between-the-testaments`: reviewed
- `biblical-studies/m05-gospels-and-jesus/l02-synoptic-gospels`: reviewed
- `biblical-studies/m05-gospels-and-jesus/l03-mark-and-matthew`: reviewed
- `biblical-studies/m05-gospels-and-jesus/l04-luke`: reviewed
- `biblical-studies/m05-gospels-and-jesus/l05-john`: reviewed
- `biblical-studies/m06-acts-and-letters/l01-acts`: reviewed
- `biblical-studies/m06-acts-and-letters/l02-paul-life-and-mission`: reviewed
- `biblical-studies/m06-acts-and-letters/l03-romans-galatians-and-justification`: reviewed
- `biblical-studies/m06-acts-and-letters/l04-prison-and-pastoral-letters`: reviewed
- `biblical-studies/m06-acts-and-letters/l05-hebrews-and-general-letters`: reviewed
- `biblical-studies/m06-acts-and-letters/l06-revelation`: reviewed
- `biblical-studies/m07-creeds-and-councils/l01-rule-of-faith-and-early-controversies`: reviewed
- `biblical-studies/m07-creeds-and-councils/l02-apostles-creed`: reviewed
- `biblical-studies/m07-creeds-and-councils/l03-nicene-creed`: reviewed
- `biblical-studies/m07-creeds-and-councils/l04-chalcedon`: reviewed
- `biblical-studies/m07-creeds-and-councils/l05-athanasian-creed`: reviewed
- `biblical-studies/m07-creeds-and-councils/l06-reformation-era-confessions`: reviewed
- `biblical-studies/m08-god-and-creation/l01-attributes-of-god`: reviewed
- `biblical-studies/m08-god-and-creation/l02-trinity`: reviewed
- `biblical-studies/m08-god-and-creation/l03-creation-and-providence`: reviewed
- `biblical-studies/m08-god-and-creation/l04-image-of-god`: reviewed
- `biblical-studies/m08-god-and-creation/l05-fall-and-sin`: reviewed
- `biblical-studies/m09-christ-and-salvation/l01-person-of-christ`: reviewed
- `biblical-studies/m09-christ-and-salvation/l02-atonement`: reviewed
- `biblical-studies/m09-christ-and-salvation/l03-grace-election-and-free-will`: reviewed
- `biblical-studies/m09-christ-and-salvation/l04-justification-across-traditions`: reviewed
- `biblical-studies/m09-christ-and-salvation/l05-sanctification`: reviewed
- `biblical-studies/m10-spirit-church-and-last-things/l01-holy-spirit`: reviewed
- `biblical-studies/m10-spirit-church-and-last-things/l02-the-church`: reviewed
- `biblical-studies/m10-spirit-church-and-last-things/l03-sacraments-and-ordinances`: reviewed
- `biblical-studies/m10-spirit-church-and-last-things/l04-death-and-intermediate-state`: reviewed
- `biblical-studies/m10-spirit-church-and-last-things/l05-return-of-christ-and-millennium`: reviewed
- `biblical-studies/m10-spirit-church-and-last-things/l06-resurrection-judgment-new-creation`: reviewed
- `biblical-studies/m11-church-history/l01-early-church-and-monasticism`: reviewed
- `biblical-studies/m11-church-history/l02-medieval-church-and-scholasticism`: reviewed
- `biblical-studies/m11-church-history/l03-east-west-schism`: reviewed
- `biblical-studies/m11-church-history/l04-reformation-and-catholic-reform`: reviewed
- `biblical-studies/m11-church-history/l05-enlightenment-and-modern-theology`: reviewed
- `biblical-studies/m11-church-history/l06-global-christianity-today`: reviewed
- `biblical-studies/m12-apologetics-and-ethics/l01-arguments-for-god`: reviewed
- `biblical-studies/m12-apologetics-and-ethics/l02-problem-of-evil`: reviewed
- `biblical-studies/m12-apologetics-and-ethics/l03-resurrection-and-history`: reviewed
- `biblical-studies/m12-apologetics-and-ethics/l04-biblical-ethics`: reviewed
- `biblical-studies/m12-apologetics-and-ethics/l05-virtue-ethics`: reviewed
- `biblical-studies/m12-apologetics-and-ethics/l06-contemporary-ethical-issues`: reviewed
- `biology/m01-chemistry-of-life/l01-scientific-study-of-life`: reviewed
- `biology/m01-chemistry-of-life/l02-atoms-and-chemical-bonds`: reviewed
- `biology/m01-chemistry-of-life/l03-water-and-carbon`: reviewed
- `biology/m01-chemistry-of-life/l04-carbohydrates-and-lipids`: reviewed
- `biology/m01-chemistry-of-life/l05-proteins-and-nucleic-acids`: reviewed
- `biology/m02-the-cell/l01-prokaryotic-and-eukaryotic-cells`: reviewed
- `biology/m02-the-cell/l02-endomembrane-system-and-organelles`: reviewed
- `biology/m02-the-cell/l03-cytoskeleton-and-cell-junctions`: reviewed
- `biology/m02-the-cell/l04-cell-membrane-structure`: reviewed
- `biology/m02-the-cell/l05-membrane-transport`: reviewed
- `biology/m02-the-cell/l06-cell-communication`: reviewed
- `biology/m03-energy-and-metabolism/l01-energy-atp-and-enzymes`: reviewed
- `biology/m03-energy-and-metabolism/l02-glycolysis-and-citric-acid-cycle`: reviewed
- `biology/m03-energy-and-metabolism/l03-oxidative-phosphorylation`: reviewed
- `biology/m03-energy-and-metabolism/l04-fermentation`: reviewed
- `biology/m03-energy-and-metabolism/l05-light-reactions`: reviewed
- `biology/m03-energy-and-metabolism/l06-calvin-cycle`: reviewed
- `biology/m04-cell-division-and-heredity/l01-cell-cycle-and-mitosis`: reviewed
- `biology/m04-cell-division-and-heredity/l02-cell-cycle-control-and-cancer`: reviewed
- `biology/m04-cell-division-and-heredity/l03-meiosis`: reviewed
- `biology/m04-cell-division-and-heredity/l04-mendelian-inheritance`: reviewed
- `biology/m04-cell-division-and-heredity/l05-chromosomes-and-complex-inheritance`: reviewed
- `biology/m05-molecular-genetics/l01-dna-structure-and-replication`: reviewed
- `biology/m05-molecular-genetics/l02-transcription-and-rna-processing`: reviewed
- `biology/m05-molecular-genetics/l03-translation`: reviewed
- `biology/m05-molecular-genetics/l04-gene-regulation`: reviewed
- `biology/m05-molecular-genetics/l05-biotechnology-and-genomics`: reviewed
- `biology/m06-evolution/l01-darwin-and-natural-selection`: reviewed
- `biology/m06-evolution/l02-evidence-for-evolution`: reviewed
- `biology/m06-evolution/l03-population-genetics`: reviewed
- `biology/m06-evolution/l04-speciation`: reviewed
- `biology/m06-evolution/l05-phylogenetics-and-the-tree-of-life`: reviewed
- `biology/m07-microbes-and-fungi/l01-viruses`: reviewed
- `biology/m07-microbes-and-fungi/l02-bacteria-and-archaea`: reviewed
- `biology/m07-microbes-and-fungi/l03-protists`: reviewed
- `biology/m07-microbes-and-fungi/l04-fungi`: reviewed
- `biology/m08-plant-and-animal-diversity/l01-seedless-plants`: reviewed
- `biology/m08-plant-and-animal-diversity/l02-seed-plants`: reviewed
- `biology/m08-plant-and-animal-diversity/l03-invertebrates`: reviewed
- `biology/m08-plant-and-animal-diversity/l04-vertebrates`: reviewed
- `biology/m09-how-plants-work/l01-plant-tissues-and-organs`: reviewed
- `biology/m09-how-plants-work/l02-transport-in-plants`: reviewed
- `biology/m09-how-plants-work/l03-plant-nutrition-and-soil`: reviewed
- `biology/m09-how-plants-work/l04-plant-hormones-and-responses`: reviewed
- `biology/m09-how-plants-work/l05-flowering-plant-reproduction`: reviewed
- `biology/m10-animal-body-and-control-systems/l01-homeostasis`: reviewed
- `biology/m10-animal-body-and-control-systems/l02-nutrition-and-digestion`: reviewed
- `biology/m10-animal-body-and-control-systems/l03-neurons-and-nervous-system`: reviewed
- `biology/m10-animal-body-and-control-systems/l04-sensory-systems`: reviewed
- `biology/m10-animal-body-and-control-systems/l05-endocrine-system`: reviewed
- `biology/m11-animal-organ-systems/l01-muscles-and-skeleton`: reviewed
- `biology/m11-animal-organ-systems/l02-respiratory-system`: reviewed
- `biology/m11-animal-organ-systems/l03-circulatory-system`: reviewed
- `biology/m11-animal-organ-systems/l04-osmoregulation-and-excretion`: reviewed
- `biology/m11-animal-organ-systems/l05-immune-system`: reviewed
- `biology/m11-animal-organ-systems/l06-reproduction-and-development`: reviewed
- `biology/m12-ecology-and-conservation/l01-climate-biomes-and-biosphere`: reviewed
- `biology/m12-ecology-and-conservation/l02-population-ecology`: reviewed
- `biology/m12-ecology-and-conservation/l03-community-ecology`: reviewed
- `biology/m12-ecology-and-conservation/l04-ecosystems-and-nutrient-cycles`: reviewed
- `biology/m12-ecology-and-conservation/l05-conservation-biology`: reviewed
- `calculus/m01-functions-and-limits-foundations/l01-functions-and-graphs-in-words`: reviewed
- `calculus/m01-functions-and-limits-foundations/l02-two-problems-of-calculus`: reviewed
- `calculus/m01-functions-and-limits-foundations/l03-intuitive-limits-and-tables`: reviewed
- `calculus/m01-functions-and-limits-foundations/l04-one-sided-limits-and-existence`: reviewed
- `calculus/m02-limits-and-continuity/l01-limit-laws-and-algebraic-evaluation`: reviewed
- `calculus/m02-limits-and-continuity/l02-squeeze-theorem-and-sine`: reviewed
- `calculus/m02-limits-and-continuity/l03-continuity-and-the-intermediate-value`: reviewed
- `calculus/m02-limits-and-continuity/l04-limits-at-infinity-and-asymptotes`: reviewed
- `calculus/m02-limits-and-continuity/l05-precise-epsilon-delta-definition`: reviewed
- `calculus/m03-derivative/l01-derivative-as-a-limit`: reviewed
- `calculus/m03-derivative/l02-derivative-as-a-function`: reviewed
- `calculus/m03-derivative/l03-power-and-constant-multiple-rules`: reviewed
- `calculus/m03-derivative/l04-product-and-quotient-rules`: reviewed
- `calculus/m03-derivative/l05-velocity-and-acceleration`: reviewed
- `calculus/m04-differentiation-rules/l01-trigonometric-derivatives`: reviewed
- `calculus/m04-differentiation-rules/l02-chain-rule`: reviewed
- `calculus/m04-differentiation-rules/l03-implicit-differentiation`: reviewed
- `calculus/m04-differentiation-rules/l04-exponential-and-natural-logarithm`: reviewed
- `calculus/m04-differentiation-rules/l05-inverse-functions-and-inverse-trigonometry`: reviewed
- `calculus/m05-applications-of-derivatives/l01-related-rates-and-linear-approximation`: reviewed
- `calculus/m05-applications-of-derivatives/l02-maxima-minima-and-extreme-values`: reviewed
- `calculus/m05-applications-of-derivatives/l03-mean-value-theorem`: reviewed
- `calculus/m05-applications-of-derivatives/l04-derivative-tests-and-graph-shape`: reviewed
- `calculus/m05-applications-of-derivatives/l05-indeterminate-forms-and-l-hopital`: reviewed
- `calculus/m05-applications-of-derivatives/l06-optimization-and-newtons-method`: reviewed
- `calculus/m06-integral/l01-antiderivatives-and-riemann-sums`: reviewed
- `calculus/m06-integral/l02-definite-integral`: reviewed
- `calculus/m06-integral/l03-fundamental-theorem-of-calculus`: reviewed
- `calculus/m06-integral/l04-integration-by-substitution`: reviewed
- `calculus/m06-integral/l05-exponential-and-logarithmic-integrals`: reviewed
- `calculus/m07-applications-of-integration/l01-area-between-curves`: reviewed
- `calculus/m07-applications-of-integration/l02-volumes-by-slicing-and-disks`: reviewed
- `calculus/m07-applications-of-integration/l03-volumes-by-cylindrical-shells`: reviewed
- `calculus/m07-applications-of-integration/l04-arc-length-and-physical-applications`: reviewed
- `calculus/m07-applications-of-integration/l05-growth-and-decay-revisited`: reviewed
- `calculus/m08-techniques-of-integration/l01-integration-by-parts`: reviewed
- `calculus/m08-techniques-of-integration/l02-trigonometric-integrals-and-substitution`: reviewed
- `calculus/m08-techniques-of-integration/l03-integration-by-partial-fractions`: reviewed
- `calculus/m08-techniques-of-integration/l04-numerical-integration-and-simpsons-rule`: reviewed
- `calculus/m08-techniques-of-integration/l05-evaluating-improper-integrals`: reviewed
- `calculus/m09-differential-equations/l01-introduction-to-differential-equations`: reviewed
- `calculus/m09-differential-equations/l02-slope-fields-and-eulers-method`: reviewed
- `calculus/m09-differential-equations/l03-solving-separable-equations`: reviewed
- `calculus/m09-differential-equations/l04-logistic-growth-equation`: reviewed
- `calculus/m09-differential-equations/l05-first-order-linear-equations`: reviewed
- `calculus/m10-sequences-and-series/l01-sequences-and-their-limits`: reviewed
- `calculus/m10-sequences-and-series/l02-infinite-series-and-geometric-series`: reviewed
- `calculus/m10-sequences-and-series/l03-divergence-and-integral-tests`: reviewed
- `calculus/m10-sequences-and-series/l04-comparison-and-alternating-series`: reviewed
- `calculus/m10-sequences-and-series/l05-ratio-and-root-tests`: reviewed
- `calculus/m11-power-series/l01-power-series-and-convergence`: reviewed
- `calculus/m11-power-series/l02-working-with-power-series`: reviewed
- `calculus/m11-power-series/l03-taylor-and-maclaurin-series`: reviewed
- `calculus/m11-power-series/l04-using-taylor-series`: reviewed
- `calculus/m12-parametric-and-polar-curves/l01-parametric-curves-and-motion`: reviewed
- `calculus/m12-parametric-and-polar-curves/l02-calculus-with-parametric-curves`: reviewed
- `calculus/m12-parametric-and-polar-curves/l03-polar-coordinates-and-graphs`: reviewed
- `calculus/m12-parametric-and-polar-curves/l04-polar-area-and-calculus`: reviewed
- `calculus/m12-parametric-and-polar-curves/l05-future-of-higher-mathematics`: reviewed
- `chemistry/m01-matter-and-measurement/l01-what-chemistry-studies`: reviewed
- `chemistry/m01-matter-and-measurement/l02-classifying-matter`: reviewed
- `chemistry/m01-matter-and-measurement/l03-measurement-and-significant-figures`: reviewed
- `chemistry/m01-matter-and-measurement/l04-unit-conversions`: reviewed
- `chemistry/m02-atoms-molecules-and-ions/l01-development-of-atomic-theory`: reviewed
- `chemistry/m02-atoms-molecules-and-ions/l02-atomic-structure-and-isotopes`: reviewed
- `chemistry/m02-atoms-molecules-and-ions/l03-the-periodic-table`: reviewed
- `chemistry/m02-atoms-molecules-and-ions/l04-ionic-and-molecular-compounds`: reviewed
- `chemistry/m02-atoms-molecules-and-ions/l05-naming-compounds`: reviewed
- `chemistry/m03-moles-and-chemical-reactions/l01-formula-mass-and-the-mole`: reviewed
- `chemistry/m03-moles-and-chemical-reactions/l02-empirical-and-molecular-formulas`: reviewed
- `chemistry/m03-moles-and-chemical-reactions/l03-balancing-chemical-equations`: reviewed
- `chemistry/m03-moles-and-chemical-reactions/l04-precipitation-and-acid-base-reactions`: reviewed
- `chemistry/m03-moles-and-chemical-reactions/l05-oxidation-reduction-reactions`: reviewed
- `chemistry/m03-moles-and-chemical-reactions/l06-stoichiometry-and-yield`: reviewed
- `chemistry/m04-thermochemistry/l01-energy-heat-and-work`: reviewed
- `chemistry/m04-thermochemistry/l02-calorimetry-and-specific-heat`: reviewed
- `chemistry/m04-thermochemistry/l03-enthalpy`: reviewed
- `chemistry/m04-thermochemistry/l04-hess-law-and-enthalpies-of-formation`: reviewed
- `chemistry/m05-electronic-structure-and-periodic-trends/l01-light-and-electromagnetic-energy`: reviewed
- `chemistry/m05-electronic-structure-and-periodic-trends/l02-bohr-model-and-line-spectra`: reviewed
- `chemistry/m05-electronic-structure-and-periodic-trends/l03-quantum-numbers-and-orbitals`: reviewed
- `chemistry/m05-electronic-structure-and-periodic-trends/l04-electron-configurations`: reviewed
- `chemistry/m05-electronic-structure-and-periodic-trends/l05-periodic-trends`: reviewed
- `chemistry/m06-chemical-bonding-and-molecular-shape/l01-ionic-and-covalent-bonding`: reviewed
- `chemistry/m06-chemical-bonding-and-molecular-shape/l02-lewis-structures-and-resonance`: reviewed
- `chemistry/m06-chemical-bonding-and-molecular-shape/l03-molecular-shape-and-vsepr`: reviewed
- `chemistry/m06-chemical-bonding-and-molecular-shape/l04-molecular-polarity`: reviewed
- `chemistry/m06-chemical-bonding-and-molecular-shape/l05-valence-bond-theory-and-hybridization`: reviewed
- `chemistry/m06-chemical-bonding-and-molecular-shape/l06-molecular-orbital-theory`: reviewed
- `chemistry/m07-gases/l01-pressure-and-the-gas-laws`: reviewed
- `chemistry/m07-gases/l02-the-ideal-gas-law`: reviewed
- `chemistry/m07-gases/l03-gas-mixtures-and-gas-stoichiometry`: reviewed
- `chemistry/m07-gases/l04-kinetic-molecular-theory-and-real-gases`: reviewed
- `chemistry/m08-liquids-solids-and-solutions/l01-intermolecular-forces-and-liquids`: reviewed
- `chemistry/m08-liquids-solids-and-solutions/l02-phase-changes-and-phase-diagrams`: reviewed
- `chemistry/m08-liquids-solids-and-solutions/l03-the-solid-state`: reviewed
- `chemistry/m08-liquids-solids-and-solutions/l04-dissolution-and-solubility`: reviewed
- `chemistry/m08-liquids-solids-and-solutions/l05-molarity-and-dilution`: reviewed
- `chemistry/m08-liquids-solids-and-solutions/l06-colligative-properties`: reviewed
- `chemistry/m09-reaction-rates-and-equilibrium/l01-reaction-rates-and-rate-laws`: reviewed
- `chemistry/m09-reaction-rates-and-equilibrium/l02-integrated-rate-laws-and-half-life`: reviewed
- `chemistry/m09-reaction-rates-and-equilibrium/l03-collision-theory-and-activation-energy`: reviewed
- `chemistry/m09-reaction-rates-and-equilibrium/l04-mechanisms-and-catalysis`: reviewed
- `chemistry/m09-reaction-rates-and-equilibrium/l05-dynamic-equilibrium-and-the-constant`: reviewed
- `chemistry/m09-reaction-rates-and-equilibrium/l06-le-chateliers-principle`: reviewed
- `chemistry/m10-acids-bases-and-solubility/l01-acids-bases-and-ph`: reviewed
- `chemistry/m10-acids-bases-and-solubility/l02-strong-and-weak-acids-and-bases`: reviewed
- `chemistry/m10-acids-bases-and-solubility/l03-buffers`: reviewed
- `chemistry/m10-acids-bases-and-solubility/l04-acid-base-titrations`: reviewed
- `chemistry/m10-acids-bases-and-solubility/l05-solubility-equilibria`: reviewed
- `chemistry/m11-thermodynamics-and-electrochemistry/l01-entropy-and-spontaneity`: reviewed
- `chemistry/m11-thermodynamics-and-electrochemistry/l02-gibbs-free-energy`: reviewed
- `chemistry/m11-thermodynamics-and-electrochemistry/l03-balancing-redox-reactions`: reviewed
- `chemistry/m11-thermodynamics-and-electrochemistry/l04-galvanic-cells-and-cell-potentials`: reviewed
- `chemistry/m11-thermodynamics-and-electrochemistry/l05-batteries-fuel-cells-and-corrosion`: reviewed
- `chemistry/m11-thermodynamics-and-electrochemistry/l06-electrolysis`: reviewed
- `chemistry/m12-organic-and-nuclear-chemistry/l01-hydrocarbons`: reviewed
- `chemistry/m12-organic-and-nuclear-chemistry/l02-oxygen-containing-functional-groups`: reviewed
- `chemistry/m12-organic-and-nuclear-chemistry/l03-amines-amides-and-polymers`: reviewed
- `chemistry/m12-organic-and-nuclear-chemistry/l04-nuclear-stability-and-radioactive-decay`: reviewed
- `chemistry/m12-organic-and-nuclear-chemistry/l05-half-life-and-radiometric-dating`: reviewed
- `chemistry/m12-organic-and-nuclear-chemistry/l06-fission-fusion-and-radiation`: reviewed
- `church-history/m01-the-apostolic-church/l01-jewish-world-of-jesus`: reviewed
- `church-history/m01-the-apostolic-church/l02-pentecost-and-the-jerusalem-church`: reviewed
- `church-history/m01-the-apostolic-church/l03-paul-and-the-gentile-mission`: reviewed
- `church-history/m01-the-apostolic-church/l04-early-worship-and-leadership`: reviewed
- `church-history/m01-the-apostolic-church/l05-parting-of-the-ways`: reviewed
- `church-history/m02-the-church-of-the-martyrs/l01-persecution-under-rome`: reviewed
- `church-history/m02-the-church-of-the-martyrs/l02-the-apologists`: reviewed
- `church-history/m02-the-church-of-the-martyrs/l03-gnosticism-and-marcion`: reviewed
- `church-history/m02-the-church-of-the-martyrs/l04-rule-of-faith-bishops-and-canon`: reviewed
- `church-history/m02-the-church-of-the-martyrs/l05-irenaeus-tertullian-origen-and-cyprian`: reviewed
- `church-history/m03-constantine-and-the-imperial-church/l01-constantine-and-the-edict-of-milan`: reviewed
- `church-history/m03-constantine-and-the-imperial-church/l02-arius-and-the-council-of-nicaea`: reviewed
- `church-history/m03-constantine-and-the-imperial-church/l03-athanasius-cappadocians-and-constantinople`: reviewed
- `church-history/m03-constantine-and-the-imperial-church/l04-rise-of-monasticism`: reviewed
- `church-history/m04-fathers-councils-and-divisions/l01-augustine-of-hippo`: reviewed
- `church-history/m04-fathers-councils-and-divisions/l02-jerome-ambrose-and-chrysostom`: reviewed
- `church-history/m04-fathers-councils-and-divisions/l03-ephesus-and-chalcedon`: reviewed
- `church-history/m04-fathers-councils-and-divisions/l04-churches-beyond-chalcedon`: reviewed
- `church-history/m04-fathers-councils-and-divisions/l05-fall-of-rome-benedict-and-gregory`: reviewed
- `church-history/m05-the-early-medieval-church/l01-missions-to-ireland-britain-and-germany`: reviewed
- `church-history/m05-the-early-medieval-church/l02-the-papacy-and-charlemagne`: reviewed
- `church-history/m05-the-early-medieval-church/l03-christians-under-islam`: reviewed
- `church-history/m05-the-early-medieval-church/l04-church-of-the-east-in-asia`: reviewed
- `church-history/m05-the-early-medieval-church/l05-byzantium-and-iconoclasm`: reviewed
- `church-history/m05-the-early-medieval-church/l06-cyril-methodius-and-the-slavs`: reviewed
- `church-history/m06-the-high-medieval-church/l01-monastic-and-papal-reform`: reviewed
- `church-history/m06-the-high-medieval-church/l02-east-west-schism-of-1054`: reviewed
- `church-history/m06-the-high-medieval-church/l03-the-crusades`: reviewed
- `church-history/m06-the-high-medieval-church/l04-francis-dominic-and-the-friars`: reviewed
- `church-history/m06-the-high-medieval-church/l05-universities-and-scholasticism`: reviewed
- `church-history/m06-the-high-medieval-church/l06-dissent-and-the-inquisition`: reviewed
- `church-history/m07-the-late-medieval-church/l01-avignon-and-the-western-schism`: reviewed
- `church-history/m07-the-late-medieval-church/l02-wycliffe-hus-and-dissent`: reviewed
- `church-history/m07-the-late-medieval-church/l03-mystics-and-lay-devotion`: reviewed
- `church-history/m07-the-late-medieval-church/l04-renaissance-humanism-and-erasmus`: reviewed
- `church-history/m07-the-late-medieval-church/l05-fall-of-constantinople-and-russia`: reviewed
- `church-history/m08-the-protestant-reformations/l01-luther-and-wittenberg`: reviewed
- `church-history/m08-the-protestant-reformations/l02-the-lutheran-reformation-spreads`: reviewed
- `church-history/m08-the-protestant-reformations/l03-zwingli-and-reformed-beginnings`: reviewed
- `church-history/m08-the-protestant-reformations/l04-calvin-and-geneva`: reviewed
- `church-history/m08-the-protestant-reformations/l05-anabaptists-and-radical-reformers`: reviewed
- `church-history/m08-the-protestant-reformations/l06-english-and-scottish-reformations`: reviewed
- `church-history/m09-catholic-reform-and-the-confessional-age/l01-council-of-trent`: reviewed
- `church-history/m09-catholic-reform-and-the-confessional-age/l02-jesuits-and-catholic-spirituality`: reviewed
- `church-history/m09-catholic-reform-and-the-confessional-age/l03-catholic-missions-worldwide`: reviewed
- `church-history/m09-catholic-reform-and-the-confessional-age/l04-wars-of-religion-and-westphalia`: reviewed
- `church-history/m09-catholic-reform-and-the-confessional-age/l05-puritans-and-pietists`: reviewed
- `church-history/m09-catholic-reform-and-the-confessional-age/l06-orthodoxy-under-ottomans-and-tsars`: reviewed
- `church-history/m10-enlightenment-revival-and-missions/l01-science-enlightenment-and-faith`: reviewed
- `church-history/m10-enlightenment-revival-and-missions/l02-wesley-and-methodism`: reviewed
- `church-history/m10-enlightenment-revival-and-missions/l03-the-great-awakenings`: reviewed
- `church-history/m10-enlightenment-revival-and-missions/l04-the-modern-missionary-movement`: reviewed
- `church-history/m10-enlightenment-revival-and-missions/l05-slavery-abolition-and-the-black-church`: reviewed
- `church-history/m10-enlightenment-revival-and-missions/l06-vatican-i-and-catholic-revival`: reviewed
- `church-history/m11-the-church-in-the-modern-world/l01-liberal-theology-and-its-critics`: reviewed
- `church-history/m11-the-church-in-the-modern-world/l02-birth-of-pentecostalism`: reviewed
- `church-history/m11-the-church-in-the-modern-world/l03-fundamentalist-modernist-controversy`: reviewed
- `church-history/m11-the-church-in-the-modern-world/l04-churches-under-nazism-and-communism`: reviewed
- `church-history/m11-the-church-in-the-modern-world/l05-the-ecumenical-movement`: reviewed
- `church-history/m11-the-church-in-the-modern-world/l06-civil-rights-and-the-church`: reviewed
- `church-history/m12-global-christianity-today/l01-second-vatican-council`: reviewed
- `church-history/m12-global-christianity-today/l02-evangelicals-and-lausanne`: reviewed
- `church-history/m12-global-christianity-today/l03-christianity-in-africa`: reviewed
- `church-history/m12-global-christianity-today/l04-christianity-in-latin-america`: reviewed
- `church-history/m12-global-christianity-today/l05-christianity-in-asia`: reviewed
- `church-history/m12-global-christianity-today/l06-the-church-today`: reviewed
- `computer-science/m01-computational-thinking-and-history/l01-abstraction-and-decomposition`: reviewed
- `computer-science/m01-computational-thinking-and-history/l02-patterns-and-algorithms`: reviewed
- `computer-science/m01-computational-thinking-and-history/l03-pioneers-of-computing`: reviewed
- `computer-science/m01-computational-thinking-and-history/l04-from-vacuum-tubes-to-smartphones`: reviewed
- `computer-science/m02-data-representation-and-compression/l01-bits-binary-and-hexadecimal`: reviewed
- `computer-science/m02-data-representation-and-compression/l02-whole-numbers-and-overflow`: reviewed
- `computer-science/m02-data-representation-and-compression/l03-fractions-and-floating-point`: reviewed
- `computer-science/m02-data-representation-and-compression/l04-text-encoding`: reviewed
- `computer-science/m02-data-representation-and-compression/l05-images-sound-and-compression`: reviewed
- `computer-science/m03-how-computers-work/l01-boolean-logic-and-logic-gates`: reviewed
- `computer-science/m03-how-computers-work/l02-inside-the-processor`: reviewed
- `computer-science/m03-how-computers-work/l03-fetch-decode-execute-cycle`: reviewed
- `computer-science/m03-how-computers-work/l04-memory-hierarchy-and-storage`: reviewed
- `computer-science/m03-how-computers-work/l05-operating-systems`: reviewed
- `computer-science/m04-programming-concepts/l01-variables-types-and-expressions`: reviewed
- `computer-science/m04-programming-concepts/l02-conditionals-and-branching`: reviewed
- `computer-science/m04-programming-concepts/l03-loops-and-iteration`: reviewed
- `computer-science/m04-programming-concepts/l04-functions-and-parameters`: reviewed
- `computer-science/m04-programming-concepts/l05-objects-and-classes`: reviewed
- `computer-science/m04-programming-concepts/l06-languages-paradigms-and-translation`: reviewed
- `computer-science/m05-algorithms-and-efficiency/l01-what-makes-a-good-algorithm`: reviewed
- `computer-science/m05-algorithms-and-efficiency/l02-searching`: reviewed
- `computer-science/m05-algorithms-and-efficiency/l03-measuring-efficiency-with-big-o`: reviewed
- `computer-science/m05-algorithms-and-efficiency/l04-selection-and-insertion-sort`: reviewed
- `computer-science/m05-algorithms-and-efficiency/l05-recursion`: reviewed
- `computer-science/m05-algorithms-and-efficiency/l06-merge-sort-and-quicksort`: reviewed
- `computer-science/m06-data-structures/l01-arrays-and-lists`: reviewed
- `computer-science/m06-data-structures/l02-stacks-and-queues`: reviewed
- `computer-science/m06-data-structures/l03-hash-tables`: reviewed
- `computer-science/m06-data-structures/l04-trees`: reviewed
- `computer-science/m06-data-structures/l05-graphs`: reviewed
- `computer-science/m07-limits-of-computation/l01-tractable-and-intractable-problems`: reviewed
- `computer-science/m07-limits-of-computation/l02-p-versus-np`: reviewed
- `computer-science/m07-limits-of-computation/l03-heuristics-and-approximation`: reviewed
- `computer-science/m07-limits-of-computation/l04-undecidable-problems-and-the-halting-problem`: reviewed
- `computer-science/m08-networks-and-the-internet/l01-packets-and-protocols`: reviewed
- `computer-science/m08-networks-and-the-internet/l02-ip-addresses-and-routing`: reviewed
- `computer-science/m08-networks-and-the-internet/l03-reliable-delivery-with-tcp`: reviewed
- `computer-science/m08-networks-and-the-internet/l04-domain-name-system`: reviewed
- `computer-science/m08-networks-and-the-internet/l05-the-web-and-cloud-computing`: reviewed
- `computer-science/m09-security-and-cryptography/l01-threats-and-malware`: reviewed
- `computer-science/m09-security-and-cryptography/l02-social-engineering-and-phishing`: reviewed
- `computer-science/m09-security-and-cryptography/l03-symmetric-and-public-key-encryption`: reviewed
- `computer-science/m09-security-and-cryptography/l04-hashing-and-password-security`: reviewed
- `computer-science/m09-security-and-cryptography/l05-authentication-and-privacy`: reviewed
- `computer-science/m10-databases-and-data/l01-relational-tables`: reviewed
- `computer-science/m10-databases-and-data/l02-querying-data`: reviewed
- `computer-science/m10-databases-and-data/l03-data-at-scale`: reviewed
- `computer-science/m10-databases-and-data/l04-data-science-basics`: reviewed
- `computer-science/m11-software-engineering/l01-development-life-cycle`: reviewed
- `computer-science/m11-software-engineering/l02-requirements-and-design`: reviewed
- `computer-science/m11-software-engineering/l03-version-control-and-teamwork`: reviewed
- `computer-science/m11-software-engineering/l04-testing-and-debugging`: reviewed
- `computer-science/m11-software-engineering/l05-open-source-and-licensing`: reviewed
- `computer-science/m12-artificial-intelligence-and-ethics/l01-search-and-problem-solving`: reviewed
- `computer-science/m12-artificial-intelligence-and-ethics/l02-machine-learning`: reviewed
- `computer-science/m12-artificial-intelligence-and-ethics/l03-neural-networks-and-deep-learning`: reviewed
- `computer-science/m12-artificial-intelligence-and-ethics/l04-large-language-models`: reviewed
- `computer-science/m12-artificial-intelligence-and-ethics/l05-algorithmic-bias-and-fairness`: reviewed
- `computer-science/m12-artificial-intelligence-and-ethics/l06-computing-and-society`: reviewed
- `economics/m01-foundations/l01-scarcity-and-the-economic-way-of-thinking`: reviewed
- `economics/m01-foundations/l02-opportunity-cost`: reviewed
- `economics/m01-foundations/l03-budget-constraint`: reviewed
- `economics/m01-foundations/l04-production-possibilities-frontier`: reviewed
- `economics/m01-foundations/l05-specialization-trade-and-markets`: reviewed
- `economics/m02-supply-and-demand/l01-law-of-demand`: reviewed
- `economics/m02-supply-and-demand/l02-law-of-supply`: reviewed
- `economics/m02-supply-and-demand/l03-market-equilibrium`: reviewed
- `economics/m02-supply-and-demand/l04-price-controls-and-surplus`: reviewed
- `economics/m02-supply-and-demand/l05-labor-and-financial-markets`: reviewed
- `economics/m03-elasticity-and-consumer-choice/l01-price-elasticity-of-demand`: reviewed
- `economics/m03-elasticity-and-consumer-choice/l02-other-elasticities`: reviewed
- `economics/m03-elasticity-and-consumer-choice/l03-elasticity-in-the-real-world`: reviewed
- `economics/m03-elasticity-and-consumer-choice/l04-utility-and-consumer-equilibrium`: reviewed
- `economics/m03-elasticity-and-consumer-choice/l05-behavioral-economics`: reviewed
- `economics/m04-costs-and-market-structure/l01-costs-of-production`: reviewed
- `economics/m04-costs-and-market-structure/l02-perfect-competition`: reviewed
- `economics/m04-costs-and-market-structure/l03-monopoly-and-market-power`: reviewed
- `economics/m04-costs-and-market-structure/l04-monopolistic-competition`: reviewed
- `economics/m04-costs-and-market-structure/l05-oligopoly-and-game-theory`: reviewed
- `economics/m05-market-failure-and-policy/l01-negative-externalities`: reviewed
- `economics/m05-market-failure-and-policy/l02-environmental-policy`: reviewed
- `economics/m05-market-failure-and-policy/l03-positive-externalities-and-public-goods`: reviewed
- `economics/m05-market-failure-and-policy/l04-information-risk-and-insurance`: reviewed
- `economics/m05-market-failure-and-policy/l05-antitrust-and-competition-policy`: reviewed
- `economics/m06-labor-inequality-and-public-choice/l01-wages-and-labor-markets`: reviewed
- `economics/m06-labor-inequality-and-public-choice/l02-poverty-and-the-safety-net`: reviewed
- `economics/m06-labor-inequality-and-public-choice/l03-income-inequality`: reviewed
- `economics/m06-labor-inequality-and-public-choice/l04-public-choice-theory`: reviewed
- `economics/m06-labor-inequality-and-public-choice/l05-voting-and-government-failure`: reviewed
- `economics/m07-measuring-the-macroeconomy/l01-gross-domestic-product`: reviewed
- `economics/m07-measuring-the-macroeconomy/l02-economic-growth`: reviewed
- `economics/m07-measuring-the-macroeconomy/l03-unemployment`: reviewed
- `economics/m07-measuring-the-macroeconomy/l04-inflation`: reviewed
- `economics/m07-measuring-the-macroeconomy/l05-business-cycle`: reviewed
- `economics/m08-aggregate-demand-and-supply/l01-ad-as-model`: reviewed
- `economics/m08-aggregate-demand-and-supply/l02-keynesian-perspective`: reviewed
- `economics/m08-aggregate-demand-and-supply/l03-neoclassical-perspective`: reviewed
- `economics/m08-aggregate-demand-and-supply/l04-phillips-curve`: reviewed
- `economics/m08-aggregate-demand-and-supply/l05-keynesian-and-neoclassical-synthesis`: reviewed
- `economics/m09-money-banking-and-monetary-policy/l01-money-and-how-banks-create-it`: reviewed
- `economics/m09-money-banking-and-monetary-policy/l02-financial-markets`: reviewed
- `economics/m09-money-banking-and-monetary-policy/l03-central-banks`: reviewed
- `economics/m09-money-banking-and-monetary-policy/l04-monetary-policy-tools`: reviewed
- `economics/m09-money-banking-and-monetary-policy/l05-monetary-policy-in-action`: reviewed
- `economics/m10-fiscal-policy-and-budgets/l01-government-budgets-and-taxation`: reviewed
- `economics/m10-fiscal-policy-and-budgets/l02-discretionary-and-automatic-fiscal-policy`: reviewed
- `economics/m10-fiscal-policy-and-budgets/l03-deficits-and-national-debt`: reviewed
- `economics/m10-fiscal-policy-and-budgets/l04-crowding-out`: reviewed
- `economics/m10-fiscal-policy-and-budgets/l05-policy-coordination`: reviewed
- `economics/m11-international-economics/l01-comparative-advantage-and-gains-from-trade`: reviewed
- `economics/m11-international-economics/l02-protectionism-and-tariffs`: reviewed
- `economics/m11-international-economics/l03-balance-of-payments`: reviewed
- `economics/m11-international-economics/l04-exchange-rates`: reviewed
- `economics/m11-international-economics/l05-globalization-and-its-critics`: reviewed
- `economics/m11-international-economics/l06-international-financial-crises`: reviewed
- `economics/m12-schools-evidence-and-open-questions/l01-schools-of-economic-thought`: reviewed
- `economics/m12-schools-evidence-and-open-questions/l02-how-economists-use-evidence`: reviewed
- `economics/m12-schools-evidence-and-open-questions/l03-institutions-and-development`: reviewed
- `economics/m12-schools-evidence-and-open-questions/l04-unresolved-questions`: reviewed
- `economics/m12-schools-evidence-and-open-questions/l05-thinking-like-an-economist`: reviewed
- `mathematics/m01-numbers-and-mathematical-thinking/l01-how-mathematicians-think`: reviewed
- `mathematics/m01-numbers-and-mathematical-thinking/l02-number-systems-and-the-number-line`: reviewed
- `mathematics/m01-numbers-and-mathematical-thinking/l03-order-of-operations-and-properties`: reviewed
- `mathematics/m01-numbers-and-mathematical-thinking/l04-fractions-percents-and-ratios`: reviewed
- `mathematics/m01-numbers-and-mathematical-thinking/l05-exponents-and-scientific-notation`: reviewed
- `mathematics/m02-algebraic-expressions/l01-variables-and-expressions`: reviewed
- `mathematics/m02-algebraic-expressions/l02-polynomial-arithmetic`: reviewed
- `mathematics/m02-algebraic-expressions/l03-factoring-common-factors-and-grouping`: reviewed
- `mathematics/m02-algebraic-expressions/l04-factoring-trinomials-and-special-forms`: reviewed
- `mathematics/m02-algebraic-expressions/l05-rational-expressions`: reviewed
- `mathematics/m02-algebraic-expressions/l06-radicals-and-rational-exponents`: reviewed
- `mathematics/m03-equations-and-inequalities/l01-linear-and-rational-equations`: reviewed
- `mathematics/m03-equations-and-inequalities/l02-modeling-with-word-problems`: reviewed
- `mathematics/m03-equations-and-inequalities/l03-quadratics-by-factoring-and-square-roots`: reviewed
- `mathematics/m03-equations-and-inequalities/l04-completing-the-square-and-quadratic-formula`: reviewed
- `mathematics/m03-equations-and-inequalities/l05-radical-and-absolute-value-equations`: reviewed
- `mathematics/m03-equations-and-inequalities/l06-linear-and-absolute-value-inequalities`: reviewed
- `mathematics/m04-coordinates-and-lines/l01-coordinate-plane`: reviewed
- `mathematics/m04-coordinates-and-lines/l02-distance-and-midpoint`: reviewed
- `mathematics/m04-coordinates-and-lines/l03-slope-as-a-rate-of-change`: reviewed
- `mathematics/m04-coordinates-and-lines/l04-equations-of-lines`: reviewed
- `mathematics/m04-coordinates-and-lines/l05-linear-models`: reviewed
- `mathematics/m05-functions/l01-what-a-function-is`: reviewed
- `mathematics/m05-functions/l02-domain-range-and-piecewise-functions`: reviewed
- `mathematics/m05-functions/l03-graph-behavior-and-rates-of-change`: reviewed
- `mathematics/m05-functions/l04-transforming-graphs`: reviewed
- `mathematics/m05-functions/l05-combining-and-composing-functions`: reviewed
- `mathematics/m05-functions/l06-inverse-functions`: reviewed
- `mathematics/m06-polynomial-and-rational-functions/l01-quadratic-functions-and-the-vertex`: reviewed
- `mathematics/m06-polynomial-and-rational-functions/l02-polynomial-functions-and-graphs`: reviewed
- `mathematics/m06-polynomial-and-rational-functions/l03-dividing-polynomials-and-the-factor-theorem`: reviewed
- `mathematics/m06-polynomial-and-rational-functions/l04-complex-numbers`: reviewed
- `mathematics/m06-polynomial-and-rational-functions/l05-zeros-of-polynomials`: reviewed
- `mathematics/m06-polynomial-and-rational-functions/l06-rational-functions-and-asymptotes`: reviewed
- `mathematics/m07-exponential-and-logarithmic-functions/l01-exponential-growth-and-decay`: reviewed
- `mathematics/m07-exponential-and-logarithmic-functions/l02-the-number-e-and-continuous-growth`: reviewed
- `mathematics/m07-exponential-and-logarithmic-functions/l03-logarithms-as-inverses`: reviewed
- `mathematics/m07-exponential-and-logarithmic-functions/l04-laws-of-logarithms`: reviewed
- `mathematics/m07-exponential-and-logarithmic-functions/l05-solving-exponential-and-log-equations`: reviewed
- `mathematics/m07-exponential-and-logarithmic-functions/l06-exponential-models`: reviewed
- `mathematics/m08-trigonometric-functions/l01-angles-and-radian-measure`: reviewed
- `mathematics/m08-trigonometric-functions/l02-right-triangle-trigonometry`: reviewed
- `mathematics/m08-trigonometric-functions/l03-the-unit-circle`: reviewed
- `mathematics/m08-trigonometric-functions/l04-graphs-of-sine-and-cosine`: reviewed
- `mathematics/m08-trigonometric-functions/l05-inverse-trigonometric-functions`: reviewed
- `mathematics/m09-trigonometric-identities-and-applications/l01-fundamental-trigonometric-identities`: reviewed
- `mathematics/m09-trigonometric-identities-and-applications/l02-sum-difference-and-double-angle-formulas`: reviewed
- `mathematics/m09-trigonometric-identities-and-applications/l03-solving-trigonometric-equations`: reviewed
- `mathematics/m09-trigonometric-identities-and-applications/l04-laws-of-sines-and-cosines`: reviewed
- `mathematics/m09-trigonometric-identities-and-applications/l05-polar-coordinates-and-vectors`: reviewed
- `mathematics/m10-systems-and-conic-sections/l01-systems-of-two-linear-equations`: reviewed
- `mathematics/m10-systems-and-conic-sections/l02-three-variables-matrices-and-row-reduction`: reviewed
- `mathematics/m10-systems-and-conic-sections/l03-circles-and-parabolas`: reviewed
- `mathematics/m10-systems-and-conic-sections/l04-ellipses-and-hyperbolas`: reviewed
- `mathematics/m10-systems-and-conic-sections/l05-nonlinear-systems-and-inequalities`: reviewed
- `mathematics/m11-sequences-counting-and-probability/l01-sequences-and-summation`: reviewed
- `mathematics/m11-sequences-counting-and-probability/l02-arithmetic-sequences-and-series`: reviewed
- `mathematics/m11-sequences-counting-and-probability/l03-geometric-sequences-and-series`: reviewed
- `mathematics/m11-sequences-counting-and-probability/l04-counting-permutations-and-combinations`: reviewed
- `mathematics/m11-sequences-counting-and-probability/l05-binomial-theorem`: reviewed
- `mathematics/m11-sequences-counting-and-probability/l06-basic-probability`: reviewed
- `mathematics/m12-proof-and-mathematical-reasoning/l01-logic-and-direct-proof`: reviewed
- `mathematics/m12-proof-and-mathematical-reasoning/l02-proof-by-contradiction`: reviewed
- `mathematics/m12-proof-and-mathematical-reasoning/l03-mathematical-induction`: reviewed
- `mathematics/m12-proof-and-mathematical-reasoning/l04-sets-and-functions`: reviewed
- `mathematics/m12-proof-and-mathematical-reasoning/l05-where-mathematics-goes-next`: reviewed
- `physics/m01-foundations-of-physical-measurement/l01-models-and-the-scientific-method`: reviewed
- `physics/m01-foundations-of-physical-measurement/l02-units-and-the-international-system`: reviewed
- `physics/m01-foundations-of-physical-measurement/l03-significant-figures-and-estimation`: reviewed
- `physics/m01-foundations-of-physical-measurement/l04-introduction-to-scalars-and-vectors`: reviewed
- `physics/m02-motion-in-one-dimension/l01-displacement-and-velocity`: reviewed
- `physics/m02-motion-in-one-dimension/l02-defining-acceleration`: reviewed
- `physics/m02-motion-in-one-dimension/l03-equations-of-constant-acceleration`: reviewed
- `physics/m02-motion-in-one-dimension/l04-gravity-and-free-fall`: reviewed
- `physics/m02-motion-in-one-dimension/l05-interpreting-motion-graphs`: reviewed
- `physics/m03-motion-in-two-dimensions/l01-vector-addition-and-components`: reviewed
- `physics/m03-motion-in-two-dimensions/l02-physics-of-projectiles`: reviewed
- `physics/m03-motion-in-two-dimensions/l03-relative-velocity-and-frames`: reviewed
- `physics/m03-motion-in-two-dimensions/l04-uniform-circular-motion`: reviewed
- `physics/m04-forces-and-newtons-laws/l01-inertia-and-the-first-law`: reviewed
- `physics/m04-forces-and-newtons-laws/l02-force-mass-and-acceleration`: reviewed
- `physics/m04-forces-and-newtons-laws/l03-action-and-reaction-pairs`: reviewed
- `physics/m04-forces-and-newtons-laws/l04-weight-and-normal-force`: reviewed
- `physics/m04-forces-and-newtons-laws/l05-friction-and-drag`: reviewed
- `physics/m04-forces-and-newtons-laws/l06-free-body-reasoning`: reviewed
- `physics/m05-work-and-energy/l01-work-and-kinetic-energy`: reviewed
- `physics/m05-work-and-energy/l02-potential-energy-and-storage`: reviewed
- `physics/m05-work-and-energy/l03-conservation-of-mechanical-energy`: reviewed
- `physics/m05-work-and-energy/l04-nonconservative-forces-and-power`: reviewed
- `physics/m05-work-and-energy/l05-energy-in-living-systems`: reviewed
- `physics/m06-momentum-and-rotational-motion/l01-impulse-and-linear-momentum`: reviewed
- `physics/m06-momentum-and-rotational-motion/l02-collisions-and-conservation`: reviewed
- `physics/m06-momentum-and-rotational-motion/l03-rotational-kinematics-and-torque`: reviewed
- `physics/m06-momentum-and-rotational-motion/l04-angular-momentum-and-equilibrium`: reviewed
- `physics/m06-momentum-and-rotational-motion/l05-gravity-and-planetary-orbits`: reviewed
- `physics/m07-fluids-and-thermodynamics/l01-pressure-and-buoyancy`: reviewed
- `physics/m07-fluids-and-thermodynamics/l02-fluid-dynamics-and-flow`: reviewed
- `physics/m07-fluids-and-thermodynamics/l03-temperature-and-ideal-gases`: reviewed
- `physics/m07-fluids-and-thermodynamics/l04-heat-transfer-and-calorimetry`: reviewed
- `physics/m07-fluids-and-thermodynamics/l05-laws-of-thermodynamics`: reviewed
- `physics/m08-oscillations-and-waves/l01-simple-harmonic-motion`: reviewed
- `physics/m08-oscillations-and-waves/l02-wave-properties-and-behavior`: reviewed
- `physics/m08-oscillations-and-waves/l03-interference-and-standing-waves`: reviewed
- `physics/m08-oscillations-and-waves/l04-physics-of-sound`: reviewed
- `physics/m08-oscillations-and-waves/l05-resonance-and-music`: reviewed
- `physics/m09-electricity-and-circuits/l01-electric-charge-and-fields`: reviewed
- `physics/m09-electricity-and-circuits/l02-electric-potential-and-voltage`: reviewed
- `physics/m09-electricity-and-circuits/l03-current-resistance-and-ohms-law`: reviewed
- `physics/m09-electricity-and-circuits/l04-series-and-parallel-circuits`: reviewed
- `physics/m09-electricity-and-circuits/l05-electrical-safety-and-power`: reviewed
- `physics/m10-magnetism-and-electromagnetism/l01-magnetic-fields-and-forces`: reviewed
- `physics/m10-magnetism-and-electromagnetism/l02-electromagnets-and-motors`: reviewed
- `physics/m10-magnetism-and-electromagnetism/l03-electromagnetic-induction`: reviewed
- `physics/m10-magnetism-and-electromagnetism/l04-generators-and-transformers`: reviewed
- `physics/m10-magnetism-and-electromagnetism/l05-electromagnetic-spectrum`: reviewed
- `physics/m11-light-and-optics/l01-reflection-and-mirrors`: reviewed
- `physics/m11-light-and-optics/l02-refraction-and-lenses`: reviewed
- `physics/m11-light-and-optics/l03-optical-instruments-and-vision`: reviewed
- `physics/m11-light-and-optics/l04-wave-optics-and-diffraction`: reviewed
- `physics/m12-modern-physics/l01-special-relativity`: reviewed
- `physics/m12-modern-physics/l02-photons-and-quantum-effects`: reviewed
- `physics/m12-modern-physics/l03-bohr-atom`: reviewed
- `physics/m12-modern-physics/l04-radioactivity-and-the-nucleus`: reviewed
- `physics/m12-modern-physics/l05-fission-fusion-and-cosmology`: reviewed
- `psychology/m01-psychology-as-a-science/l01-origins-of-psychology`: reviewed
- `psychology/m01-psychology-as-a-science/l02-schools-and-modern-perspectives`: reviewed
- `psychology/m01-psychology-as-a-science/l03-descriptive-and-correlational-research`: reviewed
- `psychology/m01-psychology-as-a-science/l04-experiments-and-research-ethics`: reviewed
- `psychology/m01-psychology-as-a-science/l05-statistics-reliability-and-validity`: reviewed
- `psychology/m01-psychology-as-a-science/l06-replication-crisis-and-open-science`: reviewed
- `psychology/m02-biology-of-behavior/l01-genes-evolution-and-behavior`: reviewed
- `psychology/m02-biology-of-behavior/l02-neurons-and-neural-communication`: reviewed
- `psychology/m02-biology-of-behavior/l03-the-nervous-system`: reviewed
- `psychology/m02-biology-of-behavior/l04-the-brain`: reviewed
- `psychology/m02-biology-of-behavior/l05-endocrine-system`: reviewed
- `psychology/m03-states-of-consciousness/l01-biological-rhythms-and-sleep-stages`: reviewed
- `psychology/m03-states-of-consciousness/l02-why-we-sleep-and-dream`: reviewed
- `psychology/m03-states-of-consciousness/l03-sleep-disorders`: reviewed
- `psychology/m03-states-of-consciousness/l04-psychoactive-drugs`: reviewed
- `psychology/m03-states-of-consciousness/l05-hypnosis-and-meditation`: reviewed
- `psychology/m04-sensation-and-perception/l01-thresholds-and-signal-detection`: reviewed
- `psychology/m04-sensation-and-perception/l02-vision`: reviewed
- `psychology/m04-sensation-and-perception/l03-hearing`: reviewed
- `psychology/m04-sensation-and-perception/l04-taste-and-smell`: reviewed
- `psychology/m04-sensation-and-perception/l05-touch-pain-and-body-senses`: reviewed
- `psychology/m04-sensation-and-perception/l06-perceptual-organization`: reviewed
- `psychology/m05-learning-and-memory/l01-classical-conditioning`: reviewed
- `psychology/m05-learning-and-memory/l02-operant-conditioning`: reviewed
- `psychology/m05-learning-and-memory/l03-observational-and-cognitive-learning`: reviewed
- `psychology/m05-learning-and-memory/l04-how-memory-works`: reviewed
- `psychology/m05-learning-and-memory/l05-forgetting-and-false-memories`: reviewed
- `psychology/m05-learning-and-memory/l06-improving-memory-and-learning`: reviewed
- `psychology/m06-thinking-language-and-intelligence/l01-concepts-and-problem-solving`: reviewed
- `psychology/m06-thinking-language-and-intelligence/l02-heuristics-and-biases`: reviewed
- `psychology/m06-thinking-language-and-intelligence/l03-language-and-its-development`: reviewed
- `psychology/m06-thinking-language-and-intelligence/l04-theories-of-intelligence`: reviewed
- `psychology/m06-thinking-language-and-intelligence/l05-measuring-intelligence`: reviewed
- `psychology/m06-thinking-language-and-intelligence/l06-genes-environment-and-intelligence`: reviewed
- `psychology/m07-lifespan-development/l01-prenatal-development-and-infancy`: reviewed
- `psychology/m07-lifespan-development/l02-attachment-and-early-relationships`: reviewed
- `psychology/m07-lifespan-development/l03-cognitive-development`: reviewed
- `psychology/m07-lifespan-development/l04-moral-and-psychosocial-development`: reviewed
- `psychology/m07-lifespan-development/l05-adolescence`: reviewed
- `psychology/m07-lifespan-development/l06-adulthood-aging-and-death`: reviewed
- `psychology/m08-motivation-emotion-and-stress/l01-theories-of-motivation`: reviewed
- `psychology/m08-motivation-emotion-and-stress/l02-hunger-and-eating`: reviewed
- `psychology/m08-motivation-emotion-and-stress/l03-sexual-behavior`: reviewed
- `psychology/m08-motivation-emotion-and-stress/l04-emotion`: reviewed
- `psychology/m08-motivation-emotion-and-stress/l05-stress-coping-and-health`: reviewed
- `psychology/m09-personality/l01-freud-and-the-psychodynamic-tradition`: reviewed
- `psychology/m09-personality/l02-humanistic-and-social-cognitive-approaches`: reviewed
- `psychology/m09-personality/l03-trait-theories-and-the-big-five`: reviewed
- `psychology/m09-personality/l04-biology-culture-and-personality`: reviewed
- `psychology/m09-personality/l05-personality-assessment`: reviewed
- `psychology/m10-social-psychology/l01-attribution-and-self-presentation`: reviewed
- `psychology/m10-social-psychology/l02-attitudes-and-persuasion`: reviewed
- `psychology/m10-social-psychology/l03-conformity-compliance-and-obedience`: reviewed
- `psychology/m10-social-psychology/l04-behavior-in-groups`: reviewed
- `psychology/m10-social-psychology/l05-prejudice-and-discrimination`: reviewed
- `psychology/m10-social-psychology/l06-aggression-helping-and-attraction`: reviewed
- `psychology/m11-psychological-disorders/l01-defining-and-diagnosing-disorders`: reviewed
- `psychology/m11-psychological-disorders/l02-anxiety-and-related-disorders`: reviewed
- `psychology/m11-psychological-disorders/l03-depression-and-bipolar-disorder`: reviewed
- `psychology/m11-psychological-disorders/l04-schizophrenia-and-psychotic-disorders`: reviewed
- `psychology/m11-psychological-disorders/l05-dissociative-and-personality-disorders`: reviewed
- `psychology/m11-psychological-disorders/l06-neurodevelopmental-disorders`: reviewed
- `psychology/m12-therapy-and-treatment/l01-mental-health-care-past-and-present`: reviewed
- `psychology/m12-therapy-and-treatment/l02-psychodynamic-and-humanistic-therapies`: reviewed
- `psychology/m12-therapy-and-treatment/l03-behavioral-and-cognitive-therapies`: reviewed
- `psychology/m12-therapy-and-treatment/l04-biomedical-treatments`: reviewed
- `psychology/m12-therapy-and-treatment/l05-group-family-and-community-approaches`: reviewed
- `psychology/m12-therapy-and-treatment/l06-how-well-treatment-works`: reviewed
- `us-history/m01-native-america-and-the-atlantic-world/l01-native-societies-before-contact`: reviewed
- `us-history/m01-native-america-and-the-atlantic-world/l02-europe-and-west-africa-before-1492`: reviewed
- `us-history/m01-native-america-and-the-atlantic-world/l03-columbus-and-the-columbian-exchange`: reviewed
- `us-history/m01-native-america-and-the-atlantic-world/l04-new-spain-and-the-borderlands`: reviewed
- `us-history/m01-native-america-and-the-atlantic-world/l05-new-france-and-new-netherland`: reviewed
- `us-history/m02-the-english-colonies/l01-jamestown-and-the-chesapeake`: reviewed
- `us-history/m02-the-english-colonies/l02-puritan-new-england`: reviewed
- `us-history/m02-the-english-colonies/l03-middle-and-southern-colonies`: reviewed
- `us-history/m02-the-english-colonies/l04-rise-of-racial-slavery`: reviewed
- `us-history/m02-the-english-colonies/l05-colonial-society-in-the-1700s`: reviewed
- `us-history/m02-the-english-colonies/l06-imperial-wars-and-the-seven-years-war`: reviewed
- `us-history/m03-the-road-to-revolution/l01-imperial-reforms-and-colonial-protests`: reviewed
- `us-history/m03-the-road-to-revolution/l02-from-protest-to-independence`: reviewed
- `us-history/m03-the-road-to-revolution/l03-declaration-of-independence`: reviewed
- `us-history/m03-the-road-to-revolution/l04-war-for-independence`: reviewed
- `us-history/m03-the-road-to-revolution/l05-the-revolutions-people`: reviewed
- `us-history/m04-creating-a-nation/l01-articles-of-confederation`: reviewed
- `us-history/m04-creating-a-nation/l02-constitutional-convention`: reviewed
- `us-history/m04-creating-a-nation/l03-ratification-and-the-bill-of-rights`: reviewed
- `us-history/m04-creating-a-nation/l04-washington-hamilton-and-the-first-parties`: reviewed
- `us-history/m04-creating-a-nation/l05-jefferson-and-the-war-of-1812`: reviewed
- `us-history/m04-creating-a-nation/l06-missouri-compromise-and-monroe-doctrine`: reviewed
- `us-history/m05-markets-democracy-and-reform/l01-market-revolution`: reviewed
- `us-history/m05-markets-democracy-and-reform/l02-jacksonian-democracy`: reviewed
- `us-history/m05-markets-democracy-and-reform/l03-indian-removal`: reviewed
- `us-history/m05-markets-democracy-and-reform/l04-slavery-and-the-cotton-south`: reviewed
- `us-history/m05-markets-democracy-and-reform/l05-religion-and-reform`: reviewed
- `us-history/m06-expansion-and-sectional-crisis/l01-abolition-movement`: reviewed
- `us-history/m06-expansion-and-sectional-crisis/l02-manifest-destiny-and-the-west`: reviewed
- `us-history/m06-expansion-and-sectional-crisis/l03-mexican-american-war`: reviewed
- `us-history/m06-expansion-and-sectional-crisis/l04-compromise-of-1850-and-fugitive-slaves`: reviewed
- `us-history/m06-expansion-and-sectional-crisis/l05-kansas-dred-scott-and-lincoln`: reviewed
- `us-history/m07-civil-war-and-reconstruction/l01-secession-and-the-coming-of-war`: reviewed
- `us-history/m07-civil-war-and-reconstruction/l02-course-of-the-war`: reviewed
- `us-history/m07-civil-war-and-reconstruction/l03-emancipation-and-the-home-fronts`: reviewed
- `us-history/m07-civil-war-and-reconstruction/l04-reconstruction-in-washington`: reviewed
- `us-history/m07-civil-war-and-reconstruction/l05-reconstruction-in-the-south-and-its-end`: reviewed
- `us-history/m07-civil-war-and-reconstruction/l06-jim-crow-and-the-new-south`: reviewed
- `us-history/m08-the-west-and-the-gilded-age/l01-plains-wars-and-native-nations`: reviewed
- `us-history/m08-the-west-and-the-gilded-age/l02-railroads-and-the-settlement-of-the-west`: reviewed
- `us-history/m08-the-west-and-the-gilded-age/l03-industrial-capitalism`: reviewed
- `us-history/m08-the-west-and-the-gilded-age/l04-workers-and-the-labor-movement`: reviewed
- `us-history/m08-the-west-and-the-gilded-age/l05-immigration-and-the-growth-of-cities`: reviewed
- `us-history/m09-populism-empire-and-progressivism/l01-gilded-age-politics-and-populism`: reviewed
- `us-history/m09-populism-empire-and-progressivism/l02-american-empire`: reviewed
- `us-history/m09-populism-empire-and-progressivism/l03-progressive-reformers`: reviewed
- `us-history/m09-populism-empire-and-progressivism/l04-progressive-presidents`: reviewed
- `us-history/m09-populism-empire-and-progressivism/l05-the-first-world-war`: reviewed
- `us-history/m10-boom-depression-and-world-war/l01-prosperity-and-conflict-in-the-1920s`: reviewed
- `us-history/m10-boom-depression-and-world-war/l02-great-depression`: reviewed
- `us-history/m10-boom-depression-and-world-war/l03-new-deal`: reviewed
- `us-history/m10-boom-depression-and-world-war/l04-the-road-to-world-war-two`: reviewed
- `us-history/m10-boom-depression-and-world-war/l05-fighting-world-war-two`: reviewed
- `us-history/m10-boom-depression-and-world-war/l06-the-home-front`: reviewed
- `us-history/m11-cold-war-and-civil-rights/l01-origins-of-the-cold-war`: reviewed
- `us-history/m11-cold-war-and-civil-rights/l02-korea-and-the-nuclear-age`: reviewed
- `us-history/m11-cold-war-and-civil-rights/l03-postwar-society-and-the-red-scare`: reviewed
- `us-history/m11-cold-war-and-civil-rights/l04-civil-rights-movement`: reviewed
- `us-history/m11-cold-war-and-civil-rights/l05-kennedy-johnson-and-the-great-society`: reviewed
- `us-history/m11-cold-war-and-civil-rights/l06-vietnam-war`: reviewed
- `us-history/m12-recent-america/l01-protest-and-new-rights-movements`: reviewed
- `us-history/m12-recent-america/l02-watergate-and-the-1970s`: reviewed
- `us-history/m12-recent-america/l03-the-conservative-turn`: reviewed
- `us-history/m12-recent-america/l04-end-of-the-cold-war-and-the-1990s`: reviewed
- `us-history/m12-recent-america/l05-september-11-and-the-war-on-terror`: reviewed
- `us-history/m12-recent-america/l06-the-twenty-first-century`: reviewed
- `world-history/m01-historical-thinking-and-human-origins/l01-historians-craft`: reviewed
- `world-history/m01-historical-thinking-and-human-origins/l02-human-origins-and-paleolithic-life`: reviewed
- `world-history/m01-historical-thinking-and-human-origins/l03-neolithic-revolution`: reviewed
- `world-history/m01-historical-thinking-and-human-origins/l04-first-villages-and-social-hierarchy`: reviewed
- `world-history/m02-first-civilizations/l01-mesopotamia`: reviewed
- `world-history/m02-first-civilizations/l02-ancient-egypt`: reviewed
- `world-history/m02-first-civilizations/l03-indus-valley`: reviewed
- `world-history/m02-first-civilizations/l04-early-china`: reviewed
- `world-history/m02-first-civilizations/l05-early-americas`: reviewed
- `world-history/m03-classical-mediterranean-and-persia/l01-persian-empire`: reviewed
- `world-history/m03-classical-mediterranean-and-persia/l02-greece-and-the-hellenistic-world`: reviewed
- `world-history/m03-classical-mediterranean-and-persia/l03-rise-of-rome`: reviewed
- `world-history/m03-classical-mediterranean-and-persia/l04-judaism-and-early-christianity`: reviewed
- `world-history/m03-classical-mediterranean-and-persia/l05-transformation-of-the-roman-world`: reviewed
- `world-history/m04-classical-asia-africa-americas/l01-classical-asian-religions-and-philosophies`: reviewed
- `world-history/m04-classical-asia-africa-americas/l02-mauryan-and-gupta-india`: reviewed
- `world-history/m04-classical-asia-africa-americas/l03-qin-and-han-china`: reviewed
- `world-history/m04-classical-asia-africa-americas/l04-silk-roads`: reviewed
- `world-history/m04-classical-asia-africa-americas/l05-kush-and-aksum`: reviewed
- `world-history/m04-classical-asia-africa-americas/l06-maya-and-teotihuacan`: reviewed
- `world-history/m05-age-of-faiths/l01-byzantine-empire`: reviewed
- `world-history/m05-age-of-faiths/l02-muhammad-and-early-islam`: reviewed
- `world-history/m05-age-of-faiths/l03-umayyad-and-abbasid-caliphates`: reviewed
- `world-history/m05-age-of-faiths/l04-spread-of-buddhism`: reviewed
- `world-history/m06-post-classical-states/l01-tang-and-song-china`: reviewed
- `world-history/m06-post-classical-states/l02-japan-korea-and-southeast-asia`: reviewed
- `world-history/m06-post-classical-states/l03-feudal-europe`: reviewed
- `world-history/m06-post-classical-states/l04-medieval-church-and-crusades`: reviewed
- `world-history/m06-post-classical-states/l05-ghana-and-mali`: reviewed
- `world-history/m06-post-classical-states/l06-swahili-coast-and-indian-ocean`: reviewed
- `world-history/m07-global-middle-ages/l01-mongol-empire`: reviewed
- `world-history/m07-global-middle-ages/l02-pax-mongolica`: reviewed
- `world-history/m07-global-middle-ages/l03-black-death`: reviewed
- `world-history/m07-global-middle-ages/l04-renaissance-europe`: reviewed
- `world-history/m07-global-middle-ages/l05-aztec-and-inca`: reviewed
- `world-history/m08-connections-across-continents/l01-european-exploration`: reviewed
- `world-history/m08-connections-across-continents/l02-conquest-of-the-americas`: reviewed
- `world-history/m08-connections-across-continents/l03-columbian-exchange`: reviewed
- `world-history/m08-connections-across-continents/l04-atlantic-slave-trade`: reviewed
- `world-history/m08-connections-across-continents/l05-ottoman-and-safavid-empires`: reviewed
- `world-history/m08-connections-across-continents/l06-mughal-india-and-ming-china`: reviewed
- `world-history/m09-early-modern-transformations/l01-reformation`: reviewed
- `world-history/m09-early-modern-transformations/l02-scientific-revolution`: reviewed
- `world-history/m09-early-modern-transformations/l03-absolute-monarchy`: reviewed
- `world-history/m09-early-modern-transformations/l04-qing-china`: reviewed
- `world-history/m09-early-modern-transformations/l05-tokugawa-japan`: reviewed
- `world-history/m10-age-of-revolution/l01-enlightenment`: reviewed
- `world-history/m10-age-of-revolution/l02-american-and-french-revolutions`: reviewed
- `world-history/m10-age-of-revolution/l03-haitian-revolution-and-abolition`: reviewed
- `world-history/m10-age-of-revolution/l04-latin-american-independence`: reviewed
- `world-history/m10-age-of-revolution/l05-industrial-revolution`: reviewed
- `world-history/m10-age-of-revolution/l06-industrial-society-and-new-ideologies`: reviewed
- `world-history/m11-nationalism-and-imperialism/l01-nationalism-and-unification`: reviewed
- `world-history/m11-nationalism-and-imperialism/l02-new-imperialism`: reviewed
- `world-history/m11-nationalism-and-imperialism/l03-qing-decline-and-opium-wars`: reviewed
- `world-history/m11-nationalism-and-imperialism/l04-meiji-japan`: reviewed
- `world-history/m11-nationalism-and-imperialism/l05-resistance-to-colonial-rule`: reviewed
- `world-history/m12-modern-world/l01-world-war-one`: reviewed
- `world-history/m12-modern-world/l02-interwar-years`: reviewed
- `world-history/m12-modern-world/l03-world-war-two-and-the-holocaust`: reviewed
- `world-history/m12-modern-world/l04-cold-war`: reviewed
- `world-history/m12-modern-world/l05-decolonization`: reviewed
- `world-history/m12-modern-world/l06-globalization-and-the-present`: reviewed

</details>
<!-- /HAND-EDITS -->

## Known issues and next steps

<!-- NEXT-STEPS -->
**Done:** 4 subjects, 48 modules, 250 lessons, all with text and audio. `build.py` produces `dist/` and
re-validates it, and `check_quotes.py` passes. See the table at the top for the numbers.

**Not done, or not verified:**

1. **No human has listened to the audio.** The voice was chosen on measured intelligibility (Whisper WER) and
   speed, not on taste. Before launch, someone should listen to a few lessons per subject. Check names
   (Kenyatta, Cerularius, al-Ghazali), Bible references, and the overall pace. To switch voices, run
   `tts.py --voice en_US-ryan-high --force`, which would take 8 hours or more on this Mac.
2. **The review was done by Claude, not by a subject expert.** It caught many errors, but subtle ones surely
   remain. Ask an expert to spot-check before the subjects are promoted. The priorities are Theology (fairness
   to each tradition, orthodoxy) and History (numbers, death tolls, dates).
3. **The automated reviews were weak.** Most were done by flash-lite or a free OpenRouter model. `--rereview-weak`
   now skips every lesson because all 250 are hand-reviewed. To get a second machine pass anyway, empty
   `logs/hand_reviewed.txt`. The point would be for a strong model to re-check for anything Claude missed. Treat
   its suggestions as flags to verify, never as auto-edits.
4. **Bible quotations:** the 45 quoted passages are exact. Unquoted allusions with a reference ("Paul writes in
   Romans 8 that...") are paraphrase by design and are not checked.
5. **Free-tier limits:** GitHub Models returns a stub and is skipped. Gemini daily quotas and 503s were the main
   pacing limit. Writing all 250 lessons took about six and a half hours of wall time (11:04 to 17:29), much of it waiting on quotas.
6. **Google Drive stalls:** reads of this folder sometimes block for minutes. Long runs therefore use the local
   mirror in `~/Downloads/subject-mastery-build/work`, and `sync_content.py push` copies the results back.
   Run `sync_content.py status` before editing in either place.
7. **Not deployed.** `dist/` is in `~/Downloads/subject-mastery-build/dist`. The orchestrator or the web builder
   decides when to publish it.
