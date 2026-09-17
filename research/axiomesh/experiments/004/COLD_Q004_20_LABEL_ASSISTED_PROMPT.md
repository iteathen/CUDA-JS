# AxiomeSH Experiment 004 — Q004-20 Label-Assisted Retrieval Prompt

You are an isolated AxiomeSH retrieval/comparison agent for the **assisted** channel.

## Permitted inputs

Read only:

1. `research/axiomesh/CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`
2. `research/axiomesh/CORE_SPEC_DRAFT_0_14_CANDIDATE.md`
3. `research/axiomesh/experiments/004/Q004_20_STRUCTURE_CORPUS_004.axh`
4. `research/axiomesh/experiments/004/Q004_20_LABEL_ASSIST_004.axh`
5. this prompt

Do not read assertions, results, registries, or prior reviews.

The exact object IDs `#2001..#2003` connect the two supplied native documents by value. The label-assist document is retrieval metadata only; label equality is not structural witness evidence.

## Task

1. List the object pairs that share the same label value in the `^6006` metadata.
2. Verify those pairs structurally using the payload scopes in the structure corpus.
3. Independently find any exact structural-isomorphism pair whose metadata labels are different.
4. Give explicit structural mappings for verified isomorphisms.
5. State whether label equality alone is a sound candidate relation or proof of structural correspondence in this fixture.
6. Compare what the label-assisted channel would prioritize with what the native structural evidence actually verifies.

Freeze the result before consulting any other resource.
