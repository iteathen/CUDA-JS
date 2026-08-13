# CUDA-JS Capability Expansion Roadmap

**Status:** Proposal

**Date:** 2026-08-13

**Parent integration spine:** repository-wide generic capability expansion

## Purpose

Coordinate the open CUDA-JS capability issues after the 2026-08-12 operation/Device-JS baseline without treating issue state, proposal presence, portable tests, or one exact native profile as implementation/support authority.

This roadmap is non-authoritative sequencing beneath accepted specifications. Each production lane requires its governing specification to be accepted first and requires exact native evidence before support promotion.

## Exact baseline

```text
capability-authority main:            5233a046c57813532a71763bb36cdba5894e43e0
implementation baseline before it:    fe9ed78939d3876790291421cec367fde58a8310
package:                              cuda-js@0.1.0-alpha.5
```

Accepted portable/software follow-up contracts on that implementation baseline:

```text
SPEC-0010 relocatable device code
SPEC-0011 scalar kernel arguments (u64/i32/f32)
SPEC-0012 Device LTO
SPEC-0013 restricted Device-JS
SPEC-0016 opaque operation lifecycle
```

SPEC-0014 remains proposal/experiment authority only.

The P0 authority-correction packet accepted the SPEC-0003 disposal-failure addendum and SPEC-0006 target-syntax addendum. Integration made their production corrections implementation-ready; acceptance alone did not change native support.

## Governing invariants

All expansion work preserves:

- Node-FFI-first/no CUDA-JS-specific native addon baseline;
- one private context owner per selected device;
- raw native handles/pointers/providers remain private;
- explicit finite resource ownership and child-before-parent teardown;
- no unbounded queues/caches/pinned memory/workspaces;
- operation lifecycle remains owned by SPEC-0016 and generalized only through accepted successors;
- generated ABI facts remain separate from reviewed semantic overlays;
- implementation, qualification, architecture and priority remain independent;
- exact native evidence is required for support/performance claims;
- consumer/domain semantics remain outside generic core.

## Authority repair result

The 2026-08-13 issue expansion referenced `SPEC-0017` through `SPEC-0026` before those proposal files existed on protected main. PR #97 established the intended proposal set:

```text
SPEC-0017 explicit device selection and target resolution
SPEC-0018 bounded multi-operation/private-stream scheduling
SPEC-0019 pinned/registered host memory and async transfer
SPEC-0020 prepared batches and reusable CUDA Graph execution
SPEC-0021 extended numeric ABI and generic typed device views
SPEC-0022 Device-JS parallel and service profiles
SPEC-0023 context-bound CUDA library adapters
SPEC-0024 multi-GPU orchestration
SPEC-0025 graphics external-resource interoperability
SPEC-0026 process-isolated execution
```

Their status remains **Proposal**. Creating them repairs coordination/ownership references; it does not authorize production code.

## Parent dependency graph

```text
accepted baseline
  ├─ correctness/authority hygiene (#64-#69)
  ├─ native qualification of implemented capabilities (#43, #51, platform issues)
  ├─ SPEC-0017 device selection
  ├─ SPEC-0018 multi-operation scheduling
  └─ SPEC-0021 numeric ABI + generic views

SPEC-0018
  ├─ SPEC-0019 async transfer
  ├─ SPEC-0020 prepared batch / CUDA Graph
  ├─ SPEC-0023 library adapters
  └─ SPEC-0024 multi-device dependencies

SPEC-0021
  ├─ SPEC-0022 typed parallel Device-JS helpers
  ├─ SPEC-0023 library adapters
  └─ SPEC-0025 graphics typed views

SPEC-0017
  ├─ SPEC-0024 multi-GPU
  └─ SPEC-0025 graphics device matching

SPEC-0026 process isolation
  └─ SPEC-0022 service-safe Device-JS

SPEC-0023
  ├─ cuRAND #92
  ├─ cuSPARSE #91
  └─ cuFFT #93
```

Dependencies are capability-specific. A successor must not wait on an unrelated optimization simply because both appear in this roadmap.

## P0 — repair current authority and regression truth

### CAP-P0-ORACLE — #64

