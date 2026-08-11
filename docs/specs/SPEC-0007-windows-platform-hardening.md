# SPEC-0007: Windows Platform Hardening and Portable Diagnostics

**Status:** Accepted

**Date:** 2026-08-11

**Amended:** 2026-08-11 — owner-authorized public testing permits unconfirmed operational profiles while retaining exact-evidence support claims and known-incompatible safety failures.

## Authorization and bounded outcome

The project owner authorized continued Windows-first implementation and self-integration after CJS-F6W merged into protected `main`. This specification authorizes the bounded CJS-F7W slice below and portable preparation for WSL2 and native Linux qualification.

F7W adds fail-closed host and CUDA-device diagnostics, explicit Windows WDDM/TCC and kernel-timeout reporting, permission-model probes, sanitized CompilerActor results, deterministic failure injection, property partitions, repeated lifecycle stress, and broad regression ceilings. It changes no kernel, memory, compiler, linker, cache, or public capability semantics accepted by SPEC-0003 through SPEC-0006.

F7W does not authorize native Linux CUDA claims, Linux ARM64 SBSA promotion, WSL2 CUDA promotion, arbitrary environment or filesystem disclosure, arbitrary command execution, device-mode mutation, watchdog bypass, privileged setup, crash recovery, cancellation, concurrent execution, performance claims, packaging, or a stable public API.

## Design and trust boundary

`runtime.platform-diagnostics` owns copied, sanitized platform classification and support assessment. It accepts ordinary data and DriverActor descriptions; it never opens a native provider, runs a system command, changes a device setting, or receives a raw handle. DriverActor remains the sole owner of CUDA device queries. CompilerActor remains the sole owner of compiler/linker providers and cache I/O.

The diagnostic record answers four bounded questions:

1. Is the host native Windows x64, native Linux x64, native Linux ARM64, WSL1/WSL2 x64, or unsupported?
2. Is the minimum Node/FFI/permission substrate present, and is its evidence qualified or unconfirmed?
3. On qualified Windows, does CUDA report TCC mode, kernel execution timeout, integration, and compute mode for device zero?
4. Is the combination testing-unconfirmed, diagnostic-only, backend-incomplete, or known-incompatible?

No heuristic or successful test run may promote support. Unconfirmed profiles may operate to generate evidence, but only reviewed native evidence may change the support matrix. WSL markers can classify an environment for a human; the missing WSL/Linux backends remain operational blockers rather than evidence judgments.

## Host contract

`inspectHostProfile()` returns a frozen schema-versioned record with:

- exact Node version and ABI;
- `platform`, `architecture`, kernel release, and OS version;
- one bounded host kind;
- FFI launch state and permission state;
- a support disposition and human action.

Supported host kinds are `windows-native-x64`, `linux-native-x64`, `linux-native-arm64`, `wsl1-x64`, `wsl2-x64`, and `unsupported`. Linux ARM64 is an SBSA qualification candidate only. WSL is diagnostics-only. Native Linux x64 remains qualification-required until the retained F2L through F6L gates pass.

The permission state is one of:

- `unrestricted-process`: the permission model is not active;
- `explicit-ffi`: the permission model is active and FFI was explicitly allowed;
- `ffi-denied`: the permission model is active without FFI authority.

The diagnostic records only whether required flags are present. It does not copy the command line or permission paths. Native actors require permission and FFI flags as explicit process arguments so their finite Worker flag projection cannot silently discard a permission profile supplied through ambient process configuration.

## Windows CUDA contract

The Windows DriverActor description adds these pinned `cuDeviceGetAttribute` facts for device zero:

- `kernelExecTimeout` (`CU_DEVICE_ATTRIBUTE_KERNEL_EXEC_TIMEOUT`, 17);
- `integrated` (`CU_DEVICE_ATTRIBUTE_INTEGRATED`, 18);
- `computeMode` (`CU_DEVICE_ATTRIBUTE_COMPUTE_MODE`, 20);
- `tccDriver` (`CU_DEVICE_ATTRIBUTE_TCC_DRIVER`, 35).

Binary attributes must be zero or one. Compute mode must be an integer from zero through three. The diagnostic maps compute modes to `default`, `exclusive-thread`, `prohibited`, or `exclusive-process` without changing them.

