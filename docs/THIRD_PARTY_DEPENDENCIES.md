# Third-Party Dependencies

**Status:** Informational

CUDA-JS intentionally keeps runtime dependencies small and ownership explicit. A dependency may provide a bounded commodity mechanism; it does not inherit authority over CUDA-JS semantics, contracts, lifecycle, support claims, or generated-code meaning.

## Acorn

```text
package: acorn
version: 8.15.0
license: MIT
role: syntax-only ECMAScript parser for SPEC-0013 Device-JS
transitive runtime dependencies at pinned version: none
```

Acorn is used only to tokenize/parse copied Device-JS source into an AST. CUDA-JS independently validates the accepted syntax subset, metadata/types, helper surface, return completeness, call graph, deterministic ordering, CUDA lowering, diagnostics, generated identity, and compilation boundary.

No Acorn plugin, recovery mode, code generator, source transform, semantic inference, or ambient parser configuration is accepted. The exact parser version is part of Device-JS program identity.

### Ownership decision

CUDA-JS does not implement its own JavaScript lexer/parser in SPEC-0013 v1 because doing so would create a large, security-sensitive grammar-maintenance surface without increasing ownership of the CUDA semantics that matter. The parser is therefore treated as a replaceable adapter: methodology and semantic authority remain ours even though commodity syntax parsing is reused.

Replace or internalize Acorn if it cannot continue to provide a deterministic syntax-only AST with acceptable provenance/license, bounded dependency surface, no required plugins/recovery, and fail-closed compatibility with the accepted Device-JS grammar. A replacement must preserve SPEC-0013 conformance; it does not authorize broader JavaScript.

## CI-only GitHub Actions

The repository's GitHub Actions are development/CI dependencies, not package runtime dependencies. Their reviewed releases, immutable commits, licenses, workflow inventory, and update policy are owned by [`.github/actions-provenance.json`](../.github/actions-provenance.json) and explained in [`PUBLIC_REPOSITORY.md`](PUBLIC_REPOSITORY.md).

Remote Actions and remote reusable workflows must be pinned to full commit SHAs. Repository-local actions use same-commit `./...` references. Weekly Dependabot pull requests are proposals that still require upstream release/commit review, provenance reconciliation, and protected checks before merge.
