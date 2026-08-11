# CUDA-JS Starting-Plan Technical Assumption Audit

**Status:** Research Note

**Date:** 2026-08-10

## Update after Node 26 FFI research

The original audit correctly rejected a mixed Node-API/direct-V8 claim and separated host JIT from NVRTC. Node 26.1–26.7 now provides experimental `node:ffi`, including generated V8 Fast API trampolines for eligible signatures.

The accepted host-binding decision is now ADR-0002: use Node FFI first, require its JIT-capable envelope for designated hot calls, permit generic fallback only in a declared cold/bootstrap profile, and retain custom JIT work only for measured gaps.

This supersedes the earlier assumption that CUDA-JS itself should begin by generating architecture-specific call stubs.

## Sound starting ideas

- Schema-driven API/layout generation makes CUDA-version updates bounded and testable.
- Strict native boundaries, explicit `CUresult` handling, finite resource ownership, compiler logs, mock execution, and asynchronous event-loop delivery are appropriate.
- Flat aligned device layouts and bounded control state are useful capabilities but remain consumer/runtime data rather than one universal arena.
- `cuGetProcAddress()` is a strong basis for requested API-version and semantics verification.

## Corrections retained

### Node FFI is substrate, not safety model

Node FFI is explicitly unsafe and does not track pointer validity, memory bounds, ownership, or native object lifetime. CUDA-JS must keep it private behind opaque resources and generated packers.

### Named symbols versus arbitrary pointers

The reviewed public Node FFI API wraps named dynamic-library symbols. It exposes raw function pointers but not a general callable-from-pointer constructor. CUDA-JS must not assume direct invocation of the pointer returned by `cuGetProcAddress()`.

### Fast versus generic FFI

Node uses generated Fast API trampolines only for eligible signatures/platforms and falls back to generic libffi otherwise. CUDA-JS must classify and validate hot calls rather than assuming every wrapper is JIT-dispatched. The reviewed Node 26.7 source has materially different envelopes on Linux x86-64, ARM64, and Windows x86-64; support and performance claims therefore key the exact Node build and ABI.

### Synthetic qualification precedes CUDA

A real CUDA smoke test mixes Node FFI, native packing, dynamic loading, Driver availability, context behavior, GPU state, and CUDA semantics. EXP-000 first uses a generated synthetic C library and direct C oracle to isolate the Node FFI, packer, Worker, lifetime, cleanup, and arbitrary-function-pointer questions without CUDA.

### NVRTC scope

NVRTC compiles CUDA C++ device code and produces PTX/cubin. It does not compile the Node host bridge. Host binding and device compilation remain different owners and cache identities.

### Managed memory is not a universal zero-copy arena

Page migration, coherence, operating-system behavior, and device capabilities matter. Device-local memory remains the hot-state baseline. Pinned/mapped control windows and managed memory are explicit optional profiles.

### “Zero-copy” is too imprecise

Contracts separately state physical placement, CPU/GPU addressability, mapping, migration, coherence, synchronization, transfer/page-fault cost, ownership, bounds, and lifetime.

### Host micro-batching is not a universal scheduler

A host relaunch loop is an optional generic mode. It cannot satisfy a consumer requirement for device-owned active progress when each relaunch advances the algorithm.

### Mock versus native oracle

The mock validates lifecycle and orchestration. It does not prove CUDA memory ordering, numerical behavior, timing, JIT use, or consumer semantics.

### Atomic fields need a protocol

Flags and generations do not define ownership, memory ordering, visibility, ABA/wrap, cancellation, terminal error, reset authority, or stale-reader behavior.

### Error propagation needs context health

CUDA calls may surface earlier asynchronous errors. Some failures make continued context or process use unsafe. Provenance and health transitions are required.

## Required experiments

The authoritative list is maintained in [`../architecture/FOUNDATION_ASSESSMENT_AND_PLAN.md`](../architecture/FOUNDATION_ASSESSMENT_AND_PLAN.md). It includes GPU-free synthetic Node FFI qualification, real CUDA smoke/fast-path behavior, direct symbols versus `cuGetProcAddress`, ABI/struct probes, worker context affinity, completion, deferred errors, memory/view lifetimes, NVRTC/nvJitLink, optional process isolation, and arbitrary-pointer/JIT gaps.

## Disposition

Retain the original sketch as design-history input. Use ADR-0002 and the foundation assessment as the current direction. Do not begin production implementation until the relevant contracts and experiments pass.

## Current accepted disposition

ADR-0002 and ADR-0003 refine this audit:

- Version zero uses Node 26 built-in FFI and ships no CUDA-JS project addon in the selected baseline; the durable prohibition is against hand-written or ahead-of-time per-CUDA-function wrappers.
- Node's Fast API JIT is reused where eligible, but a strict JIT claim requires exact-profile qualification.
- `cuGetProcAddress` verifies version/status/semantics; v0 invokes exact approved exported symbols.
- ABI facts are generated from pinned official headers; lifecycle/security/asynchrony remain a reviewed overlay.
- One DriverActor owns one private context; a separate CompilerActor owns NVRTC/nvJitLink.
- Project-owner authorization advanced GPU-free EXP-000, schema/ABI F1B, and the bounded Windows EXP-012 Driver bootstrap. Native Linux EXP-001 remains retained, deferred, and incomplete; production actors, a custom AsmJit, and broad CUDA implementation remain separately gated.
