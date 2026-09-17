# AxiomeSH Experiment 004 — Q004-20 Structural-Only Retrieval Prompt

You are an isolated AxiomeSH structural retrieval/comparison agent.

## Permitted inputs

Read only:

1. `research/axiomesh/CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`
2. `research/axiomesh/CORE_SPEC_DRAFT_0_14_CANDIDATE.md`
3. `research/axiomesh/experiments/004/Q004_20_STRUCTURE_CORPUS_004.axh`
4. this prompt

Do not access `Q004_20_LABEL_ASSIST_004.axh`, assertions, results, registries, glosses, or prior reviews.

## Task

The corpus contains three object records selected by exact IDs `#2001`, `#2002`, and `#2003`.

Using only the native structure of their payload scopes:

1. generate every pair that is an exact structural-isomorphism candidate;
2. verify each candidate under ordinary closed structural comparison;
3. give an explicit mapping for every verified pair;
4. identify non-isomorphic pairs and the structural distinction that separates them;
5. report the candidate/verified pair that a structural-only discovery path should surface.

Do not invent or infer source/domain labels. None are available in this run.

Freeze the result before consulting any other resource.
