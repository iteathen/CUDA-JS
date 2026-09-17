# AxiomeSH

**Status:** research incubation  
**Research direction:** Josh Oshiro  
**Current substrate hypothesis:** agent-native scoped relational/hypergraph structure plus lawful transformation  
**Current experimental branch:** `experiment/axiomesh-native-reconstruction`

AxiomeSH is an experimental structural knowledge representation for neural reasoning agents.

Its central question is:

> Can an agent reason, synthesize, and continue work more effectively when external knowledge is represented close to the relational structure it must manipulate rather than primarily in forms optimized for human communication?

AxiomeSH is not initially a shorter notation for existing logic. It is an attempt to discover a more direct structural substrate for agent reasoning and cross-domain structural synthesis.

The leading hypothesis remains:

\[
\boxed{\text{knowledge}=\text{relational structure}+\text{lawful structural transformation}}
\]

The graph/hypergraph-rewrite direction remains a **research hypothesis, not a settled commitment**.

## Current specification lineage

The drafts are cumulative experimental amendments, not individually final language releases.

- [`CORE_SPEC_DRAFT_0_1.md`](./CORE_SPEC_DRAFT_0_1.md) — original minimal scoped-hypergraph/rewrite candidate.
- [`CORE_SPEC_DRAFT_0_2_CANDIDATE.md`](./CORE_SPEC_DRAFT_0_2_CANDIDATE.md) — exact literals, stable semantic labels, declarative formula surfaces.
- [`CORE_SPEC_DRAFT_0_3_CANDIDATE.md`](./CORE_SPEC_DRAFT_0_3_CANDIDATE.md) — lexical binding clarification and native signature inventory.
- [`CORE_SPEC_DRAFT_0_4_CANDIDATE.md`](./CORE_SPEC_DRAFT_0_4_CANDIDATE.md) — qualification/presentation/signature tightening.
- [`CORE_SPEC_DRAFT_0_5_CANDIDATE.md`](./CORE_SPEC_DRAFT_0_5_CANDIDATE.md) — first-class bound-body surface and proof-profile separation.
- [`CORE_SPEC_DRAFT_0_6_CANDIDATE.md`](./CORE_SPEC_DRAFT_0_6_CANDIDATE.md) — candidate capture-avoiding structural-instantiation surface.
- [`CORE_SPEC_DRAFT_0_7_CANDIDATE.md`](./CORE_SPEC_DRAFT_0_7_CANDIDATE.md) — primitive semantic decomposition requirement.
- [`CORE_SPEC_DRAFT_0_8_CANDIDATE.md`](./CORE_SPEC_DRAFT_0_8_CANDIDATE.md) — retained labels and structural-class layer.
- [`CORE_SPEC_DRAFT_0_9_CANDIDATE.md`](./CORE_SPEC_DRAFT_0_9_CANDIDATE.md) — isomorphism-safe factorization, explicit comparison projections, witnesses, boundaries, residuals, and label-blind qualification.
- [`DESIGN_NOTES.md`](./DESIGN_NOTES.md) — research rationale, constraints, hypotheses, and falsifiers.

Historical drafts remain frozen evidence for the experiments that qualified them. Later drafts supersede conflicting interpretation without rewriting old inputs.

## Objective

AxiomeSH aims to maximize:

> **durable, correct agent synthesis per total lifecycle resource cost**

under non-negotiable preservation of:

- semantic fidelity;
- structural soundness;
- canonical integrity;
- load-bearing distinctions;
- required provenance;
- recoverability;
- composition boundaries;
- falsifiable structural correspondences.

Character/token count is a cost, not the objective.

## Raw core first

The native research path remains:

```text
raw AxiomeSH -> agent -> raw AxiomeSH
```

No mandatory English parser, theorem-language translation, JSON envelope, database adapter, or model-specific semantic layer belongs inside the native correctness path.

Later renderers/adapters may project from the same structure, but they must not become peer semantic authorities.

## Discover structure before naming it

The current governing construction order is:

```text
source semantics
-> one or more qualified native decompositions/factorizations
-> representation-only normalization
-> label-independent structural comparison
-> explicit mapping/common-core/residual witness
-> structural-class recognition
-> retained useful domain/class labels
-> optional compact surface syntax
```

Labels are intentionally retained because they help retrieval, construction, and reuse.

They are downstream of the structural evidence. A label may not choose the decomposition or prove the isomorphism/class it names.

