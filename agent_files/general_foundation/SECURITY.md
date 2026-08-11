# Security Foundation

## Capability containment

Expose the minimum authority required. Do not expose raw pointers, arbitrary native calls, unchecked executable schemas, foreign-library handles, unrestricted memory views, or private credentials through ordinary APIs.

## Native inputs

Pin and identify headers, schemas, generators, libraries, providers, artifacts, options, and platform profiles. Validate bounds, alignment, types, ownership, generations, states, and allowed symbols before native use. Unknown semantics fail closed.

## Resource isolation

Define thread/process/context ownership, in-flight leases, cancellation, teardown, stale-handle rejection, context-health transitions, and restart requirements. Finalizers are not authoritative cleanup.

## Supply chain and provenance

Third-party implementation requires exact revision, license, explicit reuse decision, security review proportional to capability, and donor-artifact disposition. Generated artifacts require reproducible identity and corruption rejection.

## Secrets and incidents

Never commit secrets or place them in logs, evidence, prompts, fixtures, or artifacts. If exposure is possible, revoke or rotate; deletion alone is insufficient. Preserve bounded incident evidence and inspect downstream copies.

## Claims

Security claims are profile- and threat-model-specific. Mocks, static review, or successful execution cannot establish native isolation or exploit resistance without the applicable evidence.
