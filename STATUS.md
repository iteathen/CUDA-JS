# CUDA-JS Status

**Status:** Informational

**Updated:** 2026-08-11

## Current phase

The project owner authorized dependency-ordered implementation and a Windows-first platform sequence. `CJS-F1A / EXP-000`, `CJS-F1B`, Windows-only `CJS-F2W / EXP-012`, and Windows `CJS-F3W` through `CJS-F8W` are accepted on their bounded evidence. The platform-neutral F3 through F8 control plane and package path also pass without requiring Linux CUDA providers. Linux `CJS-F2L / EXP-001` and native Linux DriverActor/compiler execution remain incomplete until qualified native evidence passes; they do not block Windows work.

## Promoted F1A result

EXP-000 independently passes on both required x64 profiles, Windows x64 and native Linux x86-64:

- Windows 10.0.26200 x64, official Node 26.7.0 with `--experimental-ffi`, and MSVC 19.50.35730;
- native Ubuntu 24.04.4 x86-64 under Hyper-V, Linux 6.8.0-137-generic, official Node 26.7.0 with `--experimental-ffi`, and GCC 13.3.0;
- 59 native-vs-JavaScript ABI correctness cases on each profile;
- 6 unit tests for packers, Runtime IR, and static eligibility;
- direct-C parity for scalar, pointer, out-parameter, table, natural/nested/union/pointer-field, and 16-byte-aligned storage;
- same-thread callback, resolver-only pointer-gap, permission, library-close, stale/cross-runtime, foreign-view, responsiveness, graceful shutdown, and unexpected Worker-loss capsules;
- zero live synthetic allocations at every graceful terminal inventory;
- separate benchmark samples with no direct Fast FFI or performance-support claim.

The Windows and Linux native binaries and raw evidence remain independently preserved in ignored `build/exp-000/` storage. The Linux evidence copy is under ignored `build/exp-000/linux-x64/evidence/`. Official Node archives were checksum-verified; system Node installations were not replaced.

## Accepted F1B result

The accepted schema/ABI foundation contains:

- hash-pinned official CUDA 13.3.29 Ubuntu 24.04 package, `cuda.h`, `cudaTypedefs.h`, package license, and Clang 18.1.3 identity;
- a deterministic Clang AST and macro-alias importer under the accepted schema-compiler contract;
- 27 reviewed private Tier-0 functions, including automatic versioned aliases and the F4 memory/F5 execution calls;
- 16 target types covering scalar, enum, opaque handle, device address, structure, size, and out-parameter storage;
- generated Runtime IR, private Node FFI definitions, packers, TypeScript metadata, conformance/diff/coverage/compatibility data, and exact product hashes;
- 483 discovered Driver declarations, with all 456 unselected declarations cataloged unavailable;
- independent Linux x86-64 C size/alignment/offset probes;
- six detected mutation classes: size, alignment, field offset, parameter type, native symbol, and required semantic field;
- a second complete native generation matching committed products byte-for-byte.

The Windows and native Linux EXP-000 regressions remain green after F1B integration: 6 unit tests, 59 ABI correctness cases, lifecycle, responsiveness, and terminal cleanup per profile.

## Accepted Windows F2W result

EXP-012 passes on Windows 10.0.26200 x64 with official Node 26.7.0, MSVC 19.50, CUDA Toolkit 13.3.0, CUDA header/runtime input 13.3.29, NVIDIA Driver 610.74 exposing Driver API 13030, and a GeForce GTX 1660 Ti at compute capability 7.5.

The accepted result includes:

- Windows `cuda.h` hash-identical to the accepted F1B header;
- independent MSVC parity for all 9 selected layouts and 12 function-pointer widths;
- all 12 generated named exports bound from the canonical system Driver;
- all 12 public-name `cuGetProcAddress` queries returning success/status/non-null evidence;
- exact Node-versus-C parity for initialization, Driver version, one device, selected attributes, success error text, and context create/current/clear/restore/destroy;
- missing library, invalid flags, missing symbol, insufficient version, versioned query-name, permission denial/allow, stale wrapper, and cleanup controls;
- terminal null current context, closed DynamicLibrary, rejected stale wrapper, Worker exit zero, and no pointer values crossing the Worker boundary.

