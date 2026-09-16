# Axiomesh

**Status:** research incubation

**Research direction:** Josh Oshiro

Axiomesh is a proposed compact formal-logic language and intermediate representation optimized for agent context windows.

The central objective is not merely shorter notation. It is to maximize **recoverable logical structure per token** while preserving deterministic semantics, compositional reasoning, explicit dependencies, and machine-checkable reconstruction.

## Core question

> What is the smallest token-efficient formal representation that lets an agent recover the same useful proof state, dependencies, alternatives, and inference obligations that a much larger natural-language context would carry?

The language should be designed for model consumption first. Human readability is useful but secondary to semantic density, unambiguous reconstruction, locality, and robust continuation across constrained context windows.

## Initial hypothesis: tokenized transition chains

A useful starting hypothesis is to model reasoning as transitions among compact typed logical states:

```text
state/token -> guarded transition -> state/token
```

and to investigate whether parts of this transition system admit Markov-like factorization: the next valid inference may depend on a compact sufficient state rather than the complete textual history.

This is deliberately a **hypothesis, not an architectural commitment**. Ordinary Markov chains discard history by construction; formal reasoning often requires provenance, variable binding, scopes, unresolved alternatives, proof obligations, and nonlocal dependencies. Axiomesh should therefore search for the smallest sufficient state and the exact conditions under which history can be quotiented away.

Candidate structures to compare include:

- finite-state and higher-order Markov models;
- typed transition systems;
- proof nets and sequent-calculus states;
- term graphs / DAGs;
- hypergraphs and dependency graphs;
- event structures and partial orders;
- factor graphs / CSP-style local relations;
- e-graphs and congruence classes;
- probabilistic automata where uncertainty is genuinely part of the semantics.

## Design objectives

A candidate Axiomesh representation should be evaluated on at least:

1. **semantic exactness** — equivalent logical content reconstructs equivalently;
2. **token density** — low tokenizer cost per retained relation/invariant;
3. **local resumability** — an agent can continue reasoning from a bounded state without rereading irrelevant history;
4. **compositionality** — independently derived fragments combine without semantic ambiguity;
5. **canonical identity** — equivalent structures can share stable compact identities where justified;
6. **dependency visibility** — assumptions, scopes, guards, provenance, unresolved branches, and proof obligations remain explicit;
7. **incremental update cost** — one new fact should not require rewriting the entire representation;
8. **model robustness** — syntax should remain reliably interpretable by different agents/models and across context truncation;
9. **proof/checkability** — compactness must not turn reasoning into opaque lossy shorthand;
10. **transportability** — the representation should be serializable, diffable, cacheable, and embeddable in ordinary agent workflows.

## Important separations

Do not conflate:

```text
compression != semantic quotient
short token sequence != sufficient state
probabilistic transition != logical implication
high-frequency continuation != valid inference
canonical encoding != proof
model-predictable syntax != formally defined syntax
```

A Markov-style representation is valid only if the retained state is sufficient for the target inference semantics. If two histories map to the same compact state but permit different valid continuations, the quotient is unsound for that observation.

## First research program

### R1 — define the observation

Specify what an agent must recover from a context snapshot:

- established propositions;
- assumptions and scopes;
- variable bindings / quantification;
- dependency and provenance edges;
- alternatives and unresolved branches;
- confidence/epistemic status where applicable;
- permitted inference rules;
- current goals / obligations.

### R2 — find sufficient-state boundaries

Construct small formal reasoning traces and ask when two prefixes can be merged without changing the set of valid future deductions.

This is the direct analogue of behavioral quotienting: history may be discarded only under an explicit continuation-preservation relation.

### R3 — compare encodings under real tokenizers

For equivalent logical structures, measure:

```text
natural language
symbolic logic
S-expressions
postfix/prefix encodings
typed edge lists
compact DAG encodings
Axiomesh candidates
```

Measure tokenizer cost separately from byte count and character count.

### R4 — test Markov order

Determine whether useful reasoning fragments are:

- first-order Markov under a sufficiently rich state token;
- finite higher-order Markov;
- variable-order / context-dependent;
- fundamentally non-Markov unless dependency state is carried explicitly.

The desired result may be a compact state machine whose state contains exactly the nonlocal information needed to restore a Markov property.

### R5 — design a proof-preserving token grammar

Only after the sufficient-state experiments should syntax be stabilized. Prefer a small typed algebra over clever punctuation.

## Candidate primitive shape

One deliberately provisional model is:

```text
@id : type [guards] <- dependencies => relation/output
```

with repeated structures interned and referenced by compact IDs. This is not yet Axiomesh syntax; it is a test fixture for measuring what information must survive.

## Falsifiers

A proposed representation fails if any of the following occurs:

- two encoded states compare equal but admit different logically valid continuations;
- reconstruction requires hidden natural-language assumptions;
- token savings disappear under the target model tokenizer;
- an update requires global rewriting often enough to erase the context advantage;
- canonicalization destroys provenance or scope needed by later proof steps;
- probabilistic prediction is mistaken for entailment;
- the representation is compact only because a large external dictionary/context is silently assumed.

## Ownership boundary

This branch exists inside CUDA-JS only as the lowest available generic incubation host. Axiomesh is **not** currently a CUDA-JS runtime responsibility and must not leak into maintained CUDA-JS APIs or implementation merely because the research branch lives here.

If the formal-language idea becomes independently load-bearing, its natural destination is a dedicated repository/package with its own authority and contracts.

## Immediate next step

Build a tiny corpus of equivalent reasoning traces and search for the minimum continuation-preserving state. Use tokenized Markov models as one candidate factorization, then actively try to falsify the Markov assumption with provenance, quantifier-scope, branching, and dependency counterexamples before designing the language syntax.
