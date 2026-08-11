import assert from 'node:assert/strict';
import test from 'node:test';

import { runPropertyPartitions } from './property-cases.mjs';

test('F7 property partitions are deterministic and include accepted and rejected cases', () => {
  const first = runPropertyPartitions();
  const second = runPropertyPartitions();
  assert.equal(first.sha256, second.sha256);
  assert.equal(first.count, 256);
  for (const group of Object.values(first.outcomes)) {
    assert(group.some((entry) => entry.outcome === 'accepted'));
    assert(group.some((entry) => entry.outcome !== 'accepted'));
    assert.equal(new Set(group.map((entry) => entry.id)).size, group.length);
  }
});
