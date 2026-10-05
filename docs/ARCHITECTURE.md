# Architecture — kanahebi Study App

Status: initial architecture
Date: 2026-10-06

## 1. Architectural goals

The application must satisfy four product constraints from the start:

1. **Offline-capable** — core learning continues without network access.
2. **Smartphone-only capable** — the learner needs only a smartphone to use the complete study workflow.
3. **Extensible** — curriculum, question types, learning logic, content packs, and optional online services can grow without rewriting the core.
4. **Subject-independent core** — organic chemistry + polymers is the first content domain, while the application engine remains capable of hosting other chemistry domains and later other subjects.

The system therefore follows a **local-first / offline-first** model with a declarative **Content Pack + Capability** architecture.

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

SQLite is the first-choice local source of truth. Expo's SQLite support persists databases across app restarts and fits the local-first requirement. The data layer should still be abstracted enough that implementation details can evolve later.

---

## 3. Offline boundary

### Must work fully offline

- Guided Course / コース学習
- Free Study / 自由学習
- tracked and untracked Free Study sessions
- lessons/reference content
- question bank bundled or previously installed
- deterministic grading
- explicit "I don't know" handling
- standard explanations
- staged hints
- learner state updates for tracked sessions
- misconception tracking for tracked sessions
- review scheduling
- installed domain-specific views such as Reaction Map
- search over installed content
- local statistics/history
- Content Packs already installed on the device

### Optional online services

These must never be required for the core study loop:

- AI-generated supplemental explanations
- cross-device sync / backup
- Content Pack download/update
- app/content update checks
- collaborative/social functions
- cloud analytics

Online failures must degrade gracefully to the offline feature set.

---

## 4. Data ownership

SQLite on the device is the source of truth for learner activity.

Separate two logical data domains:

### A. Content data

Mostly immutable/versioned and supplied by Content Packs:

- pack manifests
- curriculum nodes
- prerequisites
- concepts/skills
- domain entities/relations
- question templates
- question instances
- explanations
- hint chains
- misconception mappings
- exam metadata
- assets/index metadata

### B. Learner data

Mutable and private to the user:

- attempts/evidence
- correctness / explicit unknown
- answer latency
- hints used
- learner-state estimates
- misconception evidence
- review schedule
- bookmarks
- Guided Course progress
- tracked Free Study history
- settings

Untracked Free Study may keep ephemeral session statistics but must not mutate personalization state.

Keeping content and learner domains separate allows content updates/imports without destroying progress.

---

## 5. Core modules

Suggested module boundaries:

```text
src/
  app/                 navigation / screens / composition
  domain/
    curriculum/        generic knowledge graph and prerequisites
    questions/         common question models and evaluation contracts
    learning/          learner state and mastery estimation
    review/            spaced review scheduling
    misconceptions/    misconception model
    sessions/          tracked/untracked learning session policy
    capabilities/      supported renderer/input/view capabilities
  data/
    db/                SQLite, migrations, repositories
    content/           bundled/imported Content Pack loader
  features/
    guided-course/
    free-study/
    review/
    exam/
    reference/
    content-packs/
  extensions/
    chemistry/          chemistry-specific rendering/validation/view adapters
  services/
    ai/                 optional online AI adapter
    sync/               optional future sync adapter
    updates/            optional content-pack updater
```

Business logic must not call network APIs directly. Optional services are accessed through interfaces/adapters.

---

## 6. Content Pack architecture

Curriculum/problem content must not be hard-coded into screens.

A Content Pack is versioned, declarative data validated before activation.

Conceptual contents:

```text
manifest
curriculum nodes
prerequisite edges
lessons/reference
questions/templates
answers/grading metadata
explanations
hints
misconception rules
domain entities/relations
assets
search/index metadata
```

The initial app ships with the organic chemistry + polymers pack.

Later possibilities:

- inorganic chemistry
- theoretical/physical chemistry
- full high-school chemistry
- university/difficulty-focused sets
- mathematics
- other exam subjects
- developer-authored packs prepared from reviewed source materials

Content Pack details are defined in `docs/CONTENT_PACK_SPEC.md`.

---

## 7. Capability architecture

The app core exposes versioned capabilities rather than allowing imported packs to execute arbitrary code.

Examples:

```text
question.multipleChoice.v1
question.textInput.v1
question.numericInput.v1
render.math.v1
render.image.v1
render.chemFormula.v1
view.reactionMap.v1
```

A pack declares required and optional capabilities in its manifest.

This creates two extension paths:

1. **Content-only extension** — a new subject/domain uses already-supported capabilities and can be imported without changing app code.
2. **Engine extension** — a future subject needs a new interaction/renderer (for example graph plotting or proof-step editing); the app adds the capability once, after which packs can use it declaratively.

Imported packs do not execute arbitrary JavaScript/native code.

---

## 8. Question-engine architecture

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

The common outcome model includes at least:

- correct
- incorrect
- unknown / "I don't know"
- invalid/unsubmitted where relevant

