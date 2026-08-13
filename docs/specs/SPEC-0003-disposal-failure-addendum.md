# SPEC-0003 Addendum: Resource Disposal Failure Provenance and Health

**Status:** Accepted

**Date:** 2026-08-13

**Accepted after portable defect reproduction and authority review on:** `5233a046c57813532a71763bb36cdba5894e43e0`

**Issue owner:** #66

## Outcome

Amend accepted SPEC-0003 so a resource disposer/native cleanup failure preserves the structured semantic category, observation operation and runtime health transition rather than being recategorized as an ordinary `stale-resource` token/state rejection.

This accepted addendum authorizes the bounded ResourceRegistry/DriverActor/facade correction and regression work described below. Native destructive cleanup cases remain independently qualified.

All existing opaque-token, child-before-parent, lease, epoch and explicit-close rules remain unchanged.

## Problem

SPEC-0003 defines `stale-resource` as a token ownership/generation/state rejection whose health remains unchanged. A disposer failure is different: native cleanup may make the owning runtime suspect, poisoned or restart-required.

On the reviewed implementation baseline, `ResourceRegistry.close()` can replace a structured disposer failure with `RESOURCE_DISPOSE_FAILED` categorized as `stale-resource`, retaining only a shallow cause summary. That loses the original semantic category and `healthBefore`/`healthAfter`, so DriverActor/facade admission can observe the wrong health meaning.

## Status dimensions

```text
architectural disposition: selected correction
implementation status:       authorized, current implementation still loses structured disposal provenance
qualification status:        portable defect reproduced; destructive native partitions remain exact-profile evidence work
priority:                    active correctness/lifecycle repair
```

## Error ownership rule

A resource close has two distinct failure layers:

```text
registry operation context
  + underlying disposer/native semantic failure
```

The registry owns the stable public/context code `RESOURCE_DISPOSE_FAILED`. It does **not** own permission to replace the underlying category, observation site, health transition or approved native details.

`stale-resource` is used only when the logical close request is rejected before disposer/native cleanup work because the capability/token is stale, wrong-owner, wrong-generation, already closed, or otherwise invalid under the ordinary resource-state contract.

## Exact disposal-failure envelope

When a disposer throws, the outward normalized error is:

```text
code:         RESOURCE_DISPOSE_FAILED
category:     underlying semantic category
operation:    underlying observation operation when present, otherwise resource.close
healthBefore: underlying healthBefore when present
healthAfter:  underlying healthAfter when present
```

and bounded sanitized `details` retain registry context equivalent to:

```text
resourceKind
resourceState
disposition: orphaned | unproved
causeCode
causeCategory
causeOperation
approved cause details/native status fields
```

The original structured semantic fields must be observable directly from the normalized error. Callers must not need to inspect an arbitrary JavaScript `cause` object to discover that cleanup poisoned the owner or requires restart.

The raw thrown object, native pointer/handle, provider path, stack path, account/host details and unbounded diagnostic text are not copied into public `details`.

### Structured disposer failure

If the disposer throws an accepted structured CUDA-JS/native error, preserve its category, operation and health transition exactly unless a higher accepted owner explicitly strengthens the health consequence. The registry never downgrades them.

### Unstructured disposer failure

If the disposer throws an unstructured ordinary JavaScript error after disposer execution began, cleanup terminality is unproved. Normalize conservatively as:

```text
code:      RESOURCE_DISPOSE_FAILED
category:  restart-required
operation: resource.close
```

with a bounded sanitized cause name/message/code summary and `disposition: unproved`.

The owning DriverActor/runtime must enter its restart-required admission path; an unstructured disposal exception cannot be treated as a harmless stale token.

## Health propagation

After a disposer runs or partially runs, DriverActor/runtime publishes the actual post-disposal health from the owning semantic/native layer.

Examples:

- stale/invalid logical token before disposer: health unchanged;
- structured recoverable cleanup failure: preserve the exact accepted `suspect`/other health transition;
- invalid/destroyed context or severe cleanup failure: preserve `poisoned` where the owning overlay requires it;
- inaccessible ownership, Worker loss or unstructured/unproved disposer completion: restart required;
- successful complete aggregate teardown: `closed` only when all owned resources reach terminal disposition.

The registry cannot replace a stronger health consequence with a weaker one.

## Resource state after failed disposal

