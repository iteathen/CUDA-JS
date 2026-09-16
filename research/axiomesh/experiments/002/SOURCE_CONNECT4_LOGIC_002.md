# Connect4 normalized logic source — Experiment 002 snapshot

This is a copied logical snapshot for AxiomeSH Experiment 002. It does **not** replace or mutate Connect4 authority.

- Source: `iteathen/Connect4`
- Branch: `research/unified-knowledge`
- Commit: `0e5e29e4ca4fd3941bdcffe70a52b66348705589`
- Research direction: Josh Oshiro

The source program asks how much Connect4 game-theoretic consequence can be derived from winning-line geometry, residual requirements, support/reachability, ownership, timing, blockers, compatibility and their composition before ordinary recursive game-tree search is required.

The canonical flow is:

`geometry/win-space -> relations/reachability -> predicates -> composition -> quotient/reduction -> exact consequence -> unresolved residue -> solver mechanism`

The main unresolved bridge is guarded composition/closure: local exact facts do not yet constitute a complete global calculus.

## Normalized claim corpus

### C4-R0001 — research_model
Winning structures are first-class research objects. Reason about Connect4 through possible winning structures and their relations in addition to ordinary board-state/game-tree representation.

### C4-R0002 — deductive_exact
Exact derivative structure of Connect-k line geometry. Directional winning-line counts and finite differences admit exactly derivable interior and boundary structure.

### C4-R0003 — guarded_exact
Playable own singleton is immediate terminal win. A legal playable cell completing the current player's unblocked singleton-residual winning line yields a terminal win one physical ply later. Guards: completion cell legal/playable; line unblocked for current player; position not already terminal.

### C4-R0004 — guarded_exact
Distinct multiple opponent immediate completions force loss. At least two distinct legal playable opponent completion cells force loss when the current player has no earlier terminal win. Guards: completion cells distinct and playable; current player has no immediate terminal win first.

### C4-R0005 — guarded_exact
Unique opponent immediate completion forces reply but not terminal value. Exactly one legal immediate opponent completion forces a blocking reply, but does not alone determine final game value.

### C4-R0006 — accepted_contract
Exact structural certificates precede heuristic horizon evaluation. Apply accepted exact structural certificates before heuristic evaluation at the horizon.

### C4-R0007 — accepted_contract
Unresolved structural residue remains delegated solver work. States not decided by accepted exact certificates or valid reductions remain unresolved and must be delegated to solver/evaluation mechanisms.

### C4-R0008 — accepted_contract
Semantic quotient requires behavior preservation. A quotient may collapse distinctions only under an explicit equivalence preserving behavior relevant to target semantics.

### C4-R0009 — guarded_exact
Dead residual win-space implies exact draw. If neither player has any residual unblocked winning line in a legal nonterminal state, neither can later win and game-theoretic value is draw. Guards: legal state; nonterminal; no residual unblocked line for either player.

### C4-R0010 — empirically_supported / deferred
Dead-residual hot-state maintenance is not justified on the measured workload. The investigated incremental live-counter detector incurred transition/runtime cost while the measured campaign found effectively no useful pruning incidence. This qualifies implementation value, not theorem R0009.

### C4-R0011 — missing_law
Complete structural calculus lacks composition and closure laws. Current local exact predicates are insufficient for a complete derivation system; explicit composition/closure laws over structural relations remain missing.

### C4-R0012 — candidate_rule
Higher derivative and periodic-annihilator structure may yield semantic predicates. Exact geometric derivative structure may support higher-order semantic predicates, but game-theoretic closure/sufficiency is not established.

### C4-R0013 — hypothesis
Perfect-play win-set support/DAG structural experiment family. Support/DAG experiments investigate initial-board and support-structure invariants that may characterize reachable winning-space quantities without ordinary recursive search; numerical generalizations remain to be normalized.

### C4-R0014 — guarded_exact
CPC event-rank parity arithmetic. Under the stated support/height model, future event count reduces to `N(t)=(W-1)H-ply+r+1`; target-column height cancels and ownership parity follows from event rank. On standard 7x6 `(W-1)H=36` is even. Guards: standard gravity support model; CPC event definition; ownership claim limited to modeled event.

