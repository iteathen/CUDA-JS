# F3 DriverActor conformance

**Status:** Accepted Windows F3W and platform-neutral lifecycle capsule

This capsule owns evidence for SPEC-0003:

- `run-mock.mjs` exercises the same facade and Worker protocol with a platform-neutral lifecycle backend;
- `run-native-windows.mjs` exercises the exact Windows x64 Driver/GPU profile and compares bounded Driver/device observations with accepted F2W evidence;
- `verify.mjs` checks the terminal evidence and claim limits;
- `evidence.mjs` owns evidence paths and hashing without entering runtime component code.

Evidence and binaries remain under ignored `build/f3/`. The mock establishes actor, protocol, registry, health, responsiveness, and loss behavior only. It never establishes CUDA ABI, Driver, GPU, or platform support.

Run `npm run f3:portable` on any exact Node 26.7.0 x64 development profile. Run `npm run f3` for the complete Windows native profile.
