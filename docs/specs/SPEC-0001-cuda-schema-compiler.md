# SPEC-0001: CUDA Schema Compiler and Tier-0 ABI Contract

**Status:** Accepted

**Date:** 2026-08-11

## Authority and scope

The project owner authorized dependency-ordered implementation of the accepted master plan. This specification owns the bounded `CJS-F1B` schema/ABI implementation required before any production Driver runtime work.

F1B may acquire pinned official CUDA 13.3 inputs, import declarations with pinned Clang, apply separately reviewed Tier-0 semantics, normalize Runtime IR, generate private Node FFI descriptors/packers/types/conformance data, and compile independent native C layout probes for Linux x86-64 SysV.

F1B does not authorize loading the CUDA Driver, creating a real context, exposing a public runtime API, accepting application-provided schemas, publishing raw pointers, or claiming GPU/Driver support.

## Owned inputs

The compiler consumes four independent input classes:

1. `provenance.json`: exact official package URL, package/header/license hashes, toolkit release, target package, and distribution disposition;
2. `selection.json`: the finite Tier-0 function/type closure and target profile;
3. pinned Clang AST and macro output derived from the verified official header;
4. `semantic-overlay.json`: reviewed exposure, version, argument, ownership, affinity, blocking, asynchronous-error, health, security, cleanup, support-tier, and conformance meaning.

Official packages and headers remain ignored build inputs. CUDA-JS commits its own normalized facts and generated products, not a vendored header copy.

## Stable identity

Stable function identity is `cuda.driver.function.<public-name>`. Stable type identity is `cuda.driver.type.<typedef-name>`. Source lines and Clang allocation IDs are provenance only and cannot define identity.

Every Runtime IR identity includes:

- exact package, header, and license hashes;
- selection and semantic-overlay hashes;
- generator hash and pinned Clang identity;
- Runtime IR schema version;
- target OS, architecture, ABI, data model, pointer width, size width, and byte order;
- generated header-fact and native-layout hashes.

## Import contract

The importer must:

- execute only on the declared Linux x86-64 target profile;
- verify source bytes before parsing;
- resolve simple public-to-versioned aliases from compiler macro output;
- use Clang AST declarations for names, types, parameters, aliases, enums, records, and fields;
- exclude comments, compiler allocation IDs, absolute paths, and unrelated AST ordering from generated identity;
- sort every unordered set before serialization;
- reject missing, duplicate, contradictory, or unexpected selected declarations;
- catalog unselected Driver declarations as unavailable rather than generating callable authority.

## Native layout contract

Generated C probes include the same verified official header and ask the native compiler for:

- pointer width, `size_t` width, and byte order;
- selected scalar, enum, handle, structure, and union size/alignment;
- every selected record-field offset;
- selected native symbol declaration presence.

The probe generator and Runtime IR compiler may share header facts, but the C compiler—not JavaScript packing code—owns layout answers. Ordinary offsets are never entered in the overlay.

## Semantic-overlay contract

Every selected function requires all of:

- stable ID, exposure, release tier, requested API version, and optionality;
- ordered parameters matching the imported declaration exactly;
- direction, nullability, representation, ownership, length/bounds, and capability for every parameter;
- return/error representation;
- context/thread requirement, host-blocking behavior, asynchronous/deferred-error behavior, and health effect;
- callback/reentrancy policy, security capability, cleanup behavior, and conformance cases.

Every selected type requires a representation, exposure, ownership/resource meaning, and packer policy. A missing or extra field, parameter, function, or type fails closed.

## Runtime IR and products

The normalized Runtime IR is validated against `schemas/cuda-runtime-ir.schema.json` and drives:

- private Node FFI definitions and public-to-versioned symbol aliases;
- internal out-parameter and default-context-parameter packers;
- TypeScript metadata declarations;
- native layout facts and conformance fixtures;
- compatibility, coverage, unresolved-declaration, and initial semantic-diff reports;
- product hashes and complete provenance manifest.

No generated product grants public or arbitrary native-call authority.

## Determinism and fail-closed validation

Acceptance requires:

- two complete generations from the same exact inputs are byte-for-byte equal;
- a check-only regeneration matches every committed generated product;
- every selected function/type has complete reviewed semantics;
- all unselected declarations remain unavailable;
- native layout facts agree with Runtime IR;
- mutations to size, alignment, offset, type/signature, symbol alias, or required semantic fields are detected;
- generated-product hashes verify;
- F1A regression and documentation/authority checks remain green.

## Failure and cleanup

Hash mismatch, wrong platform, wrong compiler identity, AST ambiguity, missing semantics, layout disagreement, stale generation, or mutation-insensitivity stops the pipeline without advancing later work.

Downloaded packages, extracted headers, raw AST, executables, and raw probe output remain under ignored `build/f1b/`. They are removed or replaced only by the F1B tool after validating the exact build-owned path. Committed facts/products retain enough identity to reacquire and reproduce them.

## Compatibility and change

A source, compiler, selection, overlay, target, or schema change invalidates affected generated products and native-layout evidence. New or changed APIs enter the unavailable report until explicitly selected, reviewed, probed, and regenerated. Broad CUDA version compatibility is not inferred from one profile.
