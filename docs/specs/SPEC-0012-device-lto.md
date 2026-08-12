# SPEC-0012: Typed Device LTO

**Status:** Accepted

**Date:** 2026-08-12

## Outcome

Add a bounded device link-time-optimization capability under the existing CompilerActor owner without exposing a general NVRTC/nvJitLink control surface.

The first slice adds one typed compile output, `lto-ir`, and one inferred homogeneous LTO link mode. PTX remains the default/current compile and link path. The final LTO link output remains cubin.

This specification is additive to SPEC-0006, SPEC-0009, and SPEC-0010. It does not change DriverActor ownership, CUDA-MCGS semantics, or the default PTX/RDC behavior.

## NVIDIA semantic basis

CUDA NVRTC 13.3 documents `--dlink-time-opt` (`-dlto`) as generating intermediate code for later device link-time optimization. The option implies relocatable device code, and when selected the `nvrtcGetLTOIRSize` / `nvrtcGetLTOIR` APIs are the output path rather than PTX/cubin extraction.

CUDA nvJitLink 13.3 accepts `NVJITLINK_INPUT_LTOIR`; `-lto` enables link-time optimization and `nvJitLinkComplete` can produce a final linked cubin. NVIDIA's documented Device-LTO example follows exactly this source -> LTO-IR -> LTO link -> cubin -> Driver-load sequence.

CUDA-JS exposes those semantics through typed contracts. Callers never select native input enums or native option strings.

## Compile contract

`compile()` gains one optional top-level field:

```text
output: "ptx" | "lto-ir"
```

Default: `"ptx"`.

### PTX

Existing SPEC-0006/SPEC-0009/SPEC-0010 behavior is unchanged.

### LTO-IR

When `output: "lto-ir"`:

- CUDA-JS adds exactly `--dlink-time-opt` to the normalized NVRTC option vector;
- CUDA-JS extracts bytes with `nvrtcGetLTOIRSize` / `nvrtcGetLTOIR`;
- the bytes are treated as opaque binary and may contain NUL;
- the artifact is typed `format: "lto-ir"`;
- explicit `relocatableDeviceCode` in the same request rejects because LTO mode already determines relocatable semantics and duplicate switches would create ambiguous public identity;
- `headerProfile`, language standard, target architecture, `fmad`, and device-as-default-execution-space retain their existing typed meanings;
- `--gen-opt-lto` is not enabled in the first slice.

## LTO-IR artifact

A native LTO-IR artifact contains:

```text
format: "lto-ir"
bytes: copied Uint8Array
byteLength: positive bounded integer
sha256: lowercase SHA-256
architecture: "compute_NN"
producer:
  profile: CUDA-JS provider-profile identifier
  nvrtcVersion: "MAJOR.MINOR"
```

The artifact identity is inseparable from these compatibility facts. Raw LTO-IR bytes are not accepted by the public linker.

Testing-only mock providers may emit the exact same record shape with a mock-profile identifier while modeling the pinned 13.3 version; that is orchestration evidence only and cannot promote native support.

## Link contract

`link()` accepts exactly one of these homogeneous request families:

1. PTX: existing raw PTX byte copies and/or typed PTX artifacts;
2. LTO: typed `lto-ir` artifacts only.

A request mixing PTX and LTO-IR rejects before cache/native work.

For LTO mode CUDA-JS:

- infers mode from the artifact format;
- adds `-lto` to the normalized nvJitLink option vector;
- passes each input as `NVJITLINK_INPUT_LTOIR`;
- retrieves the existing final cubin output;
- never exposes the native enum or LTO option to the caller.

Raw binary input remains PTX by definition and is never interpreted as LTO-IR.

## Compatibility prevalidation

Before native LTO linking, CUDA-JS validates every typed artifact:

- exact allowed fields and copied-byte bounds;
- byteLength and SHA-256 match the bytes;
- architecture is canonical `compute_NN` and matches the selected final target in the first slice;
- producer profile is a bounded nonempty identifier;
- producer `nvrtcVersion` is canonical `MAJOR.MINOR`;
- all LTO inputs have the same CUDA/NVRTC major;
- when the active native nvJitLink version is known, its major must match the producer major and its `(major, minor)` must be at least as new as every producer version.

The first slice intentionally requires exact target architecture correspondence (`compute_NN` -> `sm_NN`) rather than exposing CUDA's broader cross-virtual-architecture compatibility rules. That restriction can be widened later with independent evidence.

Native linker errors remain authoritative for compatibility conditions that cannot be predicted safely.

## Cache/evidence identity

Compile identity distinguishes:

- PTX vs LTO-IR output;
- normalized native option vector;
- selected header profile and all existing source/header/provider facts.

LTO link identity includes, in ordered input order:

- `format: "lto-ir"`;
- byte length and SHA-256;
- target architecture;
- producer profile and NVRTC version;
- LTO link mode / normalized options;
- current provider identity;
- final `cubin` output.

PTX cache identities remain unchanged when no LTO behavior is selected.

## Lifecycle and ownership

No owner changes:

- CompilerActor owns NVRTC program lifecycle and LTO-IR extraction;
- CompilerActor owns nvJitLink handle lifecycle and LTO input selection;
- compiler cache owns identity/validation/publication/corruption/invalidation;
- DriverActor sees only the final cubin and retains its existing module/load/launch lifecycle.

Expected native compile/link errors are recoverable only when destruction is proved. Destruction failure remains restart-required.

## Portable conformance

Required without a GPU/native provider:

- omitted compile output is byte-for-byte equivalent to explicit PTX;
- `lto-ir` adds the canonical NVRTC LTO option and selects SPEC-0012 identity;
- explicit RDC + LTO rejects before Worker/native work;
- typed LTO artifact metadata is deterministic and copied;
- raw LTO bytes reject;
- mixed PTX/LTO inputs reject;
- malformed producer/version/digest/length/architecture reject;
- synthetic wrong-major and newer-producer/older-linker prevalidation rejects;
- homogeneous valid LTO inputs select `-lto` and distinct link/cache identity;
- PTX link identity remains unchanged;
- mock compile/link resource lifecycle balances and graceful close remains intact.

## Native Windows promotion evidence

Before this capability is claimed supported on the qualified Windows profile:

1. independent MSVC/native oracle and Node public path compile the same source to byte-identical LTO-IR on the exact accepted provider profile;
2. at least two independently compiled LTO units are linked through LTO to one cubin;
3. the final cubin executes through the existing DriverActor with exact oracle output parity;
4. normal PTX compile/link remains unchanged;
5. wrong/mixed/corrupt/incompatible input controls fail closed;
6. compile/link failure paths destroy every created native resource;
7. aggregate CompilerActor/DriverActor close is terminal with zero unproved live resources.

Linux/WSL/ARM support remains separately gated.

## Explicit exclusions

- mixed PTX/LTO-IR input sets;
- raw untyped LTO-IR bytes;
- linked LTO-IR or linked PTX output;
- staged/partial/incremental linking;
- `--gen-opt-lto`;
- arbitrary NVRTC/nvJitLink options;
- caller-selected native input kinds;
- object, library, fatbin, index or external-file inputs;
- cross-major compatibility claims;
- broad cross-target architecture composition;
- LTO performance claims;
- CUDA-MCGS/search semantics or mandatory LTO adoption.

## Fallback

If exact native LTO artifact identity, compatibility validation, or lifecycle cannot be proven without a broad unsafe native control surface, LTO remains unsupported and the accepted PTX/cubin pipeline remains the baseline.