On Windows, `tccDriver: 1` reports `tcc`; `tccDriver: 0` with `kernelExecTimeout: 1` reports `wddm-watchdog`; and `tccDriver: 0` with no timeout reports `wddm-no-watchdog`. These labels describe CUDA-reported device-zero facts only. F7 does not infer other adapters, sessions, display attachment, scheduling policy, or safe maximum kernel duration.

The public testing execution path requires native Windows x64, Node 26.1.0 or later, experimental FFI enabled, explicit FFI authority when the permission model is active, an operational DriverActor description, and non-prohibited compute mode. Unconfirmed Node, Driver, or GPU identities may operate and report `testing-unconfirmed` without an opt-in. Missing required substrate, an unavailable backend/provider surface, malformed or contradictory safety facts, and prohibited compute mode fail with stable incompatibility reason codes. Exact Node 26.7.0 and accepted hardware evidence remain the qualification baseline; operation alone does not inherit that evidence.

## Security and result containment

DriverActor result validation remains mandatory. CompilerActor adds the equivalent bounded public-record validation before every Worker result or serialized error crosses the boundary. Public records reject raw buffers, array buffers, shared buffers, big integers, functions, symbols, non-plain objects, non-safe numbers, oversized strings, excessive depth/nodes, and oversized byte copies.

Public diagnostics never include provider paths, cache paths, source or header contents, process environment values, command lines, native pointers, or native objects. Provider identity remains limited to the accepted digest/version record from SPEC-0006.

The Windows permission capsule launches child processes with the Node permission model. It proves denial without FFI authority and successful DriverActor/CompilerActor startup, inspection, and terminal close with the minimal explicit FFI, Worker, and filesystem authorities required by the exact profile. Permission evidence records only allowed capability classes, never the permitted paths.

## Failure and stress partitions

Test-only backends expose finite allowlisted failure modes. They are inaccessible from production runtime constructors.

The F7 portable capsule covers:

- malformed host/device facts and every support disposition;
- deterministic generated valid/invalid request cases with a fixed seed and stable case IDs;
- Driver immediate failure, deferred failure, completion timeout, and unexpected Worker loss;
- Compiler compile/link operation failure, destruction failure, and unexpected Worker loss;
- cache corruption, read-only behavior, and inaccessible-cache failure;
- repeated DriverActor and CompilerActor open/use/close cycles;
- exact terminal resource equality and zero live/closing/orphaned inventory after graceful cycles;
- application-loop responsiveness during injected blocking work;
- broad elapsed-time ceilings used only to detect severe regressions.

A destruction failure makes cleanup unproved and health `restart-required`. Operation failures with proved destruction remain recoverable. Unexpected Worker loss never claims inaccessible cleanup.

The Windows native capsule repeats bounded DriverActor and CompilerActor cycles, rechecks exact device diagnostics each cycle, and requires graceful resource/library/Worker terminal records. It records elapsed time and process memory as observations. Passing a broad ceiling is not a throughput, latency, memory-footprint, or leak-free product claim.

## Linux and WSL handoff

Portable host classification and malformed-record tests run on Windows and Linux CI. Native Linux readiness records the host kind and rejects WSL as native evidence. The retained human runbook must preserve:

1. native glibc x86-64 F2L through F6L completion;
2. independent native Linux ARM64 ABI, loader, Driver, compiler, cache, permission, and cleanup evidence before SBSA promotion;
3. separate WSL2 Driver/provider discovery, permission, device, execution, compiler, and teardown evidence;
4. exact profile-keyed evidence and support-matrix updates in the same pull request.

The absence of qualified hardware leaves these paths present and incomplete. Contributors must not weaken Windows checks or portable controls to make an unqualified environment pass.

## Acceptance

CJS-F7W is complete only when:

- this specification, component ownership, registry, status, next-step record, and support matrix agree;
- portable diagnostics, property/failure partitions, and repeated lifecycle stress pass under exact Node 26.7.0 while candidate-version logic proves unconfirmed operation and known-incompatible rejection;
- Windows permission denial/allow evidence passes;
- Windows DriverActor reports and validates the four new CUDA attributes;
- repeated Windows native DriverActor and CompilerActor cycles close gracefully with balanced resources and Worker exit zero;
- existing F1 through F6 Windows and portable regressions remain green;
- Linux/WSL preparation remains explicit, independently completable, and unpromoted.

Passing F7W may unblock a bounded packaging/public-facade specification. It does not authorize package publication or CUDA-MCGS integration by itself.
