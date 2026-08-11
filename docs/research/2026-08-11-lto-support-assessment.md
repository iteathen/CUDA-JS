# CUDA-JS LTO Support Assessment

**Status:** Research Note

**Inspected:** 2026-08-11

**Exact CUDA-JS input revision:** `ad49a6c9b0cddb420e26e097180cf9c502060a65`

## Question

Should CUDA-JS expose generic CUDA device LTO, and if so what is the smallest safe capability that fits the existing CompilerActor, cache, provider, package, and compatibility contracts without importing CUDA-MCGS semantics or exposing an arbitrary native linker surface?

This record follows the owner-directed sequence: initial assessment, external research, reassessment, targeted second research, final assessment, then planning. It is evidence beneath accepted authority; it does not authorize implementation.

## Existing authority and ownership

The relevant owner already exists. `CJS-F6` in the accepted master plan owns the CompilerActor, NVRTC, nvJitLink, artifacts, cache, provider identity, and future LTO-IR outputs where supported. Its accepted Windows disposition proves the narrower source-to-PTX and PTX-to-cubin path and explicitly leaves LTO deferred. `EXP-009` likewise already names LTO artifacts as a future compiler/linker/cache question.

Accepted `SPEC-0006` intentionally excludes LTO input/output and relocatable device code from its authorized slice. Therefore LTO cannot be implemented as an undocumented option extension to SPEC-0006; a bounded follow-up specification and evidence gate are required before production code changes.

Hard boundaries inherited from current authority:

- CUDA-JS remains consumer-neutral and coherent if CUDA-MCGS disappears.
- Compiler/linker work remains owned by the CompilerActor, not the DriverActor or application thread.
- Public callers do not receive raw pointers, provider paths, native symbols, arbitrary libraries, native input-type enums, or free-form NVRTC/nvJitLink options.
- Provider versions, files, request normalization, artifact bytes, cache identity, errors, health, and cleanup remain exact and fail closed.
- Native Windows evidence cannot promote Linux or another CUDA/toolkit profile.

## Initial assessment

Three credible paths were considered before external research.

### A. No LTO support

Keep the accepted PTX/cubin pipeline only. This is the cheapest path and remains sufficient for consumers that generate one whole specialized CUDA source unit. It avoids new compatibility and cache semantics.

The drawback is incomplete generic CUDA toolchain coverage: CUDA itself supports runtime device LTO, and unrelated consumers may need independently produced device units to retain cross-unit optimization.

### B. Narrow typed LTO extension under CJS-F6

Extend the existing compiler contract with one additional typed artifact and one additional link mode while retaining the existing Worker, provider, cache, result, and cleanup owners.

This is the initial leading path because it adds a real CUDA capability without creating a general-purpose native-linker escape hatch.

### C. Broad nvJitLink surface

Expose arbitrary input kinds, link options, staged linking, external objects/libraries, and caller-selected native behavior.

This path fails the current CUDA-JS safety and ownership model. It would make native linker policy public, substantially enlarge the compatibility/security surface, and bypass the existing typed-option approach without a demonstrated consumer requirement.

## Research pass 1 — CUDA platform facts

Primary sources inspected:

- NVIDIA NVRTC 13.3 documentation: <https://docs.nvidia.com/cuda/nvrtc/>
- NVIDIA nvJitLink 13.3 documentation: <https://docs.nvidia.com/cuda/nvjitlink/index.html>
- NVIDIA CUDA Compiler Driver 13.3 documentation: <https://docs.nvidia.com/cuda/cuda-compiler-driver-nvcc/index.html>

These sources are already represented by `CUDA-NVRTC-13.3`, `CUDA-NVJITLINK-13.3`, and `CUDA-PLATFORM-13.3` in `docs/research/source-register.yaml`; this work reuses those source identities rather than creating duplicates.

Verified observations:

1. NVRTC exposes `nvrtcGetLTOIRSize` and `nvrtcGetLTOIR`.
2. NVRTC `-dlto` generates LTO IR for later link-time optimization and implies relocatable device code. When `-dlto` is selected, the LTO-IR API is the appropriate output path rather than PTX/cubin output.
3. nvJitLink accepts `NVJITLINK_INPUT_LTOIR`; `-lto` performs link-time optimization and the normal completed result can be retrieved as cubin.
4. nvJitLink also has linked-LTOIR/PTX retrieval modes, but those are additional staged-output capabilities rather than prerequisites for LTOIR-to-cubin composition.
5. LTO-IR compatibility is only guaranteed within one CUDA major release. The nvJitLink version must be at least as new as the newest input producer version within that major.
6. LTO inputs targeted at different virtual architectures may be linked when the final target is at least as new as the newest input target, subject to normal architecture restrictions.

## Reassessment after pass 1

The research confirms that a narrow extension can fit the existing CompilerActor. The first candidate public shape became:

```text
compile(source, output: "ptx")     -> typed PTX artifact
compile(source, output: "lto-ir")  -> typed LTO-IR artifact

link([PTX...])                      -> cubin   (existing path)
link([LTO-IR...])                   -> cubin   (LTO inferred)
```

The artifact type, not a caller-supplied native switch, should determine whether CUDA-JS internally applies `-dlto`, `-lto`, and the corresponding nvJitLink input type.

Three questions remained material enough for a second research pass:

- whether the first public slice should support mixed PTX and LTO-IR inputs;
- whether the first slice should expose linked LTO-IR/PTX output;
- which producer/toolkit identity must accompany an LTO artifact so incompatibility can fail before native linking when possible.

