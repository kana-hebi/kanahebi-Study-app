# Product Specification — kanahebi Study App

Status: initial design
Date: 2026-10-05

## 1. Product goal

Build a study application that covers Japanese university entrance exam organic chemistry and polymers from foundational knowledge through difficult-university entrance-exam level.

The app must support both:

- guided, personalized learning; and
- unrestricted manual study.

The product should behave more like a tutor + structured course + problem bank than a static quiz app.

---

## 2. Primary learning modes

### 2.1 Story Mode

Adaptive/personalized progression.

The app estimates the learner's current knowledge state and chooses what should be learned or reviewed next.

Core loop:

1. diagnostic check
2. short lesson / concept review
3. basic exercise
4. application exercise
5. exam-style problem
6. review scheduling
7. weakness remediation

The learner model should distinguish different kinds of failure. A wrong answer is not treated as a single generic failure.

Example:

- can count carbon valence correctly
- can identify secondary carbon
- confuses ethanol / butanol naming
- confuses ether / ketone / aldehyde categories

The system should record these separately and generate targeted follow-up practice.

### 2.2 Free Mode

Manual/self-directed learning.

The learner can choose from lists and filters without waiting for the adaptive course to select content.

Required entry points:

- unit / chapter
- concept / knowledge item
- reaction type
- problem type
- difficulty
- weakness list
- reaction map
- exam-style set
- knowledge check

Free Mode is a first-class mode, not a debug/secondary interface.

---

## 3. Curriculum scope

### Stage 0 — foundations for reading organic chemistry

- typical valence of C/H/O/N
- single/double/triple bonds
- molecular formula
- structural formula
- condensed structural formula
- carbon skeleton
- functional groups
- primary/secondary/tertiary carbon
- isomers
- carbon-number naming
- methyl/ethyl and related substituent basics

### Stage 1 — hydrocarbons

- alkanes
- alkenes
- alkynes
- cycloalkanes
- structural isomers
- geometric isomers where relevant
- substitution
- addition
- combustion
- bromine reactions
- acetylene

### Stage 2 — alcohols and ethers

- classification of alcohols
- methanol / ethanol and homologs
- oxidation
- dehydration
- reaction with sodium
- ethers
- intermolecular dehydration
- intramolecular dehydration

Key reaction relationships include:

- primary alcohol -> aldehyde -> carboxylic acid
- secondary alcohol -> ketone

### Stage 3 — carbonyl compounds, carboxylic acids, esters

- aldehydes
- ketones
- silver mirror reaction
- Fehling reaction
- iodoform reaction
- carboxylic acids
- esters
- esterification
- hydrolysis
- saponification

### Stage 4 — aromatic compounds

- benzene
- toluene
- xylene
- phenol
- benzoic acid
- nitrobenzene
- aniline
- salicylic acid
- acetylsalicylic acid
- methyl salicylate
- diazotization
- azo coupling
- aromatic substitution
- multi-step aromatic synthesis

### Stage 5 — natural organic compounds

- fats/oils
- higher fatty acids
- soap
- glucose
- fructose
- sucrose
- maltose
- starch
- cellulose
- amino acids
- peptides
- proteins

### Stage 6 — polymers

- addition polymerization
- condensation polymerization
- copolymerization
- polyethylene
- polypropylene
- PVC
- polystyrene
- PET
- nylon
- phenolic resin
- urea resin
- synthetic rubber
- ion-exchange resin
- other curriculum-relevant polymers
- polymer -> monomer reconstruction
- monomer -> polymer construction

### Stage 7 — integrated entrance-exam skills

- elemental analysis
- molecular-formula determination
- structure determination
- isomer enumeration
- synthetic routes
- organic stoichiometry
- experiment interpretation
- integrated organic/polymer problems

---

## 4. Knowledge model

The app should not represent ability with only one score.

Use a multidimensional skill model, for example:

- structural-formula reading
- naming
- functional-group recognition
- aliphatic reactions
- aromatic reactions
- structure determination
- synthetic routes
- calculations
- natural polymers
- synthetic polymers

Internally, track smaller knowledge/skill nodes.

Example states:

- mastered
- stable
- learning
- unstable
- confusion
- unseen

Potential evidence inputs:

- correctness
- answer latency
- hint level used
- repeated misconception
- confidence, if explicitly collected
- time since last successful recall
- transfer from isolated question to integrated problem

---

## 5. Misconception tracking

The system should identify *what kind* of error occurred.

Examples:

