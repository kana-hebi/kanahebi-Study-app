# Content Pack Specification — v1 implementation and future design

Status: schema v1 implemented; archive and advanced capabilities remain design proposals
Date: 2026-10-06

## Implemented format

The current importer accepts a single UTF-8 JSON file containing `manifest`, `units`, `nodes`, `questions`, `reactions` and `sources`. The runtime contract is `src/domain/models.ts`, enforced by `src/domain/pack.ts`; see `content/math-check.study-pack.json` for a complete minimal example. The conceptual multi-file archive below is a future option, not the current import format.

Required manifest fields are `packId`, `packVersion`, `schemaVersion: 1`, `title`, `subject`, `publisher`, `language`, `description` and `requiredCapabilities`. Unit, node, question and reaction IDs begin with `packId + '.'`. References and an acyclic prerequisite graph are mandatory. Every question needs at least two hints, an explanation and a valid source ID. Limits and update rules are described in [LEARNING_ENGINE.md](LEARNING_ENGINE.md).

Currently supported capabilities are `question.multipleChoice.v1`, `question.textInput.v1`, `question.numericInput.v1`, `render.chemFormula.v1`, `view.reactionMap.v1`, `render.lessonBlocks.v1` and `render.vectorDiagram.v1`. Chemical formulas use Unicode/condensed text and original bounded vector drawings. KaTeX, arbitrary image/HTML/SVG imports, archive assets, optional-capability fallback, pack dependencies and ID migration are not implemented. Unknown required capabilities are rejected. Existing node deletion is rejected until a migration feature exists.

### Rich lessons and diagrams in app v0.2.0

Schema remains v1: legacy packs containing only `lesson.core`, `example`, `caution` still work. New optional fields are:

| Location | Field | Contract |
|---|---|---|
| `node.lesson` | `goals` | 1–8 nonempty learning-goal strings |
| `node.lesson` | `blocks` | 1–40 paragraph, table, worked-example or diagram blocks; declares `render.lessonBlocks.v1` |
| `node.lesson` | `sourceIds` | Nonempty, unique, existing source IDs |
| `node.lesson` | `relatedNodeIds` | Up to 8 existing other knowledge IDs |
| `question` | `diagramId`, `sourceIds`, `explanationBlocks` | Validated diagram/source/block references; explanations are displayed after answering or revealing |
| `pack` | `diagrams` | Up to 500 drawings, namespaced unique IDs; declares `render.vectorDiagram.v1` |

Paragraphs contain `heading`, `body`. Tables have a heading, 2–5 column strings and 1–30 rectangular rows. Worked examples contain `heading`, `prompt`, 1–12 `steps`, `answer`, and an optional `diagramId`; the solution opens by explicit learner action. A diagram block contains its `diagramId`.

A drawing contains `id`, `title`, `description`, `width`, `height`, `elements`, `sourceIds`. Width is 240–1200, height 80–1600, and there are 1–200 elements. Allowed elements are text, line, polyline, rect and ellipse. Coordinates are finite and bounded by the drawing; color is one of the six app palette tokens. Text is at most 100 characters, with 12–32 font size and explicit alignment. A polyline contains 2–100 points. Raw SVG paths, scripts, HTML, external assets and evaluated expressions are unsupported. The renderer receives explicit primitives; it never evaluates pack content. The app includes SVG native components and all data, so drawings need no network request.

Text inside tables and worked examples participates in local lesson search. The Free Study “詳しい教材” scope uses the nodes with lesson blocks across existing units; it does not change the pack's subject or curriculum hierarchy. Drawings have a local enlarged modal with vertical/horizontal scrolling.

App v0.1.0 cannot render these two new required capabilities. Upgrade the app before importing the enriched v0.2.0 pack; a required capability is never silently omitted. Existing 114 knowledge IDs and 185 grading contracts remain stable, and pack replacement preserves prior attempts/bookmarks/settings.

## 1. Purpose

Content Packs separate subject matter from the application engine.

The first production pack is Japanese university entrance exam organic chemistry + polymers. The same packaging model must later support additional chemistry domains and other subjects without rewriting the learning engine.

A Content Pack is declarative data. Installing a pack must not execute arbitrary JavaScript or native code.

---

## 2. Package responsibilities

A pack may contain:

- subject/domain metadata
- curriculum hierarchy
- knowledge/skill nodes
- prerequisite edges
- lessons/reference material
- questions and validated templates
- answers/grading metadata
- hints and explanations
- misconception tags/rules
- difficulty/exam metadata
- domain entities/relations
- assets
- search metadata
- optional domain-view data when supported by an app capability

A pack must not contain executable application logic.

---

## 3. Initial package layout

Conceptual archive layout:

```text
pack-root/
  manifest.json
  curriculum/
    nodes.json
    prerequisites.json
  lessons/
  questions/
  explanations/
  misconceptions/
  domain/
  assets/
  indexes/
```

The physical format can be a ZIP-based package later; the logical schema matters first.

---

## 4. Manifest draft

Example of the currently implemented manifest (additional capabilities below are future examples):

```json
{
  "packId": "jp.exam.chemistry.organic-polymer",
  "packVersion": "0.1.0",
  "schemaVersion": 1,
  "title": "大学受験 有機化学・高分子",
  "language": "ja-JP",
  "subject": "chemistry",
  "publisher": "kanahebi-study-app",
  "description": "有機・高分子の導入と基本演習",
  "requiredCapabilities": [
    "question.multipleChoice.v1",
    "question.textInput.v1",
    "question.numericInput.v1",
    "render.chemFormula.v1",
    "view.reactionMap.v1"
  ]
}
```

