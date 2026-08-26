# SPEC-0020: Prepared Batch and CUDA Graph Execution

**Status:** Accepted

**Accepted scope:** Semantic prepared-kernel DAG baseline defined below; CUDA Graph realization remains proposal-only.

**Date:** 2026-08-13

**Accepted baseline:** 2026-08-26

**Issue owner:** #85

## Outcome

Define an opaque prepared-command capability for finite reusable operation DAGs, with a semantic prepared-batch baseline and an optional CUDA Graph realization on exact qualified profiles.

Prepared execution reuses SPEC-0016/SPEC-0018 operation lifecycle and dependency semantics. It does not expose raw `CUgraph`, `CUgraphExec`, graph-node, stream, event, provider or pointer handles.

## Status dimensions

```text
architectural disposition: accepted for the semantic prepared-kernel DAG baseline
implementation status:       implemented in public portable/package path
qualification status:        portable/package conformance only; native not-qualified
priority:                    after accepted SPEC-0018
```

## Dependencies

The accepted baseline consumes accepted SPEC-0016, SPEC-0018, and SPEC-0021. Transfer nodes additionally consume SPEC-0019; library nodes consume SPEC-0023; each remains outside the first baseline until a bounded child profile is accepted.

CUDA Graphs are an implementation profile over a validated semantic prepared batch, not the definition of batch semantics.

## Accepted first profile

The first production profile is an immutable finite DAG of kernel nodes only. It is deliberately useful without CUDA Graphs and remains coherent if every tensor, NN, search, and first-consumer repository is deleted.

The public runtime prepares a DAG from one through 32 kernel nodes, at most 64 dependency edges, and at most 64 named bindings. Each node contains one exact function capability, fixed grid/block/shared-memory configuration, fixed scalar arguments or named binding references, an explicit access declaration for every device-memory/view argument, and zero or more predecessor node IDs. Publication mailboxes, host transfers, device copies, library calls, mutable topology, dynamic node families, and arbitrary native controls are excluded from this profile.

Named bindings are inferred from declared function parameter kinds. One name has one exact kind across the DAG. A submission supplies every named binding exactly once using accepted scalar values or opaque device-memory/view capabilities from the same runtime. Grid/block/shared-memory fields and fixed scalar arguments are immutable; later update or specialization profiles require separate acceptance.

Preparation validates the complete topology, function schemas, binding-kind consistency, launch bounds, access structure, finite ceilings, and deterministic semantic identity without native submission. Submission then validates concrete binding ownership/ranges/access roles and all ordinary hazards before native work. Unordered overlapping ordinary conflicts reject; an explicit path in either direction orders the conflict. Compatible accepted atomic-observation/update overlaps may remain unordered under SPEC-0018 semantics.

One `submit()` call crosses the public/DriverActor boundary once. The semantic fallback enqueues the canonical topological order on one private stream, records one completion event after the final node, and returns one ordinary opaque SPEC-0016 operation for the whole DAG. It creates no public or hidden per-node operation objects. The prepared resource leases its function dependencies; each submitted operation leases the prepared resource and concrete bindings through terminal completion. Repeated replay is allowed after capacity admission. One optional earlier external operation may order the whole DAG through the existing SPEC-0018 predecessor contract.

The semantic identity binds the accepted contract, canonical nodes/edges, module/function identities and parameter schemas, fixed launch/scalar/access facts, binding schema, execution policy, and device launch-limit profile. Process-local resource tokens, native addresses, streams, events, generated source, and caller-selected native symbols are excluded.

Partial native submission is conservative: if any earlier node may have been enqueued and later-node or final-event provenance fails, the runtime becomes restart-required and retains unproved leases/resources rather than reporting clean rejection. No portable mock, single-stream semantic fallback, or reduced host round-trip count qualifies CUDA Graph support or a performance benefit.

This accepted baseline authorizes one pure `runtime.prepared-execution` topology/identity component, bounded integration into the existing `runtime.execution` lifecycle owner, exact DriverActor protocol commands for prepare/status/submit/release, one opaque public prepared-DAG capability, package declarations/compatibility updates, and portable/package evidence. It does not authorize new Driver exports or native CUDA Graph calls.

The public facade accepts either `runtime.prepareOperationDag({ nodes })` or the equivalent node-array overload. `kind`, `after`, and `sharedMemoryBytes` default only to `kernel`, `[]`, and `0`; function, grid, block, arguments, and accesses remain explicit. A prepared capability accepts canonical `submit({ bindings, after? })` and the equivalent convenience overload `submit(bindings, { after? })`. Both forms normalize to the same exact DriverActor command and identity/lifecycle contract; overloads do not create separate execution semantics.

## Prepared batch product

A prepared batch is an immutable, finite, validated command DAG whose nodes are selected executable operation families such as:

```text
kernel operation
transfer operation
library operation
bounded fill/memset operation
external synchronization operation where separately accepted
```

Each node declares:

- stable logical node identity;
- operation kind and accepted schema/version;
- predecessor dependencies;
- input/output/resource access roles;
- bounded parameter/binding schema;
- provider/executable identity where material;
- workspace/resource requirements;
- capture/graph eligibility;
- failure/health class;
- cleanup owner.

The public product contains no native handle or address.

## Bounds and validation

A preparation profile declares finite ceilings for:

```text
node count
edge count
bindings
updateable fields
aggregate resource leases
workspace bytes
prepared objects per runtime
native graph executions per runtime
```

Before native preparation CUDA-JS validates:

- acyclicity;
- all dependency identities;
- initialized-before-use ordering;
- resource/hazard legality under SPEC-0018;
- compatible runtime/device/profile ownership;
- view/range bounds;
- provider/workspace requirements;
- accepted update fields;
- graph eligibility if graph realization is requested.

