# CUDA-JS Capabilities and Boundaries

**Status:** Informational

**Updated:** 2026-08-14

This page is the discoverable capability map for CUDA-JS. It summarizes accepted behavior, current qualification limits, and deliberately deferred capability families without replacing the accepted ADRs and specifications. When this page and an accepted specification differ, the accepted specification is authoritative.

The published `cuda-js` package is a **schema-driven, no-project-addon, asynchronous Node.js runtime and toolchain for NVIDIA CUDA host APIs**. It is not a neural-network framework, not a search framework, not a raw-pointer FFI wrapper, and not a fixed one-kernel/one-stream architecture. The CUDA-JS project has accepted an authority-only boundary for an optional NN product as a separate future publish unit; no NN package, implementation, or qualification exists yet. Current public profiles remain intentionally narrower than the architectural extension surface.

## Executive summary

CUDA-JS currently provides a public/package implementation with an exact qualified Windows x64 foundation. Later additive capabilities are called out separately when their portable/software implementation is integrated but their exact native qualification remains open:

- Node 26 experimental `node:ffi` as the private host-call substrate, with no CUDA-JS-specific compiled N-API addon in the baseline;
- generated CUDA ABI facts, private FFI definitions, argument packers, semantic overlays, compatibility products, and fail-closed unsupported declarations from pinned official CUDA headers;
- a dedicated `DriverActor` Worker that owns one CUDA context and all raw Driver resources for one runtime;
- opaque public resource capabilities instead of public CUDA pointers or handles;
- bounded device-memory allocation, copied host-to-device/device-to-host transfers, quotas, range checks, leases, stale-generation rejection, and explicit teardown;
- PTX/cubin module loading, named function resolution, typed packed kernel arguments, launch validation, a private nonblocking CUDA stream, private CUDA events, deferred-error attribution, and deterministic cleanup;
- an optional separate `CompilerActor` Worker using NVRTC and nvJitLink;
- runtime CUDA C++ source compilation to PTX, PTX linking to cubin, compiler/linker logs, provider identity, deterministic artifact identity, and a validated content-addressed cache;
- a trusted, path-free CUDA CCCL header profile that can compile `<cuda/atomic>` through the public facade;
- exact tested device-scope release/acquire atomic publication through generated device code;
- multiple simultaneous CUDA-JS runtime instances with ownership isolation and cross-runtime capability rejection;
- an asynchronous public ESM facade that keeps potentially blocking native Driver/compiler work off the Node.js application event loop;
- portable/software/package implementations of typed relocatable PTX, SPEC-0011 `u64`/`i32`/`f32` scalar launch arguments, SPEC-0021 `f64`/`f16`/`bf16` scalar launch arguments, typed Device LTO, restricted Device-JS with scoped atomic observation and direction-specific mailbox publication, and one opaque pending-operation lifecycle, with exact native status tracked per capability/profile;
- a portable/software contiguous 1D typed device-view component foundation with exact dtype/range/access/parent-lifetime semantics and no selected public facade entry yet;
- exact support/qualification metadata that distinguishes proven profiles from testing-unconfirmed and known-incompatible exact profiles.

Important current limits are equally explicit:

- one pending GPU operation remains the compatibility default, while an explicit profile permits **exactly two pending operations** on two private streams;
- the capacity-two scheduler and bounded internal-pinned asynchronous transfers are implemented and qualified only on the recorded exact Windows profile;
- the SPEC-0014 publication mailbox is implemented and qualified only for private mapped storage, named directional u32 lanes, one live operation lease, and system-scope acquire/release on the recorded exact Windows profile;
- public caller-controlled raw streams/events are not part of the current public contract;
- multi-GPU, MIG, managed memory, caller-registered/mapped host memory, CUDA Graph execution, graphics interop, external contexts, process isolation, arbitrary kernel signatures beyond the accepted closed parameter kinds, and native Linux CUDA execution are not currently qualified public capabilities;
- contiguous 1D typed device views are implemented as a reusable component/lifecycle foundation, but no public `cuda-js` facade API for creating views has been selected or qualified;
- typed Device LTO is implemented in portable/software and package paths but remains natively unqualified;
- the published `cuda-js` core does not bundle cuBLAS, cuDNN, tensor/autodiff logic, neural-network semantics, MCGS/search semantics, or application scheduling policy.

