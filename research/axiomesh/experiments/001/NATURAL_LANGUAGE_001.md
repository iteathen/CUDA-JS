# Experiment 001 — Natural-Language Control Payloads

Each case below carries the same intended structural information as its AxiomeSH and JSON control versions. For cold qualification, give the decoder one case only.

## P01

There is one unordered scope. It contains exactly three ordered edges: `(14, 27, 63)`, `(52, 63, 88)`, and `(31, 27, 88)`. Repeated numbers denote the same atom wherever they occur. Edge position is significant.

## P02

There is one unordered scope. It contains exactly three ordered edges: `(9, 41, 72, 18)`, `(9, 41, 18, 72)`, and `(55, 72, 41)`. The first two edges are distinct because their third and fourth positions are reversed. Repeated numbers denote shared identity.

## P03

There is one unordered scope containing exactly four ordered edges: `(33, 70, 12)`, `(48, 70, 95)`, `(61, 12, 95)`, and `(84, 70, 12)`. Repeated numbers denote shared identity and edge positions are significant.

## P04

There is one unordered scope containing exactly four ordered edges: `(4, 21, 37)`, `(8, 21, 37)`, `(4, 65, 79)`, and `(8, 65, 79)`. Repeated numbers denote shared identity. The two pairs form repeated structural motifs, but no extra equivalence is asserted.

## S01

There is one outer unordered scope. It contains the ordered edge `(11, 24, 90)`, one nested unordered scope, and the ordered edge `(44, 91, 11)`. The nested scope contains exactly `(73, 24, 58)` and `(36, 58, 91)`. Atom identity is shared across scope boundaries when the same number occurs; in particular, `24` and `91` connect the nested scope to the outer structure.

## S02

There is one outer unordered scope containing four members. The first structural member is edge `(5, 17, 29)`. One nested scope contains `(62, 17, 74)` and `(81, 74, 93)`. A separate nested scope contains `(46, 29, 57)` and `(68, 57, 82)`. The outer scope also contains edge `(39, 93, 82)`. The two nested scopes are siblings, not one scope nested inside the other.

## R01

There is one unordered scope containing two rewrite rules and one current edge. The current edge is `(7, 42, 13)`. Rule one replaces a matching `(7, ?0, 13)` with `(8, ?0, 13)`. Rule two replaces a matching `(7, ?0, 13)` with `(9, ?0, 13)`. `?0` is a rule-local pattern variable. Both rules are active in the same containing scope, neither has priority, and both therefore yield valid immediate successors from the current state.

## R02

There is one unordered scope containing one rewrite rule and three current edges. The current edges are `(3, 26)`, `(3, 71)`, and `(4, 71)`. The rule matches `(3, ?0)` only when no `(4, ?0)` exists in the same rewrite scope under that binding. When enabled, it preserves `(3, ?0)` and adds `(5, ?0)`. Thus the negative condition is part of the rule rather than a separate fact.

## I01

The case contains two unordered child scopes to compare. The first contains `(12, 44, 71)`, `(39, 71, 85)`, and `(12, 63, 85)`. The second contains `(7, 90, 31)`, `(56, 31, 22)`, and `(7, 48, 22)`. Edge positions are significant and atom numbers are only opaque identities. Determine whether the two child scopes are structurally isomorphic under a bijective relabeling.

## I02

The case contains two outer child scopes to compare. The first child scope contains edge `(2, 10, 18)`, a nested scope containing `(31, 10, 47)` and `(52, 47, 66)`, and edge `(70, 66, 2)`. The second child scope contains edge `(96, 72, 83)`, a nested scope containing `(40, 69, 72)` and `(25, 54, 69)`, and edge `(83, 54, 11)`. Scope membership is unordered, edge positions are ordered, and atom labels are opaque. Determine whether the two child scopes are structurally isomorphic.

## N01

The case contains two unordered child scopes to compare. The first contains `(13, 26, 41)` and `(55, 41, 78)`. The second contains `(13, 41, 26)` and `(55, 41, 78)`. Edge positions are significant. Determine whether a bijective atom relabeling can make the scopes structurally identical.

## N02

The case contains two outer child scopes to compare. In the first, `(5, 19, 32)` is in the outer scope, `(44, 19, 57)` is alone inside a nested scope, and `(68, 57, 5)` is in the outer scope. In the second, `(5, 19, 32)` and `(44, 19, 57)` are both in the outer scope, while `(68, 57, 5)` is alone inside a nested scope. The edge incidences are otherwise the same. Scope boundaries are structural and must be preserved when deciding isomorphism.
