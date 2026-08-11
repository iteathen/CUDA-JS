# SPEC-0005: PTX Module, Launch, and Completion Foundation

**Status:** Accepted

**Date:** 2026-08-11

## Authorization and bounded outcome

The project owner authorized continued Windows-first implementation on 2026-08-11 after CJS-F4W reached a green, review-ready protected-main pull request. This specification authorizes only the bounded CJS-F5W slice below, stacked on the exact accepted F4W head until its independent review gate is satisfied.

F5W loads bounded caller-supplied PTX bytes into the one private DriverActor context, resolves a named function with an explicit parameter schema, launches it on one private nonblocking stream, observes one private event until completion, and resolves the public promise only with a terminal operation record. Device arguments are existing opaque F4 allocations and remain leased through terminal completion. No native handle or address crosses the Worker boundary.

F5W does not authorize cubin, fatbin, Tile IR, files, libraries, NVRTC, nvJitLink, cache, public streams/events, concurrent launches, cancellation, graphs, cooperative launch, dynamic parallelism, external contexts, arbitrary native schemas, Fast FFI claims, performance claims, packaging, consumer semantics, or native Linux CUDA support.

Passing F5W means a generic deterministic kernel can consume opaque device allocations through a declared launch schema and complete with exact independent C parity on the accepted Windows profile. It does not make CUDA-JS application-ready by itself.

## Adversarial design assessment

The selected design is a small `runtime.execution` component injected into the DriverActor. It owns PTX policy, module/function resource contracts, parameter-schema validation, packed launch-buffer layout, launch bounds, memory leases, private event lifecycle, adaptive completion polling, and terminal operation records. The DriverActor backend owns the exact CUDA calls, current-context checks, native handles, error text, and health transitions.

The strongest alternatives were considered:

- **`cuLaunchKernelEx` with a packed `extra` buffer.** Selected. Its four host arguments are smaller than the compatibility launch signature, and the Driver receives an explicit parameter-buffer size. The generated `CUlaunchConfig` layout remains the only structure-offset authority.
- **`cuLaunchKernel` with `void **kernelParams`.** Rejected for F5W because an incorrect caller-declared parameter count could make the Driver read beyond a too-short host pointer table. A sized packed buffer fails more safely and keeps parameter packing in one owner.
- **Public streams, events, and operation tokens.** Rejected because they introduce concurrency, cancellation truth, cross-operation deferred-error attribution, and additional lifetime state before one terminal vertical slice is proven.
- **Synchronous stream/event waiting.** Rejected because it blocks the Worker thread inside a native wait and provides no adaptive polling evidence. The application loop would remain separate, but diagnostics, time bounds, and later evolution would be weaker.
- **Multiple in-flight launches.** Rejected because an event or later Driver call could then surface a failure whose origin is ambiguous. F5W serializes exactly one launch through completion.
- **PTX parsing as a security verifier.** Rejected. A partial parser would create false authority over executable semantics. F5W validates transport, size, identity, parameter storage, and capabilities; arbitrary device-code behavior remains caller responsibility and native failures poison health conservatively.
- **Compilation in F5.** Rejected because provider discovery, compiler side effects, logs, options, artifacts, and cache identity belong to F6.
- **Default-stream launch.** Rejected because implicit synchronization and interaction with stream zero weaken isolation. F5W creates one private `CU_STREAM_NON_BLOCKING` stream.

The decisive falsifiers are any C-versus-Node output mismatch, host parameter-buffer layout mismatch, missing device-memory lease during an in-flight operation, premature promise resolution, ambiguous deferred-error attribution, timeout followed by a false cleanup claim, resource teardown out of dependency order, raw native capability escape, or a blocked application event loop.

## Component boundary

### `runtime.execution`

Owns:

- exact execution-policy validation;
- copied PTX transport validation and SHA-256 identity;
- opaque module and function descriptors;
- declared function parameter schemas;
- launch grid, block, shared-memory, argument, and timeout bounds;
- generated-layout-based `CUlaunchConfig` construction;
- naturally aligned packed parameter buffers and their explicit byte size;
- acquisition and retention of function and device-memory leases;
- one private event per launch and adaptive completion polling;
- terminal completed/failed/timeout operation records;
- portable mock behavior and conformance claim limits.

It depends on `runtime.resource-registry` and an internal memory lease port from `runtime.memory`. It receives injected module, function, stream, event, and launch operations. It never chooses a library, symbol, FFI signature, context, device, or native health transition.

### `runtime.driver-actor`

F5 extends the closed command protocol with only the module/function/launch operations in this specification. The backend verifies the private context before every native operation, binds exact generated named exports, owns CUDA error translation, and reports conservative health.

