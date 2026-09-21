# External NVIDIA CUDA 13.3 provenance check

This evidence-only check reacquires the exact NVIDIA CUDA 13.3 development package named by `schemas/cuda-13.3/provenance.json` from the recorded official NVIDIA URL.

It verifies:

- the downloaded package SHA-256;
- `cuda.h` SHA-256 after extraction;
- `cudaTypedefs.h` SHA-256 after extraction;
- the package copyright/license file SHA-256.

A passing result establishes only that the committed provenance identifies exact bytes currently reacquirable from the recorded official NVIDIA package source. It does **not** establish CUDA-JS runtime correctness, GPU support, ABI semantic completeness, or performance.

No runtime/compiler/provider operational file is modified by this campaign.

## Frozen result

A one-off GitHub Actions run reacquired the recorded official NVIDIA package and verified every hash in scope:

- package: **matched** — `600e5cf3685d0afae85970ba02451358068b7b56c954999b9149900ec5d940d9`;
- `cuda.h`: **matched** — `31df84e16179b6d97db4b3c0bae7697392a370b41983f4a8962f0e5a8069b577`;
- `cudaTypedefs.h`: **matched** — `30d517cfa051f7a498e432eb1a1964abb11c1cd32098125bba3dfef0b059381f`;
- package copyright/license file: **matched** — `088381bc2d891e719a2a9398645b00bb45f3b24231473a8283ac7e3e66b8a028`.

Workflow run: `35556259814`; artifact: `10621185007`.
Frozen summary: [`results/2026-09-20-nvidia-cuda-13.3-provenance.summary.json`](results/2026-09-20-nvidia-cuda-13.3-provenance.summary.json).

The temporary workflow and JavaScript verifier used to obtain this one-off result are intentionally **not** retained: CUDA-JS repository controls reject new JavaScript outside accepted/named experiment boundaries and reject unexpected permanent workflows. Preserving those controls is more important than retaining the one-off harness.

## Manual reproduction

The result can be independently checked without modifying CUDA-JS runtime code: download the exact package URL from `schemas/cuda-13.3/provenance.json`, verify the package SHA-256, extract it with `dpkg-deb -x`, and hash the three recorded input paths. Compare each digest to the committed provenance record.
