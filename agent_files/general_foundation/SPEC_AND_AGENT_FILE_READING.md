# Reading Specifications and Agent Files

## Discover the instruction chain

Start at the repository root and follow applicable nested agent files, current status/next step, owning ADR/specification, and exact task document. Explicit current owner instruction outranks repository documents.

## Applicability map

Classify documents as:

- governing;
- triggered supporting doctrine;
- adjacent context;
- rationale/provenance;
- superseded/archive;
- irrelevant to this task.

Not every document applies, but missing one material owner or boundary is worse than reading an extra index.

## Read in layers

1. Operating kernel: root rules, phase, exact task.
2. Owning authority: charter/ADR/specification.
3. Local mechanism: affected component/schema/plan sections.
4. Consequence horizon: callers, dependencies, lifecycle, failure, cleanup, compatibility.
5. Rationale/provenance only when a decision or contradiction requires it.

## Trigger and adjacency scan

Search for the boundary name, stable IDs, public terms, generated artifacts, callers, tests, status, plans, archive successors, and contradictory language. Read contiguous owning sections, not disconnected snippets.

## Final authority refresh

Before acceptance, reread the exact governing sections and current status/next step. Source or shared-contract changes invalidate derivative summaries and earlier applicability judgments.