This result supplied the accepted native prerequisite for Windows F3. It does not authorize Linux DriverActor execution or later memory and execution layers by itself.

## Accepted Windows F3W result

The accepted F3 slice introduces two bounded internal components under [`SPEC-0003`](docs/specs/SPEC-0003-driver-actor-resource-lifecycle.md):

- a dedicated Worker with one runtime epoch, one canonical Driver library, one selected device, and one private context;
- an opaque registry with runtime, epoch, kind, slot, generation, nonce, and state validation;
- parent/child dependencies, in-flight leases, slot reuse, deterministic close ordering, and explicit orphan inventory;
- a finite async command protocol, bounded pending work, structured errors, and monotonic health states;
- context-currentness checks performed only on the owning Worker;
- responsive application-thread behavior while the mock backend blocks;
- graceful context/library/Worker teardown with stale-wrapper rejection;
- restart-required epoch invalidation after unexpected Worker loss without claiming inaccessible native cleanup.

On Windows 10.0.26200 x64, official Node 26.7.0 uses the canonical system Driver and reproduces the accepted F2W Driver, device, attribute, and context profile across repeated actor turns. Terminal evidence records a destroyed context, null current context, closed library, rejected stale wrapper, and Worker exit zero.

The same platform-neutral resource, protocol, health, responsiveness, graceful-close, and unexpected-loss capsule passes on native Ubuntu 24.04.4 x86-64 with official Node 26.7.0. That evidence prepares the Linux control plane; it does not load a Linux NVIDIA Driver or establish Linux CUDA support.

## Accepted Windows F4W result

The accepted F4 slice adds the bounded `runtime.memory` owner and five generated Driver calls under [`SPEC-0004`](docs/specs/SPEC-0004-device-memory-foundation.md):

- an exact configurable device quota, per-allocation cap, and copied-transfer cap;
- safe-integer range partitions and rejection before native invocation;
- synchronous copied `Uint8Array` write/read behavior with caller snapshot isolation;
- opaque `device-memory` registry children, leases, stale generation rejection, and slot reuse;
- reservation before allocation, rollback on failure, and capacity recovery only after proved free;
- allocation-before-context teardown and retained reserved-byte/orphan evidence after unexpected Worker loss;
- deterministic Ubuntu/Clang generation for 17 functions and 11 types, with a CI artifact and clean checked-in comparison;
- a portable memory-manager/actor capsule suitable for Windows and native Linux CI.

On the accepted Windows profile, an independent MSVC C oracle and the Node DriverActor produced byte-for-byte identical full and offset copies for the 4,096-byte fixture and checksum `3521616638`. The native capsule also proves capacity observation, configured pressure, exact-edge/out-of-bounds behavior, explicit free, stale rejection, generation advance, allocation-before-context/library cleanup, zero terminal live/closing/orphaned resources, and Worker exit zero. No native address or native storage crosses the actor boundary.

The human Linux F4 handoff is retained in [`conformance/f4/README.md`](conformance/f4/README.md). It identifies the remaining canonical Driver discovery, F2L/F3L prerequisites, adapter, five-call, C-oracle, permission, evidence, and cleanup gates without claiming that CI mocks establish Linux CUDA support.

## Accepted Windows F5W result

The accepted F5 slice adds the bounded `runtime.execution` owner and ten generated Driver calls under [`SPEC-0005`](docs/specs/SPEC-0005-module-launch-completion.md):

