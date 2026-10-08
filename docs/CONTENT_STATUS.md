# Content status

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved. · help@batesai.org · https://batesai.org

_Updated 2026-10-08. The repository contains all 639 drafted lessons across ten subjects. Five subjects are available: the four original pilots (250 recordings) plus Mathematics (66 device-speech lessons). Other subjects remain planned pending further review and narration. Existing hand-review counts below refer to the prior editorial pass, not a new human certification. Mathematics received an additional free-model review and five page corrections; see MATH_REVIEW.md. Regenerate the table with `SM_AUDIO_DIR=<John audio folder> python3 -B pipeline/status.py --write-doc`._

<!-- STATUS-TABLE -->
| Subject | Modules | Lessons written | With audio | Audio minutes | Hand-reviewed | Draft models |
|---|---|---|---|---|---|---|
| Economics | 12 | 61/61 | 61 | 434 | 61 | gemini:gemini-3.5-flash-lite (55), groq:openai/gpt-oss-120b (3), gemini:gemini-3.5-flash (2), gemini:gemini-3-flash-preview (1) |
| Biology | 12 | 61/61 | 61 | 442 | 61 | gemini:gemini-3.5-flash-lite (50), gemini:gemini-3-flash-preview (5), gemini:gemini-3.1-flash-lite (4), groq:openai/gpt-oss-120b (1), gemini:gemini-3.6-flash (1) |
| World History | 12 | 63/63 | 63 | 473 | 63 | gemini:gemini-3.5-flash-lite (47), gemini:gemini-3.1-flash-lite (10), groq:openai/gpt-oss-120b (4), gemini:gemini-3.5-flash (2) |
| Biblical Studies & Theology | 12 | 65/65 | 65 | 449 | 65 | gemini:gemini-3.5-flash-lite (53), gemini:gemini-3.1-flash-lite (7), groq:openai/gpt-oss-120b (3), gemini:gemini-3-flash-preview (1), gemini:gemini-3.5-flash (1) |
| Mathematics | 12 | 66/66 | 0 | 0 | 0 | gemini:gemini-3.5-flash-lite (53), gemini:gemini-3.1-flash-lite (13) |
| Psychology | 12 | 68/68 | 0 | 0 | 0 | gemini:gemini-3.1-flash-lite (68) |
| US History | 12 | 66/66 | 0 | 0 | 0 | gemini:gemini-3.1-flash-lite (66) |
| Chemistry | 12 | 63/63 | 0 | 0 | 0 | gemini:gemini-3.1-flash-lite (63) |
| Computer Science | 12 | 60/60 | 0 | 0 | 0 | gemini:gemini-3.1-flash-lite (60) |
| Church History | 12 | 66/66 | 0 | 0 | 0 | gemini:gemini-3.1-flash-lite (66) |
| **All** | 120 | 639/639 | 250 | 1798 | 250 | |

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

- `m01-numbers-and-mathematical-thinking` Numbers and Mathematical Thinking: 5/5 written, 0 audio, 0 hand-reviewed
- `m02-algebraic-expressions` Algebraic Expressions: 6/6 written, 0 audio, 0 hand-reviewed
- `m03-equations-and-inequalities` Equations and Inequalities: 6/6 written, 0 audio, 0 hand-reviewed
- `m04-coordinates-and-lines` Coordinates and Lines: 5/5 written, 0 audio, 0 hand-reviewed
- `m05-functions` Functions: 6/6 written, 0 audio, 0 hand-reviewed
- `m06-polynomial-and-rational-functions` Polynomial and Rational Functions: 6/6 written, 0 audio, 0 hand-reviewed
- `m07-exponential-and-logarithmic-functions` Exponential and Logarithmic Functions: 6/6 written, 0 audio, 0 hand-reviewed
- `m08-trigonometric-functions` Trigonometric Functions: 5/5 written, 0 audio, 0 hand-reviewed
- `m09-trigonometric-identities-and-applications` Trigonometric Identities and Applications: 5/5 written, 0 audio, 0 hand-reviewed
- `m10-systems-and-conic-sections` Systems of Equations and Conic Sections: 5/5 written, 0 audio, 0 hand-reviewed
- `m11-sequences-counting-and-probability` Sequences, Series, Counting and Probability: 6/6 written, 0 audio, 0 hand-reviewed
- `m12-proof-and-mathematical-reasoning` Proof and Mathematical Reasoning: 5/5 written, 0 audio, 0 hand-reviewed

