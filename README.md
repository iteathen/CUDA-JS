# CUDA-JS

[![Documentation and verification](https://github.com/iteathen/CUDA-JS/actions/workflows/docs.yml/badge.svg)](https://github.com/iteathen/CUDA-JS/actions/workflows/docs.yml)
[![Node compatibility](https://github.com/iteathen/CUDA-JS/actions/workflows/node-compatibility.yml/badge.svg)](https://github.com/iteathen/CUDA-JS/actions/workflows/node-compatibility.yml)
[![License: AGPL-3.0-or-later](https://img.shields.io/badge/license-AGPL--3.0--or--later-blue)](LICENSE)

**Experimental schema-driven Node.js runtime and toolchain for CUDA host APIs**

`cuda-js` is a public pre-release repository and package candidate for compiling, loading, launching, observing, and tearing down CUDA work from Node.js through finite, versioned, capability-checked contracts. It is not published to the npm registry and is not production-ready. It is deliberately independent of graph search, games, tensor frameworks, neural-network semantics, and any one application. The wider CUDA-JS project has accepted SPEC-0027 authority for an optional NN product only as a separate future publish unit; that product is not implemented or qualified.

## Capability map — current profile vs architectural ceiling

For the complete, crawler-friendly capability inventory, read **[`docs/CAPABILITIES.md`](docs/CAPABILITIES.md)**. It separates accepted behavior from planned/deferred capability families and directly answers common classification mistakes.

CUDA-JS is broader than a shallow CUDA wrapper, but intentionally narrower than unrestricted raw native access:

- **JavaScript-authored and JIT/native-realized.** The maintained core runtime is JavaScript/ESM. Node FFI and NVIDIA libraries provide native execution, while Device-JS may lower to private generated CUDA C++ and JIT-produced device artifacts. Repository C/C++ probes/oracles are independent evidence, not shipped runtime implementation. See [ADR-0005](docs/decisions/ADR-0005-javascript-authored-jit-native-realized.md).
- **OS-neutral architecture; Linux reference platform.** Public contracts and shared runtime owners remain operating-system-neutral. Native Linux x86-64 is the reference implementation and primary forward qualification path, with Ubuntu 24.04 LTS as the first exact evidence cell. Windows x64 remains a maintained peer adapter with retained exact evidence. See [ADR-0006](docs/decisions/ADR-0006-linux-first-reference-platform.md).
- **No CUDA-JS-specific native addon in the v0 baseline.** CUDA host calls use Node 26's experimental `node:ffi` privately from Worker-owned components; generated ABI facts and reviewed semantics define the approved CUDA surface.
- **Asynchronous host architecture.** A dedicated `DriverActor` Worker owns one private CUDA context and raw Driver resources. A separate `CompilerActor` Worker owns NVRTC, nvJitLink, compiler/linker logs, artifacts, and cache work. Potentially blocking native work stays off the Node.js application event loop.
- **Real CUDA stream/event execution today.** The qualified legacy terminal-launch path uses a private `CU_STREAM_NON_BLOCKING` stream and private CUDA events. The implemented SPEC-0016 public surface adds one opaque `submit()` → `status()` / `wait()` / `close()` operation lifecycle; exact Windows evidence covers delayed completion, deferred failure attribution, and teardown on the recorded profile.
- **A one-pending-operation default with exact bounded widenings.** The compatibility default remains one pending GPU operation. Opting into SPEC-0018 admits exactly two pending operations on two private streams with declared hazards and one predecessor; SPEC-0019 composes bounded snapshot H2D, terminal-result D2H, and D2D operations through the same lifecycle. SPEC-0014 adds an opaque publication mailbox with named directional u32 lanes and one live operation lease. None exposes streams, events, pointers, mapped storage, or an unbounded queue.
- **Prepared operation DAGs reuse that lifecycle.** SPEC-0020 adds immutable bounded kernel DAGs with canonical identity, named scalar/memory/view bindings, explicit dependency/access facts, repeated replay, and one opaque operation for the whole DAG. SPEC-0031 additively composes fixed SPEC-0029 cuBLASLt f32 plans; the library owner derives typed-view/workspace accesses and enqueues on the same private stream. Kernel-only identity remains exact. This is not CUDA Graph support or a performance claim.
- **GPU-resident state is supported with ordinary device memory.** Device allocations persist across launches until explicit release/teardown; CUDA-JS does not require intermediate state to return to JavaScript between kernels. Managed/Unified Memory is a separate, currently unqualified memory kind—not a prerequisite for GPU residency.
- **Native resource lifetime is explicit, not garbage-collection-driven.** Opaque memory/module/function capabilities use registry ownership, leases, explicit close/release, and deterministic child-before-parent runtime teardown. Finalizers are not the primary cleanup mechanism.
- **Runtime compilation is optional.** Consumers may load precompiled PTX/cubin directly, or use the optional CompilerActor for CUDA C++ source → NVRTC PTX → nvJitLink cubin with a validated content-addressed cache. JIT compilation is not required on every kernel launch or hot-loop iteration.
- **CUDA C++ headers and numeric types are available through bounded trusted profiles.** `cuda-cccl` verifies the exact CUDA 13.3 `cuda/` and `nv/` roots. SPEC-0030 adds the exact `cuda-numeric` dependency closure for `cuda_fp16.h`/`cuda_bf16.h` and the composite `cuda-device` profile; all are snapshotted before cache lookup without exposing include paths.
- **Fault isolation has precise scope.** Workers provide event-loop isolation, context/resource ownership, and restart-required handling after owner loss. They do **not** provide OS-process crash isolation; a process-isolated backend is a separate deferred capability.
- **Multiple runtime instances are supported for isolation.** Simultaneous instances and cross-runtime capability rejection are proven. That is not yet a claim of multi-stream or multi-GPU performance concurrency.
- **Typed compiler and device-language extensions are implemented without native overclaim.** The public/package path includes typed relocatable PTX, the `u64`/`i32`/`f32` and `f64`/`f16`/`bf16` launch ABI, typed `lto-ir` compilation and homogeneous Device-LTO linking, restricted Device-JS with SPEC-0030 dense scalar computation, explicit relaxed observation, device-scope release/acquire publication, direction-specific system-scope mailbox publication, and the opaque SPEC-0016 operation lifecycle. Exact native claims apply only to the recorded capability/profile evidence; other additive families retain their own gates.
- **Generic `cuda-js` core is not a tensor, neural-network, or search framework.** It does not bundle cuBLAS/cuDNN, autograd, optimizers, MCGS/MCTS semantics, or application schedulers. Accepted ADR-0004/SPEC-0027 permit a separately packaged optional NN product, but no package name, implementation, provider, or qualification exists and every `nn.*` boundary still needs an accepted child specification.

Current public implementation includes schema-generated Driver bindings, Worker/context ownership, opaque resources, device memory, copied transfers, publication mailboxes, PTX/cubin modules, function lookup, typed packed kernel arguments, launch validation, opaque GPU operations, semantic prepared-DAG replay, NVRTC, nvJitLink, typed RDC and Device LTO, restricted Device-JS with the additive SPEC-0030 dense scalar profile, artifact/cache identity, trusted CUDA headers, package/facade isolation, diagnostics, errors, health, and deterministic teardown. `0.1.0-alpha.16` binds Device-JS translation, library artifacts, imports, and composition identity to the selected runtime's SPEC-0017 target while preserving alpha.15 prepared cuBLASLt composition and the exact default-device `compute_75` identity. Qualification remains capability- and profile-specific; the exact Windows evidence baseline does not automatically qualify every later additive public capability.

Currently not-implemented or not-qualified families include public stream/event objects, caller-owned registered or mapped host memory, multi-GPU/MIG, managed/pool memory, CUDA Graph realization, graphics interop, external contexts, process isolation, broader kernel signatures, and qualified native Linux CUDA execution. The complete native Linux exact-profile runner source is ready and issue #4 now waits for contributor-run native Ubuntu/physical-NVIDIA evidence because the available VM hosts cannot provide an accepted CUDA qualification environment. That external evidence lane does not block OS-neutral portable work. The generic CUDA-JS-Tensor prerequisites now include typed views, Device-JS library composition, dense numerics, prepared kernel DAGs, cuBLASLt plans, and the bounded SPEC-0031 prepared composition; tensor policy remains outside core. Absence from the current qualified profile does **not** mean the target architecture rejects a capability; architecture, implementation, qualification, and priority advance independently.

> **Testing-phase notice:** CUDA-JS is an experimental public alpha candidate. On Windows x64 it will attempt to operate on unconfirmed CUDA hardware without a compatibility opt-in. Successful installation, startup, compilation, memory transfer, or kernel execution does not mean that a profile is supported. Expect failures, restart-required states, incomplete features, and breaking changes; do not use this candidate for production or safety-critical work.

The current candidate native adapter is still Windows-only. That is an implementation-state fact, not the platform priority: Linux-native x86-64 is the reference path under ADR-0006 and remains unavailable until a contributor runs issue #4's unchanged Driver/compiler/package chain on a native physical-NVIDIA host. VM, emulated, WSL, container, hosted-CI, portable, or mock results do not qualify that native cell.

Exact evidence is published in the [Node version support list](docs/NODE_SUPPORT.md) and [hardware support list](docs/HARDWARE_SUPPORT.md). Node releases with the required FFI substrate and Windows CUDA devices that pass the runtime's structural safety checks may operate as `testing-unconfirmed`. Only Node 26.7.0 and the recorded Windows x64 GPU profile currently carry qualified experimental evidence. CUDA-JS blocks execution only where the current implementation knows it cannot operate safely or at all, including a missing platform backend, missing required FFI substrate or authority, unavailable Driver surface, malformed device facts, or prohibited CUDA compute mode.

The package manifest is public rather than npm-private, but no npm registry release exists. CUDA-JS source is available under the [GNU Affero General Public License version 3 or later](LICENSE). Organizations that need different terms may request a separately negotiated [commercial license](LICENSING.md). Any registry release still requires a separate release, provenance, and registry review.

## Contributing, security, and funding

Focused bug reports, platform qualification, documentation, tests, and contract-preserving improvements are welcome; see [`CONTRIBUTING.md`](CONTRIBUTING.md). Security-sensitive reports must follow [`SECURITY.md`](SECURITY.md) and use GitHub's private reporting flow: do not publish exploit details, secrets, proof-of-concept payloads, or sensitive logs in public issues. The current public-repository security/CI posture is recorded in [`docs/PUBLIC_REPOSITORY.md`](docs/PUBLIC_REPOSITORY.md).

GitHub Sponsors is the deliberately low-maintenance funding path. Sponsorships are intended to offset GitHub, CI, testing hardware, and project-maintenance costs; see the [sponsorship setup and policy](docs/SPONSORSHIP.md).

## Selected foundation

CUDA-JS version zero is **Node-FFI-first**:

- Node 26's experimental `node:ffi` is the private host-call substrate;
- Node's own generated V8 Fast API trampolines are reused where the exact signature/platform qualifies;
- no CUDA-JS project-specific compiled addon is shipped in the baseline;
- exact CUDA ABI facts are generated from pinned official headers;
- lifecycle, blocking, error, security, and ownership semantics are maintained in a reviewed overlay;
- a DriverActor Worker owns one CUDA context and every raw Driver resource;
- a CompilerActor Worker owns NVRTC/nvJitLink and content-addressed device artifacts;
- JavaScript receives opaque resource capabilities, not raw native/device pointers;
- strict hot-path JIT is a measured support profile, not an assumption.

This is the concrete meaning of **JavaScript-authored and JIT/native-realized**. “Pure JavaScript” is not used as an unqualified architecture claim because CUDA-JS intentionally invokes native providers, generates private CUDA C++/device artifacts, and retains independent C/C++ conformance oracles. None of those facts makes the shipped core runtime a maintained C/C++ implementation.

The rejected native-bootstrap/AsmJit-first design is preserved under [`docs/archive/`](docs/archive/) for provenance and adversarial rationale.

## Runtime shape

```text
Application / consumer adapter
        │ safe async TypeScript API
        ▼
CUDA-JS facade on the application thread
        │ opaque commands and results
        ├──────────────────────────────┐
        ▼                              ▼
DriverActor Worker                 CompilerActor Worker
  context/resource owner            NVRTC/nvJitLink owner
  schema-generated Node FFI         logs/artifacts/cache
  memory/module/launch              no search semantics
  completion/error/teardown
        │                              │
        └──────────────┬───────────────┘
                       ▼
            CUDA Driver / toolkit libraries / GPU
```

## Repository boundary

CUDA-JS owns:

- CUDA Driver/toolkit discovery and capability/version negotiation;
- trusted header import, Runtime IR, semantic overlays, generated FFI signatures and ABI packers;
- the private Node FFI backend and any later separately accepted gap backend;
- actor/thread/context ownership;
- opaque resources, memory capabilities, module/function/launch contracts;
- completion, cancellation, errors, context health, deterministic teardown;
- NVRTC/nvJitLink, device-artifact identity, cache, conformance, diagnostics, packaging, and compatibility.

CUDA-JS does **not** own:

- MCGS, minimax, graph nodes, policies, evaluators, models, games, or consumer scheduling;
- a universal `NodeArenaEntry` or search memory plan;
- unrestricted FFI, arbitrary executable schemas, or ordinary public raw pointers;
- a universal managed-memory/zero-copy promise;
- JavaScript callbacks invoked from CUDA-managed threads;
- a host relaunch loop as a substitute for device-owned progress required by a consumer.

## “JIT-only” interpretation

The baseline installs no CUDA-JS native addon and does not maintain ahead-of-time per-CUDA-function wrappers. Node owns the generic FFI engine and generated Fast API trampolines.

Cold setup/diagnostic/compiler/teardown calls may use Node's generic FFI fallback under the declared `portable-bootstrap` profile. A `fast-jit-required` claim is blocked until EXP-004 proves a reliable exact-profile qualification mechanism. If strict JIT is later required for every call, that triggers EXP-011 and a separate upstream/custom-backend decision.

## Current state

`CJS-F1A / EXP-000`, the dependency-free synthetic C ABI foundation, is promoted after its direct oracle, minimal Runtime IR, private Node FFI Worker, packers, resource generations, and deterministic cleanup passed independently on Windows x64 and native Linux x86-64 with exact Node 26.7.0. This does not qualify the Linux CUDA Driver path.

`CJS-F1B` is also accepted and expanded through F5: the pinned CUDA 13.3.29 package regenerates 32 reviewed Tier-0 function facts, 16 type/layout facts, private FFI definitions/packers/types/conformance products, and a fail-closed catalog of 451 unselected Driver declarations. Native Ubuntu CI performs exact Clang generation and rejects checked-in drift. The installed Windows CUDA 13.3 header is hash-identical, and MSVC independently confirms the selected Win64 layouts.

Windows-only `CJS-F2W / EXP-012` is accepted. Official Node 26.7.0 and an independent MSVC oracle agree on the CUDA 13.3 Driver, GTX 1660 Ti device/attributes, all 12 Tier-0 exports and procedure queries, error text, permission behavior, and private context lifecycle/cleanup. Linux `CJS-F2L / EXP-001` has executable source/ABI/oracle preparation, environment diagnostics, and a final smoke runner, but remains incomplete because the available native Linux guest has no supported GPU exposure. [Linux qualification issue #4](https://github.com/iteathen/CUDA-JS/issues/4) is open for contributors; Windows evidence does not imply Linux support.

Windows-only `CJS-F3W` is accepted. A dedicated Worker owns the Driver library, one private context, and an opaque resource registry; the bounded async facade proves context affinity, stale/wrong-kind rejection, main-loop responsiveness, conservative health, graceful teardown, and honest restart-required reporting after unexpected Worker loss. The platform-neutral F3 capsule passes on Windows and native Linux x86-64. Native Linux Driver/context execution remains incomplete and continues to depend on `CJS-F2L` qualification.

Windows-only `CJS-F4W` is accepted. The runtime can allocate quota-bounded device memory, copy owned `Uint8Array` bytes synchronously through five exact generated Driver exports, reject unsafe ranges before native invocation, release opaque allocations, reuse slots without accepting stale generations, and free allocations before context teardown. An independent MSVC oracle and the Node path agree byte-for-byte. The portable F4 capsule and native Ubuntu schema generation prepare the Linux implementation, while [`conformance/f4/README.md`](conformance/f4/README.md) documents the remaining human-engineering gates without claiming native Linux CUDA support.

Windows-only `CJS-F5W` is accepted. The runtime copies bounded PTX, resolves exact declared function schemas, packs naturally aligned arguments, retains all resource leases, and resolves only after private events report terminal completion. The default is one private stream/operation; exact SPEC-0018 qualification adds a capacity-two/two-stream/no-queue profile, SPEC-0019 adds two internal pinned staging blocks with contiguous H2D/D2H/D2D operations, and SPEC-0014 adds one private mapped named-u32 publication mailbox lease. Independent MSVC and Node paths agree on scalar, delayed-event, atomic-observer, async-transfer, and system-scope mailbox-publication oracles with terminal cleanup. [`conformance/f5/README.md`](conformance/f5/README.md) preserves the human Linux adapter/oracle/evidence work without claiming native Linux CUDA support.

Windows-only `CJS-F6W / EXP-009` is accepted. A separate CompilerActor verifies the canonical CUDA 13.3 NVRTC/nvJitLink providers, compiles copied source to PTX, links PTX to cubin, and validates a content-addressed cache on every hit. Production Node FFI and the independent MSVC oracle emit byte-identical artifacts across clean runs; corruption becomes a miss; both PTX and cubin execute through the DriverActor with checksum `15600773`; all native resources close terminally. [`conformance/f6/README.md`](conformance/f6/README.md) preserves the detailed human Linux provider/cache/evidence handoff without claiming native Linux CUDA support.

Windows-only `CJS-F7W` has exact accepted evidence. The runtime now separates operational testing candidates from known-incompatible hosts without native diagnostic calls, reports selected-device WDDM/TCC/watchdog/compute-mode facts through DriverActor while keeping the ordinal private, preserves the parent Node permission profile in both Workers, sanitizes unexpected actor errors, and exercises deterministic failure/property plus repeated lifecycle partitions. The accepted GTX 1660 Ti profile is WDDM with the CUDA kernel-timeout attribute enabled and default compute mode. Eight DriverActor and eight CompilerActor native cycles close with balanced resources; both actors deny FFI without explicit permission and succeed with the bounded allow profile. [`conformance/f7/README.md`](conformance/f7/README.md) gives human-engineer completion paths for native Linux x86-64, Linux ARM64 SBSA, and WSL2 without promoting any of them.

Windows-only `CJS-F8W` retains exact accepted evidence for earlier recorded package profiles. The current candidate `cuda-js` `0.1.0-alpha.16` keeps the OS-neutral facade, preserves alpha.15 SPEC-0031 prepared cuBLASLt composition, and corrects selected-device target propagation through Device-JS libraries without changing public API schema 1. Its additive portable surface continues SPEC-0011 scalar arguments, SPEC-0012 typed Device LTO, SPEC-0013 restricted Device-JS through `compileDeviceProgram()` / `compileDeviceLibrary()`, SPEC-0017 opaque selection through `discoverCudaDevices()`, SPEC-0028 typed Device-JS library composition, and SPEC-0030 dense numerics. Clean tarball install/uninstall, unrelated consumers, simultaneous runtime isolation, cross-runtime rejection, opaque selected devices/views, selected-target Device-JS composition, kernel-only replay, and mixed kernel/library prepared replay pass portable controls. Exact Windows installed-package promotion remains limited to its recorded CUDA 13.3/compute_75/GTX 1660 Ti and cuBLASLt 13.5.1 cell with independent SPEC-0029 numerical evidence and terminal cleanup. Native Linux x86-64 remains `testing-unconfirmed`, and other providers, CUDA Graph realization, tensor operations/cores, fast math, and performance remain unqualified or unimplemented. [`conformance/f8/README.md`](conformance/f8/README.md) gives the native Linux qualification handoff.

The CUDA-JS-owned F9 prerequisite is accepted locally on the exact Windows profile. A typed `cuda-cccl` compile option verifies and snapshots the manifest-owned CUDA 13.3 `cuda/` and `nv/` virtual headers before cache lookup. The generic public-facade capsule compiles `<cuda/atomic>`, completes one device-scope release/acquire publication launch, reads the expected words, and closes all resources terminally. This is a generic compiler/runtime capability only; exact compatible-pair evidence remains pending the independent [CUDA-MCGS](https://github.com/iteathen/CUDA-MCGS) work package. [`conformance/f9/README.md`](conformance/f9/README.md) records the bounded claim.

[`docs/HARDWARE_SUPPORT.md`](docs/HARDWARE_SUPPORT.md) publishes the evidence-backed hardware list. The accompanying [`conformance/hardware/`](conformance/hardware/README.md) kit validates the registry, reports incomplete platform runners, and produces consistent direct-test evidence without inferring support across models, compute capabilities, operating systems, or processor architectures.

Run `npm run f8:portable` for package and independent-consumer controls or `npm run f8` for the exact Windows F8 package capsule. `npm run verify` includes the current portable chain through F9, Device-JS, target policy, and operation-lifecycle regressions; `npm run verify:windows` includes the exact native Windows chain through F9. Additive SPEC-0010/0011/0012/0013/0016 support is promoted only by each specification's own native evidence, not merely because the wider chain passes. Native evidence is written only to ignored `build/` storage.

## Start here

- [`docs/CAPABILITIES.md`](docs/CAPABILITIES.md) — full accepted/planned/deferred capability map and common classification corrections.
- [`SECURITY.md`](SECURITY.md) — public security reporting and native/executable trust-boundary policy.
- [`docs/PUBLIC_REPOSITORY.md`](docs/PUBLIC_REPOSITORY.md) — public-repository hardening assessment, CI trust model, and GitHub security-setting state.
- [`AGENTS.md`](AGENTS.md)
- [`docs/PROJECT_CHARTER.md`](docs/PROJECT_CHARTER.md)
- [`docs/FOUNDATION_INDEX.md`](docs/FOUNDATION_INDEX.md)
- [`agent_files/SYSTEM_REGISTRY.md`](agent_files/SYSTEM_REGISTRY.md)
- [`docs/decisions/README.md`](docs/decisions/README.md)
- [`docs/decisions/ADR-0002-node-ffi-first-host-binding.md`](docs/decisions/ADR-0002-node-ffi-first-host-binding.md)
- [`docs/decisions/ADR-0005-javascript-authored-jit-native-realized.md`](docs/decisions/ADR-0005-javascript-authored-jit-native-realized.md)
- [`docs/specs/SPEC-0002-windows-driver-bootstrap.md`](docs/specs/SPEC-0002-windows-driver-bootstrap.md)
- [`docs/architecture/FOUNDATION_ASSESSMENT_AND_PLAN.md`](docs/architecture/FOUNDATION_ASSESSMENT_AND_PLAN.md)
- [`docs/architecture/TARGET_ARCHITECTURE.md`](docs/architecture/TARGET_ARCHITECTURE.md)
- [`docs/architecture/V0_SUPPORT_MATRIX.md`](docs/architecture/V0_SUPPORT_MATRIX.md)
- [`docs/HARDWARE_SUPPORT.md`](docs/HARDWARE_SUPPORT.md)
- [`docs/plans/2026-08-13-capability-expansion-roadmap.md`](docs/plans/2026-08-13-capability-expansion-roadmap.md)
- [`experiments/EXPERIMENT_MATRIX.md`](experiments/EXPERIMENT_MATRIX.md)
- [`docs/research/source-register.yaml`](docs/research/source-register.yaml)
- [`STATUS.md`](STATUS.md)
- [`next_step.yaml`](next_step.yaml)
