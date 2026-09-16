# Experiment 003 — Initial Formalization Audit

## Structural counts

Author-side construction checks for `FORMAL_LOGIC_BENCHMARKS_003.axh`:

```text
benchmark objects:              18
semantic symbols used:         135
semantic symbols declared:     135
used but undeclared:             0
declared but unused:             0
premise attachments:            15
benchmarks with premises:        7
parameter attachments:           2
required-construct attachments:  3
lexical abstraction occurrences: 9
```

Domain partition by raw `^2` value:

```text
^100  3
^101  4
^102  3
^103  3
^104  2
^105  3
```

Benchmark-mode partition by raw `^7` value:

```text
^300  12
^301   3
^302   1
^303   1
^304   1
```

Proof-readiness partition by raw `^9` value:

```text
^350  5
^351  3
^352  2
^353  8
```

Every profile ID `^200..^217` is represented by exactly one initial benchmark.

## Draft 0.5 abstraction exercise

The payload contains nine lexical abstraction occurrences. They occur in finite-index/fold structure, graph-edge mapping, epistemic indexed disjunction, a higher-order lambda-shaped required construct, and a dependent-product-shaped required construct.

This is deliberate: Draft 0.5's new abstraction is exercised by more than one domain rather than existing solely for the higher-order examples.

## What the payload proves author-side

The initial payload demonstrates that the supplied benchmark **shapes** can be represented without introducing core primitives for modal, temporal, deontic, spatial, type, parity, or proof operators.

It does not prove that those theory-level choices are optimal, nor that the benchmark theorems are derivable.

## Incomplete proof problems retained explicitly

### FL-004 Steamroller

The native bundle contains the existential conclusion and an explicit axiom-set dependency object, but not yet the complete TPTP/Pelletier premise set. This benchmark is **not E1-complete at the premise-body level** and cannot enter E3/E4 until the exact source axioms are imported.

### FL-002 / FL-003 / FL-008

These are families. PHP has initial `n=3,4,5` measurement parameters; muddy children has initial `2,3,4` group-size parameters. XOR still requires a frozen concrete expander graph fixture.

### FL-009 / FL-010 / FL-011 / FL-012 / FL-013 / FL-015 / FL-016 / FL-017

Their statements are represented, but proof validity depends on a native logic/profile module not included in the statement bundle.

### FL-016 Cantor

The formula is the supplied formula. It is intentionally not rewritten into the canonical no-surjection theorem. A separate normalization decision is required before standard-Cantor proof scoring.

### FL-018 Church–Rosser

The confluence property and dependent-product pressure are represented, but the concrete reduction relation/inductive theory is not. The benchmark remains a property schema at E1.

## Source-fidelity conclusion

The suite is ready for an E2 cold reconstruction of what is actually present.

It is **not** yet correct to report “18 complete proof problems”. The accurate current statement is:

> 18 benchmark objects are native; their supplied formulas/proof obligations are represented to the degree the source input makes them explicit; missing instances, premise sets, and proof profiles remain first-class readiness state rather than hidden assumptions.
