# SPEC-0008: Windows Package, Public Facade, and Independent Consumer

**Status:** Accepted

**Date:** 2026-08-11

**Amended:** 2026-08-11 — the package manifest is public, unconfirmed operational profiles are allowed during the project-wide testing phase without a compatibility opt-in, and the project owner selected AGPL-3.0-or-later with a separately negotiated commercial-license path.

**Amended:** 2026-08-12 — additive public capabilities accepted by SPEC-0010, SPEC-0011, and SPEC-0012 are part of the packaged facade. Package identity advances to `0.1.0-alpha.3`; each added capability retains its own native promotion gate and does not inherit qualification merely from packaging.

**Amended:** 2026-08-12 — accepted SPEC-0016 adds the opaque one-pending-operation `submit/status/wait/close` lifecycle through the existing execution/DriverActor/facade owners. Package identity advances to `0.1.0-alpha.4`; SPEC-0016 remains natively unqualified until its exact Windows promotion evidence passes.

**Amended:** 2026-08-25 — ADR-0006 and owner direction admit the implemented native Linux x86-64 Driver/compiler profiles through the unchanged OS-neutral facade as `testing-unconfirmed`. Package identity advances to `0.1.0-alpha.8`; API schema remains 1, and Linux support remains unqualified until exact F2L-F8L installed-package evidence passes.

**Amended:** 2026-08-26 — accepted SPEC-0021 exposes allocation-owned opaque contiguous device views through the existing memory capability. Package identity advances additively to `0.1.0-alpha.9`; public API schema remains 1, and native view consumption remains unqualified.

**Amended:** 2026-08-26 — accepted SPEC-0028 adds standalone typed Device-JS library compilation and explicit composed-program imports through existing compiler/linker ownership. Package identity advances additively to `0.1.0-alpha.10`; public API schema remains 1, and native composition remains unqualified.

**Amended:** 2026-08-26 — accepted SPEC-0020 adds the opaque kernel-only prepared-operation-DAG public capability and semantic single-stream replay through the existing operation owner. Package identity advances additively to `0.1.0-alpha.11`; public API schema remains 1. CUDA Graph realization, native qualification, and performance benefit remain outside the claim.

**Amended:** 2026-08-26 — accepted SPEC-0023/SPEC-0029 add one lazy opaque cuBLASLt adapter and bounded f32 row-major matmul plan through typed views and the existing operation owner. Package identity advances additively to `0.1.0-alpha.12`; public API schema remains 1. Other providers, dtypes/layouts, tensor semantics, Linux qualification, and performance remain outside the claim.

## Authorization and bounded outcome

The project owner authorized continued Windows-first implementation, retained Linux preparation, publication through a protected pull request, and self-merge after required checks pass. This specification authorizes CJS-F8: an installable no-addon Node package, one safe asynchronous public facade, exact compatibility metadata, portable package conformance, and an unrelated synthetic consumer.

F8 consumes the accepted F3 through F7 components without widening their native CUDA support claims. Later accepted additive specifications may widen the packaged public surface while preserving this ownership boundary. The native runtime has shared engines with source-admitted Windows x64 and Linux x64 profiles. Node 26.1.0 or later and structurally admitted native profiles may operate for testing; only exact capability/profile combinations with required evidence carry qualified support. Linux x64 remains not-qualified, while Linux ARM64 SBSA and WSL2 retain incomplete backend paths. Windows evidence never promotes Linux.

F8 does not authorize a registry release, a production-stability claim, a project-specific native addon, arbitrary native calls, raw pointers, unchecked schemas, caller-selected libraries or provider paths, public raw streams/events, unbounded concurrency, broader memory kinds, callbacks, forced cancellation, crash recovery, performance claims, CUDA-MCGS integration, or a native Linux CUDA support claim from source admission.

## Package boundary

The repository root is the package root. `runtime.facade` owns the public API. Production implementation remains in registered components; the root contains metadata and scripts only. The package is ESM-only, has no runtime dependency, ships no project-specific native binary, is not marked private, and declares Node 26.1.0 as its minimum known-operational testing substrate. Exact Node 26.7.0 remains the qualified evidence baseline where the selected capability also has its required native evidence.

The package exposes only:

- `cuda-js`: the native public facade, errors, host inspection, and compatibility record;
- `cuda-js/compatibility`: the same frozen compatibility record without opening a native provider;
- `cuda-js/testing`: an explicitly mock-only facade for consumer lifecycle and orchestration tests.

