# Capability Documentation Reconciliation Handoff — Issue #67

**Status:** Informational

**Updated:** 2026-08-13

## Purpose

This is the durable continuation record for issue [#67](https://github.com/iteathen/CUDA-JS/issues/67). It checkpoints the documentation/semantic-validation repair without replacing accepted authority, expanding native support, or treating a draft pull request as completion.

The next agent must restart from the exact published checkpoint identified below, read the named operating files and accepted specifications, inspect the actual remote head/tree and discussion, and continue the ordinary guarded development cycle.

## Authority and required reading

Read in this order before changing the checkpoint:

1. [`../../AGENTS.md`](../../AGENTS.md), [`../../agent_files/AI_RULES.md`](../../agent_files/AI_RULES.md), and [`../../agent_files/AGENTS.md`](../../agent_files/AGENTS.md);
2. [`../../STATUS.md`](../../STATUS.md) and [`../../next_step.yaml`](../../next_step.yaml);
3. [`../../agent_files/DESIGN_ALIGNMENT_CARD.md`](../../agent_files/DESIGN_ALIGNMENT_CARD.md), [`../../agent_files/general_foundation/PRINCIPLES.md`](../../agent_files/general_foundation/PRINCIPLES.md), [`ENGINEERING_JUDGMENT.md`](../../agent_files/general_foundation/ENGINEERING_JUDGMENT.md), [`STATUS_SEMANTICS.md`](../../agent_files/general_foundation/STATUS_SEMANTICS.md), [`DOCUMENTATION_GOVERNANCE.md`](../../agent_files/general_foundation/DOCUMENTATION_GOVERNANCE.md), [`PULL_REQUEST_REVIEW_AND_MERGE.md`](../../agent_files/general_foundation/PULL_REQUEST_REVIEW_AND_MERGE.md), and [`CLEANUP_AND_DISPOSITION.md`](../../agent_files/general_foundation/CLEANUP_AND_DISPOSITION.md);
4. accepted [`SPEC-0010`](../specs/SPEC-0010-relocatable-device-code.md), [`SPEC-0011`](../specs/SPEC-0011-scalar-kernel-arguments.md), [`SPEC-0012`](../specs/SPEC-0012-device-lto.md), [`SPEC-0013`](../specs/SPEC-0013-restricted-device-js.md) plus its [public-surface addendum](../specs/SPEC-0013-public-surface-addendum.md), [`SPEC-0015`](../specs/SPEC-0015-execution-scope-status-clarification.md), and [`SPEC-0016`](../specs/SPEC-0016-operation-lifecycle.md);
5. accepted [`SPEC-0003` disposal-failure addendum](../specs/SPEC-0003-disposal-failure-addendum.md), [`SPEC-0006` target-syntax addendum](../specs/SPEC-0006-target-syntax-addendum.md), [`SPEC-0008`](../specs/SPEC-0008-package-public-facade.md), [`SPEC-0009`](../specs/SPEC-0009-trusted-toolkit-headers-and-cuda-mcgs-interop.md), and [`ADR-0001`](../decisions/ADR-0001-repository-boundary.md);
6. the active [native qualification](2026-08-12-native-and-platform-qualification-continuation.md), [compatible-pair](2026-08-12-compatible-pair-continuation.md), [execution continuation](2026-08-12-execution-capability-continuation.md), and [capability roadmap](2026-08-13-capability-expansion-roadmap.md).

Plans and this handoff organize work beneath accepted authority. Historical status text inside an accepted specification is retained as provenance unless an accepted addendum changes it.

## Design-principle constraints

Apply the repository's design cascade in order:

```text
truth and accepted authority
  -> exact purpose, bounds and claim dimensions
  -> domain-appropriate machine-readable facts
  -> LEGO ownership boundaries
  -> SOLID validators/renderers inside each owner
  -> CUPID public documentation and examples
  -> the simplest complete implementation
  -> exact evidence, review, cleanup and evolution
```

For this packet that means:

- one accepted or registered owner per fact; projections never become competing authority;
- capability architecture, implementation, qualification/profile, and priority remain independent fields;
- generated hardware output is changed through its registry/renderer, never by hand alone;
- public compatibility facts stay composable and predictable without exposing provider paths, raw capabilities, generated CUDA, or consumer-specific semantics;
- KISS applies only after version, ownership, status, history, validation, and handoff obligations are complete;
- review identity freezes the exact remote head/base/tree, and a head change invalidates the affected approval;
- every local/remote branch, draft PR, generated file, issue comment, and handoff record receives an explicit retain/merge/close/archive disposition.

## Exact input and published checkpoint

Issue #67 began from protected `main` after issue #66 completed its full cycle:

```text
protected-main input commit: 0fd146a285a19feb393d2c29b11b8c952326354c
protected-main input tree:   7ccf037924ac5e83c220baadb7270b6b1fac178a
focus branch:                docs/capability-reconciliation-67
draft pull request:          https://github.com/iteathen/CUDA-JS/pull/101
reviewable content commit:   623bbf43a89cd166276540ac53f7ec664879552f
reviewable content tree:     1873afd18cb9cb9f0098a9fbfc031877ac090a7f
current draft PR head:       read back from GitHub before continuing work
```

The publication sequence deliberately uses two commits: first publish the reviewable content, then record that exact remote commit/tree and the assigned draft PR in this handoff. The metadata commit necessarily moves the PR head, so every continuing agent must read the current head/tree from GitHub and revalidate any approval after a head change. Never manufacture a self-referential commit identifier.

## Defect and decisive falsifier

At the input revision, `./scripts/verify-docs.sh` passed while active public documents still claimed all of the following:

- current package identity `0.1.0-alpha.2` instead of `0.1.0-alpha.5`;
- Device LTO planned/unaccepted even though SPEC-0012 and its portable/software/package implementation were integrated;
- only `device-memory` and `u32` launch arguments despite accepted SPEC-0011 scalars;
- only terminal launch behavior despite implemented SPEC-0016 opaque operations;
- CUDA-MCGS ownership of source or compiled device modules despite the accepted Device-JS external-deletion direction;
- the deprecated one-dimensional `no-support` hardware disposition despite already-present architecture, implementation, qualification, and priority fields.

The repair must make these contradictions fail CI without changing their native-qualification dimensions.

## Selected design

- Accepted specifications remain normative authority.
- Non-shipped `docs/capability-status.json` is the machine-readable documentation/governance projection for capability status, public export inventory and CUDA-MCGS interop. The shipped `packaging/compatibility-manifest.json` remains the unchanged generic package compatibility owner; do not embed first-consumer identity or repository-only issue/spec links in the public package record.
- The public projection uses the canonical `planned` architectural value for an accepted selected direction. `architectureContext` preserves whether the authority is an accepted capability or accepted correction; this is a status-doctrine normalization, not a rewrite of historical accepted wording.
- Existing `conformance/hardware/extensions.json` remains the hardware-axis owner and records independent status dimensions; it must not retain a redundant collapsed public disposition.
- `scripts/verify-docs.mjs` validates exact projections, stale-claim controls, active runbook discovery, package/lock/parser agreement, and generated hardware documentation.
- `README.md`, `docs/CAPABILITIES.md`, `docs/INTEROP_WITH_CUDA_MCGS.md`, and focused package examples are public projections. Their structured blocks must agree byte-for-byte with the `docs/capability-status.json` renderer where the validator declares that ownership.
- Historical accepted specs and archived plans remain untouched.

## Claim limits and stop conditions

Preserve all of the following:

- SPEC-0010/0011/0012/0013/0016 are implemented in portable/software/package paths; none receives a new native support claim from #67.
- Candidate native evidence mentioned in GitHub issue comments is not protected-main evidence and cannot promote support here.
- SPEC-0014 and SPEC-0017 through SPEC-0026 remain proposal-only.
- Multiple pending operations/private-stream scheduling remains proposed under SPEC-0018; SPEC-0016 v1 remains one pending operation on one private stream.
- Direct CUDA C++/PTX remains a valid generic low-level CUDA-JS capability. The CUDA-MCGS production boundary instead selects consumer-owned semantic Device-JS plus CUDA-JS-owned private CUDA realization.
- The CUDA-MCGS external deletion and exact compatible-pair proof remain pending.
- Native Linux/WSL/ARM64, broader hardware, process isolation, performance, registry release, and destructive native cleanup partitions remain independently unqualified.
- `unsupported` remains a valid error category and may describe an exact release/profile. Only the ambiguous legacy status value `no-support` is removed from active projections.
- Stop and report any contradiction that changes public API, accepted ownership, support evidence, lifecycle, or generated authority; do not resolve it through documentation wording alone.

## Checkpoints

### Completed before this handoff

- [x] Issues #65 and #66 completed authority, implementation, tests, exact-head review, guarded merge, protected-main read-back, post-merge checks, and manual issue closure.
- [x] Issue #67 branch created from exact protected main `0fd146a…`.
- [x] Independent authority audit found no implementation blocker.
- [x] Independent documentation inventory reproduced semantic drift while the old validator passed.
- [x] Smallest coherent source-of-truth design selected.
- [x] Public-doc, interop, example, hardware-registry, and validator work split by semantic owner.

### Required before draft checkpoint publication

- [x] Integrate the three bounded work surfaces without conflicting edits.
- [x] Run focused syntax, generated-document, documentation, public-repository, package, and hardware checks.
- [x] Publish the reviewable content commit and record its exact remote commit/tree plus the draft PR in the metadata follow-up.
- [ ] Commit the intentional content checkpoint and its handoff-metadata follow-up, then publish the exact branch.
- [x] Open draft PR [#101](https://github.com/iteathen/CUDA-JS/pull/101) using `Tracks #67`; do not auto-close the issue.
- [ ] Read back the exact remote head/tree and PR body.

### Local checkpoint evidence

- [x] `./scripts/verify-docs.sh` passes, including F1B static checks and semantic-drift mutation controls.
- [x] Exact Node 26.7.0 `f8:unit` and `f8:portable` pass 40/40; the packed first-consumer deletion scan includes camel/snake/hyphenated coupling forms.
- [x] Exact Node 26.7.0 hardware checks pass 11/11 and Node qualification checks pass 4/4.
- [x] Exact Node 26.7.0 EXP-000 verification, F1B, F6, and all 82 F7 tests pass after building the ignored EXP-000 fixture. This sandbox required `LD_LIBRARY_PATH="$PWD/build/exp-000/native"` even though the oracle has a sibling `$ORIGIN` runpath.
- [x] The local full `npm run verify` reaches only the predeclared constrained-sandbox telemetry stop: `process.memoryUsage()` reports `ENOENT ... uv_resident_set_memory` after the F7 tests. Do not call that a full local pass; require exact remote CI to run the complete chain.
- [x] `node scripts/verify-public-repository.mjs`, `npm pack --dry-run`, structured JSON parsing, and `git diff --check` pass. The tarball excludes `docs/capability-status.json`, and the shipped compatibility manifest remains unchanged.

### Required after handoff

- [ ] Review every changed public claim against the accepted authority matrix.
- [ ] Run exact Node 26.7.0 focused F8/package and full portable verification.
- [ ] Obtain independent adversarial review of the exact remote head and complete diff.
- [ ] Require GitHub `verify` and `node-compatibility` success on the final exact head.
- [ ] Guard the merge with the accepted head SHA.
- [ ] Read back protected-main SHA/tree, generated documents, governance state, and post-merge push workflows.
- [ ] Only then comment on #35/#42/#43/#51 with the reconciled protected-main status, close #67, and advance the next focus to #68/#69.

## File ownership at checkpoint

Public/governance projection owner:

```text
README.md
docs/CAPABILITIES.md
docs/INTEROP_WITH_CUDA_MCGS.md
docs/README.md
docs/FOUNDATION_INDEX.md
docs/architecture/V0_SUPPORT_MATRIX.md
components/runtime-facade/README.md
conformance/f8/README.md
experiments/exp-009/README.md (retained evidence/current SPEC-0012 relationship)
experiments/EXP-014-operation-lifecycle.md (retained evidence/current SPEC-0016 relationship)
experiments/exp-014/README.md (retained evidence/current SPEC-0016 relationship)
STATUS.md
next_step.yaml
this handoff
```

Compatibility/validator owner:

```text
docs/capability-status.json (repository-only documentation/governance projection)
packaging/compatibility-manifest.json (unchanged shipped package identity, cross-checked only)
scripts/verify-docs.mjs
focused runtime-facade compatibility tests if required
```

Hardware status owner:

```text
conformance/hardware/extensions.json
conformance/hardware/qualification.mjs
conformance/hardware/qualification.test.mjs
conformance/hardware/hyperv-readiness.mjs
conformance/hardware/README.md
docs/HARDWARE_SUPPORT.md (generated only)
CONTRIBUTING.md
agent_files/VALIDATION_POLICY.md
agent_files/SYSTEM_REGISTRY.md
```

Do not widen these surfaces merely to clean unrelated documentation.

## Validation commands

Use repository-local temporary storage because `/tmp` may be absent in constrained environments:

```bash
mkdir -p build/tmp
TMPDIR="$PWD/build/tmp" ./scripts/verify-docs.sh
TMPDIR="$PWD/build/tmp" npm run hardware:check
TMPDIR="$PWD/build/tmp" npm run node:check
TMPDIR="$PWD/build/tmp" npm run f8:unit
TMPDIR="$PWD/build/tmp" npm run f8:portable
TMPDIR="$PWD/build/tmp" npm run verify
node scripts/verify-public-repository.mjs
npm pack --dry-run
git diff --check
```

Exact Node 26.7.0 is mandatory for the final verification claim. If the pinned local toolchain is absent, use the repository's documented `CUDA_JS_NODE` route or official `npm exec --package=node@26.7.0` runner and record the exact command. A constrained sandbox may fail only at `process.memoryUsage()` with `uv_resident_set_memory`; diagnose that environment-specific failure and rely on exact remote CI for the telemetry gate rather than claiming a local full pass.

## Handoff disposition

The draft branch and PR are intentional recovery/continuation resources. Do not delete or merge them until the exact-head review and guarded cycle finish. The issue remains open throughout draft work. Protected-main integration—not local edits, a draft PR, or green portable mocks—is the completion boundary.
