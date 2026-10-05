# STATUS — canonical project state

Last updated: 2026-10-06

## Current phase

**Phase: Product design / generalized architecture definition**

The repository is the canonical storage for the project.
No application implementation has started yet.
The product concept, offline-first architecture, learning-mode model, and initial Content Pack direction are now defined.

## Confirmed decisions

- First production content target: Japanese university entrance exam organic chemistry + polymers.
- Coverage starts from foundational knowledge checks and extends to difficult-university entrance-exam level.
- The application core must not be permanently hard-wired to organic chemistry.
- Future content must be able to expand into other chemistry domains and eventually other subjects through Content Packs.
- Two primary learning routes are mandatory:
  - **コース学習 (Guided Course)**: personalized/adaptive progression.
  - **自由学習 (Free Study)**: learner manually selects topics, knowledge checks, exercises, difficulty, etc.
- Free Study is tracked by default and contributes to the shared learner model.
- Free Study can be switched to an **untracked** session that does not modify mastery, weaknesses, review scheduling or Guided Course progression.
- Selection-based questions must expose an explicit **「わからない」** action.
- `unknown` is distinct from choosing a wrong distractor and should not fabricate a distractor-specific misconception.
- Personalization is not the only learning path; manual/free study remains a first-class feature.
- Explanations are required, including staged hints rather than only final answers.
- The system tracks misconception types, not just correct/incorrect results.
- Automatic review scheduling and weakness remediation are part of the product concept.
- **Offline-first is mandatory**: the complete core study loop must work without network access.
- **Smartphone-only usage is mandatory**: learning and Content Pack management must require no PC and no always-online backend.
- **Extensibility is mandatory**: curriculum, question types, algorithms, content packs, and optional services must be replaceable/expandable.
- Core learner data uses on-device storage as source of truth.
- Content data and learner/progress data are logically separated.
- Imported Content Packs are declarative data and must not require arbitrary JavaScript/native-code execution.
- New subjects that use existing capabilities can be added as content only; fundamentally new interaction types require a versioned app capability.
- Online AI, cloud sync, content download, etc. are optional layers and cannot be required for core learning.
- Initial preferred implementation stack: React Native + Expo + TypeScript + SQLite.
- Primary smartphone navigation direction: Home / コース学習 / 自由学習 / 復習 / その他.
- This GitHub repository is the project's canonical storage.

## Architecture documents

- Overall product concept: `README.md`
- Detailed product behavior: `docs/PRODUCT_SPEC.md`
- Technical architecture: `docs/ARCHITECTURE.md`
- Initial Content Pack format: `docs/CONTENT_PACK_SPEC.md`

## Current learner-model concept

Guided Course estimates the learner's knowledge state from signals such as:

- correct / incorrect / explicit unknown
- type of wrong answer
- repeated confusion between concepts
- response time
- hint usage
- retention over time
- whether a fact can be recalled alone but not applied in an integrated problem

Tracked Free Study emits compatible evidence into the same learner model.
Untracked Free Study deliberately leaves the learner model unchanged.

## Next design tasks

1. Define the complete organic chemistry + polymers curriculum graph.
2. Define the generic knowledge-skill taxonomy and prerequisite graph contract.
3. Refine Content Pack schema, stable IDs, capabilities and versioning.
4. Define question schemas and answer evaluation rules including `unknown`.
5. Define learner-model / evidence / personalization data model.
6. Define Guided Course progression logic.
7. Define Free Study navigation, filtering, tracked/untracked session UX.
8. Define explanation / staged-hint system.
9. Define SQLite schema and migrations from the domain models.
10. Decide MVP content-authoring/validation workflow.
11. Implement a small Stage 0 offline prototype and validate it with real usage.
12. After the first domain is stable, import a small second-domain pack to verify that the engine is genuinely subject-extensible.

## Open product questions worth resolving soon

- Whether third-party/user-authored Content Packs are an intended public feature or mainly a personal/developer workflow.
- Default behavior for unsigned local Content Packs.
- Exact UX wording/name for the untracked Free Study state.
- Whether Guided Course prerequisites are recommendations only or can hard-lock content.
- How much session-only result/history an untracked Free Study session should retain after exit.

## State-management rule

`STATUS.md` is the single canonical file for the current project position.
Detailed design belongs in dedicated specification files; do not create duplicate checkpoint/status documents unless the role is clearly different.
