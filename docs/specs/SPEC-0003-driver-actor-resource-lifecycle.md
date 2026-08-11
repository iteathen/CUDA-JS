# SPEC-0003: DriverActor and Resource Lifecycle

**Status:** Accepted

**Date:** 2026-08-11

## Authorization and scope

The project owner authorized Windows-first `CJS-F3` implementation on 2026-08-11 after accepting the exact Windows F2W bootstrap. This specification promotes only the bounded DriverActor, opaque registry, health, command, and teardown mechanisms described here.

The native qualification profile is Windows x86-64, official Node.js v26.7.0, and the accepted CUDA 13.3 Driver/toolkit/GPU identity from SPEC-0002 and EXP-012. The registry, protocol, health model, and lifecycle mock are platform-neutral. Native Linux Driver support remains blocked on EXP-001; GPU-free Linux execution may validate only the platform-neutral mechanisms.

This specification does not authorize memory allocation, modules, functions, kernel launch, streams, events, completion polling, compiler providers, cache, packaging, arbitrary libraries, arbitrary signatures, returned-pointer invocation, callbacks, public foreign views, or consumer semantics.

## Selected design

F3 uses one dedicated Worker per runtime and one private CUDA context per Worker. A main-thread asynchronous facade sends a closed command set to the Worker. The Worker owns the dynamic library, generated FFI functions, context handle, registry, resource disposers, and context-health state.

The registry is a separately owned pure-JavaScript component. The DriverActor depends on it; the registry never depends on CUDA or Node FFI. A lifecycle mock implements the same facade/Worker protocol without making native claims.

The following alternatives are rejected for this slice:

- main-thread FFI, because promise wrapping does not provide context affinity or event-loop isolation;
- direct reuse of the EXP-012 Worker, because disposable experiment evidence is not a production component boundary;
- one process-global context shared across Workers, because ownership and current-context semantics would be ambiguous;
- child-process isolation, because F3 first needs an in-process correctness baseline and process recovery is a later profile decision;
- arbitrary command or signature forwarding, because it would manufacture native authority outside reviewed schema and semantics.

## Component boundaries

### `runtime.driver-actor`

Owns:

- the asynchronous main-thread facade;
- bounded command validation, sequencing, backpressure, and result/error correlation;
- Worker startup and graceful shutdown;
- canonical Windows Driver discovery and the private Node FFI adapter;
- one selected device and one private context;
- current-context checks before context-dependent work;
- normalized error and health records;
- unexpected-Worker-loss epoch invalidation and orphan reporting.

It does not expose Worker, DynamicLibrary, FFI function, pointer, Driver path, or native handle objects.

### `runtime.resource-registry`

Owns:

- opaque token issuance and validation;
- runtime, epoch, kind, slot, generation, nonce, and current-state checks;
- parent/child dependency ordering;
- in-flight leases;
- closing, closed, stale, orphaned, and dead-epoch behavior;
- explicit disposal and bounded inventory records.

Native handles and disposer functions exist only in private registry entries. Inventory and tokens never include them.

## Facade contract

The component entry point is asynchronous:

```text
openDriverRuntime(options?) -> DriverRuntime
```

The bounded F3 facade provides:

```text
runtime.describe() -> profile, driver, device, context token, health, resource inventory
runtime.contextStatus(contextToken) -> current-on-owner, health, operation sequence
runtime.close() -> graceful terminal report
```

All methods return promises. `close()` is idempotent at the facade level and returns the original terminal report after a successful graceful close. Other operations reject after closing begins. A caller cannot submit an operation name, native symbol, signature, library path, pointer, device ordinal, or context flag.

The first native profile selects device ordinal zero and default context-create parameters exactly as accepted by F2W. Broader selection is a later capability contract.

## Command protocol

Every internal message has schema version, request ID, operation, and bounded payload. The accepted operations are `runtime.describe`, `context.status`, and `runtime.close`; test-only operations require the mock/testing entry point and are rejected by the native profile. The configured pending limit bounds user operations. Graceful close retains one reserved management-command slot so a full user queue cannot prevent teardown from being requested.

The facade limits outstanding commands. Overflow rejects before posting to the Worker. The Worker serializes every command in receive order. Responses contain only structured-clone-safe bounded data.

Unknown schema versions, operations, fields, tokens, kinds, states, or payload values fail before native invocation.

## Opaque token and registry rules

A token is a frozen structured capability containing only:

- schema version;
- runtime ID and runtime epoch;
- resource kind;
- slot and generation;
- unguessable nonce;
- issuance state.

The registry validates every field against its private current entry. A structurally valid forged token still fails nonce or ownership validation. Wrong-runtime, dead-epoch, wrong-kind, stale-generation, closing, closed, orphaned, and double-close cases have distinct stable error codes.

Slots may be reused only after terminal disposition, and reuse increments generation and replaces the nonce. A stale token can never identify a new native resource.

