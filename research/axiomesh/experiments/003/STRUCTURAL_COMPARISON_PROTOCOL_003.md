# Experiment 003 — Structural Comparison / Isomorphism Protocol

**Status:** candidate qualification protocol  
**Spec:** `../../CORE_SPEC_DRAFT_0_9_CANDIDATE.md`  
**Purpose:** make structural-class and cross-domain correspondence claims independent of labels, serialization, arbitrary factorization choice, and accidental mapping selection.

## 1. Inputs

A comparison run receives:

```text
source-preserving native object A
source-preserving native object B
qualified decomposition/factorization dependencies
comparison-role declarations
boundary/port declarations where applicable
comparison projection/mapping policy
```

The run MUST NOT receive as discovery evidence:

- human glosses naming the expected analogy;
- previously asserted class membership edges;
- `STRUCTURAL_CLASS_REGISTRY_003.axh` mappings;
- expected node/edge mappings;
- expected common cores/residuals;
- expected class names;
- scorer answers.

Those may be opened only after the structural result is frozen.

## 2. Prepare factorization sets

For each object, collect the currently qualified decomposition/factorization nodes.

Do not assume one preferred primitive-normal form.

For each factorization record:

```text
source object
factorization id
D/E dependencies used
primitive/model leaves introduced or exposed
preservation contract
known information loss, if any
open/unresolved decomposition decisions
```

If only one factorization is known, record that fact rather than claiming uniqueness.

A lossy projection is not an exact factorization and must remain marked as such.

## 3. N0 serialization normalization

Normalize only transport-transparent features:

- reference spelling/numbering;
- transparent reference expansion;
- whitespace/presentation;
- deterministic serialization ordering.

For Draft 0.9 canonical artifacts, reference dependency is order-independent inside its explicit serialization scope; textual before/after position is not semantic.

After transparent expansion, reference bindings are excluded from the semantic comparison graph.

Do not expand derived aliases, apply theorem rules, reduce `@@`, or rewrite formulas during N0.

## 4. N1 structural alpha normalization

Normalize only alpha-equivalent representational choices:

- alpha-renamable local identities;
- bound-variable numbers;
- unordered-member presentation.

Preserve:

- ordered incidence/position;
- scope/boundary nesting;
- binding ownership;
- rigid literals/identities;
- represented multiplicity;
- operational/declarative direction;
- port roles;
- source/model constraints.

A mapping between the boundary identifiers of A and B is not N1. It belongs in the comparison witness.

## 5. Select comparison projection

Every run names one or more allowed mapping modes.

Candidate projections from Draft 0.9:

```text
P0 closed structural isomorphism
PB boundary-preserving isomorphism
PS mapped-signature isomorphism
PC structural-class/schema comparison
PE profile-specific semantic equivalence
PQ explicit quotient/projection comparison
```

Important distinctions:

- P0/PB/PS exact-isomorphism results require bijective structure-preserving maps over the compared structure;
- embeddings require injective structure-preserving maps;
- homomorphisms may be non-injective and are not isomorphisms;
- PQ may collapse distinctions and must report the loss;
- PE may establish semantic equivalence without structural isomorphism.

Ordered tuple positions remain rigid unless a qualified D factorization or class-schema port mapping has explicitly exposed an alternative role correspondence. PS does not arbitrarily permute incidence positions.

## 6. Build the label-blind discovery view

Remove, hide, or randomize only labels whose explicit comparison role marks them non-evidential under the selected projection:

```text
source/domain instance labels
structural-class labels
derived alias labels already expanded for the run
provenance/retrieval-only labels
candidate-mappable semantic labels when the projection permits mapping
```

Do not remove a relation merely because humans regard its name as a label if it is actually a rigid source/model fact.

Rigid literals/model constants remain rigid unless a qualified class schema explicitly exposes a position as a parameter slot.

Record the randomization/renaming mapping for reproducibility.

## 7. Structural search

Search for the strongest **correctly typed** witnessed relation supported by the selected factorization pair and projection.

Possible dispositions include:

```text
EXACT_ISOMORPHISM
BOUNDARY_PRESERVING_ISOMORPHISM
MAPPED_SIGNATURE_ISOMORPHISM
SPECIALIZATION
EMBEDDING
STRUCTURAL_HOMOMORPHISM
QUOTIENT_OR_PROJECTION
COMMON_CORE_WITH_RESIDUALS
NON_ISOMORPHIC_UNDER_PROJECTION
UNRESOLVED_FACTORING_OR_EQUIVALENCE
```

Do not relabel a weaker homomorphism/quotient as an isomorphism.

Do not enlarge a common core by dropping constraints or relations among already-mapped objects.

## 8. Common-core integrity

For a proposed common core C:

- every load-bearing relation among mapped objects that is required by the selected projection must be preserved;
- any unmatched relation incident on a mapped object belongs to a residual/boundary cut and remains explicit;
- source multiplicity already represented as occurrence/count structure remains visible;
- boundary/port relations are preserved according to the projection.

A larger graph obtained by silently discarding an inconvenient relation is not a valid common core.

## 9. Witness format

