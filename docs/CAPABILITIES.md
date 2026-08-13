# CUDA-JS Capabilities and Boundaries

**Status:** Informational

**Updated:** 2026-08-13

This page is the discoverable capability map for CUDA-JS. It summarizes accepted behavior, current qualification limits, and deliberately deferred capability families without replacing the accepted ADRs and specifications. When this page and an accepted specification differ, the accepted specification is authoritative.

<!-- CUDA-JS:BEGIN GENERATED CAPABILITY STATUS -->
| Capability | Architectural disposition | Implementation | Qualification / profile | Priority | Public surface | Limit | Issue |
|---|---|---|---|---|---|---|---|
| SPEC-0003 disposal-failure correction | planned — accepted correction | implemented — portable/software | not-qualified — destructive native cleanup failure partitions | deferred — independent native qualification | `RESOURCE_DISPOSE_FAILED` preserves the underlying category, operation and health transition; failed resource capabilities become orphaned and unusable. | Repeated close does not retry disposal by default; only bounded sanitized failure details are public. | #66 |
| SPEC-0006 target-policy correction | planned — accepted correction | implemented — portable/software/package | not-qualified — newly represented targets; existing qualified targets unchanged | deferred — independent native qualification | No new export; compile, link and Device-JS target fields share canonical `compute_<base>` / `sm_<base>` parsing with optional structural `f` or `a` suffix recognition. | Policy revision 1 admits only unsuffixed bases 75, 80, 86, 87, 88, 89, 90, 100, 103, 110, 120 and 121; syntax/policy admission is not provider, toolkit, GPU or qualification evidence. | #65 |
| SPEC-0010 relocatable device code | planned — accepted capability | implemented — portable/software/package | not-qualified — exact Windows public RDC compile/link/launch/oracle/lifecycle | active — native qualification | `compile({ options: { relocatableDeviceCode: boolean } })` returns typed PTX marked `relocatableDeviceCode: true` when enabled; the existing `link()` consumes it. | Default is `false`; relocatable PTX has no direct-execution promise and callers cannot provide native option text. | #35 |
| SPEC-0011 scalar kernel arguments | planned — accepted capability | implemented — portable/software/package | not-qualified — exact Windows mixed-scalar ABI/launch/oracle/lifecycle | active — native qualification | Function parameter kinds are exactly `device-memory`, `u32`, `u64`, `i32` and `f32`; facade launch values are validated and packed by their declared kind. | No numeric coercion, raw parameter buffer, arbitrary ABI kind or non-finite `f32` value is accepted. | — |
| SPEC-0012 Device LTO | planned — accepted capability | implemented — portable/software/package | not-qualified — exact Windows LTO-IR compile/link/launch/oracle/lifecycle | active — native qualification | `compile({ output: "lto-ir" })` returns typed LTO-IR; `link()` accepts a homogeneous typed LTO-IR set and returns cubin. | Raw LTO-IR, mixed PTX/LTO input, caller-selected native kinds/options and broad cross-target composition are rejected. | #42 |
| SPEC-0013 restricted Device-JS | planned — accepted capability | implemented — portable/software/package | not-qualified — exact Windows generated-source/compiler/launch/oracle/lifecycle | active — native qualification | `compileDeviceProgram(runtime, request)` validates restricted Device-JS and returns a bounded device-program descriptor plus the ordinary compiler result. | Acorn 8.15.0 is syntax-only; the accepted subset is closed and generated CUDA, ASTs, native options, pointers and handles remain private. | #43 |
| SPEC-0016 operation lifecycle | planned — accepted capability | implemented — portable/software/package | not-qualified — exact Windows submit/status/wait/close/deferred-failure/lifecycle | active — native qualification | `CudaFunction.submit()` returns an opaque `CudaOperation` with `status()`, `wait()` and `close()`; `launch()` remains the terminal convenience API. | One pending operation and one private stream; pending-command gating remains conservative and there is no public stream/event or kernel-cancellation surface. | #51 |
<!-- CUDA-JS:END GENERATED CAPABILITY STATUS -->

