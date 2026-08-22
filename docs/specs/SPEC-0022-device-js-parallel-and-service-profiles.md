# SPEC-0022: Device-JS Parallel and Service Profiles

**Status:** Proposal

**Date:** 2026-08-13

**Reconciled:** 2026-08-22 for scoped atomic observation

**Issue owners:** #87 and #89

## Outcome

Extend accepted SPEC-0013 in two explicitly separate directions:

1. a **trusted-source parallel profile** adding bounded generic GPU programming primitives needed for efficient reductions, scans, stencils, sorting and other consumer-neutral kernels;
2. a later **service-safe admission profile** for adversarial user-submitted Device-JS with length-bearing bounds, finite work budgets, quotas and process isolation.

The trusted-source profile may be implemented incrementally. The smallest justified first widening is **scoped atomic observation/publication**: generic atomic load/store semantics that let one device operation sample independently meaningful state while another operation updates that state, without requiring snapshot consistency or an artificial whole-operation dependency.

Trusted-source capability is not a sandbox. Service safety cannot be inferred from ordinary Device-JS correctness evidence.

## Status dimensions

```text
trusted parallel profile:
  architectural disposition: planned
  implementation status:       not-implemented
  qualification status:        not-qualified
  priority:                    atomic observation first when dependency-ready; broader primitives remain demand-driven

service-safe profile:
  architectural disposition: planned
  implementation status:       not-implemented
  qualification status:        not-qualified
  priority:                    after trusted profile + generalized operations + SPEC-0026
```

## Dependencies

This proposal extends SPEC-0013 and its public-surface addendum.

Numeric/view-dependent helpers consume SPEC-0021. Concurrent use of atomic observation across independently pending operations consumes SPEC-0018 scheduling semantics, but the atomic helper contract itself does not require multiple operations to exist. Service-safe execution additionally consumes SPEC-0026 process isolation and accepted operation/quota contracts.

## Preserved language invariants

Device-JS remains a closed, deterministic, statically resolved subset translated to private CUDA C++.

It does not become:

- full ECMAScript;
- a JavaScript VM/interpreter on the GPU;
- arbitrary CUDA C++/PTX/header passthrough;
- dynamic heap/object/prototype/GC execution;
- `eval`, promises, strings, exceptions or host APIs in device code.

Unsupported syntax/helpers reject before compiler dispatch.

## Trusted-source parallel profile

Only consumer-justified generic primitives are added. Every helper has one exact typed semantic meaning and deterministic lowering identity.

### Incremental acceptance rule

This proposal is a family of generic parallel primitives, not a requirement to implement them all together. A concrete dependency-ready child slice may select only the minimum helper set needed by a real consumer while preserving the rest as proposal-only.

For the first identified need, atomic load/store observation is independent of shared-memory, warp, local-array or multidimensional-index expansion. Those broader features must not be pulled into an atomic-observation implementation merely because they share this parent specification.

### Local arrays

Allow fixed-size local arrays only for accepted scalar element types and compile-time finite lengths.

Requirements:

- no dynamic allocation;
- size participates in source/artifact identity;
- index typing/bounds behavior is explicit;
- generated storage class is deterministic.

### Shared memory

Provide typed static and, if justified, bounded dynamic shared-memory views.

A shared-memory declaration defines:

```text
element dtype
element count or accepted dynamic extent
alignment
byte requirement
scope/lifetime
```

Dynamic shared-memory byte requirements must agree with the launch contract before native work. No raw `extern __shared__` escape is public.

### Multidimensional identity

Add typed flattened/global helpers for selected 2D/3D thread/block/grid coordinates.

Helpers return explicit integer widths and define overflow behavior. They do not silently coerce through JavaScript bitwise `Number` semantics.

### Warp primitives

Assess and admit only selected generic primitives with exact architecture/profile semantics, such as:

```text
lane identity
warp size/profile fact
active mask
vote
shuffle
selected warp synchronization
```

A helper is available only where the selected architecture/provider profile proves its prerequisites. Device-JS source remains portable only across profiles that support its declared helper set.

