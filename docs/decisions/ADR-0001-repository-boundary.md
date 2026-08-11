# ADR-0001: Independent CUDA-JS Runtime Repository

**Status:** Accepted

**Date:** 2026-08-10

## Context

CUDA-MCGS, currently housed in `iteathen/UMCGS`, needs Node-to-CUDA infrastructure, but generic CUDA Driver bindings, JIT call stubs, memory capabilities, compilation/linking, event-loop integration, error normalization, and native packaging have an independent toolchain, security boundary, release cadence, and potential consumers beyond graph search.

Embedding those concerns in CUDA-MCGS would make the first search consumer the permanent owner of generic runtime contracts. Conversely, extracting every CUDA-MCGS-to-CUDA lowering concern now would create an unnecessary third repository and cross-repository versioning loop before the adapter has an independent lifecycle.

## Decision

Create CUDA-JS as a separate public repository. Public visibility allows platform contributors to qualify independently gated environments while the pre-release support matrix and evidence rules prevent visibility from being confused with a production-support claim.

CUDA-JS owns generic Node/CUDA runtime behavior. CUDA-MCGS owns search semantics, Search IR, search-specific specialization, generated search device programs, resource planning, conformance domains, and the adapter that consumes CUDA-JS.

Dependency direction is one-way: CUDA-MCGS depends on a versioned CUDA-JS public contract. CUDA-JS never imports CUDA-MCGS source or schemas.

No third adapter repository is created now. Revisit extraction only after the adapter has an independently versioned release, multiple independent consumers, separate ownership, or a materially different lifecycle.

No Git submodule is used. Consumers use versioned packages/artifacts and explicit compatibility manifests.

## Consequences

- CUDA-JS must pass the first-consumer-deletion test.
- CUDA-MCGS must replace direct generic-driver ownership with an inter-repository adapter contract.
- Cross-repository compatibility, cache identity, provenance, and conformance become explicit.
- Repository coordination cost is accepted because the runtime has a real independent boundary.

## Revisit triggers

Revisit if CUDA-JS remains inseparable from CUDA-MCGS after accepted contracts, if the adapter develops an independent lifecycle, or if another consumer exposes missing genericity.
