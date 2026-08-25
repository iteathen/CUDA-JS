# CUDA-MCGS qualification-gap completion

**Status:** Proposal

**Execution state:** Active

**Assessment depth:** Critical, cross-repository qualification and external-environment work

**Started:** 2026-08-25

**Integration owner:** CUDA-JS qualification spine, with CUDA-MCGS retaining its package and semantic-oracle owners

## Objective and frozen inputs

Dispose CUDA-JS issues #32, #4, #17, #28 and #42 using exact public-contract evidence. Close an issue only when every acceptance criterion is integrated and read back; otherwise leave a decision-ready blocker that names the missing owner, environment and next executable action.

Frozen inputs at assessment:

- CUDA-JS protected `main@2135216b1a9fd88066a1c82b61ae533645eac9c2`;
- CUDA-JS device-publication candidate `codex/issue-123-device-publication@a85ad67409f7b15dab528133dd88a00ea140700f`, package `cuda-js@0.1.0-alpha.7`;
- CUDA-MCGS protected `main@1baadc50f254178112aa182c8e8b99aeaf93a2e6` and native-experiment disposition branch `codex/remove-stale-native-experiments@b0f93b441da008aeb39709cf62ae4f4f18c4a802`;
- Windows 11 x64, Node v26.7.0 qualification toolchain, NVIDIA GeForce GTX 1660 Ti `sm_75`, Driver 610.74/API 13030 and CUDA 13.3 providers;
- no installed WSL runtime, no registered repository self-hosted runner and no identified native Linux NVIDIA host.

The minimum practice floor is exact revision/environment/artifact identity, independent correctness oracles, fail-closed invalidation, terminal resource evidence, raw-sample digests for observations, protected user-work isolation, and remote read-back. Portable, Windows, WSL, container or neighboring-profile evidence never becomes native Linux evidence.

## Assessment and owner boundary

These issues do not describe one missing runtime feature:

- #42 is stale qualification state. Accepted SPEC-0012 and the exact Windows NQ-LTO capsule are integrated by PR #116, but current documentation still says `not-qualified`.
- #28 needs an owned reproducible observation/soak harness plus exact controlled-host evidence. Speed cannot promote correctness or support.
- #4 owns the first native Ubuntu x86-64 Driver-to-installed-package profile. The repository still lists native Linux adapters/capsules as missing and the current machine cannot execute them.
- #17 is a profile-matrix expansion that is dependency-blocked by #4 and then by access to each named native distribution host.
- #32 is a cross-repository integration closure. CUDA-JS generic prerequisites exist, including the unintegrated #123 candidate, but CUDA-MCGS has not yet accepted or produced the required restricted Device-JS Search Program/execution package and semantic oracle. CUDA-JS must not fabricate that consumer-owned artifact.

CUDA-JS owns generic runtime/compiler/package/platform qualification and the performance-observation harness. CUDA-MCGS owns Search IR, Search Program/package identity and semantic/reference oracles. Each native platform owns its exact environment evidence. No issue wording may collapse implementation, architecture, qualification and priority into one status.

## Adversarial synthesis

The strongest shortcut is to close all five from existing Windows tests and plans. It fails because #4/#17 explicitly require native Linux, #28 requires controlled representative samples and sustained telemetry, and #32 requires an independently owned CUDA-MCGS package/oracle. The opposite overbuild is to implement Linux adapters or a CUDA-MCGS engine without a runnable qualifying host or accepted consumer contracts. That would create untestable native authority and violate both repositories' dependency order.

The selected path completes independently satisfiable leaves, implements only evidence infrastructure with a runnable falsifier, and converts external/dependency gaps into exact blocked leaves rather than false passes. Revisit when a native Linux NVIDIA host, a controlled soak window, CUDA-JS #123 integration, or the accepted CUDA-MCGS package/oracle revision becomes available.

Current reconciliation on 2026-08-25:

