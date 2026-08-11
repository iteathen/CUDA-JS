# CUDA-JS Validation Policy

## Accepted Windows F8W / hardware-deferred Linux Driver phase

Run:

```bash
./scripts/verify-docs.sh
npm run exp:000:build
npm run verify
npm run exp:012  # exact qualified Windows x64 Driver/GPU profile
npm run f3  # exact Windows native F3 plus platform-neutral F3 capsule
npm run f4  # exact Windows native F4 plus platform-neutral F4 capsule
npm run f5  # exact Windows native F5 plus platform-neutral F5 capsule
npm run f6  # exact Windows native F6 plus platform-neutral F6 capsule
npm run f7  # exact Windows native F7 plus platform-neutral F7 capsule
npm run f8  # exact package/public-facade consumers plus Windows native F8 capsule
npm run hardware:check  # registry invariants and generated support-list agreement
npm run hardware:qualify  # clean exact-profile direct-hardware composition on a runner-ready host
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

F3W changes additionally require accepted SPEC-0003, one Worker-owned context, a closed command protocol, bounded pending work, opaque runtime/kind/slot/generation/state validation, parent/child dependencies, in-flight leases, conservative health, responsive application-thread behavior, deterministic graceful teardown, and restart-required unexpected-loss evidence that makes no inaccessible cleanup claim. Run `npm run f3:portable` on native Linux when shared F3 control-plane owners change. That result does not replace Linux Driver/GPU qualification.

F4W changes additionally require accepted SPEC-0004, exact memory-policy validation, safe range partitions, quota reservation/rollback, failed-free accounting, copied-byte snapshot isolation, transfer leases, five generated named exports, independent MSVC byte parity, allocation-before-context teardown, zero terminal resources, and a human native Linux handoff. Run `npm run f4:portable` in native Linux CI whenever shared memory or protocol owners change. That result does not replace native Linux Driver/GPU/memory qualification.

F5W and F6W changes require their accepted module/launch/completion and compiler/linker/cache contracts, exact independent Windows C parity, portable control-plane regressions, terminal native resources, and retained Linux runbooks.

F7W changes additionally require accepted SPEC-0007, exact Node/permission flag inheritance, FFI denial and explicit-allow controls for both actors, sanitized errors/results, CUDA-reported WDDM/TCC/watchdog/compute-mode facts, deterministic property/failure partitions, repeated portable and native lifecycle balance, broad regression ceilings without performance claims, and separate native Linux x64, Linux ARM64 SBSA, and WSL2 handoffs. Run `npm run f7:portable` and `npm run f7:linux-readiness` in native Linux CI; neither establishes Linux CUDA support.

F8W changes additionally require accepted SPEC-0008, exact package exports and Node/module-ABI compatibility, hidden actor tokens, stable public errors, cross-runtime/closed-resource rejection, aggregate terminal close, tarball inspection, clean install/import/uninstall, first-consumer deletion, two unrelated consumers, simultaneous-instance isolation, and installed-package native Windows vector parity. Run `npm run f8:portable` and `npm run f8:linux-readiness` in native Linux CI; these prove package/readiness behavior only, not Linux CUDA support. Registry publication remains separately gated on an owner-selected license and release review.

F2L preparation changes additionally require the exact Ubuntu/Node profile, hash-pinned official packages, successful native ABI comparison, successful independent C-oracle compilation, and an unmodified readiness report. F2L promotion additionally requires `readiness` status `ready` and a passing real-Driver/GPU smoke with exact C parity, negative controls, permissions, and terminal context/library/Worker cleanup. GPU-free preparation is not Linux Driver support.

Hardware registry changes additionally require a clean exact commit, direct hardware execution, the complete profile-required native capsule chain, independent C-oracle agreement, permission controls, installed-package execution, terminal cleanup, sanitized evidence identity, generated-list agreement, and claim limits. An incomplete profile may describe missing work but must not expose a promotable command chain. Architecture-level coverage records at most that one or more exact models have passed; it does not infer family-wide support.

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
