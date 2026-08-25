# Restricted Device-JS frontend

`components/device-js` owns the accepted SPEC-0013 restricted JavaScript-to-CUDA-C++ frontend. It is a generic CUDA-JS component: no search, graph, game, model, evaluator, tensor, or consumer-domain semantics belong here.

The component exposes one synchronous translation function:

```text
translateDeviceProgram(request) -> translated program
```

The public package consumes that translator through standalone `compileDeviceProgram(runtime, request)`, keeping Device-JS optional and removable instead of widening every runtime instance.

## Ownership split

Pinned `acorn@8.15.0` is a syntax-only parser adapter. CUDA-JS owns the accepted syntax subset, metadata/type/ABI rules, helper contract, recursion policy, definite-return rules, deterministic ordering, generated names, CUDA C++ lowering, diagnostics, and program identity. Parser plugins, recovery, semantic inference, and code generation are unavailable.

The raw AST-to-CUDA lowerer remains private. `strict-translator.mjs` is the contract-normalization boundary: it enforces the accepted non-void return and void-helper context rules, canonicalizes function order/generated names by raw code-unit order, canonicalizes generated source, and recomputes identity before anything can reach the compiler facade.

## Determinism

Ambient locale is not part of Device-JS semantics. Public function ordering and generated identity use code-unit comparison, never `localeCompare` or `Intl` collation. Parser version is explicit in the result and program identity.

## Safety boundary

Device-JS accepts only the closed SPEC-0013 subset and typed metadata. It never exposes generated CUDA source through the public package result, raw CUDA options, native handles, pointers, ASTs, or arbitrary C/C++ syntax authority. Generated CUDA is passed to the existing CompilerActor owner with typed compile options.

The accepted SPEC-0022 atomic-observation child adds `gpu.atomic.loadRelaxedDevice` and `gpu.atomic.storeRelaxedDevice` for naturally aligned `ptr<u32>`/`ptr<u64>` device locations. Their names fix relaxed order and device scope; use requires the accepted `cuda-cccl` compile profile. Each load observes one atomic location only—never a multi-location snapshot, freshness guarantee, or ordering of unrelated memory.

Accepted SPEC-0014 adds the separate opaque types `mailbox<host-to-device,u32>` and `mailbox<device-to-host,u32>`. They support only `gpu.mailbox.loadAcquireSystem` and `gpu.mailbox.storeReleaseSystem` respectively, lowering through `cuda::atomic_ref<unsigned int, cuda::thread_scope_system>` with acquire/release order. They cannot be indexed, converted to ordinary pointers, used with device-scope helpers, or used for RMW.

Portable tests prove translation/contract behavior only. Native support requires the exact SPEC-0013 compiler/launch/oracle/lifecycle promotion evidence.

Run the component tests through the F5/F8 portable chains; direct package consumers should use `compileDeviceProgram` from `cuda-js`.
