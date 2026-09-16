# SPEC-0022 Addendum: GPU-resident Warp-32 Voting

**Status:** Accepted

Implementation authorized by project-owner approval of the issue #262 plan;
native qualification remains separate.

**Contract:** `SPEC-0022-warp32-v1`

## Owned meaning

CUDA-JS owns typed execution identity and collective predicate exchange within a
CUDA warp. This child extends SPEC-0013, SPEC-0022 and SPEC-0028 without adding a
runtime resource or scheduling owner. All helper execution and intermediate
results remain on device, including repeated calls inside a running kernel.
The host prepares, compiles and submits; it does not advance the collective.

## Device surface

```text
gpu.warp.width() -> u32
gpu.warp.laneId() -> u32
gpu.warp.ballot(participationMask: u32, predicate: bool) -> u32
```

Width is exactly 32. Lane identity is the linear block-thread index modulo 32,
with x varying fastest, followed by y and z. It is independent of grid position.
Ballot result bit n is set precisely when participating, non-exited lane n has a
true predicate. Bits outside the mask and exited lanes are zero. Every
participating caller receives the same result. Arguments are evaluated once.

Every caller must have its own bit set in the mask. Every named, non-exited lane
must execute the corresponding collective with the same mask. Masks and
predicates may be computed on device. A temporarily divergent lane is not an
exited lane. Partial warps must account for their actual participating threads.
Calling with a zero mask violates the caller-membership precondition.

This is trusted-source execution: syntax/types/targets are validated, but arbitrary
dynamic participation is not proved. A collective under a lane-dependent branch,
short-circuit expression, loop, or device-function call must still satisfy these
preconditions. Invalid participation has CUDA's undefined behavior and can hang;
there is no CPU repair, implicit mask inference, or host fallback.

Ballot synchronizes participating execution for predicate exchange. It supplies
no memory fence, acquire/release publication, shared-memory visibility guarantee,
block barrier, grid barrier, or promise of simultaneous independent-warp progress.

## Lowering and compatibility

The existing canonical CUDA target policy is authoritative. Its currently admitted
unsuffixed targets are all compute capability 7.5 or newer and support this profile.
Unknown targets reject before compiler dispatch; actual provider availability
continues to use existing compiler admission. Admission is not native support.

Width and lane identity lower privately to typed constants/index arithmetic.
Ballot lowers through a private static inline device function to
`__ballot_sync(mask, predicate) & mask`. No new header profile is necessary.
Existing explicit header options retain their normal semantics.

Using any warp helper selects the child contract. Append `+SPEC-0022-warp32-v1`
after the existing program or library contract, including existing numeric and
library-composition suffixes. Importing a warp-profile library selects the profile
even if the importing source contains no direct warp helper. Accept only an exact
existing contract with at most one trailing child suffix. Material profile facts
enter existing semantic/generated-source/compiler identities. Non-warp programs
retain their exact prior identities and generated source.

Library metadata conservatively advertises a warp-aware invocation requirement
for the entire library. Callers must satisfy each exported function's documented
collective preconditions; scalar signature compatibility alone is insufficient.
Existing public inspection reports direct helper usage and imported contracts;
it does not invent transitive per-function participation proofs.

## Qualification

Portable evidence covers strict typing, argument counts, target rejection,
deterministic identity, legacy stability, public inspection, mixed helper profiles,
and both PTX and Device-LTO leaf-library composition. An independent host oracle
constructs masks arithmetically from per-lane Boolean truth.

Native evidence must compare exact public-path results for every lane, uniform and
mixed predicates, sparse/disjoint masks, legal divergence/exits, partial warps,
multiple blocks and multidimensional blocks. A single submitted finite device loop
must consume ballots to compute subsequent ballots without host intermediate work.
Expected failures must reject without compiler work where statically detectable.
Do not launch deliberately invalid collectives. Existing resource owners must
terminate cleanly. Native evidence is specific to the exact revision/environment;
portable mocks do not execute collective semantics or establish performance.

## Exclusions

No active-mask query, shuffle, additional collective, shared/local-memory widening,
algorithm, data layout, work distribution, scheduler, automatic adoption, or
application-specific acceptance criterion is added.

## References

- [CUDA warp functions and participation constraints](https://docs.nvidia.com/cuda/cuda-programming-guide/05-appendices/cpp-language-extensions.html)
- [CUDA block-thread linearization](https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/writing-cuda-kernels.html)
