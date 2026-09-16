# Experiment 002 — Draft 0.4 Cold Qualification and Review Prompt

This protocol has two phases. Phase 1 is native/formal qualification. Phase 2 is post-freeze human-gloss/reference review. Phase 2 MUST NOT rewrite Phase 1.

## Repository and branch

Repository: `iteathen/CUDA-JS`  
Branch: `experiment/axiomesh-native-reconstruction`

---

# PHASE 1 — isolated native/formal qualification

Read ONLY:

1. `research/axiomesh/CORE_SPEC_DRAFT_0_2_CANDIDATE.md`
2. `research/axiomesh/CORE_SPEC_DRAFT_0_3_CANDIDATE.md`
3. `research/axiomesh/CORE_SPEC_DRAFT_0_4_CANDIDATE.md`
4. `research/axiomesh/experiments/002/COLD_DECODER_PROMPT_002_DRAFT_0_4.md`
5. `research/axiomesh/experiments/002/SEMANTIC_SIGNATURE_002_DRAFT_0_4.axh`
6. `research/axiomesh/experiments/002/CONNECT4_LOGIC_002_DRAFT_0_2.axh`

Do not read or search any other repository material during Phase 1.

In particular, do not access source prose, human glossaries, old signatures, audits, result files, scorer assertions, issues, PRs, commit diffs, the Connect4 repository, or prior conversations.

Do not mutate the repository during Phase 1.

Apply Draft 0.2, then Draft 0.3, then Draft 0.4 on the subjects each amendment governs.

## A. Exact bundle-signature qualification

Treat `^0` as core-reserved.

Report:

- number of declared theory-owned symbols;
- number of theory-owned symbols actually used by the formula payload;
- every used-but-undeclared symbol;
- every declared-but-unused symbol;
- whether signature members are in canonical increasing numeric ID order;
- PASS/FAIL for Draft 0.4 exact canonical bundle closure.

Do not infer English names for any `^n`.

## B. Lexical binder regression

Inspect every bound variable sufficiently to report:

- unbound variables;
- illegal nested same-number rebinding;
- whether claim `1017` contains legal disjoint sibling reuse of `?0` under Draft 0.3/0.4 lexical rules.

Return PASS/FAIL.

## C. Corpus reconstruction regression

Report raw structural counts and partitions for:

- claim objects;
- claim-body attachments;
- status values;
- layer values;
- `^5` claim relations and relation-symbol partition;
- `^6` guard metadata;
- `^7` bounded-scope metadata;
- `^8` deferred dispositions;
- `^9` layer-flow edges;
- first-class open-question objects.

Reconstruct all claim bodies `1001..1059` as normalized raw AxiomeSH structure. Do not translate them to English.

## D. Native-only structural probes

These probes deliberately identify targets by raw structure rather than hidden human names.

1. Identify the claim whose body contains both `#69` and `#625`.

2. Among claims whose status value is `^207`, identify the claim satisfying all of these native selectors:
   - it has a `^5` edge with relation symbol `^304` targeting claim `1042`;
   - it has a `^5` edge with relation symbol `^306` targeting claim `1011`;
   - it has a `^5` edge with relation symbol `^302` targeting claim `1008`;
   - its body contains all four semantic symbols `^1120`, `^1121`, `^1253`, `^1254`.
   Reproduce that claim body.

3. Identify every claim body containing exact literal `#28`. Preserve distinct structural roles rather than merging occurrences.

4. Identify the claim containing an equality whose RHS/LHS structure includes exact literals `#2`, `#20`, `#6`, and `#28` in the same filtration expression.

5. Identify the claim that contains both semantic symbols `^1312` and `^1313` in universally quantified general formulas and also contains standard-instance exact values `#35`, `#34`, `#7`, `#6`, `#28`, `#28`.

6. Identify the claim with an outer universal binder `*?0`, a nested universal binder `*?1`, repeated applications of `^1278`, and branch structure containing both `^1280` and `^1284`.

7. Among claims with status `^208`, identify the claim containing `(^1063 #46 #6) == #40`.

8. Identify all claims with status `^207`. For each, report its raw `^5` relation neighborhood and a compact structural fingerprint of its body.

9. Restrict attention to claim IDs `1057`, `1058`, and `1059`. Enumerate every `^5` claim relation among those three whose relation symbol is `^304`. Report the exact stored direction of each edge and the resulting two-step chain.

10. Identify the open-question object whose `^1488` link targets claim `1052`, and reproduce its `^1487` body.

## E. Native/formal difficulty report

Record separately:

- parse ambiguity;
- unbound variable;
- signature failure;
- semantic value encoded as a bare structural identity when an exact literal is structurally required;
- opaque proposition placeholder;
- malformed formula;
- structures that are valid but materially expensive to inspect;
- any place where the visible probe selector itself is insufficient to choose a unique raw target.

Do not turn inability to guess an English name for `^n` into a native/formal failure.

## F. Freeze

Produce complete Phase 1 results and then write exactly:

```text
PHASE 1 FROZEN
```

After that marker, never revise a Phase 1 answer.

---

# PHASE 2 — post-freeze human-gloss/reference review

Only after `PHASE 1 FROZEN`, you MAY read:

- `research/axiomesh/experiments/002/SEMANTIC_SIGNATURE_002_DRAFT_0_2.json`
- `research/axiomesh/experiments/002/SOURCE_CONNECT4_LOGIC_002.md`
- `research/axiomesh/experiments/002/SOURCE_RELATIONS_002.json`
- `research/axiomesh/experiments/002/FORMALIZATION_AUDIT_002.json`
- `research/axiomesh/experiments/002/FORMALIZATION_AUDIT_002.md`
- `research/axiomesh/experiments/002/SEMANTIC_FIDELITY_REVIEW_002.md`
- `research/axiomesh/experiments/002/RESULTS_002.md`
- `research/axiomesh/experiments/002/SPEC_EXPANSION_002.md`
- `research/axiomesh/experiments/002/SIGNATURE_AUDIT_002_DRAFT_0_3.md`
- `research/axiomesh/experiments/002/SIGNATURE_AUDIT_002_DRAFT_0_4.md`
- Issues `#267` and `#268`
- relevant AxiomeSH README/design documentation on this branch.

The scorer-only file `QUALIFICATION_ASSERTIONS_002_DRAFT_0_4.json` remains forbidden unless you are explicitly performing scoring after the decoder report has been submitted.

Phase 2 must:

1. compare each Phase 1 result against the references;
2. identify decoder errors without rewriting the frozen answer;
3. classify discrepancies as decoder error, specification ambiguity, representation difficulty, native-signature insufficiency, human-gloss-only limitation, experiment-protocol issue, or intended behavior;
4. map raw objects to human terminology only now;
5. record whether any human gloss was actually required for a load-bearing formal operation;
6. comment on decoder effort, especially dense formula presentation;
7. recommend further changes only when directly supported by observed evidence.

## Output discipline

Report native/formal qualification and human-gloss review as separate score lines.

A correct raw reconstruction with a later naming miss is not a raw reconstruction failure.

A wrong raw relation, literal, binder, or formula answer is a native/formal failure even if the later review identifies the intended human concept.

Do not mutate repository files during this run unless separately authorized.
