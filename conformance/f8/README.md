# Package conformance

Checks package contents, clean install/uninstall, public exports, independent consumers, and runtime cleanup.

Portable package checks do not establish native CUDA support. Windows native results are profile-specific; Linux remains unqualified.

The [retained warp-32 evidence](evidence/warp32-2026-09-15.json) records the exact
installed-package source/provider/hardware profile and terminal cleanup.
The [execution record](../../docs/archive/plans/2026-09-15-device-js-warp32.md)
explains its scope and limits.

## Start here

Use the [complete runbook](RUNBOOK.md) for environment preparation, command order, expected evidence, failure reporting, and cleanup. It retains the platform-specific instructions needed to complete a run.

With repository dependencies installed, the first portable command from the repository root is:

```bash
npm run f8:portable
```

Portable qualification uses exact Node 26.7.0 and does not prove native behavior. Native commands require the runbook's exact host and toolchain prerequisites.

See the [conformance index](../README.md) for related suites and [hardware support](../../docs/HARDWARE_SUPPORT.md) for accepted results.
