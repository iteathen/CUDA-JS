# Module and execution conformance

Checks module loading, kernel arguments, operations, bounded scheduling, transfers, publication, and cleanup.

Windows evidence is profile-specific; Linux and broader concurrency/performance claims remain separately qualified.

## Start here

Use the [complete runbook](RUNBOOK.md) for environment preparation, command order, expected evidence, failure reporting, and cleanup. It retains the platform-specific instructions needed to complete a run.

With repository dependencies installed, the first portable command from the repository root is:

```bash
npm run f5:portable
```

Portable qualification uses exact Node 26.7.0 and does not prove native behavior. Native commands require the runbook's exact host and toolchain prerequisites.

See the [conformance index](../README.md) for related suites and [hardware support](../../docs/HARDWARE_SUPPORT.md) for accepted results.
