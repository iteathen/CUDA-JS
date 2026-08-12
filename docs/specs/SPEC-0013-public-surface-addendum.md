# SPEC-0013 Public-Surface Addendum

**Status:** Accepted

**Date:** 2026-08-12

## Clarification

The first public Device-JS bridge is the standalone helper:

```text
compileDeviceProgram(runtime, request)
```

rather than a new `CudaRuntime.compileDeviceProgram(request)` method.

This supersedes only the method-shaped spelling in the **Public request** section of SPEC-0013. All request/result semantics, ownership, validation, identity, helper, lowering, compiler, evidence and non-goal requirements remain unchanged.

## Rationale

Device-JS is intentionally a small optional authoring helper over the existing compiler/runtime bricks. A standalone function:

- keeps `CudaRuntime` focused on resource/compiler/runtime ownership;
- avoids widening every runtime instance with an optional language convenience method;
- makes the dependency direction explicit: Device-JS consumes a CUDA-JS runtime/compiler capability;
- is independently removable without altering the lower-level runtime object contract;
- satisfies the owner requirement that CUDA-specific source/lowering remain isolated in CUDA-JS without creating a larger language ecosystem.

The helper validates/translates first, then invokes the runtime's existing typed `compile()` method with private generated CUDA source. Generated CUDA remains non-public implementation data.
