# ADR-0007: Extract CUDA-NN as an Independent Semantic Product

**Status:** Accepted

**Date:** 2026-09-02

## Context

ADR-0004 and SPEC-0027 previously isolated a future application-neutral NN product from the published `cuda-js` core by making it a separate publish unit inside this repository. That prevented NN semantics from contaminating core and was appropriate before the ecosystem had an independent Tensor repository and before the NN lifecycle was reassessed against the already-independent CUDA-MCGS semantic framework.

The architecture has since changed materially:

- `iteathen/CUDA-JS-Tensor` now independently owns generic tensor dtype/shape/layout/math/planning/execution;
- `iteathen/CUDA-MCGS` demonstrates the intended pattern for a higher semantic framework consuming generic CUDA mechanisms without living in CUDA-JS;
- the old CUDA-JS NN issue family had become a second product roadmap containing model/training/autodiff/provider-selection work unrelated to CUDA-JS core lifecycle;
- project-owner direction selected and created `iteathen/cuda-nn` as the independent reusable NN semantic owner.

CUDA-NN has integrated its bootstrap ownership authority at `main@7d7854697049db38e4a0670b80df9d600cd442c3`, including its charter and ADR-0001. That repository explicitly does not authorize production NN implementation merely because it exists.

## Decision

Exercise ADR-0004's repository-split revisit trigger and move reusable NN product ownership to the independent `iteathen/cuda-nn` repository.

CUDA-JS no longer owns or plans a future NN publish unit, NN workspace, NN package, or `nn.*` component family.

### Current semantic stack

```text
CUDA-NN
   ↓ public contracts
CUDA-JS-Tensor
   ↓ public contracts
CUDA-JS
```

CUDA-NN may consume CUDA-JS directly only for generic CUDA/runtime mechanisms not naturally owned by the Tensor layer. CUDA-MCGS remains a sibling semantic framework, and downstream products remain free to compose CUDA-NN, CUDA-JS-Tensor and CUDA-MCGS according to their own architecture.

### CUDA-JS ownership remains generic

CUDA-JS owns consumer-neutral CUDA mechanisms: host/runtime/compiler/Device-JS, devices/contexts, memory/views, launch/operation/prepared execution, synchronization/publication primitives, generic CUDA-library/provider mechanisms, artifacts/cache identity, resource lifecycle, errors, compatibility and conformance.

CUDA-JS does not interpret NN graph/layer/parameter/gradient/optimizer/checkpoint/training semantics and does not gain Tensor or product/search semantics through this split.

### CUDA-JS-Tensor ownership

Generic Tensor dtype/shape/layout/view/broadcast/reduction/matmul/gather/concat/convolution/fusion/planning/execution semantics belong to `iteathen/CUDA-JS-Tensor` when they are useful independently of NN meaning.

The historical SPEC-0027 `nn.tensor` allocation is therefore not current ownership authority.

### CUDA-NN ownership

CUDA-NN may own reusable model/layer/NN graph semantics, parameter and NN-state roles, provider-neutral inference composition, NN-specific lowering/provider selection and—when separately accepted—autodiff, gradients, losses, optimizers, training RNG, checkpoints and training lifecycle.

CUDA-NN itself requires a consumer-backed inference justification gate before production NN source/API is accepted. Direct product → CUDA-JS-Tensor composition remains valid.

### Product and search ownership

Concrete model package/provenance, feature encoding, policy/action mapping, output-head meaning, chess/UCI and other product semantics remain downstream. Search/evaluator/progress/graph-search semantics remain CUDA-MCGS-owned.

## Historical authority disposition

ADR-0004 remains an immutable historical accepted record. This ADR **supersedes only ADR-0004's same-repository NN product-placement decision**. Its generic-core-isolation rationale remains valid where consistent with current owners.

SPEC-0027 likewise remains historical accepted provenance for the earlier authority packet, but is **superseded as current CUDA-JS product/package/component implementation authority**. It must not be used to create `nn.*` production components in this repository.

Do not copy SPEC-0027 mechanically into CUDA-NN. Its old component map predates the independent Tensor repository and its training-first structure has been replaced by CUDA-NN's inference-first consumer justification gate.

