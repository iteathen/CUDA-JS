# Experiment 003 — Structural Comparison / Isomorphism Protocol

**Status:** candidate qualification protocol  
**Spec:** `../../CORE_SPEC_DRAFT_0_10_CANDIDATE.md`  
**Purpose:** make structural-class and cross-domain correspondence claims independent of labels, serialization, arbitrary factorization choice, adaptive comparison policy, and incomplete search.

## 1. Separate comparison axes

Every run freezes three independent axes before discovery.

### View policy

```text
V0  closed structural view
VB  boundary/port-preserving view
VS  signature-mappable structural view
VC  class-schema/parameterized view
```

### Transformation authority

```text
N0  serialization-only normalization
N1  alpha/representation normalization
D   explicitly allowed qualified factorization rules
E   explicitly allowed profile/theorem equivalences
```

### Target relation kind

Search may establish one or more of:

```text
ISOMORPHISM
STRONG_EMBEDDING
WEAK_EMBEDDING
SPECIALIZATION
HOMOMORPHISM
SIMULATION
BISIMULATION
QUOTIENT_OR_PROJECTION
COMMON_CORE
CERTIFIED_NON_ISOMORPHIC
NO_WITNESS_FOUND
UNKNOWN
RESOURCE_LIMIT
```

The relation kind does not change the view policy retroactively.

## 2. Freeze qualification policy before unblinding

Before expected mappings/results are visible, freeze:

```text
target layer
view policy
role-assignment rules
admissible N0/N1 rules
allowed D definitions/factorizations
allowed E/profile equivalences
factorization search bounds
relation kinds being sought
common-core optimization criterion, if any
resource budget
```

Source-given interface/rigidity facts remain visible because they are part of the objects.

Pair-specific mapping hints, expected class labels, expected residuals, or scorer mappings are forbidden as independent discovery authority.

A pair-specific hypothesis may be tested in an exploratory run, but the result must be labeled hypothesis-conditioned rather than blind qualification.

## 3. Inputs

A blind comparison run receives:

```text
source-preserving native object A + revision
source-preserving native object B + revision
qualified decomposition dependencies
stable-symbol namespace declarations
source-semantic role declarations
boundary/port declarations where source-given
frozen comparison policy
```

It MUST NOT receive as discovery evidence:

- human glosses naming the expected analogy;
- previously asserted class membership edges;
- `STRUCTURAL_CLASS_REGISTRY_003.axh` mappings;
- expected node/edge mappings;
- expected common core/residuals;
- expected class schema;
- pair-specific role changes chosen after seeing the expected answer.

## 4. Stable-symbol namespaces

Before comparison, resolve each stable semantic identity as:

```text
(namespace, local symbol id)
```

unless a shared/global namespace is explicitly represented.

Coincidental numeric `^n` equality across independent namespaces is ignored as semantic evidence.

Exact literals remain rigid global values unless VC exposes a literal position as a predeclared schema parameter.

## 5. Prepare qualified factorization sets

For each object, collect currently qualified factorization nodes allowed by the frozen D policy.

Record for every factorization:

```text
factorization id/revision
source object revision
D dependency revisions
applicability guards
primitive/model leaves exposed
round-trip status
loss/projection status if non-exact
open decomposition decisions
```

Do not claim uniqueness unless confluence/uniqueness is separately qualified.

Record factorization-set completeness:

```text
complete under declared D system
all currently qualified nodes
bounded-depth subset
bounded-cost subset
explicit selected subset
```

## 6. Exact decomposition check

An exact D factorization must reconstruct the source modulo N0/N1 and declared transparent surfaces.

If it cannot, relabel it as refinement/abstraction/projection/quotient/approximation and preserve the information loss.

Recursive definitions must expose base/step/fixed-point authority rather than terminate only through circular aliases.

## 7. N0 serialization normalization

Normalize only transport-transparent features:

- reference spelling/numbering after transparent resolution;
- whitespace/presentation;
- deterministic serialization ordering;
- qualified multi-document partitioning when a partition witness proves transparency.

Do not expand aliases, apply theorem rules, reduce `@@`, perform beta/substitution, infer class membership, or use peer-object information.

## 8. N1 structural normalization

Under the frozen local-role policy normalize only representation choices such as:

- alpha-renamable local identities;
- bound-variable numbers;
- unordered-member presentation.

Preserve:

