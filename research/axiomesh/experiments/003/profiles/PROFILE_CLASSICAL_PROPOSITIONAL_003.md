# Experiment 003 — Classical Propositional Proof Profile

**Status:** E3 candidate profile; author-side only  
**Native module:** `PROFILE_CLASSICAL_PROPOSITIONAL_003.axh`

## Purpose

Provide an explicit native natural-deduction authority for classical propositional benchmarks without making classical proof theory part of AxiomeSH core semantics.

The module is intended for benchmarks such as FL-001 and as the propositional base of classical FOL modules.

## Native symbols

The module-local signature is exact.

| Symbol | Reviewer gloss |
|---|---|
| `^6000` | derivable(context, formula) |
| `^6001` | member(formula, context) |
| `^6002` | extend(context, formula) |
| `^6003` | bottom / falsity constant |
| `^6004` | profile attachment |
| `^6005` | classical-propositional profile identity |
| `^6006` | inference-rule attachment |
| `^6007` | distinguished constant attachment |

Human gloss is review metadata only; native proof execution uses the raw identities and formulas.

## Rules represented

The module contains explicit schemas for:

- assumption;
- implication elimination;
- implication introduction/discharge;
- immediate membership of an extended assumption;
- weakening;
- negation introduction;
- negation elimination to bottom;
- bottom elimination;
- double-negation elimination;
- conjunction introduction and elimination, using formula scopes;
- disjunction introduction and case elimination, using choice terms.

Classicality is carried specifically by the double-negation-elimination rule. Removing that rule yields the intended base for the intuitionistic profile rather than relying on an implicit model prior.

## Context model

Proof contexts are theory-level terms. `^6002` constructs an extended context; `^6001` exposes assumption membership; `^6000` is the derivability relation.

This profile deliberately does not assign special core semantics to contexts, turnstiles, assumptions, or proof judgments.

## Qualification limits

This file is not yet E4 proof evidence.

Before claiming FL-001 proved natively:

1. compose the benchmark with this profile under an exact bundle signature;
2. run a fresh proof agent without importing additional classical axioms;
3. require a derivation whose steps instantiate only declared profile rules;
4. independently review the proof.

The module currently provides a proof-rule substrate, not a proof result.
