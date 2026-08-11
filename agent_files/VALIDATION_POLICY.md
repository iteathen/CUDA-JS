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

## Ecosystem language validation

Every plan, experiment protocol, repository change, dependency decision, package, and release claim must comply with [`general_foundation/NO_PYTHON_POLICY.md`](general_foundation/NO_PYTHON_POLICY.md).

Validation must account for file names/extensions, dependency manifests, build and test commands, generators/importers, documentation tooling, workflows, containers, hooks, installers, release automation, vendored tools, submodules, generated products, and transitive ordinary-use requirements.

Any Python source, notebook, project metadata, interpreter or package-manager invocation, Python-backed ordinary-use dependency, generated Python artifact, or indirect Python project workflow is a hard failure. Temporary, local-only, experimental, CI-only, bootstrap, migration, or diagnostic use is not exempt. Prose may mention Python only for policy, provenance, comparison, or removal records.

A passing functional test cannot override this policy. A Python-dependent proposal must be rejected or redesigned before implementation, and a discovered violation is not grandfathered.

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
