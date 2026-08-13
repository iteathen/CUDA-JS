# SPEC-0013: Restricted Device-JS Frontend

**Status:** Accepted

**Date:** 2026-08-12

## Outcome

Add a small consumer-neutral Device-JS frontend so callers can author complete procedural GPU algorithms using a closed JavaScript syntax subset plus a compact generic GPU helper namespace, while **all CUDA-specific realization remains inside CUDA-JS**.

This is not full ECMAScript on the GPU, not a JavaScript VM/interpreter, and not a new general language ecosystem. CUDA-JS parses source text, validates a closed syntax/type/helper contract, deterministically emits private CUDA C++ source, and hands that generated source to the existing CompilerActor. Consumers own algorithm semantics; CUDA-JS owns CUDA syntax, headers/intrinsics, lowering, compilation, linking, artifacts, launch and lifecycle.

## Ownership invariant

A production consumer should not need maintained `.cu`/`.cuh`, CUDA C++, PTX, CUDA headers, CUDA ABI details, NVRTC/nvJitLink options, Driver calls, or CUDA-specific thread/atomic/barrier syntax.

If a generic GPU primitive is missing, CUDA-JS grows a bounded generic helper rather than allowing a consumer-local CUDA escape hatch.

The existing direct CUDA C++/PTX compiler/runtime surfaces remain valid low-level CUDA-JS capabilities and evidence paths. Device-JS is an additive higher-level authoring boundary.

## Parser dependency

CUDA-JS uses a pinned Acorn parser only to obtain an ESTree syntax tree from canonical source text.

- parser plugins are forbidden in v0;
- parser loose/error-recovery modes are forbidden;
- Acorn does not define Device-JS semantics;
- every AST node/operator/helper/type is revalidated by CUDA-JS;
- unsupported syntax fails closed;
- no `eval`, dynamic execution, regex/string-substitution parser, or `Function.prototype.toString()` source authority is used.

The parser version enters Device-JS identity and is pinned in the package lock. A parser update is an explicit dependency/evidence change.

## Public request

`CudaRuntime.compileDeviceProgram(request)` accepts an exact request:

```text
{
  source: string,
  functions: [
    {
      name: identifier,
      kind: "kernel" | "device",
      parameters: [{ name: identifier, type: DeviceJsType }],
      returns: DeviceJsScalar | "void"
    }
  ],
  compile?: DeviceCompileOptions
}
```

`source` is canonical caller-owned text and is the only source authority. It is snapshotted before asynchronous work.

The function metadata is semantic type/ABI authority. Parsed function declarations must match it exactly by function name, parameter order/name and count. Every source function must have metadata and every metadata function must exist in source.

`compile` reuses the existing typed CUDA-JS compiler options but cannot select arbitrary CUDA source, headers or native flags. The Device-JS frontend owns the generated program name/source and invokes existing PTX compilation internally.

## V0 types

Scalar types:

```text
bool
u32
i32
u64
f32
```

Pointer types:

```text
ptr<bool>
ptr<u32>
ptr<i32>
ptr<u64>
ptr<f32>
```

Kernel scalar parameters are limited to scalar kinds that the accepted public launch ABI can represent. Pointer parameters lower to the existing opaque `device-memory` launch kind. `bool` is available for locals/device-function values but is not a v0 kernel scalar launch parameter.

`i64`, `f64`, half/bfloat/FP8, vectors, structs and generic pointers are deferred until a concrete consumer requires them and the owning ABI/helper contracts exist.

## Numeric semantics

Device-JS **does not inherit JavaScript Number/bitwise coercion semantics**. JavaScript syntax is only surface syntax.

- function parameters receive their explicit metadata type;
- local variables infer a single immutable static type from their required initializer;
- ordinary numeric literals are accepted only as operands of explicit scalar constructors such as `gpu.u32(1)` / `gpu.f32(1.5)`;
- BigInt literals are accepted only inside `gpu.u64(...)`;
- boolean literals have type `bool`;
- assignments cannot change a variable's static type;
- arithmetic/bitwise/logical/comparison operators are validated against explicit Device-JS types before emission;
- no implicit JS string/number/bigint/boolean coercion exists.

Generated operations use the corresponding CUDA C++ scalar type semantics.

## V0 source syntax

