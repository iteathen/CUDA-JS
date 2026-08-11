# CUDA-JS

**Schema-driven Node.js runtime and toolchain for CUDA host APIs**

CUDA-JS is a private, pre-release framework for compiling, loading, launching, observing, and tearing down CUDA work from Node.js through finite, versioned, capability-checked contracts. It is deliberately independent of graph search, games, tensor frameworks, neural-network semantics, and any one application.

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

The private GitHub repository now contains the reviewed **documentation foundation**: agent entry rules, ownership registry, charter, accepted ADRs, architecture, support bounds, specification map, research/source register, non-authoritative plan, experiment protocols, status, and current next-step contract.

The current phase is documentation only. No production runtime, native fixture, schema importer, generated binding, experiment harness, benchmark implementation, or package has been accepted or authorized. `EXP-000` and later gates remain future protocols, not executed work.

Native and performance claims remain blocked until the project owner explicitly advances the phase and the exact required Node/CUDA/Driver/toolkit/GPU environment is available.

## Start here

- [`AGENTS.md`](AGENTS.md)
- [`docs/PROJECT_CHARTER.md`](docs/PROJECT_CHARTER.md)
- [`docs/FOUNDATION_INDEX.md`](docs/FOUNDATION_INDEX.md)
- [`agent_files/SYSTEM_REGISTRY.md`](agent_files/SYSTEM_REGISTRY.md)
- [`docs/decisions/README.md`](docs/decisions/README.md)
- [`docs/decisions/ADR-0002-node-ffi-first-host-binding.md`](docs/decisions/ADR-0002-node-ffi-first-host-binding.md)
- [`docs/architecture/FOUNDATION_ASSESSMENT_AND_PLAN.md`](docs/architecture/FOUNDATION_ASSESSMENT_AND_PLAN.md)
- [`docs/architecture/TARGET_ARCHITECTURE.md`](docs/architecture/TARGET_ARCHITECTURE.md)
- [`docs/architecture/V0_SUPPORT_MATRIX.md`](docs/architecture/V0_SUPPORT_MATRIX.md)
- [`docs/plans/2026-08-10-master-plan.md`](docs/plans/2026-08-10-master-plan.md)
- [`experiments/EXPERIMENT_MATRIX.md`](experiments/EXPERIMENT_MATRIX.md)
- [`docs/research/source-register.yaml`](docs/research/source-register.yaml)
- [`STATUS.md`](STATUS.md)
- [`next_step.yaml`](next_step.yaml)
