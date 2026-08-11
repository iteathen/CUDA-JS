# Node FFI and CUDA Runtime Landscape

**Status:** Research Note

**Date:** 2026-08-10

## Question

Does an existing Node.js CUDA project already provide the generic, schema-driven, no-project-addon runtime CUDA-JS needs, and does the arrival of Node 26 `node:ffi` change the host-binding architecture?

## Executive finding

No reviewed Node CUDA project provides the intended framework boundary well enough to adopt as the CUDA-JS foundation.

The decisive new prior art is Node.js itself. Node 26.1 introduced the experimental `node:ffi` module, and Node 26.7 includes a V8 Fast API path backed by generated per-signature native trampolines. That machinery already performs the x86-64/ARM64-style ABI bridging and W^X executable-memory work the original CUDA-JS sketch expected to implement directly.

CUDA-JS should therefore use **Node FFI first**, behind CUDA-JS-owned schemas, opaque resources, thread-affine actors, packers, error state, and conformance. It should not start by recreating Node's register shufflers or by shipping a project-specific Node-API addon.

Node FFI remains experimental and unsafe. It exposes raw-pointer primitives but does not own CUDA lifetimes, context affinity, struct layouts, out-parameters, deferred errors, or resource security. CUDA-JS still has substantial framework work to do.

## Verified Node FFI facts

At Node.js v26.7.0:

- `node:ffi` is experimental and requires `--experimental-ffi`.
- When the Node permission model is enabled, FFI additionally requires `--allow-ffi`.
- It loads dynamic libraries and resolves named native symbols.
- It accepts scalar, pointer-like, Buffer, ArrayBuffer, and function-pointer signature categories.
- It exposes raw memory helpers and `getRawPointer()` for JavaScript-managed storage.
- Pointer-sized and 64-bit values use `bigint`.
- The Fast FFI path uses V8 Fast API metadata plus generated native trampolines and falls back to generic libffi for ineligible shapes.
- Fast FFI eligibility is architecture- and signature-dependent. Public functions over the supported register/argument envelope fall back rather than failing.
- In the reviewed Node 26.7.0 source, the global Fast FFI cap is eight user arguments; Linux x86-64 admits up to six integer/pointer arguments and eight FP arguments, AArch64 up to seven integer/pointer and eight FP arguments, and the current Windows x86-64 emitter only three public scalar arguments with no fast buffer arguments.
- JavaScript callbacks must execute on the same system thread where they were created and cannot return promises or throw.
- Raw pointers and zero-copy foreign-memory views have no automatic ownership, bounds, or lifetime tracking.
- The public API creates callable wrappers for **named library symbols**. It exposes resolved symbol pointers, but the reviewed public API does not expose a general “create callable from arbitrary pointer” operation.

Official Node sources are recorded in `source-register.yaml`.

## Consequence for `cuGetProcAddress`

`cuGetProcAddress()` remains useful and important for:

- requested CUDA API-version negotiation;
- PTDS/legacy stream semantics selection;
- capability and status reporting;
- detecting version-family availability;
- comparing a directly resolved exported symbol with the version-negotiated pointer during conformance.

However, CUDA-JS v0 cannot assume it can invoke the arbitrary pointer returned by `cuGetProcAddress()` through public `node:ffi`.

The safe v0 path is:

1. keep both the base procedure name and exact exported symbol in the generated schema;
2. use `cuGetProcAddress()` to verify requested version and semantics;
3. bind the exact exported symbol by name through `DynamicLibrary.getFunction()`;
4. reject a function/profile when the direct symbol and negotiated semantics cannot be proven compatible;
5. keep arbitrary-pointer invocation as an explicit experiment or future Node capability, not hidden implementation behavior.

## Consequence for the user's JIT-only direction

The original “JIT only” direction is retained as three concrete constraints:

- CUDA-JS ships no project-specific compiled addon in the selected v0 baseline and never maintains hand-written or ahead-of-time per-CUDA-function wrappers.
- A small generic native/JIT gap backend remains possible only after EXP-011 and a separate accepted decision.
- Calls designated as hot remain `fast-jit-candidate` until EXP-004 provides a reliable exact-profile qualification mechanism; an unqualified runtime must not advertise `fast-jit-required`.

Cold initialization, diagnostics, compile, load, teardown, and uncommon control calls may use Node's generic FFI fallback in the portability profile. They do not belong in a per-search or per-kernel hot loop.

If the project owner later requires every single host call—including cold setup—to use a guaranteed JIT trampoline, the public Node FFI surface is not yet sufficient to prove that requirement. That becomes a separate upstream/custom-JIT experiment rather than a reason to duplicate the entire host-binding layer now.

## CUDA facts shaping the framework

### Context affinity

CUDA Driver contexts are current to a host thread. Most context-dependent functions require a valid context current on the calling thread. This strongly favors a serialized worker actor that owns the context and all raw resources.

