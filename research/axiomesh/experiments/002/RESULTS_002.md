# Experiment 002 — Results

**Status:** Draft 0.2 full native logical rerender complete; author-side structural and semantic qualification complete; independent cold decode pending.

## Source integrity

Source repository `iteathen/Connect4` was used read-only.

Frozen source commit:

`0e5e29e4ca4fd3941bdcffe70a52b66348705589`

No Connect4 files, branches, issues, claims, or research artifacts were modified by this experiment.

The copied logical source is retained locally in this experiment as:

- `SOURCE_CONNECT4_LOGIC_002.md` — normalized statements, guards/scopes, measurements, and open seams;
- `SOURCE_RELATIONS_002.json` — source claim-relation graph.

## First render disposition

The original `CONNECT4_LOGIC_002.axh` render remains classified as a **structural graph prototype**. It preserved the research graph but externalized proposition meaning through opaque proposition IDs, so it did not satisfy the intended experiment.

That failure produced `SPEC_EXPANSION_002.md` and the experimental `CORE_SPEC_DRAFT_0_2_CANDIDATE.md`.

## Replacement native logical render

Replacement payload:

`CONNECT4_LOGIC_002_DRAFT_0_2.axh`

Scoring/reviewer semantic glossary:

`SEMANTIC_SIGNATURE_002_DRAFT_0_2.json`

Formalization audit:

- `FORMALIZATION_AUDIT_002.json`
- `FORMALIZATION_AUDIT_002.md`
- `SEMANTIC_FIDELITY_REVIEW_002.md`

The replacement payload itself now carries the proposition/formula structure. The semantic glossary supplies only human-readable names for stable `^n` theory symbols and is excluded from the blind structural cold decode.

Payload SHA-256:

`4b84e3019bbc5b40c39741dde234040d341656ea7bc7c0ac10e0489e4e6ebdef`

## Author-side structural qualification

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

Every source claim `C4-R0001..C4-R0059` has an actual native body. The old opaque proposition IDs `5001..5059` are absent from the replacement payload.

The source status partition remains exactly:

```text
research_model          1
deductive_exact        10
guarded_exact           7
accepted_contract       4
empirically_supported  25
hypothesis              2
candidate_rule           2
missing_law              3
disproven                4
rejected                 1
```

## Author-side semantic fidelity review

The replacement render has been checked against the copied normalized source for the load-bearing logical distinctions that motivated Draft 0.2.

Confirmed native structures include:

- guarded terminal implications and exact terminal consequences;
- CPC arithmetic and exact numeric literals;
- `69 -> 625` residual-universe structure;
- empirical counts and approximate measurements without promotion to exact theorem status;
- the `(support,H0,H1)` quotient and line-hit product order;
- the realizability-preserving predecessor/composition requirements in `R0043`;
- exact antichain terminal subtraction;
- the set-valued W/D/L recurrence in `R0047`;
- separate W/D/L-only `61`, distance-optimal terminal `28`, and structural-core `28` objects;
- rank/kernel formulas and standard-board equalities;
- the searchless `38 -> 28` extremal refinement;
- the center/deadline missing bridge;
- 6x7 `30` upper-bound and 8x7 `40` counterexample controls;
- the exact `28 = 2 + 20 + 6` filtration;
- Connect-K `v2(K)` factorization;
- K=4 diagonal equations;
- the seven-mode regular-board periodic code.

The three missing-law objects remain distinct:

- `R0011` — general guarded composition/closure;
- `R0043` — line-hit support-local realizability/predecessor closure;
- `R0052` — distance-optimal center/deadline selection bridge.

## Specification result

Experiment 002 expanded Draft 0.1 rather than working around its limitations.

Draft 0.2 candidate adds the currently evidenced minimum distinctions:

```text
bare n      structural identity, alpha-renamable
#n          exact literal
#p/q        exact rational literal
^n          stable theory semantic symbol
[L] > [R]  operational rewrite
L => R      declarative implication
*?n term    universal binder
+?n term    existential binder / explicit freshness in RHS creation context
A == B      declarative equality
~term       declarative negation
!term       negative application condition
{...}       unordered declarative alternatives
```

It also closes the Draft 0.1 grammar inconsistency and fixes reference scope, boundary-aware isomorphism, ordinary-scope duplicate membership, default variable aliasing, and explicit freshness.

## Semantic-symbol sidecar boundary

`SEMANTIC_SIGNATURE_002_DRAFT_0_2.json` maps stable semantic symbols to human gloss for scorer/reviewer use. It contains no formula bodies.

The relevant distinction is now:

```text
native payload = actual formula structure + stable semantic-symbol identity
sidecar        = human gloss for theory symbols
```

not the rejected first-render form:

```text
native payload = proposition identity only
sidecar        = proposition meaning
```

## Independent qualification protocol

`COLD_DECODER_PROMPT_002_DRAFT_0_2.md` freezes Q2/Q3 isolation.

A fresh decoder receives only:

1. `CORE_SPEC_DRAFT_0_2_CANDIDATE.md`;
2. `COLD_DECODER_PROMPT_002_DRAFT_0_2.md`;
3. `CONNECT4_LOGIC_002_DRAFT_0_2.axh`.

It must not receive the copied Connect4 source, relation oracle, semantic glossary, formalization audit, results, issues, prior conversations, or old Draft 0.1 graph prototype.

The blind decoder must reconstruct all 59 native formulas and answer the frozen structural probes without guessing English names.

## Current qualification state

```text
Experiment 001 / Draft 0.1 synthetic structural reconstruction: PASS on exercised surface
Experiment 002 Draft 0.1 full logical expressibility: FAIL -> specification pressure
Draft 0.2 candidate spec expansion: COMPLETE on experimental branch
Experiment 002 Draft 0.2 full proposition rerender: COMPLETE
Q0 expressibility across 59 normalized claims: PASS author-side
Q1 structural preservation: PASS author-side
source-to-native semantic fidelity review: PASS author-side, not independent
Q2 independent cold reconstruction: PENDING
Q3 native structural reasoning probes: PENDING
Q4 continuation/synthesis: PENDING
```

No compression, latency, reasoning-superiority, or synthesis-superiority claim is made yet. Those require independent decode and controlled baselines.
