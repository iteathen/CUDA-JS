# Public device-view byte-range relation

**Status:** Proposal

Issue #260 extends SPEC-0021 with one synchronous public function:

```js
inspectDeviceViewRelation(a, b) // 'same-range' | 'overlap' | 'disjoint'
```

Both inputs must be genuine open public device views belonging to the same open, healthy-enough runtime. Their parent allocations must remain open. Invalid, forged, foreign-runtime, closed, orphaned, observed owner-loss and pending-close capabilities fail closed with ordinary public errors. The result is a current logical capability fact, not a lifetime lease or guarantee that a subsequent asynchronous submission succeeds. Separate loaded copies of CUDA-JS do not share capability authority.

For one parent allocation, equal byte offsets and lengths yield `same-range`, including equal empty ranges. Otherwise any empty range is `disjoint`; positive ranges use half-open byte intersection and yield `overlap` or `disjoint`. Different allocations within the same runtime yield `disjoint`. Dtype and access roles do not change byte-range facts. Cross-runtime inputs are incomparable, even when a caller believes devices differ.

The facade retains the existing private parent capability and validated range facts. It reuses the memory owner's overlap helper, makes no actor/native CUDA request, and returns only a string. It exposes no allocation ID, token, address, handle, parent reference, overlap offset or byte count. Synchronization with asynchronous owner loss is limited to state already observed by the existing facade; this does not add a native liveness probe.

No algorithm policy, automatic rejection, implicit copy, Tensor rule or prepared-DAG hazard rule is added. An upper transform may require disjoint buffers while an unrelated buffer reuse planner may require the same range. The installed-package fixture exercises both policies. Removing either fixture/policy leaves the implementation and public contract unchanged: the implementation has no consumer imports, names or callbacks.

The additive source package advances to alpha.20, API schema 1, and advertises `deviceViewRelation: pure-same-runtime-byte-range-relation-v1`. This pure inspection capability requires portable and installed-package evidence, not new CUDA execution. Previous native gate #32 evidence remains tied to its original alpha.19 source pair.

Validation: `components/runtime-facade/test/device-view-relation.test.mjs` covers range partitions, symmetry, empty ranges, dtype/access independence, identity opacity, hostile wrappers, wrong-runtime and lifecycle rejection, retry after rejected parent close, stale capability replacement, observed owner loss and zero actor calls. `conformance/f8/fixtures/consumer-view-relation.mjs` exercises only installed public exports with two independent example policies. These examples are conformance consumers, not a claim that downstream libraries have integrated this API.
