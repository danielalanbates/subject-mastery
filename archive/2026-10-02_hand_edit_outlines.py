# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
#
# ARCHIVED one-off (2026-10-02): the hand review of the four LLM-generated outlines, kept as a record of
# what was changed and why (re-ordering, merges, splits, added lessons, slug clean-up). It rewrote
# content/<subject>/subject.json in place. Do NOT re-run it: the outlines have been edited since and
# lesson IDs are now fixed. The untouched LLM outlines are in
# ~/Downloads/subject-mastery-build/logs/content-outline-llm-original/ and logs/outline-raw-*.json.

# One-off hand review of the LLM outlines (2026-10-02). Kept in logs for the record.
import json, os, re, sys
C = os.path.join(os.environ.get("SM_REPO") or os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "content")
SLUG = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")

def old_index(d):
    idx = {}
    for m in d["modules"]:
        idx[m["id"]] = m
        for l in m["lessons"]:
            idx[m["id"] + "/" + l["id"]] = l
    return idx

def apply(sid, plan):
    p = os.path.join(C, sid, "subject.json")
    d = json.load(open(p))
    idx = old_index(d)
    mods = []
    for mi, (mbase, mold, mtitle, msum, lessons) in enumerate(plan, 1):
        om = idx.get(mold) if mold else None
        mid = f"m{mi:02d}-{mbase}"
        mt = mtitle or om["title"]
        ms = msum or om["summary"]
        ls = []
        for li, (lbase, lold, lt, lsum) in enumerate(lessons, 1):
            ol = idx.get(f"{mold}/{lold}") if lold else None
            if lold and ol is None:
                raise SystemExit(f"missing old lesson {mold}/{lold}")
            lid = f"l{li:02d}-{lbase}"
            assert SLUG.match(lid) and len(lid) <= 48, lid
            ls.append({"id": lid, "title": lt or ol["title"], "summary": lsum or ol["summary"]})
        assert SLUG.match(mid) and len(mid) <= 48, mid
        assert 4 <= len(ls) <= 6, (mid, len(ls))
        mods.append({"id": mid, "title": mt, "summary": ms, "lessons": ls})
    titles = [l["title"].lower() for m in mods for l in m["lessons"]]
    assert len(titles) == len(set(titles)), "duplicate lesson titles"
    d["modules"] = mods
    json.dump(d, open(p, "w"), indent=2, ensure_ascii=False)
    open(p, "a").write("\n")
    print(sid, len(mods), "modules", sum(len(m["lessons"]) for m in mods), "lessons")

# ------------------------------------------------------------------ economics
E1, E2, E3, E4, E5, E6, E7, E8, E9, E10, E11, E12 = (
    "m01-foundations-of-economic-thinking", "m02-supply-demand-and-markets", "m03-elasticity-and-consumer-choice",
    "m04-production-costs-and-market-structure", "m05-market-failures-and-government-policy",
    "m06-labor-inequality-and-public-choice", "m07-measuring-the-macroeconomy", "m08-aggregate-demand-and-perspectives",
    "m09-money-banking-and-monetary-policy", "m10-fiscal-policy-and-government-budgets",
    "m11-international-trade-and-globalization", "m12-economic-methodology-and-schools")
