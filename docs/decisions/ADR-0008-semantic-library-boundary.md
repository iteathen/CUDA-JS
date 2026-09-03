# ADR-0008: Semantic Libraries Above the CUDA-JS Mechanism Substrate

**Status:** Accepted

**Date:** 2026-09-02

## Context

ADR-0001 established CUDA-JS as the independent generic runtime/toolchain, and ADR-0007 moved reusable NN semantics into independent `cuda-nn` while preserving CUDA-JS-Tensor as the generic mathematical middle layer. The portfolio has since added independent homes for reusable RNG, communication, I/O, media, columnar data, ray and graph-analytics semantics.

Without one CUDA-JS-side decision, the new repositories could be read either as vendor-wrapper packages that own native CUDA lifecycles or as mere consumers whose reusable semantics should still live in CUDA-JS. Both interpretations would undo the intended LEGO boundary.

## Decision

CUDA-JS owns **consumer-neutral CUDA/GPU mechanisms** and their native/provider/resource lifecycle. Reusable semantic libraries above it own the meaning that remains coherent across providers and downstream products.

Current semantic owners are:

- `iteathen/CUDA-JS-Tensor` — generic Tensor mathematics/planning/execution;
- `iteathen/cuda-nn` — reusable NN/model/inference/training semantics;
- `iteathen/CUDA-MCGS` — reusable search/MCGS semantics;
- `iteathen/cuda-rng` — generator/distribution/reproducibility semantics;
- `iteathen/cuda-comm` — collective/P2P/PGAS/RMA communication semantics;
- `iteathen/cuda-io` — source/sink/storage-I/O semantics;
- `iteathen/cuda-media` — image/frame/video/codec-pipeline semantics;
- `iteathen/cuda-data` — columnar/table/dataframe semantics;
- `iteathen/cuda-ray` — ray/geometry/traversal semantics;
- `iteathen/cuda-graph-analytics` — graph representation/analytics semantics.

Concrete downstream products retain model/package provenance, domain policy, protocols/outputs, deployment, application quality/tolerance and other meaning that is not naturally reusable in one of those semantic libraries.

## CUDA-JS mechanism examples

The following remain CUDA-JS concerns when separately accepted because their coherent meaning is physical/runtime/provider rather than upper-domain semantic:

- devices, contexts, memory/views, streams/events/operations and synchronization/publication;
- compilation/linking/modules/functions/artifacts/cache identity;
- CUDA Graph capture/replay and prepared execution mechanisms;
- physical multi-device discovery/selection/P2P/cross-device dependencies;
- graphics/external-memory/external-semaphore/IPC mechanisms;
- generic Device-JS types/primitives and reusable lower algorithms where independently useful;
- bounded native/provider mechanisms such as cuBLASLt, cuDNN, cuFFT, cuRAND, cuSPARSE, cuSOLVER, NCCL, NVSHMEM, GPUDirect Storage/RDMA, NPP/nvJPEG/NVDEC/NVENC, OptiX and TensorRT when concrete consumers justify them.

This list does not pre-authorize those mechanisms. Each retains its own acceptance and evidence gate.

## Semantic/provider split examples

- cuFFT mechanism → CUDA-JS; FFT transform mathematics → CUDA-JS-Tensor.
- cuRAND mechanism → CUDA-JS; generator/distribution/reproducibility semantics → cuda-rng.
- NCCL/NVSHMEM/RDMA mechanisms → CUDA-JS; provider-neutral communication semantics → cuda-comm; training/search distributed policy stays with NN/MCGS.
- cuFile/GDS mechanism → CUDA-JS; source/sink/storage-I/O semantics → cuda-io.
- NPP/nvJPEG/NVDEC/NVENC mechanisms → CUDA-JS; image/frame/video/codec semantics → cuda-media.
- OptiX mechanism → CUDA-JS; ray/geometry/traversal semantics → cuda-ray; renderer/material policy stays downstream.
- TensorRT mechanism → CUDA-JS; NN eligibility/fallback/equivalence → cuda-nn; model/product meaning stays downstream.
- CUDA Graphs → CUDA-JS; graph-data algorithms such as BFS/PageRank/community → cuda-graph-analytics.

## Dependency direction

CUDA-JS does not depend on upper semantic libraries. An upper library may consume only versioned public CUDA-JS contracts, either directly or through another natural semantic layer. Optional sibling-semantic composition must remain acyclic and be accepted by the consuming semantic owner.

## Ownership tests

A capability belongs in CUDA-JS only when:

1. its public name/meaning can be stated without Tensor/NN/search/RNG/communication/I-O/media/data/ray/graph/product vocabulary except unavoidable provider/resource descriptors;
2. finite resources, lifecycle, failure, identity and compatibility can be specified independently of the motivating semantic consumer;
3. deleting the motivating consumer leaves a coherent generic CUDA/provider primitive;
4. existing CUDA-JS mechanisms cannot already express the need naturally;
5. the bounded mechanism is accepted and qualified independently of upper semantic correctness.

Multiple consumers strengthen the generality case but are not a substitute for these tests.

## Provider rule

A vendor library or hardware engine is a realization mechanism, not semantic authority. Do not mirror a provider's full object model/options into CUDA-JS merely because the provider exists. Select the smallest bounded mechanism justified by accepted consumers.

Likewise, an upper semantic library must not maintain native/FFI/provider lifecycle or private CUDA-JS imports to avoid a missing lower capability. Such pressure triggers the lower ownership assessment before implementation.

## Consequences

- CUDA-JS remains one coherent runtime/toolchain rather than becoming a suite of workload frameworks.
- reusable semantic libraries can evolve/release independently and share lower mechanisms.
- provider breadth remains demand-driven rather than implied by repository creation.
- cross-repo ownership becomes structural and auditable.
- naming adjacency such as CUDA Graphs versus graph analytics cannot silently move ownership.

## Non-goals

No implementation, provider activation, dependency installation, support/native/performance promotion, roadmap priority change, forced upper-library dependency, or CUDA-MCGS #122 activity is created by this ADR.
