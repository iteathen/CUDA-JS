import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PREPARED_CUBLASLT_OPERATION_DAG_CONTRACT,
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
  assert.equal(normalizePreparedOperationDag({ executionProfile, nodes: [node('write')] }).sha256, '07d37e087022962706fd53c2f91ea1164619eab68c9db010c17576f4ca98c39d');
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

test('prepared cuBLASLt nodes derive a bounded binding schema without changing kernel-only identity', () => {
  const libraryNode = {
    id: 'matmul',
    kind: 'cublaslt-f32-matmul',
    after: ['write'],
    plan: {
      contract: 'SPEC-0029-cublaslt-f32-row-major-matmul-v1',
      m: 2,
      n: 2,
      k: 3,
      transposeA: false,
      transposeB: false,
      maxWorkspaceBytes: 256,
      workspaceBytes: 256,
      requirements: { a: 6, b: 6, c: 4, d: 4 },
      provider: { name: 'cuBLASLt', version: '13.5.1', qualification: 'exact-windows-profile' },
    },
    a: { binding: 'buffer', kind: 'device-memory' },
    b: { binding: 'b', kind: 'device-memory' },
    c: { binding: 'c', kind: 'device-memory' },
    d: { binding: 'd', kind: 'device-memory' },
    alpha: { binding: 'scale', kind: 'f32' },
    beta: { kind: 'f32', packedHex: '00000000' },
    workspace: { binding: 'workspace', kind: 'device-memory' },
  };
  const legacy = normalizePreparedOperationDag({ executionProfile, nodes: [node('write')] });
  const mixed = normalizePreparedOperationDag({ executionProfile, nodes: [libraryNode, node('write')] });
  assert.equal(legacy.contract, PREPARED_OPERATION_DAG_CONTRACT);
  assert.equal(mixed.contract, PREPARED_CUBLASLT_OPERATION_DAG_CONTRACT);
  assert.deepEqual(mixed.submissionOrder, ['write', 'matmul']);
  assert.deepEqual(mixed.bindings, [
    { name: 'b', kind: 'device-memory' },
    { name: 'buffer', kind: 'device-memory' },
    { name: 'c', kind: 'device-memory' },
    { name: 'count', kind: 'u32' },
    { name: 'd', kind: 'device-memory' },
    { name: 'scale', kind: 'f32' },
    { name: 'workspace', kind: 'device-memory' },
  ]);
  assert.throws(() => normalizePreparedOperationDag({ executionProfile, nodes: [{ ...libraryNode, workspace: null }] }), (error) => error.code === 'PREPARED_DAG_CUBLASLT_WORKSPACE_INVALID');
  assert.throws(() => normalizePreparedOperationDag({ executionProfile, nodes: [{ ...libraryNode, beta: { kind: 'f32', packedHex: '0000' } }] }), (error) => error.code === 'PREPARED_DAG_ARGUMENT_INVALID');
});
