# AxiomeSH Core Specification — Draft 0.15 Candidate

**Status:** frozen corrective amendment produced from isolated external review plus independent disposition  
**Base authority:** `CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md` + `CORE_SPEC_DRAFT_0_14_CANDIDATE.md`  
**Form:** normative amendment; Drafts 0.13 and 0.14 remain in force except where this document explicitly tightens them  
**Promotion:** experimental-branch authority only until independently qualified  
**Growth rule:** this amendment adds no domain operator, no structural class, and no new irreducible primitive

Draft 0.15 corrects deterministic grammar/transport boundaries and witness accounting exposed by an isolated external review. It deliberately rejects recommendations that would conflate a **useful surface** with an **irreducible primitive** or force a single canonical factorization merely for indexing convenience.

The decomposition-first discipline remains:

```text
semantic distinction
-> lower structural construction
-> structural comparison / class discovery
-> retained useful label or surface
-> primitive promotion only if lower construction fails or is materially worse
```

---

## 1. Reference bindings are serialization directives, not generic semantic terms

Draft 0.13 Section 5 is tightened.

The generic semantic term grammar no longer includes a reference-binding directive as an arbitrary `term`.

Conceptually:

```text
term       := id | literal | label | var | ref
            | edge | scope | choice | negmatch | neg
            | forall | exists | abstract | eq | implies
            | rule | instantiate

scope_item := term | ref_binding
scope      := [scope_item ...]
ref_binding := ref = term
edge       := (term ...)
choice     := {term ...}
```

A `ref_binding`:

- is legal only in a serialization environment that explicitly permits binding directives, with ordinary scope-level serialization environments the default supported location;
- is forbidden as an ordered-edge positional child, declarative-formula operand, choice alternative, or any other place where its later disappearance would change semantic arity/occurrence structure;
- occupies **no semantic member occurrence** after N0 resolution;
- exists solely to define hygienic reference resolution for the containing serialization environment and permitted descendants;
- remains order-independent and acyclic under the existing reference rules.

Therefore N0 reference resolution may remove the binding directive without deleting a semantic tuple position or member occurrence.

A future dedicated manifest/reference-environment surface MAY be introduced only if qualification shows ordinary scope-level directives are materially inadequate. No new primitive is introduced here.

---

## 2. Structural identity is distinct from member occurrence

Draft 0.13 Sections 8.1–8.2 and 12.3 are tightened.

A direct scope member is an **occurrence referring to a represented term/object**. A bare structural identity denotes the same object wherever that identity is referenced within its namespace, but each direct membership of that identity is still a separately countable occurrence.

Thus:

```text
[ 7 7 ]
```

contains two direct member occurrences referring to structural identity `7`; it does not create two structural identities.

Default rewrite multiset subtraction/addition operates on selected **member occurrences** in the application scope.

Removing one direct occurrence of identity `7`:

- removes only that selected membership occurrence;
- does not destroy the structural identity `7` as a namespace object;
- does not cascade-delete or rewrite other edges/incidences/ports/scopes that mention `7`;
- does not imply object destruction even if no other direct occurrence of `7` remains in that one scope.

Global object deletion, cascading incidence removal, garbage collection, ownership destruction, or lifetime semantics require an explicit represented/profile construction.

If a particular occurrence itself needs persistent identity, ports, provenance, or relations, that occurrence is reified explicitly as already required by Draft 0.13.

---

## 3. Rule-side outer scopes are pattern/replacement containers, not inserted nested scope objects

Draft 0.13 Section 12 is tightened for `scope > scope`.

For a rule written:

```text
[LHS_members] > [RHS_members]
```

the **outermost** left and right scopes are rule-side containers.

They define, respectively:

- the multiset/pattern of direct member occurrences selected from the declared application scope; and
- the multiset of instantiated direct member occurrences added to that application scope.

The outer rule-side brackets are not themselves matched/inserted as nested semantic scope members.

Default update is therefore:

```text
S' =
  (S multiset-minus instantiated_direct_members(LHS))
  multiset-plus instantiated_direct_members(RHS)
```

