# Experiment 003 — Intuitionistic Propositional Proof Profile

**Status:** E3 candidate profile; author-side only  
**Native module:** `PROFILE_INTUITIONISTIC_PROPOSITIONAL_003.axh`

## Purpose

Provide an explicit native natural-deduction authority for intuitionistic propositional benchmarks such as FL-014 and the object-level basis needed by the FL-015 disjunction-property meta-benchmark.

## Native symbols

| Symbol | Reviewer gloss |
|---|---|
| `^6100` | derivable(context, formula) |
| `^6101` | member(formula, context) |
| `^6102` | extend(context, formula) |
| `^6103` | bottom / falsity constant |
| `^6104` | profile attachment |
| `^6105` | intuitionistic-propositional profile identity |
| `^6106` | inference-rule attachment |
| `^6107` | distinguished constant attachment |

The native signature is exact for this module.

## Rules represented

The profile contains:

- assumption;
- implication introduction/elimination;
- context extension and weakening;
- constructive negation introduction/elimination;
- bottom elimination;
- conjunction introduction/elimination;
- disjunction introduction/elimination.

It deliberately omits:

- double-negation elimination;
- excluded middle as an axiom;
- Peirce's law as an axiom;
- any other classical completion principle.

The omission is load-bearing evidence for Experiment 003: FL-001 must not become derivable merely because a model knows classical logic, while FL-014 should remain provable constructively.

## Relation to the classical module

This is a separate native profile, not a switch on `PROFILE_CLASSICAL_PROPOSITIONAL_003.axh`.

The two modules intentionally duplicate the shared constructive rule substrate so the cold proof bundle for an intuitionistic benchmark contains no dormant classical rule whose accidental use would need to be policed externally.

## Qualification limits

This module does not by itself establish the disjunction-property meta-theorem. FL-015 additionally needs an explicit native relation over proof objects or normal derivations sufficient to state and verify proof extraction.

That is a separate E3 module and should not be hidden in the object-level derivability relation.
