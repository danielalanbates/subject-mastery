# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""
subjects.py - per-subject specs shared by outline.py and write_lessons.py.

`reference` is the syllabus skeleton the outline must align with (scope and order
only; we never copy text - OpenStax went CC BY-NC-SA in March 2026, see docs/SOURCES.md).
`guidance` is appended to every writing and review prompt for that subject.
"""
import os

PIPELINE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(PIPELINE)
# A checkout works on any machine. Local mirrors can target the canonical Drive
# checkout through SM_REPO without embedding a personal account path in source.
REPO_FIXED = os.path.abspath(os.path.expanduser(os.environ.get("SM_REPO", REPO)))
BUILD = os.path.abspath(os.path.expanduser(os.environ.get("SM_BUILD", "~/Downloads/subject-mastery-build")))
# Google Drive for desktop can block a read() for minutes while it syncs a file (seen 2026-10-02),
# which hangs long unattended runs. Set SM_CONTENT_DIR to a local mirror (e.g. BUILD/work/content)
# for those runs, then push the results into the repo with sync_content.py.
CONTENT = os.environ.get("SM_CONTENT_DIR") or os.path.join(REPO, "content")
LOGS = os.path.join(BUILD, "logs")

COMMON_RULES = """\
Audience: an adult beginning a serious college-level study of the field (entry-level college, rising to advanced).
Write for the ear: this text is read aloud by a text-to-speech voice. Short and medium sentences. Concrete examples.
No tables, no code blocks, no images, no lists inside the body prose, no "as shown below" or "see the figure".
Spell out symbols and abbreviations the first time ("percent", "carbon dioxide", "for example"); write numbers so they read naturally aloud.
Spell every word normally (never split a word into syllables such as "gly-co-gen"); the text is also read on screen.
Never copy or closely paraphrase any textbook or modern copyrighted book. Write every sentence fresh.
No long quotations from modern books. Short quotations only from public-domain sources, and name the source.
Be accurate. If scholars disagree, say so plainly and name the positions. Do not invent statistics, dates, names or quotations."""

SUBJECTS = {
    "economics": {
        "title": "Economics",
        "tagline": "How people, firms and nations choose under scarcity, from supply and demand to growth, money and trade.",
        "description": "A complete path through introductory and intermediate economics. It starts with scarcity, "
                       "markets and prices, moves through firms, competition and public policy, and ends with "
                       "the big questions of growth, unemployment, inflation, money and the global economy.",
        "category": "Social Sciences",
        "color": "#1f6feb",
        "reference": """\
Align scope and order with a standard two-semester principles course (the chapter order of OpenStax Principles of Economics 3e, used as a reference only):
Microeconomics: welcome to economics; choice in a world of scarcity (budget constraints, production possibilities, opportunity cost); demand and supply; labor and financial markets; elasticity; consumer choice (utility); production, costs and industry structure; perfect competition; monopoly; monopolistic competition and oligopoly; antitrust; negative externalities and environmental policy; positive externalities and public goods; labor markets and income; poverty and inequality; information, risk and insurance; financial markets; public economy (public choice).
Macroeconomics: the macro perspective (GDP); economic growth; unemployment; inflation; international trade and capital flows (balance of payments); aggregate demand and aggregate supply; the Keynesian perspective; the neoclassical perspective; money and banking; monetary policy and bank regulation; exchange rates; government budgets and fiscal policy; government borrowing; macro policy around the world; international trade (comparative advantage); globalization and protectionism.
End with a capstone module that ties the field together (schools of thought, how economists use evidence, open questions).""",
        "guidance": "Present mainstream consensus clearly. Where schools genuinely disagree about THIS lesson's topic "
                    "(Keynesian, neoclassical, monetarist, Austrian, behavioral), name them and state each fairly; do not "
                    "add a tour of the schools to lessons where they do not disagree. Use simple worked examples with round "
                    "numbers spoken in words. Avoid partisan framing.",
    },
    "biology": {
        "title": "Biology",
        "tagline": "The science of life, from molecules and cells to genes, evolution, bodies and ecosystems.",
        "description": "A full introductory biology path at college level. It builds from the chemistry of life "
                       "and the cell through genetics and evolution, the diversity of living things, how plants "
                       "and animals work, and ecology.",
        "category": "Natural Sciences",
        "color": "#2da44e",
        "reference": """\
Align scope and order with a standard majors introductory biology course (the unit order of OpenStax Biology 2e, used as a reference only):
Unit 1 chemistry of life: the study of life and the scientific method; chemical foundations (atoms, bonds, water, carbon); biological macromolecules.
Unit 2 the cell: cell structure; membranes and transport; metabolism and enzymes; cellular respiration; photosynthesis; cell communication; the cell cycle and division.
Unit 3 genetics: meiosis and sexual reproduction; Mendel and heredity; chromosomal inheritance; DNA structure and replication; genes and proteins (transcription and translation); gene expression and regulation; biotechnology and genomics.
Unit 4 evolution: evolution and the origin of species; population genetics; phylogenies and the history of life.
Unit 5 diversity: viruses; prokaryotes; protists; fungi; plants (seedless and seed); animal diversity (invertebrates, vertebrates).
Unit 6 plant structure and function: plant form and physiology; soil and plant nutrition; plant reproduction.
Unit 7 animal structure and function: the animal body and homeostasis; nutrition and digestion; nervous and sensory systems; endocrine system; musculoskeletal system; respiratory and circulatory systems; osmoregulation and excretion; the immune system; reproduction and development.
Unit 8 ecology: ecology and the biosphere; population and community ecology; ecosystems and energy flow; conservation biology and biodiversity.""",
        "guidance": "Teach mechanisms, not just vocabulary: say what happens, in what order, and why it matters. "
                    "Present evolution as the unifying framework of modern biology, as mainstream science does. "
                    "Pronounceable terms: when you introduce a technical term, say it plainly and explain it in "
                    "everyday words straight away.",
    },
    "world-history": {
        "title": "World History",
        "tagline": "The human story from the first farmers to the global present, region by region and era by era.",
        "description": "A standard global history survey, told chronologically. It runs from early humans and the "
                       "first civilizations through the classical empires, the age of faiths, the connected "
                       "medieval world, early modern empires, the age of revolutions and the modern world.",
        "category": "History",
        "color": "#bf8700",
        "reference": """\
