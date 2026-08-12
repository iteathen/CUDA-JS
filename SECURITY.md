# CUDA-JS Security Policy

CUDA-JS is a public pre-release Node/CUDA runtime and toolchain. Security reports are welcome, especially for issues involving native execution, Node FFI, CUDA Driver/toolkit calls, generated ABI products, executable inputs, opaque resource boundaries, compiler/linker providers, cache integrity, credentials, supply-chain integrity, or repository automation.

## Report a vulnerability

Do **not** publish exploit details, credentials, private data, arbitrary-native-execution techniques, unsafe pointer/resource details, proof-of-concept payloads, or sensitive logs in a public issue.

GitHub private vulnerability reporting for `iteathen/CUDA-JS` is currently not enabled. Until it is enabled, open only a minimal public issue asking the maintainer to establish a private security channel. Do not include the vulnerability details themselves in that issue.

Once a private channel is established, include enough information to reproduce and bound the issue:

- affected commit/version;
- operating system and architecture;
- Node version and permission-model flags;
- CUDA Driver/toolkit/NVRTC/nvJitLink versions where relevant;
- GPU identity and compute capability where relevant;
- expected behavior and observed behavior;
- minimal reproduction;
- whether secrets, external systems, cache artifacts, or other users may have been affected.

When GitHub private vulnerability reporting is enabled, this file and the issue-menu routing should be updated to point directly to that working private flow.

## Supported security posture

CUDA-JS is experimental pre-release software. It does not yet publish a production security-support window, stability guarantee, or vulnerability-response SLA. Security fixes are evaluated against current `main` and any explicitly identified released artifact.

Workers provide event-loop isolation, resource/context ownership, structured health transitions, and restart-required handling; they do **not** provide OS-process crash isolation. No stronger isolation claim should be inferred without separate exact evidence.

## Native and executable boundaries

Treat all of the following as security-sensitive or executable inputs:

- CUDA modules and PTX/cubin artifacts;
- CUDA C++ source and trusted-header selections;
- generated Runtime IR and ABI facts;
- compiler/linker options and provider identities;
- schemas that select executable/native behavior;
- cache manifests and artifacts;
- function/resource identities and packed kernel arguments.

Public APIs must not expose arbitrary native addresses, unrestricted native calls, raw Node FFI objects, unchecked executable schemas, foreign-library handles, credentials, or private provider paths as ordinary data.

Unknown or contradictory public semantics fail closed. Compatibility, convenience, or performance is not a reason to downgrade a demonstrated native-safety failure into a warning.

## Secrets and incidents

Never commit or publish tokens, passwords, private keys, credentials, private endpoints, private user data, or captured environment secrets. Scrub logs, Actions artifacts, benchmark evidence, crash dumps, generated artifacts, screenshots, and issue attachments before publication.

If a credential is committed or disclosed, deletion alone is insufficient: revoke or rotate it, preserve bounded incident evidence, and inspect downstream clones, caches, artifacts, automation, and other copies as appropriate.

## Supply chain and third-party material

Third-party implementation, substantial copied material, generated inputs, provider binaries, and pinned external headers require exact provenance, revision/version identity, compatible licensing, and security review proportional to the capability they introduce.

See [`LICENSING.md`](LICENSING.md), [`CONTRIBUTING.md`](CONTRIBUTING.md), [`docs/PUBLIC_REPOSITORY.md`](docs/PUBLIC_REPOSITORY.md), and [`agent_files/general_foundation/SECURITY.md`](agent_files/general_foundation/SECURITY.md).
