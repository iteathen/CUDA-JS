# CUDA-JS Project Charter

**Status:** Accepted

## Purpose

Create a generic, schema-driven Node.js runtime and toolchain for the CUDA Driver API that allows unrelated consumers to compile, load, launch, observe, cancel, and tear down CUDA work through explicit, finite, versioned contracts.

## Product boundary

CUDA-JS owns:

- CUDA capability and entry-point discovery;
- official-header import, normalized schemas, generated Node FFI definitions, ABI packers, and version policy;
- Node FFI host binding and any future accepted gap backend;
- thread-affine runtime/compiler actors;
- opaque resource handles;
- memory capability and lifetime contracts;
- device compilation, linking, loading, and artifact identity;
- generic kernel argument and launch contracts;
- asynchronous completion and cancellation delivery;
- normalized errors and context health;
- generic mocks, conformance, diagnostics, packaging, and compatibility.

The published `cuda-js` core package does not own any consumer's domain algorithm, graph model, scheduler policy, evaluator semantics, model semantics, tensor/training semantics, or resource plan.

The CUDA-JS project may also own an optional, application-neutral NN training product under accepted [`ADR-0004`](decisions/ADR-0004-nn-extension-package-boundary.md) and [`SPEC-0027`](specs/SPEC-0027-nn-extension-foundation.md). That product is a separate future publish unit: it may consume accepted public core contracts, but core never imports it or inherits its exports, dependencies, NN-shaped/eager provider discovery, release identity, or semantics. Every NN production boundary requires a separately accepted child specification. Consumers continue to own model architecture, datasets, objectives, domain policy, deployment, and unrelated search semantics.

## Universality rule

The public contract describes the widest truthful CUDA runtime invariants. It does not expose one consumer's object layout or assume one memory kind, CPU ABI, GPU architecture, driver version, launch strategy, or Node release beyond a declared support profile.

## Host-binding rule

The version-zero baseline uses Node's built-in FFI and ships no CUDA-JS-specific compiled addon. It reuses Node's Fast API JIT path where an exact profile is qualified; strict JIT support is not claimed before that evidence. Direct custom JIT work requires a measured gap and separate accepted decision.

## Production-source rule

CUDA-JS is **JavaScript-authored and JIT/native-realized** under [`ADR-0005`](decisions/ADR-0005-javascript-authored-jit-native-realized.md). The maintained core runtime shipped by CUDA-JS is JavaScript/ESM. Node/V8, native CUDA provider libraries, private generated CUDA C++ and produced device artifacts realize execution without becoming a CUDA-JS-maintained C/C++ host runtime.

C/C++ ABI probes, conformance oracles and generated fixtures may exist as independently owned evidence but are not shipped runtime implementation. A future maintained native host backend requires a measured gap and a separate accepted architecture/package/lifecycle decision; it may not arrive as an incidental optimization or consumer workaround.

## Safety rule

JavaScript does not receive an unconstrained pointer capability. Native resources use opaque IDs with ownership, generation, bounds, actor/context identity, and lifecycle validation. Unsafe raw-memory operations are isolated and excluded from ordinary compatibility guarantees.

## Resource rule

All resources are finite and owned. Allocation failure, unsupported capability, cancellation, teardown, and deferred asynchronous error are specified behavior.

## First milestone

Propose the version-zero contracts, run the bounded foundation experiments, accept only the supported contract slices, and publish no production package until the schema, backend, actor/resource, memory, compile/link/load, launch/completion, error/health, security, conformance, and package gates pass.
