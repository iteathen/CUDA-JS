# Experiment 004 — Draft 0.15 Fixture Impact Audit

**Status:** author-side compatibility audit only  
**Authority:** Draft 0.13 + Draft 0.14 + Draft 0.15  
**Purpose:** determine whether the frozen Q004-01..Q004-20 fixtures can be reused with revised cold prompts or require versioned successor fixtures

This audit is **not qualification evidence** and is forbidden to cold agents.

## General result

Draft 0.15 is primarily a deterministic-interpretation amendment. It does not change the intended structural distinctions of most existing Q004 fixtures.

The original scorer assertions are not rewritten merely because the amendment exists.

Current disposition:

```text
reusable fixture with revised prompt:      Q004-01..Q004-16, Q004-18..Q004-20
requires focused successor/native-record audit: Q004-17
new supplemental fixtures required:        Q004-S01..Q004-S08
```

The reusable designation means only that no contradiction with the fixture's intended native structure was found author-side. Cold qualification remains pending.

---

## Q004-01 — scope occurrence multiplicity

**Impact:** compatible / strengthened.

Draft 0.15 Section 2 sharpens the distinction between member occurrence and structural identity. The fixture's duplicate direct members remain two occurrences referring to the same represented term/object shape where applicable.

No fixture mutation required.

## Q004-02 — multiset rewrite update

**Impact:** compatible but prompt must cite Draft 0.15.

The existing rule:

```text
[(10 ?0)] > [(30 ?0)]
```

uses outer rule-side scopes as pattern/replacement containers. Draft 0.15 Section 3 now makes the already intended direct-member splice semantics explicit.

The target's duplicate `(10 20)` occurrences remain independent removable member occurrences; other incidences/terms mentioning identity `20` are not cascade-deleted.

No fixture mutation required. Current cold prompt must explicitly read Draft 0.15.

## Q004-03 — distinct application events / same successor

**Impact:** compatible.

Draft 0.15 does not change event identity semantics. The two rule objects and application events remain separately represented even when the resulting successor structures are isomorphic/identical under the selected state view.

No fixture mutation required.

## Q004-04 — nested-boundary non-flattening

**Impact:** compatible.

Draft 0.15 rule-side splice clarification does not make ordinary nested scopes transparent. The case remains a valid negative control.

No fixture mutation required.

## Q004-05 — variable ownership / aliasing / NAC binding

**Impact:** compatible with additional clarification.

The fixture exercises rewrite-pattern ownership and NAC matching, not implicit declarative-variable binding. Draft 0.15 Section 11 clarifies that NAC objects are evaluated only by an explicit matcher context, which this case supplies by asking about rewrite LHS matching.

No fixture mutation required.

## Q004-06 — reference hygiene / repeated use

**Impact:** compatible and now validates the legal reference-binding location.

The fixture's:

```text
@0=(70 71)
```

appears as a direct scope-level serialization directive, which Draft 0.15 Section 1 permits.

No binding directive appears as an ordered-edge child or declarative operand. Repeated `@0` uses continue to create multiple use-site occurrences while preserving internal identity sharing.

No fixture mutation required.

## Q004-07 — namespace collision

**Impact:** compatible.

No change to intended independent top-level namespace semantics.

No fixture mutation required.

## Q004-08 — same body / different quantifier domain

**Impact:** compatible.

Draft 0.15 does not change explicit quantifier-domain dependence. The existing case remains valid.

No fixture mutation required.

## Q004-09 — decomposition cheat

**Impact:** compatible.

This case tests source-local semantic-decomposition coverage versus archival/source-copy recovery. It does not itself depend on pairwise common-core residual accounting.

Draft 0.15 Section 7 adds a second, pairwise residual layer without weakening Q004-09.

No fixture mutation required.

## Q004-10 — independent extraction freeze

**Impact:** compatible.

No change to independent source-side extraction freeze.

No fixture mutation required.

## Q004-11 — strong versus weak embedding

**Impact:** compatible.

No change to the frozen relation-signature requirement.

No fixture mutation required.

## Q004-12 — complete common-core accounting

**Impact:** compatible for its pairwise stage.

The fixture tests pairwise common/residual/cut accounting. Draft 0.15 Section 7 now prevents those residuals from being conflated with an earlier D/extraction residual.

Because Q004-12 does not use a nontrivial source-local D residual, its existing pairwise fixture remains valid.

The new two-stage case is covered separately by Q004-S04.

## Q004-13 — automorphism/multiple mappings

**Impact:** compatible.

Draft 0.15 Section 13 further protects mapping multiplicity from serializer tie-breaks.

No fixture mutation required; supplemental Q004-S08 separately tests serializer/index algorithm scoping.

## Q004-14 — certified negative versus bounded no-witness

**Impact:** compatible.

No fixture mutation required.

## Q004-15 — index invariant under V0 versus VS

**Impact:** compatible but not sufficient for the new factorization-stage rule.

The case remains valid for view-specific invariance. It does not exercise reuse of one fingerprint across topology-changing D/factorization stages.

No fixture mutation required. Q004-S05 adds that missing pressure.

## Q004-16 — class non-vacuity/selectivity

**Impact:** compatible.

Draft 0.15's metric rule concerns claims of simplicity/minimality, not non-vacuity itself. The pass-through negative and large-structured-parameter positive remain valid.

No fixture mutation required.

## Q004-17 — native policy/witness/result self-representation

**Impact:** requires focused successor audit before cold execution.

Draft 0.15 adds load-bearing distinctions that a general native-record qualification should be capable of representing, especially:

- source-local D residual versus pairwise residual roles;
- fingerprint representation/factorization stage;
- canonical serializer/index algorithm revision when applicable;
- NAC consumption/evaluation role where condition records participate.

The existing fixture still tests useful topology but is no longer sufficient by itself to qualify the **full current native-record burden**.

Disposition:

```text
preserve existing Q004-17 as historical/base native-record fixture
create a versioned Q004-17B or supplemental native-record fixture for Draft 0.15 fields
```

Do not silently expand the existing hidden assertion set after freeze.

## Q004-18 — source ambiguity

**Impact:** compatible.

No fixture mutation required.

## Q004-19 — novel-class induction

**Impact:** compatible.

If a future result claims one candidate class is minimal/simpler than another, Draft 0.15 requires a declared metric. The existing case does not need such a claim merely to emit a new candidate schema hypothesis.

No fixture mutation required.

## Q004-20 — structural-only versus label-assisted retrieval

**Impact:** compatible.

No fixture mutation required.

---

## Prompt impact

Every pre-Draft-0.15 cold prompt currently omits `CORE_SPEC_DRAFT_0_15_CANDIDATE.md` from its exact permitted-input list.

Therefore **none of those old prompts should be executed as current evidence**.

They remain historical frozen protocols in Git history.

Current prompt revisions must add Draft 0.15 and retain the same scorer isolation.

---

## New supplemental pressure

`EXTERNAL_REVIEW_SUPPLEMENT_004.md` freezes Q004-S01..Q004-S08 for:

- reference-binding placement;
- rule-side splice versus nested scope;
- declarative variable ownership;
- two-stage residual reconstruction;
- index validity across factorization stages;
- infix parse determinism;
- NAC object versus matcher evaluation;
- canonical serializer/index algorithm scoping.

Q004-17 additionally needs a current native-record successor/addendum before the E1NR burden can be considered fully exercised.

## Execution consequence

```text
old prompt files -> historical only
fixtures except Q004-17 -> reusable under revised current prompts
Q004-17 -> preserve + add current successor pressure
S01..S08 -> construct/freeze
then begin isolated qualification
```
