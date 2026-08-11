# CUDA-JS Validation Policy

## Accepted Windows F2W / hardware-deferred Linux F2L phase

Run:

```bash
./scripts/verify-docs.sh
npm run exp:000:build
npm run verify
npm run exp:012  # exact qualified Windows x64 Driver/GPU profile
npm run f1b:verify-native  # exact pinned Linux x86-64/Clang profile
npm run exp:001:prepare  # native Ubuntu 24.04 x86-64 preparation and readiness
```

The promoted F1A regression claim additionally requires:

- one active ADR-0002 and no competing accepted host-binding plan;
- source revisions and dispositions recorded;
- architecture, support matrix, master plan, focus map, experiments, status, and next step agreeing;
- no F1A source outside its experiment boundary;
- exact Git state and portable artifact verification;
- independent Windows and native Linux evidence;
- honest remote/CUDA-environment limitations.

F1B changes additionally require pinned official-header identity, deterministic import and normalization, independently reviewed semantic-overlay coverage, native C layout probes, mutation sensitivity, and fail-closed unresolved coverage.

F2W changes additionally require canonical Windows Driver discovery, exact Toolkit/header/import-library identity, MSVC ABI and Driver oracles, all generated Tier-0 exports and procedure queries, permission/negative controls, private Worker ownership, terminal context/library/Worker cleanup, and no Linux inference.

F2L preparation changes additionally require the exact Ubuntu/Node profile, hash-pinned official packages, successful native ABI comparison, successful independent C-oracle compilation, and an unmodified readiness report. F2L promotion additionally requires `readiness` status `ready` and a passing real-Driver/GPU smoke with exact C parity, negative controls, permissions, and terminal context/library/Worker cleanup. GPU-free preparation is not Linux Driver support.

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
