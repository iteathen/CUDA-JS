import { MemoryError } from './memory-manager.mjs';

const DTYPE_WIDTH = Object.freeze({
  u32: 4,
  u64: 8,
  i32: 4,
  f32: 4,
  f64: 8,
  f16: 2,
  bf16: 2,
});
const ACCESS_ROLES = new Set(['read', 'write', 'read-write']);
const CREATE_FIELDS = new Set(['dtype', 'byteOffset', 'elementCount', 'access']);

function fail(code, category, message, details = {}) {
  throw new MemoryError(code, category, message, details);
}

function plainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  } catch {
    return false;
  }
}

function nonnegativeSafeInteger(value, field) {
  if (!Number.isSafeInteger(value) || value < 0) fail('MEMORY_VIEW_RANGE_INVALID', 'validation', `${field} must be a nonnegative safe integer.`, { field });
  return value;
}

function checkedProduct(left, right, field) {
  if (left !== 0 && right > Math.floor(Number.MAX_SAFE_INTEGER / left)) fail('MEMORY_VIEW_RANGE_INVALID', 'validation', `${field} exceeds the safe integer range.`, { field });
  return left * right;
}

function normalizeCreateOptions(value) {
  if (!plainObject(value) || Object.keys(value).some((key) => !CREATE_FIELDS.has(key)) || !Object.hasOwn(value, 'dtype') || !Object.hasOwn(value, 'elementCount')) {
    fail('MEMORY_VIEW_OPTIONS_INVALID', 'validation', 'Device view options contain unknown or missing fields.');
  }
  const width = DTYPE_WIDTH[value.dtype];
  if (width === undefined) fail('MEMORY_VIEW_DTYPE_INVALID', 'validation', 'Device view dtype is unsupported.', { dtype: value.dtype ?? null });
  const byteOffset = nonnegativeSafeInteger(value.byteOffset ?? 0, 'byteOffset');
  const elementCount = nonnegativeSafeInteger(value.elementCount, 'elementCount');
  const access = value.access ?? 'read-write';
  if (!ACCESS_ROLES.has(access)) fail('MEMORY_VIEW_ACCESS_INVALID', 'validation', 'Device view access role is invalid.', { access });
  if (byteOffset % width !== 0) fail('MEMORY_VIEW_ALIGNMENT', 'validation', 'Device view byte offset does not satisfy dtype alignment.', { byteOffset, alignment: width });
  const byteLength = checkedProduct(elementCount, width, 'byteLength');
  return Object.freeze({ dtype: value.dtype, width, byteOffset, elementCount, byteLength, access });
}

function assertRange(parentLength, view) {
  if (!Number.isSafeInteger(parentLength) || parentLength < 1) fail('MEMORY_VIEW_PARENT_INVALID', 'internal', 'Device view parent has an invalid byte length.');
  if (view.byteOffset > parentLength) fail('MEMORY_VIEW_RANGE_OUT_OF_BOUNDS', 'validation', 'Device view begins outside the parent allocation.', { allocationLength: parentLength, byteOffset: view.byteOffset, byteLength: view.byteLength });
  if (view.byteLength > parentLength - view.byteOffset) fail('MEMORY_VIEW_RANGE_OUT_OF_BOUNDS', 'validation', 'Device view exceeds the parent allocation.', { allocationLength: parentLength, byteOffset: view.byteOffset, byteLength: view.byteLength });
}

function allows(actual, requested) {
  if (requested === undefined || requested === null) return true;
  if (!ACCESS_ROLES.has(requested)) fail('MEMORY_VIEW_ACCESS_INVALID', 'validation', 'Requested device view access role is invalid.', { access: requested });
  if (actual === 'read-write') return true;
  return actual === requested;
}

export function deviceViewDtypeWidth(dtype) { return DTYPE_WIDTH[dtype] ?? null; }

export function deviceViewRangesOverlap(left, right) {
  if (!left || !right || !Number.isSafeInteger(left.byteOffset) || !Number.isSafeInteger(left.byteLength) || !Number.isSafeInteger(right.byteOffset) || !Number.isSafeInteger(right.byteLength)) {
    fail('MEMORY_VIEW_RANGE_INVALID', 'validation', 'Range overlap requires validated view descriptors.');
  }
  if (left.byteLength === 0 || right.byteLength === 0) return false;
  return left.byteOffset < right.byteOffset + right.byteLength && right.byteOffset < left.byteOffset + left.byteLength;
}

export class DeviceViewManager {
  #registry;

  constructor({ registry }) {
    if (!registry || typeof registry.allocate !== 'function' || typeof registry.get !== 'function' || typeof registry.acquire !== 'function' || typeof registry.close !== 'function') {
      fail('MEMORY_VIEW_REGISTRY_INVALID', 'internal', 'Device view manager requires a resource registry.');
    }
    this.#registry = registry;
  }

  create(memoryToken, options) {
    const normalized = normalizeCreateOptions(options);
    const parent = this.#registry.get(memoryToken, { kind: 'device-memory' });
    assertRange(parent.byteLength, normalized);
    const value = Object.freeze({
      memory: memoryToken,
      dtype: normalized.dtype,
      byteOffset: normalized.byteOffset,
      elementCount: normalized.elementCount,
      byteLength: normalized.byteLength,
      access: normalized.access,
    });
    const token = this.#registry.allocate({
      kind: 'device-view',
      value,
      parent: memoryToken,
      dispose: async () => Object.freeze({ kind: 'device-view', logicalClosed: true }),
    });
    return this.#descriptor(token, value);
  }

  status(token) {
    return this.#descriptor(token, this.#registry.get(token, { kind: 'device-view' }));
  }

  acquire(token, { access } = {}) {
    const lease = this.#registry.acquire(token, { kind: 'device-view' });
    if (!allows(lease.value.access, access)) {
      lease.release();
      fail('MEMORY_VIEW_ACCESS_DENIED', 'validation', 'Device view access exceeds the declared role.', { declared: lease.value.access, requested: access });
    }
    return Object.freeze({ ...lease.value, release: lease.release });
  }

  async release(token) {
    const value = this.#registry.get(token, { kind: 'device-view' });
    const closed = await this.#registry.close(token);
    return Object.freeze({
      schemaVersion: 1,
      released: Object.freeze({ kind: 'device-view', dtype: value.dtype, byteOffset: value.byteOffset, elementCount: value.elementCount, byteLength: value.byteLength, access: value.access }),
      disposition: closed.disposition,
    });
  }

  #descriptor(token, value) {
    return Object.freeze({
      schemaVersion: 1,
      view: token,
      memory: value.memory,
      kind: 'device-view',
      dtype: value.dtype,
      byteOffset: value.byteOffset,
      elementCount: value.elementCount,
      byteLength: value.byteLength,
      access: value.access,
    });
  }
}
