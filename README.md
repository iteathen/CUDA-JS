# CUDA-JS

**Schema-driven Node.js runtime and toolchain for CUDA host APIs**

CUDA-JS is a public, pre-release framework for compiling, loading, launching, observing, and tearing down CUDA work from Node.js through finite, versioned, capability-checked contracts. It is deliberately independent of graph search, games, tensor frameworks, neural-network semantics, and any one application.

The current package identity is `cuda-js@0.1.0-alpha.5`; the public API schema remains version 1.

## Capability map — current profile vs architectural ceiling

For the complete, crawler-friendly capability inventory, read **[`docs/CAPABILITIES.md`](docs/CAPABILITIES.md)**. It separates accepted behavior from planned/deferred capability families and directly answers common classification mistakes.

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

CUDA-JS is broader than a shallow CUDA wrapper, but intentionally narrower than unrestricted raw native access:

- **No CUDA-JS-specific native addon in the v0 baseline.** CUDA host calls use Node 26's experimental `node:ffi` privately from Worker-owned components; generated ABI facts and reviewed semantics define the approved CUDA surface.
- **Asynchronous host architecture.** A dedicated `DriverActor` Worker owns one private CUDA context and raw Driver resources. A separate `CompilerActor` Worker owns NVRTC, nvJitLink, compiler/linker logs, artifacts, and cache work. Potentially blocking native work stays off the Node.js application event loop.
- **Real CUDA stream/event execution today.** The accepted execution path uses a private `CU_STREAM_NON_BLOCKING` stream and private CUDA events with adaptive terminal polling. It is not a legacy-stream-zero-only design.
- **Current single-operation profile is not the architectural ceiling.** The public package implements the accepted opaque `submit()` / `status()` / `wait()` / `close()` operation lifecycle with one pending operation and one private stream; terminal `launch()` remains the compatibility convenience. That lifecycle is implemented in portable/software/package paths but retains its exact native promotion gate. Multiple pending operations and multi-stream scheduling remain proposal-only and unqualified.
- **GPU-resident state is supported with ordinary device memory.** Device allocations persist across launches until explicit release/teardown; CUDA-JS does not require intermediate state to return to JavaScript between kernels. Managed/Unified Memory is a separate, currently unqualified memory kind—not a prerequisite for GPU residency.
- **Native resource lifetime is explicit, not garbage-collection-driven.** Opaque memory/module/function capabilities use registry ownership, leases, explicit close/release, and deterministic child-before-parent runtime teardown. Finalizers are not the primary cleanup mechanism.
- **Runtime compilation is optional.** Consumers may load precompiled PTX/cubin directly, or use the optional CompilerActor for CUDA C++ source → NVRTC PTX → nvJitLink cubin with a validated content-addressed cache. JIT compilation is not required on every kernel launch or hot-loop iteration.
- **CUDA C++ headers and atomics are available through a bounded trusted profile.** The accepted `cuda-cccl` profile verifies/snapshots the exact CUDA 13.3 `cuda/` and `nv/` header roots and has native public-facade evidence for `<cuda/atomic>` device-scope release/acquire publication.
- **Fault isolation has precise scope.** Workers provide event-loop isolation, context/resource ownership, and restart-required handling after owner loss. They do **not** provide OS-process crash isolation; a process-isolated backend is a separate deferred capability.
- **Multiple runtime instances are supported for isolation.** Simultaneous instances and cross-runtime capability rejection are proven. That is not yet a claim of multi-stream or multi-GPU performance concurrency.
- **Additive typed compiler and authoring capabilities are implemented without broadening native support.** Typed relocatable PTX, typed Device LTO, `u64`/`i32`/`f32` scalar launch kinds, restricted Device-JS, and opaque GPU operations are present in portable/software/package paths. Each retains the exact native promotion evidence required by SPEC-0010, SPEC-0011, SPEC-0012, SPEC-0013, or SPEC-0016.
- **CUDA-JS is not a tensor, neural-network, or search framework.** It does not bundle cuBLAS/cuDNN, autograd, optimizers, MCGS/MCTS semantics, or application schedulers. Consumers supply their own device programs and domain semantics while CUDA-JS owns the generic CUDA runtime/toolchain boundary.

The exact qualified Windows baseline includes schema-generated Driver bindings, Worker/context ownership, opaque resources, device memory, copied transfers, PTX/cubin modules, legacy `device-memory`/`u32` terminal launch, private nonblocking stream/event completion, NVRTC, nvJitLink, artifact/cache identity, trusted CUDA headers, atomic publication, package/facade isolation, diagnostics, errors, health, and deterministic teardown.

The current public implementation also includes the additive typed capabilities listed above, but their native qualification remains separate. Other not-qualified, deferred, or proposal-only families include multiple pending operations/multi-stream scheduling, public stream/event objects, multi-GPU/MIG, managed/pinned/mapped/pool memory, CUDA Graph execution, graphics interop, external contexts, process isolation, broader kernel signatures, and native Linux CUDA execution. A missing support claim does **not** mean the target architecture rejects a capability.

