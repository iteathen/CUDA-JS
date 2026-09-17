# Experiment 003 — Structural Class Catalog 004

**Status:** candidate hypothesis catalog under Draft 0.10  
**Spec:** `../../CORE_SPEC_DRAFT_0_10_CANDIDATE.md`  
**Schema contract:** `STRUCTURAL_CLASS_SCHEMA_CONTRACT_004.md`  
**Comparison protocol:** `STRUCTURAL_COMPARISON_PROTOCOL_003.md`  
**Prior catalog:** `STRUCTURAL_CLASS_CATALOG_003.md` retained as historical candidate evidence

## Governing rule

Labels are retained because they help agents identify and construct recurring shapes.

They are assigned only after structural evidence.

```text
source semantics
-> qualified factorization(s)
-> frozen-policy label-blind comparison
-> verified witness
-> candidate class/schema recognition
-> retained label
```

No label in this catalog is presently a qualified reusable class revision.

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

The handles are theory-local candidate labels. Raw numeric equality outside this registry namespace has no semantic force.

## Family hypothesis F1 — evaluation over a generated region

Current strongest factorization hypothesis:

```text
origin
+ generator/relation
+ generated region membership
+ body/property
+ evaluation mode/cardinality condition
+ satisfaction/evaluation contract
-> evaluation result
```

Candidate structured slots:

```text
origin
relation/generator substructure
body/property structure
satisfaction/evaluation relation/profile
mode/cardinality condition
boundary/port policy
```

C1, C2, and C3 are candidate specializations of this family rather than presumed independent classes.

### C1 — universal evaluation

Candidate specializations/instances:

- epistemic knowledge over one agent accessibility image;
- LTL `G` over a reflexive future region;
- CTL `AG` only after branching/path generation is explicit;
- universal quantification only with explicit quantified domain/generator.

The generator and its constraints remain structured parameters; they are not erased.

### C2 — existential evaluation

Candidate instances:

- LTL `F`;
- CTL `EF` after branching reachability is explicit;
- existential quantification over an explicit domain;
- target-predicate reachability.

### C3 — immediate-successor evaluation

Candidate specialization where the generated region is the applicable immediate-successor image and the cardinality/selection contract defines the intended next-state semantics.

Nondeterministic next modalities may instead use C1/C2 over successor regions.

## C4 — finite path / closure

Candidate schema:

```text
one-step relation substructure
+ zero-path/base case
+ recursive path-step constructor
+ endpoint/adjacency invariants
-> finite path witness / reachable endpoint
```

Candidate uses:

- common-knowledge reachability;
- one-step reduction closure;
- graph/state reachability;
- finite CTL reachability components.

Recursive/fixed-point authority must satisfy Draft 0.10 Section 6.

## C5 — predicate-selected restriction

Candidate schema:

```text
source structure
+ selection predicate
+ carried/restricted relation set
-> induced/restricted result structure
```

Public announcement is a composition of restriction plus pre/post satisfaction; it is not exhausted by C5.

## C6 — disjoint decomposition / recomposition

Candidate schema:

```text
whole resource
-> compatible/disjoint parts
-> recomposition = whole
-> subproperties on parts
```

Separating conjunction is a candidate instance when heap/resource partition semantics satisfy the full contract. Ordinary conjunction/co-presence is a negative control.

## C7 — transition-preservation judgment

Candidate shape:

```text
precondition gate
+ transition relation
+ all relevant successor states satisfy postcondition
```

Factorization hypothesis:

```text
precondition gate + F1/C1 over transition successors
```

C7 is retained as a useful label while this factorization is tested. Do not promote as independent without a class-class witness showing an irreducible residual.

## C8 — finite locally validated dependency/derivation

Candidate schema:

```text
finite dependency structure
+ local validator/rule per node
+ child/premise relation
+ distinguished root/result
-> valid global derivation
```

Candidate instances include natural-deduction proof terms and possibly rewrite derivations only when the same dependency/local-validity contract is witnessed.

## C9 — finite indexed fold

Candidate schema:

```text
finite index structure
+ element/value relation
+ combiner structure
+ identity/base
+ order/algebraic constraints
-> result
```

XOR, OR, AND, addition, etc. remain different parameterized instances unless their combiner contracts are themselves related by a verified class/E witness.

## C10 — bound-body instantiation

Candidate shape:

```text
binder/occurrence ownership
+ body
+ replacement argument
-> capture-avoiding transformed body
```

Factorization hypothesis: constrained structural rewrite over explicit binder/occurrence structure.

`@@` is retained as a useful surface label, not a proven primitive or independent class.

## C11 — functional-graph application

Candidate shape:

```text
relation/function graph
+ input
+ functionality
+ optional totality/codomain constraints
-> selected output
```

Factorization hypothesis:

```text
relation-image selection + uniqueness + optional totality/codomain
```

C11 remains separate from C10 unless a specific calculus supplies and verifies a bridge.

## C12 — well-founded propagation

Candidate shape:

```text
carrier/domain
+ predecessor relation
+ well-foundedness authority
+ property/body
+ local all-predecessors-to-node rule
-> property over all carrier members
```

No reusable-class claim is allowed until the well-founded benchmark/profile is concretely decomposed.

## Candidate composite mappings

These are search hypotheses only, not qualification evidence:

```text
knowledge
  accessibility relation + F1/C1

common knowledge
  group/union relation + C4 + F1/C1

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

Each mapping must be rediscovered under the blind protocol and verified independently before registry promotion.

## Promotion and versioning

A class is qualified only as an immutable schema revision satisfying `STRUCTURAL_CLASS_SCHEMA_CONTRACT_004.md`.

Candidate handles C1–C12 may remain stable navigation labels, but each qualified result must name the exact schema revision.

Changing parameters, ports, constraints, factorization, or residual policy creates a new revision.

## Evidence requirements

A reusable class promotion requires:

- exact native schema construction;
- explicit structured parameters/ports/constraints;
- qualified decomposition dependencies;
- verified instance witnesses;
- label-blind controls;
- namespace-collision controls;
- near-isomorphic and boundary negatives;
- alternative-factorization audit;
- circular-evidence audit;
- at least two independent instances or an independently specified schema tested on held-out instances;
- no simpler qualified factorization explaining the same structure.

Until then this file is a hypothesis catalog, not an ontology.
