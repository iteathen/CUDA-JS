# Experiment 002 — Connect4 Logic Corpus Render

**Branch:** `experiment/axiomesh-native-reconstruction`  
**Source repository:** `iteathen/Connect4`  
**Source branch:** `research/unified-knowledge`  
**Frozen source commit:** `0e5e29e4ca4fd3941bdcffe70a52b66348705589`  
**Status:** Draft 0.2 independently cold-qualified; Draft 0.3 scoping/signature tightening awaiting regression decode

## Purpose

Render the normalized Connect4 structural-logic research corpus into native AxiomeSH without mutating or relocating Connect4 research.

Connect4 is read-only source material. Every copied source snapshot, AxiomeSH render, candidate specification, oracle, test protocol, audit, and result belongs only on this CUDA-JS experimental branch.

Experiment 002 is also a language-development pressure test. When source logic exposes a genuine expressiveness or reconstruction gap, the experimental AxiomeSH candidate may grow minimally and must then be cold-tested again.

Draft 0.1 remains frozen as Experiment 001 authority. Draft 0.2 remains frozen as the version independently decoded in issue #267.

## Source boundary

The frozen source problem is the normalized Connect4 research plane at the source commit, including:

- `research/canonical/CORE_MODEL.md`;
- all claim registries named by `research/canonical/CLAIM_INDEX.json` (`C4-R0001..C4-R0059`);
- `research/canonical/CROSS_LINEAGE_SYNTHESIS.md`;
- `research/maps/CORE_LOGIC_MAP.md`;
- `research/open-questions/README.md`;
- `research/open-questions/COMPOSITION_AND_REPRESENTATION.md`;
- `research/open-questions/DERIVATIVE_SEMANTIC_LIFT.md`;
- `research/open-questions/WINSET_SELECTION.md`;
- `research/hypotheses/README.md`.

Historical provenance and solver implementation are not copied as new logical premises. Their normalized epistemic effect is retained through status, scope, guards, disposition, measurements, and claim relations.

## Experiment question

Can the complete normalized Connect4 research logic be represented natively such that an isolated agent can recover the actual proposition structure, preserve epistemic distinctions, reason over the structural graph, and continue the research without source prose or proposition oracles?

## Required preservation

The native theory must preserve:

1. all 59 claim identities;
2. all 59 actual claim bodies;
3. epistemic status for every claim;
4. exact numeric values as literals rather than alpha-renamable identities;
5. quantification, implication, equality, negation, alternatives, and algebraic/set structure where present;
6. guards and bounded scopes;
7. all source claim relations;
8. disproven/rejected/deferred distinctions without promoting them;
9. all explicit missing-law and hypothesis objects;
10. the central logical layer flow;
11. structural `28`, terminal `28`, W/D/L `61`, 6x7 `30`, and 8x7 `40` as distinct objects;
12. the line-hit realizability gap `R0043`;
13. the optimal-selection bridge `R0052`;
14. the research-method separation in `R0035`.

## Render lineage

### Draft 0.1 graph prototype

`CONNECT4_LOGIC_002.axh`

Preserves research topology but not proposition bodies. Retained as failed/full-logic evidence and structural prototype only.

### Draft 0.2 full proposition render

`CONNECT4_LOGIC_002_DRAFT_0_2.axh`

Carries the complete 59-body native logical corpus and the surrounding research graph.

Author-side artifacts:

- `FORMALIZATION_AUDIT_002.json`;
- `FORMALIZATION_AUDIT_002.md`;
- `SEMANTIC_FIDELITY_REVIEW_002.md`;
- `SEMANTIC_SIGNATURE_002_DRAFT_0_2.json` — reviewer glossary only;
- `RESULTS_002.md`.

## Independent Draft 0.2 result — issue #267

Issue #267 is independent cold-decoder evidence.

The decoder received only:

1. `CORE_SPEC_DRAFT_0_2_CANDIDATE.md`;
2. `COLD_DECODER_PROMPT_002_DRAFT_0_2.md`;
3. `CONNECT4_LOGIC_002_DRAFT_0_2.axh`.