### C4-R0015 — deductive_exact
WSL-625 residual-requirement universe. The 69 standard 7x6 geometric winning lines induce 625 unique nonempty residual winning-requirement masks under the documented construction, permitting a fixed u16 requirement-ID universe.

### C4-R0016 — empirically_supported
Generic blocker upward closure reproduces tested Allis solved-group semantics. Across 331,955 generated A1-A9 rule instances, generic blocker/upward closure produced zero solved-group mismatches. Scope: generated comparison corpus only; not universal strategic compatibility proof.

### C4-R0017 — disproven
Race-free nested ownership inference is unsound. Eventual ownership/blocker satisfaction alone is not sufficient for a nested proof; temporal race order can let the opponent complete first.

### C4-R0018 — hypothesis
Nested Dependency Closure with temporal precedence may replace explicit move-tree proof. A recursive proof grammar over ownership, response obligations, blockers, support and temporal/event precedence may derive long-horizon consequences without enumerating every intervening state.

### C4-R0019 — empirically_supported
Tested WDL proofs are dramatically smaller than their physical state graphs. Cited proof DAGs contain 9, 17, 16, 21 and 38 nodes for tested controls/roots despite much larger physical graphs. Scope: tested games/roots, not a universal bound.

### C4-R0020 — empirically_supported
Direct BSFP matches exhaustive small-game WDL controls. Backward symbolic recurrence matched every reachable physical state in four complete small-game controls (1,681,808 states; 3,869,237 legal edges; zero WDL disagreements) and correct sign on eight frozen standard-7x6 roots. Not an empty-board 7x6 completion claim.

### C4-R0021 — empirically_supported
Terminal winning-line boundary independently qualified on complete controls. Checks covered 1,634,924 nonterminal states, 3,869,237 legal edges, 414,691 winning terminal edges and 96,960 full-board draws with zero predicate/reconstruction/post-terminal mismatches.

### C4-R0022 — empirically_supported
Generic raw-ownership BSFP representation does not yet scale to empty standard 7x6. Current evidence identifies representation width as the engineering bottleneck rather than falsifying the tested backward recurrence.

### C4-R0023 — empirically_supported
Identified-line quotient is exact on tested complete controls. `Q=(support,H0,H1)` matched physical terminal detection, successor signatures, reachable quotient classes, bottom-up WDL and roots across four complete controls with zero mismatches over 1,681,808 physical nonterminal states. Production 7x6 remains research.

### C4-R0024 — empirically_supported
Behavioral minimization removes support/rank distinctions on tested quotient. MQ2 reduced 420,704 identified-line classes to 269,347 exact behavioral classes, including classes crossing support and rank boundaries; raw support/rank history is not irreducible under tested action-labeled future semantics.

### C4-R0025 — empirically_supported
Residual antichains require support/accessibility in tested exact quotient. Minimal residual winning-requirement antichains paired with support were exact on bounded complete controls, while support-free residuals failed.

### C4-R0026 — empirically_supported
Direct semantic residual automaton replay is exact on bounded controls. The repaired MQ4 automaton was serialized, decoded, traversed through actual encoded transitions, solved bottom-up and checked for mismatches/orphans; bounded controls passed with zero mismatches.

### C4-R0027 — empirically_supported
MQ5 semantic residual state reduces exact proof volume on frozen anchors. Exact scores were preserved while proof nodes fell about 22.48% on the loss anchor and 21.34% on the win anchor versus the cited strong board-state control.

### C4-R0028 — empirically_supported
Typed exact MQ5 interning preserves semantic identity and improves measured runtime. Full-record equality remained identity authority while hashes only selected slots; exact score/proof/cache metrics were preserved and medians were about 1.493x and 1.571x faster on the two anchors.

### C4-R0029 — empirically_supported
Role-general A1-A3/U1 certificates qualify on tested exact controls. U1 event-rank parity had zero owner/rank/delta mismatches over 2,750 states, 61,416 targets and 798,408 deltas; role-general A1/A3 plus Baseinverse had zero false claims on 96 exact roots.

