# ADR-0002: Node-FFI-First Host Binding

**Status:** Accepted

**Date:** 2026-08-10

## Context

The original CUDA-JS direction expected the project to generate x86-64 and ARM64 host-call stubs directly, map V8 Fast API registers to the CUDA Driver ABI, and optionally maintain a separate Node-API backend.

Node.js 26 changed the foundation. Its experimental `node:ffi` module now loads dynamic libraries, describes native signatures, exposes raw-memory helpers, and—when signatures and platform support allow—uses V8 Fast API metadata plus generated per-signature native trampolines. Unsupported shapes fall back to generic libffi.

Reimplementing that complete ABI/JIT layer in CUDA-JS would duplicate active Node platform work and transfer W^X memory, ABI classification, V8 integration, executable-code lifetime, and platform-emitter maintenance into this project before a measured CUDA-specific gap exists.

CUDA-JS still needs a framework above FFI: CUDA schema generation, exact struct layouts, out-parameter packing, context/thread ownership, opaque resources, memory kinds, module/launch plans, completion, deferred errors, compiler/linker actors, capability security, compatibility, and conformance.

The project owner also required a JIT-oriented Node implementation rather than a conventional project-native addon.

## Decision

CUDA-JS version zero uses Node's built-in `node:ffi` as the primary host-call substrate.

CUDA-JS will not ship a project-specific compiled Node addon in the baseline architecture.

### Profiles

#### `fast-jit-candidate`

For calls classified as hot or latency-sensitive, the schema records exact static eligibility expectations for the pinned Node/platform profile and EXP-004 measures the representative call path. This status does **not** by itself prove that Node selected the Fast FFI trampoline.

#### `fast-jit-required`

This support claim is reserved and blocked until EXP-004 establishes a reliable exact-profile qualification mechanism. Once accepted:

- the normalized schema and platform profile must satisfy the supported Fast FFI envelope;
- qualification evidence must directly support the claim rather than infer it only from timing;
- CUDA-JS must not silently move the call onto generic fallback after accepting the profile;
- unsupported or unprovable calls fail capability negotiation or move outside the hot operation.

#### `portable-bootstrap`

Cold initialization, diagnostics, compilation, module loading, uncommon control, and teardown calls may use Node's generic FFI fallback when correctness and event-loop isolation are preserved.

This profile does not support a claim that every host call is JIT-dispatched.

### Direct symbol binding and `cuGetProcAddress`

CUDA-JS stores both:

- the exact exported Driver symbol used for `DynamicLibrary.getFunction()`; and
- the base procedure name, requested CUDA API version, and flags used for `cuGetProcAddress()`.

`cuGetProcAddress()` is used for version/capability/semantics verification. The public Node FFI API reviewed at v26.7.0 does not expose a general callable-wrapper constructor for an arbitrary returned function pointer, so CUDA-JS v0 does not rely on invoking that pointer directly.

A function is rejected when the requested version/semantics cannot be reconciled with a directly callable exported symbol.

Arbitrary-pointer invocation remains a bounded experiment or future Node capability.

### Ownership above Node FFI

Node FFI remains an unsafe internal backend. CUDA-JS public APIs expose opaque branded resources and bounded operations—not raw native pointers, `DynamicLibrary`, or unconstrained memory helpers.

All Driver calls execute inside a thread-affine runtime actor. Compiler/linker calls use a separate actor. JavaScript callbacks from CUDA-managed threads are excluded from v0.

## Why this still satisfies the JIT direction

The project does not compile or distribute a CUDA-JS native addon. Node itself owns the native FFI implementation and generated Fast API trampolines.

The architecture preserves a strict hot-call JIT profile as a hard release gate, but does not claim it before the exact Node profile can be qualified. Generic fallback is permitted only for declared cold operations in `portable-bootstrap`.

If the owner later requires guaranteed JIT dispatch for every cold and hot call, that is a stronger requirement than the current public Node FFI API can prove. It triggers a new decision and a custom/upstream pointer-call experiment rather than silently changing this architecture.

## Consequences

- Initial implementation burden and ABI risk fall substantially.
- Node 26.1.0 with `--experimental-ffi` becomes the minimum known-operational testing substrate. Later unconfirmed releases may run; exact-profile evidence still controls support claims.
- Release claims must state the exact Node version and FFI profile.
- Fast-path qualification, conformance, and performance calibration become explicit gates; until they pass, no `fast-jit-required` support claim exists.
- The schema must distinguish hot-call eligibility from generic-call support.
- A direct custom JIT backend is not deleted as an option, but it is no longer the baseline and requires measured evidence.
- CUDA-JS remains responsible for every CUDA-specific safety, lifetime, context, memory, compiler, error, and compatibility property.

## Alternatives considered

### Custom architecture-specific JIT first

Rejected as the baseline. It duplicates Node's current Fast FFI machinery and creates larger W^X, ABI, V8, unwind, crash-diagnostic, and platform maintenance obligations before a CUDA-specific gap is measured.

### Node-API addon first

Rejected. It conflicts with the no-project-addon/JIT direction, adds build and binary distribution burdens, and still requires CUDA schema/lifecycle work.

### Native helper daemon first

Rejected as the default. It improves crash isolation but adds IPC, process, transfer, deployment, and lifetime complexity. It remains a possible isolation profile after the in-process contract is sound.

### Wait until Node FFI is stable

Rejected for research and pre-release development. The framework can pin exact Node versions and remain private. Public production release is separately gated on maturity, conformance, and support policy.

### Treat all Node FFI fallback as acceptable

Rejected. It would weaken the user's hot-path JIT objective and make performance behavior implicit. The runtime exposes explicit profiles and fails unsupported hot-call capability.

## Validation

Before production implementation, prove:

- Node FFI can load the Driver, NVRTC, and nvJitLink libraries on each target platform;
- generated signatures and struct layouts match official headers;
- any advertised `fast-jit-required` call has a reliable exact-profile qualification mechanism and supporting evidence;
- direct exported symbols agree with requested `cuGetProcAddress()` versions/semantics;
- raw pointers remain confined to the actor/backend boundary;
- context/thread affinity, completion, errors, teardown, and GC behavior are sound;
- no project-specific native addon enters the baseline package.

## Revisit triggers

Revisit when Node FFI changes incompatibly, cannot support a required exported symbol, cannot prove a required hot-call profile, cannot maintain event-loop responsiveness, is unavailable on a required platform, or a measured custom JIT/backend provides decisive lifecycle or performance benefit.
