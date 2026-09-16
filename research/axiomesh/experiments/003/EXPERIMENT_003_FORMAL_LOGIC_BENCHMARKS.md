# Experiment 003 — Cross-Logic Proof Benchmark Campaign

**Branch:** `experiment/axiomesh-native-reconstruction`  
**Candidate spec lineage:** Draft 0.5 → Draft 0.6 → Draft 0.7  
**Status:** benchmark corpus constructed; primitive semantic decomposition now mandatory before proof qualification

## Purpose

Experiment 003 tests whether AxiomeSH can represent and support agent reasoning across formal systems whose proof rules differ materially, rather than succeeding only on one structural research corpus.

The suite contains 18 benchmark families spanning:

- classical propositional logic;
- SAT/CNF hardness and parity;
- first-order logic and equality;
- modal/epistemic/deontic logic;
- temporal and program logic;
- intuitionistic/constructive logic;
- higher-order logic and type theory.

The primary risk is not syntax coverage. The risk is semantic disguise: reproducing conventional notation as opaque native IDs would preserve names while hiding the relational structure AxiomeSH is intended to expose.

## Governing rules

For every benchmark:

```text
statement representation != primitive semantic construction != proof profile != proof != reviewed proof
```

and:

```text
named operator
-> semantic definition
-> native relational/state construction
-> primitive model leaves
```

A named operator represented only as `^n` is not primitive-semantic completion.

## Gates

### E0 — source fidelity

Preserve the supplied theorem/premises/domain/test intent without silently repairing under-specified or noncanonical statements.

### E1 — native statement expressibility

Represent every supplied load-bearing statement distinction natively:

- formula structure;
- literal values;
- quantifiers/binding;
- higher-order abstraction where required;
- logic-profile identity;
- premises versus goal;
- parameterization;
- consistency/meta-theorem status;
- proof-readiness gate.

A sidecar may give human names but may not contain formula structure missing from the payload.

The existing `FORMAL_LOGIC_BENCHMARKS_003.axh` is primarily this statement/formalization scaffold.

### E1P — primitive semantic decomposition

Every conventional derived operator used by the proof obligation must be grounded in a native construction over core forms plus explicitly identified primitive model leaves.

This gate rejects semantic shortcuts such as:

```text
^knowledge
^globally
^obligation
^separating_conjunction
^provable
^closure
```

when those IDs merely rename known compound semantics.

A compact alias may remain only if its native definition is present and exact.

### E1A — alias-erasure audit

For every retained derived alias:

```text
alias bundle
-> native expansion / erase alias
-> primitive-normal obligation
```

must preserve the load-bearing formal problem.

### E2 — cold reconstruction

A fresh decoder receives only the applicable specs, native signature, frozen cold prompt, and native benchmark bundle. It reconstructs all benchmark objects and reports ambiguity or hidden dependency.

E2 statement reconstruction does not imply E1P.

### E3 — proof-profile completeness

Each benchmark receives a self-contained native proof/semantic profile sufficient to determine admissible proof steps. The profile must depend on primitive semantic foundations rather than model priors or opaque host operations.

### E4 — proof execution

A fresh agent must produce the appropriate result:

- derivation/proof object;
- countermodel/non-derivability result;
- consistency result;
- extracted witness/program;
- parameterized proof result.

Proof objects must expose the actual rule/dependency structure used.

### E5 — independent proof review

Review each proof step against the supplied profile and primitive semantic foundations. Record correctness, proof size, search effort, representation difficulty, alias expansion, and any semantic leakage.

## Specification pressure lineage

### Draft 0.5 — first-class lexical abstraction

Experiment 003 exposed a need for a bound body that does not itself assert quantification:

```text
\?n term
```

Lambda, Pi, set-builder, folds, etc. are not automatically core semantics of this binder.

### Draft 0.6 — structural instantiation

FOL/equality profile construction exposed the need to instantiate a bound native body without hidden host substitution:

```text
ABSTRACTION @@ ARGUMENT
```

The focused author-side case bundle exists under `instantiation/`; independent cold qualification is still pending.

