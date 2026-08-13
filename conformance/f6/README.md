# CJS-F6 compiler, linker, cache, and handoff conformance

The F6 capsule separates two claims:

- portable request normalization, cache keying, corruption rejection, exact invalidation, Worker responsiveness, and lifecycle behavior;
- exact Windows CUDA 13.3 NVRTC/nvJitLink ABI, independent MSVC artifact parity, and PTX/cubin Driver execution.

Run `npm run f6:portable` on any exact Node 26.7.0 qualification host. Native Linux x86-64 engineers can run `npm run f6:linux-readiness`; it checks only canonical provider locations, ELF identity, required exports, exact versions when available, and the Linux option profile, then writes an honest `ready` or `not-ready` record. Run `npm run f6:native` only on the accepted Windows x64 CUDA 13.3 provider, Driver, and GPU profile. Generated artifacts and evidence stay under ignored `build/` storage.

The native Windows lane now includes the promotion suites for SPEC-0010 relocatable device code and SPEC-0012 Device LTO. An independent MSVC oracle compiles two RDC PTX units and two LTO-IR units with the exact normalized native options, links both pairs, loads both cubins through the CUDA Driver, records exact outputs, and proves program/link/Driver cleanup. The public-facade lane repeats the same compilation and linking, requires byte-for-byte parity for all six compiler artifacts and both GPU outputs, checks default PTX stability and raw/mixed/corrupt/incompatible controls, and requires balanced CompilerActor and DriverActor terminal reports. `npm run f6:capabilities` runs this focused qualification lane; `npm run f6:native` includes it in the full native F6 capsule.

## Linux engineering handoff

Native Linux F6 remains incomplete. A contributor should begin from a native glibc x86-64 host, not WSL or a Windows guest without NVIDIA Driver access, and complete these steps:

1. Install exact Node 26.7.0 and launch it with the experimental FFI flag. Confirm the platform-neutral unit and portable capsules pass unchanged.
2. Install a CUDA 13.3 toolkit whose `libnvrtc.so` and `libnvJitLink.so` SONAMEs, ELF architecture, versions, exported symbols, file lengths, and SHA-256 identities can be recorded. Do not fall back to an ambient loader search or accept caller paths.
3. Add a reviewed Linux provider manifest and a `linux-native` backend beside the Windows backend. Reuse the shared typed contract and cache; do not fork their semantics.
4. Preserve the normalized compiler option order and verify that `--modify-stack-limit=false` is always present. Capture the process stack limit and environment before and after every failure/success partition to prove no framework-requested process-global change.
5. Compile `experiments/exp-009/native/windows-compiler-oracle.c` after making only the minimal platform-neutral build adjustment; the source uses public NVRTC/nvJitLink APIs. Compare exact PTX and cubin bytes with Node FFI across two clean processes.
6. Exercise invalid source, invalid PTX, missing provider/export, version drift, log bounds, output bounds, program/link teardown, cache corruption, read-only cache, and atomic same-volume publication. Record resource counts even on failures.
7. If a qualified NVIDIA Driver and GPU are present, load and run both artifacts through the retained Linux DriverActor work. Report compiler/linker success separately from Driver/GPU success.
8. Attach machine-readable evidence, compiler/linker build commands, provider identities, Node identity, OS/kernel/glibc details, cleanup records, and claim limits to the public Linux qualification issue.

Do not edit Windows evidence into a Linux result. A Linux backend may be complete enough for review before hardware is available, but support promotion requires native provider calls and cleanup evidence on Linux.