Repair the EXP-013 responsiveness oracle without changing mailbox semantics or production authority. The issue has candidate evidence, but protected main still contains the old timer-count assertion. Integrate only after exact diff/evidence review.

### CAP-P0-TARGET — #65

The accepted SPEC-0006 target-syntax correction is implemented in portable/software and package paths. One shared target parser/policy owner now serves CompilerActor, linker, Device-JS and target validation while provider/device/qualification state remains separate. Newly representable target syntax does not change native support rows.

### CAP-P0-DISPOSAL — #66

The accepted SPEC-0003 disposal-failure correction is implemented in portable/software paths. ResourceRegistry, DriverActor and facade propagation preserve the bounded underlying semantic category, observation and health transition; failed close becomes orphaned/unusable; repeated close does not repeat disposer/native work by default; and rollback/cascade products retain both primary and cleanup divergence. Destructive native cleanup partitions remain independently unqualified unless exact-profile evidence is recorded.

### CAP-P0-DOCS — #67

Reconcile public capability/interop/version documentation against accepted main and extend validation so semantic drift fails CI.

### CAP-P0-SECURITY — #68/#69

Treat repository private-vulnerability reporting and immutable GitHub Action pinning as operational/supply-chain work. These do not become CUDA runtime support claims.

## P1 — finish native evidence for already implemented capabilities

Do not rewrite implemented portable features merely because their qualification issues remain open.

- #43: consumer-neutral Device-JS native DJS-2 proof;
- #51: exact native SPEC-0016 submission/completion proof;
- #35/#42: exact native RDC/LTO promotion where selected;
- #4/#12/#13/#14/#15/#22/#26: independent exact platform/hardware/provider qualification.

These lanes may proceed independently when the required environment exists.

## P2 — first generic expansion foundations

### CAP-DEVSEL — SPEC-0017 / #20

Accept and implement explicit opaque device selection and selected-device target resolution before generic multi-GPU or graphics-device matching.

### CAP-SCHED — SPEC-0018 / #40

Accept only after SPEC-0016 native lifecycle evidence is trustworthy enough to widen concurrency. Implement finite operations/private streams/dependencies/hazards/backpressure without public streams/events.

### CAP-NUMVIEW — SPEC-0021 / #39/#88

Accept extended scalar conversion/packing and generic bounded typed views. Keep scalar ABI, view semantics and tensor/application semantics separate.

These three foundations can be developed as separate focus packets with coordinated shared resource/identity vocabulary.

## P3 — data movement, reusable execution and trusted Device-JS breadth

### CAP-XFER — SPEC-0019 / #86

After accepted SPEC-0018, add bounded pinned staging/registration and async transfers. Prove lifetime and actual overlap mechanisms separately.

### CAP-PREP — SPEC-0020 / #85

Build semantic prepared-batch equivalence first. Add CUDA Graph realization only on exact graph-compatible profiles and retain ordinary DAG fallback.

### CAP-DJS-PAR — trusted portion of SPEC-0022 / #87

Add only generic shared/local/multidimensional/warp/atomic/numeric helpers demanded by real consumers, with exact helper semantics and native oracles.

### CAP-ISOLATE — SPEC-0026 / #95

A process-isolation prototype may proceed in parallel because it has a largely separate write surface. Public/service claims wait for accepted contract/evidence and do not imply GPU/Driver immunity.

## P4 — optional CUDA providers

### CAP-LIB — SPEC-0023 / #90

Create the reusable context-bound optional library/provider framework before library-specific runtime adapters.

### CAP-RAND — #92

Add trusted cuRAND device-header closure and/or opaque host generator only through the accepted library/header contracts.

### CAP-SPARSE — #91

Add a finite cuSPARSE semantic subset over typed views and bounded workspaces.

### CAP-FFT — #93

Add opaque cuFFT plans with explicit normalization/layout/workspace semantics.

Each provider has independent generated ABI, native oracle, exact provider identity and cleanup evidence.

## P5 — topology and external-resource breadth

### CAP-MULTIGPU — SPEC-0024 / #20

After explicit selection and operation/memory foundations, qualify one exact two-physical-GPU topology. Peer-direct and staged transfers are separate mechanisms. No automatic workload partitioning.