A module contains only ordinary `function` declarations at top level.

Allowed statements:

- block;
- `let` / `const` declaration with exactly one initialized declarator;
- expression statement containing an allowed assignment/update/function/helper call;
- `if` / `else`;
- `for`;
- `while`;
- `break` / `continue` inside loops;
- `return` consistent with declared function return type;
- empty statement only where syntactically required by an accepted loop form.

Allowed expressions:

- identifiers;
- boolean literals;
- numeric/BigInt literals only inside explicit scalar constructors;
- pointer indexing `pointer[index]` for declared pointer values;
- assignment and compound assignment;
- prefix unary `!`, `~`, `-` under type rules;
- postfix/prefix `++` / `--` for integer locals;
- arithmetic `+ - * / %`;
- comparisons `< <= > >= === !==`;
- bitwise `& | ^ << >>`;
- logical `&& ||`;
- calls to declared `device` functions;
- calls to the fixed `gpu.*` helper surface below.

All other ECMAScript constructs fail closed, including objects/arrays, property mutation, classes, `new`, closures/function expressions/arrows, destructuring, default/rest parameters, optional chaining, template/string/regex literals, exceptions, `try`, `throw`, `switch`, `do`, `for..in/of`, labels, generators, async/await, promises, imports/exports, dynamic property access except typed pointer indexing, `this`, `eval`, `with`, `typeof`, `instanceof`, comma expressions and sequence expressions.

`switch`, richer expression forms and other structured syntax can be added later only when a real consumer justifies them.

## Function-call rules

- kernels cannot be called from Device-JS source;
- `device` functions may call other declared device functions;
- kernels may call device functions;
- calls use exact parameter count and exact static argument types;
- recursion, including indirect recursion, is rejected by a deterministic call-graph cycle check in v0.

CUDA-JS emits forward prototypes for device functions so source declaration order does not create accidental semantics.

## V0 helper surface

Helpers exist only where ordinary JS syntax cannot truthfully encode device semantics.

### Scalar constructors/casts

```text
gpu.bool(x)
gpu.u32(x)
gpu.i32(x)
gpu.u64(x)
gpu.f32(x)
```

They return the named static type and lower to explicit CUDA C++ casts/constants. Literal range/representation is validated before emission.

### Execution identity

```text
gpu.thread.x()
gpu.thread.y()
gpu.thread.z()
gpu.block.x()
gpu.block.y()
gpu.block.z()
gpu.blockDim.x()
gpu.blockDim.y()
gpu.blockDim.z()
gpu.gridDim.x()
gpu.gridDim.y()
gpu.gridDim.z()
gpu.thread.globalX()
```

All return `u32`. `globalX` lowers to the conventional one-dimensional block/thread calculation. Additional flattened/multidimensional helpers are deferred.

### Atomics

```text
gpu.atomic.add(pointer, index, value)
gpu.atomic.cas(pointer, index, compare, value)
```

`add` v0 accepts `ptr<u32>`, `ptr<i32>`, `ptr<u64>`, and `ptr<f32>` with exactly matching index/value types as specified by the helper contract. `cas` v0 accepts `ptr<u32>` and `ptr<u64>`. Both lower to CUDA-JS-owned CUDA atomic intrinsics and return the prior element value.

### Synchronization

```text
gpu.barrier.block()
gpu.fence.device()
```

Both return `void`; they are valid only as standalone expression statements in v0 and lower to CUDA block barrier/device fence primitives.

### Math

```text
gpu.math.sqrt(x)
gpu.math.log(x)
gpu.math.exp(x)
gpu.math.min(a, b)
gpu.math.max(a, b)
```

`sqrt/log/exp` v0 accept and return `f32` and map to CUDA single-precision device math. `min/max` accept two equal numeric scalar types and return that type. CUDA-JS maps to CUDA math/intrinsic semantics rather than reimplementing math.

Reduced-accuracy fast-math helpers are not silently selected. They require a later explicit contract.

## Pointer access

A metadata pointer parameter lowers to the corresponding CUDA pointer type and public `device-memory` ABI kind.

`ptr[index]`:

- requires a declared pointer value;
- requires an integer index (`u32`, `i32` or `u64`);
- reads the pointee static type;
- can be an assignment target only for that same pointee type.