Invalid batches fail before native graph creation or submission.

## Semantic prepared-batch baseline

The first authoritative execution meaning is the equivalent ordinary SPEC-0018 operation DAG.

For the same normalized prepared batch and bindings:

```text
prepared semantic execution == ordinary accepted operation DAG
```

within the declared numerical/result policy.

This baseline remains available when CUDA Graphs are unavailable, incompatible, not selected or fail preparation.

## Preparation and identity

Preparation yields a logical product whose identity includes at least:

```text
prepared-batch contract/version
normalized ordered nodes and edges
binding schema
resource/view identities and compatibility classes
provider/executable/artifact identities
workspace plan
stream/concurrency profile
updateable-field schema
device/Driver/provider profile
graph-lowering version when selected
```

Changing a material semantic/provider/resource/layout field produces a distinct prepared identity.

## Submission

Submitting a prepared batch returns one opaque SPEC-0016-compatible operation representing the whole batch execution.

Submission resolves only after:

1. binding validation;
2. required leases are acquired;
3. any permitted parameter updates are applied/validated;
4. all required native submissions or graph launch provenance is established;
5. completion observation is registered;
6. the logical operation is registered.

One logical operation terminalizes only after the entire batch execution reaches a proved terminal state.

## CUDA Graph realization (proposal-only successor profile)

A qualified profile may lower an accepted prepared batch to private CUDA graph resources using explicit Driver Graph APIs or another separately justified mechanism.

The first profile should prefer explicit graph construction when it provides clearer ownership and node mapping than incidental stream capture.

Private graph resources may include:

```text
CUgraph-like definition
CUgraphExec-like executable
private graph nodes/dependencies
provider-native graph-compatible bindings
launch/completion event/provenance
```

Graph objects remain serialized under their owning DriverActor. CUDA graph objects are not assumed thread-safe.

## Resource lifetime and pointer stability

Every resource whose address/handle/lifetime is captured or referenced by a graph executable remains valid for the required graph-exec lifetime or is internalized only where documented semantics and evidence prove that behavior.

Preparation must define whether bindings are:

```text
fixed for graph-exec lifetime
updateable under a closed accepted field set
require a new specialization/instantiation
```

Resource close/rebind, module unload, workspace relocation or view generation change that would invalidate a graph must fail or invalidate the prepared realization deterministically before unsafe execution.

## Graph update and specialization

The first accepted profile may use one graph executable per exact specialization.

If updates are added, the contract must define:

- exact updateable fields;
- compatibility validation;
- update failure result;
- whether the previous executable remains valid;
- logical/native generation after update;
- bounded specialization cache/eviction;
- cleanup when a specialization is replaced.

Structural mutation under an unchanged identity is forbidden.

## Provider integration

A provider node may participate only if its owning contract declares the selected execution/graph profile supported.

CUDA-JS must not assume every library call, workspace, external synchronization primitive or generated kernel is graph-compatible.

An unsupported node keeps the semantic prepared batch valid but may make CUDA Graph realization unavailable.

## Failure and health

Immediate graph creation/instantiate/update/launch failures retain the exact observation operation and affected logical prepared product.

Deferred asynchronous failures follow SPEC-0018 health/provenance rules. A graph launch may make multiple logical nodes share an indivisible failure boundary; CUDA-JS must not fabricate a single causal node when evidence cannot establish one.

## Close behavior

Prepared logical objects and native graph resources are explicit resources.

- close rejects or waits according to accepted policy while submissions remain pending;
- graph executions are destroyed before dependencies/context;
- dependency resources cannot close while leased by a live graph/prepared object where the contract requires lifetime retention;
- owner loss reports orphaned/inaccessible native graph resources without cleanup claims.

## Portable conformance

Portable tests must cover:

- DAG normalization and acyclicity;
- deterministic identity;
- ordinary-DAG equivalence;
- invalid binding/update rejection;
- resource lease accounting;
- specialization invalidation;
- provider graph-eligibility fallback;
- graph-resource teardown model;
- whole-batch operation terminalization;
- no raw native fields in public products.

## Native promotion evidence

For a CUDA Graph profile:

1. execute the same prepared batch through the ordinary SPEC-0018 DAG and private CUDA Graph path;
2. compare exact/declared-tolerance outputs and state transitions;
3. prove repeated replay;
4. exercise accepted parameter updates or specialization rejection;
5. independently verify the graph mechanism was used rather than ordinary resubmission;
6. exercise graph create/instantiate/update/launch/destroy failures;
7. verify modules/functions/memory/views/workspaces/providers remain valid through graph lifetime;
8. prove terminal graph/event/stream/context cleanup;
9. repeat through installed-package/public facade.

## Performance evidence

Performance claims separate:

- cold prepare/instantiate/upload cost;
- warm ordinary DAG submission;
- warm CUDA Graph replay;
- CPU/Worker/native submission counts;
- launch-bound versus compute-bound workloads;
- graph resource/memory overhead.

Graph execution is promoted as a performance profile only where measured benefit exists for a named workload/profile.

## Falsifiers / rollback

Do not accept a graph profile if it cannot preserve ordinary-DAG semantics, resource lifetime, conservative failure truth or private native ownership.

Rollback is semantic prepared-batch execution through ordinary SPEC-0018 operations.

## Non-goals

- public graph/node handles;
- arbitrary graph APIs/options;
- assuming every provider is capture-safe;
- conditional/cooperative/device-launched graphs in the first slice;
- consumer scheduling/domain policy;
- universal performance claims.

## Primary references

- https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__GRAPH.html
- https://docs.nvidia.com/cuda/cuda-driver-api/graphs-thread-safety.html
