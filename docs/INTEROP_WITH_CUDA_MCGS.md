# CUDA-MCGS Interoperability Boundary

**Status:** Proposal

CUDA-MCGS, currently housed in the `iteathen/UMCGS` repository, publishes a generated runtime package containing:

- required CUDA-JS package/schema/runtime versions and capability profile;
- declared Node/Driver/toolkit/GPU compatibility constraints where material;
- canonical consumer-owned Device-JS programs plus exact function/type metadata and semantic identity inputs;
- opaque resource and memory requirements;
- function, argument, launch, operation, completion, and result descriptions expressed through CUDA-JS public contracts;
- search-specific device-owned progress semantics encoded in device programs rather than generic host policy;
- provenance, checksums, and conformance manifest.

CUDA-JS validates and executes that package without understanding Search IR or search semantics. CUDA-MCGS does not own maintained CUDA C++, CUDA headers, PTX, LTO-IR, cubin, native options, Driver calls, or raw stream/event/pointer capabilities at this interoperability boundary.

CUDA-JS owns Device-JS validation and deterministic lowering, generated CUDA C++, compiler/linker mechanics, artifact/cache identity, the safe generic runtime, Node FFI backend, actor/resource lifecycle, launch/operation completion, errors, and teardown. CUDA-MCGS owns the semantic correctness and finite search-resource plan of the generated package.

CUDA-JS also owns the consumer-neutral device-scope `u32`/`u64` release/acquire publication primitive. CUDA-MCGS owns readiness values, generations, payload schema, bounded retry/progress policy, stale/wrong-generation rejection and any queue/search interpretation. The public helper contract is sufficient without CUDA-MCGS, and the CUDA-free conformance oracle includes an unrelated work-slot consumer.

The direct CUDA C++/PTX APIs remain valid low-level CUDA-JS capabilities and independent evidence paths. Their existence is not permission for the first compatible-pair consumer to retain consumer-authored CUDA realization beside Device-JS.

The CUDA-MCGS adapter belongs to the `iteathen/UMCGS` repository for now. A third repository is justified only by an independent lifecycle or multiple independent producers.

Cross-repository conformance consists of:

1. CUDA-JS internal runtime conformance;
2. CUDA-MCGS internal Device-JS package-generation/search-semantic conformance;
3. an external-deletion test proving the CUDA-MCGS package remains buildable and testable after consumer-owned CUDA/CUDA-header/PTX fixtures are absent;
4. one compatible-pair end-to-end capsule keyed by exact released revisions, Device-JS inputs, generated artifacts, compatibility identity, and terminal resource evidence.

Portable Device-JS/package success does not qualify a native CUDA-MCGS pair. Pair promotion requires the neutral Device-JS native gate plus the exact cross-repository consumer oracle and cleanup evidence.
