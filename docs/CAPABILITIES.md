# CUDA-JS Capabilities and Boundaries

**Status:** Informational

**Updated:** 2026-08-12

This page is the discoverable capability map for CUDA-JS. It summarizes accepted behavior, current qualification limits, and deliberately deferred capability families without replacing the accepted ADRs and specifications. When this page and an accepted specification differ, the accepted specification is authoritative.

CUDA-JS is a **schema-driven, no-project-addon, asynchronous Node.js runtime and toolchain for NVIDIA CUDA host APIs**. It is not a neural-network framework, not a search framework, not a raw-pointer FFI wrapper, and not a fixed one-kernel/one-stream architecture. Its current public profiles are intentionally narrower than its architectural extension surface.

## Executive summary

CUDA-JS currently provides, on its qualified Windows x64 profile:

- Node 26 experimental `node:ffi` as the private host-call substrate, with no CUDA-JS-specific compiled N-API addon in the baseline;
- generated CUDA ABI facts, private FFI definitions, argument packers, semantic overlays, compatibility products, and fail-closed unsupported declarations from pinned official CUDA headers;
- a dedicated `DriverActor` Worker that owns one CUDA context and all raw Driver resources for one runtime;
- opaque public resource capabilities instead of public CUDA pointers or handles;
- bounded device-memory allocation, copied host-to-device/device-to-host transfers, quotas, range checks, leases, stale-generation rejection, and explicit teardown;
- PTX/cubin module loading, named function resolution, packed kernel arguments, launch validation, a private nonblocking CUDA stream, private CUDA events, adaptive completion polling, deferred-error attribution, and deterministic cleanup;
- an optional separate `CompilerActor` Worker using NVRTC and nvJitLink;
- runtime CUDA C++ source compilation to PTX, PTX linking to cubin, compiler/linker logs, provider identity, deterministic artifact identity, and a validated content-addressed cache;
- a trusted, path-free CUDA CCCL header profile that can compile `<cuda/atomic>` through the public facade;
- exact tested device-scope release/acquire atomic publication through generated device code;
- multiple simultaneous CUDA-JS runtime instances with ownership isolation and cross-runtime capability rejection;
- an asynchronous public ESM facade that keeps potentially blocking native Driver/compiler work off the Node.js application event loop;
- exact support/qualification metadata that distinguishes proven profiles from testing-unconfirmed and unsupported profiles.

Important current limits are equally explicit:

- one public runtime currently permits **one in-flight kernel launch at a time**;
- public caller-controlled streams/events and multi-stream concurrent launches are not yet accepted;
- multi-GPU, MIG, managed/pinned/mapped memory, CUDA Graph execution, graphics interop, external contexts, process isolation, broad arbitrary kernel signatures, and native Linux CUDA execution are not currently qualified public capabilities;
- device LTO is planned under the existing CJS-F6 compiler owner but is not yet an accepted production capability;
- CUDA-JS does not bundle cuBLAS, cuDNN, tensor/autodiff logic, neural-network semantics, MCGS/search semantics, or application scheduling policy.

Those limits describe the **current qualified profile**, not an assumption that the underlying CUDA capability is impossible to add. New capability families require explicit contracts, ownership, compatibility rules, conformance, and exact native evidence before promotion.

## What CUDA-JS is — and is not

### CUDA-JS is not a custom native addon

The version-zero baseline intentionally ships **no CUDA-JS-specific compiled addon**. CUDA-JS uses Node's experimental `node:ffi` privately from Worker-owned components. Approved CUDA symbols and ABI shapes come from generated schema products rather than a handwritten wrapper family.

This is different from a conventional N-API addon. A custom addon can certainly implement asynchronous Workers, NVRTC, streams, graphs, memory pools, or any other CUDA feature, but it must implement and maintain those contracts itself. CUDA-JS's purpose is to provide those capabilities through generic, versioned, evidence-backed runtime contracts without exposing raw native authority.

See [`ADR-0002`](decisions/ADR-0002-node-ffi-first-host-binding.md), [`SPEC-0001`](specs/SPEC-0001-cuda-schema-compiler.md), and the [target architecture](architecture/TARGET_ARCHITECTURE.md).

### CUDA-JS is not a Node threadpool wrapper around a global CUDA queue

Driver operations are owned by a dedicated `DriverActor` Worker with a private CUDA context. Compilation/linking is owned by a separate `CompilerActor` Worker. The application thread communicates through bounded asynchronous commands and Promises.