A parent cannot be disposed while live children or leases remain unless registry-owned cascade teardown is active. Cascade teardown disposes children before parents. A lease prevents final disposal until released; new leases are rejected once closing begins.

## Native startup and ownership

On Windows the Worker:

1. verifies the exact Node/platform/architecture profile;
2. opens only the canonical system `nvcuda.dll` path;
3. binds only generated Tier-0 named exports;
4. calls `cuInit(0)` and records the Driver/device profile;
5. verifies the selected device exists;
6. creates one default private context on device zero;
7. registers the library as parent and context as child;
8. verifies that the created context is current on the Worker thread;
9. publishes only the bounded description and opaque context token.

Every context operation validates the token and confirms the same private context is current. Pointer equality is evaluated inside the Worker and only a boolean crosses the boundary.

## Errors and health

Stable error categories are:

- `validation` — malformed command or value; health is unchanged;
- `unsupported` — unavailable platform/profile/capability; health is unchanged;
- `stale-resource` — token ownership/generation/state rejection; health is unchanged;
- `backpressure` — queue capacity exceeded before posting; health is unchanged;
- `immediate-driver` — native call failed at the current operation;
- `deferred-driver` — a later observation reports prior asynchronous failure with preserved operation provenance;
- `closed-runtime` — operation attempted after close began;
- `restart-required` — Worker loss, dead epoch, or inaccessible native ownership.

Health states are `healthy`, `suspect`, `poisoned`, `restart-required`, and `closed`. Transitions are monotonic except that a newly created runtime begins a new epoch. Validation, unsupported, stale-resource, and backpressure errors do not degrade health. An unexplained context mismatch or ordinary native failure becomes at least `suspect`. A destroyed/invalid context or severe deferred execution failure becomes `poisoned`. Unexpected Worker loss becomes `restart-required`. Successful graceful teardown becomes `closed`.

F3 has no native asynchronous execution operation, so its native capsule cannot prove deferred-error classification. The pure lifecycle capsule tests record shape, provenance retention, and conservative transitions; later native launch/completion work must supply real deferred-error evidence before that category is supported publicly.

## Graceful close

Graceful `close()`:

1. stops accepting new commands;
2. waits for the serialized command already executing;
3. rejects new registry leases;
4. disposes resources in child-before-parent order;
5. makes the owned context current before destroy when necessary;
6. destroys the context;
7. verifies no context is current on the Worker;
8. closes the Driver library and invalidates FFI wrappers;
9. returns terminal inventory and disposal results;
10. closes the Worker message port and exits cleanly.

A successful report requires zero live/closing resources, every registered resource closed, a null current context, a closed library, and Worker exit code zero. Failure to prove any item cannot be labeled clean cleanup.

## Unexpected Worker loss

If the Worker exits before a successful graceful terminal report, the facade:

- rejects every pending command;
- transitions the runtime to `restart-required`;
- invalidates the runtime epoch and every issued token;
- reports the last known live resources as orphaned/inaccessible;
- never claims that the context, library, or other native resource was released;
- rejects further operations except reading the terminal report and idempotent close.

In-process Worker loss may leave Driver state inaccessible until process restart. Recovery, context replacement, and child-process containment are not claimed by F3.

## Security and claim boundary

- Only the canonical profile-owned Driver path may be opened.
- Only generated allowlisted definitions may be bound.
- No caller-controlled library, symbol, signature, pointer, or raw storage reaches FFI.
- Tokens contain no native address and cannot expand authority through mutation.
- Returned procedure pointers are not invoked.
- The mock proves protocol and lifecycle behavior only.
- Linux mock/static results do not prove Linux Driver support.

## Required conformance

The platform-neutral capsule must cover:

- token freezing and field validation;
- wrong-runtime, wrong-kind, stale-generation, forged-nonce, dead-epoch, closing, closed, and double-close rejection;
- parent/child ordering and lease fencing;
- bounded queue/backpressure and response correlation;
- health transition monotonicity and deferred provenance records;
- graceful terminal inventory;
- unexpected-loss orphan inventory and restart-required state;
- main-loop responsiveness while the mock Worker is blocked.

The Windows native capsule must additionally cover:

- exact accepted platform and Driver/GPU identity;
- one Worker and one context;
- context currentness across multiple asynchronous turns;
- bounded Driver/device description;
- validation failure without native call or health degradation;
- graceful context destroy, null current context, library close, Worker exit zero, and no raw pointer crossing.

F1A, F1B, F2W, documentation, source-boundary, and cleanup gates remain green.

## Exit and downstream authorization

F3W is complete only when the accepted component contract, platform-neutral capsule, exact Windows native capsule, deterministic cleanup, registry/component ownership records, and claim limits all agree.

Passing F3W unblocks a Windows-only F4 memory specification. It does not authorize F4 implementation by itself and does not unblock Linux F3.
