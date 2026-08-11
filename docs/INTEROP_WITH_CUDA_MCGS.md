# CUDA-MCGS Interoperability Boundary

**Status:** Proposal

CUDA-MCGS, currently housed in the `iteathen/UMCGS` repository, publishes a generated runtime package containing:

- required CUDA-JS package/schema/runtime versions and capability profile;
- declared Node/Driver/toolkit/GPU compatibility constraints where material;
- compiled or source device modules and complete cache inputs;
- opaque resource and memory requirements;
- function, kernel-ABI, argument, launch, stream, completion, cancellation, and result descriptions;
- search-specific device-owned progress semantics encoded in device programs rather than generic host policy;
- provenance, checksums, and conformance manifest.

CUDA-JS validates and executes that package without understanding Search IR or search semantics.

CUDA-JS owns the safe generic runtime, Node FFI backend, actor/resource lifecycle, compilation, launch, completion, errors, and teardown. CUDA-MCGS owns the semantic correctness and finite search-resource plan of the generated package.

The CUDA-MCGS adapter belongs to the `iteathen/UMCGS` repository for now. A third repository is justified only by an independent lifecycle or multiple independent producers.

Cross-repository conformance consists of:

1. CUDA-JS internal runtime conformance;
2. CUDA-MCGS internal package-generation/search-semantic conformance;
3. one compatible-pair end-to-end capsule keyed by exact released revisions and artifacts.
