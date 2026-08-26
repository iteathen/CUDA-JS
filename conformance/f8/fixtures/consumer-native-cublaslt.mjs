import { readFile } from 'node:fs/promises';

import { openCudaRuntime } from 'cuda-js';

function u32Bytes(values) {
  const output = new Uint8Array(values.length * 4);
  const view = new DataView(output.buffer);
  values.forEach((value, index) => view.setUint32(index * 4, value, true));
  return output;
}

const runtime = await openCudaRuntime();
const values = [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [0, 0, 0, 0], [0, 0, 0, 0]];
const items = [];
const scratch = [];
let module;
let fn;
let adapter;
let plan;
let prepared;
let operation;
let observation = null;
try {
  for (let index = 0; index < values.length; index += 1) {
    const memory = await runtime.allocateDevice({ byteLength: values[index].length * 4 });
    await memory.write(new Uint8Array(new Float32Array(values[index]).buffer));
    const view = await memory.view({ dtype: 'f32', elementCount: values[index].length, access: index < 3 ? 'read' : 'read-write' });
    items.push({ memory, view });
  }
  for (const words of [[1, 1, 1, 1], [2, 2, 2, 2], [0, 0, 0, 0], [0, 0, 0, 0]]) {
    const memory = await runtime.allocateDevice({ byteLength: 16 });
    await memory.write(u32Bytes(words));
    scratch.push(memory);
  }
  const ptx = Uint8Array.from(await readFile(new URL('./vector-add.ptx.txt', import.meta.url)));
  module = await runtime.loadModule({ format: 'ptx', bytes: ptx });
  fn = await module.getFunction({
    name: 'cuda_js_vector_add_u32',
    parameters: [{ kind: 'device-memory' }, { kind: 'device-memory' }, { kind: 'device-memory' }, { kind: 'u32' }],
  });
  adapter = await runtime.openCublasLt();
  plan = await adapter.createF32MatmulPlan({ m: 2, n: 2, k: 3 });
  const kernel = (id, after, output, left, right) => ({
    id,
    after,
    function: fn,
    grid: { x: 1, y: 1, z: 1 },
    block: { x: 32, y: 1, z: 1 },
    arguments: [{ binding: output }, { binding: left }, { binding: right }, 4],
    accesses: [
      { argumentIndex: 0, byteOffset: 0, byteLength: 16, mode: 'write' },
      { argumentIndex: 1, byteOffset: 0, byteLength: 16, mode: 'read' },
      { argumentIndex: 2, byteOffset: 0, byteLength: 16, mode: 'read' },
    ],
  });
  prepared = await runtime.prepareOperationDag([
    kernel('before', [], 'scratch', 'left', 'right'),
    {
      id: 'matmul',
      kind: 'cublaslt-f32-matmul',
      after: ['before'],
      plan,
      a: { binding: 'a' },
      b: { binding: 'b' },
      c: { binding: 'c' },
      d: { binding: 'd' },
      alpha: { binding: 'alpha' },
    },
    kernel('after', ['matmul'], 'final', 'd', 'scratch'),
  ]);
  operation = await prepared.submit({
    scratch: scratch[2],
    left: scratch[0],
    right: scratch[1],
    final: scratch[3],
    a: items[0].view,
    b: items[1].view,
    c: items[2].view,
    d: items[3].view,
    alpha: 1,
  });
  const terminal = await operation.wait();
  const output = await items[3].memory.read({ byteLength: 16 });
  const final = await scratch[3].read({ byteLength: 16 });
  observation = {
    provider: adapter.provider,
    workspaceBytes: plan.workspaceBytes,
    status: terminal.status,
    operationKind: terminal.kind,
    prepared: { contract: prepared.contract, nodeCount: prepared.nodeCount, edgeCount: prepared.edgeCount, realization: prepared.realization },
    output: [...new Float32Array(output.bytes.buffer, output.bytes.byteOffset, 4)],
    finalWords: [...new Uint32Array(final.bytes.buffer, final.bytes.byteOffset, 4)],
  };
} finally {
  if (operation) await operation.close();
  if (prepared) await prepared.close();
  if (plan) await plan.close();
  if (adapter) await adapter.close();
  if (fn) await fn.close();
  if (module) await module.close();
  for (const memory of scratch.reverse()) await memory.close();
  for (const item of items.reverse()) { await item.view.close(); await item.memory.close(); }
  const terminal = await runtime.close();
  if (!terminal.graceful || terminal.driver.resourceCounts.live !== 0 || terminal.driver.resourceCounts.orphaned !== 0) throw new Error('Installed-package prepared cuBLASLt fixture did not close terminally.');
}

console.log(JSON.stringify({ ...observation, graceful: true }));
