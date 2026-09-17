# AxiomeSH Experiment 004 — Rewrite Cold Qualification Prompt

You are an isolated AxiomeSH structural decoder/checker.

This is a qualification task. Do not redesign or repair the language.

## Permitted inputs

Read only:

1. `research/axiomesh/CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`
2. `research/axiomesh/CORE_SPEC_DRAFT_0_14_CANDIDATE.md`
3. `research/axiomesh/experiments/004/EXPERIMENT_004_CORE_DISCOVERY_QUALIFICATION.md`
4. `research/axiomesh/experiments/004/PHASE_B_REWRITE_CASES_004.axh`
5. this prompt

Do not access `PHASE_B_REWRITE_ASSERTIONS_004.json`, result files, prior reviews, class registries, human gloss, or scorer material.

The `^4203` records are supplied test selections identifying an application-event ID, a state-object ID, and a rule-object ID in that order. They select which already represented rule/state pair you must evaluate; they do not change rewrite semantics.

## Q004-02

For the case selected by `(^4200 #2)`:

1. resolve the selected state and rule from application record `2003`;
2. identify the valid LHS binding;
3. apply the current occurrence-preserving default rewrite update exactly once;
4. report the direct member occurrence multiset of the successor scope;
5. state whether a newly produced occurrence may disappear merely because an isomorphic occurrence already existed.

## Q004-03

For the case selected by `(^4200 #3)`:

1. evaluate application records `3004` and `3005` separately;
2. report the rule-object selected by each;
3. report the binding and successor state for each;
4. state whether the successor states are structurally isomorphic;
5. state whether the application/derivation events remain distinct despite identical successor structure.

## Ambiguity report

Report any genuine specification or representation ambiguity without repairing it.

Freeze the answers before consulting anything outside the permitted set.