## Issue disposition

The prior CUDA-JS NN roadmap has been reconciled:

- #70 and #72-#74/#76-#84 are closed as no longer planned in CUDA-JS;
- #75 remains CUDA-JS-owned as generic cuBLASLt typed/strided-batched matmul mechanism;
- #163 owns the deferred consumer-neutral cuDNN provider mechanism if selected;
- #164 owns the deferred consumer-neutral NCCL collective mechanism if selected;
- CUDA-NN #1-#14 own the reassessed NN roadmap, with #2 as the pre-implementation inference gate.

## Provider boundary

Provider branding does not determine semantic ownership.

- generic cuBLASLt/cuDNN/NCCL discovery, native handles, finite operation plans, workspace/admission, execution, errors and teardown belong in CUDA-JS when selected through accepted provider contracts;
- generic mathematical Tensor semantics belong in CUDA-JS-Tensor;
- NN semantic eligibility/provider selection/fallback/equivalence belongs in CUDA-NN;
- product-specific selection/tolerance remains downstream.

A CUDA-NN requirement may motivate a CUDA-JS provider child but cannot cause an NN-shaped provider API in core.

## First-consumer deletion

Deleting CUDA-NN must leave CUDA-JS coherent and complete as a generic CUDA runtime/toolchain. Deleting CUDA-JS-Tensor or CUDA-MCGS must likewise not leave NN/search vocabulary in CUDA-JS core.

Conversely, generic lower-layer mechanisms motivated by CUDA-NN must survive deletion of CUDA-NN without semantic holes or names that depend on model/training vocabulary.

## Migration

1. Preserve ADR-0004 and SPEC-0027 as historical provenance; do not rewrite them to pretend the repository split was always selected.
2. Update active CUDA-JS charter/index/registry/status/capability projections so they describe CUDA-NN as an external upper-layer consumer rather than a CUDA-JS product.
3. Keep core package exports/dependencies/source free of NN semantics.
4. Route generic Tensor gaps to CUDA-JS-Tensor and generic CUDA/provider gaps to CUDA-JS through public contracts.
5. Remove/reconcile stale same-repository NN issue/plan authority without deleting useful historical research.
6. Require exact public-contract compatibility evidence when CUDA-NN eventually consumes CUDA-JS; repository separation itself is not compatibility/native/production proof.

## Consequences

- CUDA-JS regains one coherent product mission and no longer carries a second semantic roadmap.
- CUDA-NN can evolve independently if its inference layer is justified.
- CUDA-JS-Tensor remains the generic mathematical middle layer rather than being duplicated as `nn.tensor`.
- provider mechanisms stay in their natural generic owner.
- training/autodiff breadth cannot become an inference prerequisite merely because old CUDA-JS issues described training first.
- cross-repository coordination becomes explicit and accepted because the lifecycle boundary is real.

## Alternatives considered

### Keep the NN publish unit inside CUDA-JS

Rejected under the current ecosystem shape. It places a higher semantic product beside its generic runtime while its immediate Tensor dependency has a separate repository and lifecycle.

### Move NN semantics into CUDA-JS-Tensor

Rejected. Generic tensor mathematics is useful outside neural networks; model/layer/autodiff/training semantics are a distinct ownership layer.

### Return NN semantics to downstream products only

Retained as a valid consumer choice, not as the ownership answer. CUDA-NN production remains gated on proving reusable value; a product may continue direct Tensor composition if no useful reusable NN layer is demonstrated.

## Validation

A conforming extraction proves:

- active CUDA-JS authority no longer treats NN as a same-repository product;
- CUDA-NN has independent integrated ownership authority;
- historical ADR-0004/SPEC-0027 provenance remains traceable;
- generic Tensor semantics point to CUDA-JS-Tensor;
- provider/runtime mechanisms remain CUDA-JS-owned and NN semantic mappings remain external;
- core package/source/exports/dependencies remain NN-free;
- no production/native/provider/performance claim is created by the repository split;
- documentation and repository validation pass on the exact candidate head before protected integration.

## Supersedes / superseded by

Supersedes ADR-0004 only with respect to repository/product placement. ADR-0004 remains historical accepted provenance for the earlier isolation decision.
