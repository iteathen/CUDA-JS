# SPEC-0010: Typed Relocatable Device-Code Compilation

**Status:** Accepted

**Date:** 2026-08-12

## Outcome

Extend the accepted CompilerActor compile contract with one consumer-neutral typed option, `relocatableDeviceCode`, so separately compiled CUDA device definitions can remain linkable through the existing public `link()` path.

This specification is a bounded additive follow-up to SPEC-0006 and SPEC-0009. It does not create a second compiler owner, expose arbitrary NVRTC options, change CUDA-MCGS semantics, authorize LTO, or change the accepted default whole-program compilation behavior.

## External semantic basis

CUDA NVRTC 13.3 defines `--relocatable-device-code={true|false}` (`-rdc`), with default `false`, and defines `--device-c` as equivalent to `--relocatable-device-code=true`. NVIDIA documents that generated relocatable PTX/cubin must be linked before execution and that nvJitLink is an available runtime linker.

CUDA-JS therefore owns a typed semantic switch and maps it to the canonical NVRTC option. The caller never supplies native option text.

## Public compile option

The compile option schema adds:

```text
relocatableDeviceCode: boolean
```

The default is `false`.

- `false` preserves the existing normalized native option vector and current compile/cache behavior.
- `true` adds exactly `--relocatable-device-code=true` to the normalized NVRTC option vector.
- non-boolean values fail before Worker/native work.
- unknown fields continue to fail closed.

The option is represented in the normalized request object. Enabling it changes compile identity and therefore cache identity through the normalized native option vector and SPEC-0010 contract identity.

## Typed PTX artifact

A successful relocatable compile returns the existing typed PTX artifact plus:

```text
relocatableDeviceCode: true
```

The field is omitted for ordinary non-relocatable PTX so the established default artifact shape remains backward compatible.

Typed PTX link-input validation accepts this optional field only when its value is exactly `true`. The linker continues to consume PTX bytes through the existing bounded nvJitLink owner. CUDA-JS does not expose a direct-execution promise for a relocatable artifact.

## Header-profile composition

`relocatableDeviceCode` composes with the accepted `headerProfile` option. When both `cuda-cccl` and relocatable compilation are selected:

- trusted-header identity and conflict rules remain governed by SPEC-0009;
- relocatable compilation is governed by this specification;
- the compile identity uses SPEC-0010 as the newest contract version while retaining the selected header-profile identity in the provider/request record.

## Ownership and lifecycle

No lifecycle owner changes.

- `runtime.compiler-actor` still owns NVRTC program creation/compile/output/destruction.
- `runtime.compiler-cache` still owns deterministic identity, validation, publication, corruption handling, and invalidation.
- existing `link()`/nvJitLink ownership is unchanged.
- DriverActor contracts are unchanged.

Expected compile/link failures remain recoverable only when native resource destruction is proved. Cleanup and health semantics remain those of SPEC-0006/0007.

## Portable conformance

Required without a GPU:

- default normalized native options are byte-for-byte unchanged;
- `relocatableDeviceCode: false` normalizes equivalently to omission;
- `relocatableDeviceCode: true` adds only the canonical NVRTC option;
- non-boolean values and unknown options reject before Worker/native work;
- compile identity/cache key changes when the option changes;
- relocatable typed PTX carries `relocatableDeviceCode: true`;
- default PTX omits the field;
- typed link input accepts the true marker and rejects invalid marker values;
- header-profile + RDC identity remains deterministic;
- mock program/link resource counts balance and close remains graceful.

## Native Windows promotion evidence

Before this capability is claimed complete on the exact Windows profile, independently keyed native evidence must prove:

1. a core CUDA source with an unresolved device declaration compiles in relocatable mode;
2. an independent CUDA source containing the device definition compiles to externally linkable relocatable PTX;
3. the two public compile artifacts link through existing public `link()` to one cubin;
4. the cubin loads and launches through the public package facade with exact independent native-oracle output parity;
5. default non-relocatable compilation remains unchanged;
6. controlled compile/link failure leaves CompilerActor health correct and all native program/link resources terminally balanced.

Linux remains unqualified until the existing native Linux qualification chain is satisfied.

## Non-goals

- arbitrary NVRTC/nvJitLink flags;
- caller-selected native linker input enums;
- LTO-IR or device LTO;
- relocatable/incremental nvJitLink output;
- cudadevrt or dynamic-parallelism support;
- changes to CUDA-MCGS extension semantics;
- performance claims.

## Falsifiers

Keep the capability unsupported if any of the following cannot be made deterministic and fail-closed:

- default option/artifact behavior changes unexpectedly;
- option identity is lost across cache boundaries;
- typed artifact metadata is silently discarded or accepts invalid values;
- native RDC output cannot link through the existing bounded linker;
- expected failures poison the actor or leak/unprove native cleanup.
