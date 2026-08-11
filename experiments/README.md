# Experiments

**Status:** Informational

## Current phase

`EXP-000` is promoted after exact Windows x64 and native Linux x86-64 profiles passed independently. F1B schema/ABI preparation is accepted. Windows `EXP-012` and `EXP-009` are promoted on exact independent MSVC parity for the Driver and compiler/linker boundaries. The F3 through F6 portable control plane also passes without native providers; Linux `EXP-001` and native Linux Driver/compiler execution remain retained, incomplete, deferred, and open for contribution.

The executable capsules are owned by [`exp-000/`](exp-000/README.md), the incomplete native-Linux handoff in [`exp-001/`](exp-001/README.md), Windows compiler/linker [`exp-009/`](exp-009/README.md), and Windows Driver [`exp-012/`](exp-012/README.md).

Experiments resolve architecture-changing uncertainty. Each experiment names the exact environment/evidence identity, independent oracle, cheapest decisive falsifier, promotion/rejection criteria, and cleanup.

The authoritative queue is [`EXPERIMENT_MATRIX.md`](EXPERIMENT_MATRIX.md). The GPU-free capsule is [`EXP-000-node-ffi-synthetic-abi.md`](EXP-000-node-ffi-synthetic-abi.md); deferred native Linux work is [`EXP-001-node-ffi-cuda-smoke.md`](EXP-001-node-ffi-cuda-smoke.md); accepted Windows Driver work is [`EXP-012-windows-node-ffi-cuda-smoke.md`](EXP-012-windows-node-ffi-cuda-smoke.md).

Experiments do not become production modules automatically. Promote only the smallest mechanism satisfying an accepted contract; archive or remove the remainder with exact evidence.