- copied NUL-free seven-bit PTX with bounded size and SHA-256 identity;
- exact named function schemas limited to opaque device-memory and `u32` parameters;
- naturally aligned, zero-padded packed argument storage with explicit size;
- one private nonblocking stream, one in-flight launch, and one private event per completion;
- function and repeated device-memory leases retained through terminal event observation;
- adaptive nonblocking event polling, terminal deferred-error attribution, and restart-required timeout owner loss;
- exact `CUlaunchConfig` generation from independently measured 56-byte Win64 layout facts;
- deterministic Ubuntu generation for 27 functions and 16 types plus the full portable execution capsule.

On the accepted Windows profile, the independent MSVC oracle and Node DriverActor loaded the same tracked PTX and produced byte-for-byte identical 1,024-element vector-add output with checksum `15600773`. Both independently use parameter offsets `0, 8, 16, 24` and a 28-byte packed buffer. Native evidence also proves invalid PTX/missing-function validation without health degradation, responsive application-loop completion polling, explicit function/module release, stale rejection, event/module/stream/context cleanup, zero live/closing/orphaned terminal resources, and Worker exit zero. No PTX contents, parameter storage, stream/event, handle, or address crosses the Worker boundary.

The human Linux F5 handoff is retained in [`conformance/f5/README.md`](conformance/f5/README.md). Shared schema, packing, protocol, mock terminality, loss controls, PTX, and C-oracle source are complete. Native `libcuda.so.1` discovery, adapter work, GPU execution, and native cleanup evidence remain explicitly incomplete.

## Accepted Windows F6W result

The accepted F6 slice adds `runtime.compiler-actor`, a validated content-addressed cache, and bounded cubin handoff under [`SPEC-0006`](docs/specs/SPEC-0006-compiler-linker-cache.md):

- a CompilerActor Worker separate from the DriverActor, with serialized program/link lifetimes and conservative unexpected-loss reporting;
- canonical CUDA 13.3 NVRTC, builtins, and nvJitLink discovery with exact versions, lengths, SHA-256 identities, and named exports;
- copied CUDA C++ source, logical headers, PTX inputs, typed normalized options, bounded diagnostics, and no file/include/provider-path escape hatch;
- deterministic cache keys covering the provider profile and normalized request identity, with full manifest/digest validation, corruption quarantine, atomic publication, read-only/disabled modes, and exact-key invalidation;
- PTX artifacts without the provider terminator, opaque cubin artifacts, and copied handoff to the existing module/function/launch boundary;
- portable option/cache/protocol/lifecycle fixtures, including the mandatory Linux `--modify-stack-limit=false` rule;
- a direct independent MSVC compiler/linker oracle and complete Windows Driver execution capsule.

On the accepted Windows profile, NVRTC 13.3 produces a 1,123-byte PTX artifact with SHA-256 `488296f21234a5adec63c2fa2bd9709b45a3471f84e60d12d1a7f9fc6af8b6a9`; nvJitLink 13.3 produces a 3,368-byte cubin artifact with SHA-256 `904978991244d77a25bf7c7a2e7a6b1d2528d51df2af2bd6338167353fc010b4`. Production Node FFI and the independent C oracle agree byte-for-byte across clean runs. Cache miss/hit/corruption/invalidation controls pass, the application loop remains responsive, both artifacts execute through the DriverActor with checksum `15600773`, and compiler, linker, module, stream, context, library, and Worker cleanup is terminal.

The human Linux F6 handoff is retained in [`conformance/f6/README.md`](conformance/f6/README.md). It specifies canonical ELF provider discovery, the Linux side-effect guard, independent oracle parity, cache filesystem partitions, evidence, and promotion rules. No Linux compiler/linker or Driver success is claimed.

## Accepted Windows F7W result

The accepted F7 slice adds `runtime.platform-diagnostics` and hardens both native actors under [`SPEC-0007`](docs/specs/SPEC-0007-windows-platform-hardening.md):

