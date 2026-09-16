# Experiment 003 — Primitive LTL Trace Foundation

**Status:** E1P candidate; author-side only  
**Native module:** `FOUNDATION_LTL_TRACE_003.axh`  
**Target benchmark:** FL-011 first, reusable for other linear-time cases

## Primitive floor

The foundation deliberately does **not** take `G`, `F`, or `X` as semantic primitives.

The model leaves are:

| Symbol | Role |
|---|---|
| `^8300` | trace/model identity marker |
| `^8301` | position belongs to trace |
| `^8302` | reflexive future/order relation on trace positions |
| `^8304` | atomic formula marker |
| `^8305` | atomic valuation: atom true at a trace position |

The native module constrains `^8302` as a reflexive, transitive, antisymmetric, total order on positions.

This is the chosen primitive temporal substrate for the initial LTL profile: a discrete linear future order, consistent with standard LTL presentations over the natural-number order.

## Constructed relations

### Immediate successor

`^8303` is **derived**, not a primitive model input.

It holds exactly when the second position is a strict future position of the first and there is no third trace position strictly between them. The profile additionally requires every trace position to have such a successor, excluding terminal positions for standard infinite-run LTL.

This avoids carrying both `next` and `future` as independent primitive relations.

### Formula satisfaction

`^8306` is the recursively constrained satisfaction relation exercised by this foundation.

The module currently exposes the constructors needed by FL-011:

- atomic valuation;
- single-member formula scopes used for grouping;
- implication;
- declarative negation;
- derived temporal aliases `^531`, `^532`, `^533` from the existing Experiment 003 statement scaffold.

The temporal aliases expand as follows:

```text
^533 A   (source X-like alias)
  -> A holds at the unique immediate successor

^532 A   (source F-like alias)
  -> A holds at some position u with t <= u

^531 A   (source G-like alias)
  -> A holds at every position u with t <= u
```

The numeric names carry no semantic authority; the native equivalences do.

## Why the order relation is the model leaf

An earlier draft of this foundation carried both `future-or-equal` and `next` as model relations. That was rejected as unnecessarily redundant.

The tightened construction retains one linear order as the primitive temporal relation and derives immediate successor from discreteness.

A later experiment may instead choose one-step transition as the primitive and construct the future relation through a qualified path/closure foundation. That alternative should be measured rather than assumed superior.

## Scope of the current candidate

This module is intentionally not yet a complete general LTL semantics library.

It is sufficient to pressure the exact constructs used by FL-011. In particular:

- `U` is not yet exercised by the supplied FL-011 theorem body;
- arbitrary multi-member formula-scope satisfaction is not yet generalized through a scope-reflection primitive;
- no proof of the FL-011 theorem has yet been produced;
- no cold reconstruction/alias-erasure qualification has yet been run.

Those omissions are explicit instead of being hidden behind an external evaluator.

## FL-011 proof shape to test

The source premises are structurally:

```text
G(Req -> F Ack)
G(Ack -> X Release)
```

and the goal is:

```text
G(Req -> F Release)
```

Under the primitive expansion, the load-bearing argument should become visible as:

1. take an arbitrary trace position `t` at or after the evaluation point;
2. if `Req` holds at `t`, the first premise supplies a future `u >= t` where `Ack` holds;
3. the second premise supplies the immediate successor `v` of `u` with `Release` true;
4. order/transitivity gives `v >= t`;
5. therefore `F Release` holds at `t`;
6. because `t` was arbitrary, the goal `G(Req -> F Release)` holds.

The proof must be built from native relations/rules rather than from an opaque LTL theorem token.

## Reference semantics used for construction

The semantic shape was checked against standard presentations of LTL over discrete linear time, including the Stanford Encyclopedia of Philosophy entry *Temporal Logic*, which defines `X` through immediate successor and presents LTL over the natural-number order with `G`, `X`, and `U`.

External reference is research support only. The native module, not the citation, is the proof authority for Experiment 003.

## Falsifiers

Revise this foundation if:

- the chosen primitive future-order relation hides distinctions needed by proof/countermodels;
- deriving `next` from order becomes materially less reliable than taking transition as the primitive;
- cold agents cannot reconstruct the temporal expansions without human gloss;
- alias erasure changes the FL-011 obligation;
- a more primitive/shared path foundation yields a cleaner exact construction with lower reasoning cost.
