# Experiment 003 — Proof Execution Protocol

**Scope:** E3 proof-profile completeness → E4 proof execution → E5 proof review

## Principle

A proof benchmark is not qualified by reconstructing its statement.

For each benchmark, the execution input must be a self-contained native bundle:

```text
exact signature
+
benchmark statement/premises
+
logic/profile axioms and inference rules
+
problem-specific definitions/instances
```

The agent may use general reasoning ability to search, but the validity of a proof must be checkable against the supplied native profile. A result that depends on unstated rules from model priors is not a native proof result.

## E3 — proof-profile completeness

Before proof execution, audit the benchmark module for the rules needed by its declared profile.

### Classical propositional / FOL

Must make explicit enough authority for the intended classical rules, quantifier rules, domain assumptions, and where relevant equality substitution/congruence.

### SAT / parity hardness

Freeze concrete instances. Record the allowed proof system being measured (e.g. resolution versus an extended/parity-aware system). Proof-size claims are meaningless without this distinction.

### Epistemic/modal

Supply the relevant accessibility/frame axioms and modal inference rules. For DEL, supply public-announcement/model-update semantics rather than interpreting announcement as ordinary implication.

### Deontic

Supply the exact obligation/conditional profile. The Chisholm benchmark must distinguish consistency-preserving contrary-to-duty treatment from a naive explosive encoding.

### LTL / CTL

Supply operator semantics or an equivalent sound proof calculus sufficient for the target theorem. Path/state quantification must remain distinct.

### Separation/dynamic logic

Supply heap/state semantics, program transition semantics, and the applicable frame/separation rules. Pointer alias assumptions must be explicit.

### Intuitionistic/constructive

Do not include classical rules that collapse the benchmark. Proof extraction/meta-theorem claims must identify the theorem/proof relation being quantified over.

### Higher-order/type-theoretic

Supply application, abstraction, beta/substitution behavior, type/sort rules, extensionality/choice principles only when intended, and induction/closure rules required by the benchmark.

## E4 — execution output

For each benchmark, return exactly one primary disposition:

```text
PROVED
DISPROVED / COUNTERMODEL
CONSISTENT UNDER PROFILE
INCONSISTENT UNDER PROFILE
NON-DERIVABLE UNDER PROFILE
BLOCKED: PROFILE INCOMPLETE
BLOCKED: SOURCE PROBLEM INCOMPLETE
RESOURCE LIMIT
```

A successful `PROVED` result must include a native proof/derivation object or a step sequence that can be rendered natively without introducing hidden premises.

For parameterized families, report each frozen instance separately.

## E5 — independent proof review

A separate reviewer receives:

- the frozen proof-profile bundle;
- the agent result/proof object;
- scorer assertions/reference theorem status where available.

The reviewer checks:

1. every premise used is present;
2. every inference step names an admissible rule or valid derived rule;
3. substitutions respect lexical binding and capture avoidance;
4. equality rewriting is justified;
5. modal/temporal/deontic/spatial rules use the correct profile;
6. no classical rule leaks into an intuitionistic proof unless explicitly admitted;
7. higher-order application/abstraction follows the supplied rules;
8. no source caveat was silently repaired;
9. the conclusion matches the native goal exactly.

## Metrics

Record at minimum:

- result disposition;
- proof-step/node count;
- maximum dependency depth;
- context/input size;
- output/proof size;
- wall-clock time when measured under controlled execution;
- retries/search branches when observable;
- representation ambiguities;
- profile ambiguities;
- whether a human gloss was required for any load-bearing operation.

For hardness families, also record the proof system and concrete instance size.

## Initial benchmark readiness

The initial statement bundle is intentionally not treated as E3-complete.

Immediate follow-up modules are required for:

- exact Steamroller premises;
- concrete PHP/XOR/muddy instances;
- modal/DEL frame/update rules;
- deontic profile;
- LTL/CTL proof semantics;
- separation/program semantics;
- classical and intuitionistic proof profiles;
- HOL/application/abstraction/type rules;
- well-founded induction authority;
- concrete Church–Rosser reduction theory.

The next work should build these by semantic ownership/profile, not by copying one monolithic universal prover into the bundle.