Those limits describe the applicable **implementation and qualification dimensions**, not an assumption that the underlying CUDA capability is impossible to add. New capability families require explicit contracts, ownership, compatibility rules, conformance, and exact native evidence before promotion.

## What CUDA-JS is — and is not

### CUDA-JS is not a custom native addon

The version-zero baseline intentionally ships **no CUDA-JS-specific compiled addon**. CUDA-JS uses Node's experimental `node:ffi` privately from Worker-owned components. Approved CUDA symbols and ABI shapes come from generated schema products rather than a handwritten wrapper family.

This is different from a conventional N-API addon. A custom addon can certainly implement asynchronous Workers, NVRTC, streams, graphs, memory pools, or any other CUDA feature, but it must implement and maintain those contracts itself. CUDA-JS's purpose is to provide those capabilities through generic, versioned, evidence-backed runtime contracts without exposing raw native authority.

See [`ADR-0002`](decisions/ADR-0002-node-ffi-first-host-binding.md), [`SPEC-0001`](specs/SPEC-0001-cuda-schema-compiler.md), and the [target architecture](architecture/TARGET_ARCHITECTURE.md).

### CUDA-JS is not a Node threadpool wrapper around a global CUDA queue

Driver operations are owned by a dedicated `DriverActor` Worker with a private CUDA context. Compilation/linking is owned by a separate `CompilerActor` Worker. The application thread communicates through bounded asynchronous commands and Promises.

The current execution implementation uses a **private `CU_STREAM_NON_BLOCKING` stream** and a **private CUDA event per pending operation**. Submission returns after event provenance exists; later status requests query completion in short serialized owner turns, and facade-side waits use bounded adaptive polling between those turns. CUDA-JS does not simply hardcode all launches to legacy stream zero or retain the DriverActor inside one polling command for the lifetime of the GPU work.

See [`SPEC-0003`](specs/SPEC-0003-driver-actor-resource-lifecycle.md) and [`SPEC-0005`](specs/SPEC-0005-module-launch-completion.md).

### CUDA-JS is not a raw-pointer API

Native CUDA handles and device addresses stay inside the owning Worker. Public JavaScript receives opaque capabilities for device memory, modules, and functions. Public callers cannot choose arbitrary native libraries, arbitrary symbols, arbitrary FFI signatures, provider paths, or unchecked executable schemas.

This is an intentional ownership and safety boundary, not an inability to use CUDA pointers internally.

### Generic core remains independent from NN and search products

The published `cuda-js` package owns the generic CUDA runtime/toolchain boundary. It does not own tensor layouts, autograd, neural-network layers, optimizers, MCGS/MCTS/search semantics, model architecture, batching policy, or domain-specific device programs.

Accepted [`ADR-0004`](decisions/ADR-0004-nn-extension-package-boundary.md) and [`SPEC-0027`](specs/SPEC-0027-nn-extension-foundation.md) permit a future separately published, application-neutral NN product to own bounded tensor/graph/autodiff/training contracts. That authority is not implementation: the package name and location remain unselected, every production boundary needs a child specification, and consumer model/data/objective/domain semantics remain outside the project. Generic core can compile or load device programs without becoming a deep-learning library or search engine.

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

SPEC-0021 also implements a generic **contiguous 1D typed device-view component foundation** over opaque allocations. A view records one accepted dtype, aligned byte offset, element count/byte span, access role, parent generation and registry child/lease lifetime without exposing a native address. Exact half-open overlap classification, safe-integer arithmetic, stale/closed/wrong-parent rejection, and parent-close blocking are covered by portable conformance. This component is not yet a public facade capability; public API spelling and package exposure require a separate accepted public-surface decision.

The ordinary memory contract deliberately does **not** market managed, unified, pinned, mapped, pooled, imported/exported, peer, or zero-copy memory as aliases for device memory. SPEC-0019 adds a distinct internal-pinned profile with exactly two lazy `maxTransferBytes` staging blocks, snapshot H2D, terminal-result D2H, and contiguous D2D through the existing opaque operation lifecycle. Caller-owned registration, mapped memory, 2D/3D copies, and unbounded chunk queues remain excluded.

SPEC-0014 adds a separate **Publication mailbox** component for bounded host/device signaling while one SPEC-0016 operation is pending. `runtime.createPublicationMailbox({ lanes })` allocates and strongly retains one private registered/mapped `SharedArrayBuffer` with 1–64 named naturally aligned u32 lanes. Direction is immutable per lane, the public object exposes only `store`, `load`, `status`, `reset`, and `close`, and each kernel argument binds exactly one lane. One live GPU operation may lease a mailbox; reset and close fail with typed backpressure until terminality. Raw storage and host/device addresses never cross the facade.