> **Testing-phase notice:** CUDA-JS is an experimental public alpha. On Windows x64 it will attempt to operate on unconfirmed CUDA hardware without a compatibility opt-in. Successful installation, startup, compilation, memory transfer, or kernel execution does not mean that a profile is supported. Expect failures, restart-required states, incomplete features, and breaking changes; do not use this release for production or safety-critical work.

Exact evidence is published in the [Node version support list](docs/NODE_SUPPORT.md) and [hardware support list](docs/HARDWARE_SUPPORT.md). Node releases with the required FFI substrate and Windows CUDA devices that pass the runtime's structural safety checks may operate as `testing-unconfirmed`. Only Node 26.7.0 and the recorded Windows x64 GPU profile currently carry qualified experimental evidence. CUDA-JS blocks execution only where the current implementation knows it cannot operate safely or at all, including a missing platform backend, missing required FFI substrate or authority, unavailable Driver surface, malformed device facts, or prohibited CUDA compute mode.

The package manifest is public rather than npm-private. CUDA-JS is available under the [GNU Affero General Public License version 3 or later](LICENSE). Organizations that need different terms may request a separately negotiated [commercial license](LICENSING.md). A registry release still requires a separate release, provenance, and registry review.

## Contributing, security, and funding

Focused bug reports, platform qualification, documentation, tests, and contract-preserving improvements are welcome; see [`CONTRIBUTING.md`](CONTRIBUTING.md). Security-sensitive reports must follow [`SECURITY.md`](SECURITY.md): do not publish exploit details, secrets, proof-of-concept payloads, or sensitive logs in public issues. The current public-repository security/CI posture, including the fact that GitHub private vulnerability reporting is not yet enabled, is recorded in [`docs/PUBLIC_REPOSITORY.md`](docs/PUBLIC_REPOSITORY.md).

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

`CJS-F1A / EXP-000` is promoted after its dependency-free C ABI library, direct oracle, minimal Runtime IR, private Node FFI Worker, packers, resource generations, and deterministic cleanup passed independently on Windows x64 and native Linux x86-64 with exact Node 26.7.0.

`CJS-F1B` is also accepted and expanded through F5: the pinned CUDA 13.3.29 package regenerates 27 reviewed Tier-0 function facts, 16 type/layout facts, private FFI definitions/packers/types/conformance products, and a fail-closed catalog of 456 unselected Driver declarations. Native Ubuntu CI performs exact Clang generation and rejects checked-in drift. The installed Windows CUDA 13.3 header is hash-identical, and MSVC independently confirms the selected Win64 layouts.