`unknown` is not a normal incorrect distractor. In tracked sessions it emits recall/knowledge-failure evidence without attributing a distractor-specific misconception.

This contract permits adding future formats without rewriting Guided Course or Free Study.

---

## 9. Learner model

Guided Course consumes learning evidence rather than depending on particular screen implementations.

Evidence examples:

- correct / incorrect / explicit unknown
- latency
- hint level
- distractor selected
- misconception tag
- transfer success/failure
- time since previous recall

The learner model outputs knowledge-node states and review priorities.

Tracked Free Study produces compatible evidence, so voluntary study improves the Guided Course model.

Untracked Free Study does not emit learner-model mutations. It may still calculate answers, explanations and ephemeral session statistics.

---

## 10. Chemistry-specific extension points

Organic chemistry requires capabilities beyond generic flashcards.

Plan extension points for:

- chemical formula rendering
- reaction arrows/conditions
- molecular structure rendering
- later molecular structure editing
- graph/isomorphism-based structure answer validation
- deterministic stoichiometry validation
- Reaction Map view

A full molecular editor is not required for MVP. Structure selection and constrained answer formats can be used first; a dedicated editor can be added later behind the same capability/question-engine interfaces.

---

## 11. Smartphone UX constraints

Primary target is portrait smartphone use.

Requirements:

- no PC-only workflow required for learning
- touch targets suitable for one-handed use where practical
- long mathematical/chemical expressions horizontally manageable without destroying readability
- diagrams zoomable
- keyboard-heavy answers minimized when selection/manipulation is more appropriate
- selection questions expose a visible "わからない" action
- sessions can range from quick 2–5 minute review to long exam practice
- offline state must be visible but not disruptive
- Content Pack import/management must be possible from the smartphone

Primary navigation target:

```text
Home | コース学習 | 自由学習 | 復習 | その他
```

Secondary features such as exam sets, reference, progress and Content Pack management are reached through the relevant screens/Other.

---

## 12. Backup and portability

Core usage must not require an account.

Later, support at least one local export/import path for learner data so that smartphone-only usage does not imply device-lock-in.

Potential future options:

- encrypted local backup file
- optional cloud sync
- optional Drive/GitHub export for advanced users

These are post-MVP and must not contaminate the core database model.

---

## 13. Import safety and transactions

Content Pack import should be transactional.

Before activation, validate:

- schema version
- required capabilities
- manifest and stable IDs
- referential integrity
- asset paths
- deterministic question consistency where available
- migration compatibility
- trust/signature metadata where present

A failed import must leave the previously installed state intact.

---

## 14. MVP architecture boundary

MVP should prove the generic architecture with Stage 0 organic chemistry content rather than breadth.

MVP must include:

- local SQLite database
- bundled organic/polymer Content Pack subset
- generic curriculum node model
- minimal Guided Course adaptive progression
- Free Study unit/concept selection
- tracked/untracked Free Study policy
- several common question types
- explicit "わからない" support for selection questions
- deterministic grading
- staged hints and full explanation
- attempt/evidence logging
- learner-state update for tracked sessions
- local review scheduling
- no required network calls

Only after this loop works reliably should the content bank expand across all organic chemistry and polymers.

After the organic/polymer architecture is stable, a small second-domain pack should be imported as an architectural test to prove that the core is not accidentally chemistry-hardcoded.

## Confirmed decisions — 2026-10-06 handoff

- コース学習は原則ロックなし。前提不足は推奨として提示し、本人が望めば先へ進める。
- 自由学習は記録ONが既定。OFFでは採点・解説・一時集計を利用できるが、終了後に解答履歴・習熟度・弱点・復習予定・コース進捗を残さない。ブックマークなど成績と無関係な明示操作は保存する。
- 「わからない」の後は「ヒントを見る」「答えと解説を見る」に分岐する。最初の想起失敗とヒント後の成功を別の証拠として扱い、無補助の正解に上書きしない。
- 既習範囲は3〜5問程度の理解度チェックでスキップできる。自己申告だけで習得済みにしない。通過を恒久的習得の証明とは扱わず、以後の証拠で更新する。
- 教材は開発者であるアシスタントがアプリ専用の自作Content Packへ整える。ネット上の問題・資料やユーザー提供素材を分析し、解答、詳細解説、段階ヒント、必要知識ノード、誤答分類、出典情報を付与して検証する。
- 外部の生データ・任意形式・他人製パックをアプリへ直接投入する機能は想定しない。アプリが受け取るのは開発者が用意した対応形式のパックのみ。スマホでの専用パック追加・更新と他教科への拡張は維持する。
- アプリ内のAI教材パッケージング、自動スクレイピング、公開第三者パック市場、汎用外部形式変換は現スコープ外。無料AIによる変換も今回実装しない。
- 自作への変換は出典や利用条件を消すことではない。素材の出典・利用条件・改変内容を記録し、再配布可能性を確認して教材化する。