Component internals, actor constructors, testing hooks, schemas, experiments, build output, native oracles, provider paths, and raw compatibility inputs are not package exports. Direct filesystem deep imports are unsupported.

The public package manifest permits deliberate distribution under AGPL-3.0-or-later. Separately negotiated commercial terms may be offered by the copyright holder but are not granted by the repository. Registry publication remains pending until a separately authorized release completes provenance and registry checks. A versioned tarball and installation from the public repository are the accepted F8 distribution forms.

## Public facade contract

`openCudaRuntime(options)` opens one public runtime. Options contain exactly:

- `driver`: optional accepted DriverActor queue, memory, and execution policy;
- `compiler`: `false` by default, `true` for a cache-disabled compiler, or accepted cache options.

Opening rejects only known-incompatible host, Node, FFI, permission, provider, or device-safety conditions before or during native provider work. It then opens one DriverActor, assesses the copied Driver description, permits `testing-unconfirmed` operation without a separate opt-in, and optionally opens one CompilerActor. A later open failure closes every owner that was already acquired before rejecting.

The runtime exposes:

- frozen `state`, `health`, and `compilerEnabled` observations;
- `describe()` with package/API identity, support assessment, copied Driver/device limits, bounded usage, and compiler status;
- `allocateDevice()`, returning a device-memory capability object;
- `loadModule()`, returning a PTX/cubin module capability object;
- `compile()`, `link()`, and `invalidateCache()` only when the optional compiler is enabled;
- idempotent `close()`, which closes compiler ownership before Driver ownership and returns an aggregate terminal report.

The facade never exposes internal actor objects, runtime IDs, epochs, native/provider paths, native handles, registry tokens, operation tokens, context tokens, stream/event identities, private request records, or mutable native-backed views.

Later accepted compiler/execution specifications may add bounded typed values, artifact families, or opaque resource capabilities through these existing facade owners. They must update package identity, compatibility metadata, declarations, and installed-consumer conformance coherently; packaging does not create or widen their native qualification.

## Resource capabilities

Device memory, modules, functions, and operations are ordinary JavaScript objects whose private state contains the accepted opaque actor token. They cannot be constructed through a package export.

A device-memory capability exposes copied `write()`, copied `read()`, `status()`, and idempotent `close()`. A module exposes `getFunction()`, `status()`, and `close()`. A function exposes terminal `launch()`, SPEC-0016 `submit()`, `status()`, and `close()`.

Under SPEC-0016, `submit()` returns an opaque `CudaOperation`. The operation exposes `status()`, `wait()`, and `close()` only. Status performs one short serialized DriverActor observation turn. Wait performs repeated short status turns outside the DriverActor and does not itself impose the legacy terminal-launch deadline. Pending operation close reports busy rather than claiming cancellation. One pending operation and one private execution stream remain the first-slice limit. Legacy `launch()` remains a terminal convenience implemented above the DriverActor as submit plus repeated short status turns with the existing SPEC-0005 deadline/restart-required semantics.

Under SPEC-0011, the closed public function-parameter set is `device-memory`, `u32`, `u64`, `i32`, and `f32`. Public launch arguments are capability objects or exact scalar values in the declared order: `u64` uses JavaScript `bigint`; `u32`, `i32`, and `f32` use their SPEC-0011 number contracts. The facade translates them to the private actor protocol and rejects closed, wrong-kind, cross-runtime, out-of-range, or otherwise invalid values before native launch.

Under SPEC-0010 and SPEC-0012, the optional compiler facade also exposes typed relocatable-PTX compilation and typed `lto-ir` output/homogeneous Device-LTO linking through the existing CompilerActor owner. Raw NVRTC/nvJitLink controls remain private. These additive public capabilities remain natively unqualified until their own exact promotion evidence passes.

Closing a runtime marks all facade capabilities terminal. Graceful actor close marks them closed. Unexpected owner loss marks them orphaned and preserves the accepted restart-required claim. Runtime close may bounded-observe one pending SPEC-0016 operation before dependency teardown; if operation terminality remains unproved, graceful cleanup is not claimed. Explicit resource close remains primary; finalizers are not added.

## Errors and compatibility

All facade failures use `CudaJsError`. Stable fields are `code`, `category`, `operation`, `details`, `healthBefore`, and `healthAfter`. Accepted actor error codes and categories are preserved, while native causes and objects are not exposed. Unknown failures become a bounded internal error.

The committed compatibility manifest identifies:

