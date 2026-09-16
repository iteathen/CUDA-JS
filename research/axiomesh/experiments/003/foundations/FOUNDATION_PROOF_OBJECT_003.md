# Experiment 003 — Explicit Proof-Object Foundation

**Status:** E1P candidate; author-side only  
**Native module:** `FOUNDATION_PROOF_OBJECT_003.axh`

## Purpose

Replace opaque theorem/derivable facts with explicit proof terms.

The foundation does not know the rules of any particular logic. It supplies only the shared structural interface needed for profile-owned proof constructors.

## Native roles

| Symbol | Role |
|---|---|
| `^8800` | `concludes(profile, context, proof_term, formula)` |
| `^8801` | empty context constant |
| `^8802` | context extension constructor |
| `^8803` | context membership relation |
| `^8804` | theorem alias |

## Context construction

A context is a nested native term built from:

```text
^8801
(^8802 context formula)
```

Membership is defined recursively:

1. the newest formula belongs to the extended context;
2. anything belonging to the prior context still belongs after extension.

No host list or environment is required.

## Proof terms, not proof booleans

The key relation is:

```text
(^8800 profile context proof formula)
```

A logic profile defines which proof-term constructors can inhabit this relation and under which premise-proof relations.

The foundation itself supplies **no primitive `^8800` facts**.

Therefore a valid proof must be constructible from the profile's native inference schemas rather than asserted by an opaque theorem oracle.

## Derived theorem alias

`^8804 profile formula` is explicitly defined as:

```text
exists proof.
  concludes(profile, empty_context, proof, formula)
```

This makes theoremhood alias-erasure-safe:

```text
theorem(profile,A)
-> exists concrete proof term p
-> native conclusion relation for p
```

A meta-theorem such as the intuitionistic disjunction property can quantify over actual proof terms instead of a magic `provable(A)` bit.

## Profile responsibility

Each profile must define native proof constructors and exact conclusion rules, for example:

```text
assumption(formula)
imp_elim(proof_imp, proof_arg)
imp_intro(assumption_formula, subproof)
```

The profile owns whether additional constructors such as double-negation elimination are admissible.

The proof term itself records the derivation tree recursively because its constructor contains its premise proof terms.

This avoids a second graph of opaque “proof step IDs” unless a later experiment shows explicit sharing/DAG structure is necessary for proof-size efficiency.

## Why this is more primitive than the first profile candidates

The original classical/intuitionistic profile candidates used a relation glossed as:

```text
derivable(context, formula)
```

with inference implications over that relation.

That is structurally useful, but it leaves derivation existence abstract and is insufficient for FL-015 proof-object/meta-theorem qualification.

The new direction is:

```text
proof constructor tree
-> native concludes relation
-> optional theorem alias
```

so the actual derivation remains inspectable.

## E5 consequence

An independent reviewer can recursively inspect the proof term and match each constructor against the native profile rule that defines its conclusion.

No external proof trace format is needed for the exercised propositional surface.

## Qualification needed

Before this foundation becomes E3 authority:

1. cold-reconstruct context membership;
2. cold-reconstruct theorem alias erasure;
3. compose with an intuitionistic proof-term profile;
4. prove a small theorem and independently validate each constructor;
5. verify adding the classical-only proof constructor changes Peirce/DNE behavior without changing the shared constructive base;
6. measure whether tree duplication requires an explicit proof-DAG sharing layer.

## Falsifiers

Revise the foundation if:

- proof-term trees cannot represent sharing without unacceptable blow-up;
- `concludes` requires hidden host semantics after profile constructors are supplied;
- context construction loses scope/discharge distinctions;
- a simpler native structure exposes proof dependencies more directly;
- cold proof review cannot identify every admissible inference from the proof term alone.