- carbon count error
- naming-chain-length error
- functional-group confusion
- ether vs ketone confusion
- aldehyde vs ketone confusion
- oxidation direction confusion
- reagent/condition confusion
- reactant/product reversal
- correct fact but failed application

This misconception graph should influence both Story Mode and recommended review in Free Mode.

---

## 6. Question types

Initial supported types should include:

- true/false
- multiple choice
- name input
- formula input
- structural-formula recognition
- functional-group identification
- reagent selection
- product prediction
- reactant prediction
- isomer enumeration
- reaction pathway completion
- structure determination
- stoichiometric calculation
- polymer/monomer conversion
- experimental interpretation
- integrated exam-style problem

Long-term target:

- learner constructs/draws a structure as the answer
- graph-based validation of chemical structures

---

## 7. Explanation system

Do not expose the full answer immediately unless requested.

Suggested staged help:

### Hint 1
Attention guidance only.

Example: "Look at what atoms the oxygen is bonded to."

### Hint 2
Concept reminder.

Example: "An oxygen single-bonded between two carbon groups is characteristic of an ether."

### Hint 3
Near-solution hint.

Example: "CH3-O-CH3 belongs to the ether class, not the ketone class."

### Full explanation

Explain:

- correct answer
- reasoning
- why likely distractors are wrong
- related concept distinction
- reaction/structure relation where relevant

Hint usage should affect mastery estimation.

---

## 8. Review / personalization

Use spaced review, but operate on chemistry knowledge/skill nodes rather than only flashcards.

A learner may know a substance name but fail the reaction connection between two substances. These should be separate competencies.

Examples:

- nitrobenzene identity: stable
- aniline identity: stable
- nitrobenzene -> aniline reduction link: unstable

Review scheduling should take this distinction into account.

---

## 9. Reaction Map

Provide a visual network of important conversions.

Examples:

- ethanol -> acetaldehyde -> acetic acid
- ethanol -> ethylene
- acetic acid + ethanol -> ethyl acetate
- benzene -> nitrobenzene -> aniline -> diazonium salt

The map should be usable both as:

- reference material; and
- an interactive exercise surface.

Possible interactions:

- hide product
- hide reagent
- hide reaction type
- start from target and reconstruct route backward

---

## 10. Exam-derived / modified problems

The app may use real entrance-exam problems as analysis material where legally appropriate, but the default generated practice bank should avoid simple copying.

Preferred process:

1. analyze the original problem
2. extract tested concepts
3. extract reasoning structure
4. extract information-release pattern
5. extract difficulty factors and traps
6. generate a new problem using a validated template
7. validate uniqueness, consistency, and solvability

For public distribution, copyright/licensing requirements must be checked before reproducing actual past questions.

---

## 11. Content generation policy

Do not rely on unconstrained AI generation for chemistry questions.

Preferred architecture:

- human/validated canonical concepts and reaction data
- validated problem templates
- constrained parameter variation
- deterministic chemistry checks where possible
- AI for explanation, misconception interpretation, and variation drafting
- automated + human validation before promotion to trusted question bank

The system must guard against:

- impossible structures
- ambiguous multiple answers
- missing reaction conditions
- inconsistent numerical values
- incorrect stoichiometry
- reactions outside the intended curriculum without explanation

---

## 12. Proposed navigation

Primary navigation candidates:

- Home
- Story
- Free Study
- Reaction Map
- Weaknesses / Review
- Exam
- Reference

Home should surface at minimum:

- today's review workload
- current Story Mode position
- current/new unit
- weak concepts
- progress summary

---

## 13. Initial technical direction

Current provisional direction:

- TypeScript-based application
- mobile-first web UI
- offline-capable architecture
- later Android packaging / APK distribution if useful
- separation of app code, curriculum, question data, reactions, explanations, and learner progress

Exact framework and storage design are not yet fixed.

---

## 14. MVP principle

Do not build thousands of questions first.

Recommended build order:

1. complete curriculum / prerequisite design
2. knowledge-skill graph
3. question schema
4. learner-state schema
5. Story Mode logic
6. Free Mode UI/filters
7. explanation/hint engine
8. Stage 0 content set
9. real-user validation
10. revise adaptive logic
11. expand across all organic chemistry and polymers

---

## 15. Current confirmed UX principle

The application should feel like two complementary game modes:

- **Story Mode**: the system guides the learner through the best next path.
- **Free Mode**: the learner can freely select and practice any unlocked/available content from an organized list.

Neither mode replaces the other.
