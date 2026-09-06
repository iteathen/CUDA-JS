# CUDA-JS experiments

**Status:** Informational

These experiments test bounded runtime and compiler questions independently of production components.

- [EXP-000](exp-000/README.md): synthetic Node FFI ABI and lifecycle.
- [EXP-001](exp-001/README.md): native Linux Driver preparation and qualification.
- [EXP-009](exp-009/README.md): Windows compiler/linker parity.
- [EXP-012](exp-012/README.md): Windows Driver bootstrap.
- [EXP-013](exp-013/README.md): CUDA-free publication-mailbox model.
- [EXP-014](exp-014/README.md): CUDA-free operation-lifecycle model.

The [experiment matrix](EXPERIMENT_MATRIX.md) records questions and promotion criteria. Each linked capsule explains its environment and evidence limits. Use [current status](../STATUS.md) to distinguish retained experiments from active work.

Portable models do not prove native CUDA behavior. Promotion into production requires the owning accepted contract and appropriate qualification.
