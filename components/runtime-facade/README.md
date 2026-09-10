# CUDA-JS public runtime facade

Provides the public cuda-js package interface for discovery, pure Device-JS inspection, runtimes, memory, compilation, and execution. Applications use package exports; native handles and actor tokens remain private. GPU execution requires Node's experimental FFI flag and a matching native profile. Linux source admission is not native qualification.

## Runtime-free Device-JS inspection

`inspectDeviceProgram(request)` validates and normalizes the public Device-JS program request through the same CUDA-JS-owned frontend used by `compileDeviceProgram()`. It is synchronous and requires no CUDA runtime, compiler provider, Driver, or GPU.

The result exposes only bounded immutable public facts:

- the ordinary `deviceProgram` descriptor;
- the normalized public compile options used by the frontend; and
- per-function `publicHelperUsage` for CUDA-JS-owned execution-index, atomic/publication, barrier and fence helpers.

The helper profile uses exact public Device-JS source spellings such as `gpu.thread.globalX` and `gpu.atomic.cas`. Scalar constructors, casts and value-local math are deliberately not part of this profile, although CUDA-JS still validates them normally. Generated CUDA source, parser ASTs, provider paths, native handles and artifacts remain private.

Inspection preserves accepted compile-profile requirements. For example, device release/acquire helpers still reject unless the request selects a CCCL-capable header profile. A downstream composer can therefore select compile options from its declared lower requirements, inspect the exact request before allocation, and compare the returned lower-owned helper profile without maintaining its own Device-JS helper allowlist.

The returned `deviceProgram.sha256` remains target-sensitive under the ordinary Device-JS identity rules. Do not treat an inspection identity produced for one compile target as the identity of a later compilation on another target.

This is a composition/preflight surface, not native execution evidence. See [`SPEC-0013-program-inspection-addendum.md`](../../docs/specs/SPEC-0013-program-inspection-addendum.md).

## Minimal allocation and copy

After installing the development package and meeting the native prerequisites, run this as an ES module with `node --experimental-ffi`:

```js
import { openCudaRuntime } from 'cuda-js';

const runtime = await openCudaRuntime({ compiler: false });
try {
  const memory = await runtime.allocateDevice({ byteLength: 4096 });
  await memory.write(new Uint8Array(4096));
  const copy = await memory.read({ byteLength: 4096 });
  console.log(copy.bytes.byteLength); // 4096
  await memory.close();
} finally {
  const terminal = await runtime.close();
  if (!terminal.graceful) throw new Error('Cleanup is unproved; restart the process.');
}
```

The example copies zero-filled bytes to and from device memory. It does not compile or launch a kernel.

## Entry points

- [Component interface](index.mjs).
- [Runtime and platform requirements](../../README.md).
- [Capability map](../../docs/CAPABILITIES.md) and [specification index](../../docs/specs/README.md).
- [Conformance entry points](../../conformance/README.md).

Use the governing specifications for parameter, lifecycle, failure, and compatibility details. [Current status](../../STATUS.md) tracks outstanding implementation and qualification work.

Public view inspection: import inspectDeviceViewRelation from cuda-js to compare live same-runtime views synchronously. The result is same-range, overlap, or disjoint; dtype/access do not affect byte relations. Invalid, closing, closed and cross-runtime capabilities throw. No actor/native calls or parent identity are exposed. See docs/specs/SPEC-0021-view-relation-addendum.md for empty-range semantics and claim limits.