econ = [
    ("foundations", E1, "Foundations of Economic Thinking", None, [
        ("scarcity-and-the-economic-way-of-thinking", "l01-problem-of-scarcity", "Scarcity and the Economic Way of Thinking",
         "What economics studies, why scarcity forces every society to choose, and how economists use models, marginal thinking, and the difference between positive and normative claims."),
        ("opportunity-cost", "l02-opportunity-cost-and-decision-making", None, None),
        ("budget-constraint", "l03-budget-constraint", None, None),
        ("production-possibilities-frontier", "l04-production-possibilities-frontier", None, None),
        ("specialization-trade-and-markets", None, "Specialization, Trade and Markets",
         "Why dividing up work makes people more productive, why voluntary trade can benefit both sides, and how markets and prices coordinate millions of strangers."),
    ]),
    ("supply-and-demand", E2, "Supply, Demand and Markets", None, [
        ("law-of-demand", "l01-law-of-demand", None,
         "How price changes move us along a demand curve, and how income, tastes, related goods and expectations shift the whole curve."),
        ("law-of-supply", "l02-law-of-supply", None,
         "How price changes move producers along a supply curve, and how costs, technology and the number of sellers shift it."),
        ("market-equilibrium", "l03-market-equilibrium-and-price-discovery", "Market Equilibrium and Price Discovery",
         "How shortages and surpluses push prices toward equilibrium, and how to predict what happens to price and quantity when supply or demand shifts."),
        ("price-controls-and-surplus", "l04-price-ceilings-and-price-floors", "Price Controls, Surplus and Efficiency",
         "How consumer and producer surplus measure the gains from trade, and why price ceilings and floors create shortages, surpluses and deadweight loss."),
        ("labor-and-financial-markets", "l05-labor-and-financial-markets", None, None),
    ]),
    ("elasticity-and-consumer-choice", E3, None, None, [
        ("price-elasticity-of-demand", "l01-price-elasticity-of-demand", None, None),
        ("other-elasticities", "l02-other-types-of-elasticity", None, None),
        ("elasticity-in-the-real-world", "l05-elasticity-in-the-real-world", None,
         "How elasticity explains who really pays a tax, why farm prices swing, and how firms and governments use it to set prices and taxes."),
        ("utility-and-consumer-equilibrium", "l03-utility-and-consumer-equilibrium", None, None),
        ("behavioral-economics", "l04-behavioral-economics-and-choice", None, None),
    ]),
    ("costs-and-market-structure", E4, None, None, [
        ("costs-of-production", "l01-costs-and-industry-structure", "Costs of Production",
         "How fixed, variable, average and marginal costs behave in the short run and the long run, and what economies of scale mean for industry structure."),
        ("perfect-competition", "l02-perfect-competition", None, None),
        ("monopoly-and-market-power", "l03-monopoly-and-market-power", None, None),
        ("monopolistic-competition", "l04-monopolistic-competition", None, None),
        ("oligopoly-and-game-theory", "l05-oligopoly-and-strategic-behavior", "Oligopoly and Game Theory", None),
    ]),
    ("market-failure-and-policy", E5, None, None, [
        ("negative-externalities", "l01-negative-externalities-and-pollution", None, None),
        ("environmental-policy", "l05-environmental-policy-instruments", None, None),
        ("positive-externalities-and-public-goods", "l02-positive-externalities-and-public-goods", None, None),
        ("information-risk-and-insurance", "l03-asymmetric-information-and-insurance", "Information, Risk and Insurance", None),
        ("antitrust-and-competition-policy", "l04-antitrust-and-competition-policy", None, None),
    ]),
    ("labor-inequality-and-public-choice", E6, "Labor, Inequality and Public Choice", None, [
        ("wages-and-labor-markets", "l01-wages-and-labor-market-dynamics", None, None),
        ("poverty-and-the-safety-net", "l02-poverty-and-the-safety-net", None, None),
        ("income-inequality", "l03-income-inequality-and-redistribution", None,
         "How income and wealth inequality are measured with the Lorenz curve and Gini coefficient, what drives them, and the trade-offs of redistribution."),
        ("public-choice-theory", "l04-public-choice-theory", None, None),
        ("voting-and-government-failure", "l05-voting-and-government-failure", None, None),
    ]),
    ("measuring-the-macroeconomy", E7, None, None, [
        ("gross-domestic-product", "l01-gross-domestic-product", None, None),
        ("economic-growth", "l02-economic-growth-and-productivity", None, None),
        ("unemployment", "l03-unemployment-and-its-types", None, None),
        ("inflation", "l04-inflation-and-purchasing-power", None, None),
        ("business-cycle", "l05-business-cycle", None,
         "How economies move through expansions and recessions, how economists date and measure them, and why fluctuations matter for people's lives."),
    ]),
    ("aggregate-demand-and-supply", E8, "Aggregate Demand and Supply", None, [
        ("ad-as-model", "l01-aggregate-demand-and-aggregate-supply", "The Aggregate Demand and Supply Model", None),
        ("keynesian-perspective", "l02-keynesian-perspective", None, None),
        ("neoclassical-perspective", "l03-neoclassical-perspective", None, None),
        ("phillips-curve", "l04-phillips-curve", None, None),
        ("keynesian-and-neoclassical-synthesis", "l05-balancing-keynesian-and-neoclassical-views", None, None),
    ]),
    ("money-banking-and-monetary-policy", E9, "Money, Banking and Monetary Policy", None, [
        ("money-and-how-banks-create-it", "l01-defining-money-and-banking", "Money and How Banks Create It", None),
        ("financial-markets", None, "Financial Markets: Stocks, Bonds and Saving",
         "How saving flows to borrowers through banks, bonds and stocks, and how risk, return and interest rates are linked."),
        ("central-banks", "l02-federal-reserve-and-central-banking", "Central Banks and the Federal Reserve",
         "How central banks like the Federal Reserve are organized and why they act as the lender of last resort."),
        ("monetary-policy-tools", "l03-monetary-policy-tools", None,
         "How central banks use interest-rate targets, open market operations, reserve rules and lending facilities to steer the money supply."),
        ("monetary-policy-in-action", "l04-monetary-policy-in-action", None, None),
    ]),
    ("fiscal-policy-and-budgets", E10, None, None, [
        ("government-budgets-and-taxation", "l01-government-budgets-and-taxation", None, None),
        ("discretionary-and-automatic-fiscal-policy", "l02-discretionary-and-automatic-fiscal-policy", None, None),
        ("deficits-and-national-debt", "l03-government-borrowing-and-national-debt", None, None),
        ("crowding-out", "l04-crowding-out-and-capital-markets", None, None),
        ("policy-coordination", "l05-macroeconomic-policy-coordination", None, None),
    ]),
    ("international-economics", E11, "International Trade and Finance", None, [
        ("comparative-advantage-and-gains-from-trade", "l01-gains-from-trade", "Comparative Advantage and Gains from Trade", None),
        ("protectionism-and-tariffs", "l02-protectionism-and-tariffs", None, None),
        ("balance-of-payments", "l03-balance-of-payments", None, None),
        ("exchange-rates", None, "Exchange Rates and Capital Flows",
         "How exchange rates are set in currency markets, why they move, and how they affect trade and international capital flows."),
        ("globalization-and-its-critics", "l04-globalization-and-its-critics", None,
         "The economic benefits of globalization, the costs it can impose on some workers and communities, and the main criticisms of it."),
        ("international-financial-crises", "l05-international-financial-crises", None, None),
    ]),
    ("schools-evidence-and-open-questions", E12, "Schools, Evidence and Open Questions", None, [
        ("schools-of-economic-thought", "l01-major-schools-of-economic-thought", None,
         "How classical, Keynesian, monetarist, Austrian, new classical and new Keynesian economists differ, and where they agree."),
        ("how-economists-use-evidence", "l02-how-economists-use-evidence", None, None),
        ("institutions-and-development", None, "Institutions and Economic Development",
         "Why some nations are rich and others poor, and how property rights, the rule of law and institutions shape development."),
        ("unresolved-questions", "l04-great-unresolved-economic-questions", "Great Unresolved Questions", None),
        ("thinking-like-an-economist", "l05-economics-as-a-policy-tool", "Thinking Like an Economist",
         "How to bring the whole toolkit together to analyze a policy question or a personal decision clearly and fairly."),
    ]),
]

