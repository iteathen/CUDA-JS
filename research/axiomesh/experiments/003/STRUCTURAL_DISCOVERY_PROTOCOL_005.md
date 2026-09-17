# Experiment 003 — Structural Discovery Protocol 005

**Status:** candidate corpus-discovery protocol  
**Spec:** `../../CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`  
**Pairwise protocol:** `STRUCTURAL_COMPARISON_PROTOCOL_005.md`  
**Supersedes for new qualification:** `STRUCTURAL_DISCOVERY_PROTOCOL_004.md`

## Purpose

Qualify the step before pairwise comparison: which independently represented objects/components are proposed for structural comparison at all.

A perfect pairwise verifier cannot recover a true relation that retrieval/indexing/extraction never proposes.

---

## 1. Freeze corpus, extraction universe, and policy family

Before expected cross-domain matches are unblinded, freeze:

```text
corpus revision
eligible object/component extraction universe
substructure extraction rules + revisions
factorization/index depth/cost bounds
label visibility policy
structural fingerprint/index definitions
candidate-generation thresholds
pairwise comparison policy family
resource budget
```

The extraction universe states whether enumeration is exhaustive, bounded-depth, bounded-cost, sampled, heuristic, or explicit-selected.

Coverage claims are scoped to that universe.

---

## 2. Evidence isolation

Partition resources:

```text
DISCOVERY_VISIBLE
ARCHIVAL_ONLY
REVIEWER_SCORER_ONLY
```

Use a fresh isolated context/tool boundary so excluded material is actually unavailable during candidate generation and pairwise discovery.

Record accessible resources for each stage.

`ARCHIVAL_ONLY` may contain lossless source backups, historical encodings, human stewardship gloss, and provenance.

`REVIEWER_SCORER_ONLY` may contain expected mappings/classes/answers.

Neither is blind-discovery evidence.

---

## 3. Independent source-side decomposition/extraction

Before objects are paired:

1. derive/freeze each source's allowed factorization set independently;
2. derive/freeze source-side components/extractions under the generic frozen extraction rules;
3. record ports/boundary cuts/residual context;
4. record D/E dependencies and source-local roles;
5. only then expose candidates to cross-source pair generation.

Pair-conditioned post-hoc extraction is exploratory only.

---

## 4. Candidate-generation channels

A run may combine:

- structural fingerprints/hashes;
- local motif/component indexes;
- factorization signatures;
- already-qualified class labels from known instances;
- source/domain labels as optional recall boosters;
- learned approximate indexes;
- exhaustive enumeration within a declared finite candidate universe.

General cross-domain qualification retains at least one label-blind structural path or independently demonstrates hidden-label recall for the frozen target policy.

Shared class/source labels cannot be the only route by which a new cross-domain pair enters comparison.

---

## 5. Index/fingerprint declaration

Every index declares:

```text
index/model revision
target layer
view/relation target
N0/N1 policy
D/E policy
factorization/extraction depth/cost
included/excluded roles
boundary treatment
parameter treatment
namespace handling
collision behavior
known false-positive risk
known false-negative/pruning risk
training-data provenance if learned
supervision/objective if learned
known overlap with development/qualification corpora
```

A fingerprint match is retrieval evidence only.

A mismatch may safely prune/certify separation only if a necessary invariant has been independently qualified for the exact target relation/view/layer:

```text
A R B => f(A) = f(B)
```

Otherwise fingerprint misses limit coverage and cannot support negative claims.

Approximate learned scores/ranks remain non-semantic retrieval metadata.

---

## 6. Extraction records

Each extracted candidate records:

```text
source revision
extraction rule/revision
extraction kind
selected substructure/component
included relation signature
boundary/cut incidences
discarded residual/context
factorization dependencies
selection timing relative to unblinding
```

Extraction kinds include:

```text
induced substructure
boundary-cut component
relation-filtered projection
quotient/projection
other explicitly defined extraction
```

An induced extraction retains every included relation/constraint among retained objects under its frozen relation signature.

Dropping such a relation is projection loss, not harmless context.

---

## 7. Candidate-pair generation

Generate candidate pairs without expected class/mapping answers.

For every emitted pair record:

```text
retrieval channel(s)
index/score/signature causing candidacy
source/factorization/extraction revisions
labels visible to the channel
target policy
```

