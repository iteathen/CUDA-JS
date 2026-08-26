# SPEC-0006: Compiler, Linker, Cache, and Artifact Handoff

**Status:** Accepted

**Date:** 2026-08-11

## Authorization and bounded outcome

The project owner authorized continued Windows-first implementation and self-integration on 2026-08-11 after CJS-F4W and CJS-F5W merged into protected `main`. This specification authorizes the bounded CJS-F6W slice below and the corresponding GPU-free Linux preparation.

F6W opens one separate CompilerActor Worker, discovers the canonical CUDA 13.3 NVRTC and nvJitLink providers, compiles copied CUDA C++ source to PTX, links copied PTX inputs to cubin, records bounded diagnostics, validates a content-addressed artifact cache, and hands copied PTX or cubin bytes to the existing DriverActor module boundary. No compiler, linker, module, native handle, address, or provider-selected pointer crosses a Worker boundary.

F6W does not authorize source files, include-directory search, arbitrary provider paths, arbitrary native options, arbitrary libraries, caller-defined native schemas, callbacks, cancellation, compilation concurrency, compiler crash recovery, remote caches, fatbins, LTO input or output, relocatable device code, external libraries, package publication, consumer-language semantics, Fast FFI claims, performance claims, or native Linux CUDA support.

Passing F6W means a bounded source string can deterministically become a cached PTX artifact, optionally become a linked cubin artifact, and execute through the accepted DriverActor on the exact Windows profile with independent C parity. It does not make CUDA-JS application-ready by itself.

## Adversarial design assessment

The selected design has a dedicated `runtime.compiler-actor` Worker and a platform-neutral `runtime.compiler-cache` owner. Compiler and linker calls never run in the DriverActor. The compiler actor owns provider discovery, provider identity, native program/link resources, option normalization, copied inputs, logs, output bytes, cache transactions, cleanup, and conservative health. The DriverActor owns only module load, function resolution, execution, and its existing private CUDA context.

The strongest alternatives were considered:

- **Compile inside DriverActor.** Rejected because compiler process-global effects, long native calls, logs, cache I/O, and compiler resource loss would contaminate Driver context ownership and health attribution.
- **A child process for every compile.** Deferred to the later compiler-crash experiment. It provides stronger crash isolation but adds a second protocol, executable discovery, process teardown, and artifact transport before the native ABI and cache rules are proven.
- **Expose raw NVRTC and nvJitLink options.** Rejected. Provider options are executable toolchain policy and part of cache identity. F6 offers a small typed option schema and internally produces exact normalized arguments.
- **Accept source or header paths.** Rejected because include traversal, ambient filesystem state, case and separator differences, and time-of-check/time-of-use changes would make authority and cache identity ambiguous. F6 accepts copied strings only.
- **Trust a cache hit by filename.** Rejected. Every hit must validate the key schema, provider identity, normalized request, artifact length, artifact type, and artifact digest before bytes are returned.
- **Store only compiler output.** Rejected because linked artifacts have distinct provider identities, inputs, options, formats, and corruption boundaries. Compile and link entries share transaction machinery but never a key namespace.
- **Treat compiler success as safe device code.** Rejected. F6 validates transport, identity, options, limits, and lifecycle only. The caller remains responsible for source and kernel semantics.

The decisive falsifiers are a C-versus-Node artifact mismatch, nondeterministic clean-room output under the accepted profile, an unverified cache hit, path-dependent output, provider drift accepted under an old key, a leaked native program/link state, unexpected process-global mutation, raw provider/native capability escape, main-loop blockage, cubin/PTX type confusion, or a native Linux success claim without native Linux evidence.

## Component boundaries

### `runtime.compiler-actor`

Owns:

- canonical provider discovery and exact provider manifest verification;
- one serialized native command queue in a dedicated Worker;
- NVRTC program and nvJitLink handle lifecycle;
- copied source, header, option, log, and artifact storage;
- strict request bounds and option normalization;
- compiler/linker error translation and monotonic health;
- cache lookup, validation, atomic publication, corruption handling, and invalidation;
- terminal close and unexpected Worker-loss accounting.

It does not own CUDA Driver contexts, modules, functions, memory, launches, or consumer semantics.

### `runtime.compiler-cache`

Owns deterministic cache-key records and durable entry validation. The native actor uses it through a private port. The portable owner has no provider discovery or FFI authority.

Each cache entry consists of a canonical JSON manifest and one artifact byte file. The manifest records schema version, operation, provider profile and hashes, normalized request identity, artifact format, artifact length, artifact SHA-256, creation tool version, and cache key. Human timestamps, absolute toolkit paths, source text, headers, logs, and native error state are excluded from cache identity and durable entries.

### `runtime.execution`

F6 extends the accepted module input with `format: "cubin"`. PTX retains its F5 text policy. Cubin is a nonempty copied ordinary `Uint8Array` within the module byte limit and is treated as opaque executable bytes. The descriptor records only format, byte length, SHA-256, and opaque module token. Function and launch semantics are unchanged.

