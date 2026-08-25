# CJS-F8 package and public-facade conformance

The F8 capsule builds the exact `cuda-js` tarball with Node 26.7.0, inspects its contents, installs it into clean unrelated consumer directories, runs only exported entry points, tests simultaneous runtimes and cross-runtime rejection, uninstalls the package, and verifies package-owned files are removed. Portable installed consumers exercise the current additive public surface, including SPEC-0010 relocatable PTX, SPEC-0011 scalar arguments, SPEC-0012 Device LTO, SPEC-0022 device publication, SPEC-0014 publication mailboxes, SPEC-0016/0018 operations, and SPEC-0019 bounded asynchronous transfers. Portable checks prove package/facade orchestration only; each capability retains its own native promotion gate.

On the accepted Windows x64 profile, the installed package runs the tracked PTX vector kernel, the exact capacity-two atomic producer/observer, snapshot H2D→D2D→terminal-result D2H, and a source-only Device-JS mailbox kernel through the public facade. Vector, transfer, and mailbox publication retain independent F5 C-oracle coverage. The same tarball also runs a consumer-neutral Device-JS fixture covering structured control flow, exact scalar/atomic behavior, device-scope `u32`/`u64` release/acquire publication of an immutable multiword payload, private compiler/Driver composition, and aggregate cleanup. A separate CUDA-free protocol oracle covers immutable-message and unrelated work-slot consumers plus early-ready, pre-acquire, partial-payload and stale/wrong-generation negatives. Every consumer reports graceful Worker exit and zero unproved live resources.

## Native Windows

Use the exact standalone Node 26.7.0 selected by `scripts/run-f8.mjs`:

```powershell
npm run f8
```

The package is experimental and registry publication is guarded. Applications currently start it with Node's experimental FFI flag. If the permission model is active, grant FFI and Worker authority plus only the filesystem paths actually needed for modules, the selected compiler providers, and an explicitly configured cache.

## Native Linux x64 and ARM64 handoff

CI already proves tarball contents, install/import/uninstall, compatibility inspection, mock-only public orchestration, independent consumers, multiple instances, and a stable backend-unavailable native-open error. Those controls should remain unchanged when the native adapter is completed.

A Linux engineer should:

1. Complete the retained F2L through F8L runbooks on a native glibc host with an NVIDIA Driver and GPU. WSL evidence is separate.
2. Add a canonical `libcuda.so.1` DriverActor backend using the accepted generated ABI facts, named-symbol/version rules, permission profile, context ownership, and cleanup contract.
3. Add canonical NVRTC and nvJitLink providers. Preserve `--modify-stack-limit=false`, exact provider identity, copied artifacts, and the accepted cache boundary.
4. Run the same installed-package vector consumer and an independently compiled C oracle. Do not replace the oracle with package self-comparison.
5. Prove permission denial/allow behavior, repeated actor lifecycle balance, provider unload, context/resource teardown, Worker exit, and restart-required behavior after unproved loss.
6. Add exact Linux profile evidence to `packaging/compatibility-manifest.json`, update the support matrix and public issue, and submit all claim changes with the native logs and environment identity.

Linux promotion must not change the public facade solely to accommodate provider layout. Platform discovery and FFI calls belong behind the existing actors. Portable success is never a native CUDA claim.
