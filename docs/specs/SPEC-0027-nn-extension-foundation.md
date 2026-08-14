# SPEC-0027: Optional NN Extension Foundation

**Status:** Accepted

**Date:** 2026-08-13

## Outcome

Authorize a separately packaged, optional, application-neutral neural-network training product in the CUDA-JS repository while preserving the existing `cuda-js` package as an independently installable and usable generic runtime/toolchain.

This specification defines the authority required to resolve issue #71. It is product, package, and component authority only.

```text
architectural disposition: planned
implementation status:    not-implemented
qualification status:     not-qualified
priority:                 after:accepted-child-spec
```

No NN package, public API, provider, runtime behavior, or native support exists merely because this specification is accepted.

## Governing decision

[`ADR-0004`](../decisions/ADR-0004-nn-extension-package-boundary.md) selects one repository with a separate future NN publish unit. The existing `cuda-js` package must not gain an `./nn` export, NN dependency, NN file tree, NN-shaped/eager provider discovery, or NN initialization side effect. A later accepted generic adapter may discover a library only through an explicit bounded core operation.

The future publish unit's registry name and repository directory remain unselected until namespace control and the first implementation contract are accepted. The only reserved relative exports are:

```text
.
./compatibility
```

`./testing` is deferred until `nn.conformance` has an accepted mock-only public contract. Public tensor, graph, provider, component, and deep-import subpaths are not authorized.

## Product boundary

### Generic core owns

- CUDA capability discovery and exact-profile qualification;
- generated ABI facts and curated semantic overlays;
- private Node FFI and context-affine actors;
- opaque resources, memory, compilation, execution, lifecycle, errors, compatibility, and generic conformance;
- future generic adapter contracts only when separately accepted.

### Optional NN product may own

- logical tensor and state semantics;
- provider-neutral staged graph semantics;
- reverse-mode differentiation and saved-value/rematerialization policy;
- memory/workspace and execution planning;
- finite provider selection and NN-specific lowering;
- optimizers, RNG/training state, checkpoints, and training conformance;
- only the application-neutral contracts separately accepted under the component anchors below.

### Consumers continue to own

- model architecture and application composition;
- datasets, objectives, metrics, and domain policy;
- deployment, service, tenancy, and distributed strategy unless a later generic NN contract explicitly owns a bounded part;
- CUDA-MCGS, MCGS/MCTS/search, evaluator, game, and unrelated application semantics.

## Dependency and import rules

- The NN publish unit may import only accepted public `cuda-js` entry points.
- Deep imports into `components/**`, schemas, private actors, FFI definitions, native handles, provider paths, or build artifacts are forbidden.
- Core never imports the NN product.
- Core package installation, packing, importing, native discovery, and conformance must succeed when every NN artifact is absent.
- Importing the future NN facade or compatibility entry point must be provider-side-effect-free. Provider discovery/loading may begin only through an explicit future NN runtime/compile creation contract.
- The NN package must distinguish provider-unavailable, profile-incompatible, and request-unsupported results; none may turn into core import/install failure.
- Provider-specific npm dependencies require a separate accepted package decision. They may not enter core.
- NN production, build, generation, packaging, and conformance paths must not introduce Python or a project-specific compiled addon. A provider does not justify either; any measured generic host-binding gap requires its own accepted core decision.
- Every third-party dependency/provider records exact name, version, license, provenance, compatibility identity, and redistribution disposition before admission.

## Planned component anchors

These anchors name durable ownership. They do not create directories or authorize implementation without a separately accepted child specification.

