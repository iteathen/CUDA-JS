# SPEC-0026: Process-Isolated Driver and Compiler Execution

**Status:** Proposal

**Date:** 2026-08-13

**Issue owner:** #95

## Outcome

Define optional child-process DriverActor/CompilerActor backends with bounded IPC, process epochs and supervisor-controlled recovery so selected fatal native/compiler/provider failures can be contained from the application process where the operating system and NVIDIA stack permit.

Process isolation is a containment boundary, not a claim of universal GPU/Driver/firmware isolation or arbitrary-kernel preemption.

## Status dimensions

```text
architectural disposition: planned
implementation status:       not-implemented
qualification status:        not-qualified
priority:                    parallel prototype allowed; required before service-safe Device-JS
```

## Dependencies

This proposal preserves the public contracts of SPEC-0003 DriverActor, SPEC-0006 CompilerActor, SPEC-0016 operations and later accepted capability contracts.

SPEC-0022's service-safe profile requires this process boundary. Multi-device/process-per-GPU profiles may consume it but do not redefine its epochs/recovery semantics.

## Selected topology

```text
application process
  -> CUDA-JS supervisor
     -> Driver child process
        -> DriverActor owner thread/Worker or equivalent serialized owner
        -> private CUDA context/resources
     -> Compiler child process
        -> CompilerActor owner
        -> NVRTC/nvJitLink/providers/cache transaction staging
```

The first implementation may use one child per actor family or another finite topology selected by evidence. The topology is explicit in compatibility identity.

A child Node process has its own V8 isolate/address space except for the bounded IPC/OS resources intentionally shared. CUDA-JS does not rely on Worker-thread isolation as process fault containment.

## Supervisor ownership

The supervisor owns:

```text
child creation/executable identity
private IPC endpoints
process epoch/generation
authentication/capability token for messages
request/response bounds
per-child quotas
health/liveness checks
restart/circuit-breaker policy
shutdown/kill policy
evidence and orphan inventory
```

Only the supervisor may replace a child epoch.

## Child contract

A child exposes only the existing bounded logical actor commands and copied/sanitized results required by the selected profile.

It does not expose through IPC:

- raw pointers or CUDA handles;
- arbitrary FFI signatures/function names;
- provider/library paths outside accepted diagnostics;
- generated CUDA/source unless an accepted compiler diagnostic contract explicitly allows a bounded sanitized excerpt;
- OS handles not required by an accepted private transport.

Every request is schema/version/size validated before native work.

## Process epoch and stale capability rule

Every logical runtime/resource/operation/compiler capability created through a child includes the child process epoch internally.

After child exit, forced kill, unrecoverable IPC loss or supervisor-declared replacement:

- all old-epoch capabilities reject;
- no logical resource token is rebound to a new child/native object;
- a restarted child begins from a fresh empty native-resource epoch;
- retained public logical metadata may describe orphaned/unproved old resources but cannot resurrect them.

Epoch wrap/exhaustion behavior is explicit and fail closed.

## IPC

IPC is private, finite and backpressured.

A profile declares bounds for:

```text
message bytes
in-flight requests
per-request payload/result bytes
queued requests
attachment/buffer transfer sizes
response/diagnostic bytes
handshake time
operation deadlines used for supervision
```

No unbounded stdout/stderr/log stream is used as the protocol.

Node `child_process.fork()` or `spawn()` IPC is an implementation option, not the public contract. Serialization mode and transfer/copy semantics enter the profile/evidence identity where material.

Malformed/oversize/out-of-epoch messages fail closed.

## Startup and health handshake

A child is not admitted for native work until it proves a bounded startup handshake including:

```text
expected executable/package revision
Node/ABI identity
actor protocol version
provider/runtime readiness for the selected profile
fresh process epoch
no preexisting native-resource inventory
```

A restarted child cannot accept the next job merely because the OS process exists; it must pass independent health/readiness checks.

## Failure classes

The supervisor distinguishes at least:

```text
graceful child-reported failure
graceful child shutdown
unexpected process exit
forced supervisor kill
hung/unresponsive child
malformed IPC/protocol violation
native/provider crash contained to child
application-wide/Driver/GPU failure escaping containment
```

The exact observed process/IPC event is recorded separately from inferred native cause.

## Cleanup truth

