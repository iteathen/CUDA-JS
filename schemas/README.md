# Schemas

Versioned generated CUDA ABI facts, curated semantic overlays, normalized Runtime IR, generated Node FFI definitions/packers/types/tests/manifests, provenance, and compatibility records.

The experiment-owned synthetic ABI schema and minimal Runtime IR required by promoted EXP-000 remain under `experiments/exp-000/`. CJS-F1B now authorizes pinned CUDA header import, generated Tier-0 facts, separately reviewed overlays, normalized products, and CUDA layout probes here. New or changed official declarations remain unavailable until semantic and native-layout gates pass.

The accepted F1B schema compiler contract is [`../docs/specs/SPEC-0001-cuda-schema-compiler.md`](../docs/specs/SPEC-0001-cuda-schema-compiler.md). `cuda-runtime-ir.schema.json` owns the normalized shape. `cuda-13.3/provenance.json` and `cuda-13.3/tier-0/` are reviewed inputs; `cuda-13.3/linux-x64/generated/` is deterministic output and must never be hand-edited. `cuda-13.3/win-x64/compatibility-manifest.json` records the independently probed Win64 bridge for the hash-identical official header and is verified by EXP-012.
