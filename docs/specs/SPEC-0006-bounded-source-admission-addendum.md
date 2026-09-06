# SPEC-0006 bounded-source admission addendum

**Status:** Accepted implementation profile
**Date:** 2026-09-05
**Parent:** SPEC-0006
**Issue:** #213

## Outcome

Correct the initial CompilerActor source-text bound after a dependency-ready public Tensor consumer demonstrated that the original 1 MiB limit rejects a finite, valid generated compile unit before provider work.

This addendum changes only the admitted UTF-8 byte length of one compile request's primary `source` field:

- previous initial profile: 1,048,576 bytes;
- accepted corrected profile: **4,194,304 bytes (4 MiB)**.

All other SPEC-0006 compiler and linker bounds remain unchanged unless separately accepted and qualified. In particular this addendum does not widen header count/bytes, total header bytes, linker input count/bytes, artifact bytes, compiler log bytes, target policy, provider discovery, cache ownership, public-record copying, error sanitization, actor serialization, or lifecycle semantics.

## Evidence that requires the correction

The first frozen external Tensor consumer constructs one accepted finite TensorProgram with 2,216 nodes, inside CUDA-JS-Tensor's existing 4,096-node program ceiling. Its public item-callable lowering produces:

- 1,669,789 bytes of restricted Device-JS source;
- 340,902 syntax-tree nodes at maximum depth 37;
- 1,326,824 bytes of generated CUDA source submitted to CompilerActor.

The exact protected pre-correction CUDA-JS pair rejected that generated CUDA source with `COMPILER_SOURCE_INVALID` because the original 1 MiB bound was smaller than the valid compile unit. A disposable consumer-side experiment changed only finite admission guards and proved that a 4 MiB CompilerActor source bound, together with the separately owned Device-JS admission correction, allows the existing parser/type/lowering/compiler pipeline to complete without changing model, Tensor, provider, or execution semantics.

The 4 MiB bound is not copied from the observed 1.33 MiB compile unit. It retains finite headroom for the already accepted upstream Tensor program-size profile while remaining far below the existing 64 MiB artifact and aggregate linker-input bounds.

## Admission contract

`normalizeCompileRequest()` MUST:

1. reject non-string, empty, or NUL-containing source exactly as before;
2. measure UTF-8 bytes before CompilerActor/provider dispatch;
3. accept source whose UTF-8 byte length is at most 4,194,304;
4. reject source above 4,194,304 with `COMPILER_SOURCE_INVALID`, retaining bounded `byteLength` and `maximum` details;
5. copy and hash admitted source exactly as before so cache and compatibility identity remain content-derived rather than size-derived.

Rejected oversized source performs no NVRTC/provider work.

## Device-JS coordination boundary

This addendum does not itself authorize Device-JS frontend changes. Restricted Device-JS remains governed by SPEC-0013 and its addenda. Issue #213 separately demonstrates that its original internal 1 MiB source / 20,000-node guards reject the same finite leaf before CompilerActor. The Device-JS correction must preserve finite source/syntax/function/import/parameter/depth/call-graph/type bounds and must not weaken validation merely to reach this compiler profile.

## Qualification

Portable qualification must prove:

- source above the historical 1 MiB value but below 4 MiB normalizes deterministically;
- source above 4 MiB fails closed before provider dispatch;
- all pre-existing CompilerActor request, cache, lifecycle, target, header and public-record tests remain unchanged;
- no native/provider or physical CUDA support claim follows from portable source admission.

## Non-goals

No dynamic/unbounded source size, provider-specific tuning, native support promotion, performance claim, Tensor semantics, consumer identity, model identity, or library-composition change is introduced by this addendum.
