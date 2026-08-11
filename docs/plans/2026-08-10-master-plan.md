# CUDA-JS Node-FFI-First Master Plan

**Status:** Accepted

**Date:** 2026-08-10

## Purpose

Turn the accepted repository boundary and Node-FFI-first host-binding decision into dependency-ordered, falsifiable future work without prematurely implementing broad CUDA coverage.

**Current authorization:** dependency-ordered implementation is active by explicit project-owner instruction dated 2026-08-11. `CJS-F1A / EXP-000`, `CJS-F1B`, Windows-only `CJS-F2W / EXP-012`, and Windows CJS-F3W through CJS-F8W are accepted after independent host, ABI, Driver, compiler, linker, GPU, permission, oracle, actor-affinity, cache, resource, artifact, execution, failure, stress, diagnostic, package, consumer, install, and cleanup qualification. The F3 through F8 portable control/package path also passes without establishing native Linux CUDA support. Linux `CJS-F2L / EXP-001` and native Linux F3L through F8L remain retained, incomplete, deferred, and independently promotable.

The first *planned* code-bearing work after that future authorization is **not** an application runtime and does not require CUDA. It is EXP-000: a generated synthetic C ABI library and direct C oracle that qualify Node FFI, schema-derived definitions/packers, Worker isolation, resource lifetime, and deterministic teardown before GPU variables enter the diagnosis.

## Global gates

Every work package preserves:

- no CUDA-JS project-specific compiled addon in the selected baseline;
- no hand-written or ahead-of-time per-CUDA-function wrapper family;
- any future generic native/JIT gap backend requires EXP-011 and a separate accepted ADR;
- no CUDA-MCGS/search semantics;
- trusted generated schema plus reviewed semantic overlay;
- no public raw native/device pointers or arbitrary FFI;
- exact Node/CUDA/header/schema/platform identity;
- one owner and terminal disposition for resources;
- context-dependent Driver calls on the owning Worker;
- nonblocking application event loop;
- explicit immediate/deferred error and context-health semantics;
- no strict Fast-JIT claim without direct qualification evidence;
- mock results never proving native CUDA behavior;
- local validation, exact commit, portable bundle, and CUDA-MCGS handoff before implementation expansion.

## Work packages

### CJS-F0 — repository and authority publication (P0/P1)

**Outputs**

- exact local commit containing research, ADRs, architecture, support matrix, plan, experiments, and source register;
- portable Git bundle/zip/checksums;
- public `iteathen/CUDA-JS` remote containing the reviewed foundation and Windows F2W evidence-bearing implementation;
- documentation validation and remote read-back after publication;
- CUDA-MCGS reference to the exact CUDA-JS plan without importing private source.

**Exit**

One active authority set; no competing accepted ADR/plan; exact artifact verified.

### CJS-F1 — host substrate and schema foundation umbrella (P1)

#### CJS-F1A — GPU-free Node FFI synthetic qualification

**Dependencies:** F0 authority state, project-owner authorization, and native Linux x86-64 promotion evidence are satisfied.

**Outputs**

- generated dependency-free C ABI case library and direct C oracle;
- minimal generic Runtime IR for scalar, pointer, out-parameter, structure-storage, and argument-count cases;
- generated Node FFI definitions and byte packers;
- Worker ownership and library/resource lifetime harness;
- exact Node 26.7 source-derived Fast FFI eligibility model;
- arbitrary returned-function-pointer capability finding;
- independent Windows x86-64 and Linux x86-64 evidence, with later profiles promoted separately.

**Experiment:** EXP-000.

**Exit**

The Node-FFI-first substrate passes exact native parity and cleanup on each claimed profile, or that profile remains unsupported.

#### CJS-F1B — CUDA schema and ABI foundation

**Dependencies:** F1A host-substrate qualification is satisfied. This branch is complete and accepted.

**Outputs**

- canonical CUDA Runtime-IR metaschema;
- pinned Clang AST/header importer;
- target profile facts for Linux x86-64 first;
- curated semantic overlay format;
- deterministic diff and unresolved-coverage report;
- generated Node FFI definitions, structure/out-parameter packers, TypeScript types, and conformance fixtures;
- native C CUDA ABI probe generator.
- an independently probed Win64 compatibility bridge when an official platform header is hash-identical.

**Experiments:** EXP-001, EXP-002, EXP-003.

**Exit**