## Why this matters for isomorphism

AxiomeSH's central opportunity is to reveal the same relational shape when different fields use different names, notation, or conceptual packaging.

The system therefore must avoid both:

- **false negatives:** equivalent/related structures fail to match because labels, IDs, or factorization choices differ;
- **false positives:** semantically different structures are collapsed because constraints, boundaries, multiplicity, or residuals were erased.

A structural comparison must state its projection and return a witness.

When only part of two objects corresponds, prefer:

\[
A = C + \Delta_A
\]

\[
B = C + \Delta_B
\]

with explicit residuals rather than forcing a larger false equivalence.

## Multiple factorizations are allowed

AxiomeSH does not assume every object has one privileged “primitive-normal form.”

When several decompositions are faithful:

- preserve them as separate factorization nodes;
- record qualified transformations/equivalences between them;
- compare across materially distinct factorizations;
- report factorization dependence rather than choosing whichever form produces the expected analogy.

A unique canonical decomposition must earn that status through evidence such as confluence/uniqueness under the declared decomposition system.

## Normalization is deliberately narrow

Draft 0.9 separates:

```text
N0  serialization normalization
N1  alpha/boundary structural normalization
D   qualified definitional decomposition/expansion
E   profile/theorem semantic equivalence
```

Only N0/N1 are ordinary pre-comparison canonicalization.

A theorem equivalence, beta/substitution step, algebraic law, or class expansion must not be smuggled into “canonicalization.”

## Structural classes are schemas, not ontology buckets

A candidate structural class is a reusable schema graph with:

- parameters;
- boundary/interface ports;
- invariants/constraints;
- rigid versus mappable roles;
- admissible mappings;
- decomposition dependencies;
- residual/specialization semantics;
- composition/gluing rules.

Class membership requires an explicit schema-to-instance witness.

The current Experiment 003 catalog deliberately remains a hypothesis lattice. Similar candidate classes may later factor into broader families or compositions.

## Minimal core bias remains active

The project still prefers fewer primitives than feels comfortable.

Useful syntax can survive as a canonical surface without becoming irreducible core semantics.

Current post-0.1 surfaces under primitive-status audit include:

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

The distinction is:

```text
required semantic distinction
!= useful compact surface
!= proven irreducible primitive
```

## Known context-overload corrections

For new Draft 0.9 canonical material:

- raw `[]` is a structural scope/boundary; conjunction/co-satisfaction must be explicitly constructed/typed rather than depend on hidden “formula context”;
- fresh allocation must not rely only on `+?n` appearing on a rewrite RHS; freshness requires an explicit operational construction/role;
- `~` is a declarative negation surface, not globally classical negation;
- `@@` remains a useful instantiation surface but is not yet proven irreducible core.

Frozen historical experiment artifacts retain their historical decode rules.

## Composition is central

Structural similarity is insufficient if the parts cannot compose under their real interfaces and constraints.

Class/component comparison therefore preserves boundary ports and requires gluing/joint-realizability evidence where composition matters.

Common scope/shared identity can implement part of a composition, but does not prove compatibility by itself.

## Qualification

AxiomeSH qualification includes:

- cold exact reconstruction;
- isomorphism recognition under unrelated names/IDs;
- near-isomorphic negative discrimination;
- boundary-negative discrimination;
- partial isomorphism with exact residuals;
- alternative-factorization invariance;
- misleading/swapped-label controls;
- rewrite correctness;
- long composition without scope/identity drift;
- cross-context continuation;
- novel synthesis;
- performance under context pressure;
- comparison against natural language and established formal representations at matched resources.

For structural classes specifically, label-blind witnessed comparison is mandatory.

## Target agent

AxiomeSH is not defined around one vendor, tokenizer, or model generation.

The target is a capability class:

> bounded-context reasoning agents capable of learning a compact representation, maintaining structural references, retrieving external knowledge, and synthesizing relations across independently developed domains.

## Ownership boundary

This research currently lives in CUDA-JS as an incubation host.

AxiomeSH is **not** a CUDA-JS runtime responsibility and must not leak into maintained CUDA-JS APIs merely because the research branch lives here.

If it becomes independently load-bearing, it should move to a dedicated repository/package with its own authority and contracts.

## Current operating principle

> **Discover and preserve the structure first. Name it after the evidence. Optimize its transport later.**
