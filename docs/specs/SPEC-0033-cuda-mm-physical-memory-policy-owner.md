# SPEC-0033: CUDA-MM Physical Memory-Policy Ownership Addendum

**Status:** Accepted

**Version:** 1.0.0

**Owner:** CUDA-JS

**Related upper owner:** `iteathen/CUDA-MM` SPEC-0001

## Purpose

Select `iteathen/CUDA-MM` as the reserved JavaScript/TypeScript owner for reusable cross-domain **physical memory-management policy** above CUDA-JS, without changing CUDA-JS's sole-native-boundary authority or activating production CUDA-MM implementation.

This addendum supersedes only the unresolved ownership placeholder in SPEC-0032 that said a future reusable physical-memory policy layer would require its own natural owner. CUDA-MM now names that owner. All native-mechanism and abstraction-budget rules in SPEC-0032 remain unchanged.

## CUDA-JS ownership retained

CUDA-JS remains the sole owner of selected native CUDA/provider memory mechanisms and native lifecycle/evidence, including:

- device allocation/free and bounded views;
- pinned host allocation and host-memory registration/mapping;
- managed allocation;
- peer-access and peer-copy mechanisms;
- native memory-pool resources/operations;
- native prefetch/advice calls;
- external-memory/semaphore interoperability mechanisms;
- native alignment/device/capability facts;
- context/device affinity, operations, leases, deferred failures, cleanup and restart/orphan truth;
- native provider/platform/ABI compatibility evidence.

Existing native-memory issues, including caller-owned pinned/registered host memory, managed memory and peer access/copy, remain CUDA-JS-owned. Their existence does not imply a CUDA-MM policy or dependency.

## CUDA-MM reserved ownership

When separately activated and specified by CUDA-MM, reusable policy that can operate unchanged across materially different consumers belongs there rather than in CUDA-JS, for example:

- finite physical budgets/pressure classes;
- aligned arena/suballocation planning;
- physical range reuse from consumer-supplied non-overlapping lifetimes;
- finite pool retention/trimming and fragmentation policy;
- provider-neutral placement classes;
- generic spill/eviction/migration/prefetch strategy;
- generic multi-device physical placement strategy;
- deterministic physical-plan identity and explainable admission/rejection.

CUDA-JS must not infer or implement those policies merely because it exposes the lower native primitives.

## Activation boundary

CUDA-MM repository existence is ownership coordination only. Production CUDA-MM source/API remains gated by CUDA-MM #3 and #4 plus a separately accepted bounded production specification.

CUDA-JS must remain fully usable without CUDA-MM. No CUDA-JS public contract may require CUDA-MM merely to expose or use native memory mechanisms.

## Consumer boundary

Semantic consumers retain logical resource meaning and liveness. They may later project generic constraints to an accepted CUDA-MM contract, but CUDA-JS does not consume Tensor/search/data/model vocabulary and CUDA-MM does not become the semantic-liveness owner.

## Dependency direction

Allowed direction, when selected:

`semantic consumer -> CUDA-MM -> public CUDA-JS -> native CUDA/provider`

CUDA-JS does not depend on CUDA-MM.

## Compatibility and claims

This addendum changes ownership routing only. It adds no native capability, memory profile, support cell, performance claim, allocation strategy or compatibility promotion.

## Non-goals

No automatic memory manager in CUDA-JS, no CUDA-MM implementation authorization, no transfer of native memory issues, no universal managed-memory/oversubscription policy, no semantic liveness migration and no hidden memory-policy default.
