# SPEC-0015: Execution Scope and Status Clarification

**Status:** Accepted

**Date:** 2026-08-12

## Outcome

Clarify the interpretation of the accepted SPEC-0005 single-flight execution boundary so temporary phase/scope restrictions cannot drift into unintended project-wide architectural prohibitions.

This specification changes **no accepted F5 runtime behavior**. The currently accepted execution profile remains one DriverActor-owned private context, one private nonblocking stream, one in-flight launch, one private completion event, and terminal `launch()` resolution.

It changes only how that bounded profile may be interpreted when planning later capability families.

## Scope rule

In SPEC-0005, phrases including:

- “does not authorize concurrent launches”;
- “public streams/events rejected for F5W”;
- “multiple in-flight launches rejected”;
- “one private stream”;
- “only one launch may be submitted and observed at a time”;

are **F5 slice and accepted-profile boundaries**.

They mean that SPEC-0005 did not authorize or qualify broader execution behavior before the first trustworthy launch/completion vertical slice was proven.

They do **not** mean that CUDA-JS architecturally rejects:

- asynchronous submission/completion separation;
- opaque operation resources;
- multiple private streams;
- bounded multiple-in-flight operations;
- future public execution profiles that preserve CUDA-JS ownership and safety invariants.

An architectural rejection requires an explicit accepted decision saying the capability is rejected. Qualification/support language cannot create that decision by implication.

## Why the original F5 restriction remains valid

F5 deliberately minimized the first execution slice so CUDA-JS could prove:

- exact launch ABI and argument packing;
- one operation's resource leases through terminality;
- event-based completion;
- deferred-error handling with minimal causal ambiguity;
- timeout/restart-required truth;
- deterministic teardown;
- exact independent native-oracle parity.

Allowing multiple outstanding operations before those fundamentals were proven would have widened failure attribution, ordering, pressure, and lifecycle state prematurely. The restriction was therefore sound **for F5**.

## Current architectural disposition

Under current project-owner direction:

### Submission/completion separation

```text
architectural disposition: planned
implementation status: not implemented in accepted main
qualification status: not qualified
priority: next execution-lifecycle capability
coordination: issue #51
```

The intended first slice preserves `maxInFlight = 1` and one private stream while separating successful submission from later terminal completion. A new accepted operation-lifecycle specification is required before production implementation.

### Bounded multi-stream execution

```text
architectural disposition: planned
implementation status: not implemented in accepted main
qualification status: not qualified
priority: after submission/completion separation
coordination: issue #40
```

The intended direction is a bounded CUDA-JS-owned private stream pool and opaque operation scheduling, not raw public `CUstream`/`CUevent` handles. Its exact contract remains pending assessment/specification and must build on the operation lifecycle rather than duplicate it.

## Relationship to support claims

The current public release/profile may truthfully say:

> Multiple concurrent launches in one CUDA-JS runtime are not currently supported.

That statement means there is no current implemented-and-qualified public support for the capability. It does not alter the architectural disposition above.

## Supersession boundary

This clarification supersedes only interpretations that treat SPEC-0005's slice-local exclusions as permanent architectural rejection.

SPEC-0005 remains authoritative for the currently accepted F5 execution behavior until a later accepted execution specification explicitly widens or replaces a part of that behavior.

## Non-goals

- authorizing implementation directly from this clarification;
- weakening SPEC-0005 tests or native evidence;
- adding public raw streams/events;
- defining multi-stream scheduling details;
- defining sideband/mapped-memory semantics from issue #38;
- making performance claims;
- changing the one-DriverActor/one-private-context ownership default.
