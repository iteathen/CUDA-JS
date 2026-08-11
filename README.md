# CUDA-JS

**Schema-driven Node.js runtime and toolchain for CUDA host APIs**

CUDA-JS is a public, pre-release framework for compiling, loading, launching, observing, and tearing down CUDA work from Node.js through finite, versioned, capability-checked contracts. It is deliberately independent of graph search, games, tensor frameworks, neural-network semantics, and any one application.

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

`CJS-F1B` is also accepted and expanded for F4: the pinned CUDA 13.3.29 package regenerates 17 reviewed Tier-0 function facts, 11 type/layout facts, private FFI definitions/packers/types/conformance products, and a fail-closed catalog of 466 unselected Driver declarations. Native Ubuntu CI performs exact Clang generation and rejects checked-in drift. The installed Windows CUDA 13.3 header is hash-identical, and MSVC independently confirms the selected Win64 layouts.

Windows-only `CJS-F2W / EXP-012` is accepted. Official Node 26.7.0 and an independent MSVC oracle agree on the CUDA 13.3 Driver, GTX 1660 Ti device/attributes, all 12 Tier-0 exports and procedure queries, error text, permission behavior, and private context lifecycle/cleanup. Linux `CJS-F2L / EXP-001` has executable source/ABI/oracle preparation, environment diagnostics, and a final smoke runner, but remains incomplete because the available native Linux guest has no supported GPU exposure. [Linux qualification issue #4](https://github.com/iteathen/CUDA-JS/issues/4) is open for contributors; Windows evidence does not imply Linux support.

Windows-only `CJS-F3W` is accepted. A dedicated Worker owns the Driver library, one private context, and an opaque resource registry; the bounded async facade proves context affinity, stale/wrong-kind rejection, main-loop responsiveness, conservative health, graceful teardown, and honest restart-required reporting after unexpected Worker loss. The platform-neutral F3 capsule passes on Windows and native Linux x86-64. Native Linux Driver/context execution remains incomplete and continues to depend on `CJS-F2L` qualification.

Windows-only `CJS-F4W` is accepted. The runtime can allocate quota-bounded device memory, copy owned `Uint8Array` bytes synchronously through five exact generated Driver exports, reject unsafe ranges before native invocation, release opaque allocations, reuse slots without accepting stale generations, and free allocations before context teardown. An independent MSVC oracle and the Node path agree byte-for-byte. The portable F4 capsule and native Ubuntu schema generation prepare the Linux implementation, while [`conformance/f4/README.md`](conformance/f4/README.md) documents the remaining human-engineering gates without claiming Linux CUDA support.

Run `npm run f4:portable` for shared memory/control-plane validation or `npm run f4` for the complete qualified Windows memory capsule. `npm run verify` includes the portable regression set; `npm run verify:windows` includes the exact native Windows chain. The Linux hardware procedures are in [`experiments/exp-001/README.md`](experiments/exp-001/README.md) and [`conformance/f4/README.md`](conformance/f4/README.md). Native evidence is written only to ignored `build/` storage.

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
- [`docs/plans/2026-08-10-master-plan.md`](docs/plans/2026-08-10-master-plan.md)
- [`experiments/EXPERIMENT_MATRIX.md`](experiments/EXPERIMENT_MATRIX.md)
- [`docs/research/source-register.yaml`](docs/research/source-register.yaml)
- [`STATUS.md`](STATUS.md)
- [`next_step.yaml`](next_step.yaml)
