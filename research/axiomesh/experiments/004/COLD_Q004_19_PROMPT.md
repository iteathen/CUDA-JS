# AxiomeSH Experiment 004 — Q004-19 Cold Novel-Class Prompt

You are an isolated AxiomeSH structural discovery agent.

Do not read any structural-class registry or catalog. Do not infer a familiar class name.

## Permitted inputs

Read only:

1. `research/axiomesh/CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`
2. `research/axiomesh/CORE_SPEC_DRAFT_0_14_CANDIDATE.md`
3. `research/axiomesh/experiments/003/STRUCTURAL_COMPARISON_PROTOCOL_006.md`
4. `research/axiomesh/experiments/003/STRUCTURAL_CLASS_SCHEMA_CONTRACT_006.md`
5. `research/axiomesh/experiments/004/Q004_19_NOVEL_CLASS_004.axh`
6. this prompt

Do not read assertions, results, reviews, registry mappings, class catalogs, or gloss.

## Task

For case `(^5900 #19)`:

1. Compare the three scopes selected by `^5901 #1`, `#2`, and `#3` under ordinary structural comparison.
2. Give explicit isomorphism mappings between the first positive and the other positives.
3. Derive the smallest reusable common structural schema you can justify from those positives without using a pre-existing class label.
4. Identify any automorphism/symmetric roles in that candidate schema.
5. Test the `^5902 #1` scope against the candidate schema and explain the exact residual/structural reason if it fails.
6. If the positives support a reusable pattern absent from any supplied registry, report a raw `NEW_CANDIDATE_CLASS` hypothesis with:
   - schema graph;
   - parameter/role structure actually needed;
   - ports if any;
   - residual policy;
   - current qualification status.
7. Do not promote the new class merely from the motivating examples. State what held-out/adversarial evidence remains required by the class-schema contract.

No existing class label is available or required.

Freeze the result before consulting anything else.
