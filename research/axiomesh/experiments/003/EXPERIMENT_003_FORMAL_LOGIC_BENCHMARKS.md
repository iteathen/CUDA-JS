# Experiment 003 — Cross-Logic Proof Benchmark Campaign

**Branch:** `experiment/axiomesh-native-reconstruction`  
**Candidate spec:** Draft 0.5  
**Status:** benchmark corpus added; E0/E1 author-side construction in progress

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

The primary risk is not syntax coverage. The risk is accidental semantic collapse—for example, silently applying classical rules inside an intuitionistic benchmark, interpreting a public announcement as an ordinary implication, or treating a representable higher-order formula as already proof-qualified.

## Governing rule

For every benchmark:

```text
statement representation != proof profile != proof != reviewed proof
```

Experiment 003 therefore uses staged qualification.

## Gates

### E0 — source fidelity

Preserve the supplied theorem/premises/domain/test intent without silently repairing under-specified or noncanonical statements.

### E1 — native expressibility

Represent every supplied load-bearing distinction natively:

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

### E2 — cold reconstruction

A fresh decoder receives only the applicable specs, native signature, frozen cold prompt, and native benchmark bundle. It reconstructs all 18 objects and reports any ambiguity or hidden dependency.

### E3 — proof-profile completeness

Each benchmark receives a native proof-profile module sufficient to determine admissible proof steps. This gate is deliberately separate because many benchmark names refer to standard logics whose rules must not be imported invisibly from model priors.

### E4 — proof execution

A fresh agent must produce the appropriate result:

- derivation/proof object;
- countermodel/non-derivability result;
- consistency result;
- extracted witness/program;
- parameterized proof result.

### E5 — independent proof review

Review each proof step against the supplied profile. Record correctness, proof size, search effort, representation difficulty, and any semantic leakage.

## Draft 0.5 pressure result

The benchmark set exposed one core representation need not already owned cleanly by Draft 0.4:

> a first-class lexically bound body that does not itself assert universal/existential quantification.

This is required for lambda-like terms, dependent products, set/index folds, and other higher-order constructors.

Draft 0.5 adds only:

```text
\?n term
```

as generic lexical abstraction.

Lambda, Pi/dependent product, set-builder, bounded fold, etc. remain theory-owned interpretations of that abstraction.

Draft 0.5 also makes proof-system neutrality explicit: core implication/negation syntax does not imply one global classical proof calculus.

## What is deliberately NOT promoted to core

The following remain semantic symbols / theory modules until evidence says otherwise:

- sorts/types and type membership;
- function/predicate application;
- XOR/parity;
- biconditional;
- epistemic knowledge/common knowledge/public announcement;
- obligation/permission;
- LTL/CTL operators;
- separating conjunction/magic wand/Hoare triples;
- theorem/proof predicates;
- well-foundedness;
- reflexive-transitive closure;
- lambda and Pi constructors themselves.

The benchmark suite is specifically intended to falsify this decision if theory-level representation proves inadequate.

## Benchmark families

Native benchmark objects are `3001..3018`, corresponding in order to `FL-001..FL-018` in `SOURCE_BENCHMARKS_003.md`.

The initial native bundle records statement structure and proof-readiness. It does **not** falsely claim that all standard proof calculi are already encoded.

## Source caveats retained as test data

- PHP, XOR parity, and muddy children are families requiring frozen concrete instances for measured runs.
- Steamroller requires exact premise import before proof scoring.
- Chisholm is a profile-sensitive consistency benchmark.
- Cantor's supplied statement is preserved but is not silently equated with the canonical no-surjection theorem.
- Well-founded induction requires explicit well-foundedness authority.
- Church–Rosser requires a concrete reduction/inductive theory.

These caveats are source fidelity, not excuses to weaken the proof campaign.

## Artifacts

- `SOURCE_BENCHMARKS_003.md` — human/source authority for the 18 supplied benchmarks.
- `FORMAL_LOGIC_BENCHMARKS_003.axh` — native Draft 0.5 benchmark statements and proof obligations.
- `SEMANTIC_SIGNATURE_003_DRAFT_0_5.axh` — exact native bundle signature.
- `SEMANTIC_GLOSS_003.json` — scorer/reviewer human names only; forbidden during cold qualification.
- `COLD_RECONSTRUCTION_PROMPT_003.md` — E2 isolation protocol.
- `PROOF_EXECUTION_PROTOCOL_003.md` — E3-E5 requirements.
- `RESULTS_003.md` — durable qualification state.

## Success condition

Experiment 003 does not pass merely because all 18 formulas parse.

The meaningful end state is:

```text
18 source-faithful problems
-> native reconstruction
-> explicit native proof profiles
-> correct agent proofs/counterresults
-> independent proof review
```

with classical, constructive, modal, temporal, spatial, and higher-order distinctions preserved rather than normalized into one hidden reasoning regime.
