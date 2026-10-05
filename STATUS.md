# STATUS — canonical project state

Last updated: 2026-10-05

## Current phase

**Phase: Product design / initial repository setup**

The repository has just been initialized as the canonical storage for the project.
No application implementation has started yet.

## Confirmed decisions

- Target: Japanese university entrance exam organic chemistry + polymers.
- Coverage starts from foundational knowledge checks and extends to difficult-university entrance-exam level.
- Two primary learning modes are mandatory:
  - **Story Mode**: personalized/adaptive progression.
  - **Free Mode**: learner manually selects topics, knowledge checks, exercises, difficulty, etc.
- Personalization is not the only learning path; manual/free study must remain a first-class feature.
- Explanations are required, including staged hints rather than only final answers.
- The system should track misconception types, not just correct/incorrect results.
- Automatic review scheduling and weakness remediation are part of the product concept.
- Organic chemistry and polymers are both in scope.
- This GitHub repository is the project's canonical storage.

## Current product concept

Story Mode should estimate the learner's knowledge state from signals such as:

- correct / incorrect
- type of wrong answer
- repeated confusion between concepts
- response time
- hint usage
- retention over time
- whether a fact can be recalled alone but not applied in an integrated problem

Free Mode should allow direct access to:

- topic / unit selection
- knowledge checks
- practice by problem type
- difficulty selection
- reaction maps
- weak-point review
- exam-style sets

## Next design tasks

1. Define the complete curriculum graph for organic chemistry and polymers.
2. Define the knowledge-skill taxonomy and prerequisite graph.
3. Define question schemas and answer evaluation rules.
4. Define learner-model / personalization data model.
5. Define Story Mode progression logic.
6. Define Free Mode navigation and filtering.
7. Define explanation / staged-hint system.
8. Define initial MVP boundary and technical architecture.
9. Implement a small Stage 0 prototype and validate it with real usage.

## State-management rule

`STATUS.md` is the single canonical file for the current project position.
Detailed design belongs in dedicated specification files; do not create duplicate checkpoint/status documents unless the role is clearly different.