- ordered incidence;
- scope/boundary nesting;
- binding ownership;
- stable namespace-qualified identities;
- exact literals;
- represented multiplicity;
- operational/declarative direction;
- port roles;
- quantifier domains/generators;
- absence/completeness contracts;
- source/model constraints.

A mapping to the peer object is not N1 canonicalization.

## 9. Label-blind discovery view

Hide or consistently randomize all labels marked non-evidential under the frozen view:

```text
source/domain instance labels
structural-class labels
derived alias labels
provenance/retrieval-only labels when excluded by the view
candidate-mappable semantic labels
```

Rigid model facts remain visible even if they have names.

Record the randomization seed/map for reproducibility.

## 10. Quantifier and carrier-role completeness

Before treating two formula structures as comparable, verify that load-bearing roles are explicit or recoverable:

```text
binder ownership
quantifier kind
domain/generator
sort/guard constraints
carrier role when behavior depends on it
```

Raw `[]` does not acquire conjunction semantics by unrepresented context in current artifacts.

Absence-sensitive structures preserve any closed/open-world completeness contract.

## 11. Structural search

Search under each materially relevant allowed factorization pair.

Do not change the view or parameter slots to improve the match.

For relation kinds:

- isomorphism requires bijective preservation/reflection under the view;
- strong embedding requires injective preservation and reflection of the compared relations among mapped objects;
- weak embedding preserves source relations but may admit explicit target residual relations;
- homomorphism may identify source objects;
- simulation/bisimulation use the profile-defined relational correspondence;
- quotient/projection records collapsed distinctions;
- common-core search records whether the core is induced/strong or weak.

Do not enlarge a common core by silently dropping load-bearing constraints.

## 12. Common-core optimization discipline

If claiming a **maximum** common core, state the objective/partial order and provide an optimality certificate or complete-search justification.

Otherwise report:

```text
maximal core found
set of non-dominated materially distinct cores found
search incomplete
```

Never convert implementation tie-breaking into semantic uniqueness.

## 13. Candidate witness format

A positive/partial correspondence witness records at least:

```text
object A / revision / factorization
object B / revision / factorization
target layer
view policy
N0/N1 policy
D/E authorities and revisions
relation kind
node/object mapping or correspondence relation
edge/incidence mapping
binding mapping
boundary/port mapping
semantic-label mapping if any
schema-parameter mapping if any
rigid identities/literals held fixed
constraints/invariants checked
common core(s)
residual Delta_A
residual Delta_B
collapsed/projected distinctions
factorization-set completeness
search budget
optimality status
```

A witness is invalid if reconstructing the relation requires knowledge only available from a class/domain label or expected answer.

## 14. Independent witness verification

Discovery and verification are separate.

A fresh verifier receives:

```text
frozen source/factorization objects
frozen comparison policy
candidate witness/certificate
```

but not expected class/domain names.

The verifier checks:

- dependency/factorization revisions;
- namespace correctness;
- mapping/correspondence domain and codomain;
- incidence/order/scope/binding preservation;
- strong/weak relation conditions;
- rigid-role preservation;
- port/parameter validity;
- quantifier-domain/guard preservation;
- absence/completeness assumptions;
- residual completeness including boundary-cut relations;
- projection loss disclosure;
- claimed optimality/negative certificate.

Only verified witnesses become qualification evidence.

## 15. Negative results

Failure to find a witness produces one of:

```text
NO_WITNESS_FOUND
UNKNOWN
RESOURCE_LIMIT
```

not `NON_ISOMORPHIC`.

`CERTIFIED_NON_ISOMORPHIC` requires:

- complete search for the declared finite problem; or
- a verified separating invariant/certificate.

The certificate and policy are stored with the result.

## 16. Structural-class membership

After structural search, a separate membership witness maps an immutable/versioned class schema into the instance.

Required fields include:

```text
class label + schema revision
instance + factorization revision
schema node/edge map
structured parameter assignment
port/boundary assignment
rigid/mappable roles
invariants checked
extra specialization constraints
residual
view/authority policy
```

A direct `instance -> class` relation remains navigation/hypothesis metadata until this witness verifies.

## 17. No post-hoc schema parameters

For an existing class run, schema graph, parameter slots, ports, variance/mapping rules, constraints, and residual policy are frozen before instance scoring.

Changing them creates a new schema revision and requires requalification.

For a new class, parameterization must be justified by independent instances or an independently specified construction law and then tested on held-out/adversarial cases.

