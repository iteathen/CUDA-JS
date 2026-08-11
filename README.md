# CUDA-JS

**Schema-driven Node.js runtime and toolchain for CUDA host APIs**

CUDA-JS is a public, pre-release framework for compiling, loading, launching, observing, and tearing down CUDA work from Node.js through finite, versioned, capability-checked contracts. It is deliberately independent of graph search, games, tensor frameworks, neural-network semantics, and any one application.

> **Testing-phase notice:** CUDA-JS is an experimental public alpha. On Windows x64 it will attempt to operate on unconfirmed CUDA hardware without a compatibility opt-in. Successful installation, startup, compilation, memory transfer, or kernel execution does not mean that a profile is supported. Expect failures, restart-required states, incomplete features, and breaking changes; do not use this release for production or safety-critical work.

Exact evidence is published in the [Node version support list](docs/NODE_SUPPORT.md) and [hardware support list](docs/HARDWARE_SUPPORT.md). Node releases with the required FFI substrate and Windows CUDA devices that pass the runtime's structural safety checks may operate as `testing-unconfirmed`. Only Node 26.7.0 and the recorded Windows x64 GPU profile currently carry qualified experimental evidence. CUDA-JS blocks execution only where the current implementation knows it cannot operate safely or at all, including a missing platform backend, missing required FFI substrate or authority, unavailable Driver surface, malformed device facts, or prohibited CUDA compute mode.

The package manifest is public rather than npm-private. CUDA-JS is available under the [GNU Affero General Public License version 3 or later](LICENSE). Organizations that need different terms may request a separately negotiated [commercial license](LICENSING.md). A registry release still requires a separate release, provenance, and registry review.

## Contributing and funding

Focused bug reports, platform qualification, documentation, tests, and contract-preserving improvements are welcome; see [`CONTRIBUTING.md`](CONTRIBUTING.md). GitHub Sponsors is the deliberately low-maintenance funding path. Sponsorships are intended to offset GitHub, CI, testing hardware, and project-maintenance costs; see the [sponsorship setup and policy](docs/SPONSORSHIP.md).

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

Windows-only `CJS-F4W` is accepted. The runtime can allocate quota-bounded device memory, copy owned `Uint8Array` bytes synchronously through five exact generated Driver exports, reject unsafe ranges before native invocation, release opaque allocations, reuse slots without accepting stale generations, and free allocations before context teardown. An independent MSVC oracle and the Node path agree byte-for-byte. The portable F4 capsule and native Ubuntu schema generation prepare the Linux implementation, while [`conformance/f4/README.md`](conformance/f4/README.md) documents the remaining human-engineering gates without claiming Linux CUDA support.

Windows-only `CJS-F5W` is accepted. The runtime copies bounded PTX, resolves exact declared function schemas, packs naturally aligned device-memory and `u32` arguments, retains all resource leases, launches one operation on a private nonblocking stream, and resolves only after a private event reports terminal completion. The independent MSVC oracle and Node path agree byte-for-byte on the tracked vector kernel and checksum `15600773`. Deferred failures poison health; completion timeouts terminate the owner with retained orphan/lease evidence. [`conformance/f5/README.md`](conformance/f5/README.md) preserves the human Linux adapter/oracle/evidence work without claiming native Linux CUDA support.

Windows-only `CJS-F6W / EXP-009` is accepted. A separate CompilerActor verifies the canonical CUDA 13.3 NVRTC/nvJitLink providers, compiles copied source to PTX, links PTX to cubin, and validates a content-addressed cache on every hit. Production Node FFI and the independent MSVC oracle emit byte-identical artifacts across clean runs; corruption becomes a miss; both PTX and cubin execute through the DriverActor with checksum `15600773`; all native resources close terminally. [`conformance/f6/README.md`](conformance/f6/README.md) preserves the detailed human Linux provider/cache/evidence handoff without claiming native Linux CUDA support.

Windows-only `CJS-F7W` has exact accepted evidence. The runtime now separates operational testing candidates from known-incompatible hosts without native diagnostic calls, reports CUDA device-zero WDDM/TCC/watchdog/compute-mode facts through DriverActor, preserves the parent Node permission profile in both Workers, sanitizes unexpected actor errors, and exercises deterministic failure/property plus repeated lifecycle partitions. The accepted GTX 1660 Ti profile is WDDM with the CUDA kernel-timeout attribute enabled and default compute mode. Eight DriverActor and eight CompilerActor native cycles close with balanced resources; both actors deny FFI without explicit permission and succeed with the bounded allow profile. [`conformance/f7/README.md`](conformance/f7/README.md) gives human-engineer completion paths for native Linux x86-64, Linux ARM64 SBSA, and WSL2 without promoting any of them.

Windows-only `CJS-F8W` has exact accepted evidence. The public `cuda-js` 0.1.0-alpha.2 testing package exposes a safe runtime facade, immutable compatibility metadata, and a mock-only testing entry. Clean tarball install/uninstall, first-consumer deletion, two unrelated consumers, simultaneous runtime isolation, cross-runtime rejection, and installed-package Windows vector execution pass. Unconfirmed Windows CUDA profiles may operate without inheriting support. Public capabilities hide actor tokens; aggregate close reports terminal ownership. [`conformance/f8/README.md`](conformance/f8/README.md) gives the native Linux adapter and qualification handoff.

The CUDA-JS-owned F9 prerequisite is accepted locally on the exact Windows profile. A typed `cuda-cccl` compile option verifies and snapshots the manifest-owned CUDA 13.3 `cuda/` and `nv/` virtual headers before cache lookup. The generic public-facade capsule compiles `<cuda/atomic>`, completes one device-scope release/acquire publication launch, reads the expected words, and closes all resources terminally. This is a generic compiler/runtime capability only; exact CUDA-MCGS compatible-pair evidence remains pending the independent CUDA-MCGS work package in `iteathen/UMCGS`. [`conformance/f9/README.md`](conformance/f9/README.md) records the bounded claim.

[`docs/HARDWARE_SUPPORT.md`](docs/HARDWARE_SUPPORT.md) publishes the evidence-backed hardware list. The accompanying [`conformance/hardware/`](conformance/hardware/README.md) kit validates the registry, reports incomplete platform runners, and produces consistent direct-test evidence without inferring support across models, compute capabilities, operating systems, or processor architectures.

Run `npm run f8:portable` for package and independent-consumer controls or `npm run f8` for the complete qualified Windows package capsule. `npm run verify` includes the portable regression set; `npm run verify:windows` includes the exact native Windows chain through F8. Native evidence is written only to ignored `build/` storage.

## Start here

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
- [`docs/plans/2026-08-10-master-plan.md`](docs/plans/2026-08-10-master-plan.md)
- [`experiments/EXPERIMENT_MATRIX.md`](experiments/EXPERIMENT_MATRIX.md)
- [`docs/research/source-register.yaml`](docs/research/source-register.yaml)
- [`STATUS.md`](STATUS.md)
- [`next_step.yaml`](next_step.yaml)
