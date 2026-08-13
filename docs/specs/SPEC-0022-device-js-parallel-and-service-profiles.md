# SPEC-0022: Device-JS Parallel and Service Profiles

**Status:** Proposal

**Date:** 2026-08-13

**Issue owners:** #87 and #89

## Outcome

Extend accepted SPEC-0013 in two explicitly separate directions:

1. a **trusted-source parallel profile** adding bounded generic GPU programming primitives needed for efficient reductions, scans, stencils, sorting and other consumer-neutral kernels;
2. a later **service-safe admission profile** for adversarial user-submitted Device-JS with length-bearing bounds, finite work budgets, quotas and process isolation.

Trusted-source capability is not a sandbox. Service safety cannot be inferred from ordinary Device-JS correctness evidence.

## Status dimensions

```text
trusted parallel profile:
  architectural disposition: planned
  implementation status:       not-implemented
  qualification status:        not-qualified
  priority:                    after accepted prerequisite type/view contracts

service-safe profile:
  architectural disposition: planned
  implementation status:       not-implemented
  qualification status:        not-qualified
  priority:                    after trusted profile + generalized operations + SPEC-0026
```

## Dependencies

This proposal extends SPEC-0013 and its public-surface addendum.

Numeric/view-dependent helpers consume SPEC-0021. Service-safe execution additionally consumes SPEC-0026 process isolation and accepted operation/quota contracts.

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
- shared/local layout and bounds;
- multidimensional index arithmetic;
- warp/helper profile rejection;
- atomic order/scope/type combinations;
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

Mocks do not prove GPU sandboxing.

## Native promotion evidence

Trusted-profile helpers require independent native oracles for each selected shared/warp/atomic/numeric primitive on every promoted exact architecture/profile.

Service promotion additionally requires destructive-but-controlled child-process tests for compiler crash, Driver child crash/hang, quota exhaustion and stale capability rejection, plus explicit evidence of containment limits and terminal/supervisor resource disposition.

## Falsifiers / rollback

Do not accept a helper whose semantics vary silently by architecture or require raw CUDA escape. Do not label a profile service-safe until bounds, work budgets, quotas and process containment all exist together.

Rollback is accepted trusted-source SPEC-0013.

## Non-goals

- full ECMAScript;
- arbitrary CUDA/C++/PTX;
- recursion/dynamic allocation in the first parallel slice;
- consumer-domain helpers;
- universal GPU sandboxing;
- guaranteed preemption;
- service-safety claims from trusted-source evidence.

## Primary references

- https://docs.nvidia.com/cuda/cuda-programming-guide/
- https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/writing-cuda-kernels.html
- https://docs.nvidia.com/cuda/cuda-math-api/
