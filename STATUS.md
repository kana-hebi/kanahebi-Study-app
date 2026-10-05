# STATUS — canonical project state

Last updated: 2026-10-06

## Current phase

**Phase: Autonomous first usable release — preparation and implementation**

The repository is the canonical storage for the project.
Run start (2026-10-06 JST): remote `main` at `f97fae8` and local checkout were reconciled. The repository currently contains five design documents and no app code. No build or real-device result exists yet.

The user requests autonomous work toward a usable organic/polymer release while they sleep. Routine design, implementation and repository updates are authorized. The initial target is an Android-first standalone offline app with the approved five-tab navigation, guided/free learning, tracked/untracked sessions, unknown/hints, explanations, review and app-native pack support. Broad organic/polymer teaching coverage is the target; a first usable release is not evidence of validated difficult-university-level completeness.

Checkpoint: Expo SDK 57 / React Native / TypeScript source now implements all five destinations, tracked/untracked learning, explicit unknown and staged hints, deterministic grading, review, reference, history, native-pack import and local backup. The organic/polymer pack has 13 units, 114 nodes, 185 questions and 18 reaction relationships; a separate 3-question math pack tests subject extensibility. Type checking, Web export, pack validation and 13 core tests passed. Android SDK/build tools are installed and arm64 release compilation is in progress. UI interaction and Android-device gates remain unverified. See `docs/AUTONOMOUS_RUN.md` for acceptance gates and fallback decisions.

Repository persistence: changes are on `work/offline-first-release-20261006`. Automatic approval review rejected a push to public `main` for insufficient explicit publishing authorization. The independent work branch was created and the preparation checkpoint saved through the GitHub connector. Do not retry `main` through another mechanism. Native build and further source checkpoints belong on this branch until authorized merge.

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

## Work handoff / next run

The user approved all five recommended product choices and clarified developer-mediated pack authoring. The same conversation is now a Work run, and autonomous implementation has been requested. The previous pause-until-new-conversation instruction has been superseded.

Next Work run:
1. Read README.md, STATUS.md and all three existing detailed design specifications; inspect the actual repository tree and reconcile it with STATUS.md before claiming implementation state.
2. Update this STATUS.md at run start with the current position and concrete work plan.
3. Research curriculum coverage and practical implementation approaches using official sources and experienced practitioners; retain source provenance.
4. Design the complete organic/polymer curriculum and prerequisite graph, plus the generic knowledge/skill contract. Capture prerequisite versus recommendation relationships without hard locks.
5. Refine app-native Content Pack, question/evidence, tracked/untracked, hints, learner model and SQLite contracts; decide routine implementation details autonomously.
6. Build a small usable offline Stage 0 prototype rather than delaying first use for exhaustive content production. Validate the core loop and preserve a path to all organic/polymer content and later other subjects.
7. Run meaningful checks, record untested real-device items, save results in this repository, and update STATUS.md at run end. Do not create competing checkpoint files.

The user delegates repository/internal structure and routine choices to the assistant. Do not stop after each design step for approval; continue the authorized scope in the new Work run. Ask only for genuinely blocking information, and never claim builds, device tests or repository updates without evidence. Keep project details in this repository/project rather than adding broad personal memories.

## State-management rule

`STATUS.md` is the single canonical file for the current project position.
Detailed design belongs in dedicated specification files; do not create duplicate checkpoint/status documents unless the role is clearly different.

## Confirmed decisions — 2026-10-06 handoff

- コース学習は原則ロックなし。前提不足は推奨として提示し、本人が望めば先へ進める。
- 自由学習は記録ONが既定。OFFでは採点・解説・一時集計を利用できるが、終了後に解答履歴・習熟度・弱点・復習予定・コース進捗を残さない。ブックマークなど成績と無関係な明示操作は保存する。
- 「わからない」の後は「ヒントを見る」「答えと解説を見る」に分岐する。最初の想起失敗とヒント後の成功を別の証拠として扱い、無補助の正解に上書きしない。
- 既習範囲は3〜5問程度の理解度チェックでスキップできる。自己申告だけで習得済みにしない。通過を恒久的習得の証明とは扱わず、以後の証拠で更新する。
- 教材は開発者であるアシスタントがアプリ専用の自作Content Packへ整える。ネット上の問題・資料やユーザー提供素材を分析し、解答、詳細解説、段階ヒント、必要知識ノード、誤答分類、出典情報を付与して検証する。
- 外部の生データ・任意形式・他人製パックをアプリへ直接投入する機能は想定しない。アプリが受け取るのは開発者が用意した対応形式のパックのみ。スマホでの専用パック追加・更新と他教科への拡張は維持する。
- アプリ内のAI教材パッケージング、自動スクレイピング、公開第三者パック市場、汎用外部形式変換は現スコープ外。無料AIによる変換も今回実装しない。
- 自作への変換は出典や利用条件を消すことではない。素材の出典・利用条件・改変内容を記録し、再配布可能性を確認して教材化する。
