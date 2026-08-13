# SPEC-0013 Addendum: Public Surface, Determinism, and Parser Ownership

**Status:** Accepted

**Date:** 2026-08-12

## Outcome

Clarify the accepted SPEC-0013 restricted Device-JS frontend so public API placement, deterministic lowering, return completeness, void-helper grammar, and third-party parser ownership cannot drift during implementation.

This addendum is authoritative together with `SPEC-0013-restricted-device-js.md`. Where older wording is less specific, this addendum supplies the narrower rule.

## Public surface

Device-JS remains an optional standalone helper rather than a method added to every `CudaRuntime` instance:

```text
compileDeviceProgram(runtime, request) -> DeviceProgramCompileResult
```

The helper consumes an existing CUDA-JS runtime/CompilerActor through its public compile contract. It does not create a second compiler owner, Driver owner, runtime lifecycle, cache, or CUDA-MCGS-specific facade.

## Deterministic function ordering

All Device-JS function identity, generated-name assignment, public function ordering, prototypes, definitions, and program identity use **raw JavaScript/Unicode code-unit string order**:

```text
left < right ? -1 : left > right ? 1 : 0
```

Locale-sensitive collation (`localeCompare`, ambient `Intl`, OS locale, or environment collation) is not authority and must not affect generated source or identity.

An internal lowerer may use a different temporary order only if the public contract-normalization boundary canonicalizes generated names, definitions, metadata, and identity before any result is returned or compiled.

## Non-void return completeness

A non-void Device-JS function must conservatively prove a return on every accepted fallthrough path before lowering succeeds.

For v1:

- `return` definitely returns;
- a block definitely returns when its reachable statement sequence reaches a statement that definitely returns;
- `if` definitely returns only when an `else` exists and both branches definitely return;
- loops do **not** establish definite return, even when their condition appears statically infinite;
- unsupported control-flow forms remain rejected by the base specification.

This deliberately rejects some programs that could be proven non-fallthrough by a more sophisticated control-flow analysis. Widening that proof requires a later bounded specification/evidence change; silently emitting a non-void function that can fall through is forbidden.

## Void synchronization-helper grammar

The void helpers:

```text
gpu.barrier.block()
gpu.fence.device()
```

are valid only when the call itself is the complete expression of a standalone `ExpressionStatement`.

They are rejected in:

- `for` initializers or updates;
- assignments;
- return expressions;
- arguments to another call;
- binary/logical/conditional expressions;
- variable initializers;
- any other value-producing expression context.

This keeps void synchronization side effects explicit and prevents C/C++ emission of semantically meaningless expression positions.

## Parser ownership and dependency decision

SPEC-0013 uses exactly pinned `acorn@8.15.0` as a **syntax-only parser provider**.

Acorn owns only ECMAScript tokenization/parsing into an AST. CUDA-JS owns:

- the accepted syntax subset;
- metadata/type/ABI authority;
- helper names and signatures;
- recursion/call-graph policy;
- return-completeness rules;
- deterministic canonical ordering;
- CUDA C++ lowering;
- generated names and program identity;
- diagnostics and public records;
- compilation/cache/native support claims.

Parser recovery, plugins, ambient configuration, source transforms, code generation, and semantic inference are not used.

### Why CUDA-JS does not own a JavaScript parser in v1

Owning a lexer/parser would duplicate a mature commodity mechanism while materially increasing grammar, security, compatibility, maintenance, and fuzzing surface. That code would not improve CUDA ownership because CUDA-JS still must independently own and validate every accepted Device-JS semantic rule after parsing.

The dependency is therefore a replaceable implementation adapter, not a runtime architectural dependency or semantic authority. Its exact version is included in Device-JS program identity and package provenance.

### Replacement trigger

Replace or internalize the parser if the pinned provider can no longer satisfy all of:

- syntax-only role with no semantic/code-generation authority;
- deterministic AST for the accepted source bytes;
- no required plugins/recovery mode;
- acceptable license/provenance;
- bounded dependency surface;
- ability to fail closed before CUDA compilation;
- compatibility with CUDA-JS's exact parser-version identity.

A parser replacement must preserve SPEC-0013 semantics and pass the same Device-JS conformance; it does not authorize a wider JavaScript language.

## Package identity and qualification

Integrating SPEC-0013 is additive prerelease public work. The package identity advances from `0.1.0-alpha.4` to `0.1.0-alpha.5` while public API schema version remains 1.

Device-JS portable/software implementation does not establish native CUDA support. Native promotion remains gated by SPEC-0013's exact generated-source/compiler/launch/oracle/lifecycle evidence.
