# AxiomeSH

**Status:** research incubation  
**Research direction:** Josh Oshiro  
**Current experimental branch:** `experiment/axiomesh-native-reconstruction`  
**Current candidate authority for new qualification artifacts:** `CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md` + `CORE_SPEC_DRAFT_0_14_CANDIDATE.md` + `CORE_SPEC_DRAFT_0_15_CANDIDATE.md`  
**Current phase:** specification-growth freeze; focused structural falsification/qualification

AxiomeSH is an experimental agent-native structural knowledge representation.

Its central research question is:

> Can agents reason, retain, compare, and synthesize more effectively when persistent knowledge exposes the relational structure they must manipulate rather than primarily using forms optimized for human communication?

The project is not trying to create a numbered copy of existing logical notation. Its primary opportunity is to expose invariant/common structural shape across independently named domains while preserving exactly the residual distinctions that prevent false equivalence.

The leading hypothesis remains:

```text
knowledge = relational structure + lawful structural transformation
```

The scoped-hypergraph/rewrite substrate remains a research hypothesis, not a settled commitment.

## Current authority

For new qualification work, use:

1. `CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md` — self-contained consolidated base;
2. `CORE_SPEC_DRAFT_0_14_CANDIDATE.md` — frozen qualification amendment over Draft 0.13;
3. `CORE_SPEC_DRAFT_0_15_CANDIDATE.md` — isolated-external-review corrections over Drafts 0.13/0.14.

Draft 0.15 adds no new logical operator, structural class, or irreducible primitive. It tightens reference-binding placement, occurrence-versus-identity rewrite semantics, rule-side splice boundaries, declarative variable ownership, two-stage residual accounting, factorization-stage-specific indexing, infix parse determinism, NAC evaluation context, minimality metrics, and canonical-serialization/index scoping.

The external review that triggered Draft 0.15 is preserved with accepted/rejected finding rationale in `experiments/004/EXTERNAL_REVIEW_GEMINI_001_DISPOSITION.md`.

Drafts 0.1–0.12 and earlier protocol revisions remain frozen design/experiment evidence. Older artifacts retain the semantics under which they were created and are not silently reinterpreted under the current authority.

`DESIGN_NOTES.md` preserves research rationale/falsifiers rather than overriding the current spec.

## Objective

AxiomeSH aims to maximize:

> **durable correct agent synthesis per total lifecycle resource cost**

while preserving:

- semantic fidelity;
- structural soundness;
- canonical integrity;
- load-bearing distinctions;
- exact composition boundaries;
- required provenance;
- recoverability.

Token/character count is a cost, not the objective.

## Native path

```text
raw AxiomeSH -> agent -> raw AxiomeSH
```

No mandatory English parser, theorem-language translation, JSON envelope, database adapter, or model-specific semantic layer belongs in the native correctness path.

## Current structural-discovery discipline

```text
source evidence / interpretation alternatives
-> independent qualified factorization/extraction per source
-> representation-only normalization
-> mandatory structural-only candidate-retrieval path
-> frozen native comparison policy
-> structural search
-> native candidate witness/certificate
-> structural verification
-> relation/common-core/residual result
-> class recognition OR new-class hypothesis
-> retained labels with native provenance
```

Labels are retained because they help agents retrieve and reconstruct higher-level objects. They are downstream of structural evidence and cannot choose the decomposition, extraction, parameterization, comparison policy, or class result they later name.

## Finding the pair is part of correctness

A perfect pairwise isomorphism checker is insufficient if candidate retrieval never places true cross-domain correspondences in front of it.

For qualification of the AxiomeSH representation hypothesis, at least one candidate-generation path must operate from discovery-visible native structural evidence without source/domain/class labels as semantic authority.

Label-assisted or learned semantic retrieval may run in parallel as acceleration and is measured separately.

Structural fingerprints, learned indexes, class labels, and source labels are retrieval machinery—not correspondence witnesses.

A fingerprint/index is qualified for an explicit representation/factorization stage. A raw-stage invariant cannot silently prune a topology-changing D factorization, and AxiomeSH does not assume one canonical post-D factorization for indexing convenience.

