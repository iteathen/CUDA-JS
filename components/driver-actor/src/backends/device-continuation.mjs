import { deviceGraphFfiDefinitions, deviceGraphFlags, deviceGraphKernelNodeLayout } from '../../../../schemas/cuda-13.3/win-x64/device-graph/generated/ffi-definitions.mjs';

// Private native mechanism. The execution owner retains all dependencies.
export function createDeviceContinuationPorts({ library, ffi, requireCurrent, requireSuccess, restartRequired, attributes }) {
  let functions = null;
  const unproved = new Set();
  const counts = { definitionsCreated: 0, executablesCreated: 0, hostLaunches: 0, definitionsDestroyed: 0, executablesDestroyed: 0 };
  function supportsDeviceContinuation() {
    if (process.platform !== 'win32' || process.arch !== 'x64' || attributes.unifiedAddressing !== 1 || attributes.computeCapabilityMajor < 7 || (attributes.computeCapabilityMajor === 7 && attributes.computeCapabilityMinor < 5)) return false;
    try { functions ??= library.getFunctions(deviceGraphFfiDefinitions); return true; } catch { return false; }
  }
  async function destroyGraph({ native, operationId }) {
    requireCurrent(operationId);
    if (native.executable !== null) {
      requireSuccess('cuGraphExecDestroy', functions.cuGraphExecDestroy(native.executable), operationId, 'poisoned');
      native.executable = null;
      counts.executablesDestroyed += 1;
    }
    if (native.definition !== null) {
      requireSuccess('cuGraphDestroy', functions.cuGraphDestroy(native.definition), operationId, 'poisoned');
      native.definition = null;
      counts.definitionsDestroyed += 1;
    }
    native.frames = [];
    return { graphDestroyed: true };
  }
  return {
    supportsDeviceContinuation,
    continuationMetrics() { return Object.freeze({ ...counts, ...(unproved.size ? { unprovedGraphs: unproved.size } : {}) }); },
    destroyGraph,
    async prepareGraph({ launches, streamNative, operationId }) {
      requireCurrent(operationId);
      if (!supportsDeviceContinuation()) throw Object.assign(new Error('Device continuation native profile is unavailable.'), { code: 'EXECUTION_CONTINUATION_UNSUPPORTED', category: 'unsupported' });
      const native = { definition: null, executable: null, frames: [] };
      try {
        const definition = Buffer.alloc(8);
        requireSuccess('cuGraphCreate', functions.cuGraphCreate(definition, 0), operationId);
        native.definition = definition.readBigUInt64LE();
        if (native.definition === 0n) throw new Error('Graph definition is null after successful creation.');
        counts.definitionsCreated += 1;
        const nodes = new Map();
        const { offsets, size } = deviceGraphKernelNodeLayout;
        for (const launch of launches) {
          const buffer = Buffer.from(launch.parameterBuffer);
          const bufferSize = Buffer.alloc(8);
          bufferSize.writeBigUInt64LE(BigInt(buffer.byteLength));
          const extra = Buffer.alloc(40);
          extra.writeBigUInt64LE(1n, 0);
          extra.writeBigUInt64LE(ffi.getRawPointer(buffer), 8);
          extra.writeBigUInt64LE(2n, 16);
          extra.writeBigUInt64LE(ffi.getRawPointer(bufferSize), 24);
          const params = Buffer.alloc(size);
          params.writeBigUInt64LE(launch.functionNative, offsets.func);
          for (const axis of ['x', 'y', 'z']) {
            params.writeUInt32LE(launch.config.grid[axis], offsets[`gridDim${axis.toUpperCase()}`]);
            params.writeUInt32LE(launch.config.block[axis], offsets[`blockDim${axis.toUpperCase()}`]);
          }
          params.writeUInt32LE(launch.config.sharedMemoryBytes, offsets.sharedMemBytes);
          params.writeBigUInt64LE(ffi.getRawPointer(extra), offsets.extra);
          const dependencies = Buffer.alloc(8 * launch.after.length);
          launch.after.forEach((id, index) => {
            const node = nodes.get(id);
            if (node === undefined) throw new Error('Graph dependency was not created before its node.');
            dependencies.writeBigUInt64LE(node, index * 8);
          });
          const output = Buffer.alloc(8);
          requireSuccess('cuGraphAddKernelNode_v2', functions.cuGraphAddKernelNode_v2(output, native.definition, dependencies.byteLength ? dependencies : null, BigInt(launch.after.length), params), operationId);
          const node = output.readBigUInt64LE();
          if (node === 0n) throw new Error('Graph node is null after successful creation.');
          nodes.set(launch.id, node);
          native.frames.push({ buffer, bufferSize, extra, params, dependencies });
        }
        const executable = Buffer.alloc(8);
        requireSuccess('cuGraphInstantiateWithFlags', functions.cuGraphInstantiateWithFlags(executable, native.definition, BigInt(deviceGraphFlags.deviceLaunch)), operationId);
        native.executable = executable.readBigUInt64LE();
        if (native.executable === 0n) throw new Error('Graph executable is null after successful instantiation.');
        counts.executablesCreated += 1;
        requireSuccess('cuGraphUpload', functions.cuGraphUpload(native.executable, streamNative), operationId);
        return native;
      } catch (error) {
        try { await destroyGraph({ native, operationId }); }
        catch (cause) { unproved.add(native); throw restartRequired({ code: 'EXECUTION_GRAPH_ROLLBACK_UNPROVED', message: 'Native graph construction failed and graph rollback is unproved.', details: { causeCode: cause?.code ?? null, reason: 'unproved-graph-construction-rollback' }, operationId }); }
        throw error;
      }
    },
    async submitGraph({ native, streamNative, operationId }) {
      requireCurrent(operationId);
      counts.hostLaunches += 1;
      requireSuccess('cuGraphLaunch', functions.cuGraphLaunch(native.executable, streamNative), operationId);
    },
  };
}