Satisfied on the pinned CUDA 13.3.29/Clang 18/Linux x86-64 profile and expanded through F5: Tier-0 CUDA schema regenerates deterministically; native probes agree on scalar/handle/struct/device-address/size layouts; six mutation classes are detected; 456 unselected declarations fail closed.

### CJS-F2 — platform-separated Node FFI CUDA backend and preflight (P1)

**Dependencies:** F1A and F1B accepted outputs.

**Outputs**

- exact Node 26 capability/flag preflight;
- platform Driver library discovery;
- generated named-symbol bindings for Tier 0;
- `cuGetProcAddress` verification/status records;
- Node FFI backend diagnostics and explicit unsupported-symbol behavior;
- safe internal pointer/buffer helpers with no public escape.

**Experiments:** Windows `EXP-012`; deferred Linux `EXP-001`; shared questions from EXP-002 and EXP-004 remain separately scoped.

**Exit**

`CJS-F2W` is accepted when Driver initialization/query/context smoke, named exports, procedure verification, permissions, C-oracle parity, and cleanup pass on the exact Windows x64 profile. `CJS-F2L` remains incomplete until the retained native Linux protocol passes. One platform does not block or imply the other.

### CJS-F3 — DriverActor and resource state machine (P1)

**Dependencies:** the bootstrap bindings for the platform being implemented. Windows F3 may consume accepted F2W; Linux F3 remains blocked on F2L.

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

**Accepted disposition:** Windows F3W satisfies this exit on the exact accepted Windows profile. The same platform-neutral registry, protocol, health, responsiveness, graceful-teardown, and unexpected-loss capsule passes on native Linux x86-64. Linux native DriverActor execution remains blocked on F2L and is not implied by that shared control-plane evidence.

### CJS-F4 — memory foundation (P1)

**Dependencies:** F3 actor/registry.

**Outputs**

- bounded device-local allocations and synchronous copied `Uint8Array` transfers;
- quotas, rollback, bounds, offset validation, and transfer leases;
- opaque generation-safe allocation lifetime and allocation-before-context teardown;
- pinned, mapped, managed, asynchronous, and foreign-view profiles kept disabled until separately accepted.

**Experiments:** EXP-008.

**Exit**

Pressure, rollback, failed-free accounting, exact-edge/out-of-bounds, in-flight release, copied-byte isolation, teardown, and stale-generation capsules pass.

**Accepted disposition:** Windows F4W satisfies this bounded synchronous slice on the exact accepted Windows profile with independent MSVC byte parity and terminal cleanup. Native Ubuntu CI regenerates the 17-function/11-type schema and runs the portable memory/control-plane capsule. Native Linux Driver memory remains blocked on F2L/F3L and the retained human handoff; pinned, mapped, managed, asynchronous, and foreign-view memory remain deferred.

### CJS-F5 — module, function, launch, stream/event, completion (P1)

**Dependencies:** F3/F4.

**Accepted disposition:** Windows F5W satisfies the bounded PTX-only slice on the exact accepted Windows profile. An independent MSVC oracle and the DriverActor agree on the tracked vector output, checksum, parameter offsets/size, and terminal cleanup. Native CI regenerates the 27-function/16-type schema and runs portable policy, packing, lease, polling, deferred-error, timeout/loss, and teardown controls. Native Linux Driver execution remains blocked on F2L–F4L and the retained F5 handoff; compilation, caching, broad signatures/formats, public streams/events, and concurrency remain deferred.

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

**Accepted disposition:** Windows F6W satisfies the bounded source-to-PTX, PTX-to-cubin, validated local-cache, and copied Driver-handoff slice on the exact accepted Windows profile. Production Node FFI and an independent MSVC oracle produce byte-identical artifacts across clean runs; corruption and invalidation controls pass; both formats execute with identical GPU output; all program, link, module, Driver, library, and Worker cleanup is terminal. Portable Linux option/cache/lifecycle fixtures and a human native-provider runbook are retained without claiming Linux support. LTO, arbitrary options/providers, compilation concurrency, child-process recovery, and packaging remain deferred.

### CJS-F7 — platform expansion and hardening (P2)

**Dependencies:** accepted Windows CJS-F5W and CJS-F6W. Additional platform promotion remains independently gated on its native predecessors and does not block the Windows hardening slice.

**Outputs**

- Windows x86-64 qualification and WDDM/TCC/watchdog diagnostics;
- Linux ARM64 SBSA qualification;
- WSL2 diagnostics;
- security/permission profiles;
- failure injection, fuzz/property tests, leak stress, and performance regression gates.

