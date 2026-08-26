# F5 module, launch, completion, and Linux handoff

**Status:** Accepted Windows F5W; OS-neutral F5 native runner/oracle source complete; Linux not-qualified

This capsule owns the evidence for [`SPEC-0005`](../../docs/specs/SPEC-0005-module-launch-completion.md). It separates portable control-plane proof from native Windows proof:

- `run-mock.mjs` proves copied PTX identity, exact schema validation, deterministic parameter packing, memory leases, private event polling, deferred-failure provenance, timeout owner loss, and dependency-safe teardown. It does not execute PTX.
- `build-native.mjs` and `run-native.mjs` select thin Windows/Linux toolchain profiles around one launch oracle and one shared DriverActor path.
- `build-capabilities-native.mjs` and `run-capabilities-native.mjs` own native evidence for SPEC-0011 mixed scalar arguments, SPEC-0016 opaque operations, SPEC-0018 capacity-two scheduling, SPEC-0019 bounded asynchronous transfers, and SPEC-0014 publication mailboxes. One portable C oracle declares the mixed signature, verifies type/layout facts and boundary values, proves a bounded delayed event is initially not-ready, checks pinned H2D/D2D/D2H bytes, and publishes `41` then `42` through registered/mapped storage. Platform code is limited to timing, sleep, file-open, allocation/free, host publication, and compile/link profiles.
- `verify.mjs` checks ignored evidence under `build/f5/`.

Use `npm run f5:portable` with exact Node 26.7.0 on any supported development host. Use `npm run f5` only on a native Windows/Linux x64 profile prepared for exact evidence; Linux remains not-qualified until the complete Ubuntu chain passes.

The narrower capability lane can be run directly with `npm run f5:capabilities`. Its bounded delay is a semantic event-readiness oracle, not a performance threshold.

## Linux qualification handoff

The shared Linux path is intentionally retained. Native Ubuntu CI regenerates all 32 selected signatures and 16 ABI types from the pinned headers, compares every generated product, and runs the execution/transfer owners, packer, protocol, lifecycle mock, deferred-error control, and timeout/loss control. The PTX and independent C oracle are tracked platform-neutral inputs. None of those facts establishes a working Linux Driver path.

A Linux engineer should complete these gates in order on native Linux x86-64 with an NVIDIA GPU and real Driver exposed:

1. Complete the existing F2L, F3L, and F4L gates in [`experiments/exp-001/README.md`](../../experiments/exp-001/README.md) and [`conformance/f4/README.md`](../f4/README.md). Do not bypass canonical library, permission, context, memory, or cleanup checks.
2. Resolve canonical `libcuda.so.1` without accepting caller paths or the toolkit stub as a runtime Driver. Record the resolved identity and reject ambiguity.
3. Run `npm run f5` unchanged. It compiles the shared `launch-oracle.c` and `capability-oracle.c`, then exercises the same vector, scalar, operation, transfer, mailbox, deferred-failure, and cleanup contracts through the public owners.
4. Record OS/kernel/ABI, Node executable, Driver, GPU, toolkit/header, resolved library, generated products, oracle artifacts, results, terminal inventory, and honest claim limits. Keep machine binaries and raw evidence in ignored `build/` storage.
5. Continue through F6–F8 and `npm run hardware:qualify` on the same clean host. A promotion must name the exact profile and cannot generalize beyond what ran.

Expected blockers are no GPU exposure, absent or stub-only Driver, permission denial, symbol/version disagreement, PTX JIT incompatibility, context-currentness loss, output mismatch, deferred kernel failure, timeout, cleanup failure, nonzero live/orphan inventory, or nonzero Worker exit. Report these directly; do not weaken a gate.

The public coordination point remains [Linux qualification issue #4](https://github.com/iteathen/CUDA-JS/issues/4). Add F5 findings there or open a linked pull request so the retained F2L–F5L sequence stays coherent.

## Claim boundary

Windows F5W proves tracked PTX execution and its bounded capability profiles only on the recorded Windows profile. Linux runner/oracle source is complete but its results remain unqualified until the exact Ubuntu chain passes. Neither profile claims universal physical overlap, public streams/events, general caller registration/mapping, mailbox RMW, arbitrary lane types, unbounded scheduling, broader profiles, performance, or stable production support.
