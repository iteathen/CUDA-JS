# EXP-009: Windows compiler, linker, and artifact parity

EXP-009 is the direct CJS-F6W native gate. It compiles one tracked CUDA C++ vector kernel to PTX with CUDA 13.3 NVRTC, links that PTX to cubin with CUDA 13.3 nvJitLink, and compares exact Node FFI bytes with an independent MSVC C oracle.

Run with the pinned Node executable:

```powershell
build\toolchains\node-v26.7.0-win-x64\node.exe experiments\exp-009\src\run-native-windows.mjs
```

All executables and artifacts remain under ignored `build/exp-009/windows-x64`. The capsule proves only the exact Windows x64 provider ABI, deterministic input profile, output parity, and native-handle teardown. It does not prove native Linux providers, Driver execution, recovery, performance, or packaging.