See [`SPEC-0004`](specs/SPEC-0004-device-memory-foundation.md), [`SPEC-0014`](specs/SPEC-0014-long-lived-sideband.md), [`SPEC-0019`](specs/SPEC-0019-host-memory-and-async-transfer.md), and [`SPEC-0021`](specs/SPEC-0021-extended-numeric-abi-and-device-views.md).

### 4. Module, function, launch, stream, and completion

CUDA-JS currently supports a bounded execution slice with:

- PTX and cubin module loading through the accepted facade;
- named function lookup;
- declared kernel parameter schemas;
- naturally aligned packed launch-buffer construction;
- public `device-memory`, `u32`, `u64`, `i32`, finite-only `f32`, `f64`, `f16`, `bf16`, and direction-specific publication-mailbox lane parameter kinds;
- deterministic SPEC-0021 binary64/binary16/bfloat16 host packing, including round-to-nearest-even half/bfloat conversion and canonical NaN bits for the new kinds;
- grid/block/shared-memory validation against queried device limits;
- one private nonblocking CUDA stream by default, or exactly two in the explicit capacity-two profile;
- one private event per pending operation;
- event-based terminal completion observed through short serialized status turns;
- an opaque `CudaOperation` with `status()`, host-side `wait()`, and logical `close()`;
- legacy terminal `launch()` compatibility implemented above submit/status observation;
- function and memory leases held through terminality;
- immediate/deferred error attribution;
- timeout handling that fails the runtime conservatively rather than claiming inaccessible cleanup;
- explicit function/module release and dependency-safe teardown.

A single CUDA kernel is still massively parallel across GPU threads, warps, blocks, and SM resources. The default **one-pending-operation** profile remains the compatibility baseline; an explicit accepted profile widens this to exactly two pending operations on two private streams.

The terminal F5 launch path is qualified on the recorded Windows profile. SPEC-0016 now has current-head exact Windows delayed-completion/deferred-failure/cleanup evidence on that profile; SPEC-0011 and SPEC-0021 scalar kinds retain their separate native promotion gates.

See [`SPEC-0005`](specs/SPEC-0005-module-launch-completion.md), [`SPEC-0011`](specs/SPEC-0011-scalar-kernel-arguments.md), [`SPEC-0016`](specs/SPEC-0016-operation-lifecycle.md), [`SPEC-0018`](specs/SPEC-0018-bounded-multi-operation-scheduling.md), and [`SPEC-0021`](specs/SPEC-0021-extended-numeric-abi-and-device-views.md).

### 5. Concurrency: the uncompressed model

"Concurrency" can mean several different things. CUDA-JS currently has some forms and deliberately defers others.

| Concurrency dimension | Current CUDA-JS status |
|---|---|
| Node application event loop vs native CUDA work | Yes. Driver/compiler native work is off the application thread. |
| GPU threads/warps/blocks within a kernel | Yes. Normal CUDA device parallelism. |
| DriverActor vs CompilerActor ownership | Separate Workers and queues. No claim that every operation overlaps or improves performance. |
| Multiple CUDA-JS runtime instances | Isolation is proven; cross-runtime resources reject. This is not a performance claim about overlapping GPU execution. |
| One opaque submitted GPU operation | Implemented; exact Windows delayed-completion/deferred-failure/cleanup evidence passes on the recorded profile. |
| Multiple GPU operations/private streams in flight in one runtime | Implemented and qualified for the exact SPEC-0018 capacity-two profile with declared accesses, no queue, and one optional predecessor. |
| Public stream/event capability objects | Not currently public/qualified. |
| Multiple GPUs/MIG | Architecturally planned/deferred by exact capability; not implemented or qualified. |

