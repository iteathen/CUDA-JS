# Experiment 003 — Generic Finite Path Foundation

**Status:** E1P candidate; author-side only  
**Native module:** `FOUNDATION_FINITE_PATH_003.axh`

## Purpose

Provide one primitive-normal construction for zero-or-more reachability that can be reused by:

- common-knowledge accessibility closure;
- CTL/path semantics;
- program/reduction traces;
- Church–Rosser reflexive-transitive closure;
- other finite witness paths.

The goal is to prevent each domain from inventing an opaque `closure` token with hidden semantics.

## Primitive leaf

`^8500` represents an asserted one-step edge of a supplied relation identity:

```text
(^8500 R a b)
```

The relation identity `R` is a model/source object. The foundation does not assign it extra semantics.

Examples of `R` in downstream bundles may be:

- an agent/group accessibility-step relation;
- a transition relation;
- a one-step reduction relation.

## Path constructors

```text
(^8501 a)
```

is a zero-edge path at `a`.

```text
(^8502 a b tail)
```

constructs a path whose first step is `a -> b` and whose tail begins at `b`.

These constructors are structural data. They do not themselves assert that the required one-step edge exists.

## Constructive path validity

`^8503` is a derived proof judgement with an explicit witness path:

```text
(^8503 R path start end)
```

Its native rules are only:

1. zero path: `(^8501 a)` witnesses `a` to `a`;
2. extension: an asserted `(^8500 R a b)` plus a valid tail path from `b` to `z` constructs a valid path from `a` to `z`.

Downstream proof qualification MUST NOT admit arbitrary `^8503` facts as primitive leaves. Every path use must be backed by its constructor/rule derivation or checked equivalent native proof object.

This is what keeps closure constructive rather than turning `^8503` into another magic reachability predicate.

## Derived reachability alias

`^8504 R a b` is a compact derived alias exactly when there exists an explicit `^8503` path witness.

Downstream E1A may erase `^8504` completely and quantify directly over `^8503` witnesses.

## Why finite path witnesses

All concrete uses in the initial benchmark campaign need finite evidence:

- eventual reachability is witnessed by a finite prefix;
- common-knowledge reachability between two worlds is witnessed by a finite accessibility chain;
- Church–Rosser zero-or-more reduction premises/conclusions are finite reduction sequences in a proof object;
- CTL existential path witnesses use finite prefixes for `EX`, `EF`, and `EU` obligations even when the underlying computation continues infinitely.

Infinite-path/global properties require additional profile structure; this module does not pretend a finite witness alone proves them.

## Primitive-decomposition effect

Before this foundation, a theory could write a symbol glossed as `reflexive_transitive_closure` and leave the operation opaque.

After this foundation, a zero-or-more reachability claim can be expanded to:

```text
exists explicit path
whose zero/step constructors
are justified by primitive one-step relation edges
```

This is the intended AxiomeSH direction.

## Qualification still required

The module is not yet independently qualified. Focused cold cases should test:

- zero-path reflexivity;
- one-step path;
- multi-step path;
- rejection of a path whose first edge is absent;
- relation-identity separation;
- alias erasure from `^8504` to an explicit path witness;
- shared use by at least two distinct logic domains.

If a cold decoder cannot recover the path semantics without a human glossary, the construction must be tightened before E3 depends on it.
