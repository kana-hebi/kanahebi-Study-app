# Product Specification — kanahebi Study App

Status: initial design
Date: 2026-10-06

## 1. Product goal

Build a local-first study application that starts with Japanese university entrance exam organic chemistry and polymers, from foundational knowledge through difficult-university entrance-exam level, while remaining extensible to other chemistry domains and eventually other subjects through importable Content Packs.

The app must support both:

- guided, personalized learning; and
- unrestricted manual study.

The product should behave more like a tutor + structured course + problem bank than a static quiz app.

The application core must not be hard-wired to organic chemistry. Organic chemistry + polymers is the first production-quality content domain, not the permanent architectural boundary.

---

## 2. Primary learning modes

### 2.1 コース学習 (Guided Course)

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

### 2.2 自由学習 (Free Study)

Manual/self-directed learning.

The learner can choose from lists and filters without waiting for the guided course to select content.

Required entry points:

- unit / chapter
- concept / knowledge item
- reaction or domain-specific relationship type
- problem type
- difficulty
- weakness list
- domain-specific maps/views
- exam-style set
- knowledge check

Free Study is a first-class mode, not a debug/secondary interface.

#### Default: tracked free study

By default, Free Study attempts emit the same learner-model evidence as Guided Course attempts. Correctness, misconception evidence, hints, latency, retention and related signals can therefore improve mastery estimates and review scheduling.

#### Optional: untracked free study

The learner can disable personalization impact for a Free Study session.

In this state:

- questions, hints, grading and explanations work normally;
- the session can show temporary/session results;
- mastery estimates are not changed;
- weakness state is not changed;
- review scheduling is not changed;
- Guided Course progression is not changed.

This mode exists for experimentation, checking a future topic, repeating known material casually, trying imported content, or any situation where the learner does not want the activity to influence personalization.

---

## 3. Initial curriculum scope: organic chemistry + polymers

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

## 4. Multi-subject direction

The application core must support installing additional subject/domain Content Packs later.

Examples:

- inorganic chemistry
- theoretical/physical chemistry
- complete high-school chemistry
- mathematics
- other exam subjects

A Content Pack may define curriculum nodes, prerequisites, lessons, questions, explanations, hints, misconception tags, assets and metadata using capabilities already supported by the app.

Content Packs are declarative data packages. They must not require arbitrary code execution.

If a future subject requires a fundamentally new interaction type (for example, a graph editor, proof-step editor, specialized molecular drawing canvas, audio pronunciation capture), the app core can add that as a versioned capability. Content Packs can then declare that capability as a requirement.

---

## 5. Knowledge model

The app should not represent ability with only one score.

Use a multidimensional skill model. The dimensions are content-pack-defined but use a common engine.

Organic chemistry examples:

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
- explicit "I don't know"
- answer latency
- hint level used
- repeated misconception
- confidence, if explicitly collected
- time since last successful recall
- transfer from isolated question to integrated problem

---

## 6. Misconception tracking

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

Misconception tags influence Guided Course decisions and recommended review in tracked Free Study.

An explicit "I don't know" is different from choosing a wrong distractor. It indicates failed recall/insufficient knowledge without inventing a misconception that was not demonstrated.

---

## 7. Question types and answer UX

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

### "わからない" action

Selection-based questions must provide an explicit **「わからない」** action.

It should not be hidden among distractors. It is an answer-state action with separate semantics:

- do not treat it as a guessed wrong choice;
- record retrieval/knowledge failure when tracking is enabled;
- do not assign a distractor-specific misconception;
- increase the priority of explanation/review appropriately;
- allow the learner to continue without forced guessing.

Where useful, non-selection questions may also expose the same action.

Long-term target:

- learner constructs/draws a structure as the answer
- graph-based validation of chemical structures
- additional subject-specific answer capabilities

---

## 8. Explanation system

Do not expose the full answer immediately unless requested or the interaction requires it.

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

Hint usage should affect mastery estimation only when the session is tracked.

---

## 9. Review / personalization

Use spaced review, but operate on knowledge/skill nodes rather than only flashcards.

A learner may know a substance name but fail the reaction connection between two substances. These should be separate competencies.

Examples:

- nitrobenzene identity: stable
- aniline identity: stable
- nitrobenzene -> aniline reduction link: unstable

Review scheduling should take this distinction into account.

All tracked learning surfaces emit compatible evidence. Untracked Free Study deliberately does not alter the learner model.

---

## 10. Domain-specific maps and views

The app can expose optional domain-specific learning surfaces while preserving a generic core.

For organic chemistry, the first such surface is a Reaction Map.

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

Future subjects can define other views when the app supports the required capability.

---

## 11. Exam-derived / modified problems

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

## 12. Content generation policy

Do not rely on unconstrained AI generation for trusted questions.

Preferred architecture:

- human/validated canonical concepts and domain facts
- validated problem templates
- constrained parameter variation
- deterministic checks where possible
- AI for explanation, misconception interpretation, variation drafting and authoring assistance
- automated + human validation before promotion to trusted question bank

The system must guard against domain-specific invalid content such as:

- impossible structures
- ambiguous multiple answers
- missing reaction conditions
- inconsistent numerical values
- incorrect stoichiometry

---

## 13. Proposed navigation

Primary smartphone navigation:

- Home
- コース学習
- 自由学習
- 復習
- その他

Secondary destinations include:

- domain-specific map/view (Reaction Map for organic chemistry)
- exam / integrated sets
- reference
- progress/history
- Content Pack management
- settings

Home should surface at minimum:

- today's review workload
- current Guided Course position
- current/new unit
- weak concepts
- progress summary

---

## 14. Initial technical direction

Current preferred direction:

- React Native + Expo
- TypeScript
- SQLite
- offline/local-first architecture
- versioned, declarative Content Packs
- capability-based question/rendering engine
- separation of app code, content, learner progress and optional online services

---

## 15. MVP principle

Do not build thousands of questions first.

Recommended build order:

1. complete organic/polymer curriculum / prerequisite design
2. define generic knowledge-skill graph contract
3. define Content Pack schema and capability model
4. define question schema and answer evaluation rules
5. define learner-state/evidence schema
6. define Guided Course progression logic
7. define Free Study navigation, filters and tracked/untracked behavior
8. define explanation/hint engine
9. implement Stage 0 content set
10. real-user validation
11. revise adaptive logic
12. expand across all organic chemistry and polymers
13. validate the generic architecture by importing a second small subject/domain pack

---

## 16. Current confirmed UX principle

The application has two complementary learning routes:

- **コース学習 (Guided Course)**: the system recommends and connects the best next learning/review actions.
- **自由学習 (Free Study)**: the learner freely selects available content. Personalization impact is on by default and can be disabled per session.

Neither route replaces the other.
