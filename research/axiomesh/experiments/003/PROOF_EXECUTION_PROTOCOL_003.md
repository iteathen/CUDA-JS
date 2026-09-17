# Experiment 003 — Proof Execution Protocol

**Scope:** E3 proof-profile completeness → E4 proof execution → E5 proof review  
**Current spec:** `../../CORE_SPEC_DRAFT_0_12_CANDIDATE.md`

## Principle

A proof benchmark is not qualified by reconstructing its statement, by naming a familiar proof rule, or by failing to find a counterexample.

Before E3/E4, every applicable E1 structural/discovery gate defined by the current specification must pass for semantic foundations, factorization bridges, class relations, retrieval/extraction paths, or comparison results on which the proof bundle depends. This includes Draft 0.12 identity, coverage, index, and isolation gates when they are relevant.

For each benchmark, execution input must be a self-contained native dependency bundle containing at least:

```text
surface signature + stable-symbol namespace
structural identity/bundle namespace contract
native dependency closure
benchmark statement/premises
logic/profile axioms and inference rules
problem-specific definitions/instances
explicit quantifier domains/generators where used
qualified D/E dependencies and exact revisions
legacy-current bridge revisions if used
```

A result depending on unstated rules from model priors or hidden host semantics is not a native proof result.

## E3 — proof-profile completeness

Before proof execution, audit the benchmark module for all authority needed by its declared profile.

### Classical propositional / FOL

Make classical rules, quantifier rules, domain assumptions, equality substitution/congruence, and any nonempty-domain requirement explicit. Quantifier surfaces alone do not supply their domains.

### SAT / parity hardness

Freeze concrete instances and the proof system being measured. Resolution, extended resolution, parity-aware systems, etc. are different authorities.

### Epistemic/modal

Supply accessibility/model structure, frame constraints, recursive satisfaction, and intended modal/DEL rules. Public announcement is model restriction/update, not ordinary implication.

### Deontic

Supply the exact normative semantics/profile. Chisholm cannot be scored under an unspecified generic `O` operator.

### LTL / CTL

Supply trace/branching model structure and operator semantics or a sound equivalent proof calculus. Path/state quantification and fairness/completeness assumptions remain explicit.

### Separation/dynamic logic

Supply heap/state semantics, program transitions, alias/resource assumptions, and applicable frame/locality authority.

### Intuitionistic/constructive

Do not include classical rules that collapse the benchmark. Meta-theorem/proof-extraction claims quantify over explicit native proof objects/relations.

### Higher-order/type-theoretic

Supply function/application model, abstraction/substitution authority, type/sort rules, beta/extensionality/choice only where intended, and induction/closure authority required by the theorem.

## Dependency revision rule

A proof object records exact revisions of:

```text
source statement
profile/foundation modules
class schemas if used
D/E definitions/equivalences
namespace/bundle contract
legacy-to-current bridges if any
```

Changing a dependency does not silently preserve proof qualification.

## E4 — execution dispositions

Return one primary disposition:

```text
PROVED
COUNTERMODEL / DISPROVED
CONSISTENT_CERTIFIED_UNDER_PROFILE
INCONSISTENT_PROVED_UNDER_PROFILE
NON_DERIVABLE_CERTIFIED_UNDER_PROFILE
NO_PROOF_FOUND
NO_COUNTERMODEL_FOUND
UNKNOWN
BLOCKED: PROFILE INCOMPLETE
BLOCKED: SOURCE PROBLEM INCOMPLETE
RESOURCE_LIMIT
```

### Positive proof

`PROVED` requires a native proof/derivation object or explicit step structure whose every dependency is present and independently checkable.

### Countermodel / disproof

`COUNTERMODEL / DISPROVED` requires an explicit model/structure satisfying the profile/premises and falsifying the goal, with independent validation.

### Consistency

`CONSISTENT_CERTIFIED_UNDER_PROFILE` requires a valid model or another sound consistency certificate. Failure to derive contradiction is only `NO_PROOF_FOUND`/`UNKNOWN`.

### Non-derivability

`NON_DERIVABLE_CERTIFIED_UNDER_PROFILE` requires a sound countermodel/semantic completeness bridge, a complete decision procedure for the frozen finite problem, or another independently verified certificate. Failure to find a proof is `NO_PROOF_FOUND`.

### Parameterized families

Report every frozen instance separately and state instance size/proof system.

## E5 — independent proof review

A fresh reviewer receives frozen source/profile/dependency revisions plus the proof/countermodel/certificate and current verification protocol. Scorer/reference theorem status is withheld until result freeze where blind review is intended.

The reviewer checks at least:

1. every premise/axiom/dependency exists at the recorded revision;
2. every inference step instantiates an admissible native rule or verified derived rule;
3. substitutions respect lexical ownership and capture avoidance;
4. quantified steps use the correct explicit domain/generator/guards;
5. equality rewriting uses the correct equality notion/profile;
6. modal/temporal/deontic/spatial rules use the selected model/profile;
7. no classical rule leaks into intuitionistic proof unless admitted;
8. higher-order application/abstraction follows represented function/binding rules;
9. no source caveat or missing premise was silently repaired;
10. the conclusion matches the native goal exactly;
11. any class/factorization bridge has a verified witness at the recorded revision;
12. negative/consistency claims have the required certificate rather than merely exhausted effort;
13. target-layer conclusions are not promoted beyond what the certificate establishes;
14. namespace/identity assumptions are preserved;
15. excluded archival/scorer material was not used as proof/discovery authority where isolation was required.

## Proof-object versus surface labels

Labels such as `derivable`, `theorem`, `consistent`, or a rule name may remain retrieval/construction handles. They are not proof authority by themselves.

The proof/certificate must expand to native dependency/rule/model structure sufficient for independent checking.

## Metrics

Record at minimum:

- disposition;
- proof/certificate type;
- proof-step/node count;
- maximum dependency depth;
- context/input size;
- output/proof size;
- dependency/factorization count;
- wall-clock time under controlled execution;
- retries/search branches when observable;
- search completeness status;
- representation/profile ambiguities;
- human-gloss dependence, if any;
- legacy-current bridge use, if any;
- namespace/identity bridge use, if any.

For hardness families also record proof system and concrete instance size.

## Initial benchmark readiness

The initial statement bundle is intentionally not E3-complete.

Still required include:

- exact Steamroller premises;
- concrete PHP/XOR/muddy instances;
- completed/qualified modal/DEL foundations;
- selected deontic profile;
- qualified LTL/CTL proof semantics;
- concrete separation/program semantics including swap/locality;
- independently qualified classical/intuitionistic profiles;
- HOL/application/abstraction/type rules;
- well-founded induction authority;
- concrete Church–Rosser reduction theory.

These should be built by semantic ownership and primitive construction, not by introducing an opaque universal prover or treating familiar proof-system names as authority.
