# Draft 0.6 Structural Instantiation — Cold Qualification Prompt

You are an isolated decoder for a focused AxiomeSH Draft 0.6 qualification.

This is a qualification task, not a language-design task. Do not repair, extend, reinterpret, or simplify the supplied candidate.

Repository: `iteathen/CUDA-JS`  
Branch: `experiment/axiomesh-native-reconstruction`

## Isolation boundary

Read ONLY:

1. `research/axiomesh/CORE_SPEC_DRAFT_0_2_CANDIDATE.md`
2. `research/axiomesh/CORE_SPEC_DRAFT_0_3_CANDIDATE.md`
3. `research/axiomesh/CORE_SPEC_DRAFT_0_4_CANDIDATE.md`
4. `research/axiomesh/CORE_SPEC_DRAFT_0_5_CANDIDATE.md`
5. `research/axiomesh/CORE_SPEC_DRAFT_0_6_CANDIDATE.md`
6. `research/axiomesh/experiments/003/instantiation/COLD_PROMPT_DRAFT_0_6_INSTANTIATION.md`
7. `research/axiomesh/experiments/003/instantiation/DRAFT_0_6_INSTANTIATION_CASES.axh`

Do NOT read any other repository file, issue, PR, commit diff, oracle, result, benchmark source, semantic glossary, or prior conversation.

In particular, do not access `DRAFT_0_6_INSTANTIATION_ORACLE.json`.

Do not mutate the repository.

## Task

For cases `1..8`:

1. expand local references according to the spec;
2. determine whether the subject is valid Draft 0.6 structure;
3. where valid and reducible, report the normalized structural result of `@@`;
4. preserve exact token classes (`n`, `#n`, `^n`, `?n`);
5. apply lexical ownership and capture avoidance exactly;
6. for quantifier-pair cases, determine whether the two members are structurally equivalent after alpha normalization;
7. report any ambiguity instead of guessing.

Case 4 is intentionally an open structural term. Do not reject it merely because its final result has a free variable; distinguish open-term validity from closed-proposition validity.

## Specific checks

Report whether the cases demonstrate:

- replacement of only abstraction-owned occurrences;
- preservation of literals and semantic symbols;
- preservation of unrelated nested binders;
- capture-avoiding alpha-renaming;
- alpha-invariance of the result;
- equivalence of compact and explicit abstraction-valued universal forms;
- equivalence of compact and explicit abstraction-valued existential forms;
- rejection of `@@` when the left operand is not an abstraction;
- unchanged body when the bound variable does not occur.

Also report signature closure for the case bundle.

## Output

Return:

- one table or clearly separated section for cases `1..8`;
- normalized raw AxiomeSH, not English paraphrase, for each valid reducible result;
- PASS/FAIL for each specific check;
- any parser/binding ambiguity;
- overall PASS/FAIL for the Draft 0.6 structural-instantiation surface exercised here.

Do not use external logic knowledge. This test concerns structural binding and instantiation only.
