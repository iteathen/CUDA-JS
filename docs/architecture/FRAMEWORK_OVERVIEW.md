# CUDA-JS Framework Overview

**Status:** Proposal

CUDA-JS turns pinned CUDA host-API facts and reviewed semantics into a safe asynchronous Node runtime.

```text
offline official-header import
       + reviewed semantic overlays
       + target ABI probes
                │
                ▼
        normalized Runtime IR
                │
     ┌──────────┼─────────────┐
     ▼          ▼             ▼
Node FFI defs  ABI packers  TypeScript/tests/manifests
     │          │
     └────┬─────┘
          ▼
   DriverActor Worker ── CUDA Driver/context/resources/streams/events
          │
          ├── opaque resource registry
          ├── modules/functions/launch plans
          ├── completion/error/health
          └── deterministic teardown

   CompilerActor Worker ── NVRTC/nvJitLink/logs/artifact cache
```

## 1. Schema pipeline

Official headers provide reproducible ABI facts. A curated overlay provides ownership, nullability, lengths, context affinity, blocking/asynchrony, deferred-error, resource, security, cleanup, and support-tier semantics. Unknown public semantics fail closed.

Runtime IR generates Node FFI named-symbol signatures, structure/out-parameter/pointer-table packers, safe public metadata, compatibility manifests, and conformance fixtures.

## 2. Node FFI backend

Node 26 `node:ffi` loads the Driver and optional toolkit libraries. CUDA-JS does not expose it publicly.

Eligible signatures may use Node's generated V8 Fast API trampolines; unsupported signatures use generic libffi. CUDA-JS declares cold/bootstrap versus candidate/required hot profiles and does not claim strict JIT until EXP-004 qualifies it.

The reviewed public API does not create callable functions from arbitrary pointers. `cuGetProcAddress` is therefore a verification/capability mechanism in v0; invocation uses exact approved exports.

## 3. Actors and ownership

The application thread uses an async safe facade. A DriverActor Worker owns one private context and every raw Driver resource. Host state transitions are serialized; GPU concurrency remains available through streams.

A CompilerActor separately owns NVRTC/nvJitLink because compilation/linking may block and has independent resources/cache identity. The default Linux NVRTC profile disables its process-wide stack-limit modification; providers with unavoidable process-global effects use the optional child-process compiler profile.

## 4. Resources and memory

Opaque tokens carry runtime/kind/slot/generation/state identity. The registry owns dependencies, in-flight leases, explicit close, worker shutdown, and leak reports.

Device-local, staged, pinned, mapped, managed, and mock memory are different contracts. Foreign-memory views are internal/unsafe and lease-bound.

## 5. Launch and completion

Generated immutable launch plans retain scalar buffers, pointer tables, resource leases, grid/block/shared-memory values, stream identity, attributes, and operation provenance. Prefer `cuLaunchKernelEx` when supported.

Completion is observed by adaptive actor-side event/stream queries and published through Worker messages. JavaScript callbacks from CUDA-managed threads are excluded.

## 6. Errors and health

Validation, immediate native failure, deferred asynchronous failure, cancellation, stale resources, pressure, suspect/poisoned context, device loss, and restart-required states are distinct. Later observation points retain causal operation identity.

## 7. Device compilation and caching

NVRTC/nvJitLink outputs, logs, options, providers, target architecture, headers, schema/argument layouts, Driver/toolkit versions, and source/artifact bytes form complete content-addressed identities. Host-call and device-artifact identity remain separate.

## 8. Current executable boundary

EXP-000 is promoted after its GPU-free synthetic C/Node FFI ABI, Worker, library-lifetime, and teardown capsules passed on Windows x64 and native Linux x86-64. CJS-F1B owns pinned CUDA facts, reviewed Tier-0 semantics, normalized Runtime IR products, and native ABI/layout probes. Windows CJS-F2W/EXP-012 proves bounded Driver loading, generated exports, procedure verification, private context lifecycle, permission behavior, C-oracle parity, and cleanup. Windows CJS-F3W proves the bounded DriverActor/resource lifecycle, and its platform-neutral control-plane capsule passes on native Linux. Linux CJS-F2L and native Linux DriverActor execution remain deferred/incomplete; later runtime work waits for each platform's accepted predecessors.
