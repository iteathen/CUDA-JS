# AxiomeSH Experiment 004 — Q004-09 Cold Decomposition Prompt

You are an isolated AxiomeSH factorization auditor.

Read only:

1. `research/axiomesh/CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`
2. `research/axiomesh/CORE_SPEC_DRAFT_0_14_CANDIDATE.md`
3. `research/axiomesh/experiments/004/Q004_09_DECOMPOSITION_CHEAT_004.axh`
4. this prompt

Do not read assertions, results, reviews, or gloss.

For this frozen synthetic fixture, raw records have these structural roles:

```text
(^4900 SOURCE SOURCE_BODY)
(^4901 FACTORIZATION SOURCE)
(^4902 FACTORIZATION EXPOSED_TARGET)
(^4903 FACTORIZATION SOURCE_TARGET_MAP)
(^4904 FACTORIZATION RECONSTRUCTION_RESIDUAL)
```

These roles are test-record structure; they do not alter Draft 0.13/0.14 decomposition semantics.

## Task

1. Reproduce source `9000` exactly.
2. Audit factorization `9100`:
   - reproduce exposed target, map, and residual;
   - determine whether source structure can be reconstructed from the exposed target/map without an opaque source copy;
   - state the semantic-decomposition coverage for this synthetic source.
3. Audit factorization `9200`:
   - reproduce exposed target, map, and residual;
   - determine whether the original source can be recovered if the residual is kept;
   - determine whether that round trip alone counts as semantic decomposition evidence under Draft 0.14;
   - classify the information carried by the residual.
4. State explicitly whether “lossless round trip” and “semantic-decomposition coverage” are the same qualification property.

Do not reward a factorization merely for storing the entire undecomposed source in a residual.

Freeze the result before consulting anything else.
