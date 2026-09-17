# AxiomeSH Core Specification — Draft 0.8 Candidate

**Status:** experimental tightening produced by structural-class review of Experiment 003  
**Parents:** Draft 0.2 → Draft 0.3 → Draft 0.4 → Draft 0.5 → Draft 0.6 → Draft 0.7  
**Form:** normative amendment; earlier candidate rules remain in force except where this document explicitly tightens interpretation and promotion status  
**Promotion:** experimental-branch authority only

Draft 0.8 keeps named higher-level forms, but changes how they are justified and organized.

The governing order is now:

```text
source concept
-> semantic decomposition
-> primitive/native construction
-> structural-class recognition
-> named class / named domain instance
-> optional compact surface syntax
```

not:

```text
source concept
-> familiar name
-> new primitive
```

The purpose of labels is identification, reuse, retrieval, and cross-domain comparison. A label is useful precisely because many independently named objects may share the same structural form. The label does not replace the construction it names.

---

## 1. Decompose first, classify second, name third

Every proposed higher-level object or operator MUST be handled in this order:

1. preserve the source semantics without repair-by-convenience;
2. decompose the semantics as far as faithfully possible into existing AxiomeSH structure plus admissible model leaves;
3. canonicalize the resulting construction;
4. compare the construction with already known structural classes;
5. if the construction is an instance, specialization, or composition of an existing class, attach that class identity;
6. otherwise create a new **candidate structural class** from the observed construction, not from the source vocabulary;
7. optionally retain the source-domain label and compact syntax as a derived surface.

A class MUST NOT be selected first and then used to force a source object into an attractive shape.

The decomposition is evidence. The class assignment is a conclusion from that evidence.

---

## 2. Structural classes

A **structural class** is a reusable parameterized construction pattern over native AxiomeSH structure.

A class is identified by the structure and invariants it preserves, not by the English or conventional formal-language name attached to one instance.

Examples of candidate class shapes include:

- universal satisfaction over a relation-generated region;
- existential satisfaction over a relation-generated region;
- immediate-successor evaluation;
- finite path / reflexive-transitive closure;
- predicate-selected restriction of a structure;
- disjoint decomposition and recomposition;
- transition-preservation judgment;
- finite locally validated derivation tree;
- finite fold over an indexed family;
- functional-graph application;
- well-founded propagation.

These examples are candidate classes, not automatically core primitives.

A class definition must itself expand to lower-level native structure.

---

## 3. Three-level naming model

A qualified representation may use three different identities without conflating them:

```text
primitive/native construction
structural-class identity
source/domain instance identity
```

For example, an epistemic knowledge operator may retain a domain label while also being classified structurally as universal satisfaction over an accessibility-generated region.

A temporal globally operator may carry a different domain label while sharing a related class instantiated over a reflexive future relation.

This is desirable. The domain labels preserve source vocabulary while the class label exposes the common relational shape.

The expected relationship is:

```text
domain label
  -> instance of structural class
  -> parameterized native construction
  -> primitive/model leaves
```

---

## 4. Labels are retained and encouraged

Draft 0.8 does **not** require deleting useful semantic labels.

Stable labels are encouraged when they improve:

- retrieval;
- comparison;
- construction guidance;
- canonical serialization;
- specification readability;
- reuse of already-qualified construction patterns;
- detection of cross-domain isomorphisms.

A label is semantically safe when its native definition or class/instance mapping is present and erasure-safe.

Therefore a label such as a stable `^n` may serve as:

- a structural-class identity;
- a source/domain instance identity;
- a named derived constructor;
- an indexing/retrieval handle.

It MUST NOT become the only location where the compound semantics exist.

---

## 5. Class labels do not create primitive status

A structural-class identity is not a new logical primitive merely because it is shared by many domains.

The class is a reusable construction schema.

Its parameters, constraints, and expansion must remain explicit enough that a cold agent can reconstruct the class without importing external semantic knowledge.

Likewise, a frequently used surface form does not become irreducible merely through popularity.

---

## 6. Instance, specialization, and composition

A higher-level object may relate to structural classes in more than one way.

### 6.1 Instance

The object directly instantiates the class by supplying parameters.

Example shape:

```text
universal-over-region(origin, generator, body)
```

### 6.2 Specialization

The object instantiates a class with additional constraints.

For example, a globally-like operator may specialize universal-over-region by requiring the region generator to be a reflexive linear future order.

### 6.3 Composition

Some named operators are compositions of several classes.

Common-knowledge-style semantics can combine:

```text
union-of-agent-relations
+ finite-path closure
+ universal satisfaction over the reachable region
```

