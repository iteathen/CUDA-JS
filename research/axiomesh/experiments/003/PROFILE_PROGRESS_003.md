# Experiment 003 — E3 Proof-Profile Progress

**Status:** active; advanced profile construction gated on primitive semantic decomposition  
**Branch:** `experiment/axiomesh-native-reconstruction`

## Existing candidate modules

### Classical propositional

- `profiles/PROFILE_CLASSICAL_PROPOSITIONAL_003.axh`
- `profiles/PROFILE_CLASSICAL_PROPOSITIONAL_003.md`

The module carries explicit native derivability/context rules for implication, constructive connectives, negation, bottom, and double-negation elimination. Classicality is profile-owned rather than inherited from AxiomeSH core or model priors.

**Draft 0.7 disposition:** retain as a candidate, but audit every named rule under the primitive/derived distinction before calling the profile E3-complete.

### Intuitionistic propositional

- `profiles/PROFILE_INTUITIONISTIC_PROPOSITIONAL_003.axh`
- `profiles/PROFILE_INTUITIONISTIC_PROPOSITIONAL_003.md`

The module deliberately omits double-negation elimination and other classical completion principles.

**Draft 0.7 disposition:** retain as a candidate; connect `derivable`/proof-property claims to explicit proof-object/rule structure before FL-015 is proof-qualified.

These modules create an explicit experimental seam for FL-001 versus FL-014/FL-015, but existence of named native rules is not by itself primitive-semantic qualification.

## Draft 0.6 specification pressure

Construction of the FOL/equality profile reached a representation-general boundary before a sound module could be committed.

Quantifier proof rules require capture-avoiding instantiation of a first-class bound body. Draft 0.5 can package the body as `\?n BODY` but does not define a native operation that instantiates it.

Naming a profile-local substitution predicate would hide the missing semantics rather than solve it.

Artifacts:

- `SPEC_PRESSURE_003_BINDER_INSTANTIATION.md`
- `../../CORE_SPEC_DRAFT_0_6_CANDIDATE.md`
- `instantiation/`

Draft 0.6 proposes structural abstraction instantiation via `@@` and abstraction-valued quantifier structure. Independent cold qualification is still pending, so FOL/HOL profile work remains blocked on that dependency.

## Draft 0.7 semantic-decomposition correction

The next pressure is broader than binder substitution.

Stable `^n` identities must not become a shortcut for importing conventional logic operators as opaque semantics.

Governing rule:

```text
named operator
-> semantic definition
-> native relational/state construction
-> primitive model leaves
```

See:

- `../../CORE_SPEC_DRAFT_0_7_CANDIDATE.md`
- `PRIMITIVE_DECOMPOSITION_AUDIT_003.md`

This changes the execution order for advanced profiles.

## Required semantic foundations

Before modal/temporal/deontic/spatial/HOL profiles can be E3-complete, build and qualify reusable lower-level foundations for:

1. possible worlds, accessibility, atomic valuation, recursive satisfaction;
2. public-announcement model restriction and repeated update;
3. traces, positions, successor/order/reachability, temporal satisfaction;
4. branching transition systems and generated paths;
5. selected normative/deontic model structure;
6. heaps/resources, disjoint partition/union, program state transition;
7. higher-order function/predicate objects and explicit application;
8. proof objects/derivation trees and rule applications;
9. finite paths / reflexive-transitive closure over primitive step relations;
10. finite-index expansion/fold/parity structure for concrete hardness instances.

Named formal operators may remain only as transparent derived aliases whose native expansions are present and alias-erasure-safe.

## Revised execution order

1. independently qualify Draft 0.6 structural instantiation;
2. audit the existing classical/intuitionistic candidates under Draft 0.7;
3. construct primitive semantic foundations by shared relational ownership, not by benchmark notation;
4. build FOL/equality on qualified binding/instantiation;
5. build epistemic/modal profiles from world/accessibility/satisfaction foundation;
6. build DEL from explicit model restriction/update;
7. build LTL/CTL from temporal/branching state structures;
8. build separation/dynamic logic from heap/resource/program structures;
9. build HOL/type/meta-theory from explicit function/proof structures;
10. run alias-erasure qualification before any E3/E4 claim;
11. run E2 statement reconstruction independently of later E3 modules.

Do **not** continue by assigning IDs to named operators and treating that as semantic completion.

## Evidence discipline

The committed profile and benchmark files are candidates/scaffolds only. They are not theorem proofs and do not change `RESULTS_003.md` proof status until:

```text
source fidelity
-> primitive decomposition
-> alias-erasure audit
-> complete profile
-> proof execution
-> independent proof review
```

Any representation pressure discovered while constructing these foundations must feed back into the candidate spec rather than being hidden inside profile-local callbacks or semantic helper predicates.
