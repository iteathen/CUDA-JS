# SPEC-0024: Multi-GPU Orchestration

**Status:** Proposal

**Date:** 2026-08-13

**Issue owner:** #20

## Outcome

Define finite, explicit orchestration across multiple selected physical CUDA devices while preserving one private context owner per device, opaque device-scoped capabilities, exact artifact targeting, bounded cross-device transfer and conservative failure/cleanup truth.

This specification does not choose application workload partitioning, load balancing, collective algorithms or model/search semantics.

## Status dimensions

```text
architectural disposition: planned
implementation status:       not-implemented
qualification status:        not-qualified
priority:                    after SPEC-0017 and operation/memory foundations
```

## Dependencies

This proposal consumes SPEC-0017 explicit device selection, SPEC-0018 bounded operation dependencies and SPEC-0019 async transfer/staging where accepted.

Library collectives such as NCCL require a separate provider/profile and do not become generic multi-GPU semantics here.

## First ownership model

The first in-process profile is:

```text
multi-device coordinator
  -> device runtime A -> DriverActor A -> context A -> selected device A
  -> device runtime B -> DriverActor B -> context B -> selected device B
  -> ... finite configured device count
```

Each device runtime retains the accepted single-device resource/lifecycle rules. The coordinator owns only cross-device admission, dependencies, transfer strategy, aggregate status and cleanup ordering.

A process-per-device topology may be selected for specific service/scale-out profiles, but it is not silently interchangeable with the in-process profile. Process topology enters compatibility/evidence identity.

## Device-set creation

A multi-device coordinator is created from a finite set of valid SPEC-0017 selectors.

Before native cross-device work CUDA-JS validates:

- selectors are distinct and valid;
- each runtime/context binds to the requested physical device;
- requested device count is within configured bounds;
- required architecture/provider capabilities are available per device;
- duplicate/ambiguous/stale selectors reject;
- every device has an exact sanitized compatibility identity.

No automatic device discovery→use-all policy is implied by the existence of multiple GPUs.

## Device-scoped capabilities

Every allocation, module, function, view, operation, provider plan and resource is internally scoped to:

```text
coordinator identity
device runtime identity
device generation/epoch
```

A single-device operation cannot consume a foreign-device resource unless a separately accepted multi-device operation owns both sides.

Cross-device misuse fails before native dispatch.

## Per-device quotas and health

Each device runtime maintains independent:

```text
memory/resource quota
pending-operation capacity
provider/artifact compatibility
health state
cleanup inventory
```

The coordinator may also apply aggregate limits, but one device's available capacity is not silently borrowed as another device's device memory.

## Peer capability and access

Peer capability is directional and exact-profile specific.

Before a direct peer path CUDA-JS must:

1. query whether the source/destination device pair supports the required peer access/copy mechanism;
2. establish any required context-current state on the correct DriverActor owner;
3. enable peer access only through a bounded private lifecycle;
4. record the directional peer relationship and generation;
5. retain peer-access dependencies while operations need them;
6. disable/destroy peer relationships before parent context teardown where the selected API/profile requires it.

Public callers receive no peer-context handle or native device identifier.

## Cross-device copy

A cross-device copy operation owns both source and destination runtimes/resources.

Selected strategies:

```text
peer-direct copy        when exact pair/profile is qualified
pinned-host staged copy when peer-direct is unavailable or not selected
```

Strategy selection is explicit in operation/evidence records and does not silently create a performance claim.

### Peer-direct

The operation validates ranges/views, peer capability/access state, device ownership and destination/source ordering before native submission.

### Staged fallback

The fallback consumes bounded SPEC-0019 pinned staging. It performs device→host and host→device phases with exact operation dependencies and retains all staging/source/destination leases through terminality.

Fallback does not imply the same bandwidth/latency or atomicity as peer-direct transfer.

## Heterogeneous device support

A multi-device set may contain different GPU architectures only when every per-device artifact/provider plan is compatible with that device.

CUDA-JS must not load one cubin/target blindly across heterogeneous devices.

A multi-device executable product records per-device artifact/plan identity. Compilation/link defaults derive from SPEC-0017 target resolution for each device.

## Cross-device dependencies

A multi-device operation DAG may express finite dependencies between operations on different device runtimes.

The coordinator lowers these using only accepted mechanisms, such as host-mediated admission/status or separately qualified cross-device event/semaphore mechanisms. Cross-device synchronization is never inferred from wall-clock order.

The first profile may conservatively serialize a dependency through coordinator observation if no device-side cross-device mechanism is accepted. This is semantically valid but must not be marketed as fully device-resident orchestration.

## Failure and aggregate truth

A multi-device result distinguishes:

```text
all devices terminal-success
one/more device operation failed with proved unaffected peers
partial/unproved state
coordinator/owner loss
restart-required device set
```

One device failure does not automatically prove another device failed, but shared process/Driver/provider failures may widen the affected boundary.

CUDA-JS must preserve exact per-device health and known/unknown mutation state. It must not report atomic multi-device rollback unless an accepted mechanism proves it.

## Close behavior

Coordinator close:

1. stops new multi-device admission;
2. closes/terminalizes cross-device operations;
3. releases peer relationships and staged-transfer resources where proved;
4. closes per-device children before each context;
5. closes each DriverActor/runtime independently;
6. reports per-device and aggregate orphan/restart-required inventory when cleanup cannot be proved.

One device's clean close does not erase another device's orphan state.

## Portable conformance

- finite device-set/selector validation;
- duplicate/stale/foreign selector rejection;
- device-scoped capability enforcement;
- directional peer-state machine;
- peer versus staged strategy selection;
- heterogeneous artifact selection;
- cross-device dependency model;
- per-device quota/health separation;
- partial failure/aggregate disposition;
- deterministic cleanup order;
- public sanitization.

Mocks do not prove peer DMA, overlap or physical-device isolation.

## Native promotion evidence

A promoted first topology requires at least two independently visible physical GPUs on a controlled host.

Evidence must prove:

1. each selected context/launch matches an independent native oracle on its intended device;
2. cross-device resource misuse rejects before native work;
3. direct peer capability/access and copy behavior for the exact pair, where claimed;
4. staged fallback exact byte parity;
5. heterogeneous target/artifact separation where tested;
6. concurrent/dependent operations under the accepted scheduler profile;
7. one-device failure with conservative peer/coordinator disposition;
8. terminal peer/transfer/operation/resource/context cleanup;
9. sanitized evidence contains no UUID/serial/PCI/native-handle leakage.

Promotion applies only to the exact tested topology/profile.

## Falsifiers / rollback

Do not accept this specification if a coordinator requires public raw device/context handles or if partial failure cannot preserve per-device truth.

Rollback is multiple independent single-device CUDA-JS runtimes with no cross-device operation contract.

## Non-goals

- automatic workload partitioning/load balancing;
- transparent migration/failover;
- NCCL/collectives by default;
- multi-node orchestration;
- MIG administration;
- GPU reset/mode changes;
- public UUID/PCI/native device identities;
- cross-device transactional rollback claims.

## Primary references

- https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__DEVICE.html
- https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__PEER__ACCESS.html
- https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__CTX.html
