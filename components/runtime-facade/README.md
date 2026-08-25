# CUDA-JS public runtime facade

`runtime.facade` is the accepted CJS-F8 package boundary. Applications import `openCudaRuntime`, `compileDeviceProgram`, `inspectCudaHost`, `CUDA_JS_COMPATIBILITY`, and `CudaJsError` from `cuda-js`. Native actors and their tokens are not package exports.

The native entry requires Node 26.1.0 or later on Windows x64 and Node's experimental FFI flag. Unconfirmed Node and CUDA hardware profiles operate automatically as `testing-unconfirmed`; only the published exact evidence profile is qualified. The optional compiler is disabled by default so Driver-only use does not require CUDA Toolkit providers. Pass `compiler: true` for a cache-disabled compiler or provide accepted cache options.

`compileDeviceProgram(runtime, request)` is the optional SPEC-0013 authoring bridge. It consumes the separate `runtime.device-js` translator, passes only private generated CUDA source into the runtime's existing `compile()` port, and returns the bounded Device-JS descriptor plus the ordinary compiler result. It does not add Device-JS state to every runtime instance, expose generated CUDA/AST data, or create a second compiler/resource owner.

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

Accepted SPEC-0014 adds `runtime.createPublicationMailbox({ lanes })`. The returned opaque mailbox exposes direction-checked synchronous `store(name, u32)` and `load(name)` plus status/reset/close; its private `SharedArrayBuffer` and CUDA mapping never become public. Kernel arguments bind one named lane through `{ kind: 'publication-mailbox', mailbox, lane }`, and the mailbox remains exclusively leased through operation terminality.

`cuda-js/testing` exposes `openCudaRuntimeForTesting()` for portable consumer orchestration only. It never proves native CUDA behavior. Native Linux x86-64 uses the same facade as Windows and may operate only as `testing-unconfirmed`; exact Ubuntu qualification remains open. Linux ARM64 and WSL native opens retain stable backend-unavailable errors.
