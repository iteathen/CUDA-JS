# Experiment 003 — Structural Discovery Protocol 006

**Status:** frozen candidate corpus-discovery protocol for Draft 0.14 qualification  
**Spec base:** `../../CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`  
**Qualification amendment:** `../../CORE_SPEC_DRAFT_0_14_CANDIDATE.md`  
**Pairwise protocol:** `STRUCTURAL_COMPARISON_PROTOCOL_006.md`  
**Supersedes for new qualification:** `STRUCTURAL_DISCOVERY_PROTOCOL_005.md`

## Purpose

Qualify the step before pairwise comparison: which independently represented objects/components are proposed for structural comparison at all.

A perfect pairwise verifier cannot recover a true relation that retrieval/indexing/extraction never proposes.

For AxiomeSH representation qualification, at least one candidate-generation path MUST derive candidacy from native structural evidence without requiring source/class labels as semantic authority.

---

## 1. Freeze corpus, source interpretations, extraction universe, and policy family

Before expected cross-domain matches are unblinded, freeze:

```text
corpus revision + immutable content binding
source interpretation/fidelity alternative set per source
eligible object/component extraction universe
substructure extraction rules + immutable revisions
factorization/index depth/cost bounds
label visibility policy
structural fingerprint/index definitions + immutable revisions
candidate-generation thresholds
pairwise comparison policy family + immutable revision
resource budget
```

If a source has unresolved interpretations, keep them separate and report discovery results conditional on the interpretation/fidelity alternative used.

The extraction universe states whether enumeration is exhaustive, bounded-depth, bounded-cost, sampled, heuristic, or explicitly selected.

Coverage claims are scoped to that universe and interpretation set.

---

## 2. Evidence isolation is operational

Partition resources:

```text
DISCOVERY_VISIBLE
ARCHIVAL_ONLY
REVIEWER_SCORER_ONLY
```

Use a fresh isolated context/tool boundary so excluded material is actually unavailable during candidate generation and pairwise discovery.

Record the exact accessible resource set for each stage.

`ARCHIVAL_ONLY` may contain lossless source backups, historical encodings, human stewardship gloss, and provenance.

`REVIEWER_SCORER_ONLY` may contain expected mappings/classes/answers.

Neither is blind-discovery evidence.

A resource is not safely excluded merely because instructions say not to use it if the same context has already observed its contents.

---

## 3. Native discovery records are authoritative

The load-bearing discovery policy and result records MUST be representable as ordinary native AxiomeSH structure or qualified native dependencies.

At minimum native records exist for:

```text
corpus/policy revision and immutable content binding
source interpretation alternatives
extraction/factorization edges
index declarations
candidate-generation result records
coverage records
pairwise handoff records
final discovery-state records
```

Markdown/JSON reports may mirror these records but do not supply missing semantics.

---

## 4. Independent source-side decomposition/extraction

Before objects are paired:

1. derive/freeze each source interpretation/fidelity alternative independently;
2. derive/freeze each source's allowed factorization set independently;
3. derive/freeze source-side components/extractions under generic frozen extraction rules;
4. record ports/boundary cuts/residual/excluded/projection context;
5. record D/E dependencies and source-local roles;
6. only then expose candidates to cross-source pair generation.

Pair-conditioned post-hoc interpretation choice, extraction, or factorization is exploratory only.

---

## 5. Mandatory structural-only candidate-generation path

Representation qualification MUST include at least one candidate-generation channel whose accessible semantic inputs are limited to:

- discovery-visible native AxiomeSH structure;
- qualified N0/N1 normalization;
- frozen allowed structural D factorizations/extractions;
- qualified structural indexes/fingerprints;
- resource/search policy.

The structural-only channel MUST NOT require:

- source/domain names;
- human gloss;
- the unknown instance's class label;
- registry source-to-class mappings;
- expected analogy text;
- scorer answers.

Additional channels MAY use:

- already-qualified class labels from known instances;
- source/domain labels as recall boosters;
- learned semantic retrieval;
- approximate embeddings.

Those channels are acceleration/operational comparisons and are measured separately from structural-only discovery.

A learned model participates in the structural-only channel only when its inputs are native structural evidence and training contamination is controlled by sealed novel/synthetic qualification cases.

---

## 6. Index/fingerprint declaration

Every index declares natively/reconstructably:

```text
index/model immutable revision
content/integrity binding
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

## 7. Extraction records

Each extracted candidate records:

```text
source immutable revision
source interpretation/fidelity alternative
extraction rule immutable revision
extraction kind
selected substructure/component
included relation signature
boundary/cut incidences
discarded residual/context
excluded-by-view structure
projection/quotient loss
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

## 8. Candidate-pair generation

Generate candidate pairs without expected class/mapping answers.

For every emitted pair record:

```text
retrieval channel(s)
structural-only versus assisted channel
index/score/signature causing candidacy
source/factorization/extraction immutable revisions
source interpretation alternatives used
labels visible to that channel
target policy revision
```