### Draft 0.7 — primitive semantic decomposition

Review of the cross-logic scaffold showed that theory-owned symbols alone are too permissive as a semantic boundary.

Draft 0.7 requires transparent construction of derived logic operators from shared lower-level structures and explicitly identified primitive model leaves.

Artifacts:

- `../../CORE_SPEC_DRAFT_0_7_CANDIDATE.md`
- `PRIMITIVE_DECOMPOSITION_AUDIT_003.md`
- `PRIMITIVE_FOUNDATION_ARCHITECTURE_003.md`

## Primitive versus derived examples

Potential primitive model leaves include:

- atomic proposition valuation;
- domain/object identities and source predicate facts;
- one-step accessibility/transition/reduction edges;
- heap address/value incidence;
- source algebraic operations constrained by explicit axioms.

Presumptively derived constructions include:

- finite AND/OR folds;
- XOR/parity evaluation;
- biconditional;
- epistemic knowledge/common knowledge;
- public-announcement update;
- deontic obligation/permission after choosing a semantics;
- LTL/CTL operators;
- separating conjunction/Hoare validity/frame rule;
- theorem/derivability predicates;
- reflexive-transitive closure;
- higher-order application/lambda/Pi behavior used by proofs.

These derived forms may retain compact names only after their native expansions exist.

## Benchmark families

Native benchmark objects are `3001..3018`, corresponding in order to `FL-001..FL-018` in `SOURCE_BENCHMARKS_003.md`.

The initial native bundle preserves source statement structure and readiness. It is not the final primitive-normal form for every logic.

## Source caveats retained as test data

- PHP, XOR parity, and muddy children are families requiring frozen concrete instances for measured runs.
- Steamroller requires exact premise import before proof scoring.
- Chisholm is a profile-sensitive consistency benchmark and cannot receive a generic obligation semantics by convenience.
- Cantor's supplied statement is preserved but is not silently equated with the canonical no-surjection theorem.
- Well-founded induction requires explicit well-foundedness authority.
- Church–Rosser requires a concrete reduction/inductive theory.

These caveats are source fidelity, not excuses to weaken the proof campaign.

## Foundation ownership

The remaining work is organized by reusable semantic mechanism rather than benchmark name:

- proof objects and derivation trees;
- finite index/fold/parity;
- FOL domain/equality/binder instantiation;
- possible worlds/accessibility/satisfaction;
- public-announcement restriction/update;
- linear trace temporal semantics;
- branching transition/path semantics;
- selected normative/deontic semantics;
- heap/resource/program semantics;
- higher-order function/predicate/application structure;
- finite reduction paths/closure.

Shared relational shapes should share foundations where sound.

## Artifacts

- `SOURCE_BENCHMARKS_003.md` — frozen human/source intent.
- `FORMAL_LOGIC_BENCHMARKS_003.axh` — native statement/formalization scaffold.
- `SEMANTIC_SIGNATURE_003_DRAFT_0_5.axh` — exact signature for that scaffold.
- `SEMANTIC_GLOSS_003.json` — reviewer/scorer names only.
- `COLD_RECONSTRUCTION_PROMPT_003.md` — E2 statement reconstruction protocol.
- `PROOF_EXECUTION_PROTOCOL_003.md` — E3-E5 protocol.
- `PRIMITIVE_DECOMPOSITION_AUDIT_003.md` — benchmark-by-benchmark decomposition disposition.
- `PRIMITIVE_FOUNDATION_ARCHITECTURE_003.md` — shared semantic foundation design.
- `RESULTS_003.md` — durable qualification state.

## Success condition

Experiment 003 does not pass because all 18 formulas parse or because each familiar operator has a native numeric ID.

The meaningful end state is:

```text
18 source-faithful problems
-> native statement reconstruction
-> primitive semantic decomposition
-> alias-erasure qualification
-> explicit native proof profiles
-> correct proof/counterresults
-> independent proof review
```

with named notation stripped away far enough that the actual relational similarities and differences among classical, constructive, epistemic, temporal, spatial, and higher-order systems are visible to the agent.
