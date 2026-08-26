import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PREPARED_OPERATION_DAG_CONTRACT,
  PreparedOperationDagError,
  normalizePreparedOperationDag,
} from '../index.mjs';

const executionProfile = {
  maxPendingGpuOperations: 2,
  deviceLimits: {
    maxThreadsPerBlock: 1024,
    maxBlockDimX: 1024,
    maxBlockDimY: 1024,
    maxBlockDimZ: 64,
    maxGridDimX: 2_147_483_647,
    maxGridDimY: 65_535,
    maxGridDimZ: 65_535,
    maxSharedMemoryPerBlock: 49_152,
  },
};

const executable = {
  moduleSha256: 'a'.repeat(64),
  name: 'stage',
  parameters: [{ kind: 'device-memory' }, { kind: 'u32' }],
};

function node(id, after = []) {
  return {
    id,
    kind: 'kernel',
    after,
    executable,
    grid: { x: 1, y: 1, z: 1 },
    block: { x: 32, y: 1, z: 1 },
    sharedMemoryBytes: 0,
    arguments: [{ binding: 'buffer', kind: 'device-memory' }, { binding: 'count', kind: 'u32' }],
    accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 128, mode: id === 'read' ? 'read' : 'write' }],
  };
}

test('prepared operation DAG canonicalizes topology, binding schema and identity', () => {
  const first = normalizePreparedOperationDag({ executionProfile, nodes: [node('read', ['write']), node('write')] });
  const second = normalizePreparedOperationDag({ executionProfile, nodes: [node('write'), node('read', ['write'])] });
  assert.equal(first.contract, PREPARED_OPERATION_DAG_CONTRACT);
  assert.equal(first.sha256, second.sha256);
  assert.deepEqual(first.submissionOrder, ['write', 'read']);
  assert.deepEqual(first.bindings, [{ name: 'buffer', kind: 'device-memory' }, { name: 'count', kind: 'u32' }]);
  assert.equal(first.nodeCount, 2);
  assert.equal(first.edgeCount, 1);
  assert(Object.isFrozen(first));
});

test('prepared operation DAG identity changes with material semantic and profile facts', () => {
  const base = normalizePreparedOperationDag({ executionProfile, nodes: [node('write')] });
  const launch = normalizePreparedOperationDag({ executionProfile, nodes: [{ ...node('write'), block: { x: 64, y: 1, z: 1 } }] });
  const profile = normalizePreparedOperationDag({ executionProfile: { ...executionProfile, maxPendingGpuOperations: 1 }, nodes: [node('write')] });
  assert.notEqual(base.sha256, launch.sha256);
  assert.notEqual(base.sha256, profile.sha256);
});

test('prepared operation DAG rejects cycles, unknown edges, binding conflicts and missing access declarations', () => {
  assert.throws(() => normalizePreparedOperationDag({ executionProfile, nodes: [node('a', ['b']), node('b', ['a'])] }), (error) => error instanceof PreparedOperationDagError && error.code === 'PREPARED_DAG_CYCLE');
  assert.throws(() => normalizePreparedOperationDag({ executionProfile, nodes: [node('a', ['missing'])] }), (error) => error instanceof PreparedOperationDagError && error.code === 'PREPARED_DAG_DEPENDENCY_UNKNOWN');
  assert.throws(() => normalizePreparedOperationDag({ executionProfile, nodes: [node('a'), {
    ...node('b'),
    executable: { ...executable, parameters: [{ kind: 'device-memory' }, { kind: 'u64' }] },
    arguments: [{ binding: 'buffer', kind: 'device-memory' }, { binding: 'count', kind: 'u64' }],
  }] }), (error) => error instanceof PreparedOperationDagError && error.code === 'PREPARED_DAG_BINDING_CONFLICT');
  assert.throws(() => normalizePreparedOperationDag({ executionProfile, nodes: [{ ...node('a'), accesses: [] }] }), (error) => error instanceof PreparedOperationDagError && error.code === 'PREPARED_DAG_ACCESSES_INVALID');
});
