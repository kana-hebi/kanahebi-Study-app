# STATUS — canonical project state

Last updated: 2026-10-06 UTC

## Current phase

**Polymer v0.2.0 is implemented, verified and integrated. Verified trial APK and installation ZIP are available.**

The shallow polymer instruction has been expanded to 40 deep lessons, 40 worked examples, 180 new original exercises and 44 vector diagrams (29 instructional / 15 neutral exercise variants). The deep scope contains 232 questions across natural and synthetic polymers, proteins, fibers and integrated applications. The complete pack contains 13 units / 123 nodes / 365 questions / 27 reactions. All prior 114 node IDs and 185 answer contracts remain stable.

## Implemented

- Learning goals, detailed explanation, comparison tables, hidden-solution worked examples, source notes, related lessons and full lesson search.
- Offline vector diagrams with expanded views, question diagrams that omit answer labels, and rich feedback.
- Home links to polymer reading and cross-unit exercise selection; 40-topic scope resets safely on pack switch and backup restore.
- Original instructional progression from structures to properties, reaction/recovery, finite-chain and substitution calculations, and mixed problems.
- Generic declarative pack capabilities preserve other subjects and older plain packs.
- Free recording defaults ON; OFF leaves no learner writes. Explicit unknown remains first-recall evidence after assistance.

## Verification

Typecheck and content validation, 20 core tests (including all 56 new numeric answers independently calculated and legacy SQLite/browser upgrade preservation), deterministic regeneration, Web export, 13 phone-width operation scenarios, 44 diagrams / 265 text elements without clipping, full native build and final incremental build all passed in the work environment. Final observed summaries were recovered after an executor disconnect; stored PNGs are the preceding review snapshots.

GitHub build `37394795361` uses source `b6a6b62dc222ce7940e7bedadb623afa750bcd48` and independently runs typecheck, content validation, 20 tests, generation consistency, Android build and APK/ZIP inspection. It completed successfully on 2026-10-06T00:42:57Z: 340 executed native tasks, all checks passed. The verified distribution APK is 30,423,238 bytes, SHA-256 `41e425317975ed5f5e844ba436604d9f60d58fc8c759c7dcb10d6ac6563bf090`; ZIP is 15,886,438 bytes, SHA-256 `5f6dabe2e943f2e0035470303fa6fec165c7d6f7ad60e9fa96aaabfbbb2a5f74`.

The disconnected environment's APK was inspected at 2026-10-06T00:13:43Z: 30,423,238 bytes, SHA-256 `010c9c3c0c4c42a87c45cefe3b55e0af1b339aabd8ed8db8ceeae083376a7131`. Its direct artifact save was not confirmed. That hash must not be assigned to a separate GitHub build.

## Integration and distribution

GitHub `main` is canonical. [PR #2](https://github.com/kana-hebi/kanahebi-Study-app/pull/2) integrates this revision; merged with expected head `b6a6b62`; merge SHA: `edea1cfba2892225b280da18d331b3cce737ff1a`. The verified APK and installation ZIP are available in [the v0.2.0 trial release](https://github.com/kana-hebi/kanahebi-Study-app/releases/tag/v0.2.0). Release preservation run `37395666240` succeeded and the public asset SHA-256/size exactly match the inspected build. The temporary Actions artifact is not the only copy.

The build workflow uses standard Ubuntu and pinned official actions. Repository release preservation verifies the successful run ID/head SHA, APK/ZIP bytes, signature identity and embedded content before upload. No signing secret or learner data is committed.

Downloads: [APK](https://github.com/kana-hebi/kanahebi-Study-app/releases/download/v0.2.0/kanahebi-study-0.2.0-arm64.apk) · [ZIP with instructions](https://github.com/kana-hebi/kanahebi-Study-app/releases/download/v0.2.0/kanahebi-study-0.2.0-android.zip). Application ID `lab.kanahebi.study`, Android arm64, minSDK 24, version 0.2.0/code 2, test certificate matching v0.1.0. Release tag targets `870bf960eb6a27dcf17c42b2d49ddff02802f674`; its app/content sources are unchanged from the verified build commit.

## Limits and remaining acceptance

Physical-device execution and v0.1.0-to-v0.2.0 installation have not been tested. The package name is unchanged and the trial certificate matches; this is a signature check, not proof of an on-device upgrade. Offline cold start, native SQLite reopen/reboot, keyboard/Android Back, SVG fonts and native picker/share require device acceptance.

High-polymer content is deeper; other organic topics remain introductory. Third-party chemistry review, comprehensive university-exam coverage and long-term learning effectiveness are not verified. No future background execution after this conversation is promised.

## Confirmed decisions

Course and Free are equal primary routes, prerequisite advice never locks content, recording OFF is ephemeral, unknown never acquires an imagined distractor error, and short prior-learning checks do not permanently certify mastery. The assistant authors and validates dedicated native packs; arbitrary external content and code are not executed.

Source scope and fact-checking: [POLYMER_CONTENT.md](docs/POLYMER_CONTENT.md).
Validation: [RELEASE_VALIDATION.md](docs/RELEASE_VALIDATION.md).
Use: [USER_GUIDE.md](docs/USER_GUIDE.md).
Execution contract: [AUTONOMOUS_RUN.md](docs/AUTONOMOUS_RUN.md).
