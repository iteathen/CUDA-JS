# Experiment 003 — Structural Comparison / Isomorphism Protocol

**Status:** candidate qualification protocol  
**Spec:** `../../CORE_SPEC_DRAFT_0_9_CANDIDATE.md`  
**Purpose:** make structural-class and cross-domain isomorphism claims independent of labels, serialization, and arbitrary factorization choice.

## 1. Inputs

A comparison run receives:

```text
source-preserving native object A
source-preserving native object B
qualified decomposition dependencies
comparison-role declarations
boundary/port declarations where applicable
comparison projection
```

The run MUST NOT receive as discovery evidence:

- human glosses naming the expected analogy;
- previously asserted class membership edges;
- `STRUCTURAL_CLASS_REGISTRY_003.axh` mappings;
- expected node/edge mappings;
- expected common core;
- scorer residuals.

Those may be used only after the structural result is frozen.

## 2. Prepare factorization sets

For each object, collect the currently qualified decomposition/factorization nodes.

Do not assume one preferred primitive-normal form.

Record:

```text
source object
factorization id
transform/definition dependencies used
primitive/model leaves introduced or exposed
open/unresolved decomposition decisions
```

If only one decomposition is known, record that fact rather than claiming uniqueness.

## 3. N0 serialization normalization

Normalize only transport-transparent features:

- reference spelling/numbering;
- whitespace/presentation;
- deterministic serialization ordering.

Do not expand aliases, apply theorem rules, reduce `@@`, or rewrite formulas.

## 4. N1 structural normalization

Under the selected projection normalize:

- alpha-renamable local identities;
- bound-variable numbers;
- unordered-member presentation.

Preserve:

- ordered incidence;
- scope/boundary nesting;
- binding ownership;
- rigid literals/identities;
- represented multiplicity;
- operational/declarative direction;
- port roles;
- source/model constraints.

## 5. Label-blind discovery view

Before discovery, remove or randomize labels that are not rigid under the selected projection:

```text
source/domain instance labels
structural-class labels
derived alias labels
provenance/retrieval-only labels
candidate-mappable semantic labels where the projection requests mapping
```

Rigid literals/model constants remain rigid unless the class schema explicitly exposes the position as a parameter slot.

The randomized mapping seed/renaming is recorded for reproducibility.

## 6. Structural search

Search for the strongest witnessed relation supported by the selected factorization pair and projection.

Prefer, in order of semantic precision rather than desirability:

```text
exact isomorphism
boundary-preserving isomorphism
mapped-signature isomorphism
specialization / embedding
common core + residuals
non-isomorphic under projection
unresolved factoring/equivalence
```

Do not enlarge a common core by dropping constraints that are not mappable under the projection.

## 7. Witness format

A comparison witness must record:

```text
object A / factorization A
object B / factorization B
comparison projection
node mapping
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
unresolved conditions
```

A witness is invalid if reconstructing the mapped structures requires knowledge available only from a class/domain label.

## 8. Structural-class membership

After a comparison/classification candidate exists, a separate membership witness maps a class schema into the instance.

Required fields:

```text
class schema id
instance id
selected instance factorization
schema node/edge map
parameter assignment
port/boundary assignment
invariants checked
extra specialization constraints
residual
```

A direct `instance -> class` relation is only an index/hypothesis unless this witness exists.

## 9. Composition witness

For an object classified as a composition of classes, record:

```text
component class witnesses
overlap/gluing map
shared ports/identities
compatibility constraints
joint-realizability evidence
composition residual
```

Shared identity alone is not sufficient.

## 10. Alternative-factorization check

Repeat the comparison over all materially distinct qualified factorization pairs whose cost is reasonable.

Classify the result:

```text
factorization invariant
factorization dependent but explained
unresolved because factorization equivalence is incomplete
```

Never select only the factorization pair that yields the expected analogy.

## 11. Mandatory adversarial controls

For every proposed reusable class, run:

1. **cross-domain positive** — unrelated vocabulary, same target structure;
2. **alpha/serialization positive** — identities/references/order changed;
3. **near-isomorphic negative** — one load-bearing constraint changed;
4. **boundary negative** — identical interior, incompatible ports;
5. **partial pair** — common core plus distinct residuals;
6. **alternative-factorization pair** — equivalent object through different decompositions;
7. **misleading-label pair** — class/domain labels swapped or randomized.

A class is not qualified if only the positive cases pass.

## 12. Unblinding / review

After the structural result and witness are frozen, reviewers may open:

- source-domain names;
- human glosses;
- candidate class registry;
- expected mappings;
- theorem/domain references.

Review may discover a decoder/search error, but it must not rewrite the frozen result.

Discrepancy categories include:

```text
comparison algorithm error
normalization-layer violation
hidden label dependence
missing boundary/port structure
missing source constraint
bad decomposition
factorization dependence
class-schema defect
false positive isomorphism
false negative isomorphism
correct common-core/residual result
```

## 13. Class-registry policy

`STRUCTURAL_CLASS_REGISTRY_003.axh` is a navigation and hypothesis artifact.

It is deliberately **forbidden as input** to label-blind discovery qualification because otherwise the registry would tell the agent which objects are expected to match.

A mapping in that registry becomes qualified only after a witness produced under this protocol is attached to it.

## 14. Result quality

A smaller exact common core is preferred to a larger false correspondence.

The system should expose:

```text
C
Delta_A
Delta_B
```

rather than discard the residuals to obtain a cleaner label.

The central qualification question is not “did the agent assign the intended class name?”

It is:

> Did the agent recover the strongest correct structural relationship, with the mapping and residual distinctions needed to falsify it?
