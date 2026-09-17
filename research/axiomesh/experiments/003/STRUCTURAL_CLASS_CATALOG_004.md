# Experiment 003 — Structural Class Catalog 004

**Status:** candidate hypothesis catalog under Draft 0.12  
**Spec:** `../../CORE_SPEC_DRAFT_0_12_CANDIDATE.md`  
**Schema contract:** `STRUCTURAL_CLASS_SCHEMA_CONTRACT_004.md`  
**Discovery protocol:** `STRUCTURAL_DISCOVERY_PROTOCOL_004.md`  
**Comparison protocol:** `STRUCTURAL_COMPARISON_PROTOCOL_003.md`  
**Prior catalog:** `STRUCTURAL_CLASS_CATALOG_003.md` retained as historical candidate evidence

## Governing rule

Labels are retained because they help agents identify and construct recurring shapes, but they are assigned only after structural evidence.

```text
source semantics
-> qualified/versioned factorization(s)
-> frozen-policy label-blind discovery
-> pairwise comparison
-> independently verified witness
-> candidate class/schema recognition
-> retained label
```

No label in this catalog is presently a qualified reusable class revision.

Candidate labels may aid future retrieval after qualification. They are excluded from blind evidence used to establish their own class memberships.

## Candidate navigation labels

| Label | Current handle | Candidate construction |
|---|---:|---|
| C1 | `^9101` | universal evaluation over generated region |
| C2 | `^9102` | existential evaluation over generated region |
| C3 | `^9103` | immediate-successor evaluation |
| C4 | `^9104` | finite path / reflexive-transitive closure |
| C5 | `^9105` | predicate-selected induced restriction |
| C6 | `^9106` | disjoint decomposition / recomposition |
| C7 | `^9107` | transition-preservation judgment |
| C8 | `^9108` | finite locally validated dependency/derivation |
| C9 | `^9109` | finite indexed fold |
| C10 | `^9110` | capture-avoiding bound-body instantiation |
| C11 | `^9111` | functional-graph application |
| C12 | `^9112` | well-founded propagation |

These handles belong to the Experiment 003 registry namespace. Raw numeric equality outside that namespace has no semantic force.

The handles are navigation names, not proof that twelve independent classes exist.

---

# Family hypothesis F1 — Evaluation over a generated region

Current factorization hypothesis:

```text
origin
+ structured generator/relation
+ generated-region membership
+ body/property
+ evaluation mode/cardinality condition
+ satisfaction/evaluation contract
-> evaluation result
```

Candidate structured parameters/ports:

```text
origin
relation/generator substructure
body/property structure
satisfaction/evaluation relation/profile
evaluation mode/cardinality condition
boundary/port policy
quantified/visited domain constraints
```

The schema is non-vacuous only if it constrains the relationship among these parameters; simply passing an arbitrary region and result through a wrapper would not qualify.

## C1 — universal evaluation

Candidate instances/specializations:

- epistemic knowledge over an agent accessibility image;
- LTL `G` over a reflexive future region;
- CTL `AG` after branching/path generation is explicit;
- universal quantification with explicit domain/generator and binder ownership.

The generator and its constraints remain structured parameters. Mapping two generator relations into the same slot establishes parametric structural correspondence, not semantic identity of those relations.

## C2 — existential evaluation

Candidate instances:

- LTL `F`;
- CTL `EF` after branching reachability is explicit;
- existential quantification over an explicit domain;
- target-predicate reachability.

## C3 — immediate-successor evaluation

Candidate specialization where the generated region is the applicable immediate-successor image and its selection/cardinality semantics are explicit.

Nondeterministic next modalities may instead require C1/C2 over a successor set.

C1/C2/C3 remain candidate specializations of F1 until schema-level witnesses establish the factorization.

---

# C4 — finite path / reflexive-transitive closure

Candidate construction:

```text
one-step relation substructure
+ zero-path/base case
+ recursive path-step constructor
+ endpoint/adjacency invariants
-> finite path witness / reachable endpoint
```

Candidate structured slots:

```text
source endpoint
target endpoint
one-step relation substructure
path witness/inductive structure
step constraints
```

Candidate uses:

- common-knowledge reachability;
- one-step reduction closure;
- graph/state reachability;
- finite CTL reachability components.

Recursive/fixed-point authority must be explicit. The step relation remains a load-bearing structured parameter and is never erased merely because two domains both use paths.

---

# C5 — predicate-selected induced restriction

Candidate construction:

```text
source structure
+ selection predicate
+ carried/restricted relation set
-> induced/restricted result structure
```