- `QG-LTO-42` integrated through PR #124 at `bdef316856e32bb72f6946a18614cf5ad6272926`; issue #42 is closed.
- Device publication integrated through PR #125 at `05008fb988558e909cb3802fa12a73d612e70bf0`; issue #123 is closed.
- CUDA-MCGS native-experiment removal and disposition integrated through PR #104 at `ef1ac7f816b8c73338f3bac51af82ab2fb011006`.
- `QG-SOAK-28` is the active satisfiable leaf. It remains a per-device observation and does not imply multi-GPU support.
- `QG-LINUX-4`, `QG-LINUX-17` and `QG-PAIR-32` retain exact issue comments naming their unavailable host or consumer-owned package/oracle dependency.

## Focus-branch map

| ID | Status at start | Owner and outcome | Acceptance / decisive falsifier |
|---|---|---|---|
| `QG-LTO-42` | accepted locally; integration pending | Re-run current-head NQ-LTO, reconcile SPEC-0012 qualification truth, integrate documentation and close #42. | Exact independent LTO-IR/cubin/output parity, negative controls and zero terminal resources pass; any mismatch or cleanup residue blocks. |
| `QG-SOAK-28` | ready for harness; evidence conditional | Add a public-package, read-only-telemetry observation runner with cold/warm/workload/cooldown phases, raw samples/digests, correctness and cleanup. Execute short and bounded-long profiles only on an idle controlled host. | Unknown/mutable telemetry, correctness drift, missing samples, thermal/throttle invalidation or nonterminal resources invalidate the run. |
| `QG-LINUX-4` | blocked | Qualify Ubuntu 24.04 x86-64 F2L-F8L through installed package on native NVIDIA hardware. | Blocked while adapters/capsules or a native host are absent; Windows/WSL/container evidence is an explicit falsifier for the Linux claim. |
| `QG-LINUX-17` | blocked by `QG-LINUX-4` | Qualify named additional native x86-64 distributions independently. | No row can start before #4 and an exact named host exist. |
| `QG-PAIR-32` | blocked by consumer output | Bind one accepted CUDA-MCGS Search Program/package and oracle to an exact CUDA-JS package/revision and native result. | Missing accepted package/oracle, host-produced intermediate progress, consumer semantics in CUDA-JS, incomplete identity or nonterminal cleanup blocks. |
| `QG-INTEGRATE` | pending | Reconcile exact issue, docs, support registry, branch, evidence and cleanup state. | Any issue is closed beyond evidence, a retained artifact lacks an owner/trigger, or protected-main/remote state differs from the claimed revision. |

`accepted` and `integrated` remain distinct. A locally passing leaf is not an issue closure until its exact revision reaches protected `main` and the issue is read back.

`QG-LTO-42` reran from protected-main source `2135216b1a9fd88066a1c82b61ae533645eac9c2` with exact Node v26.7.0 on 2026-08-25. `npm run f6:capabilities` passed both independent LTO-IR units, cubin and GPU-output parity, rejection controls and terminal cleanup. The ignored evidence record SHA-256 is `207c4580dacdcdeb7ad30f5317fed51f7e6ed3d448b2ffe062ee7f0af0cfc912`; the independent oracle-build record SHA-256 is `78377794ebbf03b8261d3121b7e21e0ae0826e73a08ba0e9e118e2c2d105a627`. `npm run verify` then passed after the required EXP-000 fixture build. PR #124 integrated the documentation truth and closed issue #42.

## Execution, validation and cleanup

Work occurs in isolated worktrees. The dirty pre-existing `codex/capability-expansion-roadmap` checkout is protected unchanged. Before each material operation record expected effects, run the cheapest owner-local falsifier, inspect exact effects, then run the complete owning capsule once. Required repository checks are `./scripts/verify-docs.sh`, `npm run verify`, and the exact native or observation commands selected by the leaf.

Ignored build, package, telemetry and raw evidence output is retained only through review, then removed unless a bounded sanitized digest/summary is intentionally committed or uploaded. No test changes clocks, power, fans, persistence, Driver mode, GPU state, VM state or native host configuration. Task worktrees and local branches are removed only after remote/integration and recovery dependencies end.
