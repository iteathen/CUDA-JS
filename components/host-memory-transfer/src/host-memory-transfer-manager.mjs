function fail(code, category, message, details = {}) {
  throw Object.assign(new Error(message), { code, category, details: Object.freeze({ ...details }) });
}

function ordinaryBytes(value) { return value instanceof Uint8Array && !Buffer.isBuffer(value); }
function positiveLength(value, maximum) {
  if (!Number.isSafeInteger(value) || value < 1) fail('MEMORY_TRANSFER_RANGE_INVALID', 'validation', 'Transfer byteLength must be a positive safe integer.');
  if (value > maximum) fail('MEMORY_TRANSFER_LIMIT', 'pressure', 'Transfer exceeds the configured byte limit.', { byteLength: value, maximum });
  return value;
}
function offset(value, field) {
  if (!Number.isSafeInteger(value) || value < 0) fail('MEMORY_TRANSFER_RANGE_INVALID', 'validation', `${field} must be a nonnegative safe integer.`, { field });
  return value;
}

export class HostMemoryTransferManager {
  #registry;
  #contextToken;
  #memory;
  #execution;
  #operations;
  #maxTransferBytes;
  #blocks = [];

  constructor({ registry, contextToken, memory, execution, maxTransferBytes, operations }) {
    if (!registry || !contextToken || typeof memory?.acquireRangeForTransfer !== 'function' || typeof execution?.submitTransfer !== 'function') fail('MEMORY_TRANSFER_OWNER_INVALID', 'internal', 'Host transfer manager dependencies are invalid.');
    for (const name of ['allocateStaging', 'freeStaging', 'stagingView', 'copyHtoDAsync', 'copyDtoHAsync', 'copyDtoDAsync']) if (typeof operations?.[name] !== 'function') fail('MEMORY_TRANSFER_BACKEND_INVALID', 'internal', `Host transfer backend operation is missing: ${name}.`);
    this.#registry = registry;
    this.#contextToken = contextToken;
    this.#memory = memory;
    this.#execution = execution;
    this.#operations = operations;
    this.#maxTransferBytes = positiveLength(maxTransferBytes, 64 * 1_048_576);
  }

