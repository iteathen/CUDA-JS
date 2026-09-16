# Experiment 002 — Results

**Status:** Draft 0.3 independently qualified; Draft 0.4 tightening produced; Draft 0.4 regression pending.

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

Issue #267 independently recovered all 59 formula bodies and the complete exercised structural surface. It exposed one real specification ambiguity: variable-number reuse was not scoped precisely enough. It also made clear that native theory-symbol membership should be explicit rather than existing only in reviewer metadata.

Those findings produced Draft 0.3.

## Draft 0.3 qualification — issue #268

Draft 0.3 added:

- explicit lexical variable scope;
- legal sibling/disjoint reuse of a variable number;
- prohibition of nested same-number rebinding while the outer binding is visible;
- native `^0` theory-signature membership.

Issue #268 then ran a cold qualification followed by a post-freeze reference-backed review.

Cold/native results:

```text
signature closure: PASS
lexical variable scope: PASS
reconstruction regression: PASS
sidecar independence: PASS
```

It recovered:

- 59/59 claim bodies;
- 137 claim relations;
- 23 guards;
- 19 bounded scopes;
- 2 deferred dispositions;
- 8 layer-flow edges;
- 10 open questions;
- zero unbound variables;
- zero used-but-undeclared theory symbols;
- zero illegal nested same-number rebindings.

The Draft 0.3 signature contained 541 declared symbols, of which 530 were used and 11 were unused.

### Issue #268 decoder miss

One structural probe was answered incorrectly: the decoder selected the wrong nearby relation cluster for the English-labelled “derivative chain” request.

The correct raw relation chain was present in the native payload:

```text
(^5 1058 ^304 1057)
(^5 1059 ^304 1058)
```

The post-freeze review classified this as a decoder/protocol selection error, not missing native semantics: the global raw relation graph had been reconstructed correctly, but the cold prompt mixed human semantic wording with an intentionally withheld human glossary.

This distinction is the primary evidence behind Draft 0.4.

## Draft 0.4 tightening

Draft 0.4 acts only on recommendations supported by issue #268.

Artifacts:

- `CORE_SPEC_DRAFT_0_4_CANDIDATE.md`;
- `SEMANTIC_SIGNATURE_002_DRAFT_0_4.axh`;
- `SIGNATURE_AUDIT_002_DRAFT_0_4.md`;
- `QUALIFICATION_ASSERTIONS_002_DRAFT_0_4.json` — scorer-only;
- `COLD_DECODER_PROMPT_002_DRAFT_0_4.md`;
- `SPEC_TIGHTENING_002_DRAFT_0_4.md`.

### Exact canonical bundle signature

Draft 0.4 defines the canonical self-contained bundle signature as the exact set of theory-owned symbols actually used by the body.

For Experiment 002:

```text
used theory symbols:     530
declared theory symbols: 530
used but undeclared:       0
declared but unused:       0
```

The 11 unused Draft 0.3 declarations are removed from the canonical bundle signature. Broader reusable theory-family vocabularies may exist separately but are not the bundle working-set signature.

### Native/formal probes separated from human gloss

Cold formal probes must identify targets using native/raw selectors only. Human semantic naming is measured only after the cold result is frozen.

A naming miss cannot retroactively invalidate a correct raw reconstruction. A wrong raw relation/literal/binder/formula answer remains a native failure.

### Derivative-chain regression

The exact expected raw chain is now scorer authority hidden from the decoder. The Draft 0.4 cold prompt selects the target structurally without exposing the expected answer.

### Canonical presentation profile

Draft 0.4 adds non-semantic presentation guidance intended to reduce decoder effort:

- direct scope/choice members on separate lines;
- consistent nesting indentation;
- visually contiguous infix propositions;
- deterministic increasing-ID signature serialization.

Whitespace remains semantically inert. No new logical primitive or string-label mechanism was added.

## Current qualification state

```text
Experiment 001 / Draft 0.1 synthetic structural reconstruction: PASS on exercised surface

Experiment 002 Draft 0.1 full logical expressibility:
  FAIL -> specification pressure

Draft 0.2:
  full 59-claim native render: COMPLETE
  isolated reconstruction: PASS (#267)
  issue: variable scope wording
  issue: signature membership not native

Draft 0.3:
  lexical scoping: PASS (#268)
  native signature closure: PASS (#268)
  59/59 reconstruction regression: PASS (#268)
  one English-labelled structural probe: DECODER MISS (#268)

Draft 0.4:
  exact 530-symbol bundle signature: PASS author-side
  native-only cold protocol: FROZEN
  derivative-chain hidden regression assertion: ADDED
  independent Draft 0.4 regression: PENDING

Q4 continuation/synthesis from native theory alone: PENDING
```

No compression, latency, reasoning-superiority, or synthesis-superiority claim is made yet. Those require controlled baselines after the representation and qualification protocol stabilize.