<!-- CUDA-JS:BEGIN GENERATED CUDA-MCGS INTEROP -->
| Boundary | Governance projection |
|---|---|
| Status | compatible-pair-pending |
| External consumer owns | semantic Device-JS program; domain oracle; finite resource plan |
| CUDA-JS owns | Device-JS validation; CUDA C++ lowering; private generated CUDA; compilation and linking; artifact identity and cache; runtime execution and lifecycle |
| Production authoring boundary | consumer-authored CUDA or PTX is not required |
| Cross-repository deletion test | required |
| Exact compatible pair | pending |
<!-- CUDA-JS:END GENERATED CUDA-MCGS INTEROP -->

CUDA-JS is a **schema-driven, no-project-addon, asynchronous Node.js runtime and toolchain for NVIDIA CUDA host APIs**. It is not a neural-network framework, not a search framework, not a raw-pointer FFI wrapper, and not a fixed one-kernel/one-stream architecture. Its current public profiles are intentionally narrower than its architectural extension surface.

## Executive summary

CUDA-JS tracks architecture, implementation, native qualification, and priority independently. Its exact qualified Windows x64 baseline provides:

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
- exact support/qualification metadata that distinguishes proven profiles from testing-unconfirmed or known-incompatible profiles.

The current `cuda-js@0.1.0-alpha.5` public implementation additionally includes, in portable/software/package paths:

- typed relocatable-PTX compilation from SPEC-0010;
- exact `u64`, `i32`, and `f32` launch scalars in addition to `device-memory` and `u32` from SPEC-0011;
- typed LTO-IR compilation and homogeneous Device-LTO linking from SPEC-0012;
- restricted Device-JS through standalone `compileDeviceProgram(runtime, request)` from SPEC-0013;
- opaque `submit()` / `status()` / `wait()` / `close()` GPU operations from SPEC-0016, with one pending operation and one private stream.

Those implementation facts do not promote native support. Each additive capability retains its owning specification's exact native evidence gate.

Important current limits are equally explicit:

- one public runtime currently permits **one pending GPU operation at a time** on one private stream;
- the opaque operation lifecycle is implemented, while multiple pending operations, public caller-controlled streams/events, and multi-stream scheduling remain proposal-only and unqualified;
- multi-GPU, MIG, managed/pinned/mapped memory, CUDA Graph execution, graphics interop, external contexts, process isolation, broad arbitrary kernel signatures, and native Linux CUDA execution are not currently qualified public capabilities;
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

### 4. Module, function, launch, operation, stream, and completion

CUDA-JS currently supports a bounded execution slice with:

- PTX and cubin module loading through the accepted facade;
- named function lookup;
- declared kernel parameter schemas;
- naturally aligned packed launch-buffer construction;
- the closed `device-memory`, `u32`, `u64`, `i32`, and `f32` parameter-kind set;
- grid/block/shared-memory validation against queried device limits;
- one private nonblocking CUDA stream;
- one private event per pending operation;
- event-based terminal completion;
- adaptive nonblocking polling;
- function and memory leases held through terminality;
- immediate/deferred error attribution;
- opaque `CudaFunction.submit()` and `CudaOperation.status()` / `wait()` / `close()` capabilities with one pending operation;
- terminal `CudaFunction.launch()` compatibility implemented above the operation lifecycle;
- timeout handling that fails the runtime conservatively rather than claiming inaccessible cleanup;
- explicit function/module release and dependency-safe teardown.

A single CUDA kernel is still massively parallel across GPU threads, warps, blocks, and SM resources. The current **one-pending-operation** rule describes host-side admission/attribution policy for one runtime; it does not mean the GPU executes a kernel serially. SPEC-0016 is implemented in portable/software/package paths; its exact native promotion remains separately unqualified.

See [`SPEC-0005`](specs/SPEC-0005-module-launch-completion.md), [`SPEC-0011`](specs/SPEC-0011-scalar-kernel-arguments.md), and [`SPEC-0016`](specs/SPEC-0016-operation-lifecycle.md).

### 5. Concurrency: the uncompressed model

"Concurrency" can mean several different things. CUDA-JS currently has some forms and deliberately defers others.

