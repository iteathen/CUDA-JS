# Draft 0.6 Structural Instantiation — Results

**Status:** focused case bundle constructed; author-side oracle complete; independent cold qualification pending.

## Purpose

Qualify the single new Draft 0.6 representation surface before using it as authority for FOL/HOL proof-profile construction.

The candidate adds capture-avoiding structural instantiation of Draft 0.5 lexical abstractions and explicit abstraction-valued quantifier forms.

## Cases

Eight focused cases exercise:

1. simple owned occurrence substitution;
2. token-class preservation across substitution;
3. preservation of unrelated nested binders;
4. capture avoidance with alpha-renaming;
5. compact versus explicit universal binder structure;
6. compact versus explicit existential binder structure;
7. invalid non-abstraction left operand;
8. no-op substitution when the abstraction-owned variable is absent.

## Author-side expected results

The scorer oracle records:

```text
1 -> [(^7200 1)]
2 -> [(^7200 #28 ^7201 4)]
3 -> *?1[(^7200 1 ?1)]
4 -> alpha-equivalent to *?2[(^7200 ?1 ?2)]
5 -> compact/explicit universal forms equivalent
6 -> compact/explicit existential forms equivalent
7 -> invalid
8 -> [(^7200 #3 ^7201)]
```

Case 4 is intentionally an open structural term so capture avoidance can be tested directly. It is not a closed declarative proposition.

## Signature

The case payload uses and declares exactly:

```text
^7100 ^7101 ^7200 ^7201
```

No extra or missing theory-owned symbol is expected.

## Qualification state

```text
Draft 0.6 source pressure: RECORDED
candidate amendment: CREATED
focused native cases: CREATED
author-side expected normalization: COMPLETE
cold reconstruction/normalization: PENDING
FOL/HOL profile dependence on @@: BLOCKED until cold result
```

A successful cold result will justify continuing E3 profile construction on this candidate surface. A failure should tighten or reject Draft 0.6 before proof modules depend on it.
