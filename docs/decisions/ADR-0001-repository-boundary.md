# ADR-0001: Independent CUDA-JS Runtime Repository

**Status:** Accepted

**Date:** 2026-08-10

## Context

UMCGS needs Node-to-CUDA infrastructure, but generic CUDA Driver bindings, JIT call stubs, memory capabilities, compilation/linking, event-loop integration, error normalization, and native packaging have an independent toolchain, security boundary, release cadence, and potential consumers beyond graph search.

Embedding those concerns in UMCGS would make the first search consumer the permanent owner of generic runtime contracts. Conversely, extracting every UMCGS-to-CUDA lowering concern now would create an unnecessary third repository and cross-repository versioning loop before the adapter has an independent lifecycle.

## Decision

Create CUDA-JS as a separate public repository. Public visibility allows platform contributors to qualify independently gated environments while the pre-release support matrix and evidence rules prevent visibility from being confused with a production-support claim.

CUDA-JS owns generic Node/CUDA runtime behavior. UMCGS owns search semantics, Search IR, search-specific specialization, generated search device programs, resource planning, conformance domains, and the adapter that consumes CUDA-JS.

Dependency direction is one-way: UMCGS depends on a versioned CUDA-JS public contract. CUDA-JS never imports UMCGS source or schemas.

No third adapter repository is created now. Revisit extraction only after the adapter has an independently versioned release, multiple independent consumers, separate ownership, or a materially different lifecycle.

No Git submodule is used. Consumers use versioned packages/artifacts and explicit compatibility manifests.

## Consequences

- CUDA-JS must pass the first-consumer-deletion test.
- UMCGS must replace direct generic-driver ownership with an inter-repository adapter contract.
- Cross-repository compatibility, cache identity, provenance, and conformance become explicit.
- Repository coordination cost is accepted because the runtime has a real independent boundary.

## Revisit triggers

Revisit if CUDA-JS remains inseparable from UMCGS after accepted contracts, if the adapter develops an independent lifecycle, or if another consumer exposes missing genericity.