Align with standard world-history survey periodization (the unit structure of OpenStax World History vol. 1 and 2 and the AP World History themes, used as references only):
Thinking like a historian (sources, evidence, periodization); early humans and the Neolithic revolution; first civilizations (Mesopotamia, Egypt, the Indus valley, early China, early Americas); states and empires 1000 BCE to 500 CE (Persia, Greece, Hellenistic world, Rome, Mauryan and Gupta India, Qin and Han China, Africa and the Americas); an age of religion 500 to 1200 (Christianity and Byzantium, the rise of Islam and the caliphates, Tang and Song China, medieval Europe, sub-Saharan Africa); a global middle ages 1200 to 1500 (the Mongols, Indian Ocean and Silk Road trade, the Black Death, Aztec and Inca); connections across continents 1500 to 1800 (European exploration, the Columbian exchange, the Atlantic slave trade, gunpowder empires: Ottoman, Safavid, Mughal; Ming and Qing; Reformation; scientific revolution); an age of revolution 1750 to 1914 (Enlightenment; American, French, Haitian and Latin American revolutions; the industrial revolution; nationalism; imperialism); the modern world 1914 to the present (World War One; the interwar years; World War Two; the Cold War; decolonization; globalization and the contemporary world).""",
        "guidance": "Use BCE and CE consistently for dates, written as numerals with the abbreviation (for example "
                    "490 BCE, 1453 CE or just 1453), never spelled out as 'before the Common Era'. Give dates as scholarly "
                    "consensus and say 'about' when they are approximate. Treat every region with the same seriousness; avoid a Europe-only story. Describe "
                    "atrocities and wars soberly and factually. Explain causes and consequences, not just events.",
    },
    "biblical-studies": {
        "title": "Biblical Studies & Theology",
        "tagline": "The Bible, the historic creeds and the major Christian doctrines, traditions and debates.",
        "description": "A college-level path through the Bible and Christian theology. It surveys the Old and New "
                       "Testaments, teaches how to read Scripture well, walks through the historic creeds and the "
                       "main doctrines of systematic theology, and traces church history, apologetics and ethics, "
                       "describing where Catholic, Orthodox and Protestant traditions agree and differ.",
        "category": "Theology & Religion",
        "color": "#8250df",
        "reference": """\
Align with a standard seminary-introduction sequence:
What theology is and how it works (revelation, Scripture, tradition, reason, experience); the Bible as a book (canon, manuscripts and transmission, translations); hermeneutics (genre, context, how the traditions read Scripture); Old Testament survey (Pentateuch, historical books, wisdom and poetry, the prophets); the world between the testaments; New Testament survey (the Gospels, Acts, Paul's letters, the general letters, Revelation); the historic creeds (Apostles' Creed, Nicene Creed, Chalcedonian Definition, Athanasian Creed); systematic theology loci in classic order (God and the Trinity; creation and providence; humanity and sin; the person of Christ; atonement and salvation; the Holy Spirit; the church and sacraments; last things); church history (the early church and the fathers, councils, the medieval church and the East-West schism, the Reformation and Catholic reform, modern and global Christianity); apologetics (arguments for God, the resurrection, the problem of evil); Christian ethics.""",
        "guidance": "Be faith-respectful, scholarly and charitable; never mock any tradition or unbelief. Use historic "
                    "Christian orthodoxy as summarized in the Apostles' and Nicene creeds as the baseline. Where Catholic, "
                    "Orthodox and Protestant (Lutheran, Reformed, Anglican, Methodist, Baptist, Pentecostal) traditions differ, "
                    "say whose view each statement is and describe each fairly in terms its own adherents would accept. "
                    "Describe mainstream academic views on dating and authorship fairly alongside traditional views. "
                    "Bible quotations ONLY from public-domain translations: King James Version, World English Bible, or "
                    "American Standard Version, and always name the translation and reference when quoting "
                    "(for example: John three, sixteen, in the King James Version). Keep quotations short and exact; if unsure "
                    "of exact wording, paraphrase and give the reference instead of quoting.",
    },
    # ---- second wave (2026-10-02), outlined in this priority order: mathematics, psychology, us-history,
    # chemistry, computer-science, church-history. Ids match the planned entries in content/catalog.json.
    "mathematics": {
        "title": "Mathematics",
        "tagline": "Algebra, functions and proof, building toward calculus and beyond.",
        "description": "Entry-level college mathematics made for listening, from college algebra through precalculus. "
                       "It builds number sense and algebra, then equations, functions and their graphs described in "
                       "words, polynomials, exponentials and logarithms and trigonometry, and ends with systems, "
                       "sequences, counting and probability and an introduction to proof. Every expression is spoken "
                       "in words and every worked example is walked through step by step.",
        "category": "Mathematics & Computing",
        "color": "#cf222e",
        "reference": """\
