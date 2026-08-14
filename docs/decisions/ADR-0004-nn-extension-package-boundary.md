# ADR-0004: Optional NN Extension Package Boundary

**Status:** Accepted

**Date:** 2026-08-13

## Context

CUDA-JS was chartered as a generic Node/CUDA runtime and toolchain. Project-owner direction now selects an optional, application-neutral neural-network training product while requiring the generic core to remain independently usable.

Issues #70–#84 initially proposed a `cuda-js/nn` subpath in the existing package. Node package exports provide entry-point encapsulation, but they do not isolate installed files, dependency graphs, audit surface, compatibility identity, or release cadence. A future NN-only dependency in the core manifest is the decisive counterexample.

Native provider ownership is also constrained by CUDA. cuBLAS and cuDNN handles are device/context-bound. A cuBLASLt handle is generally not tied to one CUDA context, but its creation/calls require the appropriate current device and its algorithms use execution-context-affine streams, memory, and workspaces. The NN layer cannot perform provider work against DriverActor-owned resources from a disconnected Worker or bypass that owner. A distinct actor with its own resources would require a separate accepted resource/context/interop design and evidence.

The underlying assessment is recorded in [`../research/2026-08-13-nn-extension-authority-assessment.md`](../research/2026-08-13-nn-extension-authority-assessment.md).

## Decision

CUDA-JS accepts an optional NN training product under these boundaries.

### Repository and publication

- The NN product remains in the CUDA-JS repository until independent lifecycle evidence justifies a split.
- It will be a separate publish unit, not a subpath of the existing `cuda-js` package.
- The registry package name remains unselected until namespace ownership and availability are verified.
- The existing `cuda-js` package, exports, dependencies, compatibility identity, and import behavior remain unchanged by this decision.
- The future NN package reserves only relative exports `.` and `./compatibility`.
- `./testing` requires a later accepted mock-only conformance contract. Component and provider subpaths are not reserved.

### Dependency direction

- The NN publish unit may depend on accepted public CUDA-JS contracts.
- It must not deep-import `components/**`, private actors, raw FFI products, provider paths, or native handles.
- Generic core must not import the NN package or acquire NN exports, dependencies, NN-shaped/eager provider discovery, or NN initialization side effects. A later accepted generic adapter may discover a library only from an explicit bounded core operation.
- A provider-specific npm dependency requires its own accepted packaging decision and cannot enter core merely because the NN product uses it.

### Semantic ownership

- Generic core continues to own consumer-neutral CUDA discovery, compilation, resources, memory, execution, lifecycle, compatibility, and conformance.
- The optional NN product may own application-neutral tensor, staged graph, autodiff, memory-plan, provider-selection, execution-plan, training-state, checkpoint, and training-conformance semantics under separately accepted specifications.
- Consumers continue to own model architecture, datasets, objectives, domain policy, and application orchestration unless those facts are represented through an accepted generic NN contract.
- CUDA-MCGS/search semantics remain outside both generic core and the NN product.

### Native provider ownership

- NN planning and provider selection remain outside DriverActor and CompilerActor.
- Creation/destruction of cuBLAS/cuDNN handles and every provider call over DriverActor-owned device/context/stream/memory/workspace state execute only through a separately accepted generic adapter port owned by that resource boundary. The adapter also owns cuBLASLt handle/plan lifetime and invokes it under the required current device and borrowed execution resources. A different actor/resource ownership model requires a separate accepted resource and interop decision.
- NN code may own logical lowering/source semantics. CompilerActor retains compilation, compiler-provider lifecycle, cache identity, and typed copied PTX/LTO/cubin artifact production under accepted core contracts.
- No NN requirement adds NN-shaped tensor, graph, autodiff, or training commands to generic actors. Any finite context-bound library-adapter command requires separately accepted generic core authority.

## Consequences

- Core-only consumers retain an independently falsifiable install/import/dependency boundary.
- Early NN governance and integration can share one repository without sharing a publish unit.
- A second package adds packaging, compatibility, release, install/uninstall, and deletion conformance that must be implemented before publication.
- The final registry name and package directory are deliberately deferred.
- Provider work remains blocked on accepted generic context-bound library-adapter authority and exact native evidence.

## Alternatives considered

### Same package with `cuda-js/nn`

Rejected as the isolation boundary. It can prevent eager evaluation but cannot isolate installation, dependencies, audit surface, or release identity.

### Separate repository immediately

Rejected for the initial phase. No independent cadence, maintainership, or dependency lifecycle yet justifies duplicating repository governance and integration machinery.

### Put NN semantics in generic core

Rejected. It breaks the LEGO boundary, forces unrelated consumers to inherit domain semantics, and conflicts with existing actor/resource ownership.

## Validation and revisit triggers

The authority packet must prove that core exports and dependencies are unchanged and that active documents contain no contradictory project-wide NN exclusion or same-package claim.

Revisit the repository boundary when maintainership, release cadence, dependency weight, security surface, or independent consumers establish a genuinely separate lifecycle. Revisit relative exports only through an accepted public contract. Selecting a registry name requires explicit namespace-control read-back.

This ADR authorizes only the product/package direction. [`SPEC-0027`](../specs/SPEC-0027-nn-extension-foundation.md) owns the bounded component authority. Neither document implements or qualifies NN behavior.