The Worker has one private nonblocking stream. Only one launch may be submitted and observed at a time. Existing command serialization is the first concurrency mechanism; explicit leases and operation state remain the durable rule.

## Runtime configuration

`openDriverRuntime()` accepts an optional exact `execution` policy:

```text
execution.maxModuleBytes
execution.maxArguments
execution.maxCompletionMilliseconds
```

Unknown fields reject. Values are positive safe integers. Initial defaults are:

- `maxModuleBytes`: 4 MiB, configurable to 64 MiB;
- `maxArguments`: 32, configurable to 64;
- `maxCompletionMilliseconds`: 30,000, configurable to 300,000.

The completion poll begins at one millisecond and doubles to a sixteen-millisecond ceiling. These values bound control-plane pressure; they are not performance promises.

## Facade contract

F5 adds:

```text
runtime.loadModule({ format: "ptx", bytes }) -> ModuleDescriptor
runtime.moduleStatus(moduleToken) -> ModuleDescriptor
runtime.getFunction(moduleToken, { name, parameters }) -> FunctionDescriptor
runtime.functionStatus(functionToken) -> FunctionDescriptor
runtime.launch(functionToken, { grid, block, sharedMemoryBytes?, arguments }) -> CompletionRecord
runtime.releaseFunction(functionToken) -> ReleaseRecord
runtime.releaseModule(moduleToken) -> ReleaseRecord
```

`bytes` must be a nonempty ordinary `Uint8Array` within policy, contain no NUL byte, and contain seven-bit PTX text. The facade snapshots bytes before posting. The runtime appends the one private NUL terminator required by `cuModuleLoadData`. The descriptor reports format, byte length, SHA-256, and an opaque `module` token; it does not return source text or native state.

Function names are nonempty printable ASCII without NUL, slash, or path separators and are limited to 256 bytes. A function is a child of its module. `parameters` is a nonempty bounded array of exact records with one `kind` field. F5 supports only:

- `device-memory` — an opaque F4 allocation capability;
- `u32` — an integer from zero through `2^32 - 1`.

This deliberately narrow signature is sufficient for the independent vector kernel and cannot be silently widened. Later scalar kinds require explicit packer cases and conformance.

Launch dimensions are exact `{x, y, z}` positive safe-integer records. They must not exceed the selected device's queried block/grid limits, block volume must not exceed `maxThreadsPerBlock`, and shared memory must be a nonnegative safe integer no greater than the queried per-block limit. Argument count and kinds must exactly match the function descriptor.

Device arguments are `{ kind: "device-memory", memory, byteOffset? }`. The offset defaults to zero and must select a byte inside the allocation. Scalar arguments are `{ kind: "u32", value }`.

The completion record contains only schema version, status `completed`, module/function identities, launch dimensions, shared-memory bytes, argument-kind summary, poll count, bounded elapsed milliseconds, operation sequence, and health snapshot. It contains no event/stream handle, parameter bytes, module bytes, native address, or device result. Callers read results through F4 copied memory after completion.

## Packed launch ABI

The function descriptor's parameter schema determines a contiguous launch buffer:

- each `device-memory` value occupies eight bytes at eight-byte alignment and is populated only from a live private memory lease;
- each `u32` occupies four bytes at four-byte alignment;
- offsets use checked safe-integer alignment arithmetic;
- the final byte count is explicit and bounded;
- padding is zeroed;
- an empty signature is unavailable in F5W.

The backend builds the `extra` list with private pointer-width storage for `CU_LAUNCH_PARAM_BUFFER_POINTER`, the packed buffer address, `CU_LAUNCH_PARAM_BUFFER_SIZE`, the private `size_t` address, and `CU_LAUNCH_PARAM_END`. `kernelParams` is null. Node's private raw-buffer-address operation is used only inside the owning Worker and never appears in a result, error, inventory, log, or evidence file.

`CUlaunchConfig` is allocated from the generated layout. Every field offset comes from generated ABI facts. F5W uses no launch attributes: `attrs` is null and `numAttrs` is zero.

## Resource and completion lifecycle

The private stream is a context child. Modules are context children, functions are module children, and private completion events are stream children. A function cannot outlive its module. A module with live functions cannot unload.

Before submission, launch acquires one function lease and one lease for every device argument, including repeated arguments. Leases remain held until the event reports terminal success or a terminal device failure. Event recording occurs immediately after successful submission on the same stream.

`cuEventQuery` has three outcomes:

- `CUDA_SUCCESS`: terminal completion; close the event, then release leases and resolve;
- `CUDA_ERROR_NOT_READY`: retain all resources and poll again within the deadline;
- any other result: terminal deferred failure attributed to the sole in-flight operation, poison health, close what can be proved safe, release leases only after terminality, and reject.

An immediate launch rejection before submission closes the unused event and releases leases. A failure after successful submission but before event provenance is established, or a completion timeout, is `restart-required`. The Worker exits without claiming inaccessible native cleanup; the last inventory is orphaned and leases remain recorded. No subsequent operation is accepted in that epoch.

Runtime close rejects no already-queued close slot, but it cannot overtake an active launch. After successful terminal completion, graceful close disposes events, functions, modules, the private stream, device allocations, context, and library in dependency-safe order. Module unload, stream destroy, and event destroy failures make cleanup unproved.

## Native Windows profile

The backend adds exactly ten generated named exports:

- `cuModuleLoadData`;
- `cuModuleGetFunction`;
- `cuModuleUnload`;
- `cuStreamCreate`;
- `cuStreamDestroy_v2`;
- `cuEventCreate`;
- `cuEventRecord`;
- `cuEventQuery`;
- `cuEventDestroy_v2`;
- `cuLaunchKernelEx`.

It adds generated layouts for `CUmodule`, `CUfunction`, `CUstream`, `CUevent`, and `CUlaunchConfig`. Public names, native aliases, signatures, and layouts come from the same pinned CUDA 13.3.29 source facts and reviewed overlay as earlier work.

The semantic basis is NVIDIA's official [module management](https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__MODULE.html), [execution control](https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__EXEC.html), [event management](https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__EVENT.html), and [stream management](https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__STREAM.html) documentation. The overlay, not the C prototype alone, owns F5 lifecycle, blocking, deferred-error, and health meaning.

## Linux preparation boundary

Native Ubuntu CI must regenerate all expanded ABI products with the pinned compiler/header profile and run the execution manager, packer, protocol, mock completion, timeout/loss, lease, and teardown controls under exact Node 26.7.0.

The PTX fixture and independent C oracle are platform-neutral source inputs. The retained Linux handoff must explain how to compile and run the same oracle after F2L/F3L/F4L pass, and how to add a canonical `libcuda.so.1` adapter without changing shared execution semantics.

This preparation does not load a Linux Driver, JIT PTX on a Linux GPU, launch a Linux kernel, or establish Linux CUDA support.

## Required conformance

### Platform-neutral

- exact policy/default/unknown-field bounds;
- copied PTX input, NUL/non-ASCII/empty/oversize rejection, and stable SHA-256;
- exact function-name and parameter-schema validation;
- launch dimension, block-volume, shared-memory, argument count/kind/value, and memory-offset partitions;
- deterministic natural-alignment offsets, total size, zero padding, and mutation controls;
- wrong-kind/runtime, forged, stale, closed, orphaned, and dead-epoch rejection;
- function/module dependency and double-release behavior;
- function and repeated-memory leases through mock completion;
- pending-to-complete polling, bounded application-loop responsiveness, terminal event cleanup;
- deferred mock failure provenance and monotonic health;
- timeout producing restart-required loss state with retained orphan/lease inventory;
- child-before-parent graceful teardown.

### Native Windows

- exact generated signatures, aliases, and Win64 layouts for all ten calls and five types;
- independent MSVC oracle using the same tracked PTX fixture and independently packed parameter buffer;
- exact C-versus-Node output bytes and checksum for deterministic vector addition;
- generated launch-config offsets and packed parameter offsets/size matching the C oracle;
- module/function/stream/event creation, completion polling, explicit function/module release, stale rejection, and slot reuse;
- invalid module, missing function, signature mismatch, invalid launch bounds, and configured timeout controls;
- application event-loop responsiveness while the kernel is in flight;
- terminal zero live/closing/orphaned resources, stream/module/context/library cleanup, and Worker exit zero;
- no raw pointer, native handle, PTX contents, or host parameter storage in public/evidence records.

F1A, expanded schema generation, F2W, F3W, F4W, documentation, source boundaries, and cleanup gates remain green.

## Exit and downstream authorization

CJS-F5W is complete only when this specification, `runtime.execution`, generated products, platform-neutral capsule, tracked PTX fixture, independent MSVC oracle, exact native DriverActor evidence, terminal cleanup, Linux handoff, and project authority agree.

Passing F5W unblocks a Windows-only F6 CompilerActor/NVRTC/nvJitLink/cache specification. It does not authorize F6 implementation, native Linux execution, broader artifact formats, public concurrency, graphs, cancellation, or performance claims.