### Atomics and memory ordering

Atomic helpers must state:

```text
supported dtype
operation (load/store/RMW/CAS)
memory order
thread scope
return-value semantics
alignment/address-space constraints
```

No generic `atomic(...)` escape accepts native enum integers. Unsupported order/scope/type combinations reject before compilation.

Device-JS helper semantics map to documented CUDA C++ atomic behavior rather than inventing a second memory model.

#### First scoped-atomic widening

Accepted SPEC-0013 v0 already provides bounded RMW/CAS helpers (`gpu.atomic.add` and `gpu.atomic.cas`). The next minimum Device-JS atomic widening should add explicit load/store observation rather than forcing consumers to emulate reads through RMW operations.

The first candidate surface is conceptually:

```text
gpu.atomic.load(pointer, index, order?, scope?)
gpu.atomic.store(pointer, index, value, order?, scope?)
```

Exact spelling, defaulting and supported combinations remain subject to accepted child review. The contract must prefer the weakest documented order/scope that satisfies the declared semantics rather than silently imposing stronger synchronization. A relaxed device-scope profile is a candidate for independently meaningful device-resident observations, but is not accepted merely by this proposal text; exact CUDA lowering and profile support require primary-source review and native evidence.

#### Independent-observation semantics

An atomic load of one location guarantees only an individually valid value according to its accepted CUDA atomic order/scope. It does **not** imply:

- a coherent snapshot across neighboring locations;
- that two locations were observed at the same instant;
- a happens-before relationship to unrelated locations when the selected order does not provide one;
- ordering between otherwise independent operations;
- freshness beyond what the selected memory semantics guarantee.

This distinction is intentional. Some consumers only need a recent valid sample of each independently meaningful datum. CUDA-JS must not turn that use into a global snapshot or stream dependency.

If multiple locations jointly define one semantic fact and mixing versions could manufacture an invalid value, that compound relationship must use a separately accepted coherent publication pattern, such as an appropriately packed atomic unit, generation/sequence protocol, or explicit operation dependency. CUDA-JS owns the generic mechanism; consumers own which fields are semantically dependent.

#### Relationship to multi-operation scheduling

When SPEC-0018 admits independently pending operations over the same allocation, atomic observation/update declarations may make an overlapping access pair concurrency-safe. In that case CUDA-JS must not insert an inter-operation dependency solely because the byte ranges overlap.

This only makes the operations **eligible** to proceed independently. CUDA may still serialize their physical execution. Correctness must not rely on simultaneous kernel residency or overlap.

### Numeric extensions

`f64`, `f16`, `bf16`, vectorized access or additional pointer/view operations are admitted only after their owning dtype/range contract is accepted.

Fast/reduced-accuracy math must use explicit named helpers/profile identity; ordinary math does not silently become fast math.

## Source and artifact identity

Deterministic identity includes:

```text
SPEC-0013/0022 contract versions
normalized Device-JS source/module
closed helper set and helper semantic versions
dtype/view contract identities
selected architecture capability profile
generator/lowering version
normalized compiler options/header profiles
resulting generated-source/artifact digest
```

Generated CUDA remains private.

## Service-safe profile

The service profile is a separate named capability intended for adversarial or multi-tenant source. It requires more than closed syntax.

### Length-bearing memory parameters

Every remotely/user-controlled buffer parameter includes an accepted logical length/range contract. Generated code must enforce bounds or the compiler/admission layer must prove the access domain cannot exceed it.

Trusted raw pointer indexing without length-bearing bounds is unavailable in the service profile.

### Work bounds

Loops and execution must be bounded by one of:

- statically provable finite loop bounds; or
- a compiler-inserted/enforced work budget with deterministic exhaustion behavior.

The service profile does not promise to solve arbitrary program termination.

### Quotas

Admission declares finite ceilings for at least:

```text
source bytes
AST nodes/functions
compile/link count and time budget
artifact/cache bytes
memory/view bytes
launch grid/block/shared-memory
pending operations
output/result bytes
diagnostic bytes
per-tenant concurrent jobs
```

