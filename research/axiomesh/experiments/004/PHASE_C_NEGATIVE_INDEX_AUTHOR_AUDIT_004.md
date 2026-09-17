# Experiment 004 — Negative / Index Author Audit

**Status:** author-side fixture review only

## Q004-14

### Subcase #1

The V0 scopes contain one versus two direct `^5410` relation occurrences.

A V0 isomorphism is bijective over included structure, so direct occurrence cardinality already separates the pair.

Expected disposition: certified non-isomorphic using the explicit structural count invariant; no search failure inference is needed.

### Subcase #2

Both scopes are two-leaf stars under rigid `^5410` and are V0-isomorphic.

One witness:

```text
20->30
21->31
22->32
```

The supplied test run record deliberately states only an incomplete/bounded no-witness outcome. Therefore it cannot justify certified non-isomorphism.

This guards the protocol distinction:

```text
NO_WITNESS_FOUND != CERTIFIED_NON_ISOMORPHIC
```

## Q004-15

The fixture index is intentionally view-sensitive because it uses the raw stable-head numeric label.

Under V0:

```text
^5500 rigid != ^5501 rigid
```

so the raw-label mismatch is a valid separating invariant for the exact single-edge fixture.

Under VS with an explicit `^5500 <-> ^5501` bijection, that fingerprint is not invariant under the permitted relation. It cannot safely prune the pair.

The underlying local-ID map `40->50`, `41->51` then gives a mapped-signature isomorphism.

## State

```text
hidden assertions: FROZEN
cold prompt: FROZEN
isolated run: PENDING
```