Align scope and order with a standard college algebra and precalculus sequence (the chapter order of OpenStax College Algebra 2e and Precalculus 2e, used as references only). Calculus and Statistics are separate subjects, so stop before limits.
Numbers and mathematical thinking: how mathematicians think (definitions, patterns, careful reasoning); the number systems as nested sets on the real number line, with absolute value as distance; order of operations and the properties of arithmetic (commutative, associative, distributive, identities, inverses); fractions, decimals, percents and ratios; exponents and scientific notation.
Algebraic expressions: variables and expressions; polynomials and their arithmetic (special products); factoring (common factors and grouping; trinomials and special forms); rational expressions; radicals and rational exponents.
Equations and inequalities: linear and rational equations; modeling with equations (word problems); quadratic equations (factoring, square roots, completing the square, the quadratic formula, the discriminant); radical, absolute value and quadratic-form equations; linear, compound and absolute value inequalities.
Coordinates and lines, described in words: the coordinate plane; the Pythagorean theorem, distance and midpoint; slope as a rate of change; equations of lines; parallel and perpendicular lines; linear models and direct variation.
Functions: what a function is; notation; domain and range; describing graphs in words; transformations (shifts, stretches, reflections); piecewise functions; combining and composing functions; inverse functions; average rate of change.
Polynomial and rational functions: quadratic functions and the vertex; power functions, end behavior and the multiplicity of zeros; polynomial division, the remainder and factor theorems; complex numbers (here, as in OpenStax Precalculus, because complex zeros need them); zeros of polynomials and the fundamental theorem of algebra; rational functions and asymptotes.
Exponential and logarithmic functions: exponential growth and decay; the number e and continuous growth (compound interest); logarithms; the laws of logarithms; solving exponential and logarithmic equations; models (doubling time, half-life, cooling, logistic growth).
Trigonometric functions: angles and radian measure; right-triangle trigonometry and the six functions; the unit circle; graphs of sine and cosine described in words (amplitude, period, phase shift); inverse trigonometric functions. Identities and applications: fundamental and Pythagorean identities; sum, difference and double-angle formulas; solving trigonometric equations; the laws of sines and cosines; polar coordinates and vectors in brief.
Systems and conics: systems of two linear equations (substitution, elimination); three variables with matrices and row reduction; conic sections described by their defining distances (circles and parabolas; ellipses and hyperbolas); nonlinear systems and systems of inequalities.
Sequences, series, counting and probability: sequences and summation; arithmetic and geometric sequences and series; the counting principle, permutations and combinations; the binomial theorem; basic probability.
Proof and mathematical reasoning: statements, logic and implication; direct proof; proof by contradiction (for example that the square root of two is irrational); mathematical induction; sets and functions as the language of mathematics; a closing look at where mathematics goes next (calculus, statistics, abstract mathematics).""",
        "guidance": "This subject is heard, not seen, so mathematics must work by ear. Write every symbol and expression in "
                    "words, every time: 'x squared plus three x minus ten equals zero', 'the square root of two', 'three "
                    "over four', 'f of x', 'is less than or equal to'. Never type an equals sign, plus sign, slash, caret, "
                    "inequality sign, superscript or grouping parentheses; say grouping aloud ('three times the quantity x "
                    "plus two'). Say 'negative five' for a negative number and 'minus' only for subtraction. Keep each "
                    "expression short enough to hold in memory and give intermediate results a name. Walk through every "
                    "worked example step by step in full sentences, saying what is done and why ('subtract five from both "
                    "sides, so the left side is just two x'), then say the result plainly ('So x equals four') and check "
                    "it by substituting back. Never rely on a picture: describe graphs and shapes in words (where a graph "
                    "crosses the axes, where it rises or falls, where it turns, what it approaches). Use small whole numbers "
                    "in examples. Explain why each rule works, not only how to apply it. Calculus and Statistics are "
                    "separate subjects: do not teach limits, derivatives or statistical inference here. The narrator's "
                    "voice reads a lone letter a as the word 'a' (it says 'uh'), so never use a or capital A as the name "
                    "of a number, coefficient, point, set or event; use other letters or the role ('the leading "
                    "coefficient', 'the first leg'), and when a famous formula is usually printed with a, b and c, say so "
                    "once, then work with other letters or role names. Write sine, cosine, tangent, secant, cosecant, "
                    "cotangent and natural logarithm in full, never as abbreviations. Say ratios in words ('three to "
                    "four') and never put a colon between numbers, which the voice reads as a Bible verse. Write numbers "
                    "of four or more digits that are not years with commas (1,250), because a bare 1250 is read as a year. "
                    "Say interval notation in words ('every number from two to five, including two but not five'). "
                    "Teach with mathematics, not only with everyday analogies: whenever you state a pattern, conjecture, "
                    "property or rule, show it on actual numbers and say the result aloud ('three times the quantity four "
                    "plus five is three times nine, which is twenty-seven; three times four plus three times five is twelve "
                    "plus fifteen, also twenty-seven'). Where textbooks differ on a convention (whether zero counts as a "
                    "natural number), say so in a sentence and state the convention this course uses.",
    },
    "psychology": {
        "title": "Psychology",
        "tagline": "Mind and behavior: perception, memory, learning, development and personality.",
        "description": "A complete introductory psychology path at college level. It starts with how psychologists "
                       "study mind and behavior, moves through the brain, sensation and perception, consciousness, "
                       "learning, memory, thinking and development, and ends with motivation and emotion, personality, "
                       "social psychology, and psychological disorders and their treatment. It says plainly which "
                       "findings are solid and which have failed to replicate.",
        "category": "Social Sciences",
        "color": "#bf3989",
        "reference": """\
