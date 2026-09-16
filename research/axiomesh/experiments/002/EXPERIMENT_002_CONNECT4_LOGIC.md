# Experiment 002 — Connect4 Logic Corpus Render

**Branch:** `experiment/axiomesh-native-reconstruction`  
**Source repository:** `iteathen/Connect4`  
**Source branch:** `research/unified-knowledge`  
**Frozen source commit:** `0e5e29e4ca4fd3941bdcffe70a52b66348705589`  
**Status:** Draft 0.2 full native rerender complete; independent cold qualification pending

## Purpose

Render the normalized Connect4 structural-logic research corpus into native AxiomeSH without mutating or relocating the Connect4 research branch.

Connect4 is read-only source material for this experiment. Every copied source snapshot, AxiomeSH render, candidate specification, oracle, test protocol, audit, and result belongs only on this CUDA-JS experimental branch.

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

That artifact is retained as a **structural graph prototype**, not a complete native logical render.

It demonstrated that Draft 0.1 lacked enough native distinction to encode the complete source corpus honestly.

The concrete language gaps and resulting changes are recorded in:

`SPEC_EXPANSION_002.md`

and implemented experimentally in:

`research/axiomesh/CORE_SPEC_DRAFT_0_2_CANDIDATE.md`

## Draft 0.2 replacement render

The complete experimental replacement is:

`CONNECT4_LOGIC_002_DRAFT_0_2.axh`

It contains native bodies for all 59 normalized claims. The old opaque proposition placeholder range `5001..5059` is absent.

Associated author-side qualification artifacts are:

- `FORMALIZATION_AUDIT_002.json`;
- `FORMALIZATION_AUDIT_002.md`;
- `SEMANTIC_FIDELITY_REVIEW_002.md`;
- `SEMANTIC_SIGNATURE_002_DRAFT_0_2.json` — human-gloss/scoring sidecar only;
- `RESULTS_002.md`.

The replacement payload preserves the source graph around the bodies: all statuses, logical layers, 137 source claim relations, 23 guard attachments, 19 bounded-scope attachments, two deferred dispositions, the central flow, and ten first-class open seams.

## Native-render rule

The replacement native payload contains the proposition structure itself.

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

**Current state:** author-side PASS for all 59 claims.

### Q1 — graph and formula preservation

Machine/auditor comparison checks every source claim, status, relation, guard/scope attachment, exact literal, central-layer membership, and native body presence.

**Current state:** author-side PASS. See `FORMALIZATION_AUDIT_002.json` and `SEMANTIC_FIDELITY_REVIEW_002.md`.

### Q2 — cold reconstruction

A fresh decoder receives only:

1. `CORE_SPEC_DRAFT_0_2_CANDIDATE.md`;
2. `COLD_DECODER_PROMPT_002_DRAFT_0_2.md`;
3. `CONNECT4_LOGIC_002_DRAFT_0_2.axh`.

It must reconstruct the claim/formula graph without source prose, semantic glossary, proposition oracle, audit, result, issue, or Connect4 access.

**Current state:** pending independent execution.

### Q3 — structural queries

The same isolated decoder must answer the frozen raw-symbol structural probes in `COLD_DECODER_PROMPT_002_DRAFT_0_2.md`, including the `69/625` object, the three distinct missing laws, all structural roles of literal `28`, the `28=2+20+6` filtration, the rank/kernel formulas, the set-valued W/D/L recurrence, the `46-6=40` counterexample, and the derivative chain.

**Current state:** pending independent execution.

### Q4 — continuation/synthesis

Only after reconstruction qualifies do we test whether a fresh agent can continue the research from the AxiomeSH theory alone, identify the highest-leverage unresolved composition seam, and propose a structurally valid new candidate relation without promoting hypotheses to theorem status.

**Current state:** pending.

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