| Boundary | Owns | Explicit non-purpose | Dependencies / port | Lifecycle and compatibility owner | Evidence owner |
|---|---|---|---|---|---|
| `nn.facade` | Finite optional NN public API and capability negotiation | Raw CUDA/provider handles or public component internals | Accepted NN contracts plus public `cuda-js` | NN facade contract and NN package identity | NN installed-consumer conformance |
| `nn.tensor` | Logical dtype, shape, layout, role, mutability, alias, and storage-view semantics | Native allocation/address ownership | Accepted public core byte-memory ports; typed views only after a separately accepted contract | Tensor/value identity and leases; independent NN contract version | Portable tensor laws plus later native byte/oracle evidence |
| `nn.operator` | Finite versioned operator schemas, typing, effects, forward meaning, and derivative-rule linkage | Consumer models or provider algorithms | `nn.tensor`; consumed by graph/autodiff/provider lowering | Operator-set compatibility and extension identity | Per-operator validation, reference, derivative, and numerical evidence |
| `nn.graph` | Provider-neutral typed staged graph and stable graph identity | Dynamic arbitrary JavaScript mutation or core operation lifecycle | `nn.tensor` and `nn.operator` | Immutable graph values and graph compatibility | Graph validation/identity conformance |
| `nn.autodiff` | Reverse-mode transform, residuals, saved values, and rematerialization contracts | Provider ABI or generic core execution | `nn.graph` and operator derivative rules | Transform version and saved-value lifetime | Independent derivative/finite-difference conformance |
| `nn.memory-plan` | Liveness, alias/donation, arenas, residuals, and bounded workspaces | Core allocator semantics or implicit native pools | Graph/tensor/autodiff facts plus public memory ports | Plan identity, leases, pressure, and terminal workspace disposition | Plan oracle and guard/lifetime conformance |
| `nn.provider-registry` | Finite provider capabilities, selection, identity, and distinct provider-unavailable/profile-incompatible/request-unsupported results | Unrestricted provider passthrough or native handle exposure | Accepted provider ports and exact compatibility facts | Provider instance/config identity and close ordering | Provider-neutral selection, absence, incompatibility, and unsupported-request conformance |
| `nn.provider.cublaslt` | Bounded NN GEMM plans over an accepted current-device/stream/memory adapter | Calling cuBLASLt outside the owning current-device/resource boundary or exposing native handles | `nn.provider-registry`, tensors/views, accepted core library-adapter port | Adapter/runtime owns handle/plan/workspace lifetime; streams/memory remain DriverActor children | Independent cuBLASLt C oracle and cleanup evidence |
| `nn.provider.cudnn` | Bounded cuDNN graph/operator plans over an accepted generic context-bound adapter | Exposing cuDNN descriptors/handles or defining generic graph semantics | Registry, operators/tensors/views, accepted core library-adapter port | Plan/workspace identity; native handles remain context-owner children | Independent cuDNN oracle, numerical, compatibility, and cleanup evidence |
| `nn.provider.generated` | NN-specific elementwise/reduction/update lowering and source plans plus logical association of core-returned typed artifacts | Compiling/caching/owning PTX/LTO/cubin bytes, replacing CompilerActor, or exposing generated CUDA | `nn.graph`, accepted Device-JS/compiler contracts | NN lowering/plan identity; core owns compiler-provider/cache/artifact lifecycle | Independent source-to-result/native evidence |
| `nn.execution-plan` | Immutable compiled training-step plan and provider-neutral orchestration | Duplicating core operation/scheduling lifecycle | Graph, memory plan, providers, accepted SPEC-0016 public operation ports and whichever scheduling contract is later accepted | Plan/resource leases and terminal disposition | Plan-equivalence and later GPU execution conformance |
| `nn.training-state` | Optimizer, RNG, loss-scale, parameter, gradient, and persistent state semantics | Consumer model architecture or hidden global state | Tensors, graph/autodiff, execution plan | Explicit mutable state/checkpoint compatibility | Step/oracle/repeatability conformance |
| `nn.checkpoint` | Versioned logical state serialization, integrity, restore, and migration policy | Serializing raw pointers, allocation IDs, or provider handles | Tensor/training-state contracts | Checkpoint format and migration identity | Round-trip, corruption, and compatibility conformance |
| `nn.conformance` | Portable, installed-package, numerical, native, lifecycle, and performance evidence partitions | Treating mocks as CUDA/provider/performance proof | Every implemented NN boundary | Exact evidence identity and invalidation | Independent NN qualification owner |

Possible future fusion, distributed, and NCCL boundaries remain unselected. Their names, ownership, dependencies, lifecycle, extension model, and evidence require fresh assessment and accepted authority; this specification does not reserve component IDs for them.

### Extension and replacement boundaries

- Operator additions extend the finite versioned `nn.operator` registry through accepted schemas; callers cannot inject arbitrary executable or derivative definitions.
- Providers are additive registry entries behind one facade. Selection is finite and provider absence is a bounded result; provider/component subpaths are not public extension points.
- Tensor, graph, autodiff, memory, execution-plan, state, and checkpoint implementations may be replaced only behind their accepted contracts and compatibility identities, never through deep imports.
- Test doubles require an accepted `nn.conformance` injection surface and cannot become production provider authority.

## Context-bound provider rule

cuBLAS and cuDNN handles are tied to the current CUDA device/context. A cuBLASLt handle is generally not tied to one CUDA context, but its creation/calls require the appropriate current device and its algorithms consume context-affine streams, memory, and workspaces. Therefore:

- NN code owns logical plan/provider semantics, not raw native handles;
- provider calls using DriverActor-owned current-device state, streams, memory, or workspaces execute under a separately accepted generic adapter owned by that resource boundary;
- NN code cannot deep-import DriverActor or add NN-shaped commands to it;
- cuBLAS/cuDNN handles are context children and close before their context; cuBLASLt handle/plan/workspace ownership is explicit and closes before its adapter/runtime and before any borrowed execution resources;
- NN code may own logical lowering/source semantics, while CompilerActor retains compiler-provider lifecycle, compilation, cache identity, and typed copied PTX/LTO/cubin artifact production.

SPEC-0023 remains proposal-only at acceptance of this specification. Provider implementation is blocked until the needed generic adapter authority is accepted.

## Compatibility identity

The NN product has an independent finite contract version and provider-capability identity. Its future compatibility record must include at least:

- NN package name/version once selected;
- NN public contract version;
- consumed core package/API compatibility range;
- tensor/operator/graph/autodiff/plan/checkpoint contract revisions as implemented;
- exact optional provider identities and availability dispositions;
- exact third-party dependency/provider versions, licenses, provenance, and redistribution dispositions;
- architecture, implementation, qualification, and priority as independent dimensions.

A core package version change does not silently promote NN compatibility, and an NN release does not change core support.

## Lifecycle and failure rules

- Pure immutable tensor metadata, operator schemas, graphs, and checkpoint values may be garbage-collected normally. Any object holding a core/native/provider resource, mutable state, workspace, or lease declares whether it borrows or owns that capability and has one explicit terminal disposition.
- Context-bound cuBLAS/cuDNN handles remain private context children. Device-bound cuBLASLt handles, plans, and workspaces remain private adapter/runtime children and obey the explicit teardown ordering above.
- NN error projections preserve validation, provider-unavailable, profile-incompatible, request-unsupported, immediate versus deferred native failure and provenance, cancellation, pressure/backpressure, stale, closed, suspect/poisoned context, cleanup failure, and restart-required distinctions as applicable; unsupported dtype/shape/layout remains a bounded request result.
- No NN contract may weaken core raw-pointer confinement, resource generations, leases, health monotonicity, fail-closed semantics, cleanup truth, or exact evidence gates.
- JavaScript garbage collection is not the authoritative release mechanism for scarce/native resources or leases.
- Package uninstall/cleanup never deletes consumer-owned checkpoints, datasets, models, or outputs. Package-owned caches require a separately accepted bounded location, integrity, retention, and cleanup contract.

## Authority conformance

This authority packet must prove:

- core `package.json` exports and dependencies are unchanged;
- no NN package directory, workspace, component source, or provider code enters the packet;
- active charter, agent, registry, capability, architecture, plan, status, and specification documents agree on the layered boundary;
- mutation tests reject a core `./nn` export, a core NN dependency, a same-package claim, missing separate-package/component markers, and an implemented/qualified NN status;
- exact Node 26.7.0 documentation and core package conformance remain green.

This proves authority and core isolation only. It cannot prove NN behavior or native provider support.

## Child-specification gate

Every production NN boundary requires its own accepted specification before source enters it. At minimum, child work must state:

- exact public/internal contract and package surface;
- ownership, injected ports, dependency direction, lifecycle, errors, bounds, compatibility, and cleanup;
- portable claims and decisive falsifiers;
- exact native/provider/numerical promotion evidence where applicable;
- package deletion and independent-consumer validation.

Issue #72 or any provider issue cannot implement from this foundation alone.

## Acceptance conditions

The accepting change must establish all of the following together:

- accepted charter authority preserves generic core and authorizes the optional NN product;
- the accepted package decision selects a separate publish unit and defers its registry name/directory;
- planned component anchors name ownership without creating implementation authority;
- core package exports, dependencies, files, workspaces, and source tree remain unchanged;
- compatibility, lifecycle, provider-context, third-party provenance, evidence, and deletion boundaries are explicit;
- active documentation contains no project-wide contradiction;
- exact Node 26.7.0 documentation/projection tests pass and the protected-main tree is read back before issue closure.

## Non-goals

- implementing or exporting an NN package;
- selecting its registry name or workspace location;
- selecting the complete model/tensor/operator/training API;
- implementing tensors, graphs, autodiff, providers, optimizers, checkpoints, or training;
- accepting SPEC-0017 through SPEC-0026;
- adding cuBLAS, cuDNN, NCCL, or provider-specific dependencies;
- claiming CUDA, numerical, convergence, lifecycle, package, or performance qualification;
- moving consumer-specific model/data/objective/search semantics into CUDA-JS.