## Isomorphism safety

AxiomeSH must avoid both:

- **false negatives:** related objects fail to meet because names, namespaces, serialization, factorization, extraction, indexing, or retrieval differ;
- **false positives:** different objects collapse because constraints, multiplicity, boundaries, domains, residuals, relation signature, parameter choices, source interpretation, or search incompleteness are hidden.

For partial correspondence, every common/residual/boundary/excluded/projected item is explicitly accounted for.

Source-local D/extraction residuals and pairwise comparison residuals are distinct accounting layers. A pairwise witness reconstructs the frozen comparison-stage object; full-source reconstruction additionally follows the source-local transformation record and is claimed only when that transform is exact/reconstructable.

## Native self-description at the isomorphism boundary

Load-bearing comparison and discovery semantics are themselves native first-class structure.

Current qualification requires native/reconstructable representations of, as applicable:

```text
comparison policy
namespace / role declarations
factorization / extraction edges
index declarations
mapping / correspondence witnesses
negative / optimality certificates
class schema revisions
class membership / class-class witnesses
discovery and verification result records
```

Human Markdown/JSON may mirror those objects for review but cannot supply missing load-bearing semantics.

## Information-preserving defaults

For new current-semantics artifacts:

- raw `[]` is an unordered occurrence-preserving scope/boundary/container;
- raw scope is not implicitly conjunction, mathematical set, list, or active execution state;
- duplicate member occurrences are preserved unless an explicit quotient/profile establishes idempotence;
- direct member occurrence and structural identity are distinct: rewrite subtraction removes selected member occurrences, not the identity object or unrelated incidences;
- the outer scopes of `scope > scope` are rule-side pattern/replacement containers; direct RHS members splice into the application scope, while literal nested scope construction is written as a member scope such as `[[...]]`;
- distinct rewrite application events may remain distinct even when successor states are identical;
- active/inert rewrite status is execution-profile owned;
- rule serialization order is not priority;
- fresh allocation is explicit and namespace-relative rather than inferred from `+?n` by RHS position;
- structural absence `!X` is a first-class negative-match condition object and is evaluated only by an explicit matcher context; it is not semantic falsity;
- declarative constructors such as `=>`, `==`, `~`, and choice do not bind variables;
- quantifiers have represented/inherited domains or generators;
- object-theory equality is not structural identity.

## Identity / namespaces / references

Current discipline distinguishes:

```text
local structural identity + structural namespace
stable ^n label + owning semantic/schema namespace
exact literal value
```

Nested scopes inherit the enclosing structural identity namespace by default. Independent top-level documents do not share identity space merely because bare numeric spellings match.

Intentional cross-document sharing requires an explicit shared namespace/import/port/partition relation.

References are non-semantic compression. Reference bindings are serialization directives, not generic semantic terms: they cannot occupy ordered-edge/formula positions whose later N0 disappearance would alter semantic arity. N0 resolution is hygienic and structure-preserving.

Variables have reconstructable owners/roles. A closed declarative object containing an otherwise unowned variable is invalid; explicitly open formula/schema objects remain legal when their native interface owns the variable.

## Decomposition is plural

AxiomeSH does not assume one primitive-normal factorization.

Qualified factorization graphs preserve exact definitions, refinements, projections, E-equivalences, extraction relations, and unresolved alternatives.

Exact semantic decomposition reports both round-trip fidelity and semantic-decomposition coverage. An opaque source copy or undecomposed residual cannot masquerade as exposed semantics.

Source ambiguity likewise remains explicit as alternative fidelity/formalization interpretations rather than being silently resolved toward a convenient analogy.

## Normalization is narrow

```text
N0  serialization-transparent normalization
N1  source-local alpha/representation normalization
D   qualified factorization/decomposition
E   profile/theorem equivalence
```

Only N0/N1 are ordinary pre-comparison normalization.

Theorem equivalence, substitution/beta reduction, class expansion, algebraic laws, quotienting, and lossy extraction are explicit D/E/projection operations.