Pointer arithmetic, pointer escape, address conversion and raw pointer values are not part of Device-JS.

## Deterministic CUDA lowering

V0 lowers the validated AST directly to deterministic CUDA C++ source. A custom intermediate representation is not required.

The emitter owns:

- canonical CUDA scalar/pointer type spelling;
- `__device__`/`__global__` function qualifiers;
- helper/intrinsic spelling;
- parenthesization/indentation/whitespace;
- forward declarations;
- numeric literal representation;
- stable source ordering.

Generated CUDA source is private CUDA-JS implementation data. It is passed internally to CompilerActor and is not included in the ordinary public `compileDeviceProgram()` result/error.

If direct AST lowering later becomes unmaintainable or blocks source composition/optimization/source maps, an internal IR may be introduced under a separate evidence-backed design change.

## Identity

Device-JS program identity is a SHA-256 over a canonical length-delimited record containing at least:

- Device-JS contract/generator version;
- pinned parser name/version;
- exact snapshotted source UTF-8 bytes;
- normalized function metadata in declaration-independent canonical order;
- normalized public compile options relevant before CUDA compilation.

Generated CUDA source separately enters the existing CompilerActor source/cache identity. Thus both semantic Device-JS identity and exact CUDA/toolchain artifact identity remain attributable.

## Public result

`compileDeviceProgram()` returns bounded public data:

```text
{
  schemaVersion: 1,
  deviceProgram: {
    contract: "SPEC-0013-v1",
    sha256,
    parser: { name: "acorn", version },
    functions: normalized function metadata,
    kernels: [{ name, parameters: existing public launch parameter schema }]
  },
  compiler: existing CompilerResult
}
```

No generated CUDA source, parser AST, CUDA header text, native option vector, pointer or native handle is public.

## Resource/compile ownership

Device-JS is a pure-JS preprocessing component. It owns no CUDA context, allocation, module, function, stream, event, NVRTC program or nvJitLink handle.

The existing CompilerActor owns compilation/cache/provider lifecycle; DriverActor owns execution/resource lifecycle. Device-JS failures occur before native compilation.

## Portable conformance

Required without CUDA hardware:

- every allowed statement/expression/helper family has a positive deterministic case;
- every explicitly unsupported syntax family sampled by the capsule rejects before compiler dispatch;
- source/function metadata mismatch rejects;
- type mismatch/coercion attempts reject;
- numeric boundary/cast cases reject or emit exact expected CUDA constants;
- pointer loads/stores lower deterministically;
- helper mappings emit exact expected CUDA forms;
- direct and indirect recursion reject;
- generated source is byte-identical across repeated clean translations;
- semantic identity is deterministic and changes when source/types/parser/generator-relevant inputs change;
- public result contains no generated CUDA source/AST/native option;
- a compiler mock receives only generated CUDA source and returns through the existing facade;
- removing a consumer/domain fixture leaves the component coherent and generic.

## Native promotion evidence

Before Device-JS is considered native-qualified on the accepted Windows CUDA profile, a consumer-neutral public-path fixture must start from **Device-JS source only** and prove:

1. structured branch/loop/integer/bitwise correctness;
2. exact 64-bit typed behavior without JS numeric coercion leakage;
3. representative `f32` math against an independent native/host oracle within declared tolerance;
4. thread/global index behavior;
5. atomic add/CAS behavior;
6. a data-dependent `while` path;
7. generated source -> existing CompilerActor -> PTX/cubin -> Driver load/launch -> exact result;
8. expected rejection paths do not create native compiler resources;
9. aggregate compiler/Driver cleanup is terminal.

The first CUDA-MCGS Connect Four production-oriented GPU slice is the external deletion test after this neutral proof: CUDA-MCGS must express the device algorithm without authored CUDA/PTX while CUDA-JS owns all CUDA realization.

## Non-goals

- full ECMAScript compatibility;
- JavaScript VM/interpreter, GC or dynamic heap;
- TypeScript/device decorators;
- CUDA-specific syntax in consumers;
- arbitrary native calls/options/headers;
- implicit JS coercion semantics;
- source-level optimization framework;
- mandatory internal IR;
- MCGS/search/domain helpers;
- native-support or performance claims from source-generation tests alone.
