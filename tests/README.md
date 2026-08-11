# Tests

Cross-component and end-to-end runtime capsules. Owner-local tests remain with their experiment or component. The accepted F3 component tests live under `components/`, and integrated evidence lives under `conformance/f3/`.

Initial ownership:

- schema determinism and mutation sensitivity;
- native ABI/layout probe parity;
- Node FFI named-symbol/out-parameter smoke;
- export/`cuGetProcAddress` version-status verification;
- DriverActor context affinity;
- opaque resource/lifecycle/error/teardown;
- exact evidence and environment identity.

Later capsules add memory, module/launch/completion, compiler/link/cache, platform, security, packaging, performance, and UMCGS compatible-pair evidence.
