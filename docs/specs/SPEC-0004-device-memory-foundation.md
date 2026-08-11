# SPEC-0004: Device Memory Foundation

**Status:** Accepted

**Date:** 2026-08-11

## Authorization and outcome

The project owner authorized continued Windows-first implementation on 2026-08-11 after accepting and merging CJS-F3W. This specification authorizes only the bounded CJS-F4 device-memory slice described here.

The native qualification profile remains Windows x86-64, official Node.js v26.7.0, and the accepted CUDA 13.3 Driver/toolkit/GPU identity from SPEC-0002, EXP-012, and SPEC-0003. Memory policy, validation, quotas, byte-copy semantics, and the mock backend are platform-neutral. Native Linux memory execution remains blocked on Linux F2L/F3L Driver qualification.

F4 does not authorize pinned, mapped, managed, unified, pitched, virtual, pooled, imported, exported, or peer memory. It does not authorize asynchronous copies, streams, events, completion polling, foreign views, modules, functions, launch, compilation, cache, packaging, performance claims, or consumer semantics.

Passing F4 means CUDA-JS can safely allocate bounded device memory, copy owned bytes to and from it synchronously on the owning DriverActor, release it explicitly, and prove teardown. It does not make CUDA-JS application-ready by itself.

## Adversarial design assessment

The selected design is a small `runtime.memory` component injected into the existing DriverActor backend. It owns policy validation, quotas, range arithmetic, copied-byte semantics, memory descriptors, and resource lifecycle. The DriverActor continues to own the Worker, context affinity, native calls, error health, command sequencing, and terminal report.

The strongest alternatives were considered:

- **Asynchronous copies with streams.** Rejected for F4 because copy completion, cancellation truth, deferred errors, and in-flight release require the F5 completion contract. Promise-wrapping an asynchronous native call would not prove completion.
- **Pinned or mapped host buffers.** Rejected because host pinning, mapping, pressure, coherence, synchronization, view lifetime, and process cleanup are independent capabilities. Ordinary owned copies establish a safer first slice.
- **Managed memory.** Rejected because migration, page-fault behavior, CPU/GPU visibility, synchronization, and performance vary by platform and device profile.
- **Public foreign or zero-copy views.** Rejected because Node FFI does not provide a lifetime or bounds model and because an external view could outlive its allocation, context, library, Worker, or runtime epoch.
- **Main-thread copies.** Rejected because every context-dependent Driver operation remains on the owning Worker and large host work must not block the application event loop.
- **A memory-only Worker.** Rejected because CUDA device addresses are context-owned and cannot move safely between Workers.

The decisive falsifiers are any byte mismatch with an independent C oracle, any native address crossing the Worker boundary, any out-of-bounds native invocation, any quota bypass, any allocation freed while leased, any stale token resolving after slot reuse, any unproved cleanup labeled clean, or material application-loop blocking.

## Component boundary

### `runtime.memory`

Owns:

- exact memory-policy validation;
- device-byte reservations and quota accounting;
- allocation and transfer range validation using safe-integer byte units;
- owned host-byte copy semantics;
- device-memory descriptors with opaque resource tokens;
- explicit release and memory-specific disposition records;
- portable mock behavior using the same command contract;
- memory conformance and claim limits.

It depends on `runtime.resource-registry` for opaque identity, parent/child order, leases, stale rejection, and terminal inventory. It receives an injected backend for native or mock allocation, copy, query, and release operations. It never chooses a library, symbol, FFI signature, context, Worker, or device.

### `runtime.driver-actor`

F4 extends the accepted DriverActor command allowlist with only the memory operations in this specification. The DriverActor validates and serializes requests, retains context affinity, invokes the injected memory manager on the Worker, and preserves health/error provenance.

No native device address, host staging buffer, FFI wrapper, dynamic library, or context handle appears in a token, descriptor, result, error, inventory, or evidence file.

## Memory kinds and visibility

F4 exposes exactly one memory kind: `device`.

