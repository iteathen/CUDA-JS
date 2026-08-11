# Platform diagnostics

**Owner:** `runtime.platform-diagnostics`

This component owns sanitized host classification and CUDA device-zero operational assessment under SPEC-0007. It separates `testing-unconfirmed` operation from exact-profile support evidence, blocks only known-incompatible facts, accepts copied ordinary records, performs no native calls, runs no commands, reads no arbitrary paths, and changes no system or device state.

Native provider discovery, CUDA calls, resources, and cleanup remain in DriverActor and CompilerActor. WSL and Linux classifications are preparation facts only because their native backends are incomplete; they do not gain a support claim from portable tests.

Run `npm run f7:unit` for the deterministic owner tests and `npm run f7:portable` for the integrated portable hardening capsule.
