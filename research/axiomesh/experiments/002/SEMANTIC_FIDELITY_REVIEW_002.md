# Experiment 002 — Draft 0.2 Semantic Fidelity Review

**Source:** read-only `iteathen/Connect4@0e5e29e4ca4fd3941bdcffe70a52b66348705589`  
**Working branch:** `experiment/axiomesh-native-reconstruction`  
**Payload:** `CONNECT4_LOGIC_002_DRAFT_0_2.axh`  
**Candidate spec:** `../../CORE_SPEC_DRAFT_0_2_CANDIDATE.md`

## Purpose

This review checks the replacement Draft 0.2 payload against the copied normalized Connect4 source semantics. It is separate from structural counting: the question is whether the source's load-bearing logical distinctions are actually present in the native formulas rather than merely represented by claim IDs or metadata.

## Result

All 59 normalized claims now contain native formula bodies. No claim is represented only by an opaque proposition placeholder.

The review confirms direct native representation of the highest-risk source structures that forced the Draft 0.2 expansion:

- guarded implication and exact terminal consequences (`R0003`, `R0004`, `R0009`, `R0040`);
- exact arithmetic and literal-valued identities (`R0014`, `R0015`, `R0050`, `R0051`, `R0053`, `R0054`, `R0057..R0059`);
- explicit counterexamples and negated overclaims (`R0017`, `R0031`, `R0037`, `R0055`);
- empirical counts and approximate measurements without promotion to theorem status (`R0016`, `R0019..R0030`, `R0036`, `R0038..R0045`, `R0048`, `R0049`, `R0056`);
- set/product/antichain structure (`R0023..R0026`, `R0042`, `R0046`, `R0047`);
- existential/universal game-choice requirements in the line-hit realizability gap (`R0043`);
- the distinction among W/D/L-only terminal support `61`, distance-optimal terminal support `28`, and structural common-core dimension `28` (`R0048..R0052`, `R0056`);
- the exact `28 = 2 + 20 + 6` filtration (`R0056`);
- the Connect-K `v2(K)` multiplicity formula, K=4 diagonal relations, and seven-mode regular-board cokernel (`R0057..R0059`).

The copied source relations, guards, scopes, dispositions, epistemic statuses, logical layers, and open seams remain attached around those bodies.

## Source precision handling

Where the source says a quantity is approximate, the native body uses a theory-level approximate-equality relation rather than core equality. Exact counts and exact theorem values use exact literals and equality.

Where the source explicitly limits a result to a corpus, board, workload, implementation form, or oracle convention, that limitation is retained through native formula structure, scope metadata, explicit negation of an overclaim, or a combination of those forms.

Disproven and rejected objects remain first-class propositions with negative epistemic status. They are not deleted and are not made executable proof authority.

## High-risk bridge checks

### `R0011` — general composition gap

The body states that local exact predicates are not sufficient for a complete derivation system and that composition and closure laws are required. It remains distinct from all later refinements.

### `R0043` — line-hit realizability gap

The body preserves the two line-hit mask objects, rejects arbitrary-pair legality, records support-local correlation, and requires compact support for move preimage, terminal subtraction, existential move composition, and universal move composition without reconstructing ownership assignments.

### `R0052` — optimal-selection bridge

The body separately records the currently unproved center/deadline obligations, keeps structural `28` and optimal terminal `28` as distinct equal-valued objects, and represents deadline-valued CPC/NDC as a candidate mechanism rather than as an established theorem.

## What this review does not prove

This is still author-side evidence. It does not establish that:

- a fresh agent parses every formula exactly as intended;
- Draft 0.2 is the smallest or best representation;
- every theory symbol's intended human gloss is inferable without a scoring signature;
- the represented Connect4 research claims are themselves true beyond their source epistemic status;
- AxiomeSH improves reasoning, token cost, latency, or synthesis versus a baseline.

Those are separate qualification questions.

## Semantic-symbol boundary

The native payload contains formula structure and stable semantic-symbol identity. `SEMANTIC_SIGNATURE_002_DRAFT_0_2.json` is a scorer/reviewer glossary only. It supplies human gloss for stable symbols but contains no claim formula bodies.

This means the cold reconstruction test can verify formula structure without proposition text. A later semantic-continuation test must distinguish reasoning over the native formal theory from human-readable glossing of its vocabulary.

## Disposition

Author-side qualification status:

```text
Q0 expressibility: PASS on all 59 normalized claims
Q1 structural preservation: PASS by FORMALIZATION_AUDIT_002.json
source-to-native semantic review: PASS with the qualification above
Q2 independent cold reconstruction: PENDING
Q3 native structural reasoning probes: PENDING
Q4 continuation/synthesis: PENDING
```

No Connect4 repository state was modified by this review.