### Asynchronous error attribution

Many Driver calls may report errors from previous asynchronous work. CUDA-JS cannot model every non-success result as an isolated ordinary exception. It needs operation provenance and context-health transitions.

### Driver entry-point versions

`cuGetProcAddress()` takes a base symbol name, requested CUDA version, flags, and status output. NVIDIA discourages mixing API-version families. The schema must keep version-family and stream-semantics identity complete.

### Runtime compilation

NVRTC compiles device CUDA C++ and emits PTX or cubin. It does not compile the Node host bridge. nvJitLink links device-code inputs into loadable cubin. Compiler/linker work therefore has a separate actor, resource lifecycle, and cache identity from host FFI binding.

### Launch shape

`cuLaunchKernel()` has a large host signature and is expected to use generic FFI. `cuLaunchKernelEx()` moves launch dimensions and attributes into a structure and leaves four host arguments. That shape is a Fast FFI candidate on the current Linux x86-64 and ARM64 envelopes, but exceeds the current three-argument Windows x86-64 fast emitter and should be expected to use fallback there.

CUDA-JS should prefer `cuLaunchKernelEx()` where capability permits, while proving structure layout and argument-pointer packing exactly. After the ordinary launch lifecycle is correct, CUDA Graph execution is a useful prepared-repeat profile because `cuGraphLaunch()` has only two host arguments; graph object lifetime and thread-safety remain separate correctness gates.

## Prior-art assessment

### Node.js `node:ffi`

**Disposition:** adopt as the v0 host-binding substrate.

Strengths:

- maintained by Node;
- dynamic-library and raw-memory primitives;
- generated V8 Fast API trampolines;
- x86-64 and ARM64 support among broader architectures;
- no CUDA-JS project addon build;
- built-in generic fallback;
- explicit resource management on library objects.

Gaps CUDA-JS must own:

- CUDA schema/version import;
- structs, unions, enums, pointer graphs, and out-parameter packing;
- opaque safe public resources;
- context/thread affinity;
- asynchronous completion;
- CUDA error and context-health semantics;
- memory-kind contracts;
- compile/link/load/cache identity;
- CUDA conformance and packaging.


### Koffi

**Disposition:** general FFI architecture and conformance reference; not a CUDA runtime foundation.

Koffi demonstrates a mature cross-platform Node FFI, broad type conversion, callbacks, asynchronous invocation, and performance-oriented native calling. It does not own CUDA context affinity, Driver version families, deferred errors, GPU memory lifetimes, module/launch plans, or device toolchain/cache semantics. Node 26's built-in FFI also removes the need to adopt another general FFI as the selected baseline.

### `sammwyy/cuda.js`

**Disposition:** bounded feature and failure reference; not a foundation.

It provides a friendly high-level CUDA API and NVRTC use, but builds a native addon with `node-gyp`, mixes Driver and Runtime APIs, assumes toolkit/compiler installation, exposes a narrow array/kernel model, and does not establish schema/version, context-health, generic lifetime, or independent capability contracts.

### `node-nvrtc` and older `node-cuda` / `node-js-cuda` projects

**Disposition:** historical and bounded failure evidence only.

`node-nvrtc` exposes a useful compile/buffer/launch prototype but is pinned to old CUDA binaries and conflates a narrow API with a universal runtime. The older projects are native-addon efforts tied to obsolete Node build systems, machine-specific library paths, or narrow CUDA interfaces. They do not satisfy the current genericity, versioning, schema-update, context/resource-security, packaging, or conformance requirements.

### RAPIDS Node

**Disposition:** packaging and native-integration evidence only.

It demonstrates that Node can host substantial GPU libraries, but it is a native-addon ecosystem exposing selected RAPIDS/CUDA capabilities rather than a generic schema-driven Driver runtime.

## Experiment-order conclusion

When implementation experiments are later authorized, the first one must not require CUDA. EXP-000 uses a generated synthetic C shared library and direct C oracle to qualify Node FFI, pointer/out/structure-storage packing, platform argument envelopes, Worker isolation, library lifetime, cleanup, and the arbitrary-function-pointer gap. Only after that passes should CUDA-JS generate CUDA-specific bindings and run the Driver/ABI experiments.

## Research conclusion

CUDA-JS is still justified as a separate framework. What changed is the lowest layer:

```text
Original direction
    custom architecture-specific host JIT first

Revised direction
    CUDA-JS schema/lifecycle/runtime framework
        on Node's built-in FFI and Fast API JIT path first
        with a custom pointer/JIT backend only for proven gaps
```

This reduces implementation and platform risk while preserving the user's schema/JIT goals. The durable prohibition is against duplicate per-CUDA wrapper authority; the no-addon baseline can be revisited only for a measured generic gap.
