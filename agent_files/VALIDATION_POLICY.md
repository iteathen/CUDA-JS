# CUDA-JS Validation Policy

## Current documentation phase

Run:

```bash
./scripts/verify-docs.sh
```

A planning claim additionally requires:

- one active ADR-0002 and no competing accepted host-binding plan;
- source revisions and dispositions recorded;
- architecture, support matrix, master plan, focus map, experiments, status, and next step agreeing;
- no production implementation introduced;
- exact Git state and portable artifact verification;
- honest remote/CUDA-environment limitations.

## Schema and ABI

Require deterministic regeneration, pinned official inputs, native C layout probes, mutation sensitivity, fail-closed semantic coverage, and exact generated-product agreement.

## Node FFI backend

Require exact Node build/flags, library paths, named symbols, signatures, pointer/out packing, permission behavior, close/invalidation behavior, and no public raw capability. Fast FFI/JIT claims require exact mechanism qualification, not timing inference alone.

## Actor, resources, and errors

Require context-thread affinity, opaque generation/state validation, parent/child and in-flight leases, immediate/deferred provenance, conservative context-health transitions, bounded queues, responsive application event loop, explicit close, worker shutdown, and leak census.

## Memory and device execution

Require per-kind placement/visibility/coherence/synchronization/lifetime contracts, bounds/pressure/failure tests, module/function/argument/launch parity, stream/event completion, cancellation truth, and stale-view/resource rejection.

## Compiler/link/cache

Require optional-provider discovery, complete logs, deterministic identity, clean-room reproduction, corruption rejection, invalidation, cancellation, and cleanup.

## Platform and release

Support claims require native execution on the exact Node/OS/ABI/Driver/toolkit/GPU profile. Cross-compilation or mocks cannot establish runtime support. Public release additionally requires package/install/uninstall evidence, second-consumer proof, security review, compatibility policy, and no material debt.

## Evidence keys

Every native result includes source/header/schema/generator, Node build/flags, OS/ABI, Driver/toolkit/providers, GPU/compute capability, artifact/options, runtime profile, fixture, command, and seed/schedule where applicable.