- exact host classification for native Windows x64, native Linux x64, native Linux ARM64, WSL1/WSL2 x64, and unsupported profiles;
- fail-closed Node/FFI/permission and DriverActor support assessment;
- CUDA-reported device-zero WDDM/TCC, kernel-timeout/watchdog, integration, and compute-mode facts without device mutation;
- inherited permission-model flags for DriverActor and CompilerActor Workers, closing a discovered permission-bypass defect caused by replacement Worker flags;
- sanitized unexpected errors and bounded CompilerActor public-result validation;
- fixed-seed property partitions, finite injected compiler destruction/operation failures, cache failure containment, and existing Driver failure/loss partitions;
- 24 DriverActor plus 24 CompilerActor portable lifecycle cycles and 8 plus 8 Windows native cycles with terminal resource balance;
- broad elapsed-time and process-memory ceilings recorded only as regression observations.

On the accepted Windows profile, CUDA reports Driver API 13030, WDDM with kernel execution timeout enabled, non-integrated device memory, and default compute mode for the GTX 1660 Ti. Both actors deny FFI when the Node permission model omits FFI authority, succeed with explicit FFI/Worker/filesystem authority, and close with Worker exit zero. The latest native hardening capsule records roughly 5.5 seconds and 38 MB process RSS growth; these are not product performance claims.

The human F7 handoff in [`conformance/f7/README.md`](conformance/f7/README.md) separately specifies native Linux x86-64, Linux ARM64 SBSA, and WSL2 work. Portable classification and readiness run in Linux CI, but no Linux/ARM64/WSL CUDA support is claimed.

## Accepted Windows F8W result

The amended F8 slice publishes the `cuda-js` 0.1.0-alpha.1 no-addon ESM testing package and `runtime.facade` under [`SPEC-0008`](docs/specs/SPEC-0008-package-public-facade.md):

- exactly three package exports for the native facade, immutable compatibility metadata, and an explicitly mock-only testing facade;
- Node 26.1.0-or-later testing admission, exact Node 26.7.0/module-ABI 147 qualification evidence, stable public errors, optional compiler ownership, and aggregate terminal close;
- private device-memory, module, and function capability objects that hide actor tokens and reject closed, wrong-owner, and cross-runtime use;
- package tarball inspection, clean install/import/uninstall, first-consumer-deletion, two unrelated synthetic consumers, and simultaneous-runtime isolation;
- an installed Windows package consumer that executes the tracked PTX vector kernel with exact checksum `15600773` and graceful Worker/resource closure;
- portable Linux package/import/mock/readiness controls and a human native-adapter handoff without promoting Linux CUDA support.

Strict JIT remains explicitly unsupported because no measured mandatory gap exists. Process isolation remains an optional future profile because accepted in-process Workers satisfy the current event-loop and lifecycle contract; Worker loss is still restart-required. The package manifest is public and unconfirmed Windows CUDA profiles may operate for testing without an opt-in. Registry publication remains pending an owner-selected license and separate release review.

## Hardware qualification program

The published [`docs/HARDWARE_SUPPORT.md`](docs/HARDWARE_SUPPORT.md) list is generated from a validated machine-readable registry. It currently records one directly qualified exact profile: GeForce GTX 1660 Ti, compute capability 7.5, native Windows x64/WDDM, Node 26.7.0, Driver 610.74/API 13030, and CUDA 13.3 through the accepted F2W–F8W surface.

The qualification kit under [`conformance/hardware/`](conformance/hardware/README.md) composes the accepted phase capsules, requires a clean exact commit, indexes evidence by digest, emits a sanitized public summary, and refuses to promote an incomplete platform runner. CUDA 13.3 architecture targets from Turing through current Blackwell targets are tracked only as candidate coverage. Native Linux x64, WSL2 x64, Linux ARM64 SBSA, and Jetson ARM64 remain independently incomplete and gain no support claim from the registry or planning work.

## Node and extended qualification

The generated [`docs/NODE_SUPPORT.md`](docs/NODE_SUPPORT.md) matrix records exact evidence while the package admits Node 26.1.0 or later for public testing. Only Node 26.7.0 is qualified experimentally. Node 26.1.0 through 26.6.0 are `testing-unconfirmed`: they may operate without an opt-in but do not inherit support. Node 26.0.0, Node 25.9.0, Node 24.19.0, and Node 22.23.2 are known-incompatible verified-negative rows because the required built-in FFI substrate is unavailable.

