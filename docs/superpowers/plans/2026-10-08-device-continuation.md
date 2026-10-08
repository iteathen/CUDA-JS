# Device-owned continuation implementation plan

**Status:** Informational

> Use inline execution with test-first owned leaves. No extra agents or commits.

**Goal:** Add an opaque lower-owned continuation candidate and qualify a finite
device-counter chain without host relaunches.

**Architecture:** Reuse Device-JS authoring, existing finite DAG validation,
DriverActor ownership and CudaOperation lifetime. Native graphs are a private
operation resource. Preserve the ordinary prepared-DAG realization.

**Spec:** `docs/specs/SPEC-0020-device-continuation-addendum.md`.

- [x] Test and implement closed zero-argument kernel-only tail helper, single
  call outside loops, controller metadata and private deterministic lowering.
- [x] Extract exact pinned CUDA 13.3 graph signatures/layouts with trusted Clang
  header parsing; generate reviewed graph-only FFI facts and packing products.
- [x] Falsify NVRTC built-in linkage before adding a trusted archive dependency;
  keep any required headers/archive/cache identity in CompilerActor.
- [x] Test and implement one-shot continuation submission, graph resource lifetime,
  ordinary-submit rejection, partial submission and terminal cleanup using
  existing ExecutionManager, protocol and facade.
- [ ] Execute finite 4/8-round public hardware capsule with exact result and
  mechanism counts, prove terminal cleanup, then run owning portable gates.
- [ ] Keep duration/platform support unqualified until independent review and
  exact bounded soak; retain evidence and hand off candidate Git state.
