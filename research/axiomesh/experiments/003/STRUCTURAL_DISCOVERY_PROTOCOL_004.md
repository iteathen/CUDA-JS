# Experiment 003 — Structural Discovery Protocol 004

**Status:** candidate corpus-discovery protocol  
**Spec:** `../../CORE_SPEC_DRAFT_0_11_CANDIDATE.md`  
**Pairwise verifier:** `STRUCTURAL_COMPARISON_PROTOCOL_003.md`

## Purpose

Qualify the step before pairwise comparison: finding which independently represented objects/substructures should be compared at all.

A sound pairwise verifier does not prevent false negatives if candidate retrieval is label-bound or incomplete.

## 1. Freeze corpus and policy

Before expected cross-domain matches are unblinded, freeze:

```text
corpus revision
eligible object/substructure population
substructure extraction rules
factorization/index depth bounds
label visibility policy
structural fingerprint/index definitions
candidate-generation thresholds
pairwise comparison policy families
resource budget
```

## 2. Discovery evidence partition

Mark bundle data as:

```text
DISCOVERY_VISIBLE
ARCHIVAL_ONLY
REVIEWER_SCORER_ONLY
```

`ARCHIVAL_ONLY` may include lossless source backups, human glosses, historical encodings, and stewardship provenance.

`REVIEWER_SCORER_ONLY` may include expected mappings/classes/answers.

Neither category is visible to blind candidate generation.

## 3. Candidate generation channels

A run may combine:

- structural fingerprints/hashes;
- local motif/subgraph indexes;
- factorization signatures;
- qualified class labels from already-known instances;
- semantic/source labels as optional recall boosters;
- learned approximate indexes, if their role is measured and non-authoritative.

At least one qualification channel must remain label-blind for novel cross-domain discovery, or the system must establish equivalent recall guarantees with labels hidden.

## 4. Fingerprint/index declaration

Every structural index declares:

```text
index revision
target layer
N0/N1 policy
D/E policy
factorization depth
included/excluded roles
boundary treatment
parameter treatment
namespace handling
collision behavior
known false-positive risk
known false-negative risk
```

A fingerprint is retrieval evidence only, never a structural witness.

## 5. Substructure extraction

If the index/search operates on components/subgraphs rather than whole source objects, each extracted candidate records:

```text
source object revision
extraction rule revision
selected substructure
boundary/cut relations
discarded residual/context
factorization dependencies
selection timing relative to unblinding
```

Pair-specific post-hoc extraction is exploratory, not blind qualification evidence.

## 6. Candidate-pair generation

Generate candidate pairs without using expected class/mapping answers.

Record:

```text
retrieval channel(s)
score/signature causing candidacy
factorization/substructure revisions
labels visible to that channel
```

Deduplicate only by a transparent retrieval identity; do not merge candidates whose materially distinct boundaries/factorizations could yield different results.

## 7. Pairwise comparison

Each candidate pair is handed to `STRUCTURAL_COMPARISON_PROTOCOL_003.md` with its own frozen comparison policy.

Retrieval score does not affect witness validity.

A low-score pair that verifies structurally is a valid discovery.

A high-score pair that fails verification remains a retrieval false positive.

## 8. Coverage accounting

A corpus run records:

```text
objects/substructures eligible
objects/substructures indexed
known qualified factorization nodes considered
candidate pairs emitted
candidate pairs pairwise searched
candidate pairs independently verified
resource/time limits
unindexed/unsearched regions
```

If exhaustive pairwise coverage is not achieved, the run must not claim no undiscovered isomorphs remain.

## 9. Recall controls

Hold out known positive pairs from label/class hints and measure whether the retrieval system surfaces them structurally.

Mandatory controls include:

- unrelated domain vocabulary;
- randomized source/class labels;
- independent symbol namespaces;
- serialization/identity randomization;
- alternative factorization;
- partial/common-core cases;
- newly generated synthetic classes not used to design the index.

## 10. Precision controls

Include near-isomorphic/boundary/policy-leak negatives that generate tempting retrieval similarity but must fail or downgrade at pairwise verification.

Measure:

```text
candidate precision
verified precision
false-positive causes
```

A noisy retrieval index may be acceptable if recall/total cost are good and pairwise verification remains exact.

## 11. Discovery result states

For any potential relation distinguish:

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

These states must not collapse into a single “no match.”

## 12. Generalization audit

Evaluate the candidate-generation policy on held-out/synthetic structures not used to design:

- class schemas;
- fingerprint rules;
- thresholds;
- role mappings;
- benchmark-specific heuristics.

A discovery system that works only on the examples that shaped its indexes is not qualified for the AxiomeSH mission.

## 13. Labels after discovery

After a relation is pairwise verified, qualified class/domain labels may be attached and used to accelerate future retrieval.

The system must retain a structural path by which an unlabeled new instance can still enter the candidate set.

## 14. Metrics

Record at minimum:

```text
known-positive recall
candidate precision
verified precision
candidate count
pairwise verification count
context/compute/index size
factorization depth/coverage
label-blind versus label-assisted recall
false-negative causes
false-positive causes
```

The target is not zero candidates. It is high structural discovery yield under bounded total lifecycle cost while preserving exact verification.
