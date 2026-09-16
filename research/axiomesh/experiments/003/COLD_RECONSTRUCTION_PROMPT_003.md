# Experiment 003 — Cold Reconstruction Prompt

You are an isolated decoder for the AxiomeSH cross-logic benchmark suite.

This is **E2 native reconstruction**, not yet proof execution.

## Isolation

Repository: `iteathen/CUDA-JS`  
Branch: `experiment/axiomesh-native-reconstruction`

Read ONLY:

1. `research/axiomesh/CORE_SPEC_DRAFT_0_2_CANDIDATE.md`
2. `research/axiomesh/CORE_SPEC_DRAFT_0_3_CANDIDATE.md`
3. `research/axiomesh/CORE_SPEC_DRAFT_0_4_CANDIDATE.md`
4. `research/axiomesh/CORE_SPEC_DRAFT_0_5_CANDIDATE.md`
5. `research/axiomesh/experiments/003/COLD_RECONSTRUCTION_PROMPT_003.md`
6. `research/axiomesh/experiments/003/SEMANTIC_SIGNATURE_003_DRAFT_0_5.axh`
7. `research/axiomesh/experiments/003/FORMAL_LOGIC_BENCHMARKS_003.axh`

Do NOT read source prose, semantic glossaries, result files, scorer data, issues, PRs, commit diffs, Experiment 002 or Connect4 material, or prior conversations.

Do not use repository-wide search.

Do not mutate the repository.

Apply Draft 0.2, then 0.3, 0.4, then 0.5 on the subjects each amendment governs.

## A. Signature closure

Treat `^0` as core-reserved.

Report:

- declared theory-symbol count;
- used theory-symbol count;
- used-but-undeclared symbols;
- declared-but-unused symbols;
- canonical increasing-ID order;
- PASS/FAIL exact bundle closure.

## B. Benchmark inventory

Identify every benchmark object defined by `^1`.

Report:

- total count;
- structural IDs;
- partition by `^2` domain symbol;
- partition by `^3` profile symbol;
- partition by `^7` benchmark mode;
- partition by `^9` proof-readiness value;
- number with one or more `^5` premises;
- number with `^8` concrete parameter-instance attachments;
- number with `^10` required-construct attachments.

Do not guess English names.

## C. Formula reconstruction

For every benchmark object, reproduce:

- all `^5` premises;
- its `^4` goal;
- all `^8` parameters;
- all `^10` required constructs;
- tested-feature symbol identities.

Preserve exact binding, implication, equality, negation, choice, literals, nested scopes, and lexical abstractions.

## D. Draft 0.5 abstraction audit

Locate every `\?n term` abstraction.

For each:

- report its owning benchmark;
- report the bound variable number;
- reproduce its body;
- identify the immediate consuming semantic application, if any;
- check lexical scope and capture;
- report any nested same-number rebinding violation.

Also report whether any variable-headed semantic application is being silently assumed rather than represented through a theory-owned application symbol.

## E. Native-only structural probes

Use raw structure only.

1. Find the benchmark whose goal is universally quantified over two variables and contains nested implication only, with no `^n` application inside the goal.
2. Find the benchmark whose `^9` value is `^352`, whose goal begins with three existential binders, and whose goal contains `^515`, `^516`, and `^517`.
3. Find every benchmark with `^9 = ^351` and reproduce its parameter/family structure.
4. Find the benchmark whose premises use `^529` and whose goal is the bare semantic symbol `^543`.
5. Find the benchmark whose goal contains both `^531` and `^532`, and a premise containing `^533`.
6. Find the benchmark whose goal contains both `^535` and `^536` under `^521`.
7. Find the benchmark whose goal uses `^540` over two `^538` spatial structures and one `^541` program term.
8. Find the benchmark whose goal contains double declarative negation around a choice.
9. Find the meta-theorem benchmark whose goal contains `^542` applied to a choice and whose consequence is a choice between two `^542` applications.
10. Find the benchmark with a `^10` construct containing `^544` and lexical abstraction; separately find the benchmark with a `^10` construct containing `^545` and lexical abstraction.
11. Find the benchmark whose goal contains `^548` four times with common relation symbol `^579`.
12. Report all benchmarks marked `^352` or `^353`; do not infer that their goals are proved merely because the formulas are reconstructable.

## F. Proof-readiness discipline

This bundle records statements and proof obligations, not complete proof calculi.

From native structure alone, distinguish:

- statement reconstructed;
- parameter instance still required (`^351`);
- exact premise/relation import still required (`^352`);
- native logic-profile semantics/rules still required (`^353`);
- statement-ready (`^350`).

Do **not** silently import classical, modal, temporal, deontic, separation, higher-order, or type-theoretic inference rules from prior knowledge and call that native proof qualification.

## G. Difficulty report

Record:

- parse ambiguities;
- unbound variables;
- illegal rebinding;
- signature failures;
- formula/operator structure that cannot be represented under Draft 0.5;
- constructs that are valid but materially expensive to decode;
- any benchmark whose readiness metadata appears inconsistent with its native body.

## H. Freeze

Produce the complete E2 report, then write:

```text
PHASE 1 FROZEN
```

Only after that marker may a separately authorized review open source/gloss/reference material.