## Provider profile and discovery

The accepted Windows profile is:

- CUDA Toolkit 13.3 under the canonical NVIDIA installation root;
- `nvrtc64_130_0.dll` plus its matching builtins provider;
- `nvJitLink_130_0.dll`;
- exact provider file length and SHA-256 recorded in a reviewed manifest;
- exact public NVRTC names and exact CUDA 13.3 versioned nvJitLink export names;
- exact Node 26.7.0 x64 ABI.

Discovery checks only the installed CUDA 13.3 environment registration and the standard NVIDIA toolkit root. An explicit public DLL path or library name is unavailable. A missing provider, wrong architecture, wrong version, missing export, unexpected file identity, or ambiguous installation fails before any program/link handle is created.

The provider manifest is a compatibility allowlist, not a signature of trust. A source checkout does not bundle NVIDIA binaries.

## Typed options

`compile()` accepts an optional exact `options` record:

```text
architecture: "compute_NN"
languageStandard: "c++17" | "c++20"
fmad: boolean
deviceAsDefaultExecutionSpace: boolean
```

Unknown fields reject. The accepted default is `compute_75`, `c++17`, `fmad: false`, and `deviceAsDefaultExecutionSpace: false`. The normalized NVRTC option list is emitted in a fixed order and includes a fixed random seed and disabled NVRTC Driver cache. On Linux it additionally includes `--modify-stack-limit=false` so NVRTC does not change the process-wide stack limit. That Linux rule is generated and unit-tested on Windows but requires native Linux confirmation before support promotion.

`link()` accepts an optional exact `options` record with only `architecture: "sm_NN"`. The default is `sm_75`. The architecture must correspond to the compile artifact architecture when a typed compile artifact is supplied. F6 has no free-form option escape hatch.

Architecture values must be canonical lowercase two-digit compute capabilities from 50 through 99. This is a syntax and policy bound, not a claim that every accepted value is supported by the installed provider or GPU.

## Input and output bounds

Initial hard limits are:

- source: 1 MiB UTF-8, nonempty, no NUL;
- logical program name: 128 printable ASCII bytes, default `program.cu`, no slash or path separator;
- headers: at most 32 unique logical names;
- each header: 256 KiB UTF-8, nonempty, no NUL;
- total headers: 1 MiB;
- compiler or linker options after normalization: 16 entries and 4 KiB;
- PTX link inputs: 32, each nonempty and at most 64 MiB, total 64 MiB;
- compiler or linker log: 1 MiB after UTF-8 replacement and truncation;
- output artifact: 64 MiB;
- cache manifest: 64 KiB.

Header names follow the program-name character and separator rules and must be unique by exact name. Header order is canonicalized by name for identity and native pointer-table construction. Public inputs are snapshotted before posting to the Worker.

PTX output excludes NVRTC's trailing NUL from its artifact length and digest. PTX supplied to nvJitLink includes exactly one private trailing NUL for native input. Cubin output is preserved byte-for-byte.

## Facade contract

F6 adds:

```text
openCompilerRuntime(options?) -> CompilerRuntime
runtime.status() -> CompilerStatus
runtime.compile(request) -> CompilerResult
runtime.link(request) -> LinkerResult
runtime.invalidate(cacheKey) -> InvalidationRecord
runtime.close() -> CloseRecord
```

The open options are exact:

```text
cacheDirectory: absolute path
cacheMode: "read-write" | "read-only" | "disabled"
```

The default cache directory is the repository-local ignored build cache for the source checkout. Consumers must select their own absolute cache directory before packaging is authorized. Unknown fields and relative paths reject.

`compile()` accepts `{ source, name?, headers?, options? }`. Headers are exact `{ name, source }` records. It returns:

```text
{
  schemaVersion: 1,
  operation: "compile",
  artifact: { format: "ptx", bytes, byteLength, sha256, architecture },
  log,
  cache: { key, status: "hit" | "miss" | "disabled" },
  provider,
  health
}
```

`link()` accepts `{ inputs, options? }`, where every input is copied PTX bytes or a typed PTX artifact from this facade. It returns the same shape with `operation: "link"` and a `cubin` artifact. Result bytes are new ordinary `Uint8Array` values. Provider records contain public names, semantic versions, and file digests, never absolute paths or loaded-library handles.

Compiler and linker failure errors include a stable stage/code, bounded provider diagnostic, cache key when identity was completed, and health snapshot. They do not include source, header contents, output bytes, native pointers, or toolkit paths.

The artifact record can be passed directly as `{ format, bytes }` to `DriverRuntime.loadModule()`. There is no direct Worker-to-Worker capability transfer in F6.

## Native lifecycle and health

Every compile creates one NVRTC program, captures its log on success or failure, copies the requested output, and destroys the program in a `finally` path. Every link creates one nvJitLink handle, adds all inputs, completes, captures info and error logs, copies output, and destroys the handle in a `finally` path.