### CAP-GFX — SPEC-0025 / #94

Select one concrete first graphics API/profile, preferably a linear Vulkan or D3D12 external buffer, then qualify same-device matching, direct import and explicit synchronization. Other APIs/images remain separate profiles.

### CAP-SIDEBAND — SPEC-0014 / #38

Revisit SPEC-0014 only after the selected registered/mapped host-memory ownership from SPEC-0019 is accepted. Preserve SPEC-0016/0018 as operation authority.

## P6 — service-safe profile

### CAP-DJS-SERVICE — service portion of SPEC-0022 / #89

Service safety requires the complete set:

```text
length-bearing buffers/bounds
work budgets
finite quotas/backpressure
provider/source restrictions
process-isolated backend
per-tenant namespace/diagnostic controls
failure/restart health gate
```

Do not promote a service-safe claim from trusted-source Device-JS alone.

## P7 — composed qualification campaign

### CAP-QUAL — #96

Build end-to-end capability capsules only after individual capabilities have accepted implementation and runner-ready exact profiles.

The campaign coordinates, rather than duplicates:

- native Linux #4;
- hardware #12;
- WSL2 #13;
- ARM64/Jetson #14/#15;
- runner infrastructure #16/#29;
- distro matrix #17;
- compatibility #22;
- Server/TCC #26;
- performance/soak #28.

Every composed promotion records exact source/tree, Node/ABI, OS, Driver/toolkit/library providers, GPU/topology, artifacts/options/workload, independent oracle, result digest and terminal resource disposition.

## Separate NN-extension authority track

Issues #70-#84 propose an optional CUDA-JS NN training extension. Current accepted `docs/PROJECT_CHARTER.md` still states that CUDA-JS does not own tensor/model semantics.

Therefore no NN production implementation may proceed merely from those issues. The first NN work package must reconcile durable authority as required by #71: charter/addendum, component ownership, package isolation and accepted NN contracts. Generic core capabilities above may be developed independently and later consumed by an accepted NN extension.

Do not silently inject tensors/autodiff/training semantics into `runtime.memory`, `runtime.execution`, DriverActor or CompilerActor while that authority gap remains.

## Focus packet map

Recommended semantic packets:

```text
CAP-A: regression/authority hygiene (#64-#69)
CAP-B: device selection + target resolution (SPEC-0017)
CAP-C: generalized operations (SPEC-0018)
CAP-D: numeric ABI + generic views (SPEC-0021)
CAP-E: host transfer (SPEC-0019)
CAP-F: prepared execution (SPEC-0020)
CAP-G: trusted Device-JS primitives (SPEC-0022 trusted)
CAP-H: process isolation (SPEC-0026)
CAP-I: CUDA library framework/providers (SPEC-0023, #90-#93)
CAP-J: multi-GPU (SPEC-0024)
CAP-K: graphics interop (SPEC-0025)
CAP-L: sideband revision (SPEC-0014)
CAP-M: service profile (SPEC-0022 service)
CAP-Q: qualification composition (#96)
CAP-NN: separate NN authority/program (#70-#84)
```

Each packet must state exact input revision, accepted authority, write surface, falsifier, validation, cleanup and invalidation rules before implementation.

## Acceptance discipline

A capability changes dimensions independently:

```text
proposal added            -> architecture may remain planned; implementation stays not-implemented
spec accepted             -> implementation may become authorized; qualification stays not-qualified
portable implementation   -> implementation may become implemented; native support stays not-qualified
exact native capsule pass -> only that profile may become qualified
benchmark pass            -> only the named performance claim may be promoted
```

## Do not

- implement from an issue body when an accepted contract is absent;
- treat this roadmap as implementation authority;
- duplicate SPEC-0016 lifecycle;
- expose raw pointers/streams/events/devices/providers;
- infer support across GPU/OS/Driver/toolkit/library profiles;
- add unbounded queues/pinned memory/workspaces/cache;
- turn timing into concurrency proof;
- make generic CUDA-JS depend on NN/search/application semantics;
- call process isolation a universal GPU sandbox;
- call graphics import zero-copy without direct-resource evidence.
