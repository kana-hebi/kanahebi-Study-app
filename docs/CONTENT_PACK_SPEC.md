# Content Pack Specification — draft v0

Status: design draft
Date: 2026-10-06

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

Conceptual fields:

```json
{
  "packId": "jp.exam.chemistry.organic-polymer",
  "packVersion": "0.1.0",
  "schemaVersion": 1,
  "title": "大学受験 有機化学・高分子",
  "language": "ja-JP",
  "subject": "chemistry",
  "domain": "organic-polymer",
  "publisher": "kanahebi-study-app",
  "requiredCapabilities": [
    "question.multipleChoice.v1",
    "question.textInput.v1",
    "render.math.v1",
    "render.chemFormula.v1"
  ],
  "optionalCapabilities": [
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

Target import sources:

1. bundled first-party packs
2. downloaded/updated first-party packs
3. local file import on the smartphone
4. future third-party/user-authored packs

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

Planned trust levels:

- bundled/official
- signed/trusted external
- unsigned/local

The UI may warn before installing unsigned packs.

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
- third-party authoring workflow
- signing/key distribution model
- maximum pack/asset size policy
- whether unsigned packs are enabled by default
- pack dependency support (one pack depending on another)
- localization/multiple language variants
- authoring/validation CLI or in-app tooling

These do not block the organic/polymer MVP, but the schema should avoid making them impossible later.