with unmatched context retained.

To match a literal nested scope member, the LHS contains that nested scope as a member, for example:

```text
[[A B]] > [...]
```

To construct a literal nested scope member, the RHS contains the nested scope as a member, for example:

```text
[...] > [[A B]]
```

This rule-side container convention is structural execution syntax only. It does not make ordinary nested scopes transparent or flattenable elsewhere.

---

## 4. Declarative constructors do not bind or quantify variables

Draft 0.13 Sections 11 and 13 are tightened.

The following surfaces introduce **no variable owner** by themselves:

```text
A => B
A == B
~A
{A B ...}
```

A variable occurrence inside one of those constructions must inherit an explicit owner/interface from native surrounding structure, such as:

- `*?n` or `+?n` quantifier;
- `\?n` abstraction;
- schema/pattern parameter owner;
- rewrite-pattern owner where the declarative object is explicitly part of that pattern contract;
- another qualified represented binder/interface.

A standalone object asserted to be a **closed declarative proposition** is invalid if any variable occurrence remains unowned/free.

Open formula/schema terms remain legal only when the containing native interface explicitly owns and exposes their free-variable interface.

There is no implicit universal quantification, existential quantification, or wildcard/pattern interpretation merely because `?n` appears in a declarative surface.

---

## 5. Surface grammar admission does not imply primitive status

Draft 0.13 Sections 4.4, 5, 14.3, and 41 are clarified rather than changed in substance.

A constructor's presence in the transport grammar means only:

```text
this serialization can be parsed and preserved
```

It does **not** mean:

```text
this constructor is an irreducible substrate primitive
```

Accordingly, `@@` remains parseable native surface syntax while its semantics remain a candidate bound-body-instantiation construction subject to factorization into lower structural rewrite/binding machinery.

The same distinction applies to `=>`, `==`, `~`, choice, quantifier surfaces, exact-literal shorthand, and stable-label shorthand.

No grammar production receives primitive status merely by being parseable.

---

## 6. No dedicated fresh-allocation shorthand is required during the qualification freeze

Draft 0.14 Section 7 remains authoritative.

The absence of a special token such as `new(...)` or `+!` is **not** an expressiveness defect while freshness can be represented through ordinary native structure satisfying the Draft 0.14 allocation contract.

A profile MAY use a stable, namespaced label as a compact constructor for a qualified lower fresh-allocation construction, but that label is not primitive semantic authority.

A dedicated compact surface may be considered later only if qualification shows material correctness/reconstruction/reasoning/lifecycle advantage. Convenience alone does not justify syntax growth.

---

## 7. Source-local transformation residuals and pairwise comparison residuals are distinct layers

Draft 0.13 Section 19.3 and Draft 0.14 Section 10 are tightened.

Let a source-side qualified factorization/extraction select a comparison-stage representation:

```text
A_source --D_A / extraction_A--> A_cmp
B_source --D_B / extraction_B--> B_cmp
```

The transformation records for `D_A` and `D_B` own their own source-local information:

```text
D residual / loss / provenance
boundary/context discarded by extraction
transparent reconstruction information
round-trip/compaction witness when exact
```

Pairwise comparison then operates on the frozen comparison-stage objects:

```text
A_cmp <-> B_cmp
```

and owns a **different** accounting layer:

```text
common core C
pair residual_A / pair residual_B
pair cut_A / pair cut_B
excluded-by-view_A / excluded-by-view_B
pair projection-loss_A / pair projection-loss_B
```

### 7.1 Pairwise reconstruction target

The pairwise witness reconstructs the comparison-stage objects under the declared accounting contract:

```text
A_cmp = reconstruct_pair(C, pair_residual_A, pair_cut_A,
                         pair_excluded_A, pair_projected_A,
                         pair_transparent_A)

B_cmp = reconstruct_pair(C, pair_residual_B, pair_cut_B,
                         pair_excluded_B, pair_projected_B,
                         pair_transparent_B)
```

### 7.2 Full-source reconstruction target

