# CUDA-JS Status

**Status:** Informational

**Updated:** 2026-08-11

## Current phase

The project owner authorized dependency-ordered implementation and a Windows-first platform sequence. `CJS-F1A / EXP-000`, `CJS-F1B`, and Windows-only `CJS-F2W / EXP-012` are accepted. Windows `CJS-F3W` contract work is dependency-ready. Linux `CJS-F2L / EXP-001` now implements every available GPU-free preparation and diagnostic step, but remains incomplete until a qualified native Driver/GPU smoke passes; it no longer blocks Windows work.

## Promoted F1A result

EXP-000 independently passes on both required x64 profiles, Windows x64 and native Linux x86-64:

- Windows 10.0.26200 x64, official Node 26.7.0 with `--experimental-ffi`, and MSVC 19.50.35730;
- native Ubuntu 24.04.4 x86-64 under Hyper-V, Linux 6.8.0-137-generic, official Node 26.7.0 with `--experimental-ffi`, and GCC 13.3.0;
- 59 native-vs-JavaScript ABI correctness cases on each profile;
- 6 unit tests for packers, Runtime IR, and static eligibility;
- direct-C parity for scalar, pointer, out-parameter, table, natural/nested/union/pointer-field, and 16-byte-aligned storage;
- same-thread callback, resolver-only pointer-gap, permission, library-close, stale/cross-runtime, foreign-view, responsiveness, graceful shutdown, and unexpected Worker-loss capsules;
- zero live synthetic allocations at every graceful terminal inventory;
- separate benchmark samples with no direct Fast FFI or performance-support claim.

The Windows and Linux native binaries and raw evidence remain independently preserved in ignored `build/exp-000/` storage. The Linux evidence copy is under ignored `build/exp-000/linux-x64/evidence/`. Official Node archives were checksum-verified; system Node installations were not replaced.

## Accepted F1B result

The accepted schema/ABI foundation contains:

- hash-pinned official CUDA 13.3.29 Ubuntu 24.04 package, `cuda.h`, `cudaTypedefs.h`, package license, and Clang 18.1.3 identity;
- a deterministic Clang AST and macro-alias importer under the accepted schema-compiler contract;
- 12 reviewed private Tier-0 functions, including automatic `cuCtxCreate_v4`, `cuCtxDestroy_v2`, and `cuGetProcAddress_v2` alias resolution;
- 9 target types covering scalar, enum, opaque handle, structure, and out-parameter storage;
- generated Runtime IR, private Node FFI definitions, packers, TypeScript metadata, conformance/diff/coverage/compatibility data, and exact product hashes;
- 483 discovered Driver declarations, with all 471 unselected declarations cataloged unavailable;
- independent Linux x86-64 C size/alignment/offset probes;
- six detected mutation classes: size, alignment, field offset, parameter type, native symbol, and required semantic field;
- a second complete native generation matching committed products byte-for-byte.

The Windows and native Linux EXP-000 regressions remain green after F1B integration: 6 unit tests, 59 ABI correctness cases, lifecycle, responsiveness, and terminal cleanup per profile.

## Accepted Windows F2W result

EXP-012 passes on Windows 10.0.26200 x64 with official Node 26.7.0, MSVC 19.50, CUDA Toolkit 13.3.0, CUDA header/runtime input 13.3.29, NVIDIA Driver 610.74 exposing Driver API 13030, and a GeForce GTX 1660 Ti at compute capability 7.5.

The accepted result includes:

- Windows `cuda.h` hash-identical to the accepted F1B header;
- independent MSVC parity for all 9 selected layouts and 12 function-pointer widths;
- all 12 generated named exports bound from the canonical system Driver;
- all 12 public-name `cuGetProcAddress` queries returning success/status/non-null evidence;
- exact Node-versus-C parity for initialization, Driver version, one device, selected attributes, success error text, and context create/current/clear/restore/destroy;
- missing library, invalid flags, missing symbol, insufficient version, versioned query-name, permission denial/allow, stale wrapper, and cleanup controls;
- terminal null current context, closed DynamicLibrary, rejected stale wrapper, Worker exit zero, and no pointer values crossing the Worker boundary.

This result authorizes Windows F3 specification work, not production actor code by itself.

## Deferred incomplete Linux F2L

The Ubuntu Hyper-V VM remains useful for native Linux CPU/ABI work but has no NVIDIA GPU/Driver exposure. The host GTX 1660 Ti and client-Windows Hyper-V configuration do not provide a supported GPU partition/pass-through path. Windows results must never be labeled as Linux support.

`EXP-001` is nevertheless executable through the hardware boundary. On native Ubuntu 24.04 x86-64 it now:

- acquires and verifies exact official CUDA 13.3 header and Driver-stub packages;
- extracts them into ignored build storage without changing the system Driver;
- compiles and executes the native layout probe, compares every selected ABI fact, and compiles the independent C Driver oracle;
- diagnoses the exact Node/platform/WSL/library/device-node/`nvidia-smi` readiness state;
- provides the final real-Driver Node/C parity, symbol/version/permission, context, library, and Worker-cleanup runner;
- documents host prerequisites, commands, evidence, common failures, safety boundaries, and the completing pull-request checklist in [`experiments/exp-001/README.md`](experiments/exp-001/README.md).

GPU-free preparation passes in the available native Linux guest. The only unexecuted boundary is the real NVIDIA Driver/GPU smoke on a qualified native host.

## Claim limits

F1A proves the exact synthetic host-call profiles. F1B proves pinned facts, reviewed private semantics, deterministic products, and the measured Linux/Windows layouts stated above. F2W proves only the exact Windows bootstrap, Driver/GPU/query/context/permission/cleanup profile. It does not prove Linux, arbitrary returned-pointer invocation, Fast FFI dispatch, production DriverActor/resource behavior, memory, modules, launch/completion, performance, packaging, or consumer semantics.

## Immediate next boundary

The repository and exact F2W branch are published publicly through [draft pull request #5](https://github.com/iteathen/CUDA-JS/pull/5). Keep [Linux qualification issue #4](https://github.com/iteathen/CUDA-JS/issues/4) aligned with the retained runbook, then draft the detailed Windows F3 DriverActor/resource/lifecycle specification. Linux qualification can resume independently when suitable hardware becomes available.
