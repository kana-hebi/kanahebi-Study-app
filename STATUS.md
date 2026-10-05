# STATUS — canonical project state

Last updated: 2026-10-06

## Current phase

**Phase: Product design / architecture definition**

The repository is the canonical storage for the project.
No application implementation has started yet.
The product concept and initial offline-first architecture are now defined.

## Confirmed decisions

- Target: Japanese university entrance exam organic chemistry + polymers.
- Coverage starts from foundational knowledge checks and extends to difficult-university entrance-exam level.
- Two primary learning modes are mandatory:
  - **Story Mode**: personalized/adaptive progression.
  - **Free Mode**: learner manually selects topics, knowledge checks, exercises, difficulty, etc.
- Personalization is not the only learning path; manual/free study remains a first-class feature.
- Story Mode and Free Mode share one learner model: Free Mode attempts also update mastery/weakness evidence.
- Explanations are required, including staged hints rather than only final answers.
- The system tracks misconception types, not just correct/incorrect results.
- Automatic review scheduling and weakness remediation are part of the product concept.
- Organic chemistry and polymers are both in scope.
- **Offline-first is mandatory**: the complete core study loop must work without network access.
- **Smartphone-only usage is mandatory**: learning must require no PC and no always-online backend.
- **Extensibility is mandatory**: curriculum, question types, algorithms, content packs, and optional services must be replaceable/expandable.
- Core learner data uses on-device storage as source of truth.
- Content data and learner/progress data are logically separated.
- Online AI, cloud sync, content download, etc. are optional layers and cannot be required for core learning.
- Initial preferred implementation stack: React Native + Expo + TypeScript + SQLite.
- This GitHub repository is the project's canonical storage.

## Architecture documents

- Overall product concept: `README.md`
- Detailed product behavior: `docs/PRODUCT_SPEC.md`
- Initial technical architecture: `docs/ARCHITECTURE.md`

## Current product concept

Story Mode estimates the learner's knowledge state from signals such as:

- correct / incorrect
- type of wrong answer
- repeated confusion between concepts
- response time
- hint usage
- retention over time
- whether a fact can be recalled alone but not applied in an integrated problem

Free Mode allows direct access to:

- topic / unit selection
- knowledge checks
- practice by problem type
- difficulty selection
- reaction maps
- weak-point review
- exam-style sets

Both modes write compatible evidence into the same learner model.

## Next design tasks

1. Define the complete curriculum graph for organic chemistry and polymers.
2. Define the knowledge-skill taxonomy and prerequisite graph.
3. Define the content-pack schema and stable IDs/versioning.
4. Define question schemas and answer evaluation rules.
5. Define learner-model / personalization data model.
6. Define Story Mode progression logic.
7. Define Free Mode navigation and filtering.
8. Define explanation / staged-hint system.
9. Define SQLite schema and migrations from the domain models.
10. Implement a small Stage 0 offline prototype and validate it with real usage.

## State-management rule

`STATUS.md` is the single canonical file for the current project position.
Detailed design belongs in dedicated specification files; do not create duplicate checkpoint/status documents unless the role is clearly different.
