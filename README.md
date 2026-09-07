# CUDA-JS

CUDA-JS is an experimental Node.js runtime and toolchain for running GPU work through CUDA. It is intended for JavaScript library and application developers who need explicit device-memory, compilation, and execution control.

**Package:** `cuda-js@0.1.0-alpha.18`. **Publication:** Not published to npm. **Production support:** none; public alpha testing only. Native evidence exists for specific Windows x64 profiles. Native Linux CUDA remains unqualified.

## Why CUDA-JS

- **No compiled addon.** No `node-gyp`, no prebuilt binaries pinned to a Node module ABI, and no CUDA Toolkit required just to install the package. CUDA ABI facts are generated from pinned CUDA headers into normalized schemas/products rather than hand-typed one function at a time.
- **Schema-driven, not curated.** Coverage grows by regenerating the schema against a CUDA release and reviewing the semantic overlay, not by maintaining a hand-written list of whichever calls one application happened to need.
- **Hot calls are shaped for the fast path.** Kernel launch selects `cuLaunchKernelEx` rather than the legacy `cuLaunchKernel`. Execution-path bindings are deliberately kept inside bounded signature and argument shapes intended for Node's fastest FFI dispatch path. This is an interface/schema property, not a performance claim.
- **Explicit instead of hidden.** Context ownership, asynchronous error attribution, and resource lifetimes are first-class API facts rather than behavior hidden behind native RAII. Public contracts preserve the Driver's ownership and failure semantics instead of replacing them with an implicit host-side model.
- **One binding core, not one per platform.** Windows and Linux use the same runtime/component model and execution engine; target-specific ABI facts and driver/provider discovery remain isolated by profile. Windows carries the current native evidence. Linux x86-64 implementation/readiness exists, but native CUDA qualification remains open.
- **Built for GPU-resident work.** Device memory persists across launches. The runtime does not require a host round trip between device operations; higher-level consumers can keep their own active state and progression on the GPU when their contracts permit it.

## What exists

- Device discovery and selection, device allocations and typed views, copied and bounded asynchronous transfers.
- CUDA module loading, kernel arguments, GPU-operation submission, completion, and explicit cleanup.
- NVRTC/nvJitLink compilation, artifact caching, and restricted Device-JS authoring.
- Prepared execution and a bounded optional cuBLASLt matrix-multiplication profile.

These capabilities have different qualification limits. See the [capability map](docs/CAPABILITIES.md), [hardware evidence](docs/HARDWARE_SUPPORT.md), and [Node support](docs/NODE_SUPPORT.md) before choosing a native profile.

## Scope and direction

CUDA-JS owns generic CUDA runtime and compiler mechanisms. Tensor mathematics, neural networks, graph search, and application scheduling belong to consuming libraries.

The project aims to provide a reusable JavaScript CUDA foundation with explicit resource ownership and independently qualified platform profiles. Linux x86-64 is the reference qualification target. Multi-GPU, CUDA Graph realization, broader memory profiles, and process isolation remain future capabilities; see the [architecture](docs/architecture/README.md) and [plans](docs/plans/README.md).

## Getting started

Source development requires Node.js 26.1.0 or later and Git. From a terminal:

```bash
git clone https://github.com/iteathen/CUDA-JS.git
cd CUDA-JS
npm ci
npm run verify
```

This runs repository and portable/package checks; it does not establish native GPU support. Native execution also needs an NVIDIA GPU/Driver, the profile's documented toolchain, and Node's experimental FFI flag. The Node-FFI-first substrate uses experimental `node:ffi` and may require adaptation between Node releases.

For API entry points and an allocation/copy example, see the [public runtime facade](components/runtime-facade/README.md). Read the exact platform requirements in the [hardware qualification guide](conformance/hardware/README.md) before running native checks such as `npm run verify:windows`. EXP-000 provides the synthetic ABI baseline; CJS-F1B and CJS-F2W identify the schema and Windows bootstrap evidence documented there.

## Further information

- [Current status](STATUS.md) and [next development step](next_step.yaml).
- [Documentation](docs/README.md).
- [Contributing](CONTRIBUTING.md) and [repository agent context](AGENT_LOCAL.md).
- [Private security reporting](SECURITY.md).
- [AGPL-3.0-or-later license](LICENSE) and [commercial licensing information](LICENSING.md).
