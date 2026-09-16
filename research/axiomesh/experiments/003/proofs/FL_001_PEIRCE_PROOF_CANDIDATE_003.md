# Experiment 003 — FL-001 Peirce Proof-Term Candidate

**Status:** author-side proof candidate; not independently validated  
**Native candidate:** `FL_001_PEIRCE_PROOF_CANDIDATE_003.axh`

## Purpose

Exercise the Draft 0.7 direction on the simplest classical benchmark using an explicit proof term instead of an opaque `derivable` fact.

The candidate depends on:

- `foundations/FOUNDATION_PROOF_OBJECT_003.axh`;
- `profiles/PROFILE_ND_CONSTRUCTIVE_BASE_003.axh`;
- `profiles/PROFILE_ND_CLASSICAL_PRIMITIVE_003.axh`.

## Construction

For arbitrary proposition terms `P` and `Q`, prove:

```text
((P -> Q) -> P) -> P
```

The proof term encodes this ordinary classical natural-deduction argument:

1. assume `H : (P -> Q) -> P`;
2. to obtain `P`, use classical double-negation elimination;
3. assume `not P`;
4. construct `P -> Q`:
   - assume `P`;
   - `P` with `not P` gives bottom;
   - bottom elimination gives `Q`;
   - discharge `P`;
5. apply `H` to that `P -> Q`, yielding `P`;
6. combine with `not P` to obtain bottom;
7. discharge `not P`, yielding `not not P`;
8. apply the classical-only DNE proof constructor, yielding `P`;
9. discharge `H`.

## Why this is not an E4 claim yet

The `.axh` file packages a proof candidate under `^8930`; it does **not** assert `^8800 concludes(...)` as a primitive fact.

A proof validator must recursively establish the conclusion from the native proof-term constructor rules.

This distinction is deliberate:

```text
proof candidate data != validated proof judgement
```

## Classical/intuitionistic boundary

All steps except double-negation elimination come from the shared constructive proof-term base.

The only classical-only constructor is `^8922`, supplied by the classical profile.

Therefore the same proof term must fail validation when the classical extension is removed. That negative control is part of qualification.

## Qualification cases

A cold validation pass should check:

1. the proof validates under the classical profile;
2. the outer conclusion exactly matches FL-001;
3. every assumption is a member of the context in which it is used;
4. every implication-introduction constructor discharges the intended assumption;
5. every negation step terminates in the profile bottom constant;
6. removing `^8922` / using the intuitionistic profile makes this candidate invalid;
7. no hidden theorem/prover relation is consulted.

Until those checks pass independently, this is author-side construction evidence only.