| Property | F4 device memory |
|---|---|
| Physical placement | CUDA device allocation owned by the DriverActor context |
| CPU addressability | none |
| GPU addressability | private native address, never public |
| Host visibility | only through explicit copied read results |
| Device visibility | later launch work may consume the opaque capability after a separate contract |
| Coherence | not shared; each accepted synchronous copy is complete when its promise resolves |
| Migration | none claimed |
| Release | explicit release or child-before-context runtime teardown |
| Mock meaning | lifecycle and byte-copy model only; no CUDA placement claim |

The words pinned, mapped, managed, shared, unified, and zero-copy are not aliases for this capability.

## Runtime configuration

`openDriverRuntime()` accepts an optional exact `memory` policy:

```text
memory.maxDeviceBytes
memory.maxAllocationBytes
memory.maxTransferBytes
```

All values are positive safe-integer byte counts. Unknown fields reject. `maxAllocationBytes` cannot exceed `maxDeviceBytes`. `maxTransferBytes` is independently capped to protect structured-clone and event-loop pressure.

The initial pre-release defaults are:

- `maxDeviceBytes`: 256 MiB;
- `maxAllocationBytes`: 128 MiB;
- `maxTransferBytes`: 16 MiB.

These are runtime safety policy defaults, not CUDA architectural limits or support claims. The device budget may be configured up to one tebibyte, subject to safe-integer representation and actual native capacity. A single copied transfer may be configured up to 64 MiB. Later streaming or chunking APIs require their own contract.

The runtime reports configured policy, reserved bytes, allocation count, and the native free/total snapshot when available. Native capacity is diagnostic and does not replace the stricter configured budget.

## Facade contract

F4 adds asynchronous methods to the existing runtime facade:

```text
runtime.allocateDevice({ byteLength }) -> MemoryDescriptor
runtime.memoryStatus(memoryToken) -> MemoryDescriptor
runtime.writeDevice(memoryToken, bytes, { deviceOffset? }) -> TransferRecord
runtime.readDevice(memoryToken, { deviceOffset?, byteLength }) -> ReadRecord
runtime.releaseMemory(memoryToken) -> ReleaseRecord
```

`MemoryDescriptor` contains only:

- schema version;
- opaque `device-memory` token;
- kind `device`;
- byte length;
- bounded usage summary.

`TransferRecord` contains the same opaque token, device offset, transferred byte length, and usage summary. `ReadRecord` additionally contains a new caller-owned `Uint8Array`. `ReleaseRecord` contains the released kind and length, safe disposer evidence, and post-release usage. No result contains an address.

`bytes` must be a `Uint8Array`. The facade snapshots it into a new ordinary `Uint8Array` before posting the request, so later caller mutation and shared backing storage cannot change the submitted bytes. A read returns a new owned array with no native backing and no relationship to the resource lifetime after the promise resolves.

## Range and quota rules

Byte lengths and offsets are nonnegative safe integers; allocation and read lengths must be positive. Every range is validated without overflowing JavaScript safe-integer arithmetic:

```text
0 <= deviceOffset
0 < byteLength
deviceOffset + byteLength <= allocation.byteLength
byteLength <= policy.maxTransferBytes
```

Allocation rejects before native invocation when:

- the requested length exceeds `maxAllocationBytes`;
- the reservation would exceed `maxDeviceBytes`;
- safe-integer addition would overflow;
- the runtime or context is not live.

Quota is reserved before the native allocation and rolled back if allocation fails. Quota is released only after native free succeeds. A failed or inaccessible free remains reserved and is reported orphaned or unproved; accounting must never imply recovered capacity without cleanup evidence.

## Resource ownership and leases

Every allocation is a `device-memory` child of the private context. The registry stores the private native address and byte length. Only the memory manager can resolve it.

Each read or write acquires a registry lease for the complete native operation and releases it in `finally`. Explicit release rejects while a lease is active. Worker serialization is the current execution mechanism; the lease remains the durable lifetime rule for later asynchronous operations.

Explicit release calls native free once, records the result, removes the allocation from live quota only after success, and terminally invalidates the token. Repeated release, stale generations, wrong kinds, wrong runtimes, forged nonces, dead epochs, and closing/orphaned states reject before native invocation.

Runtime close frees every live device allocation before destroying the context, closing the Driver library, or exiting the Worker. Unexpected Worker loss marks the last known allocations orphaned and retains their reserved byte count; it never claims native free.

