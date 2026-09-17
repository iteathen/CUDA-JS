# AxiomeSH

**Status:** research incubation  
**Research direction:** Josh Oshiro  
**Current substrate hypothesis:** agent-native scoped relational/hypergraph structure plus lawful transformation  
**Current experimental branch:** `experiment/axiomesh-native-reconstruction`

AxiomeSH is an experimental structural knowledge representation for neural reasoning agents.

Its central question is:

> Can an agent reason, synthesize, and continue work more effectively when external knowledge is represented close to the relational structure it must manipulate rather than primarily in forms optimized for human communication?

AxiomeSH is not intended to be a numbered copy of existing formal notation. Its main research opportunity is to expose invariant structural shape across domains so that agents can discover exact and partial isomorphisms that names and conventional notation hide.

The leading hypothesis remains:

\[
\boxed{\text{knowledge}=\text{relational structure}+\text{lawful structural transformation}}
\]

The graph/hypergraph-rewrite substrate remains a **research hypothesis**, not a settled commitment.

## Current specification lineage

The drafts are cumulative experimental amendments, not final language releases.

- [`CORE_SPEC_DRAFT_0_1.md`](./CORE_SPEC_DRAFT_0_1.md) — original minimal scoped-hypergraph/rewrite candidate.
- [`CORE_SPEC_DRAFT_0_2_CANDIDATE.md`](./CORE_SPEC_DRAFT_0_2_CANDIDATE.md) — literals, stable labels, declarative formula surfaces.
- [`CORE_SPEC_DRAFT_0_3_CANDIDATE.md`](./CORE_SPEC_DRAFT_0_3_CANDIDATE.md) — lexical scope/signature inventory.
- [`CORE_SPEC_DRAFT_0_4_CANDIDATE.md`](./CORE_SPEC_DRAFT_0_4_CANDIDATE.md) — qualification/presentation/signature tightening.
- [`CORE_SPEC_DRAFT_0_5_CANDIDATE.md`](./CORE_SPEC_DRAFT_0_5_CANDIDATE.md) — bound-body surface and proof-profile separation.
- [`CORE_SPEC_DRAFT_0_6_CANDIDATE.md`](./CORE_SPEC_DRAFT_0_6_CANDIDATE.md) — candidate structural-instantiation surface.
- [`CORE_SPEC_DRAFT_0_7_CANDIDATE.md`](./CORE_SPEC_DRAFT_0_7_CANDIDATE.md) — primitive semantic decomposition requirement.
- [`CORE_SPEC_DRAFT_0_8_CANDIDATE.md`](./CORE_SPEC_DRAFT_0_8_CANDIDATE.md) — retained labels and structural-class layer.
- [`CORE_SPEC_DRAFT_0_9_CANDIDATE.md`](./CORE_SPEC_DRAFT_0_9_CANDIDATE.md) — plural factorizations, witnessed comparisons, ports/residuals, label-blind qualification.
- [`CORE_SPEC_DRAFT_0_10_CANDIDATE.md`](./CORE_SPEC_DRAFT_0_10_CANDIDATE.md) — policy freeze, namespaced stable symbols, exact-D round trips, versioned schemas, independent witness verification, negative-result/search discipline, target-layer separation.
- [`DESIGN_NOTES.md`](./DESIGN_NOTES.md) — research rationale, constraints, hypotheses, and falsifiers.

Historical drafts remain frozen evidence for their experiments. Later drafts supersede conflicting interpretation without rewriting old inputs.

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

The native research path remains:

```text
raw AxiomeSH -> agent -> raw AxiomeSH
```

No mandatory English parser, theorem-language translation, JSON envelope, database adapter, or model-specific semantic layer belongs inside the native correctness path.

Adapters may project from native structure later, but must not become peer semantic authorities.

## Constitutional isomorphism pipeline

The current governing order is:

```text
source semantics
-> qualified/versioned factorization set
-> N0/N1 representation normalization
-> frozen comparison policy
-> label-blind structural search
-> candidate mapping/certificate
-> independent witness verification
-> exact/common-core/residual result
-> versioned structural-class recognition
-> retained useful labels
-> optional compact surface
```

Labels are intentionally retained because they improve retrieval, construction, and reuse.

They may not choose the decomposition, mapping policy, parameterization, or class result they later name.

## Why this matters

AxiomeSH must avoid both:

- **false negatives** — related structures fail to match because labels, namespaces, serialization, or factorization differ;
- **false positives** — different structures collapse because boundaries, constraints, multiplicity, residuals, domains, or search uncertainty disappear.

When only part of two objects corresponds, prefer:

\[
A=C+\Delta_A
\]

\[
B=C+\Delta_B
\]

with explicit residuals over a larger false equivalence.

## Factorization is plural by default

AxiomeSH does not assume one privileged primitive-normal decomposition.

When several factorizations are faithful:

- preserve them as versioned factorization nodes;
- record exact versus lossy transformation kinds;
- require exact D factorizations to round-trip;
- represent recursive definitions with explicit base/step/fixed-point authority;
- compare across materially distinct qualified factorizations;
- report factorization-set completeness and dependence;
- declare one canonical factorization only after appropriate uniqueness/confluence evidence.

## Comparison axes are separate

Draft 0.10 separates:

```text
view policy V
transformation authority N0/N1/D/E
relation kind R
```

Examples of view policy:

```text
V0 closed structural
VB boundary/port-preserving
VS signature-mappable
VC class-schema/parameterized
```

