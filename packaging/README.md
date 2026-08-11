# Packaging

**Status:** Accepted F8W package boundary

CUDA-JS 0.1.0-alpha.0 is a versioned no-addon ESM package with an exact Node 26.7.0 policy, three explicit exports, immutable compatibility metadata, clean tarball install/uninstall evidence, and independent synthetic consumers. Registry publication remains guarded pending an owner-selected license and separate release review.

The accepted native profile is Windows x64 only. Native Linux x64 and ARM64 remain qualification-required, and WSL2 remains diagnostic-only. All can install, import, inspect compatibility, and use the mock-only testing export; none gains a native CUDA claim from those portable controls.
