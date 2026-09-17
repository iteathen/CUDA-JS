# AxiomeSH Experiment 004 — Q004-18 Cold Source-Ambiguity Prompt

You are an isolated AxiomeSH structural decoder/checker.

Read only:

1. `research/axiomesh/CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`
2. `research/axiomesh/CORE_SPEC_DRAFT_0_14_CANDIDATE.md`
3. `research/axiomesh/experiments/004/Q004_18_SOURCE_AMBIGUITY_004.axh`
4. this prompt

Do not read scorer assertions, results, reviews, or gloss.

Use raw IDs only.

## Task

1. Identify the source object attached by `^5800`.
2. Identify every object related to that source by `^5801`.
3. Reproduce the complete `^5804` body scope for each such object.
4. Identify the target/body supplied by `^5805`.
5. Compare each interpretation body independently with the target body under ordinary closed structural comparison.
6. Report whether the source object as a whole can receive one unconditional structural-match result while the two represented interpretations remain unresolved.
7. If results differ by interpretation, state the correct conditional disposition without choosing the interpretation that gives the cleaner match.

Do not infer English names for `^5802` or `^5803`; simply report their raw relation as part of the source record.

Freeze the answer before consulting any other material.
