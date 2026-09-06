# CUDA-JS packaging

This directory owns package compatibility metadata and release boundaries for the no-addon ESM library. The `cuda-js@0.1.0-alpha.18` source package is available for alpha testing; npm publication has not occurred.

Node.js 26.1.0 or later is required. The package exposes the main runtime, compatibility inspection, and a mock-only testing entry point. Native execution also requires the experimental FFI flag and the selected Driver/toolkit profile.

- [Package definition](../package.json): version, exports, and included files.
- [Compatibility manifest](compatibility-manifest.json): exact capability and platform projection.
- [Prepared execution (SPEC-0020)](../docs/specs/SPEC-0020-prepared-batch-and-graph-execution.md) and [typed views (SPEC-0021)](../docs/specs/SPEC-0021-extended-numeric-abi-and-device-views.md): current package capabilities.
- [Package conformance](../conformance/f8/README.md): clean installation and public-consumer checks.
- [Hardware support](../docs/HARDWARE_SUPPORT.md): evidence and unqualified profiles.
- [Licensing](../LICENSING.md): project and third-party boundaries.

[ADR-0007](../docs/decisions/ADR-0007-extract-cuda-nn-semantic-product.md) keeps neural-network semantics in [iteathen/cuda-nn](https://github.com/iteathen/cuda-nn) and tensor mathematics in [iteathen/CUDA-JS-Tensor](https://github.com/iteathen/CUDA-JS-Tensor); these are not bundled CUDA-JS products.

Release preparation aims to establish reproducible package provenance and qualified compatibility. Current development and release limits are recorded in [STATUS.md](../STATUS.md).
