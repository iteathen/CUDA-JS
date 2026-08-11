# Platform diagnostics

**Owner:** `runtime.platform-diagnostics`

This component owns sanitized host classification and fail-closed CUDA device-zero support assessment under SPEC-0007. It accepts copied ordinary records, performs no native calls, runs no commands, reads no arbitrary paths, and changes no system or device state.

Native provider discovery, CUDA calls, resources, and cleanup remain in DriverActor and CompilerActor. WSL and Linux classifications are preparation facts only; native Linux and WSL CUDA support remain independently gated.

Run `npm run f7:unit` for the deterministic owner tests and `npm run f7:portable` for the integrated portable hardening capsule.
