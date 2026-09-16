# Experiment 002 — Connect4 Logic Corpus Render

**Branch:** `experiment/axiomesh-native-reconstruction`  
**Source repository:** `iteathen/Connect4`  
**Source branch:** `research/unified-knowledge`  
**Frozen source commit:** `0e5e29e4ca4fd3941bdcffe70a52b66348705589`  
**Status:** active specification-expansion experiment

## Purpose

Render the normalized Connect4 structural-logic research corpus into native AxiomeSH without mutating or relocating the Connect4 research branch.

Connect4 is read-only source material for this experiment. Every copied source snapshot, AxiomeSH render, candidate specification, oracle, test protocol, and result belongs only on this CUDA-JS experimental branch.

This experiment is also a language-development pressure test. The AxiomeSH specification is **not frozen** when the source exposes a genuine expressiveness gap. The correct response is to identify the minimum missing structural form, expand the experimental candidate specification, and retry the native render.

Draft 0.1 remains frozen only as the authority for Experiment 001.

## Source boundary

The source problem is the normalized logical research plane at the frozen commit, specifically:

- `research/canonical/CORE_MODEL.md`;
- all claim registries listed by `research/canonical/CLAIM_INDEX.json` (`C4-R0001..C4-R0059`);
- `research/canonical/CROSS_LINEAGE_SYNTHESIS.md`;
- `research/maps/CORE_LOGIC_MAP.md`;
- `research/open-questions/README.md`;
- `research/open-questions/COMPOSITION_AND_REPRESENTATION.md`;
- `research/open-questions/DERIVATIVE_SEMANTIC_LIFT.md`;
- `research/open-questions/WINSET_SELECTION.md`;
- `research/hypotheses/README.md`.

Historical provenance and solver implementation are not copied as new logical premises. Their normalized epistemic effect is retained through claim status, scope, guards, disposition, measurements, and relations.

## Experiment question

Can the complete normalized Connect4 research logic—not merely the metadata graph around its claims—be represented as one native AxiomeSH theory such that a fresh agent can recover the actual proposition structure and continue reasoning without source prose or a proposition oracle?

## Required preservation

The final native render must preserve at least:

1. all 59 stable claim identities;
2. the actual logical/formula content of all 59 claim bodies;
3. epistemic status for every claim;
4. exact numeric values as values rather than alpha-renamable identities;
5. quantification, implication, equality, negation, alternatives, and algebraic/set-valued structure where present;
6. guards and bounded scope where they change truth conditions;
7. claim-to-claim and claim-to-concept relations;
8. disproven/rejected/deferred distinctions without turning them into positive proof authority;
9. explicit missing-law and hypothesis status;
10. the central layer structure: geometry → residual/win-space → local certificates → guarded composition → semantic quotient → exact consequence/residual;
11. the separate perfect-play selection bridge around structural 28 versus distance-optimal terminal 28;
12. the concrete line-hit realizability gap (`C4-R0043`) as a refinement of the general composition gap;
13. the research-method distinction represented by `C4-R0035`.

## First render and discovered failure

The first `CONNECT4_LOGIC_002.axh` render successfully preserved the research graph topology but represented every claim body as an opaque proposition object whose source meaning remained in scorer/oracle material.

That artifact is now classified as a **structural graph prototype**, not a complete native logical render.

It demonstrated that Draft 0.1 lacked enough native distinction to encode the complete source corpus honestly.

The concrete language gaps and resulting changes are recorded in:

`SPEC_EXPANSION_002.md`

and implemented experimentally in:

`research/axiomesh/CORE_SPEC_DRAFT_0_2_CANDIDATE.md`

## Native-render rule

The replacement native payload must contain the proposition structure itself.

A scoring sidecar may map opaque semantic symbols to human-readable source terms, but it MUST NOT provide:

- theorem body structure;
- quantifier structure;
- implication direction;
- exact literal values;
- equality/negation structure;
- guards;
- logical alternatives;
- missing premises.

If removing the sidecar makes the logical proposition disappear, the native render is incomplete.

## Specification-growth rule

When a source proposition cannot be represented exactly:

1. identify the smallest load-bearing distinction that is missing;
2. determine whether it is domain-specific theory structure or a genuinely core representation need;
3. prefer theory structure when the distinction is not universal;
4. add a core form only when the same semantic distinction is required independently of the Connect4 domain;
5. record the motivating source cases;
6. rerender affected claims;
7. cold-test the expanded form before promotion.

Do not solve expressiveness failures by hiding semantics in an oracle, English prompt, adapter, or undocumented convention.

## Qualification layers

### Q0 — expressibility

Every normalized source claim must have an actual native formula structure. Any claim remaining opaque is a failure or explicit unresolved spec pressure.

### Q1 — graph preservation

Machine/auditor comparison checks that every source claim, status, relation, guard/scope attachment, exact literal, and central-layer membership represented in the frozen source is recoverable.

### Q2 — cold reconstruction

A fresh decoder receives only the candidate spec, the cold-decoder prompt, and the replacement native AxiomeSH theory. It must reconstruct the claim/formula graph without source prose or proposition oracle access.

### Q3 — structural queries

A fresh agent must answer native queries including:

- Which nodes are missing laws?
- What is the actual proposition asserted by each missing law?
- Which exact geometric claims feed the derivative semantic-lift gap?
- Which claims constrain or support the central composition gap?
- Which results distinguish structural 28 from optimal terminal 28?
- Which line-hit result exposes a realizability-preserving predecessor requirement?
- Which negative results constrain compatibility or selector candidates?
- Which numeric equalities are source theorems versus empirical observations?

Queries are scored on structural/logical identity, not English wording.

### Q4 — continuation/synthesis

Only after reconstruction qualifies do we test whether a fresh agent can continue the research from the AxiomeSH theory alone, identify the highest-leverage unresolved composition seam, and propose a structurally valid new candidate relation without promoting hypotheses to theorem status.

## Non-goals

- Do not mutate Connect4.
- Do not replace Connect4's canonical research authority.
- Do not claim AxiomeSH superiority from successful conversion alone.
- Do not treat source empirical results as deductive facts.
- Do not hide source-text meaning in a decoder prompt or scorer.
- Do not force every declarative theorem to become an operational rewrite.

## Promotion rule

Experiment 002 may produce candidate AxiomeSH specification changes, but no experiment artifact automatically becomes parent research authority.

Promotion requires:

```text
source pressure
-> minimal candidate form
-> complete native rerender
-> cold reconstruction
-> reasoning qualification
-> review of complexity and necessity
```

Only then should a candidate change move from the experiment branch to the parent AxiomeSH research specification.
