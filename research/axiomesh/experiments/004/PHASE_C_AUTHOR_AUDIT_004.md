# Experiment 004 — Phase C Author Audit

**Status:** author-side fixture review only; not isolated qualification evidence

## Q004-11

Left:

```text
(^5100 10 11)
```

Right:

```text
(^5100 20 21)
(^5101 20 21)
```

Under V0 the stable labels are rigid.

Mapping `10->20`, `11->21` preserves the left relation.

The extra `^5101` relation exists between already mapped target objects, so:

```text
weak embedding: expected yes
strong/induced embedding: expected no
isomorphism: expected no
```

The `^5101` edge must remain explicit target residual.

## Q004-12

Under V0, `^5201` and `^5202` cannot map.

The expected common mapped relation is therefore the `^5200` edge with one example node map:

```text
30 -> 40
31 -> 41
```

The incident `^5201 31 32` and `^5202 41 42` relations are boundary-cut structures connecting core nodes to source-only residual nodes.

They cannot be silently dropped from accounting.

## Q004-13

Both scopes are two-leaf stars under rigid relation label `^5300`.

At least two V0 isomorphism witnesses exist:

```text
50->60, 51->61, 52->62
50->60, 51->62, 52->61
```

The two witnesses differ by the leaf automorphism.

A canonical graph representative may choose one representative serialization, but does not by itself prove that only one structural mapping exists.

## Fixture state

```text
signature closure: PASS author-side
V0 view fixed in cold prompt: YES
hidden assertions: FROZEN
cold prompt: FROZEN
isolated run: PENDING
```