Process termination does not prove graceful CUDA cleanup.

After graceful child close, CUDA-JS may report native resources closed only when the child completed the accepted cleanup protocol and returned terminal inventory evidence.

After crash/kill/loss:

- child address-space memory is OS-reclaimed;
- JavaScript/native process handles may be closed by the supervisor;
- CUDA/provider resources are recorded as inaccessible/orphaned/unproved unless the provider/OS contract independently establishes a stronger disposition;
- GPU reset is never inferred or automatically performed;
- the next child/job is health-gated.

Public reports must distinguish `OS-reclaimed process state` from `proved CUDA resource teardown`.

## Supervisor timeouts and kill

A supervisor deadline means the child failed to respond within the host policy. It does not prove the GPU operation stopped.

If policy permits killing the child:

1. mark affected child/runtime operations unproved;
2. stop admitting related work;
3. attempt the accepted child termination method;
4. record exit/kill observation;
5. preserve orphan/resource inventory;
6. perform independent Driver/device health checks before any restart;
7. open a new process epoch only if recovery policy permits.

A kill is not reported as operation cancellation success.

## Restart and circuit breaker

Restart is bounded by an explicit policy, for example maximum restarts per time window and terminal open-circuit state.

Repeated native/compiler crashes must not create an unbounded respawn loop.

Recovery policy states which failures permit:

```text
restart child only
restart all CUDA-JS children
require application restart
require host/operator intervention/device reset
```

Only evidence-backed distinctions are accepted.

## Cache transactions

Compiler/process isolation must not corrupt shared artifact caches on child death.

Writes use a transactional pattern equivalent to:

```text
produce into private temporary entry
validate/digest completely
atomically publish accepted cache entry
```

Partial/unvalidated entries from a dead child are never treated as cache hits. Cache namespace/provenance includes process-independent artifact identity rather than process-local handles.

## Resource quotas

The supervisor/child profile bounds:

- child count;
- child process memory where observable/configurable;
- native/resource quotas inherited from existing owners;
- compile/artifact/cache work;
- pending operations/IPC;
- restart rate;
- diagnostics/output.

Service/multi-tenant profiles may add stricter per-job/per-tenant quotas.

## Security

Private child entrypoints are not general shell execution.

- executable/module path is repository/package-owned and validated;
- ordinary callers cannot supply arbitrary command strings, environment variables, working directories or native provider paths;
- IPC is available only to the parent/supervisor as supported by the selected OS/Node profile;
- credentials/secrets are minimized and not serialized into diagnostics;
- child stdout/stderr is bounded/sanitized or retained privately according to evidence policy.

## Portable conformance

- startup/version/epoch handshake;
- bounded IPC/backpressure;
- stale old-epoch resource rejection;
- malformed/oversize message rejection;
- graceful close inventory;
- unexpected exit/forced kill/hang models;
- bounded restart/circuit breaker;
- partial cache-write rejection and validated publication;
- supervisor close while work is active;
- public sanitization.

Portable tests prove orchestration only.

## Native promotion evidence

On each exact promoted profile:

1. compare normal child-process behavior with the accepted in-process backend for equivalent bounded workloads;
2. induce a controlled Compiler child crash and prove application-process survival plus cache integrity;
3. induce a controlled Driver child failure/forced kill/hang where safely possible and record truthful orphan state;
4. prove all old-epoch capabilities reject after restart;
5. run independent device/Driver health checks before next-job admission;
6. prove restart is bounded and circuit breaker activates under repeated faults;
7. verify no raw native/source/path secrets cross public records;
8. prove graceful child close yields terminal resource inventory;
9. state explicitly which native/Driver/GPU failures escape process containment.

## Falsifiers / rollback

Do not accept a service-containment claim if child loss can silently revive capabilities, corrupt shared cache state or be misreported as graceful GPU cleanup.

Rollback is the accepted in-process Worker actor profile for trusted workloads.

## Non-goals

- universal kernel preemption;
- immunity to Driver/firmware/GPU crashes;
- automatic GPU reset;
- silent replay after unproved mutation;
- complete hardware tenant isolation;
- arbitrary child command execution;
- claiming OS process death equals CUDA cleanup.

## Primary references

- https://nodejs.org/api/child_process.html
- https://docs.nvidia.com/cuda/cuda-driver-api/
