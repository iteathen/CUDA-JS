# Documentation Governance

## Status and authority

Every durable document states or inherits a clear document status: accepted, proposal, research note, informational, superseded, or active operational state. Plans, research, experiments, summaries, and archives do not silently become authority.

Document authority/status is separate from the status of a capability described inside the document.

## Capability status semantics

Use [`STATUS_SEMANTICS.md`](STATUS_SEMANTICS.md) whenever a document tracks capability state.

Architecture, implementation, qualification/support, and priority are independent dimensions. A status word may describe only its named dimension; it must not be used to infer another dimension.

In particular:

- `not-qualified`, `unsupported`, or historical `no-support` does not mean architecturally rejected;
- `does not authorize` and `out of scope` are local scope statements, not project-wide rejections;
- `deferred` does not mean rejected;
- a verified negative result applies only to the exact profile/evidence it names;
- an architectural rejection requires explicit accepted rationale.

Ambiguous legacy wording is stale terminology. Report and reconcile it rather than silently choosing an interpretation.

## One owner, one location

A durable truth has one authoritative location. Indexes and summaries link rather than duplicate. Update the ownership registry when boundaries move or change status.

## Discoverability

Root entry points lead to the charter, decisions, specifications, architecture, research/source register, plans, experiment protocols, status, and next step. Stable IDs and terminology are consistent across documents.

## Change coherence

A material documentation change reconciles affected:

- authority and document status markers;
- capability status dimensions;
- indexes and registry;
- public terminology and ownership;
- callers/dependencies and interoperability;
- plans, experiment protocols, status, next step;
- archive/supersession record;
- validation rules and claim limits.

## Stale material

Do not delete useful history silently. Archive with original date/location, reason, successor, and removal context. Archived material is non-authoritative.

## Documentation-only phases

Documentation may define future work without authorizing it. Use explicit phase gates and source-boundary validation to prevent plans, experiment descriptions, placeholders, or workflows from becoming accidental implementation.
