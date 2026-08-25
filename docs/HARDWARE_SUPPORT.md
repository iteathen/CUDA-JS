# CUDA-JS Hardware Support

**Status:** Informational

**Registry updated:** 2026-08-11

This is the published hardware support list for CUDA-JS. It is generated from [`conformance/hardware/registry.json`](../conformance/hardware/registry.json). A CUDA-capable product is not automatically supported by CUDA-JS: support is recorded only for an exact profile that passed direct hardware execution, independent native-oracle comparison, permissions, packaging, and terminal cleanup.

CUDA-JS is in public testing. Unconfirmed Windows x64 CUDA hardware may operate without a compatibility opt-in when the required runtime substrate and safety checks pass. Operation is reported as `testing-unconfirmed` and never promotes support automatically.

## Directly qualified hardware

| GPU | Compute capability | Host profile | Node | Driver / API | Toolkit | Qualified surface | Evidence |
|---|---:|---|---|---|---|---|---|
| GeForce GTX 1660 Ti | 7.5 | windows-native-x64 (WDDM) | v26.7.0 | 610.74 / 13030 | 13.3.0 | F2W–F8W experimental | [#5](https://github.com/iteathen/CUDA-JS/pull/5), [#6](https://github.com/iteathen/CUDA-JS/pull/6), [#7](https://github.com/iteathen/CUDA-JS/pull/7), [#8](https://github.com/iteathen/CUDA-JS/pull/8), [#9](https://github.com/iteathen/CUDA-JS/pull/9), [#10](https://github.com/iteathen/CUDA-JS/pull/10), [#11](https://github.com/iteathen/CUDA-JS/pull/11); integrated `09e9ada6c1d0` |

The listed result qualifies only the recorded model and exact software/host identity. It does not qualify every device with the same compute capability.

## Public qualification calls

- [Issue #4](https://github.com/iteathen/CUDA-JS/issues/4) — native Linux x86-64 F2L through F8L.
- [Issue #12](https://github.com/iteathen/CUDA-JS/issues/12) — broad Windows x64 GPU architecture and model coverage.
- [Issue #13](https://github.com/iteathen/CUDA-JS/issues/13) — WSL2 x64.
- [Issue #14](https://github.com/iteathen/CUDA-JS/issues/14) — native Linux ARM64 SBSA.
- [Issue #15](https://github.com/iteathen/CUDA-JS/issues/15) — Jetson ARM64 profile design and qualification.
- [Issue #16](https://github.com/iteathen/CUDA-JS/issues/16) — controlled or sponsored GPU test hosts.
- [Issue #17](https://github.com/iteathen/CUDA-JS/issues/17) — native Linux x86-64 distribution expansion after the Ubuntu baseline.

## Architecture test coverage

CUDA 13.3 compiler targets define the candidate set below. “Seeking evidence” means CUDA-JS has no support claim for that target yet.

| Compute capability | Family | CUDA 13.3 target | Priority | CUDA-JS status |
|---:|---|---|---:|---|
| 7.5 | Turing | `sm_75` | P0 | qualified one model |
| 8.0 | Ampere data center | `sm_80` | P0 | seeking evidence |
| 8.6 | Ampere workstation/consumer | `sm_86` | P0 | seeking evidence |
| 8.7 | Ampere embedded | `sm_87` | P1 | seeking evidence |
| 8.8 | Ampere variant | `sm_88` | P2 | seeking evidence |
| 8.9 | Ada | `sm_89` | P0 | seeking evidence |
| 9.0 | Hopper | `sm_90` | P0 | seeking evidence |
| 10.0 | Blackwell | `sm_100` | P1 | seeking evidence |
| 10.3 | Blackwell variant | `sm_103` | P1 | seeking evidence |
| 11.0 | Blackwell embedded | `sm_110` | P2 | seeking evidence |
| 12.0 | Blackwell workstation/consumer | `sm_120` | P0 | seeking evidence |
| 12.1 | Blackwell variant | `sm_121` | P1 | seeking evidence |

## Host and processor profiles

| Profile | Current runner state | Promotion target | Missing native work |
|---|---|---|---|
| `windows-native-x64` | runner ready | qualified experimental | none |
| `linux-native-x64` | adapter incomplete | qualified experimental | canonical Linux DriverActor backend; native F3 context lifecycle runner; native F4 memory C oracle and runner; native F5 execution C oracle and runner; native F6 NVRTC/nvJitLink C oracle and runner; native F7 permission and lifecycle stress runner; native F8 installed-package consumer |
| `wsl2-x64` | adapter incomplete | qualified experimental | WSL2-specific Driver/provider adapter; WSL2 native oracle and F2 through F8 qualification chain |
| `linux-native-arm64-sbsa` | schema and adapter incomplete | qualified experimental | ARM64 Runtime IR and native ABI oracle; ARM64 Driver/compiler adapters; ARM64 F2 through F8 native qualification chain |
| `linux-native-arm64-jetson` | contract required | future profile | accepted Jetson profile contract; Jetson Node/ABI/provider qualification; Jetson F2 through F8 native qualification chain |

Windows x64 is the only native profile currently qualified. Native Linux x64, WSL2 x64, Linux ARM64 SBSA, and Jetson ARM64 remain separate profiles because their ABI, loader, Driver/provider, packaging, permission, or deployment boundaries differ.

## Extended qualification axes

Every axis below records architecture, implementation, qualification, and priority independently. The performance/thermal/soak axis exposes bounded observation commands at testing-unconfirmed status; every other axis remains not-qualified with an intentionally empty command chain.

| Axis | Architecture | Implementation | Qualification | Priority | Current boundary | Work issue |
|---|---|---|---|---|---|---|
| multi-gpu | deferred | not implemented | **not qualified** | deferred | device zero, one private context, and no public device selector | [#20](https://github.com/iteathen/CUDA-JS/issues/20) |
| mig | deferred | not implemented | **not qualified** | deferred | MIG identity, isolation, quotas, and lifecycle are not modeled | [#27](https://github.com/iteathen/CUDA-JS/issues/27) |
| virtualization | deferred | partial | **not qualified** | deferred | virtualization mechanisms require separate host/guest/provider profiles | [#21](https://github.com/iteathen/CUDA-JS/issues/21) |
| concurrent-launch | planned | partial | **not qualified** | after:exact capacity two profile | exact SPEC-0018 capacity-two profile is qualified; broader capacities, cross-stream dependency waits, priorities and operation classes remain unimplemented and unqualified | [#40](https://github.com/iteathen/CUDA-JS/issues/40) |
| performance-thermal-soak | planned | implemented | **testing unconfirmed** | active evidence | versioned public-package short and bounded-soak observation profiles exist; exact native evidence remains observational and cannot promote product performance or production stability | [#28](https://github.com/iteathen/CUDA-JS/issues/28) |
| ecc | deferred | not implemented | **not qualified** | deferred | ECC capability and error-health semantics are not in the runtime contract | [#24](https://github.com/iteathen/CUDA-JS/issues/24) |
| driver-toolkit-matrix | deferred | partial | **not qualified** | deferred | only exact recorded Node, Driver, toolkit/header, provider, and GPU cells are supported | [#22](https://github.com/iteathen/CUDA-JS/issues/22) |
| windows-tcc-server | deferred | not implemented | **not qualified** | deferred | the accepted Windows profile is Windows 11 x64 WDDM with watchdog enabled | [#26](https://github.com/iteathen/CUDA-JS/issues/26) |
| independent-attestation | deferred | partial | **not qualified** | deferred | contributor bundles are hashed and sanitized but are not independently tamper-proof | [#29](https://github.com/iteathen/CUDA-JS/issues/29) |

### Verified negative virtualization profile

The exact Windows 11 Pro 10.0.26200 / NVIDIA GeForce GTX 1660 Ti Hyper-V profile is **known incompatible**. The read-only probe found 0 partitionable GPUs and 0 assigned GPU partitions; Microsoft also excludes the client-host class from the supported DDA/GPU-P deployment profile. The broader virtualization capability remains architecturally deferred and not-qualified; no VM or device state was changed.

## How hardware is added

1. Start with [`conformance/hardware/README.md`](../conformance/hardware/README.md) and select an exact profile.
2. Run `npm run hardware:plan` to see whether that profile has a complete runner.
3. On a runner-ready profile, use exact Node 26.7.0 from a clean tested commit and run `npm run hardware:qualify`.
4. Review the generated public summary and evidence index. Keep host names, account names, filesystem paths, serial numbers, UUIDs, and bus identifiers out of public uploads.
5. Open a hardware qualification issue, attach the sanitized result, and link the exact source commit.
6. Promotion requires maintainer review and a registry PR. Evidence from one profile never silently promotes another.

## Upstream candidate references

- [nvidia-cuda-gpus](https://developer.nvidia.com/cuda-gpus) — current CUDA-capable product and compute-capability reference.
- [nvidia-cuda-13.3-release-notes](https://docs.nvidia.com/cuda/cuda-toolkit-release-notes/) — CUDA 13.3 component, architecture, platform, and Driver compatibility reference.
- [nvidia-nvcc-13.3](https://docs.nvidia.com/cuda/cuda-compiler-driver-nvcc/) — CUDA 13.3 real and virtual GPU architecture targets.
- [nvidia-windows-install-13.3](https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/) — CUDA 13.3 Windows host requirements.
- [nvidia-linux-install-13.3](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/) — CUDA 13.3 Linux x86-64, ARM64 SBSA, and Jetson host distinctions.

### Extended-profile references

- [microsoft-hyperv-gpu-troubleshooting](https://learn.microsoft.com/en-us/troubleshoot/windows-server/virtualization/troubleshoot-hyper-v-gpu-assignment-partitioning-passthrough-issues) — vendor support boundary for DDA and GPU-P.
- [microsoft-get-partitionable-gpu](https://learn.microsoft.com/en-us/powershell/module/hyper-v/get-vmhostpartitionablegpu?view=windowsserver2025-ps) — read-only partitionable-GPU inventory.
- [microsoft-hyperv-dda](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/plan/plan-for-deploying-devices-using-discrete-device-assignment) — DDA host, device, and security prerequisites.

## Claim limits

- Portable, mock, schema-generation, package-import, and readiness checks do not prove native CUDA support.
- Successful operation on unconfirmed hardware is test evidence, not a support claim.
- A Driver-only pass does not prove memory, execution, compiler/linker, installed-package, performance, or production behavior.
- CUDA-JS currently selects device zero and admits one pending GPU operation. Performance/thermal/soak has testing-unconfirmed bounded observation profiles without a performance or stability claim; multi-GPU, MIG, virtualization, concurrent launch, ECC, TCC/server, version-matrix, and attested-runner axes remain not-qualified.
- Driver/toolkit, Node, OS, ABI, provider, schema, permission, artifact, resource-lifecycle, or GPU changes can invalidate evidence.

The operational build-out and dedicated test-host design are in [`docs/plans/2026-08-11-hardware-qualification-program.md`](plans/2026-08-11-hardware-qualification-program.md). The Node matrix, verified-negative profiles, and extended qualification contracts are maintained in [`docs/plans/2026-08-11-node-and-extended-qualification.md`](plans/2026-08-11-node-and-extended-qualification.md).
