# CUDA-JS Application Profile

## Mission

Provide a generic, JavaScript-authored and JIT/native-realized, no-project-addon Node runtime for CUDA host APIs using trusted generated schemas, Node 26 built-in FFI, thread-affine actors, opaque resources, explicit memory/lifecycle/error contracts, and independent conformance. Native CUDA providers and generated device artifacts realize execution; C/C++ probes/oracles are evidence rather than shipped runtime implementation.

This mission describes the published `cuda-js` core package. Accepted ADR-0007 assigns reusable neural-network semantics to independent `iteathen/cuda-nn`; generic Tensor mathematics/planning belongs to `iteathen/CUDA-JS-Tensor`. CUDA-JS remains independently installable and gains no NN exports, dependencies, NN-shaped/eager provider discovery, tensor/training semantics, model semantics, or search semantics. Historical ADR-0004/SPEC-0027 remain provenance for the earlier same-repository NN isolation decision but no longer authorize `nn.*` production components here.

## Required architecture

- Node FFI is a private backend, never the public API.
- One DriverActor Worker owns one private context and raw Driver resources by default.
- One CompilerActor owns NVRTC/nvJitLink and device-artifact cache work.
- Header-derived ABI facts and curated semantic overlays compile into deterministic Runtime IR.
- Generated products include FFI definitions, packers, safe TypeScript metadata, compatibility manifests, and tests.
- `cuGetProcAddress` verifies requested version/status/semantics; v0 invokes only exact approved named exports.
- Strict JIT support is profile- and evidence-gated; no silent claim from apparent eligibility.
- Public resources are opaque runtime/kind/slot/generation/state capabilities.
- Explicit disposal, dependency order, in-flight leases, health transitions, and teardown are mandatory.
- Upper consumers use versioned public contracts; Tensor/NN/search/product semantics never enter private runtime/provider ownership.
- Generic lower-layer gaps discovered by CUDA-NN, CUDA-JS-Tensor or CUDA-MCGS are assessed as consumer-neutral CUDA-JS capabilities before any private/deep-import workaround.

## Current support sequence

- OS-neutral public/component architecture with platform details confined to injected adapters.
- Linux x86-64 reference implementation, with Ubuntu 24.04 LTS as the first exact Node 26/CUDA 13.3/Driver qualification cell.
- Windows x86-64 maintained peer adapter, retaining its accepted exact-profile evidence.
- Linux ARM64 SBSA.
- WSL2 diagnostics.

Node 22/24, macOS, 32-bit hosts, project addons, arbitrary pfn calls, shared contexts across Workers, external/borrowed contexts, and unrestricted callbacks are excluded from v0.

## Current authorization

`CJS-F1A / EXP-000`, `CJS-F1B`, Windows-only `CJS-F2W / EXP-012`, Windows CJS-F3W through CJS-F8W, and the CUDA-JS-owned CJS-F9 trusted-header/atomic-publication prerequisite are accepted on exact host, ABI, Driver, GPU, permission, oracle, actor-affinity, resource, memory, execution, compiler/linker/cache, package, consumer, install, and cleanup evidence. The F3 through F8 control/package path also passes in native Linux CI without establishing Linux Driver support. ADR-0006 makes completing Linux `CJS-F2L / EXP-001` through F8L the primary native workstream; their current state remains incomplete, not supported. Exact consumer interop remains pending independently owned consumer artifacts/adapters and frozen-pair evidence; repository separation alone is not compatibility, native-support, or production-readiness proof.
