# CJS-F7 platform hardening conformance

**Status:** Accepted Windows F7W; native Linux x64 runner source complete; Linux/WSL qualification incomplete

This capsule implements SPEC-0007 without changing the CUDA execution surface. The portable partition validates host classification, malformed device facts, deterministic generated requests, injected failures, sanitized result/error boundaries, repeated actor lifecycles, responsiveness, and broad regression ceilings. The Windows partition queries device zero through DriverActor, reports CUDA's WDDM/TCC and kernel-timeout attributes, exercises both native actors repeatedly, and proves Node permission denial and explicit allow behavior.

## Windows engineer workflow

Use the repository's exact Node 26.7.0 executable and launch native work with experimental FFI enabled:

```powershell
npm run f7:unit
npm run f7:portable
npm run f7:native
npm run f7:verify
```

`npm run f7` runs the same sequence. Evidence is written under ignored `build/f7/win32-x64/evidence/`. A Windows result is acceptable only when both DriverActor and CompilerActor deny FFI without explicit permission, succeed with the documented FFI/Worker/filesystem capabilities, and every repeated native cycle reports balanced resources and Worker exit zero.

A `wddm-watchdog` result means CUDA reports a kernel execution timeout for device zero. It is diagnostic, not a safe-duration estimate. Do not disable the watchdog or change the driver model to make this test pass. A prohibited compute mode fails closed.

## Native Linux x86-64 handoff

Platform diagnostics assess copied native Linux x86-64 DriverActor descriptions through the same testing-unconfirmed contract as Windows, using a Linux-specific driver-model label. `run-native.mjs` now owns both thin platform profiles and preserves the same repeated Driver/compiler cycles, permission denial/allow controls, resource balance, Worker exit, and broad regression ceilings. This is runner readiness, not qualification.

Linux support remains present and incomplete. Work on a native glibc x86-64 machine with a real NVIDIA Driver and supported GPU; WSL cannot supply native Linux evidence. Start with the public issue and complete the retained F2L through F6L runbooks in order. Then:

1. Use exact Node 26.7.0 and run `npm run f7:unit`, `npm run f7:portable`, and `npm run f7:linux-readiness` unchanged.
2. Confirm the readiness record classifies the host as `linux-native-x64`, never WSL.
3. Complete F2L–F6L on the same workspace, then run `npm run f7:native` and `npm run f7:verify` unchanged. The runner exercises canonical `libcuda.so.1`, NVRTC, builtins, and nvJitLink providers; it does not accept stubs as a real Driver.
4. Record exact provider/Driver/device identity, balanced program/link resources, zero live/closing/orphaned graceful inventory, Worker exit zero, and permission denial/allow results without publishing allowed filesystem paths.
5. Continue through F8 and `npm run hardware:qualify`; update support only after the entire exact chain passes on the same profile.

Expected blockers are a missing device node, stub-only Driver, unsupported Node/provider identity, permission denial, ABI mismatch, context/currentness failure, compile/link mismatch, unproved destruction, nonzero resource inventory, Worker loss, or an unqualified virtualized environment. Report the exact blocker; do not turn a native gate into a mock pass.

## Native Linux ARM64 SBSA handoff

ARM64 is an independent target, not an inference from x86-64. A completing change needs:

1. an official ARM64 Node 26.7.0 identity and native glibc/SBSA host record;
2. hash-pinned CUDA ARM64 headers and providers;
3. independent C ABI size, alignment, field-offset, function-pointer, and calling-convention parity;
4. an ARM64 Runtime IR/platform profile rather than reuse of x86-64 layout claims;
5. canonical Driver, NVRTC, builtins, and nvJitLink discovery with exact versions and digests;
6. F2 through F6 device/context/memory/execution/compiler parity;
7. the complete F7 permission, failure, repeated-lifecycle, and terminal-cleanup evidence;
8. profile-keyed CI or qualified-host evidence and an honest support-matrix promotion.

The current `linux-native-arm64` classification means only that the host can begin this work.

## WSL2 handoff

WSL2 is a compatibility profile with Linux user-space semantics and a distinct Windows-host Driver bridge. A WSL2 contribution must stay separate from native Linux:

1. require classification as `wsl2-x64` and reject WSL1;
2. record Windows host, WSL kernel, Node, Driver bridge, provider, and GPU identities without exposing paths;
3. run independent Driver discovery, permission, context, memory, execution, compiler/linker/cache, failure, and terminal cleanup gates;
4. document host/guest update requirements and unsupported configurations for human operators;
5. publish evidence under a separate WSL2 profile key and make no native Linux claim.

## Pull-request checklist

- Keep Windows, native Linux x86-64, native Linux ARM64, and WSL2 evidence separate.
- Include source identities and exact environment/provider/device records.
- Preserve the fixed property seed and all negative controls.
- Include permission denial and explicit allow records without filesystem paths.
- Include repeated lifecycle terminal records and broad time/memory observations.
- Update SPEC-0007, the support matrix, system registry, status, next-step record, and public Linux issue together when a profile changes state.
- Do not weaken Windows or portable gates to accommodate missing Linux hardware.