Full-source reconstruction is a separate obligation through the source-local D/extraction record:

```text
A_source = reconstruct_D_A(A_cmp, D_A_residual, D_A_context, ...)
B_source = reconstruct_D_B(B_cmp, D_B_residual, D_B_context, ...)
```

only when the corresponding transformation is exact/reconstructable.

If `D_A` or `D_B` is a lossy abstraction/projection/quotient, no full-source reconstruction is claimed from `A_cmp`/`B_cmp`; the information loss remains explicit.

A verifier MUST NOT satisfy source reconstruction by silently merging D-local residuals with pairwise residuals.

---

## 8. Structural fingerprints/indexes are qualified for an explicit representation/factorization stage

Draft 0.13 Section 32 and Draft 0.14 Section 2 are tightened.

Every structural fingerprint/index declaration additionally records the exact **representation stage** it indexes, for example:

```text
raw/current source representation
specific qualified factorization node/revision
specific extraction node/revision
qualified factorization set
qualified factorization-invariant projection
```

A pruning invariant:

```text
A R B => f(A) = f(B)
```

is valid only for the exact declared target layer/view/relation/representation-stage/D policy for which it was qualified.

Consequences:

- a fingerprint proved invariant on raw structures may be used on raw structures for that relation;
- it may not be assumed invariant after a topology-changing D factorization;
- a fingerprint proved on one factorization node may not prune another factorization node by default;
- cross-factorization discovery may index multiple qualified factorization nodes;
- alternatively it may use a separately proved factorization-invariant fingerprint/projection;
- otherwise the index remains heuristic and its misses cannot support completeness or negative claims.

AxiomeSH does **not** require one canonical post-D factorization merely to make indexing easier.

---

## 9. Surface signatures remain source-faithful and are not VS isomorphism keys

Draft 0.13 Sections 6.3, 17, 24, and 32 are clarified.

`Sig_surface(T)` inventories the namespace-local stable labels actually used by the selected serialized surface.

Stable `^n` labels are not N1 alpha-renamable merely because a later VS comparison may map selected labels.

Therefore two source-faithful bundles may intentionally have different `Sig_surface` sets while still admitting a VS structural correspondence.

A retrieval/index policy intended to be label-mappable under VS must use an explicitly qualified VS-compatible structural projection/signature/index. It MUST NOT require raw `Sig_surface` equality unless the frozen view specifically makes those labels rigid.

Surface-signature equality remains neither necessary nor sufficient evidence of cross-domain isomorphism under a label-mappable view.

---

## 10. Infix serialization is conservative and deterministic during the freeze

Draft 0.13 Section 5's statement that mixed infix forms may be “nested/parenthesized” is superseded because ordinary parentheses already denote ordered incidence and are not generic non-semantic parser grouping.

During the Draft 0.15 qualification freeze:

- `()` always denotes ordered incidence; it is not transparent parser grouping;
- no implicit precedence/associativity is assigned among `@@`, `==`, and `=>` beyond the single operator occurrence explicitly parsed in one surface constructor;
- an un-delimited expression containing more than one infix operator occurrence at the same serialization level is invalid/ambiguous and MUST be rejected rather than guessed;
- chained forms such as `A == B == C`, `A @@ B @@ C`, or mixed forms such as `A => B == C` are invalid unless their intended nesting is represented by an explicit semantic/native constructor structure supplied by the relevant profile/schema;
- implementations MUST NOT use ordinary scope or ordered-incidence wrappers as accidental non-semantic parentheses unless a separately qualified transparent grouping surface is later introduced.

This conservative rule prevents parser-dependent formula trees without adding a new grouping token during the specification-growth freeze.

A future transparent grouping surface MAY be considered only after qualification demonstrates that the conservative serialization is materially inadequate.

---

## 11. Negative-match terms are first-class condition objects; evaluation requires an explicit matcher context

Draft 0.13 Sections 5 and 12.5 are tightened.

`!X` always denotes a **negative structural match condition object**.

Its mere presence as represented structure does not execute a query against an ambient scope.

The condition is evaluated only by a matcher/pattern/execution profile that explicitly supplies:

```text
application/match boundary
compatible positive bindings
completeness/open-world assumptions when relevant
condition-consumption role
```

Outside such a consuming matcher context, `!X` is represented condition/data structure and has no implicit ambient evaluation.

This mirrors the rule-object discipline:

```text
rule exists != rule active
NAC object exists != NAC evaluated
```

A profile that permits NAC objects only in designated pattern positions may reject other placements, but that is a profile/validation rule rather than hidden reader context.

---

## 12. Class/factorization minimality claims require a declared measure

Draft 0.13 class-promotion language referring to a “simpler” existing qualified class/factorization is tightened.

A claim that one candidate is **simpler**, **minimal**, or **preferred by simplicity** requires a declared metric or partial order, including the dimensions being measured.

Without such a measure:

- preserve competing exact qualified factorizations/classes;
- use verified class-class factorization/equivalence witnesses to expose redundancy where possible;
- do not reject a candidate solely because a reviewer or implementation informally regards another construction as simpler.

A candidate may still fail non-vacuity/selectivity or be shown exactly factorable into already-qualified classes; those are structural claims independent of an undefined global simplicity ranking.

---

## 13. Canonical serialization/index labels are algorithm- and revision-scoped

Draft 0.13 Sections 19.2, 30, 32, and 36 are tightened.

A deterministic canonical serialization, canonical graph labeling, or hash/index derived from such labeling MUST record:

```text
algorithm identity/revision
input representation stage
N0/N1 policy
view/relation target if used for pruning
symmetry/tie handling relevant to output identity
qualified invariance/completeness claims, if any
```

AxiomeSH does not require one global canonical-labeling algorithm.

Different sound serializers may emit different canonical-looking representatives unless an equivalence/compatibility contract relates their algorithms.

Comparison correctness and preservation of materially distinct automorphism witnesses MUST NOT depend on an incidental tie-break inside one serializer.

---

## 14. Supplemental qualification controls

The existing Draft 0.14 twenty-target suite remains frozen. The following **supplemental** controls are added because the external review exposed deterministic gaps not explicitly isolated by the original twenty cases:

1. reference binding in legal scope environment versus illegal ordered-edge/formula position, including arity preservation after N0;
2. rule-side outer container splice versus literal nested-scope match/construction;
3. closed declarative object with unowned variable rejection versus explicitly owned open formula acceptance;
4. source-local D residual versus pairwise common-core residual two-stage reconstruction;
5. fingerprint/index reuse across distinct qualified factorization stages;
6. infix parse determinism and rejection of mixed/chained un-delimited forms;
7. first-class NAC object versus explicit matcher evaluation context;
8. canonical serialization/hash algorithm scoping without collapsing automorphism witnesses.

These are qualification tests, not new classes or primitives.

---

## 15. External-review disposition is part of experiment provenance

The review that triggered this amendment is recorded in:

`experiments/004/EXTERNAL_REVIEW_GEMINI_001_DISPOSITION.md`

Its recommendations are not treated as authority. In particular Draft 0.15 explicitly rejects:

- removing `@@` from parseable surface grammar merely because it is not primitive;
- adding a dedicated fresh-allocation token before lower-construction qualification;
- alpha-renaming stable labels inside `Sig_surface`;
- forcing one canonical post-D factorization for indexing.

---

## 16. Freeze discipline continues

Draft 0.15 does not reopen feature growth.

The next step is qualification against Drafts 0.13 + 0.14 + 0.15.

Any further mutation must be evidence-driven and classified as one of:

```text
parser/serialization defect
semantic ambiguity
representation expressiveness defect
comparison/discovery defect
fixture/protocol defect
decoder/search implementation error
non-defect / reviewer misunderstanding
```

Until qualification says otherwise:

```text
surface != primitive
occurrence != identity
rule-side container != nested scope
formula constructor != binder
D residual != pair residual
index invariance is stage-specific
surface signatures remain source-faithful
ambiguous infix is rejected
NAC evaluation requires matcher authority
minimality requires a metric
```