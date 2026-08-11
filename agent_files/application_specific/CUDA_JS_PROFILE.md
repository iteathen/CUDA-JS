# CUDA-JS Application Profile

## Mission

Provide a generic, no-project-addon Node runtime for CUDA host APIs using trusted generated schemas, Node 26 built-in FFI, thread-affine actors, opaque resources, explicit memory/lifecycle/error contracts, and independent conformance.

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

## Current support sequence

- Linux x86-64, exact Node 26, CUDA 13.3/current Driver profile.
- Windows x86-64.
- Linux ARM64 SBSA.
- WSL2 diagnostics.

Node 22/24, macOS, 32-bit hosts, project addons, arbitrary pfn calls, shared contexts across Workers, external/borrowed contexts, and unrestricted callbacks are excluded from v0.

## Current authorization

Only foundation research and experiments CJS-F0 through CJS-F3 are ready. Broader memory/module/compiler/platform/package work remains dependency-blocked.
