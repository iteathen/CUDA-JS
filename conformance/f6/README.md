# CJS-F6 compiler, linker, cache, and handoff conformance

The F6 capsule separates three claims:

- portable request normalization, cache keying, corruption rejection, exact invalidation, Worker responsiveness, and lifecycle behavior;
- accepted exact Windows CUDA 13.3 NVRTC/nvJitLink ABI, independent C artifact parity, and PTX/cubin Driver execution;
- implemented but unqualified native Linux source: an official-package-pinned provider manifest, exact readiness probe, independent C build, public CompilerActor parity, Driver handoff, and terminal cleanup assertions.

Run `npm run f6:portable` on any exact Node 26.7.0 qualification host. On native Linux x86-64, `npm run f6:linux-readiness` verifies only the exact manifest-pinned provider files, ELF identity, required version exports, and Linux option profile. `npm run f6:linux-build` builds and runs the independent C oracle. `npm run f6:native` platform-selects the Windows or Linux baseline and requires the exact provider, Driver, and GPU environment; Windows additionally runs its accepted RDC/LTO capability suite. Generated artifacts and evidence stay under ignored `build/` storage.

The native Windows lane includes the promotion suites for SPEC-0010 relocatable device code and SPEC-0012 Device LTO. An independent C oracle compiles two RDC PTX units and two LTO-IR units with the exact normalized native options, links both pairs, loads both cubins through the CUDA Driver, records exact outputs, and proves program/link/Driver cleanup. The public-facade lane repeats the same compilation and linking, requires byte-for-byte parity for all six compiler artifacts and both GPU outputs, checks default PTX stability and raw/mixed/corrupt/incompatible controls, and requires balanced CompilerActor and DriverActor terminal reports.

## Linux engineering handoff

Native Linux F6 remains unqualified. A contributor should begin from a native glibc x86-64 host, not WSL or a Windows guest without NVIDIA Driver access, and complete these steps:

1. Install exact Node 26.7.0 and the five package identities recorded in `schemas/cuda-13.3/linux-x64/compiler-provider-manifest.json`; do not substitute ambient loader paths or caller-selected providers.
2. Run the portable capsule and exact readiness probe unchanged. Confirm `--modify-stack-limit=false`, exact provider/header identities, x86-64 ELF identity, version exports, and provider-library close.
3. Run `npm run f6:native`. It builds `experiments/exp-009/native/compiler-oracle.c`, compares exact C and public CompilerActor PTX/cubin, executes both artifacts through DriverActor, checks cache partitions, and requires balanced terminal cleanup.
4. Capture the process stack limit and environment across success and failure partitions. Complete Linux RDC/LTO and trusted-header capability evidence separately; the baseline runner does not infer those claims.
5. Attach machine-readable evidence, build commands, provider identities, Node/OS/kernel/glibc/Driver/GPU identities, cleanup records, and claim limits to issue #4.

Do not edit Windows evidence into a Linux result. Source-complete adapters and runners are reviewable implementation, not native qualification.