## Native Windows profile

The accepted Windows backend adds exactly five generated, allowlisted named exports:

- `cuMemGetInfo_v2`;
- `cuMemAlloc_v2`;
- `cuMemFree_v2`;
- `cuMemcpyHtoD_v2`;
- `cuMemcpyDtoH_v2`.

Their source facts come from the same hash-pinned CUDA 13.3.29 headers as F1B. Their semantic overlay is reviewed separately from imported facts. Public names resolve to exact versioned exports during generation; callers cannot select symbols or signatures.

Before every context-dependent memory operation, the backend verifies the accepted private context remains current on the owning Worker. Native addresses use private unsigned 64-bit representation. Host staging uses private bounded buffers and copies into or out of owned `Uint8Array` values at the Worker boundary.

`CUDA_ERROR_OUT_OF_MEMORY` during allocation is a `pressure` error and does not by itself degrade context health. Other memory Driver failures are immediate for this no-launch slice and transition health conservatively. F5 must revise attribution when earlier asynchronous work can exist.

## Command and byte transport

The command protocol adds only:

- `memory.allocate`;
- `memory.status`;
- `memory.write`;
- `memory.read`;
- `memory.release`.

Payloads have exact fields and bounded values. The result validator accepts `Uint8Array` only as an owned byte copy within the configured transfer limit. It continues to reject `Buffer`, other typed arrays, `ArrayBuffer`, `SharedArrayBuffer`, `DataView`, BigInt, functions, symbols, native objects, and unsupported prototypes.

Memory commands count toward existing user backpressure. The reserved graceful-close command slot remains available even when memory work fills the user queue.

## Linux preparation boundary

The platform-neutral memory manager, mock backend, protocol validation, quota accounting, copied-byte behavior, resource leases, teardown, and loss reporting must run on native Linux or a native Linux CI runner with exact Node 26.7.0.

The pinned schema may be regenerated and verified on native Linux without a GPU because it requires only official headers and a native C compiler. A maintained Ubuntu workflow may produce deterministic generated products for Windows-focused developers and must fail if checked-in products differ.

This preparation does not open `libcuda.so.1`, allocate Linux device memory, or establish Linux CUDA support. The retained Linux implementation handoff must identify the remaining Driver discovery, device, context, memory-call, C-oracle, permission, and cleanup gates for a qualified contributor.

## Required conformance

### Platform-neutral

- exact policy/default/unknown-field validation;
- allocation and transfer boundary partitions, including safe-integer overflow;
- quota reserve, pressure, rollback, reuse, and failed-free accounting;
- byte snapshot isolation from caller mutation;
- full and offset writes/reads with byte-for-byte parity;
- wrong-kind, wrong-runtime, forged, stale, closed, orphaned, and dead-epoch rejection;
- lease fencing and child-before-context teardown;
- bounded result-byte validation and prohibited native-shaped results;
- main-loop responsiveness while the mock Worker performs bounded blocking work;
- unexpected Worker loss with allocation inventory and reserved quota retained.

### Native Windows

- exact generated signatures and named exports for all five calls;
- independent MSVC C-oracle allocation, deterministic pattern write/read, checksum, free, and terminal context cleanup;
- byte-for-byte Node readback of the same deterministic fixtures;
- exact-edge and out-of-bounds controls with no native call on rejection;
- configured pressure before native allocation;
- explicit free, stale rejection, slot reuse, and allocation-before-context teardown;
- native memory capacity observation reduced to safe integer records;
- no address or native storage crossing the Worker boundary;
- Worker exit zero and zero live/closing/orphaned resources after graceful close.

F1A, expanded schema checks, F2W, F3W, documentation, source-boundary, and cleanup gates remain green.

## Exit and downstream authorization

CJS-F4W is complete only when this specification, the `runtime.memory` component contract, deterministic generated schema products, platform-neutral capsule, independent Windows C oracle, exact native DriverActor evidence, terminal cleanup, Linux handoff, and project authority all agree.

Passing F4W unblocks a Windows-only F5 module/launch/completion specification. It does not authorize F5 implementation, Linux native memory support, or any deferred memory profile.
