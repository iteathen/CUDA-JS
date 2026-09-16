# Experiment 003 — Binder Instantiation Pressure

**Status:** active specification pressure discovered while building E3 proof profiles  
**Current candidate before this finding:** Draft 0.5

## Trigger

Draft 0.5 can represent quantified formulas and can package a bound body as a first-class lexical abstraction:

```text
*?0 BODY
\?0 BODY
```

That is sufficient for statement representation and cold reconstruction.

It is not yet sufficient to state a self-contained generic proof rule such as universal elimination without introducing hidden substitution semantics.

A proof profile needs to express the structural operation:

```text
forall x. BODY
BODY[x := term]
```

while preserving lexical binding and capture avoidance.

Using a theory-owned `apply` or `substitute` symbol alone merely names the missing operation. Unless the bundle also defines how that operator acts on AxiomeSH terms, proof checking still depends on external semantics.

## Why this is representation-general

The same operation is required independently by:

- first-order universal/existential instantiation;
- lambda beta-style substitution;
- higher-order predicate/function application over explicit abstractions;
- dependent products;
- induction schemas with bound motives;
- rewriting under binders;
- proof-rule schemas that quantify over bound formula bodies.

This is therefore broader than one benchmark or one logic profile.

## Minimum proposed response

Draft 0.6 candidate should add one structural abstraction-instantiation operation and expose quantifier bodies as abstraction-valued structure.

Candidate operation:

```text
ABSTRACTION @@ ARGUMENT
```

where the left term must denote a lexical abstraction.

Example:

```text
(\?0[(^17 ?0)]) @@ 42
```

reduces structurally to:

```text
[(^17 42)]
```

The operation is capture-avoiding syntactic instantiation only. It is not generic mathematical function application.

Quantifier forms should also admit first-class abstraction operands:

```text
*(ABSTRACTION)
+(ABSTRACTION)
```

with the existing compact forms treated equivalently:

```text
*?0 BODY  ==struct==  *(\?0 BODY)
+?0 BODY  ==struct==  +(\?0 BODY)
```

This lets a proof-rule schema quantify over an abstraction object and state, for example, the structural shape of universal elimination without hiding the body-substitution step.

## Non-response

Do not solve this by:

- importing a host-language substitution callback;
- storing precomputed instantiated formulas in an oracle;
- inventing one substitution operator separately in every proof profile;
- changing every source formula into a second quoted AST representation;
- treating variable-number spelling as semantic identity.

Those approaches reintroduce either hidden semantics or a parallel representation boundary.

## Qualification requirement

The proposed operation is justified only if it supports native proof-profile rules and cold reconstruction without new ambiguity. It must be challenged directly by FOL quantifier rules and higher-order beta/substitution benchmarks before promotion.
