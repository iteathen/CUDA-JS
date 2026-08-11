# F4 device-memory conformance and Linux handoff

**Status:** Accepted Windows F4W; portable Linux preparation complete; native Linux CUDA incomplete

This capsule owns the evidence for [`SPEC-0004`](../../docs/specs/SPEC-0004-device-memory-foundation.md). It tests the same bounded policy, opaque resource, copied-byte, quota, range, lease, and teardown contract in two deliberately separate profiles:

- `run-mock.mjs` is a platform-neutral control-plane capsule. It proves owned-byte behavior and lifecycle but makes no CUDA or platform-support claim.
- `build-native-windows.mjs` compiles and runs an independent MSVC program against the accepted CUDA 13.3 header and import library.
- `run-native-windows.mjs` exercises the five generated Driver exports through the DriverActor and compares its deterministic byte result with the C oracle.
- `verify.mjs` verifies persisted ignored evidence under `build/f4/`.

Use `npm run f4:portable` on an exact Node 26.7.0 development profile. Use `npm run f4` for the qualified Windows x64 Driver/GPU profile.

## What Linux already has

The maintained Ubuntu CI job regenerates the expanded schema from the pinned CUDA 13.3.29 headers with native Clang, publishes the complete generated-product artifact, and rejects a checked-in difference. Native Linux CI also runs the memory manager, registry, actor protocol, byte mock, quota/range partitions, stale capability checks, teardown, and unexpected-loss accounting with exact Node 26.7.0.

This leaves a Linux contributor with shared control-plane code, five imported signatures, reviewed semantics, deterministic generated files, portable tests, a Windows adapter that demonstrates the intended backend boundary, an independent C fixture, and exact expected observations. None of that substitutes for a native Linux NVIDIA Driver/GPU run.

## Native Linux work still required

Keep the Linux path present and complete these gates in order on a native Linux x86-64 host with an NVIDIA GPU exposed to the guest or host operating system:

1. Run `npm run exp:001:prepare` and preserve its unmodified readiness evidence. Do not install or replace a system Driver from repository automation.
2. Qualify canonical `libcuda.so.1` discovery. Reject arbitrary caller library paths, missing libraries, stubs used as runtime Drivers, and unsupported Node/platform identities.
3. Run the retained F2L Node/C Driver, device, procedure-version/status, permission, context, cleanup, and Worker-exit capsule. Linux memory work cannot bypass this prerequisite.
4. Add a `linux-native` DriverActor adapter beside `windows-native.mjs`. It must use the same generated definitions and the same `MemoryManager`; platform code should own only canonical library discovery, private native calls, context-currentness checks, and error translation.
5. Bind exactly `cuMemGetInfo_v2`, `cuMemAlloc_v2`, `cuMemFree_v2`, `cuMemcpyHtoD_v2`, and `cuMemcpyDtoH_v2`. Do not add public symbol or signature selection.
6. Compile `native/windows-memory-oracle.c` as a Linux oracle or add a minimal sibling that keeps the same 4,096-byte fixture, 257-byte patch at offset 777, checksum algorithm, capacity observation, explicit free, context destroy, and current-null records. Platform conditionals are acceptable; divergent semantics are not.
7. Run the same exact-edge, out-of-bounds, configured-pressure, explicit-release, stale-generation, slot-reuse, allocation-before-context teardown, and zero-terminal-resource controls. A rejected range must be shown not to invoke the Driver.
8. Record exact Node executable identity, OS/kernel/ABI, Driver and toolkit/header identity, GPU and compute capability, selected library identity, C-oracle artifact identity, generated-product identities, results, cleanup, and claim limits.
9. Run `npm run verify`, `npm run f3:portable`, `npm run f4:portable`, the completed native F2L/F3L/F4L capsules, and the pinned native schema regeneration. Preserve binaries and evidence only in ignored `build/` storage.

Expected failure classes should be reported plainly: no GPU exposure, no real Driver, permission denial, Driver/toolkit incompatibility, unsupported Node build, symbol/version disagreement, context-currentness loss, byte mismatch, free failure, nonzero live/orphan inventory, or nonzero Worker exit. Do not weaken a check to make the host pass.

The public coordination point is [Linux qualification issue #4](https://github.com/iteathen/CUDA-JS/issues/4). A completing pull request should name the exact host profile, attach or summarize ignored evidence without committing machine-specific binaries, and limit its claim to the profile it actually ran.

## Current claim boundary

Windows F4W proves synchronous bounded device allocation and copied transfers only on the accepted Windows profile. The portable capsule proves shared logic only. Native Linux CUDA, asynchronous copies, pinned/mapped/managed memory, modules, launch, completion, compiler integration, performance, packaging, and stable public API remain unclaimed.
