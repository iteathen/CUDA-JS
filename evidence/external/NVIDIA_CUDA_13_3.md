# External NVIDIA CUDA 13.3 provenance check

This evidence-only check reacquires the exact NVIDIA CUDA 13.3 development package named by `schemas/cuda-13.3/provenance.json` from the recorded official NVIDIA URL.

It verifies:

- the downloaded package SHA-256;
- `cuda.h` SHA-256 after extraction;
- `cudaTypedefs.h` SHA-256 after extraction;
- the package copyright/license file SHA-256.

A passing result establishes only that the committed provenance identifies exact bytes currently reacquirable from the recorded official NVIDIA package source. It does **not** establish CUDA-JS runtime correctness, GPU support, ABI semantic completeness, or performance.

No runtime/compiler/provider operational file is modified by this campaign.
