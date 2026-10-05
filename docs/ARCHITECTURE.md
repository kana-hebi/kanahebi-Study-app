# Architecture — kanahebi Study App

Status: initial architecture
Date: 2026-10-06

## 1. Architectural goals

The application must satisfy three product constraints from the start:

1. **Offline-capable** — core learning continues without network access.
2. **Smartphone-only capable** — the learner needs only a smartphone to use the complete study workflow.
3. **Extensible** — curriculum, question types, learning logic, content packs, and optional online services can grow without rewriting the core.

The system therefore follows a **local-first / offline-first** model.

---

## 2. Proposed client stack

Initial preferred stack:

- React Native
- Expo
- TypeScript
- SQLite via Expo SQLite

Reasons:

- one mobile-oriented TypeScript codebase
- persistent on-device relational storage
- strong fit for structured curriculum/question/progress data
- Android-first development without locking the product to Android
- native modules can be introduced later when needed
- core learning does not require a hosted backend

This is a working architectural decision, not an irreversible dependency. Interfaces between layers should make replacement possible.

---

## 3. Offline boundary

### Must work fully offline

- Story Mode
- Free Mode
- lessons/reference content
- question bank bundled or previously downloaded
- deterministic grading
- standard explanations
- staged hints
- learner state updates
- misconception tracking
- review scheduling
- reaction map
- search over installed content
- local statistics/history
- content already installed on the device

### Optional online services

These must never be required for the core study loop:

- AI-generated supplemental explanations
- cross-device sync / backup
- new content-pack download
- app/content update checks
- collaborative/social functions
- cloud analytics

Online failures must degrade gracefully to the offline feature set.

---

## 4. Data ownership

SQLite on the device is the source of truth for learner activity.

Separate two logical data domains:

### A. Content data

Mostly immutable/versioned:

- curriculum nodes
- prerequisites
- concepts
- reactions
- canonical substances
- question templates
- question instances
- explanations
- hint chains
- misconception mappings
- exam metadata

### B. Learner data

Mutable and private to the user:

- attempts
- correctness
- answer latency
- hints used
- learner-state estimates
- misconception evidence
- review schedule
- bookmarks
- Story progress
- Free Mode history
- settings

Keeping these domains separate allows content updates without destroying progress.

---

## 5. Core modules

Suggested module boundaries:

```text
src/
  app/                 navigation / screens / composition
  domain/
    curriculum/        knowledge graph and prerequisites
    questions/         question models and evaluation contracts
    learning/          learner state and mastery estimation
    review/            spaced review scheduling
    misconceptions/    misconception model
    reactions/         reaction graph
  data/
    db/                SQLite, migrations, repositories
    content/           bundled content loader / content packs
  features/
    story/
    free-study/
    review/
    reaction-map/
    exam/
    reference/
  services/
    ai/                 optional online AI adapter
    sync/               optional future sync adapter
    updates/            optional content-pack updater
```

Business logic should not call network APIs directly. Optional services are accessed through interfaces/adapters.

---

## 6. Content-pack architecture

Curriculum/problem content should not be hard-coded into screens.

A content pack should be versioned and validated before installation.

Conceptual contents:

```text
manifest
curriculum nodes
prerequisite edges
substances
reactions
questions/templates
explanations
hints
misconception rules
assets
```

The initial app ships with the organic chemistry + polymers pack.

Later possibilities:

- additional chemistry packs
- university/difficulty-focused sets
- user-selectable expansion packs
- eventually other subjects

A schema version is required so future migrations are possible.

---

## 7. Question-engine architecture

A question is not only prompt + answer.

Each type should implement a common contract approximately equivalent to:

```text
render
validate input
normalize answer
grade
generate feedback
emit evidence for learner model
```

This permits adding future formats such as:

- structure drawing
- reaction-map completion
- multi-step structure determination
- drag/drop ordering
- handwritten/visual input if later justified

without rewriting Story Mode.

---

## 8. Learner model

Story Mode should consume evidence rather than depend on particular screen implementations.

Evidence examples:

- correct / incorrect
- latency
- hint level
- distractor selected
- misconception tag
- transfer success/failure
- time since previous recall

The learner model outputs knowledge-node states and review priorities.

Free Mode also produces the same evidence, so voluntary study improves the Story Mode model rather than existing in a separate silo.

---

## 9. Chemistry-specific extension points

Organic chemistry requires capabilities beyond generic flashcards.

Plan extension points for:

- chemical formula rendering
- reaction arrows/conditions
- molecular structure rendering
- later molecular structure editing
- graph/isomorphism-based structure answer validation
- deterministic stoichiometry validation

A full molecular editor is not required for MVP. Structure selection and constrained answer formats can be used first; a dedicated editor can be added later behind the same question-engine interface.

---

## 10. Smartphone UX constraints

Primary target is portrait smartphone use.

Requirements:

- no PC-only workflow required for learning
- touch targets suitable for one-handed use where practical
- long chemical expressions horizontally manageable without destroying readability
- diagrams zoomable
- keyboard-heavy answers minimized when selection/manipulation is more appropriate
- sessions can range from quick 2–5 minute review to long exam practice
- offline state must be visible but not disruptive

---

## 11. Backup and portability

Core usage must not require an account.

Later, support at least one local export/import path for learner data so that smartphone-only usage does not imply device-lock-in.

Potential future options:

- encrypted local backup file
- optional cloud sync
- optional GitHub/Drive export for advanced users

These are post-MVP and must not contaminate the core database model.

---

## 12. MVP architecture boundary

MVP should prove the architecture with Stage 0 content rather than breadth.

MVP must include:

- local SQLite database
- bundled content pack
- curriculum node model
- Story Mode minimal adaptive progression
- Free Mode unit/concept selection
- at least several question types
- deterministic grading
- staged hints and full explanation
- attempt/evidence logging
- learner-state update
- local review scheduling
- no required network calls

Only after this loop works reliably should the content bank expand across all organic chemistry and polymers.
