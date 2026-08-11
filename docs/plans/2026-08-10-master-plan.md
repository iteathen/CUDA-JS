# CUDA-JS Node-FFI-First Master Plan

**Status:** Accepted

**Date:** 2026-08-10

## Purpose

Turn the accepted repository boundary and Node-FFI-first host-binding decision into dependency-ordered, falsifiable future work without prematurely implementing broad CUDA coverage.

**Current authorization:** documentation only. This accepted plan orders possible future work; it does not authorize experiment execution or implementation. Explicit project-owner phase advancement is required first.

The first *planned* code-bearing work after that future authorization is **not** an application runtime and does not require CUDA. It is EXP-000: a generated synthetic C ABI library and direct C oracle that qualify Node FFI, schema-derived definitions/packers, Worker isolation, resource lifetime, and deterministic teardown before GPU variables enter the diagnosis.

## Global gates

Every work package preserves:

- no CUDA-JS project-specific compiled addon in the selected baseline;
- no hand-written or ahead-of-time per-CUDA-function wrapper family;
- any future generic native/JIT gap backend requires EXP-011 and a separate accepted ADR;
- no UMCGS/search semantics;
- trusted generated schema plus reviewed semantic overlay;
- no public raw native/device pointers or arbitrary FFI;
- exact Node/CUDA/header/schema/platform identity;
- one owner and terminal disposition for resources;
- context-dependent Driver calls on the owning Worker;
- nonblocking application event loop;
- explicit immediate/deferred error and context-health semantics;
- no strict Fast-JIT claim without direct qualification evidence;
- mock results never proving native CUDA behavior;
- local validation, exact commit, portable bundle, and UMCGS handoff before implementation expansion.

## Work packages

### CJS-F0 — repository and authority publication (P0/P1)

**Outputs**

- exact local commit containing research, ADRs, architecture, support matrix, plan, experiments, and source register;
- portable Git bundle/zip/checksums;
- private `iteathen/CUDA-JS` remote containing the reviewed documentation foundation;
- documentation validation and remote read-back after publication;
- UMCGS reference to the exact CUDA-JS plan without importing private source.

**Exit**

One active authority set; no competing accepted ADR/plan; exact artifact verified.

### CJS-F1 — host substrate and schema foundation umbrella (P1)

#### CJS-F1A — GPU-free Node FFI synthetic qualification

**Dependencies:** F0 authority state and explicit project-owner authorization to leave the documentation-only phase.

**Outputs**

- generated dependency-free C ABI case library and direct C oracle;
- minimal generic Runtime IR for scalar, pointer, out-parameter, structure-storage, and argument-count cases;
- generated Node FFI definitions and byte packers;
- Worker ownership and library/resource lifetime harness;
- exact Node 26.7 source-derived Fast FFI eligibility model;
- arbitrary returned-function-pointer capability finding;
- Linux x86-64 evidence first, then Windows x86-64 and Linux ARM64.

**Experiment:** EXP-000.

**Exit**

The Node-FFI-first substrate passes exact native parity and cleanup on Linux x86-64, or the baseline is revised before CUDA-specific implementation.

#### CJS-F1B — CUDA schema and ABI foundation

**Dependencies:** F1A host-substrate qualification.

**Outputs**

- canonical CUDA Runtime-IR metaschema;
- pinned Clang AST/header importer;
- target profile facts for Linux x86-64 first;
- curated semantic overlay format;
- deterministic diff and unresolved-coverage report;
- generated Node FFI definitions, structure/out-parameter packers, TypeScript types, and conformance fixtures;
- native C CUDA ABI probe generator.

**Experiments:** EXP-001, EXP-002, EXP-003.

**Exit**

Tier-0 CUDA schema regenerates deterministically; native probes agree on scalar/handle/struct layouts; new/changed APIs fail closed.

### CJS-F2 — Node FFI CUDA backend and preflight (P1)

**Dependencies:** F1A and F1B accepted outputs.

**Outputs**

- exact Node 26 capability/flag preflight;
- platform Driver library discovery;
- generated named-symbol bindings for Tier 0;
- `cuGetProcAddress` verification/status records;
- Node FFI backend diagnostics and explicit unsupported-symbol behavior;
- safe internal pointer/buffer helpers with no public escape.

**Experiments:** EXP-001, EXP-002, EXP-004.

**Exit**

Driver initialization/query/context smoke succeeds on Linux x86-64 native environment; generic versus Fast FFI claims are honest and exact-profile keyed.

### CJS-F3 — DriverActor and resource state machine (P1)

**Dependencies:** F2 bootstrap bindings.

**Outputs**

- main-thread async command protocol;
- one Worker/one context actor;
- opaque tokens with runtime/kind/slot/generation/state;
- dependency/lease/in-flight model;
- immediate/deferred error records and health transitions;
- deterministic explicit close and graceful worker-shutdown teardown;
- unexpected-worker-loss epoch invalidation, orphan inventory, and restart-required state;
- pure-JS lifecycle mock using the same public contract.

**Experiments:** EXP-005, EXP-007.

**Exit**

Context affinity and lifecycle capsules pass; stale/wrong-kind/cross-runtime/double-close operations reject; graceful shutdown disposes in dependency order; unexpected Worker loss fails closed without a false cleanup claim; main loop remains responsive.

