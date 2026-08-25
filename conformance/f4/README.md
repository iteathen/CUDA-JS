# F4 device-memory conformance and Linux handoff

**Status:** Accepted Windows F4W; OS-neutral F4 native runner source complete; Linux not-qualified

This capsule owns the evidence for [`SPEC-0004`](../../docs/specs/SPEC-0004-device-memory-foundation.md). It tests the same bounded policy, opaque resource, copied-byte, quota, range, lease, and teardown contract in two deliberately separate profiles:

- `run-mock.mjs` is a platform-neutral control-plane capsule. It proves owned-byte behavior and lifecycle but makes no CUDA or platform-support claim.
- `build-native.mjs` selects a thin Windows/MSVC or native-Linux/CC compile-link profile, verifies the platform's pinned CUDA header/library identity, and runs one shared independent C oracle.
- `run-native.mjs` exercises the five generated Driver exports through the shared DriverActor and compares its deterministic byte result with that oracle.
- `verify.mjs` verifies persisted ignored evidence under `build/f4/`.

Use `npm run f4:portable` on an exact Node 26.7.0 development profile. Use `npm run f4` only on a native Windows/Linux x64 Driver/GPU profile prepared for exact evidence; operation does not itself promote support.

## What Linux already has

The maintained Ubuntu CI job regenerates the expanded schema from the pinned CUDA 13.3.29 headers with native Clang, publishes the complete generated-product artifact, and rejects a checked-in difference. Native Linux CI also runs the memory manager, registry, actor protocol, byte mock, quota/range partitions, stale capability checks, teardown, and unexpected-loss accounting with exact Node 26.7.0.

This leaves a Linux contributor with shared control-plane code, imported signatures, reviewed semantics, deterministic generated files, portable tests, one shared native Driver backend with thin Windows/Linux discovery profiles, an independent C fixture, and exact expected observations. None of that substitutes for a native Linux NVIDIA Driver/GPU run.

## Native Linux qualification still required

Keep the Linux path present and complete these gates in order on a native Linux x86-64 host with an NVIDIA GPU exposed to the guest or host operating system:

1. Run `npm run exp:001:prepare` and preserve its unmodified readiness evidence. Do not install or replace a system Driver from repository automation.
2. Qualify canonical `libcuda.so.1` discovery. Reject arbitrary caller library paths, missing libraries, stubs used as runtime Drivers, and unsupported Node/platform identities.
3. Run the retained F2L Node/C Driver, device, procedure-version/status, permission, context, cleanup, and Worker-exit capsule. Linux memory work cannot bypass this prerequisite.
4. Run `npm run f4` unchanged. The shared runner compiles `native/memory-oracle.c`, uses the integrated `linux-native` profile, and preserves the same 4,096-byte fixture, patch, checksum, range/pressure, release, stale-generation, slot-reuse, teardown, and zero-terminal-resource controls as Windows.
5. Record exact Node executable identity, OS/kernel/ABI, Driver and toolkit/header identity, GPU and compute capability, selected library identity, C-oracle artifact identity, generated-product identities, results, cleanup, and claim limits.
6. Continue through F5–F8 and `npm run hardware:qualify` on the same clean exact host. Preserve binaries and evidence only in ignored `build/` storage.

Expected failure classes should be reported plainly: no GPU exposure, no real Driver, permission denial, Driver/toolkit incompatibility, unsupported Node build, symbol/version disagreement, context-currentness loss, byte mismatch, free failure, nonzero live/orphan inventory, or nonzero Worker exit. Do not weaken a check to make the host pass.

The public coordination point is [Linux qualification issue #4](https://github.com/iteathen/CUDA-JS/issues/4). A completing pull request should name the exact host profile, attach or summarize ignored evidence without committing machine-specific binaries, and limit its claim to the profile it actually ran.

## Current claim boundary

Windows F4W proves synchronous bounded device allocation and copied transfers only on the accepted Windows profile. The Linux runner is source-complete but unqualified until the exact Ubuntu chain passes. Portable or neighboring-platform evidence cannot promote it. Asynchronous copies, pinned/mapped/managed memory, modules, launch, completion, compiler integration, performance, packaging, and stable public API remain separate claims.
