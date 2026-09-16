# Experiment 002 — Draft 0.3 Tightening after Cold Decode #267

**Trigger:** isolated Draft 0.2 qualification in CUDA-JS issue #267  
**Branch:** `experiment/axiomesh-native-reconstruction`  
**Connect4 source:** unchanged, read-only at `0e5e29e4ca4fd3941bdcffe70a52b66348705589`

## Independent result retained

Issue #267 independently recovered:

- 59 claim objects and 59 native claim bodies;
- the exact status partition;
- all 137 claim relations;
- 23 guard attachments;
- 19 bounded-scope attachments;
- two deferred dispositions;
- eight high-level layer-flow edges;
- ten first-class open-question objects;
- all frozen structural probes.

It found no opaque proposition placeholders, no demonstrable literal/identity confusion, and no unbound variable under ordinary lexical binding.

Those results qualify the Draft 0.2 formula payload on the exercised surface and remain frozen evidence.

## Finding A — variable-number scope wording

The decoder found one real specification ambiguity.

Claim `1017` contains disjoint sibling binders:

```text
~*?0[ ... ]
+?0[ ... ]
```

Draft 0.2 said variable-number shadowing was forbidden “within one serialized theory object.” That wording could be read as file-global, proposition-global, or lexical.

The intended structure is lexical. The two sibling `?0` binders are distinct because their scopes do not overlap.

### Tightening

Draft 0.3 replaces the old rule with:

- binders own variables only in their lexical term;
- sibling/disjoint binders may reuse the same variable number;
- separate claim bodies may reuse variable numbers;
- nested rebinding of a still-visible number is forbidden in Draft 0.3;
- bound-variable alpha-renaming is legal when capture-free.

This removes the only parse ambiguity reported by #267.

## Finding B — semantic signature boundary

The decoder recovered the complete formal topology but correctly refused to guess English names for primitive semantic symbols such as `^1120` or `^1253`.

That is not itself a failure: AxiomeSH semantic symbols are intended to be agent-native stable identities, not English identifiers.

However, the theory did not natively declare which `^n` symbols belonged to its signature; that inventory lived only in the reviewer JSON glossary.

### Tightening

Draft 0.3 reserves core marker `^0` for a native signature declaration:

```text
[
  (^0 [
    ^1
    ^2
    ...
  ])
]
```

Experiment 002 now contains:

`SEMANTIC_SIGNATURE_002_DRAFT_0_3.axh`

with the complete theory-owned symbol inventory.

The human JSON glossary remains review metadata only. It is no longer the only place where signature membership is recorded.

## Why English labels were not added

The cold decoder's inability to translate opaque symbols into English is not a reason to make English part of canonical core.

That would conflict with the project objective:

```text
native structural semantics != human naming
```

A primitive theory symbol may legitimately be primitive. Its formal role is carried by identity, application, formulas, relations, axioms and constraints.

A human-readable label can remain optional metadata unless a later experiment shows that native string labels materially improve agent reasoning enough to justify their cost.

## Draft 0.3 theory bundle

The tightened Experiment 002 bundle is:

```text
CORE_SPEC_DRAFT_0_2_CANDIDATE.md
CORE_SPEC_DRAFT_0_3_CANDIDATE.md
SEMANTIC_SIGNATURE_002_DRAFT_0_3.axh
CONNECT4_LOGIC_002_DRAFT_0_2.axh
```

The formula payload is intentionally unchanged from the independently decoded Draft 0.2 payload. The tightening changes only the specification of variable scope and native signature closure.

## New qualification target

A fresh decoder must now establish:

1. claim `1017` is unambiguous under lexical scope;
2. every theory-owned semantic symbol used by the formula payload is declared in the native signature;
3. no undeclared semantic symbol is required;
4. the external human glossary is unnecessary for structural/formal probes;
5. inability to guess an English label is not treated as formal loss;
6. all previously passed structural probes still pass.

This is a narrower regression/closure test, not a reset of Experiment 002.
