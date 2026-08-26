# CUDA-JS public runtime facade

`runtime.facade` is the accepted CJS-F8 package boundary. Applications import `discoverCudaDevices`, `openCudaRuntime`, `compileDeviceProgram`, `inspectCudaHost`, `CUDA_JS_COMPATIBILITY`, and `CudaJsError` from `cuda-js`. Native actors and their tokens are not package exports.

`discoverCudaDevices()` returns a finite sanitized snapshot whose selector objects are opaque, process-local capabilities. Passing one as `openCudaRuntime({ device })` binds the DriverActor before context creation; omitting `device` preserves the default path. Runtime descriptions expose only the selected architecture and resolved compile/link targets. Device-JS program/library translation consumes that same private runtime-owned target before identity or compiler work, so libraries and importing programs cannot drift from the device that owns their runtime. Native ordinals never cross the package boundary.

The native entry requires Node 26.1.0 or later on Windows x64 and Node's experimental FFI flag. Unconfirmed Node and CUDA hardware profiles operate automatically as `testing-unconfirmed`; only the published exact evidence profile is qualified. The optional compiler is disabled by default so Driver-only use does not require CUDA Toolkit providers. Pass `compiler: true` for a cache-disabled compiler or provide accepted cache options.

`compileDeviceProgram(runtime, request)` is the optional SPEC-0013 authoring bridge. It consumes the separate `runtime.device-js` translator, passes only private generated CUDA source into the runtime's existing `compile()` port, and returns the bounded Device-JS descriptor plus the ordinary compiler result. It does not add Device-JS state to every runtime instance, expose generated CUDA/AST data, or create a second compiler/resource owner.

SPEC-0030 dense numeric requests use the same bridge and existing SPEC-0021 scalar ABI. The facade accepts the exact legacy or dense program/library contract, preserves typed `f64`/`f16`/`bf16` kernel parameters, and never exposes CUDA type names, headers, generated source, or provider state.

SPEC-0028 adds `compileDeviceLibrary(runtime, request)` and explicit aliased imports to `compileDeviceProgram()`. Library artifacts are copied typed values, imports are validated and snapshotted before program compilation, and the existing compiler/linker ports own RDC/LTO realization and final cubin production. The facade does not own a library registry, native symbol API, or tensor semantics.

SPEC-0020 adds `runtime.prepareOperationDag({ nodes })`, with the node-array overload as a concise equivalent. The returned opaque prepared capability exposes immutable identity/binding facts, status, replay, and close. Kernel nodes may omit `kind`, `after`, and `sharedMemoryBytes` for the safe defaults `kernel`, `[]`, and `0`; device arguments remain explicit named bindings and every device argument requires an access declaration. `prepared.submit({ bindings, after? })` is canonical, while `prepared.submit(bindings, { after? })` is the equivalent convenience overload. Each replay returns one ordinary operation for the whole DAG. The current realization is semantic single-stream replay, not CUDA Graph support or a performance claim.

Resource close failures retain the accepted bounded disposal category, native observation name, and health transition. A resource whose disposer ran and failed becomes orphaned/unusable, and repeated `close()` returns the stored failure without retrying native disposal. Poisoned or restart-required outcomes immediately constrain subsequent admission. Runtime-open rollback and aggregate close reports retain sanitized primary/cleanup divergence without exposing actor tokens, provider paths, or native capabilities.

```js
import { openCudaRuntime } from 'cuda-js';

const runtime = await openCudaRuntime({ compiler: false });
try {
  const memory = await runtime.allocateDevice({ byteLength: 4096 });
  await memory.write(new Uint8Array(4096));
  const copy = await memory.read({ byteLength: 4096 });
  await memory.close();
  console.log(copy.bytes.byteLength);
} finally {
  const terminal = await runtime.close();
  if (!terminal.graceful) throw new Error('CUDA-JS cleanup is unproved; restart the process.');
}
```

The opt-in capacity-two profile also provides operation-producing transfers without public streams or native buffers:

```js
const runtime = await openCudaRuntime({ driver: { execution: { maxPendingGpuOperations: 2 } } });
const memory = await runtime.allocateDevice({ byteLength: 4096 });
const upload = await memory.writeAsync(new Uint8Array(4096));
const download = await memory.readAsync({ byteLength: 4096, after: upload });
const terminal = await download.wait();
console.log(terminal.result.bytes.byteLength);
await upload.wait();
await download.close();
await upload.close();
await runtime.close();
```

`writeAsync()` snapshots ingress before native ownership, `readAsync()` exposes bytes only in a completed operation result, and `copyFromAsync()` performs a bounded contiguous D2D copy. Each consumes the same SPEC-0016 operation capacity, dependency, hazard, and cleanup lifecycle as kernels.

SPEC-0021 adds `memory.view({ dtype, elementCount, byteOffset?, access? })`. The returned opaque view is a logical child of that allocation and exposes only immutable dtype/range/access facts plus status/close. It may replace a raw allocation for a `device-memory` kernel argument only when the launch supplies explicit bounded access records; the DriverActor retains the view and parent leases through terminality. The capability is not a tensor, typed host array, pointer escape, or hardware bounds guarantee.

Accepted SPEC-0014 adds `runtime.createPublicationMailbox({ lanes })`. The returned opaque mailbox exposes direction-checked synchronous `store(name, u32)` and `load(name)` plus status/reset/close; its private `SharedArrayBuffer` and CUDA mapping never become public. Kernel arguments bind one named lane through `{ kind: 'publication-mailbox', mailbox, lane }`, and the mailbox remains exclusively leased through operation terminality.

`cuda-js/testing` exposes `openCudaRuntimeForTesting()` for portable consumer orchestration only. It never proves native CUDA behavior. Native Linux x86-64 uses the same facade as Windows and may operate only as `testing-unconfirmed`; exact Ubuntu qualification remains open. Linux ARM64 and WSL native opens retain stable backend-unavailable errors.
