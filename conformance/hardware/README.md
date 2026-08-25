# Hardware qualification

This directory owns the machine-readable hardware support registry and the repeatable qualification entry point. It composes the accepted phase capsules; it does not replace their native C oracles, lifecycle assertions, or evidence owners.

## Claims and evidence

CUDA-JS qualifies an exact Node/OS/ABI/Driver/toolkit/provider/GPU profile. A model, architecture family, operating-system family, or CUDA-capable label is never enough by itself. Promotion requires one clean source commit, direct hardware execution, all required phase capsules, independent native-oracle agreement, permission controls, installed-package execution, and terminal cleanup.

The support list at [`../../docs/HARDWARE_SUPPORT.md`](../../docs/HARDWARE_SUPPORT.md) is generated from [`registry.json`](registry.json). [`profiles.json`](profiles.json) defines which platform runners are complete and names every missing native capsule for incomplete profiles.

## Commands

```text
npm run hardware:check
npm run hardware:plan
npm run hardware:plan -- --profile=linux-native-x64
npm run hardware:qualify
```

`hardware:check` validates registry invariants and rejects generated-document drift. `hardware:plan` is read-only and reports the current or explicitly requested profile. `hardware:qualify` is enabled only for a runner-ready profile and fails unless the process uses exact Node v26.7.0 from a clean Git worktree.

`extensions.json` keeps multi-GPU, MIG, virtualization, concurrent launch, performance/thermal/soak, ECC, version-matrix, Windows TCC/server, and independent-attestation work fail-closed. It records architectural disposition, implementation status, qualification status, and priority independently. Every axis is currently `not-qualified` and exposes no promotable command chain.

On Windows, `npm run hardware:probe:hyperv` performs a read-only sanitized Hyper-V inventory. It reports only OS class/version and counts; it never records VM names or GPU identifiers and never changes a VM, GPU assignment, partition, or device state. A readiness result is not virtualized CUDA support.

The current Windows x64 runner executes EXP-000, F1B, EXP-012, and F3 through F8 in dependency order and retains the accepted secondary-profile evidence. ADR-0006 makes Linux x64 the reference priority, but its entry intentionally exposes no promotable command chain while the Driver/compiler adapters and F2L–F8L native capsules remain incomplete. WSL2, Linux ARM64 SBSA, and Jetson ARM64 remain separate profiles.

## Result bundle

A run writes ignored output under:

```text
build/hardware-qualification/<profile>/<run-id>/
  qualification.json
  public-summary.json
  logs/
```

`qualification.json` is the local complete manifest. `public-summary.json` removes log paths while retaining command identities, exit states, durations, log digests, evidence digests, source commit/tree, final clean-tree state, device-zero model/compute capability, and exact software profile.

Before uploading anything, inspect every file. Do not publish host names, account names, filesystem paths, GPU serial numbers, UUIDs, PCI bus identifiers, credentials, environment secrets, or arbitrary raw logs. The public summary is designed for review, but human privacy inspection remains mandatory.

## Contributor flow

1. Open or join the public issue for the exact platform profile and GPU architecture.
2. Check out the requested commit without local modifications.
3. Use the official exact Node release and the profile's required Driver/toolkit/providers.
4. Run `npm run hardware:plan`; stop if the profile is incomplete and contribute the named adapter/capsules first.
5. Run `npm run hardware:qualify` unchanged on a runner-ready profile.
6. Review and attach `public-summary.json`; retain the complete local bundle until review closes.
7. Submit a registry PR only after maintainers accept the evidence. One entry represents one exact profile.

Test failures are useful results. A command, evidence-validation, or final-worktree failure still produces the standardized bundle and a sanitized public failure kind. Report the first failing case and preserve the bundle; do not weaken assertions, substitute package self-comparison for a native oracle, or edit a result into a pass.

## Dedicated-host safety

Persistent GPU hosts must not execute arbitrary fork code automatically. A maintainer first reviews and pins a commit, then dispatches that exact commit to an isolated, resettable test account or image. Credentials remain outside the repository, public evidence is sanitized, and caches are either disposable or keyed and validated by the accepted compiler-cache contract.

The staged host-fleet design, coverage priorities, evidence retention, and promotion workflow are in [`../../docs/plans/2026-08-11-hardware-qualification-program.md`](../../docs/plans/2026-08-11-hardware-qualification-program.md).
