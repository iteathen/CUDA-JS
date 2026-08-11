# Tests

Cross-component and end-to-end runtime capsules. Owner-local tests remain with their experiment or component. The accepted F3/F4 component tests live under `components/`, and integrated evidence lives under `conformance/f3/` and `conformance/f4/`.

Initial ownership:

- schema determinism and mutation sensitivity;
- native ABI/layout probe parity;
- Node FFI named-symbol/out-parameter smoke;
- export/`cuGetProcAddress` version-status verification;
- DriverActor context affinity;
- opaque resource/lifecycle/error/teardown;
- exact evidence and environment identity.

F3 through F9 capsules now cover memory, module/launch/completion, compiler/link/cache, platform, security, packaging, independent consumers, and the generic trusted-header/atomic-publication prerequisite. Exact CUDA-MCGS compatible-pair evidence remains a separately revision-keyed integration result.
