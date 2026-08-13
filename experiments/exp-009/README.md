# EXP-009: Windows compiler, linker, and artifact parity

EXP-009 is the direct CJS-F6W native gate. Its accepted baseline compiles one tracked CUDA C++ vector kernel to PTX with CUDA 13.3 NVRTC, links that PTX to cubin with CUDA 13.3 nvJitLink, and compares exact Node FFI bytes with an independent MSVC C oracle.

Run the accepted baseline with the pinned Node executable:

```powershell
build\toolchains\node-v26.7.0-win-x64\node.exe experiments\exp-009\src\run-native-windows.mjs
```

All executables and artifacts remain under ignored `build/exp-009/windows-x64`. The accepted capsule proves only the exact Windows x64 provider ABI, deterministic PTX/cubin input profile, output parity, and native-handle teardown. It does not prove native Linux providers, recovery, performance, packaging, or LTO.

## Historical LTO follow-up and current authority

This section records the native evidence plan that preceded accepted SPEC-0012. SPEC-0012 now exclusively owns the production typed Device-LTO contract, and its portable/software/package implementation is integrated. EXP-009 remains the retained exact-provider/oracle evidence family; it does not define or amend the public LTO surface.

The historical first target was deliberately narrow:

```text
CUDA source --NVRTC device LTO--> typed LTO-IR artifact
                                   +
CUDA source --NVRTC device LTO--> typed LTO-IR artifact
                                   ↓
                           nvJitLink device LTO
                                   ↓
                                 cubin
                                   ↓
                          existing DriverActor
```

The following exact native evidence remains required before Device LTO is qualified on a named profile:

- exact LTO-IR byte/digest parity with an independent native MSVC/CUDA oracle;
- at least two separately compiled LTO units composed into one executable cubin;
- exact output parity after loading/launching through the existing DriverActor;
- deterministic clean-room compile/link/cache identities;
- explicit compatibility metadata and pre-native rejection for known cross-major or producer-newer-than-linker cases;
- rejection of mixed PTX/LTO-IR in the first slice, raw untyped LTO-IR, corrupt artifacts, wrong target/identity, oversized inputs, and unknown public options;
- compile/link error logs, program/link destruction, application-loop responsiveness, graceful actor close, and terminal native-resource balance;
- unchanged accepted PTX/cubin regression evidence.

SPEC-0012 does **not** authorize public mixed-format linking, linked LTO-IR/PTX output, staged partial linking, arbitrary object/library/fatbin inputs, raw native nvJitLink/NVRTC options, broad cross-major LTO support, CUDA-MCGS semantics, or a performance claim.

See accepted [`SPEC-0012`](../../docs/specs/SPEC-0012-device-lto.md), the active [native qualification continuation](../../docs/plans/2026-08-12-native-and-platform-qualification-continuation.md), and the retained [LTO assessment](../../docs/research/2026-08-11-lto-support-assessment.md).
