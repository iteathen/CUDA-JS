# Experiment 002 — Connect4 Logic Corpus Render

**Branch:** `experiment/axiomesh-native-reconstruction`  
**Source repository:** `iteathen/Connect4`  
**Source branch:** `research/unified-knowledge`  
**Frozen source commit:** `0e5e29e4ca4fd3941bdcffe70a52b66348705589`  
**Status:** Draft 0.3 independently qualified; Draft 0.4 regression pending

## Purpose

Render the normalized Connect4 structural-logic research corpus into native AxiomeSH without mutating or relocating Connect4 research.

Connect4 is read-only source material. Every copied source snapshot, AxiomeSH render, candidate specification, oracle, test protocol, audit, and result belongs only on this CUDA-JS experimental branch.

Experiment 002 is also a language-development pressure test. When source logic or an isolated decode exposes a real representation/qualification defect, the experimental candidate may tighten minimally and must then be independently tested again.

## Source boundary

The frozen source problem is the normalized Connect4 research plane at the source commit, including the canonical claim graph `C4-R0001..C4-R0059`, its core model, logical maps, open questions, and hypotheses.

Historical provenance and solver implementation are not copied as new logical premises. Their normalized epistemic effect is retained through status, scope, guards, disposition, measurements, and claim relations.

## Experiment question

Can the complete normalized Connect4 research logic be represented natively such that an isolated agent can:

1. reconstruct the actual propositions and research graph;
2. preserve epistemic distinctions;
3. answer native structural queries without source prose or a proposition oracle;
4. later map those raw structures to human terminology without changing the cold result;
5. continue useful research without promoting hypotheses or empirical claims to theorem authority?

## Required preservation

The native theory must preserve at least:

- all 59 claim identities and bodies;
- epistemic status and primary logical layer;
- exact numeric literals;
- quantification, implication, equality, negation, alternatives, and theory-level algebra/set structure;
- guards and bounded scopes;
- all 137 source claim relations;
- disproven/rejected/deferred distinctions;
- missing-law and hypothesis objects;
- central layer flow;
- structural `28`, terminal `28`, W/D/L `61`, 6x7 `30`, and 8x7 `40` as distinct objects;
- the line-hit realizability gap `R0043`;
- the optimal-selection bridge `R0052`;
- the research-method separation in `R0035`.

## Render/spec lineage

### Draft 0.1

`CONNECT4_LOGIC_002.axh` preserved research topology but not full proposition bodies. It is retained only as a structural graph prototype.

### Draft 0.2

`CONNECT4_LOGIC_002_DRAFT_0_2.axh` carries native bodies for all 59 claims.

Issue #267 independently reconstructed the complete exercised surface and exposed one specification ambiguity: variable-number reuse was not scoped precisely enough. It also motivated native theory-signature membership.

### Draft 0.3

`CORE_SPEC_DRAFT_0_3_CANDIDATE.md` added lexical variable scope and native `^0` signature membership without rewriting the 59 formula bodies.

Issue #268 independently qualified:

```text
signature closure: PASS
lexical variable scope: PASS
59/59 formula reconstruction: PASS
sidecar independence: PASS
```

Issue #268 also exposed one decoder-selection miss: an English-labelled “derivative chain” probe selected the wrong nearby relation cluster even though the correct raw `^304` edges were present and the global relation graph had been reconstructed.

### Draft 0.4

Draft 0.4 acts on that evidence without adding a logical primitive.

Artifacts:

- `../../CORE_SPEC_DRAFT_0_4_CANDIDATE.md`;
- `SEMANTIC_SIGNATURE_002_DRAFT_0_4.axh`;
- `SIGNATURE_AUDIT_002_DRAFT_0_4.md`;
- `QUALIFICATION_ASSERTIONS_002_DRAFT_0_4.json` — scorer-only;
- `COLD_DECODER_PROMPT_002_DRAFT_0_4.md`;
- `SPEC_TIGHTENING_002_DRAFT_0_4.md`.

Draft 0.4 tightens:

1. canonical bundle signature = exact theory-symbol working set;
2. native/formal probes use native selectors only;
3. human-gloss mapping occurs only after the cold result is frozen;
4. regression expected answers stay hidden from the cold decoder;
5. canonical presentation exposes structural boundaries more consistently without changing semantics.

The formula payload remains byte-identical to the independently decoded Draft 0.2 payload.

## Draft 0.4 bundle

The cold native bundle is:

```text
CORE_SPEC_DRAFT_0_2_CANDIDATE.md
+
CORE_SPEC_DRAFT_0_3_CANDIDATE.md
+
CORE_SPEC_DRAFT_0_4_CANDIDATE.md
+
SEMANTIC_SIGNATURE_002_DRAFT_0_4.axh
+
CONNECT4_LOGIC_002_DRAFT_0_2.axh
```

Author-side exact signature state:

```text
used theory symbols:     530
declared theory symbols: 530
used but undeclared:       0
declared but unused:       0
```

The human JSON glossary remains optional non-authoritative review metadata and is excluded from the cold phase.

## Qualification layers

### Q0 — expressibility

All 59 normalized claims have actual native formula structure.

**PASS author-side; independently reconstructed in #267 and #268.**

### Q1 — preservation

Statuses, relations, guards/scopes, literals, formula bodies, and central graph distinctions survive the render.

**PASS author-side; exercised reconstruction passed independently.**

### Q2 — isolated reconstruction

Fresh agents reconstruct the native corpus without source prose or proposition oracle.

**Draft 0.2 PASS (#267); Draft 0.3 PASS (#268).**

### Q3 — native structural queries

Structural queries must be selected and answered in native/raw terms.

**Draft 0.3 had one decoder miss caused by an English-labelled selector. Draft 0.4 replaces that protocol with native-only selectors and a hidden scorer assertion. Regression pending.**

### Q3b — exact signature/scoping regression

Draft 0.4 must establish:

- exactly 530 used/declared theory symbols;
- zero missing and zero extra bundle declarations;
- claim `1017` lexical sibling reuse remains valid;
- no illegal nested same-number rebinding;
- all 59 formulas remain reconstructable;
- the raw `^304` chain among `1057..1059` is selected correctly.

**Current state: pending independent execution.**

### Q4 — continuation/synthesis

After Q3b, a fresh agent reasons from the native theory bundle and attempts useful research continuation without epistemic promotion errors.

**Current state: pending.**

## Specification-growth rule

When a source proposition or cold decode exposes a load-bearing gap:

1. isolate the smallest missing distinction;
2. classify it as domain theory, representation core, serialization, or experiment protocol;
3. prefer the lowest layer that actually owns the problem;
4. preserve the motivating counterexample/result;
5. change only what the evidence supports;
6. rerun isolated qualification;
7. do not hide semantics in an oracle, adapter, English prompt, or undocumented convention.

Issue #268 is an example of a protocol/serialization pressure, not evidence for another semantic primitive.

## Non-goals

- Do not mutate Connect4.
- Do not replace Connect4 canonical research authority.
- Do not claim AxiomeSH superiority from conversion success.
- Do not make English naming mandatory for agent-native semantics.
- Do not turn empirical/hypothetical material into theorem authority.
- Do not force declarative formulas to become operational rewrites.

## Promotion rule

Candidate spec changes may move to the parent research branch only after:

```text
source/cold-decode pressure
-> minimal candidate change
-> native rerender or closure proof
-> isolated reconstruction
-> native structural reasoning qualification
-> complexity/necessity review
```
