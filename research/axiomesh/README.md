# AxiomeSH

**Status:** research incubation  
**Research direction:** Josh Oshiro  
**Current substrate hypothesis:** agent-native scoped relational/hypergraph structure plus lawful transformation  
**Current experimental branch:** `experiment/axiomesh-native-reconstruction`

AxiomeSH is an experimental structural knowledge representation for neural reasoning agents.

Its central question is:

> Can an agent reason, synthesize, and continue work more effectively when external knowledge is represented close to the relational structure it must manipulate rather than primarily in forms optimized for human communication?

AxiomeSH is not intended to be a numbered copy of existing formal notation. Its primary opportunity is to expose invariant structural shape across domains so agents can discover exact, partial, parametric, or behavioral correspondences hidden by names and conventional notation.

The leading hypothesis remains:

\[
\boxed{\text{knowledge}=\text{relational structure}+\text{lawful structural transformation}}
\]

The graph/hypergraph-rewrite substrate remains a **research hypothesis**, not a settled commitment.

## Current specification lineage

The drafts are cumulative experimental amendments, not final language releases.

- `CORE_SPEC_DRAFT_0_1.md` — original minimal scoped-hypergraph/rewrite candidate.
- `CORE_SPEC_DRAFT_0_2_CANDIDATE.md` — literals, stable labels, declarative formula surfaces.
- `CORE_SPEC_DRAFT_0_3_CANDIDATE.md` — lexical scope/signature inventory.
- `CORE_SPEC_DRAFT_0_4_CANDIDATE.md` — qualification/presentation/signature tightening.
- `CORE_SPEC_DRAFT_0_5_CANDIDATE.md` — bound-body surface and proof-profile separation.
- `CORE_SPEC_DRAFT_0_6_CANDIDATE.md` — candidate structural-instantiation surface.
- `CORE_SPEC_DRAFT_0_7_CANDIDATE.md` — primitive semantic decomposition requirement.
- `CORE_SPEC_DRAFT_0_8_CANDIDATE.md` — retained labels and structural-class layer.
- `CORE_SPEC_DRAFT_0_9_CANDIDATE.md` — plural factorizations, witnessed comparisons, ports/residuals, label-blind qualification.
- `CORE_SPEC_DRAFT_0_10_CANDIDATE.md` — frozen comparison policy, namespaced stable symbols, exact-D round trips, versioned schemas, independent witness verification, honest negative/search states.
- `CORE_SPEC_DRAFT_0_11_CANDIDATE.md` — candidate retrieval/discovery coverage, non-vacuous classes, semantic-versus-archival round trips, held-out discovery generalization.
- `CORE_SPEC_DRAFT_0_12_CANDIDATE.md` — structural identity namespaces, reference-sharing/variable-ownership discipline, safe invariant indexing, complete core/residual accounting, search-engine and information-isolation requirements.
- `DESIGN_NOTES.md` — research rationale, constraints, hypotheses, and falsifiers.

Historical drafts remain frozen evidence for the experiments that used them. Later drafts supersede conflicting interpretation without rewriting old inputs.

## Objective

AxiomeSH aims to maximize:

> **durable, correct agent synthesis per total lifecycle resource cost**

subject to preservation of:

- semantic fidelity;
- structural soundness;
- canonical integrity;
- load-bearing distinctions;
- provenance when required;
- recoverability;
- composition boundaries;
- falsifiable structural correspondences.

Character/token count is a cost, not the objective.

## Native path

```text
raw AxiomeSH -> agent -> raw AxiomeSH
```

No mandatory English parser, theorem-language translation, JSON envelope, database adapter, or model-specific semantic layer belongs inside the native correctness path.

## Constitutional discovery pipeline

Current discipline is:

```text
source semantics
-> qualified/versioned factorization set
-> qualified substructure candidates
-> structural indexing/retrieval
-> N0/N1 representation normalization
-> frozen comparison policy
-> label-blind structural search
-> candidate witness/certificate
-> independent verification
-> exact/common-core/residual result
-> versioned structural-class recognition
-> retained useful labels
-> optional compact surface
```

