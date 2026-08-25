# F3 DriverActor conformance

**Status:** Accepted Windows F3W; native Linux F3L adapter and exact runner implemented but not yet qualified

This capsule owns evidence for SPEC-0003:

- `run-mock.mjs` exercises the same facade and Worker protocol with a platform-neutral lifecycle backend;
- `run-native-windows.mjs` exercises the exact Windows x64 Driver/GPU profile and compares bounded Driver/device observations with accepted F2W evidence;
- `run-native-linux.mjs` exercises the same shared Driver backend through canonical native Linux library discovery and compares it with same-workspace EXP-001/F2L evidence;
- `verify.mjs` checks the terminal evidence and claim limits;
- `evidence.mjs` owns evidence paths and hashing without entering runtime component code.

Evidence and binaries remain under ignored `build/f3/`. The mock establishes actor, protocol, registry, health, responsiveness, and loss behavior only. It never establishes CUDA ABI, Driver, GPU, or platform support.

Run `npm run f3:portable` on any exact Node 26.7.0 x64 development profile. Run `npm run f3` for the complete retained Windows native profile. On the exact native Ubuntu 24.04 NVIDIA cell, first pass `npm run exp:001:smoke`, then run `npm run f3:native`. Source and runner presence alone do not qualify F3L.