Do not deduplicate pairs whose materially distinct boundaries/factorizations/extractions/interpretations could produce different structural results.

---

## 9. Pairwise handoff

Each candidate pair is handed to `STRUCTURAL_COMPARISON_PROTOCOL_006.md` with a frozen native comparison policy.

Retrieval score does not affect witness validity.

Low-score verified relation remains valid. High-score failed relation remains a retrieval false positive.

---

## 10. Coverage accounting

A corpus run records natively/reconstructably:

```text
eligible objects/components/interpretations
extraction-universe completeness
objects/components indexed
factorization nodes eligible/considered
structural-only candidate pairs emitted
assisted candidate pairs emitted
pairs structurally searched
pairs independently verified
resource/time limits
unindexed/unsearched regions
```

Do not claim no undiscovered relations remain unless the relevant candidate/extraction/factorization/mapping universe is actually covered or a separate completeness theorem/certificate applies.

---

## 11. Recall controls

Hide class/domain hints for known positives and measure whether the **structural-only** retrieval path surfaces them under the frozen policy.

Controls include:

- unrelated domain vocabulary;
- randomized source/class labels;
- independent label namespaces;
- local structural-ID randomization;
- serialization randomization;
- alternative factorization;
- partial/common-core cases;
- symmetry/automorphism cases;
- unresolved source-interpretation alternatives;
- newly generated synthetic classes not used to design the index;
- structurally novel class shapes absent from the registry.

Recall is policy-relative: target layer, view, D/E authority, extraction universe, factorization bounds, interpretation set, and relation kind are named.

---

## 12. Precision controls

Include retrieval-near but structurally invalid pairs:

- near-isomorphs;
- incompatible-boundary cases;
- same-label/different-structure cases;
- namespace collisions;
- policy-leak cases;
- vacuous-parameter temptations;
- interpretation-choice traps.

Measure candidate precision and verified precision separately.

A noisy retrieval index may be acceptable if recall/total cost are good and final verification stays exact.

---

## 13. Learned-index contamination audit

Hiding labels at inference does not erase label/class supervision learned during training.

For learned channels record:

```text
training corpus immutable revisions
objective/supervision
label/class information used
known overlap with qualification corpus
model/index tuning history
```

Final representation claims use sealed/fresh held-out or synthetic/adversarial cases not used for training/tuning.

Learned label-assisted recall can demonstrate operational utility but cannot replace the mandatory structural-only path for the AxiomeSH representation hypothesis.

---

## 14. Discovery result states

Keep distinct:

```text
VERIFIED_RELATION_FOUND
CANDIDATE_RETRIEVED_NO_VERIFIED_RELATION
PAIR_SEARCHED_NO_WITNESS
PAIR_CERTIFIED_NEGATIVE
PAIR_NOT_GENERATED
OBJECT_OR_COMPONENT_NOT_INDEXED
FACTORIZATION_NOT_AVAILABLE
SOURCE_INTERPRETATION_UNRESOLVED
UNKNOWN_RESOURCE_LIMIT
```

Only `PAIR_CERTIFIED_NEGATIVE` supports a negative relation claim under its exact frozen policy and interpretation set.

---

## 15. Generalization / holdout lifecycle

Policy-family qualification uses held-out/synthetic structures not used to design:

- schemas;
- extraction rules;
- fingerprints/indexes;
- thresholds;
- role mappings;
- benchmark-specific heuristics.

A repeatedly inspected holdout becomes development data and is replaced for final qualification.

---

## 16. Labels after verification

Verified labels may accelerate future retrieval and construction.

Every label attachment retains a native provenance role, distinguishing at least:

```text
source-supplied label
inferred structural-class label
retrieval alias
human gloss
```

An inferred membership label carries immutable schema revision, target layer/view, factorization/extraction revisions, witness, and qualification status.

The system retains a structural-only path by which an unlabeled new instance can still be proposed.

---

## 17. Class induction discovery

Known-class recognition and new-class induction are different tasks.

For a new class absent from the registry:

```text
verified pair/group common structure
-> candidate schema induction
-> freeze immutable schema revision
-> held-out positive/negative validation
-> possible promotion
```

Do not snap novel structure to the nearest existing class merely because a label/index is available.

---

## 18. Corpus metrics

Record at minimum:

```text
structural-only known-positive recall
assisted known-positive recall
candidate precision
verified precision
candidate count
pairwise search count
verified result count
context/compute/index size
factorization/extraction coverage
false-negative causes
false-positive causes
unknown/unsearched region size where measurable
```

The target is high verified structural discovery yield under bounded lifecycle cost, not a particular candidate count.

---

## 19. Qualification question

> Under the frozen corpus/interpretation/extraction/factorization/comparison policy, did native structural evidence itself surface the relations the representation was responsible for finding, while keeping every omitted/unsearched region, assisted retrieval advantage, and heuristic false-negative risk explicit?
