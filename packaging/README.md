# Packaging

**Status:** Accepted F8W package boundary

CUDA-JS 0.1.0-alpha.2 is a public-manifest, versioned no-addon ESM package with a Node 26.1.0 minimum testing substrate, exact Node 26.7.0 qualification evidence, three explicit exports, immutable compatibility metadata, clean tarball install/uninstall evidence, independent synthetic consumers, and one exact manifest-verified CUDA 13.3 CCCL header profile. Unconfirmed FFI-capable Node releases and Windows CUDA hardware may operate for testing without a separate opt-in; operation does not promote support. CUDA-JS source is licensed under AGPL-3.0-or-later with separately negotiated commercial licensing available. Registry publication remains pending a separate release, provenance, and registry review.

The implemented native backend is Windows x64 only. Native Linux x64 and ARM64 remain backend-incomplete, and WSL2 remains diagnostic-only. All can install, import, inspect compatibility, and use the mock-only testing export; none gains a native CUDA claim from those portable controls.
