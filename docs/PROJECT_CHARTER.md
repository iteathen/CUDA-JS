# CUDA-JS Project Charter

**Status:** Accepted

## Purpose

Create a generic, schema-driven Node.js runtime and toolchain for the CUDA Driver API that allows unrelated consumers to compile, load, launch, observe, cancel, and tear down CUDA work through explicit, finite, versioned contracts.

## Product boundary

CUDA-JS owns:

- CUDA capability and entry-point discovery;
- official-header import, normalized schemas, generated Node FFI definitions, ABI packers, and version policy;
- Node FFI host binding and any future accepted gap backend;
- thread-affine runtime/compiler actors;
- opaque resource handles;
- memory capability and lifetime contracts;
- device compilation, linking, loading, and artifact identity;
- generic kernel argument and launch contracts;
- asynchronous completion and cancellation delivery;
- normalized errors and context health;
- generic mocks, conformance, diagnostics, packaging, and compatibility;
- separately accepted consumer-neutral CUDA/provider mechanisms whose lifecycle remains coherent after deleting the motivating semantic consumer.

The published `cuda-js` core package does not own an upper library's reusable semantic domain or a downstream consumer's product meaning. It does not become a Tensor, neural-network, search, RNG, communication, storage-I/O, media, dataframe, ray-tracing, graph-analytics, renderer, database, model, game, or application framework merely because CUDA mechanisms realize those workloads.

Under accepted [`ADR-0007`](decisions/ADR-0007-extract-cuda-nn-semantic-product.md), reusable neural-network semantics are owned by the independent [`iteathen/cuda-nn`](https://github.com/iteathen/cuda-nn) repository, not by a future CUDA-JS publish unit. Generic tensor mathematics/planning belongs to [`iteathen/CUDA-JS-Tensor`](https://github.com/iteathen/CUDA-JS-Tensor). Historical ADR-0004 and SPEC-0027 remain provenance for the earlier same-repository NN isolation decision but no longer authorize `nn.*` production components here.

Accepted [`ADR-0008`](decisions/ADR-0008-semantic-library-boundary.md) generalizes that separation across the CUDA portfolio. Current reusable semantic owners above CUDA-JS are:

- [`iteathen/CUDA-JS-Tensor`](https://github.com/iteathen/CUDA-JS-Tensor) — generic Tensor mathematics, planning and execution semantics;
- [`iteathen/cuda-nn`](https://github.com/iteathen/cuda-nn) — reusable NN/model/inference/training semantics;
- [`iteathen/CUDA-MCGS`](https://github.com/iteathen/CUDA-MCGS) — reusable search/MCGS semantics;
- [`iteathen/cuda-rng`](https://github.com/iteathen/cuda-rng) — provider-neutral RNG/distribution/reproducibility semantics;
- [`iteathen/cuda-comm`](https://github.com/iteathen/cuda-comm) — provider-neutral collective/P2P/PGAS/RMA communication semantics;
- [`iteathen/cuda-io`](https://github.com/iteathen/cuda-io) — GPU source/sink/storage-I/O semantics;
- [`iteathen/cuda-media`](https://github.com/iteathen/cuda-media) — image/frame/video/codec-pipeline semantics;
- [`iteathen/cuda-data`](https://github.com/iteathen/cuda-data) — columnar/table/dataframe semantics;
- [`iteathen/cuda-ray`](https://github.com/iteathen/cuda-ray) — ray/geometry/traversal semantics;
- [`iteathen/cuda-graph-analytics`](https://github.com/iteathen/cuda-graph-analytics) — graph representation and analytics semantics, distinct from CUDA-MCGS search.

CUDA-JS remains the consumer-neutral runtime/compiler/device/memory/view/operation/synchronization/artifact/provider/resource foundation beneath those libraries. A semantic library may consume CUDA-JS directly or through another natural semantic layer only through versioned public contracts; CUDA-JS does not depend upward on those semantic libraries.

Provider branding does not determine ownership. A bounded cuFFT/cuRAND/NCCL/NVSHMEM/GPUDirect/media/OptiX/TensorRT or other provider mechanism may be CUDA-JS-owned while FFT/RNG/communication/I-O/media/ray/NN meaning stays above it. Conversely, an upper semantic repository does not own native/provider handles, memory, streams, operations, compiler artifacts, synchronization, native errors, or teardown merely because it is the first consumer.

Two similarly named boundaries remain explicit:

- CUDA **Graphs** are CUDA-JS execution mechanisms; `cuda-graph-analytics` owns graph-data/algorithm semantics, not CUDA Graph capture/replay.
- graphics/external-memory/semaphore interoperability remains a CUDA-JS mechanism; it does not become `cuda-ray` or `cuda-media` semantics merely because those consumers may use it.

Downstream consumers continue to own concrete model/package provenance, datasets/objectives, domain and product policy, deployment, protocol/output meaning, application-level quality/tolerance and other semantics that do not naturally belong to a reusable semantic library.

## Universality rule

The public contract describes the widest truthful CUDA runtime invariants. It does not expose one consumer's object layout or assume one memory kind, CPU ABI, GPU architecture, driver version, launch strategy, provider family, semantic workload, or Node release beyond a declared support profile.

A candidate mechanism enters CUDA-JS only when it has a coherent consumer-neutral name, finite resources/lifecycle/errors/identity, and a credible deletion argument showing that CUDA-JS remains naturally meaningful after the motivating semantic consumer is removed. Multiple consumers are useful evidence but do not replace the ownership test.

## Host-binding rule

The version-zero baseline uses Node's built-in FFI and ships no CUDA-JS-specific compiled addon. It reuses Node's Fast API JIT path where an exact profile is qualified; strict JIT support is not claimed before that evidence. Direct custom JIT work requires a measured gap and separate accepted decision.

## Production-source rule

CUDA-JS is **JavaScript-authored and JIT/native-realized** under [`ADR-0005`](decisions/ADR-0005-javascript-authored-jit-native-realized.md). The maintained core runtime shipped by CUDA-JS is JavaScript/ESM. Node/V8, native CUDA provider libraries, private generated CUDA C++ and produced device artifacts realize execution without becoming a CUDA-JS-maintained C/C++ host runtime.

C/C++ ABI probes, conformance oracles and generated fixtures may exist as independently owned evidence but are not shipped runtime implementation. A future maintained native host backend requires a measured gap and a separate accepted architecture/package/lifecycle decision; it may not arrive as an incidental optimization or consumer workaround.

## Safety rule

JavaScript does not receive an unconstrained pointer capability. Native resources use opaque IDs with ownership, generation, bounds, actor/context identity, and lifecycle validation. Unsafe raw-memory operations are isolated and excluded from ordinary compatibility guarantees.

## Resource rule

All CUDA-JS-owned resources are finite and owned. Allocation failure, unsupported capability, cancellation, teardown, and deferred asynchronous error are specified behavior. Upper semantic resources may map onto CUDA-JS resources but do not change the lower owner or fabricate successful cleanup.

## First milestone

Propose the version-zero contracts, run the bounded foundation experiments, accept only the supported contract slices, and publish no production package until the schema, backend, actor/resource, memory, compile/link/load, launch/completion, error/health, security, conformance, and package gates pass. Future provider breadth remains demand-driven and independently accepted rather than implied by the expanded semantic portfolio.
