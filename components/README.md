# Components

Production LEGO components are created only after their contracts and predecessor experiments pass.

Implemented owners are [`driver-actor/`](driver-actor/README.md), [`resource-registry/`](resource-registry/README.md), [`memory/`](memory/README.md), [`host-memory-transfer/`](host-memory-transfer/README.md), [`publication-mailbox/`](publication-mailbox/README.md), [`execution/`](execution/README.md), [`cuda-target/`](cuda-target/README.md), [`compiler-actor/`](compiler-actor/README.md), [`device-js/`](device-js/README.md), [`platform-diagnostics/`](platform-diagnostics/README.md), and the public [`runtime-facade/`](runtime-facade/README.md). The internal CUDA-target owner centralizes syntax and reviewed admission metadata without claiming provider/device/native qualification. Other registered/mapped host-memory profiles, optional process isolation, strict JIT, and consumer interop remain separately gated.

The first code remains experiment-owned; do not create empty production component scaffolding merely to mirror the plan.