A comparison witness must record at least:

```text
object A / factorization A
object B / factorization B
comparison projection
mapping kind: bijection / injection / homomorphism / quotient
node/object mapping
edge/incidence mapping
binding mapping
boundary/port mapping
semantic-label mapping, if any
schema-parameter mapping, if any
rigid identities/literals held fixed
constraints checked
common core C
residual Delta_A
residual Delta_B
collapsed/projected distinctions, if any
unresolved conditions
```

A witness is invalid if reconstructing the relationship requires information available only from a class/domain label withheld from discovery.

## 10. Structural-class membership

After structural evidence exists, a separate membership witness maps a class schema into the instance.

Required fields:

```text
class schema id
instance id
selected instance factorization
schema node/edge map
mapping kind
parameter assignment
port/boundary assignment
invariants checked
extra specialization constraints
residual
```

Distinguish:

- **exact instance** — schema/instance match with no unexplained load-bearing residual;
- **specialization** — class match plus explicit additional constraints, with direction stated;
- **embedding** — injective structural inclusion without automatically asserting class specialization;
- **composition** — multiple class witnesses plus gluing/joint-realizability evidence.

A direct `instance -> class` relation is only a navigation/hypothesis edge unless this witness exists.

## 11. Composition witness

For an object classified as a composition of classes, record:

```text
component class witnesses
overlap/gluing map
shared ports/identities
port variance/mapping policy
compatibility constraints
joint-realizability evidence
composition residual
```

Shared identity alone is not sufficient.

## 12. Alternative-factorization check

Repeat the comparison over all materially distinct qualified exact factorization pairs whose cost is reasonable.

Classify the result:

```text
factorization invariant
factorization dependent but explained
unresolved because factorization equivalence is incomplete
```

Never select only the factorization pair that yields the expected analogy.

A comparison may use a lossy projection factorization only when the selected disposition explicitly permits projection/quotient and the information loss is reported.

## 13. Multiple mappings / automorphisms

A pair may admit multiple valid maps because of symmetry or several distinct partial correspondences.

If different witnesses produce materially different:

- boundary/port assignments;
- schema parameters;
- residuals;
- downstream composition possibilities;

preserve those witnesses separately.

They may be quotiented only after an explicit automorphism/equivalence argument establishes that the difference is irrelevant to the requested comparison.

Do not let traversal order or implementation tie-breaking silently choose the answer.

## 14. Maximal versus maximum common cores

Several incomparable maximal common cores may exist.

A run may claim a **maximum** only when it states the optimization measure/partial order and establishes maximality under that criterion.

If no justified unique criterion exists, return the materially distinct non-dominated maximal cores rather than choosing one arbitrarily.

## 15. Mandatory adversarial controls

For every proposed reusable class/comparison procedure run:

1. **cross-domain positive** — unrelated vocabulary, same target schema;
2. **alpha/serialization positive** — local identities/references/order changed;
3. **near-isomorphic negative** — one load-bearing relation/constraint changed;
4. **boundary negative** — identical interior, incompatible ports;
5. **partial pair** — common core plus distinct residuals/cut relations;
6. **alternative-factorization pair** — equivalent object through different decompositions;
7. **misleading-label pair** — class/domain labels swapped/randomized;
8. **symmetry/automorphism pair** — multiple valid mappings requiring preservation or justified quotient;
9. **homomorphism trap** — many-to-one structure-preserving map that must not be reported as isomorphism;
10. **projection trap** — attractive common quotient that loses a load-bearing distinction and therefore must report the loss.

A class is not qualified from positive examples alone.

## 16. Unblinding / review

After the structural result and all materially distinct witnesses are frozen, reviewers may open:

- source-domain names;
- human glosses;
- candidate class registry;
- expected mappings;
- theorem/domain references;
- scorer residuals.

Review may discover a search/decoder/specification error, but it must not rewrite the frozen result.

Discrepancy categories include:

```text
comparison algorithm error
normalization-layer violation
unrecorded D/E transformation
hidden label dependence
missing boundary/port structure
missing source constraint
bad decomposition
factorization dependence
class-schema defect
mapping-kind confusion
lost automorphism/alternative witness
false positive isomorphism
false negative isomorphism
incorrect core/residual cut
correct common-core/residual result
```

## 17. Class-registry policy

`STRUCTURAL_CLASS_REGISTRY_003.axh` is navigation/hypothesis metadata.

It is deliberately forbidden as input to label-blind discovery qualification.

Current mappings are explicit unqualified hypothesis objects.

A mapping becomes qualified only after a witness produced under this protocol is independently reviewed and associated with it.

## 18. Result quality

A smaller exact common core is preferred to a larger false correspondence.

The system should expose:

```text
C
Delta_A
Delta_B
mapping witness(es)
projection/factorization assumptions
```

rather than discard residuals or mapping ambiguity to obtain a cleaner label.

The central qualification question is not:

> Did the agent assign the intended class name?

It is:

> Did the agent recover the strongest correct structural relationship under the declared projection, while preserving every residual, boundary, and mapping distinction needed to falsify that relationship?
