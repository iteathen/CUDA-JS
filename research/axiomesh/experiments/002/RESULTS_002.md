# Experiment 002 — Results

**Status:** Draft 0.2 full logical render independently cold-decoded; Draft 0.3 tightening produced; signature/scoping regression qualification pending.

## Source integrity

Source repository `iteathen/Connect4` remains read-only.

Frozen source commit:

`0e5e29e4ca4fd3941bdcffe70a52b66348705589`

No Connect4 files, branches, issues, claims, or research artifacts were modified by this experiment.

## Render lineage

### Draft 0.1 graph prototype

`CONNECT4_LOGIC_002.axh`

Preserved the research graph but externalized claim bodies through opaque proposition IDs. It is retained only as a structural graph prototype.

### Draft 0.2 full proposition render

`CONNECT4_LOGIC_002_DRAFT_0_2.axh`

Carries native formula bodies for all 59 normalized claims.

Author-side audit established:

| Check | Result |
|---|---:|
| claim objects | 59 |
| native claim bodies | 59 |
| status attachments | 59 |
| primary-layer attachments | 59 |
| source claim relations | 137 |
| guard metadata | 23 |
| bounded-scope metadata | 19 |
| deferred dispositions | 2 |
| layer-flow edges | 8 |
| first-class open-question objects | 10 |
| exact literal occurrences | 167 |
| universal binders | 56 |
| existential binders | 1 |
| declarative implications | 24 |
| declarative equalities | 132 |
| classical negations | 52 |
| explicit choices | 3 |

The obsolete opaque proposition IDs `5001..5059` are absent.

## Independent Draft 0.2 qualification — issue #267

CUDA-JS issue #267 records an isolated cold decode that read only the Draft 0.2 candidate spec, frozen cold prompt, and Draft 0.2 native payload.

The decoder independently recovered:

- all 59 claim objects;
- all 59 claim-body attachments;
- the exact epistemic-status partition;
- the primary-layer partition;
- all 137 claim relations and their relation-symbol partition;
- both deferred dispositions;
- all 23 guard attachments;
- all 19 bounded-scope attachments;
- all eight high-level layer-flow edges;
- all ten open-question objects;
- all 59 raw formula bodies;
- every frozen structural probe.

The probe results included the `#69/#625` residual object, the line-hit realizability missing law, all distinct occurrences of `#28`, the `#28 = #2 + #20 + #6` filtration, the rank/kernel formulas, the set-valued W/D/L recurrence, the `#46-#6=#40` counterexample, the three missing-law objects, the derivative chain, and the open-question link to the center/deadline bridge.

The decoder reported:

- no opaque proposition placeholders;
- no demonstrable semantic value accidentally encoded as a bare alpha-renamable identity;
- no unbound variables under ordinary lexical binding;
- one specification ambiguity concerning the scope of variable-number reuse;
- intentionally unavailable English glosses for opaque semantic symbols.

Therefore the Draft 0.2 formula payload passes independent cold reconstruction and structural-query qualification on the exercised surface.

## Draft 0.3 tightening

Issue #267 produced two follow-up questions. They are resolved experimentally in:

- `CORE_SPEC_DRAFT_0_3_CANDIDATE.md`;
- `SPEC_TIGHTENING_003.md`;
- `SEMANTIC_SIGNATURE_002_DRAFT_0_3.axh`.

### Lexical binder rule

Draft 0.3 makes variable binding explicitly lexical:

- sibling/disjoint binders may reuse the same variable number;
- separate proposition bodies may reuse variable numbers;
- nested rebinding while the same number remains visible is forbidden;
- capture-free alpha-renaming preserves meaning.

This resolves the claim-1017 ambiguity without changing the qualified formula payload.

### Native signature closure

Draft 0.3 reserves core marker `^0` for a native theory-signature inventory.

`SEMANTIC_SIGNATURE_002_DRAFT_0_3.axh` declares the theory-owned semantic symbols used by the Experiment 002 theory family.

The human JSON glossary remains optional reviewer metadata. It is not semantic authority and is excluded from cold qualification.

Draft 0.3 deliberately does **not** add English strings to canonical core. Primitive theory symbols are permitted to remain human-opaque; their formal identity and use are native.

## What Draft 0.3 does not change

The independently decoded Draft 0.2 formula payload remains byte-for-byte the proposition body used by the tightened theory bundle:

```text
CORE_SPEC_DRAFT_0_2_CANDIDATE.md
+
CORE_SPEC_DRAFT_0_3_CANDIDATE.md
+
SEMANTIC_SIGNATURE_002_DRAFT_0_3.axh
+
CONNECT4_LOGIC_002_DRAFT_0_2.axh
```

Draft 0.3 is a scoping/signature closure refinement, not a rewrite of the 59 formulas.

## Qualification state

```text
Experiment 001 / Draft 0.1 synthetic structural reconstruction: PASS on exercised surface

Experiment 002 Draft 0.1 full logical expressibility:
  FAIL -> specification pressure

Draft 0.2 candidate:
  Q0 expressibility across 59 claims: PASS author-side
  Q1 source/formula preservation: PASS author-side
  Q2 isolated cold reconstruction: PASS (#267)
  Q3 frozen structural probes: PASS (#267)
  issue found: variable-number scope wording ambiguous
  issue found: signature inventory not native

Draft 0.3 tightening:
  lexical scope rule: SPECIFIED
  native semantic-symbol inventory: ADDED
  independent scoping/signature regression test: PENDING

Q4 continuation/synthesis from native theory alone: PENDING
```

No compression, latency, or reasoning-superiority claim is made by Experiment 002. Those require controlled baselines after the theory representation itself qualifies.
