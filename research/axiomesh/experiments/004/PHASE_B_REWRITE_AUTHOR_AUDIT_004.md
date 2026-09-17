# Experiment 004 — Rewrite Cases Author Audit

**Status:** author-side fixture audit only; not isolated qualification evidence

## Q004-02

Initial direct occurrence multiset:

```text
(10 20) x2
(30 20) x1
```

Selected rule:

```text
[(10 ?0)] > [(30 ?0)]
```

The selected application admits `?0 = 20`.

Current occurrence-preserving update removes one selected `(10 20)` occurrence and adds one `(30 20)` occurrence.

Author-side expected successor:

```text
(10 20) x1
(30 20) x2
```

The pre-existing/new `(30 20)` occurrences must not collapse absent an explicit idempotent quotient/profile.

## Q004-03

Two reified rule objects contain the same rewrite shape but have different rule-object identities:

```text
3002
3003
```

Selected application events:

```text
3004 -> state 3001, rule 3002
3005 -> state 3001, rule 3003
```

Both bind `?0 = 20` and produce a successor containing one `(30 20)` occurrence.

The successor states are structurally isomorphic; application events remain distinct.

This specifically prevents state quotienting from erasing derivation-event multiplicity.

## Fixture status

```text
signature closure: PASS author-side
rewrite variables owned by represented rule objects: PASS
activation ambiguity avoided by explicit selected-application probes: PASS
hidden assertions: FROZEN
cold prompt: FROZEN
isolated cold run: PENDING
```