Labels are retained because they improve retrieval, construction, and reuse.

They may accelerate a known structural pattern but may not choose the decomposition, parameterization, comparison policy, candidate extraction, or class result that they later name.

## Finding the pair is part of correctness

A perfect pairwise isomorphism checker is insufficient if candidate retrieval never places true cross-domain correspondences in front of it.

AxiomeSH therefore distinguishes:

```text
candidate discovery
pairwise structural search
witness verification
```

Structural fingerprints, learned indexes, class labels, and source labels may all assist retrieval. They are not correspondence evidence.

At least one qualified path must allow a structurally novel unlabeled instance to become a candidate without already carrying the class label being discovered.

Corpus-scale runs report coverage, recall controls, unsearched regions, resource limits, and whether a pair was never generated versus actually compared.

## Why this matters

The system must avoid both:

- **false negatives:** related structures fail to meet because labels, namespaces, serialization, factorization, extraction, or retrieval differ;
- **false positives:** distinct structures collapse because constraints, boundaries, multiplicity, domains, residuals, search limits, or parameter choices are erased.

For partial correspondence prefer:

\[
A=C+\Delta_A
\]

\[
B=C+\Delta_B
\]

with every common/residual/boundary/excluded structural item accounted for.

## Identity is scoped

Bare structural identities and stable semantic labels are not globally identified by numeric spelling alone.

Current discipline distinguishes:

```text
bare structural identity + structural namespace
stable semantic symbol + theory/signature namespace
exact literal value
```

Intentional sharing across documents requires explicit shared namespace/import/port/bundle evidence.

Reference expansion preserves the structural identity sharing of the referred term; a reference token itself is not semantic identity.

Variables likewise have reconstructable owners: rewrite-pattern owner, lexical binder owner, or schema/pattern owner.

## Factorization is plural by default

AxiomeSH does not assume one privileged primitive-normal decomposition.

For qualified factorizations:

- preserve materially distinct alternatives;
- record exact versus lossy transformation kind;
- exact semantic D factorizations must round-trip from the decomposed construction rather than an opaque source backup;
- report semantic-decomposition coverage separately from archival recoverability;
- represent recursive definitions with explicit base/step/fixed-point authority;
- report factorization-set completeness and dependence;
- declare one canonical factorization only after suitable uniqueness/confluence evidence.

## Comparison axes are separate

A comparison separately declares:

```text
view policy V
transformation authority N0/N1/D/E
relation kind R
```

Views include closed, boundary-preserving, signature-mappable, and schema-parameterized comparison.

Relation kinds include isomorphism, strong/weak embedding, specialization, homomorphism, simulation/bisimulation, quotient/projection, common core, certified negative, no-witness, unknown, and resource-limit outcomes.

A result name never changes the comparison rules after the fact.

## Comparison policy is frozen before scoring

For qualification, target layer, included relation signature, role/mappability rules, parameter slots, D/E authority, extraction rules, factorization bounds, and optimization criteria are frozen before expected mappings/results are unblinded.

Otherwise the test can manufacture an analogy by deciding afterward which differences do not count.

## Normalization is narrow

```text
N0  serialization-only normalization
N1  alpha/representation normalization
D   qualified definitional factorization/expansion
E   profile/theorem semantic equivalence
```

Only N0/N1 are ordinary pre-comparison normalization.

A theorem equivalence, substitution/beta step, class expansion, algebraic law, quotient, or lossy extraction must not be hidden under “canonicalization.”

## Structural classes are versioned, non-vacuous schemas

A class is a reusable schema graph, not an ontology bucket.

A qualified revision includes:

- native schema graph;
- structured parameter slots, including relation/substructure-valued slots;
- ports/boundaries;
- rigid/mappable roles;
- invariants/constraints;
- admissible views/mappings;
- versioned dependencies;
- specialization/composition/gluing rules;
- residual policy;
- alternative factorizations;
- non-vacuity/selectivity evidence;
- discovery/index contract where applicable;
- qualification evidence.

