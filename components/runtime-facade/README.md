# CUDA-JS public runtime facade

Provides the public cuda-js package interface for discovery, runtimes, memory, compilation, and execution. Applications use package exports; native handles and actor tokens remain private. GPU execution requires Node's experimental FFI flag and a matching native profile. Linux source admission is not native qualification.

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