### C4-R0030 — empirically_supported
Geometry-native A123 substantially reduces MQ5 proof volume on frozen anchors. Exact results were preserved while proof nodes fell from 786,581 to 557,605 (29.11%) on the loss anchor and 4,138,812 to 3,161,623 (23.61%) on the win anchor; runtime benefit was workload-dependent.

### C4-R0031 — disproven
Blanket resource-overlap exclusion is too strict for Allis compatibility. U1 Test B V2 rejected 10,938 pairs that the Allis compatibility oracle allowed among 695,232 comparisons; false negatives localized to the A5/A6 with A1 boundary-sharing seam.

### C4-R0032 — candidate_rule
Generic interval compatibility matches the Allis allowed set but extra pairs remain unproved. V3 accepted all 359,512 Allis-table-allowed pairs with zero false negatives while also accepting 82,367 extra pairs whose soundness is not established.

### C4-R0033 — empirically_supported
ZPAR singleton-pair rule is only narrowly qualified. It matched 112 qualified exact states across cited singleton-threat classes and mirrors, but is not a general Zugzwang terminalizer and `WO_BO_diff` remains unresolved.

### C4-R0034 — empirically_supported / deferred
Support-compatible implication transfer is proof-positive but runtime-negative in tested forms. Exact RID-closure implication reproduced proof reduction; SIG4/INDEX8 reduced comparison work but remained slower than no-IMPL. The mechanism is not falsified; current forms are deferred pending stronger-stack marginal-value tests.

### C4-R0035 — accepted_contract
Research evidence must separate mechanism, implementation form, workload, stage order, synergy and adoption. Promotion metadata must not bias epistemic assessment; missing interaction edges mean unassessed, not neutral; invalid harnesses are not evidence against the parent mechanism.

### C4-R0036 — empirically_supported
Typed MQ5 and geometry-native A123 compose without losing qualified proof-volume reduction. On two frozen anchors the composition preserved exact root scores and the full-A123 node counts (557,605 and 3,161,623); timing changed sign by workload (about +6.1% / -6.2%).

### C4-R0037 — disproven
Tested legacy/even-ply A9 responder orientation is unsound. The tested orientation produced three false no-win claims; all observed false claims depended on A9, and disabling A9 removed them on the same sample. This does not falsify Allis's published A9 family or every role-general A9 formulation.

### C4-R0038 — empirically_supported
A4 and A8 add sampled exact cover beyond A123 while A6 is saturated in the A9-disabled regime. Conservative composition produced 84 oracle-confirmed claims vs 49 A123 claims; A8 and A4 had distinct marginal contributions; A6 had zero marginal value in this regime only.

### C4-R0039 — empirically_supported
Ownership-antichain BSFP is smaller and faster than raw-ownership MTBDD on measured complete controls. Representation reduction was 40.0%–86.6% and measured speedup 1.220x–3.041x on four small-game controls. Performance is implementation/geometry dependent.

### C4-R0040 — guarded_exact
Root-only WDL BSFP admits exact rolling two-rank execution. For a one-move WDL recurrence, rank `r` depends only on completed rank `r+1`; older ranks can be discarded when only the root is requested. Guards: one-cell rank advance; child rank complete first; root-only output; no auxiliary rule depends on discarded state.

### C4-R0041 — rejected
Streaming no-sort BigInt dominance reducer is rejected in its tested form. Exact semantics were preserved but 5x5 runtime regressed to 73.806 s vs 62.486 s and 58.326 s controls. The antichain/dominance mechanism itself is not rejected.

### C4-R0042 — empirically_supported
Line-hit product antichains exactly represent tested BSFP symbolic Win/Loss boundaries. In `Q=(support,H0,H1)` with the stated P0-favorable product order, minimal Win and maximal Loss pairs reproduced tested symbolic classifications with zero conflicts/false/missing coverage. This does not establish a direct recurrence.