The current execution implementation uses a **private `CU_STREAM_NON_BLOCKING` stream** and a **private CUDA event per launch**. Completion is observed with adaptive event polling. CUDA-JS does not simply hardcode all launches to legacy stream zero.

See [`SPEC-0003`](specs/SPEC-0003-driver-actor-resource-lifecycle.md) and [`SPEC-0005`](specs/SPEC-0005-module-launch-completion.md).

### CUDA-JS is not a raw-pointer API

Native CUDA handles and device addresses stay inside the owning Worker. Public JavaScript receives opaque capabilities for device memory, modules, and functions. Public callers cannot choose arbitrary native libraries, arbitrary symbols, arbitrary FFI signatures, provider paths, or unchecked executable schemas.

This is an intentional ownership and safety boundary, not an inability to use CUDA pointers internally.

### CUDA-JS is not a neural-network or search framework

CUDA-JS owns the generic CUDA runtime/toolchain boundary. Consumers own tensor layouts, autograd, neural-network layers, optimizers, MCGS/MCTS/search semantics, model architecture, batching policy, and domain-specific device programs.

CUDA-JS can compile or load consumer CUDA device programs and keep their state in device memory, but it does not claim that its generic runtime is itself a deep-learning library or search engine.

## Current capability surface

### 1. Schema-driven CUDA host binding

CUDA-JS generates host ABI products from pinned official CUDA headers and a separately reviewed semantic overlay. The current generated foundation includes reviewed Driver calls and type/layout facts, private Node FFI definitions, packers, compatibility data, conformance products, and a fail-closed catalog for declarations that have not been accepted.

The distinction matters: a C prototype alone is not treated as authority for lifetime, blocking, error propagation, stream semantics, cleanup, or safe public exposure.

Current properties include:

- exact Node/OS/ABI/CUDA-header identity;
- generated named-symbol definitions;
- generated structure and argument packing;
- semantic/lifecycle overlays reviewed separately from ABI facts;
- native C/MSVC parity probes;
- fail-closed unknown public semantics;
- no handwritten general-purpose raw CUDA function surface.

### 2. Asynchronous Driver ownership

One `DriverActor` Worker owns one private CUDA context by default. It owns context affinity and every raw Driver resource for that runtime.

The runtime tracks:

- runtime epochs;
- resource kinds;
- slots and generations;
- nonces/state validation;
- parent/child ownership;
- in-flight leases;
- explicit close order;
- stale, wrong-kind, wrong-runtime, closed, orphaned, and dead-epoch rejection;
- recoverable, suspect/poisoned, and restart-required health transitions where applicable;
- graceful terminal inventory;
- honest orphan accounting after unexpected Worker loss.

Potentially blocking native work therefore does not execute on the Node.js application event loop.

### 3. Device memory and GPU-resident state

The accepted memory profile exposes ordinary CUDA device memory through opaque capabilities.

Current behavior includes:

- `cuMemAlloc`-class device allocation through generated Driver bindings;
- configurable runtime quota and per-allocation/transfer bounds;
- checked safe-integer offset/range arithmetic before native invocation;
- copied `Uint8Array` writes and reads with caller snapshot isolation;
- resource leases during native transfers;
- explicit release and quota recovery only after native free is proved;
- allocation-before-context teardown;
- stale-generation rejection after slot reuse;
- no public device address.

**Device memory persists across kernel launches until explicitly released or disposed during runtime teardown.** CUDA-JS does not require intermediate device data to be copied back to the CPU between launches. A consumer may keep weights, activations, gradients, search state, replay state, work queues, or other application-defined bytes resident in device memory and pass the same opaque allocations to later kernels.

The current memory contract deliberately does **not** market managed, unified, pinned, mapped, pooled, imported/exported, peer, or zero-copy memory as aliases for ordinary device memory. Those are separate capability families because placement, migration, coherence, synchronization, pressure, and lifetime differ.

See [`SPEC-0004`](specs/SPEC-0004-device-memory-foundation.md).

### 4. Module, function, launch, stream, and completion

CUDA-JS currently supports a bounded execution slice with:

- PTX and cubin module loading through the accepted facade;
- named function lookup;
- declared kernel parameter schemas;
- naturally aligned packed launch-buffer construction;
- device-memory and `u32` parameter kinds in the current public profile;
- grid/block/shared-memory validation against queried device limits;
- one private nonblocking CUDA stream;
- one private event per in-flight launch;
- event-based terminal completion;
- adaptive nonblocking polling;
- function and memory leases held through terminality;
- immediate/deferred error attribution;
- timeout handling that fails the runtime conservatively rather than claiming inaccessible cleanup;
- explicit function/module release and dependency-safe teardown.

A single CUDA kernel is still massively parallel across GPU threads, warps, blocks, and SM resources. The current **one-in-flight-launch** rule describes host-side submission/attribution policy for one runtime; it does not mean the GPU executes a kernel serially.

See [`SPEC-0005`](specs/SPEC-0005-module-launch-completion.md).

### 5. Concurrency: the uncompressed model

"Concurrency" can mean several different things. CUDA-JS currently has some forms and deliberately defers others.

| Concurrency dimension | Current CUDA-JS status |
|---|---|
| Node application event loop vs native CUDA work | Yes. Driver/compiler native work is off the application thread. |
| GPU threads/warps/blocks within a kernel | Yes. Normal CUDA device parallelism. |
| DriverActor vs CompilerActor ownership | Separate Workers and queues. No claim that every operation overlaps or improves performance. |
| Multiple CUDA-JS runtime instances | Isolation is proven; cross-runtime resources reject. This is not a performance claim about overlapping GPU execution. |
| Multiple kernels in flight on caller-controlled streams in one runtime | Not currently public/qualified. Current profile is single-flight. |
| Public stream/event capability objects | Not currently public/qualified. |
| Multiple GPUs/MIG | Not currently supported. |

