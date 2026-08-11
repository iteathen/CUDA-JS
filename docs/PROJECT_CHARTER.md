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

CUDA-JS does not own any consumer's domain algorithm, graph model, scheduler policy, evaluator semantics, model semantics, or resource plan.

## Ecosystem language policy

Python is prohibited throughout CUDA-JS, UMCGS, and every future project whose primary purpose is to build, test, package, release, operate, or extend the UMCGS ecosystem.

The prohibition applies to production and reference source, tools, official-header/schema importers, generators, tests, benchmarks, documentation tooling, CI, packaging, installers, release automation, migrations, diagnostics, prototypes, experiments, and one-off or temporary scripts. Indirect, vendored, or containerized invocation does not create an exception when ordinary project use still requires Python.

This is a hard project gate rather than a preference. Use only languages and toolchains accepted by the owning repository and boundary. The complete rule, prohibited artifacts, validation requirements, and cross-repository inheritance are defined in [`../agent_files/general_foundation/NO_PYTHON_POLICY.md`](../agent_files/general_foundation/NO_PYTHON_POLICY.md).

## Universality rule

The public contract describes the widest truthful CUDA runtime invariants. It does not expose one consumer's object layout or assume one memory kind, CPU ABI, GPU architecture, driver version, launch strategy, or Node release beyond a declared support profile.

## Host-binding rule

The version-zero baseline uses Node's built-in FFI and ships no CUDA-JS-specific compiled addon. It reuses Node's Fast API JIT path where an exact profile is qualified; strict JIT support is not claimed before that evidence. Direct custom JIT work requires a measured gap and separate accepted decision.

## Safety rule

JavaScript does not receive an unconstrained pointer capability. Native resources use opaque IDs with ownership, generation, bounds, actor/context identity, and lifecycle validation. Unsafe raw-memory operations are isolated and excluded from ordinary compatibility guarantees.

## Resource rule

All resources are finite and owned. Allocation failure, unsupported capability, cancellation, teardown, and deferred asynchronous error are specified behavior.

## First milestone

Propose the version-zero contracts, run the bounded foundation experiments, accept only the supported contract slices, and publish no production package until the schema, backend, actor/resource, memory, compile/link/load, launch/completion, error/health, security, conformance, and package gates pass.
