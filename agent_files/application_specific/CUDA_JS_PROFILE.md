# CUDA-JS Application Profile

## Mission

Provide a generic, no-project-addon Node runtime for CUDA host APIs using trusted generated schemas, Node 26 built-in FFI, thread-affine actors, opaque resources, explicit memory/lifecycle/error contracts, and independent conformance.

## Ecosystem language constraint

CUDA-JS and every UMCGS-related project are Python-free. Python may not be used for production or reference code, official-header/schema import, generators, host tooling, tests, benchmarks, documentation tooling, CI, packaging, installers, release work, migrations, diagnostics, prototypes, experiments, or temporary scripts. Python-based ordinary-use dependencies and indirect interpreter invocation are also prohibited.

Apply [`../general_foundation/NO_PYTHON_POLICY.md`](../general_foundation/NO_PYTHON_POLICY.md) to every plan, component, tool, dependency, experiment protocol, and repository split. This is a hard gate; a convenient Python implementation must be rejected or redesigned in an accepted project language.

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
- No Python artifact, interpreter, package manager, build/test dependency, generator, workflow, or temporary support path may enter the repository or its ordinary lifecycle.

## Current support sequence

- Linux x86-64, exact Node 26, CUDA 13.3/current Driver profile.
- Windows x86-64.
- Linux ARM64 SBSA.
- WSL2 diagnostics.

Node 22/24, macOS, 32-bit hosts, project addons, arbitrary pfn calls, shared contexts across Workers, external/borrowed contexts, and unrestricted callbacks are excluded from v0.

## Current authorization

Only documentation-only foundation research and experiment protocols CJS-F0 through CJS-F3 are ready. No experiment execution or implementation is authorized until the project owner explicitly advances the phase.
