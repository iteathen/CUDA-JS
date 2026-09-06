# SPEC-0013 Addendum: Bounded Source and Syntax Admission

**Status:** Accepted

**Date:** 2026-09-05

**Issue owner:** #213

## Outcome

Correct the original restricted Device-JS frontend admission guards after a dependency-ready public Tensor leaf demonstrated that the initial internal source-byte and AST-node bounds reject a finite program already inside the accepted upstream TensorProgram size profile.

This addendum changes only two finite frontend admission bounds:

- Device-JS UTF-8 source bytes: **4,194,304 (4 MiB)**;
- Device-JS AST nodes: **1,048,576**.

The following accepted bounds remain unchanged:

- AST depth: 128;
- declared functions per unit: 64;
- imports per unit: 64;
- parameters per declared function: 64;
- all existing syntax, statement, expression, type, call-graph, recursion, return-completeness, helper, pointer, atomic/publication and metadata rules.

This is a bounded admission correction, not a general relaxation of restricted Device-JS.

## Evidence that requires the correction

The first frozen external Tensor consumer constructs one accepted 2,216-node TensorProgram, below CUDA-JS-Tensor's existing 4,096-node program ceiling. The resulting public SPEC-0009 leaf library contains one `tensorRunItem` export and measures:

- 1,669,789 Device-JS UTF-8 bytes;
- 340,902 AST nodes;
- maximum AST depth 37.

The exact protected pre-correction CUDA-JS frontend rejects this leaf first at the historical 1 MiB source guard. A disposable source-only bypass exposes the historical 20,000-node AST guard next. Raising those two guards, with depth and all semantic validation unchanged, allows the existing parser/type/lowering pipeline to reach CompilerActor; the separately accepted SPEC-0006 bounded-source addendum owns the corresponding compiler-source correction.

The accepted values are not copied from the observed consumer. The upstream TensorProgram contract already admits at most 4,096 nodes. Measured current lowering of the 2,216-node real program projects to roughly 3.1 MiB Device-JS source and about 630,000 AST nodes at that existing ceiling. The 4 MiB / 1,048,576-node profile therefore preserves finite domain-appropriate headroom while remaining explicitly bounded.

The AST limit is independently meaningful: compact pathological syntax can produce many AST nodes within the source-byte envelope. It is not merely a duplicate byte-count check.

## Admission contract

Before semantic lowering or compiler dispatch, restricted Device-JS MUST:

1. reject non-string, empty, NUL-containing or >4 MiB source with the existing `DEVICE_JS_SOURCE_*` failure family;
2. parse with the existing deterministic Acorn profile;
3. reject traversal beyond 1,048,576 AST nodes with `DEVICE_JS_AST_LIMIT`;
4. retain the existing depth limit of 128;
5. retain every existing function/import/parameter, syntax, type, call-graph and semantic validation rule;
6. preserve deterministic content-derived compatibility identity for admitted source.

Rejected source or AST complexity performs no CompilerActor/provider work.

## Qualification

Portable qualification must prove independently that:

- a valid kernel-bearing unit above the historical 1 MiB source value but below 4 MiB is admitted;
- source above 4 MiB is rejected with the revised finite maximum;
- valid kernel-bearing syntax materially above the historical 20,000-node AST guard is admitted;
- compact syntax above 1,048,576 AST nodes but below the source-byte maximum is rejected by the AST guard;
- all pre-existing Device-JS exact-byte, type, helper, library-composition, dense-numeric, atomic/publication, recursion and target-policy tests remain unchanged;
- no native/provider or physical CUDA support claim follows from portable frontend admission.

## Non-goals

No dynamic/unbounded source, parser replacement, new JavaScript syntax, extra Device-JS functions/imports/parameters, deeper ASTs, consumer semantics, Tensor semantics, provider tuning, performance claim, or library-composition change is introduced by this addendum.