The target architecture models memory/module/function/**stream/event/operation** resources as separate bricks. SPEC-0018 composes those bricks without exposing streams or events: ordinary hazards fail closed or use one explicit predecessor, independently meaningful atomic overlap remains unordered, and every operation retains its own leases and completion event.

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
- typed relocatable-device-code PTX compilation;
- typed `lto-ir` compilation and homogeneous typed LTO-IR-to-cubin linking;
- copied compiler/linker logs;
- deterministic artifact metadata;
- content-addressed compile/link cache keys covering material provider/request identity;
- cache manifest and artifact digest validation on every hit;
- corruption rejection/quarantine;
- exact-key invalidation;
- copied PTX/cubin handoff to the Driver runtime;
- CompilerActor resource cleanup and conservative restart-required state after unproved native destruction.

**CUDA-JS does not require recompilation on every kernel launch.** Compilation can occur during setup, artifacts can be cached, and PTX/cubin can be loaded later. The compiler is a toolchain capability, not a mandatory hot-loop stage.

The base PTX/cubin F6 path is qualified on the recorded Windows profile. Typed RDC and Device LTO are implemented public/package capabilities but remain natively unqualified until their SPEC-0010/SPEC-0012 promotion evidence passes.

See [`SPEC-0006`](specs/SPEC-0006-compiler-linker-cache.md), [`SPEC-0010`](specs/SPEC-0010-relocatable-device-code.md), and [`SPEC-0012`](specs/SPEC-0012-device-lto.md).

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

The facade exposes safe capability objects for device memory, modules, functions, opaque operations, and optional compilation/linking. The standalone `compileDeviceProgram(runtime, request)` helper provides the restricted Device-JS boundary without adding a language subsystem to every runtime instance. Actor tokens, provider paths, context/stream/event handles, generated CUDA, and raw native storage are hidden.

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

### 10. Restricted Device-JS

SPEC-0013, the bounded SPEC-0022 scoped-atomic-observation child, and the SPEC-0014 publication-mailbox child are accepted and implemented. Callers provide canonical source text plus exact function/type metadata in a closed JavaScript syntax subset. CUDA-JS owns validation, static Device-JS semantics, deterministic code-unit ordering, helper contracts, private CUDA C++ lowering, identity, diagnostics, and CompilerActor handoff. `loadRelaxedDevice` / `storeRelaxedDevice` provide only relaxed device-scope one-location `u32`/`u64` semantics. `gpu.mailbox.loadAcquireSystem` and `gpu.mailbox.storeReleaseSystem` accept only the matching opaque directional u32 lane types and lower through the explicit `cuda-cccl` profile to system-scope acquire/release operations; no indexing, conversion, dereference, or RMW surface exists.

Pinned `acorn@8.15.0` is a syntax-only replaceable parser adapter. It does not own Device-JS semantics or code generation. Generated CUDA source, parser ASTs, native options, and provider capabilities do not enter ordinary public results.

Exact Windows source-only Device-JS evidence now passes generated-source → compiler → Driver launch → independent scalar/control-flow/atomic/mailbox oracle → terminal cleanup on the recorded profile. The mailbox kernel is observably pending before host publication, rejects reset/close while leased, observes host value `41`, publishes device value `42`, unregisters, and leaves zero live/orphaned resources. It does not qualify other OS/GPU/provider profiles. The later CUDA-MCGS external-deletion proof is a separate cross-repository consumer test, not a substitute for neutral Device-JS qualification.

See [`SPEC-0013`](specs/SPEC-0013-restricted-device-js.md), its [public-surface addendum](specs/SPEC-0013-public-surface-addendum.md), the [scoped atomic-observation addendum](specs/SPEC-0022-scoped-atomic-observation-addendum.md), and [`INTEROP_WITH_CUDA_MCGS.md`](INTEROP_WITH_CUDA_MCGS.md).

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

Device LTO has independent status dimensions:

```text
architectural disposition: planned
implementation status:    implemented in portable/software/package paths
qualification status:     not-qualified for native CUDA execution
priority:                 active native-evidence lane
```

Accepted SPEC-0012 keeps PTX as the default compile path and adds a typed `lto-ir` artifact plus homogeneous typed LTO-IR-to-cubin linking under the existing CompilerActor/cache owner. The implementation excludes raw untyped LTO-IR, mixed PTX/LTO-IR first-slice linking, staged partial linking, arbitrary nvJitLink controls, and cross-major compatibility claims.

Native promotion remains blocked on exact independent LTO artifact/oracle, link, execution, compatibility-negative, and cleanup evidence. Portable/package success alone does not establish native Device-LTO support.

See accepted [`SPEC-0012`](specs/SPEC-0012-device-lto.md) and the retained [LTO assessment](research/2026-08-11-lto-support-assessment.md).

## Capability status by independent dimension

| Capability | Architecture | Implementation | Qualification | Priority | Profile / boundary |
|---|---|---|---|---|---|
| Node FFI CUDA host binding | `planned` | `implemented` | `qualified` | `active` | Exact recorded Node/host profiles only; private generated FFI over approved named exports. |
| DriverActor Worker/context ownership | `planned` | `implemented` | `qualified` | `active` | Recorded Windows profile; one private context per runtime by default. |
| Device memory and GPU-resident state | `planned` | `implemented` | `qualified` | `active` | Recorded Windows profile; bounded ordinary allocations and copied transfers. |
| Contiguous 1D typed device views | `planned` | `implemented` | `not-qualified` | `active` | SPEC-0021 component/range/lifecycle foundation; no public facade entry selected yet. |
| PTX/cubin module execution | `planned` | `implemented` | `qualified` | `active` | Recorded Windows profile; bounded copied module/function/terminal-launch path. |
| `u64`/`i32`/`f32` scalar arguments | `planned` | `implemented` | `not-qualified` | `active` | Native SPEC-0011 gate remains open; portable/package ABI coverage exists. |
| `f64`/`f16`/`bf16` scalar arguments | `planned` | `implemented` | `not-qualified` | `active` | SPEC-0021 public portable/software/package path; exact native ABI/launch gate remains open. |
| Opaque submit/status/wait/close operation | `planned` | `implemented` | `qualified` | `active` | Exact recorded Windows delayed-completion/deferred-failure/cleanup profile; capacity one remains the default. |
| Multiple in-flight operations/private streams | `planned` | `implemented` | `qualified` | `active` | Exact SPEC-0018 capacity-two profile, two private streams, no queue, one predecessor, declared access hazards, and native/installed-package atomic observer evidence. |
| Public raw stream/event objects | `unselected` | `not-implemented` | `not-qualified` | `deferred` | No current contract exposes native stream/event capabilities. |
| Multiple CUDA-JS runtime instances | `planned` | `implemented` | `qualified` | `active` | Isolation behavior only; not a GPU-overlap performance claim. |
| NVRTC source compilation / nvJitLink PTX linking / cache | `planned` | `implemented` | `qualified` | `active` | Recorded Windows profile; optional bounded typed compiler/linker owner. |
| Typed relocatable PTX | `planned` | `implemented` | `qualified` | `active` | Exact recorded Windows two-unit RDC compile/link/load/execute/cleanup profile. |
| Typed Device LTO | `planned` | `implemented` | `not-qualified` | `active` | Native SPEC-0012 gate remains open; typed `lto-ir` and homogeneous LTO linking only. |
| Restricted Device-JS + scoped atomic observation | `planned` | `implemented` | `qualified` | `active` | Exact recorded Windows source-only profile; private CUDA lowering and relaxed device-scope `u32`/`u64` observation through `compileDeviceProgram()`. |
| Trusted CCCL `cuda/` + `nv/` profile | `planned` | `implemented` | `qualified` | `active` | Exact Windows CUDA 13.3 profile; path-free verified virtual headers. |
| `<cuda/atomic>` device-scope publication | `planned` | `implemented` | `qualified` | `active` | Exact generic fixture/profile only; not a scheduler/search/performance claim. |
| Explicit device selection | `planned` | `not-implemented` | `not-qualified` | `next` | Accepted SPEC-0017; portable implementation is the next dependency-ready packet. |
| Multi-GPU orchestration | `planned` | `not-implemented` | `not-qualified` | `after:SPEC-0018` | Proposed SPEC-0024; depends on selected-device and generalized operation foundations. |
| MIG | `deferred` | `not-implemented` | `not-qualified` | `deferred` | Identity, isolation, quota, and lifecycle contract remains absent. |
| Managed/unified memory | `unselected` | `not-implemented` | `not-qualified` | `deferred` | Separate placement/migration/coherence capability; not required for ordinary residency. |
| Internal pinned host staging and async transfer | `planned` | `implemented` | `qualified` | `active` | Exact SPEC-0019 first profile: two private bounded staging blocks plus contiguous H2D/D2H/D2D; caller registration/mapping remains later. |
| Publication mailbox | `planned` | `implemented` | `qualified` | `active` | Exact SPEC-0014 first profile: private mapped storage, 1–64 named directional u32 lanes, one live operation lease, and Device-JS system-scope acquire/release. |
| Memory pools/async allocation | `unselected` | `not-implemented` | `not-qualified` | `deferred` | Requires separate pressure/stream/lifetime semantics. |
| Prepared batches/CUDA Graphs | `planned` | `not-implemented` | `not-qualified` | `after:SPEC-0018` | Proposed SPEC-0020 retains a non-graph semantic fallback. |
| Process-isolated Driver/compiler backend | `planned` | `not-implemented` | `not-qualified` | `deferred` | Proposed SPEC-0026; Workers do not contain fatal process crashes. |
| Graphics external-resource interop | `planned` | `not-implemented` | `not-qualified` | `after:SPEC-0017` | Proposed SPEC-0025 requires one concrete API/profile and exact synchronization. |
| Optional CUDA library adapters | `planned` | `not-implemented` | `not-qualified` | `after:SPEC-0018` | Proposed SPEC-0023; no bundled cuBLAS/cuDNN/tensor semantics. |
| Optional separately packaged NN product | `planned` | `not-implemented` | `not-qualified` | `after:accepted-child-spec` | Accepted SPEC-0027 authority only; separate publish unit, package name unselected, and every implementation boundary still needs an accepted child spec. |
| Native Linux x64 CUDA execution | `planned` | `partial` | `not-qualified` | `active` | Portable controls and adapters exist; native Driver/compiler/GPU chain remains open. |
| Linux ARM64 / WSL2 native CUDA | `planned` | `partial` | `not-qualified` | `deferred` | Separate ABI/provider/platform profiles. |

## Common classification errors

### "CUDA-JS is a prebuilt native C++ addon."

False. The baseline is Node-FFI-first and deliberately ships no CUDA-JS-specific compiled addon.

### "CUDA-JS runs CUDA work on Node's main thread or a generic threadpool."

False. CUDA Driver ownership is in a dedicated `DriverActor` Worker; compiler/linker ownership is in a separate `CompilerActor` Worker.

### "CUDA-JS uses only the legacy default CUDA stream."

False for the accepted execution path. CUDA-JS owns a private nonblocking stream and private completion events. What is currently missing is **public multi-stream/concurrent-launch control**, not all stream/event usage.

### "One pending operation means CUDA-JS has no GPU concurrency."

False. One-pending-operation is a host admission/error-attribution rule for the current runtime profile. CUDA kernels still execute with ordinary massive GPU parallelism. Multi-operation/private-stream scheduling is a distinct, currently unimplemented and unqualified capability.

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
- [`SPEC-0006 target addendum`](specs/SPEC-0006-target-syntax-addendum.md) — canonical target syntax/admission-policy separation;
- [`SPEC-0008`](specs/SPEC-0008-package-public-facade.md) — public package/facade/multiple instances;
- [`SPEC-0009`](specs/SPEC-0009-trusted-toolkit-headers-and-cuda-mcgs-interop.md) — trusted CUDA headers and generic atomic publication;
- [`SPEC-0010`](specs/SPEC-0010-relocatable-device-code.md) — typed relocatable PTX;
- [`SPEC-0011`](specs/SPEC-0011-scalar-kernel-arguments.md) — typed scalar launch arguments;
- [`SPEC-0012`](specs/SPEC-0012-device-lto.md) — typed Device LTO;
- [`SPEC-0013`](specs/SPEC-0013-restricted-device-js.md) and [addendum](specs/SPEC-0013-public-surface-addendum.md) — restricted Device-JS;
- [`SPEC-0014`](specs/SPEC-0014-long-lived-sideband.md) — bounded publication mailboxes for long-lived operations;
- [`SPEC-0015`](specs/SPEC-0015-execution-scope-status-clarification.md) — execution-profile status semantics;
- [`SPEC-0016`](specs/SPEC-0016-operation-lifecycle.md) — opaque one-pending-operation lifecycle;
- [`SPEC-0017`](specs/SPEC-0017-device-selection-and-target-resolution.md) — accepted opaque device selection/target-resolution foundation;
- [`SPEC-0021`](specs/SPEC-0021-extended-numeric-abi-and-device-views.md) — extended scalar ABI and contiguous 1D typed device-view foundation;
- [`SPEC-0027`](specs/SPEC-0027-nn-extension-foundation.md) — authority-only optional NN product boundary and separate-publish-unit isolation;
- [`TARGET_ARCHITECTURE.md`](architecture/TARGET_ARCHITECTURE.md) — proposal-level extension shape;
- [`V0_SUPPORT_MATRIX.md`](architecture/V0_SUPPORT_MATRIX.md) — qualification boundaries;
- [`next_step.yaml`](../next_step.yaml) — current operational plan state.