Such an object SHOULD retain all load-bearing class relationships rather than being forced into one class label.

---

## 7. Two-stage erasure qualification

Draft 0.7 introduced alias erasure. Draft 0.8 makes the class layer explicit.

A qualified named instance must support:

```text
source/domain label
-> erase to structural-class instance
-> erase class label to native construction
-> primitive-normal form
```

Both erasures must preserve the relevant obligation.

This allows compact labels without losing semantic transparency.

A failure at either stage means the label/class is concealing semantics rather than naming them.

---

## 8. Construction specifications are first-class guidance

Specifications SHOULD document higher-level constructions as reusable recipes rather than merely as vocabulary lists.

A construction specification should state, where applicable:

```text
class identity / label
parameters
primitive/model leaves
native construction
invariants
specialization constraints
known domain instances
expansion / erasure rule
falsifiers
qualification evidence
```

This lets an agent construct the object correctly from lower-level structure while still benefiting from stable names.

---

## 9. Earlier candidate syntax is retained but primitive status is not assumed

Drafts 0.2–0.6 introduced useful surface forms and distinctions, including:

```text
#n
^n
A => B
A == B
~A
{ ... }
*?n BODY
+?n BODY
\?n BODY
ABSTRACTION @@ ARGUMENT
```

Draft 0.8 does not delete or invalidate these forms.

They remain available as candidate canonical surface forms on the experimental branch.

However, their existence in the candidate grammar MUST NOT be read as final evidence that each is an irreducible core primitive.

Before final core promotion, each form must be classified as one of:

```text
irreducible representation primitive
canonical surface for a lower-level native construction
serialization/value shorthand
profile-owned derived constructor
rejected/redundant
```

The same audit applies to Draft 0.2's formula-scope conjunction interpretation.

This preserves existing experiments while preventing specification growth from becoming self-justifying.

---

## 10. Core-admission test

Before adding or permanently promoting a new core form, perform:

```text
candidate distinction
-> attempt representation with existing primitives
-> test exact semantic fidelity
-> test canonical identity / ambiguity
-> test agent reconstruction and reasoning cost
-> retain a named derived construction if sufficient
-> promote to core only if decomposition fails or is materially worse
```

A measured compactness or reasoning advantage may justify a canonical surface syntax without proving irreducibility.

Core syntax and convenient language syntax are therefore separate design questions.

---

## 11. Cross-domain synthesis objective

Structural classes are intended to expose common shapes hidden by domain vocabulary.

Examples to test, not assume:

```text
knowledge
~ universal satisfaction over accessibility image

globally
~ universal satisfaction over reflexive future region

common knowledge
~ path closure + universal satisfaction

reflexive-transitive reduction
~ path closure

eventually / EF-like forms
~ existential satisfaction over generated region

separating conjunction
~ disjoint decomposition + recursive satisfaction
```

The value of the class layer is that differently named constructions can become directly comparable while source labels remain intact.

A class assignment is invalid if a load-bearing semantic difference is erased merely to create an isomorphism.

---

## 12. Qualification gates

Draft 0.8 adds two checks to Experiment 003-style work.

### E1C — structural-class classification

After primitive decomposition, identify whether each derived object is:

- an instance of an existing class;
- a specialization of one or more classes;
- a composition of classes;
- evidence for a genuinely new candidate class.

Class assignment must follow decomposition, not precede it.

### E1E — class/instance erasure

Verify both:

```text
domain label -> class instance
class instance -> primitive-normal construction
```

without changing the formal obligation.

E1C/E1E refine E1P/E1A; they do not replace primitive decomposition.

---

## 13. Experiment 003 consequence

Experiment 003 should retain useful domain labels such as knowledge, globally, eventually, next, common knowledge, separation, Hoare validity, and proof constructors for source mapping and retrieval.

Their semantic foundations must continue to live in the decomposed native modules.

The next consolidation work should identify common construction classes across those modules and map the labels to those classes, rather than creating one independent semantic mechanism per source notation.

The existing primitive foundations are evidence inputs for that classification step.

---

## 14. Falsifiers

Revise this candidate if evidence shows that:

- class labels encourage incorrect unification of semantically different constructions;
- the class layer adds retrieval/maintenance cost without improving reconstruction or synthesis;
- agents classify by name despite contradictory primitive structure;
- a class cannot be erased to a native construction;
- a domain instance loses source semantics when mapped to a class;
- direct primitive structure consistently outperforms labelled class construction enough to make labels harmful;
- a proposed core surface form is shown to be unnecessary and materially harmful even as shorthand.

Until then, the governing discipline is:

```text
decompose first
-> recognize structural class
-> attach useful labels
-> keep expansion exact
```
