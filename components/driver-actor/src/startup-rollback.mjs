import { DriverRuntimeError } from './errors.mjs';

const FAILURE_LIMIT = 8;
const STRING_LIMIT = 160;
const HEALTH_RANK = Object.freeze({ healthy: 0, suspect: 1, poisoned: 2, 'restart-required': 3 });
const FAILURE_CATEGORIES = new Set([
  'validation', 'unsupported', 'permission', 'pressure', 'backpressure', 'stale-resource',
  'closed-runtime', 'immediate-driver', 'deferred-driver', 'provider', 'restart-required',
  'internal', 'native-compiler', 'native-linker', 'compile', 'link',
]);
const APPROVED_DETAIL_FIELDS = new Set([
  'actual', 'causeCategory', 'causeCode', 'causeDisposalCallCount', 'causeNativeDescription',
  'causeNativeName', 'causeNativeStatus', 'causeOperation', 'childCount', 'currentEpoch',
  'disposition', 'epoch', 'expected', 'field', 'generation', 'kind', 'leases', 'maximum',
  'nativeDescription', 'nativeName', 'nativeStatus', 'operationId', 'reason', 'resourceKind',
  'resourceState', 'slot', 'state', 'status',
]);

function boundedString(value) {
  if (typeof value !== 'string') return null;
  const normalized = value
    .replace(/[\x00-\x1f\x7f]+/g, ' ')
    .replace(/(?:https?|file):\/\/[^\s"'<>]+/gi, '[redacted-location]')
    .replace(/(?:[A-Za-z]:[\\/]|\\\\)[^\s"'<>]+/g, '[redacted-path]')
    .replace(/(^|[\s("'=])\/(?:[^\s"'<>]+)/g, '$1[redacted-path]')
    .replace(/\b0x[0-9a-f]{6,}\b/gi, '[redacted-handle]')
    .replace(/\b[0-9a-f]{32,}\b/gi, '[redacted-capability]')
    .replace(/\b(handle|pointer|address)\b\s*(?:[=:]\s*|\s+)(?:0x[0-9a-f]+|\d+|[A-Za-z0-9._:+/-]{8,})\b/gi, '$1=[redacted-handle]')
    .replace(/\b(nonce|token|runtime(?:id|-id)?)\b\s*(?:[=:]\s*|\s+)[A-Za-z0-9._:+/-]{8,}/gi, '$1=[redacted-capability]')
    .replace(/\b(host|hostname|account|user|username|email|machine|identity)\b\s*(?:[=:]\s*|\s+)[^\s,;]+/gi, '$1=[redacted-identity]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-identity]')
    .trim();
  if (normalized.length < 1) return null;
  return normalized.slice(0, STRING_LIMIT);
}

function failureCode(value, fallback) {
  return typeof value === 'string' && /^[A-Z][A-Z0-9_]{0,95}$/.test(value) ? value : fallback;
}

function operationName(value, fallback) {
  return typeof value === 'string' && /^[A-Za-z][A-Za-z0-9_.:()-]{0,127}$/.test(value) ? value : fallback;
}

function failureHealth(value) {
  return typeof value === 'string' && Object.hasOwn(HEALTH_RANK, value) ? value : null;
}

function categoryHealth(category) {
  if (['validation', 'unsupported', 'pressure', 'backpressure', 'stale-resource'].includes(category)) return null;
  if (category === 'immediate-driver') return 'suspect';
  if (category === 'deferred-driver') return 'poisoned';
  if (category === 'restart-required') return 'restart-required';
  return 'suspect';
}

function approvedDetails(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return Object.freeze({});
  const output = {};
  for (const key of Object.keys(value).sort()) {
    if (!APPROVED_DETAIL_FIELDS.has(key)) continue;
    const entry = value[key];
    if (entry === null || typeof entry === 'boolean' || (typeof entry === 'number' && Number.isFinite(entry))) output[key] = entry;
    else {
      const text = boundedString(entry);
      if (text !== null) output[key] = text;
    }
  }
  return Object.freeze(output);
}

export function startupFailureRecord(error, { cleanup = false } = {}) {
  const structured = typeof error?.code === 'string' && typeof error?.category === 'string' && FAILURE_CATEGORIES.has(error.category);
  const category = structured ? error.category : cleanup ? 'restart-required' : 'internal';
  const explicitHealth = structured ? failureHealth(error.healthAfter) : null;
  return Object.freeze({
    code: structured ? failureCode(error.code, cleanup ? 'DRIVER_STARTUP_CLEANUP_UNPROVED' : 'DRIVER_STARTUP_FAILED') : cleanup ? 'DRIVER_STARTUP_CLEANUP_UNPROVED' : 'DRIVER_STARTUP_FAILED',
    category,
    message: structured ? boundedString(error.message) ?? 'Driver startup operation failed.' : cleanup ? 'Driver startup cleanup completion is unproved.' : 'Driver startup failed.',
    operation: structured ? operationName(error.operation, cleanup ? 'runtime.open.cleanup' : 'runtime.open') : cleanup ? 'runtime.open.cleanup' : 'runtime.open',
    operationId: Number.isSafeInteger(error?.operationId) ? error.operationId : null,
    healthBefore: structured ? failureHealth(error.healthBefore) : null,
    healthAfter: structured ? (explicitHealth ?? categoryHealth(category)) : cleanup ? 'restart-required' : 'suspect',
    details: structured ? approvedDetails(error.details) : Object.freeze({}),
  });
}

function compactInventory(inventory, unprovedResources) {
  const counts = {};
  for (const state of ['live', 'closing', 'closed', 'orphaned']) {
    const count = inventory?.counts?.[state];
    counts[state] = Number.isSafeInteger(count) && count >= 0 ? count : 0;
  }
  const registeredResources = Array.isArray(inventory?.resources) ? inventory.resources.map((entry) => ({ kind: entry?.kind, state: entry?.state, disposition: entry?.disposition })) : [];
  const resources = [...registeredResources, ...unprovedResources].slice(0, FAILURE_LIMIT).map((entry) => Object.freeze({
    kind: boundedString(entry?.kind) ?? 'resource',
    state: ['live', 'closing', 'closed', 'orphaned'].includes(entry?.state) ? entry.state : 'orphaned',
    disposition: entry?.disposition === 'orphaned' ? 'orphaned' : entry?.state === 'closed' ? 'proved' : 'unproved',
  }));
  counts.orphaned += unprovedResources.length;
  return Object.freeze({ counts: Object.freeze(counts), resources: Object.freeze(resources) });
}

export function startupRollbackFailure({ primaryError, cleanupErrors, inventory, unprovedResources = [], healthCurrent }) {
  const primaryFailure = startupFailureRecord(primaryError);
  const cleanupFailures = Object.freeze(cleanupErrors.slice(0, FAILURE_LIMIT).map((error) => startupFailureRecord(error, { cleanup: true })));
  const records = [primaryFailure, ...cleanupFailures];
  let resultingHealth = failureHealth(healthCurrent);
  for (const record of records) {
    if (record.healthAfter !== null && (resultingHealth === null || HEALTH_RANK[record.healthAfter] > HEALTH_RANK[resultingHealth])) resultingHealth = record.healthAfter;
  }
  const strongestRecord = [...records].reverse().find((record) => record.healthAfter === resultingHealth) ?? cleanupFailures.at(-1) ?? primaryFailure;
  return new DriverRuntimeError(
    'DRIVER_STARTUP_ROLLBACK_FAILED',
    strongestRecord.category,
    'DriverActor startup failed and rollback cleanup was unproved.',
    {
      primaryFailure,
      cleanupFailures,
      cleanupFailureCount: cleanupErrors.length,
      cleanupFailuresTruncated: Math.max(0, cleanupErrors.length - cleanupFailures.length),
      resultingHealth,
      terminal: 'unproved',
      inventory: compactInventory(inventory, unprovedResources),
    },
    {
      operation: 'runtime.open',
      operationId: primaryFailure.operationId,
      healthBefore: primaryFailure.healthBefore,
      healthAfter: resultingHealth,
    },
  );
}
