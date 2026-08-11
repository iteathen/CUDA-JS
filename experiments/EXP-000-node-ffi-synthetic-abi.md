# EXP-000: Node FFI Synthetic ABI Qualification

**Status:** Proposal

**Execution:** Promoted 2026-08-11. Windows x64 passed on exact Node 26.7.0 and MSVC 19.50; native Linux x86-64 passed on exact Node 26.7.0 and GCC 13.3.0.

**Date:** 2026-08-10

## Purpose

Qualify Node.js 26.7.0 `node:ffi` as CUDA-JS's host-call substrate **without requiring CUDA, an NVIDIA driver, or a GPU**.

This experiment separates four questions that would otherwise be confused in a real-CUDA smoke test:

1. Can the exact Node build load a dynamic library and generate callable wrappers for the C ABI shapes CUDA-JS needs?
2. Can CUDA-JS safely and deterministically pack scalars, handles, pointers, out parameters, pointer-to-pointer outputs, structures, arrays, and pointer tables using byte storage?
3. Which signatures are statically eligible for Node Fast FFI on each platform, and which use a generic fallback?
4. Does the public Node FFI surface expose a callable wrapper for an arbitrary function pointer returned at runtime?

A failure here is a host-binding or schema/packer failure, not a CUDA failure.

## Decision role

This is the first code-bearing experiment after authority publication. The project owner explicitly authorized execution on 2026-08-11.

- It gates the Node-FFI-first baseline.
- It gates the initial Runtime IR type system and packer design.
- It does **not** prove CUDA correctness, GPU behavior, context affinity, device compilation, or performance.
- It does **not** prove that V8 selected the Fast FFI path for a specific call unless an accepted direct qualification mechanism observes that path.

## Exact profiles

Run first on:

- official Node.js 26.7.0 build;
- Linux x86-64, System V ABI;
- `--experimental-ffi` and, when the permission model is enabled, `--allow-ffi`;
- a pinned C compiler and linker recorded in the evidence key.

Then repeat on:

- Windows x86-64, Microsoft x64 ABI;
- Linux ARM64, AAPCS64.

The current Windows development host uses a project-local, checksum-verified official Node 26.7.0 distribution. The system Node installation remains unchanged.

## Synthetic native library

Build a tiny dependency-free C shared library from generated source. The source and its direct C reference executable are generated from the same **case description**, but the JavaScript packer and C reference use independent implementations.

### Required exports

#### Scalar and return-value cases

- zero-argument return;
- signed/unsigned 8-, 16-, 32-, and 64-bit values;
- `float` and `double`;
- `size_t`, `intptr_t`, `uintptr_t`, and opaque pointer-shaped handles;
- deterministic mixed scalar transformations that expose truncation, sign, and ordering errors.

#### Argument-count and register-envelope cases

Generate scalar functions with:

- 1, 2, 3, 4, 5, 6, 7, 8, and 9 arguments;
- all integer/pointer-shaped arguments;
- all floating-point arguments;
- mixed integer and floating-point arguments;
- buffer/pointer-shaped arguments where public Node FFI permits them.

The evidence records static eligibility from the exact Node source/profile separately from observed timing. Signatures outside the platform envelope must remain correct through the generic path.

#### Pointer and out-parameter cases

- pointer to scalar input;
- pointer to scalar output;
- nullable pointer;
- pointer-to-pointer output returning a library-owned stable object;
- pointer-to-pointer output returning a caller-released allocation;
- array pointer plus explicit element count;
- array-of-pointers input;
- `void**` table input and output;
- in/out buffer mutation;
- byte offset and alignment-sensitive writes.

#### Structure and union cases

The FFI call surface passes structure storage by pointer rather than relying on direct by-value aggregate support.

Include:

- simple naturally aligned structure;
- nested structure;
- union with discriminant managed by the case protocol;
- fixed array field;
- structure containing pointer fields;
- structure with 8- and 16-byte alignment requirements;
- layout checksum and field-offset query exports for the independent oracle.

#### Resolver-only function pointer case

Export a resolver function that returns a pointer to a native function that is **not exported by name**.

The JavaScript test must:

- call the resolver and observe a nonzero pointer;
- inspect the public `node:ffi` API for a supported callable-from-pointer constructor;
- record the result without attempting undefined or private-API invocation.

Expected v0 result: the pointer is observable as `bigint`, but no public arbitrary-pointer callable wrapper exists. This keeps the `cuGetProcAddress` direct-call gap explicit.

#### Library and resource lifetime cases

- wrapper call before and after library close;
- multiple close/dispose calls;
- foreign memory view copied versus zero-copy;
- deliberate stale-generation rejection in the JavaScript capability wrapper;
- caller-owned allocation release;
- library-owned object invalidation;
- Worker termination with live resources;
- deterministic final cleanup inventory.

#### Worker/event-loop cases

Run the FFI library inside a Worker that owns its wrapper and raw pointers.

Measure:

- main event-loop responsiveness during a native sleep/blocking function executed by the Worker;
- command round-trip cost;
- batched command cost;
- worker shutdown and rejection of commands after close;
- proof that raw pointers never cross the safe public API boundary.

