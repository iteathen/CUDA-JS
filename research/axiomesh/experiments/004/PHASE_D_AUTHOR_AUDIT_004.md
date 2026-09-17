# Experiment 004 — Meta / Discovery Author Audit

**Status:** author-side fixture review only; not isolated qualification evidence

This audit covers Q004-09, Q004-10, and Q004-16 through Q004-20.

## Q004-09 — semantic decomposition versus recovery cheat

Source `9000` contains two incidence members sharing identity `2`.

Factorization `9100` exposes an alpha-renamed copy of the full source structure and an explicit source-target identity map, with empty reconstruction residual.

Factorization `9200` exposes no target structure or source-target map; its residual contains the entire source structure unchanged.

Therefore author-side expected distinction is:

```text
9100: structural content exposed; round-trip and synthetic-source coverage both supported
9200: round-trip possible only by carrying undecomposed source copy; semantic-decomposition coverage not demonstrated
```

The test is intentionally simple: it isolates the difference between recoverability and decomposition coverage rather than claiming `9100` is an interesting real-world factorization.

## Q004-10 — independent extraction freeze

Pre-pair frozen extraction `1100` is a directed path:

```text
1 -> 2 -> 3
```

Pre-pair frozen extraction `2100` is a two-edge out-star:

```text
10 -> 11
10 -> 12
```

They are not V0-isomorphic.

Exploratory pair-conditioned extraction `2200` is another directed path:

```text
20 -> 21 -> 22
```

and is isomorphic to `1100`.

The case is valid only if the cold agent preserves the provenance distinction:

```text
frozen extraction != post-hoc exploratory extraction
```

The later path match may be retained as exploratory evidence but may not rewrite the blind result.

## Q004-16 — class non-vacuity

Schema `1601` exposes one arbitrary parameter slot and no structural constraint. It is an explicit pass-through/vacuity negative.

Schema `1602` exposes one structured parameter slot plus a lexically owned required two-edge chain pattern:

```text
(?0 ?1)
(?1 ?2)
```

Assignments `1701` and `1702` contain such a chain. Assignment `1703` is an out-star with no second edge starting from any first-edge endpoint.

Because distinct variables may alias, the author audit also checked the star for accidental alias matches: there is no `(60 60)` self-edge and no edge beginning at any leaf, so no legal assignment satisfies the chain pattern.

The test therefore distinguishes:

```text
large structured parameter: allowed
schema contributing no reusable relation: vacuous
schema adding a selective reusable constraint: non-vacuity candidate
```

It does not by itself qualify schema `1602` as a reusable class.

## Q004-17 — native record self-representation

The native file contains:

- three raw record-type identities;
- native declared field sets for each type;
- a policy-like record `5000`;
- a witness-like record `5001` linked to `5000`;
- a result-like record `5002` linked to `5001`;
- mapping/residual scopes physically present inside native field relations;
- content-binding fields on all three records.

The cold prompt deliberately asks only for raw topology, not English interpretation of the `^n` field labels.

Passing Q004-17 would establish native recoverability of the record graph, not yet universal adequacy of that record vocabulary.

## Q004-18 — source ambiguity

Source `1800` has two explicit interpretation objects:

```text
1801: one-edge body
1802: two-edge chain body
```

Target `1803` is a one-edge body.

Author-side comparison:

```text
1801 vs 1803 -> isomorphic
1802 vs 1803 -> non-isomorphic
```

Therefore any source-level result must remain conditional on interpretation. Choosing `1801` solely because it matches is the failure mode.

## Q004-19 — novel class induction

Positive objects #1/#2/#3 are alpha-renamed copies of the same directed reconvergent diamond:

```text
A -> B
A -> C
B -> D
C -> D
```

The negative object branches to two different sinks and therefore lacks reconvergence.

The positives admit the branch-role automorphism `B <-> C`.

No class registry/catalog is available to the cold agent.

The expected output is therefore an unqualified new-candidate structural schema hypothesis, not a forced C1–C12 assignment and not immediate promotion.

## Q004-20 — structural-only versus label-assisted retrieval

Structural corpus:

```text
#2001  directed path length 2
#2002  alpha-renamed directed path length 2
#2003  two-edge out-star
```

Assist metadata:

```text
#2001 -> ^6000
#2002 -> ^6001
#2003 -> ^6000
```

Therefore:

- structural-only exact comparison surfaces `#2001 <-> #2002`;
- exact label equality surfaces the tempting but wrong `#2001 <-> #2003` candidate;
- label metadata remains useful retrieval input only after structural verification;
- the structural-only prompt cannot access the assist document.

This is a deliberately tiny recall test, not a corpus-scale performance claim.

## Fixture status

```text
Q004-09 native fixture/assertions/prompt: FROZEN
Q004-10 native fixture/assertions/prompt: FROZEN
Q004-16 native fixture/assertions/prompt: FROZEN
Q004-17 native fixture/assertions/prompt: FROZEN
Q004-18 native fixture/assertions/prompt: FROZEN
Q004-19 native fixture/assertions/prompt: FROZEN
Q004-20 structural-only + assisted fixtures/assertions/prompts: FROZEN
isolated runs: PENDING
```