### C4-R0043 — missing_law
Direct line-product recurrence requires a realizability-preserving closure law. Arbitrary `(H0,H1)` pairs are not legal because support-local realizability correlates the masks. Needed: a compact predecessor/composition representation preserving realizability while supporting move preimages, terminal subtraction, and existential/universal move composition without reconstructing ownership assignments.

### C4-R0044 — empirically_supported
Residual-pair cofactor work can be exactly reused across crossing occurrences on tested OQS fixtures. Each residual-pair/input cofactor was computed once and mapped to all crossing occurrences with zero mismatches/complete coverage; the 7x6 fixture showed 54.384x smaller factored arrays and 7.904x lower median submit/wait, while tiny 4x4 did not speed up.

### C4-R0045 — empirically_supported
Measured BSFP scaling wall is compute/frontier manipulation before retained-memory exhaustion. Larger tested geometries timed out while retained host/device memory remained well below capacity; current evidence points first to candidate/frontier/normalization work rather than retained-memory capacity.

### C4-R0046 — deductive_exact
Terminal subtraction has an exact antichain frontier form. Over finite ownership universe `U`, removing an upward family generated by requirement `q` from a downward-closed family equals intersection with its complement, whose maximal generators are `U\{x}` for `x in q`; the dual operation holds for upward-closed families. Guards: finite subset universe; stated frontier orientation; exact normalization semantics.

### C4-R0047 — deductive_exact
Perfect W/D/L terminal-line support has an exact set-valued game algebra. For fixed line universe `Lambda`, `G(s)` is the set of first-player terminal winning lines reachable on at least one W/D/L-perfect continuation, empty if P0 cannot force a win. At P0 nodes `G` is child union. At P1 nodes `G` is empty if any legal child is empty, otherwise union of all child sets. Guards: finite deterministic alternating zero-sum first-win game; W/D/L-only optimality; projection records P0 terminal-line labels only.

### C4-R0048 — empirically_supported
The preserved coarse W/D/L-only empty-7x6 oracle experiment reports 61 P0 terminal-line identities. Because all losing P1 replies tie under W/D/L-only semantics, support includes faster strategically inferior losses excluded by distance-sensitive semantics. This is not the distance-optimal set.

### C4-R0049 — empirically_supported
Distance-sensitive optimal play on empty 7x6 has exactly 28 P0 terminal winning-line identities. Under strong best-move ordering (W/D/L first, fastest P0 win and longest P1 resistance), exactly 28 geometric lines occur; all witnesses terminate ply 41; set composition 12 vertical, 8 horizontal, 8 diagonal. Scope: standard 7x6 and cited ordering; not a searchless derivation.

### C4-R0050 — deductive_exact
Total-domain incidence decomposition derives the standard structural common-core dimension 28 without solved play. For K=4, `rank(B)=WH-pq+d` and `dim ker(B)=3ab-d` with the stated definitions; exact axis/gravity phase quotients define `Y_cell` and `Y_line`. On 7x6: `rank(B)=35`, kernel dimension 34, axis rank 7, phase rank 6, `Y_cell=Y_line=28`, without W/D/L or optimal-move premises.

### C4-R0051 — deductive_exact
The standard maximal-delay rank-5 envelope has a searchless 38-to-28 extremal refinement. On 7x6, P0's latest parity-compatible terminal capacity is ply 41, giving a 38-line envelope. At preterminal rank 5 every legal five-ply prefix excludes at most ten candidates; the maximum ten is uniquely realized by the five-high reflection-fixed center stack, leaving 28. This does not assume optimal play selects that prefix/horizon.

### C4-R0052 — missing_law
Distance-optimal center/deadline selection remains the missing bridge from structural 28 to optimal terminal 28. Searchless theory does not prove that distance-optimal play selects and preserves the unique phase/impact center or forces longest resistance to the maximal-delay boundary. Leading candidate: deadline-valued CPC/NDC closure over support, response resources, phase transport, blockers and completion horizons.

### C4-R0053 — deductive_exact
Core balance plus unique initial requirement impact isolates 7x6 in the regular K=4 family. Gravity-oriented core balance `Delta(W,H)=(W-4)(2H-9)-9=0`, combined with unique maximum initial requirement incidence at width 7, forces `H=6`; 7x6 is unique in the regular K=4 family with both properties and common core dimension 28.