Windows-only `CJS-F2W / EXP-012` is accepted. Official Node 26.7.0 and an independent MSVC oracle agree on the CUDA 13.3 Driver, GTX 1660 Ti device/attributes, all 12 Tier-0 exports and procedure queries, error text, permission behavior, and private context lifecycle/cleanup. Linux `CJS-F2L / EXP-001` has executable source/ABI/oracle preparation, environment diagnostics, and a final smoke runner, but remains incomplete because the available native Linux guest has no supported GPU exposure. [Linux qualification issue #4](https://github.com/iteathen/CUDA-JS/issues/4) is open for contributors; Windows evidence does not imply Linux support.

Windows-only `CJS-F3W` is accepted. A dedicated Worker owns the Driver library, one private context, and an opaque resource registry; the bounded async facade proves context affinity, stale/wrong-kind rejection, main-loop responsiveness, conservative health, graceful teardown, and honest restart-required reporting after unexpected Worker loss. The platform-neutral F3 capsule passes on Windows and native Linux x86-64. Native Linux Driver/context execution remains incomplete and continues to depend on `CJS-F2L` qualification.

Windows-only `CJS-F4W` is accepted. The runtime can allocate quota-bounded device memory, copy owned `Uint8Array` bytes synchronously through five exact generated Driver exports, reject unsafe ranges before native invocation, release opaque allocations, reuse slots without accepting stale generations, and free allocations before context teardown. An independent MSVC oracle and the Node path agree byte-for-byte. The portable F4 capsule and native Ubuntu schema generation prepare the Linux implementation, while [`conformance/f4/README.md`](conformance/f4/README.md) documents the remaining human-engineering gates without claiming native Linux CUDA support.

Windows-only `CJS-F5W` is accepted as the legacy terminal-launch native baseline. It proves bounded PTX, declared `device-memory`/`u32` schemas, packed launch parameters, one private stream/event, terminal completion, exact vector output, deferred-failure health, and cleanup. Later accepted portable/package additions widen the scalar and operation contracts without inheriting this older native evidence. [`conformance/f5/README.md`](conformance/f5/README.md) preserves the human Linux adapter/oracle/evidence work without claiming native Linux CUDA support.

Windows-only `CJS-F6W / EXP-009` is accepted. A separate CompilerActor verifies the canonical CUDA 13.3 NVRTC/nvJitLink providers, compiles copied source to PTX, links PTX to cubin, and validates a content-addressed cache on every hit. Production Node FFI and the independent MSVC oracle emit byte-identical artifacts across clean runs; corruption becomes a miss; both PTX and cubin execute through the DriverActor with checksum `15600773`; all native resources close terminally. [`conformance/f6/README.md`](conformance/f6/README.md) preserves the detailed human Linux provider/cache/evidence handoff without claiming native Linux CUDA support.

Windows-only `CJS-F7W` has exact accepted evidence. The runtime now separates operational testing candidates from known-incompatible hosts without native diagnostic calls, reports CUDA device-zero WDDM/TCC/watchdog/compute-mode facts through DriverActor, preserves the parent Node permission profile in both Workers, sanitizes unexpected actor errors, and exercises deterministic failure/property plus repeated lifecycle partitions. The accepted GTX 1660 Ti profile is WDDM with the CUDA kernel-timeout attribute enabled and default compute mode. Eight DriverActor and eight CompilerActor native cycles close with balanced resources; both actors deny FFI without explicit permission and succeed with the bounded allow profile. [`conformance/f7/README.md`](conformance/f7/README.md) gives human-engineer completion paths for native Linux x86-64, Linux ARM64 SBSA, and WSL2 without promoting any of them.

Windows-only `CJS-F8W` has exact accepted historical package evidence. Its original native capsule qualified the `cuda-js@0.1.0-alpha.2` facade, clean install/uninstall, first-consumer deletion, unrelated consumers, runtime isolation, cross-runtime rejection, and Windows vector execution. The current package is `cuda-js@0.1.0-alpha.5`; its additive RDC, scalar, Device-LTO, Device-JS, and opaque-operation surfaces have portable/package conformance but retain their own native qualification gates. Unconfirmed Windows CUDA profiles may operate without inheriting support. Public capabilities hide actor tokens; aggregate close reports terminal ownership. [`conformance/f8/README.md`](conformance/f8/README.md) gives the current package controls and native Linux handoff.

The CUDA-JS-owned F9 prerequisite is accepted locally on the exact Windows profile. A typed `cuda-cccl` compile option verifies and snapshots the manifest-owned CUDA 13.3 `cuda/` and `nv/` virtual headers before cache lookup. The generic public-facade capsule compiles `<cuda/atomic>`, completes one device-scope release/acquire publication launch, reads the expected words, and closes all resources terminally. This is a generic compiler/runtime capability only; exact CUDA-MCGS compatible-pair evidence remains pending the independent CUDA-MCGS work package in `iteathen/UMCGS`. [`conformance/f9/README.md`](conformance/f9/README.md) records the bounded claim.

Accepted follow-up contracts are also implemented in portable/software/package paths: SPEC-0010 typed relocatable PTX, SPEC-0011 `u64`/`i32`/`f32` launch scalars, SPEC-0012 typed Device LTO, SPEC-0013 restricted Device-JS through standalone `compileDeviceProgram(runtime, request)`, and SPEC-0016 opaque GPU operations. These are implementation facts, not native-support promotions. Generated CUDA remains private, PTX remains the default compiler path, and one pending operation on one private stream remains the implemented execution bound.

[`docs/HARDWARE_SUPPORT.md`](docs/HARDWARE_SUPPORT.md) publishes the evidence-backed hardware list. The accompanying [`conformance/hardware/`](conformance/hardware/README.md) kit validates the registry, reports incomplete platform runners, and produces consistent direct-test evidence without inferring support across models, compute capabilities, operating systems, or processor architectures.

Run `npm run f8:portable` for installed-package and independent-consumer controls; those consumers exercise typed scalars, opaque operations, RDC, Device LTO, and Device-JS without making native claims. Run `npm run f8` for the legacy qualified Windows package capsule. `npm run verify` includes the current portable chain through F9; `npm run verify:windows` includes the exact native Windows F1–F9 chain. Native evidence is written only to ignored `build/` storage.

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
- [`docs/specs/SPEC-0002-windows-driver-bootstrap.md`](docs/specs/SPEC-0002-windows-driver-bootstrap.md)
- [`docs/architecture/FOUNDATION_ASSESSMENT_AND_PLAN.md`](docs/architecture/FOUNDATION_ASSESSMENT_AND_PLAN.md)
- [`docs/architecture/TARGET_ARCHITECTURE.md`](docs/architecture/TARGET_ARCHITECTURE.md)
- [`docs/architecture/V0_SUPPORT_MATRIX.md`](docs/architecture/V0_SUPPORT_MATRIX.md)
- [`docs/HARDWARE_SUPPORT.md`](docs/HARDWARE_SUPPORT.md)
- [`docs/plans/README.md`](docs/plans/README.md) — active qualification, compatible-pair, execution-continuation, and capability-roadmap runbooks; completed master plans are archived.
- [`experiments/EXPERIMENT_MATRIX.md`](experiments/EXPERIMENT_MATRIX.md)
- [`docs/research/source-register.yaml`](docs/research/source-register.yaml)
- [`STATUS.md`](STATUS.md)
- [`next_step.yaml`](next_step.yaml)
