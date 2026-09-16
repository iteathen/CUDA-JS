# Experiment 002 — Draft 0.2 Cold Decoder Prompt

You are an isolated decoder for AxiomeSH Experiment 002.

This is a qualification task, not a language-design task. Do not repair, reinterpret, simplify, or improve the supplied representation.

## Repository and branch

Repository: `iteathen/CUDA-JS`  
Branch: `experiment/axiomesh-native-reconstruction`

## Isolation boundary

Read ONLY:

1. `research/axiomesh/CORE_SPEC_DRAFT_0_2_CANDIDATE.md`
2. `research/axiomesh/experiments/002/COLD_DECODER_PROMPT_002_DRAFT_0_2.md`
3. `research/axiomesh/experiments/002/CONNECT4_LOGIC_002_DRAFT_0_2.axh`

Do NOT read or search for any other AxiomeSH, Connect4, issue, PR, commit-diff, source, oracle, signature, audit, result, or conversation material.

In particular, do not access:

- `SOURCE_CONNECT4_LOGIC_002.md`
- `SOURCE_RELATIONS_002.json`
- `ATOM_ORACLE_002.json`
- `SEMANTIC_SIGNATURE_002_DRAFT_0_2.json`
- `FORMALIZATION_AUDIT_002.json`
- `FORMALIZATION_AUDIT_002.md`
- either Experiment 002 results file
- `CONNECT4_LOGIC_002.axh`
- any CUDA-JS Issues discussing AxiomeSH
- the Connect4 repository

Do not use repository-wide search.

You have no mutation authority.

## Task

Decode the Draft 0.2 native payload as structure.

### A. Corpus reconstruction

Report:

- number of claim objects;
- number of claim-body attachments;
- epistemic-status partition by raw semantic symbol;
- primary-layer partition;
- source claim-relation count and relation-symbol partition;
- deferred-disposition count;
- explicit guard-metadata count;
- explicit bounded-scope-metadata count;
- high-level layer-flow edges;
- number of first-class open-question objects.

### B. Formula reconstruction

For every structural claim ID `1001..1059`, reproduce its body as normalized AxiomeSH structure. Preserve exactly:

- semantic-symbol identity;
- structural identity;
- exact literals;
- quantifier kind and scope;
- implication direction;
- equality structure;
- classical negation;
- choices;
- nested formula scopes.

Do not replace the formula with prose.

If a body contains an ambiguity under Draft 0.2, report the ambiguity beside that claim instead of guessing.

### C. Native structural probes

Answer using raw structural IDs/symbol IDs, not guessed English names:

1. Which claim body contains both exact literals `#69` and `#625`?
2. Which missing-law claim body contains the same two semantic mask symbols as the line-hit product claim and also contains requirements corresponding structurally to both existential and universal move composition?
3. Identify every claim body containing exact literal `#28`. Distinguish the structurally different roles in which it appears rather than merging them.
4. Which claim body contains the exact filtration equality whose literals are `#2`, `#20`, `#6`, and `#28`?
5. Which claim contains the general rank/kernel formulas and also the standard-board equalities `#35`, `#34`, `#7`, `#6`, `#28`, `#28`?
6. Which claim body contains a universal recurrence over a set-valued function and distinguishes two player-to-move cases?
7. Which disproven claim carries the `#46`, `#6`, `#40` counterexample pattern?
8. Identify the three missing-law claim IDs and describe their structural differences only from their native bodies and graph relations.
9. Follow the derivative chain from the claim containing the `v2`-based multiplicity formula through the diagonal-constraint claim to the seven-dimensional periodic-code claim. Report the claim IDs and relation directions.
10. Identify the native open-question object that links to the center/deadline missing-law claim.

### D. Qualification report

Report:

- any formula you could not parse uniquely;
- any unbound variable;
- any semantic value that appears to be encoded as a bare alpha-renamable identity instead of an exact literal;
- any claim body that is only an opaque proposition placeholder rather than formula structure;
- any place where you had to assume meaning not established by the candidate spec.

Do not access an oracle to check yourself.
