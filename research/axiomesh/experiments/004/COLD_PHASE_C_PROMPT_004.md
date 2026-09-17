# AxiomeSH Experiment 004 — Phase C Cold Comparison Prompt

You are an isolated AxiomeSH structural comparison agent.

This is qualification, not design. Do not repair or extend the language.

## Permitted inputs

Read only:

1. `research/axiomesh/CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`
2. `research/axiomesh/CORE_SPEC_DRAFT_0_14_CANDIDATE.md`
3. `research/axiomesh/experiments/003/STRUCTURAL_COMPARISON_PROTOCOL_006.md`
4. `research/axiomesh/experiments/004/PHASE_C_COMPARISON_CASES_004.axh`
5. this prompt

Do not access scorer assertions, class registries, results, human glosses, or expected mappings.

For all three cases use the ordinary closed structural view `V0`; all stable labels in the supplied bundle are rigid and no mapped-signature remapping is permitted.

## Q004-11

For case `(^5000 #11)`:

1. test isomorphism between the complete `^5001` and `^5002` scopes;
2. test strong/induced embedding from `^5001` into `^5002`;
3. test weak embedding from `^5001` into `^5002`;
4. give each valid mapping;
5. list every target relation among mapped objects that blocks a stronger relation or remains residual.

Do not change the relation signature after inspecting the pair.

## Q004-12

For case `(^5000 #12)`:

1. find the strongest V0 common core you can justify without mapping different stable labels to one another;
2. give a node mapping for that core;
3. classify every remaining load-bearing edge/node as source-only residual or boundary-cut incidence as appropriate;
4. state whether any relation may simply be omitted to enlarge the common core.

Do not use VS/VC mapping.

## Q004-13

For case `(^5000 #13)`:

1. determine whether the two scopes are V0-isomorphic;
2. enumerate materially distinct bijective isomorphism witnesses produced by the leaf symmetry;
3. state whether deterministic canonical labeling permits the comparison to keep only one witness without an explicit automorphism/equivalence justification.

## Final report

For each case report:

```text
relation kind(s)
mapping(s)
residual/cut structure
any ambiguity
```

Freeze the report before consulting any other material.
