# Hardware qualification

Owns the hardware registry and qualification workflow, composing the independent conformance capsules.

Support applies only to the exact recorded Node/OS/Driver/toolkit/GPU profile. Native Linux remains unqualified.

## Start here

Use the [complete runbook](RUNBOOK.md) for environment preparation, command order, expected evidence, failure reporting, and cleanup. It retains the platform-specific instructions needed to complete a run.

With repository dependencies installed, the first read-only planning command from the repository root is:

```bash
npm run hardware:plan
```

The plan reports readiness; it does not execute GPU qualification. Native commands require the runbook's exact host and toolchain prerequisites.

See the [conformance index](../README.md) for related suites and [hardware support](../../docs/HARDWARE_SUPPORT.md) for accepted results.