Large parameters are allowed. A class is vacuous only when it contributes no nontrivial reusable structural constraint beyond passing an arbitrary instance through.

Changing a qualified schema creates a new revision. Multiple verified memberships for one object may coexist; AxiomeSH does not force one canonical class.

## Discovery and verification are separate

A search agent may propose a mapping, common core, class membership, or negative certificate.

A fresh verifier independently checks it against frozen objects/policies without access to the expected class/domain answer.

Likewise:

```text
NO_WITNESS_FOUND != CERTIFIED_NON_ISOMORPHIC
```

Certified negatives require complete search for the declared finite problem or a verified separating invariant/certificate.

Search engines and indexes declare soundness/completeness/heuristic behavior and resource bounds.

## Structural indexes are only retrieval machinery

A fingerprint mismatch safely prunes a relation only when the fingerprint is a verified invariant for the exact target view/layer:

```text
A R B => f(A)=f(B)
```

Equal hashes/fingerprints are never themselves a correspondence witness.

Approximate embeddings/similarity scores remain non-semantic retrieval metadata.

## Target layer is explicit

A comparison may concern:

```text
native representation graph
construction/schema graph
generated finite structure
profile denotation/behavior
proof/derivation behavior
```

A schema isomorphism does not automatically imply source-theory semantic equivalence.

Mapping opaque primitive/model leaves into common parameter slots establishes a **parametric structural correspondence** unless additional semantic/profile evidence proves more.

## Minimal-core bias remains active

Useful syntax can survive without becoming irreducible core semantics.

Post-0.1 surfaces still under primitive-status audit include:

```text
#n
^n
=>
==
~
{...}
*?n / +?n
\?n
@@
```

The distinction remains:

```text
required semantic distinction
!= useful compact surface
!= proven irreducible primitive
```

## Context-overload corrections

For new current-semantics artifacts:

- raw `[]` is scope/boundary, not implicit conjunction;
- fresh allocation is explicit rather than inferred only from `+?n` on a rewrite RHS;
- `~` is a declarative negation surface, not globally classical negation;
- quantifiers expose or inherit a native domain/generator;
- `@@` remains a surface pending rewrite-level decomposition;
- `!X` is structural absence, not semantic falsity without a completeness/closed-world contract;
- behavior-changing carrier roles must be native/recoverable.

Frozen historical artifacts retain their historical decode rules. Current structural qualification requires rerendering or an exact verified legacy-to-current bridge.

## Composition is central

Internal similarity is insufficient if components cannot compose under real interfaces/constraints.

Class/component comparison preserves ports and requires gluing/joint-realizability evidence.

Common scope/shared identity alone is not a proof of compatibility.

## Qualification posture

Structural qualification includes controls for:

- cross-domain positives;
- alpha/serialization changes;
- near-isomorphic negatives;
- same-interior/different-boundary negatives;
- partial common-core/residual cases;
- alternative factorizations;
- misleading labels;
- multiple mappings/automorphisms;
- semantic/structural namespace collisions;
- policy leakage and post-hoc parameters;
- homomorphism/quotient traps;
- induced versus projected substructure extraction;
- certified-negative versus resource-limited no-witness;
- label-blind retrieval recall;
- novel classes absent from the registry;
- legacy/current bridges;
- fresh-context information isolation.

Unknown is preferable to unsupported equivalence or unsupported negative.

## Target agent

AxiomeSH is not defined around one vendor, tokenizer, or model generation.

The target is:

> bounded-context reasoning agents capable of learning compact structural representation, maintaining references, retrieving external knowledge, and synthesizing relations across independently developed domains.

## Ownership boundary

This research currently lives in CUDA-JS as an incubation host.

AxiomeSH is not a CUDA-JS runtime responsibility. If it becomes independently load-bearing, it should move to a dedicated repository/package with its own authority/contracts.

## Current operating principle

> **Decompose without target-class bias. Find candidates structurally. Freeze the rules. Let structure determine the mapping. Verify independently. Keep every residual. Name the result afterward.**