Align scope and order with a standard introductory psychology course (the chapter order of OpenStax Psychology 2e, used as a reference only):
Introduction: what psychology is; its history (Wundt, James, structuralism and functionalism, psychoanalysis, behaviorism, humanism, the cognitive revolution); contemporary perspectives and careers.
Research methods: the scientific method in psychology; case studies, naturalistic observation, surveys and archival research; correlation versus causation; experiments (variables, random assignment, controls, blinding); basic statistics and reliability and validity; research ethics; the replication crisis and open science.
Biopsychology: genes, evolution and behavior; neurons and neural communication; the nervous system; the brain and its parts; the endocrine system.
States of consciousness: biological rhythms; sleep and its stages; dreams; sleep disorders; psychoactive drugs; hypnosis and meditation.
Sensation and perception: thresholds and signal detection; vision; hearing; the other senses (taste, smell, touch, pain, balance); perceptual organization and the gestalt principles.
Learning: classical conditioning; operant conditioning; observational learning.
Memory: how memory works (encoding, storage, retrieval); parts of the brain involved; problems with memory (forgetting, false memories, eyewitness testimony); ways to improve memory.
Thinking and intelligence: cognition, concepts and schemas; language; problem solving, heuristics and biases; what intelligence is; measuring intelligence; the sources of intelligence.
Lifespan development: methods and theories (Freud, Erikson, Piaget, Kohlberg); prenatal development; infancy and childhood; adolescence; adulthood, aging and death.
Motivation and emotion: theories of motivation; hunger and eating; sexual behavior; emotion; stress, coping and health.
Personality: Freud and the neo-Freudians; learning, humanistic and biological approaches; trait theories (the Big Five); culture and personality; personality assessment.
Social psychology: situational and dispositional influences; self-presentation; attitudes and persuasion; conformity, compliance and obedience; prejudice and discrimination; aggression; prosocial behavior and attraction.
Psychological disorders: what a disorder is and how it is diagnosed (DSM-5-TR and ICD-11); anxiety, obsessive-compulsive and trauma-related disorders; mood disorders; schizophrenia; dissociative, personality and childhood disorders.
Therapy and treatment: the history of treatment; psychotherapies (psychodynamic, humanistic, behavioral, cognitive and cognitive-behavioral); group, family and community approaches; biomedical treatments; how well treatments work.""",
        "guidance": "Teach psychology as an evidence-based science. For each claim, say what kind of evidence supports it "
                    "and how strong it is, and keep correlation and causation apart. Present the replication crisis "
                    "honestly: when a famous finding failed to replicate or has been seriously criticized (for example ego "
                    "depletion, power posing, many social priming effects, the strong form of the facial feedback idea, the "
                    "design of the Stanford prison experiment, or later reanalyses of the marshmallow test), say so plainly "
                    "and give the current view instead of presenting it as settled. Name popular myths as myths (learning "
                    "styles, using only ten percent of the brain, left-brained and right-brained people). Classic stories are "
                    "often retold wrongly; tell them as the current record has them (for example, Kitty Genovese was not "
                    "watched by thirty-eight silent witnesses, and Phineas Gage regained much of his social functioning in "
                    "later life). Present Freud and other historical theories as history and say how current psychology "
                    "regards them. The listener cannot see a diagram: place brain structures in words by where they sit (at "
                    "the back of the head, deep in the middle of the brain), and give statistics in words with small round "
                    "numbers ('a correlation of about point three, a modest link'). Speak about mental illness with respect "
                    "and person-first language, use current terms, never diagnose the listener, and keep the lessons "
                    "educational rather than clinical advice. When suicide comes up, say that help is available (in the "
                    "United States, call or text nine eight eight, written in words so the voice does not read it as nine "
                    "hundred eighty-eight); never invent other phone numbers or services. Treat sexuality "
                    "factually and without graphic detail, and leave moral and religious questions to the listener. Date "
                    "claims about fast-moving research and treatments ('as of the mid-2020s'). Do not invent statistics or "
                    "effect sizes; say 'about' for estimates.",
    },
    "us-history": {
        "title": "US History",
        "tagline": "The United States from the first peoples of North America to the present.",
        "description": "A standard two-semester United States history survey, told chronologically. It runs from the "
                       "peoples of North America before 1492 through colonization, the Revolution and the Constitution, "
                       "expansion, slavery and the Civil War, Reconstruction, industrialization, the world wars, the "
                       "Cold War and civil rights, to the present. Where historians disagree, it names the "
                       "interpretations and states each fairly.",
        "category": "History",
        "color": "#b35c1e",
        "reference": """\