**Psychology**

- `m01-psychology-as-a-science` Psychology as a Science: 6/6 written, 0 audio, 0 hand-reviewed
- `m02-biology-of-behavior` The Biology of Behavior: 5/5 written, 0 audio, 0 hand-reviewed
- `m03-states-of-consciousness` States of Consciousness: 5/5 written, 0 audio, 0 hand-reviewed
- `m04-sensation-and-perception` Sensation and Perception: 6/6 written, 0 audio, 0 hand-reviewed
- `m05-learning-and-memory` Learning and Memory: 6/6 written, 0 audio, 0 hand-reviewed
- `m06-thinking-language-and-intelligence` Thinking, Language and Intelligence: 6/6 written, 0 audio, 0 hand-reviewed
- `m07-lifespan-development` Lifespan Development: 6/6 written, 0 audio, 0 hand-reviewed
- `m08-motivation-emotion-and-stress` Motivation, Emotion and Stress: 5/5 written, 0 audio, 0 hand-reviewed
- `m09-personality` Personality: 5/5 written, 0 audio, 0 hand-reviewed
- `m10-social-psychology` Social Psychology: 6/6 written, 0 audio, 0 hand-reviewed
- `m11-psychological-disorders` Psychological Disorders: 6/6 written, 0 audio, 0 hand-reviewed
- `m12-therapy-and-treatment` Therapy and Treatment: 6/6 written, 0 audio, 0 hand-reviewed

**US History**

- `m01-native-america-and-the-atlantic-world` Native America and the Atlantic World: 5/5 written, 0 audio, 0 hand-reviewed
- `m02-the-english-colonies` The English Colonies: 6/6 written, 0 audio, 0 hand-reviewed
- `m03-the-road-to-revolution` The Road to Revolution: 5/5 written, 0 audio, 0 hand-reviewed
- `m04-creating-a-nation` Creating a Nation: 6/6 written, 0 audio, 0 hand-reviewed
- `m05-markets-democracy-and-reform` Markets, Democracy and Reform: 5/5 written, 0 audio, 0 hand-reviewed
- `m06-expansion-and-sectional-crisis` Expansion and Sectional Crisis: 5/5 written, 0 audio, 0 hand-reviewed
- `m07-civil-war-and-reconstruction` Civil War and Reconstruction: 6/6 written, 0 audio, 0 hand-reviewed
- `m08-the-west-and-the-gilded-age` The West and the Gilded Age: 5/5 written, 0 audio, 0 hand-reviewed
- `m09-populism-empire-and-progressivism` Populism, Empire and Progressivism: 5/5 written, 0 audio, 0 hand-reviewed
- `m10-boom-depression-and-world-war` Boom, Depression and World War: 6/6 written, 0 audio, 0 hand-reviewed
- `m11-cold-war-and-civil-rights` Cold War and Civil Rights: 6/6 written, 0 audio, 0 hand-reviewed
- `m12-recent-america` Recent America: 6/6 written, 0 audio, 0 hand-reviewed

**Chemistry**

