import { openCudaRuntime } from 'cuda-js';

const runtime = await openCudaRuntime();
const values = [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [0, 0, 0, 0], [0, 0, 0, 0]];
const items = [];
let adapter;
let plan;
let operation;
let observation = null;
try {
  for (let index = 0; index < values.length; index += 1) {
    const memory = await runtime.allocateDevice({ byteLength: values[index].length * 4 });
    await memory.write(new Uint8Array(new Float32Array(values[index]).buffer));
    const view = await memory.view({ dtype: 'f32', elementCount: values[index].length, access: index < 3 ? 'read' : 'write' });
    items.push({ memory, view });
  }
  adapter = await runtime.openCublasLt();
  plan = await adapter.createF32MatmulPlan({ m: 2, n: 2, k: 3 });
  operation = await plan.submit({ a: items[0].view, b: items[1].view, c: items[2].view, d: items[3].view });
  const terminal = await operation.wait();
  const output = await items[3].memory.read({ byteLength: 16 });
  observation = {
    provider: adapter.provider,
    workspaceBytes: plan.workspaceBytes,
    status: terminal.status,
    output: [...new Float32Array(output.bytes.buffer, output.bytes.byteOffset, 4)],
  };
} finally {
  if (operation) await operation.close();
  if (plan) await plan.close();
  if (adapter) await adapter.close();
  for (const item of items.reverse()) { await item.view.close(); await item.memory.close(); }
  const terminal = await runtime.close();
  if (!terminal.graceful) throw new Error('Installed-package cuBLASLt fixture did not close gracefully.');
}

console.log(JSON.stringify({ ...observation, graceful: true }));