Align with a standard two-semester United States history survey (the chapter order of OpenStax U.S. History and the periods of AP United States History, used as references only):
To 1877: the Americas, Europe and Africa before 1492 (Native North American societies); early globalization, Columbus and the Columbian exchange; Spanish, French and Dutch colonies; the English colonies in the seventeenth century (the Chesapeake, New England, the middle colonies) and the rise of racial slavery; colonial society in the eighteenth century (the Enlightenment, the Great Awakening, imperial wars); imperial reforms and colonial protests 1763 to 1774; the American Revolution 1775 to 1783; creating a republic (the Articles of Confederation, the Constitution, ratification and the Bill of Rights); the early republic (Federalists and Jeffersonian Republicans, the Alien and Sedition Acts, the War of 1812); the Era of Good Feelings, the Missouri Compromise and the Monroe Doctrine; the market revolution; Jacksonian democracy and Indian removal; slavery and the cotton South; religion and reform (the Second Great Awakening, abolition, women's rights); westward expansion and the Mexican-American War; the sectional crisis; the Civil War; Reconstruction.
Since 1877: the West (the Plains wars, railroads, settlement); industrialization and the Gilded Age; immigration and urbanization; politics of the Gilded Age and Populism; empire (the Spanish-American War, the Philippines); the Progressive Era; World War One; the 1920s; the Great Depression and the New Deal; World War Two (the road to war, the war in Europe and the Pacific, the Holocaust and the atomic bombs, the home front); the early Cold War (containment, the Korean War, the nuclear arms race) and postwar prosperity; the civil rights movement; the 1960s (the Great Society, Vietnam, protest movements); the 1970s (Watergate, economic troubles); the conservative turn of the 1980s and the end of the Cold War; the 1990s; September 11 and the wars that followed; the Great Recession and the twenty-first century to the present.""",
        "guidance": "Give dates as numerals (1776, the 1850s). Where historians disagree (for example on the causes of the "
                    "Revolution, the framers' motives, the causes of the Civil War, why Reconstruction ended, the effects of "
                    "the New Deal, or the origins of the Cold War), name the main interpretations and state each fairly, "
                    "as its own advocates would. Fair does not mean false balance: where the evidence has settled a "
                    "question, say so, for example that slavery was the central cause of secession, as the seceding states' "
                    "own declarations said. Describe discredited interpretations, such as the Lost Cause and the Dunning "
                    "School's account of Reconstruction, as views historians have abandoned, and say why. The listener "
                    "cannot see a map: place regions, routes and battles in words (along the Mississippi River, in what is "
                    "now Ohio). Write 'Title Nine', not 'Title IX', which the voice misreads. Treat Native nations, enslaved and free Black Americans, women, immigrants "
                    "and workers as actors in the story, alongside political, constitutional, economic and military "
                    "history. Describe slavery, removal, war and violence soberly and factually. Quote only short passages "
                    "from public-domain primary sources (founding documents, laws, court opinions, official papers and "
                    "speeches of federal officials, and works published before 1931), and name the source and year. Many "
                    "twentieth-century texts are still under copyright, for example Martin Luther King Jr.'s speeches and "
                    "letters; paraphrase those instead of quoting. For recent decades, keep to well-established facts, "
                    "describe partisan debates neutrally without taking sides, and do not characterize living politicians. "
                    "Give population and casualty figures as ranges or with 'about' when estimates differ.",
    },
    "chemistry": {
        "title": "Chemistry",
        "tagline": "Atoms, bonds, reactions and the matter that makes up everything.",
        "description": "A full general chemistry path at college level. It builds from matter, measurement and atoms "
                       "through the periodic table, bonding and stoichiometry, then gases, energy, solutions, reaction "
                       "rates, equilibrium, acids and bases, and electrochemistry, and ends with introductions to "
                       "organic and nuclear chemistry. Formulas and equations are spoken in words, and worked examples "
                       "go step by step.",
        "category": "Natural Sciences",
        "color": "#0e7c86",
        "reference": """\
Align scope and order with a standard two-semester general chemistry course (the chapter order of OpenStax Chemistry 2e, used as a reference only):
Essential ideas: chemistry in context; states and classification of matter; physical and chemical properties; measurement, uncertainty, significant figures and unit conversion.
Atoms, molecules and ions: the development of atomic theory; atomic structure, isotopes and atomic mass; chemical formulas; the periodic table; ionic and molecular compounds; naming compounds.
Composition of substances: formula mass and the mole; percent composition, empirical and molecular formulas (molarity is taught with solutions).
Stoichiometry of reactions: writing and balancing equations; precipitation and acid-base reactions with net ionic equations; oxidation-reduction reactions and oxidation numbers; reaction stoichiometry; limiting reactants and yields.
Thermochemistry: energy basics; calorimetry; enthalpy and Hess's law.
Electronic structure and periodic properties: light and electromagnetic energy; the Bohr model; quantum theory and orbitals; electron configurations; periodic trends (atomic size, ionization energy, electron affinity).
Chemical bonding and molecular geometry: ionic bonding; covalent bonding and electronegativity; Lewis structures, formal charge and resonance; bond strength; molecular shape and polarity (VSEPR); valence bond theory and hybridization; molecular orbital theory.
Gases: pressure; the gas laws and the ideal gas law; stoichiometry with gases; effusion and diffusion; kinetic-molecular theory; real gases.
Liquids, solids and solutions: intermolecular forces; properties of liquids; phase changes and phase diagrams; the structure of solids; the dissolution process; electrolytes; solubility; molarity, dilution and other concentration units; colligative properties.
Kinetics, then equilibrium in the same module: reaction rates; factors that affect rates; rate laws and integrated rate laws; collision theory and activation energy; reaction mechanisms; catalysis; dynamic equilibrium; equilibrium constants and the reaction quotient; Le Chatelier's principle.
Acids, bases and solubility: Bronsted-Lowry acids and bases; pH and pOH; relative strengths of acids and bases; hydrolysis of salts; buffers; titrations and indicators; solubility equilibria.
Thermodynamics: spontaneity; entropy; the second and third laws; Gibbs free energy and equilibrium.
Electrochemistry: balancing oxidation-reduction reactions; galvanic cells; electrode potentials and their link to free energy; batteries and fuel cells (why voltage falls as a cell runs down, without the Nernst equation); corrosion; electrolysis.
Organic chemistry: hydrocarbons; alcohols and ethers; aldehydes, ketones, carboxylic acids and esters; amines and amides; an introduction to polymers and biomolecules.
Nuclear chemistry: nuclear structure and stability; nuclear equations and radioactive decay; half-life and radiometric dating; fission, fusion and nuclear energy; uses and biological effects of radiation.""",
        "guidance": "Formulas, equations and units are spoken in words. Call a substance by its name; give its formula only "
                    "when the formula teaches something, as letters and number words (water, H two O; carbon dioxide, C O "
                    "two), then go back to the name. The narrator's voice reads two-letter element symbols as syllables "
                    "('Na' sounds like 'nah') and a lone letter a as 'uh', so spell a formula letter by letter only when "
                    "every element symbol in it is one capital letter (H two O, C O two, N H three, H two S O four); for a "
                    "formula with any two-letter symbol, name the elements and their counts instead (calcium carbonate: one "
                    "calcium, one carbon and three oxygen atoms). Name constants in words (the equilibrium constant, the "
                    "acid ionization constant, the solubility product constant), not by letter symbols. Say scientific "
                    "notation in words ('six point zero two times ten to the twenty-third'). Say ratios in words ('a two to "
                    "one mole ratio') and never put a colon between numbers, which the voice reads as a Bible verse; write "
                    "numbers of four or more digits that are not years with commas (1,250), because a bare 1250 is read as "
                    "a year. Where textbooks use different conventions (the two definitions of standard temperature and "
                    "pressure, the names of the gas laws, the electronegativity difference that counts as ionic, which "
                    "acids are listed as strong), say so plainly; present the Bohr model and the octet rule as useful "
                    "models with known limits. Never type "
                    "subscripts, superscripts, reaction arrows, plus or minus signs, charge signs or the equals sign. Read "
                    "reactions as sentences ('two molecules of hydrogen gas react with one molecule of oxygen gas to form two "
                    "molecules of water') and say charges in words ('a sodium ion with a charge of positive one'). Spell out "
                    "units (grams per mole, kilojoules, degrees Celsius, moles per liter). Walk through every worked "
                    "calculation (moles, stoichiometry, gas laws, pH) step by step in sentences with round numbers, say why "
                    "each step is taken, and state the answer plainly with its unit. Never rely on a diagram: describe "
                    "structures and molecular shapes in words, with everyday comparisons. Connect ideas to everyday life and "
                    "to the patterns of the periodic table. Never give instructions for making explosives, drugs, poisons or "
                    "other dangerous substances; stay with standard textbook chemistry.",
    },
    "computer-science": {
        "title": "Computer Science",
        "tagline": "How computers work, algorithms, data structures and the limits of computation.",
        "description": "An introduction to computer science for the ear, with no code to read. It covers computational "
                       "thinking, how computers work and represent data, algorithms and their efficiency, the core ideas "
                       "of programming and data structures, and then networks and the internet, security, databases, "
                       "software engineering, and the basics and ethics of artificial intelligence.",
        "category": "Mathematics & Computing",
        "color": "#5f6fb5",
        "reference": """\
Align with a standard introduction to computer science (the big ideas of AP Computer Science Principles and a typical first-year computing survey, used as references only):
Computational thinking: abstraction, decomposition, patterns and algorithms; a short history of computing (Babbage and Lovelace, Turing, the first electronic computers, transistors and chips, personal computers, the internet, smartphones).
Data representation (before hardware, because adders need binary): bits, binary and hexadecimal; whole numbers and overflow; fractions and floating point; text (ASCII and Unicode); images and sound; lossless and lossy compression.
How computers work: Boolean logic and logic gates; the processor; the fetch-decode-execute cycle; the memory hierarchy and storage; operating systems.
Programming concepts in plain words: variables, data types and expressions; conditionals; loops over lists; functions and parameters; objects and classes; programming paradigms; languages, compilers and interpreters.
Algorithms: what an algorithm is; searching (linear and binary search); efficiency and big O described in words; selection and insertion sort; recursion; merge sort and quicksort.
Data structures: arrays and lists; stacks and queues; hash tables; trees; graphs.
Limits of computation: tractable and intractable problems; P versus NP; heuristics and approximation; undecidable problems and the halting problem.
Networks and the internet: packets and protocols; IP addresses and routing; TCP and reliable delivery; DNS; the web (HTTP, browsers and servers); cloud computing.
Security: threats and malware; social engineering and phishing; encryption (symmetric and public-key); hashing and passwords; authentication and privacy.
Databases and data: tables and the relational model; querying data (SQL described in words); data at scale; data science basics.
Software engineering: the development life cycle; requirements and design; version control and teamwork; testing and debugging; open source and licenses.
Artificial intelligence and ethics: search and problem solving; machine learning; neural networks; large language models at a high level; bias and fairness; intellectual property, the digital divide, automation and work, and the responsibilities of builders.""",
        "guidance": "No code: never type program code, syntax, operators or symbols, because the listener cannot see them. "
                    "Explain programming ideas in plain words with everyday analogies (a recipe, a filing cabinet, a stack "
                    "of plates), and walk through what a program or algorithm does step by step in sentences ('first it sets "
                    "a counter to zero; then, for each name in the list, it adds one'). Spell out each acronym on first use "
                    "(central processing unit, or CPU). Read binary numbers digit by digit ('one, zero, one, one') and work "
                    "conversions step by step. Describe efficiency in words ('the work grows with the square of the input') "
                    "and name the big O class plainly ('big O of n squared'). Do not tie lessons to one programming "
                    "language, and be even-handed when naming languages or products. Security lessons explain how attacks "
                    "work in concept and how to defend against them, never step-by-step instructions for attacking real "
                    "systems. Describe artificial intelligence accurately, without hype or doom, and date claims about fast-"
                    "moving technology ('as of the mid-2020s'). The narrator's voice spells any all-capital word of two to "
                    "five letters letter by letter and reads a capital A inside it as 'uh'. So write the logic operations "
                    "as ordinary words (the and operation, an or gate, a not gate), never in capitals; describe database "
                    "queries in plain words and never write query keywords or values such as select, where, null or true "
                    "in capitals; and for acronyms that contain the letter A (AI, RAM, API, ASCII, RSA, AES, LAN), use the "
                    "full words instead (artificial intelligence, main memory, application programming interface). Write "
                    "binary and hexadecimal digits as words ('one, zero, one, one'), never as numerals: the voice reads "
                    "1011 as 'one thousand eleven' and 1101 as a year. Never put a colon between numbers (ratios or clock "
                    "times), which the voice reads as a Bible verse. Say 'version four of the internet protocol', not the "
                    "short form. Where a 'first' is disputed (the first computer, the first programmer, the first "
                    "compiler), say so and name the competing claims. NP means nondeterministic polynomial time, not 'not "
                    "polynomial'; P versus NP is unsolved as of the mid-2020s, and quantum computers are not known to solve "
                    "NP-complete problems quickly.",
    },
    "church-history": {
        "title": "Church History",
        "tagline": "Two thousand years of Christian history, from the apostles to the global church.",
        "description": "Two thousand years of Christian history at college level, from the apostles to the global church "
                       "of today. It covers the early church, the councils and creeds, Christianity East and West, the "
                       "medieval church, the Protestant and Catholic Reformations, missions and revivals, and modern and "
                       "global Christianity, describing Orthodox, Catholic and Protestant views fairly and naming "
                       "disagreements plainly.",
        "category": "Theology & Religion",
        "color": "#6d7f12",
        "reference": """\
Align with a standard two-semester seminary church-history survey, told chronologically and globally:
The apostolic church: the Jewish world of Jesus and the first disciples; Pentecost and the Jerusalem church; Paul and the Gentile mission; the fall of the temple in 70 CE and the parting of the ways; early worship and leadership.
The church of the martyrs (about 100 to 313): persecution under Rome; the apologists; Gnosticism and other early controversies; the rule of faith, the bishops and the formation of the New Testament canon; Irenaeus, Tertullian, Origen and Cyprian.
Constantine and the imperial church: the Great Persecution and Constantine's conversion; the Edict of Milan; the Arian controversy and the Council of Nicaea in 325; Athanasius and the Cappadocians; monasticism (Antony, Pachomius, Basil).
Councils, creeds and fathers: the Council of Constantinople in 381; Augustine, Jerome, Ambrose and John Chrysostom; Ephesus in 431 and Chalcedon in 451 and the churches that did not accept them (the Oriental Orthodox and the Church of the East); the fall of Rome in the West; Benedict and Gregory the Great.
The early medieval church, East and West: missions to Ireland, Britain and the Germanic peoples; Byzantium, iconoclasm and the Second Council of Nicaea in 787; Christians under Islam; the Church of the East in Persia, India and China; Charlemagne; Cyril and Methodius and the conversion of the Slavs and of Rus.
The high medieval church: monastic and papal reform (Cluny, Gregory the Seventh, the investiture controversy); the East-West schism of 1054; the Crusades; the friars (Franciscans and Dominicans); universities and scholasticism (Anselm, Aquinas); dissent and the Inquisition.
The late medieval church: the Avignon papacy and the Western Schism; conciliarism; Wycliffe and Hus; mysticism and lay devotion; Renaissance humanism and Erasmus; the fall of Constantinople in 1453 and the rise of Russian Orthodoxy.
The Protestant Reformations: Luther; the spread of Lutheranism (the Peasants' War, the Augsburg Confession, the Peace of Augsburg in 1555); Zwingli and the Reformed movement; Calvin and Geneva; the Anabaptists and radical reformers; the English and Scottish Reformations.
Catholic reform and the confessional age: the Council of Trent; the Jesuits and new orders; Teresa of Avila and Catholic spirituality; Catholic missions to the Americas, Africa and Asia (Las Casas, Xavier, Ricci); the wars of religion and the Peace of Westphalia; Puritans and Pietists; Orthodoxy under the Ottomans and in Russia.
Enlightenment, revival and missions (about 1650 to 1900): the Galileo affair and the Enlightenment's challenges; Wesley and Methodism; the Great Awakenings; the modern missionary movement (Carey, Hudson Taylor, African and Asian evangelists); Christianity, slavery and abolition, and the Black church; the Catholic revival after the French Revolution, the Oxford Movement and the First Vatican Council.
The church in the modern world (about 1800 to the 1960s): liberal theology and its critics; the birth of Pentecostalism (Azusa Street, 1906); the fundamentalist-modernist controversy; churches under Nazism and communism (Bonhoeffer and the Confessing Church, the Russian Orthodox Church under Soviet rule); the ecumenical movement; the civil rights movement and the church.
Global Christianity today: the Second Vatican Council; evangelicalism and the Lausanne movement; the shift of Christianity to the global South, with Africa, Latin America and Asia each taken on its own; Orthodoxy after communism; secularization in the West; the abuse crisis; persecution today.""",
        "guidance": "Keep the same stance as the Biblical Studies subject: faith-respectful, scholarly and charitable; never "
                    "mock any tradition or unbelief. Describe Orthodox, Catholic and Protestant churches, and also the "
                    "Oriental Orthodox, the Church of the East, Anabaptists and Pentecostals, in terms their own members "
                    "would accept, and say whose view each statement is. Name disagreements plainly (for example papal "
                    "primacy, the filioque, what the Reformation was and whether it was necessary, whether Constantine's "
                    "conversion helped or harmed the church, how to judge the Crusades) and state each side fairly. Tell "
                    "the church's failures soberly (violence against dissenters and Jews, the Crusades and the wars of "
                    "religion, complicity in slavery and colonialism, abuse) alongside its works of mercy, learning and "
                    "reform, without polemic or whitewash. Treat the church in Africa, Asia and Latin America as seriously "
                    "as the church in Europe and North America. Describe Judaism, Islam and other faiths accurately and "
                    "respectfully, in terms their own adherents would accept, and use the names churches use for "
                    "themselves rather than old polemical labels. The listener cannot see a map: place cities and regions "
                    "in words with their modern countries (Antioch, in what is now southern Turkey). Give dates as "
                    "numerals, add CE to years before 1000 (70 CE, 325 CE), and say 'about' when a date or number is "
                    "approximate; church membership figures are estimates, so give them with 'about'. Date claims about "
                    "the present ('as of the mid-2020s'): Pope Francis died in April 2025 and Leo the Fourteenth was "
                    "elected in May 2025. Bible quotations ONLY from the King James Version, World English Bible or American "
                    "Standard Version, naming the translation and reference. Other quotations only short and from "
                    "public-domain sources (ancient and medieval writers in old public-domain translations, the historic "
                    "creeds, Luther's Ninety-five Theses), naming the source; if unsure of exact wording, paraphrase instead "
                    "of quoting. Paraphrase, never quote, modern writings still under copyright, such as those of Barth, "
                    "Bonhoeffer and Martin Luther King Jr., the documents of the Second Vatican Council and recent popes.",
    },
    "calculus": {
        "title": "Calculus",
        "tagline": "Limits, derivatives, integrals and the mathematics of change.",
        "description": "Single-variable calculus made for listening, picking up where the Mathematics path ends. It "
                       "builds limits and continuity, then the derivative and its rules, the applications of "
                       "derivatives, the integral and the fundamental theorem of calculus, techniques and applications "
                       "of integration, differential equations, and sequences and series. Every expression is spoken in "
                       "words and every worked example is walked through step by step.",
        "category": "Mathematics & Computing",
        "color": "#a40e26",
        "reference": """\
Align scope and order with a standard two-semester single-variable calculus sequence (the chapter order of OpenStax Calculus Volumes 1 and 2, used as references only). The learner has finished college algebra and precalculus (the Mathematics subject), so review functions only briefly.
Functions and the idea of a limit: a short review of functions and their graphs described in words; the two problems calculus solves (instantaneous rate of change and area); the intuitive limit from tables of values; one-sided limits and limits that do not exist.
Limits and continuity: the limit laws; evaluating limits by algebra (factoring, rationalizing); the squeeze theorem and the limit of sine of x over x; continuity and the intermediate value theorem; limits at infinity and horizontal asymptotes; the precise epsilon-delta definition in words.
The derivative: the derivative as the limit of average rates of change; the derivative as a function; differentiability; the power, constant multiple and sum rules; the product and quotient rules; derivatives as rates of change (velocity and acceleration).
Differentiation rules: derivatives of the trigonometric functions; the chain rule; implicit differentiation; derivatives of exponential and logarithmic functions; derivatives of inverse functions and inverse trigonometric functions.
Applications of derivatives: related rates; linear approximation and differentials; maxima and minima and the extreme value theorem; the mean value theorem; what the first and second derivatives say about the shape of a graph; limits at infinity and L'Hopital's rule; optimization problems; Newton's method.
The integral: antiderivatives; area and Riemann sums; the definite integral; the fundamental theorem of calculus, both parts; integration by substitution; integrals of exponential and logarithmic functions.
Applications of integration: area between curves; volumes by slicing, disks and washers; volumes by shells; arc length; work, and the idea of mass and center of mass; exponential growth and decay revisited.
Techniques of integration: integration by parts; trigonometric integrals and trigonometric substitution; partial fractions; numerical integration (the midpoint, trapezoidal and Simpson's rules); improper integrals.
Differential equations: what a differential equation is; slope fields described in words and Euler's method; separable equations; the logistic equation; first-order linear equations.
Sequences and series: sequences and their limits; infinite series and the geometric series; the divergence and integral tests; comparison tests; alternating series; the ratio and root tests.
Power series: power series and their intervals of convergence; working with power series; Taylor and Maclaurin series; using Taylor series (approximation and error).
Parametric equations and polar coordinates in brief, and a closing look ahead: parametric curves; calculus with parametric curves; polar coordinates and polar area; where calculus goes next (multivariable calculus, linear algebra, differential equations).""",
        "guidance": "This subject is heard, not seen, so calculus must work by ear. Follow every rule of the Mathematics "
                    "subject: write every symbol and expression in words, every time ('the derivative of x cubed is three x "
                    "squared', 'the limit as x approaches two of f of x', 'the integral from zero to one of x squared, d x'). "
                    "Never type an equals sign, plus sign, slash, caret, prime mark, integral sign, inequality sign, "
                    "superscript or grouping parentheses; say grouping aloud ('the quantity x plus one, all squared'). Say "
                    "'f prime of x' for a derivative and name the variable of integration aloud. Keep each expression short "
                    "enough to hold in memory and give intermediate results a name. Walk through every worked example step "
                    "by step in full sentences, saying what is done and why, then state the result plainly and check it "
                    "(differentiate an antiderivative to check it). Never rely on a picture: describe graphs, tangent lines, "
                    "areas and solids in words. Use small whole numbers in examples. Explain why each rule works, not only "
                    "how to apply it, and give the intuition before the formal statement. The narrator's voice reads a lone "
                    "letter a as the word 'a' (it says 'uh'), so never use a or capital A as the name of a number, endpoint, "
                    "point or constant; use other letters or the role ('the left endpoint', 'the constant c'), and when a "
                    "famous formula is usually printed with a, say so once, then use other letters. Write sine, cosine, "
                    "tangent, secant, natural logarithm and so on in full, never as abbreviations. Never put a colon between "
                    "numbers, which the voice reads as a Bible verse. Write numbers of four or more digits that are not years "
                    "with commas (1,250). Say interval notation in words. Credit Newton and Leibniz both and say plainly that "
                    "their priority dispute was bitter; name the notation each introduced.",
    },
    "physics": {
        "title": "Physics",
        "tagline": "Motion, energy, waves, electricity, magnetism and the modern physics of atoms and light.",
        "description": "A full introductory physics path at college level, using algebra and trigonometry rather than "
                       "calculus. It moves from measurement and motion through forces, energy, momentum, rotation and "
                       "gravity, then fluids, heat, waves and sound, electricity, magnetism and light, and ends with "
                       "relativity, quantum ideas and nuclear physics. Equations are spoken in words, and worked examples "
                       "go step by step.",
        "category": "Natural Sciences",
        "color": "#1b4f9c",
        "reference": """\
Align scope and order with a standard two-semester algebra-based college physics course (the chapter order of OpenStax College Physics 2e, used as a reference only). The learner knows algebra and basic trigonometry; do not use calculus.
Introduction: physics as a science of models and measurement; units, the International System of Units and unit conversion; significant figures and estimation; scalars and vectors.
Motion in one dimension: position, displacement, distance; speed and velocity; acceleration; the equations of motion for constant acceleration; free fall; describing motion graphs in words.
Motion in two dimensions: vector addition and components; projectile motion; relative velocity; uniform circular motion and centripetal acceleration.
Forces and Newton's laws: force and inertia; Newton's first, second and third laws; weight, normal force, tension; friction; drag and terminal velocity in brief; problem solving with free-body reasoning described in words.
Energy and work: work; kinetic energy and the work-energy theorem; gravitational and elastic potential energy; conservative and nonconservative forces; conservation of energy; power; energy in human bodies and in society.
Momentum and collisions: momentum and impulse; conservation of momentum; elastic and inelastic collisions; collisions in two dimensions in brief; center of mass.
Rotation and gravity: angular quantities; rotational kinematics; torque; rotational inertia and angular momentum; static equilibrium; Newton's law of universal gravitation; orbits and Kepler's laws.
Fluids and heat: density and pressure; Pascal's principle and Archimedes' principle; fluid flow and Bernoulli's equation; temperature, thermal expansion and the ideal gas law; heat, specific heat and phase changes; conduction, convection and radiation; the laws of thermodynamics and heat engines; entropy.
Oscillations, waves and sound: simple harmonic motion and the pendulum; waves and their properties; superposition, interference and standing waves; sound, loudness in decibels, the Doppler effect; resonance and musical instruments.
Electricity: electric charge and Coulomb's law; electric fields; electric potential and voltage; capacitors; current, resistance and Ohm's law; electric power; series and parallel circuits; household electricity and safety.
Magnetism and electromagnetism: magnets and magnetic fields; the force on moving charges and currents; electromagnets and motors; electromagnetic induction and Faraday's law; generators and transformers; alternating current; electromagnetic waves and the spectrum.
Light and optics: the ray model; reflection and mirrors; refraction, total internal reflection and lenses; the eye and optical instruments; wave optics (interference, diffraction, polarization).
Modern physics: special relativity (time dilation, length contraction, mass-energy equivalence); the photoelectric effect and photons; the Bohr atom and atomic spectra; wave-particle duality and the uncertainty principle; the nucleus, radioactivity and half-life; fission and fusion; a closing look at particle physics and cosmology.""",
        "guidance": "Equations, quantities and units are spoken in words. State a law first as a sentence ('the net force "
                    "on an object equals its mass times its acceleration'), and only then name its usual letters if that "
                    "helps. Never type an equals sign, plus sign, slash, caret, superscript, subscript, vector arrow or "
                    "Greek letter symbol; write Greek letters as words (theta, lambda, omega). Spell out units every time "
                    "(meters per second squared, newtons, joules, watts, kilograms) and say scientific notation in words "
                    "('three times ten to the eighth meters per second'). Walk through every worked example step by step in "
                    "sentences with round numbers, saying why each step is taken, and state the answer plainly with its unit "
                    "and a sense check ('about the speed of a car on a highway'). Use g as nine point eight meters per second "
                    "squared, and say when you round it to ten. Never rely on a diagram: describe arrangements, directions "
                    "and graphs in words with everyday comparisons. Present models honestly as models with limits "
                    "(frictionless surfaces, point masses, the Bohr atom) and say where classical physics breaks down. "
                    "The narrator's voice reads a lone letter a as the word 'a' (it says 'uh'), so never use a or capital A "
                    "as the name of a quantity or point; say 'the acceleration' in full, and use other letters for points "
                    "and objects. Never put a colon between numbers, which the voice reads as a Bible verse. Write numbers "
                    "of four or more digits that are not years with commas (1,250). Abbreviated units such as m/s, kg or kWh "
                    "must be written in full words. Credit discoveries accurately and say when a 'first' is disputed. Never "
                    "give instructions for building weapons or dangerous devices; stay with standard textbook physics.",
    },
}