# ------------------------------------------------------------------ biology
B = {i: k for i, k in enumerate([
    "m01-chemical-foundations-of-life", "m02-cell-structure-and-membrane-transport", "m03-cellular-energetics-and-metabolism",
    "m04-cell-division-and-classical-genetics", "m05-molecular-genetics-and-gene-expression",
    "m06-evolutionary-mechanisms-and-population", "m07-microbial-and-fungal-diversity", "m08-plant-and-animal-diversity",
    "m09-plant-physiology-and-reproduction", "m10-animal-physiology-and-homeostasis",
    "m11-advanced-animal-systems-and-defense", "m12-ecology-and-conservation-biology"], 1)}
bio = [
    ("chemistry-of-life", B[1], None, None, [
        ("scientific-study-of-life", "l01-scientific-study-of-life", None, None),
        ("atoms-and-chemical-bonds", "l02-atomic-structure-and-chemical-bonds", None, None),
        ("water-and-carbon", "l03-water-and-the-chemistry-of-carbon", None, None),
        ("carbohydrates-and-lipids", None, "Carbohydrates and Lipids",
         "How sugars, starches, fats, phospholipids and steroids are built from smaller units and what cells use each one for."),
        ("proteins-and-nucleic-acids", None, "Proteins and Nucleic Acids",
         "How amino acids fold into working proteins and how nucleotides build DNA and RNA, the molecules that store and use genetic information."),
    ]),
    ("the-cell", B[2], "The Cell and Its Membrane", None, [
        ("prokaryotic-and-eukaryotic-cells", "l01-prokaryotic-and-eukaryotic-cells", None, None),
        ("endomembrane-system-and-organelles", "l02-endomembrane-system-and-organelles", None, None),
        ("cytoskeleton-and-cell-junctions", None, "The Cytoskeleton and Cell Junctions",
         "How protein fibers give cells their shape and movement, and how cells attach to and talk through their neighbors and the extracellular matrix."),
        ("cell-membrane-structure", "l03-structure-of-the-cell-membrane", None, None),
        ("membrane-transport", "l04-passive-and-active-membrane-transport", "Moving Materials Across Membranes",
         "How diffusion, osmosis, pumps and bulk transport move substances into and out of cells."),
        ("cell-communication", None, "Cell Communication and Signaling",
         "How cells send and receive chemical signals, and how receptors and signaling pathways turn a message into a response."),
    ]),
    ("energy-and-metabolism", B[3], None, None, [
        ("energy-atp-and-enzymes", "l01-energy-laws-and-enzyme-kinetics", "Energy, ATP and Enzymes",
         "How the laws of energy apply to living things, how ATP powers cell work, and how enzymes speed up reactions by lowering activation energy."),
        ("glycolysis-and-citric-acid-cycle", "l02-glycolysis-and-the-citric-acid-cycle", None, None),
        ("oxidative-phosphorylation", "l03-oxidative-phosphorylation-and-atp-synthesis", None, None),
        ("fermentation", "l04-anaerobic-respiration-and-fermentation", None, None),
        ("light-reactions", "l05-light-reactions-of-photosynthesis", None, None),
        ("calvin-cycle", "l06-calvin-cycle-and-carbon-fixation", None, None),
    ]),
    ("cell-division-and-heredity", B[4], "Cell Division and Heredity", None, [
        ("cell-cycle-and-mitosis", "l01-cell-cycle-and-mitosis", None, None),
        ("cell-cycle-control-and-cancer", None, "Cell Cycle Control and Cancer",
         "How checkpoints and regulatory proteins control when cells divide, and how failures of that control lead to cancer."),
        ("meiosis", "l02-meiosis-and-sexual-reproduction", None, None),
        ("mendelian-inheritance", "l03-mendelian-patterns-of-inheritance", None, None),
        ("chromosomes-and-complex-inheritance", "l04-complex-inheritance-and-chromosomal-theory", None, None),
    ]),
    ("molecular-genetics", B[5], None, None, [
        ("dna-structure-and-replication", "l01-dna-structure-and-replication", None, None),
        ("transcription-and-rna-processing", "l02-transcription-and-rna-processing", None, None),
        ("translation", "l03-translation-and-protein-synthesis", None, None),
        ("gene-regulation", "l04-regulation-of-gene-expression", None, None),
        ("biotechnology-and-genomics", "l05-biotechnology-and-genomics", None, None),
    ]),
    ("evolution", B[6], "Evolution", "Learners will understand the mechanisms of evolution, the evidence for it, and how biologists reconstruct the history of life.", [
        ("darwin-and-natural-selection", "l01-darwin-and-the-theory-of-evolution", "Darwin and Natural Selection", None),
        ("evidence-for-evolution", "l02-evidence-for-evolutionary-relationships", "Evidence for Evolution", None),
        ("population-genetics", "l03-microevolution-and-population-genetics", None, None),
        ("speciation", "l04-speciation-and-the-origin-of-species", None, None),
        ("phylogenetics-and-the-tree-of-life", "l05-phylogenetics-and-the-tree-of-life", None, None),
    ]),
    ("microbes-and-fungi", B[7], None, None, [
        ("viruses", "l01-viruses-and-subviral-agents", None, None),
        ("bacteria-and-archaea", "l02-domain-bacteria-and-domain-archaea", "Bacteria and Archaea", None),
        ("protists", "l03-protists-and-eukaryotic-origins", None, None),
        ("fungi", "l04-fungal-structure-and-ecology", None, None),
    ]),
    ("plant-and-animal-diversity", B[8], None, None, [
        ("seedless-plants", "l01-evolution-of-seedless-plants", None, None),
        ("seed-plants", "l02-evolution-of-seed-plants", None, None),
        ("invertebrates", "l03-invertebrate-diversity-and-body-plans", None, None),
        ("vertebrates", "l04-vertebrate-evolution-and-diversity", None, None),
    ]),
    ("how-plants-work", B[9], "How Plants Work", None, [
        ("plant-tissues-and-organs", "l01-plant-anatomy-and-tissue-systems", None, None),
        ("transport-in-plants", "l02-water-and-solute-transport-in-plants", None, None),
        ("plant-nutrition-and-soil", "l03-plant-nutrition-and-soil-interactions", None, None),
        ("plant-hormones-and-responses", "l04-plant-sensory-systems-and-hormones", "Plant Hormones and Responses", None),
        ("flowering-plant-reproduction", "l05-angiosperm-reproduction-and-development", "Flowering Plant Reproduction", None),
    ]),
    ("animal-body-and-control-systems", B[10], "The Animal Body and Its Control Systems", None, [
        ("homeostasis", "l01-animal-body-organization-and-homeostasis", None, None),
        ("nutrition-and-digestion", "l02-animal-nutrition-and-digestive-systems", None, None),
        ("neurons-and-nervous-system", "l03-nervous-system-and-neural-signaling", None, None),
        ("sensory-systems", "l04-sensory-systems-and-perception", None, None),
        ("endocrine-system", "l05-endocrine-system-and-hormones", None, None),
    ]),
    ("animal-organ-systems", B[11], "Animal Organ Systems and Defense", None, [
        ("muscles-and-skeleton", "l01-musculoskeletal-system-and-movement", None, None),
        ("respiratory-system", None, "The Respiratory System",
         "How lungs, gills and airways bring oxygen in and carbon dioxide out, and how blood carries both gases."),
        ("circulatory-system", "l02-respiratory-and-circulatory-systems", "The Circulatory System",
         "How the heart, blood vessels and blood work together to deliver oxygen and nutrients and carry away wastes."),
        ("osmoregulation-and-excretion", "l03-osmoregulation-and-excretory-systems", None, None),
        ("immune-system", "l04-immune-system-and-defense", None, None),
        ("reproduction-and-development", "l05-animal-reproduction-and-development", None, None),
    ]),
    ("ecology-and-conservation", B[12], None, None, [
        ("climate-biomes-and-biosphere", "l01-biospheres-and-physical-ecology", "Climate, Biomes and the Biosphere", None),
        ("population-ecology", "l02-population-ecology-and-growth-models", None, None),
        ("community-ecology", "l03-community-ecology-and-species-interactions", None, None),
        ("ecosystems-and-nutrient-cycles", "l04-ecosystem-ecology-and-nutrient-cycling", None, None),
        ("conservation-biology", "l05-conservation-biology-and-biodiversity", None, None),
    ]),
]