Node FFI callback behavior is tested only enough to confirm the documented same-system-thread restriction. CUDA-managed host callbacks remain excluded from CUDA-JS v0.

## JavaScript harness

The harness is generated from a normalized synthetic ABI schema and must use the same architecture planned for CUDA-JS:

```text
case schema
  → normalized Runtime IR
  → Node FFI definition
  → byte-layout/out-parameter packer
  → private Worker actor
  → opaque public command/result
```

It must not hand-code one JavaScript wrapper per C function. Case-specific values are data records consumed by generic generators and runners.

## Independent oracles

Use all applicable oracles:

1. direct C reference executable using the native compiler ABI;
2. native layout report: sizes, alignments, offsets, pointer width, endianness;
3. exact result bytes and checksums emitted by C;
4. source-derived Node Fast FFI eligibility model for the exact Node tag/platform;
5. process-exit, leak, and cleanup inventory;
6. benchmark raw samples, kept separate from correctness evidence.

The C library and JavaScript packer may share declarative case inputs but may not share packing code.

## Fast-path evidence

The experiment distinguishes:

- **correctly callable:** Node FFI produces correct native behavior through any supported path;
- **statically fast-eligible:** the exact Node 26.7.0 source/profile admits the signature to Fast FFI;
- **performance-consistent:** timing is consistent with the expected path but is not direct proof;
- **directly fast-qualified:** an accepted diagnostic or instrumentation mechanism observes Fast FFI selection.

Only the last category can support a future `fast-jit-required` claim.

Expected source-derived envelopes at Node 26.7.0 include:

- global Fast FFI cap of eight user arguments;
- Linux x86-64: up to six integer/pointer arguments and eight floating-point arguments, with additional buffer/mixed restrictions;
- AArch64: up to seven integer/pointer arguments and eight floating-point arguments, with buffer/mixed restrictions;
- Windows x86-64: current register-only emitter limited to three public scalar arguments and no fast buffer arguments.

The experiment must derive these values from the exact pinned Node source rather than treating this document as the oracle.

## Commands and artifacts

The eventual implementation should expose canonical commands similar to:

```bash
npm run exp:000:build
npm run exp:000:correctness
npm run exp:000:lifecycle
npm run exp:000:benchmark
npm run exp:000:case -- <stable-case-id>
```

Retain:

- generated C source and case schema;
- compiler/linker commands and versions;
- native library hash;
- direct C oracle output;
- generated Node definitions and packers;
- per-case pass/fail/skip results;
- Fast-eligibility classification and reason;
- raw benchmark samples and statistics;
- process/Worker cleanup report;
- exact Node binary/version/configuration/flags;
- checks not run and claim limits.

## Promotion criteria

Promote the Node-FFI-first host substrate when all required Linux x86-64 cases show:

- exact scalar, pointer, out-parameter, pointer-table, and structure-storage parity;
- deterministic generated definitions and packers;
- fail-closed unsupported types and signatures;
- no raw pointer in the public API;
- correct close/invalidation behavior;
- responsive main event loop while blocking native work stays in the Worker;
- no leaked synthetic resources or live Worker/library state;
- explicit generic versus candidate-fast classification;
- the arbitrary-function-pointer gap is accurately recorded rather than hidden.

Windows x86-64, native Linux x86-64, and Linux ARM64 promotion occur independently. One platform does not block another platform's contract drafting unless shared schema would become platform-incorrect.

## Falsifiers and path changes

The selected Node-FFI-first baseline must be revised before CUDA binding when:

- official Node 26.7.0 builds lack usable FFI on the target profile;
- ordinary CUDA-style pointer/out/structure-storage cases cannot be represented safely;
- Worker ownership cannot fence raw pointers and library lifetime;
- library close or Worker teardown leaves callable stale wrappers/resources;
- the generated schema cannot express platform ABI differences without hand-coded per-function wrappers;
- required hot-call shapes cannot meet an accepted performance/JIT bound and cannot be moved out of the hot operation;
- a mandatory CUDA capability can only be invoked through an arbitrary returned function pointer.

The next step is then EXP-011: compare an upstream Node enhancement, a custom Node build, a small generic native/JIT backend, or an explicit unsupported capability. It is **not** automatic permission to recreate broad hand-written CUDA wrappers.

## Cleanup

Delete temporary binaries and benchmark scratch after their hashes, commands, raw evidence, and required reproduction artifacts are preserved. Keep only canonical fixtures and generated source needed by the owning conformance capsule.

No native process, Worker, dynamic library, callback, allocation, foreign view, or temporary directory may remain live after the experiment.

## Claim limits

A passing EXP-000 proves only the selected Node host-call and generic packer/actor foundation on the exact tested profile. It does not prove:

- CUDA library discovery;
- CUDA ABI/header correctness;
- context currentness;
- GPU memory behavior;
- kernel launch correctness;
- asynchronous CUDA error attribution;
- NVRTC/nvJitLink behavior;
- production performance;
- `fast-jit-required` dispatch.
