# SPEC-0023: Context-Bound CUDA Library Adapters

**Status:** Proposal

**Date:** 2026-08-13

**Issue owners:** #90 with first consumers #91, #92 and #93

## Outcome

Define the reusable provider/lifecycle framework for selected CUDA libraries whose handles, plans, descriptors, generators or workspaces execute against CUDA context/stream/device state.

The framework keeps native library resources inside DriverActor and exposes only finite library-specific capabilities. It is not an unrestricted foreign-function or native-option passthrough.

## Status dimensions

```text
architectural disposition: planned
implementation status:       not-implemented
qualification status:        not-qualified
priority:                    after accepted SPEC-0018 and SPEC-0021 views
```

## Dependencies

This proposal consumes SPEC-0001/0002/0003 generated/native ownership, SPEC-0016 operations, proposed SPEC-0018 scheduling and SPEC-0021 typed views.

Library profiles that use asynchronous host transfer additionally consume SPEC-0019.

## Provider framework

Every admitted CUDA library has a named, versioned provider profile that owns:

```text
canonical provider discovery policy
provider version/export set
provider/library digest or equivalent provenance where material
pinned official header/schema namespace
generated ABI facts
reviewed semantic/lifecycle overlay
supported public library-contract version
accepted device/Driver/toolkit/OS/ABI profiles
```

Unknown/missing/wrong-version/wrong-export providers fail before native library resource creation.

Caller-selected arbitrary DLL/SO paths are not part of the ordinary public API.

## Generated ABI and semantic overlay

For each selected library:

- import only the finite declarations/constants required by the accepted profile from pinned official headers;
- generate exact FFI/layout products separately from semantic policy;
- maintain reviewed lifecycle, context, stream, blocking, error, workspace, compatibility and cleanup meaning in a separate overlay;
- catalog unselected declarations as unavailable rather than exposing a generic function trampoline.

Independent native C/C++ ABI/call oracles are required before native promotion.

## Ownership

Context-bound runtime calls and native resources remain under DriverActor/current-context ownership.

Typical private resource graph:

```text
runtime/device/context
  -> library provider
     -> library handle/generator/plan
        -> descriptors
        -> workspace leases
        -> bound typed views/memory leases
        -> asynchronous SPEC-0016/0018 operation
```

CompilerActor remains responsible only for compilation/linking and accepted trusted device-header profiles. Host library handles do not migrate to CompilerActor.

## Public contract rule

Every library receives a dedicated bounded public/extension schema. Public fields describe semantic choices, not native implementation values.

Examples:

```text
RNG family/seed/count/output dtype
FFT dimensions/batch/layout/direction
sparse format/dimensions/index width/value dtype/operation
```

The public API does not expose raw library enums, algorithm IDs, descriptors, handles, provider paths, arbitrary option blobs or native pointers.

## Capability negotiation

Library/provider availability is explicit and side-effect free until requested by the relevant runtime/extension operation.

A capability result distinguishes:

```text
architecturally admitted but provider unavailable
provider/profile incompatible
request unsupported by bounded contract
request valid/candidate plan available
```

Importing core `cuda-js` must not eagerly initialize optional CUDA libraries.

## Stream and operation integration

Asynchronous library work binds to DriverActor-owned private streams selected under SPEC-0018.

Library submission returns/participates in the existing opaque operation lifecycle. It does not create a library-specific completion abstraction.

Provider calls declare:

- stream class/requirements;
- input/output typed-view access roles;
- workspace bytes/alignment/lifetime;
- concurrency/handle-state restrictions;
- graph/prepared-execution eligibility where separately proven;
- immediate/deferred error boundary.

Mutable native handle state must not race across concurrent operations.

## Workspace and quota

Every selected operation/plan has a finite workspace ceiling or a bounded query→admission protocol.

CUDA-JS accounts workspace against configured device/resource budgets before execution. Hidden unbounded provider allocation is not an accepted ordinary path.

If a provider performs unavoidable internal allocation, that fact, bound/observation policy and cleanup implications must be explicit in the library-specific profile before acceptance.

## Error and health semantics

Provider errors are normalized without losing native observation provenance.

The semantic overlay classifies:

- validation/unsupported request;
- provider discovery/version failure;
- immediate library-call failure;
- deferred/asynchronous execution failure;
- context/stream health consequence;
- resource cleanup failure;
- restart-required state.

A provider failure is not automatically attributed to the most recent operation unless the native mechanism proves causality.

## Cleanup

Every provider/library resource has one terminal disposition.

- child descriptors/plans/generators/workspaces/operations close before provider/context;
- in-flight work retains all required handles/views/workspaces;
- close failure preserves the original structured health/provenance under the resource-disposal contract;
- unexpected Worker/process loss records inaccessible/orphaned provider resources without fabricated destroy claims.

## First library profiles

### cuRAND

Two separately qualified profiles may be admitted:

1. trusted `curand_kernel.h` device-header closure through CompilerActor for authored/generated CUDA under the trusted-source profile;
2. context-bound host generator operations writing into opaque typed device views.

A host generator profile defines RNG family, seed/order/offset/subsequence, output dtype/count/distribution, reproducibility/version semantics and cleanup. Cryptographic suitability is not implied.

### cuFFT

An FFT profile defines opaque plan semantics including rank/dimensions/batch, input/output dtype, strides/layout, transform type/direction, in-place legality, workspace and normalization expectations.

Forward/inverse scaling is application-visible and must be explicit.

### cuSPARSE

A sparse profile defines a finite set of sparse formats and operations with exact dimensions, index width/base, value/compute dtype, dense companion views, pointer/scalar mode policy, algorithm policy and workspace.

Malformed sparse-structure validation responsibility is explicit.

## Portable conformance

Framework-level tests cover:

- provider discovery/version/export controls;
- generated ABI/semantic-overlay separation;
- provider resource graph and teardown order;
- typed-view/resource lease integration;
- workspace/quota pressure;
- mock immediate/deferred failures;
- same-runtime/device enforcement;
- optional provider absence and core-import isolation;
- no native/private fields in public records.

Library-specific portable tests cover their semantic request/plan schemas.

## Native promotion evidence

For every promoted library/profile:

1. generated ABI/layout/calls agree with an independent native oracle;
2. exact provider/version/export/digest facts are recorded;
3. selected operations match independent numerical/byte references;
4. missing/wrong provider controls fail before resource creation;
5. stream/dependency/async completion semantics are proven where claimed;
6. workspace/pressure/error paths are exercised;
7. every handle/descriptor/plan/generator/workspace/operation/provider/context reaches truthful terminal disposition;
8. installed-package behavior is verified with provider present and absent.

## Falsifiers / rollback

Do not accept a library profile that requires arbitrary public native handles/options or cannot preserve DriverActor context ownership and terminal cleanup.

Provider absence always leaves core CUDA-JS usable under its existing accepted profile.

## Non-goals

- arbitrary library names/symbols/signatures;
- unrestricted native enum/option passthrough;
- bundling NVIDIA binary providers by default;
- tensor/search/application semantics in generic core;
- assuming all library plans are deterministic or graph-compatible;
- performance claims without exact workload/provider evidence.

## Primary references

- https://docs.nvidia.com/cuda/cuda-driver-api/
- https://docs.nvidia.com/cuda/cublas/
- https://docs.nvidia.com/cuda/cufft/
- https://docs.nvidia.com/cuda/cusparse/
- https://docs.nvidia.com/cuda/curand/
