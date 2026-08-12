# Third-Party Runtime Dependencies

**Status:** Informational

CUDA-JS intentionally keeps its runtime dependency surface small and explicit.

## Acorn

- package: `acorn`
- pinned version: `8.15.0`
- license: MIT
- upstream: Acorn JavaScript parser project
- role: syntax parsing only for the restricted Device-JS frontend defined by SPEC-0013
- transitive dependencies: none at the pinned version

CUDA-JS does **not** delegate Device-JS semantics to Acorn. Acorn produces an ESTree syntax tree from canonical source text; CUDA-JS independently fail-closes the accepted node/operator/helper/type subset and owns all typing, validation, CUDA lowering, diagnostics and identity semantics.

The package lock pins the exact registry tarball integrity. Parser name/version enters Device-JS program identity. Dependency upgrades require explicit review and portable conformance before promotion.

No third-party CUDA headers, CUDA providers or native binaries are bundled through this dependency.
