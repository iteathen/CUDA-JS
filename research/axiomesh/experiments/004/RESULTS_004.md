# AxiomeSH Experiment 004 — Results

**Status:** Draft 0.14 corrections frozen; protocols 006 created; all 20 frozen qualification targets now have native/synthetic fixtures and/or frozen cold prompts; isolated qualification remains pending.

## Current authority

```text
../../CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md
../../CORE_SPEC_DRAFT_0_14_CANDIDATE.md
../003/STRUCTURAL_DISCOVERY_PROTOCOL_006.md
../003/STRUCTURAL_COMPARISON_PROTOCOL_006.md
../003/STRUCTURAL_CLASS_SCHEMA_CONTRACT_006.md
```

Draft 0.14 adds no logical operator or structural class. It closes final-pass authority gaps and freezes speculative language growth while Experiment 004 attempts to falsify the current representation.

`EXPERIMENT_004_CORE_DISCOVERY_QUALIFICATION.md` freezes exactly 20 targets. No new class/core token is permitted merely to make a case pass.

---

## Q004-01 / 04 / 05 / 06 / 07 / 08 — raw structural semantics

Artifacts:

```text
PHASE_A_CASES_004.axh
Q004_07_NAMESPACE_A.axh
Q004_07_NAMESPACE_B.axh
PHASE_A_ASSERTIONS_004.json          scorer only
COLD_PHASE_A_PROMPT_004.md
PHASE_A_AUTHOR_AUDIT_004.md
```

Targets:

```text
Q004-01  scope occurrence multiplicity
Q004-04  nested-boundary non-flattening
Q004-05  variable ownership / aliasing / repeated-variable / NAC binding
Q004-06  reference hygiene + repeated-use multiplicity
Q004-07  structural/stable-label namespace collision
Q004-08  same quantified body / different linked domain-generator
```

Author-side fixture/signature review: COMPLETE.

Isolated run: PENDING.

---

## Q004-02 / 03 — rewrite/event semantics

Artifacts:

```text
PHASE_B_REWRITE_CASES_004.axh
PHASE_B_REWRITE_ASSERTIONS_004.json   scorer only
COLD_PHASE_B_REWRITE_PROMPT_004.md
PHASE_B_REWRITE_AUTHOR_AUDIT_004.md
```

Targets:

```text
Q004-02  occurrence/multiset rewrite update
Q004-03  structurally identical successor / distinct application events
```

Author-side fixture review: COMPLETE.

Isolated run: PENDING.

---

## Q004-09 — decomposition coverage versus archival round trip

Artifacts:

```text
Q004_09_DECOMPOSITION_CHEAT_004.axh
Q004_09_ASSERTIONS_004.json           scorer only
COLD_Q004_09_PROMPT.md
```

The fixture contrasts an exposed source-target structural mapping with an empty exposed target whose reconstruction residual carries the entire original source.

The test asks whether lossless recovery can be distinguished from semantic-decomposition coverage.

Isolated run: PENDING.

---

## Q004-10 — independent extraction freeze

Artifacts:

```text
Q004_10_EXTRACTION_FREEZE_004.axh
Q004_10_ASSERTIONS_004.json           scorer only
COLD_Q004_10_PROMPT.md
```

The pre-pair frozen extractions do not match. A later pair-conditioned exploratory extraction does match.

The qualification test requires the exploratory match to remain exploratory rather than rewriting the frozen blind result.

Isolated run: PENDING.

---

## Q004-11 / 12 / 13 — pairwise comparison/common-core/automorphism

Artifacts:

```text
PHASE_C_COMPARISON_CASES_004.axh
PHASE_C_ASSERTIONS_004.json           scorer only
COLD_PHASE_C_PROMPT_004.md
PHASE_C_AUTHOR_AUDIT_004.md
```

Targets:

```text
Q004-11  strong versus weak embedding
Q004-12  complete common-core / residual / boundary-cut accounting
Q004-13  multiple automorphism/isomorphism witnesses
```

Author-side fixture review: COMPLETE.

Isolated run: PENDING.

---

## Q004-14 / 15 — negative and index-view discipline

Artifacts:

```text
PHASE_C_NEGATIVE_INDEX_CASES_004.axh
PHASE_C_NEGATIVE_INDEX_ASSERTIONS_004.json  scorer only
COLD_PHASE_C_NEGATIVE_INDEX_PROMPT_004.md
PHASE_C_NEGATIVE_INDEX_AUTHOR_AUDIT_004.md
```

Targets:

```text
Q004-14  certified negative versus bounded no-witness
Q004-15  fingerprint/invariant safety under V0 versus VS
```

Author-side fixture review: COMPLETE.

Isolated run: PENDING.

---

