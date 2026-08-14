# CUDA-JS Capability Expansion Roadmap

**Status:** Informational

**Originally:** 2026-08-13

**Reconciled:** 2026-08-14 against protected-main baseline `334b903be827dedb5345608a34a6df444912fe1b`

## Purpose

Coordinate unfinished generic CUDA-JS capabilities without treating issue state, plan presence, portable tests or one neighboring native profile as implementation/support authority. Each production lane follows its governing specification; each support claim follows exact native evidence.

The detailed 2026-08-14 issue-by-issue development-cycle record is `docs/plans/2026-08-14-open-issue-development-sweep.md`.

## Governing invariants

- Node-FFI-first/no CUDA-JS-specific native addon baseline;
- one private context owner per selected device;
- raw native pointers/streams/events/device identifiers/providers remain private;
- explicit finite resource ownership and child-before-parent teardown;
- no unbounded queues, caches, pinned memory or workspaces;
- SPEC-0016 remains the sole operation submit/status/wait/close lifecycle authority;
- generated ABI facts remain separate from reviewed semantic overlays;
- architecture, implementation, qualification and priority remain independent;
- exact native evidence is required for support/performance claims;
- generic core remains free of consumer/search/model/training semantics.

## Current authority state

Accepted and implemented portable/software baseline:

```text
SPEC-0010 relocatable device code
SPEC-0011 scalar arguments (u64 / i32 / finite-only f32)
SPEC-0012 Device LTO
SPEC-0013 restricted Device-JS
SPEC-0016 opaque one-pending-operation lifecycle
```

Accepted on the 2026-08-14 foundation review, with implementation still to be integrated:

```text
SPEC-0017 explicit device selection + target resolution
SPEC-0021 f64/f16/bf16 scalar ABI + contiguous 1D generic device views
```

Still proposal-only:

```text
SPEC-0014 sideband
SPEC-0018 multi-operation scheduling
SPEC-0019 host memory / async transfer
SPEC-0020 prepared batch / CUDA Graph
SPEC-0022 Device-JS parallel / service profiles
SPEC-0023 CUDA library adapters
SPEC-0024 multi-GPU
SPEC-0025 graphics interop
SPEC-0026 process isolation
```

SPEC-0027 is accepted authority only for an optional **separate future NN publish unit**; each `nn.*` boundary needs its own accepted child specification.

## Dependency graph

```text
accepted baseline
  ├─ native qualification of already implemented capabilities
  ├─ SPEC-0017 [accepted; implementation next]
  │    ├─ SPEC-0024 multi-GPU [proposal]
  │    └─ SPEC-0025 graphics matching [proposal]
  ├─ SPEC-0021 [accepted; implementation next]
  │    ├─ SPEC-0022 trusted Device-JS primitives [proposal]
  │    ├─ SPEC-0023 CUDA library adapters [proposal]
  │    └─ SPEC-0025 graphics typed-view use [proposal]
  └─ SPEC-0018 [proposal; blocked on published native SPEC-0016 evidence]
       ├─ SPEC-0019 async transfer
       ├─ SPEC-0020 prepared batch / CUDA Graph
       ├─ SPEC-0023 CUDA library adapters
       └─ SPEC-0024 multi-device dependencies

SPEC-0026 process isolation
  └─ SPEC-0022 service-safe Device-JS

SPEC-0023
  ├─ cuRAND #92
  ├─ cuSPARSE #91
  └─ cuFFT #93
```

Dependencies are capability-specific; unrelated hardware or optimizations do not block portable work that does not consume them.

## P0 — current truth and external gates

- #64: EXP-013 oracle repair is integrated; exact merged-head Windows Node 26.7.0 F5 rerun still required.
- #68: private vulnerability reporting remains an external GitHub control-plane task.
- #35/#42/#43/#51: portable/software implementations exist; exact native promotion remains open.
- platform/hardware issues remain exact-profile qualification work and must not be inferred from vendor compatibility.

## P1 — implement accepted generic foundations

### CAP-D / SPEC-0021 — #39/#88

Current first implementation packet.

