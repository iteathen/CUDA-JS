# Experiment 001 — Results Log

**Branch:** `experiment/axiomesh-native-reconstruction`  
**Experiment:** Native Reconstruction  
**Current phase:** frozen-corpus preflight complete; independent cold decode pending  

## Frozen execution set

The first execution slice is now frozen as 12 synthetic cases:

```text
P01-P04  plain relational structures
S01-S02  nested-scope structures
R01-R02  rewrite systems
I01-I02  isomorphic-pair cases
N01-N02  near-isomorphic adversarial pairs
```

Three representation families exist for the same semantic cases:

```text
AXIOMESH_001.md
JSON_BASELINE_001.json
NATURAL_LANGUAGE_001.md
```

Scoring authority is isolated in:

```text
CORPUS_001_ORACLE.json
```

The frozen decoder contract is:

```text
COLD_DECODER_PROMPT.md
```

## Author-side structural preflight

This is **not qualification evidence** because the same research context that generated the cases performed the check. It exists only to prevent obvious bad fixtures from consuming cold-decoder runs.

### P01

Expected exact structure: three ordered hyperedges in one unordered scope. Atoms `27`, `63`, and `88` each occur in two edges. AxiomeSH payload preserves all three shared identities.

Preflight: PASS.

### P02

The two four-position edges differ only by the order of atoms `72` and `18` in positions 3 and 4. Draft 0.1 declares edge positions significant.

Preflight: PASS.

### P03

Shared identity multiplicities are preserved: `70` occurs three times, `12` occurs three times, and `95` occurs twice.

Preflight: PASS.

### P04

The payload contains four explicit edges and preserves the repeated motif without introducing a macro or equality relation.

Preflight: PASS.

Observation: this case does **not** yet test `@` reference semantics. Draft 0.1 references remain an unqualified seam and should receive a dedicated later case because pointer-vs-macro occurrence semantics must not be assumed.

### S01

The nested scope contains exactly two edges. Atoms `24` and `91` cross the nested boundary through shared identity without being redeclared.

Preflight: PASS.

### S02

The two nested scopes remain siblings. Their internal connector identities (`74` and `57`) remain distinct while `17`, `93`, `29`, and `82` connect them to outer-scope edges.

Preflight: PASS.

### R01

Both rewrite rules match `(7 42 13)`. With no rule priority, exactly two immediate rewrite applications are expected: one replacing the matched edge with `(8 42 13)`, the other with `(9 42 13)`. The rules themselves remain in the containing scope.

Preflight: PASS under frozen Draft 0.1 rewrite semantics.

### R02

Binding `?0=26` satisfies positive `(3 ?0)` and negative absence of `(4 ?0)`. Binding `?0=71` is blocked by `(4 71)`. Exactly one immediate application is expected, adding `(5 26)` while preserving `(3 26)`.

Preflight: PASS under frozen Draft 0.1 negative-application semantics.

### I01

A complete isomorphism witness exists:

```text
12->7
44->90
71->31
39->56
85->22
63->48
```

Every ordered edge is preserved.

Preflight: PASS.

### I02

A complete scope-preserving isomorphism witness exists:

```text
2->83
10->54
18->11
31->25
47->69
52->40
66->72
70->96
```

Outer member order and nested member order differ between serializations but those scopes are unordered. Edge position and nesting are preserved.

Preflight: PASS.

### N01

The cases are not isomorphic. Mapping the first left edge to the first right edge requires `26->41` and `41->26`, but the second edge then places the image of `41` in position 2 where the right second edge requires `41`. Mapping the first left edge to the right second edge also fails the second-position constraint for the remaining edge.

Preflight: PASS as an adversarial non-isomorph.

### N02

The cases have the same three edge incidences but assign different edges to the nested scope. Any isomorphism must map the singleton nested edge on the left to the singleton nested edge on the right. That forces an atom mapping inconsistent with either remaining outer edge.

Preflight: PASS as an adversarial scope-boundary non-isomorph.

## First discovered seam before cold decode

The corpus preflight already exposed one intentionally unresolved Draft 0.1 area worth isolating rather than smearing into the first run:

> `@` reference reuse has not yet been given a fixture that distinguishes textual macro expansion from any possible notion of referenced structural occurrence identity.

Experiment 001 therefore does not claim reference qualification. A later dedicated case should force this distinction explicitly.

## Qualification boundary

No cold-reconstruction result is recorded yet.

The current ChatGPT conversation is disqualified as decoder evidence because it contains the oracle-generation history and expected relations. A valid next result must come from a genuinely isolated model instance receiving only:

```text
frozen Draft 0.1 spec
+ COLD_DECODER_PROMPT.md instruction block
+ one case payload
```

and no oracle, neighboring representation, or prior attempt.

Until that happens, the experiment status remains:

```text
fixture-preflight: PASS
cold-reconstruction: NOT RUN
reasoning-probes: NOT RUN
representation-comparison: NOT RUN
```
