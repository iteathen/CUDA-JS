import assert from 'node:assert/strict';

// CUDA-free protocol oracle. It deliberately models consumer-owned generation and
// payload rules separately from CUDA-JS's one-location release/acquire primitive.
export function replayPublicationTrace({ fields, expectedGeneration, trace }) {
  assert(Array.isArray(fields) && fields.length > 1, 'A publication payload must name multiple fields.');
  assert(Number.isSafeInteger(expectedGeneration) && expectedGeneration > 0, 'Expected generation must be a positive integer.');
  const required = new Set(fields);
  assert.equal(required.size, fields.length, 'Payload field names must be unique.');

  const staged = new Map();
  const released = new Map();
  let acquired = null;
  const observed = new Map();

  for (const event of trace) {
    assert(Number.isSafeInteger(event.generation) && event.generation > 0, 'Every event requires a positive generation.');
    if (event.kind === 'write') {
      assert(required.has(event.field), `Unknown payload field: ${event.field}`);
      assert(!released.has(event.generation), 'Payload is immutable after release publication.');
      const payload = staged.get(event.generation) ?? new Map();
      payload.set(event.field, event.value);
      staged.set(event.generation, payload);
      continue;
    }
    if (event.kind === 'release') {
      const payload = staged.get(event.generation) ?? new Map();
      assert.equal(payload.size, required.size, 'Release publication requires a complete payload.');
      released.set(event.generation, new Map(payload));
      continue;
    }
    if (event.kind === 'acquire') {
      assert.equal(event.generation, expectedGeneration, 'Consumer rejected stale or wrong-generation readiness.');
      assert(released.has(event.generation), 'Acquire must observe a release for the expected generation.');
      acquired = event.generation;
      continue;
    }
    if (event.kind === 'read') {
      assert.equal(acquired, expectedGeneration, 'Payload read requires a matching acquire observation first.');
      assert.equal(event.generation, acquired, 'Payload read generation must match the acquired generation.');
      const payload = released.get(acquired);
      assert(required.has(event.field), `Unknown payload field: ${event.field}`);
      assert.deepEqual(event.value, payload.get(event.field), 'Observed payload differs from the released immutable payload.');
      observed.set(event.field, event.value);
      continue;
    }
    assert.fail(`Unknown trace event: ${event.kind}`);
  }

  assert.equal(acquired, expectedGeneration, 'Trace did not acquire the expected generation.');
  assert.equal(observed.size, required.size, 'Trace did not read the complete published payload.');
  return Object.fromEntries(fields.map((field) => [field, observed.get(field)]));
}