A resource whose disposer failed is never reported `closed`.

The registry marks the logical record `orphaned` (or the existing exact equivalent used by the registry state model), preserves its generation/token as non-reusable, and stores the normalized failed-disposal record.

The resource becomes unusable for ordinary work. It is not presented as safely retryable/open merely because the disposer threw before `close()` returned.

### Repeated close

Repeated close after a failed disposer performs **no new disposer/native work by default**. It returns/throws the stored normalized `RESOURCE_DISPOSE_FAILED` result deterministically.

A future resource-specific bounded retry requires separate accepted semantics proving retry safety. Retry is not inferred from an idempotent-looking native destroy/free name.

Repeated close never erases the first material disposal failure or a stronger health transition.

## Cascade teardown

During registry-owned child-before-parent cascade:

- each child disposal failure is retained in bounded aggregate inventory;
- a parent is disposed only where the owning contract proves that continuing cleanup remains safe;
- a restart-required/poisoned child failure may stop further native cleanup rather than compound uncertainty;
- aggregate close cannot claim zero live/unproved resources when a child disposer failed;
- later wrapper/cascade errors do not overwrite the first material native/health divergence;
- any resources skipped because cleanup became unsafe are reported orphaned/unproved rather than silently closed.

## Rollback cleanup paths

Any setup/admission path that creates resources and then rolls back after a later failure uses this same disposal-failure model.

A primary failure and one or more cleanup failures are independently retained in a bounded combined failure product equivalent to:

```text
primaryFailure
cleanupFailures[]
resultingHealth
terminal/orphan inventory
```

Rules:

- do not swallow cleanup failure merely to preserve the primary error;
- do not discard the primary semantic failure because rollback also failed;
- cap the cleanup-failure list under existing diagnostic/request bounds;
- sanitize every retained entry;
- the resulting health is at least as severe as the strongest accepted constituent transition.

## Worker and facade behavior

The DriverActor Worker and `DriverRuntime` facade consume disposal error category/health exactly as for direct native errors.

If disposal yields `poisoned` or `restart-required`, subsequent admission is blocked under the accepted health gate. The application cannot continue native work merely because the top-level registry code is `RESOURCE_DISPOSE_FAILED`.

Facade resource objects reflect the logical orphaned/unusable state after close failure and expose the normalized error. They do not remain apparently open for ordinary operations.

Unexpected Worker loss remains governed by SPEC-0003 and cannot be converted into a disposer-success claim.

## Portable conformance

The implementation must cover disposer functions that throw:

- structured validation/stale error before any disposer work as the unchanged control;
- structured `immediate-driver`/suspect failure;
- structured poisoned failure;
- structured `restart-required` failure;
- unstructured ordinary JavaScript error after disposer entry;
- repeated close after every failed-disposal class with proof that disposer call count does not increase;
- cascade close with one child failure and retained orphan inventory;
- rollback with primary + cleanup failure;
- DriverActor/facade admission after health degradation;
- facade resource unusability after failed close;
- bounded sanitization/no native-capability leakage.

The reproduced regression in which a `restart-required` disposer error becomes `stale-resource` must fail on the old implementation and pass on the corrected one.

## Native promotion evidence

For material Windows native disposers, qualification must exercise safe negative paths where possible for:

```text
stream/event
module/function ownership boundaries as applicable
memory allocation
context
library/provider
```

Evidence records the exact cleanup call/observation site, normalized category, health transition, facade admission result, terminal/orphan inventory and absence of a false cleanup claim.

Destructive fault injection is not required where it would endanger the host. Unexecuted destructive partitions remain explicitly unqualified rather than being replaced with mock/native-support claims.

## Falsifiers / rollback

Do not implement this addendum by retaining only `cause.message` while leaving the outward semantic category as `stale-resource`.

Do not retry native disposal blindly after a failure whose ownership/health semantics are unproved.

If the implementation cannot preserve structured provenance safely, the conservative rollback is to classify affected disposal failure as restart-required and stop further native admission rather than continuing against a possibly poisoned owner.

## Non-goals

- changing ordinary stale-token semantics;
- automatic recovery of poisoned CUDA contexts;
- universal retry of failed native destroys/frees;
- exposing raw native handles/paths;
- claiming native negative-path coverage that was not safely executed;
- making registry context replace semantic native/error authority.