Examples of relation kind:

```text
isomorphism
strong/weak embedding
specialization
homomorphism
simulation/bisimulation
quotient/projection
common core
certified non-isomorphism
no witness / unknown / resource limit
```

A result label cannot silently change the comparison rules.

## Comparison policy is frozen before scoring

For qualification, role assignments, mappability, parameter slots, D/E authorities, factorization bounds, target layer, and optimization criteria are frozen before expected mappings/results are unblinded.

Otherwise the test can manufacture an analogy by deciding after the fact which differences “do not count.”

## Stable labels are namespaced

A stable theory symbol is not globally identified by its numeric spelling alone.

A theory-local semantic label has identity at least:

```text
(theory/signature namespace, local symbol id)
```

unless an explicit shared/global namespace exists.

Thus coincidental `^42` in unrelated bundles is not evidence of sameness.

Exact literals remain value identities rather than local labels.

## Normalization is narrow

Current layers are:

```text
N0  serialization-only normalization
N1  alpha/representation normalization
D   qualified definitional factorization/expansion
E   profile/theorem semantic equivalence
```

Only N0/N1 are ordinary pre-comparison normalization.

A theorem equivalence, substitution step, beta rule, algebraic law, class expansion, or lossy quotient must not be hidden under “canonicalization.”

## Structural classes are versioned schemas

A class is a reusable parameterized schema graph, not an ontology bucket.

A qualified revision includes:

- native schema graph;
- structured parameter slots;
- boundary/interface ports;
- rigid/mappable roles;
- invariants/constraints;
- admissible mappings/variance;
- exact dependency revisions;
- specialization/composition rules;
- residual policy;
- alternative factorizations;
- falsifiers and qualification evidence.

Class membership and class-class relations require independently verified witnesses.

Changing a qualified schema produces a new revision; old witnesses do not silently transfer.

Current Experiment 003 C1–C12 labels remain candidate navigation handles, not qualified immutable classes.

## Parameters cannot be invented after a failed match

Post-hoc parameterization would let any two structures be made “the same” by turning every difference into a slot.

For an existing class run, parameters, ports, mapping rules, constraints, and residual policy are frozen before instance scoring.

Reusable class promotion requires independent instances or an independently specified schema tested on held-out/adversarial instances.

## Discovery and verification are separate

A comparison agent may emit a mapping/common-core witness.

A fresh verifier must independently check that witness against frozen objects and the frozen policy without access to expected class/domain names.

Likewise, failure to find a mapping is not proof of non-isomorphism.

Current result discipline distinguishes:

```text
CERTIFIED_NON_ISOMORPHIC
NO_WITNESS_FOUND
UNKNOWN
RESOURCE_LIMIT
```

A certified negative requires complete search for the declared finite problem or a verified separating certificate.

## Target layer is explicit

Comparison may concern:

```text
native representation graph
construction/schema graph
generated finite structure
profile denotation/behavior
proof/derivation behavior
```

A schema isomorphism does not automatically imply source-theory semantic equivalence.

Mapping opaque primitive/model leaves into shared parameter slots establishes a **parametric structural correspondence** unless additional semantic/profile evidence proves more.

## Minimal-core bias remains active

Useful syntax can survive as a canonical surface without becoming irreducible core semantics.

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

- raw `[]` is a structural scope/boundary; conjunction/co-satisfaction must be explicit;
- fresh allocation must not rely only on `+?n` appearing on a rewrite RHS;
- `~` is a declarative negation surface, not globally classical negation;
- quantifiers must expose or inherit an explicit native domain/generator;
- `@@` remains a useful surface pending rewrite-level decomposition;
- structural absence `!X` is not semantic falsity without an explicit completeness/closed-world contract;
- behavior-changing carrier roles must be native/recoverable rather than external reader context.

Frozen historical artifacts retain historical decode rules. New structural qualification requires rerendering or an exact legacy-to-current bridge.

## Composition is central

Internal similarity is insufficient if components cannot compose under their real interfaces and constraints.

Comparison preserves ports and requires gluing/joint-realizability evidence where composition matters.

Common scope/shared identity is not a proof of compatibility.

## Qualification

Structural qualification now includes adversarial controls for:

- cross-domain positive matching;
- alpha/serialization changes;
- near-isomorphic negatives;
- same-interior/different-boundary negatives;
- partial correspondence/residuals;
- alternative factorizations;
- misleading/swapped labels;
- automorphisms/multiple mappings;
- namespace collisions;
- policy leakage/post-hoc parameterization;
- homomorphism/quotient traps;
- certified-negative versus resource-limited no-witness;
- legacy/current bridge behavior.

Unknown is preferable to an unsupported equivalence or unsupported negative.

## Target agent

AxiomeSH is not defined around one vendor, tokenizer, or model generation.

The target is a capability class:

> bounded-context reasoning agents capable of learning a compact representation, maintaining structural references, retrieving external knowledge, and synthesizing relations across independently developed domains.

## Ownership boundary

This research currently lives in CUDA-JS as an incubation host.

AxiomeSH is **not** a CUDA-JS runtime responsibility and must not leak into maintained CUDA-JS APIs merely because the research branch lives here.

If it becomes independently load-bearing, it should move to a dedicated repository/package with its own authority and contracts.

## Current operating principle

> **Decompose without target-class bias. Freeze the comparison rules. Let structure determine the mapping. Verify the witness independently. Name the result afterward.**