- add deterministic `f64`/`f16`/`bf16` packing;
- preserve SPEC-0011 finite-only `f32` exactly;
- add contiguous 1D generic typed views with exact byte ranges/access roles/parent generation;
- add focused boundary/mutation/lifecycle tests;
- update package/public compatibility projections only for implemented behavior;
- do not claim native support before independent native oracle evidence.

### CAP-B / SPEC-0017 — #20

Parallel/next packet.

- add finite sanitized discovery snapshots and opaque selectors;
- bind exactly one selected device before context/resource creation;
- retain default compatibility behavior;
- propagate selected architecture into target/cache identity;
- reject stale/foreign/ambiguous selection before native context work;
- keep native identifiers private;
- qualify explicit selection between physical devices only on a controlled multi-GPU host.

## P2 — repair the scheduling gate

### #51 then SPEC-0018 / #40

Issue #51 records a successful exact Windows candidate for native SPEC-0016 behavior, but also records that its candidate commits/evidence were not pushed/integrated on protected main. Before widening concurrency:

1. recreate or recover verifiable native SPEC-0016 evidence on the exact current protected revision;
2. publish/integrate the evidence and required runner/oracle records;
3. reread the exact result and lifecycle cleanup;
4. reassess SPEC-0018 against the now-published baseline;
5. only then accept and implement finite multi-operation/private-stream scheduling.

Do not use timing alone to prove overlap and do not create another operation lifecycle.

## P3 — successors unlocked by SPEC-0018/0021/0017

- SPEC-0019 / #86: pinned/registered host memory and async transfers; bounded staging; mechanism-level overlap evidence.
- SPEC-0020 / #85: semantic prepared-batch baseline first, CUDA Graph realization second.
- SPEC-0022 trusted / #87: only generic parallel primitives demanded by concrete consumers.
- SPEC-0026 / #95: process-isolation prototype may research independently; production/service claims require accepted contract/evidence.
- SPEC-0023 / #90: generic context-bound library adapter after scheduler + views.
- #92/#91/#93: cuRAND/cuSPARSE/cuFFT only through the generic adapter and exact provider oracles.
- SPEC-0024 / #20: multi-GPU after selection + scheduler/transfer foundations.
- SPEC-0025 / #94: one concrete graphics API/profile after selection + scheduler + views.
- SPEC-0014 / #38: sideband revisited after accepted host-memory ownership; SPEC-0016/0018 remain operation authority.
- SPEC-0022 service / #89: bounds + work budgets + quotas + process isolation together; trusted Device-JS alone is not a sandbox.
- #96: composed qualification only after component implementation and runner-ready profiles.

## Separate NN program

Issues #70/#72-#84 remain an optional NN-program track under accepted ADR-0004 and SPEC-0027. The authoritative package decision is now:

```text
same repository
separate future publish unit
package name unselected
source directory unselected
no NN export/dependency/init effect in cuda-js core
```

Original issue text that assumes `cuda-js/nn` or same-package distribution is stale. Begin child-spec work at #72 (`nn.tensor`) and proceed in dependency order (#73 graph, #74 autodiff, then providers/memory/execution/training). Generic capability work above may be consumed only through accepted public contracts.

## Native/platform campaign

Independent exact lanes remain for Linux x64, WSL2, ARM64/SBSA, Jetson, additional GPUs, distro cells, Server/TCC, virtualization, ECC, MIG, performance/soak, controlled runners/attestations and the exact CUDA-MCGS pair. Vendor support lists are planning inputs, not CUDA-JS qualification.

## Acceptance discipline

```text
proposal researched/revised      -> no implementation permission
spec accepted                    -> bounded implementation authorized
portable implementation passes   -> implementation may become implemented; native support unchanged
exact native capsule passes      -> only that exact profile may become qualified
benchmark passes                 -> only the named performance claim may be promoted
```

## Do not

- implement from an issue body or this roadmap without accepted governing authority;
- duplicate SPEC-0016 lifecycle;
- accept SPEC-0018 before its published native evidence gate;
- expose raw pointers/streams/events/devices/providers;
- infer support across GPU/OS/Driver/toolkit/library profiles;
- add unbounded queues/pinned memory/workspaces/cache;
- treat timing as concurrency proof;
- add NN/search/application semantics to generic core;
- call process isolation a universal GPU sandbox;
- call graphics/mapped memory zero-copy without direct mechanism evidence.