The target architecture already models memory/module/function/**stream/event/operation** resources as separate bricks. Therefore the current single-flight rule is an accepted **profile boundary**, not a claim that multi-stream support is architecturally impossible. Adding public multi-stream/concurrent launch requires new rules for ownership, ordering, event provenance, deferred errors, cancellation, resource leases, backpressure, teardown, and native evidence.

See the [target architecture](architecture/TARGET_ARCHITECTURE.md) and [`SPEC-0008`](specs/SPEC-0008-package-public-facade.md).

### 6. Runtime compilation and linking

CUDA-JS has a separate `CompilerActor` Worker for NVRTC and nvJitLink. Runtime compilation is optional; a consumer may also load already-produced PTX/cubin without compiling source during the hot path.

Current compiler/toolchain behavior includes:

- canonical CUDA toolkit/provider discovery for the accepted profile;
- exact provider version/file/digest identity;
- bounded copied CUDA C++ source and logical header inputs;
- typed compile options rather than free-form native option escape hatches;
- NVRTC source-to-PTX compilation;
- nvJitLink PTX-to-cubin linking;
- copied compiler/linker logs;
- deterministic artifact metadata;
- content-addressed compile/link cache keys covering material provider/request identity;
- cache manifest and artifact digest validation on every hit;
- corruption rejection/quarantine;
- exact-key invalidation;
- copied PTX/cubin handoff to the Driver runtime;
- CompilerActor resource cleanup and conservative restart-required state after unproved native destruction.

**CUDA-JS does not require recompilation on every kernel launch.** Compilation can occur during setup, artifacts can be cached, and PTX/cubin can be loaded later. The compiler is a toolchain capability, not a mandatory hot-loop stage.

See [`SPEC-0006`](specs/SPEC-0006-compiler-linker-cache.md).

### 7. Trusted CUDA C++ headers and atomics

The accepted compiler surface includes one path-free `cuda-cccl` header profile. CUDA-JS verifies and snapshots the exact manifest-owned CUDA 13.3 `cuda/` and `nv/` virtual-header roots before cache lookup rather than accepting an ambient include path.

The current native evidence includes public-facade compilation of `<cuda/atomic>` and one two-thread device-scope release/acquire publication fixture with terminal Driver/Compiler cleanup.

This proves a generic CUDA C++ atomic-publication capability through the public runtime. It does not claim arbitrary CCCL support, a scheduler, search correctness, or performance.

See [`SPEC-0009`](specs/SPEC-0009-trusted-toolkit-headers-and-cuda-mcgs-interop.md).

### 8. Content-addressed device artifacts

Compiler and linker outputs have deterministic, provider-aware identities. Cache records separate compile and link operations and include normalized options, provider versions/digests, source/header/input digests, artifact type, lengths, and output identity.

A cache hit is not trusted by filename alone. CUDA-JS revalidates the manifest, key, provider/request identity, artifact type, byte length, and digest before returning bytes.

This makes runtime compilation compatible with build-once/cache/reuse workflows rather than forcing source compilation into latency-sensitive execution loops.

### 9. Public package and independent consumers

The public package is ESM-only and no-addon in the CUDA-JS-specific sense. Its public exports are deliberately smaller than the repository internals.

The facade exposes safe capability objects for device memory, modules, functions, and optional compilation/linking. Actor tokens, provider paths, context/stream/event handles, and raw native storage are hidden.

The accepted package evidence includes:

- tarball inspection;
- clean install/import/uninstall;
- first-consumer-deletion checks;
- unrelated synthetic consumers;
- simultaneous runtime-instance isolation;
- cross-runtime capability rejection;
- installed-package native kernel execution on the qualified Windows profile;
- aggregate terminal close.

See [`SPEC-0008`](specs/SPEC-0008-package-public-facade.md).

## GPU residency and device-resident workloads

CUDA-JS supports the host-side mechanisms needed to keep application state resident in ordinary device memory across sequential launches:

```text
host configuration/source
        |
        +--> optional NVRTC/nvJitLink setup/cache
        |
        v
device allocations + module/function capabilities
        |
        v
kernel A -> device state -> kernel B -> device state -> kernel C
```

Nothing in the accepted memory/launch contract requires intermediate device state to egress to JavaScript between those kernels. Host orchestration and host data egress are separate concepts.

CUDA-JS does **not**, by itself, define a universal device-resident scheduler or claim that every application's control flow continues on the GPU after one ignition call. That is consumer semantics. A consumer that requires device-owned progress must provide device programs and a compatible execution/scheduling design, and CUDA-JS must expose any generic CUDA substrate that design genuinely needs through accepted capability contracts.

Likewise, device-resident execution does not imply one mandatory realization such as a persistent kernel. Persistent kernels, device-launched/conditional CUDA Graphs, multi-kernel device-resident workflows, cooperative execution, thread-block clusters, or hybrids are separate design choices whose support depends on the generic CUDA capabilities a consumer actually requires.

See [`INTEROP_WITH_CUDA_MCGS.md`](INTEROP_WITH_CUDA_MCGS.md) for the generic consumer boundary.

## Memory lifetime is explicit, not garbage-collection-driven

CUDA-JS does not rely on V8 garbage collection to free native CUDA resources. Public memory/module/function capabilities have explicit close/release behavior, and runtime close owns deterministic child-before-parent teardown. Finalizers are not the primary lifecycle mechanism.

This means native allocation lifetime is governed by runtime/resource state, leases, and explicit disposition—not by when JavaScript happens to garbage-collect a wrapper object.

## Fault isolation: what is and is not isolated

CUDA-JS currently provides **event-loop isolation and resource-owner isolation**, not full process crash isolation.

Current guarantees/behavior include:

- potentially blocking native Driver/compiler work does not run on the application event loop;
- raw context/resource state is confined to owning Workers;
- unexpected Worker loss invalidates the runtime epoch and reports restart-required/orphaned state without pretending inaccessible native resources were cleaned up;
- native errors are normalized into bounded public errors and health transitions where the process remains alive.

A Node Worker is still in the same OS process. A fatal native crash can terminate the process. Process isolation is a separate deferred capability/profile, not something CUDA-JS falsely claims to have already solved.

## Runtime JIT is optional, not a production requirement

CUDA-JS supports both of these usage patterns:

```text
precompiled PTX/cubin -> load -> launch
```

and:

```text
CUDA C++ source -> NVRTC -> PTX -> nvJitLink -> cubin -> cache -> load -> launch
```

A consumer can compile during installation, startup, model/search-image preparation, or another cold path and reuse cached artifacts. The existence of NVRTC/nvJitLink in CUDA-JS does not require source compilation during each training step, search iteration, or kernel launch.

## Device LTO status

Device LTO is **planned, not currently accepted production behavior**.

The current CJS-F6-LTO plan keeps PTX as the default compile path and proposes a typed `lto-ir` artifact plus homogeneous typed LTO-IR-to-cubin linking under the existing CompilerActor/cache owner. The plan deliberately excludes a raw nvJitLink escape hatch, raw untyped LTO-IR, mixed PTX/LTO-IR first-slice linking, staged partial linking, and cross-major compatibility claims.

Production LTO implementation remains blocked on a new bounded specification plus exact EXP-009 LTO evidence.

See the [`CJS-F6-LTO` master-plan section](plans/2026-08-10-master-plan.md#cjs-f6-lto--bounded-typed-device-lto-follow-up-p2) and the [LTO assessment](research/2026-08-11-lto-support-assessment.md).

## Capability families: current, planned, and not yet qualified

| Capability | Status | Meaning |
|---|---|---|
| Node FFI CUDA host binding | Accepted/qualified on exact profiles | Private generated FFI over approved named exports. |
| DriverActor Worker/context ownership | Accepted | One private context per runtime by default. |
| Device memory | Accepted | Bounded ordinary device allocations and copied transfers. |
| GPU-resident state across launches | Accepted consequence of device-memory + launch contracts | No mandatory intermediate host read. |
| PTX module execution | Accepted | Bounded copied PTX load/function/launch/completion. |
| Cubin module execution | Accepted through F6/F8 path | Copied cubin artifact can be loaded/executed. |
| Private nonblocking stream/event completion | Accepted | Current implementation detail of bounded execution contract. |
| Public concurrent launches/multi-stream | Not yet accepted | Current public profile is one in-flight launch per runtime. Architecturally extensible. |
| Public stream/event objects | Not yet accepted | Separate future resource/capability contracts. |
| Multiple runtime instances | Accepted isolation behavior | Isolation/cross-runtime rejection, not a GPU-overlap performance claim. |
| Multi-GPU / MIG | Not supported | Requires separate device/resource/compatibility contracts and evidence. |
| NVRTC source compilation | Accepted | Optional CompilerActor source-to-PTX path. |
| nvJitLink PTX-to-cubin | Accepted | Optional CompilerActor link path. |
| Content-addressed compiler/link cache | Accepted | Validated provider/request/artifact identity. |
| Trusted CCCL `cuda/` + `nv/` profile | Accepted on exact Windows CUDA 13.3 profile | Path-free verified virtual headers. |
| `<cuda/atomic>` device-scope publication | Accepted bounded evidence | Generic atomic publication fixture only. |
| Device LTO | Planned | Requires new spec + native evidence before implementation promotion. |
| Managed/unified memory | Not yet accepted | Separate memory kind; not required for ordinary device residency. |
| Pinned/mapped host memory | Not yet accepted | Separate placement/coherence/lifetime contracts. |
| Memory pools/async allocation | Not yet accepted | Requires separate pressure/stream/lifetime semantics. |
| CUDA Graphs | Not yet accepted | Candidate future execution/scheduling capability, not current public contract. |
| Cooperative/dynamic/device-side scheduling features | Not generally qualified | Consumer/device semantics require exact generic capability contracts and evidence. |
| Process-isolated Driver/compiler backend | Deferred option | Current Workers isolate event-loop/resource ownership, not fatal process crashes. |
| Graphics/OpenGL interop | Not currently supported | Separate external-resource ownership/lifetime problem. |
| cuBLAS/cuDNN/tensor framework | Not bundled | CUDA-JS is a generic runtime/toolchain; consumers may integrate separate libraries under future contracts if required. |
| Native Linux CUDA execution | Incomplete/deferred | Portable controls pass; native Driver/compiler/GPU qualification remains separate. |
| Linux ARM64 / WSL2 native CUDA | Not qualified | Separate platform profiles. |

## Common classification errors

### "CUDA-JS is a prebuilt native C++ addon."

False. The baseline is Node-FFI-first and deliberately ships no CUDA-JS-specific compiled addon.

### "CUDA-JS runs CUDA work on Node's main thread or a generic threadpool."

False. CUDA Driver ownership is in a dedicated `DriverActor` Worker; compiler/linker ownership is in a separate `CompilerActor` Worker.

### "CUDA-JS uses only the legacy default CUDA stream."

False for the accepted execution path. CUDA-JS owns a private nonblocking stream and private completion events. What is currently missing is **public multi-stream/concurrent-launch control**, not all stream/event usage.

### "One in-flight launch means CUDA-JS has no GPU concurrency."

False. One-in-flight is a host submission/error-attribution rule for the current runtime profile. CUDA kernels still execute with ordinary massive GPU parallelism. Multi-stream overlapping kernel submission is a distinct, currently unqualified capability.

### "Single-flight is the permanent CUDA-JS architecture."

False. Streams, events, operations, memory kinds, and other resource families are explicit architectural bricks. Widening the current profile requires a new accepted contract and evidence rather than bypassing ownership rules.

### "CUDA-JS allocations are released when V8 garbage-collects wrapper objects."

False. Native resource lifetime is explicit and registry-owned. Explicit close/release is primary; deterministic runtime teardown disposes children before parents.

### "Managed/Unified Memory is required to keep a workload on the GPU."

False. Ordinary device memory persists across launches and is directly consumable by later kernels. Managed memory is a separate placement/migration/coherence capability.

### "Using CUDA-JS means compiling CUDA source during every hot-loop operation."

False. Runtime compilation is optional, cacheable, and separable from execution. Precompiled PTX/cubin can be loaded directly.

### "Host orchestration means intermediate data must return to JavaScript."

False. A host may submit sequential kernels while their application-defined intermediate state remains in device memory.

### "A Worker means CUDA-JS has process crash isolation."

False. Workers provide event-loop/resource ownership isolation inside one process. Full process isolation is a separate deferred profile.

### "A raw native addon can support CUDA features that CUDA-JS can never support."

Too broad. A custom addon can expose any CUDA feature its author implements, including unsafe/raw surfaces. CUDA-JS intentionally requires generic CUDA features to enter through bounded capability contracts with ownership, compatibility, lifecycle, and native evidence. The current public surface is narrower, but that is not the same as an architectural inability to add multi-stream execution, new memory kinds, graphs, LTO, or other generic CUDA capabilities.

## Current qualification boundary

CUDA-JS is a public alpha. Exact support claims are intentionally narrower than operational possibilities.

At the time of this document:

- exact Node 26.7.0 is the qualified Node evidence baseline;
- Windows x64 on the recorded CUDA 13.3/Driver/GPU profile carries the current native qualification evidence;
- other FFI-capable Node 26.1.0-or-later and structurally admissible Windows CUDA profiles may operate as `testing-unconfirmed` without inheriting support;
- native Linux Driver/compiler/GPU execution remains incomplete;
- portable Linux controls do not imply native Linux CUDA support;
- performance claims require separate representative measurement and are not inferred from functional correctness.

For exact support state, read [`NODE_SUPPORT.md`](NODE_SUPPORT.md) and [`HARDWARE_SUPPORT.md`](HARDWARE_SUPPORT.md).

## Primary capability vocabulary

CUDA-JS is relevant to searches for: **Node.js CUDA**, **NVIDIA CUDA Driver API for JavaScript/TypeScript**, **Node FFI CUDA**, **GPU memory from Node.js**, **PTX launch from Node.js**, **cubin launch from Node.js**, **NVRTC Node.js**, **nvJitLink Node.js**, **runtime CUDA compilation**, **CUDA streams and events**, **asynchronous CUDA Node.js**, **GPU-resident computation**, **device memory**, **CUDA atomics**, **CUDA C++ JIT**, **content-addressed GPU artifact cache**, and **schema-generated CUDA bindings**.

## Authority links

For normative behavior and exact claim limits, start with:

- [`SPEC-0003`](specs/SPEC-0003-driver-actor-resource-lifecycle.md) — DriverActor/resources/lifecycle;
- [`SPEC-0004`](specs/SPEC-0004-device-memory-foundation.md) — device memory;
- [`SPEC-0005`](specs/SPEC-0005-module-launch-completion.md) — module/function/launch/stream/event completion;
- [`SPEC-0006`](specs/SPEC-0006-compiler-linker-cache.md) — NVRTC/nvJitLink/cache;
- [`SPEC-0008`](specs/SPEC-0008-package-public-facade.md) — public package/facade/multiple instances;
- [`SPEC-0009`](specs/SPEC-0009-trusted-toolkit-headers-and-cuda-mcgs-interop.md) — trusted CUDA headers and generic atomic publication;
- [`TARGET_ARCHITECTURE.md`](architecture/TARGET_ARCHITECTURE.md) — proposal-level extension shape;
- [`V0_SUPPORT_MATRIX.md`](architecture/V0_SUPPORT_MATRIX.md) — qualification boundaries;
- [`next_step.yaml`](../next_step.yaml) — current operational plan state.
