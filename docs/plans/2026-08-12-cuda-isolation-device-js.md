# CUDA Isolation and Restricted Device-JS Plan Amendment

**Status:** Owner-directed plan amendment

**Date:** 2026-08-12

**Applies to:** CUDA-JS planning, issue #43, and the CUDA-MCGS compatible-pair path

## Clarified invariant

CUDA-specific implementation knowledge is owned exclusively by CUDA-JS within the CUDA-JS / CUDA-MCGS system boundary.

CUDA-MCGS and other higher-level consumers may define what GPU computation must do, but CUDA-MCGS must not require maintained CUDA-specific implementation knowledge such as:

- `.cu` / `.cuh` source;
- CUDA C++ syntax;
- hand-authored PTX;
- CUDA headers or CUDA math/header include details;
- NVRTC / nvJitLink flags or provider details;
- Driver API calls, raw CUDA handles, CUDA ABI/layout mechanics;
- CUDA thread/block/atomic/barrier syntax;
- CUDA-specific synchronization, launch, or memory-management syntax.

If CUDA-MCGS needs a generic GPU capability that CUDA-JS cannot express, the generic capability is added to CUDA-JS rather than adding a CUDA escape hatch to CUDA-MCGS.

This is stronger than the previous boundary, which allowed CUDA-MCGS to own generated/device CUDA source while CUDA-JS owned compilation and execution.

## Ownership after this amendment

### CUDA-JS owns

- the restricted Device-JS syntax/helper contract;
- validation and fail-closed rejection of unsupported device-source semantics;
- explicit numeric type semantics needed to avoid accidental JavaScript coercion;
- generic GPU helper semantics such as thread identity, atomics, fences/barriers, typed device-memory access, and CUDA math mappings;
- deterministic lowering from the accepted restricted-JS form to CUDA C++ or another CUDA-owned intermediate/generated form;
- all generated CUDA source and PTX/cubin/LTO artifacts;
- CUDA headers, providers, options, ABI/layout, compilation/linking/cache identity;
- CUDA memory, launch, completion, synchronization, error, health, and teardown mechanics.

Generated CUDA may exist inside CUDA-JS build/cache/evidence paths, but it is a CUDA-JS-owned artifact rather than maintained consumer source.

### CUDA-MCGS owns

- MCGS/search/domain/policy/evaluator/output semantics;
- graph, path, transposition, backup, scheduling intent, finite-resource semantics and search lifecycle;
- domain-specific algorithms such as Connect Four transitions and terminal rules;
- product-specific Search Program composition;
- schemas/contracts that describe required data and computation without encoding CUDA syntax or ABI.

CUDA-MCGS may use CUDA-JS's restricted Device-JS helpers because those helpers are the public generic GPU abstraction. It does not own their CUDA lowering.

## Minimal Device-JS direction

This amendment adopts the small direction in CUDA-JS issue #43 rather than a full GPU JavaScript VM or a new language ecosystem.

The first capability should be only enough to express complete procedural device algorithms:

- local variables and assignment;
- explicit typed numeric/boolean values;
- arithmetic, comparison, boolean and bitwise operations;
- `if` / `else`;
- `for` and `while`;
- `break`, `continue`, and `return`;
- supported device-function calls;
- typed device-memory access;
- generic thread/block/grid identity;
- required atomics and synchronization primitives;
- CUDA math mappings rather than a duplicate math implementation.

Full ECMAScript semantics, GC, dynamic objects/prototypes, strings, promises, exceptions, `eval`, and arbitrary host APIs remain out of scope.

Turing completeness is not an acceptance target. Structured loops plus mutable typed state may make the subset computationally general, but finite GPU execution, watchdog, resource, failure, and cancellation behavior remain governed by CUDA-JS runtime contracts.

## Plan correction to the compatible-pair path

The future CUDA-MCGS compatible-pair should no longer require CUDA-MCGS to hand CUDA source/PTX to CUDA-JS as its production design.

Target flow:

```text
CUDA-MCGS semantic contracts + restricted Device-JS search/domain program
        ↓
CUDA-JS Device-JS validation/type resolution/helper lowering
        ↓
CUDA-JS-generated CUDA source / device artifacts
        ↓
existing CompilerActor / linker / cache / DriverActor
        ↓
GPU
```

The current direct CUDA C++ / PTX public CUDA-JS capabilities remain valid low-level generic CUDA-JS capabilities for compatibility, experiments, independent consumers, and implementation evidence. They are not the intended production authoring boundary for CUDA-MCGS.

## Dependency/order change

1. Preserve current fixed-budget Connect Four/CUDA-MCGS CUDA experiments as bounded evidence; do not make their consumer-authored CUDA source the production architecture.
2. Complete the DJS-0/DJS-1 neutral specification and translator experiment from issue #43.
3. Prove a consumer-neutral DJS-2 native public-path capsule through existing CUDA-JS compiler/runtime owners.
4. Use Connect Four as the first external deletion test: express its device algorithm without consumer-authored CUDA or PTX and compare against the existing reference/experimental evidence.
5. Only after that proof should CUDA-MCGS production Search Image/package plans freeze their final CUDA-JS authoring boundary.
6. Continue RDC (#35), sideband (#38), scalar ABI (#39), concurrency (#40), CUDA Graph/cooperative research (#41), and LTO (#42) as separate generic capability families; none may reintroduce CUDA-specific knowledge into CUDA-MCGS.

## Acceptance tests for the boundary

The boundary is satisfied when:

- a maintained CUDA-MCGS production path contains no `.cu`, `.cuh`, hand-authored PTX, CUDA headers, NVRTC/nvJitLink options, Driver API calls, or CUDA ABI/layout implementation;
- a nontrivial CUDA-MCGS device algorithm can be authored entirely in CUDA-MCGS-owned semantics plus the public restricted Device-JS/helper contract;
- the CUDA generated from that program is produced, identified, cached and debugged by CUDA-JS;
- deleting CUDA-MCGS leaves the Device-JS/helper/compiler/runtime capability coherent and consumer-neutral;
- deleting the Device-JS frontend does not invalidate CUDA-JS's existing lower-level direct CUDA-source/PTX runtime capabilities;
- missing generic GPU primitives produce a CUDA-JS capability gap, not a CUDA-MCGS-local CUDA workaround.

## Supersession / interpretation rule

Where older CUDA-JS planning says CUDA-MCGS generates CUDA-specific Search Images, Stage PTX, or device source as a production responsibility, interpret that wording as superseded for the authoring/lowering boundary by this amendment.

CUDA-MCGS may still own the semantic composition and identity inputs of a Search Program/Search Image. CUDA-JS owns CUDA-specific realization of that semantic program.

Accepted specifications are not silently rewritten by this plan. Any public-contract changes required to implement this boundary need their own accepted bounded specification and evidence.
