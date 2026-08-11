# SPEC-0000: CUDA-JS Runtime Contract Map

**Status:** Proposal

**Date:** 2026-08-10

This is the version-zero specification map, not an implementable public API by itself.

## Governing decisions

- ADR-0001 — independent generic runtime repository and one-way UMCGS consumption.
- ADR-0002 — Node-FFI-first, no project addon baseline, explicit hot/cold/JIT qualification.
- ADR-0003 — generated ABI facts plus curated semantic overlays, compiled fail-closed into Runtime IR.

## Contract families

### C01 — platform and capability profile

Node version/build/flags, OS/architecture/ABI, library discovery, Driver/toolkit/device versions, optional providers, stream semantics, launch/memory capabilities, support status, and early failure.

### C02 — generated source facts

Pinned header provenance, typedefs, enums, handles, structures/unions/offsets/alignments, functions, exported names/version families, callback types, deprecations, and target profiles.

### C03 — semantic overlay and Runtime IR

Public exposure, version/optionality, direction/nullability/lengths, resource ownership, context/thread rules, blocking/asynchrony, deferred errors, security, cleanup, support tier, FFI/static eligibility expectation, and conformance requirements.

### C04 — private Node FFI backend

Exact Node capability/flags, allowlisted libraries/symbols, generated signatures, pointer/buffer helpers, close/invalidation behavior, named-symbol versus `cuGetProcAddress` rule, diagnostics, cold/bootstrap profile, and strict-JIT qualification gate.

### C05 — async runtime facade and command protocol

Main-thread API, actor messages, bounded command/result records, validation, backpressure, operation sequence, cancellation, runtime close, and unsupported-profile behavior.

### C06 — DriverActor and context

One Worker/private context baseline, current-context ownership, initialization, device selection, primary-context future profile, health states, graceful actor shutdown, unexpected-worker-loss epoch invalidation/restart requirements, and no cross-worker handle transfer.

### C07 — opaque resource registry

Runtime/kind/slot/generation/state identity, parent/child dependencies, permissions, in-flight leases, explicit disposal, finalizer fallback, stale/wrong-kind/cross-runtime rejection, leak/orphan reports, graceful teardown ordering, and dead-epoch rejection after unexpected actor loss.

### C08 — memory

Device/staged/pinned/mapped/managed/mock kinds; size/alignment/bounds; CPU/GPU addressability and visibility; mapping/coherence/synchronization/migration; asynchronous transfer leases; view lifetime; quotas/pressure; release.

### C09 — CompilerActor and device toolchain

NVRTC/nvJitLink discovery, program/linker resources, source/headers/options, logs, PTX/cubin/LTO outputs, cancellation, cache identity, process-global side-effect policy, Linux stack-limit option policy, optional child-process provider, module handoff, and cleanup.

### C10 — module and function

PTX/cubin/fatbin input, module load/unload, function lookup, kernel ABI identity, capability requirements, dependencies, invalidation, and errors.

### C11 — argument and launch plan

Generated scalar/structure/pointer-table packers, memory capabilities/offsets, grid/block/shared memory, stream, attributes, `cuLaunchKernelEx` preference, compatibility launch, resource leases, and preflight.

### C12 — streams, events, completion, and cancellation

Stream/event resources, adaptive query policy, bounded completion queues, terminal records, main-loop responsiveness, deferred-error observation, cancellation truth, and actor shutdown.

### C13 — errors and context health

Validation, unsupported, immediate, deferred, cancellation, pressure, stale resource, suspect/poisoned context, device loss, restart-required state, native name/string, operation provenance, and recovery/teardown rules.

### C14 — security and unsafe capabilities

Trusted schema/package identity, library/symbol allowlists, Node permission flags, no public raw pointers, foreign-view restrictions, unsafe-package separation, provenance, and process-isolation profile.

### C15 — compatibility, cache, packaging, and support

Node/OS/ABI/Driver/toolkit/GPU/schema/provider/artifact identities, migration, package selection, checksums/SBOM, install/uninstall, support matrix, evidence invalidation, and no-addon baseline.

### C16 — conformance and performance

Independent native ABI/CUDA oracles, lifecycle mock limits, consolidated capsules, discovery/skip accounting, fault/mutation tests, exact evidence keys, representative performance methodology, and claim limits.

### C17 — UMCGS public interop

Versioned execution-package/capability manifest, artifact/ABI/resource/launch/completion/error requirements, one compatible-pair capsule, and device-owned search progress after ignition. No search semantics enter CUDA-JS.

## Global invariants

- no consumer semantics;
- no project addon baseline;
- no raw public pointers or arbitrary schemas;
- generated facts and curated semantics remain distinct;
- context-dependent calls stay on the owning DriverActor;
- blocking work stays off the application event loop;
- resources are finite and terminally dispositioned;
- memory semantics are explicit;
- deferred errors retain provenance and health transitions;
- strict JIT is not claimed without qualification;
- mocks do not prove native behavior;
- compatibility/cache/evidence identity is complete.

## Specification sequence

1. C01–C04 for GPU-free EXP-000 and CUDA-specific EXP-001 through EXP-004.
2. C05–C07 for the actor/resource vertical slice.
3. C08 memory foundation.
4. C10–C13 module/launch/completion/error vertical slice.
5. C09 compiler/link/cache.
6. C14–C16 hardening, packaging, conformance, performance.
7. C17 UMCGS interop after public CUDA-JS contracts stabilize.

No broad production implementation proceeds from this map alone. Each family requires an accepted detailed specification and its experiment/conformance gates.
