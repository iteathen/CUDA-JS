# Specifications

**Status:** Informational

Current accepted implementation authority includes the foundational runtime specifications and accepted addenda under this directory. The current Device-JS numeric authority relevant to dependency-ready Tensor consumers is:

- [`SPEC-0013-restricted-device-js.md`](SPEC-0013-restricted-device-js.md) and [`SPEC-0013-public-surface-addendum.md`](SPEC-0013-public-surface-addendum.md) — restricted typed Device-JS authoring/lowering.
- [`SPEC-0028-device-js-library-composition.md`](SPEC-0028-device-js-library-composition.md) — typed Device-JS leaf-library composition.
- [`SPEC-0030-device-js-dense-numeric-profile.md`](SPEC-0030-device-js-dense-numeric-profile.md) — accepted additive dense numeric profile.
- [`SPEC-0030-erf-addendum.md`](SPEC-0030-erf-addendum.md) — accepted f32/f64 `gpu.math.erf` child.
- [`SPEC-0030-tanh-addendum.md`](SPEC-0030-tanh-addendum.md) — accepted composable f32/f64 `gpu.math.tanh` child, including canonical dense+erf+tanh identity required by a protected real Tensor consumer.

Other accepted specifications in this directory remain authoritative for their own bounded runtime/compiler/memory/execution/library profiles; proposal documents remain proposal-only and historical NN authority remains superseded by ADR-0007. Open issues, generated schemas, roadmap names and proposal text do not independently authorize production implementation.
