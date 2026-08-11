# CUDA-JS Status

**Status:** Informational

**Updated:** 2026-08-11

## Current phase

The project owner authorized dependency-ordered implementation and a Windows-first platform sequence. `CJS-F1A / EXP-000`, `CJS-F1B`, Windows-only `CJS-F2W / EXP-012`, `CJS-F3W`, and `CJS-F4W` are accepted. The platform-neutral F3/F4 control plane also passes in native Linux CI. Linux `CJS-F2L / EXP-001` and native Linux DriverActor/memory execution remain incomplete until a qualified native Driver/GPU smoke passes; they do not block Windows work. A bounded Windows F5 module/launch/completion contract is now dependency-ready, but its implementation is not authorized yet.

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
- 17 reviewed private Tier-0 functions, including automatic versioned aliases and the five F4 memory calls;
- 11 target types covering scalar, enum, opaque handle, device address, structure, size, and out-parameter storage;
- generated Runtime IR, private Node FFI definitions, packers, TypeScript metadata, conformance/diff/coverage/compatibility data, and exact product hashes;
- 483 discovered Driver declarations, with all 466 unselected declarations cataloged unavailable;
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

## Deferred incomplete Linux F2L

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

F1A proves the exact synthetic host-call profiles. F1B proves pinned facts, reviewed private semantics, deterministic products, and the measured Linux/Windows layouts stated above. F2W proves only the exact Windows bootstrap, Driver/GPU/query/context/permission/cleanup profile. F3W proves only the bounded Windows DriverActor/resource/lifecycle profile in SPEC-0003. F4W proves only synchronous bounded device allocation and copied transfers on the exact Windows profile. Native Linux F3/F4 capsules prove platform-neutral control-plane behavior only. These results do not prove Linux Driver execution, arbitrary returned-pointer invocation, Fast FFI dispatch, asynchronous or specialized memory, modules, launch/completion, native deferred-error attribution, performance, packaging, recovery without process restart, or consumer semantics.

## Immediate next boundary

Publish and review the F4W change without weakening protected `main`. Keep [Linux qualification issue #4](https://github.com/iteathen/CUDA-JS/issues/4) aligned with both retained runbooks. The next implementation boundary is an accepted Windows F5 module/launch/completion specification; do not begin F5 code before that contract is reviewed and accepted. Linux qualification can resume independently when suitable hardware becomes available.
