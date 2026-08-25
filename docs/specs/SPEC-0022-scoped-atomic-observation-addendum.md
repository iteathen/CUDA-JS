# SPEC-0022 Addendum: Scoped Atomic Observation

**Status:** Accepted

**Date:** 2026-08-24

**Issue owner:** #87

## Outcome and authority

Accept the smallest dependency-ready child of proposed SPEC-0022: explicit relaxed, device-scope atomic load and store helpers for independently meaningful `u32` and `u64` values in trusted Device-JS.

The project owner's 2026-08-24 instruction to complete the CUDA-MCGS P0/P1 prerequisites authorizes this bounded child. The remaining shared-memory, warp, multidimensional, local-array, numeric-widening and service-safe families in SPEC-0022 remain proposal-only.

## Critical assessment

The concrete consumer need is to sample or publish one independently meaningful device-resident word without fabricating a read through an RMW, without ordering an entire operation, and without claiming a multi-location snapshot. The accepted CUDA 13.3 CCCL header profile already owns the required trusted compiler input.

The selected design is a fixed helper pair:

```text
gpu.atomic.loadRelaxedDevice(pointer, index) -> u32 | u64
gpu.atomic.storeRelaxedDevice(pointer, index, value) -> void
```

The spelling makes operation, order and scope visible at the call site. It avoids raw CUDA enum inputs, optional defaults, a second memory model, and a premature generic atomic-options abstraction. Acquire/release/system/block variants remain unavailable until a concrete consumer and native oracle justify them.

Rejected alternatives:

- emulating load with `atomicAdd(..., 0)` because an observation is not an RMW;
- using legacy exchange for store because the accepted operation is a store, not an RMW;
- implicit order/scope defaults because source should expose the semantic profile it requests;
- stronger acquire/release or system scope because they add ordering/cost not required by independent device observations;
- raw integer order/scope arguments because CUDA-JS owns a closed helper grammar;
- pulling in shared memory, warp primitives or multi-operation scheduling because those have separate owners and evidence gates.

## Exact semantics

Both helpers lower through NVIDIA `cuda::atomic_ref<T, cuda::thread_scope_device>` from `<cuda/atomic>` with `cuda::memory_order_relaxed`.

- Supported pointees are exactly `ptr<u32>` and `ptr<u64>`.
- The index is any accepted Device-JS integer type and addresses `pointer[index]`.
- Store values must exactly match the pointee type and store returns `void`.
- Store is valid only as a standalone expression statement. Load is a scalar expression.
- Device scope means atomicity applies among GPU threads in the same device and CUDA memory synchronization domain.
- Relaxed order guarantees atomicity for the selected location but establishes no ordering for unrelated memory.
- Each load returns one valid value from the location's atomic modification order. It does not promise freshness, progress, a multi-location snapshot, cross-field coherence, or physical overlap between operations.
- Mixing these helpers with non-atomic concurrent access to the same location is outside the contract.

Kernel pointer parameters are opaque CUDA-JS device-memory allocations. CUDA allocation base alignment and typed element indexing preserve the required natural alignment for `u32` and `u64`; arbitrary byte offsets and foreign pointers remain unavailable. Shared and host-visible address spaces are not accepted by this slice.

## Compiler profile and failure boundary

Programs using either helper must explicitly select:

```json
{ "compile": { "headerProfile": "cuda-cccl" } }
```

Missing or incompatible profile, helper arity, pointer kind, dtype, index type, store value type and void-expression context reject in Device-JS before CompilerActor dispatch. CompilerActor remains the sole owner of manifest verification, virtual header bytes, provider identity, compilation and cache behavior.

## Identity and public capability

The Device-JS contract identity becomes:

```text
SPEC-0013-v1+SPEC-0022-atomic-observation-v1
```

Helper spelling, normalized compile options, generated `<cuda/atomic>` inclusion and exact lowering participate in deterministic program identity. The package prerelease identity advances to `cuda-js@0.1.0-alpha.6`; public API schema version remains 1.

## LEGO ownership

`runtime.device-js` owns syntax, typing, deterministic lowering, diagnostics and program identity. CompilerActor owns the trusted CCCL profile and compilation. DriverActor/execution own launch and native lifecycle. No component receives another owner's native handles, cache, stream, event, resource lifecycle or consumer-domain semantics.

If the first consumer is deleted, these helpers remain a generic independently useful Device-JS atomic-observation capability. A second unrelated consumer can use the same exact contract without importing consumer vocabulary.

## Qualification

Portable evidence must prove:

- deterministic contract/source identity;
- exact `u32` and `u64` lowering;
- required CCCL profile and fail-closed arity/type/context rejection;
- absence of `<cuda/atomic>` for programs that do not use the helpers;
- compatibility/package projection agreement.

Native Windows evidence must compile source-only Device-JS through the installed package and manifest-verified CUDA 13.3 CCCL profile, execute both widths, compare exact independent outputs, and prove balanced CompilerActor/DriverActor teardown. That oracle qualifies only its exact recorded Node/OS/ABI/provider/Driver/GPU revision.

## Primary authority

- NVIDIA CUDA Programming Guide, C/C++ language extensions: <https://docs.nvidia.com/cuda/cuda-programming-guide/05-appendices/cpp-language-extensions.html>
- NVIDIA CCCL memory model and thread scopes: <https://nvidia.github.io/cccl/libcudacxx/extended_api/memory_model.html>
- NVIDIA CCCL `cuda::atomic`: <https://nvidia.github.io/cccl/libcudacxx/extended_api/synchronization_primitives/atomic.html>
