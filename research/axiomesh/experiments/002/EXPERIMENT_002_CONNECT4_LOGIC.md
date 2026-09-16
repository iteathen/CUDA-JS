# Experiment 002 — Connect4 Logic Corpus Render

**Branch:** `experiment/axiomesh-native-reconstruction`  
**Source repository:** `iteathen/Connect4`  
**Source branch:** `research/unified-knowledge`  
**Frozen source commit:** `0e5e29e4ca4fd3941bdcffe70a52b66348705589`  
**Status:** execution in progress

## Purpose

Render the normalized Connect4 structural-logic research corpus into native AxiomeSH Draft 0.1 without mutating or relocating the Connect4 research branch.

Connect4 is read-only source material for this experiment. Every experiment artifact, copied source snapshot, AxiomeSH render, oracle, test protocol and result belongs only on this CUDA-JS experimental branch.

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

Historical provenance and solver implementation are not copied as logical premises. Their normalized epistemic effect is retained through claim status, scope, guards, disposition and relations.

## Experiment question

Can the complete normalized Connect4 research graph be represented as one compact native AxiomeSH structural object while preserving every load-bearing research distinction needed to reconstruct the knowledge graph and continue structural reasoning?

## Required preservation

The render must preserve at least:

1. all 59 stable claim identities;
2. epistemic status for every claim;
3. guards and bounded scope where they change truth conditions;
4. claim-to-claim and claim-to-concept relations;
5. disproven/rejected/deferred distinctions without turning them into positive proof authority;
6. explicit missing-law and hypothesis status;
7. the central layer structure: geometry → residual/win-space → local certificates → guarded composition → semantic quotient → exact consequence/residual;
8. the separate perfect-play selection bridge around structural 28 versus distance-optimal terminal 28;
9. the concrete line-hit realizability gap (`C4-R0043`) as a refinement of the general composition gap;
10. the research-method distinction represented by `C4-R0035`.

## Native-render rule

`CONNECT4_LOGIC_002.axh` contains only raw AxiomeSH Draft 0.1 structure. English names and source prose are kept outside the native payload in scorer/oracle material.

The first render is a structural research-graph representation. It does not pretend that every natural-language theorem has already been compiled into an executable rewrite rule. Exactness/hypothesis/status distinctions are represented explicitly so a later formalization pass cannot silently promote empirical or conjectural material.

## Qualification layers

### Q1 — graph preservation

Machine/auditor comparison checks that every source claim, status, relation, guard/scope attachment and central-layer membership represented in the frozen render is recoverable.

### Q2 — cold reconstruction

A fresh decoder receives only Draft 0.1, the cold-decoder prompt, and `CONNECT4_LOGIC_002.axh`. It must reconstruct the claim graph without source prose or oracle access.

### Q3 — structural queries

A fresh agent must answer graph-native questions, including:

- Which nodes are missing laws?
- Which exact geometric claims feed the derivative semantic-lift gap?
- Which claims constrain or support the central composition gap?
- Which results distinguish structural 28 from optimal terminal 28?
- Which line-hit result exposes a realizability-preserving predecessor requirement?
- Which negative results constrain compatibility or selector candidates?

Queries are scored on structural identity, not English wording.

### Q4 — continuation/synthesis

Only after reconstruction qualifies do we test whether a fresh agent can continue the research from the AxiomeSH graph alone, identify the highest-leverage unresolved composition seam, and propose a structurally valid new candidate relation without promoting hypotheses to theorem status.

## Non-goals

- Do not mutate Connect4.
- Do not replace Connect4's canonical research authority.
- Do not claim AxiomeSH superiority from successful conversion alone.
- Do not treat source empirical results as deductive facts.
- Do not hide source-text meaning in a decoder prompt.

## Promotion rule

Experiment 002 results may motivate AxiomeSH spec changes, but no experiment artifact automatically becomes parent-branch specification authority.