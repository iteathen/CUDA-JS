# Restricted Device-JS

`components/device-js` owns the small source-to-CUDA authoring bridge defined by SPEC-0013.

Consumers provide canonical JavaScript source plus explicit function/type metadata. CUDA-JS parses the source with pinned Acorn, rejects everything outside the accepted subset, applies static Device-JS type/helper semantics, and deterministically generates private CUDA C++ source. Generated CUDA is CUDA-JS implementation data; ordinary public results do not expose it.

The component intentionally is not a JavaScript VM, TypeScript compiler, CUDA wrapper language, or domain framework. V0 contains only structured procedural syntax and generic GPU helpers needed to keep consumers out of CUDA-specific source:

- typed scalar constructors (`bool`, `u32`, `i32`, `u64`, `f32`);
- typed device-memory pointer indexing;
- thread/block/grid identity;
- atomic add/CAS;
- block barrier and device fence;
- selected CUDA math mappings;
- declared device-function calls with recursion rejected.

The source frontend owns no native resource. `runtime-facade` passes the generated source to the existing CompilerActor, which remains the sole NVRTC/nvJitLink/cache owner. DriverActor remains the execution/resource owner.

Run `npm run device-js:unit` for the pure translator conformance. Native qualification requires a later public-path Device-JS-only fixture on the accepted Windows CUDA profile and does not follow from source-generation tests.
