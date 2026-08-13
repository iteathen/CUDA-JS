# SPEC-0003 Addendum: Resource Disposal Failure Provenance and Health

**Status:** Proposal

**Date:** 2026-08-13

**Issue owner:** #66

## Outcome

Amend accepted SPEC-0003 so a resource disposer/native cleanup failure preserves the structured failure category, observation operation and runtime health transition rather than being recategorized as an ordinary `stale-resource` token/state rejection.

All existing opaque-token, child-before-parent, lease, epoch and explicit-close rules remain unchanged.

## Problem

SPEC-0003 defines `stale-resource` as a token ownership/generation/state rejection whose health remains unchanged. A disposer failure is different: native cleanup may make the owning runtime suspect, poisoned or restart-required.

The current ResourceRegistry wrapper path can replace a structured disposer failure with `RESOURCE_DISPOSE_FAILED` categorized as `stale-resource`, losing the original health/provenance fields. That contradicts the accepted error/health meaning.

## Status dimensions

```text
architectural disposition: planned correction
implementation status:       current wrapper may lose structured disposal provenance
qualification status:        portable reproduction exists; destructive native cases not fully qualified
priority:                    active correctness/lifecycle repair
```

## Error ownership rule

A resource close has two logically separate failure layers:

```text
registry close context
  + underlying disposer/native failure
```

The registry may add bounded context such as resource kind/token state and `RESOURCE_DISPOSE_FAILED`, but it must not replace the underlying structured semantic category or health transition.

`stale-resource` is used only when the close request fails because the logical resource/token is stale, wrong-owner, wrong-generation, already closed or otherwise rejected before disposer/native cleanup work.

## Disposal failure envelope

A sanitized close failure must preserve bounded fields equivalent to:

```text
code/category of the underlying semantic failure
registryContextCode: RESOURCE_DISPOSE_FAILED (optional contextual wrapper)
resource kind / logical identity summary
observedAt operation
healthBefore
healthAfter
approved native status/name/description fields where allowed
cleanup disposition: failed | orphaned | unproved
cause summary without raw handle/path/pointer leakage
```

The public error shape may keep one stable top-level code for registry context only if callers can still observe the underlying category and health transition without inspecting a raw JavaScript `cause` object.

## Health propagation

After a disposer runs or partially runs, the DriverActor/runtime must read and publish the actual post-disposal health state produced by the owning native/semantic layer.

Examples:

- validation/stale token before disposer: health unchanged;
- recoverable cleanup failure whose semantics require caution: at least `suspect` if the owning overlay says so;
- invalid/destroyed context or severe native cleanup failure: `poisoned` when the owning overlay requires it;
- inaccessible ownership/Worker loss/unproved cleanup: `restart-required`;
- successful complete teardown: `closed` when aggregate close requirements pass.

The registry does not independently downgrade a stronger health transition.

## Resource state after failed disposal

A resource whose disposer failed cannot be reported `closed` merely because close was requested.

The registry records a truthful terminal/blocked state such as `orphaned` or another accepted failed-disposal state that prevents ordinary use and prevents slot/token reuse until the owning lifecycle contract permits it.

The facade must not leave the resource appearing normally open/retryable if the runtime has become poisoned/restart-required.

Repeated close behavior is deterministic:

- if no disposer/native work should be repeated safely, return the stored failed-disposal record;
- if an accepted owner explicitly permits bounded retry, the retry policy must be named and must preserve the first failure/provenance;
- repeated close never erases a stronger prior health transition.

## Cascade teardown

During registry-owned child-before-parent cascade:

- a child disposal failure is retained in aggregate inventory;
- parent cleanup proceeds only where the owning contract proves it remains safe;
- a severe child failure may stop further native cleanup and transition the runtime to restart-required;
- aggregate close cannot claim zero live/unproved resources when a child disposer failed;
- later wrapper errors do not overwrite the first material native/health divergence.

## Rollback cleanup paths

Any setup/admission path that creates native resources and then rolls back after a later failure must use the same disposal-failure envelope.

A primary operation failure and a rollback cleanup failure are both retained. The rollback failure cannot be swallowed merely to preserve the original error, and the original operation failure cannot be discarded merely because cleanup also failed.

A bounded combined failure record distinguishes:

```text
primaryFailure
cleanupFailures[]
resultingHealth
terminal/orphan inventory
```

with finite limits and sanitization.

## Worker/facade behavior

The DriverActor Worker and `DriverRuntime` facade consume the propagated category/health fields exactly as they do for direct native failures.

If failed disposal produces `poisoned` or `restart-required`, subsequent admission follows the accepted health gate and cannot continue as though a stale token error occurred.

Unexpected Worker loss remains governed by SPEC-0003 and cannot be converted into a disposer-success claim.

## Portable conformance

Tests must cover disposer functions that throw:

- structured `suspect`/immediate-driver failures;
- structured `poisoned` failures;
- structured `restart-required` failures;
- unstructured ordinary JavaScript errors;
- repeated close after each class;
- cascade close with one child failure;
- rollback with primary + cleanup failure;
- facade/runtime admission after health degradation;
- sanitization/no native-capability leakage.

The existing reproduced case where `restart-required` becomes `stale-resource` must become a fixed regression.

## Native promotion evidence

For material Windows native disposers, qualification must exercise safe negative paths where possible for:

```text
stream/event
module/function ownership boundaries as applicable
memory allocation
context
library/provider
```

Evidence must prove the observed cleanup call, structured category, health transition, facade admission result, terminal/orphan inventory and no false cleanup claim.

Destructive fault injection is not required where it would endanger the host; unavailable cases remain explicitly unqualified rather than simulated as native proof.

## Falsifiers / rollback

Do not accept an implementation that preserves only a nested `cause.message` while the public/runtime semantic category remains `stale-resource`.

Do not retry native disposal blindly after a failure whose ownership/health semantics are unproved.

Rollback is the existing accepted lifecycle with affected close paths treated conservatively as restart-required rather than continuing on a possibly poisoned owner.

## Non-goals

- changing stale-token semantics;
- automatic recovery of poisoned CUDA contexts;
- universal retry of failed native destroys/frees;
- exposing raw native handles/paths;
- claiming native negative-path coverage that was not safely executed.
