# F5 module, launch, completion, and Linux handoff

**Status:** Accepted Windows F5W; portable Linux preparation complete; native Linux CUDA incomplete

This capsule owns the evidence for [`SPEC-0005`](../../docs/specs/SPEC-0005-module-launch-completion.md). It separates portable control-plane proof from native Windows proof:

- `run-mock.mjs` proves copied PTX identity, exact schema validation, deterministic parameter packing, memory leases, private event polling, deferred-failure provenance, timeout owner loss, and dependency-safe teardown. It does not execute PTX.
- `build-native-windows.mjs` builds an independent MSVC oracle against the accepted CUDA 13.3 header and import library.
- `run-native-windows.mjs` loads the tracked PTX through the DriverActor, launches vector addition, and compares all output bytes and the checksum with the C oracle.
- `build-capabilities-native-windows.mjs` and `run-capabilities-native-windows.mjs` own the exact Windows native promotion evidence for SPEC-0011 mixed scalar arguments and SPEC-0016 opaque operations. An independent MSVC/Driver oracle declares the mixed signature, verifies type/layout facts and boundary values, and proves a bounded delayed event is initially not-ready. The public facade then proves the same scalar results, separate submit/status/wait/close turns, pending-command backpressure, pending-aware runtime close, conservative deferred-failure provenance in an isolated child context, and terminal cleanup.
- `verify.mjs` checks ignored evidence under `build/f5/`.

Use `npm run f5:portable` with exact Node 26.7.0 on any supported development host. Use `npm run f5` only on the qualified Windows x64 Driver/GPU profile.

The narrower capability lane can be run directly with `npm run f5:capabilities`. Its bounded delay is a semantic event-readiness oracle, not a performance threshold.

## Linux contributor handoff

The shared Linux path is intentionally retained. Native Ubuntu CI regenerates all 27 selected signatures and 16 ABI types from the pinned headers, compares every generated product, and runs the execution owner, packer, protocol, lifecycle mock, deferred-error control, and timeout/loss control. The PTX and independent C oracle are tracked platform-neutral inputs. None of those facts establishes a working Linux Driver path.

A Linux engineer should complete these gates in order on native Linux x86-64 with an NVIDIA GPU and real Driver exposed:

1. Complete the existing F2L, F3L, and F4L gates in [`experiments/exp-001/README.md`](../../experiments/exp-001/README.md) and [`conformance/f4/README.md`](../f4/README.md). Do not bypass canonical library, permission, context, memory, or cleanup checks.
2. Add a `linux-native` adapter beside `windows-native.mjs`. Keep `ExecutionManager`, `MemoryManager`, the resource graph, protocol, policy, packing, polling, and public records unchanged.
3. Resolve canonical `libcuda.so.1` without accepting caller paths or the toolkit stub as a runtime Driver. Record the resolved identity and reject ambiguity.
4. Bind exactly the ten F5 exports already selected by the generated schema. Preserve their versioned aliases and reviewed deferred-error semantics.
5. Build `native/windows-launch-oracle.c` with a small platform portability layer or add a Linux sibling that preserves the same PTX bytes, four parameter offsets, 28-byte buffer, launch dimensions, event-query loop, output bytes, checksum, and explicit event/module/stream/context cleanup records.
6. Run C-versus-Node vector parity and all portable controls with exact Node 26.7.0. Demonstrate that no raw native state crosses the Worker boundary.
7. Record OS/kernel/ABI, Node executable, Driver, GPU, toolkit/header, resolved library, generated products, oracle artifact, output checksum, terminal inventory, and honest claim limits. Keep machine binaries and raw evidence in ignored `build/` storage.
8. Run the full portable suite and the completed native F2L–F5L sequence. A completing pull request must name the exact host profile and must not generalize beyond what ran.

Expected blockers are no GPU exposure, absent or stub-only Driver, permission denial, symbol/version disagreement, PTX JIT incompatibility, context-currentness loss, output mismatch, deferred kernel failure, timeout, cleanup failure, nonzero live/orphan inventory, or nonzero Worker exit. Report these directly; do not weaken a gate.

The public coordination point remains [Linux qualification issue #4](https://github.com/iteathen/CUDA-JS/issues/4). Add F5 findings there or open a linked pull request so the retained F2L–F5L sequence stays coherent.

## Claim boundary

Windows F5W proves one tracked PTX vector kernel through one private stream and event-polled completion on the exact accepted Windows profile. The portable capsule proves shared orchestration only. Native Linux CUDA, compilation, caching, broader artifacts or scalar types, concurrent launches, public streams/events, performance, packaging, and stable API remain unclaimed.