Native destruction failure makes cleanup unproved and health `restart-required`. Provider status or request errors that occur before native resource creation are recoverable. Compile/link diagnostics are ordinary operation failures only when resource destruction is proven. Unexpected Worker loss is `restart-required`; no inaccessible native cleanup is claimed. A new CompilerRuntime instance is required.

Only one compile or link is active in the Worker. Native calls may block the CompilerActor Worker but must not block the application event loop or DriverActor Worker. F6 makes no cancellation claim.

NVRTC's internal Driver cache is disabled in the accepted profile. The framework cache is the only accepted artifact cache. Linux's stack-limit-changing behavior is disabled by policy. The conformance capsule snapshots the process environment and verifies that the actor does not mutate it. Other undocumented provider process-global effects remain a falsifier and a reason to promote the later child-process profile.

## Cache identity and transactions

The SHA-256 cache key covers canonical length-delimited records for:

- cache schema version and operation;
- CUDA-JS compiler contract version;
- operating system, architecture, Node ABI, provider versions, provider lengths, and provider SHA-256 values;
- normalized typed options;
- logical program/header names and exact UTF-8 bytes for compile;
- ordered input format, length, and SHA-256 for link;
- requested output format.

Raw concatenation is forbidden. Canonical JSON may describe the record, but all source/header/input bytes are length-delimited and hashed independently before entering it. Object property insertion order is not authority.

A read validates both files, maximum lengths, schema, key recomputation, operation, provider profile, normalized request identity, artifact type, byte length, and artifact digest. Any mismatch is a corruption miss: the entry is quarantined by an atomic same-volume rename when write authority exists, otherwise ignored. Corrupt bytes are never returned.

A write creates unique temporary files in the cache directory, writes artifact then manifest, closes both, and publishes them with same-volume atomic renames. The manifest is published last. Competing identical writers may reuse an already valid winner. Partial files are ignored and may be removed during explicit invalidation. No cleanup scans outside the exact cache directory.

`invalidate(key)` accepts only a lowercase 64-character SHA-256 key and removes that exact manifest, artifact, and known temporary/quarantine names. Missing entries return an idempotent `absent` record. F6 exposes no recursive cache-clear operation.

## Native Windows conformance

The independent MSVC oracle links against the installed `nvrtc.lib` and `nvJitLink.lib` and owns its source/options/pointer tables/program/link resources directly. It compiles the same deterministic vector kernel, records the compiler log, emits PTX, links PTX to cubin, and writes the two artifacts only under ignored build evidence storage.

The Node capsule independently calls the DLL exports through Node FFI, then proves:

- exact NVRTC and nvJitLink reported versions;
- exact normalized option vectors;
- exact C-versus-Node PTX bytes and SHA-256;
- exact C-versus-Node cubin bytes and SHA-256;
- clean-room repeat equality for both artifacts;
- program and link handle destruction on success and controlled failures;
- missing provider/export/version, invalid source, invalid PTX, oversize input/log/output, and unknown-option controls;
- cache miss, validated hit, provider/request key separation, corruption miss, exact invalidation, and read-only behavior;
- no source/header/native handle/path in public or durable cache records;
- application event-loop responsiveness while native compilation occurs;
- PTX and cubin load/function/launch/output parity through the accepted DriverActor;
- terminal zero CompilerActor resources, proven close, and Worker exit zero.

GPU-free compiler/linker evidence is reported separately from Driver module-load and launch evidence. A host may prove NVRTC/nvJitLink and cache behavior without claiming a functioning Driver or GPU.

## Linux preparation boundary

F6 now retains implemented, non-promoting Linux source for:

- one shared native compile/link/lifecycle engine with thin Windows and Linux provider profiles;
- canonical `/usr/local/cuda-13.3/targets/x86_64-linux` discovery without ambient loader fallback;
- an exact official Ubuntu 24.04 package and installed-file manifest covering provider/header/CCCL identity;
- the mandatory `--modify-stack-limit=false` normalized option;
- an exact readiness probe, independent native C oracle build, public CompilerActor parity runner, Driver handoff, and terminal cleanup assertions;
- cache filesystem semantics, corruption controls, and same-volume atomic publication;
- GPU-free compiler/linker evidence separated from Driver/GPU launch evidence.

Portable and Windows evidence validates the shared semantics and guards the accepted peer profile. It does not load Linux providers, prove Linux loader behavior, compile through a Linux provider, or establish native Linux support. The Linux source must run unchanged on the exact Ubuntu cell before any F6L qualification claim.

## Exit and downstream authorization

CJS-F6W is complete only when this specification, CompilerActor, compiler cache, provider manifest, independent MSVC oracle, Windows native parity, cache corruption controls, PTX/cubin Driver handoff, terminal cleanup, Linux runbook, project status, and protected-main evidence agree.

Passing F6W may unblock a detailed Windows-first F7 platform-hardening specification. It does not authorize F7 implementation, compiler child-process recovery, native Linux execution, public compilation concurrency, packaging, or consumer semantics.
