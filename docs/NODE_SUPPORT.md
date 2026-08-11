# CUDA-JS Node Version Support

**Status:** Informational

**Registry updated:** 2026-08-11

This list is generated from [`conformance/node/registry.json`](../conformance/node/registry.json). CUDA-JS support is an exact Node-version and host-profile claim. Upstream LTS status, a matching module ABI, or a successful `node:ffi` import does not establish CUDA-JS support.

The package currently declares exact Node 26.7.0. [Issue #23](https://github.com/iteathen/CUDA-JS/issues/23) coordinates additional qualification.

## Exact version matrix

| Node | Upstream phase | Module ABI | Required FFI probe | CUDA-JS status | Evidence disposition |
|---|---|---:|---|---|---|
| v26.7.0 | Current | 147 | must be available | **qualified experimental** | EXP-000 on Windows x64 and native Linux x64; Windows native F2W through F8W; exact qualified baseline |
| v26.6.0 | Current | 147 | must be available | **no support** | automated exact-version FFI/permission probe only; portable probe only full native chain absent |
| v26.5.1 | Current | 147 | must be available | **no support** | automated exact-version FFI/permission probe only; portable probe only full native chain absent |
| v26.5.0 | Current | 147 | must be available | **no support** | automated exact-version FFI/permission probe only; portable probe only full native chain absent |
| v26.4.0 | Current | 147 | must be available | **no support** | automated exact-version FFI/permission probe only; portable probe only full native chain absent |
| v26.3.1 | Current | 147 | must be available | **no support** | automated exact-version FFI/permission probe only; portable probe only full native chain absent |
| v26.3.0 | Current | 147 | must be available | **no support** | automated exact-version FFI/permission probe only; portable probe only full native chain absent |
| v26.2.0 | Current | 147 | must be available | **no support** | automated exact-version FFI/permission probe only; portable probe only full native chain absent |
| v26.1.0 | Current | 147 | must be available | **no support** | automated exact-version FFI/permission probe only; portable probe only full native chain absent |
| v26.0.0 | Current | 147 | must be unavailable | **no support** | automated exact-version negative probe; required node ffi substrate unavailable |
| v25.9.0 | End-of-life | 141 | must be unavailable | **no support** | automated exact-version negative probe; end of life and required node ffi substrate unavailable |
| v24.19.0 | Active LTS | 137 | must be unavailable | **no support** | automated exact-version negative probe; required node ffi substrate unavailable |
| v22.23.2 | Maintenance LTS | 127 | must be unavailable | **no support** | automated exact-version negative probe; required node ffi substrate unavailable |

## What the automated probe proves

For every listed exact release, CI verifies the version and module ABI, attempts `node:ffi` only through its required flag, checks the expected public exports, and—where FFI exists—checks permission denial without FFI authority and progression to ordinary loader handling with explicit authority.

A passing probe below Node 26.7.0 is deliberately still **no support**. Promotion additionally requires EXP-000 on each promoted host architecture and the complete native CUDA-JS hardware/profile chain on the same exact Node release.

## Promotion and invalidation

1. Add the exact official release to the machine registry with its expected module ABI and FFI disposition.
2. Pass the committed probe on every official target architecture.
3. Pass EXP-000 correctness, lifecycle, permissions, and cleanup on Windows x64 and native Linux x64.
4. Pass the full native CUDA-JS qualification chain for every promoted CUDA host profile.
5. Update package metadata, compatibility manifest, support list, evidence, and CI in one reviewed pull request.

Any Node version, module ABI, FFI API/flag/permission behavior, platform emitter, Worker behavior, or package-compatibility change invalidates the affected evidence. CUDA-JS does not infer support across patch releases.

## Official sources

- [node-distribution-index](https://nodejs.org/dist/index.json) — official exact release dates, archive availability, module ABI, and LTS metadata.
- [node-release-schedule](https://nodejs.org/en/about/previous-releases) — official release-line lifecycle.
- [node-26-changelog](https://github.com/nodejs/node/blob/main/doc/changelogs/CHANGELOG_V26.md) — official record that node:ffi entered Node 26.1.0.
- [node-ffi-26.7.0](https://github.com/nodejs/node/blob/v26.7.0/doc/api/ffi.md) — pinned experimental FFI and permission contract.
