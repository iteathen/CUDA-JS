# Experiment 002 — Draft 0.3 Cold Decoder Prompt

You are an isolated decoder for the Draft 0.3 tightening of AxiomeSH Experiment 002.

This is a qualification/regression task, not a language-design task. Do not repair, reinterpret, simplify, or improve the supplied representation.

## Repository and branch

Repository: `iteathen/CUDA-JS`  
Branch: `experiment/axiomesh-native-reconstruction`

## Isolation boundary

Read ONLY:

1. `research/axiomesh/CORE_SPEC_DRAFT_0_2_CANDIDATE.md`
2. `research/axiomesh/CORE_SPEC_DRAFT_0_3_CANDIDATE.md`
3. `research/axiomesh/experiments/002/COLD_DECODER_PROMPT_002_DRAFT_0_3.md`
4. `research/axiomesh/experiments/002/SEMANTIC_SIGNATURE_002_DRAFT_0_3.axh`
5. `research/axiomesh/experiments/002/CONNECT4_LOGIC_002_DRAFT_0_2.axh`

Do NOT read or search for any other AxiomeSH, Connect4, issue, PR, commit-diff, source, oracle, glossary, audit, result, or conversation material.

In particular, do not access:

- `SEMANTIC_SIGNATURE_002_DRAFT_0_2.json`
- `FORMALIZATION_AUDIT_002.json`
- `FORMALIZATION_AUDIT_002.md`
- `SEMANTIC_FIDELITY_REVIEW_002.md`
- `RESULTS_002.md`
- `SPEC_TIGHTENING_003.md`
- `SOURCE_CONNECT4_LOGIC_002.md`
- `SOURCE_RELATIONS_002.json`
- any CUDA-JS issue, including #267
- the Connect4 repository
- prior AxiomeSH conversations

Do not use repository-wide search.

You have no mutation authority.

## Purpose

Draft 0.2 already underwent a cold decode. This run tests only the Draft 0.3 tightening:

1. lexical variable-number scope;
2. native semantic-signature closure;
3. regression of the previously exercised structural probes.

Do not require English names for primitive `^n` symbols. Human gloss is intentionally absent and non-semantic.

## A. Native signature qualification

From `SEMANTIC_SIGNATURE_002_DRAFT_0_3.axh`:

1. reconstruct the complete declared semantic-symbol set;
2. report its cardinality;
3. verify that `^0` is treated as core-reserved signature marker, not as a theory-owned member;
4. scan the formula payload and report every semantic symbol used there but absent from the declared signature;
5. report declared symbols that are not used by the formula payload if you can determine them exactly;
6. do not use or infer human-readable names.

Primary pass condition:

```text
undeclared theory-owned semantic symbols used by body = 0
```

## B. Variable-scope qualification

Apply Draft 0.3 lexical rules to every binder in the formula payload.

Report:

- any unbound variable;
- any illegal nested rebinding;
- any remaining variable-number ambiguity;
- whether disjoint sibling reuse occurs.

For claim structural ID `1017`, explicitly state whether:

```text
~*?0[...]
+?0[...]
```

contains:

- one shared variable;
- two distinct lexical variables;
- or remains ambiguous.

Explain using only Draft 0.3 scope rules.

Primary pass condition:

```text
unbound = 0
illegal nested rebinding = 0
ambiguous binder ownership = 0
```

## C. Regression corpus checks

Without reproducing all 59 bodies unless necessary, verify:

- 59 claim objects;
- 59 claim-body attachments;
- 137 claim relations;
- 23 guard-metadata attachments;
- 19 bounded-scope attachments;
- 2 deferred dispositions;
- 8 layer-flow edges;
- 10 open-question objects.

Then rerun these raw-structure probes:

1. claim body containing both `#69` and `#625`;
2. the three claims carrying status `^207`;
3. every claim body containing exact literal `#28`;
4. the body containing `(^1065 #2 (^1065 #20 #6)) == #28`;
5. the claim containing standard-board equalities `#35`, `#34`, `#7`, `#6`, `#28`, `#28`;
6. the universal set-valued recurrence claim;
7. the `#46`, `#6`, `#40` disproven counterexample;
8. the derivative chain using native relation edges;
9. the open-question object linked to claim `1052`.

Use raw IDs/symbols. Do not assign English meanings.

## D. Sidecar-independence check

State whether any answer in sections A–C required:

- an English symbol glossary;
- source prose;
- an oracle;
- an unstated semantic convention.

If yes, identify the exact dependency.

Do not count inability to guess a human label for `^n` as loss of native formal semantics.

## E. Qualification verdict

Report separately:

```text
signature closure: PASS/FAIL
lexical variable scope: PASS/FAIL
structural regression: PASS/FAIL
sidecar independence: PASS/FAIL
```

List every failure or ambiguity exactly.

Do not redesign the language.
