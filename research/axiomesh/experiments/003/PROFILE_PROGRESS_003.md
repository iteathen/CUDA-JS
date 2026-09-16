# Experiment 003 — E3 Proof-Profile Progress

**Status:** active  
**Branch:** `experiment/axiomesh-native-reconstruction`

## Completed candidate modules

### Classical propositional

- `profiles/PROFILE_CLASSICAL_PROPOSITIONAL_003.axh`
- `profiles/PROFILE_CLASSICAL_PROPOSITIONAL_003.md`

The module carries explicit native derivability/context rules for implication, constructive connectives, negation, bottom, and double-negation elimination. Classicality is therefore profile-owned rather than inherited from AxiomeSH core or model priors.

### Intuitionistic propositional

- `profiles/PROFILE_INTUITIONISTIC_PROPOSITIONAL_003.axh`
- `profiles/PROFILE_INTUITIONISTIC_PROPOSITIONAL_003.md`

The module deliberately omits double-negation elimination and other classical completion principles.

These two modules create an explicit experimental seam for FL-001 versus FL-014/FL-015.

## New specification pressure discovered

Construction of the FOL/equality profile reached a representation-general boundary before a sound module could be committed.

Quantifier proof rules require capture-avoiding instantiation of a first-class bound body. Draft 0.5 can package the body as `\?n BODY` but does not define a native operation that instantiates it.

Naming a profile-local substitution predicate would hide the missing semantics rather than solve it.

Artifacts:

- `SPEC_PRESSURE_003_BINDER_INSTANTIATION.md`
- `../../CORE_SPEC_DRAFT_0_6_CANDIDATE.md`

Draft 0.6 proposes structural abstraction instantiation via `@@` and abstraction-valued quantifier structure.

## Execution order

Do not build the remaining quantifier/higher-order profiles on an unqualified substitution convention.

Next:

1. qualify Draft 0.6 binding/instantiation on focused structural cases;
2. if it passes, build FOL+equality and HOL/type profile modules using the qualified operation;
3. continue modal/temporal/spatial profiles independently because those operators do not require binder substitution merely to state their basic proof laws;
4. run E2 for the original 18-benchmark statement bundle in an isolated context independently of these later E3 modules.

## Evidence discipline

The committed profile files are E3 candidates only. They are not theorem proofs and do not change `RESULTS_003.md` proof status until independent profile/proof qualification occurs.