# ------------------------------------------------------------------ world history
W = {i: k for i, k in enumerate([
    "m01-historical-thinking-and-human-origins", "m02-first-urban-civilizations", "m03-classical-empires-of-the-west",
    "m04-classical-empires-of-the-east", "m05-rise-of-universal-religions", "m06-post-classical-states-and-networks",
    "m07-global-middle-ages", "m08-early-modern-global-convergence", "m09-intellectual-and-social-transformations",
    "m10-age-of-revolution", "m11-nationalism-and-global-imperialism", "m12-modern-and-contemporary-world"], 1)}
wh = [
    ("historical-thinking-and-human-origins", W[1], None, None, [
        ("historians-craft", "l01-historians-craft-and-evidence", None, None),
        ("human-origins-and-paleolithic-life", "l02-human-evolution-and-paleolithic-life", "Human Origins and Paleolithic Life", None),
        ("neolithic-revolution", "l03-neolithic-revolution-and-agriculture", None,
         "How the domestication of plants and animals, beginning about twelve thousand years ago in several regions, transformed human life."),
        ("first-villages-and-social-hierarchy", "l04-social-stratification-and-early-settlements", "First Villages and Social Hierarchy", None),
    ]),
    ("first-civilizations", W[2], None, None, [
        ("mesopotamia", "l01-mesopotamian-city-states-and-law", "Mesopotamian City-States and Law", None),
        ("ancient-egypt", "l02-nile-valley-and-pharaonic-power", None, None),
        ("indus-valley", "l03-urban-planning-in-the-indus-valley", "The Indus Valley Civilization", None),
        ("early-china", "l04-early-dynastic-china-and-the-yellow-river", None, None),
        ("early-americas", "l05-formative-cultures-of-the-americas", None, None),
    ]),
    ("classical-mediterranean-and-persia", W[3], "The Classical Mediterranean and Persia",
     "Learners will understand Persia, Greece and Rome, and the religious traditions that grew up in their world, from about 1000 BCE to 500 CE.", [
        ("persian-empire", "l01-persian-empire-and-imperial-administration", None, None),
        ("greece-and-the-hellenistic-world", "l02-greek-city-states-and-hellenistic-culture", "Greek City-States and the Hellenistic World", None),
        ("rise-of-rome", "l03-rise-and-governance-of-rome", None, None),
        ("judaism-and-early-christianity", None, "Judaism and the Rise of Christianity",
         "How the faith of ancient Israel developed, and how Christianity emerged from it and spread through the Roman world until it became the empire's religion."),
        ("transformation-of-the-roman-world", "l04-transformation-of-the-roman-world", None, None),
    ]),
    ("classical-asia-africa-americas", W[4], "Classical Asia, Africa and the Americas",
     "Learners will understand the great traditions of thought and the empires of India, China, Africa and Mesoamerica in the classical era.", [
        ("classical-asian-religions-and-philosophies", None, "Classical Asian Religions and Philosophies",
         "How Hinduism, Buddhism, Jainism, Confucianism and Daoism took shape and what each taught about the good life and society."),
        ("mauryan-and-gupta-india", "l01-mauryan-and-gupta-india", None, None),
        ("qin-and-han-china", "l02-qin-and-han-unification", None, None),
        ("silk-roads", "l03-silk-road-and-early-exchange", "The Silk Roads and Early Exchange", None),
        ("kush-and-aksum", "l04-kingdom-of-aksum-and-kush", "Kush and Aksum", None),
        ("maya-and-teotihuacan", "l05-maya-and-teotihuacan", None, None),
    ]),
    ("age-of-faiths", W[5], "An Age of Faiths, 500 to 1200",
     "Learners will understand how Byzantine Christianity, Islam and Buddhism spread and shaped states and cultures from about 500 to 1200 CE.", [
        ("byzantine-empire", "l01-byzantine-empire-and-orthodox-christianity", None, None),
        ("muhammad-and-early-islam", "l02-prophet-muhammad-and-early-islam", None, None),
        ("umayyad-and-abbasid-caliphates", "l03-umayyad-and-abbasid-caliphates", None, None),
        ("spread-of-buddhism", "l04-spread-of-buddhism-in-asia", None, None),
    ]),
    ("post-classical-states", W[6], "Post-Classical States and Networks", None, [
        ("tang-and-song-china", "l01-tang-and-song-golden-age", "Tang and Song China", None),
        ("japan-korea-and-southeast-asia", None, "Japan, Korea and Southeast Asia",
         "How Japan, Korea, Vietnam and the Khmer and island kingdoms adapted Chinese and Indian influences into distinct states and cultures."),
        ("feudal-europe", "l02-feudalism-and-manorialism-in-europe", "Lords, Peasants and Manors in Europe", None),
        ("medieval-church-and-crusades", None, "The Medieval Church and the Crusades",
         "How the Latin church shaped medieval European life and why the Crusades were launched, and what they changed."),
        ("ghana-and-mali", "l03-ghana-and-mali-empires", None, None),
        ("swahili-coast-and-indian-ocean", "l04-swahili-coast-and-indian-ocean", None, None),
    ]),
    ("global-middle-ages", W[7], "A Global Middle Ages, 1200 to 1500", None, [
        ("mongol-empire", "l01-rise-of-the-mongol-empire", None, None),
        ("pax-mongolica", "l02-pax-mongolica-and-cultural-exchange", None, None),
        ("black-death", "l03-black-death-and-global-consequences", None, None),
        ("renaissance-europe", None, "Renaissance Europe",
         "How Italian city-states revived classical learning, how printing spread new ideas, and how the Renaissance changed art, politics and education."),
        ("aztec-and-inca", "l04-aztec-and-inca-empires", None, None),
    ]),
    ("connections-across-continents", W[8], "Connections Across Continents, 1450 to 1750", None, [
        ("european-exploration", "l01-european-maritime-exploration-and-technology", None, None),
        ("conquest-of-the-americas", None, "Conquest and Colonial Societies in the Americas",
         "How the Spanish and Portuguese conquered the Aztec and Inca and built colonial societies, and how Indigenous peoples endured and resisted."),
        ("columbian-exchange", "l02-columbian-exchange-and-biological-shift", "The Columbian Exchange", None),
        ("atlantic-slave-trade", "l03-atlantic-slave-trade-and-plantation-economy", None, None),
        ("ottoman-and-safavid-empires", "l04-ottoman-and-safavid-empires", None, None),
        ("mughal-india-and-ming-china", "l05-mughal-empire-and-ming-china", "Mughal India and Ming China", None),
    ]),
    ("early-modern-transformations", W[9], "Early Modern Transformations", None, [
        ("reformation", "l01-protestant-reformation-and-religious", "The Reformation and Religious Conflict", None),
        ("scientific-revolution", "l02-scientific-revolution-and-new-empiricism", "The Scientific Revolution", None),
        ("absolute-monarchy", "l05-rise-of-absolute-monarchy", None, None),
        ("qing-china", "l03-qing-dynasty-and-territorial-expansion", None, None),
        ("tokugawa-japan", "l04-tokugawa-japan-and-policy-of-isolation", "Tokugawa Japan", None),
    ]),
    ("age-of-revolution", W[10], "The Age of Revolution, 1750 to 1900", None, [
        ("enlightenment", "l01-enlightenment-and-political-philosophy", None, None),
        ("american-and-french-revolutions", "l02-american-and-french-revolutions", None, None),
        ("haitian-revolution-and-abolition", "l03-haitian-revolution-and-abolitionism", "The Haitian Revolution and Abolition",
         "How enslaved people in Saint-Domingue overthrew slavery and colonial rule to found Haiti, and how the wider movement to abolish slavery unfolded."),
        ("latin-american-independence", "l04-latin-american-wars-of-independence", None, None),
        ("industrial-revolution", "l05-industrial-revolution-in-britain", None, None),
        ("industrial-society-and-new-ideologies", None, "Industrial Society and New Ideologies",
         "How industry spread beyond Britain, how workers organized, and how liberalism, socialism and other ideologies answered the industrial age."),
    ]),
    ("nationalism-and-imperialism", W[11], None, None, [
        ("nationalism-and-unification", "l01-nationalism-and-the-unification-of-states", None, None),
        ("new-imperialism", "l02-new-imperialism-and-scramble-for-africa", None, None),
        ("qing-decline-and-opium-wars", None, "Qing Decline and the Opium Wars",
         "How the Opium Wars, unequal treaties and the Taiping Rebellion weakened Qing China in the nineteenth century."),
        ("meiji-japan", "l03-meiji-restoration-and-japanese-expansion", None, None),
        ("resistance-to-colonial-rule", "l04-resistance-movements-to-colonial-rule", None, None),
    ]),
    ("modern-world", W[12], "The Modern World, 1914 to the Present", None, [
        ("world-war-one", "l01-origins-and-impact-of-world-war-one", None, None),
        ("interwar-years", "l02-interwar-crisis-and-global-depression", "Revolution, Depression and Dictators",
         "How the Russian Revolution, the Great Depression and the rise of fascist and communist dictatorships set the stage for a second world war."),
        ("world-war-two-and-the-holocaust", "l03-world-war-two-and-the-holocaust", None, None),
        ("cold-war", "l04-cold-war-and-bipolar-geopolitics", "The Cold War", None),
        ("decolonization", "l05-decolonization-and-post-colonial-challenges", "Decolonization and New Nations", None),
        ("globalization-and-the-present", "l06-globalization-and-the-digital-age", "Globalization and the Present", None),
    ]),
]