  summary() {
    const enabled = this.#execution.summary().policy.maxPendingGpuOperations === 2;
    return Object.freeze({ schemaVersion: 1, profile: 'internal-pinned-staging-v1', enabled, blockCount: 2, blockCapacity: this.#maxTransferBytes, allocatedBlockCount: this.#blocks.length, busyBlockCount: this.#blocks.filter((block) => block.busy).length });
  }

  async initialize(operationId = null) {
    if (this.#blocks.length === 2) return this.summary();
    for (let index = this.#blocks.length; index < 2; index += 1) {
      const native = await this.#operations.allocateStaging({ byteLength: this.#maxTransferBytes, operationId });
      let token;
      try {
        token = this.#registry.allocate({
          kind: 'pinned-staging', value: Object.freeze({ native, byteLength: this.#maxTransferBytes, index }), parent: this.#contextToken,
          dispose: async (record) => Object.freeze({ kind: 'pinned-staging', freed: true, backend: await this.#operations.freeStaging({ native: record.native, operationId: null }) ?? null }),
        });
      } catch (error) {
        await this.#operations.freeStaging({ native, operationId });
        throw error;
      }
      this.#blocks.push({ token, busy: false });
    }
    return this.summary();
  }

  async hostToDevice(token, bytes, { deviceOffset = 0, after = null, operationId = null } = {}) {
    this.#assertProfile();
    if (!ordinaryBytes(bytes)) fail('MEMORY_BYTES_INVALID', 'validation', 'Asynchronous H2D requires an ordinary Uint8Array snapshot source.');
    const snapshot = Uint8Array.from(bytes);
    positiveLength(snapshot.byteLength, this.#maxTransferBytes);
    offset(deviceOffset, 'deviceOffset');
    await this.initialize(operationId);
    const staging = this.#acquireStaging();
    let destination;
    try {
      staging.view.set(snapshot, 0);
      destination = this.#memory.acquireRangeForTransfer(token, deviceOffset, snapshot.byteLength);
    } catch (error) {
      staging.release();
      throw error;
    }
    return this.#execution.submitTransfer({
      kind: 'host-to-device', after, operationId, leases: [destination, staging],
      accesses: [Object.freeze({ native: destination.native, start: destination.deviceOffset, end: destination.deviceOffset + snapshot.byteLength, mode: 'write' })],
      enqueue: (streamNative) => this.#operations.copyHtoDAsync({ destinationNative: destination.native, destinationOffset: destination.deviceOffset, stagingNative: staging.native, byteLength: snapshot.byteLength, streamNative, operationId }),
    });
  }

  async deviceToHost(token, { deviceOffset = 0, byteLength, after = null, operationId = null }) {
    this.#assertProfile();
    const length = positiveLength(byteLength, this.#maxTransferBytes);
    offset(deviceOffset, 'deviceOffset');
    await this.initialize(operationId);
    const staging = this.#acquireStaging();
    let source;
    try { source = this.#memory.acquireRangeForTransfer(token, deviceOffset, length); }
    catch (error) { staging.release(); throw error; }
    return this.#execution.submitTransfer({
      kind: 'device-to-host', after, operationId, leases: [source, staging],
      accesses: [Object.freeze({ native: source.native, start: source.deviceOffset, end: source.deviceOffset + length, mode: 'read' })],
      enqueue: (streamNative) => this.#operations.copyDtoHAsync({ stagingNative: staging.native, sourceNative: source.native, sourceOffset: source.deviceOffset, byteLength: length, streamNative, operationId }),
      complete: () => ({ bytes: Uint8Array.from(staging.view.subarray(0, length)) }),
    });
  }

  async deviceToDevice(destinationToken, sourceToken, { destinationOffset = 0, sourceOffset = 0, byteLength, after = null, operationId = null }) {
    this.#assertProfile();
    const length = positiveLength(byteLength, this.#maxTransferBytes);
    offset(destinationOffset, 'destinationOffset');
    offset(sourceOffset, 'sourceOffset');
    const destination = this.#memory.acquireRangeForTransfer(destinationToken, destinationOffset, length);
    let source;
    try { source = this.#memory.acquireRangeForTransfer(sourceToken, sourceOffset, length); }
    catch (error) { destination.release(); throw error; }
    if (destination.native === source.native
        && destination.deviceOffset < source.deviceOffset + length
        && source.deviceOffset < destination.deviceOffset + length) {
      source.release();
      destination.release();
      fail('MEMORY_TRANSFER_OVERLAP_UNSUPPORTED', 'validation', 'Overlapping D2D ranges are not supported by the bounded transfer profile.');
    }
    return this.#execution.submitTransfer({
      kind: 'device-to-device', after, operationId, leases: [destination, source],
      accesses: [
        Object.freeze({ native: destination.native, start: destination.deviceOffset, end: destination.deviceOffset + length, mode: 'write' }),
        Object.freeze({ native: source.native, start: source.deviceOffset, end: source.deviceOffset + length, mode: 'read' }),
      ],
      enqueue: (streamNative) => this.#operations.copyDtoDAsync({ destinationNative: destination.native, destinationOffset: destination.deviceOffset, sourceNative: source.native, sourceOffset: source.deviceOffset, byteLength: length, streamNative, operationId }),
    });
  }

  #acquireStaging() {
    const block = this.#blocks.find((candidate) => !candidate.busy);
    if (!block) fail('MEMORY_TRANSFER_STAGING_BUSY', 'backpressure', 'Both bounded pinned staging blocks are leased.');
    const lease = this.#registry.acquire(block.token, { kind: 'pinned-staging' });
    let view;
    try {
      view = this.#operations.stagingView({ native: lease.value.native, byteLength: lease.value.byteLength });
      if (!(view instanceof Uint8Array) || view.byteLength !== lease.value.byteLength) fail('MEMORY_TRANSFER_BACKEND_INVALID', 'internal', 'Host transfer backend returned an invalid staging view.');
      block.busy = true;
    } catch (error) {
      lease.release();
      throw error;
    }
    let released = false;
    return Object.freeze({
      native: lease.value.native,
      view,
      release: () => {
        if (released) return;
        released = true;
        try { view.fill(0); }
        finally {
          block.busy = false;
          lease.release();
        }
      },
    });
  }

  #assertProfile() {
    if (this.#execution.summary().policy.maxPendingGpuOperations !== 2) fail('MEMORY_TRANSFER_PROFILE_REQUIRED', 'unsupported', 'Asynchronous transfers require the exact capacity-two execution profile.');
  }
}