### C4-R0054 — guarded_exact
Terminal ply yields a sound board-specific gravity support upper bound; 6x7 equals 30 only at this layer. With distance-optimal terminal move `T`, `N=WH`, `q=N-T+1`, `t=max(0,H-q)`, every newly completed terminal line touches a gravity-legal final landing at row `>=t`, so `U_support(W,H,T)=G(W,H)-G(W,t)`. Using external `T=41` for 6x7 gives upper bound 30, not an exact terminal census.

### C4-R0055 — disproven
Static equality between minimum surviving maximal-delay envelope and `Y_cell` is not a sufficient optimal-play selector. 8x7 also gives `46-6=40=Y_cell`; scalar equality does not characterize the standard 7x6 optimal terminal geometry.

### C4-R0056 — empirically_supported
The oracle 28-line coordinate set is not the standard common structural Y object. For external optimal set `E_opt`, `dim(E_opt)=28` but incidence-image dimension is 26; intersection with qualified line core is dimension 2 and cell-image intersection with `Y_cell` is 20, with six axis-boundary image dimensions. Exact filtration `28=2+20+6`; equal cardinality does not imply identity/basis equivalence.

### C4-R0057 — deductive_exact
Connect-K winning-window derivative multiplicity is governed exactly by `v2(K)`. Over F2, if `K=2^s m` with odd `m`, then `S_K(T)=(1+T)^(2^s-1) S_m(T)^(2^s)` and finite-difference multiplicity is `2^(v2(K))-1`. Pure derivative iff K is a power of two; Connect-4 is the smallest nontrivial pure higher-derivative case. Scope: line-incidence geometry only, not game value/control.

### C4-R0058 — deductive_exact
K=4 axis derivative algebra derives the diagonal incidence constraints. With `X=partial_x`, `Y=partial_y`, `X^3=Y^3=0`, `XY=YX`; rising diagonal yields `XY^2+X^2Y=0`, and falling diagonal adds `X^2Y^2=0`. The 4x4 defect is a boundary realization, not an independent axiom. Pair incidence has first-derivative shape but causal response needs gravity/support/resource/deadline guards.

### C4-R0059 — deductive_exact
Regular Connect-4 incidence cokernel is a seven-mode 4-periodic binary tile code. One-axis annihilators are 4-periodic even-parity blocks (`[4,3]` SPC code `P`); horizontal/vertical annihilators form `P tensor P` of dimension 9; two diagonal constraints remove two modes, leaving seven-dimensional periodic code `C4_ann`. On sufficiently regular boards `dim coker(B)=7`, `rank(B)=WH-7`. Geometry only; no gravity/turn/blocker/reachability/stopping/game value.

## Open logical seams copied from the source

1. Complete guarded composition law over ownership, blocker, support, parity, race and local certificates (`R0011/R0018`).
2. Prove/falsify the 82,367 generic compatibility extras (`R0032`).
3. Resolve `WO_BO_diff` for narrow ZPAR (`R0033`).
4. Determine whether NDC eliminates response selection or only compresses it.
5. Find a compact exact representation of coarsest useful behavioral semantics.
6. Replace raw BSFP ownership with a structurally factored exact predecessor representation for empty 7x6 (`R0022`).
7. Determine which exact geometric derivative invariants induce game-semantic predicates (`R0012`, `R0057..R0059`).
8. Retest implication transfer only on strongest current exact stack (`R0034`).
9. Preserve realizability/correlation in direct line-hit recurrence (`R0043`).
10. Prove the center/deadline selection theorem connecting structural 28 to distance-optimal terminal 28 (`R0052`).

## Explicit source controls for the 28-selection problem

- 6x7 separates terminal-support upper bound `30` from `Y_cell=28`, `Y_line=29`.
- 8x7 satisfies a misleading static equality `minimum survivors = Y_cell = 40`.
- The external optimal 28-line set is not simply the common structural Y object.

A valid selection law must handle these controls without a standard-board special case.