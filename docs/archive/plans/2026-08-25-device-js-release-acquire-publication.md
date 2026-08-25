# Device-JS Release/Acquire Publication Execution Record

**Status:** Informational

**Date:** 2026-08-25

**Issue:** #123

## Frozen input and outcome

- Base: protected `origin/main` at `2135216b1a9fd88066a1c82b61ae533645eac9c2`.
- Git branch: `codex/issue-123-device-publication`.
- Isolated worktree: `CUDA-JS-issue-123`; the pre-existing dirty primary checkout was protected unchanged.
- Outcome: exact Device-JS `u32`/`u64` device-scope release/acquire publication helpers, public-contract evidence, package projection and exact installed-package native Windows qualification completed.

## Critical assessment and ownership map

The missing mechanism was one-location device-to-device publication ordering. It was not a CUDA-MCGS queue, generation protocol, host mailbox, driver capability or new component. The smallest reusable owner was the existing `runtime.device-js` helper contract. The accepted operation reused the manifest-owned `cuda-cccl` dependency and left compilation and execution lifecycles untouched.

Alternatives rejected before mutation: fences plus relaxed operations, RMW emulation, system-scope mailbox reuse, raw memory-order/scope inputs, and a queue/channel abstraction. Each either obscured semantics, violated ownership or expanded the contract beyond the evidence.

## Executed contract

The coherent node:

1. accepted and indexed the bounded SPEC-0022 child;
2. extended the centralized helper profile and generic pointer-atomic lowering;
3. added exact portable type/lowering/identity/failure tests;
4. added a CUDA-free publication-order oracle with immutable-message and unrelated work-slot consumers;
5. added early-ready, pre-acquire, partial-payload, stale-generation and wrong-generation negative traces;
6. extended the source-only installed-package Windows consumer for both widths and an exact four-word payload;
7. advanced package identity to `cuda-js@0.1.0-alpha.7` while preserving public API schema 1;
8. reconciled compatibility, component, interop and public status projections.

No CompilerActor/DriverActor API, native package source, generic order/scope DSL or consumer-domain vocabulary was introduced.

## Evidence

- Focused Device-JS/facade/oracle checks: 19/19 passed after final changes.
- Documentation/static/source-boundary validation: passed.
- F8 unit + portable package: 49/49 unit tests passed; clean tarball install/import/uninstall and public helper admission passed.
- F8 exact installed Windows package: `u32` and `u64` readiness each passed; observed payload was `[0x89abcdef, 0x01234567, 0x76543210, 0xfedcba98]`; CompilerActor programs created/destroyed were `1/1`; DriverActor ended with `live=0`, `closing=0`, `orphaned=0`.
- `npm run verify:windows`: complete exact Windows chain through F9 passed after generating the isolated worktree's prerequisite EXP-012 evidence.
- `npm run verify`: complete portable/package, Node-registry and hardware-registry chain passed.
- `npm run exp:014`: 9/9 operation-lifecycle tests passed.

Native evidence is exact to the recorded Windows x64, Node 26.7.0, CUDA 13.3 provider, Driver 13030 and GTX 1660 Ti profile. It does not establish universal GPU scheduling progress, fairness, freshness, queue correctness, Linux support, production stability or CUDA-MCGS policy. Consumer generation checks remain consumer-owned.

## Execution journal

- 2026-08-25: froze issue #123 and protected `origin/main`; confirmed no existing PR/branch implementation.
- 2026-08-25: read accepted Device-JS, CCCL dependency, packaging, validation and cleanup authority.
- 2026-08-25: selected the fixed-helper LEGO boundary and accepted `SPEC-0022-device-publication-v1`.
- 2026-08-25: implemented centralized helper metadata and lowering, portable/package evidence, native installed-package evidence, and documentation projections.
- 2026-08-25: completed focused, documentation, F8 native, full Windows, full portable and operation-lifecycle validation.

## Cleanup and disposition

The accepted spec, implementation, tests, oracle, package metadata and public projections are retained product state. Generated packages, evidence, consumer installs, caches, build outputs and the isolated dependency install are temporary and are removed before remote handoff. The pushed branch and commit are retained remote recovery/integration state. No PR or merge was authorized or created.
