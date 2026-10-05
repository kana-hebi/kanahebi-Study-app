# STATUS — canonical project state

Last updated: 2026-10-06 JST / 2026-10-05 UTC

## Current phase

**First Android distribution v0.1.0 built; automated checks passed; real-device acceptance remains open.**

GitHub is the canonical project storage. Implementation and documents belong to `work/offline-first-release-20261006`. At run start, `main` at `f97fae8` contained five design documents and no app code. This autonomous run produced the app, original content, validation tools and a standalone Android APK.

This is a first usable distribution with broad introductory organic/polymer coverage. It is not a completed difficult-university preparation curriculum, a peer-reviewed chemistry textbook, or a device-tested production release. No background execution after the conversation ends is promised.

## Implemented

- React Native 0.86.3 / Expo SDK 57 / TypeScript; Android learner storage uses SQLite. The core design requires no account or backend.
- Home / Course / Free Study / Review / Other; guided recommendations and prerequisite advice without access locks.
- Unit/knowledge/format/difficulty/count filtering; Free recording defaults ON and is fixed at session start. OFF attempts never access persistence.
- Choice/text/numeric grading; unknown, staged hints, explanations and initial-recall preservation after help.
- Local review, reference search, reaction relationships, bookmarks, unit progress and recent attempts.
- Developer-authored native JSON pack import/update and explicit local backup export/restore, validated before atomic replacement.
- Organic/polymer pack: 13 units, 114 nodes, 185 original questions (114 choice, 57 text, 14 numeric), 18 reactions, stages 0–7.
- Separate math pack: one node, three linear-equation numeric questions; same app engine.
- Standalone arm64 APK: `kanahebi-study-0.1.0-arm64.apk`, package `lab.kanahebi.study`, version 0.1.0/code 1, min SDK 24, target SDK 36. Release configuration with a test certificate; not a store production signature.
- Final Android manifest: allowBackup=false, no INTERNET/overlay/vibration/generic external-storage permissions, Expo updates disabled. File selection/share uses platform document mechanisms.

## Verified evidence

| Check | Result and scope |
|---|---|
| TypeScript | `npm run typecheck` passed |
| Content | `npm run validate:content` passed schema, capabilities, unique IDs, references, acyclic prerequisites, exercise coverage, hints and explanations |
| Core behavior | `npm test`: 14 passed; Node SQLite executes actual SQL, restart, OFF zero writes, unknown preservation, atomic updates/restore, subject separation and independent chemistry calculations |
| Browser export | `npm run export:web` passed |
| Phone-width interactions | 8 passed at 412×892; no page errors; OFF storage, assisted unknown, reload, preloaded offline learning, reaction toggle, math import and backup roundtrip |
| Android build | Final Gradle BUILD SUCCESSFUL, 299 tasks; native components and embedded JS compiled |
| APK inspection | Signature v2, ZIP integrity, ABI/SDK/manifest, SQLite library, embedded bundle, all 114 node and 185 question IDs verified |
| Source correspondence | App, engine, native repository, native I/O and organic pack in build sourcemap match current source |
| Native device execution | **Not performed**: install, offline cold start, Expo SQLite reopen, keyboard/Back, native picker/share and reboot remain unchecked |

Evidence and limits: [docs/RELEASE_VALIDATION.md](docs/RELEASE_VALIDATION.md), [artifacts/web-qa.json](artifacts/web-qa.json), [artifacts/android-apk-validation.json](artifacts/android-apk-validation.json). Browser storage is not native SQLite; compilation is not device execution.

## Confirmed decisions

- First target: university-entrance organic chemistry + polymers, from foundations toward advanced reasoning. Keep the engine subject-independent.
- Course and Free are equal primary routes. No hard locks; missing prerequisites generate advice.
- Free defaults ON. OFF leaves no history, mastery, weakness, review or course changes; explicit bookmarks may persist.
- Unknown is separate from distractor errors. Preserve first recall after hints; infer no distractor-specific misconception from unknown.
- Prior learning uses approximately 3–5 questions. Self-report/short checks do not permanently certify an entire unit as mastered.
- Offline core on a smartphone; content and learner data separate. Online AI/sync are optional future layers.
- The assistant authors dedicated native packs with answers, explanations, hints, knowledge mapping, misconceptions and provenance. No direct arbitrary PDF/web import, runtime AI packaging or pack code execution.
- README describes the project; STATUS alone records its current position. Details: PRODUCT_SPEC, ARCHITECTURE, CONTENT_PACK_SPEC and LEARNING_ENGINE.

## Concrete remaining work

1. On Pixel 9a, install the APK and enable airplane mode before first launch. Test ON/OFF sessions, force-close/reopen, reboot, keyboard, Android Back, JSON picker and backup share/restore. Record failures before claiming device acceptance.
2. Independently review chemistry. Increase distinct question density per node and add substantially more worked structure determination, synthesis and quantitative integration. Topic coverage does not establish advanced-exam sufficiency.
3. Evaluate the provisional learning model with real usage. Scores are not calibrated probabilities; response time is collected but not penalized. Some nodes cannot reach mastery with the current distinct-question count.
4. Implement controlled ID retirement/migration before removing nodes in pack updates. Rich molecular/math rendering, archive assets, cloud sync and iOS distribution remain future work.
5. Merge the reviewable branch only after explicit authorization; do not retry the rejected main action through another route.

## Approval boundary and next run

Automatic approval review rejected an attempted push to public default `main`, stating insufficient explicit publishing authorization. Accepted independent-branch checkpoints preserve the work; this rejection has not been bypassed.

Read README, STATUS and AGENTS first. Reproduce with Node 24, Java 17, SDK/Build Tools 36, NDK 27.1.12297006 and CMake 3.22.1. Run `npm ci`, `npm run typecheck`, `npm run validate:content`, `npm test`, `npm run export:web`, then with ANDROID_HOME set, `npm run build:android` and `python scripts/inspect-apk.py`.

`scripts/qa-web.cjs` uses Playwright from the primary runtime or a local install; STUDY_CHROME_PATH can select a browser. The host-only Japanese font is not an app dependency. Build-cache/proxy repairs are recorded in RELEASE_VALIDATION and are not app services.

Routine internal implementation and verification remain delegated. Keep project state in this repository, without competing status files or broad personal memories. Never claim a build, remote checkpoint, device test or completed curriculum without evidence.
