# Device Selection

Owns the portable SPEC-0017 device-discovery snapshot, opaque selector capability, selected-device identity, and selected-device target-resolution input.

This component does **not** own CUDA context creation, native enumeration calls, compiler option admission, multi-GPU orchestration, peer access, MIG, scheduling, or public raw device identifiers. Native/provider adapters inject private device records; public products expose only sanitized capability facts and opaque selectors. The DriverActor/backend remains the owner of native ordinals/`CUdevice` values and context creation.

Target resolution is injected as a policy port. This component supplies selected architecture facts and binds the returned compile/link targets to a deterministic compatibility identity; it does not duplicate `components/cuda-target` syntax/admission policy.
