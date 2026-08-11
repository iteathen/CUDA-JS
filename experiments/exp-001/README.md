# Native Linux CUDA qualification handoff

This directory contains the executable Linux half of the CUDA Driver bootstrap. It is intentionally incomplete: its source and ABI preparation can run on an ordinary native Linux machine, but final qualification requires a native Ubuntu host with a real NVIDIA Driver and GPU.

The practical goal is to leave the next engineer with one bounded hardware run and an evidence review, not an open-ended port.

## What is already implemented

- An exact native Ubuntu 24.04 x86-64 profile using official Node.js v26.7.0.
- Hash-pinned CUDA 13.3 development packages downloaded from NVIDIA without installing or changing the host Driver.
- Extraction of the accepted `cuda.h` and link-time Driver stub into ignored build storage.
- Compilation and execution of the generated native ABI probe.
- Exact comparison of observed Linux sizes, alignments, field offsets, and function-pointer widths with the checked-in F1B products.
- Compilation of an independent C Driver oracle against the official NVIDIA stub.
- A readiness check for native Linux, the exact Node version, a canonical `libcuda.so.1`, NVIDIA device nodes, and a working `nvidia-smi` query.
- A real-Driver smoke runner using the same generated FFI definitions and isolated Worker lifecycle exercised by the accepted Windows path.
- Exact Node-to-C comparison, negative library/symbol/version tests, permission denial/allow tests, context teardown, library invalidation, and Worker exit checks.

GPU-free preparation has been exercised on a native Ubuntu 24.04 x86-64 guest. The guest has no NVIDIA GPU or Driver exposure, so it cannot supply the final smoke evidence and must not be represented as Linux CUDA support.

## Required qualification host

Use a machine that meets all of these conditions:

- native Ubuntu 24.04 LTS on x86-64 with glibc;
- official Node.js v26.7.0;
- a supported NVIDIA GPU visible to the operating system;
- an installed NVIDIA Driver providing `libcuda.so.1`, `nvidia-smi`, `/dev/nvidiactl`, and at least `/dev/nvidia0`;
- a C11 compiler available as `cc`, plus `dpkg-deb`;
- network access to the two exact NVIDIA package URLs in [`profile.json`](profile.json).

Do not use WSL evidence for this profile. WSL is a useful environment, but its Driver boundary and library discovery are different enough to require a separately named compatibility profile.

## Run the preparation checks

From the repository root:

```sh
npm ci
npm run exp:001:prepare
```

`prepare` performs the GPU-free build and ABI checks, then writes a readiness report. It returns successfully when the software preparation passes even if the machine lacks a GPU; the readiness status records that distinction explicitly.

Review these files:

- `build/exp-001/linux-x64/evidence/build.json`
- `build/exp-001/linux-x64/evidence/native-abi-probe.txt`
- `build/exp-001/linux-x64/evidence/readiness.json`

If readiness says `environment-incomplete`, fix the reported host condition and rerun `npm run exp:001:readiness`. Do not bypass a check or edit the report.

## Run the final Driver/GPU smoke

Only after readiness says `ready`:

```sh
npm run exp:001:smoke
```

The runner executes the independent C oracle, then the Node FFI smoke in a Worker, and fails unless their CUDA observations agree exactly. Passing evidence is written to:

`build/exp-001/linux-x64/evidence/smoke.json`

Build outputs are ignored intentionally. Attach the three JSON evidence files and the native probe text to the pull request or an issue comment; do not commit machine-specific binaries or raw logs.

## Common failures

| Symptom | Meaning | Engineer action |
| --- | --- | --- |
| `official Node v26.7.0` is missing | A different Node ABI was used | Install the exact official release and rerun the command. |
| `native Linux environment` is missing | The run occurred under WSL | Move the qualification to a native Linux installation. |
| `canonical system libcuda.so.1` is missing | The NVIDIA Driver is absent or installed outside the accepted path policy | Repair the Driver installation; do not point the test at an arbitrary library. |
| An NVIDIA device node is missing | The GPU is not exposed or the kernel module is not ready | Repair Driver/device exposure and confirm it with `nvidia-smi`. |
| The ABI probe differs | The selected generated ABI facts do not describe this host | Stop and report the complete diff; do not regenerate expected values on the failing host. |
| The C oracle cannot load or initialize CUDA | The real Driver installation is not usable | Verify the Driver independently, then preserve the command error in the issue. |
| Node and C results differ | The binding or lifecycle implementation is wrong | Treat this as a framework defect and attach both observations. |
| Cleanup or permission checks fail | The runtime boundary is not safe enough to promote | Do not claim Linux support; report the exact failing assertion. |

## What a completing pull request must contain

- The exact commit tested and an unmodified [`profile.json`](profile.json).
- `build.json`, `readiness.json`, `smoke.json`, and `native-abi-probe.txt` from the same host and run.
- The GPU model and Driver version reported by `nvidia-smi`.
- Confirmation that the machine is native Linux rather than WSL.
- Any source changes required for the run, with no weakened assertions or expanded library path policy.
- Documentation updates changing Linux from incomplete only after all checks pass.

The final run qualifies only this exact profile. It does not establish ARM64, WSL, other distributions, arbitrary CUDA APIs, Fast FFI, performance, or production readiness.

## Safety boundary

The smoke accepts only the profile-owned Driver path and generated signatures. Raw pointer values remain inside the Worker, returned function pointers are checked but never invoked, and the test must end with no current CUDA context and a closed library handle.

The experiment contract and its promotion/falsification rules are in [`../EXP-001-node-ffi-cuda-smoke.md`](../EXP-001-node-ffi-cuda-smoke.md).