- `m01-matter-and-measurement` Matter and Measurement: 4/4 written, 0 audio, 0 hand-reviewed
- `m02-atoms-molecules-and-ions` Atoms, Molecules and Ions: 5/5 written, 0 audio, 0 hand-reviewed
- `m03-moles-and-chemical-reactions` Moles and Chemical Reactions: 6/6 written, 0 audio, 0 hand-reviewed
- `m04-thermochemistry` Thermochemistry: 4/4 written, 0 audio, 0 hand-reviewed
- `m05-electronic-structure-and-periodic-trends` Electronic Structure and Periodic Trends: 5/5 written, 0 audio, 0 hand-reviewed
- `m06-chemical-bonding-and-molecular-shape` Chemical Bonding and Molecular Shape: 6/6 written, 0 audio, 0 hand-reviewed
- `m07-gases` Gases: 4/4 written, 0 audio, 0 hand-reviewed
- `m08-liquids-solids-and-solutions` Liquids, Solids and Solutions: 6/6 written, 0 audio, 0 hand-reviewed
- `m09-reaction-rates-and-equilibrium` Reaction Rates and Equilibrium: 6/6 written, 0 audio, 0 hand-reviewed
- `m10-acids-bases-and-solubility` Acids, Bases and Solubility Equilibria: 5/5 written, 0 audio, 0 hand-reviewed
- `m11-thermodynamics-and-electrochemistry` Thermodynamics and Electrochemistry: 6/6 written, 0 audio, 0 hand-reviewed
- `m12-organic-and-nuclear-chemistry` Organic and Nuclear Chemistry: 6/6 written, 0 audio, 0 hand-reviewed

**Computer Science**

- `m01-computational-thinking-and-history` Computational Thinking and History: 4/4 written, 0 audio, 0 hand-reviewed
- `m02-data-representation-and-compression` Data Representation and Compression: 5/5 written, 0 audio, 0 hand-reviewed
- `m03-how-computers-work` How Computers Work: 5/5 written, 0 audio, 0 hand-reviewed
- `m04-programming-concepts` Programming Concepts in Plain Words: 6/6 written, 0 audio, 0 hand-reviewed
- `m05-algorithms-and-efficiency` Algorithms and Efficiency: 6/6 written, 0 audio, 0 hand-reviewed
- `m06-data-structures` Data Structures: 5/5 written, 0 audio, 0 hand-reviewed
- `m07-limits-of-computation` Limits of Computation: 4/4 written, 0 audio, 0 hand-reviewed
- `m08-networks-and-the-internet` Networks and the Internet: 5/5 written, 0 audio, 0 hand-reviewed
- `m09-security-and-cryptography` Security and Cryptography: 5/5 written, 0 audio, 0 hand-reviewed
- `m10-databases-and-data` Databases and Data: 4/4 written, 0 audio, 0 hand-reviewed
- `m11-software-engineering` Software Engineering: 5/5 written, 0 audio, 0 hand-reviewed
- `m12-artificial-intelligence-and-ethics` Artificial Intelligence and Ethics: 6/6 written, 0 audio, 0 hand-reviewed

**Church History**

- `m01-the-apostolic-church` The Apostolic Church: 5/5 written, 0 audio, 0 hand-reviewed
- `m02-the-church-of-the-martyrs` The Church of the Martyrs: 5/5 written, 0 audio, 0 hand-reviewed
- `m03-constantine-and-the-imperial-church` Constantine and the Imperial Church: 4/4 written, 0 audio, 0 hand-reviewed
- `m04-fathers-councils-and-divisions` Fathers, Councils and Divisions: 5/5 written, 0 audio, 0 hand-reviewed
- `m05-the-early-medieval-church` The Early Medieval Church: 6/6 written, 0 audio, 0 hand-reviewed
- `m06-the-high-medieval-church` The High Medieval Church: 6/6 written, 0 audio, 0 hand-reviewed
- `m07-the-late-medieval-church` The Late Medieval Church: 5/5 written, 0 audio, 0 hand-reviewed
- `m08-the-protestant-reformations` The Protestant Reformations: 6/6 written, 0 audio, 0 hand-reviewed
- `m09-catholic-reform-and-the-confessional-age` Catholic Reform and the Confessional Age: 6/6 written, 0 audio, 0 hand-reviewed
- `m10-enlightenment-revival-and-missions` Enlightenment, Revival and Missions: 6/6 written, 0 audio, 0 hand-reviewed
- `m11-the-church-in-the-modern-world` The Church in the Modern World: 6/6 written, 0 audio, 0 hand-reviewed
- `m12-global-christianity-today` Global Christianity Today: 6/6 written, 0 audio, 0 hand-reviewed
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
### Hand edits (216)

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

<details><summary>All hand-reviewed lessons (250), read in full by Claude on 2026-10-02; --rereview-weak skips these</summary>

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