## Q004-16 — class non-vacuity/selectivity

Artifacts:

```text
Q004_16_CLASS_NONVACUITY_004.axh
Q004_16_ASSERTIONS_004.json           scorer only
COLD_Q004_16_PROMPT.md
```

The fixture contrasts:

```text
1601  arbitrary pass-through slot with no structural constraint
1602  large structured parameter + reusable two-edge-chain constraint
```

Two assignments satisfy the constrained pattern and one structurally large near miss does not.

The case tests that parameter size is not the vacuity criterion while pass-through structure is.

Isolated run: PENDING.

---

## Q004-17 — native policy/witness/result self-representation

Artifacts:

```text
Q004_17_NATIVE_RECORDS_004.axh
Q004_17_ASSERTIONS_004.json           scorer only
COLD_Q004_17_PROMPT.md
```

The cold decoder must reconstruct raw policy-like, witness-like, and result-like record topology—including mapping/residual scopes—from native structure without authoritative human gloss.

Isolated run: PENDING.

---

## Q004-18 — source ambiguity

Artifacts:

```text
Q004_18_SOURCE_AMBIGUITY_004.axh
Q004_18_ASSERTIONS_004.json           scorer only
COLD_Q004_18_PROMPT.md
```

One represented source has two explicit interpretations. One matches the target; one does not.

The source-level result must remain conditional rather than silently choosing the convenient interpretation.

Isolated run: PENDING.

---

## Q004-19 — novel-class induction

Artifacts:

```text
Q004_19_NOVEL_CLASS_004.axh
Q004_19_ASSERTIONS_004.json           scorer only
COLD_Q004_19_PROMPT.md
```

Three positive objects are alpha-renamed directed reconvergent diamonds; a near miss branches to two separate sinks.

No registry/catalog is permitted to the cold agent. The allowed result is a raw `NEW_CANDIDATE_CLASS` hypothesis/schema only if native common structure supports it; promotion remains blocked on held-out/adversarial evidence.

Isolated run: PENDING.

---

## Q004-20 — structural-only versus label-assisted retrieval

Artifacts:

```text
Q004_20_STRUCTURE_CORPUS_004.axh
Q004_20_LABEL_ASSIST_004.axh
Q004_20_ASSERTIONS_004.json           scorer only
COLD_Q004_20_STRUCTURE_ONLY_PROMPT.md
COLD_Q004_20_LABEL_ASSISTED_PROMPT.md
```

Frozen corpus design:

```text
#2001 and #2002  structurally isomorphic, different assist labels
#2001 and #2003  same assist label, structurally non-isomorphic
```

The structural-only run cannot access the assist document. The assisted run may use it for candidacy but must verify structurally.

Both runs: PENDING.

---

## Meta/discovery author audit

`PHASE_D_AUTHOR_AUDIT_004.md` reviews Q004-09, Q004-10, and Q004-16..20 for fixture construction errors without claiming cold qualification.

---

## Fixture coverage

```text
frozen targets:                  20
native/synthetic fixture ready:  20
hidden scorer assertion ready:   20 targets covered
cold prompt ready:               20 targets covered across grouped/individual prompts
author-side fixture audits:      COMPLETE for all constructed groups
isolated cold runs:              0 accepted
independent verifier runs:       0 accepted
```

Author-side expected distinctions are not qualification evidence.

---

## Qualification claims currently allowed

Only construction/status claims are allowed:

- Draft 0.14 correction artifact exists and is frozen;
- discovery/comparison/class protocols 006 encode the current authority;
- all 20 synthetic targets have frozen fixtures/assertions/prompts;
- scorer material is separated from cold inputs;
- no isolated decoder/verifier result has yet been accepted.

## Claims not yet allowed

Experiment 004 does **not** yet establish:

- that Draft 0.13/0.14 semantics are independently reconstructable;
- that rewrite/event/reference/namespace/quantifier rules qualify;
- that semantic-decomposition and extraction-freeze distinctions are recovered cold;
- that common-core/embedding/index distinctions are reconstructed correctly;
- that class non-vacuity or native policy/witness self-representation succeeds;
- that source ambiguity is preserved by an isolated decoder;
- that novel-class induction behaves correctly;
- that any candidate structural class is qualified;
- that structural-only retrieval achieves useful corpus-scale recall;
- that the current specification requires no further correction.

## Next execution seam

```text
all 20 fixtures frozen
-> execute isolated cold runs in fresh contexts with exact permitted-input lists
-> freeze each output before opening assertions
-> unblind scorer assertions
-> classify every discrepancy before repair
-> independently verify positive mappings/certificates
-> only then consider any specification mutation
```

If a disconnect occurs, re-fetch the live branch and inspect every commit after the last known checkpoint before continuing.
