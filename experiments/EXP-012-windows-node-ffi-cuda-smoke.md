# EXP-012: Windows Node FFI CUDA Smoke

**Status:** Accepted

**Date:** 2026-08-11

## Decision affected

Whether the exact Node.js 26.7.0 built-in FFI profile can safely bootstrap the accepted Tier-0 CUDA Driver surface on Windows x64 and unblock Windows-only successor work while Linux qualification remains deferred.

## Owner

[`SPEC-0002-windows-driver-bootstrap.md`](../docs/specs/SPEC-0002-windows-driver-bootstrap.md) owns scope, safety, lifecycle, evidence, and promotion.

## Cases

- canonical system Driver discovery and exact library hashing;
- generated binding of all 12 Tier-0 named exports;
- Driver initialization/version, device count/device zero, selected attributes, and success error text;
- public-name `cuGetProcAddress` verification for every Tier-0 mapping;
- missing symbol, insufficient API version, versioned query-name, invalid init flags, missing library, and permission denial;
- private context create/current/clear/restore/destroy and terminal current-null state;
- DynamicLibrary close, stale wrapper rejection, and Worker exit;
- exact comparison with an MSVC C oracle and native ABI probe.

## Falsifiers

- official Windows header identity differs from accepted F1B facts;
- an ABI layout, export, result, query status, scalar, string, or context observation differs from the C oracle;
- a returned pointer must be invoked or exposed;
- calls cannot remain on one Worker;
- explicit context/library/Worker cleanup is incomplete;
- a negative capability is accepted silently.

## Claim limit

Passing proves only the recorded Windows x64 Node/Driver/toolkit/GPU profile and the bounded cold/bootstrap mechanism. Linux remains incomplete. Production actors, memory, launch, completion, compiler, packaging, Fast FFI, and performance remain separately gated.
