# Experiment 004 — Cold-Run Manifest V2

**Status:** authority-transition hold after Draft 0.15  
**Supersedes for future execution:** `COLD_RUN_MANIFEST_004.md`  
**Current semantic authority:** Draft 0.13 + Draft 0.14 + Draft 0.15

## Do not execute the legacy cold prompts yet

The existing Experiment 004 cold prompts were frozen before Draft 0.15 and permit only Drafts 0.13/0.14.

Because Draft 0.15 changes deterministic interpretation of:

- reference-binding placement;
- occurrence-versus-identity rewrite effects;
- rule-side outer scope splice semantics;
- declarative variable ownership;
- D-local versus pairwise residual accounting;
- factorization-stage index validity;
- infix ambiguity handling;
- NAC evaluation context;
- minimality/canonical-index qualification;

the pre-0.15 prompts are now **historical frozen protocols**, not executable current qualification authority.

Running them now would create evidence against a superseded authority set.

## Current execution requirement

Before any new cold run:

1. preserve the existing fixtures/assertions/prompts as historical evidence in Git history;
2. perform an author-side Draft 0.15 impact audit for each original target group;
3. create current prompt revisions whose permitted inputs explicitly include:
   - `CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`;
   - `CORE_SPEC_DRAFT_0_14_CANDIDATE.md`;
   - `CORE_SPEC_DRAFT_0_15_CANDIDATE.md`;
   - the exact campaign/fixture files for that run;
4. do not expose `EXTERNAL_REVIEW_GEMINI_001_DISPOSITION.md` or any scorer assertions to cold agents;
5. freeze each cold output before scorer unblinding.

## Original twenty targets

The original Q004-01..Q004-20 target identities remain frozen.

Draft 0.15 does not authorize changing their expected answers merely to fit the new text. If the impact audit finds that a fixture encoded a now-resolved ambiguity rather than the intended distinction, record that as a fixture/protocol defect and create a versioned successor fixture/prompt.

## Supplemental targets

`EXTERNAL_REVIEW_SUPPLEMENT_004.md` adds Q004-S01..Q004-S08.

These are supplemental qualification controls; they do not replace or renumber the original twenty targets.

## Isolation

Fresh contexts remain mandatory.

A cold agent for Draft 0.15 qualification must not read:

- scorer assertions;
- author audits;
- external review reports/dispositions;
- expected mappings/results;
- registry/catalog hints unless a specific test explicitly requires them;
- earlier cold outputs.

## Resume seam

```text
Draft 0.15 frozen
-> impact-audit original 20 fixtures
-> issue current prompt revisions
-> construct/freeze S01..S08 fixtures/assertions/prompts
-> execute fresh isolated cold runs
-> freeze outputs
-> unblind and classify
```