It recovered all 59 native formulas and the frozen corpus/graph counts, then passed every structural probe.

This establishes Q2 and Q3 for Draft 0.2 on the exercised surface.

The run also exposed one actual ambiguity and one representation-boundary question:

- Draft 0.2's wording around variable-number reuse was not explicitly lexical;
- theory signature membership was not itself represented as native structure.

Those findings drive Draft 0.3.

## Draft 0.3 tightening

Artifacts:

- `CORE_SPEC_DRAFT_0_3_CANDIDATE.md`;
- `SPEC_TIGHTENING_003.md`;
- `SEMANTIC_SIGNATURE_002_DRAFT_0_3.axh`.

Draft 0.3 does **not** rewrite the qualified 59 formula bodies.

It adds only:

### Explicit lexical variable scope

- binders own variables only in their lexical term;
- disjoint sibling binders may reuse variable numbers;
- separate formulas may reuse variable numbers;
- nested rebinding of a visible number is forbidden;
- capture-free alpha-renaming is valid.

### Native signature closure

Core-reserved marker `^0` declares the theory-owned semantic-symbol inventory:

```text
[
  (^0 [
    ^1
    ^2
    ...
  ])
]
```

The human JSON glossary is no longer the only record of signature membership.

English labels remain non-semantic and are deliberately not added to canonical core. A primitive theory symbol may be human-opaque while still being formally complete and natively usable.

## Qualification layers

### Q0 — expressibility

Every normalized claim must have actual native formula structure.

**Draft 0.2:** PASS author-side for all 59 claims.

### Q1 — preservation

Every source status, relation, guard/scope attachment, exact literal, central-layer relation, and formula body must survive the native render.

**Draft 0.2:** PASS author-side.

### Q2 — isolated cold reconstruction

A fresh decoder must recover the corpus without source prose, oracle, human glossary, audit, results, issues, or Connect4 access.

**Draft 0.2:** PASS in issue #267.

### Q3 — native structural queries

The isolated decoder must answer the frozen probes directly from native structure.

**Draft 0.2:** PASS in issue #267.

### Q3b — Draft 0.3 closure regression

A fresh decoder receives only:

1. `CORE_SPEC_DRAFT_0_2_CANDIDATE.md`;
2. `CORE_SPEC_DRAFT_0_3_CANDIDATE.md`;
3. `COLD_DECODER_PROMPT_002_DRAFT_0_3.md`;
4. `SEMANTIC_SIGNATURE_002_DRAFT_0_3.axh`;
5. `CONNECT4_LOGIC_002_DRAFT_0_2.axh`.

It must establish:

- claim `1017` has one unambiguous lexical interpretation;
- every theory-owned `^n` used by the formula payload is declared;
- no undeclared semantic symbol is needed;
- the human glossary is unnecessary for formal reconstruction and probes;
- previously passed structural probes still pass.

**Current state:** pending.

### Q4 — continuation/synthesis

After Q3b, a fresh agent reasons only from the native theory bundle and attempts useful continuation without promoting hypotheses or empirical claims.

**Current state:** pending.

## Specification-growth rule

When a source proposition or cold decode exposes a load-bearing gap:

1. isolate the smallest missing distinction;
2. determine whether it belongs in domain theory structure or universal core;
3. prefer domain structure when possible;
4. change core only when the distinction is representation-general;
5. preserve the motivating counterexample;
6. rerun cold qualification;
7. do not hide the distinction in an oracle, adapter, English prompt, or undocumented convention.

## Non-goals

- Do not mutate Connect4.
- Do not replace Connect4 canonical research authority.
- Do not claim AxiomeSH superiority from conversion success.
- Do not make English naming mandatory for agent-native semantics.
- Do not turn empirical/hypothetical material into theorem authority.
- Do not force declarative formulas to become operational rewrites.

## Promotion rule

Candidate spec changes may move to the parent research branch only after:

```text
source/cold-decode pressure
-> minimal candidate change
-> native rerender or closure proof
-> isolated reconstruction
-> structural reasoning qualification
-> complexity/necessity review
```
