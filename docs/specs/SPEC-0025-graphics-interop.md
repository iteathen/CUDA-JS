# SPEC-0025: Graphics External-Resource Interoperability

**Status:** Proposal

**Date:** 2026-08-13

**Issue owner:** #94

## Outcome

Define bounded CUDA-JS interoperability with selected graphics buffers/images and synchronization objects so accepted GPU resources can be consumed or produced without mandatory host copies, while preserving opaque native handles, explicit device matching, external ownership, operation ordering and terminal cleanup.

CUDA-JS does not become a renderer or graphics-device manager.

## Status dimensions

```text
architectural disposition: planned
implementation status:       not-implemented
qualification status:        not-qualified
priority:                    after SPEC-0017, SPEC-0018 and SPEC-0021
```

## Dependencies

This proposal consumes SPEC-0017 selected-device identity, SPEC-0018 operation/dependency scheduling and SPEC-0021 typed bounded views.

Prepared/CUDA Graph integration consumes SPEC-0020 only after the exact graphics synchronization/resource profile proves graph compatibility.

## Profile selection gate

Graphics interoperability is API/profile specific. Before implementation is accepted, the first production profile must select one concrete bounded external-resource route, preferably a **linear external buffer** from Vulkan or D3D12 because it minimizes image/layout/state complexity.

D3D11, OpenGL, external images/mipmapped arrays and other APIs remain separate profiles with independent contracts/evidence.

No support is inferred across graphics APIs, operating systems, handle types or GPU topologies.

## Trusted graphics adapter boundary

Ordinary public CUDA-JS does not accept arbitrary numeric OS handles or raw graphics API objects.

A trusted graphics adapter issues an opaque validated import capability containing only bounded public-safe facts plus private transport needed by the CUDA-JS owner.

The adapter must validate/declare at least:

```text
external API/profile identity
external resource kind
graphics device identity suitable for private matching
resource generation
byte size or image extent/format metadata
permitted range/subresource
access intent
external ownership state
synchronization capability/profile
```

Raw Win32 handles, file descriptors, D3D/Vulkan objects and native pointers remain private and have an explicit transfer/duplication/close policy.

## Device matching

Every external resource is matched to an accepted SPEC-0017 selected CUDA device before import.

Same-device proof uses private platform/vendor identity mechanisms appropriate to the selected graphics API. Public evidence is sanitized and does not expose UUIDs, PCI identifiers, LUIDs, serials or native handles unless a separately protected diagnostic policy permits them.

A wrong-device or ambiguous match fails before CUDA import or operation submission.

## External resource types

### Linear external buffer

The first preferred profile models:

```text
resource generation
byte length
permitted byte range
alignment
access role
external-owner state
```

CUDA-JS imports the external memory privately, maps only the accepted range, and exposes an opaque typed/bounded view rather than a device pointer.

### Images/mipmapped arrays

A later profile additionally defines:

```text
format/plane semantics
extent
array/mip level/layer range
pitch/layout restrictions
read/write access
ownership transitions
```

No image format is accepted merely because CUDA exposes a native enum for it.

## Ownership model

The renderer/graphics application retains ownership of the external allocation/object. CUDA-JS owns only its CUDA-side import/mapping/synchronization resources.

An opaque interop resource has explicit states equivalent to:

```text
issued by trusted adapter
validated
imported
available to CUDA under accepted synchronization/ownership epoch
leased by operation
returned/released to external owner
closed/orphaned
```

CUDA-JS cannot free or resize the renderer's external allocation unless the selected graphics contract explicitly transfers ownership, which is not part of the first slice.

## Synchronization

Interop requires explicit ordering; sharing memory alone is insufficient.

Selected profiles may use private imported external semaphores/fences and DriverActor-owned operations such as wait/signal on a private CUDA stream.

The public contract expresses only opaque synchronization generations/epochs and permitted transitions, not raw semaphore handles or native fence structs.

A CUDA operation may access an external resource only after the required external→CUDA wait/ownership transition is admitted. The resource cannot be returned to the renderer until CUDA work and CUDA→external signal/transition are submitted/proved according to the accepted profile.

## Operation integration

Interop wait/access/signal actions compose with SPEC-0018 operation dependencies and resource hazards.

An operation declares external-view access roles. CUDA-JS retains the imported resource, synchronization object and external-generation lease through terminality.

A stale generation, external-owner loss or attempted concurrent ownership violation fails before unsafe native work where observable.

## Import lifecycle

Private CUDA-side resources may include:

```text
external-memory import
mapped buffer or array/mipmapped-array child
external-semaphore import
operation/event/stream dependencies
```

Child mappings/synchronization resources are destroyed before the imported parent and before CUDA context teardown.

OS/native handle ownership (borrowed, duplicated, consumed) is explicit per handle type and must be proven against the selected API documentation. CUDA-JS must not double-close or leak the graphics owner's handle.

## Failure and health

The contract distinguishes:

- invalid/stale external capability;
- wrong-device match;
- import/map failure;
- wait/signal submission failure;
- asynchronous CUDA failure;
- external-owner/device loss;
- CUDA device/context loss;
- cleanup failure.

A failed CUDA-side import does not imply the graphics allocation was destroyed. External-owner loss may make CUDA-side resources inaccessible/orphaned; cleanup truth is reported conservatively.

## Portable conformance

- adapter capability schema/generation validation;
- same-device/wrong-device model;
- range/format/access validation;
- external ownership state machine;
- wait→CUDA access→signal ordering;
- stale generation and double-use rejection;
- interop lease/resource graph;
- close/owner-loss/orphan handling;
- public-record sanitization;
- no arbitrary handle passthrough.

Mocks do not prove direct GPU interop.

## Native promotion evidence

For each promoted exact graphics API/profile:

1. use an independent graphics producer/consumer oracle to create the external resource;
2. prove CUDA imports the same underlying GPU resource rather than substituting a host copy;
3. prove selected-device match and wrong-device rejection;
4. validate buffer bytes or selected image results in both directions;
5. prove external wait/signal/ownership ordering;
6. exercise stale generation and access violation controls;
7. exercise external-owner/device loss where safely possible;
8. prove CUDA-side mapping/import/semaphore/operation/context terminal cleanup;
9. record exact OS/graphics API/Driver/CUDA/GPU/profile identity with sanitized public evidence.

## Graph/prepared execution

External semaphore nodes/operations may participate in SPEC-0020 only after the selected Driver/graphics/provider profile is independently proven compatible. Graph availability is never inferred from ordinary interop success.

## Falsifiers / rollback

Do not accept a profile that requires exposing arbitrary OS/native handles through ordinary CUDA-JS, cannot prove same-device ownership, or cannot model external/CUDA synchronization explicitly.

Rollback is ordinary copied host/device exchange through accepted memory/transfer contracts.

## Non-goals

- rendering/shaders/windows/swapchains;
- a graphics engine;
- arbitrary OS/native handle passthrough;
- borrowed external CUDA contexts;
- automatic cross-GPU resource migration;
- cross-API/platform inference;
- all image formats/APIs in the first slice.

## Primary references

- https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__EXTRES__INTEROP.html
- https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__GRAPH.html
- https://docs.nvidia.com/cuda/cuda-driver-api/
