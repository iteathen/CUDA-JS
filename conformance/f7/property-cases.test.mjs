import assert from 'node:assert/strict';
import test from 'node:test';

import { runPropertyPartitions } from './property-cases.mjs';

test('F7 property partitions are deterministic and include operational and rejected cases', () => {
  const first = runPropertyPartitions();
  const second = runPropertyPartitions();
  assert.equal(first.sha256, second.sha256);
  assert.equal(first.count, 256);
  for (const [kind, group] of Object.entries(first.outcomes)) {
    const operational = kind === 'diagnostics' ? 'testing-unconfirmed' : 'accepted';
    assert(group.some((entry) => entry.outcome === operational));
    assert(group.some((entry) => entry.outcome !== operational));
    assert.equal(new Set(group.map((entry) => entry.id)).size, group.length);
  }
});
