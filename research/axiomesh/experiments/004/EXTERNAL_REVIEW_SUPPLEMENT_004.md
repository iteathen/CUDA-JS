# AxiomeSH Experiment 004 — External Review Supplemental Qualification

**Status:** frozen supplemental plan under Draft 0.15  
**Authority:** Draft 0.13 + Draft 0.14 + Draft 0.15  
**Origin:** isolated external review disposition `EXTERNAL_REVIEW_GEMINI_001_DISPOSITION.md`

The original twenty Experiment 004 targets remain frozen and keep their identities.

This supplement does **not** reopen the original scorer expectations. It adds eight narrowly targeted controls required by deterministic defects found after the original twenty-case suite was frozen.

No new structural class, domain operator, comparison relation kind, or irreducible primitive is introduced by this supplement.

## Supplemental targets

### Q004-S01 — reference-binding placement and arity preservation

Construct paired serializations showing:

- legal scope-level reference binding followed by uses;
- attempted reference binding in an ordered-edge position;
- attempted binding as a declarative operand.

Required qualification questions:

1. Is the legal binding a serialization directive occupying no semantic occurrence after N0?
2. Is the ordered-edge/formula placement rejected before semantic comparison rather than resolved by deleting a tuple/formula position?
3. Does N0 preserve ordered-edge arity for every valid input?

### Q004-S02 — rule-side splice versus nested scope construction

Use otherwise identical rules whose RHS differs between:

```text
[A] > [B C]
```

and:

```text
[A] > [[B C]]
```

with a target containing one direct `A` occurrence.

Required qualification questions:

1. Does the first rule produce direct `B` and `C` occurrences in the application scope?
2. Does the second produce one nested scope member containing `B` and `C`?
3. Does the same outer-container distinction hold for LHS matching?

### Q004-S03 — declarative variable ownership

Construct:

- a closed declarative object containing unowned `?0`;
- the same shape under an explicit quantifier/binder;
- an explicitly open schema/formula object whose interface owns `?0`.

Required result:

```text
unowned closed object -> invalid
explicitly bound object -> valid
explicitly owned open interface -> valid
```

No implicit universal/existential/wildcard interpretation is permitted.

### Q004-S04 — two-stage residual reconstruction

Construct a source-local D/extraction step followed by a pairwise common-core comparison.

Include:

- one exact source-side D edge;
- one lossy source-side projection edge;
- pairwise residuals distinct from D-local residual/loss.

Qualification must reconstruct:

```text
comparison-stage object from common core + pairwise accounting
```

and reconstruct the full source only through the exact source-local D witness.

The lossy branch must not claim full-source reconstruction.

### Q004-S05 — fingerprint validity across factorization stages

Provide one source with at least two qualified representation/factorization stages whose topology differs.

Test:

- fingerprint qualified only on raw stage;
- fingerprint qualified only on one factored stage;
- optional fingerprint whose invariant is explicitly proved across both stages.

Required result: stage-specific fingerprints cannot prune another stage unless the corresponding invariant is qualified there.

### Q004-S06 — infix parse determinism

Provide:

```text
A => B
A == B
A @@ B
A => B == C
A == B == C
A @@ B @@ C
```

Required result under Draft 0.15:

- single infix occurrence forms parse;
- un-delimited mixed/chained forms are rejected as ambiguous/invalid;
- ordinary `()` is not treated as transparent parser grouping.

Any nested semantic formula in the fixture must use explicit represented constructor structure rather than accidental parser parentheses.

### Q004-S07 — first-class NAC object versus matcher evaluation

Represent the same `!X` condition:

- as inert represented data/condition structure;
- inside an explicit matcher/pattern context with boundary/bindings;
- in a context whose profile forbids NAC placement.

Required result:

```text
NAC object existence != NAC evaluation
```

Evaluation requires explicit matcher authority; forbidden placement is profile validation, not an ambient query.

### Q004-S08 — canonical serialization/index algorithm scoping

Provide symmetric structures with multiple automorphisms and at least two deterministic serializer/index declarations using different legal tie-breaks.

Qualification must show:

- algorithm/revision is part of the canonical serialization/index record;
- differing canonical-looking strings do not imply structural non-isomorphism;
- equal/different hashes carry only the qualified invariant meaning of their exact algorithm/view/stage;
- serializer tie-break does not erase materially distinct automorphism witnesses.

## Isolation

Each supplemental cold run uses a fresh context and may read only:

- Draft 0.13;
- Draft 0.14;
- Draft 0.15;
- this supplement;
- the specific native fixture(s) named by its cold prompt;
- that cold prompt.

Scorer assertions, author audits, the external review report, disposition rationale, registry/catalog hints, and prior cold outputs remain hidden until output freeze.

## Execution order

```text
S01 / S02 / S03 / S06 / S07
-> S04 / S05 / S08
-> freeze outputs
-> unblind scorer assertions
-> classify discrepancies
```

The first group validates deterministic syntax/context boundaries needed to interpret the second group reliably.

## Promotion rule

A supplemental failure does not automatically justify syntax growth.

Classify first:

```text
parser/serialization defect
semantic ambiguity
representation expressiveness defect
comparison/discovery defect
fixture/protocol defect
decoder/search implementation error
non-defect / reviewer misunderstanding
```

Only a demonstrated representation expressiveness defect can reopen the irreducible-core question.