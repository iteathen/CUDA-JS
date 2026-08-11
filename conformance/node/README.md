# Node Version Qualification

**Status:** Active operational conformance

This boundary owns the exact Node version registry, generated support list, and a portable subprocess probe for the experimental FFI and permission contract CUDA-JS requires.

Commands:

```text
npm run node:check
npm run node:render
npm run node:probe
```

`node:probe` is intentionally runnable by every exact release listed in the registry. It verifies version/module ABI, FFI flag availability, required public exports, denial without FFI authority, and progression to ordinary loader handling with explicit authority. It does not open CUDA and does not prove CUDA-JS support.

Only exact Node 26.7.0 is currently `qualified-experimental`. Other releases that pass the required FFI probe may operate as `testing-unconfirmed` without an opt-in until the complete synthetic and native qualification chain passes on that exact release. Node versions without the required FFI substrate are `known-incompatible` verified-negative profiles.

Raw probe logs stay in CI or ignored build storage. Public records omit paths, command lines, environment values, host names, and account identity.