| Concurrency dimension | Current CUDA-JS status |
|---|---|
| Node application event loop vs native CUDA work | Yes. Driver/compiler native work is off the application thread. |
| GPU threads/warps/blocks within a kernel | Yes. Normal CUDA device parallelism. |
| DriverActor vs CompilerActor ownership | Separate Workers and queues. No claim that every operation overlaps or improves performance. |
| Multiple CUDA-JS runtime instances | Isolation is proven; cross-runtime resources reject. This is not a performance claim about overlapping GPU execution. |
| One opaque GPU operation in one runtime | Implemented in portable/software/package paths; exact native SPEC-0016 qualification remains open. |
| Multiple kernels in flight on private streams in one runtime | Proposed under SPEC-0018; not implemented or qualified. |
| Public stream/event capability objects | Not currently public/qualified. |
| Multiple GPUs/MIG | Architecturally deferred, not implemented, and not qualified. |

The target architecture already models memory/module/function/**stream/event/operation** resources as separate bricks. Therefore the current one-pending-operation rule is an accepted **profile boundary**, not a claim that multi-stream support is architecturally impossible. Adding public multi-operation/multi-stream scheduling requires new rules for ownership, ordering, event provenance, deferred errors, cancellation, resource leases, backpressure, teardown, and native evidence.

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

Accepted additive compiler modes are also implemented:

- `relocatableDeviceCode: true` produces typed relocatable PTX through the same bounded CompilerActor owner;
- `output: "lto-ir"` produces a typed, copied LTO-IR artifact;
- homogeneous typed LTO-IR inputs infer private Device-LTO link mode and produce final cubin;
- raw LTO-IR, mixed PTX/LTO input sets, and arbitrary native input/option controls remain unavailable.

PTX remains the default compile/link path. RDC and Device LTO have portable/software/package implementation evidence; their native promotion remains separately gated by SPEC-0010 and SPEC-0012.

**CUDA-JS does not require recompilation on every kernel launch.** Compilation can occur during setup, artifacts can be cached, and PTX/cubin can be loaded later. The compiler is a toolchain capability, not a mandatory hot-loop stage.

See [`SPEC-0006`](specs/SPEC-0006-compiler-linker-cache.md), [`SPEC-0010`](specs/SPEC-0010-relocatable-device-code.md), and [`SPEC-0012`](specs/SPEC-0012-device-lto.md).

### 7. Trusted CUDA C++ headers and atomics

The accepted compiler surface includes one path-free `cuda-cccl` header profile. CUDA-JS verifies and snapshots the exact manifest-owned CUDA 13.3 `cuda/` and `nv/` virtual-header roots before cache lookup rather than accepting an ambient include path.

The current native evidence includes public-facade compilation of `<cuda/atomic>` and one two-thread device-scope release/acquire publication fixture with terminal Driver/Compiler cleanup.

This proves a generic CUDA C++ atomic-publication capability through the public runtime. It does not claim arbitrary CCCL support, a scheduler, search correctness, or performance.

See [`SPEC-0009`](specs/SPEC-0009-trusted-toolkit-headers-and-cuda-mcgs-interop.md).

### 8. Restricted Device-JS authoring

The accepted SPEC-0013 frontend lets a consumer author a closed, statically typed JavaScript subset while CUDA-JS owns validation, deterministic CUDA C++ lowering, compilation, artifact identity, and runtime handoff.

The public entry is the standalone helper:

```js
compileDeviceProgram(runtime, request)
```

It is not a method added to every runtime. CUDA-JS uses pinned `acorn@8.15.0` only as a syntax parser; the accepted grammar, types, helper semantics, return rules, ordering, diagnostics, identity, and lowering remain CUDA-JS-owned. Generated CUDA source, parser ASTs, native options, providers, and pointers remain private.

The portable/software/package implementation proves the closed contract and compiler bridge. Native Device-JS support remains unqualified until the exact compiler/launch/oracle/lifecycle evidence in SPEC-0013 is published and integrated. The CUDA-MCGS external deletion and exact compatible-pair proof remain pending cross-repository work.

See [`SPEC-0013`](specs/SPEC-0013-restricted-device-js.md) and its [public-surface addendum](specs/SPEC-0013-public-surface-addendum.md).

### 9. Content-addressed device artifacts

Compiler and linker outputs have deterministic, provider-aware identities. Cache records separate compile and link operations and include normalized options, provider versions/digests, source/header/input digests, artifact type, lengths, and output identity.

A cache hit is not trusted by filename alone. CUDA-JS revalidates the manifest, key, provider/request identity, artifact type, byte length, and digest before returning bytes.

This makes runtime compilation compatible with build-once/cache/reuse workflows rather than forcing source compilation into latency-sensitive execution loops.

### 10. Public package and independent consumers

The public package is ESM-only and no-addon in the CUDA-JS-specific sense. Its public exports are deliberately smaller than the repository internals.

The facade exposes safe capability objects for device memory, modules, functions, opaque GPU operations, and optional compilation/linking. The package also exports standalone `compileDeviceProgram()`. Actor tokens, provider paths, context/stream/event handles, generated CUDA, and raw native storage are hidden.

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

CUDA-JS supports the host-side mechanisms needed to keep application state resident in ordinary device memory across sequential operations:

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

CUDA-JS does **not**, by itself, define a universal device-resident scheduler or claim that every application's control flow continues on the GPU after one ignition call. That is consumer semantics. A production CUDA-MCGS consumer owns its restricted Device-JS program and domain oracle/resource meaning; CUDA-JS owns the CUDA realization and runtime. Any missing generic primitive must enter CUDA-JS through an accepted generic contract rather than a consumer-local CUDA escape hatch.

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

Device LTO is **accepted and implemented in portable/software/package paths, but not promoted as native support**.

SPEC-0012 keeps PTX as the default compile path and adds typed `lto-ir` artifacts plus homogeneous typed LTO-IR-to-cubin linking under the existing CompilerActor/cache owner. Raw untyped LTO-IR, mixed PTX/LTO-IR input sets, staged partial linking, arbitrary nvJitLink controls, and broad compatibility inference remain excluded.

Exact native LTO-IR/oracle parity, multi-unit linking, Driver execution, negative compatibility controls, and terminal lifecycle evidence remain required before any named native profile is promoted.

See [`SPEC-0012`](specs/SPEC-0012-device-lto.md) and the active [native qualification continuation](plans/2026-08-12-native-and-platform-qualification-continuation.md).

## Capability status ownership

The generated capability table near the top of this document is the public status projection for accepted additive capabilities and P0 corrections. Do not maintain a second handwritten status matrix here.

Other capability families remain governed by their domain owners:

| Fact family | Authoritative owner |
|---|---|
| Exact qualified hardware and platform profiles | [`conformance/hardware/registry.json`](../conformance/hardware/registry.json), [`profiles.json`](../conformance/hardware/profiles.json), and generated [`HARDWARE_SUPPORT.md`](HARDWARE_SUPPORT.md) |
| Deferred/planned hardware axes | [`conformance/hardware/extensions.json`](../conformance/hardware/extensions.json) |
| Exact Node support | [`conformance/node/registry.json`](../conformance/node/registry.json) and generated [`NODE_SUPPORT.md`](NODE_SUPPORT.md) |
| Accepted contracts | [`docs/specs/`](specs/) plus accepted addenda |
| Proposal-only expansion | [`SPEC-0017` through `SPEC-0026`](specs/) and the [capability roadmap](plans/2026-08-13-capability-expansion-roadmap.md) |
| Current work and blockers | [`STATUS.md`](../STATUS.md) and [`next_step.yaml`](../next_step.yaml) |

Architecture, implementation, qualification/profile, and priority must be read independently from those owners. Absence of a qualification claim is not architectural rejection.

## Common classification errors

### "CUDA-JS is a prebuilt native C++ addon."

False. The baseline is Node-FFI-first and deliberately ships no CUDA-JS-specific compiled addon.

### "CUDA-JS runs CUDA work on Node's main thread or a generic threadpool."

False. CUDA Driver ownership is in a dedicated `DriverActor` Worker; compiler/linker ownership is in a separate `CompilerActor` Worker.

### "CUDA-JS uses only the legacy default CUDA stream."

False for the accepted execution path. CUDA-JS owns a private nonblocking stream and private completion events. What is currently missing is **public multi-stream/concurrent-launch control**, not all stream/event usage.

### "One pending operation means CUDA-JS has no GPU concurrency."

False. One pending operation is a host admission/error-attribution rule for the current runtime profile. CUDA kernels still execute with ordinary massive GPU parallelism. Multi-operation/private-stream scheduling is a distinct proposal and remains unimplemented/unqualified.

### "Single-flight is the permanent CUDA-JS architecture."

False. Streams, events, operations, memory kinds, and other resource families are explicit architectural bricks. Widening the current profile requires a new accepted contract and evidence rather than bypassing ownership rules.

### "CUDA-JS allocations are released when V8 garbage-collects wrapper objects."

False. Native resource lifetime is explicit and registry-owned. Explicit close/release is primary; deterministic runtime teardown disposes children before parents.

### "Managed/Unified Memory is required to keep a workload on the GPU."

False. Ordinary device memory persists across launches and is directly consumable by later kernels. Managed memory is a separate placement/migration/coherence capability.

### "Using CUDA-JS means compiling CUDA source during every hot-loop operation."

False. Runtime compilation is optional, cacheable, and separable from execution. Precompiled PTX/cubin can be loaded directly.

### "Device LTO and relocatable PTX are only future ideas."

False as an implementation statement. Both typed capabilities are accepted and implemented in portable/software/package paths. They remain not-qualified for native support until their exact promotion evidence is published and integrated.

### "A Device-JS consumer must own generated CUDA or PTX."

False for the accepted higher-level boundary. The consumer owns its semantic restricted Device-JS program; CUDA-JS owns validation, private CUDA lowering, compilation, artifacts, and runtime mechanics. Direct CUDA C++/PTX remains an available lower-level generic CUDA-JS surface, but it is not required for the CUDA-MCGS production deletion-test boundary.

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

CUDA-JS is relevant to searches for: **Node.js CUDA**, **NVIDIA CUDA Driver API for JavaScript/TypeScript**, **Node FFI CUDA**, **GPU memory from Node.js**, **PTX launch from Node.js**, **cubin launch from Node.js**, **NVRTC Node.js**, **nvJitLink Node.js**, **relocatable PTX**, **CUDA Device LTO**, **restricted JavaScript GPU kernels**, **opaque GPU operations**, **runtime CUDA compilation**, **CUDA streams and events**, **asynchronous CUDA Node.js**, **GPU-resident computation**, **device memory**, **CUDA atomics**, **CUDA C++ JIT**, **content-addressed GPU artifact cache**, and **schema-generated CUDA bindings**.

## Authority links

For normative behavior and exact claim limits, start with:

- [`SPEC-0003`](specs/SPEC-0003-driver-actor-resource-lifecycle.md) — DriverActor/resources/lifecycle;
- [`SPEC-0004`](specs/SPEC-0004-device-memory-foundation.md) — device memory;
- [`SPEC-0005`](specs/SPEC-0005-module-launch-completion.md) — module/function/launch/stream/event completion;
- [`SPEC-0006`](specs/SPEC-0006-compiler-linker-cache.md) — NVRTC/nvJitLink/cache;
- [`SPEC-0008`](specs/SPEC-0008-package-public-facade.md) — public package/facade/multiple instances;
- [`SPEC-0009`](specs/SPEC-0009-trusted-toolkit-headers-and-cuda-mcgs-interop.md) — trusted CUDA headers and generic atomic publication;
- [`SPEC-0010`](specs/SPEC-0010-relocatable-device-code.md) — typed relocatable PTX;
- [`SPEC-0011`](specs/SPEC-0011-scalar-kernel-arguments.md) — typed scalar launch arguments;
- [`SPEC-0012`](specs/SPEC-0012-device-lto.md) — typed Device LTO;
- [`SPEC-0013`](specs/SPEC-0013-restricted-device-js.md) — restricted Device-JS;
- [`SPEC-0016`](specs/SPEC-0016-operation-lifecycle.md) — opaque operation lifecycle;
- [`TARGET_ARCHITECTURE.md`](architecture/TARGET_ARCHITECTURE.md) — proposal-level extension shape;
- [`V0_SUPPORT_MATRIX.md`](architecture/V0_SUPPORT_MATRIX.md) — qualification boundaries;
- [`next_step.yaml`](../next_step.yaml) — current operational plan state.
