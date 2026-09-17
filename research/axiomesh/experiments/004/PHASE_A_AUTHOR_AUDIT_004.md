# Experiment 004 — Phase A Author-Side Audit

**Status:** author-side construction audit only; not cold qualification evidence  
**Authority:** Draft 0.13 + Draft 0.14  
**Cold prompt:** `COLD_PHASE_A_PROMPT_004.md`

## 1. Scope of this audit

This pass checks that the Phase A native fixtures actually exercise the intended current rules before an isolated decoder is given them.

It does not count as E2/cold evidence because the author knows the intended assertions.

## 2. Native corpus closure

`PHASE_A_CASES_004.axh` uses the following theory-owned labels:

```text
^4000 ^4001 ^4002 ^4003 ^4005 ^4006 ^4007 ^4010 ^4011 ^4012
```

All ten are declared in the local `^0` surface signature.

No other theory-owned label occurs in that file.

The independent namespace fixtures each use only local `^7000`, declared in their own local surface signatures.

The identical numeric spelling of `^7000` across those two files is intentional test data, not a shared-namespace declaration.

## 3. Case-by-case construction check

### Q004-01

`^4001` contains two direct occurrences of structurally identical `(10 11)` incidence; `^4002` contains one `(20 21)` occurrence.

This is a direct probe of the Draft 0.13 occurrence-preserving scope default.

No set/idempotent quotient is supplied.

### Q004-04

`^4001` contains one nested scope around `(30 31)` plus sibling `(32 33)`.

`^4002` contains two flat direct incidence members.

The member counts alone could look superficially similar after flattening, so the case directly checks that N0/N1 preserve nesting.

### Q004-05

Subcase construction:

```text
#1 distinct ?0/?1 with target values 60/60
#2 repeated ?0 with target values 60/61
#3 ?1 occurs only inside NAC
#4 NAC reuses positively bound ?0
```

The rewrite rules exist only to provide an unambiguous rewrite-pattern owner for variables. The prompt does not ask the decoder to activate or execute the rules.

This avoids importing historical direct-child activation semantics into the probe.

### Q004-06

One reference binds `(70 71)` and is used twice inside the `^4001` scope.

The construction intentionally distinguishes:

```text
repeated reference uses
!= reference-handle identity
```

while requiring the internal structural identities `70` and `71` to remain shared through N0 resolution.

`^4002` supplies the alpha-renamed two-occurrence comparison target. `^4003` supplies a one-occurrence negative control.

### Q004-07

The two fixtures are independent top-level bundles with intentionally identical bare and stable-label numeral spellings.

The case tests both:

```text
no cross-bundle source identity from numeral coincidence
```

and:

```text
explicit VS mapping may still recover structural correspondence
```

No shared namespace/partition/import object is supplied.

### Q004-08

The compact universal binder/body is structurally the same in both constructions:

```text
*?0[(^4011 ?0)]
```

Each binder term is explicitly linked by `^4012` incidence to a different local domain/generator marker.

The first associated `^4010` relation contains one member incidence; the second contains two.

This makes the domain/generator difference native structure rather than a hidden human statement about the binder.

## 4. Author-side expected dispositions

These expectations are duplicated in hidden scorer material and MUST NOT be supplied to the cold decoder.

```text
Q004-01  non-isomorphic: occurrence multiplicity differs
Q004-04  non-isomorphic: scope nesting differs
Q004-05.1 match, ?0=?1=60 is legal aliasing
Q004-05.2 no match: repeated ?0 would require 60=61 binding
Q004-05.3 invalid qualified pattern: NAC-only ?1 unbound/unowned
Q004-05.4 match with ?0=60; required negative occurrence absent
Q004-06  left/right isomorphic after N0, left/extra not isomorphic
Q004-07  V0 no isomorphism with namespace-qualified stable labels rigid; VS explicit label map permits isomorphism
Q004-08  complete constructions non-isomorphic because linked domain/generator structure differs
```

## 5. Known protocol dependency

The cold decoder must treat the two Q004-07 files as independent top-level bundles. This fact is part of the transport/source-boundary setup and is stated explicitly in the cold prompt.

If future qualification requires this independence to be represented wholly inside one native corpus object, that belongs to Q004-17 native policy/self-description work rather than being silently retrofitted into Phase A.

## 6. Qualification state

```text
Phase A native fixtures: CONSTRUCTED
signature closure: PASS author-side
hidden assertions: FROZEN
cold prompt: FROZEN
isolated cold run: PENDING
post-freeze scorer review: PENDING
```
