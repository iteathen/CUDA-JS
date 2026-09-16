# Experiment 003 — Primitive Heap / Separation Foundation

**Status:** E1P candidate; author-side only  
**Native module:** `FOUNDATION_HEAP_SEPARATION_003.axh`  
**Target:** FL-013 and reusable resource-separation reasoning

## Primitive floor

The foundation does not treat separating conjunction or Hoare validity as primitive logical operators.

Primitive/model leaves are:

| Symbol | Role |
|---|---|
| `^9001` | heap cell incidence `(model, heap, address, value)` |
| `^9002` | heap identity belongs to model |
| `^9005` | primitive program transition `(model, program, pre_state, post_state)` |

Heap cell functionality is constrained natively: one address in one heap cannot have two distinct values.

`^9000 store heap` is a structural state/configuration constructor used by shared formula satisfaction.

## Derived disjointness

`^9003 model h1 h2` is defined exactly by absence of an address present in both heaps.

This is not a primitive "disjoint" oracle.

## Derived heap union

`^9004 model whole h1 h2` is defined from:

- all three heap identities;
- disjointness of `h1` and `h2`;
- every cell in `whole` occurs in one component;
- every cell in either component occurs in `whole`.

Thus union is extensional over primitive address/value incidence.

## Points-to

The existing Experiment 003 source alias `^537` is defined through shared satisfaction:

```text
Sat(M, state(store,h), points_to(a,v))
```

iff:

- heap `h` contains cell `a -> v`; and
- every cell in `h` is exactly that same address/value pair.

Therefore points-to denotes the singleton heap assertion rather than an opaque spatial atom.

## Separating conjunction

The existing source alias `^538` is derived:

```text
Sat(M, state(store,h), P * Q)
```

iff there exist `h1,h2` such that:

```text
union(M,h,h1,h2)
Sat(M,state(store,h1),P)
Sat(M,state(store,h2),Q)
```

Because union already contains disjointness, the partition semantics is explicit.

This follows the standard separation-logic semantic shape: a heap satisfies `P * Q` when it splits into disjoint subheaps satisfying `P` and `Q` respectively.

## Program transition and Hoare validity

`^9005` is the primitive program transition relation supplied by a concrete program semantics.

`^9006 model pre program post` is derived partial-correctness validity:

```text
for every pre-state and post-state,
if pre holds and program transitions pre -> post,
then post holds.
```

Thus a Hoare triple alias can erase to `^9006`; no opaque Hoare theorem predicate is required.

A concrete program such as swap must still expose its transition semantics. `^9005` cannot be populated by a hidden external interpreter during proof qualification.

## Frame rule

The frame rule is **not** part of this primitive foundation.

It should be derived/proved from:

- separating conjunction's explicit heap partition;
- the program's footprint/locality conditions;
- preservation of the framed disjoint heap.

Treating frame as an unexplained inference token would skip the mechanism the benchmark is supposed to expose.

## FL-013 remaining work

Before the pointer-swap benchmark passes E1P/E3:

1. construct primitive read/write/swap transition semantics or a directly auditable swap state transformation;
2. make the distinct-address/resource assumptions explicit;
3. alias-erase `^537` and `^538` through this foundation;
4. map the source Hoare-triple alias to `^9006`;
5. derive the swap postcondition;
6. qualify the frame rule separately against locality/disjointness;
7. cold-review the proof with no hidden heap evaluator.

## Reference semantics used for construction

The semantic shape was checked against standard separation-logic presentations, including Reynolds/O'Hearn/Brookes formulations where:

- heaps are finite partial maps;
- points-to denotes a singleton cell heap;
- separating conjunction splits a heap into disjoint subheaps;
- program triples reason over state transitions.

External references support the research decision; the native foundation is the experiment authority.

## Falsifiers

Revise this foundation if:

- extensional union fails to preserve heap identity/functionality;
- the state constructor loses store-dependent assertion semantics needed by later cases;
- swap semantics requires hidden mutation behavior;
- alias erasure changes the spatial obligation;
- a lower-level resource algebra represents the same mechanism more generally without losing heap-specific exactness.
