# SPEC-0028: Typed Device-JS Library Composition

**Status:** Accepted

**Date:** 2026-08-26

## Outcome

Add a consumer-neutral way to compile a bounded Device-JS library unit, explicitly import its declared device functions into an independently compiled Device-JS program, and link the units through the existing CompilerActor RDC or Device-LTO path.

This specification composes SPEC-0010, SPEC-0012, and SPEC-0013. It does not create a compiler, linker, cache, native-resource, tensor, NN, or application-policy owner.

## Public surface

`compileDeviceLibrary(runtime, request)` accepts:

```text
{
  source: string,
  functions: DeviceJsFunction[], // device functions only
  exports: string[],             // explicit logical function names
  compile?: DeviceCompileOptions,
  output?: "ptx" | "lto-ir"     // default ptx
}
```

The returned copied library record contains its semantic contract/identity, exact format and architecture, one CompilerActor artifact, and an ordered export table. Each export has one logical name, deterministic private external symbol, exact parameter metadata, and return type. Source, generated CUDA, native handles, provider paths, and caller-selected symbols are never public.

`DeviceJsCompileRequest` adds optional explicit imports:

```text
imports: [{ library, name, as }]
```

`name` selects one declared library export. `as` is the consumer-local Device-JS identifier used by source calls. Aliases are explicit, unique, and cannot collide with a local function or `gpu`. No ambient registry, implicit import-all behavior, or package discovery is permitted.

## Composition semantics

- A library contains one through 64 local `device` functions and one through 64 explicit exports. Kernels are forbidden in library units.
- Library-local and exported native symbols are generated from the full semantic library SHA-256 plus canonical function order. Callers cannot choose or observe native linker controls.
- Library units cannot import other libraries in the first profile. The resulting graph is one finite program root with leaf libraries, so import cycles and recursive library resolution do not exist.
- Imported signatures are exact Device-JS signatures. Calls retain SPEC-0013 count/type checking and recursion prohibitions.
- All libraries in one composed program use one homogeneous artifact format and the exact program target architecture.
- PTX composition forces relocatable-device-code compilation for the library and program units. LTO-IR composition uses typed Device-LTO. The caller may select the library output family but may not also set `relocatableDeviceCode`; composition owns that derived choice.
- Before compiling the program unit, CUDA-JS snapshots and validates every library artifact, digest, target, format, semantic identity, export record, generated symbol, alias, and duplicate-library relationship. Mutated or contradictory inputs fail before new compiler work.
- The facade compiles the program unit, then invokes the existing public linker with the program artifact followed by one canonical copy of each referenced library artifact. The final composed artifact is cubin.

The ordinary no-import `compileDeviceProgram()` request and result remain byte-for-byte compatible. A composed result additively includes import metadata and the final linker result.

## Identity and ownership

`runtime.device-js` owns source syntax, static types, function/import/export metadata, semantic identities, deterministic symbols, private CUDA lowering, and bounded import-graph rules.

`runtime.compiler-actor` remains the sole owner of NVRTC/nvJitLink options, provider admission, artifact copying/validation, compatibility, cache identity, failure health, and cleanup. Existing compile/link identities already include the generated source or input artifact bytes and provider facts; the Device-JS identities additionally bind the library contract, source/functions/exports/compile options, or the ordered imported semantic/artifact facts.

Library artifacts are copied values, not live native resources. They may be reused by unrelated compatible runtimes and consumers; active provider compatibility remains authoritative when linked.

## Limits and exclusions

- at most 32 distinct library artifacts and 64 imports per program;
- no tensor, shape, stride, NN, search, batching, or fusion semantics;
- no arbitrary CUDA source/header/symbol/native option surface;
- no nested libraries, cycles, dynamic loading, weak/unresolved symbols, overload resolution, host-callable library API, or mutable library registry;
- no native support or performance promotion from portable mocks.

## Required evidence

Portable/package evidence must prove deterministic library/export/import identity, two unrelated consumers of one library, PTX and LTO orchestration, alias/signature/format/target/digest/collision negatives, unchanged single-unit Device-JS, copied input snapshots, cache separation, installed-package use, and graceful terminal cleanup.

Native promotion requires exact independent source-to-artifact/link/cubin/output parity for at least two library units and two unrelated consumers, controlled negative artifacts, balanced CompilerActor/DriverActor cleanup, and a reproducible performance methodology before any composition-speed claim.

## Falsifiers

Keep the capability unsupported if deterministic external symbols require a caller-controlled native ABI, if a forged/mutated artifact can reach new compiler work before rejection, if library composition changes ordinary Device-JS output, if ownership escapes CompilerActor, or if failures leave native cleanup unproved.