Public announcement is a composition of C5 plus pre/post satisfaction; it is not exhausted by C5.

The extraction/restriction must declare whether it is induced. Dropped relations among retained objects are projection loss, not invisible residual.

---

# C6 — disjoint decomposition / recomposition

Candidate construction:

```text
whole resource
-> compatible/disjoint parts
-> recomposition = whole
-> subproperties hold on parts
```

Candidate structured slots:

```text
whole
part structures
compatibility/disjointness relation
recomposition relation
subproperty/satisfaction relation
```

Separating conjunction is a candidate instance when the full heap/resource semantics matches. Ordinary conjunction, mere co-presence, or arbitrary graph composition are negative controls.

---

# C7 — transition-preservation judgment

Candidate shape:

```text
precondition gate
+ transition relation
+ all relevant successors satisfy postcondition
```

Factorization hypothesis:

```text
precondition gate + F1/C1 over transition successors
```

C7 remains a useful label while this class-class factorization is tested. It cannot be promoted as independent without a verified schema witness identifying the residual not captured by F1/C1.

---

# C8 — finite locally validated dependency/derivation

Candidate construction:

```text
finite dependency structure
+ local validator/rule per node
+ child/premise relation
+ distinguished root/result
-> valid global derivation
```

Candidate instances include natural-deduction proof terms and possibly rewrite derivations only when a verified common schema preserves their differing order/local-validator constraints.

---

# C9 — finite indexed fold

Candidate construction:

```text
finite index structure
+ element/value relation
+ combiner structure
+ identity/base
+ ordering/algebraic constraints
-> result
```

XOR, OR, AND, addition, etc. remain different instances unless their combiner structures/laws are themselves related by a verified witness.

---

# C10 — bound-body instantiation

Candidate construction:

```text
binder/occurrence ownership
+ body
+ replacement argument
-> capture-avoiding transformed body
```

Factorization hypothesis: constrained structural rewrite over explicit binder/occurrence ownership.

`@@` is retained as a useful surface name, not a proven primitive or independent class.

---

# C11 — functional-graph application

Candidate construction:

```text
relation/function graph
+ input
+ functionality
+ optional totality/codomain constraints
-> selected output
```

Factorization hypothesis:

```text
relation-image selection + uniqueness + optional totality/codomain constraints
```

C11 remains distinct from C10 unless a selected calculus supplies and verifies a bridge.

---

# C12 — well-founded propagation

Candidate construction:

```text
carrier/domain
+ predecessor relation
+ well-foundedness authority
+ property/body
+ local all-predecessors-to-node rule
-> property over all carrier members
```

No reusable-class claim is allowed until the well-founded benchmark/profile is concretely decomposed.

---

# Candidate composite mappings

These are search hypotheses only:

```text
knowledge
  accessibility relation + F1/C1

common knowledge
  group/union accessibility + C4 + F1/C1

LTL G
  linear future generator + F1/C1

LTL F
  linear future generator + F1/C2

LTL X
  immediate-successor generator + F1/C3

public announcement
  satisfaction + C5 + post-update satisfaction

separating conjunction
  resource leaves + C6 + recursive satisfaction

Hoare partial correctness
  transition semantics + precondition gate + candidate C7/F1-C1 factorization

reduction closure
  one-step reduction + C4
```

Each mapping must be rediscovered under the blind protocol and independently verified before registry promotion.

---

# Discovery and evidence requirements

A reusable class promotion requires:

- a versioned native schema satisfying `STRUCTURAL_CLASS_SCHEMA_CONTRACT_004.md`;
- qualified decomposition dependencies with decomposition coverage reported;
- non-vacuity/selectivity evidence based on reusable constraints, not parameter size;
- at least two independent verified instances or an independently specified schema tested on held-out instances;
- label-blind structural retrieval of hidden-label positives;
- a structurally novel-class control absent from the current registry;
- namespace-collision, near-isomorphic, boundary, parameter-abuse, policy-leak, alternative-factorization, automorphism, and search-negative controls;
- independently verified membership witnesses;
- class-class witnesses for factorization/hierarchy claims;
- no circular use of target membership to produce its own decomposition;
- no simpler qualified factorization explaining the same structure without loss.

## Multiple memberships

One object may have several verified memberships under different views/factorizations. Preserve them with their separate witnesses rather than forcing one canonical class.

## Inferred labels

An inferred membership label is derived knowledge. It records schema revision, target layer/view, factorization set, witness, and qualification status. It is distinct from source-supplied domain vocabulary.

## Catalog status

Until these requirements pass, this file remains a hypothesis catalog rather than an ontology.
