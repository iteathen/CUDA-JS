# Experiments

**Status:** Informational

## Current phase

The experiment set is documentation only. No experiment may be built or run until the project owner explicitly advances the phase and the exact protocol preconditions are revalidated.

Experiments resolve architecture-changing uncertainty. Each experiment names the exact environment/evidence identity, independent oracle, cheapest decisive falsifier, promotion/rejection criteria, and cleanup.

The authoritative queue is [`EXPERIMENT_MATRIX.md`](EXPERIMENT_MATRIX.md). The first detailed capsule is the GPU-free [`EXP-000-node-ffi-synthetic-abi.md`](EXP-000-node-ffi-synthetic-abi.md); the first real-CUDA capsule is [`EXP-001-node-ffi-cuda-smoke.md`](EXP-001-node-ffi-cuda-smoke.md).

Experiments do not become production modules automatically. Promote only the smallest mechanism satisfying an accepted contract; archive or remove the remainder with exact evidence.