**Exit**

Support matrix claims match exact native evidence; unsupported profiles fail descriptively.

**Accepted disposition:** Windows F7W adds fail-closed host/device assessment, CUDA-reported WDDM/TCC/watchdog/compute-mode diagnostics, inherited Node permission enforcement, sanitized DriverActor/CompilerActor result and error boundaries, deterministic failure/property partitions, and repeated portable/native lifecycle stress. Linux x86-64, Linux ARM64 SBSA, and WSL2 remain separate, documented, unqualified paths. Broad duration and process-memory ceilings are regression controls only. F8 packaging and public-facade work was later authorized by accepted SPEC-0008.

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

**Accepted disposition, amended for public testing:** Windows F8W publishes the non-private `cuda-js` 0.1.0-alpha.2 no-addon ESM package boundary with Node 26.1.0-or-later testing admission, exact Node 26.7.0 qualification evidence, unconfirmed Windows CUDA operation without an opt-in, a safe facade over accepted actors, immutable compatibility metadata, mock-only consumer testing, clean tarball install/uninstall, first-consumer deletion, two unrelated consumers, and installed-package native vector execution. Linux package/import/mock/readiness controls pass without a native CUDA claim and remain backend-incomplete. EXP-010 and EXP-011 are not triggered because no mandatory isolation, callable-pointer, or strict-JIT gap is measured; Worker loss remains restart-required and strict JIT remains unsupported.

### CJS-F9 — CUDA-MCGS public interop (P2/P3)

**Dependencies:** stable public CUDA-JS package contract.

**Outputs**

- versioned execution-package contract;
- CUDA-MCGS adapter and compatibility manifest;
- one cross-repository compatible-pair capsule;
- proof that active search remains device-owned after ignition;
- independent internal conformance retained by each repository.

**Current disposition:** The CUDA-JS-owned prerequisite is complete under SPEC-0009. The exact Windows profile verifies and snapshots the CUDA 13.3 `cuda/` and `nv/` CCCL virtual roots, compiles a consumer-neutral `<cuda/atomic>` fixture through the public facade, observes the expected release/acquire publication words, and closes terminally. The CUDA-MCGS adapter/package and exact compatible-pair evidence remain pending the independent CUDA-MCGS work package in `iteathen/UMCGS`; CUDA-JS contains no consumer schema.

## Completed sequence — CJS-F1B

1. Independent Windows x64 and native Linux x86-64 EXP-000 evidence and regression checks are preserved.
2. The official CUDA 13.3.29 Ubuntu 24.04 development package, headers, license, and Clang profile are hash-pinned.
3. The deterministic importer, generated facts, separately reviewed Tier-0 overlay, Runtime IR, FFI definitions, packers, declarations, conformance, coverage, diff, compatibility, and product manifests are implemented.
4. Independent native C ABI probes and six mutation-negative controls pass for Linux x86-64.
5. Windows `cuda.h` identity and MSVC layout probes agree with accepted facts; Linux Driver/context execution remains separately gated on a qualified Linux CUDA/GPU environment.

## Completed sequence — Windows CJS-F2W

1. SPEC-0002 and EXP-012 bound the Windows bootstrap without changing or deleting Linux EXP-001.
2. The official Windows CUDA 13.3 header hash matches the accepted F1B header and MSVC matches all selected layouts.
3. Official Node 26.7.0 binds all 12 generated named exports from the canonical system Driver.
4. All 12 public-name procedure queries, negative version/symbol/library/permission controls, and the private context lifecycle pass.
5. Sanitized Node observations agree exactly with the independent MSVC C oracle; teardown closes context, library, and Worker without exposing pointers.

## Next dependency sequence

1. Preserve accepted F1A, F1B, platform-separated F2W, Windows F3W through F8W, and independent C-oracle evidence.
2. Preserve the public contribution request and retained handoffs for Linux F2L through F8L.
3. Preserve the accepted Windows F7W permission, device-diagnostic, failure/property, repeated-lifecycle, and cleanup evidence.
4. Preserve the accepted F8 package/public-facade/second-consumer evidence and the accepted CUDA-JS F9 trusted-header/atomic-publication prerequisite while the independent CUDA-MCGS package/adapter and exact compatible-pair evidence are completed.
5. Resume Linux F2L through F8L independently when a qualified native Linux NVIDIA environment becomes available; never substitute portable controls or Windows results for native Linux evidence.

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
