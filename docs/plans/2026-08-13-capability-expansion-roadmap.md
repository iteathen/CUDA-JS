# CUDA-JS Capability Expansion Roadmap

**Status:** Informational

**Originally:** 2026-08-13

**Reconciled:** 2026-08-22 against protected-main baseline `bf2fc00d2a9452b14e7c4484e76aa0b1a84f0b9f`

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
- generic core remains free of consumer/search/model/training semantics;
- concurrent eligibility is distinct from guaranteed physical overlap;
- independently meaningful atomic observations do not require snapshot consistency or an artificial whole-operation dependency.

## Current authority state

Accepted and implemented portable/software baseline:

```text
SPEC-0010 relocatable device code
SPEC-0011 scalar arguments (u64 / i32 / finite-only f32)
SPEC-0012 Device LTO
SPEC-0013 restricted Device-JS
SPEC-0016 opaque one-pending-operation lifecycle
SPEC-0021 extended scalar ABI + contiguous 1D generic device views
```

Accepted foundation with implementation status tracked separately:

```text
SPEC-0017 explicit device selection + target resolution
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
  ├─ SPEC-0017 [accepted]
  │    ├─ SPEC-0024 multi-GPU [proposal]
  │    └─ SPEC-0025 graphics matching [proposal]
  ├─ SPEC-0021 [implemented portable/software]
  │    ├─ SPEC-0022 trusted Device-JS primitives [proposal]
  │    ├─ SPEC-0023 CUDA library adapters [proposal]
  │    └─ SPEC-0025 graphics typed-view use [proposal]
  └─ SPEC-0018 [proposal; blocked on published native SPEC-0016 evidence]
       ├─ SPEC-0019 async transfer
       ├─ SPEC-0020 prepared batch / CUDA Graph
       ├─ SPEC-0023 CUDA library adapters
       └─ SPEC-0024 multi-device dependencies

SPEC-0022 scoped atomic observation
  └─ composes with SPEC-0018 for independently pending observer/producer operations

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
- #35/#42/#43/#51: portable/software implementations exist where recorded; exact native promotion remains open.
- platform/hardware issues remain exact-profile qualification work and must not be inferred from vendor compatibility.

## P1 — accepted generic foundations

### CAP-D / SPEC-0021 — #39/#88

Portable/software/package scalar implementation plus the generic contiguous 1D view component exist. Native scalar/view-consumer qualification and any public view-facade spelling remain independently open.

### CAP-B / SPEC-0017 — #20

- finite sanitized discovery snapshots and opaque selectors;
- exactly one selected device bound before context/resource creation;
- default compatibility behavior;
- selected architecture propagated into target/cache identity;
- stale/foreign/ambiguous selection rejected before native context work;
- native identifiers remain private;
- explicit selection between physical devices requires a controlled multi-GPU oracle before qualification.

## P2 — repair the scheduling gate and take the smallest useful concurrency slice

### #51 then SPEC-0018 / #40

Issue #51 records successful candidate evidence for native SPEC-0016 behavior, but the proposal's published-evidence gate remains authoritative until exact current protected-main evidence is available.

Before widening concurrency:

1. recreate or recover verifiable native SPEC-0016 evidence on the exact current protected revision;
2. publish/integrate the evidence and required runner/oracle records;
3. reread the exact result and lifecycle cleanup;
4. reassess SPEC-0018 against the now-published baseline;
5. accept and implement the smallest dependency-ready multi-operation profile before generalizing.

The first useful multi-operation profile may be deliberately narrow:

```text
one long-lived operation
+ one short independent observer
+ same runtime/context
+ private streams
+ shared allocation leased by both
+ declared concurrency-safe atomic observation/update
+ no producer-completion dependency
```

This is a generic execution shape. CUDA-JS must not encode graph, search, ranking, game, model or other consumer semantics.

The scheduler must distinguish ordinary overlapping read/write hazards from explicitly admitted atomic observation/update. It must not serialize an independently observable atomic overlap merely because the operations touch the same allocation or byte range.

Do not use timing alone to prove overlap. Separate streams make work eligible for independent execution; CUDA may still serialize it. Correctness must not depend on simultaneous residency.

## P2A — smallest Device-JS primitive needed by the observer shape

### SPEC-0022 / #87 scoped atomic load/store

Accepted SPEC-0013 already provides atomic add/CAS. The first justified SPEC-0022 widening is explicit scoped atomic load/store so consumers do not emulate observation with RMW operations.

This slice is independent of shared-memory, warp, local-array, multidimensional-index and service-safe expansion. Do not bundle those larger features into the atomic-observation change.

Required direction:

- exact type/order/scope/return semantics;
- map directly to documented CUDA atomics rather than inventing another memory model;
- independently meaningful fields may be sampled at different moments;
- no implicit multi-location snapshot or happens-before relation beyond the selected order/scope;
- compound facts require their own coherent publication mechanism;
- when composed with SPEC-0018, atomic overlap must not create an artificial operation dependency;
- native qualification proves exact visibility/order semantics; physical kernel overlap is a separate performance/mechanism claim.

Atomic helper implementation may be prepared independently once its bounded child contract is accepted. Using it concurrently from two pending operations additionally requires SPEC-0018.

## P3 — successors unlocked by SPEC-0018/0021/0017

- SPEC-0019 / #86: pinned/registered host memory and async transfers; bounded staging; mechanism-level overlap evidence.
- SPEC-0020 / #85: semantic prepared-batch baseline first, CUDA Graph realization second.
- remaining SPEC-0022 trusted / #87 primitives: shared/local memory, multidimensional and warp helpers only when concrete consumers demand them.
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
- serialize declared concurrency-safe atomic observation merely because memory ranges overlap;
- promise snapshot consistency for independently meaningful atomic fields;
- expose raw pointers/streams/events/devices/providers;
- infer support across GPU/OS/Driver/toolkit/library profiles;
- add unbounded queues/pinned memory/workspaces/cache;
- treat timing as concurrency proof;
- add NN/search/application semantics to generic core;
- call process isolation a universal GPU sandbox;
- call graphics/mapped memory zero-copy without direct mechanism evidence.
