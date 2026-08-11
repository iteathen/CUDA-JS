# EXP-012 implementation capsule

This directory implements the accepted, disposable Windows x64 CUDA Driver bootstrap owned by `SPEC-0002`.

- `generated/oracle.c` is the independent official-header MSVC oracle.
- `src/build.mjs` verifies exact inputs, compiles/runs the ABI probe and oracle, and writes ignored evidence.
- `src/driver-worker.mjs` owns the Driver library and private context.
- `src/run-smoke.mjs` compares sanitized Node observations with the C oracle and exercises permission/negative paths.
- `src/verify.mjs` checks preserved evidence and claim limits.

Native binaries and evidence remain under ignored `build/exp-012/windows-x64/`.