## Research pass 2 — composition and compatibility boundary

The second pass rechecked nvJitLink/NVRTC compatibility and compared those facts with the current CUDA-JS implementation at the exact input revision.

Current CUDA-JS observations:

- `components/compiler-actor/src/contract.mjs` accepts raw/typed PTX only and binds cache identity to PTX input and cubin output.
- `components/compiler-actor/src/backends/windows-native.mjs` already owns exact NVRTC/nvJitLink provider identity, serialized native lifetimes, add/complete/cubin retrieval, logs, and cleanup. The missing NVRTC operations for the proposed slice are principally LTO-IR size/extraction; nvJitLink add/complete/cubin machinery already exists.
- the provider identity already records exact NVRTC and nvJitLink semantic versions and file digests, which can support an LTO compatibility record without exposing native paths.

The platform supports more combinations than CUDA-JS needs to expose in a first safe slice. No current generic consumer requirement justifies public mixed-format linking, linked-LTOIR output, arbitrary object/library inputs, or raw native options.

## Final assessment

### Selected v1 capability

Plan an additive `CJS-F6-LTO` follow-up under the existing F6 owner.

- `compile()` gains a typed output selector with current PTX remaining the default and `lto-ir` as the new bounded value.
- An LTO compile internally adds the required NVRTC LTO mode and extracts a copied binary LTO-IR artifact.
- `link()` accepts homogeneous typed LTO-IR artifacts and internally enables LTO; the first LTO link result remains cubin.
- Existing PTX behavior remains unchanged.
- Raw byte link inputs remain PTX-only. LTO-IR requires a typed CUDA-JS artifact so compatibility facts cannot be silently discarded.
- Mixed PTX/LTO-IR link requests are rejected in the first slice.
- Linked LTO-IR/PTX output, staged partial linking, fatbin/object/library inputs, caller-defined input kinds, arbitrary nvJitLink/NVRTC options, and cross-major LTO are deferred.
- DriverActor contracts and search/application semantics remain unchanged.

### LTO artifact compatibility identity

A typed LTO-IR artifact must carry or be inseparably associated with enough immutable compatibility information to validate at least:

- format and schema/contract version;
- exact byte length and SHA-256;
- target virtual architecture;
- producer CUDA/NVRTC major and minor version;
- producer/provider profile identity needed by the cache/evidence model.

Before native link, CUDA-JS should fail closed when it can prove a major-version mismatch or a linker older than an input producer. Native linker errors remain authoritative for compatibility conditions that CUDA-JS cannot safely predict.

### Cache and evidence consequences

Cache identity must distinguish:

- PTX versus LTO-IR compile output;
- PTX link versus LTO link mode;
- every ordered input format, digest, length, target, and relevant producer compatibility version;
- exact current compiler/linker provider profile and normalized static options;
- final cubin output identity.

A cache entry may never allow an LTO artifact from an incompatible producer/profile to be reinterpreted as compatible merely because its bytes or logical source match.

### Why the broader path loses

A raw nvJitLink facade would increase capability surface far beyond the measured need, make cache/version semantics caller-controlled, and weaken the current fail-closed typed-contract model. CUDA-JS should expose generic CUDA capabilities, but not every native control simply because the underlying library accepts it.

### Why no-change loses

No-change remains a valid implementation fallback if the native experiment reveals an unsafe lifecycle, unstable artifact identity, or unacceptable compatibility ambiguity. It is not the preferred planning result because runtime LTO is a real generic CUDA capability, the existing master plan already reserves it under F6, and the current implementation appears to require a bounded rather than foundational change.

## Required evidence before implementation promotion

Extend the existing `EXP-009` family rather than creating a competing experiment lineage. The LTO follow-up should include:

- source-to-LTOIR exact Node-versus-independent-native-oracle parity;
- at least two independently compiled LTO units whose final cubin requires successful device linking and executes through the existing DriverActor;
- clean-room deterministic artifact/cache identity on the exact profile;
- wrong-major and newer-producer/older-linker compatibility rejection controls using synthetic typed metadata where native alternate providers are unavailable;
- mixed PTX/LTOIR rejection;
- raw LTOIR-byte rejection;
- wrong architecture, corrupted bytes/digest, oversize, unknown field/option, and cache-separation controls;
- compiler/linker failure cleanup, graceful actor close, and no leaked native program/link state;
- application-loop responsiveness while LTO compilation/linking occurs;
- exact final cubin execution parity with an independent native oracle.

Mocks and portable controls may prove normalization, compatibility rejection, cache identity, protocol, and lifecycle shape only. They cannot prove NVRTC LTO output, nvJitLink LTO behavior, optimizer quality, or native compatibility.

## Claim limits

This assessment does not establish that LTO is faster than PTX, that CUDA-MCGS should use LTO, that mixed-format linking is unsafe in CUDA generally, or that any Linux/other-toolkit LTO profile is supported. Those would require separate exact evidence.

The selected plan is deliberately generic: CUDA-MCGS may never use LTO and CUDA-JS can still truthfully expose the capability to unrelated consumers.

## Planning disposition

**Proceed with a bounded F6 LTO follow-up plan and experiment/specification gate.** Do not implement production LTO support until a new accepted bounded specification authorizes the public artifact/compatibility contract and the EXP-009 LTO evidence passes on the claimed native profile.
