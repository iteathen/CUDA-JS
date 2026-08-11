# EXP-001: Node FFI CUDA Smoke

**Status:** Proposal

**Date:** 2026-08-10

**Current authorization:** proposal only; execution remains blocked by the documentation-only phase and its native-environment prerequisites.

## Decision affected

Whether the exact supported Node.js v26.7.0 built-in FFI profile is a viable no-addon baseline for Tier-0 CUDA-JS Driver/toolkit access after EXP-000 passes.

## Exact first profile

- Linux x86-64 glibc;
- official Node.js v26.7.0 build with FFI support, `--experimental-ffi`, and required permission flags;
- NVIDIA Driver and one supported GPU;
- optional locally installed NVRTC/nvJitLink libraries recorded separately;
- pinned CUDA 13.3 headers/schema inputs.

## Scope

Generate Node FFI definitions and packers for:

- `cuInit`;
- `cuDriverGetVersion`;
- `cuDeviceGetCount` and `cuDeviceGet`;
- selected scalar device attributes;
- `cuGetErrorName` and `cuGetErrorString`;
- private context create/current/destroy;
- `cuGetProcAddress` version/status verification;
- optional NVRTC version call.

No memory allocation, module load, kernel launch, UMCGS behavior, public raw pointer, callback, or broad schema generation is authorized by this experiment.

## Independent oracles

- compiled C reference using the same pinned official headers;
- native ABI layout probe;
- documented Driver results;
- process/resource observation before and after explicit teardown.

## Evidence

Record:

- exact Node commit/version/build/configuration and FFI flags;
- OS/kernel/libc/architecture;
- Driver/toolkit/GPU/compute capability;
- library paths and hashes where practicable;
- schema/header/generator/packer hashes;
- every FFI signature and exported symbol;
- command, stdout/stderr, exit state, and cleanup result.

## Falsifiers

- required library cannot be found under a defensible path policy;
- Node FFI cannot bind a required exported symbol;
- scalar, pointer, pointer-to-pointer, or out-parameter results differ from C;
- context currentness cannot be maintained on the Worker;
- explicit close leaves context/library/resource residue;
- a crash or corruption occurs under valid generated inputs;
- the framework would need to expose raw native pointers publicly.

## Promotion

Promote only the minimal loader/signature/packer/context mechanisms needed for the next schema and actor capsule. A passing smoke test does not prove Fast FFI, performance, asynchronous completion, memory lifetime, or broad CUDA coverage.

## Cleanup

Remove generated binaries, temporary schemas, logs, caches, and context resources unless retained as exact bounded evidence with an owner and expiry/revisit trigger.
