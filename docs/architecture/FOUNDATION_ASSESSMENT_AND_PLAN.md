# CUDA-JS Foundation Assessment and Plan

**Status:** Proposal

## Purpose

This document records the foundational assessment for a generic native Node runtime for the CUDA Driver API. It is architecture and planning authority beneath the accepted charter and ADRs; it is not permission to implement or execute experiments.

## Problem statement

CUDA-JS must let Node programs use CUDA without a CUDA-JS-specific compiled addon, while keeping native ABI facts, lifecycle semantics, security, compatibility, thread affinity, memory visibility, asynchronous completion, deferred errors, and teardown explicit. It must remain generic enough for unrelated consumers such as search engines, simulation, media, scientific computing, and model execution.

The difficult part is not calling one exported function. The difficult part is maintaining a trustworthy boundary across changing CUDA versions, Node versions, host ABIs, Driver capabilities, provider libraries, GPU architectures, and asynchronous failure modes without leaking raw native authority into ordinary JavaScript.

## Accepted architectural direction

1. **Repository separation.** CUDA-JS owns the generic Node/CUDA runtime. UMCGS owns search semantics and consumes only public versioned CUDA-JS contracts.
2. **Node-FFI-first host binding.** Version zero plans around the supported public Node 26 FFI substrate rather than a project-specific addon. This is an evidence-gated choice, not a permanent ban on measured alternatives.
3. **Generated ABI facts.** Pinned official headers feed a deterministic importer and Runtime IR. Curated semantic and lifecycle overlays remain separately reviewed.
4. **Named-export invocation.** `cuGetProcAddress` verifies requested version, status, and semantics; v0 invokes approved named exports until arbitrary returned-function-pointer construction is independently qualified.
5. **Actor ownership.** One DriverActor Worker owns one private CUDA context and its raw resources by default. A separate CompilerActor owns potentially blocking NVRTC/nvJitLink work.
6. **Opaque resources.** Public values contain runtime, kind, slot, generation, and state identity—not native addresses.
7. **Explicit lifecycle.** Parent/child ownership, in-flight leases, completion, cancellation, deferred errors, health transitions, close, restart-required state, and teardown are first-class contracts.
8. **Capability truth.** Managed, mapped, pinned, staged, device, and mock memory remain distinct. Strict-JIT, zero-copy, platform, and performance claims require exact-profile evidence.

## Adversarial assessment

### Why not a handwritten wrapper layer?

It would duplicate a large changing API, encode accidental version assumptions, make ABI drift difficult to audit, and couple semantic review to repetitive code. Generated facts plus curated overlays create smaller independent diffs and faster CUDA-version updates.

### Why not a native addon first?

A compiled addon adds a project-owned build, distribution, ABI, signing, and platform surface before evidence shows it is necessary. The preferred path is the smallest public host substrate that can be qualified. A custom native/JIT path remains a deferred option when a measured gap justifies it.

### Why not expose raw pointers?

Raw pointers bypass runtime identity, generation, ownership, context affinity, bounds, cleanup, and revocation. They turn ordinary consumers into native-code trust boundaries. CUDA-JS therefore keeps raw handles inside the owning actor and exposes opaque capabilities.

### Why not promise universal zero-copy?

Memory placement, visibility, coherence, synchronization, mapping support, and lifetime differ by allocation type, platform, Driver, GPU, and access path. “Zero-copy” is too broad to be a foundational contract. The runtime reports exact memory capabilities instead.

### Why not let the application event loop call everything?

Some Driver, compiler, linker, teardown, and provider operations may block. Context affinity and resource ownership also require serialization. Dedicated actors keep the application loop responsive and make ownership auditable.

### What could still invalidate the direction?

The Node FFI substrate may fail required ABI, lifetime, close, Worker, pointer, or performance-mechanism qualification. Header import may not yield reliable cross-platform facts. Provider libraries may have process-wide side effects that require stronger isolation. These are experiment questions, not assumptions to conceal.

## Value ordering

For public native boundaries, rank values as:

1. correctness and semantic truth;
2. safety and containment;
3. deterministic ownership, teardown, and recoverability;
4. compatibility and diagnosability;
5. event-loop responsiveness and bounded resource behavior;
6. performance;
7. implementation convenience.

Performance matters, but it cannot justify false capability claims, raw-pointer leakage, hidden synchronization, weakened tests, or ambiguous cleanup.

## Foundation work packages

- **CJS-F0 — Authority and repository foundation:** charter, ADRs, indexes, registry, design doctrine, current status, and documentation validation.
- **CJS-F1 — Host-substrate qualification protocol:** define the GPU-free ABI, Worker, lifetime, close, and returned-function-pointer questions.
- **CJS-F2 — Schema and ABI protocol:** define pinned inputs, Runtime IR, semantic-overlay ownership, native layout oracles, and deterministic generation.
- **CJS-F3 — Real Driver smoke protocol:** define library discovery, named exports, version/status verification, cleanup, and exact evidence identity.
- **CJS-F4 and later:** context/resource ownership, memory, modules/launch, completion/errors, compiler/linker/cache, platform expansion, packaging, second-consumer conformance, and performance qualification. These remain dependency-blocked.

## Required evidence before implementation expansion

Each executable gate must define an exact subject revision, environment identity, authoritative oracle, expected result, decisive falsifier, failure interpretation, cleanup, and claim limits. Mocks may validate orchestration but cannot establish native ABI, CUDA ordering, support, strict-JIT, or performance.

No production runtime component should be promoted until its public contract, ownership, lifecycle, failure behavior, compatibility identity, validation capsule, and cleanup disposition are accepted together.

## Current disposition

The project owner authorized dependency-ordered implementation and a Windows-first sequence. `CJS-F1A / EXP-000` is promoted after independent Windows x64 and native Linux x86-64 qualification. `CJS-F1B` is accepted after deterministic CUDA 13.3.29 import, reviewed Tier-0 semantics, generated products, native layouts, and mutation-sensitive regeneration. Windows `CJS-F2W / EXP-012` and `CJS-F3W` are accepted on exact Driver/GPU/C-oracle/permission/actor/resource/cleanup evidence. The F3 control plane passes on native Linux, but Linux `CJS-F2L / EXP-001` and native Linux DriverActor execution remain retained, deferred, and incomplete. Windows F4 memory contract work is dependency-ready; later work remains gated on its platform-specific predecessors.