Quota exhaustion fails closed with stable bounded errors and cannot create an unbounded hidden queue/cache stampede.

### Native capability exclusions

Service clients cannot provide:

- CUDA C++/PTX/cubin;
- arbitrary headers/include paths;
- raw native compiler/linker options;
- provider/library paths;
- raw pointers/handles;
- arbitrary CUDA functions/enums.

### Process containment

Service execution requires the accepted SPEC-0026 child-process profile. A fatal child/native failure may still affect the GPU/Driver globally; process isolation is containment, not universal hardware isolation.

Every capability/token includes the child process epoch. Old capabilities reject after child loss/restart.

### Tenant separation

Service profiles define:

- authenticated/private supervisor IPC;
- per-tenant quotas and namespace;
- cache/provenance isolation policy;
- diagnostic redaction;
- bounded fairness/admission;
- residual-data/wipe policy where applicable;
- next-job health gate after failure.

No cross-tenant source/generated CUDA/native details appear in public records.

## Threat model

The service profile explicitly addresses:

- out-of-range device memory access;
- nontermination/resource exhaustion;
- compile/cache denial of service;
- malformed source/IPC;
- native/compiler/Driver crash containment;
- diagnostic/source leakage;
- stale capability reuse after process restart;
- residual data between jobs.

It does **not** claim immunity from GPU firmware/Driver defects, complete side-channel isolation, cryptographic tenant isolation or guaranteed hardware preemption.

## Portable conformance

### Trusted profile

- type/lowering tests for every helper;
- atomic load/store/RMW/CAS order/scope/type combinations;
- atomic observation tests prove one-location semantics without accidentally promising multi-location snapshot consistency;
- cross-contract tests with SPEC-0018 prove declared atomic overlap does not create an artificial operation dependency;
- compound/coherent publication cases still require their declared mechanism;
- shared/local layout and bounds when those features are selected;
- multidimensional index arithmetic when selected;
- warp/helper profile rejection when selected;
- deterministic source/artifact identity;
- unsupported syntax/helper rejection before compiler work.

### Service profile

- malicious out-of-range accesses;
- statically infinite/data-dependent loops against work budgets;
- source/AST/compile/cache/memory/operation/output quota exhaustion;
- cache-stampede/fairness model;
- stale process-epoch capabilities;
- malformed IPC/source records;
- diagnostic/source redaction;
- next-job health gating.

Mocks do not prove GPU atomic visibility, memory ordering, overlap or GPU sandboxing.

## Native promotion evidence

Trusted-profile helpers require independent native oracles for each selected shared/warp/atomic/numeric primitive on every promoted exact architecture/profile.

For atomic observation specifically, the native oracle must prove exact accepted load/store order/scope/type behavior and, when composed with SPEC-0018, prove that an observer operation can read only valid atomically published values without an inserted producer-completion dependency. Physical overlap may be measured separately but is not a correctness requirement.

Service promotion additionally requires destructive-but-controlled child-process tests for compiler crash, Driver child crash/hang, quota exhaustion and stale capability rejection, plus explicit evidence of containment limits and terminal/supervisor resource disposition.

## Falsifiers / rollback

Do not accept a helper whose semantics vary silently by architecture, require raw CUDA escape, or accidentally promise snapshot/happens-before semantics stronger than its documented CUDA lowering. Do not label a profile service-safe until bounds, work budgets, quotas and process containment all exist together.

Rollback is accepted trusted-source SPEC-0013.

## Non-goals

- full ECMAScript;
- arbitrary CUDA/C++/PTX;
- recursion/dynamic allocation in the first parallel slice;
- consumer-domain helpers;
- universal GPU sandboxing;
- guaranteed preemption;
- service-safety claims from trusted-source evidence;
- global snapshots for independently meaningful atomic observations;
- automatic inference of semantic dependencies between neighboring fields.

## Primary references

- https://docs.nvidia.com/cuda/cuda-programming-guide/
- https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/writing-cuda-kernels.html
- https://docs.nvidia.com/cuda/cuda-math-api/