### CJS-F4 — memory foundation (P1)

**Dependencies:** F3 actor/registry.

**Outputs**

- device-local allocations and staged copies;
- quotas, bounds, alignment, offset validation, and transfer leases;
- asynchronous copy completion;
- pinned staging profile after evidence;
- internal/unsafe foreign-view lifetime contract;
- mapped/managed profiles kept disabled until accepted.

**Experiments:** EXP-008.

**Exit**

Pressure, out-of-bounds, in-flight release, GC, teardown, and stale-view capsules pass.

### CJS-F5 — module, function, launch, stream/event, completion (P1)

**Dependencies:** F3/F4.

**Outputs**

- load PTX/cubin/fatbin;
- module/function resources;
- generated kernel ABI and pointer-table packers;
- streams/events;
- `cuLaunchKernelEx()` preferred ordinary capability and compatibility launch;
- CUDA Graph prepared-repeat profile only after ordinary launch/lifecycle correctness;
- adaptive event/stream polling;
- terminal operation/provenance records;
- bounded command/completion queues and cancellation state.

**Experiments:** EXP-004, EXP-006, EXP-007; graph-specific lifecycle/performance cases are added only after the core vertical slice.

**Exit**

A deterministic real kernel capsule passes with responsive main loop, correct argument packing, attributed deferred errors, and clean teardown.

### CJS-F6 — CompilerActor, NVRTC, nvJitLink, cache (P1/P2)

**Dependencies:** F1B schema/artifact identity and F5 module load.

**Outputs**

- optional provider discovery;
- separate CompilerActor;
- source/header/options/log ownership;
- provider process-global side-effect manifest and Linux NVRTC `-modify-stack-limit=false` default;
- optional child-process compiler provider when in-process containment gates fail;
- PTX/cubin/LTO-IR outputs as supported;
- nvJitLink composition;
- content-addressed cache with corruption/invalidation checks;
- artifact handoff to DriverActor.

**Experiments:** EXP-009.

**Exit**

Clean-room repeat produces identical identity and equivalent artifact; warning/error logs, cancellation, cache corruption, process-global side effects, and teardown are verified. NVRTC compile-only evidence is separated from GPU-dependent module-load/launch evidence.

### CJS-F7 — platform expansion and hardening (P2)

**Dependencies:** accepted Linux x86-64 vertical slice.

**Outputs**

- Windows x86-64 qualification and WDDM/TCC/watchdog diagnostics;
- Linux ARM64 SBSA qualification;
- WSL2 diagnostics;
- security/permission profiles;
- failure injection, fuzz/property tests, leak stress, and performance regression gates.

**Exit**

Support matrix claims match exact native evidence; unsupported profiles fail descriptively.

### CJS-F8 — package, second consumer, and optional isolation/JIT gaps (P2/P3)

**Dependencies:** stable core contracts.

**Outputs**

- no-addon package and exact Node support policy;
- compatibility manifest and migration rules;
- second unrelated synthetic consumer;
- EXP-010 process-isolation decision;
- EXP-011 upstream/custom pointer-call/JIT decision only if a measured gap remains.

**Exit**

First-consumer-deletion and second-instance tests pass; strict JIT claims are either proven, explicitly unsupported, or backed by a separately accepted design.

### CJS-F9 — UMCGS public interop (P2/P3)

**Dependencies:** stable public CUDA-JS package contract.

**Outputs**

- versioned execution-package contract;
- UMCGS adapter and compatibility manifest;
- one cross-repository compatible-pair capsule;
- proof that active search remains device-owned after ignition;
- independent internal conformance retained by each repository.

## Current authorized sequence — documentation only

1. Publish and verify the complete foundational documentation on private `iteathen/CUDA-JS`.
2. Add and maintain the ownership registry and foundation completeness index.
3. Reconcile stale local-bootstrap, publication, and implementation-ready language.
4. Run documentation/static validation and remove temporary transfer or premature workflow residue.
5. Keep all experiment execution and runtime implementation blocked until explicit project-owner authorization advances the phase.

## Future dependency sequence — not current authorization

1. After explicit authorization, run **EXP-000 Node FFI synthetic ABI qualification** on official Node 26.7.0/Linux x86-64; this requires no CUDA or GPU.
2. Only after EXP-000 passes, build the pinned CUDA header importer/overlay and draft the Tier-0 normalized schema.
3. In a qualified Linux x86-64 CUDA environment run EXP-001 through EXP-003.
4. Do not begin memory, modules, NVRTC, graphs, or broad API generation until F1A/F1B/F2 gates pass.

## Stop conditions

Stop or split when:

- EXP-000 shows ordinary CUDA-style ABI shapes or Worker/library lifetimes cannot be represented safely;
- Node FFI is unavailable or cannot bind a required exported symbol;
- strict JIT is required but cannot be qualified;
- schema facts and native probes disagree;
- a raw pointer would need to cross the safe API;
- context affinity cannot be maintained by one actor;
- blocking work reaches the application event loop;
- deferred error provenance or health transition is ambiguous;
- cleanup cannot prove terminal resource state;
- a work package expands beyond its owner/evidence envelope;
- production implementation is proposed before its predecessor gates pass.
