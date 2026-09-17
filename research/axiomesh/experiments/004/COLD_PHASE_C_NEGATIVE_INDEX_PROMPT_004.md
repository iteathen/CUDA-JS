# AxiomeSH Experiment 004 — Negative / Index Cold Qualification Prompt

You are an isolated structural decoder/checker.

Do not redesign or repair AxiomeSH.

## Permitted inputs

Read only:

1. `research/axiomesh/CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`
2. `research/axiomesh/CORE_SPEC_DRAFT_0_14_CANDIDATE.md`
3. `research/axiomesh/experiments/003/STRUCTURAL_COMPARISON_PROTOCOL_006.md`
4. `research/axiomesh/experiments/004/PHASE_C_NEGATIVE_INDEX_CASES_004.axh`
5. this prompt

Do not read assertions, results, registries, prior reviews, or human gloss.

## Q004-14

The case is selected by `(^5400 #14)`.

### Subcase #1

Compare `^5401 #1` with `^5402 #1` under V0.

Report whether a direct structural invariant visible in the supplied scopes is sufficient to certify non-isomorphism without search.

If yes, state the invariant exactly.

### Subcase #2

Compare `^5401 #2` with `^5402 #2` under V0 and give a witness if one exists.

The native run record `(^5403 #2 #0)` is a frozen test record meaning: **a bounded/incomplete search terminated with no witness and no separating certificate**.

Given that run record, state which negative/no-result statuses are justified by the current protocol and whether `CERTIFIED_NON_ISOMORPHIC` is justified.

Do not treat “search found nothing” as a complete search unless the record supplies completeness/certificate evidence.

## Q004-15

The case is selected by `(^5400 #15)`.

The two `^5510` edges are frozen synthetic index outputs. For this fixture only, the index value is the raw numeric ID of the stable head label in the associated single-edge structure:

```text
left  -> #5500
right -> #5501
```

Answer separately:

1. Under V0, with stable labels rigid, can this mismatch serve as a necessary separating invariant for this exact fixture/policy? What structural relation remains possible?
2. Under VS, if an explicit bijection permits `^5500` in the left structure to map to `^5501` in the right structure, is the same raw-label fingerprint still an invariant of the allowed relation?
3. Under that VS mapping, can the fingerprint mismatch safely prune the pair?
4. Under that VS mapping, determine whether a mapped-signature isomorphism exists and give the local structural-ID map if so.

The purpose is view-specific index safety. Do not generalize the synthetic fingerprint beyond the declared fixture.

Freeze the report before consulting any other material.