The hardware extension registry separately records multi-GPU, MIG, virtualization, true concurrent launch, performance/thermal/soak, ECC, Driver/toolkit matrices, Windows Server/TCC, and independent attestation as no-support. Each has a public issue, exact environment/evidence contract, safety rules, and no promotable command chain. A portable regression now proves that simultaneous public launch submissions retain their accepted behavior: ordered Worker serialization with one launch in flight. It does not claim concurrent device execution. The current Windows 11 Pro/GTX 1660 Ti Hyper-V route is a verified no-support profile: the read-only probe finds no partitionable GPU or assigned GPU partition, and no VM or device state is changed.

## Deferred incomplete Linux F2L–F8L

The Ubuntu Hyper-V VM remains useful for native Linux CPU/ABI work but has no NVIDIA GPU/Driver exposure. The host GTX 1660 Ti and client-Windows Hyper-V configuration do not provide a supported GPU partition/pass-through path. Windows results must never be labeled as Linux support.

`EXP-001` is nevertheless executable through the hardware boundary. On native Ubuntu 24.04 x86-64 it now:

- acquires and verifies exact official CUDA 13.3 header and Driver-stub packages;
- extracts them into ignored build storage without changing the system Driver;
- compiles and executes the native layout probe, compares every selected ABI fact, and compiles the independent C Driver oracle;
- diagnoses the exact Node/platform/WSL/library/device-node/`nvidia-smi` readiness state;
- provides the final real-Driver Node/C parity, symbol/version/permission, context, library, and Worker-cleanup runner;
- documents host prerequisites, commands, evidence, common failures, safety boundaries, and the completing pull-request checklist in [`experiments/exp-001/README.md`](experiments/exp-001/README.md).

GPU-free preparation passes in the available native Linux guest. The only unexecuted boundary is the real NVIDIA Driver/GPU smoke on a qualified native host.

## Claim limits

F1A proves the exact synthetic host-call profiles. F1B proves pinned facts, reviewed private semantics, deterministic products, and the measured Linux/Windows layouts stated above. F2W proves only the exact Windows bootstrap, Driver/GPU/query/context/permission/cleanup profile. CJS-F3W through CJS-F7W prove only their accepted actor, memory, execution, compiler/cache, diagnostic, permission, failure, and lifecycle slices. F8W proves the exact package exports, install/uninstall behavior, safe facade, independent consumers, multi-instance isolation, and installed-package Windows vector execution. The Node and hardware registries publish exact support evidence without blocking unconfirmed testing operation. Successful operation never expands support by Node patch, module ABI, GPU model, compute capability, Driver, operating system, processor, provider, or virtualization inference. Native Linux F3 through F8 capsules prove platform-neutral control-plane/package/readiness behavior only. These results do not prove native Linux/ARM64/WSL Driver/compiler execution, arbitrary returned-pointer invocation, Fast FFI dispatch, asynchronous or specialized memory, broader compiler options/artifact formats, multi-GPU, MIG, concurrent launch/compile, performance/thermal/soak behavior, ECC behavior, TCC/server, virtualized CUDA, independently attested evidence, process isolation, registry release, production stability, recovery without process restart, or consumer semantics.

## Immediate next boundary

Operate the public testing campaign on unconfirmed Windows CUDA hardware and Node 26.1.0-or-later candidates through the generated evidence lists and qualification kits while keeping [Linux qualification issue #4](https://github.com/iteathen/CUDA-JS/issues/4) aligned with the retained F2L–F8L runbooks. Extended axes #20–#29 remain independently completable without widening support claims. The next runtime boundary is a detailed F9 UMCGS compatible-pair specification consuming only the accepted package contract; registry publication and licensing remain separately gated.
