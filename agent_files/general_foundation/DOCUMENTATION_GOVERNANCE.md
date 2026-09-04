# Documentation Governance

## Status and authority

Every durable document states or inherits a clear document status: accepted, proposal, research note, informational, superseded, or active operational state. Plans, research, experiments, summaries, issues and archives do not silently become authority.

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

### Designated current-state owners

CUDA-JS deliberately separates current-state facts so no document must be a self-referential dashboard:

- exact protected branch/commit/tree identity is **remote repository truth** and is read back from GitHub when required;
- package name/version is owned by `package.json`;
- public compatibility/capability projection is owned by `packaging/compatibility-manifest.json` and its owning component facts;
- `STATUS.md` plus `next_step.yaml` own the current execution seam, blocker class, and next coherent action;
- hardware/Node support documents and qualification registries/evidence own exact-profile support claims;
- issues own durable obligations, explicit blocked gates, and concrete qualification/evidence cells.

Do not encode a field named or functioning as a self-updating `current_main`/`current_main_tree` inside a commit that would have to change itself to remain true. When an exact protected SHA/tree is needed in a candidate transaction, record it explicitly as **recorded protected input / transaction provenance** and read back the resulting protected SHA/tree after integration.

Durable agent instructions are process/ownership authority. They must not carry a dated package, SHA, capability or current-workstream snapshot phrased as live state. Historical evidence anchors may remain, but must be labeled as provenance and point agents to the designated current-state owners.

## Current-state recurrence gate

`scripts/current-state-contract.mjs` is the local mechanical validator for facts that can be checked without creating a second semantic authority. `scripts/verify-docs.sh` runs both its adversarial tests and the live repository check.

The validator must remain narrow. It checks relationships between existing owners rather than inventing new capability truth. At minimum it rejects:

- package identity disagreement among `package.json`, `next_step.yaml`, the compatibility manifest and `STATUS.md`;
- public API schema disagreement between `next_step.yaml` and the compatibility manifest;
- missing/invalid current-focus issue fields or a `STATUS.md` that does not name the same focus;
- reintroduction of self-referential live-SHA field names such as `current_main` / `current_main_tree`;
- durable agent entry points that reintroduce retired live-dashboard headings instead of the required live-state routing language.

A capability/specification status transition can require additional owner-specific validation. This generic gate does not decide whether a capability is accepted, implemented, qualified, or prioritized; it only prevents designated projections from silently disagreeing.

## Issue disposition rules

GitHub issue state is coordination, not architecture. Use these administrative dispositions consistently:

- **open / active implementation or governance:** a concrete actionable unit exists now;
- **open / blocked:** the obligation is concrete and has a named unblock condition;
- **open / evidence cell:** implementation may already exist, but a specific external/native/operational proof is still required;
- **closed / completed:** the named implementation/governance obligation is complete; unspecified future platform cells move to qualification campaigns rather than keeping the implementation issue open forever;
- **closed / not planned:** a dormant possibility has no active consumer/profile/measurement; this does not mean architectural rejection;
- **closed / superseded or duplicate:** preserve the exact successor and provenance so the old tracker cannot compete with the current owner.

When protected integration materially changes the dependency-ready leaf, reconcile `STATUS.md`, `next_step.yaml`, the affected issue disposition/dependency comments, and any generated/public projection before starting the next semantic/native transaction. An ordinary commit that does not change the execution seam does not require issue churn merely to refresh a SHA.

## Discoverability

Root entry points lead to the charter, decisions, specifications, architecture, research/source register, plans, experiment protocols, status, next step, compatibility and qualification surfaces. Stable IDs and terminology are consistent across documents.

## Change coherence

A material documentation or capability-state change reconciles affected:

- authority and document status markers;
- capability status dimensions;
- indexes and registry;
- public terminology and ownership;
- callers/dependencies and interoperability;
- package/compatibility projection when applicable;
- status, next step and issue disposition when the execution seam changes;
- archive/supersession record;
- validation rules and claim limits.

## Stale material

Do not delete useful history silently. Archive with original date/location, reason, successor, and removal context. Historical exact SHA/evidence may remain in issue comments, PRs and archives, but must not masquerade as current protected state.

## Documentation-only phases

Documentation may define future work without authorizing it. Use explicit phase gates and source-boundary validation to prevent plans, experiment descriptions, placeholders, or workflows from becoming accidental implementation.
