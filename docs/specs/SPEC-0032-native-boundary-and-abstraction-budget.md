# SPEC-0032: Native Boundary and Abstraction Budget

**Status:** Accepted

**Version:** 1.0.0

**Owner:** CUDA-JS

## Purpose

This specification defines the CUDA ecosystem's lowest implementation boundary and the amount of abstraction CUDA-JS may own above raw native APIs.

CUDA-JS is the sole repository in the CUDA-JS ecosystem that owns maintained native integration. Reusable semantic libraries and downstream products remain JavaScript/TypeScript systems and consume native capabilities only through versioned public CUDA-JS contracts.

This rule does not require CUDA-JS to implement every possible native capability. It determines ownership when a native capability is selected.

## Sole native boundary

CUDA-JS owns every selected consumer-neutral fact whose implementation requires knowledge of native CUDA/provider/platform machinery, including as applicable:

- CUDA Driver and provider discovery;
- generated ABI and calling-convention facts;
- native function signatures and argument packing;
- context, device, module, function, stream, event, graph, memory and provider resources;
- native memory allocation, registration, mapping, advice, prefetch, transfer and peer-access mechanisms;
- native compiler/linker/provider interfaces and generated device artifacts;
- native error attribution, context health, resource terminality and teardown;
- OS/process/Node/native ABI normalization and exact compatibility evidence.

Raw pointers, handles, provider objects, ABI structs, platform handles and arbitrary native calls remain private unless a separately accepted CUDA-JS contract exposes a bounded opaque capability.

A selected native mechanism required by an upper repository must be added or extended here before that upper repository implements a local native workaround.

## Maintained implementation-language boundary

The current CUDA-JS package remains governed by its JavaScript-authored/JIT-native-realized and no-project-addon authority. This specification does not silently authorize a maintained CUDA-JS C/C++ addon.

However, if a future measured gap justifies maintained native host code, the natural repository owner is CUDA-JS and a separate accepted architecture/package/lifecycle contract is required before implementation.

Upper repositories do not gain that option: their maintained repository source is JavaScript/TypeScript, with restricted Device-JS permitted only through CUDA-JS-owned language contracts. They do not maintain C, C++, CUDA C++, PTX, native FFI, N-API addons, provider bindings or platform-ABI implementations.

Independent native evidence for an upper semantic/product claim may be produced by an external evidence environment, but native oracle source is not maintained in the upper repository. Generic reusable native evidence machinery belongs here when it is naturally CUDA-JS-owned.

## Abstraction budget

CUDA-JS is not required to be a one-to-one spelling of the Driver API. An abstraction belongs in CUDA-JS only when it is justified by at least one of the following four reasons and remains consumer-neutral.

### 1. Native encapsulation

The abstraction prevents unsafe or unstable native details from escaping into JavaScript.

Examples include opaque memory/module/function/provider capabilities, typed bounded views, generated argument packers and sanitized compatibility records.

### 2. Lifecycle correctness

The abstraction is required so one lower owner can preserve native lifetime, asynchronous completion, deferred failure, health, lease, cancellation, rollback, cleanup, quarantine or restart-required truth.

Examples include `CudaOperation` and child-before-parent resource ownership.

### 3. Platform and ABI normalization

The abstraction prevents Windows/Linux, process ABI, Node FFI, Driver/provider version or hardware differences from becoming duplicated upper-layer authority.

Normalization must preserve material differences in compatibility identity rather than pretending unlike native profiles are identical.

### 4. Generic native mechanism composition

Several native calls/resources may form one reusable CUDA mechanism when the mechanism has a coherent finite identity, resource model, lifecycle and failure contract independent of the motivating workload.

Examples may include bounded prepared execution, asynchronous transfer operations, CUDA Graph realization, publication mailboxes, provider plans and bounded multi-operation scheduling.

Reducing consumer line count alone is not sufficient justification.

## Abstraction exclusion rule

CUDA-JS does not own policy merely because policy eventually causes CUDA calls.

Unless required for native correctness or compatibility, the following belong above CUDA-JS in their natural semantic or reusable-policy owner:

- workload-specific scheduling, batching, caching or prioritization;
- automatic provider/backend selection based on semantic meaning;
- semantic liveness and reclamation;
- performance autotuning and workload-specific launch/topology choices;
- model/search/tensor/data/media/communication policy;
- data-source, storage, checkpoint or deployment policy;
- higher-level physical memory-management strategy such as lifetime-driven reuse, arena planning, allocation pooling policy, fragmentation strategy, eviction/spill policy, oversubscription policy, device placement, migration strategy or prefetch strategy.

CUDA-JS may expose the native primitives and exact capability/resource facts needed to realize those policies.

## Memory boundary

Memory is the reference example for this specification.

CUDA-JS may own safe mappings for native mechanisms such as:

- device allocation and free;
- managed allocation;
- host allocation/registration/mapping;
- typed bounded views;
- H2D/D2H/D2D and peer-copy operations;
- peer-access capability and enablement;
- native memory pools;
- memory advice and prefetch;
- external-memory import/export;
- exact native alignment, device capability, lifetime and teardown facts.

CUDA-JS does not, solely because these primitives exist, own decisions such as which semantic object should use device versus managed storage, when dead ranges should be recycled, how an arena should be packed, how much pooled memory should be retained, what should spill under pressure, which GPU should hold a shard, or when future data should be prefetched.

Semantic owners retain semantic liveness and resource meaning. A future reusable physical-memory policy layer is justified only if it can operate on generic size/alignment/lifetime/access/placement constraints without Tensor, NN, search, dataframe or product vocabulary and consumes public CUDA-JS only. No such new repository is created or authorized by this specification.

## Upper-repository contract

Every CUDA-JS ecosystem repository above this boundary must satisfy all of the following:

1. Maintained source is JavaScript/TypeScript, plus restricted Device-JS where device execution is required.
2. No maintained native host/provider source, direct FFI, CUDA C++ or PTX is introduced.
3. CUDA/provider handles, pointers, ABI structs, native enums and platform discovery do not become upper semantic authority.
4. A missing native mechanism is routed to CUDA-JS before any local workaround.
5. The upper repository owns only its semantic meaning, reusable policy or product behavior and maps that meaning into public lower capabilities.
6. External native evidence does not broaden CUDA-JS or upper-layer support claims beyond its exact recorded profile.

## Convenience boundary

CUDA-JS may provide thin conveniences over accepted lower bricks only when the convenience creates no second runtime, scheduler, allocator, provider registry, compatibility resolver or semantic policy owner.

If a convenience starts retaining cross-request strategy, workload knowledge, semantic liveness or adaptive policy, it must move above CUDA-JS or receive a separately justified reusable policy owner.

## Compatibility and supersession

This specification is additive authority over every existing CUDA-JS specification. Existing accepted native/resource/lifecycle contracts remain valid within their written scope.

Where older prose could be read to permit an upper repository to maintain native CUDA/provider integration, this specification controls: the native mechanism belongs to CUDA-JS and upper maintained source remains JavaScript/TypeScript plus restricted Device-JS.

Historical evidence and accepted specifications are not rewritten retroactively. New work and successor specifications must conform to this boundary.

## Non-goals

This specification does not:

- create a new memory-manager repository;
- authorize any specific managed-memory, P2P, graph, provider or interop implementation;
- move Tensor, NN, search, RNG, communication, I/O, media, data, ray, graph-analytics or product semantics into CUDA-JS;
- require a native addon in CUDA-JS;
- turn CUDA-JS into an application scheduler or automatic optimizer;
- weaken exact native qualification or first-consumer-deletion requirements.