- package version and public API schema;
- minimum operational Node substrate, exact qualified Node version/module ABI, and unconfirmed-operation policy;
- supported, qualification-required, diagnostic-only, and unsupported hosts;
- accepted CUDA header, Driver API, compiler/linker provider, artifact, memory, execution, operation-lifecycle, scalar-argument, RDC, and Device-LTO public capability surfaces;
- permission and launch requirements;
- strict-JIT, process-isolation, native-addon, and native-Linux dispositions;
- migration and evidence-invalidation rules.

Implementation availability and native qualification are separate dimensions. The compatibility record may advertise an implemented typed or opaque capability while simultaneously stating that the capability is not yet natively qualified.

Before 1.0, a compatible patch may repair behavior without changing the API schema. Additive prerelease work increments the package prerelease/minor identity. Any incompatible public shape, ownership, lifetime, error, support, or compatibility change increments the public API schema and requires a new accepted specification plus consumer conformance.

## Independent consumer and installation conformance

F8 builds a tarball with the qualified Node toolchain, inspects its exact file list, installs it into clean generated consumer directories, runs consumers through package exports, uninstalls it, and proves package-owned files are removed. Build output owns generated tarballs and consumer directories.

The portable unrelated consumers use `cuda-js/testing` for copied-memory, module/function, typed scalar launch, opaque operation submit/status/wait/close, compiler, relocatable PTX, Device-LTO, linker, resource-close, and runtime-close orchestration without consumer-specific semantics. A second simultaneous runtime proves instance isolation, cross-runtime rejection, and that closing one instance does not invalidate the other.

The native Windows consumer imports only `cuda-js`, executes the tracked vector-add PTX through facade capabilities, compares exact copied output and checksum, and proves terminal package-level resource and Worker closure. Existing independent C-oracle evidence remains the native-result oracle; F8 does not replace it with package self-comparison. SPEC-0016 and other new additive capabilities are not treated as native-qualified by this legacy F8 consumer; they retain the native evidence required by their owning specifications.

The first-consumer-deletion check proves that package implementation and compatibility files contain no dependency on the first consumer, its schemas, or its repository. Documentation may explain repository boundaries, but no package operation depends on them.

## Linux and WSL completion path

On native Linux and WSL, package installation, ESM import, compatibility inspection, stable unsupported/qualification-required errors, mock-only consumer behavior, multiple instances, tarball contents, and uninstall must pass in CI without a CUDA provider.

The human handoff names the remaining native work: canonical `libcuda.so.1`, NVRTC, and nvJitLink adapters; retained F2L through F8L evidence; exact permission and provider discovery; independent C parity; package-root native consumer execution; and terminal cleanup. The Windows facade contract and consumer fixtures are reused rather than forked. Linux promotion changes the compatibility manifest only after exact native evidence passes.

## EXP-010 and EXP-011 disposition

EXP-010 is not triggered for F8. Accepted in-process Workers keep blocking work off the application event loop, and F7 proves bounded graceful lifecycle behavior on Windows. Process isolation remains an optional profile if a real consumer requires crash containment or a provider cannot satisfy process-global side-effect controls. Worker loss remains restart-required and is not described as process isolation.

EXP-011 is not triggered for F8. Every accepted operation is callable through an approved named export, and no measured mandatory performance or callable-pointer gap remains. `fast-jit-required` is explicitly unsupported. A future strict-JIT or arbitrary-pointer requirement must trigger EXP-011 and a separate accepted decision; timing alone cannot promote it.

## Acceptance

CJS-F8 is complete only when:

- this specification, package metadata, component ownership, registry, support matrix, status, and validation policy agree; unfinished lower-authority plans may lag only when explicitly recorded for later reconciliation;
- package exports reveal only the accepted public, compatibility, and mock-testing surfaces;
- exact Node 26.7.0 tarball, install, import, current additive public-capability consumer including SPEC-0016 operation lifecycle, two-instance, first-consumer-deletion, and uninstall qualification checks pass, while package metadata admits Node 26.1.0-or-later testing candidates;
- public resources hide actor/operation tokens and reject cross-runtime, wrong-kind, closed, and post-runtime-close use;
- public errors and descriptions contain no native capability or provider path;
- the exact Windows package consumer passes native vector execution and graceful aggregate teardown;
- additive capabilities with separate native gates remain explicitly unqualified until their owning evidence passes;
- Linux CI passes the portable package and readiness capsules while retaining an explicit native qualification requirement;
- existing Windows F1 through F7 and portable Linux controls remain green;
- protected required checks pass for the exact reviewed head before merge.

Passing F8 authorizes a bounded F9 compatible-pair specification. It does not authorize CUDA-MCGS code, a registry release, public production support, or a native Linux claim by itself.
