# SPEC-0002: Windows Driver Bootstrap

**Status:** Accepted

**Date:** 2026-08-11

## Authority and purpose

The project owner explicitly authorized a Windows-first continuation on 2026-08-11 because the available native Linux VM cannot receive a supported NVIDIA GPU. Linux support remains planned, incomplete, and deferred; it is not removed and no Windows result may be represented as Linux evidence.

This specification owns the bounded Windows x64 `CJS-F2W / EXP-012` Driver bootstrap needed to continue dependency-ordered framework work without waiting for Linux hardware.

## Exact profile

- Windows x64 Win64 on the current NVIDIA GPU/Driver host;
- official Node.js 26.7.0 with `--experimental-ffi` and explicit permission-model coverage;
- the system NVIDIA Driver library at the canonical Windows system path;
- CUDA Toolkit 13.3 installed headers and import library;
- the accepted F1B Tier-0 selection, semantics, aliases, FFI definitions, and packers;
- MSVC x64 native C ABI and Driver oracle.

The Windows CUDA 13.3 `cuda.h` must hash-identically match the accepted F1B header. Windows-native sizes, alignments, offsets, and function-pointer widths must be measured with MSVC and agree with the committed Windows compatibility manifest before Driver execution is accepted.

## Authorized implementation

EXP-012 may implement only:

- fail-closed discovery of the canonical system `nvcuda.dll`;
- exact Node/FFI/permission preflight;
- generated Tier-0 named-export binding;
- `cuInit`, Driver version, device enumeration, selected scalar attributes, and error text;
- `cuGetProcAddress` public-name/version/flags/status verification without invoking returned pointers;
- one private Worker-owned context create/current/clear/restore/destroy lifecycle;
- independent native C oracle comparison;
- negative missing-library, invalid-init-flags, missing-symbol, insufficient-version, versioned-name, permission, stale-wrapper, and cleanup evidence.

EXP-012 does not authorize a public runtime API, production DriverActor, memory allocation, modules, kernel launch, completion, compiler providers, arbitrary libraries, arbitrary signatures, raw public pointers, returned-pointer invocation, or Fast FFI claims.

## Library and symbol policy

- Production experiment discovery accepts only the canonical system Driver path.
- Toolkit headers and `cuda.lib` are build/oracle inputs, not runtime dependencies.
- Named exports come from the accepted generated Tier-0 aliases.
- `cuGetProcAddress` queries use generated public names, API version 13030, and reviewed flags zero.
- A nonzero returned procedure pointer is reduced to private boolean evidence and is never invoked or returned.
- Missing exports, unexpected query results, header mismatch, ABI mismatch, or unavailable GPU fail closed.

## Ownership and lifecycle

All Driver calls execute on one experiment Worker. The Worker owns its DynamicLibrary and context. Context creation must make the context current on that Worker. Clear, restore, destroy, terminal-null-current, library close, stale-wrapper rejection, Worker exit, and sanitized result transfer are required.

No pointer value crosses the Worker boundary. Evidence may contain only booleans describing nullness/equality and bounded scalar or string results.

## Independent oracle

The MSVC oracle includes the hash-pinned official `cuda.h`, links the official Toolkit import library, executes the same bounded calls, and records the same scalar/status/string/boolean observations. Node results must agree exactly except for process-specific identities that are deliberately reduced before comparison.

The independent ABI probe compiles the accepted generated probe source against the Windows Toolkit header and compares its output to the Windows compatibility manifest.

## Acceptance

`CJS-F2W` is accepted only when:

1. exact Node, OS, Driver library, toolkit/header/import-library, compiler, schema, and generated-product identities are recorded;
2. the official Windows header matches the accepted F1B header hash;
3. all selected Windows native layouts match the committed compatibility manifest;
4. all 12 generated named exports bind;
5. Driver/device/error/context results agree with the independent C oracle;
6. all Tier-0 `cuGetProcAddress` queries return the reviewed result/status/non-null shape while negative queries fail closed;
7. permission denial and explicit permission success are observed;
8. no raw pointer crosses the Worker boundary;
9. context destruction, library invalidation, and Worker exit are terminal and clean;
10. F1A and F1B regression gates remain green.

Passing this specification unblocks Windows-only successor work. It does not establish Linux, WSL2, ARM64, arbitrary Driver, broad CUDA, Fast FFI, performance, packaging, or public-release support.

## Deferred Linux path

`CJS-F2L / EXP-001` remains incomplete and requires a qualified native Linux x86-64 NVIDIA Driver/GPU environment for promotion. Its retained implementation already verifies official inputs, native ABI facts, and C-oracle compilation; diagnoses host readiness; and supplies the final real-Driver Node/C parity and cleanup runner. The human handoff is [`../../experiments/exp-001/README.md`](../../experiments/exp-001/README.md), and [public issue #4](https://github.com/iteathen/CUDA-JS/issues/4) owns volunteer or future maintainer follow-up. Windows successors must preserve platform-separated evidence and must not make Linux a hidden prerequisite.