During the current freeze, ordinary `()` remains ordered incidence rather than transparent parser grouping. Un-delimited chained/mixed infix forms are rejected rather than implementation-defined.

## Comparison axes are separate

Every blind comparison freezes independently:

```text
target layer
view policy
included relation signature
source-local role/port policy
N0/N1 rules
allowed D/E authority
factorization/extraction bounds
relation kinds sought
objective if any
resource budget
```

Relation kinds include isomorphism, strong/weak embedding, specialization, homomorphism, simulation/bisimulation, quotient/projection, common core, certified negative, no-witness, unknown, and resource-limit results.

`NO_WITNESS_FOUND` is not `CERTIFIED_NON_ISOMORPHIC`.

## Structural verification, not second-opinion verification

Search agents may propose mappings, cores, class memberships, or certificates.

Fresh verifiers check explicit structural obligations against immutable, content-bound source/policy/dependency revisions. Where feasible these checks are deterministic/mechanical over native structure.

Qualification rests on satisfied represented obligations, not agreement with the discoverer's conclusion.

## Structural classes

A reusable class is an immutable/content-bound, versioned, namespaced schema graph with structured parameters, ports, positive/negative constraints, relation signature, dependencies, residual/composition policy, native witnesses, and independent qualification evidence.

Large parameters are allowed; class non-vacuity is about reusable structural constraint/selectivity, not byte share.

Known-class recognition and new-class induction are distinct workflows. One object may have multiple verified class memberships.

Any claim that one class/factorization is simpler/minimal requires a declared metric or partial order; absent one, competing exact constructions remain explicit.

Label attachment retains native provenance roles distinguishing source-supplied labels, inferred structural classes, retrieval aliases, and human gloss.

## Qualified revisions are immutable evidence

Navigation labels may move to newer revisions, but schemas, profiles, policies, indexes, D/E rules, sources, and verifier contracts used by a witness are pinned to immutable content identity.

Old witnesses do not silently qualify changed content.

## Current structural authorities

- `CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`
- `CORE_SPEC_DRAFT_0_14_CANDIDATE.md`
- `CORE_SPEC_DRAFT_0_15_CANDIDATE.md`
- `experiments/003/STRUCTURAL_DISCOVERY_PROTOCOL_006.md`
- `experiments/003/STRUCTURAL_COMPARISON_PROTOCOL_006.md`
- `experiments/003/STRUCTURAL_CLASS_SCHEMA_CONTRACT_006.md`
- `experiments/003/STRUCTURAL_CLASS_CATALOG_005.md` — hypothesis catalog only
- `experiments/004/EXTERNAL_REVIEW_GEMINI_001_DISPOSITION.md`
- `experiments/004/RESULTS_004.md`

C1–C12 / `^9101..^9112` remain candidate navigation handles, not qualified class revisions.

## Qualification freeze

No new structural class, irreducible primitive, or relation kind is added merely because a synthetic case is awkward.

The original twenty-case Experiment 004 suite remains frozen. Draft 0.15 adds supplemental qualification controls for reference-binding placement, rule-side splice semantics, declarative variable ownership, two-stage residual reconstruction, factorization-stage index validity, infix parse determinism, first-class NAC evaluation context, and canonical-serialization/index algorithm scoping.

A failure justifies a spec change only after the failure is classified and the existing representation is shown to be insufficient, ambiguous, or materially worse than a proposed correction.

## Historical artifact warning

Existing Experiment 003 `.axh` foundations/profiles/proofs were authored under earlier conventions and remain historical author-side candidates until rerendered under the current authority or connected by an exact independently verified legacy-to-current bridge.

Historical reproducibility is not current structural qualification.

## Ownership boundary

This research lives in CUDA-JS as an incubation host. AxiomeSH is not a CUDA-JS runtime responsibility. If it becomes independently load-bearing, it should move to a dedicated repository/package with its own authority/contracts.

## Current operating principle

> **Decompose without target-class bias. Preserve ambiguity. Freeze the rules. Find candidates structurally. Let structure determine the mapping. Verify obligations independently. Keep every residual and exclusion. Name the result afterward.**
