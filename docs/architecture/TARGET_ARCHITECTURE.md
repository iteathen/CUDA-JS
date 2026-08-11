# CUDA-JS Target Architecture

**Status:** Proposal

## Objective

Define the target shape of a generic, schema-driven Node runtime for the CUDA Driver API. This is explanatory architecture beneath accepted ADRs and specifications. It does not authorize implementation.

## Architectural cascade

- **LEGO at boundaries:** independently replaceable components with explicit versioned contracts, injected dependencies, ownership, lifecycle, and evidence.
- **SOLID inside components:** single responsibility, small interfaces, dependency inversion, and extension through public contracts.
- **CUPID for composition:** predictable, idiomatic, domain-aligned internals and useful diagnostics.
- **KISS after fundamentals:** remove accidental machinery without erasing ownership, safety, compatibility, failure, or cleanup.

## Planned component graph

```text
Public async facade
        |
Capability and compatibility resolver
        |
+----------------------+----------------------+
|                                             |
DriverActor Worker                            CompilerActor Worker/process
|                                             |
Private Node FFI adapter                      NVRTC / nvJitLink providers
|                                             |
CUDA Driver named exports                     Device artifact/cache pipeline
|
Private context + opaque resource registry
|
Memory / module / function / stream / event / operation bricks
```

Schema compilation is a separate pipeline:

```text
Pinned official headers -> generated ABI facts -> normalized Runtime IR
Reviewed semantic overlay --------------------^            |
                                                         generated products
```

Generated products may eventually include private FFI definitions, argument packers, safe metadata, compatibility manifests, and conformance cases. Generated facts and semantic overlays must remain independently reviewable.

## Public facade

The public API is asynchronous, capability-oriented, and free of Node FFI or raw native representations. Requests carry bounded data and opaque resource identities. Results report exact capability, state, failure provenance, and claim profile.

Public contracts do not expose:

- raw pointers or Driver handles;
- dynamic-library objects or foreign functions;
- private actor identifiers or provider paths;
- unchecked executable schemas;
- implicit context switching;
- generic “zero-copy” or “fast” promises.

## DriverActor

One DriverActor Worker owns one private context and all raw Driver resources for that runtime by default. It serializes context-affine operations, validates runtime/kind/slot/generation/state identity, tracks parent-child dependencies and in-flight leases, and owns deterministic teardown.

External or borrowed contexts, shared contexts across Workers, and arbitrary callbacks are outside version-zero support unless later accepted with independent evidence.

## CompilerActor

The CompilerActor isolates potentially blocking NVRTC and nvJitLink work from the application event loop and DriverActor. Compiler inputs, options, provider versions, logs, outputs, and cache identities are explicit. Process isolation remains a capability choice when provider side effects or recoverability evidence requires it.

## Host-call backend

Version zero is **Node-FFI-first** and uses approved named exports. `cuGetProcAddress` verifies requested API version, status, and semantics. Arbitrary returned function-pointer invocation remains unsupported until a public constructor is independently qualified.

Profiles are explicit:

- `portable-bootstrap` may permit a generic cold-path fallback where declared;
- `fast-jit-required` must fail closed unless exact Node/OS/ABI/signature evidence proves the required mechanism;
- no timing result alone proves that Fast FFI or a generated JIT path was used.

A custom AsmJit/register stub path is a deferred measured-gap option, not baseline architecture.

## Resource model

Public resources use opaque identities containing at least runtime, kind, slot, generation, and state. The private registry owns native handles, context affinity, parent links, leases, close state, and terminal disposition.

Required states distinguish live, closing, closed, stale generation, suspect context, poisoned context, dead runtime epoch, and restart-required conditions where applicable.

## Memory model

Memory contracts state placement, host/device visibility, coherence, required synchronization, mapping, bounds, lifetime, and supported profiles. Device, staged pageable, pinned, mapped, managed, imported, and mock memory are separate capability families.

A JavaScript view never silently extends the native lifetime. Explicit close is authoritative; finalizers are diagnostics or last-resort requests, not primary cleanup.

## Launch and completion

Module and function identity, argument packing, launch configuration, stream ordering, event completion, cancellation, and deferred errors require exact contracts. Host relaunch or polling is not described as device-resident progress. Completion may use bounded polling, events, or another qualified mechanism, but no CUDA-managed thread may invoke JavaScript directly.

## Error and health model

Errors distinguish validation, unsupported capability, immediate Driver failure, deferred failure, cancellation, pressure/exhaustion, stale resource, suspect/poisoned context, closed runtime, and restart-required state. Deferred errors retain operation and synchronization provenance. Health transitions are conservative and observable.

## Compatibility and cache identity

Material identity includes schema/header revision, generator and semantic-overlay revision, Node build and flags, OS/ABI, Driver/toolkit/provider versions, GPU architecture, options, artifact/model/adapter identity, and resource profile where relevant.

Unknown or contradictory public semantics fail closed. Support is an evidence-backed profile, not a broad version-range guess.

## Conformance ownership

- CUDA-JS owns generic runtime conformance and native lifecycle evidence.
- Consumers own their domain semantics.
- Public compatible-pair capsules test exact consumer/runtime artifact combinations.
- Mocks test orchestration only and are never native or performance oracles.

## Current phase

`CJS-F1A / EXP-000` and the `CJS-F1B` schema/ABI foundation are accepted on independent Windows/Linux host and native-layout evidence. This target architecture still does not authorize production components or CUDA Driver execution beyond accepted predecessor and qualified-environment gates.
