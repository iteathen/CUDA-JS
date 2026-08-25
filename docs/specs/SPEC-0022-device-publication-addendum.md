# SPEC-0022 Addendum: Device-Scope Release/Acquire Publication

**Status:** Accepted

**Date:** 2026-08-25

**Issue owner:** #123

## Outcome and authority

Accept a second bounded child of proposed SPEC-0022: explicit device-scope release store and acquire load helpers for publishing immutable device-memory payloads through naturally aligned `u32` or `u64` readiness locations.

The project owner's 2026-08-25 instruction to complete issue #123 authorizes this exact child. The remaining shared-memory, warp, multidimensional, local-array, numeric-widening and service-safe families in SPEC-0022 remain proposal-only.

## Critical assessment

A producer must be able to write ordinary device-memory payload fields and then publish readiness. A consumer that observes the matching release through an acquire load must then be able to read those preceding payload writes. Relaxed observation cannot establish that relation, while the existing system-scope publication mailbox is the wrong ownership, address-space and lifecycle boundary.

The selected fixed helper pair is:

```text
gpu.atomic.loadAcquireDevice(pointer, index) -> u32 | u64
gpu.atomic.storeReleaseDevice(pointer, index, value) -> void
```

Operation, order and scope are visible in each name. This reuses the existing pointer-atomic grammar and trusted CCCL profile without introducing raw CUDA enums, order/scope arguments, fences, queues, channels, generation policy or a consumer-domain protocol.

Rejected alternatives:

- release/acquire fences around relaxed operations, because the public need is expressed naturally by operations with the required order;
- an RMW-based load, because observation is not mutation;
- reusing system-scope publication mailboxes, because device-to-device publication does not need host-visible allocation or mailbox lifecycle;
- a generic order/scope options object, because four fixed helpers cover the accepted evidence without opening an unqualified memory-model DSL;
- a queue or search-specific abstraction, because publication is the reusable primitive and queue/generation policy belongs to consumers.

## Exact semantics

Both helpers use `cuda::atomic_ref<T, cuda::thread_scope_device>` from `<cuda/atomic>`:

- `loadAcquireDevice` lowers to `.load(cuda::memory_order_acquire)`;
- `storeReleaseDevice` lowers to `.store(value, cuda::memory_order_release)`;
- supported pointees are exactly `ptr<u32>` and `ptr<u64>`;
- the index is any accepted Device-JS integer type and selects `pointer[index]`;
- a store value must exactly match the pointee type and the store returns `void`;
- the store is valid only as a standalone expression statement; the load is a scalar expression;
- programs using either helper must select `compile.headerProfile: "cuda-cccl"`.

When an acquire load reads a value written by a release store, or by its release sequence under the CUDA memory model, ordinary device-memory writes sequenced before that release happen before ordinary reads sequenced after that acquire within the matching device scope. The helpers do not independently guarantee that a load observes a particular release.

They do not promise freshness, forward progress, fairness, generation matching, a multi-location snapshot, payload immutability, queue correctness or resource policy. Consumers must define readiness values and reject stale or wrong-generation observations at their own contract layer. Concurrent non-atomic access to the readiness location is outside this contract.

Kernel pointer parameters are opaque CUDA-JS device-memory allocations. CUDA allocation base alignment and typed element indexing preserve natural alignment for `u32` and `u64`; arbitrary byte offsets and foreign pointers remain unavailable.

## Failure boundary

Missing or incompatible header profile, helper arity, pointer kind, pointee dtype, index type, store value type and void-expression context reject in Device-JS before CompilerActor dispatch. Unknown order/scope/helper spellings remain rejected. CompilerActor continues to own manifest verification, trusted virtual header bytes, provider identity, compilation and cache behavior.

## Identity and public capability

The complete Device-JS contract identity becomes:

```text
SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0022-device-publication-v1+SPEC-0014-publication-mailbox-v1
```

Helper spelling, normalized compile options, generated header inclusion and exact lowering participate in deterministic program identity. The package prerelease identity advances to `cuda-js@0.1.0-alpha.7`; public API schema version remains 1.

## LEGO ownership

`runtime.device-js` owns syntax, typing, deterministic lowering, diagnostics and program identity. CompilerActor owns trusted CCCL inputs and compilation. DriverActor/execution own launch and native lifecycle. Consumer protocols own payload schema, readiness values, generation validation, retry bounds, queues and recovery. No component receives another owner's native handles, caches or lifecycle.

Deleting the CUDA-MCGS consumer leaves a generic immutable-message publication primitive. A second unrelated work-slot consumer can use the same pair without importing graph-search vocabulary.

## Qualification

Portable evidence must prove:

- exact `u32` and `u64` acquire/release lowering and deterministic identity;
- required CCCL profile plus fail-closed arity/type/context/helper rejection before compiler dispatch;
- absence of the CCCL include for programs that do not use scoped atomic helpers;
- a CUDA-free ordering oracle with immutable-message and unrelated work-slot consumers;
- consumer-layer rejection of early-ready, read-before-acquire, partial-payload, stale-generation and wrong-generation traces;
- package and compatibility projection agreement.

Native Windows installed-package evidence must compile source-only Device-JS through the manifest-verified CUDA 13.3 CCCL profile, publish a multiword payload through both `u32` and `u64` readiness locations, observe exact outputs, and prove balanced CompilerActor/DriverActor teardown. That evidence qualifies only the exact recorded Node/OS/ABI/provider/Driver/GPU revision and does not prove universal scheduler progress.

## Primary authority

- NVIDIA CCCL memory model and message-passing example: <https://nvidia.github.io/cccl/libcudacxx/extended_api/memory_model.html>
- NVIDIA CCCL `cuda::atomic`: <https://nvidia.github.io/cccl/libcudacxx/extended_api/synchronization_primitives/atomic.html>
- NVIDIA CUDA Programming Guide memory synchronization domains: <https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#memory-synchronization-domains>
