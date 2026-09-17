# Experiment 003 — Structural Discovery Protocol 004

**Status:** candidate corpus-discovery protocol  
**Spec:** `../../CORE_SPEC_DRAFT_0_12_CANDIDATE.md`  
**Pairwise verifier:** `STRUCTURAL_COMPARISON_PROTOCOL_003.md`

## Purpose

Qualify the step before pairwise comparison: finding which independently represented objects/substructures should be compared at all.

A sound pairwise verifier does not prevent false negatives if retrieval, substructure extraction, namespaces, or indexes prevent the right pair from reaching it.

## 1. Freeze corpus and target policy

Before expected cross-domain matches are unblinded, freeze:

```text
corpus revision
target comparison layer/view/relation kinds
eligible object/substructure population
structural namespace rules
substructure extraction rules
factorization/index depth bounds
label visibility policy
structural fingerprint/index definitions
candidate-generation thresholds
pairwise comparison policy families
resource budget
```

Recall/false-negative claims are relative to this target policy.

## 2. Enforce discovery isolation

Partition available material as:

```text
DISCOVERY_VISIBLE
ARCHIVAL_ONLY
REVIEWER_SCORER_ONLY
```

`ARCHIVAL_ONLY` may include lossless source backups, human glosses, historical encodings, and stewardship provenance.

`REVIEWER_SCORER_ONLY` may include expected mappings/classes/answers.

Blind qualification uses a fresh isolated agent/context or another enforceable information-flow boundary. Merely tagging data as hidden is insufficient if the agent already read it.

Record every file/resource accessible before result freeze.

## 3. Candidate generation channels

A run may combine:

- qualified structural invariants/fingerprints;
- local motif/subgraph indexes;
- factorization signatures;
- qualified class labels from already-known instances;
- semantic/source labels as optional retrieval boosters;
- learned approximate indexes as explicitly non-semantic heuristics.

At least one qualification path must allow unlabeled cross-domain instances to become candidates, or equivalent structural recall must be demonstrated with labels hidden.

## 4. Fingerprint/index declaration

Every structural index declares:

```text
index revision
target layer
qualified view/role policy
N0/N1 policy
D/E policy
factorization depth
included/excluded roles
boundary treatment
parameter treatment
namespace handling
invariance guarantee, if any
collision behavior
known false-positive risk
known false-negative risk
algorithm soundness/completeness/heuristic status
random seed where relevant
```

A mismatch may prune a relation only when a verified invariant establishes:

```text
A R B => f(A) = f(B)
```

for the exact declared relation/view/layer.

Injectivity is unnecessary for mismatch pruning. Equal fingerprints do not prove correspondence unless a much stronger property is independently established.

An index qualified for one view is heuristic outside that view unless separately qualified.

Approximate/learned scores are retrieval metadata only and never witness semantics.

## 5. Structural namespaces

Bare structural IDs and stable semantic symbols are resolved in their proper namespaces before indexing.

Coincidental numeric equality across independent namespaces must not create candidate identity/sharing facts.

Intentional cross-document sharing requires an explicit shared namespace/import/port/bundle-partition relation.

## 6. Substructure extraction

Each extracted candidate records:

```text
source object revision
extraction rule revision
extraction kind:
  induced substructure / boundary-cut component /
  relation-filtered projection / quotient / other declared form
selected substructure
boundary/cut relations
discarded residual/context
dropped internal relations as projection loss, if any
factorization dependencies
selection timing relative to unblinding
```

Pair-specific post-hoc extraction is exploratory, not blind qualification evidence.

A strong/induced common-core claim cannot hide relations among retained objects through a non-induced extraction.

## 7. Candidate-pair generation

Generate candidate pairs without expected class/mapping answers.

Record:

```text
retrieval channel(s)
score/signature causing candidacy
factorization/substructure revisions
labels visible to that channel
target policy/relation for which candidacy was generated
```

Deduplicate only by transparent retrieval identity. Preserve candidates whose distinct boundaries/factorizations could yield different results.

## 8. Pairwise comparison

Hand each candidate to `STRUCTURAL_COMPARISON_PROTOCOL_003.md` under a frozen policy.

Retrieval score does not affect witness validity.

Positive structural claims require independently verified witnesses regardless of retrieval source.

## 9. Coverage accounting

A corpus run records:

```text
objects/substructures eligible
objects/substructures indexed
qualified factorization nodes considered
candidate pairs emitted
candidate pairs searched
candidate witnesses independently verified
resource/time limits
unindexed/unsearched regions
```

If coverage is incomplete, absence of a reported relation remains unknown outside the searched set.

## 10. Recall controls

Hold out positives from label/class hints and test structural retrieval.

Controls include:

- unrelated domain vocabulary;
- randomized source/class labels;
- independent structural/semantic namespaces;
- serialization/identity randomization;
- alternative factorization;
- partial/common-core cases;
- structurally novel classes absent from the registry;
- synthetic/independently sourced structures not used to design the index.

Recall is reported relative to the frozen target policy.

## 11. Precision/selectivity controls

Use near-isomorphic, boundary, namespace-collision, policy-leak, and parameter-abuse negatives.

Measure candidate versus independently verified precision.

A noisy retrieval index may be acceptable if recall and total lifecycle cost are favorable and exact verification remains authoritative.

## 12. Discovery result states

Do not collapse these states:

```text
VERIFIED_RELATION_FOUND
CANDIDATE_RETRIEVED_NO_VERIFIED_RELATION
PAIR_SEARCHED_NO_WITNESS
PAIR_CERTIFIED_NEGATIVE
PAIR_NOT_GENERATED
OBJECT_NOT_INDEXED
FACTORIZATION_NOT_AVAILABLE
UNKNOWN_RESOURCE_LIMIT
```

Only a verified negative certificate/complete search for the declared pairwise problem supports certified non-isomorphism.

## 13. Novel-class discovery

Qualification must include objects whose correct reusable class/common-core hypothesis is absent from the catalog.

The system must be able to return a witnessed new candidate structural class/common-core hypothesis rather than forcing the object into the nearest known label.

Such a candidate remains unqualified until the normal schema, non-vacuity/selectivity, held-out, and adversarial promotion path succeeds.

## 14. Generalization audit

Evaluate retrieval and comparison-policy families on held-out/synthetic structures not used to design:

- class schemas;
- fingerprint rules;
- thresholds;
- role mappings;
- benchmark-specific heuristics.

## 15. Labels after discovery

Qualified labels may accelerate future retrieval/construction.

Inferred class membership remains derived knowledge with schema revision, target layer/view, factorization set, verified witness, and qualification status attached.

The system must retain a structural path by which an unlabeled new instance can still enter candidate search.

## 16. Metrics

Record at minimum:

```text
policy-relative known-positive recall
candidate precision
verified precision
candidate count
pairwise verification count
context/compute/index size
factorization depth/coverage
label-blind versus label-assisted recall
false-negative causes
false-positive causes
novel-class discovery success
```

The target is high structural discovery yield under bounded total lifecycle cost with exact, independently verified final relations.