Do not deduplicate pairs whose materially distinct boundaries/factorizations/extractions could produce different structural results.

---

## 8. Pairwise handoff

Each pair is handed to `STRUCTURAL_COMPARISON_PROTOCOL_005.md` with a frozen comparison policy.

Retrieval score does not affect witness validity.

Low-score verified relation remains valid. High-score failed relation remains a retrieval false positive.

---

## 9. Coverage accounting

A corpus run records:

```text
eligible objects/components
extraction-universe completeness
objects/components indexed
factorization nodes eligible/considered
candidate pairs emitted
pairs structurally searched
pairs independently verified
resource/time limits
unindexed/unsearched regions
```

Do not claim no undiscovered relations remain unless the relevant candidate/extraction/factorization/mapping universe is actually covered or a separate completeness theorem/certificate applies.

---

## 10. Recall controls

Hide class/domain hints for known positives and measure whether structural retrieval surfaces them under the frozen policy.

Controls include:

- unrelated domain vocabulary;
- randomized source/class labels;
- independent label namespaces;
- local structural-ID randomization;
- serialization randomization;
- alternative factorization;
- partial/common-core cases;
- symmetry/automorphism cases;
- newly generated synthetic classes not used to design the index;
- structurally novel class shapes absent from the registry.

Recall is always policy-relative: target layer, view, D/E authority, extraction universe, factorization bounds, and relation kind are named.

---

## 11. Precision controls

Include retrieval-near but structurally invalid pairs:

- near-isomorphs;
- incompatible-boundary cases;
- same-label/different-structure cases;
- namespace collisions;
- policy-leak cases;
- vacuous-parameter temptations.

Measure candidate precision and verified precision separately.

A noisy index may be acceptable if recall/total cost are good and final verification stays exact.

---

## 12. Learned-index contamination audit

Hiding labels at inference does not erase label/class supervision learned during training.

For learned channels record:

```text
training corpus revisions
objective/supervision
label/class information used
known overlap with qualification corpus
model/index tuning history
```

Final generalization claims use sealed/fresh held-out or synthetic/adversarial cases not used for training/tuning.

---

## 13. Discovery result states

Keep distinct:

```text
VERIFIED_RELATION_FOUND
CANDIDATE_RETRIEVED_NO_VERIFIED_RELATION
PAIR_SEARCHED_NO_WITNESS
PAIR_CERTIFIED_NEGATIVE
PAIR_NOT_GENERATED
OBJECT_OR_COMPONENT_NOT_INDEXED
FACTORIZATION_NOT_AVAILABLE
UNKNOWN_RESOURCE_LIMIT
```

Only `PAIR_CERTIFIED_NEGATIVE` supports a negative relation claim under its exact frozen policy.

---

## 14. Generalization / holdout lifecycle

Policy-family qualification uses held-out/synthetic structures not used to design:

- schemas;
- extraction rules;
- fingerprints/indexes;
- thresholds;
- role mappings;
- benchmark-specific heuristics.

A repeatedly inspected holdout becomes development data and is replaced for final qualification.

---

## 15. Labels after verification

Verified class/domain labels may accelerate future retrieval and construction.

Source-supplied and inferred labels remain distinct provenance roles.

An inferred membership label carries schema revision, target layer/view, factorization/extraction revisions, witness, and qualification status.

The system retains a structural path by which an unlabeled new instance can still be proposed.

---

## 16. Class induction discovery

Known-class recognition and new-class induction are different tasks.

For a new class absent from the registry:

```text
verified pair/group common structure
-> candidate schema induction
-> freeze schema revision
-> held-out positive/negative validation
-> possible promotion
```

Do not snap novel structure to the nearest existing class merely because a label/index is available.

---

## 17. Corpus metrics

Record at minimum:

```text
known-positive recall
candidate precision
verified precision
candidate count
pairwise search count
verified result count
context/compute/index size
factorization/extraction coverage
label-blind versus label-assisted recall
false-negative causes
false-positive causes
unknown/unsearched region size where measurable
```

The target is high verified structural discovery yield under bounded lifecycle cost, not a particular candidate count.

---

## 18. Qualification question

> Under the frozen corpus/extraction/factorization/comparison policy, did the discovery system surface the relations it was responsible for finding, while keeping every omitted/unsearched region and every heuristic false-negative risk explicit?