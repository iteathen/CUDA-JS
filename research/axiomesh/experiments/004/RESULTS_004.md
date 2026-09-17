# AxiomeSH Experiment 004 — Results

**Status:** Draft 0.15 external-review corrections frozen; original 20 targets remain preserved; supplemental controls Q004-S01..S08 are frozen as a plan; pre-0.15 cold prompts are quarantined pending current-authority revisions; isolated qualification remains pending.

## Current authority

```text
../../CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md
../../CORE_SPEC_DRAFT_0_14_CANDIDATE.md
../../CORE_SPEC_DRAFT_0_15_CANDIDATE.md
../003/STRUCTURAL_DISCOVERY_PROTOCOL_006.md
../003/STRUCTURAL_COMPARISON_PROTOCOL_006.md
../003/STRUCTURAL_CLASS_SCHEMA_CONTRACT_006.md
```

Draft 0.15 adds no logical operator, structural class, or irreducible primitive. It corrects deterministic grammar/transport and witness-accounting defects found by an isolated external review while rejecting recommendations that would conflate useful syntax with primitive status or force one canonical factorization.

External-review provenance:

```text
EXTERNAL_REVIEW_GEMINI_001_DISPOSITION.md
DRAFT_0_15_IMPACT_AUDIT_004.md
EXTERNAL_REVIEW_SUPPLEMENT_004.md
COLD_RUN_MANIFEST_004_V2.md
```

The original `EXPERIMENT_004_CORE_DISCOVERY_QUALIFICATION.md` freezes Q004-01..Q004-20. Those target identities are not renumbered or silently rewritten.

---

## Draft 0.15 accepted corrections

Current qualification semantics now additionally make explicit:

- reference-binding directives cannot occupy semantic ordered-edge/formula positions whose N0 removal would alter arity;
- member occurrence and structural identity are distinct;
- rewrite subtraction removes selected member occurrences and does not cascade-delete the identity or unrelated incidences;
- outer `scope > scope` sides are pattern/replacement containers; direct RHS members splice into the application scope, while literal nested scope construction uses a member scope such as `[[...]]`;
- declarative constructors do not bind/quantify variables;
- source-local D/extraction residuals are distinct from pairwise common-core residuals;
- fingerprint/index invariance is qualified for an explicit representation/factorization stage;
- un-delimited mixed/chained infix surfaces are rejected during the freeze rather than guessed;
- NAC object existence is distinct from NAC evaluation by an explicit matcher context;
- class/factorization simplicity/minimality claims require a declared metric/partial order;
- canonical serializers/indexes are algorithm/revision scoped.

Explicitly rejected external-review recommendations include:

- removing `@@` from parseable grammar solely because it is not primitive;
- adding a dedicated fresh-allocation token merely for convenience;
- alpha-renaming stable labels inside `Sig_surface`;
- forcing one canonical post-D factorization for indexing.

---

## Original fixture compatibility

`DRAFT_0_15_IMPACT_AUDIT_004.md` found:

```text
reusable fixture with revised current prompt: Q004-01..Q004-16, Q004-18..Q004-20
base fixture preserved but current successor pressure needed: Q004-17
```

The pre-0.15 prompt files omit Draft 0.15 from their exact permitted-input lists and are therefore **historical only** until versioned/current prompt successors are issued.

No current cold run should use the old prompt authority set.

---

## Q004-01 / 04 / 05 / 06 / 07 / 08 — raw structural semantics

Artifacts:

```text
PHASE_A_CASES_004.axh
Q004_07_NAMESPACE_A.axh
Q004_07_NAMESPACE_B.axh
PHASE_A_ASSERTIONS_004.json          scorer only
COLD_PHASE_A_PROMPT_004.md           historical pre-0.15 prompt
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

Draft 0.15 fixture compatibility audit: PASS author-side.

Current-authority cold prompt revision: PENDING.

Isolated run: PENDING.

---

## Q004-02 / 03 — rewrite/event semantics

Artifacts:

```text
PHASE_B_REWRITE_CASES_004.axh
PHASE_B_REWRITE_ASSERTIONS_004.json   scorer only
COLD_PHASE_B_REWRITE_PROMPT_004.md    historical pre-0.15 prompt
PHASE_B_REWRITE_AUTHOR_AUDIT_004.md
```

Targets:

```text
Q004-02  occurrence/multiset rewrite update
Q004-03  structurally identical successor / distinct application events
```

Draft 0.15 explicitly resolves the outer RHS scope as replacement-container/splice semantics already intended by the fixture.

Author-side fixture review: COMPLETE.

Current-authority cold prompt revision: PENDING.

Isolated run: PENDING.

---

## Q004-09 — decomposition coverage versus archival round trip

Artifacts:

```text
Q004_09_DECOMPOSITION_CHEAT_004.axh
Q004_09_ASSERTIONS_004.json           scorer only
COLD_Q004_09_PROMPT.md                historical pre-0.15 prompt
```

The fixture contrasts an exposed source-target structural mapping with an empty exposed target whose reconstruction residual carries the entire original source.

Q004-09 remains a source-local decomposition-coverage test. Draft 0.15's separate pairwise-residual layer does not invalidate it.

Current-authority cold prompt revision: PENDING.

Isolated run: PENDING.

---

## Q004-10 — independent extraction freeze

Artifacts:

```text
Q004_10_EXTRACTION_FREEZE_004.axh
Q004_10_ASSERTIONS_004.json           scorer only
COLD_Q004_10_PROMPT.md                historical pre-0.15 prompt
```

The pre-pair frozen extractions do not match. A later pair-conditioned exploratory extraction does match.

Fixture remains compatible under Draft 0.15.

Current-authority cold prompt revision: PENDING.

Isolated run: PENDING.

---

## Q004-11 / 12 / 13 — pairwise comparison/common-core/automorphism

Artifacts:

```text
PHASE_C_COMPARISON_CASES_004.axh
PHASE_C_ASSERTIONS_004.json           scorer only
COLD_PHASE_C_PROMPT_004.md            historical pre-0.15 prompt
PHASE_C_AUTHOR_AUDIT_004.md
```

Targets:

```text
Q004-11  strong versus weak embedding
Q004-12  complete pairwise common-core / residual / boundary-cut accounting
Q004-13  multiple automorphism/isomorphism witnesses
```

Draft 0.15 preserves these pairwise cases while adding Q004-S04 for explicit D-local-versus-pairwise residual staging and Q004-S08 for serializer/index algorithm scoping.

Current-authority cold prompt revision: PENDING.

Isolated run: PENDING.

---

## Q004-14 / 15 — negative and index-view discipline

Artifacts:

```text
PHASE_C_NEGATIVE_INDEX_CASES_004.axh
PHASE_C_NEGATIVE_INDEX_ASSERTIONS_004.json  scorer only
COLD_PHASE_C_NEGATIVE_INDEX_PROMPT_004.md   historical pre-0.15 prompt
PHASE_C_NEGATIVE_INDEX_AUTHOR_AUDIT_004.md
```

Targets:

```text
Q004-14  certified negative versus bounded no-witness
Q004-15  fingerprint/invariant safety under V0 versus VS
```

Q004-15 remains valid for view-specific index invariance. Q004-S05 adds the distinct missing case of index validity across multiple D/factorization stages.

Current-authority cold prompt revision: PENDING.

Isolated run: PENDING.

---

## Q004-16 — class non-vacuity/selectivity

Artifacts:

```text
Q004_16_CLASS_NONVACUITY_004.axh
Q004_16_ASSERTIONS_004.json           scorer only
COLD_Q004_16_PROMPT.md                historical pre-0.15 prompt
```

The pass-through negative and large structured-parameter positive remain valid. Draft 0.15 separately requires a declared measure for claims of simplicity/minimality.

Current-authority cold prompt revision: PENDING.

Isolated run: PENDING.

---

## Q004-17 — native policy/witness/result self-representation

Artifacts:

```text
Q004_17_NATIVE_RECORDS_004.axh
Q004_17_ASSERTIONS_004.json           scorer only
COLD_Q004_17_PROMPT.md                historical pre-0.15 prompt
```

The existing fixture remains useful base evidence but is no longer sufficient alone for the complete Draft 0.15 native-record burden.

A versioned successor/additional fixture must cover, as applicable:

- distinct D-local and pairwise residual roles;
- fingerprint representation/factorization stage;
- canonical serializer/index algorithm revision;
- NAC consumption/evaluation role.

Existing assertions remain frozen; they are not silently expanded after the fact.

Current successor fixture/prompt: PENDING.

Isolated run: PENDING.

---

## Q004-18 — source ambiguity

Artifacts:

```text
Q004_18_SOURCE_AMBIGUITY_004.axh
Q004_18_ASSERTIONS_004.json           scorer only
COLD_Q004_18_PROMPT.md                historical pre-0.15 prompt
```

Fixture remains compatible.

Current-authority cold prompt revision: PENDING.

Isolated run: PENDING.

---

## Q004-19 — novel-class induction

Artifacts:

```text
Q004_19_NOVEL_CLASS_004.axh
Q004_19_ASSERTIONS_004.json           scorer only
COLD_Q004_19_PROMPT.md                historical pre-0.15 prompt
```

The case remains valid for new-class hypothesis generation. Any future claim that one induced class is simpler/minimal now requires a declared metric.

Current-authority cold prompt revision: PENDING.

Isolated run: PENDING.

---

## Q004-20 — structural-only versus label-assisted retrieval

Artifacts:

```text
Q004_20_STRUCTURE_CORPUS_004.axh
Q004_20_LABEL_ASSIST_004.axh
Q004_20_ASSERTIONS_004.json           scorer only
COLD_Q004_20_STRUCTURE_ONLY_PROMPT.md historical pre-0.15 prompt
COLD_Q004_20_LABEL_ASSISTED_PROMPT.md historical pre-0.15 prompt
```

Frozen corpus design remains compatible:

```text
#2001 and #2002  structurally isomorphic, different assist labels
#2001 and #2003  same assist label, structurally non-isomorphic
```

Current-authority prompt revisions: PENDING.

Both isolated runs: PENDING.

---

## Draft 0.15 supplemental controls

`EXTERNAL_REVIEW_SUPPLEMENT_004.md` freezes eight supplemental targets without renumbering the original twenty:

```text
Q004-S01  reference-binding placement / arity preservation
Q004-S02  rule-side splice versus nested-scope construction
Q004-S03  declarative variable ownership
Q004-S04  two-stage D-local versus pairwise residual reconstruction
Q004-S05  fingerprint validity across factorization stages
Q004-S06  infix parse determinism / ambiguous-chain rejection
Q004-S07  first-class NAC object versus matcher evaluation
Q004-S08  canonical serializer/index algorithm scoping
```

Native fixtures: PENDING.

Hidden scorer assertions: PENDING.

Cold prompts: PENDING.

---

## Meta/discovery author audits

Existing author audits remain historical construction checks.

Current-authority additions:

```text
EXTERNAL_REVIEW_GEMINI_001_DISPOSITION.md
DRAFT_0_15_IMPACT_AUDIT_004.md
```

These are forbidden to cold agents.

---

## Qualification coverage

```text
original frozen targets:                  20
original native/synthetic fixtures:       20
original hidden scorer assertions:        20 targets covered
original pre-0.15 cold prompts:            complete but historical/quarantined
Draft 0.15 compatible original fixtures:  19 directly reusable
Q004-17 current successor pressure:         pending
supplemental targets:                       8 frozen as plan
supplemental native fixtures:               0
current-authority isolated cold runs:       0 accepted
independent verifier runs:                  0 accepted
```

Author-side expectations are not qualification evidence.

---

## Qualification claims currently allowed

Only construction/status claims are allowed:

- Draft 0.15 exists as the current corrective amendment over Drafts 0.13/0.14;
- the isolated external review has a durable accepted/rejected disposition;
- original Q004-01..Q004-20 fixture compatibility has been author-side audited;
- the old cold prompts are quarantined instead of being misused against superseded authority;
- Q004-S01..Q004-S08 are frozen as supplemental qualification targets;
- no current-authority isolated decoder/verifier result has yet been accepted.

## Claims not yet allowed

Experiment 004 does **not** establish:

- that Draft 0.13/0.14/0.15 semantics are independently reconstructable;
- that the accepted external-review corrections are sufficient;
- that reference-binding placement, RHS splice semantics, or infix rejection are unambiguous to a fresh decoder;
- that rewrite/event/reference/namespace/quantifier rules qualify;
- that two-stage residual reconstruction is correctly recovered;
- that factorization-stage-specific index invariants are handled correctly;
- that common-core/embedding/index distinctions are reconstructed correctly;
- that class non-vacuity or native policy/witness self-representation succeeds;
- that source ambiguity is preserved by an isolated decoder;
- that novel-class induction behaves correctly;
- that any candidate structural class is qualified;
- that structural-only retrieval achieves useful corpus-scale recall;
- that the current specification requires no further correction.

## Next execution seam

```text
Draft 0.15 frozen
-> build Q004-S01..S08 fixtures/assertions/prompts
-> build Q004-17 current native-record successor pressure
-> issue Draft-0.15 current prompt revisions for reusable Q004 fixtures
-> execute isolated cold runs in fresh contexts
-> freeze each output before opening assertions
-> unblind scorer assertions
-> classify every discrepancy before repair
-> independently verify positive mappings/certificates
-> only then consider any further specification mutation
```

If a disconnect occurs, re-fetch the live branch and inspect every commit after the last known checkpoint before continuing.
