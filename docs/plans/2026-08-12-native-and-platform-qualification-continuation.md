# Native and Platform Qualification Continuation

**Status:** Proposal

**Date:** 2026-08-12

**Input baseline:** protected `main` `fe9ed78939d3876790291421cec367fde58a8310`, package `cuda-js@0.1.0-alpha.5`.

## Purpose

Track only **unfinished evidence and profile promotion** for capabilities already implemented in portable/software form or already represented by accepted runtime contracts. This plan does not authorize a new runtime capability merely because a profile needs it.

Implementation, architectural disposition, qualification/support, and priority remain independent.

## Capability-native qualification lanes

Each lane is independently promotable and keeps its existing portable/software implementation if native evidence is absent.

### NQ-RDC — SPEC-0010 / issue #35

Current state: typed `relocatableDeviceCode` compilation is implemented; exact native promotion remains open.

Remaining evidence:

- independently compiled unresolved declarations and external definitions remain linkable under the accepted typed option;
- ordered public `link()` produces a cubin and public facade launch matches an independent native oracle;
- cache/identity changes with RDC mode;
- failures preserve actor health and terminal resource balance;
- exact Windows profile evidence is recorded before support promotion.

### NQ-SCALAR — SPEC-0011 / issue #39

Current state: `u64`, `i32`, and `f32` packed scalar arguments are implemented.

Remaining evidence: exact native boundary values, packing parity, launch result/oracle parity, failure cases, and terminal cleanup on each claimed profile.

### NQ-LTO — SPEC-0012 / issue #42

Completed for the exact Windows x64 profile through PR #116 at protected `main@9f13785e4d1d8d887099571a7a41be0b5b42f749`. The integrated capsule proves exact native LTO-IR/oracle parity, two-unit link-to-cubin execution, output parity, compatibility negatives, cache identity, actor responsiveness and terminal compiler/Driver cleanup. A current-head rerun from `main@2135216b1a9fd88066a1c82b61ae533645eac9c2` reproduced the pass; all other OS/device/provider profiles and performance claims remain independent lanes.

### NQ-DEVICE-JS — SPEC-0013 / issue #43 DJS-2

Current state: restricted Device-JS is implemented and packaged in portable/software form.

Remaining evidence must begin from Device-JS source only and prove, through the public package path:

- structured branches/loops/integer/bitwise correctness;
- exact 64-bit typed behavior without JS coercion leakage;
- representative `f32` math against an independent oracle;
- thread/global-index behavior and atomic add/CAS;
- a data-dependent `while` path;
- compiler artifact and exact result parity;
- unsupported inputs create no native compiler resource;
- aggregate compiler/Driver cleanup is terminal.

Consumer/domain deletion is not part of this neutral lane; it is owned by the compatible-pair continuation.

### NQ-OPERATION — SPEC-0016 / issue #51 OSC-3

Current state: opaque submit/status/wait/close is implemented; legacy terminal `launch()` remains compatible.

Remaining evidence:

- public submit resolves while the native completion event is still not-ready;
- later status occurs on separate owner turns with context affinity preserved;
- exact output matches an independent delayed-kernel oracle;
- pending-command blocks fail before unsafe native work;
- deferred error/health attribution remains conservative;
- close proves terminality before cleanup or retains restart-required/orphan truth;
- native event/function/module/memory/stream/context/library ownership balances.

## Platform continuation

### Native Linux

ADR-0006 promotes Linux F2L through the public/package equivalents from a retained lane to the primary reference-platform workstream. Ubuntu 24.04 LTS x86-64 is the first exact cell. The canonical DriverActor and CompilerActor Linux profiles now exist behind shared OS-neutral native engines, including an official-package-pinned compiler manifest and exact F3L/F6L runner source. Next reconcile the diagnostics/facade/package path, then promote only on a qualified native Linux NVIDIA environment. Windows, WSL, portable mocks, schema generation, source review, or successful import cannot substitute for native Driver/compiler/GPU evidence.

Capability-specific Linux RDC/LTO/Device-JS/operation qualification follows only after the owning Linux baseline and capability dependencies exist.

### Secondary Windows and additional architecture profiles

Retain the accepted Windows x64 exact evidence and continue additional Windows profiles only when a concrete consumer or available host justifies them. Continue exact-profile evidence for Turing, Ampere, Ada, Hopper, Blackwell, Server, ARM64/SBSA, WSL, Jetson, and other selected profiles according to the hardware registry. One successful model never promotes a family.

### Extended axes

Multi-GPU, MIG, virtualization, ECC, soak/performance, and similar axes are **qualification lanes only after an owning runtime/infrastructure contract exists**. A missing capability routes to its owning architecture/specification plan; qualification must not silently create it.

## Node matrix

The exact Node registry/probe system remains the source of Node qualification truth. Exact Node 26.7.0 retains the current qualified evidence baseline. Other entries keep their recorded testing-unconfirmed/known-incompatible/not-qualified state until their own full evidence is promoted.

## Acceptance

A lane completes only when:

- exact source/package/Node/OS/ABI/Driver/toolkit/provider/GPU identity is recorded;
- the required independent oracle and lifecycle evidence pass;
- support registry/document state changes only for that exact profile/capability;
- no native claim is inferred from portable or neighboring-profile evidence;
- affected existing qualification capsules remain green.

## Non-goals

This plan does not authorize sideband production, multiple streams/in-flight operations, CUDA Graph/cooperative execution, device selection, MIG control, ECC mutation, arbitrary compiler flags, public raw streams/events/pointers, or consumer semantics.