IDs must be stable across content revisions so learner history can survive pack updates.

---

## 5. Stable IDs and versioning

Separate identifiers from display names.

Examples:

```text
node: chem.organic.functional-group.ether.identify
skill: chem.organic.naming.carbon-chain-length
misconception: chem.organic.confusion.ether-vs-ketone
question: jp.exam.organic.stage0.q000123
```

Rules:

- IDs are immutable after public/useful release.
- Display names and wording may change without changing IDs.
- Deleted nodes should be retired/tombstoned rather than silently reused.
- Pack updates must declare migration/alias information when semantic identities change.
- Learner data references stable IDs, not display labels.

---

## 6. Capability model

The application exposes versioned capabilities.

Generic examples:

- `question.trueFalse.v1`
- `question.multipleChoice.v1`
- `question.textInput.v1`
- `question.numericInput.v1`
- `question.ordering.v1`
- `render.math.v1`
- `render.image.v1`
- `render.table.v1`

Chemistry-specific examples:

- `render.chemFormula.v1`
- `render.reaction.v1`
- `question.structureSelect.v1`
- `view.reactionMap.v1`

Future examples:

- `question.graphPlot.v1`
- `question.proofSteps.v1`
- `question.audioResponse.v1`

A pack may be installed only when mandatory capabilities are supported. Optional capabilities may degrade to a simpler supported representation when the pack defines a fallback.

---

## 7. Import model

Target sources: bundled or subsequently delivered developer-authored app-native packs. Source websites, PDFs, arbitrary external datasets and third-party packs are not directly imported into the app. The assistant performs source analysis and conversion during development, then validates and delivers the resulting native pack. No in-app AI packaging is planned.

The core study workflow must not require online installation after a pack is present on the device.

Import should validate before activation:

- manifest/schema compatibility
- required capabilities
- unique/stable IDs
- referential integrity
- asset paths
- question answer consistency where deterministic validation exists
- package size/limits
- content trust/signature metadata when available

Import is transactional: a failed validation must not leave a half-installed pack.

---

## 8. Trust model

Because packs are declarative and cannot run arbitrary code, an untrusted pack has a smaller attack surface.

All currently supported packs are developer-prepared. Public third-party trust levels, unsigned external-pack admission and signing infrastructure are deferred rather than MVP requirements. Schema, path, capability and content validation remain mandatory even for developer-created packs.

Trust status does not automatically imply educational correctness. A separate validation/review status should exist for question quality.

---

## 9. Learner-data separation

Content Packs never own learner progress.

Learner data stores references to content IDs plus evidence/events. Pack replacement or update should therefore preserve progress when IDs retain the same semantics.

Imported packs must not overwrite another learner's scheduling/history. This follows the same broad principle used by mature study systems that keep shared content distinct from personal scheduling state.

---

## 10. Tracked vs untracked study

Whether an attempt updates personalization is controlled by the learning session, not by the Content Pack.

Tracked sessions emit learner evidence.

Untracked Free Study sessions may grade/show explanations and temporary statistics, but they do not mutate:

- mastery estimates
- misconception evidence
- weakness state
- review schedule
- Guided Course progression

---

## 11. "I don't know" semantics

The common question engine supports an explicit `unknown` outcome.

For selection questions this is surfaced as a visible **「わからない」** action.

In tracked sessions:

- it is evidence of failed recall/insufficient knowledge;
- it is not a distractor choice;
- no distractor-specific misconception is inferred;
- review/explanation priority can increase.

This semantic is generic and available to all subjects.

---

## 12. Open design questions

- final archive extension/name
- maximum pack/asset size policy
- pack dependency support (one pack depending on another)
- localization/multiple language variants
- developer-side authoring/validation tooling (no in-app AI packaging)

These do not block the organic/polymer MVP, but the schema should avoid making them impossible later.

## Confirmed decisions — 2026-10-06 handoff

- コース学習は原則ロックなし。前提不足は推奨として提示し、本人が望めば先へ進める。
- 自由学習は記録ONが既定。OFFでは採点・解説・一時集計を利用できるが、終了後に解答履歴・習熟度・弱点・復習予定・コース進捗を残さない。ブックマークなど成績と無関係な明示操作は保存する。
- 「わからない」の後は「ヒントを見る」「答えと解説を見る」に分岐する。最初の想起失敗とヒント後の成功を別の証拠として扱い、無補助の正解に上書きしない。
- 既習範囲は3〜5問程度の理解度チェックでスキップできる。自己申告だけで習得済みにしない。通過を恒久的習得の証明とは扱わず、以後の証拠で更新する。
- 教材は開発者であるアシスタントがアプリ専用の自作Content Packへ整える。ネット上の問題・資料やユーザー提供素材を分析し、解答、詳細解説、段階ヒント、必要知識ノード、誤答分類、出典情報を付与して検証する。
- 外部の生データ・任意形式・他人製パックをアプリへ直接投入する機能は想定しない。アプリが受け取るのは開発者が用意した対応形式のパックのみ。スマホでの専用パック追加・更新と他教科への拡張は維持する。
- アプリ内のAI教材パッケージング、自動スクレイピング、公開第三者パック市場、汎用外部形式変換は現スコープ外。無料AIによる変換も今回実装しない。
- 自作への変換は出典や利用条件を消すことではない。素材の出典・利用条件・改変内容を記録し、再配布可能性を確認して教材化する。
