# Experiment 002 — Draft 0.2 Formalization Audit

**Source:** read-only `iteathen/Connect4@0e5e29e4ca4fd3941bdcffe70a52b66348705589`  
**Working branch:** `experiment/axiomesh-native-reconstruction`  
**Payload:** `CONNECT4_LOGIC_002_DRAFT_0_2.axh`  
**Candidate spec:** `../../CORE_SPEC_DRAFT_0_2_CANDIDATE.md`

## Result

The previous Draft 0.1 payload encoded the research graph but left claim meanings behind opaque proposition nodes. This pass removes that seam.

Every normalized claim `C4-R0001..C4-R0059` now owns a native Draft 0.2 formula body. No `5001..5059` proposition-placeholder structural IDs occur in the replacement payload.

The payload also retains the normalized knowledge graph around the formulas: epistemic status, primary layer, all 137 source claim relations, 23 explicit guard attachments, 19 bounded-scope attachments, two deferred dispositions, the eight-edge high-level flow, and ten open research seams as first-class native objects.

## Structural qualification

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
| open-question objects | 10 |
| exact literal occurrences | 167 |
| universal binders | 56 |
| existential binders | 1 |
| declarative implications | 24 |
| declarative equalities | 132 |
| classical negations | 52 |
| explicit choices | 3 |

The payload SHA-256 is:

`4b84e3019bbc5b40c39741dde234040d341656ea7bc7c0ac10e0489e4e6ebdef`

Status partition remains exactly:

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

## What is now intrinsic

The replacement payload itself, rather than an oracle, carries the proposition structure. It includes guarded terminal implications, CPC arithmetic, the exact `#69 -> #625` residual universe, empirical counts and bounded qualifiers, the `(support,H0,H1)` quotient/order, line-hit realizability requirements, exact antichain subtraction, the set-valued W/D/L recurrence, the distinct `#61`/terminal-`#28`/structural-`#28` objects, rank/kernel equations, the `#38 -> #28` extremal refinement, the center/deadline bridge, 6x7 `#30` and 8x7 `#40` controls, the `#28=#2+#20+#6` filtration, Connect-K `v2(K)` factorization, K=4 diagonal equations, and the seven-mode periodic code.

Empirical values described by the source as approximate are represented by a theory-level `approx_equal` relation rather than core equality, preserving the source's epistemic precision.

## Semantic-symbol sidecar boundary

`SEMANTIC_SIGNATURE_002_DRAFT_0_2.json` maps stable `^n` symbols to human gloss for scoring/review. It is not required to reconstruct formula topology and contains no proposition bodies.

Intended boundary:

```text
native payload = semantic/formula structure
sidecar        = human names for stable theory symbols
```

The old failure mode was:

```text
native payload = proposition identity only
sidecar        = proposition meaning
```

That failure mode is removed.

## Remaining qualification

This is author-side formalization evidence, not cold-decoder evidence. A fresh decoder must receive only the Draft 0.2 candidate spec, the new cold prompt, and `CONNECT4_LOGIC_002_DRAFT_0_2.axh`.

No Connect4 repository state was modified.
