# AxiomeSH Experiment 004 — Phase A Cold Qualification Prompt

You are acting as an isolated structural decoder/checker for AxiomeSH Experiment 004.

This is a qualification task, not a design task.

Do not improve, reinterpret, repair, simplify, or extend AxiomeSH. Report what the supplied current representation and specification actually require.

## Permitted inputs

Read only:

1. `research/axiomesh/CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`
2. `research/axiomesh/CORE_SPEC_DRAFT_0_14_CANDIDATE.md`
3. `research/axiomesh/experiments/004/EXPERIMENT_004_CORE_DISCOVERY_QUALIFICATION.md`
4. `research/axiomesh/experiments/004/PHASE_A_CASES_004.axh`
5. `research/axiomesh/experiments/004/Q004_07_NAMESPACE_A.axh`
6. `research/axiomesh/experiments/004/Q004_07_NAMESPACE_B.axh`
7. this prompt

Do **not** read any scorer assertions, result files, prior reviews, structural-class registry, human gloss, expected mappings, issue discussions, or other AxiomeSH experiment material.

In particular, do not access:

- `PHASE_A_ASSERTIONS_004.json`
- any future `RESULTS_004*`
- `STRUCTURAL_CLASS_REGISTRY_003.axh`
- `SEMANTIC_GLOSS_003.json`
- `QUALIFICATION_ASSERTIONS_003.json`

## Isolation discipline

Treat `Q004_07_NAMESPACE_A.axh` and `Q004_07_NAMESPACE_B.axh` as **independent top-level native bundles**. They do not share structural or stable-label namespace merely because numeric spellings coincide.

Do not assume human names for `^n` symbols. Use raw IDs and structural roles only.

Freeze your answers before consulting any material outside the permitted set.

## Required report

### Case selected by `(^4000 #1)`

Report:

1. direct member occurrence count of the scope supplied as `^4001`;
2. direct member occurrence count of the scope supplied as `^4002`;
3. whether the two scopes are structurally isomorphic under the ordinary closed structural view after permitted N0/N1 processing;
4. whether duplicate isomorphic member occurrences may be collapsed by N0/N1.

### Case selected by `(^4000 #4)`

Report:

1. the relevant scope-nesting difference between `^4001` and `^4002`;
2. whether they are structurally isomorphic under the ordinary closed structural view;
3. whether N0/N1 may flatten the nested scope to make them match.

### Case selected by `(^4000 #5)`

For raw subcases `#1..#4`, inspect the rewrite LHS pattern in the corresponding `^4006` object and the target in the corresponding `^4007` object.

For each subcase report:

- whether the pattern/rule is structurally well-formed for matching under the current variable-owner/NAC rules;
- whether the positive/NAC pattern can match the target scope;
- the variable binding when a match exists;
- the exact reason when it does not.

Do not execute RHS transformation; this probe is about matching/ownership only.

### Case selected by `(^4000 #6)`

After N0 reference resolution, report:

1. how many direct member occurrences are inside the `^4001` scope;
2. whether those occurrences preserve the same internal structural identities from the referred term;
3. whether the reference-binding syntax remains semantic comparison structure after resolution;
4. whether `^4001` and `^4002` are structurally isomorphic under the ordinary closed structural view, including an alpha map if yes;
5. whether `^4001` and `^4003` are structurally isomorphic.

### Independent namespace pair

Compare the semantic bodies of `Q004_07_NAMESPACE_A.axh` and `Q004_07_NAMESPACE_B.axh`.

Report separately:

1. whether bare identity `1` in A and bare identity `1` in B are literally the same source object merely because spelling matches;
2. whether `^7000` in A and `^7000` in B are literally the same stable semantic identity merely because spelling matches;
3. whether the bodies are isomorphic under the ordinary closed structural view with stable labels rigid;
4. whether they can be isomorphic under a signature-mappable view when an explicit bijective `^7000_A <-> ^7000_B` mapping is permitted;
5. the required local structural-ID mapping if such a mapped-signature isomorphism exists.

### Case selected by `(^4000 #8)`

Compare the complete `^4001` and `^4002` construction scopes.

Report:

1. whether their compact quantifier kinds match;
2. whether their quantified-body structures match up to permitted local alpha renaming;
3. the number of direct `^4010` membership incidences associated with each linked domain/generator marker;
4. whether the complete construction scopes are structurally isomorphic under the ordinary closed structural view;
5. whether inspecting only the compact binder/body would be sufficient to conclude semantic/structural interchangeability of the complete quantified constructions.

## Difficulties / ambiguity

After the case answers, report every genuine ambiguity or difficulty you encountered, classified as one of:

```text
specification ambiguity
representation ambiguity
protocol ambiguity
agent/decoder difficulty
no ambiguity / intended distinction
```

Do not repair an ambiguity in the frozen answer. State the competing readings.

## Final verdict

Provide a concise Phase A verdict containing:

```text
cases answered
cases blocked by ambiguity
native distinctions recovered
any suspected spec defect
```

Then freeze the report.
