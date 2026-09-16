# Experiment 003 — Relational S5 Epistemic Profile

**Status:** E1P/E3 candidate; author-side only  
**Native module:** `PROFILE_EPISTEMIC_S5_RELATIONAL_003.axh`  
**Dependency:** `foundations/FOUNDATION_KRIPKE_EPISTEMIC_003.axh`

## Purpose

Represent S5 epistemic authority through the shape of agent accessibility relations rather than through opaque introspection axioms attached to a knowledge token.

The profile constrains every accessibility relation owned by an epistemic model+agent pair to be:

- reflexive on model worlds;
- symmetric;
- transitive.

That makes each relation an equivalence relation on the represented worlds.

## Why this is closer to primitive

The initial benchmark description names positive and negative introspection. Those modal laws are not inserted here as primitive inference rules.

Instead the profile supplies the lower-level relation properties from which the corresponding S5 modal behavior must be derived through the native knowledge semantics in `FOUNDATION_KRIPKE_EPISTEMIC_003.axh`.

This makes the causal structure visible:

```text
accessibility relation shape
-> knowledge satisfaction semantics
-> modal laws / theorem
```

rather than:

```text
K token
+ named introspection axioms
```

## Scope

This is an S5 candidate only. It is not automatically the right profile for every epistemic benchmark.

An S4 variant should retain only the relation properties appropriate to S4 (principally reflexivity + transitivity in ordinary Kripke semantics).

FL-009 must be scored against the exact intended S4/S5 reading rather than silently using the stronger profile when the source is ambiguous.

## Qualification required

Before treating this as E3 authority:

1. cold-reconstruct the relation constraints without gloss;
2. compose with primitive knowledge satisfaction;
3. derive at least representative positive/negative introspection results from the relation structure instead of postulating them;
4. verify alias erasure of the knowledge constructor still leaves the same relational proof obligation;
5. independently review the derivation.