# ------------------------------------------------------------------ biblical studies
T = {i: k for i, k in enumerate([
    "m01-foundations-of-theological-inquiry", "m02-bible-as-sacred-text", "m03-torah-and-historical-books",
    "m04-hebrew-wisdom-and-prophetic-literature", "m05-gospels-and-the-life-of-jesus", "m06-apostolic-age-and-epistles",
    "m07-historic-creeds-and-councils", "m08-systematic-theology-god-and-creation",
    "m09-systematic-theology-christ-and-salvation", "m10-systematic-theology-spirit-church-and-last",
    "m11-history-of-global-christianity", "m12-apologetics-and-christian-ethics"], 1)}
theo = [
    ("foundations-of-theology", T[1], "Foundations of Theology", None, [
        ("what-theology-is", "l01-nature-and-purpose-of-theology", "What Theology Is", None),
        ("general-and-special-revelation", "l02-general-and-special-revelation", None, None),
        ("sources-of-authority", "l03-scripture-tradition-reason-and-experience", "Scripture, Tradition, Reason and Experience", None),
        ("faith-and-scholarship", "l04-faith-and-the-academic-discipline", "Faith and Scholarship", None),
        ("branches-of-theology", "l05-language-of-theological-discourse", "The Branches of Theology",
         "How biblical, historical, systematic and practical theology divide the work, and the key terms each one uses."),
    ]),
    ("the-bible", T[2], "The Bible: Canon, Text and Interpretation", None, [
        ("formation-of-the-canon", "l01-formation-of-the-biblical-canon", "Formation of the Canon",
         "How Jewish and Christian communities recognized the books of the Old and New Testaments, and why Catholic, Orthodox and Protestant Bibles differ in the deuterocanonical books."),
        ("manuscripts-and-textual-criticism", "l02-manuscript-transmission-and-textual", None, None),
        ("english-bible-translations", "l03-history-of-english-bible-translations", None,
         "How the English Bible developed from Wycliffe and Tyndale to the King James Version and modern translations, and the difference between word-for-word and thought-for-thought translation."),
        ("reading-by-genre", "l04-principles-of-literary-hermeneutics", "Reading the Bible by Genre", None),
        ("historical-and-cultural-context", "l05-historical-and-cultural-contextualization", "Historical and Cultural Context", None),
    ]),
    ("torah-and-history-of-israel", T[3], "The Torah and the Story of Israel", None, [
        ("genesis-and-beginnings", "l01-origins-and-the-pentateuchal-narrative", "Genesis: Creation and the Patriarchs", None),
        ("exodus-sinai-and-the-law", "l02-mosaic-law-and-covenantal-theology", "Exodus, Sinai and the Law", None),
        ("conquest-judges-and-kings", "l03-conquest-and-the-rise-of-monarchy", "Conquest, Judges and Kings", None),
        ("exile-and-return", "l04-exile-and-the-post-exilic-return", None, None),
        ("authorship-and-dating", "l05-traditional-and-critical-dating-perspectives", "Authorship and Dating Debates", None),
    ]),
    ("poetry-wisdom-and-prophets", T[4], "Poetry, Wisdom and the Prophets", None, [
        ("psalms", "l01-poetry-and-worship-in-the-psalms", "The Psalms and Hebrew Poetry", None),
        ("wisdom-literature", "l02-wisdom-literature-and-the-human-condition", "Job, Proverbs and Ecclesiastes", None),
        ("major-prophets", "l03-major-prophets-and-social-justice", "The Major Prophets",
         "The core messages of Isaiah, Jeremiah, Ezekiel and Daniel: judgment, repentance, exile and hope."),
        ("book-of-the-twelve", "l04-minor-prophets-and-divine-judgment", "The Book of the Twelve", None),
        ("messianic-hope", "l05-messianic-expectations-in-the-old-testament", None, None),
    ]),
    ("gospels-and-jesus", T[5], None, None, [
        ("between-the-testaments", "l01-world-between-the-testaments", None, None),
        ("synoptic-gospels", "l02-synoptic-problem-and-gospel-relations", "The Synoptic Gospels and Their Sources", None),
        ("mark-and-matthew", "l03-kingdom-of-god-in-mark-and-matthew", None, None),
        ("luke", "l04-luke-and-the-universal-gospel", "Luke's Gospel", None),
        ("john", "l05-word-made-flesh-in-john", "John: The Word Made Flesh", None),
    ]),
    ("acts-and-letters", T[6], "Acts and the Letters", None, [
        ("acts", "l01-birth-of-the-church-in-acts", None, None),
        ("paul-life-and-mission", None, "Paul: Life, Mission and Letters",
         "Who Paul was, how his missionary journeys unfolded, and how his letters to young churches such as Corinth and Thessalonica were written and read."),
        ("romans-galatians-and-justification", "l02-paul-and-the-theology-of-justification", "Romans, Galatians and Justification", None),
        ("prison-and-pastoral-letters", "l03-pastoral-and-prison-epistles", "The Prison and Pastoral Letters", None),
        ("hebrews-and-general-letters", "l04-general-epistles-and-the-early-community", "Hebrews and the General Letters",
         "The message of Hebrews and the letters of James, Peter, John and Jude, including their teaching on faith, works and endurance."),
        ("revelation", "l05-apocalyptic-hope-in-the-book-of-revelation", "The Book of Revelation", None),
    ]),
    ("creeds-and-councils", T[7], None, None, [
        ("rule-of-faith-and-early-controversies", "l05-development-of-doctrine-in-the-early-church", "The Rule of Faith and Early Controversies",
         "How the second- and third-century church summarized its faith and answered Gnosticism, Marcion and other early challenges."),
        ("apostles-creed", "l01-apostles-creed-and-early-confessions", "The Apostles' Creed", None),
        ("nicene-creed", "l02-council-of-nicaea-and-christology", "Nicaea, Constantinople and the Nicene Creed",
         "How the Arian controversy led to the councils of Nicaea in 325 and Constantinople in 381, and what the Nicene Creed confesses about the Son and the Spirit."),
        ("chalcedon", "l03-chalcedonian-definition-on-two-natures", "The Chalcedonian Definition", None),
        ("athanasian-creed", "l04-athanasian-creed-and-trinitarian-logic", "The Athanasian Creed", None),
        ("reformation-era-confessions", None, "Confessions of the Reformation Era",
         "How the Augsburg Confession, the Council of Trent, the Thirty-Nine Articles, the Heidelberg Catechism and the Westminster Confession defined the churches of the West."),
    ]),
    ("god-and-creation", T[8], "God, Creation and Humanity", None, [
        ("attributes-of-god", "l01-attributes-and-nature-of-god", None, None),
        ("trinity", "l02-trinity-in-unity-and-distinction", "The Trinity", None),
        ("creation-and-providence", "l03-creation-providence-and-the-problem-of-evil", "Creation and Providence",
         "What the doctrines of creation out of nothing and of God's ongoing providence teach, and how the traditions understand God's governance of the world."),
        ("image-of-god", "l04-image-of-god-and-human-nature", None, None),
        ("fall-and-sin", "l05-fall-and-the-doctrine-of-sin", None, None),
    ]),
    ("christ-and-salvation", T[9], "Christ and Salvation", None, [
        ("person-of-christ", "l01-person-and-deity-of-jesus-christ", "The Person of Christ", None),
        ("atonement", "l02-theories-of-atonement-and-reconciliation", "Models of the Atonement", None),
        ("grace-election-and-free-will", "l03-grace-faith-and-the-process-of-salvation", "Grace, Election and Free Will",
         "How Augustine and Pelagius, Calvinists and Arminians, and Catholic and Orthodox theologians relate God's grace to human freedom."),
        ("justification-across-traditions", "l04-catholic-and-protestant-views", "Justification Across the Traditions",
         "How Catholic, Orthodox, Lutheran, Reformed and Wesleyan traditions describe how a person is made right with God, including the Orthodox idea of theosis."),
        ("sanctification", None, "Sanctification and the Christian Life",
         "How the traditions understand growth in holiness, the role of the Spirit and spiritual disciplines, and the hope of Christian maturity."),
    ]),
    ("spirit-church-and-last-things", T[10], "The Spirit, the Church and Last Things", None, [
        ("holy-spirit", "l01-person-and-work-of-the-holy-spirit", None, None),
        ("the-church", "l02-nature-and-mission-of-the-church", None, None),
        ("sacraments-and-ordinances", "l03-sacraments-and-ordinances-in-diverse", None, None),
        ("death-and-intermediate-state", "l04-christian-hope-and-the-intermediate-state", "Death and the Intermediate State", None),
        ("return-of-christ-and-millennium", "l05-eschatology-and-the-return-of-christ", "The Return of Christ and the Millennium",
         "The major interpretations of the end times, including premillennial, amillennial and postmillennial views."),
        ("resurrection-judgment-new-creation", None, "Resurrection, Judgment and New Creation",
         "What the creeds mean by the resurrection of the body, the final judgment and the life of the world to come."),
    ]),
    ("church-history", T[11], "Church History", None, [
        ("early-church-and-monasticism", "l01-early-church-and-desert-fathers", "The Early Church and Monasticism", None),
        ("medieval-church-and-scholasticism", None, "The Medieval Church and Scholasticism",
         "How Augustine, Gregory the Great, the monasteries and the scholastics such as Anselm and Thomas Aquinas shaped medieval Christianity."),
        ("east-west-schism", "l02-great-schism-of-east-and-west", None, None),
        ("reformation-and-catholic-reform", "l03-reformation-and-the-catholic-counter", "The Reformation and Catholic Reform", None),
        ("enlightenment-and-modern-theology", "l04-enlightenment-and-modern-theological-shifts", None, None),
        ("global-christianity-today", "l05-rise-of-global-and-pentecostal-christianity", "Global Christianity Today",
         "How Christianity's center of gravity moved to the Global South, the rise of Pentecostalism, and the major traditions as they stand today."),
    ]),
    ("apologetics-and-ethics", T[12], None, None, [
        ("arguments-for-god", "l01-classical-arguments-for-the-existence-of-god", None, None),
        ("problem-of-evil", None, "The Problem of Evil",
         "The logical and evidential problems of evil and suffering, and the main Christian responses, from free will to soul-making to the cross."),
        ("resurrection-and-history", "l02-historical-evidences-for-the-resurrection", "The Resurrection and History",
         "How historians and apologists weigh the evidence about Jesus' death, the empty tomb and the resurrection appearances, and how skeptics respond."),
        ("biblical-ethics", "l03-biblical-foundations-for-moral-decision", "Biblical Foundations of Ethics", None),
        ("virtue-ethics", "l04-virtue-ethics-and-the-christian-life", None, None),
        ("contemporary-ethical-issues", "l05-engaging-contemporary-social-and-ethical", "Christian Ethics in Today's World", None),
    ]),
]

apply("economics", econ)
apply("biology", bio)
apply("world-history", wh)
apply("biblical-studies", theo)
