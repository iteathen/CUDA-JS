# CompilerActor

`runtime.compiler-actor` is the accepted CJS-F6W compiler owner. It runs CUDA 13.3 NVRTC and nvJitLink in a Worker separate from the DriverActor, accepts only copied source/typed artifact inputs with typed options, and returns copied PTX, typed LTO-IR, or linked cubin artifacts according to the accepted contract selected by the request.

The provider profile is fail-closed: CUDA-JS checks canonical toolkit discovery, exact versions, file lengths, SHA-256 identities, and required named exports before compiling. The optional `headerProfile: "cuda-cccl"` verifies and snapshots the exact manifest-owned CUDA 13.3 `cuda/` and `nv/` virtual headers before cache lookup; it never exposes or searches an include path. The public API cannot choose a DLL, native symbol, include path, source file, native linker input enum, or raw option.

SPEC-0010 adds the typed `relocatableDeviceCode` compile option. It defaults to `false`, preserving the established whole-program PTX path. When `true`, CUDA-JS maps it to the canonical NVRTC relocatable-device-code option, separates compile/cache identity, and marks the resulting typed PTX artifact with `relocatableDeviceCode: true`. Relocatable PTX remains an input to the existing bounded `link()` owner.

SPEC-0012 adds a separate typed Device-LTO path. `compile({ output: "lto-ir" })` internally selects NVRTC device-LTO generation and returns binary LTO-IR with producer/target identity. Raw LTO-IR bytes are not accepted by `link()`: a homogeneous set of typed LTO-IR artifacts selects the private LTO link mode, and the existing linker owner returns final cubin. PTX/LTO-IR mixing, caller-selected native input kinds, staged linking, and arbitrary native options remain unavailable.

The cache recomputes its key and validates its manifest, provider identity, request identity, type, length, and artifact digest on every hit. Corrupt entries become misses and are quarantined only inside the exact cache directory. Cache entries never store source, headers, logs, toolkit paths, or native state.

Native Windows usage requires Node 26.1.0 or later with its experimental FFI flag. Exact Node 26.7.0 remains the qualified evidence baseline; later or earlier FFI-capable releases are unconfirmed testing candidates. `compile()` and `link()` serialize in the CompilerActor but do not block the application event loop. Call `close()` and verify `graceful: true` before considering native cleanup proved.

Linux request normalization, including mandatory stack-limit side-effect suppression, and portable cache/lifecycle tests are retained. Native Linux provider discovery, ABI calls, LTO behavior, and cleanup remain incomplete until qualified on native Linux.
