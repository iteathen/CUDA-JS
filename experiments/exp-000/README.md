# EXP-000 implementation

This directory owns the first code-bearing experiment in the accepted CUDA-JS plan. It qualifies the exact Node 26.7.0 `node:ffi` host substrate without CUDA.

The implementation is intentionally not a production runtime component. It contains:

- a declarative synthetic ABI case schema;
- deterministic Runtime IR, C fixture, and direct-C-oracle generation;
- a private Worker that alone owns `node:ffi`, the dynamic library, and raw pointers;
- opaque allocation capabilities with slot/generation validation;
- native parity, lifecycle, cleanup, permission, and responsiveness capsules;
- a source-derived static Fast FFI eligibility classification that makes no direct-JIT claim.

Canonical commands are exposed from the repository root:

```text
npm run exp:000:build
npm run exp:000:correctness
npm run exp:000:lifecycle
npm run exp:000:benchmark
npm run exp:000:case -- scalar.i8.identity
npm run exp:000
```

Set `CUDA_JS_NODE` to the official Node 26.7.0 executable, or place the portable distribution under the ignored `build/toolchains/` path diagnosed by `scripts/run-exp-000.mjs`.

Generated source is committed under `generated/` so it remains reviewable and reproducible. Native binaries, raw evidence, and benchmark samples live under ignored `build/exp-000/` and have an explicit per-run cleanup inventory.

Passing this capsule proves only the tested Node/OS/ABI/compiler profile. It does not prove CUDA behavior or guaranteed Fast FFI dispatch.