## 18. Class-class relations

Specialization/factorization/composition/quotient/equivalence between classes requires a schema-to-schema witness using exact schema revisions.

A class-family diagram is not authority without these witnesses.

## 19. Composition witness

For an object classified as a composition of classes, record:

```text
component schema revisions and verified witnesses
overlap/gluing map
shared ports/identities
compatibility constraints
joint-realizability evidence
composition residual
```

Shared identity alone is insufficient.

## 20. Alternative-factorization check

Repeat comparison across all materially distinct qualified factorization pairs permitted by the frozen policy and budget.

Classify the outcome:

```text
factorization invariant over searched set
factorization dependent but explained
unresolved because factorization equivalence/search is incomplete
```

The result records factorization-set completeness. Never select only the pair producing the desired analogy.

## 21. Multiple mappings and automorphisms

If several witnesses differ materially in port assignment, residuals, parameter mapping, or downstream composition, preserve them.

They may be quotient-collapsed only under an explicitly verified automorphism/equivalence showing the distinction irrelevant to the requested comparison.

## 22. Target-layer discipline

Every result names one target layer:

```text
serialized/native representation graph
construction/schema graph
generated finite structure
profile denotation/behavior
proof/derivation behavior
```

A result at one layer does not automatically imply another.

A bridge between layers requires a qualified D/E witness.

Mapping opaque leaves into shared slots establishes parametric structural correspondence, not source-theory semantic equivalence unless additional E evidence exists.

## 23. Mandatory adversarial controls

For every proposed reusable class/comparison method, run at least:

1. **cross-domain positive** — unrelated vocabulary, same target structure;
2. **alpha/serialization positive** — identities/references/order changed;
3. **near-isomorphic negative** — one load-bearing constraint changed;
4. **boundary negative** — identical interior, incompatible ports;
5. **partial pair** — common core plus distinct residuals;
6. **alternative-factorization pair** — equivalent source through different decompositions;
7. **misleading-label pair** — domain/class labels swapped/randomized;
8. **symmetry/automorphism pair** — multiple candidate mappings;
9. **namespace-collision pair** — same numeric `^n`, different namespaces;
10. **policy-leak pair** — a tempting match obtainable only by post-hoc mappability/parameter changes;
11. **search-negative control** — distinguish certified negative from resource-limited no-witness;
12. **legacy/current bridge pair** where historical artifacts participate.

A reusable cross-domain class is not promoted from one motivating positive example.

## 24. Circular-evidence audit

Build a dependency graph for each membership/comparison claim.

Reject qualification if the target class/mapping hypothesis is used to justify the decomposition that is then cited as evidence for the target claim.

Already-qualified generic lower libraries are allowed; target membership and registry hints are not.

## 25. Class-registry policy

`STRUCTURAL_CLASS_REGISTRY_003.axh` is navigation/hypothesis metadata only.

It is forbidden as discovery input.

Registry qualification attaches to an exact schema revision and verified witness. Changing a schema revision does not silently preserve qualification.

## 26. Legacy artifact policy

Frozen Draft 0.2–0.8 artifacts remain valid historical evidence under their original decoder.

To participate in current comparison qualification they require either:

- current-semantics rerendering; or
- an exact verified legacy-to-current bridge recording changed conventions.

Historical reproducibility is not current structural qualification.

## 27. Unblinding / review

After the candidate result and witness/certificate are frozen and independently verified, reviewers may open:

- source-domain names;
- human glosses;
- candidate class registry;
- expected mappings;
- theorem/domain references.

Review may classify an error but must not rewrite the frozen discovery result.

Discrepancy categories include:

```text
comparison-search error
witness-verification error
normalization-layer violation
policy/adaptive-role leakage
namespace collision
hidden label dependence
missing boundary/port structure
missing source constraint
bad/inexact decomposition
recursive-definition defect
factorization dependence
class-schema/version defect
circular evidence
false positive correspondence
false negative/no-witness result
negative-certificate error
correct witnessed result
```

## 28. Result quality rule

A smaller exact witnessed common core is preferable to a larger false correspondence.

Unknown is preferable to an unsupported negative.

A parameterized structural analogy is preferable to an unsupported claim of semantic equivalence.

The central question is:

> Did the agent recover the strongest justified relationship under the frozen policy, with independently checkable mappings, residuals, boundaries, dependencies, and uncertainty about incomplete search/factorizations left explicit?
