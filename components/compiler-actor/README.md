# CompilerActor

`runtime.compiler-actor` is the accepted CJS-F6W compiler owner. It runs CUDA 13.3 NVRTC and nvJitLink in a Worker separate from the DriverActor, accepts only copied strings and PTX bytes with typed options, and returns copied PTX or cubin artifacts.

The provider profile is fail-closed: CUDA-JS checks canonical toolkit discovery, exact versions, file lengths, SHA-256 identities, and required named exports before compiling. The public API cannot choose a DLL, native symbol, include path, source file, or raw option.

The cache recomputes its key and validates its manifest, provider identity, request identity, type, length, and artifact digest on every hit. Corrupt entries become misses and are quarantined only inside the exact cache directory. Cache entries never store source, headers, logs, toolkit paths, or native state.

Native Windows usage requires Node 26.1.0 or later with its experimental FFI flag. Exact Node 26.7.0 remains the qualified evidence baseline; later or earlier FFI-capable releases are unconfirmed testing candidates. `compile()` and `link()` serialize in the CompilerActor but do not block the application event loop. Call `close()` and verify `graceful: true` before considering native cleanup proved.

Linux request normalization, including mandatory stack-limit side-effect suppression, and portable cache/lifecycle tests are retained. Native Linux provider discovery, ABI calls, and cleanup remain incomplete until qualified on native Linux.
