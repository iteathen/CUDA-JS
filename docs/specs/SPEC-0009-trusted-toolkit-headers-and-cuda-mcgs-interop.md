# SPEC-0009: Trusted Toolkit Headers and CUDA-MCGS-Compatible Atomic Execution

**Status:** Accepted

**Date:** 2026-08-11

## Authorization and bounded outcome

The project owner authorized assessment and, where justified, implementation of CUDA-JS issue #32 before any CUDA-MCGS-side work. The assessment reproduced a native NVRTC failure for `#include <cuda/atomic>` through the accepted public package path while proving graceful CompilerActor and DriverActor cleanup. This specification authorizes the smallest generic CUDA-JS repair: one trusted CUDA 13.3 CCCL header profile and one consumer-neutral atomic-publication conformance capsule.

This slice extends the accepted F6 compiler contract and consumes the accepted F8 public facade. It does not add CUDA-MCGS schemas, graph/search state, policies, evaluators, schedulers, resource plans, or device layouts. The later cross-repository compatible-pair capsule consumes this capability but remains separately keyed to exact CUDA-JS and `iteathen/UMCGS` repository revisions.

Native qualification remains Windows x64, official Node 26.7.0, CUDA 13.3 providers, Driver API 13030, and the recorded compute-capability 7.5 GPU. No Linux, WSL, other toolkit, other GPU, performance, cancellation, process-isolation, or production-support claim follows.

## Verified problem

The existing public compile path rejected the generic publication fixture before launch:

```text
NVRTC_ERROR_COMPILATION
publication-probe.cu(2): catastrophic error: could not open source file "cuda/atomic" (no directories in search list)
```

The failure is expected under SPEC-0006: public headers are copied flat logical records, include-directory search is unavailable, and the provider manifest does not own CCCL. One NVRTC program was created and destroyed, the DriverActor retained zero live/orphaned resources, and aggregate close was graceful. The defect is missing trusted compiler capability and identity, not launch, completion, or cleanup behavior.

## Adversarial design assessment

The selected design is a typed, path-free `cuda-cccl` header profile. CUDA-JS verifies and snapshots an exact manifest-owned virtual header bundle before cache lookup, then supplies those copied bytes and logical names directly to `nvrtcCreateProgram`.

Alternatives considered:

- **Ambient toolkit include path.** Rejected because it creates hidden filesystem inputs, incomplete cache identity, path leakage, and a time-of-check/time-of-use window.
- **Caller-supplied CUDA toolkit closure.** Rejected because the current copied-header limits and flat names cannot represent CCCL, while making each consumer redistribute and identify the toolkit library assigns generic provider ownership to the first consumer.
- **CUDA-JS-bundled third-party header copy.** Rejected for this slice because it creates packaging, licensing, update, and provenance obligations when the canonical accepted toolkit already supplies the exact files.
- **Consumer-specific atomic replacement.** Rejected as the CUDA-JS remedy because it avoids rather than qualifies the generic compiler requirement and would couple the first consumer to a backend detail.
- **Verified virtual header profile.** Selected because it preserves no-path public input, complete identity, cache validity, native diagnostic containment, and first-consumer deletion.

The decisive falsifiers are an unverified cache hit, a header-tree mismatch accepted as supported, any absolute path in a public result, a public source/header or provider capability escape, wrong device publication output, non-terminal launch, non-graceful resource disposition, or any CUDA-JS contract that depends on CUDA-MCGS concepts.

## Public compile extension

`compile().options` gains one optional exact field:

```text
headerProfile: "none" | "cuda-cccl"
```

The default is `none`; existing source-only compilation behavior and native option vector remain unchanged. Unknown values fail validation before Worker dispatch.

`cuda-cccl` means only the manifest-owned CUDA 13.3 virtual roots `cuda/` and `nv/`. The caller supplies no filesystem path. The existing caller header records remain copied logical inputs and cannot shadow a profile-owned logical name.

The compile result identifies the selected header profile and its path-free manifest record. It exposes no header contents, native path, toolkit root, file handle, or mutable storage.

## Header-profile identity and loading

The Windows compiler-provider manifest records:

- stable profile name and schema;
- virtual roots;
- file count and total byte count;
- aggregate SHA-256;
- aggregate algorithm identifier.

The version-one aggregate is computed over files sorted by ordinal forward-slash relative path. Each record contributes a little-endian unsigned 32-bit path-byte length, exact UTF-8 path bytes, little-endian unsigned 64-bit content length, and exact content bytes.

Before cache lookup for a `cuda-cccl` request, the CompilerActor backend:

1. resolves only the canonical accepted CUDA 13.3 toolkit root;
2. inventories the manifest roots without following links or accepting non-regular entries;
3. verifies file count, total byte count, and aggregate digest;
4. snapshots the verified files into private NUL-terminated buffers;
5. supplies their relative forward-slash names and copied bytes as NVRTC virtual headers.

Inventory rejects symbolic links, junctions/reparse traversal, paths that resolve outside the canonical profile root, and non-regular entries. Each file is checked before open, read through an owned file handle, and checked again against the opened identity and canonical path. A changed entry fails closed. Caller header names equal to or nested under a profile-owned root are rejected before profile loading and cache lookup.

Verification/loading is lazy and retained for the lifetime of one CompilerActor. A missing, extra, linked, unreadable, oversized, or mismatched profile fails as unsupported before cache lookup or native program creation. No `-I` or caller/toolkit path enters the normalized native option list.

## Cache, compatibility, and evidence identity

A compile request using `none` retains the SPEC-0006-v1 cache identity. A request using `cuda-cccl` uses SPEC-0009-v1 and includes:

- the selected header-profile name;
- the exact manifest profile, roots, counts, algorithm, and aggregate digest;
- the existing source, caller-header, typed-option, provider, Node/ABI, platform, architecture, and output identity.

Header verification occurs before cache lookup, so a stale valid-looking cache entry cannot bypass current provider/header identity. Link identity remains unchanged because link requests consume copied PTX rather than toolkit headers.

Changing any selected profile fact invalidates the compatible compile evidence and cache key. Successful operation on an unconfirmed profile remains testing evidence only.

## Generic atomic-publication capsule

CUDA-JS owns a consumer-neutral kernel with one device-memory argument. Two device threads use `cuda::atomic_ref<unsigned int, cuda::thread_scope_device>`:

- producer writes a fixed ordinary word and release-stores a flag;
- consumer acquire-loads the flag and then copies the ordinary word to an observed slot.

The public facade performs one compile, one allocation/write, one module load, one function lookup, one launch, one terminal read, explicit child-before-parent closure, and aggregate runtime close. The expected words are fixed before execution. No CPU-produced intermediate result is submitted after launch; the CPU only observes terminal completion and copies the final bounded output.

The fixture proves only generic publication capability through the exact public runtime path. It does not prove a graph algorithm, a scheduler, search correctness, arbitrary atomics, performance, or broader CUDA C++ library support.

## Required conformance

### Platform-neutral

- exact `headerProfile` default, accepted value, and unknown-value rejection;
- cache-key separation between `none` and `cuda-cccl`;
- deterministic aggregate identity over nested virtual paths;
- extra file, content mutation, symlink/non-regular entry, count, size, and digest mismatch rejection;
- mock orchestration may preserve the selected profile identity but makes no native header or CUDA ordering claim.

### Native Windows

- exact manifest agreement with the canonical CUDA 13.3 `include/cccl/{cuda,nv}` tree;
- successful public-facade NVRTC compilation of `<cuda/atomic>` with the selected profile;
- path-free public provider/result/error records;
- one terminal DriverActor launch and exact `[published, flag, observed]` word result;
- explicit function, module, memory, CompilerActor, DriverActor, context, stream, event, and library disposition;
- no live/orphaned terminal public resources and graceful aggregate close;
- exact source, provider, manifest, artifact, Node, Driver/toolkit, device, command, and evidence digests.

### Native Linux gap

The shared request, identity, inventory, mutation, link/reparse, and non-regular-entry controls are portable and run in Linux CI. A separate non-promoting Linux readiness probe may inventory only canonical CUDA 13.3 CCCL roots and record an observed aggregate. It must not reuse the Windows digest as Linux authority.

An exact Linux compiler-provider/header manifest and the shared native compiler source now exist. Native Linux NVRTC `<cuda/atomic>` compilation, public-facade Driver execution, device publication, resource cleanup, and the CUDA-MCGS compatible pair remain unqualified until an exact native Linux provider and GPU environment runs their independent evidence chain. Windows or source-only evidence does not satisfy those gates.

The existing F6 through F8 regressions remain green. Final evidence must use the exact final binary/source revision; an earlier probe cannot qualify a later change.

## Exit and downstream authorization

The CUDA-JS prerequisite is complete when this specification, provider manifest, compiler contract/backend, cache identity, compatibility metadata, generic F9 conformance, project registry/status, and exact Windows evidence agree.

That completion authorizes an exact cross-repository compatible-pair capsule. It does not authorize CUDA-JS to implement CUDA-MCGS semantics or claim that the CUDA-MCGS package itself is correct.
